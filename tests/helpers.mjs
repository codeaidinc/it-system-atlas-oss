// ========================================================================
// IT System Atlas OSS版
// 製作：合同会社CODEAID
// Copyright (c) 2026 合同会社CODEAID
// ライセンス：Apache License 2.0（LICENSE を参照）
// SPDX-License-Identifier: Apache-2.0
// ファイル：tests/helpers.mjs
// 説明：テストの共通の部品（テスト用のカード、一時的なリポジトリ）
// 履歴：
//   2026-11-16  v1.0.0  初版
// ========================================================================
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import yaml from 'js-yaml';
import { ROOT } from '../scripts/lib/load.mjs';

export const base = (over = {}) => ({
  domain: 'D03', level: { primary: 'L3' }, scope: 'enterprise',
  axes: { technical: 2, organization: 2, criticality: 2, longevity: 2, regulation: 2, changeability: 2, evidence_type: 'editorial_estimate' },
  id: 'st-test-system', type: 'system_type',
  names: { ja: 'テスト用システム', en: 'Test System' },
  summary: { ja: 'これはテスト用のシステムです。受入テストのために作成した架空のシステム種別で、実在しません。' },
  industry: ['cross_industry'], business_function: ['bf.it'], category: 'business_app', layer: 'application',
  users: { ja: 'テスト担当者' }, purpose: { ja: 'テストを行う' },
  scale: { typical: { project_class: { min: 'S', max: 'M' }, usage_class: { min: 'U1', max: 'U2' }, evidence_type: 'editorial_estimate' } },
  editorial: { status: 'draft', license: 'CC-BY-4.0', created: '2026-11-03', updated: '2026-11-03' },
  ...over,
});
export const asEntry = (d) => ({ file: `data/entries/${d.type}/${d.id}.yaml`, data: d });

/** taxonomy・schema を持つ一時リポジトリを作り、指定エントリだけを置く */
const TEMP_DIRS = [];
process.on('exit', () => { for (const d of TEMP_DIRS) fs.rmSync(d, { recursive: true, force: true }); });

export function tempRepo(entries) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'atlas-'));
  TEMP_DIRS.push(dir); // テストの終了時に消す
  for (const d of ['data/taxonomy', 'data/views', 'schema']) fs.cpSync(path.join(ROOT, d), path.join(dir, d), { recursive: true });
  fs.copyFileSync(path.join(ROOT, 'package.json'), path.join(dir, 'package.json'));
  for (const e of entries) {
    const p = path.join(dir, `data/entries/${e.type}/${e.id}.yaml`);
    fs.mkdirSync(path.dirname(p), { recursive: true });
    fs.writeFileSync(p, yaml.dump(e));
  }
  return dir;
}
