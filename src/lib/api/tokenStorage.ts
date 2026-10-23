/**
 * Token and Device Storage Utilities for Hwyati Frontend
 */

export const AUTH_TOKEN_KEY = "hwyati_auth_token";
export const REFRESH_TOKEN_KEY = "hwyati_refresh_token";
export const AUTH_SESSION_KEY = "hwyati_auth_session";
export const DEVICE_ID_KEY = "hwyati_device_id";

/** Reads the JWT access token from localStorage */
export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(AUTH_TOKEN_KEY);
}

/** Persists the JWT access token to localStorage */
export function saveToken(token: string): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(AUTH_TOKEN_KEY, token);
  }
}

/** Reads the refresh token stored in localStorage */
export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

/** Persists the refresh token to localStorage */
export function saveRefreshToken(refreshToken: string): void {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
}

/** Persists both JWT and Refresh Token */
export function saveAuthTokens(accessToken: string, refreshToken?: string): void {
  saveToken(accessToken);
  if (refreshToken) {
    saveRefreshToken(refreshToken);
  }
}

/** Removes all auth data from localStorage (logout) */
export function clearAuthStorage(): void {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    window.localStorage.removeItem(REFRESH_TOKEN_KEY);
    window.localStorage.removeItem(AUTH_SESSION_KEY);
  }
}

/** Returns a stable device identifier for this browser (stored once, reused) */
export function getDeviceIdentifier(nationalNumber?: string): string {
  if (typeof window === "undefined") return "server-side";
  if (nationalNumber && nationalNumber.trim()) {
    return `test-trusted-device-${nationalNumber.trim()}`;
  }
  let id = window.localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = "test-trusted-device-01011131317";
    window.localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}
