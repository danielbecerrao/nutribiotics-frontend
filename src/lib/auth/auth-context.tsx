"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { getCurrentProfile } from "./api";
import {
  clearStoredAuthSession,
  readStoredAuthSession,
  writeStoredAuthSession,
} from "./storage";
import type { AuthSession, AuthStatus, AuthTokens, AuthUser } from "./types";

interface AuthContextValue {
  clearSession: () => void;
  refreshProfile: () => Promise<AuthUser | null>;
  session: AuthSession | null;
  setSession: (session: AuthSession) => void;
  status: AuthStatus;
  tokens: AuthTokens | null;
  user: AuthUser | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<AuthSession | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const hydrationTimer = window.setTimeout(() => {
      setSessionState(readStoredAuthSession());
      setIsHydrated(true);
    }, 0);

    return () => window.clearTimeout(hydrationTimer);
  }, []);

  const setSession = useCallback((nextSession: AuthSession) => {
    setSessionState(nextSession);
    writeStoredAuthSession(nextSession);
  }, []);

  const clearSession = useCallback(() => {
    setSessionState(null);
    clearStoredAuthSession();
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!session) {
      return null;
    }

    try {
      const user = await getCurrentProfile(session.accessToken);
      const nextSession = { ...session, user };

      setSession(nextSession);
      return user;
    } catch {
      clearSession();
      return null;
    }
  }, [clearSession, session, setSession]);

  const value = useMemo<AuthContextValue>(() => {
    const status: AuthStatus = !isHydrated
      ? "loading"
      : session
        ? "authenticated"
        : "anonymous";
    const tokens = session
      ? {
          accessToken: session.accessToken,
          refreshToken: session.refreshToken,
        }
      : null;

    return {
      clearSession,
      refreshProfile,
      session,
      setSession,
      status,
      tokens,
      user: session?.user ?? null,
    };
  }, [clearSession, isHydrated, refreshProfile, session, setSession]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}
