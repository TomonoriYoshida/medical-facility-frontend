"use client";

import AttributionNotice from "@/components/attribution-notice";
import { EmptyState, ErrorState, LoadingState } from "@/components/query-state";
import { ApiError } from "@/lib/api/client";
import { useExports } from "@/lib/api/queries";
import type { ExportFile } from "@/lib/api/types";
import { formatBytes, formatDate, numberFormatter } from "@/lib/format";

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
  if (!file) {
    return <span className="text-muted">—</span>;
  }
  return (
    <a href={file.url} className="text-accent hover:underline" download>
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
      <div className="mt-3 max-h-112 overflow-auto rounded-xl border border-border">
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 bg-surface text-xs text-muted">
            <tr>
              <th className="px-4 py-2 font-normal">都道府県</th>
              <th className="px-4 py-2 text-right font-normal">施設数</th>
              <th className="px-4 py-2 font-normal">CSV</th>
              <th className="px-4 py-2 font-normal">JSON Lines</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {rows.map((row) => (
              <tr key={row.code} className={row.code === nationwideCode ? "font-semibold" : undefined}>
                <th scope="row" className="px-4 py-2 font-medium">
                  {row.label}
                </th>
                <td className="px-4 py-2 text-right tabular-nums">
                  {numberFormatter.format(row.records)}
                </td>
                <td className="px-4 py-2">
                  <FileLink file={row.csv} />
                </td>
                <td className="px-4 py-2">
                  <FileLink file={row.jsonl} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2 text-xs text-muted">
        ダウンロードは同じIPアドレスから1時間あたりの回数に上限があります。
      </p>
      <AttributionNotice attribution={exports.data.meta.attribution} />
    </>
  );
}
