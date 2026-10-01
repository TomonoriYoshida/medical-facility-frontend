"use client";

import { type RefObject, useEffect, useRef, useState } from "react";
import type { ChartGroup } from "@/lib/api/types";
import { numberFormatter } from "@/lib/format";

/**
 * A round axis maximum at or above the largest count, even so that the middle
 * tick (half of it) is a whole number of facilities.
 */
function niceMax(value: number): number {
  if (value <= 2) {
    return 2;
  }
  const magnitude = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 4, 6, 8, 10].find((multiple) => multiple * magnitude >= value) ?? 10;
  return step * magnitude;
}

/**
 * X-axis labels for every `every`-th column: "2026年1月" on the first labeled
 * column of each year, "3月" otherwise, so long ranges keep their years.
 */
function tickLabels(groups: ChartGroup[], every: number): string[] {
  let labeledYear: number | null = null;
  return groups.map((group, index) => {
    if (index % every !== 0 || typeof group.key !== "string") {
      return "";
    }
    const [year, month] = group.key.split("-").map(Number);
    const label = year === labeledYear ? `${month}月` : `${year}年${month}月`;
    labeledYear = year;
    return label;
  });
}

type Props = {
  /** Monthly groups from GET /v1/stats/facilities?group_by=month, oldest first. */
  groups: ChartGroup[];
  /** What a count means, for the tooltip and the table ("新規開業"). */
  measure: string;
  /** Faded while the next filters' data loads, so the frame stays put. */
  isUpdating?: boolean;
  /** Charts shown side by side pass their common maximum, so their bars compare directly. */
  scaleMax?: number;
};

/** Room a label needs: "2025年11月" at text-xs is about 60px, plus a gap. */
const labelWidth = 66;

/**
 * The columns' width, measured: charts sit full-width or side by side, so the
 * viewport alone can't tell how much room each label has.
 */
function useWidth<T extends HTMLElement>(): [RefObject<T | null>, number | null] {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState<number | null>(null);
  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    const observer = new ResizeObserver(([entry]) => setWidth(entry.contentRect.width));
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  return [ref, width];
}

export default function MonthColumns({ groups, measure, isUpdating = false, scaleMax = 0 }: Props) {
  const [axisRef, axisWidth] = useWidth<HTMLOListElement>();
  const max = Math.max(0, ...groups.map((group) => group.count));
  const axisMax = niceMax(Math.max(max, scaleMax));
  const ticks = [axisMax, axisMax / 2, 0];
  // Label as often as the measured column width allows (at least every 12th of
  // the range until measured), so labels never collide.
  const columnWidth = axisWidth === null ? null : axisWidth / groups.length;
  const every = Math.max(
    Math.ceil(groups.length / 12),
    columnWidth === null ? 1 : Math.ceil(labelWidth / columnWidth),
  );
  // A centered label too close to the right edge would stick out of the chart.
  const fitsRight = (index: number) =>
    columnWidth === null || (groups.length - index - 0.5) * columnWidth >= labelWidth / 2;
  const labels = tickLabels(groups, every).map((label, index) => (fitsRight(index) ? label : ""));
  const peakIndex = groups.findIndex((group) => group.count === max && max > 0);

  return (
    <figure className={`transition-opacity ${isUpdating ? "opacity-60" : ""}`}>
      <div className="flex">
        {/* Y axis: round ticks, recessive. */}
        <div className="relative w-10 shrink-0 text-right text-xs text-muted tabular-nums" aria-hidden>
          {ticks.map((tick, index) => (
            <span
              key={tick}
              className="absolute right-2 -translate-y-1/2"
              style={{ top: `${(index / (ticks.length - 1)) * 100}%` }}
            >
              {numberFormatter.format(tick)}
            </span>
          ))}
        </div>
        <div className="relative h-48 flex-1 sm:h-56">
          {ticks.map((tick, index) => (
            <div
              key={tick}
              aria-hidden
              className="absolute inset-x-0 border-t border-border"
              style={{ top: `${(index / (ticks.length - 1)) * 100}%` }}
            />
          ))}
          <ol className="absolute inset-0 flex items-end gap-[2px]">
            {groups.map((group, index) => (
              <li
                key={group.key ?? index}
                // The whole column height is the hover/focus target, not just the bar.
                tabIndex={0}
                aria-label={`${group.label}：${measure}${numberFormatter.format(group.count)}件`}
                className="group relative flex h-full min-w-0 flex-1 items-end justify-center outline-none"
              >
                <div
                  className="w-full max-w-6 rounded-t-[4px] bg-accent transition-opacity group-hover:opacity-75 group-focus-visible:opacity-75"
                  style={{ height: `${(group.count / axisMax) * 100}%` }}
                />
                {index === peakIndex && (
                  <span
                    aria-hidden
                    className="absolute -translate-y-full pb-0.5 text-xs font-bold text-foreground tabular-nums group-hover:invisible"
                    style={{ bottom: `${(group.count / axisMax) * 100}%` }}
                  >
                    {numberFormatter.format(group.count)}
                  </span>
                )}
                <span
                  role="tooltip"
                  className="pointer-events-none absolute bottom-full z-10 mb-1 hidden rounded-sm border border-border bg-background px-2 py-1 text-xs whitespace-nowrap shadow-sm group-hover:block group-focus-visible:block"
                >
                  <span className="font-bold text-foreground tabular-nums">
                    {numberFormatter.format(group.count)}件
                  </span>
                  <span className="ml-1 text-muted">{group.label}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
      <ol ref={axisRef} className="ml-10 flex gap-[2px] text-xs text-muted" aria-hidden>
        {groups.map((group, index) => (
          <li key={group.key ?? index} className="flex min-w-0 flex-1 justify-center whitespace-nowrap">
            {labels[index]}
          </li>
        ))}
      </ol>
      <details className="mt-3 text-sm">
        <summary className="cursor-pointer text-accent">表で見る</summary>
        <div className="mt-2 max-h-72 overflow-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>月</th>
                <th>{measure}</th>
              </tr>
            </thead>
            <tbody>
              {groups.map((group, index) => (
                <tr key={group.key ?? index}>
                  <th scope="row">{group.label}</th>
                  <td className="text-right tabular-nums">{numberFormatter.format(group.count)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  );
}
