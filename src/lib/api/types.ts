import type { components, operations } from "./schema";

type Schemas = components["schemas"];
type JsonOf<Operation extends keyof operations> = operations[Operation]["responses"] extends {
  200: { content: { "application/json": infer Json } };
}
  ? Json
  : never;

/*
 * Types come from the OpenAPI spec the API generates. Only two shapes are still
 * pinned by hand because the spec can't describe them precisely: a change's
 * old/new values (they take the shape of whichever attribute changed) and the
 * export file list.
 */

export type CodeLabel = { code: number; label: string };

export type MedicalFacility = Schemas["MedicalFacilityResource"];

export type DesignationHistoryEntry = NonNullable<MedicalFacility["designation_history"]>[number];

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

type WithChanges<Event extends { changes?: unknown }> = Omit<Event, "changes"> & {
  changes?: FacilityChange[];
};

/** An event in one facility's history (no facility attached). */
export type MedicalFacilityEvent = WithChanges<Schemas["MedicalFacilityEventResource"]>;

/** An event in the nationwide feed, which carries its facility. */
export type MedicalFacilityEventWithFacility = WithChanges<
  Schemas["MedicalFacilityEventWithFacilityResource"]
>;

export type FacilityPage = JsonOf<"v1.medical-facilities.index">;

export type EventPage = Omit<JsonOf<"v1.medical-facility-events.index">, "data"> & {
  data: MedicalFacilityEventWithFacility[];
};

export type Attribution = FacilityPage["meta"]["attribution"];

export type PaginationMeta = Omit<FacilityPage["meta"], "attribution">;

export type Options = JsonOf<"v1.options">["data"];

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

type ExportsJson = JsonOf<"v1.exports.index">;

export type ExportsResponse = Omit<ExportsJson, "data"> & {
  data: Omit<ExportsJson["data"], "files"> & { files: ExportFile[] };
};

export type FacilityListQuery = NonNullable<
  operations["v1.medical-facilities.index"]["parameters"]["query"]
>;

export type EventListQuery = NonNullable<
  operations["v1.medical-facility-events.index"]["parameters"]["query"]
>;
