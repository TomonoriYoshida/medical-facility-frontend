# 医療施設マスタ検索（medical-facility-frontend）

[医療施設マスタAPI](https://github.com/TomonoriYoshida/medical-facility-master-api-laravel) のデモ用フロントエンドです。
全国約22万の病院・診療所・歯科診療所・薬局を検索し、施設の詳細や掲載・変更・廃止の履歴を閲覧できます。
地図の中心や現在地から近くの施設を探すこともできます（APIの近隣検索）。

- **公開サイト**: https://tomonoriyoshida.github.io/medical-facility-frontend/
- **接続先のAPI**: https://168-110-42-30.sslip.io （[仕様書](https://168-110-42-30.sslip.io/docs/api)）

- Next.js 16（App Router、`output: "export"` による静的書き出し）/ React 19 / TypeScript / Tailwind CSS 4
- データ取得はブラウザからAPIを直接呼び出し（TanStack Query）
- APIの型は、APIが生成するOpenAPI仕様から `openapi-typescript` で生成
- 地図は [Leaflet](https://leafletjs.com/) と[地理院タイル](https://maps.gsi.go.jp/development/ichiran.html)（淡色地図）。Leaflet は `window` を使うため、`next/dynamic`（`ssr: false`）でブラウザでだけ読み込む
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

`main` へのpushでGitHub Pagesにデプロイされます。APIのオリジンは、リポジトリ変数 `API_ORIGIN` に設定しています（現在は `https://168-110-42-30.sslip.io`。末尾の `/` と `/api` は付けない）。

- APIのオリジンはビルド時に埋め込まれます。変数を変えたあと（独自ドメインへの切り替えなど）は、Actionsの「Deploy to GitHub Pages」を「Run workflow」で実行し直してください。
- 変数が未設定のままビルドすると、APIは公開準備中である旨を表示し、APIを呼び出しません（フォークしてAPIを用意する前など）。
- ページは `about/index.html` の形で書き出し（`trailingSlash: true`）、`/about/` と `/about` のどちらでも開けます。
- `sitemap.xml`（`/medical-facility-frontend/sitemap.xml`）を書き出します。GitHub Pagesのプロジェクトサイトは `robots.txt` をドメインのルートからしか読まれないため、サイトマップは Google Search Console などに直接登録します。
