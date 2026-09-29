"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "施設検索" },
  { href: "/events", label: "変更履歴" },
  { href: "/about", label: "APIについて" },
] as const;

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="border-b border-border">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-4 sm:px-6">
        <Link href="/" className="font-semibold tracking-tight">
          <span className="mr-2 font-mono text-sm text-accent">API Demo</span>
          医療施設マスタ検索
        </Link>
        <nav>
          <ul className="flex gap-1 text-sm">
            {navItems.map((item) => {
              // /facility is reached from search results, so it keeps 施設検索 active.
              const isActive =
                item.href === "/"
                  ? pathname === "/" || pathname.startsWith("/facility")
                  : pathname.startsWith(item.href);
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={isActive ? "page" : undefined}
                    className={`rounded-lg px-3 py-2 transition-colors ${
                      isActive
                        ? "bg-surface font-medium text-foreground"
                        : "text-muted hover:text-foreground"
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}
