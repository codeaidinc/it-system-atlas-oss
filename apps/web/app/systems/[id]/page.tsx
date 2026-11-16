// ========================================================================
// IT System Atlas OSS版
// 製作：合同会社CODEAID
// Copyright (c) 2026 合同会社CODEAID
// ライセンス：Apache License 2.0（LICENSE を参照）
// SPDX-License-Identifier: Apache-2.0
// ファイル：apps/web/app/systems/[id]/page.tsx
// 説明：システムの種類のカードの詳しいページ（基本情報、構造、評価軸、規模、関係、出典）
// 履歴：
//   2026-11-16  v1.0.0  初版
// ========================================================================
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SITE } from '@/lib/site';
import {
  SYSTEM_TYPES, DERIVED, getEntry, industryLabel, bfLabel, categoryLabel, ciLabel, groupedRelations,
  measureLabel, evidenceLabel, evidenceLongLabel, formatValue,
  staticParams,
} from '@/lib/atlas';
import { StatusBadge, LevelTag, DomainTag } from '@/components/Badges';
import ScaleBars from '@/components/ScaleBars';
import Radar from '@/components/Radar';
import { AXES, axisValues, scopeLabel, roleLabel, levelLabel, FLOWS, domainLabel } from '@/lib/atlas';
import { placementNote, axesNote } from '@/lib/unconfirmed.mjs';

export function generateStaticParams() {
  return staticParams(SYSTEM_TYPES);
}
export function generateMetadata({ params }: any) {
  const e = getEntry(params.id);
  return e ? { title: e.names.ja, description: e.summary.ja } : {};
}

const Name = ({ id }: { id: string }) => {
  const t = getEntry(id);
  if (!t) return <span>{id}</span>;
  return <Link href={`/systems/${id}/`}>{t.names.ja}</Link>;
};

export default function SystemDetail({ params }: any) {
  const e = getEntry(params.id);
  if (!e || e.type !== 'system_type') notFound();
  const groups = groupedRelations(e);
  const stages = (DERIVED.flowStagesBySystem?.[e.id] || []) as any[];
  const vals = axisValues(e);
  const refs = e.scale.references || [];
  return (
    <div className="wrap">
      <div className="detail-head">
        <div className="crumbs"><Link href="/systems/">システム</Link> ／ <Link href={`/systems/?domain=${e.domain}`}>{e.domain} {domainLabel(e.domain)}</Link> ／ <span className="mono">{e.id}</span></div>
        <span className="label">System type{e.learning ? ' · 教材カード' : ''}</span>
        <h1 style={{ marginTop: 10 }}>{e.names.ja}</h1>
        <div className="en">{e.names.en}{e.aliases?.length ? `　別名：${e.aliases.join('、')}` : ''}</div>
        <div className="tags" style={{ margin: '10px 0 16px' }}>
          <LevelTag level={e.level.primary} />
          <DomainTag domain={e.domain} />
          <span className="tag">利用範囲：{scopeLabel(e.scope)}</span>
          <span className="tag">{categoryLabel(e.category)}</span>
          {e.critical_infrastructure && <span className="tag ci">重要インフラ：{e.critical_infrastructure.sectors.map(ciLabel).join('・')}</span>}
          <StatusBadge status={e.editorial.status} />
          {placementNote(e) && <span className="tag pending">{placementNote(e)}</span>}
        </div>
        <p className="summary">{e.summary.ja}</p>
        {e.learning?.questions?.length > 0 && <div className="question">問い：{e.learning.questions[0]}</div>}
      </div>

      <div className="cols">
        <div>
          <h2>基本情報</h2>
          <table className="kv"><tbody>
            <tr><th>統合階層</th><td>{e.level.primary} {levelLabel(e.level.primary)}{e.level.related?.length ? `（関係する階層：${e.level.related.map((l: string) => `${l} ${levelLabel(l)}`).join('、')}）` : ''}</td></tr>
            <tr><th>産業</th><td>{e.industry.map(industryLabel).join('、')}</td></tr>
            {e.business_function?.length > 0 && <tr><th>支える業務</th><td>{e.business_function.map(bfLabel).join('、')}</td></tr>}
            <tr><th>種類</th><td>{categoryLabel(e.category)}</td></tr>
            <tr><th>主な利用者</th><td>{e.users.ja}</td></tr>
            <tr><th>目的</th><td>{e.purpose.ja}</td></tr>
            {e.lifecycle_note && <tr><th>ライフサイクル</th><td>{e.lifecycle_note.ja}</td></tr>}
            {e.functions?.length > 0 && <tr><th>主な機能</th><td>{e.functions.join('、')}</td></tr>}
            {e.events?.length > 0 && <tr><th>きっかけとなる出来事</th><td>{e.events.join('、')}</td></tr>}
            {e.qualities?.length > 0 && <tr><th>求められる品質</th><td>{e.qualities.join('、')}</td></tr>}
            {e.outage_impact && <tr><th>止まると</th><td>{e.outage_impact.ja}</td></tr>}
            {e.industry_roles?.length > 0 && <tr><th>関わる企業の種類</th><td>{e.industry_roles.map(roleLabel).join('、')}</td></tr>}
          </tbody></table>

          {e.structure && (<>
            <h2>構造の概要</h2>
            <table className="kv"><tbody>
              {[['entry', '入口（利用者が触れる所）'], ['processing', '業務処理'], ['data', '主なデータ'], ['external', '外部とのつながり'], ['foundation', '基盤']].map(([k, label]) => e.structure[k] && <tr key={k}><th>{label}</th><td>{e.structure[k]}</td></tr>)}
            </tbody></table>
          </>)}

          {(stages.length > 0 || e.learning?.goal) && (<>
            <h2>学習でたどる</h2>
            {stages.length > 0 && <p>企業業務地図：{stages.map((s: any, i: number) => <span key={i}>{i ? '、' : ''}<Link href="/maps/business/">{s.ja}</Link></span>)}</p>}
            {e.learning?.goal && <p className="small muted">学習目標：{e.learning.goal}</p>}
          </>)}

          <h2>規模の参考値（公開事例）</h2>
          {refs.length ? (
            <div className="table-scroll"><table className="refs">
              <thead><tr><th>項目</th><th>値</th><th>対象</th><th>時点</th><th>根拠</th></tr></thead>
              <tbody>{refs.map((r: any, i: number) => (
                <tr key={i}>
                  <td>{measureLabel(r.measure)}</td>
                  <td><b>{formatValue(r)}</b></td>
                  <td>{r.subject.ja}<div className="small muted">{r.scope.ja}</div></td>
                  <td>{String(r.as_of)}</td>
                  <td><span className={`ev ${r.evidence_type}`} title={evidenceLongLabel(r.evidence_type)}>{evidenceLabel(r.evidence_type)}</span><div className="small"><a href={r.source.url} rel="noopener noreferrer">{r.source.title}</a>{r.source.publisher ? `（${r.source.publisher}）` : ''}</div></td>
                </tr>
              ))}</tbody>
            </table></div>
          ) : <p className="muted small">確認できる公開事例の数値はまだ登録されていません。出典のない数値は掲載しません。</p>}

          {groups.length > 0 && (<>
            <h2>関係するシステム</h2>
            <table className="kv"><tbody>{groups.map(([label, ids]) => (
              <tr key={label}><th>{label}</th><td>{ids.map((id, i) => <span key={id}>{i ? '、' : ''}<Name id={id} /></span>)}</td></tr>
            ))}</tbody></table>
          </>)}

        </div>

        <aside>
          <h2>8つの評価軸</h2>
          <div className="scale-box">
            <Radar series={[{ label: e.names.ja, values: vals }]} size={300} />
            <dl className="axes-list">
              {AXES.map((ax: any, i: number) => (
                <div key={ax.id}><dt>{ax.ja}</dt><dd><span className="meter" aria-hidden>{[1, 2, 3, 4, 5].map((k) => <i key={k} className={k <= vals[i] ? 'on' : ''} />)}</span><span className="v">{vals[i]}/5</span></dd></div>
              ))}
            </dl>
            <div className="note"><span className="ev editorial_estimate">目安</span> {e.axes?.basis === 'editor' ? '編集部による種類としての典型的な評価です。' : '規則による初期値です。'}利用規模・開発規模は下の区分から算出しています。{axesNote(e) && <><br /><span className="tag pending">{axesNote(e)}</span></>}</div>
          </div>
          <h2>規模の目安</h2>
          <ScaleBars typical={e.scale.typical} />
          <h2>出典・編集情報</h2>
          {e.sources?.length > 0 && <ul className="small">{e.sources.map((s: any, i: number) => <li key={i}><a href={s.url} rel="noopener noreferrer">{s.title}</a>（{s.accessed}確認）</li>)}</ul>}
          <p className="small muted">編集状態：{<StatusBadge status={e.editorial.status} />}<br />作成 {e.editorial.created} ／ 更新 {e.editorial.updated}</p>
        </aside>
      </div>
    </div>
  );
}
