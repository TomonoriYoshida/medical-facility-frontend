import Link from "next/link";
import type { MedicalFacility } from "@/lib/api/types";
import { formatDate, totalBeds } from "@/lib/format";
import DepartmentTags from "./department-tags";
import StatusBadge from "./status-badge";

export default function FacilityCard({ facility }: { facility: MedicalFacility }) {
  const beds = totalBeds(facility.bed_counts);

  return (
    <article className="border border-border px-4 py-3 transition-colors hover:bg-surface sm:px-5 sm:py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-bold text-accent sm:text-lg">
            <Link href={`/facility?id=${facility.id}`} className="underline-offset-2 hover:underline">
              {facility.name}
            </Link>
          </h3>
          <p className="mt-0.5 text-xs text-muted">
            {facility.institution_type.label}
            {beds > 0 && ` ／ ${beds}床`}
            {facility.designated_on && ` ／ 指定 ${formatDate(facility.designated_on)}`}
          </p>
        </div>
        <StatusBadge status={facility.status} />
      </div>
      <p className="mt-2 text-sm">
        {facility.postal_code && `〒${facility.postal_code} `}
        {facility.prefecture.label}
        {facility.address}
      </p>
      {facility.phone_number && (
        <p className="mt-0.5 text-sm text-muted">TEL {facility.phone_number}</p>
      )}
      <DepartmentTags departments={facility.department_categories} max={6} className="mt-2" />
    </article>
  );
}
