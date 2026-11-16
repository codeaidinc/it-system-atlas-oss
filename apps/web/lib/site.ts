// ========================================================================
// IT Systems Atlas OSS版
// 製作：合同会社CODEAID
// Copyright (c) 2026 合同会社CODEAID
// ライセンス：Apache License 2.0（LICENSE を参照）
// SPDX-License-Identifier: Apache-2.0
// ファイル：apps/web/lib/site.ts
// 説明：サイトの名前・説明と、サブパスに置くときの接頭辞
// 履歴：
//   2026-11-16  v1.0.0  初版
// ========================================================================
/** サブパスに置いたときの接頭辞（例：/atlas）。Link を使わない素の <a>・<form> に付ける */
export const BASE = process.env.NEXT_PUBLIC_BASE_PATH || '';
export const withBase = (p: string) => `${BASE}${p}`;

export const SITE = {
  name: 'IT Systems Atlas',
  tagline: '世界には、どんなITシステムがあるのか。',
  description:
    'アプリから企業の基幹システム、社会を支える巨大システムまで。ITシステムの存在・役割・規模・関係を見渡す、授業で使えるオープンな教材アトラス。',
};
