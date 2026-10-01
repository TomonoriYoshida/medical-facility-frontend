"use client";

import Link from "next/link";
import { useEffect, useSyncExternalStore } from "react";
import { useEvents } from "@/lib/api/queries";
import type { EventListQuery } from "@/lib/api/types";
import { formatLocalDate, numberFormatter } from "@/lib/format";

// Timestamps (ISO 8601). The date-only keys used before ("dashboard:lastVisit")
// can't express "after the visit", so they are left unused.
const lastVisitKey = "dashboard:lastVisitAt";
const previousVisitKey = "dashboard:previousVisitAt";
/** MedicalFacilityEventType::Created */
const createdEvent = 1;

function isToday(timestamp: string): boolean {
  return new Date(timestamp).toDateString() === new Date().toDateString();
}

/**
 * The last page load of the visit day before today's. Stored per browser only;
 * storage can be unavailable (private windows, blocked site data), which just
 * hides the panel.
 */
function readPreviousVisit(): string | null {
  try {
    const lastVisit = localStorage.getItem(lastVisitKey);
    return lastVisit !== null && !isToday(lastVisit) ? lastVisit : localStorage.getItem(previousVisitKey);
  } catch {
    return null;
  }
}

/** Shifts the visits once per day, so reloading today keeps the same "previous". */
function recordVisit(): void {
  try {
    const lastVisit = localStorage.getItem(lastVisitKey);
    if (lastVisit !== null && !isToday(lastVisit)) {
      localStorage.setItem(previousVisitKey, lastVisit);
    }
    localStorage.setItem(lastVisitKey, new Date().toISOString());
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
 * previous visit. Counted by when the API detected them (detected_since), not
 * by the publication date (occurred_on): a list dated "as of the 1st" is
 * imported days or weeks later, so it can arrive after a visit that came later
 * than its date. designated_on is older still.
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
    { ...filters, detected_since: previousVisit ?? undefined, per_page: 1 } as EventListQuery,
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

  const feedParams = new URLSearchParams({ detected_since: previousVisit });
  for (const [key, value] of Object.entries(filters)) {
    feedParams.set(key, String(value));
  }

  return (
    <p className="mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 border border-border bg-surface px-4 py-3 text-sm">
      <span>
        前回の閲覧（{formatLocalDate(previousVisit)}）以降に新しく掲載された施設：
        <span className="ml-1 text-lg font-bold text-accent">
          {newSince.data ? numberFormatter.format(newSince.data.meta.total) : "…"}
        </span>
        件
      </span>
      <Link href={`/events?${feedParams.toString()}`} className="text-accent underline underline-offset-2 hover:opacity-80">
        一覧を見る →
      </Link>
      <span className="w-full text-xs text-muted">
        前回の閲覧の後に取り込んだ公開データで、新しく見つかった施設の数です（都道府県・種別の条件だけを反映します）。
      </span>
    </p>
  );
}
