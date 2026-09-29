import Link from "next/link";
import type { MedicalFacility } from "@/lib/api/types";
import { formatDate, totalBeds } from "@/lib/format";
import StatusBadge from "./status-badge";

const maxDepartmentsShown = 6;

export default function FacilityCard({ facility }: { facility: MedicalFacility }) {
  const beds = totalBeds(facility.bed_counts);
  const departments = facility.department_categories;

  return (
    <article className="rounded-xl border border-border p-5 transition-colors hover:bg-surface">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted">
            {facility.institution_type.label}
            {beds > 0 && ` ・ ${beds}床`}
            {facility.designated_on && ` ・ 指定 ${formatDate(facility.designated_on)}`}
          </p>
          <h3 className="mt-1 text-lg font-semibold tracking-tight">
            <Link href={`/facility?id=${facility.id}`} className="hover:underline">
              {facility.name}
            </Link>
          </h3>
        </div>
        <StatusBadge status={facility.status} />
      </div>
      <p className="mt-2 text-sm text-muted">
        {facility.postal_code && `〒${facility.postal_code} `}
        {facility.prefecture.label}
        {facility.address}
      </p>
      {facility.phone_number && (
        <p className="mt-1 font-mono text-sm text-muted">TEL {facility.phone_number}</p>
      )}
      {departments.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {departments.slice(0, maxDepartmentsShown).map((department) => (
            <li
              key={department.code}
              className="rounded-full border border-border px-2.5 py-0.5 text-xs"
            >
              {department.label}
            </li>
          ))}
          {departments.length > maxDepartmentsShown && (
            <li className="px-1 py-0.5 text-xs text-muted">
              他{departments.length - maxDepartmentsShown}科
            </li>
          )}
        </ul>
      )}
    </article>
  );
}
