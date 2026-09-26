import { PaginationParams } from "./api";

export type PassportType = "Regular" | "Diplomatic" | "Special";
export type PassportStatus = "Active" | "Expired" | "Canceled" | "Damaged";
export type TravelMovementType = "Entry" | "Exit";
export type BorderPortType = "Airport" | "LandPort" | "SeaPort";
export type WatchlistStatus = "Clear" | "Banned" | "UnderInvestigation";

/**
 * Passport Entity matching ERD.sql
 */
export interface PassportRecord {
  id: string; // Guid
  personId: string;
  nationalNumber: string;
  fullName: string;
  motherName: string;
  dateOfBirth: string;
  gender: "Male" | "Female";
  photoUrl: string;
  passportNumber: string; // e.g. "08451234"
  passportType: PassportType;
  passportTypeLabel: string;
  issuingBranchId: string;
  issuingBranchName: string;
  issueDate: string;
  expiryDate: string;
  status: PassportStatus;
  qrPayload: string;
  isWatchlistBanned: boolean;
  watchlistReason?: string;
  createdAt: string;
}

/**
 * TravelRecord Entity matching ERD.sql
 */
export interface TravelRecord {
  id: string; // Guid
  personId: string;
  nationalNumber: string;
  fullName: string;
  passportNumber: string;
  movementType: TravelMovementType; // Entry | Exit
  destinationOrOriginCountry: string; // Country traveled to or arrived from
  portName: string; // e.g. "مطار صنعاء الدولي", "منفذ الوديعة البري"
  portType: BorderPortType;
  flightOrVehicleNumber?: string;
  officerUserId: string;
  officerName: string;
  timestamp: string;
  isFlagged: boolean;
  securityNotes?: string;
}

/**
 * ServiceRequest joined with Passport renewal/issuance details
 */
export interface PassportRequest {
  id: string; // Guid
  requestNumber: string; // e.g. "REQ-PASS-2026-00301"
  personId: string;
  nationalNumber: string;
  fullName: string;
  photoUrl: string;
  serviceType: "PASSPORT_NEW" | "PASSPORT_RENEW" | "PASSPORT_REPLACE_LOST";
  serviceName: string;
  branchId: string;
  branchName: string;
  status: "Pending" | "UnderReview" | "Approved" | "Rejected" | "Printed";
  previousPassportNumber?: string;
  urgentPriority: boolean; // المستعجل
  fee: number;
  isPaid: boolean;
  submissionDate: string;
  completedDate?: string;
  officerNotes?: string;
  rejectionReason?: string;
  attachments: {
    name: string;
    fileUrl: string;
    type: string;
  }[];
}

/**
 * Passports Director / Admin Telemetry
 */
export interface PassportsDirectorMetrics {
  totalIssuedPassports: number;
  issuedTodayCount: number;
  activeBorderPortsCount: number;
  pendingReviewCount: number;
  todayBorderMovementsCount: number;
  watchlistInterceptsCount: number;
  branchPerformance: {
    branchName: string;
    governorate: string;
    dailyIssuance: number;
    monthlyIssuance: number;
    status: "Optimal" | "Crowded" | "Delayed";
  }[];
  portMovementsToday: {
    portName: string;
    entryCount: number;
    exitCount: number;
  }[];
}

// ======================== Live Backend DTOs & Commands ========================

export interface BackendPassportDto {
  id: string;
  personId: string;
  personFullName: string;
  nationalNumber: string;
  photoUrl?: string | null;
  passportNumber: string;
  passportType: "Regular" | "Diplomatic" | "Special" | number;
  issueDate: string;
  expiryDate: string;
  qrCodePayload?: string | null;
  status: "Active" | "Expired" | "Canceled" | number;
  issuingBranchId: string;
  issuingBranchName: string;
  createdAt: string;
}

export interface BackendTravelRecordDto {
  id: string;
  passportId: string;
  passportNumber: string;
  personId: string;
  personFullName: string;
  nationalNumber: string;
  issuingBranchId: string;
  issuingBranchName: string;
  country: string;
  entryDate: string;
  exitDate?: string | null;
  createdAt: string;
}

export interface IssuePassportCommand {
  nationalNumber: string;
  photoUrl?: string | null;
  passportType: "Regular" | "Diplomatic" | "Special" | number;
  issuingBranchId: string;
}

export interface RenewPassportCommand {
  nationalNumber: string;
  issuingBranchId: string;
  photoUrl?: string | null;
  passportType?: "Regular" | "Diplomatic" | "Special" | number | null;
}

export interface AddTravelRecordCommand {
  passportNumber: string;
  issuingBranchId: string;
  country: string;
  entryDate: string;
  exitDate?: string | null;
}

// ======================== Legacy Compatibility Types ========================

export interface PassportRequestFilterParams extends PaginationParams {
  status?: string;
  urgentOnly?: boolean;
  branchId?: string;
}

export interface TravelRecordFilterParams extends PaginationParams {
  movementType?: string;
  portName?: string;
  isFlagged?: boolean;
}

export interface RecordTravelMovementDto {
  passportNumber: string;
  movementType: TravelMovementType;
  portName: string;
  portType: BorderPortType;
  destinationOrOriginCountry: string;
  flightOrVehicleNumber?: string;
  officerUserId: string;
  officerName: string;
  securityNotes?: string;
}

export interface UpdatePassportRequestStatusDto {
  requestId: string;
  status: "UnderReview" | "Approved" | "Rejected" | "Printed";
  officerNotes?: string;
  rejectionReason?: string;
}
