// ========================================================================
// IT Systems Atlas OSS版
// 製作：合同会社CODEAID
// Copyright (c) 2026 合同会社CODEAID
// ライセンス：Apache License 2.0（LICENSE を参照）
// SPDX-License-Identifier: Apache-2.0
// ファイル：apps/web/components/Radar.tsx
// 説明：部品：8つの評価軸のレーダー図
// 履歴：
//   2026-11-16  v1.0.0  初版
// ========================================================================
import { AXES } from '@/lib/atlas';
import { SERIES, SeriesKey } from '@/lib/series';

type Series = { label: string; values: number[] };

/** 8軸のレーダー図（1〜5段階）。複数系列は線の形で区別する（色相を増やさない） */
export default function Radar({ series, size = 300 }: { series: Series[]; size?: number }) {
  const n = AXES.length, cx = size / 2, cy = size / 2, R = size / 2 - 72;
  const pt = (i: number, v: number) => {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
    return [cx + (R * v) / 5 * Math.cos(a), cy + (R * v) / 5 * Math.sin(a)];
  };
  const single = series.length === 1;
  return (
    <figure>
      <svg viewBox={`0 0 ${size} ${size}`} width="100%" style={{ maxWidth: size, display: 'block', margin: '0 auto' }} role="img"
        aria-label={`8つの評価軸のレーダー図：${series.map((s) => `${s.label}（${AXES.map((a: any, i: number) => `${a.ja} ${s.values[i]}`).join('、')}）`).join('／')}`}>
        {[1, 2, 3, 4, 5].map((r) => (
          <polygon key={r} points={AXES.map((_, i) => pt(i, r).join(',')).join(' ')} fill="none" stroke="var(--line)" strokeWidth={r === 5 ? 1.2 : 0.7} />
        ))}
        {AXES.map((ax, i) => {
          const [x, y] = pt(i, 5.7);
          const [lx, ly] = pt(i, 5);
          return (
            <g key={ax.id}>
              <line x1={cx} y1={cy} x2={lx} y2={ly} stroke="var(--line)" strokeWidth={0.7} />
              <text x={x} y={y} fontSize="10.5" textAnchor={Math.abs(x - cx) < 4 ? 'middle' : x > cx ? 'start' : 'end'} dominantBaseline="middle" fill="var(--muted)">{ax.ja.replace('（停止影響）', '')}</text>
            </g>
          );
        })}
        {series.map((s, k) => {
          const st = SERIES[k % SERIES.length];
          return (
            <polygon key={k} points={s.values.map((v, i) => pt(i, v).join(',')).join(' ')}
              fill={single ? 'var(--cobalt)' : 'none'} fillOpacity={single ? 0.12 : 0} stroke={st.stroke} strokeWidth={2.2} strokeDasharray={st.dash} strokeLinejoin="round" />
          );
        })}
      </svg>
      {series.length > 1 && (
        <figcaption className="legend">{series.map((s, k) => <span key={k}><SeriesKey k={k} />{s.label}</span>)}</figcaption>
      )}
    </figure>
  );
}
