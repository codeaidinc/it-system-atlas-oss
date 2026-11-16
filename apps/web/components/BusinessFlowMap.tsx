// ========================================================================
// IT Systems Atlas OSS版
// 製作：合同会社CODEAID
// Copyright (c) 2026 合同会社CODEAID
// ライセンス：Apache License 2.0（LICENSE を参照）
// SPDX-License-Identifier: Apache-2.0
// ファイル：apps/web/components/BusinessFlowMap.tsx
// 説明：部品：企業業務地図（業務の流れと ERP のハブ）
// 履歴：
//   2026-11-16  v1.0.0  初版
// ========================================================================
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { getEntry, shortName, bfLabel } from '@/lib/atlas';

const clip = (s: string, n: number) => (s.length > n ? s.slice(0, n) + '…' : s);
const BW = 128, BH = 150, GAP = 20, X0 = 16, Y0 = 70;

export default function BusinessFlowMap({ flow }: { flow: any }) {
  const [mode, setMode] = useState<'integrated' | 'separated'>('integrated');
  const [sel, setSel] = useState<string>('order');
  const main = flow.stages.filter((s: any) => !s.support);
  const support = flow.stages.filter((s: any) => s.support);
  const W = X0 * 2 + main.length * BW + (main.length - 1) * GAP;
  const pos: Record<string, { x: number; y: number }> = {};
  main.forEach((s: any, i: number) => (pos[s.id] = { x: X0 + i * (BW + GAP), y: Y0 }));
  const yS = Y0 + BH + 70;
  support.forEach((s: any, i: number) => (pos[s.id] = { x: X0 + (2 + i) * (BW + GAP), y: yS }));
  const yHub = yS + BH + 60, H = yHub + 110;
  const integrated = mode === 'integrated';
  const stage = flow.stages.find((s: any) => s.id === sel);
  const edges: any[] = [];
  for (const s of flow.stages) for (const n of s.next || []) edges.push([s.id, n]);
  const idx = (id: string) => main.findIndex((s: any) => s.id === id);

  return (
    <>
      <div className="toggle" role="group" aria-label="表示の切り替え">
        <button className={integrated ? 'on' : ''} onClick={() => setMode('integrated')}>ERPで統合した会社</button>
        <button className={!integrated ? 'on' : ''} onClick={() => setMode('separated')}>部門ごとに別システムの会社</button>
      </div>
      <div className="svg-wrap">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ minWidth: 860, display: 'block' }} role="img" aria-label={flow.title.ja}>
          <defs>
            <marker id="arw" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--ink-2)" /></marker>
            <marker id="arwR" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="var(--ci)" /></marker>
          </defs>
          <text x={X0} y={30} fontSize="13" fill="var(--muted)">仕事の流れ（左から右へ）　※箱をクリックすると詳しい説明が出ます{integrated ? '' : '　● 再＝次の部門で同じデータを入力し直す'}</text>

          {/* 業務の流れ */}
          {edges.map(([a, b], k) => {
            const A = pos[a], B = pos[b];
            if (!A || !B) return null;
            const stroke = integrated ? 'var(--ink-2)' : 'var(--ci)';
            const marker = integrated ? 'url(#arw)' : 'url(#arwR)';
            const dash = integrated ? undefined : '6 4';
            if (A.y === B.y && idx(b) === idx(a) + 1)
              return <g key={k}><line x1={A.x + BW} y1={A.y + BH / 2} x2={B.x - 2} y2={B.y + BH / 2} stroke={stroke} strokeWidth={2} strokeDasharray={dash} markerEnd={marker} />
                {!integrated && <g><circle cx={(A.x + BW + B.x) / 2} cy={A.y + BH / 2 - 16} r={9} fill="var(--ci)" /><text x={(A.x + BW + B.x) / 2} y={A.y + BH / 2 - 12} fontSize="10" fontWeight="700" textAnchor="middle" fill="var(--white)">再</text></g>}</g>;
            if (A.y === B.y) {
              const mx = (A.x + B.x + BW) / 2;
              return <path key={k} d={`M${A.x + BW / 2},${A.y} Q${mx},${A.y - 55} ${B.x + BW / 2},${B.y - 2}`} fill="none" stroke={stroke} strokeWidth={1.6} strokeDasharray={dash} markerEnd={marker} />;
            }
            return <path key={k} d={`M${A.x + BW},${A.y + BH / 2} C${B.x + BW / 2},${A.y + BH / 2} ${B.x + BW / 2},${A.y + BH / 2} ${B.x + BW / 2},${B.y + BH + 2}`} fill="none" stroke={stroke} strokeWidth={1.6} strokeDasharray={dash} markerEnd={marker} />;
          })}

          {/* ハブ（ERP） */}
          {integrated ? (
            <g>
              {flow.stages.map((s: any) => <line key={s.id} x1={pos[s.id].x + BW / 2} y1={pos[s.id].y + BH} x2={pos[s.id].x + BW / 2} y2={yHub} stroke="var(--accent)" strokeWidth={1.4} strokeDasharray="2 3" opacity={s.support ? 1 : 0.9} />)}
              <rect x={X0} y={yHub} width={W - 2 * X0} height={70} fill="var(--accent-soft)" stroke="var(--accent)" strokeWidth={2} />
              <text x={W / 2} y={yHub + 28} textAnchor="middle" fontSize="15" fontWeight="700" fill="var(--accent)">{flow.hub.ja}</text>
              <text x={W / 2} y={yHub + 50} textAnchor="middle" fontSize="12" fill="var(--ink-2)">取引先・品目・社員などの共通データを1つにまとめ、取引は一度の入力で全部門へ流れる</text>
            </g>
          ) : (
            <g>
              <rect x={X0} y={yHub} width={W - 2 * X0} height={70} fill="none" stroke="var(--ci)" strokeDasharray="6 4" />
              <text x={W / 2} y={yHub + 28} textAnchor="middle" fontSize="15" fontWeight="700" fill="var(--ci)">共通の基盤がない</text>
              <text x={W / 2} y={yHub + 50} textAnchor="middle" fontSize="12" fill="var(--ink-2)">部門ごとに取引先や品目のデータを別々に持ち、同じ取引を何度も入力する → 食い違い・ミス・集計の遅れ</text>
            </g>
          )}

          {/* 業務の箱 */}
          {flow.stages.map((s: any) => {
            const p = pos[s.id], on = s.id === sel;
            return (
              <g key={s.id} onClick={() => setSel(s.id)} style={{ cursor: 'pointer' }} role="button" aria-label={s.ja}>
                <rect x={p.x} y={p.y} width={BW} height={BH} fill={on ? 'var(--ink)' : 'var(--surface)'} stroke={on ? 'var(--ink)' : integrated ? 'var(--line)' : 'var(--ci)'} strokeWidth={on ? 2 : 1.4} />
                <text x={p.x + 12} y={p.y + 24} fontSize="14" fontWeight="700" fill={on ? 'var(--paper)' : 'var(--ink)'}>{s.ja}</text>
                <text x={p.x + 12} y={p.y + 42} fontSize="10.5" fill={on ? 'var(--paper)' : 'var(--muted)'}>{s.department}</text>
                <line x1={p.x + 12} x2={p.x + BW - 12} y1={p.y + 52} y2={p.y + 52} stroke={on ? 'var(--paper)' : 'var(--line)'} opacity={0.6} />
                {s.systems.slice(0, 4).map((id: string, k: number) => (
                  <text key={id} x={p.x + 12} y={p.y + 72 + k * 18} fontSize="11.5" fill={on ? 'var(--paper)' : 'var(--accent)'}>・{clip(shortName(getEntry(id)), 9)}</text>
                ))}
              </g>
            );
          })}
          {support.length > 0 && <text x={pos[support[0].id].x} y={yS - 10} fontSize="11" fill="var(--muted)">すべての業務を「人」が支える（人件費は会計へ）</text>}
        </svg>
      </div>

      {stage && (
        <div className="panel">
          <h3 style={{ marginBottom: 4 }}>{stage.ja}<span className="small muted">　{stage.department} ／ {bfLabel(stage.function)}</span></h3>
          <p style={{ marginBottom: 8 }}>{stage.work}。次の工程へ渡すもの：<b>{stage.data_out}</b></p>
          <div className="chips">{stage.systems.map((id: string) => <Link key={id} className="chip" href={`/systems/${id}/`}>{getEntry(id)?.names.ja}</Link>)}</div>
        </div>
      )}
    </>
  );
}
