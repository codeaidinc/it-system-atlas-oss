// ========================================================================
// IT System Atlas OSS版
// 製作：合同会社CODEAID
// Copyright (c) 2026 合同会社CODEAID
// ライセンス：Apache License 2.0（LICENSE を参照）
// SPDX-License-Identifier: Apache-2.0
// ファイル：apps/web/components/SiteNav.tsx
// 説明：部品：ヘッダーのナビゲーション（狭い画面ではメニューで開閉）
// 履歴：
//   2026-11-16  v1.0.0  初版
// ========================================================================
'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';

const ITEMS = [
  { href: '/systems/', label: 'システムを探す', match: ['/systems/'] },
  { href: '/maps/', label: '地図', match: ['/maps/'] },
  { href: '/about/', label: 'このサイトについて', match: ['/about/'] },
];

/** ヘッダーのナビゲーション：現在地は aria-current、狭い画面はメニューボタンで開閉し Escape で閉じる */
export default function SiteNav() {
  const path = usePathname() || '/';
  const [open, setOpen] = useState(false);
  const btn = useRef<HTMLButtonElement>(null);
  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') { setOpen(false); btn.current?.focus(); } };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);
  const current = (m: string[]) => m.some((p) => path.startsWith(p));
  return (
    <>
      <button ref={btn} className="menu-btn" type="button" aria-expanded={open} aria-controls="site-nav" onClick={() => setOpen(!open)}>{open ? '閉じる' : 'メニュー'}</button>
      <nav id="site-nav" className={`nav ${open ? 'open' : ''}`} aria-label="メインメニュー">
        {ITEMS.map((it) => <Link key={it.href} href={it.href} aria-current={current(it.match) ? 'page' : undefined}>{it.label}</Link>)}
      </nav>
    </>
  );
}
