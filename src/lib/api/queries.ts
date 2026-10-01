import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiClient, unwrap } from "./client";
import type {
  EventListQuery,
  EventPage,
  ExportsResponse,
  FacilityListQuery,
  MedicalFacilityEvent,
} from "./types";

export function useOptions() {
  return useQuery({
    queryKey: ["options"],
    queryFn: async () => (await unwrap(apiClient.GET("/v1/options"))).data,
    // The API marks /options as cacheable for a day; it only changes on deploy.
    staleTime: 24 * 60 * 60 * 1000,
  });
}

export function useFacilities(query: FacilityListQuery & { page?: number }) {
  return useQuery({
    queryKey: ["facilities", query],
    queryFn: () =>
      unwrap(
        apiClient.GET("/v1/medical-facilities", {
          // `page` is read by Laravel's paginator but isn't in the spec.
          params: { query: query as FacilityListQuery },
        }),
      ),
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

export function useEvents(query: EventListQuery & { page?: number }) {
  return useQuery({
    queryKey: ["events", query],
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
