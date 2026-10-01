"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import AttributionNotice from "@/components/attribution-notice";
import FacilityCard from "@/components/facility-card";
import FacilityMap, { type MapMarker } from "@/components/map/facility-map";
import { EmptyState, ErrorState, LoadingState } from "@/components/query-state";
import { useFacilities, useOptions } from "@/lib/api/queries";
import type { FacilityListQuery } from "@/lib/api/types";
import { hasDepartmentFilter } from "@/lib/departments";
import { formatDistance, numberFormatter } from "@/lib/format";

/** 東京駅, until the visitor picks a place. */
const defaultCenter = { latitude: 35.681236, longitude: 139.767125 };
const radiusOptions = [500, 1000, 2000, 5000];
const defaultRadius = 1000;
/** The API's per_page limit; results come nearest first. */
const maxResults = 100;
/** MedicalFacilityStatus::Active: closed facilities aren't worth finding nearby. */
const activeStatus = 1;

const labelClass = "block text-xs font-bold text-accent";
const selectClass =
  "mt-1 w-full rounded-sm border border-border bg-background px-2 py-1.5 text-sm focus:border-accent focus:outline-none";

/** The API accepts points within Japan's extent only. */
const latitudeRange = [20, 46] as const;
const longitudeRange = [122, 154] as const;

function isWithinJapan(point: { latitude: number; longitude: number }): boolean {
  return (
    point.latitude >= latitudeRange[0] &&
    point.latitude <= latitudeRange[1] &&
    point.longitude >= longitudeRange[0] &&
    point.longitude <= longitudeRange[1]
  );
}

function parseCoordinate(value: string | null, min: number, max: number): number | null {
  const number = Number(value);
  return value !== null && value !== "" && Number.isFinite(number) && number >= min && number <= max
    ? number
    : null;
}

/** About 1m; keeps the URL short and stops tiny map movements from refetching. */
function round(value: number): number {
  return Math.round(value * 1e5) / 1e5;
}

export default function NearbySearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const options = useOptions();
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const [outsideJapan, setOutsideJapan] = useState(false);

  const latitude = parseCoordinate(searchParams.get("lat"), ...latitudeRange);
  const longitude = parseCoordinate(searchParams.get("lng"), ...longitudeRange);
  const center =
    latitude !== null && longitude !== null ? { latitude, longitude } : defaultCenter;
  const radiusParam = Number(searchParams.get("radius"));
  const radius = radiusOptions.includes(radiusParam) ? radiusParam : defaultRadius;
  const institutionType = searchParams.get("institution_type");
  const showsDepartmentFilter = hasDepartmentFilter(institutionType);
  const departmentCategory = showsDepartmentFilter ? searchParams.get("department_category") : null;

  const query: FacilityListQuery = {
    latitude: center.latitude,
    longitude: center.longitude,
    radius,
    status: activeStatus,
    per_page: maxResults,
    ...(institutionType ? { institution_type: Number(institutionType) } : {}),
    ...(departmentCategory ? { department_category: Number(departmentCategory) } : {}),
  } as FacilityListQuery;
  const facilities = useFacilities(query);

  function update(changes: Record<string, string | number | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, String(value));
      }
    }
    // Replace, so panning around doesn't fill the history.
    router.replace(`/nearby?${params.toString()}`, { scroll: false });
  }

  /** Returns false (and leaves the search point as it is) outside Japan. */
  function moveTo(point: { latitude: number; longitude: number }): boolean {
    const isSearchable = isWithinJapan(point);
    setOutsideJapan(!isSearchable);
    if (!isSearchable) {
      return false;
    }
    const lat = round(point.latitude);
    const lng = round(point.longitude);
    if (lat !== round(center.latitude) || lng !== round(center.longitude)) {
      update({ lat, lng });
    }
    return true;
  }

  function locateVisitor() {
    if (!("geolocation" in navigator)) {
      setLocationError("このブラウザでは現在地を取得できません。");
      return;
    }
    setLocating(true);
    setLocationError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocating(false);
        if (!moveTo({ latitude: position.coords.latitude, longitude: position.coords.longitude })) {
          setLocationError("現在地が日本国内ではないため、探す地点を変えませんでした。");
        }
      },
      (error) => {
        setLocating(false);
        setLocationError(
          error.code === error.PERMISSION_DENIED
            ? "現在地の利用が許可されていません。地図を動かして地点を選んでください。"
            : "現在地を取得できませんでした。",
        );
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 },
    );
  }

  const results = facilities.data?.data;
  const markers = useMemo<MapMarker[]>(
    () =>
      (results ?? []).flatMap((facility) =>
        facility.location
          ? [
              {
                id: facility.id,
                latitude: facility.location.latitude,
                longitude: facility.location.longitude,
                title: facility.name,
                detail: [
                  facility.institution_type.label,
                  facility.distance !== undefined ? `約${formatDistance(facility.distance)}` : null,
                ]
                  .filter(Boolean)
                  .join("・"),
              },
            ]
          : [],
      ),
    [results],
  );

  return (
    <>
      <div className="border border-border bg-surface p-4 sm:p-5">
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 md:grid-cols-4">
          <div>
            <label htmlFor="radius" className={labelClass}>
              半径
            </label>
            <select
              id="radius"
              value={radius}
              onChange={(event) => update({ radius: event.currentTarget.value })}
              className={selectClass}
            >
              {radiusOptions.map((option) => (
                <option key={option} value={option}>
                  {formatDistance(option)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="institution_type" className={labelClass}>
              種別
            </label>
            <select
              id="institution_type"
              value={institutionType ?? ""}
              onChange={(event) => {
                const value = event.currentTarget.value;
                update({
                  institution_type: value,
                  ...(hasDepartmentFilter(value) ? {} : { department_category: null }),
                });
              }}
              className={selectClass}
            >
              <option value="">すべて</option>
              {options.data
                ? options.data.institution_types.map((type) => (
                    <option key={type.code} value={type.code}>
                      {type.label}
                    </option>
                  ))
                : institutionType && <option value={institutionType}>…</option>}
            </select>
          </div>
          {showsDepartmentFilter && (
            <div>
              <label htmlFor="department_category" className={labelClass}>
                診療科
              </label>
              <select
                id="department_category"
                value={departmentCategory ?? ""}
                onChange={(event) => update({ department_category: event.currentTarget.value })}
                className={selectClass}
              >
                <option value="">すべて</option>
                {options.data
                  ? options.data.department_categories.map((department) => (
                      <option key={department.code} value={department.code}>
                        {department.label}
                      </option>
                    ))
                  : departmentCategory && <option value={departmentCategory}>…</option>}
              </select>
            </div>
          )}
          <div className="col-span-2 flex items-end md:col-span-1">
            <button
              type="button"
              onClick={locateVisitor}
              disabled={locating}
              className="w-full rounded-sm bg-navy px-4 py-2 text-sm font-bold text-white transition-opacity hover:opacity-85 disabled:opacity-60"
            >
              {locating ? "現在地を取得中…" : "現在地を使う"}
            </button>
          </div>
        </div>
        {locationError && (
          <p role="alert" className="mt-2 text-xs text-danger">
            {locationError}
          </p>
        )}
      </div>

      <div className="relative mt-4">
        <FacilityMap
          center={center}
          zoom={15}
          radius={radius}
          markers={markers}
          onCenterChange={moveTo}
          onMarkerSelect={(id) => router.push(`/facility?id=${id}`)}
          className="h-80 sm:h-[28rem]"
        />
        {/* The search point: the map's center. */}
        <div
          aria-hidden
          className="pointer-events-none absolute top-1/2 left-1/2 z-[500] -translate-x-1/2 -translate-y-1/2 text-2xl leading-none font-bold text-danger"
        >
          +
        </div>
      </div>
      <p className="mt-1 text-xs text-muted">地図の中心（＋）から探します。地図はドラッグで移動、＋／－ボタンで拡大・縮小できます。</p>
      {outsideJapan && (
        <p role="alert" className="mt-1 text-xs text-danger">
          地図の中心が日本の範囲外のため、探す地点を変えていません。日本国内に地図を戻してください。
        </p>
      )}

      <section aria-live="polite" className="mt-6">
        {facilities.isPending ? (
          <LoadingState label="検索中…" />
        ) : facilities.isError ? (
          <ErrorState error={facilities.error} />
        ) : (
          <>
            <div className="flex min-h-6 items-center justify-between gap-4">
              <p className="text-sm text-muted">
                半径{formatDistance(radius)}以内に{" "}
                <span className="font-bold text-accent">
                  {numberFormatter.format(facilities.data.meta.total)}
                </span>{" "}
                件
                {facilities.data.meta.total > maxResults && `（近い順に${maxResults}件を表示）`}
              </p>
              {facilities.isPlaceholderData && (
                <span role="status" className="text-xs text-muted">
                  更新中…
                </span>
              )}
            </div>
            {facilities.data.data.length === 0 ? (
              <div className="mt-4">
                <EmptyState>この範囲に施設は見つかりませんでした。半径を広げるか、地図を動かしてください。</EmptyState>
              </div>
            ) : (
              <ul
                className={`mt-4 grid gap-3 transition-opacity ${
                  facilities.isPlaceholderData ? "opacity-60" : ""
                }`}
              >
                {facilities.data.data.map((facility) => (
                  <li key={facility.id}>
                    <FacilityCard facility={facility} />
                  </li>
                ))}
              </ul>
            )}
            <AttributionNotice attribution={facilities.data.meta.attribution} />
          </>
        )}
      </section>
    </>
  );
}
