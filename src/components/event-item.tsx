import Link from "next/link";
import type { MedicalFacilityEvent } from "@/lib/api/types";
import { attributeLabel, formatChangeValue, formatDate } from "@/lib/format";

// Codes follow App\Enums\MedicalFacilityEventType / MedicalFacilityEventOrigin.
const eventTypeCreated = 1;
const eventTypeRemoved = 2;
const originBaseline = 1;

const eventTypeStyles: Record<number, string> = {
  1: "border-accent/40 text-accent",
  2: "border-danger/40 text-danger",
  3: "border-border text-foreground",
};

function eventTitle(event: MedicalFacilityEvent): string {
  if (event.event_type.code === eventTypeCreated) {
    // A baseline "created" only means tracking started, not that the facility opened.
    if (event.origin.code === originBaseline) {
      return "取込開始時点で掲載";
    }
    return event.is_reopening ? "再掲載（廃止後に再び指定）" : "新規掲載";
  }
  if (event.event_type.code === eventTypeRemoved) {
    return "掲載終了（廃止）";
  }
  return "内容の変更";
}

export default function EventItem({
  event,
  showFacility = false,
}: {
  event: MedicalFacilityEvent;
  showFacility?: boolean;
}) {
  return (
    <article className="rounded-xl border border-border p-5">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <span
          className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${
            eventTypeStyles[event.event_type.code] ?? eventTypeStyles[3]
          }`}
        >
          {event.event_type.label}
        </span>
        <span className="text-sm font-medium">{eventTitle(event)}</span>
        <time dateTime={event.occurred_on} className="text-sm text-muted">
          {formatDate(event.occurred_on)} 公開分
        </time>
      </div>

      {showFacility && event.facility && (
        <p className="mt-3">
          <Link href={`/facility?id=${event.facility.id}`} className="font-semibold hover:underline">
            {event.facility.name}
          </Link>
          <span className="ml-2 text-sm text-muted">
            {event.facility.institution_type.label} ・ {event.facility.prefecture.label}
            {event.facility.address}
          </span>
        </p>
      )}

      {event.changes && event.changes.length > 0 && (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-md text-left text-sm">
            <thead className="text-xs text-muted">
              <tr>
                <th className="py-1 pr-4 font-normal">項目</th>
                <th className="py-1 pr-4 font-normal">変更前</th>
                <th className="py-1 font-normal">変更後</th>
              </tr>
            </thead>
            <tbody>
              {event.changes.map((change) => (
                <tr key={change.attribute} className="border-t border-border align-top">
                  <th scope="row" className="py-2 pr-4 font-medium whitespace-nowrap">
                    {attributeLabel(change.attribute)}
                  </th>
                  <td className="py-2 pr-4 text-muted">
                    <del className="no-underline">{formatChangeValue(change.old)}</del>
                  </td>
                  <td className="py-2">
                    <ins className="no-underline">{formatChangeValue(change.new)}</ins>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </article>
  );
}
