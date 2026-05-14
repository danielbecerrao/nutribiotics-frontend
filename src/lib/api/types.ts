export type ApiErrorDetails = Record<string, unknown>;

export interface ApiErrorResponse {
  message: string;
  code: string;
  details: ApiErrorDetails;
}

export interface PaginatedResponse<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export type ApiQueryValue = string | number | boolean | null | undefined;

export type ApiQueryParams = Record<
  string,
  ApiQueryValue | ApiQueryValue[]
>;
