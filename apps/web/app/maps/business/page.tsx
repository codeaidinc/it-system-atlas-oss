// ========================================================================
// IT Systems Atlas OSS版
// 製作：合同会社CODEAID
// Copyright (c) 2026 合同会社CODEAID
// ライセンス：Apache License 2.0（LICENSE を参照）
// SPDX-License-Identifier: Apache-2.0
// ファイル：apps/web/app/maps/business/page.tsx
// 説明：地図02「企業業務地図」のページ
// 履歴：
//   2026-11-16  v1.0.0  初版
// ========================================================================
import Link from 'next/link';
import { FLOWS, getEntry } from '@/lib/atlas';
import BusinessFlowMap from '@/components/BusinessFlowMap';

export const metadata = { title: '企業業務地図' };

export default function Page() {
  const flow = FLOWS.find((f) => f.id === 'bf-order-to-cash') ?? FLOWS[0];
  if (!flow) return <div className="wrap"><div className="detail-head"><h1>企業業務地図</h1><p className="muted">この地図は公開の準備中です。</p></div></div>;
  return (
    <div className="wrap">
      <div className="detail-head">
        <div className="crumbs"><Link href="/maps/">地図</Link> ／ 02</div>
        <h1>企業業務地図</h1>
        <p className="summary">{flow.summary.ja}</p>
        <div className="question">問い：企業にはどんな仕事があり、なぜERPというシステムが必要になったのか</div>
      </div>
      <BusinessFlowMap flow={flow} />
      <div className="grid2" style={{ marginTop: 24 }}>
        <section>
          <h2 style={{ marginTop: 0 }}>なぜERPが必要になったのか</h2>
          <ol className="steps">{flow.hub.why.map((w: string, i: number) => <li key={i}>{w}</li>)}</ol>
          <p className="small">関連：{flow.hub.systems.map((id: string, i: number) => <span key={id}>{i ? '、' : ''}{getEntry(id) ? <Link href={`/systems/${id}/`}>{getEntry(id).names.ja}</Link> : '（未公開）'}</span>)}</p>
        </section>
        <section>
          <h2 style={{ marginTop: 0 }}>考えてみよう</h2>
          <ol className="steps">{flow.questions.map((q: string, i: number) => <li key={i}>{q}</li>)}</ol>
          <p className="small muted">{flow.note.ja}</p>
        </section>
      </div>
    </div>
  );
}
