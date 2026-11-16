// ========================================================================
// IT Systems Atlas OSS版
// 製作：合同会社CODEAID
// Copyright (c) 2026 合同会社CODEAID
// ライセンス：Apache License 2.0（LICENSE を参照）
// SPDX-License-Identifier: Apache-2.0
// ファイル：apps/web/components/ScaleBars.tsx
// 説明：部品：規模の目安（開発規模・利用規模）の帯
// 履歴：
//   2026-11-16  v1.0.0  初版
// ========================================================================
import { withBase } from '@/lib/site';
import { PCLASSES, UCLASSES, pIndex, uIndex, pClassText, uClassText, pSpanText, pSpanCost, uSpanText } from '@/lib/atlas';

export default function ScaleBars({ typical }: { typical: any }) {
  const p0 = pIndex(typical.project_class.min), p1 = pIndex(typical.project_class.max);
  const u0 = uIndex(typical.usage_class.min), u1 = uIndex(typical.usage_class.max);
  return (
    <div className="scale-box">
      <div className="scale-row">
        <div className="label"><span>開発規模（1つの開発・刷新プロジェクト）</span><span>{typical.project_class.min}〜{typical.project_class.max}</span></div>
        <div className="bar" style={{ gridTemplateColumns: `repeat(${PCLASSES.length}, 1fr)` }}>
          {PCLASSES.map((c, i) => <div key={c.id} className={i >= p0 && i <= p1 ? 'on' : ''} title={`${c.ja}：${pClassText(c.id)}`}>{c.id}</div>)}
        </div>
        <div className="small muted">目安：{pSpanText(typical.project_class.min, typical.project_class.max)}（金額換算 {pSpanCost(typical.project_class.min, typical.project_class.max)}）</div>
      </div>
      <div className="scale-row">
        <div className="label"><span>利用規模（サービスを受ける人を含む）</span><span>{typical.usage_class.min}〜{typical.usage_class.max}</span></div>
        <div className="bar u" style={{ gridTemplateColumns: `repeat(${UCLASSES.length}, 1fr)` }}>
          {UCLASSES.map((c, i) => <div key={c.id} className={i >= u0 && i <= u1 ? 'on' : ''} title={`${c.ja}：${uClassText(c.id)}`}>{c.id}</div>)}
        </div>
        <div className="small muted">目安：{uSpanText(typical.usage_class.min, typical.usage_class.max)}</div>
      </div>
      <div className="note">
        <span className="ev editorial_estimate">目安</span> 編集部による典型的な範囲の目安です。実在の案件の値ではありません。
        区分の金額換算は1人月＝100万円と仮定した概算です。 <a href={withBase('/about/#scale')}>規模区分について</a>
      </div>
    </div>
  );
}
