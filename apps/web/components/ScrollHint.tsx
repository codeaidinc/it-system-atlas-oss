// ========================================================================
// IT System Atlas OSS版
// 製作：合同会社CODEAID
// Copyright (c) 2026 合同会社CODEAID
// ライセンス：Apache License 2.0（LICENSE を参照）
// SPDX-License-Identifier: Apache-2.0
// ファイル：apps/web/components/ScrollHint.tsx
// 説明：部品：狭い画面での図の横スクロールの案内
// 履歴：
//   2026-11-16  v1.0.0  初版
// ========================================================================
/** 狭い画面でだけ表示する、図の横スクロールの案内。表示の切り替えは globals.css の .scroll-hint */
export default function ScrollHint() {
  return <p className="scroll-hint small muted">図は横にスクロールできます。同じ内容を下の表でも読めます。</p>;
}
