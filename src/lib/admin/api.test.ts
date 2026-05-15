import { describe, expect, it } from "vitest";
import {
  buildAdminMetricsStreamUrl,
  toAdminAuditLogsApiQuery,
  toAdminMetricsApiQuery,
} from "./api";

describe("toAdminMetricsApiQuery", () => {
  it("normalizes admin date filters for the API", () => {
    expect(
      toAdminMetricsApiQuery({
        from: "2026-05-01",
        to: "2026-05-31",
      }),
    ).toEqual({
      from: "2026-05-01T00:00:00.000Z",
      to: "2026-05-31T23:59:59.999Z",
    });
  });

  it("omits empty admin date filters", () => {
    expect(toAdminMetricsApiQuery({ from: "", to: "" })).toEqual({
      from: undefined,
      to: undefined,
    });
  });
});

describe("toAdminAuditLogsApiQuery", () => {
  it("normalizes admin audit log filters for the API", () => {
    expect(
      toAdminAuditLogsApiQuery({
        action: "prescription_consumed",
        limit: 5,
        page: 1,
      }),
    ).toEqual({
      action: "prescription_consumed",
      limit: 5,
      page: 1,
    });
  });
});

describe("buildAdminMetricsStreamUrl", () => {
  it("builds the SSE metrics URL with token and date filters", () => {
    expect(
      buildAdminMetricsStreamUrl("access-token", {
        from: "2026-05-01",
        to: "2026-05-31",
      }),
    ).toBe(
      "http://localhost:3001/admin/metrics/stream?from=2026-05-01T00%3A00%3A00.000Z&to=2026-05-31T23%3A59%3A59.999Z&access_token=access-token",
    );
  });
});
