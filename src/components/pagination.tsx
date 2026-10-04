"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, type ReactNode, useState } from "react";
import type { PaginationMeta } from "@/lib/api/types";
import { numberFormatter } from "@/lib/format";
import { pageItems } from "@/lib/pagination";

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
  const current = meta.current_page;

  return (
    <nav aria-label="ページ送り" className="mt-8 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <StepLink href={current > 1 ? hrefForPage(current - 1) : null} label="前のページへ">
          ‹<span className="hidden sm:inline"> 前へ</span>
        </StepLink>
        {/* Two pages either side on wider screens, one on phones to fit the width. */}
        <PageNumbers className="hidden sm:flex" current={current} last={lastReachablePage} siblings={2} hrefForPage={hrefForPage} />
        <PageNumbers className="flex sm:hidden" current={current} last={lastReachablePage} siblings={1} hrefForPage={hrefForPage} />
        <StepLink href={current < lastReachablePage ? hrefForPage(current + 1) : null} label="次のページへ">
          <span className="hidden sm:inline">次へ </span>›
        </StepLink>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 text-sm text-muted">
        <span>
          {numberFormatter.format(current)} / {numberFormatter.format(meta.last_page)} ページ
          {isCapped && `（表示できるのは${numberFormatter.format(maxPage)}ページまで）`}
        </span>
        {/* Typing a number beats clicking through hundreds of pages. */}
        {lastReachablePage > 7 && (
          <PageJump current={current} last={lastReachablePage} hrefForPage={hrefForPage} />
        )}
      </div>

      {isCapped && current >= lastReachablePage && (
        <p className="text-right text-xs text-muted">
          ページ送りで表示できるのは最初の{numberFormatter.format(maxPage * meta.per_page)}件までです。条件を絞り込んでください。
        </p>
      )}
    </nav>
  );
}

const boxClass = "inline-flex h-9 min-w-9 items-center justify-center rounded-sm border px-2 text-sm";

function StepLink({ href, label, children }: { href: string | null; label: string; children: ReactNode }) {
  if (href === null) {
    return (
      <span aria-hidden="true" className={`${boxClass} border-border text-muted opacity-60 sm:px-4`}>
        {children}
      </span>
    );
  }
  return (
    <Link
      href={href}
      rel="nofollow"
      aria-label={label}
      className={`${boxClass} border-accent font-bold text-accent transition-colors hover:bg-band sm:px-4`}
    >
      {children}
    </Link>
  );
}

function PageNumbers({
  className,
  current,
  last,
  siblings,
  hrefForPage,
}: {
  className: string;
  current: number;
  last: number;
  siblings: number;
  hrefForPage: (page: number) => string;
}) {
  return (
    <ul className={`${className} items-center gap-1`}>
      {pageItems(current, last, siblings).map((item) =>
        item.type === "gap" ? (
          <li key={item.key} aria-hidden="true" className="px-1 text-sm text-muted">
            …
          </li>
        ) : (
          <li key={item.page}>
            {item.page === current ? (
              <span aria-current="page" className={`${boxClass} border-accent bg-accent font-bold text-white`}>
                {numberFormatter.format(item.page)}
              </span>
            ) : (
              <Link
                href={hrefForPage(item.page)}
                // Each page is just another view of the same search; keep crawlers from walking them.
                rel="nofollow"
                aria-label={`${item.page}ページ目へ`}
                className={`${boxClass} border-border text-foreground transition-colors hover:border-accent hover:text-accent`}
              >
                {numberFormatter.format(item.page)}
              </Link>
            )}
          </li>
        ),
      )}
    </ul>
  );
}

function PageJump({
  current,
  last,
  hrefForPage,
}: {
  current: number;
  last: number;
  hrefForPage: (page: number) => string;
}) {
  const router = useRouter();
  const [value, setValue] = useState("");

  function jump(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const page = Number(value);
    // The input's min/max/step already stop out-of-range numbers in the browser.
    if (Number.isInteger(page) && page >= 1 && page <= last && page !== current) {
      router.push(hrefForPage(page));
    }
  }

  return (
    <form onSubmit={jump} className="flex items-center gap-2">
      <label htmlFor="page-jump" className="whitespace-nowrap">
        ページ番号
      </label>
      <input
        id="page-jump"
        type="number"
        inputMode="numeric"
        min={1}
        max={last}
        step={1}
        required
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder={`1〜${last}`}
        className="h-9 w-24 rounded-sm border border-border bg-surface px-2 text-foreground"
      />
      <button
        type="submit"
        className="h-9 rounded-sm border border-accent px-3 font-bold text-accent transition-colors hover:bg-band"
      >
        移動
      </button>
    </form>
  );
}
