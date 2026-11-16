// ========================================================================
// IT System Atlas OSS版
// 製作：合同会社CODEAID
// Copyright (c) 2026 合同会社CODEAID
// ライセンス：Apache License 2.0（LICENSE を参照）
// SPDX-License-Identifier: Apache-2.0
// ファイル：apps/web/next.config.mjs
// 説明：Next.js の設定（静的書き出し・サブパス）
// 履歴：
//   2026-11-16  v1.0.0  初版
// ========================================================================
// 静的書き出し（apps/web/out）。サブパスに置く場合は ATLAS_BASE_PATH=/パス でビルドする。
const basePath = process.env.ATLAS_BASE_PATH || '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  basePath,
  // Link を使わない素の <a>・<form> のために、画面側からも参照できるようにする
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};
export default nextConfig;
