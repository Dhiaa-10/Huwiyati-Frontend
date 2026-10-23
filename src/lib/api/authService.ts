/**
 * Huwiyati API — Authentication Service
 * Wraps all /api/v1/Account endpoints from the real ASP.NET Core backend.
 *
 * Response shape from backend:
 *   { isSuccess, statusCode, message, data, errors }
 */

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5237";

// ─── Shared utilities ──────────────────────────────────────────────────────────

export {
  AUTH_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  AUTH_SESSION_KEY,
  DEVICE_ID_KEY,
  getToken,
  saveToken,
  getRefreshToken,
  saveRefreshToken,
  saveAuthTokens,
  clearAuthStorage,
  getDeviceIdentifier,
} from "./tokenStorage";

import { getToken, getRefreshToken, saveAuthTokens, clearAuthStorage } from "./tokenStorage";
import { apiClient, getApiBaseUrl } from "./client";
import { translateBackendError } from "@/lib/utils/errorTranslator";

/** Low-level fetch helper. Returns the raw backend ApiResponse<T>. */
async function apiFetch<T>(
  method: "GET" | "POST" | "PUT" | "DELETE",
  path: string,
  body?: unknown
): Promise<{ isSuccess: boolean; statusCode: number; message: string; data?: T; errors?: string[] }> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const token = getToken();
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // The backend always returns JSON with { isSuccess, statusCode, message, data?, errors? }
  const json = await res.json();
  if (json.isSuccess === false || !res.ok) {
    if (json.errors && Array.isArray(json.errors) && json.errors.length > 0) {
      const translatedErrors = json.errors.map((e: string) => translateBackendError(e)).filter(Boolean);
      json.message = `فشل التحقق من صحة البيانات؛ يرجى استيفاء الحقول المطلوبة: (${translatedErrors.join(" • ")})`;
    } else if (json.message) {
      json.message = translateBackendError(json.message);
    }
  }
  return json;
}

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface RegisterPayload {
  nationalNumber: string;
  dateOfBirth: string; // ISO date "YYYY-MM-DD"
  phoneNumber: string;
  email: string;
  password: string;
}

export interface RegisterResult {
  userId: string | null;
  nationalNumber: string;
  accountStatus: string;
}

export interface LoginPayload {
  nationalNumber: string;
  password: string;
  requestedRole: string;
  branchId?: string;
  deviceIdentifier: string;
  deviceName?: string;
  operatingSystem?: string;
}

export interface LoginResult {
  userId: string;
  accessToken: string;
  expiration: string;
  refreshToken?: string;
  refreshTokenExpiration?: string;
  nationalNumber: string;
  fullName: string;
  accountStatus: string;
  requiresDeviceVerification: boolean;
  /** Populated from JWT claims after the backend validates the token */
  roles?: string[];
}

export interface GenerateTokenModel {
  token: string;
  expiration: string;
  refreshToken: string;
  refreshTokenExpiration: string;
}

export interface CitizenAccountStatusDto {
  personId: string;
  personFullName: string;
  nationalNumber: string;
  hasRegisteredAccount: boolean;
  userId?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  status?: "PendingActivation" | "Active" | "Suspended" | "Deactivated" | string;
  createdAt?: string | null;
  activatedAt?: string | null;
}

export interface RegisteredUserAccountDto {
  userId: string;
  personId: string;
  nationalNumber: string;
  fullName: string;
  email?: string | null;
  phoneNumber?: string | null;
  status: "PendingActivation" | "Active" | "Suspended" | "Deactivated" | string;
  createdAt: string;
  activatedAt?: string | null;
}

export interface VerifyOtpPayload {
  userId: string;
  code: string;
}

export interface VerifyDevicePayload {
  nationalNumber: string;
  deviceIdentifier: string;
  code: string;
}

export interface ForgotPasswordPayload {
  nationalNumber: string;
}

export interface VerifyResetPayload {
  nationalNumber: string;
  code: string;
}

export interface ResetPasswordPayload {
  nationalNumber: string;
  code: string;
  newPassword: string;
}

export interface RequestOtpPayload {
  nationalNumber: string;
  password: string;
}

export interface DeactivatePayload {
  nationalNumber: string;
  password: string;
  code: string;
}

export interface ReactivatePayload {
  nationalNumber: string;
  password: string;
  code: string;
}

// ─── API calls ─────────────────────────────────────────────────────────────────

/** POST /api/v1/Account/register */
export async function apiRegister(payload: RegisterPayload) {
  return apiFetch<RegisterResult>("POST", "/api/v1/Account/register", payload);
}

/** POST /api/v1/Account/login */
export async function apiLogin(payload: LoginPayload) {
  return apiFetch<LoginResult>("POST", "/api/v1/Account/login", payload);
}

/** POST /api/v1/Account/verify-otp — confirms email OTP after register */
export async function apiVerifyOtp(payload: VerifyOtpPayload) {
  return apiFetch<void>("POST", "/api/v1/Account/verify-otp", payload);
}

/** POST /api/v1/Account/verify-device — confirms a new browser/device */
export async function apiVerifyDevice(payload: VerifyDevicePayload) {
  return apiFetch<LoginResult>("POST", "/api/v1/Account/verify-device", payload);
}

/** POST /api/v1/Account/forgot-password */
export async function apiForgotPassword(payload: ForgotPasswordPayload) {
  return apiFetch<void>("POST", "/api/v1/Account/forgot-password", payload);
}

/** POST /api/v1/Account/verify-reset-code */
export async function apiVerifyResetCode(payload: VerifyResetPayload) {
  return apiFetch<void>("POST", "/api/v1/Account/verify-reset-code", payload);
}

/** POST /api/v1/Account/reset-password */
export async function apiResetPassword(payload: ResetPasswordPayload) {
  return apiFetch<void>("POST", "/api/v1/Account/reset-password", payload);
}

/** POST /api/v1/Account/request-otp — resend OTP for deactivated accounts */
export async function apiRequestOtp(payload: RequestOtpPayload) {
  return apiFetch<void>("POST", "/api/v1/Account/request-otp", payload);
}

/** POST /api/v1/Account/deactivate */
export async function apiDeactivateAccount(payload: DeactivatePayload) {
  return apiFetch<void>("POST", "/api/v1/Account/deactivate", payload);
}

/** POST /api/v1/Account/reactivate */
export async function apiReactivateAccount(payload: ReactivatePayload) {
  return apiFetch<void>("POST", "/api/v1/Account/reactivate", payload);
}

/**
 * POST /api/v1/Account/refresh-token
 * Rotates the refresh token and returns a fresh JWT access token.
 */
export async function apiRefreshToken(): Promise<string | null> {
  return apiClient.refreshToken();
}

/**
 * GET /api/v1/Account/citizen-status/{nationalNumber}
 * Retrieves citizen online account registration and activation status (Employee, Admin).
 */
export async function apiGetCitizenAccountStatus(nationalNumber: string) {
  return apiClient.get<CitizenAccountStatusDto>(
    `/api/v1/Account/citizen-status/${encodeURIComponent(nationalNumber.trim())}`
  );
}

/**
 * POST /api/v1/Account/activate-citizen
 * Staff-initiated manual activation of a registered citizen account.
 */
export async function apiActivateCitizenAccount(nationalNumber: string) {
  return apiClient.post<CitizenAccountStatusDto>(
    "/api/v1/Account/activate-citizen",
    { nationalNumber: nationalNumber.trim() }
  );
}

/**
 * GET /api/v1/Account/all-users
 * Retrieves all platform user accounts for SuperAdmin administration.
 */
export async function apiGetAllUserAccounts() {
  return apiClient.get<RegisteredUserAccountDto[]>("/api/v1/Account/all-users");
}

/**
 * Decode the roles claim from a JWT without a library.
 * Returns an empty array if the token is missing or malformed.
 */
export function decodeRolesFromToken(token: string): string[] {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    const roleClaim =
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
      payload["role"] ||
      payload["roles"] ||
      payload["Role"];
    if (!roleClaim) return [];
    return Array.isArray(roleClaim) ? roleClaim : [roleClaim];
  } catch {
    return [];
  }
}

/**
 * Decode the BranchId claim from a JWT without a library.
 * Returns null if the token is missing, malformed, or has no branch ID.
 */
export function decodeBranchIdFromToken(token: string): string | null {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return (
      payload["BranchId"] ||
      payload["branchId"] ||
      payload["branch_id"] ||
      null
    );
  } catch {
    return null;
  }
}

