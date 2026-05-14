import { apiFetch } from "@/lib/api";
import type { ApiQueryParams, PaginatedResponse } from "@/lib/api";
import type { Prescription, PrescriptionStatus } from "./types";

export interface DoctorPrescriptionsQuery {
  from?: string;
  limit?: number;
  page?: number;
  status?: PrescriptionStatus | "";
  to?: string;
}

interface ListDoctorPrescriptionsOptions {
  signal?: AbortSignal;
}

export function listDoctorPrescriptions(
  accessToken: string,
  query: DoctorPrescriptionsQuery = {},
  options: ListDoctorPrescriptionsOptions = {},
) {
  return apiFetch<PaginatedResponse<Prescription>>("/prescriptions", {
    accessToken,
    cache: "no-store",
    query: toDoctorPrescriptionsApiQuery(query),
    signal: options.signal,
  });
}

export function toDoctorPrescriptionsApiQuery(
  query: DoctorPrescriptionsQuery,
): ApiQueryParams {
  return {
    from: query.from ? toStartOfDayIso(query.from) : undefined,
    limit: query.limit,
    page: query.page,
    status: query.status || undefined,
    to: query.to ? toEndOfDayIso(query.to) : undefined,
  };
}

function toStartOfDayIso(value: string) {
  return `${value}T00:00:00.000Z`;
}

function toEndOfDayIso(value: string) {
  return `${value}T23:59:59.999Z`;
}
