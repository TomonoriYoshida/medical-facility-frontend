import { Suspense } from "react";
import { LoadingState } from "@/components/query-state";
import FacilitySearch from "./facility-search";

export default function Home() {
  return (
    <>
      <header className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">医療施設を検索</h1>
        <p className="mt-2 leading-7 text-muted">
          全国8つの地方厚生局が公開する「保険医療機関・保険薬局の指定一覧」から、病院・診療所・歯科診療所・薬局を検索できます。
          施設名・住所のキーワードは、全角/半角や異体字（髙→高）の違いを吸収して検索します。
        </p>
      </header>
      <Suspense fallback={<LoadingState />}>
        <FacilitySearch />
      </Suspense>
    </>
  );
}
