import type { Metadata } from "next";
import { Suspense } from "react";
import { PageTitle } from "@/components/headings";
import { LoadingState } from "@/components/query-state";
import EventFeed from "./event-feed";

export const metadata: Metadata = {
  title: "新規・廃止・変更",
};

export default function EventsPage() {
  return (
    <>
      <PageTitle
        lead={
          <p>
            毎月の公開データを前回と比較して検知した、全国の施設の新規掲載・廃止・内容の変更です。
            日付は変化が載った公開データの日付で、実際の開業日・廃止日ではありません。
          </p>
        }
      >
        新規・廃止・変更
      </PageTitle>
      <Suspense fallback={<LoadingState />}>
        <EventFeed />
      </Suspense>
    </>
  );
}
