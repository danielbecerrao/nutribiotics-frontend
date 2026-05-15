import type { Prescription } from "@/lib/prescriptions";

export interface AdminMetricsUser {
  createdAt: string;
  email: string;
  id: string;
  name: string;
  role: "admin" | "doctor" | "patient";
}

export type AdminAuditLogAction = "prescription_consumed";

export interface AdminAuditLog {
  action: AdminAuditLogAction;
  actor: AdminMetricsUser | null;
  createdAt: string;
  id: string;
  metadata: Record<string, unknown> | null;
  prescription: Prescription | null;
  prescriptionId: string | null;
}

export interface AdminMetricsDoctor {
  id: string;
  specialty: string | null;
  user: AdminMetricsUser;
  userId: string;
}

export interface AdminMetrics {
  dailySeries: Array<{
    date: string;
    total: number;
  }>;
  prescriptionsByStatus: {
    consumed: number;
    pending: number;
  };
  topDoctors: Array<{
    doctor: AdminMetricsDoctor;
    doctorId: string;
    total: number;
  }>;
  totals: {
    doctors: number;
    patients: number;
    prescriptions: number;
  };
}
