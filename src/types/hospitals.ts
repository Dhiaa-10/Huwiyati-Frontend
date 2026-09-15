import { PaginationParams } from "./api";

/**
 * Medical Diagnosis table from ERD.sql
 */
export interface MedicalDiagnosis {
  id: string; // Guid
  medicalRecordId: string; // Guid FK
  diagnosisName: string;
  icdCode?: string; // e.g. "E11.9", "I10"
  description?: string;
  doctorName?: string;
  diagnosedAt: string;
  treatmentPlan?: string;
  status?: "Active" | "Resolved" | "UnderObservation";
  hospitalName?: string;
}

/**
 * Medical Operation / Surgery table from ERD.sql
 */
export interface MedicalOperation {
  id: string; // Guid
  medicalRecordId: string; // Guid FK
  operationName: string;
  operationDate: string;
  surgeonName?: string;
  hospitalName?: string;
  anesthesiaType?: string;
  complications?: string;
  notes?: string;
}

/**
 * Chronic Disease table from ERD.sql
 */
export interface ChronicDisease {
  id: string; // Guid
  medicalRecordId: string; // Guid FK
  diseaseName: string;
  icdCode?: string;
  diagnosedDate: string;
  status: "Active" | "Managed" | "Controlled";
  severity?: "Mild" | "Moderate" | "Severe";
  treatingDoctor?: string;
  medications?: string[];
}

/**
 * Medical Record joined with Person and OrganizationBranch from ERD.sql
 */
export interface MedicalRecord {
  id: string; // Guid
  personId: string; // Guid FK (المريض)
  patientNationalNumber: string;
  patientFullName: string;
  patientGender: string;
  patientDateOfBirth: string;
  bloodGroup: string;
  allergies?: string[];
  emergencyContactPhone?: string;
  emergencyContactName?: string;
  organizationBranchId: string; // Guid FK (المستشفى)
  hospitalName: string;
  admissionDate?: string;
  dischargeDate?: string;
  isVisibleToPerson: boolean; // زر الخصوصية (إظهار/إخفاء السجل للمواطن)
  diagnoses: MedicalDiagnosis[];
  operations: MedicalOperation[];
  chronicDiseases: ChronicDisease[];
  createdAt: string;
}

/**
 * Hospital Director Dashboard Metrics
 */
export interface HospitalDashboardMetrics {
  registeredVitalEventsCount: number;
  monthlyBirthsCount: number;
  monthlyDeathsCount: number;
  activeDoctorsCount: number;
  totalAuthorizedStaff: number;
  accessLogsCount: number;
  activeInpatients: number;
  icuOccupancyPercentage: number;
  recentAccessLogs: {
    id: string;
    doctorName: string;
    action: string;
    patientName: string;
    patientId: string;
    timestamp: string;
  }[];
}

// ======================== DTOs ========================

export interface AddDiagnosisDto {
  patientNationalNumber?: string;
  diagnosisName: string;
  icdCode?: string;
  description?: string;
  doctorName: string;
  treatmentPlan?: string;
  status?: "Active" | "Resolved" | "UnderObservation";
  hospitalName?: string;
}

export interface AddOperationDto {
  patientNationalNumber?: string;
  operationName: string;
  operationDate: string;
  surgeonName: string;
  hospitalName: string;
  anesthesiaType?: string;
  complications?: string;
  notes?: string;
}

export interface AddChronicDiseaseDto {
  patientNationalNumber?: string;
  diseaseName: string;
  icdCode?: string;
  diagnosedDate: string;
  status: "Active" | "Managed" | "Controlled";
  severity?: "Mild" | "Moderate" | "Severe";
  treatingDoctor?: string;
  medications?: string[];
}

export interface ToggleVisibilityDto {
  recordId: string;
  isVisible: boolean;
}
