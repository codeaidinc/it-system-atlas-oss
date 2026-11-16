// ========================================================================
// IT System Atlas OSS版
// 製作：合同会社CODEAID
// Copyright (c) 2026 合同会社CODEAID
// ライセンス：Apache License 2.0（LICENSE を参照）
// SPDX-License-Identifier: Apache-2.0
// ファイル：apps/web/app/maps/architecture/page.tsx
// 説明：地図04「統合階層地図」のページ
// 履歴：
//   2026-11-16  v1.0.0  初版
// ========================================================================
import Link from 'next/link';
import ArchitectureMap from '@/components/ArchitectureMap';

export const metadata = { title: '統合階層地図' };

export default function Page() {
  return (
    <div className="wrap">
      <div className="detail-head">
        <div className="crumbs"><Link href="/maps/">地図</Link> ／ 04</div>
        <h1>統合階層地図</h1>
        <p className="summary">ITシステムは、アプリケーション（L1）から社会基盤（L5）まで、責任範囲の広さによって積み重なっています。上下は規模の順位ではなく、どれだけ多くの組織や人がそのシステムに頼っているかを表します。すべてを下から支えるのが共通技術基盤（L0）です。</p>
        <div className="question">問い：スマートフォンの銀行アプリ（L2）の残高照会画面を直すとき、画面のほかに何を考えなければならないか</div>
      </div>
      <h2 style={{ marginTop: 0 }}>統合階層地図</h2>
      <p className="small muted">システムを選ぶと、つながっているシステムが浮かび上がります。</p>
      <ArchitectureMap />
    </div>
  );
}
