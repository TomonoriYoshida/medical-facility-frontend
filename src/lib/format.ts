import type { ChangeValue, CodeLabel, DesignationHistoryEntry } from "./api/types";

const attributeLabels: Record<string, string> = {
  facility_code: "医療機関コード",
  institution_type: "種別",
  status: "指定状態",
  bureau: "地方厚生局",
  name: "名称",
  prefecture_code: "都道府県",
  postal_code: "郵便番号",
  address: "所在地",
  phone_number: "電話番号",
  designated_on: "指定年月日",
  designation_history: "指定履歴",
  bed_counts: "病床数",
  department_categories: "診療科",
};

export function attributeLabel(attribute: string): string {
  return attributeLabels[attribute] ?? attribute;
}

export function formatDate(value: string | null | undefined): string {
  if (!value) {
    return "—";
  }
  const [year, month, day] = value.slice(0, 10).split("-");
  return `${year}年${Number(month)}月${Number(day)}日`;
}

export function formatBedCounts(bedCounts: Record<string, number> | null): string {
  if (!bedCounts || Object.keys(bedCounts).length === 0) {
    return "—";
  }
  return Object.entries(bedCounts)
    .map(([type, count]) => `${type} ${count}床`)
    .join(" / ");
}

export function totalBeds(bedCounts: Record<string, number> | null): number {
  return Object.values(bedCounts ?? {}).reduce((sum, count) => sum + count, 0);
}

function isCodeLabel(value: unknown): value is CodeLabel {
  return typeof value === "object" && value !== null && "label" in value;
}

function isHistoryEntry(value: unknown): value is DesignationHistoryEntry {
  return typeof value === "object" && value !== null && "reason" in value;
}

export function formatChangeValue(value: ChangeValue): string {
  if (value === null || value === "") {
    return "（なし）";
  }
  if (typeof value === "string") {
    return value;
  }
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return "（なし）";
    }
    return value
      .map((item) =>
        isHistoryEntry(item)
          ? `${formatDate(item.date)} ${item.reason}`
          : isCodeLabel(item)
            ? item.label
            : String(item),
      )
      .join("、");
  }
  if (isCodeLabel(value)) {
    return value.label;
  }
  return formatBedCounts(value);
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) {
    return `${Math.round(bytes / 1024)} KB`;
  }
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

export const numberFormatter = new Intl.NumberFormat("ja-JP");

/** "350m", "1.2km", "2km". */
export function formatDistance(meters: number): string {
  // Round first, so 997m reads "1km" rather than "1000m".
  const rounded = Math.round(meters / 10) * 10;
  return rounded < 1000 ? `${rounded}m` : `${(rounded / 1000).toFixed(1).replace(/\.0$/, "")}km`;
}
