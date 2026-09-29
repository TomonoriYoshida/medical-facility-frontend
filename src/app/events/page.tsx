import type { Metadata } from "next";
import { Suspense } from "react";
import { LoadingState } from "@/components/query-state";
import EventFeed from "./event-feed";

export const metadata: Metadata = {
  title: "変更履歴",
};

export default function EventsPage() {
  return (
    <>
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">変更履歴</h1>
        <p className="mt-2 leading-7 text-muted">
          毎月の公開データを前回と比較して検知した、全国の施設の新規掲載・廃止・内容の変更です。
          日付は変化が載った公開データの日付で、実際の開業日・廃止日ではありません。
        </p>
      </header>
      <Suspense fallback={<LoadingState />}>
        <EventFeed />
      </Suspense>
    </>
  );
}
