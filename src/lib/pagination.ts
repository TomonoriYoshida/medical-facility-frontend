export type PageItem = { type: "page"; page: number } | { type: "gap"; key: string };

/**
 * The page numbers to show around the current page: the first and last
 * pages, `siblings` pages on each side of the current one, and a gap ("…")
 * wherever pages are left out. A gap would stand for a single page, so that
 * page is shown instead, and the list keeps the same length while the
 * current page moves near either end.
 */
export function pageItems(current: number, last: number, siblings: number): PageItem[] {
  // first + last + current + siblings on both sides + two gaps
  const slots = 2 * siblings + 5;

  if (last <= slots) {
    return range(1, last).map((page) => ({ type: "page", page }));
  }

  const nearStart = current <= siblings + 3;
  const nearEnd = current >= last - siblings - 2;

  if (nearStart) {
    return [...pages(1, slots - 2), gap("end"), page(last)];
  }

  if (nearEnd) {
    return [page(1), gap("start"), ...pages(last - (slots - 3), last)];
  }

  return [page(1), gap("start"), ...pages(current - siblings, current + siblings), gap("end"), page(last)];
}

function range(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, index) => from + index);
}

function page(number: number): PageItem {
  return { type: "page", page: number };
}

function pages(from: number, to: number): PageItem[] {
  return range(from, to).map(page);
}

function gap(key: string): PageItem {
  return { type: "gap", key };
}
