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

## 画面のテスト

[Playwright](https://playwright.dev/) で、ビルドした画面をブラウザで動かして確かめます（`e2e/`）。PR のたびと、`main` へのデプロイの前に GitHub Actions（`.github/workflows/test.yml`）で動きます。テストが通らなければデプロイしません。

- APIは本物を呼ばず、テスト用の固定データ（`e2e/fixtures/`）で答えます。テスト用のビルドはAPIのオリジンをダミーの `http://api.test` にし、その通信をテストが受けます。地図タイルなど外部への通信は止めます。
- 時刻は 2026-10-05（月）10:30（日本時間）に固定します（「今日」の列などが日によって変わらないように）。
- 想定していないAPIが呼ばれると、テストは失敗します。新しいAPIを使うときは、`e2e/support.ts` に固定データの応答を加えます。
- 検索画面と施設詳細は、axe でアクセシビリティも確かめます（重大な問題があれば失敗）。

```bash
# テスト用にビルドする
docker run --rm --network host -u "$(id -u):$(id -g)" -e npm_config_cache=/tmp/.npm -v "$PWD":/app -w /app node:22-alpine npm run build:e2e
# テストする（ブラウザ入りの Playwright のイメージで）
docker run --rm --network host --ipc=host -u "$(id -u):$(id -g)" -e HOME=/tmp -v "$PWD":/app -w /app mcr.microsoft.com/playwright:v1.58.0-noble npm run test:e2e
```

- イメージの版（`v1.58.0`）は、`package.json` の `@playwright/test` と合わせます。上げるときは、ここと `.github/workflows/test.yml`（イメージのタグと `PLAYWRIGHT_IMAGE_VERSION`）も一緒に上げます。ずれていると CI の最初の手順で失敗します。
- 依存関係を追加・更新するときは、`node:22-alpine`（npm 10）で `npm install` してください。デプロイ（`deploy.yml`）は Node 22 の npm 10 で `npm ci` するため、Playwright のイメージ（npm 11）で書いた lockfile は通らないことがあります（CI の確認で失敗します）。
- 失敗したテストの記録は `test-results/` に残ります（`npx playwright show-trace <trace.zip>` で再生できます）。CI では成果物 `playwright-report` に入ります。

### 固定データを作り直す

`e2e/fixtures/*.json` は、ローカルのAPIの実際の応答です。APIの形が変わったら、ローカルのAPIを最新にしてから取り直します。施設は、時間帯が2つあり、受付時間と第n週の休みがあるもの（鈴森内科クリニック）を使っています。IDが変わった場合は、`facility` と同じ施設のIDに置き換えます。

```bash
B=http://localhost:8000/api/v1; ID=33987
curl -s "$B/options" > e2e/fixtures/options.json
curl -s "$B/medical-facilities?per_page=3&prefecture_code=13&institution_type=2&status=1&total=capped" > e2e/fixtures/facility-list.json
curl -s "$B/medical-facilities/$ID" > e2e/fixtures/facility.json
curl -s "$B/medical-facilities/$ID/opening-hours" > e2e/fixtures/opening-hours.json
curl -s "$B/medical-facilities/$ID/events" > e2e/fixtures/facility-events.json
```

## デプロイ

`main` へのpushでGitHub Pagesにデプロイされます。APIのオリジンは、リポジトリ変数 `API_ORIGIN` に設定しています（現在は `https://168-110-42-30.sslip.io`。末尾の `/` と `/api` は付けない）。

- APIのオリジンはビルド時に埋め込まれます。変数を変えたあと（独自ドメインへの切り替えなど）は、Actionsの「Deploy to GitHub Pages」を「Run workflow」で実行し直してください。
- 変数が未設定のままビルドすると、APIは公開準備中である旨を表示し、APIを呼び出しません（フォークしてAPIを用意する前など）。
- ページは `about/index.html` の形で書き出し（`trailingSlash: true`）、`/about/` と `/about` のどちらでも開けます。
- `sitemap.xml`（`/medical-facility-frontend/sitemap.xml`）を書き出します。GitHub Pagesのプロジェクトサイトは `robots.txt` をドメインのルートからしか読まれないため、サイトマップは Google Search Console などに直接登録します。
