// ========================================================================
// IT System Atlas OSS版
// 製作：合同会社CODEAID
// Copyright (c) 2026 合同会社CODEAID
// ライセンス：Apache License 2.0（LICENSE を参照）
// SPDX-License-Identifier: Apache-2.0
// ファイル：tests/education.test.mjs
// 説明：テスト：教材としての受入（領域・統合階層・評価軸・ライフサイクル・企業業務の流れ・地図）
// 履歴：
//   2026-11-16  v1.0.0  初版
// ========================================================================
// 教材としての受入テスト
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { buildAtlas } from '../scripts/build-data.mjs';
import { ROOT, loadTaxonomy } from '../scripts/lib/load.mjs';

const atlas = buildAtlas({ mode: 'all' });
const of = (t) => atlas.entries.filter((e) => e.type === t);
const ids = new Set(atlas.entries.map((e) => e.id));
const tax = loadTaxonomy();

test('教育用12領域＋共通基盤（D00〜D12）と統合階層6段階が定義されている', () => {
  assert.equal(tax.domains.length, 13);
  assert.deepEqual(tax.levels.map((l) => l.id).sort(), ['L0', 'L1', 'L2', 'L3', 'L4', 'L5']);
  assert.equal(tax.axes.length, 8);
});

test('全種別に 領域・統合階層・利用範囲・6つの評価軸 がある', () => {
  for (const e of of('system_type')) {
    assert.ok(e.domain && e.level?.primary && e.scope, e.id);
    for (const k of ['technical', 'organization', 'criticality', 'longevity', 'regulation', 'changeability']) assert.ok(e.axes[k] >= 1 && e.axes[k] <= 5, `${e.id}.${k}`);
  }
});

test('12領域すべてにシステムがあり、統合階層 L1〜L5 のすべてに例がある', () => {
  const st = of('system_type');
  for (const d of tax.domains) assert.ok(st.some((e) => e.domain === d.id), d.id);
  for (const l of ['L0', 'L1', 'L2', 'L3', 'L4', 'L5']) assert.ok(st.some((e) => e.level.primary === l), l);
});

test('構想の初期台帳36件の種類がすべて収録されている', () => {
  const need = ['st-sns', 'st-household-budget', 'st-smart-home', 'st-pos', 'st-ec-site', 'st-wms', 'st-erp', 'st-crm', 'st-payroll',
    'st-mes', 'st-plm', 'st-factory-control', 'st-core-banking', 'st-credit-card-processing', 'st-stock-exchange-trading',
    'st-train-operation', 'st-airline-reservation', 'st-tms', 'st-electronic-medical-record', 'st-pacs', 'st-care-insurance-billing',
    'st-lms', 'st-school-affairs', 'st-research-infrastructure', 'st-resident-registry', 'st-local-tax', 'st-e-application',
    'st-telecom-oss', 'st-telecom-billing', 'st-broadcast-operation', 'st-power-grid-control', 'st-water-scada',
    'st-environment-monitoring', 'st-disaster-alert', 'st-emergency-call', 'st-disaster-response'];
  assert.equal(need.length, 36);
  for (const id of need) assert.ok(ids.has(id), id);
});

test('企業業務地図：各段階にシステムがあり、ERPがハブとして接続されている', () => {
  const bf = of('business_flow').find((x) => x.id === 'bf-order-to-cash');
  assert.ok(bf);
  for (const s of bf.stages) assert.ok(s.systems.length >= 1 && s.systems.every((x) => ids.has(x)), s.id);
  assert.ok(bf.hub.systems.includes('st-erp'));
  assert.ok(bf.hub.why.length >= 2);
});

test('システムの種類が150件以上、6つの地図が定義されている', () => {
  assert.ok(of('system_type').length >= 150);
  const views = atlas.views.map((v) => v.order).sort((a, b) => a - b);
  assert.deepEqual(views, [1, 2, 3, 4, 5, 6]);
});
test('ライフサイクルは8段階で、各段階に担い手の組織がある', () => {
  assert.equal(tax.lifecycle.length, 8);
  const roles = new Set(tax.industryRoles.map((r) => r.id));
  for (const p of tax.lifecycle) assert.ok(p.industry_roles?.length && p.industry_roles.every((r) => roles.has(r)), p.id);
});
test('ビルド済みサイト：6つの地図のページがあり、削除した教材のページはない（npm run build 後のみ）', (t) => {
  const out = path.join(ROOT, 'apps/web/out');
  if (!fs.existsSync(out)) return t.skip('apps/web/out がありません');
  for (const v of atlas.views) assert.ok(fs.existsSync(path.join(out, 'maps', v.id, 'index.html')), v.id);
  for (const p of ['scenarios', 'exercises', 'compare', 'analysis', 'occupations', 'lessons', 'search']) assert.ok(!fs.existsSync(path.join(out, p)), p);
});
test('ITトレンドを点検表にした企業業務アプリの補完が収録されている', () => {
  for (const id of ['st-labor-management', 'st-receivables-payables', 'st-bom', 'st-cost-accounting', 'st-rpa', 'st-clm', 'st-business-chat'])
    assert.ok(ids.has(id), id);
});
