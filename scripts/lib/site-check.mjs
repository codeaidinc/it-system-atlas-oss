// ========================================================================
// IT System Atlas OSS版
// 製作：合同会社CODEAID
// Copyright (c) 2026 合同会社CODEAID
// ライセンス：Apache License 2.0（LICENSE を参照）
// SPDX-License-Identifier: Apache-2.0
// ファイル：scripts/lib/site-check.mjs
// 説明：ビルドしたサイトの検査（リンク切れ・外部スクリプト・フォーム・構成）
// 履歴：
//   2026-11-16  v1.0.0  初版
// ========================================================================
// ビルド済みサイト（apps/web/out）の検査：内部リンク切れ・外部スクリプト・入力フォーム・決めた構成の外のページ。
// tests/site.test.mjs と scripts/verify.mjs から使う。外部のパッケージは使わない。
import fs from 'node:fs';
import path from 'node:path';
import { ROOT } from './load.mjs';

export const OUT = path.join(ROOT, 'apps/web/out');

/** サイトの最上位に置くもの（これ以外のページは作らない） */
export const ALLOWED_TOP = ['404', '404.html', '_next', 'about', 'fonts', 'index.html', 'index.txt', 'maps', 'opendata', 'systems'];

function walk(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const p = path.join(dir, d.name);
    return d.isDirectory() ? walk(p) : [p];
  });
}

/** URL のパス（ベースパスを除いたもの）が out のファイルに対応するか */
function exists(out, p) {
  const f = path.join(out, p);
  if (!f.startsWith(out)) return false;
  return (fs.existsSync(f) && fs.statSync(f).isFile()) || fs.existsSync(path.join(f, 'index.html')) || fs.existsSync(f + '.html');
}

/**
 * @param {{ out?: string, base?: string }} opts base はビルド時の ATLAS_BASE_PATH
 * @returns {{ pages: number, links: number, problems: {file:string, issue:string}[] }}
 */
export function checkSite({ out = OUT, base = process.env.ATLAS_BASE_PATH || '' } = {}) {
  base = base.replace(/\/$/, '');
  const problems = [];
  const htmls = walk(out).filter((f) => f.endsWith('.html'));
  let links = 0;
  for (const file of htmls) {
    const rel = path.relative(out, file).split(path.sep).join('/');
    const html = fs.readFileSync(file, 'utf8');
    // 外部のスクリプト・計測は読み込まない
    for (const m of html.matchAll(/<script[^>]+src="(https?:)?\/\/[^"]+"/g)) problems.push({ file: rel, issue: `外部のスクリプト: ${m[0]}` });
    // 入力を送るフォームは置かない（検索の GET だけ許す）
    for (const m of html.matchAll(/<form[^>]*>/g)) if (/method="post"/i.test(m[0])) problems.push({ file: rel, issue: `POST のフォーム: ${m[0]}` });
    for (const m of html.matchAll(/\s(?:href|src|action)="([^"]+)"/g)) {
      const u = m[1].replace(/&amp;/g, '&');
      if (/^(https?:|mailto:|tel:|data:|javascript:|#)/.test(u)) continue;
      if (!u.startsWith('/')) continue; // 相対パスは使っていない
      links++;
      if (base && !(u === base || u.startsWith(base + '/'))) { problems.push({ file: rel, issue: `ベースパス（${base}）が付いていないリンク: ${u}` }); continue; }
      const p = decodeURIComponent((base ? u.slice(base.length) : u).split('#')[0].split('?')[0]) || '/';
      if (!exists(out, p)) problems.push({ file: rel, issue: `リンク切れ: ${u}` });
    }
  }
  for (const name of fs.readdirSync(out)) if (!ALLOWED_TOP.includes(name)) problems.push({ file: name, issue: '決めた構成の外のページ・ファイルがある' });
  return { pages: htmls.length, links, problems };
}
