/**
 * Huwiyati — Hospital Service (Live HTTP Only)
 * =============================================
 * Connects directly to the Huwiyati.API backend.
 * No mock fallback — if the endpoint is unavailable, a clear ServiceUnavailableError is thrown.
 *
 * NOTE: The following endpoints are NOT yet implemented in the backend:
 *   GET  /api/hospitals/metrics
 *   GET  /api/hospitals/records
 *   GET  /api/hospitals/records/{nid}
 *   POST /api/hospitals/records/diagnoses
 *   POST /api/hospitals/records/operations
 *   POST /api/hospitals/records/chronic-diseases
 *   PATCH /api/hospitals/records/{id}/visibility
 *
 * When these endpoints return errors, the service throws a ServiceUnavailableError
 * so that pages can display a clear "service not available" message.
 */

import { apiClient } from "./client";
import {
  MedicalRecord,
  HospitalDashboardMetrics,
  AddDiagnosisDto,
  AddOperationDto,
  AddChronicDiseaseDto,
  ToggleVisibilityDto,
} from "@/types/hospitals";

/** Thrown when a backend endpoint is not yet implemented or unavailable */
export class ServiceUnavailableError extends Error {
  constructor(endpoint: string) {
    super(
      `الخدمة غير متوفرة حالياً من الخادم (${endpoint}). سيتم تفعيلها عند اكتمال بناء الواجهة الخلفية.`
    );
    this.name = "ServiceUnavailableError";
  }
}

export interface IHospitalService {
  getDashboardMetrics(): Promise<HospitalDashboardMetrics>;
  getMedicalRecords(search?: string): Promise<MedicalRecord[]>;
  getMedicalRecordByNationalNumber(nid: string): Promise<MedicalRecord | null>;
  addDiagnosis(dto: AddDiagnosisDto): Promise<MedicalRecord>;
  addOperation(dto: AddOperationDto): Promise<MedicalRecord>;
  addChronicDisease(dto: AddChronicDiseaseDto): Promise<MedicalRecord>;
  toggleRecordVisibility(dto: ToggleVisibilityDto): Promise<MedicalRecord>;
}

class HttpHospitalService implements IHospitalService {
  async getDashboardMetrics(): Promise<HospitalDashboardMetrics> {
    try {
      const res = await apiClient.get<HospitalDashboardMetrics>("/api/hospitals/metrics");
      return res.data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new ServiceUnavailableError(`GET /api/hospitals/metrics — ${msg}`);
    }
  }

  async getMedicalRecords(search?: string): Promise<MedicalRecord[]> {
    try {
      const res = await apiClient.get<MedicalRecord[]>(
        "/api/hospitals/records",
        search ? { search } : undefined
      );
      return res.data ?? [];
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new ServiceUnavailableError(`GET /api/hospitals/records — ${msg}`);
    }
  }

  async getMedicalRecordByNationalNumber(nid: string): Promise<MedicalRecord | null> {
    try {
      const res = await apiClient.get<MedicalRecord>(`/api/hospitals/records/${nid}`);
      return res.data ?? null;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new ServiceUnavailableError(`GET /api/hospitals/records/${nid} — ${msg}`);
    }
  }

  async addDiagnosis(dto: AddDiagnosisDto): Promise<MedicalRecord> {
    try {
      const res = await apiClient.post<MedicalRecord>("/api/hospitals/records/diagnoses", dto);
      return res.data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new ServiceUnavailableError(`POST /api/hospitals/records/diagnoses — ${msg}`);
    }
  }

  async addOperation(dto: AddOperationDto): Promise<MedicalRecord> {
    try {
      const res = await apiClient.post<MedicalRecord>("/api/hospitals/records/operations", dto);
      return res.data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new ServiceUnavailableError(`POST /api/hospitals/records/operations — ${msg}`);
    }
  }

  async addChronicDisease(dto: AddChronicDiseaseDto): Promise<MedicalRecord> {
    try {
      const res = await apiClient.post<MedicalRecord>("/api/hospitals/records/chronic-diseases", dto);
      return res.data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new ServiceUnavailableError(`POST /api/hospitals/records/chronic-diseases — ${msg}`);
    }
  }

  async toggleRecordVisibility(dto: ToggleVisibilityDto): Promise<MedicalRecord> {
    try {
      const res = await apiClient.patch<MedicalRecord>(
        `/api/hospitals/records/${dto.recordId}/visibility`,
        dto
      );
      return res.data;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      throw new ServiceUnavailableError(
        `PATCH /api/hospitals/records/${dto.recordId}/visibility — ${msg}`
      );
    }
  }
}

export const hospitalService: IHospitalService = new HttpHospitalService();
