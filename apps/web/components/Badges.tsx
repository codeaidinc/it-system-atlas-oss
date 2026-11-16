// ========================================================================
// IT System Atlas OSS版
// 製作：合同会社CODEAID
// Copyright (c) 2026 合同会社CODEAID
// ライセンス：Apache License 2.0（LICENSE を参照）
// SPDX-License-Identifier: Apache-2.0
// ファイル：apps/web/components/Badges.tsx
// 説明：部品：編集の状態・層・統合階層・領域の札
// 履歴：
//   2026-11-16  v1.0.0  初版
// ========================================================================
import { STATUS_LABEL, layerLabel, domainLabel } from '@/lib/atlas';
import { LevelMeter } from './Level';

export function StatusBadge({ status }: { status: string }) {
  const ok = status === 'reviewed';
  return <span className={`status ${ok ? 'ok' : ''}`}>{STATUS_LABEL[status] ?? status}</span>;
}
export function LayerTag({ layer }: { layer: string }) {
  return <span className="tag">{layerLabel(layer)}</span>;
}
export function LevelTag({ level }: { level: string }) {
  return <LevelMeter level={level} />;
}
export function DomainTag({ domain }: { domain: string }) {
  return <span className="tag"><span className="mono">{domain}</span> {domainLabel(domain)}</span>;
}
