import type { StatsGroup } from "@/lib/api/types";
import { numberFormatter } from "@/lib/format";

type Props = {
  groups: StatsGroup[];
  /** Shown for a group whose label is null (e.g. an unresolved municipality). */
  unknownLabel: string;
  /** Makes each named row a button, e.g. to narrow the dashboard to it. */
  onSelect?: (group: StatsGroup) => void;
  isUpdating?: boolean;
};

/**
 * Horizontal bars, largest first, with the value at each bar's tip. Every value
 * is printed, so there is no tooltip to depend on.
 */
export default function RankingBars({ groups, unknownLabel, onSelect, isUpdating = false }: Props) {
  const max = Math.max(1, ...groups.map((group) => group.count));

  return (
    <ol className={`space-y-1.5 transition-opacity ${isUpdating ? "opacity-60" : ""}`}>
      {groups.map((group, index) => {
        const name = group.label ?? unknownLabel;
        const canSelect = onSelect !== undefined && group.key !== null;
        return (
          <li key={group.key ?? `unknown-${index}`} className="flex items-center gap-3 text-sm">
            <span className="w-6 shrink-0 text-right text-xs text-muted tabular-nums">{index + 1}</span>
            <span className="w-28 shrink-0 truncate sm:w-36" title={name}>
              {canSelect ? (
                <button
                  type="button"
                  onClick={() => onSelect(group)}
                  className="text-accent underline underline-offset-2 hover:opacity-80"
                >
                  {name}
                </button>
              ) : (
                <span className={group.label === null ? "text-muted" : undefined}>{name}</span>
              )}
            </span>
            <span className="flex min-w-0 flex-1 items-center gap-2">
              <span
                aria-hidden
                className="h-3 shrink-0 rounded-r-[4px] bg-accent"
                style={{ width: `${(group.count / max) * 85}%` }}
              />
              <span className="shrink-0 tabular-nums">{numberFormatter.format(group.count)}</span>
            </span>
          </li>
        );
      })}
    </ol>
  );
}
