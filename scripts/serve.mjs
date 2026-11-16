// ========================================================================
// IT System Atlas OSS版
// 製作：合同会社CODEAID
// Copyright (c) 2026 合同会社CODEAID
// ライセンス：Apache License 2.0（LICENSE を参照）
// SPDX-License-Identifier: Apache-2.0
// ファイル：scripts/serve.mjs
// 説明：npm run start：作ったサイトを手元で配信する
// 履歴：
//   2026-11-16  v1.0.0  初版
// ========================================================================
// npm run start — 生成した静的サイト（apps/web/out）を手元で配信して確かめる（外部のパッケージは使わない）。
// 使い方：npm run start  /  PORT=8080 npm run start  /  ATLAS_BASE_PATH=/atlas npm run start（サブパスでビルドした場合）
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'apps/web/out');
const BASE = (process.env.ATLAS_BASE_PATH || '').replace(/\/$/, '');
const PORT = Number(process.env.PORT || 3000);
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.csv': 'text/csv; charset=utf-8', '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.ico': 'image/x-icon', '.woff2': 'font/woff2',
};

if (!fs.existsSync(OUT)) {
  console.error('apps/web/out がありません。先に npm run build を実行してください。');
  process.exit(1);
}

/** URL のパスを out 配下のファイルに対応させる。見つからなければ null */
export function resolveFile(urlPath, out = OUT, base = BASE) {
  let p = decodeURIComponent(urlPath.split('?')[0].split('#')[0]);
  if (base) {
    if (p !== base && !p.startsWith(base + '/')) return null;
    p = p.slice(base.length) || '/';
  }
  const f = path.normalize(path.join(out, p));
  if (!f.startsWith(out)) return null; // out の外は返さない
  if (fs.existsSync(f) && fs.statSync(f).isFile()) return f;
  if (fs.existsSync(path.join(f, 'index.html'))) return path.join(f, 'index.html');
  if (fs.existsSync(f + '.html')) return f + '.html';
  return null;
}

const server = http.createServer((req, res) => {
  const f = resolveFile(req.url || '/');
  if (!f) {
    const nf = path.join(OUT, '404.html');
    res.writeHead(404, { 'content-type': TYPES['.html'] });
    return fs.existsSync(nf) ? fs.createReadStream(nf).pipe(res) : res.end('not found');
  }
  res.writeHead(200, { 'content-type': TYPES[path.extname(f)] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
});
server.listen(PORT, () => console.log(`http://localhost:${PORT}${BASE || ''}/ で配信しています（止めるには Ctrl+C）`));
