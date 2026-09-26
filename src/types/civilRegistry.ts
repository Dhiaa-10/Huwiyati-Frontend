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
  hospitalOrganizationId?: string;
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

// ======================== Live Backend Models & Commands ========================

// 1. Birth Certificate Models
export interface BirthCertificateDto {
  id: string;
  certificateNumber: string;
  issueDate: string;
  childPersonId: string;
  childNationalNumber: string;
  childFullName: string;
  gender: string;
  dateOfBirth: string;
  placeOfBirth: string;
  fatherPersonId: string;
  fatherNationalNumber: string;
  fatherFullName: string;
  motherPersonId: string;
  motherNationalNumber: string;
  motherFullName: string;
  hospitalBranchId: string;
  hospitalName: string;
  createdAt: string;
}

export interface IssueBirthCertificateCommand {
  fatherNationalNumber: string;
  motherNationalNumber: string;
  firstName: string;
  dateOfBirth: string;
  placeOfBirth: string;
  gender: number; // 0 = Male, 1 = Female
  bloodGroup: number; // 0=APos, 1=ANeg, 2=BPos, 3=BNeg, 4=ABPos, 5=ABNeg, 6=OPos, 7=ONeg
  governorate: string;
  district: string;
  addressDetails: string;
  hospitalBranchId: string;
  familyId?: string;
  issuingBranchId: string;
  issueDate?: string;
}

export interface UpdateChildDataCommand {
  birthCertificateId: string;
  firstName?: string;
  bloodGroup?: number;
  placeOfBirth?: string;
  governorate?: string;
  district?: string;
  addressDetails?: string;
}

// 2. Death Certificate Models
export interface DeathCertificateDto {
  id: string;
  certificateNumber: string;
  issueDate: string;
  personId: string;
  nationalNumber: string;
  fullName: string;
  dateOfBirth: string;
  gender: string;
  deathDate: string;
  placeOfDeath?: string;
  causeOfDeath?: string;
  hospitalBranchId: string;
  hospitalName: string;
  issuingBranchId: string;
  issuingBranchName: string;
  createdAt: string;
}

export interface IssueDeathCertificateCommand {
  nationalNumber: string;
  hospitalBranchId: string;
  issuingBranchId: string;
  deathDate: string;
  placeOfDeath?: string;
  causeOfDeath?: string;
}

export interface UpdateDeathCertificateCommand {
  deathCertificateId: string;
  deathDate: string;
  placeOfDeath?: string;
  causeOfDeath?: string;
}

// 3. National ID Card Models
export interface NationalIdCardDto {
  id: string;
  personId: string;
  nationalNumber: string;
  fullName: string;
  issuingBranchId: string;
  branchName: string;
  issueDate: string;
  expiryDate: string;
  qrCodePayload?: string;
  status: "Active" | "Expired" | "Suspended" | "Lost" | string;
  createdAt: string;
}

export interface IssueNationalIdCardCommand {
  personId?: string;
  firstName?: string;
  fatherName?: string;
  grandfatherName?: string;
  familyName?: string;
  dateOfBirth?: string;
  placeOfBirth?: string;
  gender?: number; // 0 = Male, 1 = Female
  nationality?: string;
  maritalStatus?: number; // 0 = Single, 1 = Married, 2 = Divorced, 3 = Widowed
  governorate?: string;
  district?: string;
  addressDetails?: string;
  photoUrl?: string;
  bloodGroup?: number;
  issuingBranchId: string;
  issueDate?: string;
}

export interface RenewNationalIdCardCommand {
  nationalNumber: string;
  maritalStatus?: number;
  governorate?: string;
  district?: string;
  addressDetails?: string;
  photoUrl?: string;
  issuingBranchId: string;
}

export interface UpdatePersonDataCommand {
  nationalNumber: string;
  maritalStatus?: number;
  governorate?: string;
  district?: string;
  addressDetails?: string;
  photoUrl?: string;
  occupation?: string;
}

// 4. Family & Marriage Models
export interface FamilySummaryDto {
  id: string;
  familyNumber: string;
  headOfFamilyPersonId: string;
  headOfFamilyNationalNumber: string;
  headOfFamilyFullName: string;
  issuingBranchId: string;
  branchName: string;
  issueDate: string;
  expiryDate: string;
  status: "Active" | "Expired" | "Suspended" | string;
  activeMembersCount: number;
  createdAt: string;
}

export interface FamilyMemberDto {
  id: string;
  personId: string;
  nationalNumber: string;
  fullName: string;
  dateOfBirth: string;
  relationshipType: "Head" | "Wife" | "Son" | "Daughter" | string;
  status: "Active" | "Divorced" | "Deceased" | "Left" | string;
  marriageContractId?: string;
  joinedAt: string;
  leftAt?: string;
}

export interface FamilyDto {
  id: string;
  familyNumber: string;
  headOfFamilyPersonId: string;
  headOfFamilyNationalNumber: string;
  headOfFamilyFullName: string;
  issuingBranchId: string;
  branchName: string;
  issueDate: string;
  expiryDate: string;
  qrCodePayload?: string;
  status: "Active" | "Expired" | "Suspended" | string;
  createdAt: string;
  members: FamilyMemberDto[];
}

export interface CreateFamilyCardCommand {
  husbandNationalNumber: string;
  wifeNationalNumber: string;
  marriageContractNumber: string;
  marriageDate: string;
  contractPhotoUrl?: string;
  issuingBranchId: string;
}

export interface RenewFamilyCardCommand {
  familyNumber: string;
  issuingBranchId: string;
}

export interface AddWifeCommand {
  husbandNationalNumber: string;
  wifeNationalNumber: string;
  marriageContractNumber: string;
  marriageDate: string;
  contractPhotoUrl?: string;
  issuingBranchId: string;
}

export interface UpdateFamilyMemberStatusCommand {
  familyId: string;
  personId: string;
  status: number; // 0 = Active, 1 = Divorced, 2 = Deceased, 3 = Left
  reason?: string;
}
