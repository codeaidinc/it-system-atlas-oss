// ========================================================================
// IT Systems Atlas OSS版
// 製作：合同会社CODEAID
// Copyright (c) 2026 合同会社CODEAID
// ライセンス：Apache License 2.0（LICENSE を参照）
// SPDX-License-Identifier: Apache-2.0
// ファイル：apps/web/app/maps/infrastructure/page.tsx
// 説明：地図03「社会基盤地図」のページ
// 履歴：
//   2026-11-16  v1.0.0  初版
// ========================================================================
import Link from 'next/link';
import { SYSTEM_TYPES, CI_SECTORS, TAX, getEntry } from '@/lib/atlas';
import { LevelMark } from '@/components/Level';

export const metadata = { title: '社会基盤地図' };
const COMMON = ['st-power-grid-control', 'st-mobile-network', 'st-public-cloud', 'st-data-center'];

export default function Page() {
  return (
    <div className="wrap">
      <div className="detail-head">
        <div className="crumbs"><Link href="/maps/">地図</Link> ／ 03</div>
        <h1>社会基盤地図</h1>
        <p className="summary">政府は、止まると国民生活や経済に大きな影響が出る分野を「重要インフラ」として{CI_SECTORS.length}分野指定しています。各分野でどんなITシステムが動いているかを並べました。</p>
        <div className="question">問い：すべての重要インフラが共通して頼っているものは何か。それが止まると何が起きるか</div>
      </div>
      <section className="panel" style={{ margin: '24px 0 24px', borderTop: '3px solid var(--ink)' }}>
        <h3>すべての分野が頼る共通の土台</h3>
        <div className="small muted" style={{ marginBottom: 10 }}>電気が止まればシステムは動かず、通信が止まればつながらない。多くの分野が同じクラウドやデータセンターも使っている。</div>
        <div className="chips">{COMMON.map((id) => <Link key={id} className="chip ci" href={`/systems/${id}/`}>{getEntry(id)?.names.ja}</Link>)}</div>
      </section>
      <div className="tiles">
        {CI_SECTORS.map((s: any) => {
          const items = SYSTEM_TYPES.filter((e) => e.critical_infrastructure?.sectors.includes(s.id));
          return (
            <section key={s.id} className="tile">
              <h3><span>{s.ja}</span><span className="small muted">{items.length}</span></h3>
              <div className="chips">
                {items.length ? items.map((e) => <Link key={e.id} className="chip" href={`/systems/${e.id}/`}><LevelMark level={e.level.primary} />{e.names.ja}</Link>)
                  : <span className="small muted">まだ登録されていません（今後追加）</span>}
              </div>
            </section>
          );
        })}
      </div>
      <p className="note">出典：{TAX.ciMeta.source.title}（{TAX.ciMeta.source.publisher}）。分野の指定は行動計画の改訂で変わることがあります。</p>
    </div>
  );
}
