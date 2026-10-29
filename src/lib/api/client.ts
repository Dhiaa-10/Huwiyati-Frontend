import { ApiResponse } from "@/types/api";
import { tryRefreshSession, clearAuthStorage } from "./authService";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://192.168.8.81:5237";

/**
 * Universal HTTP client for Hwyati ASP.NET Core Web API
 * Backend response shape: { isSuccess, statusCode, message, data, errors }
 */
class ApiClient {
  private baseUrl: string;
  private isRefreshing = false;
  private refreshPromise: Promise<string | null> | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    if (typeof window !== "undefined") {
      const token = window.localStorage.getItem("hwyati_auth_token");
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Internal wrapper that performs fetch and intercepts 401 to silently renew JWT
   */
  private async fetchWithAuth(url: string, init: RequestInit, isRetry = false): Promise<Response> {
    const res = await fetch(url, {
      ...init,
      headers: {
        ...this.getHeaders(),
        ...(init.headers || {}),
      },
    });

    if (res.status === 401 && !isRetry && typeof window !== "undefined") {
      // Avoid parallel refresh calls
      if (!this.isRefreshing) {
        this.isRefreshing = true;
        this.refreshPromise = tryRefreshSession().finally(() => {
          this.isRefreshing = false;
          this.refreshPromise = null;
        });
      }

      const newToken = await this.refreshPromise;
      if (newToken) {
        // Retry the original request once with new token
        return fetch(url, {
          ...init,
          headers: {
            ...this.getHeaders(),
            ...(init.headers || {}),
            Authorization: `Bearer ${newToken}`,
          },
        });
      } else {
        // Refresh failed, clean session and redirect to login if we are in browser
        clearAuthStorage();
        if (window.location.pathname !== "/login") {
          window.location.href = `/login?expired=1`;
        }
      }
    }

    return res;
  }

  /** Parse response and throw on HTTP error or backend failure */
  private async handleResponse<T>(res: Response): Promise<ApiResponse<T>> {
    const text = await res.text();

    if (!text) {
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
      const details = json.errors?.join(", ") ?? "";
      throw new Error(details ? `${msg}: ${details}` : msg);
    }

    return json;
  }

  public async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    let url = `${this.baseUrl}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          searchParams.append(key, String(value));
        }
      });
      const qs = searchParams.toString();
      if (qs) url += `?${qs}`;
    }

    const res = await this.fetchWithAuth(url, { method: "GET" });
    return this.handleResponse<T>(res);
  }

  public async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    const res = await this.fetchWithAuth(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    return this.handleResponse<T>(res);
  }

  public async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    const res = await this.fetchWithAuth(`${this.baseUrl}${endpoint}`, {
      method: "PUT",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    return this.handleResponse<T>(res);
  }

  public async patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    const res = await this.fetchWithAuth(`${this.baseUrl}${endpoint}`, {
      method: "PATCH",
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    return this.handleResponse<T>(res);
  }

  public async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const res = await this.fetchWithAuth(`${this.baseUrl}${endpoint}`, {
      method: "DELETE",
    });

    return this.handleResponse<T>(res);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
