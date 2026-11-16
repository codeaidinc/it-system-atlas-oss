// ========================================================================
// IT Systems Atlas OSS版
// 製作：合同会社CODEAID
// Copyright (c) 2026 合同会社CODEAID
// ライセンス：Apache License 2.0（LICENSE を参照）
// SPDX-License-Identifier: Apache-2.0
// ファイル：apps/web/components/Level.tsx
// 説明：部品：統合階層（L0〜L5）の目盛りと記号
// 履歴：
//   2026-11-16  v1.0.0  初版
// ========================================================================
import { levelLabel } from '@/lib/atlas';

const ORDER: Record<string, number> = { L0: 0, L1: 1, L2: 2, L3: 3, L4: 4, L5: 5 };

/** 統合階層のメーター：L0〜L5 を6マスで表す（下から順に塗る）。色相ではなく量で序列を示す */
export function LevelMeter({ level, short = false }: { level: string; short?: boolean }) {
  const n = ORDER[level] ?? 0;
  const name = levelLabel(level);
  return (
    <span className="lvm" title={`${level} ${name}`}>
      <span className="cells" aria-hidden>{[0, 1, 2, 3, 4, 5].map((i) => <i key={i} className={i <= n ? 'on' : ''} />)}</span>
      <b>{level}</b> {short ? name.replace('・業務サービス', '').replace('システム', '') : name}
    </span>
  );
}

/** 統合階層の小さな記号（地図の中など狭い所） */
export function LevelMark({ level }: { level: string }) {
  return <span className={`lvx ${level}`} title={`${level} ${levelLabel(level)}`}>{level}</span>;
}

/** 重要度（停止影響）1〜5 の記号 */
export function CritMark({ v }: { v: number }) {
  return <span className={`crit c${v}`} title={`重要度 ${v}`}>{v}</span>;
}
