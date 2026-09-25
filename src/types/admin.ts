import { PaginationParams } from "./api";

export type AgencyType = "security" | "civil" | "health" | "judicial" | "financial";
export type AgencyStatus = "active" | "inactive";

/**
 * Represents the Organization table from ERD.sql
 */
export interface Organization {
  id: string; // Guid
  name: string;
  code: string; // e.g. "CIVIL_REGISTRY", "PASSPORTS", "TRAFFIC"
  type: AgencyType;
  typeLabel: string;
  description?: string;
  directorName: string;
  directorNationalId: string;
  directorPhone: string;
  directorEmail: string;
  branchesCount: number;
  activeServicesCount: number;
  establishedDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  iconName: string;
  badgeColor?: string;
}

/**
 * Represents OrganizationBranch table from ERD.sql
 */
export interface OrganizationBranch {
  id: string; // Guid
  organizationId: string; // Guid FK
  organizationName?: string;
  branchName: string;
  governorate: string; // المحافظة
  district: string; // المديرية
  addressDetails?: string;
  phoneNumber?: string;
  managerName?: string;
  isActive: boolean;
  createdAt: string;
}

/**
 * Represents Employee joined with ApplicationUser and Person
 */
export interface Employee {
  id: string; // Guid
  userId: string; // ApplicationUser.Id
  branchId: string; // OrganizationBranch.Id
  branchName?: string;
  organizationId: string;
  organizationName?: string;
  employeeNumber: string;
  nationalNumber: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  roleLabel: string;
  isActive: boolean;
  accountStatus: "Active" | "PendingActivation" | "Suspended";
  lastLogin?: string;
  createdAt: string;
}

/**
 * Represents ServiceType table from ERD.sql
 */
export interface ServiceType {
  id: string; // Guid
  name: string;
  code: string;
  organizationId: string;
  organizationName: string;
  description: string;
  fee: number; // in YER
  processingTimeDays: number;
  isActive: boolean;
  requiredDocuments: string[];
}

/**
 * Represents Audit Trail / Request Status History
 */
export interface AuditLog {
  id: string; // Guid
  action: string;
  actionType: "create" | "update" | "delete" | "auth" | "security" | "export";
  entityName: string;
  entityId?: string;
  userFullName: string;
  userNationalNumber: string;
  userRole: string;
  ipAddress: string;
  status: "Success" | "Warning" | "Failed";
  details?: string;
  timestamp: string;
}

/**
 * Super Admin Overview Dashboard KPIs
 */
export interface AdminDashboardMetrics {
  totalCitizens: number;
  activeAgencies: number;
  totalAgencies: number;
  todayRequests: number;
  successRate: number;
  pendingVerifications: number;
  systemUptime: string;
  serverLatencyMs: number;
  agencyDistribution: {
    name: string;
    count: number;
    percentage: number;
    color: string;
  }[];
  recentActivityCount: number;
}

/**
 * System Configuration & Security Rules
 */
export interface SystemSettings {
  maintenanceMode: boolean;
  allowPublicRegistration: boolean;
  maxLoginAttempts: number;
  sessionTimeoutMinutes: number;
  enforce2FAForAdmins: boolean;
  backupIntervalHours: number;
  lastBackupDate: string;
}

// ======================== Mutation DTOs ========================

export interface CreateOrganizationDto {
  name: string;
  code: string;
  type: AgencyType;
  description?: string;
  directorName: string;
  directorNationalId: string;
  directorPhone: string;
  directorEmail: string;
  isActive: boolean;
  iconName?: string;
}

export interface UpdateOrganizationDto {
  name?: string;
  code?: string;
  type?: AgencyType;
  description?: string;
  directorName?: string;
  directorNationalId?: string;
  directorPhone?: string;
  directorEmail?: string;
  isActive?: boolean;
  iconName?: string;
}

export interface CreateBranchDto {
  organizationId: string;
  branchName: string;
  governorate: string;
  district: string;
  addressDetails?: string;
  phoneNumber?: string;
  managerName?: string;
  isActive: boolean;
}

export interface UpdateBranchDto {
  organizationId?: string;
  branchName?: string;
  governorate?: string;
  district?: string;
  addressDetails?: string;
  phoneNumber?: string;
  managerName?: string;
  isActive?: boolean;
}

export interface CreateEmployeeDto {
  branchId: string;
  organizationId: string;
  nationalNumber: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  role: string;
  roleLabel: string;
  employeeNumber?: string;
}

export interface OrganizationAdmin {
  employeeId: string;
  userId: string;
  nationalNumber: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  employeeNumber: string;
  branchId: string;
  branchName: string;
  organizationName: string;
  isActive: boolean;
  createdAt: string;
}

export interface AssignAdminDto {
  nationalNumber: string;
  branchId: string;
}

export interface UpdateAdminDto {
  branchId: string;
}

export interface UpdateEmployeeDto {
  branchId?: string;
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  role?: string;
  roleLabel?: string;
  isActive?: boolean;
  accountStatus?: "Active" | "PendingActivation" | "Suspended";
}

// ======================== Query Filter DTOs ========================

export interface OrganizationFilterParams extends PaginationParams {
  type?: AgencyType | "all";
  status?: AgencyStatus | "all";
}

export interface AuditLogFilterParams extends PaginationParams {
  actionType?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface EmployeeFilterParams extends PaginationParams {
  organizationId?: string;
  branchId?: string;
  status?: string;
}
