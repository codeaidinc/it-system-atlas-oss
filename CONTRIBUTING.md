<!--
========================================================================
IT Systems Atlas OSS版
製作：合同会社CODEAID
Copyright (c) 2026 合同会社CODEAID
ライセンス：CC BY 4.0（LICENSE-DATA を参照）
SPDX-License-Identifier: CC-BY-4.0
ファイル：CONTRIBUTING.md
説明：参加ガイド（事例の追加・訂正の提案、カードの書き方）
履歴：
  2026-11-16  v1.0.0  初版
========================================================================
-->
# 参加ガイド

IT Systems Atlas には、どなたでも事例の追加・訂正を提案できます。まず [編集方針](docs/editorial-policy/EDITORIAL_POLICY.md) をお読みください。

## GitHubに慣れていない方
Issue の「新しいシステムの追加を提案」「訂正の申請」フォームから投稿できます。メンテナーがカードに変換します。

## Pull Request で投稿する
1. 既存のカードを検索し、重複がないか確認します（`data/entries/`）。
2. 近いカードをコピーして、`data/entries/system_type/st-<英小文字とハイフン>.yaml` を作成します。ファイル名と `id` は一致させます。
3. `editorial.status` は `draft` にします（内容を確かめたメンテナーが `reviewed` に変えます）。
4. 新しいファイルの先頭のコメント（ヘッダ）を付けます：`npm run headers -- --fix`（コピー元のヘッダを、新しいファイルのパスと説明に直します）。
5. 手元で検査します。
   ```bash
   npm ci
   npm run verify     # 検査・ビルド・テストをまとめて実行
   npm run dev        # http://localhost:3000 で表示確認
   ```
6. PR を作成します。CI で `npm run verify` とセキュリティ検査が自動で実行されます。
7. メンテナーの確認とマージをもって反映されます。

## カードの書き方
- 概要は100〜300字。高校生・専門学校1年生が読んで分かる言葉で。
- 規模の目安：`project_class`（XS〜XXL）と `usage_class`（U1〜U4）を範囲で。定義は `data/taxonomy/scale_classes.yaml`。
- 規模の参考値（`scale.references`）は、出典・対象範囲・時点・`measure` が必須です。開発プロジェクトの値（開発費・工数・期間）と稼働規模の値（利用者数・処理件数）を区別してください。
- 関係（`relations`）：`is_a`（〜の一種）、`part_of`（〜の一部）、`integrates_with`（〜と連携）、`depends_on`（〜を基盤とする）、`successor_of`（〜の後継）。

## ライセンス
投稿した文章・データは CC BY 4.0、コードは Apache License 2.0 で公開されます。PRの作成をもって、これに同意したものとみなします。

## コードの変更
- 静的サイト（Next.js の静的書き出し）と、データ検査・生成のスクリプト（`scripts/`）だけで構成しています。外部サービスやAPIキーを必要とする機能は追加しない方針です。
- ファイルを変えたら、先頭のコメントの「履歴：」に1行（日付・版・内容）を足し、`npm run verify` を通してください。検査の内容は [docs/テストと検査.md](docs/テストと検査.md) にあります。
