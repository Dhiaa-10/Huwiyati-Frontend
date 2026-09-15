import { apiClient } from "./client";
import { mockStore } from "./mockStore";
import {
  MedicalRecord,
  MedicalDiagnosis,
  MedicalOperation,
  ChronicDisease,
  HospitalDashboardMetrics,
  AddDiagnosisDto,
  AddOperationDto,
  AddChronicDiseaseDto,
  ToggleVisibilityDto,
} from "@/types/hospitals";

const simulateDelay = (ms: number = 200) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export interface IHospitalService {
  getDashboardMetrics(): Promise<HospitalDashboardMetrics>;
  getMedicalRecords(search?: string): Promise<MedicalRecord[]>;
  getMedicalRecordByNationalNumber(nid: string): Promise<MedicalRecord | null>;
  addDiagnosis(dto: AddDiagnosisDto): Promise<MedicalRecord>;
  addOperation(dto: AddOperationDto): Promise<MedicalRecord>;
  addChronicDisease(dto: AddChronicDiseaseDto): Promise<MedicalRecord>;
  toggleRecordVisibility(dto: ToggleVisibilityDto): Promise<MedicalRecord>;
}

class MockHospitalService implements IHospitalService {
  async getDashboardMetrics(): Promise<HospitalDashboardMetrics> {
    await simulateDelay(150);
    return mockStore.getHospitalDashboardMetrics();
  }

  async getMedicalRecords(search?: string): Promise<MedicalRecord[]> {
    await simulateDelay(200);
    return mockStore.getMedicalRecords(search);
  }

  async getMedicalRecordByNationalNumber(nid: string): Promise<MedicalRecord | null> {
    await simulateDelay(150);
    return mockStore.getMedicalRecordByNationalNumber(nid);
  }

  async addDiagnosis(dto: AddDiagnosisDto): Promise<MedicalRecord> {
    await simulateDelay(250);
    return mockStore.addDiagnosis(dto);
  }

  async addOperation(dto: AddOperationDto): Promise<MedicalRecord> {
    await simulateDelay(250);
    return mockStore.addOperation(dto);
  }

  async addChronicDisease(dto: AddChronicDiseaseDto): Promise<MedicalRecord> {
    await simulateDelay(250);
    return mockStore.addChronicDisease(dto);
  }

  async toggleRecordVisibility(dto: ToggleVisibilityDto): Promise<MedicalRecord> {
    await simulateDelay(200);
    return mockStore.toggleRecordVisibility(dto);
  }
}

class HttpHospitalService implements IHospitalService {
  async getDashboardMetrics(): Promise<HospitalDashboardMetrics> {
    const res = await apiClient.get<HospitalDashboardMetrics>("/api/hospitals/metrics");
    return res.data;
  }

  async getMedicalRecords(search?: string): Promise<MedicalRecord[]> {
    const res = await apiClient.get<MedicalRecord[]>("/api/hospitals/records", { search });
    return res.data;
  }

  async getMedicalRecordByNationalNumber(nid: string): Promise<MedicalRecord | null> {
    const res = await apiClient.get<MedicalRecord>(`/api/hospitals/records/${nid}`);
    return res.data;
  }

  async addDiagnosis(dto: AddDiagnosisDto): Promise<MedicalRecord> {
    const res = await apiClient.post<MedicalRecord>("/api/hospitals/records/diagnoses", dto);
    return res.data;
  }

  async addOperation(dto: AddOperationDto): Promise<MedicalRecord> {
    const res = await apiClient.post<MedicalRecord>("/api/hospitals/records/operations", dto);
    return res.data;
  }

  async addChronicDisease(dto: AddChronicDiseaseDto): Promise<MedicalRecord> {
    const res = await apiClient.post<MedicalRecord>("/api/hospitals/records/chronic-diseases", dto);
    return res.data;
  }

  async toggleRecordVisibility(dto: ToggleVisibilityDto): Promise<MedicalRecord> {
    const res = await apiClient.patch<MedicalRecord>(`/api/hospitals/records/${dto.recordId}/visibility`, dto);
    return res.data;
  }
}

const isMockMode = process.env.NEXT_PUBLIC_USE_MOCKS !== "false";

export const hospitalService: IHospitalService = isMockMode
  ? new MockHospitalService()
  : new HttpHospitalService();
