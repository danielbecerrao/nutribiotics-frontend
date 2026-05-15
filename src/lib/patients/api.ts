import { apiFetch } from "@/lib/api";
import type { PaginatedResponse } from "@/lib/api";
import type { Patient } from "./types";

export interface ListPatientsQuery {
  limit?: number;
  page?: number;
  q?: string;
}

interface ListPatientsOptions {
  signal?: AbortSignal;
}

export function listPatients(
  accessToken: string,
  query: ListPatientsQuery = {},
  options: ListPatientsOptions = {},
) {
  return apiFetch<PaginatedResponse<Patient>>("/patients", {
    accessToken,
    cache: "no-store",
    query: {
      limit: query.limit,
      page: query.page,
      q: query.q?.trim() || undefined,
    },
    signal: options.signal,
  });
}
