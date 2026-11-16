// ========================================================================
// IT Systems Atlas OSS版
// 製作：合同会社CODEAID
// Copyright (c) 2026 合同会社CODEAID
// ライセンス：Apache License 2.0（LICENSE を参照）
// SPDX-License-Identifier: Apache-2.0
// ファイル：apps/web/app/maps/lifecycle/page.tsx
// 説明：地図06「ライフサイクル地図」のページ
// 履歴：
//   2026-11-16  v1.0.0  初版
// ========================================================================
import Link from 'next/link';
import LifecycleMap from '@/components/LifecycleMap';
import { SYSTEM_TYPES } from '@/lib/atlas';

export const metadata = { title: 'ライフサイクル地図' };

export default function Page() {
  const dist = [1, 2, 3, 4, 5].map((v) => SYSTEM_TYPES.filter((e) => e.axes.longevity === v).length);
  return (
    <div className="wrap">
      <div className="detail-head">
        <div className="crumbs"><Link href="/maps/">地図</Link> ／ 06</div>
        <h1>ライフサイクル地図</h1>
        <p className="summary">ITシステムは「作ったら終わり」ではありません。企画から刷新・廃棄まで、8つの段階をくり返しながら、何年、何十年と業務を支えます。段階をクリックすると、その段階の活動・成果物・担い手が分かります。</p>
        <div className="question">問い：開発（構築）にかかる期間と、運用・保守が続く期間を比べるとどうなるか</div>
      </div>
      <LifecycleMap />
      <h2>アトラスに登録されたシステムの「継続期間」</h2>
      <table className="refs"><tbody>{dist.map((n, i) => (
        <tr key={i}><td style={{ width: '16em' }}>継続期間 {i + 1}（{['数か月〜数年', '数年', '10年前後', '10〜20年', '数十年'][i]}）</td><td style={{ width: '4em' }}>{n}</td>
          <td><div className="hbar"><i style={{ width: `${(n / Math.max(...dist)) * 100}%` }} /></div></td></tr>
      ))}</tbody></table>
      <p className="note">実際には、運用しながら改善や次の企画が始まり、段階は重なりながらくり返されます。ウォーターフォール開発だけを表す一方向の工程図ではありません。継続期間は編集部の目安です。</p>
    </div>
  );
}
