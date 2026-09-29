import type { components, operations } from "./schema";

type Schemas = components["schemas"];

/*
 * Scramble infers some shapes too loosely (bed_counts as unknown[], the
 * options lists as unknown[], the event feed items intersected with
 * Record<string, never>), so those are pinned here to what the API
 * actually returns. Everything else comes straight from the generated schema.
 */

export type CodeLabel = { code: number; label: string };

// date can be null: some source rows put the date in the reason column.
export type DesignationHistoryEntry = { date: string | null; reason: string };

export type MedicalFacility = Omit<
  Schemas["MedicalFacilityResource"],
  | "institution_type"
  | "status"
  | "bureau"
  | "prefecture"
  | "designation_history"
  | "bed_counts"
  | "department_categories"
> & {
  institution_type: CodeLabel;
  status: CodeLabel;
  bureau: CodeLabel;
  prefecture: { code: string; label: string };
  designation_history: DesignationHistoryEntry[] | null;
  /** Bed type (一般, 療養, …) to count. */
  bed_counts: Record<string, number> | null;
  department_categories: CodeLabel[];
};

export type ChangeValue =
  | CodeLabel
  | CodeLabel[]
  | DesignationHistoryEntry[]
  | Record<string, number>
  | string
  | null;

export type FacilityChange = {
  attribute: string;
  old: ChangeValue;
  new: ChangeValue;
};

export type MedicalFacilityEvent = Omit<
  Schemas["MedicalFacilityEventResource"],
  "changes" | "facility"
> & {
  changes?: FacilityChange[];
  facility?: MedicalFacility;
};

export type Attribution =
  operations["v1.medical-facilities.index"]["responses"][200]["content"]["application/json"]["meta"]["attribution"];

export type PaginationMeta = Omit<
  operations["v1.medical-facilities.index"]["responses"][200]["content"]["application/json"]["meta"],
  "attribution"
>;

export type Paginated<T> = {
  data: T[];
  meta: PaginationMeta & { attribution: Attribution };
};

export type Options = {
  prefectures: (Omit<CodeLabel, "code"> & { code: string; bureau: CodeLabel })[];
  institution_types: CodeLabel[];
  statuses: CodeLabel[];
  bureaus: CodeLabel[];
  department_categories: CodeLabel[];
  event_types: CodeLabel[];
  designation_reasons: string[];
};

export type ExportFile = {
  name: string;
  format: "csv" | "jsonl";
  /** null for the nationwide (all prefectures) file. */
  prefecture: { code: string; label: string } | null;
  records: number;
  size: number;
  sha256: string;
  url: string;
};

export type ExportIndex = {
  generated_at: string;
  data_updated_at: string;
  files: ExportFile[];
};

export type FacilityListQuery = NonNullable<
  operations["v1.medical-facilities.index"]["parameters"]["query"]
>;

export type EventListQuery = NonNullable<
  operations["v1.medical-facility-events.index"]["parameters"]["query"]
>;
