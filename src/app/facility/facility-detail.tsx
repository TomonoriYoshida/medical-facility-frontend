"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { ReactNode } from "react";
import AttributionNotice from "@/components/attribution-notice";
import EventItem from "@/components/event-item";
import { EmptyState, ErrorState, LoadingState } from "@/components/query-state";
import StatusBadge from "@/components/status-badge";
import { apiOrigin } from "@/lib/api/client";
import { useFacility, useFacilityEvents } from "@/lib/api/queries";
import { formatBedCounts, formatDate } from "@/lib/format";

function parseId(value: string | null): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export default function FacilityDetail() {
  const id = parseId(useSearchParams().get("id"));
  const facility = useFacility(id);
  const events = useFacilityEvents(id);

  if (id === null) {
    return (
      <EmptyState>
        施設が指定されていません。<Link href="/" className="underline">施設検索</Link>から選んでください。
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
      <Link href="/" className="text-sm text-muted hover:text-foreground">
        ← 施設検索
      </Link>

      <header className="mt-4">
        <p className="text-sm text-muted">
          {data.institution_type.label} ・ {data.bureau.label}
        </p>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{data.name}</h1>
          <StatusBadge status={data.status} />
        </div>
      </header>

      <section className="mt-8">
        <h2 className="sr-only">基本情報</h2>
        <dl className="divide-y divide-border overflow-hidden rounded-xl border border-border">
          <Row label="所在地">
            {data.postal_code && <span className="mr-2">〒{data.postal_code}</span>}
            {fullAddress}
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-3 text-sm text-accent hover:underline"
            >
              地図 ↗
            </a>
          </Row>
          <Row label="電話番号">
            {data.phone_number ? (
              <a href={`tel:${data.phone_number}`} className="font-mono hover:underline">
                {data.phone_number}
              </a>
            ) : (
              "—"
            )}
          </Row>
          <Row label="医療機関コード">
            <span className="font-mono">{data.medical_institution_code ?? data.facility_code}</span>
          </Row>
          <Row label="指定年月日">{formatDate(data.designated_on)}</Row>
          <Row label="病床数">{formatBedCounts(data.bed_counts)}</Row>
          <Row label="診療科">
            {data.department_categories.length > 0 ? (
              <ul className="flex flex-wrap gap-1.5">
                {data.department_categories.map((department) => (
                  <li
                    key={department.code}
                    className="rounded-full border border-border px-2.5 py-0.5 text-xs"
                  >
                    {department.label}
                  </li>
                ))}
              </ul>
            ) : (
              "—"
            )}
          </Row>
        </dl>
        <p className="mt-2 text-xs text-muted">
          診療科は、公開データの診療科名を大分類にまとめたものです。
        </p>
      </section>

      {data.designation_history && data.designation_history.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-semibold">指定の履歴</h2>
          <ol className="mt-3 space-y-1 text-sm">
            {data.designation_history.map((entry) => (
              <li key={`${entry.date}-${entry.reason}`} className="flex gap-4">
                <time dateTime={entry.date ?? undefined} className="w-32 shrink-0 text-muted">
                  {formatDate(entry.date)}
                </time>
                <span>{entry.reason}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-lg font-semibold">変更履歴</h2>
        <p className="mt-1 text-sm text-muted">
          毎月の公開データを比較して記録した、この施設の掲載・変更・廃止です。日付は変化が載った公開データの日付で、実際の開業日・変更日ではありません。
        </p>
        <div className="mt-4">
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

      <p className="mt-10 text-sm">
        <a
          href={`${apiOrigin}/api/v1/medical-facilities/${data.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-mono text-accent hover:underline"
        >
          GET /api/v1/medical-facilities/{data.id} ↗
        </a>
        <span className="ml-2 text-muted">この施設のAPIレスポンス（JSON）</span>
      </p>

      <AttributionNotice attribution={meta.attribution} />
    </>
  );
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid sm:grid-cols-[10rem_1fr]">
      <dt className="bg-surface px-4 pt-3 text-sm font-medium text-muted sm:py-3">{label}</dt>
      <dd className="px-4 pt-1 pb-3 sm:py-3">{children}</dd>
    </div>
  );
}
