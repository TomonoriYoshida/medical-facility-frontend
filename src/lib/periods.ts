export type DateRange = { from: string; to: string };

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

/** First day of `start`'s month through the last day of `end`'s month, as YYYY-MM-DD. */
function monthRange(startYear: number, startMonth: number, endYear: number, endMonth: number): DateRange {
  const start = new Date(startYear, startMonth, 1);
  const end = new Date(endYear, endMonth + 1, 0);
  return {
    from: `${start.getFullYear()}-${pad(start.getMonth() + 1)}-01`,
    to: `${end.getFullYear()}-${pad(end.getMonth() + 1)}-${pad(end.getDate())}`,
  };
}

/** The last `months` whole months, ending with the current (still running) month. */
export function recentMonths(months: number, today: Date = new Date()): DateRange {
  const year = today.getFullYear();
  const month = today.getMonth();
  return monthRange(year, month - (months - 1), year, month);
}

/** The `months` months just before recentMonths(months), for comparison. */
export function precedingMonths(months: number, today: Date = new Date()): DateRange {
  const year = today.getFullYear();
  const month = today.getMonth();
  return monthRange(year, month - (2 * months - 1), year, month - months);
}
