// ========================================================================
// IT Systems Atlas OSS版
// 製作：合同会社CODEAID
// Copyright (c) 2026 合同会社CODEAID
// ライセンス：Apache License 2.0（LICENSE を参照）
// SPDX-License-Identifier: Apache-2.0
// ファイル：apps/web/app/page.tsx
// 説明：トップページ（検索の入口、収録内容、入口の一覧、地図の一覧）
// 履歴：
//   2026-11-16  v1.0.0  初版
// ========================================================================
import Link from 'next/link';
import { SITE, withBase } from '@/lib/site';
import { SYSTEM_TYPES, VIEWS, getEntry, domains, levelsDesc, AXES } from '@/lib/atlas';
import SystemCard from '@/components/SystemCard';

const PICKS = ['st-messaging-app', 'st-core-banking', 'st-erp', 'st-train-operation', 'st-electronic-medical-record', 'st-resident-registry'];

const ENTRIES = [
  { href: '/maps/business/', title: '企業の仕事から探す', text: '注文から決算まで、企業の仕事の流れと、なぜERPが必要になったかを知る。' },
  { href: '/maps/world/', title: '領域から探す', text: '暮らし、金融、医療、行政、防災…12の領域にどんなシステムがあるかを見渡す。' },
  { href: '/maps/scale/', title: '規模・リスクから探す', text: '作るのにどれだけかかり、何人が使い、止まると何が起きるのかを比べる。' },
  { href: '/maps/architecture/', title: '統合階層から探す', text: 'アプリから社会基盤まで、システムがどう積み重なり、つながっているかを見る。' },
];

const pad = (n: number) => String(n).padStart(2, '0');

export default function Home() {
  const ci = SYSTEM_TYPES.filter((e) => e.critical_infrastructure).length;
  const edu = SYSTEM_TYPES.filter((e) => e.learning).length;
  const nDomains = domains().filter((d: any) => d.id !== 'D00').length;
  const picks = PICKS.map((id) => getEntry(id)).filter(Boolean);
  return (
    <>
      <section className="hero" aria-labelledby="h-hero">
        <div className="wrap hero-inner">
          <div className="hero-copy">
            <span className="label">{SITE.name} — 教育用の公開アトラス</span>
            <h1 id="h-hero">世界には、<br />どんなITシステムが<br />あるのか。</h1>
            <p className="lead">{SITE.description}</p>
            <form className="search" action={withBase('/systems/')} method="get" role="search">
              <input name="q" aria-label="システムを検索" placeholder="銀行、ERP、POS、SNS、鉄道…" />
              <button className="btn" type="submit">探す</button>
            </form>
            <div className="examples"><span>例</span>
              {['銀行', '予約', '工場', '自治体', 'クラウド', '決済'].map((w) => <a key={w} href={withBase(`/systems/?q=${encodeURIComponent(w)}`)}>{w}</a>)}
            </div>
          </div>
        </div>
      </section>

    <div className="wrap">
      <dl className="facts facts-band" aria-label="収録内容">
        <div><dt>{SYSTEM_TYPES.length}</dt><dd>システムの種類（教材カード {edu}）</dd></div>
        <div><dt>{nDomains}</dt><dd>教育用の領域（D01〜D{pad(nDomains)}）</dd></div>
        <div><dt>{VIEWS.length}</dt><dd>構造を見る地図</dd></div>
        <div><dt>{ci}</dt><dd>重要インフラに関わる種類</dd></div>
        <div><dt>{levelsDesc().length}</dt><dd>統合階層の段階（L0〜L5）</dd></div>
        <div><dt>{AXES.length}</dt><dd>評価軸</dd></div>
      </dl>

      <section className="section" aria-labelledby="h-entry">
        <div className="section-head"><span className="idx">01</span><h2 id="h-entry">入口を選ぶ</h2><p>企業の仕事から入るか、領域・規模・階層から入るか。学ぶ目的に合わせて入口を選びます。</p></div>
        <ol className="register">
          {ENTRIES.map((x, i) => (
            <li key={x.href}><Link className="row" href={x.href}><span className="idx">{pad(i + 1)}</span><h3>{x.title}</h3><p>{x.text}</p><span className="go" aria-hidden>→</span></Link></li>
          ))}
        </ol>
      </section>

      {picks.length > 0 && (
      <section className="section" aria-labelledby="h-picks">
        <div className="section-head"><span className="idx">02</span><h2 id="h-picks">まずはここから</h2><p>暮らし・企業・社会の、代表的なシステム。</p></div>
        <div className="grid three">{picks.map((e) => <SystemCard key={e.id} e={e} />)}</div>
        <p className="small"><Link href="/systems/">{SYSTEM_TYPES.length}種類のシステムをすべて見る →</Link></p>
      </section>
      )}

      <section className="section" aria-labelledby="h-maps">
        <div className="section-head"><span className="idx">{picks.length > 0 ? '03' : '02'}</span><h2 id="h-maps">{VIEWS.length}つの地図</h2><p>同じシステムを、場所・仕事・階層・規模・時間の見方で構造化します。</p></div>
        <ol className="register two">
          {VIEWS.map((v) => (
            <li key={v.id}><Link className="row" href={`/maps/${v.id}/`}><span className="idx">{pad(v.order)}</span><h3>{v.title.ja}</h3><span className="go" aria-hidden>→</span><p>{v.question.ja}</p></Link></li>
          ))}
        </ol>
      </section>
    </div>
    </>
  );
}
