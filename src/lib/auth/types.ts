export const roles = ["admin", "doctor", "patient"] as const;

export type Role = (typeof roles)[number];

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthSession extends AuthTokens {
  user: AuthUser;
}

export type AuthStatus = "loading" | "authenticated" | "anonymous";

export function isRole(value: unknown): value is Role {
  return roles.includes(value as Role);
}
