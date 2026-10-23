import { ApiResponse } from "@/types/api";
import { getApiBaseUrl } from "./client";

class FilesService {
  private get baseUrl() {
    return getApiBaseUrl();
  }

  /**
   * رفع صورة شخصية للمواطن
   * POST /api/v1/files/upload-photo
   */
  public async uploadPhoto(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("photo", file);

    const token = typeof window !== "undefined" ? localStorage.getItem("hwyati_auth_token") : null;

    const res = await fetch(`${this.baseUrl}/api/v1/files/upload-photo`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const data: ApiResponse<string> = await res.json();
    if (!res.ok || !data.isSuccess || !data.data) {
      throw new Error(data.message || "فشل رفع الصورة الشخصية");
    }

    return data.data; // e.g. "/uploads/photos/abc-123.jpg"
  }

  /**
   * رفع مستند مسحوب ضوئياً (مثل عقد زواج أو تقرير طبي)
   * POST /api/v1/files/upload-document
   */
  public async uploadDocument(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("document", file);

    const token = typeof window !== "undefined" ? localStorage.getItem("hwyati_auth_token") : null;

    const res = await fetch(`${this.baseUrl}/api/v1/files/upload-document`, {
      method: "POST",
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: formData,
    });

    const data: ApiResponse<string> = await res.json();
    if (!res.ok || !data.isSuccess || !data.data) {
      throw new Error(data.message || "فشل رفع المستند المرفق");
    }

    return data.data; // e.g. "/uploads/documents/doc-123.jpg"
  }

  /**
   * دالة مساعدة لتوليد الرابط الكامل للصورة
   */
  public getFullUrl(relativePath?: string | null): string {
    if (!relativePath || !relativePath.trim()) return "";
    if (relativePath.startsWith("http://") || relativePath.startsWith("https://") || relativePath.startsWith("blob:") || relativePath.startsWith("data:")) {
      return relativePath;
    }
    return `${this.baseUrl}${relativePath.startsWith("/") ? "" : "/"}${relativePath}`;
  }
}

export const filesService = new FilesService();
