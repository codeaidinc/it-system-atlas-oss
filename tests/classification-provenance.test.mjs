// ========================================================================
// IT Systems Atlas OSS版
// 製作：合同会社CODEAID
// Copyright (c) 2026 合同会社CODEAID
// ライセンス：Apache License 2.0（LICENSE を参照）
// SPDX-License-Identifier: Apache-2.0
// ファイル：tests/classification-provenance.test.mjs
// 説明：テスト：分類の「確認待ち」の印と表示
// 履歴：
//   2026-11-16  v1.0.0  初版
// ========================================================================
// 規則・暫定で付けた分類に、項目ごとの確認待ちの印を持ち、画面に表示する
//   印の形式（スキーマ）と、移行で付けた項目に印があること
//   印のある項目は「確認待ち」と表示され、印を外すと表示が消える
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ROOT, loadEntries, loadTaxonomy } from '../scripts/lib/load.mjs';
import { lintAll } from '../scripts/lib/lint.mjs';
import { unconfirmedFields, isUnconfirmed, placementNote, axesNote, unconfirmedNames, UNCONFIRMED_LABEL, FIELD_LABELS } from '../apps/web/lib/unconfirmed.mjs';

const UNCONFIRMED_FIELDS = Object.keys(FIELD_LABELS);

const entries = loadEntries();
const tax = loadTaxonomy();
const types = entries.filter((e) => e.data?.type === 'system_type');

test('全カードの editorial.unconfirmed は domain・level・scope・axes の部分集合で', () => {
  for (const e of types) {
    const u = e.data.editorial.unconfirmed;
    assert.ok(Array.isArray(u), `${e.file} に印がない`);
    for (const f of u) assert.ok(UNCONFIRMED_FIELDS.includes(f), `${e.file}: ${f}`);
  }
});

test('スキーマは決められた項目以外・重複を拒否する', () => {
  const e = types[0];
  for (const bad of [['category'], ['domain', 'domain']]) {
    const x = { ...e, data: { ...e.data, editorial: { ...e.data.editorial, unconfirmed: bad } } };
    const res = lintAll(entries.map((y) => (y === e ? x : y)), tax);
    const f = [...res.values()].flatMap((r) => r.findings).filter((v) => v.severity === 'blocker' || v.severity === 'major');
    assert.ok(f.length > 0, JSON.stringify(bad));
  }
  const ok = lintAll(entries, tax);
  assert.equal([...ok.values()].flatMap((r) => r.findings).filter((v) => ['blocker', 'major'].includes(v.severity)).length, 0);
});

test('表示用の関数は印のある項目だけを「確認待ち」とし、印を外すと何も出さない', () => {
  const all = { names: { ja: 'A' }, editorial: { unconfirmed: ['domain', 'level', 'scope', 'axes'] } };
  const partial = { names: { ja: 'B' }, editorial: { unconfirmed: ['axes'] } };
  const none = { names: { ja: 'C' }, editorial: { unconfirmed: [] } };
  const legacy = { names: { ja: 'D' }, editorial: {} };
  assert.deepEqual(unconfirmedFields(all), ['domain', 'level', 'scope', 'axes']);
  assert.ok(placementNote(all).startsWith(UNCONFIRMED_LABEL) && placementNote(all).includes('領域・統合階層・利用範囲'));
  assert.equal(placementNote(partial), null);
  assert.ok(axesNote(partial).includes(UNCONFIRMED_LABEL));
  assert.ok(isUnconfirmed(partial, 'axes') && !isUnconfirmed(partial, 'domain'));
  for (const e of [none, legacy]) { assert.equal(placementNote(e), null); assert.equal(axesNote(e), null); }
  assert.deepEqual(unconfirmedNames([all, partial, none, legacy]), ['A', 'B']);
});

test('ビルド済みサイトの詳細ページに「確認待ち」の表示がある（npm run build 後のみ）', (t) => {
  const out = path.join(ROOT, 'apps/web/out');
  if (!fs.existsSync(out)) return t.skip('apps/web/out がありません');
  for (const id of ['st-core-banking', 'st-household-budget']) {
    const html = fs.readFileSync(path.join(out, `systems/${id}/index.html`), 'utf8');
    assert.ok(html.includes(`${UNCONFIRMED_LABEL}：領域・統合階層・利用範囲`), `${id}: 位置づけの表示`);
    assert.ok(html.includes(`${UNCONFIRMED_LABEL}：評価軸`), `${id}: 評価軸の表示`);
  }
});
