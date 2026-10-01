"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { hasDepartmentFilter } from "@/lib/departments";

export type Changes = Record<string, string | null>;

/**
 * The dashboard keeps its filters in the URL (shareable, back/forward work).
 * `update` merges changes, drops empty values, and resets what a filter change
 * invalidates: the page of the list, and the department when the type has none.
 */
export function useDashboardParams() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function update(changes: Changes) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(changes)) {
      if (value === null || value === "") {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    }
    if (!("page" in changes)) {
      params.delete("page");
    }
    if (!hasDepartmentFilter(params.get("institution_type"))) {
      params.delete("department_category");
    }
    const queryString = params.toString();
    router.push(queryString ? `/dashboard?${queryString}` : "/dashboard", { scroll: false });
  }

  return {
    get: (key: string) => searchParams.get(key) ?? "",
    searchParams,
    update,
  };
}
