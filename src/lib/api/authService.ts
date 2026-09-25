/**
 * Huwiyati API — Authentication Service
 * Wraps all /api/v1/Account endpoints from the real ASP.NET Core backend.
 *
 * Response shape from backend:
 *   { isSuccess, statusCode, message, data, errors }
 */

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5237";

// ─── Shared utilities ──────────────────────────────────────────────────────────

/** Reads the JWT stored by saveToken() */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("hwyati_auth_token");
}

/** Persists the JWT after a successful login */
export function saveToken(token: string): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("hwyati_auth_token", token);
  }
}

/** Removes all auth data from localStorage (logout) */
export function clearAuthStorage(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem("hwyati_auth_token");
    window.localStorage.removeItem("hwyati_auth_session");
  }
}

/** Returns a stable device identifier for this browser (stored once, reused) */
export function getDeviceIdentifier(nationalNumber?: string): string {
  if (typeof window === "undefined") return "server-side";
  if (nationalNumber && nationalNumber.trim()) {
    return `test-trusted-device-${nationalNumber.trim()}`;
  }
  let id = window.localStorage.getItem("hwyati_device_id");
  if (!id) {
    id = "test-trusted-device-01011131317";
    window.localStorage.setItem("hwyati_device_id", id);
  }
  return id;
}

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

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // The backend always returns JSON with { isSuccess, statusCode, message, data?, errors? }
  const json = await res.json();
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
  deviceIdentifier: string;
  deviceName?: string;
  operatingSystem?: string;
}

export interface LoginResult {
  userId: string;
  accessToken: string;
  expiration: string;
  nationalNumber: string;
  fullName: string;
  accountStatus: string;
  requiresDeviceVerification: boolean;
  /** Populated from JWT claims after the backend validates the token */
  roles?: string[];
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
