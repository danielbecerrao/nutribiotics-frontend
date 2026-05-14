import { RoleLayout } from "@/components/layout";
import type { NavigationItem } from "@/components/layout";
import type { ReactNode } from "react";

const navItems: NavigationItem[] = [
  { href: "/patient/prescriptions", label: "Prescriptions" },
];

export default function PatientLayout({ children }: { children: ReactNode }) {
  return (
    <RoleLayout
      description="Personal prescription access."
      navItems={navItems}
      role="patient"
      title="Patient workspace"
    >
      {children}
    </RoleLayout>
  );
}
