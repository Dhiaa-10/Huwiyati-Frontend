import { PaginationParams } from "./api";

export type VehicleType = "Sedan" | "SUV" | "Truck" | "Bus" | "Motorcycle";
export type VehicleStatus = "Active" | "Stolen" | "Scrapped" | "Suspended";
export type LicenseCategory = "Private" | "CommercialLight" | "CommercialHeavy" | "Motorcycle";
export type ViolationPaymentStatus = "Unpaid" | "Paid" | "Disputed";

/**
 * Vehicle entity matching ERD.sql
 */
export interface Vehicle {
  id: string; // Guid
  plateNumber: string; // e.g. "صنعاء 1/45892 خصوصي"
  plateGovernorate: string; // صنعاء، عدن، تعز، حضرموت
  chassisNumber: string; // e.g. "JTEEP21A680091245"
  engineNumber: string; // e.g. "2TR-7891234"
  vehicleType: VehicleType;
  vehicleTypeLabel: string;
  manufacturer: string; // e.g. "تويوتا"
  model: string; // e.g. "لاند كروزر"
  manufactureYear: number;
  color: string;
  colorHex: string;
  status: VehicleStatus;
  currentOwnerPersonId: string;
  currentOwnerNationalId: string;
  currentOwnerFullName: string;
  currentOwnerPhone: string;
  licenseNumber: string;
  licenseExpiryDate: string;
  isInspected: boolean; // الفحص الدوري
  createdAt: string;
}

/**
 * DrivingLicense entity matching ERD.sql
 */
export interface DrivingLicense {
  id: string; // Guid
  personId: string;
  nationalNumber: string;
  fullName: string;
  photoUrl: string;
  dateOfBirth: string;
  bloodGroup: string; // e.g. "O+", "A+", "B+"
  licenseNumber: string; // e.g. "DL-2026-0891"
  category: LicenseCategory;
  categoryLabel: string;
  issuingBranchId: string;
  issuingBranchName: string;
  issueDate: string;
  expiryDate: string;
  qrCodePayload: string;
  status: "Active" | "Expired" | "Suspended";
  pointsCount: number; // نقاط المخالفات (الحد 24)
}

/**
 * TrafficViolation entity matching ERD.sql
 */
export interface TrafficViolation {
  id: string; // Guid
  vehicleId: string;
  plateNumber: string;
  vehicleModel: string;
  ownerNationalNumber: string;
  ownerFullName: string;
  violationType: string;
  violationDate: string;
  violationTime: string;
  location: string;
  governorate: string;
  fineAmount: number; // in YER
  description?: string;
  recordedByUserId: string;
  recordedByOfficerName: string;
  cameraRadarId?: string;
  paymentStatus: ViolationPaymentStatus;
  paidAt?: string;
  paymentReference?: string;
  createdAt: string;
}

/**
 * Traffic Director Telemetry & Metrics
 */
export interface TrafficDirectorMetrics {
  totalRegisteredVehicles: number;
  totalActiveDrivingLicenses: number;
  todayViolationsCount: number;
  todayRevenueCollected: number;
  unpaidViolationsCount: number;
  activePatrolsCount: number;
  topViolationTypes: {
    type: string;
    count: number;
    percentage: number;
  }[];
  branchIssuanceStats: {
    branchName: string;
    governorate: string;
    licensesToday: number;
    violationsToday: number;
  }[];
}

// ======================== DTOs ========================

export interface TrafficFilterParams extends PaginationParams {
  plateNumber?: string;
  nationalNumber?: string;
  paymentStatus?: string;
  governorate?: string;
}

export interface RecordViolationDto {
  plateNumber: string;
  violationType: string;
  location: string;
  governorate: string;
  fineAmount: number;
  description?: string;
  recordedByOfficerName: string;
  violationTime?: string;
  cameraRadarId?: string;
}

export interface PayViolationDto {
  violationId: string;
  paymentMethod: "ElectronicWallet" | "BankCard" | "BranchCash";
  referenceNumber?: string;
}

export interface IssueDrivingLicenseDto {
  nationalNumber: string;
  category: LicenseCategory;
  issuingBranchId: string;
  issuingBranchName: string;
  bloodGroup: string;
}

export interface RegisterVehicleDto {
  plateNumber: string;
  plateGovernorate: string;
  chassisNumber: string;
  engineNumber: string;
  vehicleType: VehicleType;
  manufacturer: string;
  model: string;
  manufactureYear: number;
  color: string;
  ownerNationalNumber: string;
  issuingBranchId: string;
}
