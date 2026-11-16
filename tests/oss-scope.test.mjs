// ========================================================================
// IT System Atlas OSS版
// 製作：合同会社CODEAID
// Copyright (c) 2026 合同会社CODEAID
// ライセンス：Apache License 2.0（LICENSE を参照）
// SPDX-License-Identifier: Apache-2.0
// ファイル：tests/oss-scope.test.mjs
// 説明：テスト：OSS版の構成・秘密情報・外部サービスの呼び出し
// 履歴：
//   2026-11-16  v1.0.0  初版
// ========================================================================
// OSS版の範囲を守るための検査：決めた構成の外のファイル・含めない機能のページ・秘密情報・外部サービスの呼び出しがないこと
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { ROOT, ENTRY_TYPES } from '../scripts/lib/load.mjs';

/** Git で管理しているファイル（Git がなければ作業ディレクトリ） */
function trackedFiles() {
  try {
    return execFileSync('git', ['-c', 'core.quotepath=false', 'ls-files'], { cwd: ROOT, encoding: 'utf8' }).split('\n').filter((f) => f && fs.existsSync(path.join(ROOT, f)));
  } catch {
    const walk = (d) => fs.readdirSync(d, { withFileTypes: true }).flatMap((x) => {
      if (['node_modules', '.git', '.next', 'out', 'generated', 'opendata', 'dist'].includes(x.name)) return [];
      const p = path.join(d, x.name);
      return x.isDirectory() ? walk(p) : [path.relative(ROOT, p).split(path.sep).join('/')];
    });
    return walk(ROOT);
  }
}
const all = trackedFiles();

/** リポジトリの最上位に置いてよいもの */
const TOP = ['.gitattributes', '.github', '.gitignore', 'CONTRIBUTING.md', 'LICENSE', 'LICENSE-DATA', 'NOTICE', 'README.md', 'SECURITY.md', 'apps', 'data', 'docs', 'package-lock.json', 'package.json', 'schema', 'scripts', 'tests'];
/** サイトのページ（apps/web/app の直下）として置いてよいもの */
const APP = ['about', 'globals.css', 'layout.tsx', 'maps', 'page.tsx', 'systems', 'theme.css'];
const MAPS = ['architecture', 'business', 'infrastructure', 'lifecycle', 'page.tsx', 'scale', 'world'];

test('リポジトリの最上位・サイトのページ・地図は、決めた構成のものだけ', () => {
  const top = [...new Set(all.map((f) => f.split('/')[0]))];
  assert.deepEqual(top.filter((x) => !TOP.includes(x)), []);
  const app = [...new Set(all.filter((f) => f.startsWith('apps/web/app/')).map((f) => f.split('/')[3]))];
  assert.deepEqual(app.filter((x) => !APP.includes(x)), []);
  const maps = [...new Set(all.filter((f) => f.startsWith('apps/web/app/maps/')).map((f) => f.split('/')[4]))];
  assert.deepEqual(maps.filter((x) => !MAPS.includes(x)), []);
});

test('データの種類は system_type・business_flow だけ（実在の企業の製品・組織のカードは持たない）', () => {
  assert.deepEqual([...ENTRY_TYPES].sort(), ['business_flow', 'system_type']);
  const dirs = [...new Set(all.filter((f) => f.startsWith('data/entries/')).map((f) => f.split('/')[2]))].sort();
  assert.deepEqual(dirs, ['business_flow', 'system_type']);
});

test('地図は6つ（01〜06）', () => {
  const views = all.filter((f) => f.startsWith('data/views/')).map((f) => path.basename(f)).sort();
  assert.deepEqual(views.map((v) => v.slice(0, 2)), ['01', '02', '03', '04', '05', '06']);
});

test('リポジトリに秘密情報・鍵のファイルがない', () => {
  assert.deepEqual(all.filter((f) => /(^|\/)\.env(\.|$)|\.pem$|\.p12$|\.pfx$|credentials\.json$|(^|\/)\.dev\.vars|id_rsa|id_ed25519/.test(f)), []);
  for (const f of all) {
    if (/\.(woff2|png|jpg|ico)$/.test(f)) continue;
    const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
    assert.ok(!/sk-ant-[A-Za-z0-9]|sk-[A-Za-z0-9]{32,}|AKIA[0-9A-Z]{16}|ghp_[A-Za-z0-9]{36}|-----BEGIN [A-Z ]*PRIVATE KEY-----/.test(s), f);
  }
});

test('外部の AI・計測・投稿のサービスを呼び出すコードがない', () => {
  const code = all.filter((f) => /\.(mjs|js|ts|tsx)$/.test(f) && !f.startsWith('tests/'));
  for (const f of code) {
    const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
    assert.ok(!/api\.anthropic\.com|api\.openai\.com|googletagmanager|google-analytics|challenges\.cloudflare\.com|fetch\(['"`]https?:/.test(s), f);
  }
});
