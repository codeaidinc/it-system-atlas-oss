// ========================================================================
// IT Systems Atlas OSS版
// 製作：合同会社CODEAID
// Copyright (c) 2026 合同会社CODEAID
// ライセンス：Apache License 2.0（LICENSE を参照）
// SPDX-License-Identifier: Apache-2.0
// ファイル：apps/web/components/SystemCard.tsx
// 説明：部品：システムの種類の小さなカード
// 履歴：
//   2026-11-16  v1.0.0  初版
// ========================================================================
import Link from 'next/link';
import { categoryLabel, domainLabel } from '@/lib/atlas';
import { LevelMeter } from './Level';

export default function SystemCard({ e }: { e: any }) {
  return (
    <Link href={`/systems/${e.id}/`} className="card">
      <div className="meta"><LevelMeter level={e.level.primary} /></div>
      <h3>{e.names.ja}</h3>
      <div className="en">{e.names.en}</div>
      <p>{e.summary.ja.length > 70 ? e.summary.ja.slice(0, 70) + '…' : e.summary.ja}</p>
      <div className="tags">
        {e.critical_infrastructure && <span className="tag ci">重要インフラ</span>}
        <span className="tag"><span className="mono">{e.domain}</span> {domainLabel(e.domain)}</span>
        <span className="tag">{categoryLabel(e.category)}</span>
        {e.learning && <span className="tag edu">教材カード</span>}
      </div>
    </Link>
  );
}
