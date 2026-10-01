"use client";

import AreasTab from "./areas-tab";
import OpeningsTab from "./openings-tab";
import { useDashboardParams } from "./use-dashboard-params";

const tabs = [
  { id: "openings", label: "新規開業の動向", description: "期間内の新規開業の数と推移、多い市区町村、一覧" },
  { id: "areas", label: "地域の比較", description: "市区町村ごとの施設の数（同じ診療科の競合）と、地図" },
] as const;

type TabId = (typeof tabs)[number]["id"];

export default function Dashboard() {
  const { get, update } = useDashboardParams();
  const active: TabId = get("tab") === "areas" ? "areas" : "openings";

  return (
    <>
      <div role="tablist" aria-label="ダッシュボードの切り替え" className="flex border-b-2 border-accent">
        {tabs.map((tab) => {
          const isActive = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`panel-${tab.id}`}
              // Filters shared by both tabs stay; the opened list page and area don't.
              onClick={() => update({ tab: tab.id === "openings" ? null : tab.id, municipality_code: null, area: null })}
              className={`-mb-0.5 border-b-2 px-4 py-2 text-sm transition-colors sm:text-base ${
                isActive
                  ? "border-accent bg-band font-bold text-accent"
                  : "border-transparent text-muted hover:text-accent"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-sm text-muted">{tabs.find((tab) => tab.id === active)?.description}</p>

      <div role="tabpanel" id={`panel-${active}`} aria-labelledby={`tab-${active}`} className="mt-4">
        {active === "openings" ? <OpeningsTab /> : <AreasTab />}
      </div>
    </>
  );
}
