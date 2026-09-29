import type { Metadata } from "next";
import { apiDocsUrl, apiOrigin, openApiSpecUrl } from "@/lib/api/client";
import ExportList from "./export-list";

export const metadata: Metadata = {
  title: "APIについて",
};

const apiRepositoryUrl = "https://github.com/TomonoriYoshida/medical-facility-master-api-laravel";
const frontendRepositoryUrl = "https://github.com/TomonoriYoshida/medical-facility-frontend";

const endpoints = [
  {
    path: "/v1/medical-facilities",
    description: "施設の検索・一覧（キーワード、都道府県、種別、診療科、指定状態、指定年月日などで絞り込み）",
    example: "/v1/medical-facilities?prefecture_code=13&institution_type=1&per_page=5",
  },
  {
    path: "/v1/medical-facilities/{id}",
    description: "施設の詳細",
    example: "/v1/medical-facilities/1",
  },
  {
    path: "/v1/medical-facilities/{id}/events",
    description: "1つの施設の新規・廃止・変更の履歴",
    example: "/v1/medical-facilities/1/events",
  },
  {
    path: "/v1/medical-facility-events",
    description: "全国の新規・廃止・変更の一覧（新しい順）",
    example: "/v1/medical-facility-events?per_page=5",
  },
  {
    path: "/v1/options",
    description: "都道府県・種別・診療科などの選択肢（コードと表示名）",
    example: "/v1/options",
  },
  {
    path: "/v1/exports",
    description: "都道府県別の一括ダウンロード（CSV / JSON Lines）の一覧",
    example: "/v1/exports",
  },
];

const buttonClass =
  "inline-flex items-center rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-80";
const secondaryButtonClass =
  "inline-flex items-center rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-surface";

export default function AboutPage() {
  return (
    <>
      <header>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">APIについて</h1>
        <div className="mt-4 space-y-3 leading-7 text-muted">
          <p>
            このサイトは「医療施設マスタAPI」のデモです。APIは、全国8つの地方厚生局がそれぞれの形式（単一のExcel、複数シート、県別のZIPなど）で公開している
            「保険医療機関・保険薬局の指定一覧」を定期的に取得・構造化し、全国約22万施設を1つのREST APIとして提供します。
          </p>
          <p>
            認証は不要で、どなたでも利用できます（読み取り専用）。同じIPアドレスからのリクエスト数には1分あたりの上限があります。
          </p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <a href={apiDocsUrl} target="_blank" rel="noopener noreferrer" className={buttonClass}>
            APIドキュメント ↗
          </a>
          <a href={openApiSpecUrl} target="_blank" rel="noopener noreferrer" className={secondaryButtonClass}>
            OpenAPI仕様（JSON） ↗
          </a>
          <a href={apiRepositoryUrl} target="_blank" rel="noopener noreferrer" className={secondaryButtonClass}>
            API のソースコード ↗
          </a>
          <a
            href={frontendRepositoryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={secondaryButtonClass}
          >
            このサイトのソースコード ↗
          </a>
        </div>
      </header>

      <section className="mt-12">
        <h2 className="text-lg font-semibold">エンドポイント</h2>
        <p className="mt-1 text-sm text-muted">
          ベースURL: <code className="font-mono">{apiOrigin}/api</code>
        </p>
        <ul className="mt-4 divide-y divide-border rounded-xl border border-border">
          {endpoints.map((endpoint) => (
            <li key={endpoint.path} className="p-4">
              <p className="font-mono text-sm">
                <span className="mr-2 rounded bg-surface px-1.5 py-0.5 text-xs font-semibold text-accent">
                  GET
                </span>
                {endpoint.path}
              </p>
              <p className="mt-1 text-sm text-muted">{endpoint.description}</p>
              <a
                href={`${apiOrigin}/api${endpoint.example}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-block font-mono text-xs break-all text-accent hover:underline"
              >
                例: {endpoint.example} ↗
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold">一括ダウンロード</h2>
        <p className="mt-1 text-sm text-muted">
          全件を取得したい場合は、APIをページ送りで呼ぶ代わりに都道府県別のファイルをご利用ください（gzip圧縮）。
        </p>
        <div className="mt-4">
          <ExportList />
        </div>
      </section>
    </>
  );
}
