import type { Metadata } from "next";
import Link from "next/link";
import { PageTitle } from "@/components/headings";

export const metadata: Metadata = {
  title: "ページが見つかりません",
};

// Exported as 404.html, which GitHub Pages serves for any unknown path.
export default function NotFound() {
  return (
    <>
      <PageTitle lead={<p>お探しのページは、移動または削除された可能性があります。</p>}>
        ページが見つかりません
      </PageTitle>
      <Link
        href="/"
        className="inline-block rounded-sm border border-accent px-4 py-1.5 text-sm font-bold text-accent hover:bg-band"
      >
        施設検索に戻る
      </Link>
    </>
  );
}
