import Link from "next/link";
import type { PaginationMeta } from "@/lib/api/types";
import { numberFormatter } from "@/lib/format";

type Props = {
  meta: PaginationMeta;
  hrefForPage: (page: number) => string;
};

export function ResultSummary({ meta }: { meta: PaginationMeta }) {
  if (meta.total === 0) {
    return null;
  }
  return (
    <p className="text-sm text-muted">
      全 <span className="font-bold text-accent">{numberFormatter.format(meta.total)}</span> 件中{" "}
      {numberFormatter.format(meta.from ?? 0)}〜{numberFormatter.format(meta.to ?? 0)} 件を表示
    </p>
  );
}

export default function Pagination({ meta, hrefForPage }: Props) {
  if (meta.last_page <= 1) {
    return null;
  }

  // The API serves page numbers only up to meta.max_page (the first 10,000
  // results); past that it answers 422, so the list stops there. An API
  // deployed before max_page existed omits it: no cap then.
  const maxPage = (meta.max_page as number | undefined) ?? meta.last_page;
  const lastReachablePage = Math.min(meta.last_page, maxPage);
  const isCapped = meta.last_page > maxPage;

  const linkClass =
    "rounded-sm border border-accent px-4 py-1.5 text-sm font-bold text-accent transition-colors hover:bg-band";
  const disabledClass = "rounded-sm border border-border px-4 py-1.5 text-sm text-muted opacity-60";

  return (
    <nav aria-label="ページ送り" className="mt-8 flex flex-wrap items-center justify-between gap-4">
      {meta.current_page > 1 ? (
        <Link href={hrefForPage(meta.current_page - 1)} className={linkClass}>
          ← 前へ
        </Link>
      ) : (
        <span className={disabledClass}>← 前へ</span>
      )}
      <span className="text-sm text-muted">
        {numberFormatter.format(meta.current_page)} / {numberFormatter.format(meta.last_page)} ページ
      </span>
      {meta.current_page < lastReachablePage ? (
        <Link href={hrefForPage(meta.current_page + 1)} className={linkClass}>
          次へ →
        </Link>
      ) : (
        <span className={disabledClass}>次へ →</span>
      )}
      {isCapped && meta.current_page >= lastReachablePage && (
        <p className="basis-full text-right text-xs text-muted">
          ページ送りで表示できるのは最初の{numberFormatter.format(maxPage * meta.per_page)}件までです。条件を絞り込んでください。
        </p>
      )}
    </nav>
  );
}
