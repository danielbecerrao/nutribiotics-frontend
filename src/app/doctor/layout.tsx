import { RoleLayout } from "@/components/layout";
import type { NavigationItem } from "@/components/layout";
import type { ReactNode } from "react";

const navItems: NavigationItem[] = [
  { href: "/doctor/prescriptions", label: "Prescriptions" },
];

export default function DoctorLayout({ children }: { children: ReactNode }) {
  return (
    <RoleLayout
      description="Prescription workflow for assigned patients."
      navItems={navItems}
      role="doctor"
      title="Doctor workspace"
    >
      {children}
    </RoleLayout>
  );
}
