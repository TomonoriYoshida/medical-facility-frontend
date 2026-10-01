import type { Metadata } from "next";
import { PageTitle, SectionHeading } from "@/components/headings";
import { apiDocsUrl, apiOrigin, isApiConfigured, openApiSpecUrl } from "@/lib/api/client";
import ExportList from "./export-list";

export const metadata: Metadata = {
  title: "APIについて",
};

const apiRepositoryUrl = "https://github.com/TomonoriYoshida/medical-facility-master-api-laravel";
const frontendRepositoryUrl = "https://github.com/TomonoriYoshida/medical-facility-frontend";

const endpoints = [
  {
    path: "/v1/medical-facilities",
    description: "施設の検索・一覧（キーワード、都道府県、市区町村、種別、診療科、指定状態、指定年月日などで絞り込み）",
    example: "/v1/medical-facilities?prefecture_code=13&institution_type=1&per_page=5",
  },
  {
    path: "/v1/medical-facilities?latitude=…&longitude=…",
    description: "近隣検索（指定した地点から半径 radius メートル以内の施設を近い順に、距離付きで返す）",
    example: "/v1/medical-facilities?latitude=35.681236&longitude=139.767125&radius=500&per_page=5",
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

const resources = [
  // Until the API is public, its documentation has no URL to link to.
  ...(isApiConfigured
    ? [
        { label: "APIドキュメント", href: apiDocsUrl },
        { label: "OpenAPI仕様（JSON）", href: openApiSpecUrl },
      ]
    : []),
  { label: "API のソースコード（GitHub）", href: apiRepositoryUrl },
  { label: "このサイトのソースコード（GitHub）", href: frontendRepositoryUrl },
];

const linkClass = "text-accent underline underline-offset-2 hover:opacity-80";

export default function AboutPage() {
  return (
    <>
      <PageTitle
        lead={
          <div className="space-y-2">
            <p>
              このサイトは「医療施設マスタAPI」のデモです。APIは、全国8つの地方厚生局がそれぞれの形式（単一のExcel、複数シート、県別のZIPなど）で公開している
              「保険医療機関・保険薬局の指定一覧」を定期的に取得・構造化し、全国約22万施設を1つのREST APIとして提供します。
            </p>
            <p>
              認証は不要で、どなたでも利用できます（読み取り専用）。同じIPアドレスからのリクエスト数には1分あたりの上限があります。
            </p>
          </div>
        }
      >
        APIについて
      </PageTitle>

      <section>
        <SectionHeading>資料</SectionHeading>
        <div className="mt-3 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-64">資料</th>
                <th>リンク</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((resource) => (
                <tr key={resource.href}>
                  <th scope="row">{resource.label}</th>
                  <td className="break-all">
                    <a href={resource.href} target="_blank" rel="noopener noreferrer" className={linkClass}>
                      {resource.href}
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <SectionHeading>エンドポイント</SectionHeading>
        <p className="mt-2 text-sm">
          ベースURL：
          {isApiConfigured ? <code className="font-mono">{apiOrigin}/api</code> : "公開準備中"}
          （すべて GET）
        </p>
        <div className="mt-2 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>エンドポイント</th>
                <th>内容</th>
              </tr>
            </thead>
            <tbody>
              {endpoints.map((endpoint) => (
                <tr key={endpoint.path}>
                  <th scope="row" className="font-mono">
                    {endpoint.path}
                  </th>
                  <td>
                    {endpoint.description}
                    <br />
                    {isApiConfigured ? (
                      <a
                        href={`${apiOrigin}/api${endpoint.example}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`font-mono text-xs break-all ${linkClass}`}
                      >
                        例：{endpoint.example} ↗
                      </a>
                    ) : (
                      <span className="font-mono text-xs break-all text-muted">例：{endpoint.example}</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <SectionHeading>一括ダウンロード</SectionHeading>
        <p className="mt-2 text-sm">
          全件を取得したい場合は、APIをページ送りで呼ぶ代わりに都道府県別のファイルをご利用ください（gzip圧縮）。
        </p>
        <div className="mt-2">
          <ExportList />
        </div>
      </section>
    </>
  );
}
