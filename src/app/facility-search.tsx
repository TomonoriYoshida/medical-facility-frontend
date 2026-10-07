"use client";

import { useRouter, useSearchParams } from "next/navigation";
import type { FormEvent } from "react";
import AttributionNotice from "@/components/attribution-notice";
import FacilityCard from "@/components/facility-card";
import Pagination, { ResultSummary } from "@/components/pagination";
import { EmptyState, ErrorState, LoadingState } from "@/components/query-state";
import { useFacilities, useOptions } from "@/lib/api/queries";
import type { FacilityListQuery } from "@/lib/api/types";
import { hasDepartmentFilter } from "@/lib/departments";

const perPage = 20;

/** The API's limit on space-separated words in `q`. */
const maxKeywordWords = 5;

const filterKeys = [
  "q",
  "prefecture_code",
  "institution_type",
  "department_category",
  "status",
  "designation_reason",
  "sort",
] as const;


const labelClass = "block text-xs font-bold text-accent";

const sortOptions = [
  { value: "", label: "標準（コード順）" },
  { value: "-designated_on", label: "指定年月日が新しい順" },
  { value: "designated_on", label: "指定年月日が古い順" },
  { value: "-updated_at", label: "内容の更新が新しい順" },
];

function toApiQuery(searchParams: URLSearchParams): FacilityListQuery & { page?: number } {
  // Counting stops past the 10,000 rows page numbers reach; the summary
  // then reads "10,000 件以上" (total=capped).
  const query: Record<string, string | number> = { per_page: perPage, total: "capped" };
  for (const key of filterKeys) {
    const value = searchParams.get(key);
    if (value) {
      query[key] = ["institution_type", "department_category", "status"].includes(key)
        ? Number(value)
        : value;
    }
  }
  // Otherwise a hidden department filter would silently empty the results.
  if (!hasDepartmentFilter(searchParams.get("institution_type"))) {
    delete query.department_category;
  }
  const page = Number(searchParams.get("page"));
  if (Number.isInteger(page) && page > 1) {
    query.page = page;
  }
  return query as FacilityListQuery & { page?: number };
}

export default function FacilitySearch() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const options = useOptions();
  const facilities = useFacilities(toApiQuery(searchParams));

  function search(form: HTMLFormElement) {
    // The API rejects more than five words with an English 422, so stop here in Japanese.
    const keywordInput = form.elements.namedItem("q");
    if (keywordInput instanceof HTMLInputElement) {
      const wordCount = keywordInput.value.split(/[\s　]+/).filter(Boolean).length;
      keywordInput.setCustomValidity(
        wordCount > maxKeywordWords ? `キーワードは${maxKeywordWords}語までにしてください。` : "",
      );
      if (!keywordInput.reportValidity()) {
        return;
      }
    }

    const params = new URLSearchParams();
    for (const [key, value] of new FormData(form)) {
      if (typeof value === "string" && value.trim() !== "") {
        params.set(key, value.trim());
      }
    }
    // The department select is still in the form when the type changes to one without it.
    if (!hasDepartmentFilter(params.get("institution_type"))) {
      params.delete("department_category");
    }
    const queryString = params.toString();
    router.push(queryString ? `/?${queryString}` : "/");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    search(event.currentTarget);
  }

  function hrefForPage(page: number) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    return `/?${params.toString()}`;
  }

  const selectClass =
    "mt-1 w-full rounded-sm border border-border bg-background px-2 py-1.5 text-sm focus:border-accent focus:outline-none";
  const optionsData = options.data;
  const showsDepartmentFilter = hasDepartmentFilter(searchParams.get("institution_type"));

  return (
    <>
      <form
        // Remount on URL change so back/forward navigation resets the fields,
        // and once options arrive so the selects' defaultValue can match them.
        key={`${searchParams.toString()}|${optionsData ? "ready" : "loading"}`}
        onSubmit={handleSubmit}
        className="border border-border bg-surface p-4 sm:p-5"
        role="search"
      >
        <label htmlFor="q" className={labelClass}>
          キーワード
        </label>
        <div className="mt-1 flex gap-2">
          <input
            id="q"
            name="q"
            type="search"
            defaultValue={searchParams.get("q") ?? ""}
            placeholder="施設名・住所の一部。空白で区切ると複数語（例: 札幌 眼科）"
            maxLength={255}
            onInput={(event) => event.currentTarget.setCustomValidity("")}
            className="min-w-0 flex-1 rounded-sm border border-border bg-background px-3 py-2 focus:border-accent focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-sm bg-navy px-6 py-2 text-sm font-bold text-white transition-opacity hover:opacity-85"
          >
            検索
          </button>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 md:grid-cols-3">
          <FilterSelect
            name="prefecture_code"
            label="都道府県"
            defaultValue={searchParams.get("prefecture_code")}
            options={optionsData?.prefectures.map((p) => ({ value: p.code, label: p.label }))}
            className={selectClass}
            onChange={search}
          />
          <FilterSelect
            name="institution_type"
            label="種別"
            defaultValue={searchParams.get("institution_type")}
            options={optionsData?.institution_types.map((t) => ({ value: String(t.code), label: t.label }))}
            className={selectClass}
            onChange={search}
          />
          {showsDepartmentFilter && (
            <FilterSelect
              name="department_category"
              label="診療科"
              defaultValue={searchParams.get("department_category")}
              options={optionsData?.department_categories.map((d) => ({
                value: String(d.code),
                label: d.label,
              }))}
              className={selectClass}
              onChange={search}
            />
          )}
          <FilterSelect
            name="status"
            label="指定状態"
            defaultValue={searchParams.get("status")}
            options={optionsData?.statuses.map((s) => ({ value: String(s.code), label: s.label }))}
            className={selectClass}
            onChange={search}
          />
          <FilterSelect
            name="designation_reason"
            label="登録理由"
            defaultValue={searchParams.get("designation_reason")}
            options={optionsData?.designation_reasons.map((reason) => ({ value: reason, label: reason }))}
            className={selectClass}
            onChange={search}
          />
          <div>
            <label htmlFor="sort" className={labelClass}>
              並び順
            </label>
            <select
              id="sort"
              name="sort"
              defaultValue={searchParams.get("sort") ?? ""}
              onChange={(event) => event.currentTarget.form && search(event.currentTarget.form)}
              className={selectClass}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        {options.isError && (
          <p className="mt-2 text-xs text-danger">絞り込みの選択肢を読み込めませんでした。</p>
        )}
      </form>

      <section aria-live="polite" className="mt-6">
        {facilities.isPending ? (
          <LoadingState label="検索中…" />
        ) : facilities.isError ? (
          <ErrorState error={facilities.error} />
        ) : (
          <>
            <div className="flex min-h-6 items-center justify-between gap-4">
              <ResultSummary meta={facilities.data.meta} />
              {facilities.isPlaceholderData && (
                <span role="status" className="text-xs text-muted">
                  更新中…
                </span>
              )}
            </div>
            {facilities.data.data.length === 0 ? (
              <div className="mt-4">
                <EmptyState>条件に一致する施設は見つかりませんでした。条件を変えてお試しください。</EmptyState>
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
            <Pagination meta={facilities.data.meta} hrefForPage={hrefForPage} />
            <AttributionNotice attribution={facilities.data.meta.attribution} />
          </>
        )}
      </section>
    </>
  );
}

type FilterSelectProps = {
  name: string;
  label: string;
  defaultValue: string | null;
  options: { value: string; label: string }[] | undefined;
  className: string;
  onChange: (form: HTMLFormElement) => void;
};

function FilterSelect({ name, label, defaultValue, options, className, onChange }: FilterSelectProps) {
  return (
    <div>
      <label htmlFor={name} className={labelClass}>
        {label}
      </label>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue ?? ""}
        onChange={(event) => event.currentTarget.form && onChange(event.currentTarget.form)}
        className={className}
      >
        <option value="">すべて</option>
        {/* Until options load, keep the URL's value in the form so a submit doesn't drop it. */}
        {options
          ? options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))
          : defaultValue && <option value={defaultValue}>…</option>}
      </select>
    </div>
  );
}
