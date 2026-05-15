export interface PatientUser {
  createdAt: string;
  email: string;
  id: string;
  name: string;
  role: "patient";
}

export interface Patient {
  birthDate: string | null;
  id: string;
  user: PatientUser;
  userId: string;
}
