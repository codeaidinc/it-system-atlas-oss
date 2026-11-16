// ========================================================================
// IT System Atlas OSS版
// 製作：合同会社CODEAID
// Copyright (c) 2026 合同会社CODEAID
// ライセンス：Apache License 2.0（LICENSE を参照）
// SPDX-License-Identifier: Apache-2.0
// ファイル：tests/acceptance.test.mjs
// 説明：テスト：受入（版の作り分け、オープンデータ、規模の参考値、秘密情報）
// 履歴：
//   2026-11-16  v1.0.0  初版
// ========================================================================
// 受入テスト
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { buildAtlas, writeOutputs } from '../scripts/build-data.mjs';
import { ROOT } from '../scripts/lib/load.mjs';
import { base, tempRepo } from './helpers.mjs';

const approved = base({ id: 'st-approved', names: { ja: '確認済みシステム', en: 'Approved' }, editorial: { ...base().editorial, status: 'reviewed' }, relations: [{ type: 'integrates_with', target: 'st-unapproved' }] });
const unapproved = base({ id: 'st-unapproved', names: { ja: '下書きシステム', en: 'Unapproved' } });

test('確認済みだけの版（ATLAS_MODE=reviewed）：下書き（draft）のカードは含まれない', () => {
  const dir = tempRepo([approved, unapproved]);
  const atlas = buildAtlas({ mode: 'reviewed', root: dir });
  const ids = atlas.entries.map((e) => e.id);
  assert.deepEqual(ids, ['st-approved']);
  // 含まれないカードへの関係も除かれる
  assert.deepEqual(atlas.entries[0].relations, []);
});

test('既定の版は draft を含む（画面で「下書き」と表示）', () => {
  const dir = tempRepo([approved, unapproved]);
  assert.equal(buildAtlas({ mode: 'all', root: dir }).entries.length, 2);
});

test('data/ だけからオープンデータを再生成でき、秘密情報が含まれない', () => {
  const dir = tempRepo([approved, unapproved]);
  fs.mkdirSync(path.join(dir, 'apps/web'), { recursive: true });
  writeOutputs(buildAtlas({ mode: 'reviewed', root: dir }), dir);
  const od = fs.readFileSync(path.join(dir, 'apps/web/public/opendata/atlas.json'), 'utf8');
  assert.ok(od.includes('st-approved'));
  assert.ok(!od.includes('st-unapproved'));
  assert.ok(!/review_id|findings|ANTHROPIC|API_KEY/.test(od));
});

test('公表された規模数値には出典・対象範囲・時点が付いている（全データ）', () => {
  const atlas = buildAtlas({ mode: 'all' });
  const refs = atlas.entries.flatMap((e) => e.scale?.references || []);
  assert.ok(refs.length >= 1);
  for (const r of refs) assert.ok(r.source?.url && r.scope?.ja && r.as_of && r.measure && r.evidence_type);
});

test('初期データ：種別100件以上、全件に規模の目安がある', () => {
  const st = buildAtlas({ mode: 'all' }).entries.filter((e) => e.type === 'system_type');
  assert.ok(st.length >= 100, `system_type=${st.length}`);
  for (const e of st) assert.ok(e.scale.typical.project_class && e.scale.typical.usage_class);
});

test('ビルド済みサイト：ログインなしで全カードのページが存在する（npm run build 後のみ）', (t) => {
  const out = path.join(ROOT, 'apps/web/out');
  if (!fs.existsSync(out)) return t.skip('apps/web/out がありません（npm run build 後に実行）');
  const st = buildAtlas({ mode: 'all' }).entries.filter((e) => e.type === 'system_type');
  for (const e of st) assert.ok(fs.existsSync(path.join(out, 'systems', e.id, 'index.html')), e.id);
  for (const p of ['index.html', 'systems/index.html', 'maps/world/index.html', 'maps/business/index.html', 'maps/architecture/index.html', 'maps/scale/index.html', 'about/index.html'])
    assert.ok(fs.existsSync(path.join(out, p)), p);
});

test('リポジトリに秘密情報が含まれていない（.env はGit管理対象外）', () => {
  const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((x) => {
    if (['node_modules', '.git', '.next', 'out', 'generated'].includes(x.name) || x.name.startsWith('.env')) return [];
    const p = path.join(d, x.name);
    return x.isDirectory() ? walk(p) : [p];
  });
  for (const f of walk(ROOT)) {
    if (/\.(png|jpg|ico|bundle)$/.test(f)) continue;
    const s = fs.readFileSync(f, 'utf8');
    assert.ok(!/sk-ant-[A-Za-z0-9]|sk-[A-Za-z0-9]{32,}/.test(s), f);
  }
  // .env が存在してもよいが、Gitで追跡されていてはならない
  let tracked = '';
  try { tracked = execSync('git ls-files -- .env .env.local', { cwd: ROOT, encoding: 'utf8' }).trim(); } catch { /* Git管理外 */ }
  assert.equal(tracked, '');
});
