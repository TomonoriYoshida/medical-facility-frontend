"use client";

import AttributionNotice from "@/components/attribution-notice";
import MonthColumns from "@/components/charts/month-columns";
import RankingBars from "@/components/charts/ranking-bars";
import FacilityCard from "@/components/facility-card";
import { SectionHeading } from "@/components/headings";
import Pagination from "@/components/pagination";
import { EmptyState, ErrorState, LoadingState } from "@/components/query-state";
import { useFacilities, useFacilityStats, useOptions } from "@/lib/api/queries";
import type { FacilityListQuery, StatsQuery } from "@/lib/api/types";
import { hasDepartmentFilter } from "@/lib/departments";
import { formatDate, numberFormatter } from "@/lib/format";
import { precedingMonths, recentMonths } from "@/lib/periods";
import CsvExport from "./csv-export";
import FilterSelect from "./filter-select";
import SinceLastVisit from "./since-last-visit";
import { useDashboardParams } from "./use-dashboard-params";

const periodOptions = [12, 24, 36, 60];
const defaultPeriod = 12;
const rankingSize = 15;
const listSize = 10;
const newOpeningReason = "新規";

export default function OpeningsTab() {
  const { get, searchParams, update } = useDashboardParams();
  const options = useOptions();

  const monthsParam = Number(get("months"));
  const months = periodOptions.includes(monthsParam) ? monthsParam : defaultPeriod;
  const range = recentMonths(months);
  const previous = precedingMonths(months);
  const institutionType = get("institution_type");
  const municipalityCode = get("municipality_code");
  const pageParam = Number(get("page"));
  const page = Number.isInteger(pageParam) && pageParam > 1 ? pageParam : 1;

  // 新規 = new openings; 交代 / 継承 are a new head taking over (3-4), etc.
  const reason = get("reason") || newOpeningReason;
  const isNewOpening = reason === newOpeningReason;
  const measure = isNewOpening ? "新規開業" : `登録理由「${reason}」`;

  // The same slice for every chart and the list, so their numbers agree.
  const filters: Record<string, string | number> = { designation_reason: reason };
  for (const key of ["prefecture_code", "municipality_code", "institution_type", "department_category"]) {
    const value = get(key);
    if (value && (key !== "department_category" || hasDepartmentFilter(institutionType))) {
      filters[key] = ["institution_type", "department_category"].includes(key) ? Number(value) : value;
    }
  }

  const monthly = useFacilityStats({
    ...filters,
    group_by: "month",
    designated_from: range.from,
    designated_to: range.to,
  } as StatsQuery);
  const previousPeriod = useFacilityStats({
    ...filters,
    group_by: "month",
    designated_from: previous.from,
    designated_to: previous.to,
  } as StatsQuery);
  const byMunicipality = useFacilityStats({
    ...filters,
    group_by: "municipality",
    designated_from: range.from,
    designated_to: range.to,
  } as StatsQuery);
  // The chip's name: this municipality's own row, which exists even with no openings.
  const municipalityName = useFacilityStats(
    { group_by: "municipality", municipality_code: municipalityCode } as StatsQuery,
    { enabled: municipalityCode !== "" },
  );
  const listQuery = {
    ...filters,
    designated_from: range.from,
    designated_to: range.to,
    sort: "-designated_on",
  } as FacilityListQuery;
  const openings = useFacilities({ ...listQuery, per_page: listSize, page } as FacilityListQuery & {
    page: number;
  });

  function hrefForPage(nextPage: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(nextPage));
    return `/dashboard?${params.toString()}`;
  }

  const total = monthly.data?.meta.total;
  const previousTotal = previousPeriod.data?.meta.total;
  const change =
    total !== undefined && previousTotal !== undefined && previousTotal > 0
      ? Math.round(((total - previousTotal) / previousTotal) * 100)
      : null;
  // Looked up by key: while the next ranking loads, row 0 is still another municipality.
  const municipalityLabel = municipalityName.data?.data.find((group) => group.key === municipalityCode)?.label;

  return (
    <>
      <div className="grid grid-cols-2 gap-x-3 gap-y-2 border border-border bg-surface p-4 md:grid-cols-5">
        <FilterSelect
          id="reason"
          label="登録理由"
          value={reason}
          allLabel=""
          options={(options.data?.designation_reasons ?? [newOpeningReason]).map((value) => ({
            value,
            label: value === newOpeningReason ? "新規（開業）" : value,
          }))}
          onChange={(value) => update({ reason: value === newOpeningReason ? null : value })}
        />
        <FilterSelect
          id="months"
          label="期間"
          value={String(months)}
          allLabel=""
          options={periodOptions.map((option) => ({ value: String(option), label: `直近${option}か月` }))}
          onChange={(value) => update({ months: value === String(defaultPeriod) ? null : value })}
        />
        <FilterSelect
          id="prefecture_code"
          label="都道府県"
          value={get("prefecture_code")}
          allLabel="全国"
          options={options.data?.prefectures.map((p) => ({ value: p.code, label: p.label }))}
          onChange={(value) => update({ prefecture_code: value, municipality_code: null })}
        />
        <FilterSelect
          id="institution_type"
          label="種別"
          value={institutionType}
          options={options.data?.institution_types.map((t) => ({ value: String(t.code), label: t.label }))}
          onChange={(value) => update({ institution_type: value })}
        />
        {hasDepartmentFilter(institutionType) && (
          <FilterSelect
            id="department_category"
            label="診療科"
            value={get("department_category")}
            options={options.data?.department_categories.map((d) => ({ value: String(d.code), label: d.label }))}
            onChange={(value) => update({ department_category: value })}
          />
        )}
      </div>
      {municipalityCode && (
        <p className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          <span className="bg-band px-2 py-0.5 text-accent">
            市区町村：{municipalityLabel ?? municipalityCode}
          </span>
          <button
            type="button"
            onClick={() => update({ municipality_code: null })}
            className="text-accent underline underline-offset-2 hover:opacity-80"
          >
            解除
          </button>
        </p>
      )}

      {monthly.isError ? (
        <div className="mt-6">
          <ErrorState error={monthly.error} />
        </div>
      ) : (
        <>
          <section className="mt-6" aria-live="polite">
            <SectionHeading>期間内の{measure}</SectionHeading>
            <div className="mt-3 flex flex-wrap items-end gap-x-8 gap-y-2">
              <p>
                <span className="text-5xl font-bold text-accent">
                  {total === undefined ? "—" : numberFormatter.format(total)}
                </span>
                <span className="ml-1 text-lg">件</span>
              </p>
              <dl className="text-sm text-muted">
                <div>
                  <dt className="inline">期間：</dt>
                  <dd className="inline">
                    {formatDate(range.from)}〜{formatDate(range.to)}
                  </dd>
                </div>
                <div>
                  <dt className="inline">直前の{months}か月：</dt>
                  <dd className="inline">
                    {previousTotal === undefined ? "—" : `${numberFormatter.format(previousTotal)}件`}
                    {change !== null && (
                      <span className="ml-2 font-bold text-foreground">
                        （{change > 0 ? "+" : ""}
                        {change}%）
                      </span>
                    )}
                  </dd>
                </div>
              </dl>
            </div>
            {isNewOpening && (
              <SinceLastVisit prefectureCode={get("prefecture_code")} institutionType={institutionType} />
            )}
          </section>

          <section className="mt-10">
            <SectionHeading>月別の{measure}の数</SectionHeading>
            <div className="mt-4">
              {monthly.data ? (
                <MonthColumns groups={monthly.data.data} measure={measure} isUpdating={monthly.isPlaceholderData} />
              ) : (
                <LoadingState />
              )}
            </div>
            <p className="mt-1 text-xs text-muted">※ 今月は途中までの件数です。</p>
          </section>

          {!municipalityCode && (
            <section className="mt-10">
              <SectionHeading>{measure}の多い市区町村</SectionHeading>
              <p className="mt-2 text-sm text-muted">
                上位{rankingSize}件です。市区町村名を選ぶと、ダッシュボード全体をその市区町村に絞り込みます。
              </p>
              <div className="mt-3">
                {byMunicipality.isError ? (
                  <ErrorState error={byMunicipality.error} />
                ) : !byMunicipality.data ? (
                  <LoadingState />
                ) : byMunicipality.data.data.length === 0 ? (
                  <EmptyState>期間内の{measure}はありません。</EmptyState>
                ) : (
                  <RankingBars
                    groups={byMunicipality.data.data.slice(0, rankingSize)}
                    unknownLabel="市区町村を判定できない施設"
                    isUpdating={byMunicipality.isPlaceholderData}
                    onSelect={(group) =>
                      update({
                        municipality_code: String(group.key),
                        // The first two digits of a municipality code are its prefecture.
                        prefecture_code: String(group.key).slice(0, 2),
                      })
                    }
                  />
                )}
              </div>
            </section>
          )}

          <section className="mt-10">
            <SectionHeading>{measure}の一覧</SectionHeading>
            <p className="mt-2 text-sm text-muted">指定年月日の新しい順です。</p>
            {openings.data && !openings.isPlaceholderData && (
              <CsvExport
                query={listQuery}
                total={openings.data.meta.total}
                filename={`${measure.replace(/[「」]/g, "")}_${range.from}_${range.to}.csv`}
              />
            )}
            <div className="mt-3">
              {openings.isError ? (
                <ErrorState error={openings.error} />
              ) : !openings.data ? (
                <LoadingState />
              ) : openings.data.data.length === 0 ? (
                <EmptyState>期間内の{measure}はありません。</EmptyState>
              ) : (
                <>
                  <ul className={`grid gap-3 transition-opacity ${openings.isPlaceholderData ? "opacity-60" : ""}`}>
                    {openings.data.data.map((facility) => (
                      <li key={facility.id}>
                        <FacilityCard facility={facility} />
                      </li>
                    ))}
                  </ul>
                  <Pagination meta={openings.data.meta} hrefForPage={hrefForPage} />
                </>
              )}
            </div>
          </section>

          {monthly.data && <AttributionNotice attribution={monthly.data.meta.attribution} />}
        </>
      )}
    </>
  );
}
