// ========================================================================
// IT Systems Atlas OSS版
// 製作：合同会社CODEAID
// Copyright (c) 2026 合同会社CODEAID
// ライセンス：Apache License 2.0（LICENSE を参照）
// SPDX-License-Identifier: Apache-2.0
// ファイル：scripts/print-pdf.mjs
// 説明：npm run print:pdf：地図の印刷用 PDF を作る
// 履歴：
//   2026-11-16  v1.0.0  初版
// ========================================================================
// npm run print:pdf — 地図の印刷用PDFを dist/print/ に生成する。
// 前提：npm run build 済み（apps/web/out）。Playwright が必要（npx playwright install chromium）。
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { ROOT } from './lib/load.mjs';

import { createRequire } from 'node:module';
let chromium;
try { ({ chromium } = await import('playwright')); } catch {
  // グローバルにインストールされた Playwright（NODE_PATH）も探す
  try { ({ chromium } = createRequire(import.meta.url)(createRequire(import.meta.url).resolve('playwright', { paths: (process.env.NODE_PATH || '').split(path.delimiter).filter(Boolean) }))); } catch { /* なし */ }
}
if (!chromium) {
  console.error('Playwright が見つかりません。 npm i -D playwright && npx playwright install chromium を実行してください。');
  process.exit(1);
}
const OUT = path.join(ROOT, 'apps/web/out');
const DEST = path.join(ROOT, 'dist/print');
if (!fs.existsSync(OUT)) { console.error('apps/web/out がありません。先に npm run build を実行してください。'); process.exit(1); }
fs.mkdirSync(DEST, { recursive: true });

const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.csv': 'text/csv; charset=utf-8', '.txt': 'text/plain; charset=utf-8' };
const server = http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  let f = path.join(OUT, p);
  if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, 'index.html');
  if (!fs.existsSync(f)) { res.writeHead(404); return res.end('not found'); }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
}).listen(0);
const base = `http://localhost:${server.address().port}`;

const JOBS = [
  { url: '/maps/world/', file: '地図01_ITシステム世界地図.pdf', landscape: true },
  { url: '/maps/business/', file: '地図02_企業業務地図.pdf', landscape: true },
  { url: '/maps/infrastructure/', file: '地図03_社会基盤地図.pdf', landscape: true },
  { url: '/maps/architecture/', file: '地図04_統合階層地図.pdf', landscape: true },
  { url: '/maps/scale/', file: '地図05_規模リスク地図.pdf', landscape: true },
  { url: '/maps/lifecycle/', file: '地図06_ライフサイクル地図.pdf', landscape: true },
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
for (const j of JOBS) {
  await page.goto(base + j.url, { waitUntil: 'networkidle' });
  for (const c of j.click || []) await page.click(c);
  await page.waitForTimeout(300);
  await page.pdf({ path: path.join(DEST, j.file), format: 'A4', landscape: !!j.landscape, printBackground: true, margin: { top: '12mm', bottom: '12mm', left: '10mm', right: '10mm' } });
  console.log('✔', j.file);
}
await browser.close();
server.close();
console.log(`出力先: ${path.relative(ROOT, DEST)}`);
