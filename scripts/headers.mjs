// ========================================================================
// IT Systems Atlas OSS版
// 製作：合同会社CODEAID
// Copyright (c) 2026 合同会社CODEAID
// ライセンス：Apache License 2.0（LICENSE を参照）
// SPDX-License-Identifier: Apache-2.0
// ファイル：scripts/headers.mjs
// 説明：npm run headers：全ファイルのコメントヘッダを確かめる・付ける
// 履歴：
//   2026-11-16  v1.0.0  初版
// ========================================================================
// npm run headers — 全ファイルの先頭のコメントヘッダ（製作・著作権・ライセンス・ファイル説明・履歴）を確かめる・付ける。
//   node scripts/headers.mjs          … 確かめる（不足があれば一覧を出して終了コード1）
//   node scripts/headers.mjs --fix    … ヘッダのないファイルに付け、「ファイル：」の行を実際のパスに合わせる
// コメントを書けない種類のファイル（JSON・ライセンス本文・フォント・自動生成のファイル）は対象外。
// 新しいファイルの「説明：」は、データはカードの名前から作り、それ以外は先頭のコメント行から取る。取れなければ「（説明を書いてください）」
// とし、確かめるときに不合格にする。
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath, pathToFileURL } from 'node:url';
import yaml from 'js-yaml';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const HOLDER = '合同会社CODEAID';
export const PRODUCT = 'IT Systems Atlas OSS版';
export const PLACEHOLDER = '（説明を書いてください）';
const RULE = '='.repeat(72);

/** 対象外（コメントを書けない・書いてはいけない） */
const EXCLUDE = [/\.json$/, /\.woff2?$/, /\.(png|jpg|jpeg|gif|ico|svg|pdf)$/, /(^|\/)LICENSE(-DATA)?$/, /(^|\/)NOTICE$/, /\.txt$/, /(^|\/)next-env\.d\.ts$/];

/** コメントの書き方 */
function styleOf(f) {
  if (/\.(mjs|js|cjs|ts|tsx)$/.test(f)) return { kind: 'line', p: '//' };
  if (/\.css$/.test(f)) return { kind: 'block', open: '/*', p: ' *', close: ' */' };
  if (/\.(ya?ml)$/.test(f) || /(^|\/)\.git(ignore|attributes)$/.test(f)) return { kind: 'line', p: '#' };
  if (/\.md$/.test(f)) return { kind: 'block', open: '<!--', p: '', close: '-->' };
  return null;
}

/** ライセンス：データと文章は CC BY 4.0、それ以外（コード・設定）は Apache-2.0 */
export function licenseOf(f) {
  return f.startsWith('data/') || /\.md$/.test(f) ? { spdx: 'CC-BY-4.0', ja: 'CC BY 4.0（LICENSE-DATA を参照）' } : { spdx: 'Apache-2.0', ja: 'Apache License 2.0（LICENSE を参照）' };
}

export function targets() {
  let files;
  try {
    files = execFileSync('git', ['-c', 'core.quotepath=false', 'ls-files', '--cached', '--others', '--exclude-standard'], { cwd: ROOT, encoding: 'utf8' }).split('\n').filter(Boolean);
  } catch {
    throw new Error('git が必要です（対象のファイルを Git の管理状態から決めるため）');
  }
  return [...new Set(files)].filter((f) => fs.existsSync(path.join(ROOT, f)) && styleOf(f) && !EXCLUDE.some((re) => re.test(f))).sort();
}

/** データのファイルは、中身から説明を作る */
function autoDescription(f, text) {
  if (!f.startsWith('data/')) return null;
  let d;
  try { d = yaml.load(text, { schema: yaml.JSON_SCHEMA }); } catch { return null; }
  const name = d?.names?.ja ?? d?.title?.ja;
  const kind = { system_type: 'システムの種類のカード', business_flow: '企業業務の流れ' }[d?.type];
  if (kind && name) return `${kind}「${name}」（${d.id}）`;
  if (f.startsWith('data/views/') && d?.title?.ja) return `地図${String(d.order).padStart(2, '0')}「${d.title.ja}」の定義`;
  return null;
}

/** 先頭のコメント行（ヘッダを除く）から説明を取る */
function firstComment(text, st) {
  for (const line of text.split('\n').slice(0, 5)) {
    const s = line.trim();
    if (!s) continue;
    if (st.p === '//' && s.startsWith('//') && !s.startsWith('///')) return s.replace(/^\/\/\s*/, '');
    if (st.p === '#' && s.startsWith('#') && !s.startsWith('#!')) return s.replace(/^#\s*/, '');
    if (st.open === '/*' && s.startsWith('/*')) return s.replace(/^\/\*+\s*/, '').replace(/\*\/\s*$/, '');
    if (s.startsWith('/**')) return s.replace(/^\/\*+\s*/, '').replace(/\*\/\s*$/, '');
    return null;
  }
  return null;
}

export function build(f, description, history, version) {
  const st = styleOf(f);
  const lic = licenseOf(f);
  const body = [
    RULE,
    PRODUCT,
    `製作：${HOLDER}`,
    `Copyright (c) ${history[0]?.slice(0, 4) || new Date().getFullYear()} ${HOLDER}`,
    `ライセンス：${lic.ja}`,
    `SPDX-License-Identifier: ${lic.spdx}`,
    `ファイル：${f}`,
    `説明：${description}`,
    '履歴：',
    ...history.map((h) => `  ${h}`),
    RULE,
  ];
  if (st.kind === 'line') return body.map((l) => `${st.p} ${l}`.trimEnd()).join('\n') + '\n';
  return [st.open, ...body.map((l) => (st.p ? `${st.p} ${l}`.trimEnd() : l)), st.close].join('\n') + '\n';
}

/** 既存のヘッダを読む（なければ null） */
export function parse(text) {
  const head = text.split('\n').slice(0, 40).join('\n');
  if (!head.includes(PRODUCT) || !head.includes('SPDX-License-Identifier:')) return null;
  const get = (k) => head.match(new RegExp(`${k}：(.*)`))?.[1]?.trim();
  const lines = head.split('\n');
  const hi = lines.findIndex((l) => /履歴：/.test(l));
  const history = [];
  for (let i = hi + 1; i < lines.length; i++) {
    const m = lines[i].match(/^\s*(?:\/\/|#|\*)?\s{1,}(\d{4}-\d{2}-\d{2}.*)$/) || lines[i].match(/^\s+(\d{4}-\d{2}-\d{2}.*)$/);
    if (!m) break;
    history.push(m[1].trim());
  }
  const end = lines.findIndex((l, i) => i > hi && l.includes(RULE));
  let endIdx = end;
  if (end >= 0 && /^\s*(\*\/|-->)\s*$/.test(lines[end + 1] || '')) endIdx = end + 1;
  return {
    file: get('ファイル'), description: get('説明'), history,
    spdx: head.match(/SPDX-License-Identifier:\s*(\S+)/)?.[1],
    copyright: head.match(/Copyright \(c\) (\d{4}(?:-\d{4})?) (.+)/),
    endLine: endIdx,
  };
}

export function checkAll() {
  const problems = [];
  for (const f of targets()) {
    const text = fs.readFileSync(path.join(ROOT, f), 'utf8');
    const h = parse(text);
    if (!h) { problems.push(`${f}: ヘッダがありません`); continue; }
    if (h.file !== f) problems.push(`${f}: 「ファイル：」が実際のパスと違います（${h.file}）`);
    if (!h.description || h.description === PLACEHOLDER) problems.push(`${f}: 「説明：」を書いてください`);
    if (h.spdx !== licenseOf(f).spdx) problems.push(`${f}: ライセンスが ${licenseOf(f).spdx} ではありません（${h.spdx}）`);
    if (!h.copyright || h.copyright[2].trim() !== HOLDER) problems.push(`${f}: 著作権の表示がありません`);
    if (!h.history.length) problems.push(`${f}: 「履歴：」に1行以上書いてください`);
  }
  return problems;
}

export function fixAll({ today = new Date().toISOString().slice(0, 10), descriptions = {} } = {}) {
  const version = JSON.parse(fs.readFileSync(path.join(ROOT, 'package.json'), 'utf8')).version;
  const changed = [];
  for (const f of targets()) {
    const p = path.join(ROOT, f);
    const text = fs.readFileSync(p, 'utf8');
    const st = styleOf(f);
    const h = parse(text);
    if (h) {
      if (h.file === f && h.spdx === licenseOf(f).spdx && h.description && h.copyright?.[2]?.trim() === HOLDER && !descriptions[f]) continue;
      const rest = text.split('\n').slice(h.endLine + 1).join('\n');
      if (h.file !== f) {
        // コピー・移動したファイル：説明と履歴を作り直す（コピー元の履歴は引き継がない）
        const desc = descriptions[f] || autoDescription(f, rest) || h.description || PLACEHOLDER;
        fs.writeFileSync(p, build(f, desc, [`${today}  v${version}  初版（${h.file} から作成）`], version) + rest);
      } else {
        const hist = h.history.length ? h.history : [`${today}  v${version}  初版`];
        fs.writeFileSync(p, build(f, descriptions[f] || h.description || PLACEHOLDER, hist, version) + rest);
      }
      changed.push(f);
      continue;
    }
    const desc = descriptions[f] || autoDescription(f, text) || firstComment(text, st) || PLACEHOLDER;
    let head = '', body = text;
    if (body.startsWith('#!')) { const i = body.indexOf('\n') + 1; head = body.slice(0, i); body = body.slice(i); }
    fs.writeFileSync(p, head + build(f, desc, [`${today}  v${version}  初版`], version) + body);
    changed.push(f);
  }
  return changed;
}

const isMain = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;
if (isMain) {
  if (process.argv.includes('--fix')) {
    const di = process.argv.indexOf('--descriptions');
    const descriptions = di >= 0 ? JSON.parse(fs.readFileSync(process.argv[di + 1], 'utf8')) : {};
    const changed = fixAll({ descriptions });
    console.log(`ヘッダを付けた・直したファイル：${changed.length}件`);
  }
  const problems = checkAll();
  for (const x of problems) console.log(`✖ ${x}`);
  console.log(`対象：${targets().length}件／不足：${problems.length}件`);
  process.exit(problems.length ? 1 : 0);
}
