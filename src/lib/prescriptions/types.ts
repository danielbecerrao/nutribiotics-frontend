export const prescriptionStatuses = ["pending", "consumed"] as const;

export type PrescriptionStatus = (typeof prescriptionStatuses)[number];

export interface PrescriptionUser {
  id: string;
  createdAt: string;
  email: string;
  name: string;
  role: "admin" | "doctor" | "patient";
}

export interface PrescriptionPatient {
  birthDate: string | null;
  id: string;
  user: PrescriptionUser;
  userId: string;
}

export interface PrescriptionDoctor {
  id: string;
  specialty: string | null;
  user: PrescriptionUser;
  userId: string;
}

export interface PrescriptionItem {
  dosage: string | null;
  id: string;
  instructions: string | null;
  name: string;
  prescriptionId: string;
  quantity: number | null;
}

export interface Prescription {
  author: PrescriptionDoctor;
  authorId: string;
  code: string;
  consumedAt: string | null;
  createdAt: string;
  id: string;
  items: PrescriptionItem[];
  notes: string | null;
  patient: PrescriptionPatient;
  patientId: string;
  status: PrescriptionStatus;
}
