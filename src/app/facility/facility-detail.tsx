"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import AttributionNotice from "@/components/attribution-notice";
import DepartmentTags from "@/components/department-tags";
import EventItem from "@/components/event-item";
import FacilityMap from "@/components/map/facility-map";
import { SectionHeading } from "@/components/headings";
import { EmptyState, ErrorState, LoadingState } from "@/components/query-state";
import StatusBadge from "@/components/status-badge";
import { apiOrigin } from "@/lib/api/client";
import { useFacility, useFacilityEvents } from "@/lib/api/queries";
import { formatBedCounts, formatDate } from "@/lib/format";

function parseId(value: string | null): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

const linkClass = "text-accent underline underline-offset-2 hover:opacity-80";

/** GeocodeLevel::Town: the town's representative point, not the facility's. */
const townLevel = 5;
/** GeocodeLevel::MedicalInfoNet: a source (MHLW 医療情報ネット's coordinates), not a precision. */
const medicalInfoNetLevel = 6;
/** InstitutionType::Hospital */
const hospitalType = 1;

export default function FacilityDetail() {
  const id = parseId(useSearchParams().get("id"));
  const facility = useFacility(id);
  const events = useFacilityEvents(id);

  if (id === null) {
    return (
      <EmptyState>
        施設が指定されていません。
        <Link href="/" className={linkClass}>
          施設検索
        </Link>
        から選んでください。
      </EmptyState>
    );
  }
  if (facility.isPending) {
    return <LoadingState />;
  }
  if (facility.isError) {
    return <ErrorState error={facility.error} />;
  }

  const { data, meta } = facility.data;
  const fullAddress = `${data.prefecture.label}${data.address}`;
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${fullAddress} ${data.name}`,
  )}`;

  return (
    <>
      <title>{`${data.name} | 医療施設マスタ検索`}</title>
      <Link href="/" className="text-sm text-muted hover:text-accent">
        ← 施設検索
      </Link>

      <header className="mt-4 mb-8">
        <p className="text-sm font-bold text-accent">
          {data.institution_type.label}（{data.bureau.label}）
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-3 border-b-2 border-accent pb-2">
          <h1 className="text-2xl font-bold tracking-tight text-accent sm:text-3xl">{data.name}</h1>
          <StatusBadge status={data.status} />
        </div>
      </header>

      <section>
        <SectionHeading>基本情報</SectionHeading>
        <div className="mt-3 overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th className="w-24 sm:w-36">項目</th>
                <th>内容</th>
              </tr>
            </thead>
            <tbody>
              <Row label="所在地">
                {data.postal_code && <span className="mr-2">〒{data.postal_code}</span>}
                {fullAddress}
                <a href={mapUrl} target="_blank" rel="noopener noreferrer" className={`ml-3 ${linkClass}`}>
                  地図 ↗
                </a>
              </Row>
              <Row label="電話番号">
                {data.phone_number ? (
                  <a href={`tel:${data.phone_number}`} className={linkClass}>
                    {data.phone_number}
                  </a>
                ) : (
                  "—"
                )}
              </Row>
              <Row label="医療機関コード">{data.medical_institution_code ?? data.facility_code}</Row>
              <Row label="指定年月日">{formatDate(data.designated_on)}</Row>
              <Row label="病床数">{formatBedCounts(data.bed_counts)}</Row>
              <Row label="診療科">
                {data.department_categories.length > 0 ? (
                  <DepartmentTags departments={data.department_categories} />
                ) : (
                  "—"
                )}
              </Row>
            </tbody>
          </table>
        </div>
        <p className="mt-1 text-xs text-muted">※ 診療科は、公開データの診療科名を大分類にまとめたものです。</p>
      </section>

      <section className="mt-10">
        <SectionHeading>地図</SectionHeading>
        {data.location ? (
          <>
            <FacilityMap
              center={data.location}
              // 町丁目 is only the town's representative point, so show more around it.
              zoom={data.location.level.code === townLevel ? 15 : 17}
              markers={[{ id: data.id, ...data.location, title: data.name, detail: fullAddress }]}
              highlightedId={data.id}
              className="mt-3 h-72 sm:h-96"
            />
            <p className="mt-1 text-xs leading-5 text-muted">
              {data.location.level.code === medicalInfoNetLevel ? (
                <>
                  ※ 位置：厚生労働省「医療情報ネット」が公開する座標です（住所からは町丁目までしか求められなかったため）。建物の位置とずれることがあります。
                </>
              ) : (
                <>
                  ※ 位置の精度：{data.location.level.label}
                  {data.location.level.code === townLevel && "（町や大字の中心付近で、施設の位置ではありません）"}
                  。住所からデジタル庁のアドレス・ベース・レジストリで求めた位置で、建物の位置とずれることがあります。
                </>
              )}
            </p>
            <p className="mt-2 flex flex-col gap-1 text-sm sm:flex-row sm:gap-6">
              <Link
                href={`/nearby?lat=${data.location.latitude}&lng=${data.location.longitude}`}
                className={linkClass}
              >
                この周辺の施設を地図で探す →
              </Link>
              {data.institution_type.code !== hospitalType && (
                <Link
                  href={`/nearby?lat=${data.location.latitude}&lng=${data.location.longitude}&institution_type=${hospitalType}&radius=5000`}
                  className={linkClass}
                >
                  近くの病院（連携先の候補）を探す →
                </Link>
              )}
            </p>
          </>
        ) : (
          <div className="mt-3">
            <EmptyState>この施設は、住所から位置を求められませんでした。</EmptyState>
          </div>
        )}
      </section>

      {data.designation_history && data.designation_history.length > 0 && (
        <section className="mt-10">
          <SectionHeading>指定の履歴</SectionHeading>
          <div className="mt-3 overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th className="w-24 sm:w-36">年月日</th>
                  <th>登録理由</th>
                </tr>
              </thead>
              <tbody>
                {data.designation_history.map((entry) => (
                  <tr key={`${entry.date}-${entry.reason}`}>
                    <td className="whitespace-nowrap">
                      <time dateTime={entry.date ?? undefined}>{formatDate(entry.date)}</time>
                    </td>
                    <td>{entry.reason ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="mt-10">
        <SectionHeading>変更履歴</SectionHeading>
        <p className="mt-2 text-sm text-muted">
          毎月の公開データを比較して記録した、この施設の掲載・変更・廃止です。日付は変化が載った公開データの日付で、実際の開業日・変更日ではありません。
        </p>
        <div className="mt-3">
          {events.isPending ? (
            <LoadingState />
          ) : events.isError ? (
            <ErrorState error={events.error} />
          ) : events.data.length === 0 ? (
            <EmptyState>記録された変化はありません。</EmptyState>
          ) : (
            <ol className="space-y-3">
              {events.data.map((event) => (
                <li key={event.id}>
                  <EventItem event={event} />
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      <section className="mt-10">
        <SectionHeading>APIレスポンス</SectionHeading>
        <p className="mt-2 text-sm">
          この施設のデータは、次のAPIで取得できます（JSON）。
          <br />
          <a
            href={`${apiOrigin}/api/v1/medical-facilities/${data.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className={`font-mono break-all ${linkClass}`}
          >
            GET /api/v1/medical-facilities/{data.id} ↗
          </a>
        </p>
      </section>

      <AttributionNotice attribution={meta.attribution} />
    </>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <tr>
      <th scope="row">{label}</th>
      <td>{children}</td>
    </tr>
  );
}
