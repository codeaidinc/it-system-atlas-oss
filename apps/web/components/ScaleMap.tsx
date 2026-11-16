// ========================================================================
// IT System Atlas OSS版
// 製作：合同会社CODEAID
// Copyright (c) 2026 合同会社CODEAID
// ライセンス：Apache License 2.0（LICENSE を参照）
// SPDX-License-Identifier: Apache-2.0
// ファイル：apps/web/components/ScaleMap.tsx
// 説明：部品：規模・リスク地図（開発規模と利用規模の散布図）
// 履歴：
//   2026-11-16  v1.0.0  初版
// ========================================================================
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { SYSTEM_TYPES, PCLASSES, UCLASSES, pIndex, uIndex, domains, pClassText, uClassText } from '@/lib/atlas';
import { CritMark } from './Level';

// 範囲の中央の区分に配置する（範囲そのものは詳細ページで表示）
const mid = (a: number, b: number) => Math.round((a + b) / 2);

export default function ScaleMap() {
  const [ind, setInd] = useState('');
  const items = SYSTEM_TYPES.filter((e) => !ind || e.domain === ind);
  const cells: Record<string, any[]> = {};
  for (const e of items) {
    const t = e.scale.typical;
    const p = mid(pIndex(t.project_class.min), pIndex(t.project_class.max));
    const u = mid(uIndex(t.usage_class.min), uIndex(t.usage_class.max));
    (cells[`${p}-${u}`] ||= []).push(e);
  }
  return (
    <>
      <div className="filters">
        <select aria-label="領域で絞り込み" value={ind} onChange={(e) => setInd(e.target.value)}>
          <option value="">すべての領域</option>
          {domains().map((d: any) => <option key={d.id} value={d.id}>{d.id} {d.ja}</option>)}
        </select>
      </div>
      <div className="legend"><span>横軸：開発規模（1つの開発・刷新プロジェクト）</span><span>縦軸：利用規模</span><span>数字と濃さ＝重要度（停止影響）：{[1, 2, 3, 4, 5].map((v) => <CritMark key={v} v={v} />)}</span><span><span className="chip ci">左の太線</span> 重要インフラ</span></div>
      <div className="table-scroll">
        <div className="scatter">
          {[...UCLASSES].reverse().map((u) => {
            const ui = uIndex(u.id);
            return [
              <div key={`a-${u.id}`} className="axis"><b>{u.id}</b>{u.ja}<span className="small">{uClassText(u.id)}</span></div>,
              ...PCLASSES.map((p, pi) => (
                <div key={`${p.id}-${u.id}`} className="cell">
                  {(cells[`${pi}-${ui}`] || []).map((e) => (
                    <Link key={e.id} href={`/systems/${e.id}/`} className={`chip ${e.critical_infrastructure ? 'ci' : ''}`}
                      title={`開発 ${e.scale.typical.project_class.min}〜${e.scale.typical.project_class.max} ／ 利用 ${e.scale.typical.usage_class.min}〜${e.scale.typical.usage_class.max}`}>
                      <CritMark v={e.axes?.criticality ?? 1} />{e.names.ja}
                    </Link>
                  ))}
                </div>
              )),
            ];
          })}
          <div />
          {PCLASSES.map((p) => <div key={`x-${p.id}`} className="axis"><b>{p.id}</b>{p.ja}<span className="small">{pClassText(p.id)}</span></div>)}
        </div>
      </div>
      <p className="note">各システムは、編集部の目安（範囲）の中央の区分に配置しています。範囲と公開事例の数値は各カードで確認できます。区分はアトラス独自の教育用の暫定区分です。</p>
    </>
  );
}
