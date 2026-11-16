// ========================================================================
// IT Systems Atlas OSS版
// 製作：合同会社CODEAID
// Copyright (c) 2026 合同会社CODEAID
// ライセンス：Apache License 2.0（LICENSE を参照）
// SPDX-License-Identifier: Apache-2.0
// ファイル：scripts/verify.mjs
// 説明：npm run verify：データの検査・ビルド・テストをまとめて実行する
// 履歴：
//   2026-11-16  v1.0.0  初版
// ========================================================================
// npm run verify — 変更したら、これ1つで全部を確かめる。
//   1. データの機械検査（npm run check）
//   2. サイトのビルド（npm run build）
//   3. 単体・受入・サイトのテスト（npm test。ビルド後のページ・リンクの検査を含む）
// オプション：
//   --quick      ビルドを飛ばす（データと単体テストだけ。ビルド済みのサイトの検査は前回のビルドに対して行う）
//   --base /x    サブパス（ATLAS_BASE_PATH=/x）でビルドして、リンクを検査する（GitHub Pages のプロジェクトサイトなど）
import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const quick = args.includes('--quick');
const bi = args.indexOf('--base');
const base = bi >= 0 ? args[bi + 1] : process.env.ATLAS_BASE_PATH || '';
const env = { ...process.env, NEXT_TELEMETRY_DISABLED: '1', ...(base ? { ATLAS_BASE_PATH: base } : {}) };
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const steps = [
  ['データの機械検査', [npm, 'run', 'check']],
  ...(quick ? [] : [['サイトのビルド' + (base ? `（ベースパス ${base}）` : ''), [npm, 'run', 'build']]]),
  ['テスト（単体・受入・サイト）', [npm, 'test']],
];

const results = [];
for (const [name, [cmd, ...a]] of steps) {
  console.log(`\n▶ ${name}`);
  const t = Date.now();
  const r = spawnSync(cmd, a, { cwd: ROOT, env, stdio: 'inherit', shell: process.platform === 'win32' });
  const ok = r.status === 0;
  results.push({ name, ok, sec: ((Date.now() - t) / 1000).toFixed(1) });
  if (!ok) break;
}
console.log('\n── 結果 ──');
for (const r of results) console.log(`${r.ok ? '✔' : '✖'} ${r.name}（${r.sec}秒）`);
const failed = results.some((r) => !r.ok) || results.length < steps.length;
console.log(failed ? '\n不合格です。上に表示された最初のエラーから直してください。' : '\nすべて合格です。');
process.exit(failed ? 1 : 0);
