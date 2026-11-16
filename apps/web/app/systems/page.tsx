// ========================================================================
// IT Systems Atlas OSS版
// 製作：合同会社CODEAID
// Copyright (c) 2026 合同会社CODEAID
// ライセンス：Apache License 2.0（LICENSE を参照）
// SPDX-License-Identifier: Apache-2.0
// ファイル：apps/web/app/systems/page.tsx
// 説明：システムの種類の一覧のページ
// 履歴：
//   2026-11-16  v1.0.0  初版
// ========================================================================
import SystemList from '@/components/SystemList';

export const metadata = { title: 'システムを探す' };

export default function Systems() {
  return (
    <div className="wrap">
      <div className="detail-head">
        <h1>システムを探す</h1>
        <p className="muted">名前・別名・説明から検索し、産業・種類・構成の層・開発規模で絞り込めます。</p>
      </div>
      <SystemList />
    </div>
  );
}
