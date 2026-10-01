"use client";

import Link from "next/link";
import { useState } from "react";
import { ApiError, apiClient, unwrap } from "@/lib/api/client";
import type { FacilityListQuery, MedicalFacility } from "@/lib/api/types";
import { downloadCsv, toCsv } from "@/lib/csv";
import { formatBedCounts } from "@/lib/format";

/** 5 requests of the API's per_page maximum, well within the rate limit. */
const maxRows = 500;
const pageSize = 100;

const header = [
  "医療機関コード",
  "名称",
  "種別",
  "指定状態",
  "指定年月日",
  "郵便番号",
  "都道府県",
  "所在地",
  "電話番号",
  "診療科",
  "病床数",
];

function toRow(facility: MedicalFacility): (string | null)[] {
  return [
    facility.medical_institution_code ?? facility.facility_code,
    facility.name,
    facility.institution_type.label,
    facility.status.label,
    facility.designated_on,
    facility.postal_code,
    facility.prefecture.label,
    facility.address,
    facility.phone_number,
    facility.department_categories.map((department) => department.label).join("、"),
    facility.bed_counts ? formatBedCounts(facility.bed_counts) : null,
  ];
}

type Props = {
  /** The list's filters, without paging. */
  query: FacilityListQuery;
  total: number;
  filename: string;
};

export default function CsvExport({ query, total, filename }: Props) {
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const count = Math.min(total, maxRows);

  async function exportCsv() {
    setExporting(true);
    setError(null);
    try {
      const facilities: MedicalFacility[] = [];
      for (let page = 1; facilities.length < count; page++) {
        const result = await unwrap(
          apiClient.GET("/v1/medical-facilities", {
            // `page` is read by Laravel's paginator but isn't in the spec.
            params: { query: { ...query, per_page: pageSize, page } as FacilityListQuery },
          }),
        );
        facilities.push(...result.data);
        if (result.data.length < pageSize) {
          break;
        }
      }
      downloadCsv(filename, toCsv(header, facilities.slice(0, count).map(toRow)));
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "CSVを作成できませんでした。");
    } finally {
      setExporting(false);
    }
  }

  if (total === 0) {
    return null;
  }

  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
      <button
        type="button"
        onClick={exportCsv}
        disabled={exporting}
        className="rounded-sm border border-accent px-3 py-1 font-bold text-accent transition-colors hover:bg-band disabled:opacity-60"
      >
        {exporting ? "CSVを作成中…" : `CSVでダウンロード（${count.toLocaleString("ja-JP")}件）`}
      </button>
      <span className="w-full text-xs text-muted">
        ※ Excelでダブルクリックして開くと、医療機関コードの先頭の0が消えます。Excelの「データ」→「テキストまたはCSVから」で、列を文字列として読み込んでください。
      </span>
      {total > maxRows && (
        <span className="text-xs text-muted">
          新しい順に{maxRows}件までです。すべて必要な場合は
          <Link href="/about" className="text-accent underline underline-offset-2">
            一括ダウンロード
          </Link>
          をご利用ください。
        </span>
      )}
      {error && (
        <span role="alert" className="w-full text-xs text-danger">
          {error}
        </span>
      )}
    </div>
  );
}
