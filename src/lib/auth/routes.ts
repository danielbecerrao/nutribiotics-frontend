import type { Role } from "./types";

export const loginPath = "/login";

export const roleHomePaths: Record<Role, string> = {
  admin: "/admin",
  doctor: "/doctor/prescriptions",
  patient: "/patient/prescriptions",
};

export function getRoleHomePath(role: Role) {
  return roleHomePaths[role];
}

export function redirectToRoleHome(
  navigate: (path: string) => void,
  role: Role,
) {
  navigate(getRoleHomePath(role));
}
