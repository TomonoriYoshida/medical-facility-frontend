"use client";

import AttributionNotice from "@/components/attribution-notice";
import { EmptyState, ErrorState, LoadingState } from "@/components/query-state";
import { ApiError } from "@/lib/api/client";
import { useExports } from "@/lib/api/queries";
import type { ExportFile } from "@/lib/api/types";
import { formatBytes, formatDate, numberFormatter } from "@/lib/format";
import { safeApiUrl } from "@/lib/url";

type PrefectureRow = {
  code: string;
  label: string;
  records: number;
  csv?: ExportFile;
  jsonl?: ExportFile;
};

// Sorts before "01", so the nationwide row comes first.
const nationwideCode = "00";

function groupByPrefecture(files: ExportFile[]): PrefectureRow[] {
  const rows = new Map<string, PrefectureRow>();
  for (const file of files) {
    const prefecture = file.prefecture ?? { code: nationwideCode, label: "全国" };
    const row = rows.get(prefecture.code) ?? {
      code: prefecture.code,
      label: prefecture.label,
      records: file.records,
    };
    row[file.format] = file;
    rows.set(prefecture.code, row);
  }
  return [...rows.values()].sort((a, b) => a.code.localeCompare(b.code));
}

function FileLink({ file }: { file?: ExportFile }) {
  const href = file && safeApiUrl(file.url);
  if (!file || !href) {
    return <span className="text-muted">—</span>;
  }
  return (
    <a href={href} className="text-accent underline underline-offset-2 hover:opacity-80" download>
      {file.format.toUpperCase()}
      <span className="ml-1 text-xs text-muted">{formatBytes(file.size)}</span>
    </a>
  );
}

export default function ExportList() {
  const exports = useExports();

  if (exports.isPending) {
    return <LoadingState />;
  }
  if (exports.isError) {
    // The API answers 404 until the first export job has run.
    if (exports.error instanceof ApiError && exports.error.status === 404) {
      return <EmptyState>一括ダウンロードのファイルはまだ作成されていません。</EmptyState>;
    }
    return <ErrorState error={exports.error} />;
  }

  const rows = groupByPrefecture(exports.data.data.files);

  return (
    <>
      <p className="text-sm text-muted">
        データ更新日: {formatDate(exports.data.data.data_updated_at)}
        （ファイル作成: {formatDate(exports.data.data.generated_at)}）
      </p>
      <div className="mt-3 max-h-112 overflow-auto">
        <table className="data-table">
          <thead className="sticky top-0">
            <tr>
              <th>都道府県</th>
              <th>施設数</th>
              <th>CSV</th>
              <th>JSON Lines</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.code} className={row.code === nationwideCode ? "font-bold" : undefined}>
                <th scope="row" className={row.code === nationwideCode ? "font-bold" : undefined}>
                  {row.label}
                </th>
                <td className="text-right tabular-nums">{numberFormatter.format(row.records)}</td>
                <td>
                  <FileLink file={row.csv} />
                </td>
                <td>
                  <FileLink file={row.jsonl} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-1 text-xs text-muted">
        ※ ダウンロードは同じIPアドレスから1時間あたりの回数に上限があります。
      </p>
      <AttributionNotice attribution={exports.data.meta.attribution} />
    </>
  );
}
