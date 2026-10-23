import { ApiResponse } from "@/types/api";
import { getApiBaseUrl } from "./client";

export interface DocumentVerificationResultDto {
  isValid: boolean;
  documentType: string;
  documentNumber: string;
  holderName: string;
  holderPhotoUrl?: string | null;
  status: string;
  issueDate?: string | null;
  expiryDate?: string | null;
  issuingBranchName?: string | null;
  verificationTimestamp: string;
}

class VerificationService {
  private get baseUrl() {
    return getApiBaseUrl();
  }

  /**
   * استخراج رمز الـ Payload النظيف حتى لو تم تمرير رابط كامل
   */
  public extractPayloadToken(input: string): string {
    const trimmed = input.trim();
    if (trimmed.includes("/verify/")) {
      return trimmed.split("/verify/").pop()?.split("?")[0] || trimmed;
    }
    return trimmed;
  }

  /**
   * التحقق من وثيقة عبر الـ QR Payload أو التوكن
   * GET /api/v1/verification/{payload}
   */
  public async verifyDocument(payload: string): Promise<DocumentVerificationResultDto> {
    const cleanToken = this.extractPayloadToken(payload);
    if (!cleanToken) {
      throw new Error("رمز التحقق فارغ.");
    }
    const cleanPayload = encodeURIComponent(cleanToken);
    const res = await fetch(`${this.baseUrl}/api/v1/verification/${cleanPayload}`, {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
    });

    const data: ApiResponse<DocumentVerificationResultDto> = await res.json();
    if (!res.ok || !data.isSuccess || !data.data) {
      throw new Error(data.message || "الرمز غير صالح أو الوثيقة غير موجودة في السجل المركزي");
    }

    return data.data;
  }
}

export const verificationService = new VerificationService();
