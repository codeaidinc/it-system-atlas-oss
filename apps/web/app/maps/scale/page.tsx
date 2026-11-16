// ========================================================================
// IT System Atlas OSS版
// 製作：合同会社CODEAID
// Copyright (c) 2026 合同会社CODEAID
// ライセンス：Apache License 2.0（LICENSE を参照）
// SPDX-License-Identifier: Apache-2.0
// ファイル：apps/web/app/maps/scale/page.tsx
// 説明：地図05「規模・リスク地図」のページ
// 履歴：
//   2026-11-16  v1.0.0  初版
// ========================================================================
import ScaleMap from '@/components/ScaleMap';

export const metadata = { title: '規模・リスク地図' };

export default function Page() {
  return (
    <div className="wrap">
      <div className="detail-head">
        <h1>規模・リスク地図</h1>
        <p className="muted">ITシステムはどれくらい大きいのか。「作るのにかかる大きさ」と「使われる広さ」の2つの軸で並べました。小さく作って多くの人に使われるアプリもあれば、巨額をかけて作り、社会を支える基幹システムもあります。各システムの前の数字と濃さは、止まったときの影響の大きさ（重要度）です。</p>
        <div className="question">問い：開発規模が小さいのに重要度が高いシステムを探し、なぜ重要なのかを説明しよう</div>
      </div>
      <ScaleMap />
    </div>
  );
}
