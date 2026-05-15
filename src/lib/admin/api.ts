import { apiFetch } from "@/lib/api";
import type { ApiQueryParams } from "@/lib/api";
import type { AdminMetrics } from "./types";

export interface AdminMetricsQuery {
  from?: string;
  to?: string;
}

interface AdminMetricsOptions {
  signal?: AbortSignal;
}

export function getAdminMetrics(
  accessToken: string,
  query: AdminMetricsQuery = {},
  options: AdminMetricsOptions = {},
) {
  return apiFetch<AdminMetrics>("/admin/metrics", {
    accessToken,
    cache: "no-store",
    query: toAdminMetricsApiQuery(query),
    signal: options.signal,
  });
}

export function toAdminMetricsApiQuery(
  query: AdminMetricsQuery,
): ApiQueryParams {
  return {
    from: query.from ? toStartOfDayIso(query.from) : undefined,
    to: query.to ? toEndOfDayIso(query.to) : undefined,
  };
}

function toStartOfDayIso(value: string) {
  return `${value}T00:00:00.000Z`;
}

function toEndOfDayIso(value: string) {
  return `${value}T23:59:59.999Z`;
}
