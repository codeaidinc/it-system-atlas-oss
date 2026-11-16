// ========================================================================
// IT Systems Atlas OSS版
// 製作：合同会社CODEAID
// Copyright (c) 2026 合同会社CODEAID
// ライセンス：Apache License 2.0（LICENSE を参照）
// SPDX-License-Identifier: Apache-2.0
// ファイル：scripts/lib/lint.mjs
// 説明：データの機械検査の規則（スキーマ・ID・参照・重複・規模の参考値・表現）
// 履歴：
//   2026-11-16  v1.0.0  初版
// ========================================================================
// 機械検査（LLMを使わない決定論的チェック）
// 出力は {field, severity, issue} の findings 形式。
import fs from 'node:fs';
import path from 'node:path';
import Ajv2020 from 'ajv/dist/2020.js';
import addFormats from 'ajv-formats';
import { ROOT, ID_PREFIX, ENTRY_TYPES } from './load.mjs';

export const LINT_VERSION = '0.1.2';

function buildValidators(root = ROOT) {
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  const s = (f) => JSON.parse(fs.readFileSync(path.join(root, 'schema', f), 'utf8'));
  ajv.addSchema(s('common.schema.json'), 'common.schema.json');
  const v = {};
  for (const t of ENTRY_TYPES) v[t] = ajv.compile(s(`${t}.schema.json`));
  return v;
}

const UNIT_BY_MEASURE = {
  development_cost: ['JPY', 'USD'],
  annual_operating_cost: ['JPY', 'USD'],
  development_effort: ['person_months'],
  development_duration: ['months', 'years'],
  operating_years: ['years'],
  peak_team_size: ['persons'],
  users: ['persons', 'accounts'],
  transactions: ['transactions_per_day'],
  sites: ['sites'],
};

const PROMO = ['業界No.1', '業界ナンバーワン', 'No.1', '最高の', '最強', '唯一の', '圧倒的', '絶対に', '必ず成功', '日本一', '世界一'];
const SPECULATIVE = ['破綻', '杜撰', 'ずさん', '欠陥', '失敗の原因', '責任は', '無能', '隠蔽', '傾い', 'こけ'];
const PII = [
  { re: /[\w.+-]+@[\w-]+\.[\w.-]+/, label: 'メールアドレス' },
  { re: /0\d{1,4}-\d{1,4}-\d{3,4}/, label: '電話番号' },
];

export const normalize = (s) =>
  String(s || '')
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\s・\-_/()（）「」]/g, '')
    .replace(/システム$/, '');

function bigrams(s) {
  const n = normalize(s);
  const g = new Set();
  for (let i = 0; i < n.length - 1; i++) g.add(n.slice(i, i + 2));
  return g;
}
export function similarity(a, b) {
  const A = bigrams(a), B = bigrams(b);
  if (!A.size || !B.size) return 0;
  let inter = 0;
  for (const x of A) if (B.has(x)) inter++;
  return inter / (A.size + B.size - inter);
}

const PORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const UORDER = ['U1', 'U2', 'U3', 'U4'];

/**
 * 全エントリを検査する。
 * @param {{file:string,data:any,error?:string}[]} entries
 * @param {*} tax taxonomy
 * @returns {Map<string, {file:string, id:string|null, findings:any[]}>}
 */
export function lintAll(entries, tax, root = ROOT) {
  const validators = buildValidators(root);
  const results = new Map();
  const add = (key, file, id, f) => {
    if (!results.has(key)) results.set(key, { file, id, findings: [] });
    if (f) results.get(key).findings.push(f);
  };

  const ids = new Map();
  const set = (arr) => new Set(arr.map((x) => x.id));
  const IND = set(tax.industries), BF = set(tax.businessFunctions), CAT = set(tax.categories);
  const CI = set(tax.ciSectors), LC = set(tax.lifecycle);
  const DOM = set(tax.domains), ROLE = set(tax.industryRoles), BFN = set(tax.businessFunctions);

  for (const e of entries) {
    const key = e.file;
    add(key, e.file, e.data?.id ?? null);
    if (e.error || !e.data) {
      add(key, e.file, null, { field: '(file)', severity: 'blocker', issue: `YAMLを読み込めません: ${e.error}` });
      continue;
    }
    const d = e.data;
    if (!ENTRY_TYPES.includes(d.type)) {
      add(key, e.file, d.id, { field: 'type', severity: 'blocker', issue: `未知の type: ${d.type}` });
      continue;
    }
    const ok = validators[d.type](d);
    if (!ok) {
      for (const err of validators[d.type].errors) {
        add(key, e.file, d.id, {
          field: err.instancePath || '(root)',
          severity: 'blocker',
          issue: `スキーマ違反: ${err.message}${err.params?.additionalProperty ? ` (${err.params.additionalProperty})` : ''}`,
        });
      }
    }
    // ファイル配置とID
    const expected = `data/entries/${d.type}/`;
    if (!e.file.startsWith(expected)) add(key, e.file, d.id, { field: 'id', severity: 'major', issue: `${d.type} は ${expected} 配下に置いてください` });
    if (d.id && path.basename(e.file).replace(/\.ya?ml$/, '') !== d.id)
      add(key, e.file, d.id, { field: 'id', severity: 'major', issue: 'ファイル名とidが一致しません' });
    if (d.id && !d.id.startsWith(ID_PREFIX[d.type]))
      add(key, e.file, d.id, { field: 'id', severity: 'blocker', issue: `idは ${ID_PREFIX[d.type]} で始めてください` });
    if (d.id) {
      if (ids.has(d.id)) add(key, e.file, d.id, { field: 'id', severity: 'blocker', issue: `id重複: ${ids.get(d.id)}` });
      else ids.set(d.id, e.file);
    }
    if (d.editorial?.created && d.editorial?.updated && d.editorial.updated < d.editorial.created)
      add(key, e.file, d.id, { field: 'editorial.updated', severity: 'minor', issue: '更新日が作成日より前です' });

    // 表現チェック
    // 指摘には実際の項目名を付ける（AIによる修正が正しい箇所を直せるように）
    const texts = [['summary.ja', d.summary?.ja], ['purpose.ja', d.purpose?.ja], ['users.ja', d.users?.ja], ['lifecycle_note.ja', d.lifecycle_note?.ja], ['outage_impact.ja', d.outage_impact?.ja],
      ...(d.steps || []).map((x, i) => [`steps.${i}.action`, x.action])].filter(([, t]) => t);
    for (const [field, t] of texts) for (const w of PROMO) if (t.includes(w))
      add(key, e.file, d.id, { field, severity: 'minor', issue: `宣伝的な表現の可能性: 「${w}」`, suggestion: '客観的な説明に言い換えてください' });
    for (const p of PII) if (p.re.test(JSON.stringify(d).replace(/https?:\/\/[^"\s]+/g, '')))
      add(key, e.file, d.id, { field: '(any)', severity: 'blocker', issue: `個人情報の可能性: ${p.label}` });
    if (d.summary?.ja && !/[。）)]$/.test(d.summary.ja.trim()))
      add(key, e.file, d.id, { field: 'summary.ja', severity: 'info', issue: '概要は「。」で終えてください' });

    if (d.type === 'system_type') {
      for (const i of d.industry || []) if (!IND.has(i)) add(key, e.file, d.id, { field: 'industry', severity: 'blocker', issue: `未定義の産業ID: ${i}` });
      for (const b of d.business_function || []) if (!BF.has(b)) add(key, e.file, d.id, { field: 'business_function', severity: 'blocker', issue: `未定義の業務ID: ${b}` });
      if (d.category && !CAT.has(d.category)) add(key, e.file, d.id, { field: 'category', severity: 'blocker', issue: `未定義の種類: ${d.category}` });
      for (const s of d.critical_infrastructure?.sectors || []) if (!CI.has(s)) add(key, e.file, d.id, { field: 'critical_infrastructure', severity: 'blocker', issue: `未定義の重要インフラ分野: ${s}` });
      const t = d.scale?.typical;
      if (t?.project_class && PORDER.indexOf(t.project_class.min) > PORDER.indexOf(t.project_class.max))
        add(key, e.file, d.id, { field: 'scale.typical.project_class', severity: 'major', issue: 'min が max より大きい' });
      if (t?.usage_class && UORDER.indexOf(t.usage_class.min) > UORDER.indexOf(t.usage_class.max))
        add(key, e.file, d.id, { field: 'scale.typical.usage_class', severity: 'major', issue: 'min が max より大きい' });
      (d.scale?.references || []).forEach((r, i) => {
        const f = `scale.references[${i}]`;
        if (r.value === null && r.evidence_type !== 'not_disclosed')
          add(key, e.file, d.id, { field: f, severity: 'major', issue: '値が空の場合は evidence_type を not_disclosed にしてください' });
        if (r.value !== null && r.evidence_type === 'not_disclosed')
          add(key, e.file, d.id, { field: f, severity: 'major', issue: 'not_disclosed なのに値があります' });
        if (UNIT_BY_MEASURE[r.measure] && !UNIT_BY_MEASURE[r.measure].includes(r.unit))
          add(key, e.file, d.id, { field: `${f}.unit`, severity: 'major', issue: `${r.measure} の単位は ${UNIT_BY_MEASURE[r.measure].join('/')} のいずれか` });
        if (r.evidence_type === 'education_model' && !r.formula)
          add(key, e.file, d.id, { field: f, severity: 'major', issue: '教育用モデルの値には計算式（formula）が必要です' });
        if (typeof r.value === 'number' && r.value < 0)
          add(key, e.file, d.id, { field: `${f}.value`, severity: 'major', issue: '負の値は登録できません' });
        if (r.evidence_type === 'press_report')
          add(key, e.file, d.id, { field: f, severity: 'info', issue: '報道値です。公式資料があれば差し替えてください' });
        const subj = `${r.subject?.ja || ''} ${r.scope?.ja || ''}`;
        for (const w of SPECULATIVE) if (subj.includes(w))
          add(key, e.file, d.id, { field: f, severity: 'major', issue: `評価・推測表現の可能性: 「${w}」（実名事例ポリシー）` });
      });
    }
    if (d.type === 'system_type') {
      if (d.domain && !DOM.has(d.domain)) add(key, e.file, d.id, { field: 'domain', severity: 'blocker', issue: `未定義の領域: ${d.domain}` });
    }
    if (d.type === 'system_type') {
      for (const r of d.industry_roles || []) if (!ROLE.has(r)) add(key, e.file, d.id, { field: 'industry_roles', severity: 'blocker', issue: `未定義の役割: ${r}` });
      if (d.level?.related?.includes(d.level.primary)) add(key, e.file, d.id, { field: 'level.related', severity: 'minor', issue: '主な階層と同じ階層が related に含まれています' });
    }
    if (d.type === 'business_flow') {
      const sids = new Set((d.stages || []).map((x) => x.id));
      for (const [i, st] of (d.stages || []).entries()) {
        for (const n of st.next || []) if (!sids.has(n)) add(key, e.file, d.id, { field: `stages[${i}].next`, severity: 'blocker', issue: `存在しない段階: ${n}` });
        if (st.function && !BFN.has(st.function)) add(key, e.file, d.id, { field: `stages[${i}].function`, severity: 'blocker', issue: `未定義の業務: ${st.function}` });
      }
    }
  }

  // 参照整合（全ID確定後）
  for (const e of entries) {
    const d = e.data;
    if (!d) continue;
    const key = e.file;
    for (const [i, r] of (d.relations || []).entries()) {
      if (!ids.has(r.target)) add(key, e.file, d.id, { field: `relations[${i}].target`, severity: 'blocker', issue: `存在しない参照先: ${r.target}` });
      if (r.target === d.id) add(key, e.file, d.id, { field: `relations[${i}]`, severity: 'major', issue: '自分自身への関係です' });
    }
    if (d.type === 'business_flow') {
      for (const s2 of [...(d.stages || []).flatMap((x) => x.systems), ...(d.hub?.systems || [])]) if (!ids.has(s2)) add(key, e.file, d.id, { field: 'stages.systems', severity: 'blocker', issue: `存在しないシステム: ${s2}` });
    }
  }

  // 重複検知（名称・別名の正規化一致、類似）
  const nameIndex = [];
  for (const e of entries) {
    const d = e.data;
    if (!d?.names) continue;
    for (const n of [d.names.ja, d.names.en, ...(d.aliases || [])]) nameIndex.push({ id: d.id, type: d.type, file: e.file, name: n, norm: normalize(n) });
  }
  const seen = new Set();
  for (let i = 0; i < nameIndex.length; i++) {
    for (let j = i + 1; j < nameIndex.length; j++) {
      const a = nameIndex[i], b = nameIndex[j];
      if (a.id === b.id || a.type !== b.type) continue;
      const pair = [a.id, b.id].sort().join('|');
      if (seen.has(pair)) continue;
      if (a.norm && a.norm === b.norm) {
        seen.add(pair);
        add(b.file, b.file, b.id, { field: 'names', severity: 'major', issue: `重複の疑い: 「${b.name}」が ${a.id} の「${a.name}」と同一表記です` });
      } else if (a.norm.length >= 4 && similarity(a.name, b.name) >= 0.8) {
        seen.add(pair);
        add(b.file, b.file, b.id, { field: 'names', severity: 'minor', issue: `類似名の疑い: ${a.id}「${a.name}」と「${b.name}」` });
      }
    }
  }
  return results;
}

export function lintVerdict(findings) {
  if (findings.some((f) => f.severity === 'blocker' || f.severity === 'major')) return 'changes_requested';
  return 'pass';
}
