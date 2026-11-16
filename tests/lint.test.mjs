// ========================================================================
// IT Systems Atlas OSS版
// 製作：合同会社CODEAID
// Copyright (c) 2026 合同会社CODEAID
// ライセンス：Apache License 2.0（LICENSE を参照）
// SPDX-License-Identifier: Apache-2.0
// ファイル：tests/lint.test.mjs
// 説明：テスト：データの機械検査の規則
// 履歴：
//   2026-11-16  v1.0.0  初版
// ========================================================================
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { lintAll } from '../scripts/lib/lint.mjs';
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { ROOT, loadEntries, loadTaxonomy } from '../scripts/lib/load.mjs';
import { base, asEntry } from './helpers.mjs';

const tax = loadTaxonomy();
const run = (...ds) => [...lintAll(ds.map(asEntry), tax).values()].flatMap((r) => r.findings);
const bad = (fs) => fs.filter((f) => ['blocker', 'major'].includes(f.severity));

test('リポジトリの全データが機械検査を通過する', () => {
  const res = lintAll(loadEntries(), tax);
  const errors = [...res.values()].flatMap((r) => bad(r.findings).map((f) => `${r.file}: ${f.issue}`));
  assert.deepEqual(errors, []);
});

test('正しいカードは指摘なし', () => {
  assert.deepEqual(bad(run(base())), []);
});

test('同名・同別名の投稿を重複として検知する', () => {
  const a = base();
  const b = base({ id: 'st-test-system-2', names: { ja: 'テスト用 システム', en: 'Another' } });
  assert.ok(run(a, b).some((f) => f.issue.includes('重複の疑い')));
});

test('未定義の分類IDや存在しない参照先はエラー', () => {
  const f = run(base({ industry: ['no-such'], relations: [{ type: 'depends_on', target: 'st-nothing' }] }));
  assert.ok(f.some((x) => x.issue.includes('未定義の産業ID')));
  assert.ok(f.some((x) => x.issue.includes('存在しない参照先')));
});

test('規模参考値は出典・対象範囲・時点・測定対象が必須', () => {
  const d = base();
  d.scale.references = [{ measure: 'users', value: 100, unit: 'persons', evidence_type: 'official_report', subject: { ja: 'x' } }];
  assert.ok(bad(run(d)).length > 0);
});

test('測定対象と単位の不一致を検知する（開発費を人数で登録など）', () => {
  const d = base();
  d.scale.references = [{ measure: 'development_cost', value: 100, unit: 'persons', scope: { ja: 'x' }, as_of: 2025, evidence_type: 'official_report', subject: { ja: 'x' }, source: { title: 't', url: 'https://example.com/', accessed: '2026-11-03' } }];
  assert.ok(run(d).some((f) => f.issue.includes('単位')));
});

test('実名事例の評価・推測表現を検知する', () => {
  const d = base();
  d.scale.references = [{ measure: 'development_cost', value: 1e9, unit: 'JPY', scope: { ja: '開発費' }, as_of: 2020, evidence_type: 'press_report', subject: { ja: 'A社のシステム。ずさんな管理が失敗の原因' }, source: { title: 't', url: 'https://example.com/', accessed: '2026-11-03' } }];
  assert.ok(run(d).some((f) => f.issue.includes('実名事例ポリシー')));
});

test('個人情報（メールアドレス）はブロック', () => {
  const f = run(base({ users: { ja: '問い合わせ: taro@example.com' } }));
  assert.ok(f.some((x) => x.severity === 'blocker' && x.issue.includes('個人情報')));
});

test('宣伝表現を指摘する', () => {
  const f = run(base({ summary: { ja: '業界No.1の最高のシステムです。受入テストのために作成した架空のシステム種別で、実在しません。' } }));
  assert.ok(f.some((x) => x.issue.includes('宣伝的な表現')));
});

