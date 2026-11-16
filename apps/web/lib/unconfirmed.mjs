// ========================================================================
// IT System Atlas OSS版
// 製作：合同会社CODEAID
// Copyright (c) 2026 合同会社CODEAID
// ライセンス：Apache License 2.0（LICENSE を参照）
// SPDX-License-Identifier: Apache-2.0
// ファイル：apps/web/lib/unconfirmed.mjs
// 説明：分類の「確認待ち」の印の表示
// 履歴：
//   2026-11-16  v1.0.0  初版
// ========================================================================
// 分類の確認待ちの印（editorial.unconfirmed）の表示。
// 規則・暫定で付けた分類（領域・統合階層・利用範囲・評価軸）のうち、編集部がまだ確認していない項目を示す。

export const UNCONFIRMED_LABEL = '確認待ち';
export const FIELD_LABELS = { domain: '領域', level: '統合階層', scope: '利用範囲', axes: '評価軸' };

/** 確認待ちの項目の配列（印がなければ空） */
export const unconfirmedFields = (e) => (Array.isArray(e?.editorial?.unconfirmed) ? e.editorial.unconfirmed.filter((f) => f in FIELD_LABELS) : []);

/** 指定の項目が確認待ちか */
export const isUnconfirmed = (e, field) => unconfirmedFields(e).includes(field);

/** 位置づけ（領域・統合階層・利用範囲）のうち確認待ちのものの表示文。なければ null */
export function placementNote(e) {
  const f = unconfirmedFields(e).filter((x) => x !== 'axes');
  return f.length ? `${UNCONFIRMED_LABEL}：${f.map((x) => FIELD_LABELS[x]).join('・')}（編集部の目安の初期値）` : null;
}

/** 評価軸が確認待ちのときの表示文。なければ null */
export const axesNote = (e) => (isUnconfirmed(e, 'axes') ? `${UNCONFIRMED_LABEL}：評価軸は編集部の目安の初期値で、確認前です。` : null);

/** 複数のシステム（比較の列など）のうち、確認待ちの項目を持つものの名前。なければ空 */
export const unconfirmedNames = (entries) => entries.filter((e) => unconfirmedFields(e).length).map((e) => e?.names?.ja ?? e?.id);
