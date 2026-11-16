// ========================================================================
// IT Systems Atlas OSS版
// 製作：合同会社CODEAID
// Copyright (c) 2026 合同会社CODEAID
// ライセンス：Apache License 2.0（LICENSE を参照）
// SPDX-License-Identifier: Apache-2.0
// ファイル：apps/web/app/maps/world/page.tsx
// 説明：地図01「ITシステム世界地図」のページ
// 履歴：
//   2026-11-16  v1.0.0  初版
// ========================================================================
import Link from 'next/link';
import { SYSTEM_TYPES, domains, levelsDesc } from '@/lib/atlas';
import { LevelMark } from '@/components/Level';

export const metadata = { title: 'ITシステム世界地図' };

export default function WorldMap() {
  const lv = levelsDesc();
  return (
    <div className="wrap">
      <div className="detail-head">
        <div className="crumbs"><Link href="/maps/">地図</Link> ／ 01</div>
        <h1>ITシステム世界地図</h1>
        <p className="summary">ITは情報産業の中だけにあるのではなく、暮らし・企業・社会のあらゆる場所にあります。12の領域ごとに、どんなシステムがあるかを並べました。左の記号は統合階層（責任範囲の広さ、L5 ほど濃い）です。</p>
        <div className="question">問い：あなたの1日に関わるITシステムを、この地図から10個探してみよう</div>
        <div className="legend">{lv.map((l: any) => <span key={l.id}><LevelMark level={l.id} />{l.ja}</span>)}<span><span className="chip ci" style={{ fontSize: '.7rem' }}>左の太線</span> 重要インフラ</span></div>
      </div>
      <div className="tiles">
        {domains().map((d: any) => {
          const items = SYSTEM_TYPES.filter((e) => e.domain === d.id).sort((a, b) => b.level.primary.localeCompare(a.level.primary));
          return (
            <section key={d.id} className={`tile ${d.id === 'D00' ? 'base' : ''}`}>
              <h3><span>{d.id} {d.ja}</span><span className="small muted">{items.length}</span></h3>
              <div className="ex">{d.id === 'D00' ? 'すべての領域を下から支える共通の技術' : `例：${d.examples}`}</div>
              <div className="chips">
                {items.map((e: any) => (
                  <Link key={e.id} href={`/systems/${e.id}/`} className={`chip ${e.critical_infrastructure ? 'ci' : ''}`} title={`${e.level.primary}`}>
                    <LevelMark level={e.level.primary} />{e.names.ja}
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
      <p className="note">12領域は学習の入口となる教育用の分類で、すべてのシステムを排他的に分けるものではありません。各システムは主な領域に1つだけ表示しています。</p>
    </div>
  );
}
