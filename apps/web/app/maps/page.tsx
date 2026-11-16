// ========================================================================
// IT Systems Atlas OSS版
// 製作：合同会社CODEAID
// Copyright (c) 2026 合同会社CODEAID
// ライセンス：Apache License 2.0（LICENSE を参照）
// SPDX-License-Identifier: Apache-2.0
// ファイル：apps/web/app/maps/page.tsx
// 説明：地図の一覧のページ
// 履歴：
//   2026-11-16  v1.0.0  初版
// ========================================================================
import Link from 'next/link';
import { VIEWS } from '@/lib/atlas';

export const metadata = { title: '地図' };

const pad = (n: number) => String(n).padStart(2, '0');

export default function Maps() {
  return (
    <div className="wrap">
      <div className="detail-head">
        <span className="label">Maps</span>
        <h1 style={{ marginTop: 10 }}>地図</h1>
        <p className="summary">同じシステムのデータを、異なる視点から見渡す地図です。どの地図からでも、同じシステムのカードにたどり着けます。</p>
      </div>
      <section className="section" style={{ paddingTop: 32 }}>
        <ol className="register">
          {VIEWS.map((v) => (
            <li key={v.id}><Link className="row" href={`/maps/${v.id}/`}><span className="idx">{pad(v.order)}</span><h3>{v.title.ja}</h3><p>{v.question.ja}</p><span className="go" aria-hidden>→</span></Link></li>
          ))}
        </ol>
      </section>
    </div>
  );
}
