import { ApiResponse } from "@/types/api";
import { getToken, getRefreshToken, saveAuthTokens, clearAuthStorage } from "./tokenStorage";
import { translateBackendError } from "@/lib/utils/errorTranslator";

/**
 * Resolves the backend API base URL dynamically:
 * - If running in browser and accessed via LAN IP or custom host (not localhost),
 *   it automatically connects to the same host on port 5237.
 * - Otherwise falls back to NEXT_PUBLIC_API_BASE_URL or http://localhost:5237.
 */
export function getApiBaseUrl(): string {
  const envUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname && hostname !== "localhost" && hostname !== "127.0.0.1") {
      if (envUrl && (envUrl.includes("localhost") || envUrl.includes("127.0.0.1"))) {
        return envUrl.replace(/localhost|127\.0\.0\.1/, hostname);
      }
      if (!envUrl) {
        return `http://${hostname}:5237`;
      }
    }
  }
  return envUrl || "http://localhost:5237";
}

/**
 * Universal HTTP client for Hwyati ASP.NET Core Web API
 * Backend response shape: { isSuccess, statusCode, message, data, errors }
 */
class ApiClient {
  private customBaseUrl?: string;
  private refreshPromise: Promise<string | null> | null = null;

  constructor(baseUrl?: string) {
    this.customBaseUrl = baseUrl;
  }

  public get baseUrl(): string {
    return this.customBaseUrl ?? getApiBaseUrl();
  }

  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Concurrency-deduplicated refresh token handler.
   * If multiple API calls fail with 401 at the same time,
   * only a single refresh request is sent to the backend.
   */
  public async refreshToken(): Promise<string | null> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const currentToken = getToken();
        const currentRefreshToken = getRefreshToken();

        if (!currentToken || !currentRefreshToken) {
          clearAuthStorage();
          return null;
        }

        const res = await fetch(`${this.baseUrl}/api/v1/Account/refresh-token`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            token: currentToken,
            refreshToken: currentRefreshToken,
          }),
        });

        if (!res.ok) {
          clearAuthStorage();
          return null;
        }

        const json = await res.json();
        if (json.isSuccess && json.data?.token) {
          saveAuthTokens(json.data.token, json.data.refreshToken);
          return json.data.token as string;
        }

        clearAuthStorage();
        return null;
      } catch (err) {
        console.error("Token refresh failed:", err);
        clearAuthStorage();
        return null;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  /** Parse response and throw on HTTP error or backend failure */
  private async handleResponse<T>(res: Response): Promise<ApiResponse<T>> {
    const text = await res.text();

    if (!text) {
      // Some DELETE responses return 204 No Content
      if (res.status === 204 || res.ok) {
        return { isSuccess: true, statusCode: res.status, message: "OK", data: undefined as T };
      }
      throw new Error(`HTTP Error (${res.status}): Empty response`);
    }

    let json: ApiResponse<T>;
    try {
      json = JSON.parse(text);
    } catch {
      throw new Error(`HTTP Error (${res.status}): ${text}`);
    }

    if (!res.ok || json.isSuccess === false) {
      const msg = json.message || `HTTP ${res.status}`;
      if (json.errors && Array.isArray(json.errors) && json.errors.length > 0) {
        const translatedErrors = json.errors
          .map((err) => translateBackendError(err))
          .filter(Boolean);
        if (/validation failed/i.test(msg) || !msg || msg.startsWith("HTTP")) {
          throw new Error(
            `فشل التحقق من صحة البيانات؛ يرجى استيفاء الحقول المطلوبة: (${translatedErrors.join(" • ")})`
          );
        } else {
          const translatedBase = translateBackendError(msg);
          throw new Error(`${translatedBase} (${translatedErrors.join(" • ")})`);
        }
      }
      throw new Error(translateBackendError(msg));
    }

    return json;
  }

  /** Centralized request executor with 401 retry interceptor */
  private async request<T>(
    method: string,
    endpoint: string,
    body?: any,
    isRetry = false
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.getHeaders();

    const init: RequestInit = {
      method,
      headers,
    };
    if (body !== undefined && body !== null) {
      init.body = JSON.stringify(body);
    }

    const res = await fetch(url, init);

    // If 401 and not already retrying, attempt token refresh unless calling auth endpoints
    if (
      res.status === 401 &&
      !isRetry &&
      !endpoint.includes("/Account/refresh-token") &&
      !endpoint.includes("/Account/login")
    ) {
      const newToken = await this.refreshToken();
      if (newToken) {
        // Re-execute with refreshed token
        return this.request<T>(method, endpoint, body, true);
      }
    }

    return this.handleResponse<T>(res);
  }

  public async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    let path = endpoint;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });
      const qs = searchParams.toString();
      if (qs) path += `?${qs}`;
    }

    return this.request<T>("GET", path);
  }

  public async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>("POST", endpoint, body);
  }

  public async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>("PUT", endpoint, body);
  }

  public async patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.request<T>("PATCH", endpoint, body);
  }

  public async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>("DELETE", endpoint);
  }
}

export const apiClient = new ApiClient();
