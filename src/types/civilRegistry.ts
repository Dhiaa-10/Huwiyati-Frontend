import { PaginationParams } from "./api";

export type Gender = "Male" | "Female";
export type MaritalStatus = "Single" | "Married" | "Divorced" | "Widowed";
export type PersonStatus = "Active" | "Deceased";
export type AccountStatus = "Active" | "PendingActivation" | "Suspended";

/**
 * Represents Person entity joined with ApplicationUser and NationalIdCard
 */
export interface CitizenCivilRecord {
  id: string; // Guid
  nationalNumber: string; // 11 digits
  firstName: string;
  fatherName: string;
  grandfatherName: string;
  familyName: string;
  fullName: string;
  motherName: string;
  dateOfBirth: string; // YYYY-MM-DD
  placeOfBirth: string;
  gender: Gender;
  nationality: string;
  maritalStatus: MaritalStatus;
  bloodType: string;
  governorate: string;
  district: string;
  addressDetails: string;
  photoUrl: string;
  personStatus: PersonStatus;
  accountStatus: AccountStatus;
  phoneNumber: string;
  email: string;
  biometricRegistered: boolean;
  biometricMatchPercentage?: number;
  idCardIssueDate?: string;
  idCardExpiryDate?: string;
  qrPayload?: string;
  createdAt: string;
  activatedAt?: string;
}

/**
 * Represents ServiceRequest entity for Civil Registry
 */
export interface CivilServiceRequest {
  id: string; // Guid
  requestNumber: string; // e.g. "REQ-CIV-2026-0045"
  personId: string;
  personFullName: string;
  personNationalNumber: string;
  personPhoto: string;
  serviceTypeId: string;
  serviceName: string;
  serviceCode: string;
  branchId: string;
  branchName: string;
  status: "Pending" | "UnderReview" | "Approved" | "Rejected" | "Issued" | "Completed";
  submissionDate: string;
  completedDate?: string;
  fee: number;
  isPaid: boolean;
  rejectionReason?: string;
  officerNotes?: string;
  attachments: {
    name: string;
    fileUrl: string;
    type: string;
  }[];
}

export type VitalEventType = "Birth" | "Death" | "Marriage";

/**
 * Represents BirthCertificate, DeathCertificate, MarriageContract
 */
export interface VitalEvent {
  id: string; // Guid
  eventType: VitalEventType;
  certificateNumber: string; // e.g. "BC-2026-9901"
  registrationDate: string;
  eventDate: string;
  subjectName: string;
  subjectNationalNumber?: string;
  fatherName?: string;
  motherName?: string;
  spouseName?: string;
  hospitalName?: string;
  courtName?: string;
  causeOfDeath?: string;
  placeOfEvent: string;
  governorate: string;
  district: string;
  status: "Registered" | "Verified" | "Archived";
  approvedByOfficer: string;
  documentPhotoUrl?: string;
}

export interface CivilRegistryMetrics {
  totalRegisteredCitizens: number;
  pendingActivationsCount: number;
  processedTodayCount: number;
  vitalEventsThisMonthCount: number;
  activeCivilOfficersCount: number;
  biometricAccuracyPercentage: number;
}

// ======================== DTOs ========================

export interface CitizenFilterParams extends PaginationParams {
  governorate?: string;
  accountStatus?: string;
  gender?: string;
}

export interface ServiceRequestFilterParams extends PaginationParams {
  status?: string;
  serviceCode?: string;
  branchId?: string;
}

export interface VitalEventFilterParams extends PaginationParams {
  eventType?: string;
  governorate?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface ActivateAccountDto {
  nationalNumber: string;
  branchId: string;
  officerUserId: string;
  biometricMatched: boolean;
  notes?: string;
}

export interface UpdateRequestStatusDto {
  requestId: string;
  status: "UnderReview" | "Approved" | "Rejected" | "Issued" | "Completed";
  rejectionReason?: string;
  officerNotes?: string;
}

export interface RegisterBirthCertificateDto {
  childFirstName: string;
  childGender: Gender;
  dateOfBirth: string;
  placeOfBirth: string;
  fatherNationalNumber: string;
  motherNationalNumber: string;
  hospitalOrganizationId: string;
  governorate: string;
  district: string;
}

export interface RegisterDeathCertificateDto {
  deceasedNationalNumber: string;
  deathDate: string;
  placeOfDeath: string;
  causeOfDeath: string;
  hospitalOrganizationId?: string;
  governorate: string;
  district: string;
}

export interface RegisterMarriageContractDto {
  contractNumber: string;
  husbandNationalNumber: string;
  wifeNationalNumber: string;
  marriageDate: string;
  courtName: string;
  governorate: string;
}
