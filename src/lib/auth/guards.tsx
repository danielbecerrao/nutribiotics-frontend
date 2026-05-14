"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { getRoleHomePath, loginPath } from "./routes";
import { useAuth } from "./auth-context";
import type { Role } from "./types";

interface AuthGuardProps {
  children: ReactNode;
  fallback?: ReactNode;
  redirectTo?: string;
}

interface RoleGuardProps extends AuthGuardProps {
  allowedRoles: Role[];
}

export function RequireAuth({
  children,
  fallback = null,
  redirectTo = loginPath,
}: AuthGuardProps) {
  const router = useRouter();
  const { status } = useAuth();

  useEffect(() => {
    if (status === "anonymous") {
      router.replace(redirectTo);
    }
  }, [redirectTo, router, status]);

  if (status !== "authenticated") {
    return fallback;
  }

  return children;
}

export function RequireRole({
  allowedRoles,
  children,
  fallback = null,
  redirectTo,
}: RoleGuardProps) {
  const router = useRouter();
  const { status, user } = useAuth();

  useEffect(() => {
    if (status === "anonymous") {
      router.replace(loginPath);
      return;
    }

    if (status === "authenticated" && user && !allowedRoles.includes(user.role)) {
      router.replace(redirectTo ?? getRoleHomePath(user.role));
    }
  }, [allowedRoles, redirectTo, router, status, user]);

  if (status !== "authenticated" || !user || !allowedRoles.includes(user.role)) {
    return fallback;
  }

  return children;
}
