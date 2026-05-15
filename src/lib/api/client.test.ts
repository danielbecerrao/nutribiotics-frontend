import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiClientError, apiFetch, buildApiUrl } from "./client";

describe("buildApiUrl", () => {
  it("builds API URLs with query parameters and skips empty values", () => {
    expect(
      buildApiUrl("/prescriptions", {
        limit: 10,
        page: 2,
        status: "pending",
        to: undefined,
      }),
    ).toBe("http://localhost:3001/prescriptions?limit=10&page=2&status=pending");
  });
});

describe("apiFetch", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends bearer auth, JSON bodies, and parsed JSON responses", async () => {
    const fetchMock = vi.mocked(fetch);

    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ id: "prescription_1" }), {
        headers: {
          "Content-Type": "application/json",
        },
        status: 200,
      }),
    );

    await expect(
      apiFetch<{ id: string }>("/prescriptions", {
        accessToken: "access-token",
        body: { patientId: "patient_1" },
        method: "POST",
      }),
    ).resolves.toEqual({ id: "prescription_1" });

    const [, requestInit] = fetchMock.mock.calls[0];
    const headers = requestInit?.headers as Headers;

    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/prescriptions",
      expect.objectContaining({
        body: JSON.stringify({ patientId: "patient_1" }),
        method: "POST",
      }),
    );
    expect(headers.get("Accept")).toBe("application/json");
    expect(headers.get("Authorization")).toBe("Bearer access-token");
    expect(headers.get("Content-Type")).toBe("application/json");
  });

  it("throws API client errors with the backend response body", async () => {
    const fetchMock = vi.mocked(fetch);

    fetchMock.mockResolvedValue(
      new Response(
        JSON.stringify({
          code: "UNAUTHORIZED",
          details: {},
          message: "Invalid credentials",
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
          status: 401,
          statusText: "Unauthorized",
        },
      ),
    );

    await expect(apiFetch("/auth/login")).rejects.toMatchObject({
      message: "Invalid credentials",
      response: {
        code: "UNAUTHORIZED",
      },
      status: 401,
    } satisfies Partial<ApiClientError>);
  });
});
