"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AttributionNotice from "@/components/attribution-notice";
import EventItem from "@/components/event-item";
import Pagination, { ResultSummary } from "@/components/pagination";
import { EmptyState, ErrorState, LoadingState } from "@/components/query-state";
import { useEvents, useOptions } from "@/lib/api/queries";
import type { EventListQuery } from "@/lib/api/types";

const perPage = 20;

function toApiQuery(searchParams: URLSearchParams): EventListQuery & { page?: number } {
  const query: Record<string, string | number> = { per_page: perPage };
  const eventType = searchParams.get("event_type");
  const prefectureCode = searchParams.get("prefecture_code");
  const institutionType = searchParams.get("institution_type");
  if (eventType) {
    query.event_type = Number(eventType);
  }
  if (prefectureCode) {
    query.prefecture_code = prefectureCode;
  }
  if (institutionType) {
    query.institution_type = Number(institutionType);
  }
  const page = Number(searchParams.get("page"));
  if (Number.isInteger(page) && page > 1) {
    query.page = page;
  }
  return query as EventListQuery & { page?: number };
}

export default function EventFeed() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const options = useOptions();
  const events = useEvents(toApiQuery(searchParams));
  const optionsData = options.data;

  function setFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("page");
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    const queryString = params.toString();
    router.push(queryString ? `/events?${queryString}` : "/events");
  }

  function hrefForPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    return `/events?${params.toString()}`;
  }

  const selectClass = "rounded-lg border border-border bg-background px-3 py-2 text-sm";
  const activeEventType = searchParams.get("event_type") ?? "";

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        <div role="group" aria-label="変化の種類" className="flex flex-wrap gap-1">
          {[{ code: "", label: "すべて" }, ...(optionsData?.event_types ?? [])].map((type) => {
            const value = String(type.code);
            const isActive = activeEventType === value;
            return (
              <button
                key={value}
                type="button"
                aria-pressed={isActive}
                onClick={() => setFilter("event_type", value)}
                className={`rounded-full border px-3 py-1.5 text-sm transition-colors ${
                  isActive
                    ? "border-foreground bg-foreground text-background"
                    : "border-border hover:bg-surface"
                }`}
              >
                {type.label}
              </button>
            );
          })}
        </div>
        <div className="ml-auto flex gap-2">
          <label htmlFor="prefecture_code" className="sr-only">
            都道府県
          </label>
          {/* Keyed on options so defaultValue applies once the choices exist. */}
          <select
            key={`prefecture-${optionsData ? "ready" : "loading"}-${searchParams.get("prefecture_code")}`}
            id="prefecture_code"
            defaultValue={searchParams.get("prefecture_code") ?? ""}
            onChange={(event) => setFilter("prefecture_code", event.target.value)}
            className={selectClass}
          >
            <option value="">都道府県：すべて</option>
            {optionsData?.prefectures.map((prefecture) => (
              <option key={prefecture.code} value={prefecture.code}>
                {prefecture.label}
              </option>
            ))}
          </select>
          <label htmlFor="institution_type" className="sr-only">
            種別
          </label>
          <select
            key={`type-${optionsData ? "ready" : "loading"}-${searchParams.get("institution_type")}`}
            id="institution_type"
            defaultValue={searchParams.get("institution_type") ?? ""}
            onChange={(event) => setFilter("institution_type", event.target.value)}
            className={selectClass}
          >
            <option value="">種別：すべて</option>
            {optionsData?.institution_types.map((type) => (
              <option key={type.code} value={type.code}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <section aria-live="polite" className="mt-6">
        {events.isPending ? (
          <LoadingState />
        ) : events.isError ? (
          <ErrorState error={events.error} />
        ) : (
          <>
            <ResultSummary meta={events.data.meta} />
            {events.data.data.length === 0 ? (
              <div className="mt-4">
                <EmptyState>
                  条件に一致する変化はまだありません。
                  <br />
                  変化は毎月の公開データを前回分と比較して検知するため、取込開始直後は表示されません。
                  <br />
                  <Link
                    href="/?designation_reason=新規&sort=-designated_on"
                    className="mt-3 inline-block text-accent hover:underline"
                  >
                    指定年月日が新しい「新規」の施設を見る →
                  </Link>
                </EmptyState>
              </div>
            ) : (
              <ol
                className={`mt-4 space-y-3 transition-opacity ${
                  events.isPlaceholderData ? "opacity-60" : ""
                }`}
              >
                {events.data.data.map((event) => (
                  <li key={event.id}>
                    <EventItem event={event} showFacility />
                  </li>
                ))}
              </ol>
            )}
            <Pagination meta={events.data.meta} hrefForPage={hrefForPage} />
            <AttributionNotice attribution={events.data.meta.attribution} />
          </>
        )}
      </section>
    </>
  );
}
