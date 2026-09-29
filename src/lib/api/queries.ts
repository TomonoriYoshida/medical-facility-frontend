import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { apiClient, unwrap } from "./client";
import type {
  Attribution,
  EventListQuery,
  ExportIndex,
  FacilityListQuery,
  MedicalFacility,
  MedicalFacilityEvent,
  Options,
  Paginated,
} from "./types";

export function useOptions() {
  return useQuery({
    queryKey: ["options"],
    queryFn: async () =>
      (await unwrap(apiClient.GET("/v1/options"))).data as unknown as Options,
    // The API marks /options as cacheable for a day; it only changes on deploy.
    staleTime: 24 * 60 * 60 * 1000,
  });
}

export function useFacilities(query: FacilityListQuery & { page?: number }) {
  return useQuery({
    queryKey: ["facilities", query],
    queryFn: async () =>
      (await unwrap(
        apiClient.GET("/v1/medical-facilities", {
          // `page` is read by Laravel's paginator but isn't in the spec.
          params: { query: query as FacilityListQuery },
        }),
      )) as unknown as Paginated<MedicalFacility>,
    placeholderData: keepPreviousData,
  });
}

export function useFacility(id: number | null) {
  return useQuery({
    queryKey: ["facility", id],
    enabled: id !== null,
    queryFn: async () =>
      (await unwrap(
        apiClient.GET("/v1/medical-facilities/{medicalFacility}", {
          params: { path: { medicalFacility: id! } },
        }),
      )) as unknown as { data: MedicalFacility; meta: { attribution: Attribution } },
  });
}

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
      ).data as unknown as MedicalFacilityEvent[],
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
      )) as unknown as Paginated<MedicalFacilityEvent>,
    placeholderData: keepPreviousData,
  });
}

export function useExports() {
  return useQuery({
    queryKey: ["exports"],
    queryFn: async () =>
      (await unwrap(apiClient.GET("/v1/exports"))) as unknown as {
        data: ExportIndex;
        meta: { attribution: Attribution };
      },
    retry: false,
  });
}
