import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiClient, unwrap } from "./client";
import type {
  EventListQuery,
  EventStatsQuery,
  EventPage,
  ExportsResponse,
  FacilityListQuery,
  FacilityPage,
  MedicalFacilityEvent,
  StatsQuery,
} from "./types";

export function useOptions() {
  return useQuery({
    queryKey: ["options"],
    queryFn: async () => (await unwrap(apiClient.GET("/v1/options"))).data,
    // The API marks /options as cacheable for a day; it only changes on deploy.
    staleTime: 24 * 60 * 60 * 1000,
  });
}

/**
 * The facility list comes back in page-number form unless pagination=cursor
 * is asked for, which this site never does; checked rather than assumed.
 */
export function numberedPage(page: FacilityPage | { meta: object }): FacilityPage {
  if (!("last_page" in page.meta)) {
    throw new Error("Expected a page-numbered facility list.");
  }
  return page as FacilityPage;
}

export function useFacilities(query: FacilityListQuery) {
  return useQuery({
    queryKey: ["facilities", query],
    queryFn: async () => numberedPage(await unwrap(apiClient.GET("/v1/medical-facilities", { params: { query } }))),
    placeholderData: keepPreviousData,
  });
}

export function useFacility(id: number | null) {
  return useQuery({
    queryKey: ["facility", id],
    enabled: id !== null,
    queryFn: () =>
      unwrap(
        apiClient.GET("/v1/medical-facilities/{medicalFacility}", {
          params: { path: { medicalFacility: id! } },
        }),
      ),
  });
}

export function useFacilityOpeningHours(id: number | null) {
  return useQuery({
    queryKey: ["facility-opening-hours", id],
    enabled: id !== null,
    queryFn: async () =>
      (
        await unwrap(
          apiClient.GET("/v1/medical-facilities/{medicalFacility}/opening-hours", {
            params: { path: { medicalFacility: id! } },
          }),
        )
      ).data,
    // From a source updated twice a year; the API marks it cacheable for an hour.
    staleTime: 60 * 60 * 1000,
  });
}

export function useFacilityStats(query: StatsQuery, { enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ["facility-stats", query],
    enabled,
    queryFn: () => unwrap(apiClient.GET("/v1/stats/facilities", { params: { query } })),
    // The API caches these for an hour; keep the frame while filters change.
    staleTime: 60 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

export function useEventStats(query: EventStatsQuery, { enabled = true }: { enabled?: boolean } = {}) {
  return useQuery({
    queryKey: ["facility-event-stats", query],
    enabled,
    queryFn: () => unwrap(apiClient.GET("/v1/stats/facility-events", { params: { query } })),
    staleTime: 60 * 60 * 1000,
    placeholderData: keepPreviousData,
  });
}

// The casts below only narrow a change's old/new values and the export file
// list, which the spec can't describe precisely (see types.ts).

export function useFacilityEvents(id: number | null) {
  return useQuery({
    queryKey: ["facility-events", id],
    enabled: id !== null,
    queryFn: async () =>
      (
        await unwrap(
          apiClient.GET("/v1/medical-facilities/{medicalFacility}/events", {
            params: { path: { medicalFacility: id! } },
          }),
        )
      ).data as MedicalFacilityEvent[],
  });
}

export function useEvents(
  query: EventListQuery & { page?: number },
  { enabled = true }: { enabled?: boolean } = {},
) {
  return useQuery({
    queryKey: ["events", query],
    enabled,
    queryFn: async () =>
      (await unwrap(
        apiClient.GET("/v1/medical-facility-events", {
          params: { query: query as EventListQuery },
        }),
      )) as EventPage,
    placeholderData: keepPreviousData,
  });
}

export function useExports() {
  return useQuery({
    queryKey: ["exports"],
    queryFn: async () => (await unwrap(apiClient.GET("/v1/exports"))) as ExportsResponse,
    retry: false,
  });
}
