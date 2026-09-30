# 医療施設マスタ検索（medical-facility-frontend）

[医療施設マスタAPI](https://github.com/TomonoriYoshida/medical-facility-master-api-laravel) のデモ用フロントエンドです。
全国約22万の病院・診療所・歯科診療所・薬局を検索し、施設の詳細や掲載・変更・廃止の履歴を閲覧できます。

- Next.js 16（App Router、`output: "export"` による静的書き出し）/ React 19 / TypeScript / Tailwind CSS 4
- データ取得はブラウザからAPIを直接呼び出し（TanStack Query）
- APIの型は、APIが生成するOpenAPI仕様から `openapi-typescript` で生成
- GitHub Pagesへデプロイ（`.github/workflows/deploy.yml`）

## ローカルで動かす

Node.jsはDocker上で実行します。先にAPI（Laravel Sail）を起動しておいてください。

```bash
cp .env.local.example .env.local   # APIのオリジンを設定
docker compose up -d               # http://localhost:3000
```

## APIの型を更新する

APIのリポジトリでOpenAPI仕様を書き出し、`openapi/openapi.json` に置いてから型を生成します。

```bash
# APIのリポジトリで
vendor/bin/sail artisan scramble:export --path=storage/app/openapi.json
# このリポジトリで
mv ../medical-facility-master-api-laravel/storage/app/openapi.json openapi/openapi.json
docker compose exec app npm run generate:api
```

## デプロイ

`main` へのpushでGitHub Pagesにデプロイされます。リポジトリ変数 `API_ORIGIN`（例: `https://api.example.com`）に公開APIのオリジンを設定してください。

- APIのオリジンはビルド時に埋め込まれます。変数を変えたあとは、Actionsの「Deploy to GitHub Pages」を「Run workflow」で実行し直してください。
- 未設定のままビルドすると、APIは公開準備中である旨を表示し、APIを呼び出しません。
