// ========================================================================
// IT Systems Atlas OSS版
// 製作：合同会社CODEAID
// Copyright (c) 2026 合同会社CODEAID
// ライセンス：Apache License 2.0（LICENSE を参照）
// SPDX-License-Identifier: Apache-2.0
// ファイル：apps/web/components/LifecycleMap.tsx
// 説明：部品：ライフサイクル地図（8段階の円環と、段階ごとの活動・成果物・担う組織）
// 履歴：
//   2026-11-16  v1.0.0  初版
// ========================================================================
'use client';
import { useState } from 'react';
import { LIFECYCLE, roleLabel } from '@/lib/atlas';

export default function LifecycleMap() {
  const [sel, setSel] = useState('lc.operation');
  const n = LIFECYCLE.length, S = 520, c = S / 2, R = 190;
  const ph = LIFECYCLE.find((p) => p.id === sel);
  const pos = (i: number) => { const a = -Math.PI / 2 + (2 * Math.PI * i) / n; return [c + R * Math.cos(a), c + R * Math.sin(a)]; };
  return (
    <div className="grid2">
      <div className="svg-wrap">
        <svg viewBox={`0 0 ${S} ${S}`} width="100%" role="img" aria-label="ライフサイクルの8段階">
          <defs><marker id="la" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0,0 L10,5 L0,10 z" fill="var(--muted)" /></marker></defs>
          <circle cx={c} cy={c} r={R} fill="none" stroke="var(--line)" strokeWidth={14} />
          {LIFECYCLE.map((p, i) => {
            const a0 = -Math.PI / 2 + (2 * Math.PI * (i + 0.28)) / n, a1 = -Math.PI / 2 + (2 * Math.PI * (i + 0.72)) / n;
            return <path key={`a${i}`} d={`M${c + R * Math.cos(a0)},${c + R * Math.sin(a0)} A${R},${R} 0 0 1 ${c + R * Math.cos(a1)},${c + R * Math.sin(a1)}`} fill="none" stroke="var(--muted)" strokeWidth={1.5} markerEnd="url(#la)" />;
          })}
          {LIFECYCLE.map((p, i) => {
            const [x, y] = pos(i), on = p.id === sel, long = p.id === 'lc.operation' || p.id === 'lc.improvement';
            return (
              <g key={p.id} onClick={() => setSel(p.id)} style={{ cursor: 'pointer' }} role="button" aria-label={p.ja}>
                <circle cx={x} cy={y} r={long ? 50 : 42} fill={on ? 'var(--ink)' : long ? 'var(--accent-soft)' : 'var(--surface)'} stroke={on ? 'var(--ink)' : long ? 'var(--accent)' : 'var(--line)'} strokeWidth={2} />
                <text x={x} y={y - 6} textAnchor="middle" fontSize="11" fill={on ? 'var(--paper)' : 'var(--muted)'}>{p.order}</text>
                <text x={x} y={y + 11} textAnchor="middle" fontSize={p.ja.length > 6 ? 10.5 : 13} fontWeight="700" fill={on ? 'var(--paper)' : 'var(--ink)'}>{p.ja.split('（')[0]}</text>
              </g>
            );
          })}
          <text x={c} y={c - 12} textAnchor="middle" fontSize="15" fontWeight="700" fill="var(--ink)">システムの一生</text>
          <text x={c} y={c + 12} textAnchor="middle" fontSize="11.5" fill="var(--muted)">運用・保守と改善は</text>
          <text x={c} y={c + 30} textAnchor="middle" fontSize="11.5" fill="var(--muted)">何年〜何十年も続く</text>
        </svg>
      </div>
      {ph && (
        <div className="panel" style={{ marginTop: 0 }}>
          <h3>{ph.order}. {ph.ja}</h3>
          <p>{ph.desc}</p>
          <table className="kv"><tbody>
            <tr><th>主な活動</th><td>{ph.activities.join('、')}</td></tr>
            <tr><th>主な成果物</th><td>{ph.outputs.join('、')}</td></tr>
            <tr><th>担う組織</th><td>{ph.industry_roles.map(roleLabel).join('、')}</td></tr>
          </tbody></table>
          <div className="question" style={{ marginTop: 12 }}>問い：{ph.question}</div>
        </div>
      )}
    </div>
  );
}
