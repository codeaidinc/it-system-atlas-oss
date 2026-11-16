// ========================================================================
// IT Systems Atlas OSS版
// 製作：合同会社CODEAID
// Copyright (c) 2026 合同会社CODEAID
// ライセンス：Apache License 2.0（LICENSE を参照）
// SPDX-License-Identifier: Apache-2.0
// ファイル：apps/web/components/ArchitectureMap.tsx
// 説明：部品：統合階層地図（選んだシステムとつながるシステムを強調する）
// 履歴：
//   2026-11-16  v1.0.0  初版
// ========================================================================
'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import { SYSTEM_TYPES, levelsDesc, neighborhood, getEntry, groupedRelations } from '@/lib/atlas';
import { LevelMeter } from './Level';

const START = 'st-messaging-app';

export default function ArchitectureMap() {
  const [sel, setSel] = useState<string>('st-internet-banking');
  const dist = useMemo(() => (sel ? neighborhood(sel, 2) : new Map()), [sel]);
  const e = sel ? getEntry(sel) : null;
  const rels = e ? groupedRelations(e).flatMap(([t, ids]) => ids.map((id) => ({ t, id }))) : [];
  return (
    <>
      <div className="panel">
        {e ? (
          <>
            <b>{e.names.ja}</b> を選択中 — 直接つながるシステムを<b>太字</b>、その先を枠線で表示しています。
            <ul className="small" style={{ margin: '8px 0 0' }}>{rels.map((r, i) => <li key={i}>{r.t}：<button className="chip" onClick={() => setSel(r.id)}>{getEntry(r.id)?.names.ja}</button></li>)}</ul>
            {!rels.length && <p className="small muted">登録された関係はまだありません。</p>}
            <p className="small" style={{ marginTop: 8 }}><Link href={`/systems/${e.id}/`}>詳しく見る →</Link>　<button className="chip" onClick={() => setSel('')}>選択を解除</button></p>
          </>
        ) : <span>システムを選ぶと、つながっているシステムが浮かび上がります。まずは「<button className="chip" onClick={() => setSel(START)}>メッセージングアプリ</button>」などを選んでみてください。</span>}
      </div>
      <div style={{ marginTop: 20 }}>
        {levelsDesc().map((l: any) => (
          <div key={l.id} className="layer-band">
            <div className="lname"><LevelMeter level={l.id} /><small>{l.desc}</small></div>
            <div className="chips">
              {SYSTEM_TYPES.filter((x) => x.level.primary === l.id).map((x) => {
                const d = dist.get(x.id);
                const cls = !sel ? '' : x.id === sel ? 'sel' : d === 1 ? 'd1' : d === 2 ? 'd2' : 'dim';
                return <button key={x.id} className={`chip ${cls}`} onClick={() => setSel(x.id)} aria-pressed={x.id === sel}>{x.names.ja}</button>;
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
