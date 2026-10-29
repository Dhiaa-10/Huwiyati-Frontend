/**
 * Huwiyati API — Authentication Service
 *
 * Wraps the real ASP.NET Core backend endpoints:
 *   POST  /api/v1/auth/login
 *   POST  /api/v1/auth/verify-device
 *   POST  /api/v1/auth/refresh-token
 *   POST  /api/v1/password/forgot
 *   POST  /api/v1/password/verify-reset-code
 *   POST  /api/v1/password/reset
 *
 * Response envelope from backend:
 *   { isSuccess, statusCode, message, data?, errors? }
 *
 * NOTE: AccountController was removed from the backend.
 * All old /api/v1/Account/* calls are replaced here.
 */

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://192.168.8.81:5237";

// ─── Token Storage Helpers ──────────────────────────────────────────────────

/** Reads the JWT access token stored by saveToken() */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("hwyati_auth_token");
}

/** Reads the refresh token stored after login */
export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem("hwyati_refresh_token");
}

/** Persists the JWT access token after a successful login */
export function saveToken(token: string): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("hwyati_auth_token", token);
    document.cookie = "hwyati_has_session=1; path=/; max-age=2592000; SameSite=Lax";
  }
}

/** Persists the refresh token after a successful login */
export function saveRefreshToken(token: string): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem("hwyati_refresh_token", token);
  }
}

/** Removes all auth data from localStorage and cookies (full logout) */
export function clearAuthStorage(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem("hwyati_auth_token");
    window.localStorage.removeItem("hwyati_refresh_token");
    window.localStorage.removeItem("hwyati_auth_session");
    document.cookie = "hwyati_has_session=0; path=/; max-age=0; SameSite=Lax";
  }
}

/**
 * Returns a stable device identifier for this browser session.
 * For staff/admin login each national number gets a dedicated device key,
 * so multiple accounts can be tested from the same machine without
 * sharing a single "trusted device" record in the backend.
 */
export function getDeviceIdentifier(nationalNumber?: string): string {
  if (typeof window === "undefined") return "server-side";
  if (nationalNumber && nationalNumber.trim()) {
    // Per-user device key: stable across page refreshes, unique per account
    const key = `hwyati_device_id_${nationalNumber.trim()}`;
    let id = window.localStorage.getItem(key);
    if (!id) {
      id = `web-portal-${nationalNumber.trim()}-${Date.now()}`;
      window.localStorage.setItem(key, id);
    }
    return id;
  }
  // Fallback generic device id (should not normally be reached for staff login)
  let id = window.localStorage.getItem("hwyati_device_id");
  if (!id) {
    id = `web-portal-anon-${Date.now()}`;
    window.localStorage.setItem("hwyati_device_id", id);
  }
  return id;
}

// ─── Low-level fetch helper ─────────────────────────────────────────────────

/** Raw fetch that always returns the backend ApiResponse<T> envelope without throwing. */
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

  try {
    const res = await fetch(`${BASE}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const text = await res.text();
    if (!text) {
      return {
        isSuccess: res.ok,
        statusCode: res.status,
        message: res.ok ? "OK" : `HTTP ${res.status}`,
      };
    }

    const json = JSON.parse(text);
    return json;
  } catch (err) {
    return {
      isSuccess: false,
      statusCode: 0,
      message: err instanceof Error ? err.message : "Network error",
    };
  }
}

// ─── Types ──────────────────────────────────────────────────────────────────

/** Payload sent to POST /api/v1/auth/login */
export interface LoginPayload {
  nationalNumber: string;
  password: string;
  /**
   * Must exactly match one of the backend AppRoles values:
   *   "SuperAdmin" | "Admin" | "Employee"
   * The backend performs a case-insensitive comparison.
   */
  requestedRole: "SuperAdmin" | "Admin" | "Employee";
  /**
   * Optional: the organization the staff member is logging into.
   * When provided, the backend validates that the employee belongs to this org.
   * Leave undefined for SuperAdmin.
   */
  organizationId?: string;
  /** Stable browser/device fingerprint — stored per national number */
  deviceIdentifier: string;
  deviceName?: string;
  operatingSystem?: string;
}

/** Data shape returned by the backend on successful login */
export interface LoginResult {
  userId: string;
  /** JWT access token — empty string when requiresDeviceVerification is true */
  accessToken: string;
  expiration: string;
  refreshToken?: string;
  refreshTokenExpiration?: string;
  nationalNumber: string;
  fullName: string;
  accountStatus: string;
  /** true  → new/untrusted device: OTP sent to email, show verify-device step
   *  false → trusted device: login complete, token is valid */
  requiresDeviceVerification: boolean;
}

export interface VerifyDevicePayload {
  nationalNumber: string;
  deviceIdentifier: string;
  /** 6-digit OTP received by email */
  code: string;
}

export interface RefreshTokenPayload {
  accessToken: string;
  refreshToken: string;
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

// ─── API Calls ───────────────────────────────────────────────────────────────

/**
 * POST /api/v1/auth/login
 *
 * Authenticates a staff/admin user for the web dashboard.
 * Returns LoginResult. If requiresDeviceVerification === true,
 * the caller must call apiVerifyDevice() with the OTP sent to the user's email.
 */
export async function apiLogin(payload: LoginPayload) {
  return apiFetch<LoginResult>("POST", "/api/v1/auth/login", payload);
}

/**
 * POST /api/v1/auth/verify-device
 *
 * Confirms a new/untrusted device by submitting the OTP.
 * On success, returns a full LoginResult with a valid access token.
 */
export async function apiVerifyDevice(payload: VerifyDevicePayload) {
  return apiFetch<LoginResult>("POST", "/api/v1/auth/verify-device", payload);
}

/**
 * POST /api/v1/auth/refresh-token
 *
 * Exchanges an expired access token + valid refresh token for a new pair.
 * Call this automatically when any authenticated request returns 401.
 */
export async function apiRefreshToken(payload: RefreshTokenPayload) {
  return apiFetch<LoginResult>("POST", "/api/v1/auth/refresh-token", payload);
}

/**
 * POST /api/v1/password/forgot
 *
 * Sends a password-reset OTP to the user's registered email.
 */
export async function apiForgotPassword(payload: ForgotPasswordPayload) {
  return apiFetch<void>("POST", "/api/v1/password/forgot", payload);
}

/**
 * POST /api/v1/password/verify-reset-code
 *
 * Validates the reset OTP before allowing a new password to be set.
 */
export async function apiVerifyResetCode(payload: VerifyResetPayload) {
  return apiFetch<void>("POST", "/api/v1/password/verify-reset-code", payload);
}

/**
 * POST /api/v1/password/reset
 *
 * Sets a new password after OTP verification.
 */
export async function apiResetPassword(payload: ResetPasswordPayload) {
  return apiFetch<void>("POST", "/api/v1/password/reset", payload);
}

// ─── JWT Decode Helpers ──────────────────────────────────────────────────────

/**
 * Full decoded payload extracted from a JWT.
 * All fields are optional because different token types carry different claims.
 */
export interface DecodedTokenPayload {
  /** User ID (sub claim) */
  userId?: string;
  /** National number (name claim) */
  nationalNumber?: string;
  /** Full name from civil registry */
  fullName?: string;
  /** Account status (Active / Suspended / Deactivated) */
  accountStatus?: string;
  /** Roles granted by the backend (ClaimTypes.Role) */
  roles: string[];
  /** Organization GUID — only present for Admin / Employee tokens */
  organizationId?: string;
  /** Branch GUID — only present for Admin / Employee tokens */
  branchId?: string;
  /** Token expiry (Unix timestamp) */
  exp?: number;
}

/**
 * Decodes the payload section of a JWT without verifying the signature.
 * Used client-side to extract claims (role, branchId, organizationId, etc.)
 * after the backend has already validated the token.
 *
 * Returns a safe default on any error.
 */
export function decodeToken(token: string): DecodedTokenPayload {
  const empty: DecodedTokenPayload = { roles: [] };
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return empty;

    const payload = JSON.parse(atob(parts[1]));

    // Role claim key used by ASP.NET Identity
    const roleClaim =
      payload["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ??
      payload["role"] ??
      payload["roles"] ??
      payload["Role"];

    const roles: string[] = Array.isArray(roleClaim)
      ? roleClaim
      : roleClaim
      ? [roleClaim]
      : [];

    return {
      userId: payload["sub"] ?? payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"],
      nationalNumber: payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ?? payload["name"],
      fullName: payload["fullName"],
      accountStatus: payload["accountStatus"],
      roles,
      organizationId: payload["OrganizationId"] ?? payload["organizationId"],
      branchId: payload["BranchId"] ?? payload["branchId"],
      exp: payload["exp"],
    };
  } catch {
    return empty;
  }
}

/**
 * @deprecated Use decodeToken() instead.
 * Kept for backward-compatibility with existing import sites.
 */
export function decodeRolesFromToken(token: string): string[] {
  return decodeToken(token).roles;
}

/** Returns true when the token's exp claim is in the future (with a 30-second buffer). */
export function isTokenValid(token: string | null): boolean {
  if (!token) return false;
  const { exp } = decodeToken(token);
  if (!exp) return false;
  return Date.now() / 1000 < exp - 30;
}

/**
 * Attempts to silently refresh the session using the stored refresh token.
 * On success: saves the new tokens and returns the new access token.
 * On failure: clears auth storage and returns null.
 */
export async function tryRefreshSession(): Promise<string | null> {
  const accessToken = getToken();
  const refreshToken = getRefreshToken();
  if (!accessToken || !refreshToken) {
    clearAuthStorage();
    return null;
  }

  const res = await apiRefreshToken({ accessToken, refreshToken });
  if (res.isSuccess && res.data?.accessToken) {
    saveToken(res.data.accessToken);
    if (res.data.refreshToken) saveRefreshToken(res.data.refreshToken);
    return res.data.accessToken;
  }

  clearAuthStorage();
  return null;
}
