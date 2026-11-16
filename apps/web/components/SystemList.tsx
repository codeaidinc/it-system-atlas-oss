// ========================================================================
// IT System Atlas OSS版
// 製作：合同会社CODEAID
// Copyright (c) 2026 合同会社CODEAID
// ライセンス：Apache License 2.0（LICENSE を参照）
// SPDX-License-Identifier: Apache-2.0
// ファイル：apps/web/components/SystemList.tsx
// 説明：部品：システムの種類の一覧（キーワードと絞り込み）
// 履歴：
//   2026-11-16  v1.0.0  初版
// ========================================================================
'use client';
import { useEffect, useMemo, useState } from 'react';
import SystemCard from './SystemCard';
import { SYSTEM_TYPES, TAX, levelsDesc, domains, norm, searchText, PCLASSES, pIndex } from '@/lib/atlas';

const INDEX = SYSTEM_TYPES.map((e) => ({ e, t: searchText(e) }));

export default function SystemList() {
  const [q, setQ] = useState('');
  const [ind, setInd] = useState('');
  const [cat, setCat] = useState('');
  const [layer, setLayer] = useState('');
  const [pc, setPc] = useState('');
  const [ci, setCi] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    setQ(p.get('q') || '');
    setInd(p.get('domain') || '');
    setCat(p.get('category') || '');
    setLayer(p.get('level') || '');
    setPc(p.get('scale') || '');
    setCi(p.get('ci') === '1');
  }, []);

  const results = useMemo(() => {
    const terms = norm(q).length ? q.split(/\s+/).map(norm).filter(Boolean) : [];
    return INDEX.filter(({ e, t }) => {
      if (terms.some((x) => !t.includes(x))) return false;
      if (ind && e.domain !== ind) return false;
      if (cat && e.category !== cat) return false;
      if (layer && e.level.primary !== layer) return false;
      if (ci && !e.critical_infrastructure) return false;
      if (pc) {
        const k = pIndex(pc);
        if (k < pIndex(e.scale.typical.project_class.min) || k > pIndex(e.scale.typical.project_class.max)) return false;
      }
      return true;
    }).map((x) => x.e);
  }, [q, ind, cat, layer, pc, ci]);

  return (
    <>
      <div className="filters" role="search">
        <input aria-label="キーワード" placeholder="キーワード（例：銀行、ERP、予約、アプリ）" value={q} onChange={(e) => setQ(e.target.value)} />
        <select aria-label="領域" value={ind} onChange={(e) => setInd(e.target.value)}>
          <option value="">領域：すべて</option>
          {domains().map((d: any) => <option key={d.id} value={d.id}>{d.id} {d.ja}</option>)}
        </select>
        <select aria-label="種類" value={cat} onChange={(e) => setCat(e.target.value)}>
          <option value="">種類：すべて</option>
          {TAX.categories.map((c: any) => <option key={c.id} value={c.id}>{c.ja}</option>)}
        </select>
        <select aria-label="統合階層" value={layer} onChange={(e) => setLayer(e.target.value)}>
          <option value="">統合階層：すべて</option>
          {levelsDesc().map((l: any) => <option key={l.id} value={l.id}>{l.id} {l.ja}</option>)}
        </select>
        <select aria-label="開発規模" value={pc} onChange={(e) => setPc(e.target.value)}>
          <option value="">開発規模：すべて</option>
          {PCLASSES.map((c: any) => <option key={c.id} value={c.id}>{c.id}（{c.ja}）</option>)}
        </select>
        <label className="small" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input type="checkbox" checked={ci} onChange={(e) => setCi(e.target.checked)} /> 重要インフラのみ
        </label>
      </div>
      <div className="count" aria-live="polite">{results.length}件</div>
      <div className="grid">{results.map((e) => <SystemCard key={e.id} e={e} />)}</div>
      {!results.length && <p className="muted">該当するシステムが見つかりません。キーワードや条件を変えてみてください。</p>}
    </>
  );
}
