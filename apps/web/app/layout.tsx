// ========================================================================
// IT Systems Atlas OSS版
// 製作：合同会社CODEAID
// Copyright (c) 2026 合同会社CODEAID
// ライセンス：Apache License 2.0（LICENSE を参照）
// SPDX-License-Identifier: Apache-2.0
// ファイル：apps/web/app/layout.tsx
// 説明：全ページ共通の枠（ヘッダー・ナビゲーション・フッター）
// 履歴：
//   2026-11-16  v1.0.0  初版
// ========================================================================
import './globals.css';
import Link from 'next/link';
import { SITE, withBase } from '@/lib/site';
import { META } from '@/lib/atlas';
import SiteNav from '@/components/SiteNav';

export const metadata = { title: { default: SITE.name, template: `%s｜${SITE.name}` }, description: SITE.description };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <a className="skip" href="#main">本文へ移動</a>
        <header className="site-header">
          <div className="wrap">
            <Link href="/" className="brand"><span className="brand-mark" aria-hidden><i /><i /><i /></span>{SITE.name}</Link>
            <SiteNav />
          </div>
        </header>
        <main id="main">{children}</main>
        <footer className="site-footer">
          <div className="wrap">
            <div className="foot-cols">
              <div>
                <span className="label">{SITE.name} v{META.version}</span>
                <p>ITシステムを「構造化・図示・分析」して理解するための教材アトラス。掲載内容は概要レベルの教育用情報で、誤りを含む可能性があります。</p>
              </div>
              <div>
                <h2>このサイト</h2>
                <ul>
                  <li><Link href="/about/">このサイトについて</Link></li>
                  <li><a href={withBase('/opendata/atlas.json')}>オープンデータ（JSON）</a>・<a href={withBase('/opendata/system_types.csv')}>CSV</a></li>
                </ul>
              </div>
            </div>
            <div className="legal"><span>文章・データ：CC BY 4.0</span><span>ソースコード：Apache License 2.0</span></div>
          </div>
        </footer>
      </body>
    </html>
  );
}
