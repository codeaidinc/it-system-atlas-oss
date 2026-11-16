// ========================================================================
// IT System Atlas OSS版
// 製作：合同会社CODEAID
// Copyright (c) 2026 合同会社CODEAID
// ライセンス：Apache License 2.0（LICENSE を参照）
// SPDX-License-Identifier: Apache-2.0
// ファイル：scripts/check.mjs
// 説明：npm run check：全データの機械検査
// 履歴：
//   2026-11-16  v1.0.0  初版
// ========================================================================
// npm run check — 全データの機械検査。blocker/major があれば終了コード1。
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { loadEntries, loadTaxonomy } from './lib/load.mjs';
import { lintAll } from './lib/lint.mjs';

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  const entries = loadEntries();
  const tax = loadTaxonomy();
  const results = lintAll(entries, tax);
  let errors = 0, warnings = 0;
  for (const r of results.values()) {
    for (const f of r.findings) {
      const bad = f.severity === 'blocker' || f.severity === 'major';
      if (bad) errors++; else if (f.severity === 'minor') warnings++;
      if (f.severity !== 'info' || process.argv.includes('--verbose'))
        console.log(`${bad ? '✖' : '⚠'} [${f.severity}] ${r.file} ${f.field}: ${f.issue}`);
    }
  }
  const counts = entries.reduce((m, e) => ((m[e.data?.type ?? 'invalid'] = (m[e.data?.type ?? 'invalid'] || 0) + 1), m), {});
  console.log(`\n検査対象: ${entries.length}件 ${JSON.stringify(counts)}`);
  console.log(`エラー: ${errors}件 / 警告: ${warnings}件`);
  process.exit(errors ? 1 : 0);
}
