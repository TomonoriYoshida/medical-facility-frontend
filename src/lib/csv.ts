/**
 * One CSV field, quoted. A leading = + - @ (or tab/CR) would make Excel treat
 * the cell as a formula (CSV injection), so such values get a leading quote.
 */
function field(value: string | number | null | undefined): string {
  let text = value === null || value === undefined ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(text)) {
    text = `'${text}`;
  }
  return `"${text.replaceAll('"', '""')}"`;
}

/** CSV text (CRLF line ends) for a header row and data rows. */
export function toCsv(header: string[], rows: (string | number | null | undefined)[][]): string {
  return [header, ...rows].map((row) => row.map(field).join(",")).join("\r\n");
}

/** Saves CSV text as a file. The BOM makes Excel read it as UTF-8. */
export function downloadCsv(filename: string, csv: string): void {
  const url = URL.createObjectURL(new Blob(["﻿", csv], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
