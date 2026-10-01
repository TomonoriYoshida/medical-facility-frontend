import { Suspense } from "react";
import { PageTitle } from "@/components/headings";
import { LoadingState } from "@/components/query-state";
import FacilitySearch from "./facility-search";

export default function Home() {
  return (
    <>
      <PageTitle
        lead={
          <p>
            全国8つの地方厚生局が公開する「保険医療機関・保険薬局の指定一覧」から、病院・診療所・歯科診療所・薬局を検索できます。
            施設名・住所のキーワードは、全角/半角や異体字（髙→高）の違いを吸収して検索します。
            空白で区切ると、すべての語を含む施設に絞り込めます（例:「札幌 眼科」、5語まで）。
          </p>
        }
      >
        医療施設を検索
      </PageTitle>
      <Suspense fallback={<LoadingState />}>
        <FacilitySearch />
      </Suspense>
    </>
  );
}
