"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", label: "施設検索" },
  { href: "/nearby", label: "近くの施設" },
  { href: "/events", label: "新規・廃止・変更" },
  { href: "/about", label: "APIについて" },
] as const;

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="bg-navy text-white">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
        <Link href="/" className="font-bold tracking-tight">
          <span className="mr-2 font-mono text-xs font-normal text-white/70">API Demo</span>
          医療施設マスタ検索
        </Link>
        <nav>
          {/* Four items: keep each label on one line and let the list wrap on phones. */}
          <ul className="flex flex-wrap gap-x-1 text-sm whitespace-nowrap">
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
                    className={`block border-b-2 px-2 py-1.5 transition-colors sm:px-3 ${
                      isActive
                        ? "border-white font-bold text-white"
                        : "border-transparent text-white/75 hover:text-white"
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
