import { RoleLayout } from "@/components/layout";
import type { NavigationItem } from "@/components/layout";
import type { ReactNode } from "react";

const navItems: NavigationItem[] = [
  { href: "/admin", label: "Overview" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RoleLayout
      description="Operational view for prescription oversight."
      navItems={navItems}
      role="admin"
      title="Admin workspace"
    >
      {children}
    </RoleLayout>
  );
}
