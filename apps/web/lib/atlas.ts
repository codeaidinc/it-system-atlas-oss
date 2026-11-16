// ========================================================================
// IT System Atlas OSS版
// 製作：合同会社CODEAID
// Copyright (c) 2026 合同会社CODEAID
// ライセンス：Apache License 2.0（LICENSE を参照）
// SPDX-License-Identifier: Apache-2.0
// ファイル：apps/web/lib/atlas.ts
// 説明：サイトのデータの読み込みと、表示用の関数（ラベル・規模・評価軸・関係）
// 履歴：
//   2026-11-16  v1.0.0  初版
// ========================================================================
import atlasJson from '../generated/atlas.json';

export type Entry = any;
const atlas: any = atlasJson;

export const META = atlas.meta;
export const TAX = atlas.taxonomy;
export const VIEWS: any[] = atlas.views;
export const ENTRIES: Entry[] = atlas.entries;
export const DERIVED = atlas.derived;

const byId = new Map<string, Entry>(ENTRIES.map((e) => [e.id, e]));
export const getEntry = (id: string) => byId.get(id);
export const ofType = (t: string) => ENTRIES.filter((e) => e.type === t);
export const SYSTEM_TYPES: Entry[] = ofType('system_type').sort((a, b) => a.names.ja.localeCompare(b.names.ja, 'ja'));

const mapOf = (arr: any[]) => new Map(arr.map((x) => [x.id, x]));
const IND = mapOf(TAX.industries);
const BF = mapOf(TAX.businessFunctions);
const CAT = mapOf(TAX.categories);
const LAYER = mapOf(TAX.layers);
const CI = mapOf(TAX.ciSectors);
const LC = mapOf(TAX.lifecycle);
const EV = mapOf(TAX.scale.evidence_types);
const MEASURE = mapOf(TAX.scale.measures);
const REL = mapOf(TAX.relationTypes);

export const industryLabel = (id: string) => IND.get(id)?.ja ?? id;
export const industryTop = (id: string) => (IND.get(id)?.parent ? IND.get(id).parent : id);
export const topIndustries = () => TAX.industries.filter((i: any) => !i.parent);
export const bfLabel = (id: string) => BF.get(id)?.ja ?? id;
export const categoryLabel = (id: string) => CAT.get(id)?.ja ?? id;
export const layerLabel = (id: string) => LAYER.get(id)?.ja ?? id;
export const layers = () => [...TAX.layers].sort((a: any, b: any) => a.order - b.order);
export const ciLabel = (id: string) => CI.get(id)?.ja ?? id;
export const lifecycleLabel = (id: string) => LC.get(id)?.ja ?? id;
export const evidenceLabel = (id: string) => EV.get(id)?.public_label ?? id;
export const evidenceLongLabel = (id: string) => EV.get(id)?.ja ?? id;
export const measureLabel = (id: string) => MEASURE.get(id)?.ja ?? id;
export const relationLabel = (id: string, inverse = false) => (inverse ? REL.get(id)?.in_ja : REL.get(id)?.out_ja) ?? id;

/** カードの関係を「呼び方」ごとにまとめる（双方向・重複を整理） */
export function groupedRelations(e: Entry) {
  const groups = new Map<string, string[]>();
  const add = (label: string, id: string) => {
    if (!groups.has(label)) groups.set(label, []);
    if (!groups.get(label)!.includes(id)) groups.get(label)!.push(id);
  };
  for (const r of e.relations || []) add(relationLabel(r.type), r.target);
  for (const r of (DERIVED.inbound[e.id] || []) as any[]) add(relationLabel(r.type, true), r.source);
  return [...groups.entries()];
}

export const PCLASSES: any[] = TAX.scale.project_classes.items;
export const UCLASSES: any[] = TAX.scale.usage_classes.items;
export const pIndex = (c: string) => PCLASSES.findIndex((x) => x.id === c);
export const uIndex = (c: string) => UCLASSES.findIndex((x) => x.id === c);

export const STATUS_LABEL: Record<string, string> = {
  draft: '下書き（編集部の確認前）',
  reviewed: '確認済み',
  withdrawn: '取り下げ',
};

const JA_UNITS: [number, string][] = [
  [1e12, '兆'],
  [1e8, '億'],
  [1e4, '万'],
];
export function jaNumber(n: number) {
  for (const [v, u] of JA_UNITS) if (n >= v) return `${+(n / v).toFixed(n % v === 0 ? 0 : 1)}${u}`;
  return n.toLocaleString('ja-JP');
}
const UNIT_SUFFIX: Record<string, string> = {
  JPY: '円', USD: 'ドル', person_months: '人月', months: 'か月', years: '年', persons: '人',
  accounts: 'アカウント', transactions_per_day: '件/日', sites: '拠点',
};
export function formatValue(r: any) {
  if (r.value === null || r.value === undefined) return '未公表';
  const n = r.unit === 'USD' || r.unit === 'months' || r.unit === 'years' ? r.value.toLocaleString('ja-JP') : jaNumber(r.value);
  const max = r.value_max ? `〜${jaNumber(r.value_max)}` : '';
  return `${r.approximate ? '約' : ''}${n}${max}${UNIT_SUFFIX[r.unit] ?? r.unit}`;
}
const pRange = (c: string) => PCLASSES[pIndex(c)];
const uRange = (c: string) => UCLASSES[uIndex(c)];
const span = (lo: number, hi: number | null, fmt: (n: number) => string) => (hi ? `${lo ? fmt(lo) : '0'}〜${fmt(hi)}` : `${fmt(lo)}以上`);
const pm = (n: number) => `${n.toLocaleString('ja-JP')}人月`;
const yen = (n: number) => `${jaNumber(n)}円`;
const ppl = (n: number) => `${jaNumber(n)}人`;
export const pClassText = (c: string) => (pRange(c) ? span(pRange(c).effort_pm[0], pRange(c).effort_pm[1], pm) : c);
export const pClassCost = (c: string) => (pRange(c) ? span(pRange(c).cost_jpy[0], pRange(c).cost_jpy[1], yen) : '');
export const uClassText = (c: string) => (uRange(c) ? span(uRange(c).users[0], uRange(c).users[1], ppl) : c);
/** 区分の範囲（min〜max）を実数の範囲で表す */
export const pSpanText = (a: string, b: string) => span(pRange(a).effort_pm[0], pRange(b).effort_pm[1], pm);
export const pSpanCost = (a: string, b: string) => span(pRange(a).cost_jpy[0], pRange(b).cost_jpy[1], yen);
export const uSpanText = (a: string, b: string) => span(uRange(a).users[0], uRange(b).users[1], ppl);

/** 検索用の正規化（全角半角・大文字小文字・記号の揺れを吸収） */
export const norm = (s: string) =>
  String(s || '').normalize('NFKC').toLowerCase().replace(/[\s・\-_/()（）「」]/g, '');

export function searchText(e: Entry) {
  return norm([e.names?.ja, e.names?.en, ...(e.aliases || []), e.summary?.ja, e.users?.ja, e.purpose?.ja].join(' '));
}

/** 関係（双方向）をたどって、指定IDの周辺ノードを返す */
export function neighborhood(id: string, depth = 2) {
  const adj = new Map<string, Set<string>>();
  const link = (a: string, b: string) => {
    if (!adj.has(a)) adj.set(a, new Set());
    adj.get(a)!.add(b);
  };
  for (const e of SYSTEM_TYPES) for (const r of e.relations || []) {
    link(e.id, r.target);
    link(r.target, e.id);
  }
  const dist = new Map<string, number>([[id, 0]]);
  let frontier = [id];
  for (let d = 1; d <= depth; d++) {
    const next: string[] = [];
    for (const n of frontier) for (const m of adj.get(n) || []) if (!dist.has(m)) {
      dist.set(m, d);
      next.push(m);
    }
    frontier = next;
  }
  return dist;
}

/* ---------------- 領域・統合階層・評価軸 ---------------- */
const DOM = mapOf(TAX.domains);
const LV = mapOf(TAX.levels);
const SCOPE = mapOf(TAX.scopes);
const ROLE = mapOf(TAX.industryRoles);
export const domainLabel = (id: string) => DOM.get(id)?.ja ?? id;
export const domains = () => TAX.domains as any[];
export const levelLabel = (id: string) => LV.get(id)?.ja ?? id;
export const levelsDesc = () => [...TAX.levels].sort((a: any, b: any) => b.order - a.order);
export const levelInfo = (id: string) => LV.get(id);
export const scopeLabel = (id: string) => SCOPE.get(id)?.ja ?? id;
export const roleLabel = (id: string) => ROLE.get(id)?.ja ?? id;
export const AXES: any[] = TAX.axes;

export const FLOWS: Entry[] = ofType('business_flow');

/** 8軸の値（1〜5）。利用規模・開発規模は P/U 区分の上限から算出する */
export function axisValues(e: Entry): number[] {
  const t = e.scale.typical;
  const usage = [1, 2, 4, 5][uIndex(t.usage_class.max)] ?? 1;
  const dev = [1, 2, 3, 4, 5, 5][pIndex(t.project_class.max)] ?? 1;
  const a = e.axes || {};
  return [usage, dev, a.technical, a.organization, a.criticality, a.longevity, a.regulation, a.changeability].map((x) => x ?? 0);
}
/** 名前の短縮形。収録されていないシステムを参照している場合は「（未公開）」 */
export const shortName = (e: Entry) => (e?.names?.ja ? e.names.ja.split('（')[0] : '（未公開）');
export const LIFECYCLE: any[] = [...TAX.lifecycle].sort((a: any, b: any) => a.order - b.order);
export const CI_SECTORS: any[] = TAX.ciSectors;

/** 静的書き出し用：一覧が空のときでもビルドできるよう、ダミーを1件返す */
export const staticParams = (list: any[]) => (list.length ? list.map((e) => ({ id: e.id })) : [{ id: '__none__' }]);
