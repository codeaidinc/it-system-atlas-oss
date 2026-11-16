// ========================================================================
// IT Systems Atlas OSS版
// 製作：合同会社CODEAID
// Copyright (c) 2026 合同会社CODEAID
// ライセンス：Apache License 2.0（LICENSE を参照）
// SPDX-License-Identifier: Apache-2.0
// ファイル：tests/headers.test.mjs
// 説明：テスト：全ファイルのコメントヘッダ
// 履歴：
//   2026-11-16  v1.0.0  初版
// ========================================================================
// 全ファイルの先頭に、製作・著作権・ライセンス・ファイル説明・履歴のコメントヘッダがあること（npm run headers -- --fix で付けられる）
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkAll, targets } from '../scripts/headers.mjs';

test('コメントを書ける全ファイルに、正しいヘッダがある', () => {
  assert.ok(targets().length > 200);
  assert.deepEqual(checkAll().slice(0, 30), []);
});
