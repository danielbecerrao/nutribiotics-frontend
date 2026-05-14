"use client";

import { LoadingState } from "@/components/ui";
import { RequireRole } from "@/lib/auth";
import type { Role } from "@/lib/auth";
import type { ReactNode } from "react";
import {
  AuthenticatedShell,
  type NavigationItem,
} from "./authenticated-shell";

interface RoleLayoutProps {
  children: ReactNode;
  description?: string;
  navItems: NavigationItem[];
  role: Role;
  title: string;
}

export function RoleLayout({
  children,
  description,
  navItems,
  role,
  title,
}: RoleLayoutProps) {
  return (
    <RequireRole
      allowedRoles={[role]}
      fallback={
        <div className="min-h-full bg-background p-6">
          <LoadingState label="Checking access" />
        </div>
      }
    >
      <AuthenticatedShell
        description={description}
        navItems={navItems}
        title={title}
      >
        {children}
      </AuthenticatedShell>
    </RequireRole>
  );
}
