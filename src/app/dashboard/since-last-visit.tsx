"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import { useEvents } from "@/lib/api/queries";
import type { EventListQuery } from "@/lib/api/types";
import { formatDate, numberFormatter } from "@/lib/format";

const lastVisitKey = "dashboard:lastVisit";
const previousVisitKey = "dashboard:previousVisit";
/** MedicalFacilityEventType::Created */
const createdEvent = 1;

function today(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

/**
 * The day of the visit before today's. Stored per browser only; storage can be
 * unavailable (private windows, blocked site data), which just hides the panel.
 */
function readPreviousVisit(): string | null {
  try {
    const lastVisit = localStorage.getItem(lastVisitKey);
    return lastVisit !== null && lastVisit !== today() ? lastVisit : localStorage.getItem(previousVisitKey);
  } catch {
    return null;
  }
}

/** Shifts the dates once per day, so reloading today keeps the same "previous". */
function recordVisit(): void {
  try {
    const lastVisit = localStorage.getItem(lastVisitKey);
    if (lastVisit !== today()) {
      if (lastVisit !== null) {
        localStorage.setItem(previousVisitKey, lastVisit);
      }
      localStorage.setItem(lastVisitKey, today());
    }
  } catch {
    // Storage unavailable: nothing to remember.
  }
}

type Props = {
  prefectureCode: string;
  institutionType: string;
};

/**
 * Facilities that newly appeared in the published lists since the visitor's
 * previous visit. Uses the event feed (when a facility first showed up in the
 * data), not designated_on, which can be months older than its publication.
 */
/** The stored dates only change in recordVisit, after the value has been read. */
function subscribe(): () => void {
  return () => {};
}

export default function SinceLastVisit({ prefectureCode, institutionType }: Props) {
  // undefined on the server (no localStorage), so the server and the first
  // client render agree and the panel appears only once the browser knows.
  const previousVisit = useSyncExternalStore(subscribe, readPreviousVisit, () => undefined);

  useEffect(() => {
    recordVisit();
  }, []);

  const filters: Record<string, string | number> = { event_type: createdEvent };
  if (prefectureCode) {
    filters.prefecture_code = prefectureCode;
  }
  if (institutionType) {
    filters.institution_type = Number(institutionType);
  }
  const newSince = useEvents(
    { ...filters, occurred_from: previousVisit ?? undefined, per_page: 1 } as EventListQuery,
    { enabled: typeof previousVisit === "string" },
  );

  if (previousVisit === undefined) {
    return null;
  }
  if (previousVisit === null) {
    return (
      <p className="mt-3 border border-border bg-surface px-4 py-3 text-sm text-muted">
        次回からは、前回の閲覧以降に新しく掲載された施設の数をここに表示します（この端末のブラウザに閲覧日を記録します）。
      </p>
    );
  }

  const feedParams = new URLSearchParams({ occurred_from: previousVisit });
  for (const [key, value] of Object.entries(filters)) {
    feedParams.set(key, String(value));
  }

  return (
    <p className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 border border-border bg-surface px-4 py-3 text-sm">
      <span>
        前回の閲覧（{formatDate(previousVisit)}）以降に新しく掲載された施設：
        <span className="ml-1 text-lg font-bold text-accent">
          {newSince.data ? numberFormatter.format(newSince.data.meta.total) : "…"}
        </span>
        件
      </span>
      <Link href={`/events?${feedParams.toString()}`} className="text-accent underline underline-offset-2 hover:opacity-80">
        一覧を見る →
      </Link>
      <span className="w-full text-xs text-muted">
        毎月の公開データで新しく見つかった施設の数です（都道府県・種別の条件だけを反映します）。
      </span>
    </p>
  );
}
