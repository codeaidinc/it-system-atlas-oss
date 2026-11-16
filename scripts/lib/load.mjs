// ========================================================================
// IT System Atlas OSS版
// 製作：合同会社CODEAID
// Copyright (c) 2026 合同会社CODEAID
// ライセンス：Apache License 2.0（LICENSE を参照）
// SPDX-License-Identifier: Apache-2.0
// ファイル：scripts/lib/load.mjs
// 説明：データの読み込み（data/ の YAML を読み、種類ごとにまとめる）
// 履歴：
//   2026-11-16  v1.0.0  初版
// ========================================================================
// データ読み込み（data/ 配下のYAMLを読み、型ごとに集約する）
import fs from 'node:fs';
import path from 'node:path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
export const ENTRY_TYPES = ['system_type', 'business_flow'];
export const ID_PREFIX = { system_type: 'st-', business_flow: 'bf-' };

const readYaml = (p) => yaml.load(fs.readFileSync(p, 'utf8'), { schema: yaml.JSON_SCHEMA });

export function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? walk(p) : /\.ya?ml$/.test(d.name) ? [p] : [];
  });
}

export function loadTaxonomy(root = ROOT) {
  const t = (f) => readYaml(path.join(root, 'data/taxonomy', f));
  return {
    industries: t('industries.yaml').items,
    businessFunctions: t('business_functions.yaml').items,
    categories: t('categories.yaml').items,
    layers: t('categories.yaml').layers,
    scale: t('scale_classes.yaml'),
    ciSectors: t('critical_infrastructure.yaml').sectors,
    ciMeta: t('critical_infrastructure.yaml'),
    lifecycle: t('lifecycle.yaml').phases,
    relationTypes: t('relation_types.yaml').items,
    domains: t('domains.yaml').items,
    levels: t('levels.yaml').items,
    scopes: t('levels.yaml').scopes,
    axes: t('axes.yaml').items,
    industryRoles: t('industry_roles.yaml').items,
  };
}

/** @returns {{entries: Array<{file:string, data:any, error?:string}>}} */
export function loadEntries(root = ROOT) {
  const files = walk(path.join(root, 'data/entries'));
  return files.sort().map((file) => {
    try {
      return { file: path.relative(root, file).split(path.sep).join('/'), data: readYaml(file) };
    } catch (e) {
      return { file: path.relative(root, file), data: null, error: String(e.message || e) };
    }
  });
}

export function loadViews(root = ROOT) {
  return walk(path.join(root, 'data/views')).sort().map((f) => readYaml(f));
}

export function loadYamlString(s) {
  return yaml.load(s, { schema: yaml.JSON_SCHEMA });
}
