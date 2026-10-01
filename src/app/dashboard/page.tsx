import type { Metadata } from "next";
import { Suspense } from "react";
import { PageTitle } from "@/components/headings";
import { LoadingState } from "@/components/query-state";
import Dashboard from "./dashboard";

export const metadata: Metadata = {
  title: "ダッシュボード",
};

export default function DashboardPage() {
  return (
    <>
      <PageTitle
        lead={
          <p>
            新規開業の動きと、地域ごとの施設の数を、地域・種別・診療科で絞り込んで確認できます。
            新規開業は、指定年月日が期間内で登録理由が「新規」の施設です（院長の交代などによる指定は含みません）。
          </p>
        }
      >
        ダッシュボード
      </PageTitle>
      <Suspense fallback={<LoadingState />}>
        <Dashboard />
      </Suspense>
    </>
  );
}
