import { ApiResponse } from "@/types/api";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5237";

/**
 * Universal HTTP client for Hwyati ASP.NET Core Web API
 * Backend response shape: { isSuccess, statusCode, message, data, errors }
 */
class ApiClient {
  private baseUrl: string;

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

    const res = await fetch(url, {
      method: "GET",
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(res);
  }

  public async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "POST",
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    return this.handleResponse<T>(res);
  }

  public async put<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "PUT",
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    return this.handleResponse<T>(res);
  }

  public async patch<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "PATCH",
      headers: this.getHeaders(),
      body: JSON.stringify(body),
    });

    return this.handleResponse<T>(res);
  }

  public async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method: "DELETE",
      headers: this.getHeaders(),
    });

    return this.handleResponse<T>(res);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
