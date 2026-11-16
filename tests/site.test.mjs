// ========================================================================
// IT System Atlas OSS版
// 製作：合同会社CODEAID
// Copyright (c) 2026 合同会社CODEAID
// ライセンス：Apache License 2.0（LICENSE を参照）
// SPDX-License-Identifier: Apache-2.0
// ファイル：tests/site.test.mjs
// 説明：テスト：ビルドしたサイト（リンク・ページ・オープンデータ）
// 履歴：
//   2026-11-16  v1.0.0  初版
// ========================================================================
// ビルド済みサイトの検査（npm run build の後に意味を持つ。out がなければ飛ばす）
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { checkSite, OUT } from '../scripts/lib/site-check.mjs';
import { buildAtlas } from '../scripts/build-data.mjs';

const skip = !fs.existsSync(path.join(OUT, 'index.html')) && 'apps/web/out がありません（npm run build 後に実行）';

test('内部リンク切れ・外部スクリプト・POST のフォーム・決めた構成の外のページがない', { skip }, () => {
  const r = checkSite();
  assert.ok(r.pages > 100, `ページ数 ${r.pages}`);
  assert.ok(r.links > 1000, `リンク数 ${r.links}`);
  assert.deepEqual(r.problems.slice(0, 20), []);
});

test('収録したカード・地図のページがすべてある', { skip }, () => {
  const atlas = buildAtlas({ mode: process.env.ATLAS_MODE === 'reviewed' ? 'reviewed' : 'all' });
  const route = { system_type: 'systems' };
  for (const e of atlas.entries.filter((x) => route[x.type])) assert.ok(fs.existsSync(path.join(OUT, route[e.type], e.id, 'index.html')), e.id);
  for (const v of atlas.views) assert.ok(fs.existsSync(path.join(OUT, 'maps', v.id, 'index.html')), v.id);
});

test('オープンデータ（JSON・CSV）が出力され、件数が atlas と一致する', { skip }, () => {
  const od = JSON.parse(fs.readFileSync(path.join(OUT, 'opendata/atlas.json'), 'utf8'));
  const gen = JSON.parse(fs.readFileSync(path.join(OUT, '../generated/atlas.json'), 'utf8'));
  assert.equal(od.entries.length, gen.entries.length);
  const csv = fs.readFileSync(path.join(OUT, 'opendata/system_types.csv'), 'utf8').trim().split('\n');
  assert.equal(csv.length - 1, gen.entries.filter((e) => e.type === 'system_type').length);
});
