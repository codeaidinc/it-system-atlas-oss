// ========================================================================
// IT Systems Atlas OSS版
// 製作：合同会社CODEAID
// Copyright (c) 2026 合同会社CODEAID
// ライセンス：Apache License 2.0（LICENSE を参照）
// SPDX-License-Identifier: Apache-2.0
// ファイル：apps/web/lib/series.tsx
// 説明：レーダー図の系列の色と線の形
// 履歴：
//   2026-11-16  v1.0.0  初版
// ========================================================================
/** 比較の系列。色相を増やさず、色（コバルト・インク・補足色）と線の形で区別する */
export const SERIES = [
  { stroke: 'var(--cobalt)', dash: undefined as string | undefined, name: '実線（コバルト）' },
  { stroke: 'var(--ink)', dash: '7 4', name: '破線（インク）' },
  { stroke: 'var(--cobalt)', dash: '2 3', name: '点線（コバルト）' },
  { stroke: 'var(--muted)', dash: '10 3 2 3', name: '一点鎖線（灰）' },
];

/** 凡例・表の見出しに置く線の見本 */
export function SeriesKey({ k, width = 28 }: { k: number; width?: number }) {
  const s = SERIES[k % SERIES.length];
  return (
    <svg className="series-key" width={width} height={10} aria-hidden>
      <line x1={1} y1={5} x2={width - 1} y2={5} stroke={s.stroke} strokeWidth={2.5} strokeDasharray={s.dash} />
    </svg>
  );
}
