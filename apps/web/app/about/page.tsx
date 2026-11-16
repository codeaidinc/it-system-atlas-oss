// ========================================================================
// IT Systems Atlas OSS版
// 製作：合同会社CODEAID
// Copyright (c) 2026 合同会社CODEAID
// ライセンス：Apache License 2.0（LICENSE を参照）
// SPDX-License-Identifier: Apache-2.0
// ファイル：apps/web/app/about/page.tsx
// 説明：ページ「このサイトについて」（編集方針、統合階層、評価軸、規模区分、重要インフラ、ライセンス）
// 履歴：
//   2026-11-16  v1.0.0  初版
// ========================================================================
import { SITE } from '@/lib/site';
import { PCLASSES, UCLASSES, pClassText, pClassCost, uClassText, TAX, levelsDesc, AXES } from '@/lib/atlas';
import { LevelMark } from '@/components/Level';

export const metadata = { title: 'このサイトについて' };

export default function About() {
  return (
    <div className="wrap prose">
      <div className="detail-head"><h1>このサイトについて</h1></div>
      <p>{SITE.name}は、世界のアプリケーション、ITサービス、業務システム、社会基盤システムを、概要レベルで体系的に整理して無料公開するオープンソースのアトラスです。高校生・専門学校生・大学生がIT産業の全体像を理解するための教材として、授業でそのまま使えるように作られています。</p>
      <h2 id="editorial-policy">編集方針</h2>
      <ul>
        <li><b>目的</b>：ITシステムの存在・役割・規模・関係を概要レベルで整理し、IT産業の全体像を学ぶための教材です。技術解説サイト、製品比較サイト、求人サイトではありません。</li>
        <li><b>事実の扱い</b>：数値は、出典・対象範囲・時点が確認できたものだけを掲載します。実名の事例は、企業の公式開示・公的機関の資料・主要な報道に限り、出典にない評価や推測は書きません。評価軸と規模の目安は編集部の目安であり、そのことを表示します。</li>
        <li><b>訂正</b>：誤りに気づいたら、リポジトリの Issue または Pull Request で知らせてください。授業で使う場合は、各校で data/ のYAMLを直接直して使えます。</li>
      </ul>
      <p>方針の全文は、リポジトリの編集方針（docs/editorial-policy/EDITORIAL_POLICY.md）にあります。</p>
      <h2>掲載する情報・しない情報</h2>
      <ul>
        <li>掲載する：名称、概要、用途、分野、利用者、規模の目安、関係するシステム、出典</li>
        <li>掲載しない：詳細な業務処理、非公開のシステム構成、設計仕様、セキュリティ上の内部情報、機密情報</li>
      </ul>
      <h2>編集状態</h2>
      <p>各カードの編集状態は「下書き（編集部の確認前）」「確認済み」で表示します。確認済みであっても、すべての専門分野の技術的な正確性を保証するものではありません。授業で使うときは、担当の先生が内容を確かめてください。</p>
      <h2 id="levels">統合階層</h2>
      <p>アプリ・サービス・システムの違いを、責任範囲の広がりとして6段階で示します。規模の序列ではなく、互いに排他的でもありません（1つのサービスが複数の階層にまたがることがあります）。</p>
      <div className="table-scroll"><table className="refs"><thead><tr><th>階層</th><th>名称</th><th>説明</th><th>例</th></tr></thead>
        <tbody>{levelsDesc().map((l: any) => <tr key={l.id}><td><LevelMark level={l.id} /></td><td>{l.ja}</td><td>{l.desc}</td><td>{l.examples}</td></tr>)}</tbody></table></div>
      <h2 id="axes">8つの評価軸</h2>
      <p>システムの大きさや難しさは、画面の数やプログラムの量だけでは測れません。8つの軸を別々に評価します。利用規模・開発規模は下の区分から算出し、残りの6軸は編集部の目安（1〜5段階）です。</p>
      <div className="table-scroll"><table className="refs"><thead><tr><th>軸</th><th>1の目安</th><th>3の目安</th><th>5の目安</th></tr></thead>
        <tbody>{AXES.map((a: any) => <tr key={a.id}><td><b>{a.ja}</b></td><td>{a.anchors[1]}</td><td>{a.anchors[3]}</td><td>{a.anchors[5]}</td></tr>)}</tbody></table></div>
      <h2 id="scale">規模区分について</h2>
      <p>規模は「開発規模（P区分）」と「利用規模（U区分）」の2軸で示します。いずれもアトラス独自の教育用暫定区分で、公的な統一基準ではありません。</p>
      <div className="table-scroll"><table className="refs"><thead><tr><th>区分</th><th>名称</th><th>工数</th><th>金額換算（1人月＝100万円）</th><th>体制例</th></tr></thead>
        <tbody>{PCLASSES.map((c: any) => <tr key={c.id}><td><b>{c.id}</b></td><td>{c.ja}</td><td>{pClassText(c.id)}</td><td>{pClassCost(c.id)}</td><td>{c.team}</td></tr>)}</tbody></table></div>
      <div className="table-scroll" style={{ marginTop: 12 }}><table className="refs"><thead><tr><th>区分</th><th>名称</th><th>利用者数</th><th>例</th></tr></thead>
        <tbody>{UCLASSES.map((c: any) => <tr key={c.id}><td><b>{c.id}</b></td><td>{c.ja}</td><td>{uClassText(c.id)}</td><td>{c.example}</td></tr>)}</tbody></table></div>
      <p className="small muted">{TAX.scale.project_classes.basis_note}</p>
      <p>公開事例の数値は、出典・対象範囲・基準年が確認できたものだけを掲載し、「公表値」「報道値」「統計値」「試算」を区別して表示します。出典のない数値は掲載しません。</p>
      <h2>重要インフラ</h2>
      <p>重要インフラの表示は、政府の「{TAX.ciMeta.source.title}」が定める{TAX.ciSectors.length}分野への対応を示します。開発規模の大小とは別の属性です。</p>
      <h2>ライセンスと参加</h2>
      <p>文章・データはCC BY 4.0、ソースコードはApache License 2.0で公開しています。授業での利用・改変・再配布は自由です（クレジットの表示が必要です）。事例の追加・訂正は、リポジトリへの Pull Request で提案できます。</p>
    </div>
  );
}
