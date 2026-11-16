<!--
========================================================================
IT Systems Atlas OSS版
製作：合同会社CODEAID
Copyright (c) 2026 合同会社CODEAID
ライセンス：CC BY 4.0（LICENSE-DATA を参照）
SPDX-License-Identifier: CC-BY-4.0
ファイル：docs/architecture/README.md
説明：アーキテクチャ（データからサイトを作る流れ、ディレクトリ、生成モード、置き場所）
履歴：
  2026-11-16  v1.0.0  初版
========================================================================
-->
# アーキテクチャ

## 方針：Atlas as Code
アトラスの本体は `data/` 配下の YAML ファイルです。データベースは使わず、Git が版管理・差分・履歴を担います。サーバー側の処理はなく、ビルドすると静的な HTML ができます。

```
data/（YAML）
   │
   ▼
scripts/check.mjs ── 機械検査（スキーマ・参照・重複・単位・禁止表現）
   │
   ▼
scripts/build-data.mjs ──→ apps/web/generated/atlas.json（サイトの単一ソース）
   │                    └→ apps/web/public/opendata（JSON / CSV）
   ▼
apps/web（Next.js の静的書き出し）─→ apps/web/out（どこにでも置ける静的サイト）
```

## ディレクトリ
| パス | 内容 |
|---|---|
| `data/entries/` | カード本体（system_type / business_flow） |
| `data/taxonomy/` | 産業・業務・種類・層・領域・統合階層・評価軸・規模区分・重要インフラ・ライフサイクル・関係・役割の定義 |
| `data/views/` | 6つの地図の定義 |
| `schema/` | JSON Schema |
| `scripts/` | 検査・データ生成・まとめての検査（verify.mjs）・手元での配信（serve.mjs）・印刷用PDF |
| `scripts/lib/` | データの読み込み（load.mjs）、データの機械検査（lint.mjs）、ビルドしたサイトの検査（site-check.mjs） |
| `apps/web/` | サイト（Next.js） |
| `tests/` | 単体・受入テスト |

## 生成モード
- 既定：取り下げ（`withdrawn`）以外のすべてのカードを含め、下書きは画面に「下書き」と表示する。
- `ATLAS_MODE=reviewed`：確認済み（`reviewed`）のカードだけで生成する。

## 置き場所
`apps/web/out` は静的ファイルだけでできています。ドメインの直下（`/`）に置く場合はそのまま、サブパス（例：`/atlas/`）に置く場合は `ATLAS_BASE_PATH=/atlas npm run build` で作ります。置く前に `npm run verify`（サブパスなら `npm run verify -- --base /atlas`）でリンク切れがないことを確かめてください。
