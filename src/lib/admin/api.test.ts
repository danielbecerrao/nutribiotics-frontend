import { describe, expect, it } from "vitest";
import { toAdminMetricsApiQuery } from "./api";

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
