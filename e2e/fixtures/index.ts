import type { operations } from "@/lib/api/schema";
import facilityEventsJson from "./facility-events.json";
import facilityListJson from "./facility-list.json";
import facilityJson from "./facility.json";
import openingHoursJson from "./opening-hours.json";
import optionsJson from "./options.json";

/*
 * Responses captured from a local API (see README「画面のテスト」), typed with
 * the OpenAPI types. JSON imports widen literal types (e.g. "mon" to string),
 * so they are cast rather than checked; capturing them from the real API is
 * what keeps their shape honest.
 */

type JsonOf<Operation extends keyof operations> = operations[Operation]["responses"] extends {
  200: { content: { "application/json": infer Json } };
}
  ? Json
  : never;

export type FacilityListJson = Extract<JsonOf<"v1.medical-facilities.index">, { meta: { last_page: number } }>;
export type FacilityJson = JsonOf<"v1.medical-facilities.show">;
export type OpeningHoursJson = JsonOf<"v1.medical-facilities.opening-hours">;
export type FacilityEventsJson = JsonOf<"v1.medical-facilities.events.index">;
export type OptionsJson = JsonOf<"v1.options">;

export const fixtures = {
  options: optionsJson as unknown as OptionsJson,
  facilityList: facilityListJson as unknown as FacilityListJson,
  facility: facilityJson as unknown as FacilityJson,
  openingHours: openingHoursJson as unknown as OpeningHoursJson,
  facilityEvents: facilityEventsJson as unknown as FacilityEventsJson,
};

/** A deep copy to change in one test without touching the others. */
export function copy<T>(value: T): T {
  return structuredClone(value);
}
