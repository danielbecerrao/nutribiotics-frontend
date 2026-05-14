import { describe, expect, it } from "vitest";
import { toDoctorPrescriptionsApiQuery } from "./api";

describe("toDoctorPrescriptionsApiQuery", () => {
  it("normalizes doctor prescription list filters for the API", () => {
    expect(
      toDoctorPrescriptionsApiQuery({
        from: "2026-05-01",
        limit: 10,
        page: 2,
        status: "pending",
        to: "2026-05-14",
      }),
    ).toEqual({
      from: "2026-05-01T00:00:00.000Z",
      limit: 10,
      page: 2,
      status: "pending",
      to: "2026-05-14T23:59:59.999Z",
    });
  });

  it("omits empty optional filters", () => {
    expect(
      toDoctorPrescriptionsApiQuery({
        limit: 10,
        page: 1,
        status: "",
      }),
    ).toEqual({
      from: undefined,
      limit: 10,
      page: 1,
      status: undefined,
      to: undefined,
    });
  });
});
