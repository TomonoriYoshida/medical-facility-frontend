"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useRef } from "react";
import AttributionNotice from "@/components/attribution-notice";
import { SectionHeading } from "@/components/headings";
import FacilityMap, { type MapMarker } from "@/components/map/facility-map";
import { EmptyState, ErrorState, LoadingState } from "@/components/query-state";
import { useFacilities, useFacilityStats, useOptions } from "@/lib/api/queries";
import type { FacilityListQuery, StatsQuery } from "@/lib/api/types";
import { hasDepartmentFilter } from "@/lib/departments";
import { numberFormatter } from "@/lib/format";
import { recentMonths } from "@/lib/periods";
import FilterSelect from "./filter-select";
import { useDashboardParams } from "./use-dashboard-params";

/** MedicalFacilityStatus::Active: competitors are the facilities still designated. */
const activeStatus = 1;
const openingMonths = 12;
/** The list API's per_page limit; the map shows at most this many. */
const maxMapFacilities = 100;

export default function AreasTab() {
  const { get, update } = useDashboardParams();
  const options = useOptions();
  const panelRef = useRef<HTMLElement>(null);

  const prefectureCode = get("prefecture_code");
  const institutionType = get("institution_type");
  const area = get("area");
  const openingRange = recentMonths(openingMonths);

  const filters: Record<string, string | number> = {};
  if (prefectureCode) {
    filters.prefecture_code = prefectureCode;
  }
  if (institutionType) {
    filters.institution_type = Number(institutionType);
  }
  if (get("department_category") && hasDepartmentFilter(institutionType)) {
    filters.department_category = Number(get("department_category"));
  }

  const enabled = prefectureCode !== "";
  const facilities = useFacilityStats(
    { ...filters, status: activeStatus, group_by: "municipality" } as StatsQuery,
    { enabled },
  );
  const openings = useFacilityStats(
    {
      ...filters,
      group_by: "municipality",
      designation_reason: "新規",
      designated_from: openingRange.from,
      designated_to: openingRange.to,
    } as StatsQuery,
    { enabled },
  );

  const openingsByArea = new Map(openings.data?.data.map((group) => [group.key, group.count]));
  const rows = facilities.data?.data ?? [];
  const maxCount = Math.max(1, ...rows.map((row) => row.count));
  const selected = rows.find((row) => row.key === area);

  function selectArea(code: string) {
    update({ area: code });
    panelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-x-3 gap-y-2 border border-border bg-surface p-4 md:grid-cols-3">
        <FilterSelect
          id="prefecture_code"
          label="都道府県"
          value={prefectureCode}
          allLabel="選んでください"
          options={options.data?.prefectures.map((p) => ({ value: p.code, label: p.label }))}
          onChange={(value) => update({ prefecture_code: value, area: null })}
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

      {!enabled ? (
        <div className="mt-6">
          <EmptyState>都道府県を選ぶと、市区町村ごとの施設の数を比べられます。</EmptyState>
        </div>
      ) : facilities.isError ? (
        <div className="mt-6">
          <ErrorState error={facilities.error} />
        </div>
      ) : !facilities.data ? (
        <LoadingState />
      ) : (
        <>
          <section ref={panelRef} className="mt-6 scroll-mt-4">
            <SectionHeading>
              {selected ? `${selected.label ?? ""}の施設` : "市区町村を選ぶと地図に表示します"}
            </SectionHeading>
            {selected && selected.key !== null && (
              <AreaMap municipalityCode={String(selected.key)} filters={filters} />
            )}
          </section>

          <section className="mt-10">
            <SectionHeading>市区町村ごとの施設の数</SectionHeading>
            <p className="mt-2 text-sm text-muted">
              指定中の施設の多い順です。同じ種別・診療科の施設の数は、開業するときの競合の多さの目安になります（人口あたりではありません）。
            </p>
            {rows.length === 0 ? (
              <div className="mt-3">
                <EmptyState>条件に一致する施設はありません。</EmptyState>
              </div>
            ) : (
              <div className={`mt-3 overflow-x-auto transition-opacity ${facilities.isPlaceholderData ? "opacity-60" : ""}`}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>市区町村</th>
                      <th>指定中の施設</th>
                      <th>直近{openingMonths}か月の新規開業</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, index) => (
                      <tr key={row.key ?? `unknown-${index}`} className={row.key === area ? "font-bold" : undefined}>
                        <th scope="row">
                          {row.key === null ? (
                            <span className="text-muted">判定できない施設</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => selectArea(String(row.key))}
                              aria-pressed={row.key === area}
                              className="text-accent underline underline-offset-2 hover:opacity-80"
                            >
                              {row.label}
                            </button>
                          )}
                        </th>
                        <td className="w-1/2">
                          <span className="flex items-center gap-2">
                            <span
                              aria-hidden
                              className="h-3 shrink-0 rounded-r-[4px] bg-accent"
                              style={{ width: `${(row.count / maxCount) * 75}%` }}
                            />
                            <span className="tabular-nums">{numberFormatter.format(row.count)}</span>
                          </span>
                        </td>
                        <td className="text-right tabular-nums">
                          {/* Not the previous filters' counts while the new ones load. */}
                          {openings.data && !openings.isPlaceholderData
                            ? numberFormatter.format(openingsByArea.get(row.key) ?? 0)
                            : "…"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <AttributionNotice attribution={facilities.data.meta.attribution} />
        </>
      )}
    </>
  );
}

function AreaMap({
  municipalityCode,
  filters,
}: {
  municipalityCode: string;
  filters: Record<string, string | number>;
}) {
  const router = useRouter();
  const facilities = useFacilities({
    ...filters,
    municipality_code: municipalityCode,
    status: activeStatus,
    per_page: maxMapFacilities,
  } as FacilityListQuery);

  const markers = useMemo<MapMarker[]>(
    () =>
      (facilities.data?.data ?? []).flatMap((facility) =>
        facility.location
          ? [
              {
                id: facility.id,
                latitude: facility.location.latitude,
                longitude: facility.location.longitude,
                title: facility.name,
                detail: facility.institution_type.label,
              },
            ]
          : [],
      ),
    [facilities.data],
  );

  if (facilities.isError) {
    return (
      <div className="mt-3">
        <ErrorState error={facilities.error} />
      </div>
    );
  }
  // Placeholder data would be the previously selected municipality's facilities.
  if (!facilities.data || facilities.isPlaceholderData) {
    return <LoadingState label="地図を準備中…" />;
  }
  if (markers.length === 0) {
    return (
      <div className="mt-3">
        <EmptyState>地図に表示できる施設がありません。</EmptyState>
      </div>
    );
  }

  // The facilities' average position stands in for the municipality's center.
  const center = {
    latitude: markers.reduce((sum, marker) => sum + marker.latitude, 0) / markers.length,
    longitude: markers.reduce((sum, marker) => sum + marker.longitude, 0) / markers.length,
  };
  const nearbyParams = new URLSearchParams({
    lat: center.latitude.toFixed(5),
    lng: center.longitude.toFixed(5),
  });
  for (const key of ["institution_type", "department_category"]) {
    if (filters[key] !== undefined) {
      nearbyParams.set(key, String(filters[key]));
    }
  }
  const total = facilities.data.meta.total;

  return (
    <>
      <FacilityMap
        // A new municipality is a new map, centered on its own facilities.
        key={municipalityCode}
        center={center}
        zoom={13}
        markers={markers}
        onMarkerSelect={(id) => router.push(`/facility?id=${id}`)}
        className="mt-3 h-72 sm:h-96"
      />
      <p className="mt-1 text-xs text-muted">
        指定中の施設 {numberFormatter.format(total)}件
        {total > maxMapFacilities && `のうち${maxMapFacilities}件`}
        を表示しています。位置がわからない施設は表示されません。
      </p>
      <p className="mt-2 text-sm">
        <Link href={`/nearby?${nearbyParams.toString()}`} className="text-accent underline underline-offset-2 hover:opacity-80">
          この地域の中心付近で、近くの施設をさらに探す →
        </Link>
      </p>
    </>
  );
}
