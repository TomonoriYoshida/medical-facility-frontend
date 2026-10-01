import type { Metadata } from "next";
import { Suspense } from "react";
import { PageTitle } from "@/components/headings";
import { LoadingState } from "@/components/query-state";
import NearbySearch from "./nearby-search";

export const metadata: Metadata = {
  title: "近くの施設",
};

export default function NearbyPage() {
  return (
    <>
      <PageTitle
        lead={
          <p>
            地図の中心から指定した半径の中にある、指定中の施設を近い順に表示します。
            地図を動かすか「現在地を使う」で、探す地点を変えられます。
            位置は住所からデジタル庁のアドレス・ベース・レジストリで求めたもので、施設によっては町や大字の中心付近です。
          </p>
        }
      >
        近くの施設
      </PageTitle>
      <Suspense fallback={<LoadingState />}>
        <NearbySearch />
      </Suspense>
    </>
  );
}
