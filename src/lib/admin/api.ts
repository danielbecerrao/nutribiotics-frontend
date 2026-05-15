import { apiFetch, buildApiUrl } from "@/lib/api";
import type { ApiQueryParams, PaginatedResponse } from "@/lib/api";
import type { AdminAuditLog, AdminAuditLogAction, AdminMetrics } from "./types";

export interface AdminMetricsQuery {
  from?: string;
  to?: string;
}

export interface AdminAuditLogsQuery {
  action?: AdminAuditLogAction | "";
  limit?: number;
  page?: number;
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

export function listAdminAuditLogs(
  accessToken: string,
  query: AdminAuditLogsQuery = {},
  options: AdminMetricsOptions = {},
) {
  return apiFetch<PaginatedResponse<AdminAuditLog>>("/admin/audit-logs", {
    accessToken,
    cache: "no-store",
    query: toAdminAuditLogsApiQuery(query),
    signal: options.signal,
  });
}

export function buildAdminMetricsStreamUrl(
  accessToken: string,
  query: AdminMetricsQuery = {},
) {
  return buildApiUrl("/admin/metrics/stream", {
    ...toAdminMetricsApiQuery(query),
    access_token: accessToken,
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

export function toAdminAuditLogsApiQuery(
  query: AdminAuditLogsQuery,
): ApiQueryParams {
  return {
    action: query.action || undefined,
    limit: query.limit,
    page: query.page,
  };
}

function toStartOfDayIso(value: string) {
  return `${value}T00:00:00.000Z`;
}

function toEndOfDayIso(value: string) {
  return `${value}T23:59:59.999Z`;
}
