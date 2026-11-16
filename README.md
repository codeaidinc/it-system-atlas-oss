<!--
========================================================================
IT Systems Atlas OSS版
製作：合同会社CODEAID
Copyright (c) 2026 合同会社CODEAID
ライセンス：CC BY 4.0（LICENSE-DATA を参照）
SPDX-License-Identifier: CC-BY-4.0
ファイル：README.md
説明：リポジトリの説明（収録内容・はじめかた・ライセンス）
履歴：
  2026-11-16  v1.0.0  初版
========================================================================
-->
# IT Systems Atlas（OSS版）

**世界には、どんなITシステムがあるのか。**
アプリから企業の基幹システム、社会を支える巨大システムまで。ITシステムの存在・役割・規模・関係を見渡す、授業で使えるオープンソースの教材アトラスです。

- 静的サイトです。ログイン・入力フォーム・外部の計測・APIキーはいりません。
- 文章・データは CC BY 4.0、ソースコードは Apache License 2.0 です。授業での利用・改変・再配布は自由です（クレジットの表示が必要です）。

## 収録内容
| 種類 | 件数 |
|---|---|
| システムの種類（system_type） | 161（うち教材カード：問い・学習目標つき） |
| 企業業務の流れ（business_flow） | 1（注文を受けてから決算まで） |
| 地図 | 6つ（01 世界／02 企業業務／03 社会基盤／04 統合階層／05 規模・リスク／06 ライフサイクル） |

分類：教育用12領域（D01〜D12）＋共通技術基盤（D00）、統合階層6段階（L0〜L5）、利用範囲、8つの評価軸。

演習（シナリオ・比較演習）、授業の構成例、ワークシートなどの授業用教材は、このリポジトリには含みません。授業での使い方は [docs/授業での使い方.md](docs/授業での使い方.md) を参照してください。

## はじめかた
Node.js 22以上が必要です。

```bash
npm ci               # 依存パッケージを入れる（最初に1回）
npm run dev          # http://localhost:3000 でプレビュー
npm run verify       # 変更したら：データの検査 → ビルド → テストをまとめて実行
npm run build        # 静的サイトを apps/web/out に生成
npm run start        # 生成したサイトを手元で配信して確認（http://localhost:3000）
ATLAS_MODE=reviewed npm run build   # 確認済み（reviewed）のカードだけで生成
ATLAS_BASE_PATH=/atlas npm run build  # サブパス（例：https://example.github.io/atlas/）に置く場合
npm run print:pdf    # 地図のPDFを dist/print に生成（Playwright が必要）
```

検査とテストの内容は [docs/テストと検査.md](docs/テストと検査.md) を参照してください。

`apps/web/out` は、校内のWebサーバー・GitHub Pages・Cloudflare Pages・Netlify など、静的ファイルを置ける場所ならどこでも公開できます。サブパスに置く場合は `ATLAS_BASE_PATH` を付けてビルドします。

## データを直す・増やす
- カードは `data/entries/<種類>/<id>.yaml` です。近いカードをコピーして作り、`npm run verify` で確かめます。
- 書き方は [参加ガイド](CONTRIBUTING.md) と [編集方針](docs/editorial-policy/EDITORIAL_POLICY.md) を参照してください。
- 構成は [アーキテクチャ](docs/architecture/README.md) を参照してください。

## ライセンス
- ソースコード：[Apache License 2.0](LICENSE)
- 文章・データ：[CC BY 4.0](LICENSE-DATA)
- 著作権表示と第三者の著作物（書体）・商標の扱い：[NOTICE](NOTICE)

各ファイルの先頭には、製作・著作権・ライセンス・ファイルの説明・履歴のコメントがあります（JSON など、コメントを書けないファイルを除く）。ファイルを変えたら「履歴：」に1行足してください。

Copyright (c) 2026 合同会社CODEAID　／　初期データの作成：CODEAID編集部
