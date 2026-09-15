export type UserRole =
  | "SUPER_ADMIN"
  | "CIVIL_MANAGER"
  | "CIVIL_OFFICER"
  | "TRAFFIC_OFFICER"
  | "PASSPORT_OFFICER"
  | "HOSPITAL_OFFICER";

export interface AuthUser {
  id: string;
  name: string;
  nationalNumber: string;
  employeeNumber?: string;
  email: string;
  phoneNumber?: string;
  role: UserRole;
  organizationId?: string;
  organizationName: string;
  branchId?: string;
  branchName?: string;
  avatarUrl?: string;
}

export interface LoginCredentials {
  identifier: string; // National Number or Username
  password: string;
  portalRole: UserRole;
}
