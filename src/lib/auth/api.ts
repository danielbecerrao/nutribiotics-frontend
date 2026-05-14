import { apiFetch } from "@/lib/api";
import type { AuthTokens, AuthUser } from "./types";

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse extends AuthTokens {
  user?: AuthUser;
}

export function login(credentials: LoginCredentials) {
  return apiFetch<LoginResponse>("/auth/login", {
    body: credentials,
    cache: "no-store",
    method: "POST",
  });
}

export function getCurrentProfile(accessToken: string) {
  return apiFetch<AuthUser>("/auth/profile", {
    accessToken,
    cache: "no-store",
  });
}
