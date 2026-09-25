/**
 * Huwiyati Organizations API Service — REAL BACKEND
 * Covers: /api/v1/Branches, /api/v1/Admins, /api/v1/Employees, /api/v1/Person
 *
 * All endpoints require SuperAdmin JWT (Authorization: Bearer <token>)
 */

import { getToken } from "./authService";

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5237";

// ─── Shared fetch helper ───────────────────────────────────────────────────────

async function apiFetch<T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  body?: unknown,
  queryParams?: Record<string, string | undefined>
): Promise<{ isSuccess: boolean; statusCode: number; message: string; data?: T; errors?: string[] }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  let url = `${BASE}${path}`;
  if (queryParams) {
    const qs = Object.entries(queryParams)
      .filter(([, v]) => v !== undefined && v !== "")
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v!)}`)
      .join("&");
    if (qs) url += `?${qs}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  return res.json();
}

// ─── Types (matching backend DTOs) ────────────────────────────────────────────

export interface OrganizationDto {
  id: string;
  name: string;
}

export interface BranchDto {
  id: string;
  organizationId: string;
  organizationName: string;
  branchName: string;
  governorate: string;
  district: string;
  addressDetails?: string;
  phoneNumber?: string;
  isActive: boolean;
  createdAt: string;
}

export interface AdminDto {
  employeeId: string;
  userId: string;
  nationalNumber: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  employeeNumber: string;
  branchId: string;
  branchName: string;
  organizationName: string;
  isActive: boolean;
  createdAt: string;
}

export interface EmployeeDto {
  employeeId: string;
  userId: string;
  nationalNumber: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  employeeNumber: string;
  branchId: string;
  branchName: string;
  organizationName: string;
  isActive: boolean;
  createdAt: string;
}

export interface PersonDto {
  id: string;
  nationalNumber: string;
  firstName: string;
  fatherName: string;
  grandfatherName: string;
  familyName: string;
  dateOfBirth: string;
  governorate: string;
  gender: string;
}

// ─── Branches ──────────────────────────────────────────────────────────────────

/** GET /api/v1/Branches/organizations — list of all root organizations */
export async function apiGetOrganizations() {
  return apiFetch<OrganizationDto[]>("GET", "/api/v1/Branches/organizations");
}

/** GET /api/v1/Branches?organizationId=... */
export async function apiGetBranches(organizationId?: string) {
  return apiFetch<BranchDto[]>("GET", "/api/v1/Branches", undefined, {
    organizationId,
  });
}

/** GET /api/v1/Branches/{id} */
export async function apiGetBranchById(id: string) {
  return apiFetch<BranchDto>("GET", `/api/v1/Branches/${id}`);
}

/** POST /api/v1/Branches */
export async function apiCreateBranch(dto: {
  organizationId: string;
  branchName: string;
  governorate: string;
  district: string;
  addressDetails?: string;
  phoneNumber?: string;
}) {
  return apiFetch<BranchDto>("POST", "/api/v1/Branches", dto);
}

/** PUT /api/v1/Branches/{id} */
export async function apiUpdateBranch(
  id: string,
  dto: {
    id: string;
    organizationId: string;
    branchName?: string;
    governorate?: string;
    district?: string;
    addressDetails?: string;
    phoneNumber?: string;
  }
) {
  return apiFetch<BranchDto>("PUT", `/api/v1/Branches/${id}`, dto);
}

/** DELETE /api/v1/Branches/{id} */
export async function apiDeleteBranch(id: string) {
  return apiFetch<void>("DELETE", `/api/v1/Branches/${id}`);
}

/** POST /api/v1/Branches/{id}/restore */
export async function apiRestoreBranch(id: string) {
  return apiFetch<BranchDto>("POST", `/api/v1/Branches/${id}/restore`);
}

// ─── Admins ────────────────────────────────────────────────────────────────────

/** GET /api/v1/Admins?organizationId=...&branchId=... */
export async function apiGetAdmins(organizationId?: string, branchId?: string) {
  return apiFetch<AdminDto[]>("GET", "/api/v1/Admins", undefined, {
    organizationId,
    branchId,
  });
}

/** GET /api/v1/Admins/{id} */
export async function apiGetAdminById(id: string) {
  return apiFetch<AdminDto>("GET", `/api/v1/Admins/${id}`);
}

/** POST /api/v1/Admins — assign citizen as admin */
export async function apiAssignAdmin(dto: { nationalNumber: string; branchId: string }) {
  return apiFetch<AdminDto>("POST", "/api/v1/Admins", dto);
}

/** PUT /api/v1/Admins/{id} */
export async function apiUpdateAdmin(id: string, dto: { branchId: string }) {
  return apiFetch<AdminDto>("PUT", `/api/v1/Admins/${id}`, dto);
}

/** DELETE /api/v1/Admins/{id} */
export async function apiRemoveAdmin(id: string) {
  return apiFetch<void>("DELETE", `/api/v1/Admins/${id}`);
}

/** POST /api/v1/Admins/{id}/restore */
export async function apiRestoreAdmin(id: string) {
  return apiFetch<AdminDto>("POST", `/api/v1/Admins/${id}/restore`);
}

// ─── Employees ─────────────────────────────────────────────────────────────────

/** GET /api/v1/Employees */
export async function apiGetEmployees() {
  return apiFetch<EmployeeDto[]>("GET", "/api/v1/Employees");
}

/** GET /api/v1/Employees/{id} */
export async function apiGetEmployeeById(id: string) {
  return apiFetch<EmployeeDto>("GET", `/api/v1/Employees/${id}`);
}

/** POST /api/v1/Employees — assign citizen as employee */
export async function apiAssignEmployee(dto: { nationalNumber: string }) {
  return apiFetch<EmployeeDto>("POST", "/api/v1/Employees", dto);
}

/** PUT /api/v1/Employees/{id} */
export async function apiUpdateEmployee(
  id: string,
  dto: { employeeId: string; newBranchId: string }
) {
  return apiFetch<EmployeeDto>("PUT", `/api/v1/Employees/${id}`, dto);
}

/** DELETE /api/v1/Employees/{id} */
export async function apiDeleteEmployee(id: string) {
  return apiFetch<void>("DELETE", `/api/v1/Employees/${id}`);
}

/** POST /api/v1/Employees/{id}/activate */
export async function apiActivateEmployee(id: string) {
  return apiFetch<EmployeeDto>("POST", `/api/v1/Employees/${id}/activate`);
}

// ─── Persons (Civil Registry lookup) ──────────────────────────────────────────

/** GET /api/v1/Person — SuperAdmin only, returns all citizens */
export async function apiGetPersons() {
  return apiFetch<PersonDto[]>("GET", "/api/v1/Person");
}
