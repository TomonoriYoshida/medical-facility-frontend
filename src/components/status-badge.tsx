import type { CodeLabel } from "@/lib/api/types";

// Codes follow App\Enums\MedicalFacilityStatus: 1 指定中, 2 廃止, 3 休止.
const statusStyles: Record<number, string> = {
  1: "border-accent text-accent",
  2: "border-danger text-danger",
  3: "border-border text-muted",
};

export default function StatusBadge({ status }: { status: CodeLabel }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-sm border px-2 py-0.5 text-xs font-bold ${
        statusStyles[status.code] ?? statusStyles[3]
      }`}
    >
      {status.label}
    </span>
  );
}
