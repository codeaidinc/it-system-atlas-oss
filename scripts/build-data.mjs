// ========================================================================
// IT System Atlas OSS版
// 製作：合同会社CODEAID
// Copyright (c) 2026 合同会社CODEAID
// ライセンス：Apache License 2.0（LICENSE を参照）
// SPDX-License-Identifier: Apache-2.0
// ファイル：scripts/build-data.mjs
// 説明：npm run build:data：data/ からサイト用の JSON とオープンデータを作る
// 履歴：
//   2026-11-16  v1.0.0  初版
// ========================================================================
// npm run build:data — data/ から公開サイト用のJSONとオープンデータを生成する。
// 既定では取り下げ（withdrawn）以外のすべてのカードを含め、下書きは画面に「下書き」と表示する。
// ATLAS_MODE=reviewed のときは確認済み（reviewed）のカードだけで生成する（授業で配布する版など）。
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ROOT, loadEntries, loadTaxonomy, loadViews } from './lib/load.mjs';

export function buildAtlas({ mode = 'all', root = ROOT } = {}) {
  const tax = loadTaxonomy(root);
  const views = loadViews(root).sort((a, b) => a.order - b.order);
  const all = loadEntries(root).map((e) => e.data).filter(Boolean);
  const allowed = mode === 'reviewed' ? ['reviewed'] : ['reviewed', 'draft'];
  const entries = all.filter((d) => allowed.includes(d.editorial?.status));
  const ids = new Set(entries.map((e) => e.id));

  // 収録しないカードへの参照は落とす
  for (const e of entries) {
    if (e.relations) e.relations = e.relations.filter((r) => ids.has(r.target));
  }

  // 逆方向の関係・業務の流れの対応を派生
  const inbound = {};
  for (const e of entries) for (const r of e.relations || []) (inbound[r.target] ||= []).push({ type: r.type, source: e.id });
  const flowStagesBySystem = {};
  for (const bf of entries.filter((x) => x.type === 'business_flow')) {
    for (const stg of bf.stages) for (const st of stg.systems) (flowStagesBySystem[st] ||= []).push({ flow: bf.id, stage: stg.id, ja: stg.ja });
    for (const st of bf.hub.systems) (flowStagesBySystem[st] ||= []).push({ flow: bf.id, stage: 'hub', ja: bf.hub.ja });
  }

  const taxonomy = mode === 'reviewed' ? stripPending(tax) : tax;

  return {
    meta: {
      name: 'IT System Atlas',
      version: JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).version,
      mode,
      generated_at: new Date().toISOString(),
      license_data: 'CC-BY-4.0',
      counts: entries.reduce((m, e) => ((m[e.type] = (m[e.type] || 0) + 1), m), {}),
    },
    taxonomy,
    views,
    entries,
    derived: { inbound, flowStagesBySystem },
  };
}

/** 根拠（evidence）のうち、確認中（basis: pending）のものを取り除いた複製を返す（配列・単体の両方） */
export function stripPending(v) {
  if (Array.isArray(v)) return v.filter((x) => !(x && typeof x === 'object' && x.basis === 'pending' && 'claim' in x)).map(stripPending);
  if (v && typeof v === 'object') {
    const o = {};
    for (const [k, x] of Object.entries(v)) {
      if (k === 'evidence' && x && !Array.isArray(x) && x.basis === 'pending') continue;
      o[k] = stripPending(x);
    }
    return o;
  }
  return v;
}

function toCsv(rows) {
  const esc = (v) => {
    const s = v === undefined || v === null ? '' : Array.isArray(v) ? v.join('|') : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return rows.map((r) => r.map(esc).join(',')).join('\n') + '\n';
}

export function writeOutputs(atlas, root = ROOT) {
  const gen = path.join(root, 'apps/web/generated');
  fs.mkdirSync(gen, { recursive: true });
  fs.writeFileSync(path.join(gen, 'atlas.json'), JSON.stringify(atlas));

  // オープンデータ（サイトから配布）：エントリ本体のみ。
  const od = path.join(root, 'apps/web/public/opendata');
  fs.mkdirSync(od, { recursive: true });
  const open = { meta: atlas.meta, entries: atlas.entries };
  fs.writeFileSync(path.join(od, 'atlas.json'), JSON.stringify(open, null, 1));
  const st = atlas.entries.filter((e) => e.type === 'system_type');
  fs.writeFileSync(
    path.join(od, 'system_types.csv'),
    '﻿' +
      toCsv([
        ['id', 'name_ja', 'name_en', 'domain', 'level', 'scope', 'industry', 'category', 'layer', 'project_class_min', 'project_class_max', 'usage_class_min', 'usage_class_max', 'critical_infrastructure', 'status', 'summary_ja'],
        ...st.map((e) => [e.id, e.names.ja, e.names.en, e.domain, e.level.primary, e.scope, e.industry, e.category, e.layer, e.scale.typical.project_class.min, e.scale.typical.project_class.max, e.scale.typical.usage_class.min, e.scale.typical.usage_class.max, e.critical_infrastructure?.sectors, e.editorial.status, e.summary.ja]),
      ])
  );
}

// 直接実行の判定（Windowsのパス C:\... にも対応）
const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  const mode = process.env.ATLAS_MODE === 'reviewed' ? 'reviewed' : 'all';
  const atlas = buildAtlas({ mode });
  writeOutputs(atlas);
  console.log(`build:data (${mode}) → ${JSON.stringify(atlas.meta.counts)}`);
  if (mode === 'reviewed' && !atlas.entries.length) console.warn('⚠ 確認済み（reviewed）のカードがまだありません。');
}
