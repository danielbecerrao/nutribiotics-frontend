import type { AuthSession, AuthUser } from "./types";
import { isRole } from "./types";

const AUTH_STORAGE_KEY = "nutribiotics.auth.session";

export function readStoredAuthSession() {
  if (!canUseStorage()) {
    return null;
  }

  const rawSession = window.localStorage.getItem(AUTH_STORAGE_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    const session = JSON.parse(rawSession) as unknown;

    if (isAuthSession(session)) {
      return session;
    }

    clearStoredAuthSession();
  } catch {
    clearStoredAuthSession();
  }

  return null;
}

export function writeStoredAuthSession(session: AuthSession) {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
}

export function clearStoredAuthSession() {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.removeItem(AUTH_STORAGE_KEY);
}

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function isAuthSession(value: unknown): value is AuthSession {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<AuthSession>;

  return (
    typeof candidate.accessToken === "string" &&
    typeof candidate.refreshToken === "string" &&
    isAuthUser(candidate.user)
  );
}

function isAuthUser(value: unknown): value is AuthUser {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<AuthUser>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.email === "string" &&
    typeof candidate.name === "string" &&
    typeof candidate.createdAt === "string" &&
    isRole(candidate.role)
  );
}
