"use client";

import { Badge, Button } from "@/components/ui";
import { loginPath, useAuth } from "@/lib/auth";
import type { Role } from "@/lib/auth";
import { cn } from "@/lib/utils/cn";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

export interface NavigationItem {
  href: string;
  label: string;
}

interface AuthenticatedShellProps {
  children: ReactNode;
  description?: string;
  navItems: NavigationItem[];
  title: string;
}

const roleLabels: Record<Role, string> = {
  admin: "Admin",
  doctor: "Doctor",
  patient: "Patient",
};

export function AuthenticatedShell({
  children,
  description,
  navItems,
  title,
}: AuthenticatedShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { clearSession, user } = useAuth();

  function handleLogout() {
    clearSession();
    router.replace(loginPath);
  }

  return (
    <div className="min-h-full bg-background text-foreground">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <p className="text-xs font-semibold uppercase text-primary">
                Nutribiotics
              </p>
              <h1 className="text-2xl font-semibold text-foreground">{title}</h1>
              {description ? (
                <p className="max-w-3xl text-sm text-muted-foreground">
                  {description}
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-background px-3 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {user?.name ?? "Account"}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  {user?.email}
                </p>
              </div>
              {user ? <Badge tone="info">{roleLabels[user.role]}</Badge> : null}
              <Button onClick={handleLogout} size="sm" variant="secondary">
                Sign out
              </Button>
            </div>
          </div>

          <nav aria-label="Primary navigation" className="flex flex-wrap gap-2">
            {navItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "inline-flex h-9 items-center rounded-md border px-3 text-sm font-medium transition-colors",
                    isActive
                      ? "border-primary bg-primary text-white"
                      : "border-border-strong bg-surface text-foreground hover:bg-muted",
                  )}
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}
