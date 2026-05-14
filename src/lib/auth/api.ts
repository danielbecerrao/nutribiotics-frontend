import { apiFetch } from "@/lib/api";
import type { AuthUser } from "./types";

export function getCurrentProfile(accessToken: string) {
  return apiFetch<AuthUser>("/auth/profile", {
    accessToken,
    cache: "no-store",
  });
}
