import { env } from "@/lib/env";
import type {
  ApiErrorResponse,
  ApiQueryParams,
  ApiQueryValue,
} from "./types";

export class ApiClientError extends Error {
  readonly status: number;
  readonly statusText: string;
  readonly response: ApiErrorResponse;

  constructor(options: {
    status: number;
    statusText: string;
    response: ApiErrorResponse;
  }) {
    super(options.response.message);
    this.name = "ApiClientError";
    this.status = options.status;
    this.statusText = options.statusText;
    this.response = options.response;
  }
}

export interface ApiFetchOptions
  extends Omit<RequestInit, "body" | "headers"> {
  accessToken?: string;
  body?: unknown;
  headers?: HeadersInit;
  query?: ApiQueryParams;
}

export async function apiFetch<TResponse>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<TResponse> {
  const { accessToken, body, headers: inputHeaders, query, ...fetchOptions } =
    options;
  const headers = new Headers(inputHeaders);

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  const response = await fetch(buildApiUrl(path, query), {
    ...fetchOptions,
    headers,
    body: buildRequestBody(body, headers),
  });
  const payload = await parseResponseBody(response);

  if (!response.ok) {
    throw new ApiClientError({
      status: response.status,
      statusText: response.statusText,
      response: toApiErrorResponse(response, payload),
    });
  }

  return payload as TResponse;
}

export function buildApiUrl(path: string, query?: ApiQueryParams) {
  const url = new URL(path.replace(/^\/+/, ""), `${env.apiBaseUrl}/`);

  if (query) {
    appendQueryParams(url, query);
  }

  return url.toString();
}

function appendQueryParams(url: URL, query: ApiQueryParams) {
  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      value.forEach((item) => appendQueryParam(url, key, item));
      continue;
    }

    appendQueryParam(url, key, value);
  }
}

function appendQueryParam(url: URL, key: string, value: ApiQueryValue) {
  if (value === undefined || value === null) {
    return;
  }

  url.searchParams.append(key, String(value));
}

function buildRequestBody(body: unknown, headers: Headers) {
  if (body === undefined || body === null) {
    return undefined;
  }

  if (isBodyInit(body)) {
    return body;
  }

  if (!headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return JSON.stringify(body);
}

function isBodyInit(body: unknown): body is BodyInit {
  return (
    typeof body === "string" ||
    body instanceof Blob ||
    body instanceof FormData ||
    body instanceof URLSearchParams ||
    body instanceof ArrayBuffer
  );
}

async function parseResponseBody(response: Response) {
  if (response.status === 204) {
    return undefined;
  }

  const text = await response.text();

  if (!text) {
    return undefined;
  }

  const contentType = response.headers.get("Content-Type");

  if (contentType?.includes("application/json")) {
    return JSON.parse(text) as unknown;
  }

  return text;
}

function toApiErrorResponse(
  response: Response,
  payload: unknown,
): ApiErrorResponse {
  if (isApiErrorResponse(payload)) {
    return payload;
  }

  return {
    message: response.statusText || "Request failed.",
    code: `HTTP_${response.status}`,
    details: {},
  };
}

function isApiErrorResponse(payload: unknown): payload is ApiErrorResponse {
  if (!payload || typeof payload !== "object") {
    return false;
  }

  const candidate = payload as Partial<ApiErrorResponse>;

  return (
    typeof candidate.message === "string" &&
    typeof candidate.code === "string" &&
    typeof candidate.details === "object" &&
    candidate.details !== null &&
    !Array.isArray(candidate.details)
  );
}
