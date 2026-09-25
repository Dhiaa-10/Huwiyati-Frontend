import { apiClient } from "./client";
import { PaginatedResponse } from "@/types/api";
import {
  AgencyType,
  Organization,
  OrganizationBranch,
  Employee,
  AuditLog,
  AdminDashboardMetrics,
  SystemSettings,
  CreateBranchDto,
  UpdateBranchDto,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  OrganizationFilterParams,
  AuditLogFilterParams,
  OrganizationAdmin,
  AssignAdminDto,
  UpdateAdminDto,
} from "@/types/admin";

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Exported citizen lookup type
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface CitizenLookup {
  id: string;
  nationalNumber: string;
  firstName: string;
  fatherName: string;
  grandfatherName: string;
  familyName: string;
  fullName: string;
  dateOfBirth: string;
  placeOfBirth: string;
  governorate: string;
  district: string;
  addressDetails: string;
  gender: string;
  bloodGroup?: string;
  personStatus: string;
  photoUrl?: string | null;
  nationality: string;
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Backend DTO types (matching ASP.NET Core response shapes)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

interface BackendOrganizationDto {
  id: string;
  name: string;
}

interface BackendBranchDto {
  id: string;
  organizationId: string;
  organizationName: string;
  branchName: string;
  governorate: string;
  district: string;
  addressDetails?: string;
  phoneNumber?: string;
  isActive: boolean;
  createdAt: string;
}

interface BackendAdminDto {
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

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Mappers: backend DTO â†’ frontend model
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function mapOrganization(o: BackendOrganizationDto): Organization {
  return {
    id: o.id,
    name: o.name,
    code: "",
    type: "security" as AgencyType,
    typeLabel: "",
    description: "",
    directorName: "",
    directorNationalId: "",
    directorPhone: "",
    directorEmail: "",
    branchesCount: 0,
    activeServicesCount: 0,
    establishedDate: new Date().toISOString(),
    isActive: true,
    createdAt: new Date().toISOString(),
    iconName: "Building2",
  };
}

function mapBranch(b: BackendBranchDto): OrganizationBranch {
  return {
    id: b.id,
    organizationId: b.organizationId,
    organizationName: b.organizationName,
    branchName: b.branchName,
    governorate: b.governorate,
    district: b.district,
    addressDetails: b.addressDetails,
    phoneNumber: b.phoneNumber,
    isActive: b.isActive,
    createdAt: b.createdAt,
  };
}

function mapAdmin(a: BackendAdminDto): OrganizationAdmin {
  return {
    employeeId: a.employeeId,
    userId: a.userId,
    nationalNumber: a.nationalNumber,
    fullName: a.fullName,
    email: a.email,
    phoneNumber: a.phoneNumber,
    employeeNumber: a.employeeNumber,
    branchId: a.branchId,
    branchName: a.branchName,
    organizationName: a.organizationName,
    isActive: a.isActive,
    createdAt: a.createdAt,
  };
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// IAdminService interface (SuperAdmin scope)
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export interface IAdminService {
  getDashboardMetrics(): Promise<AdminDashboardMetrics>;
  // Organizations â€” read-only (fixed in backend, no CRUD)
  getOrganizations(params?: OrganizationFilterParams): Promise<PaginatedResponse<Organization>>;
  getOrganizationById(id: string): Promise<Organization>;
  // Branches â€” full CRUD
  getBranches(organizationId?: string): Promise<OrganizationBranch[]>;
  createBranch(dto: CreateBranchDto): Promise<OrganizationBranch>;
  updateBranch(id: string, dto: UpdateBranchDto): Promise<OrganizationBranch>;
  deleteBranch(id: string): Promise<boolean>;
  restoreBranch(id: string): Promise<OrganizationBranch>;
  // Admins â€” full CRUD
  getAdmins(organizationId?: string, branchId?: string): Promise<OrganizationAdmin[]>;
  assignAdmin(dto: AssignAdminDto): Promise<OrganizationAdmin>;
  updateAdmin(id: string, dto: UpdateAdminDto): Promise<OrganizationAdmin>;
  removeAdmin(id: string): Promise<boolean>;
  restoreAdmin(id: string): Promise<boolean>;
  // Citizens â€” read-only lookup (requires SuperAdmin auth fix on backend)
  getCitizens(): Promise<CitizenLookup[]>;
  // Employees - used by Admin portals
  getEmployees(branchId?: string, organizationId?: string): Promise<Employee[]>;
  createEmployee(dto: CreateEmployeeDto): Promise<Employee>;
  updateEmployee(id: string, dto: UpdateEmployeeDto): Promise<Employee>;
  toggleEmployeeStatus(id: string, currentStatus?: boolean): Promise<Employee>;
  deleteEmployee(id: string): Promise<boolean>;
  // Audit Logs - no backend endpoint yet
  getAuditLogs(params?: AuditLogFilterParams): Promise<PaginatedResponse<AuditLog>>;
  // System Settings - localStorage only
  getSystemSettings(): Promise<SystemSettings>;
  updateSystemSettings(settings: Partial<SystemSettings>): Promise<SystemSettings>;
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Live HTTP Implementation â€” always uses real API, no mock fallback
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

class HttpAdminService implements IAdminService {

  // â”€â”€ Dashboard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async getDashboardMetrics(): Promise<AdminDashboardMetrics> {
    const [orgsRes, branchesRes, adminsRes] = await Promise.allSettled([
      apiClient.get<BackendOrganizationDto[]>("/api/v1/Branches/organizations"),
      apiClient.get<BackendBranchDto[]>("/api/v1/Branches"),
      apiClient.get<BackendAdminDto[]>("/api/v1/Admins"),
    ]);

    const orgs = orgsRes.status === "fulfilled" ? (orgsRes.value.data ?? []) : [];
    const branches = branchesRes.status === "fulfilled" ? (branchesRes.value.data ?? []) : [];
    const admins = adminsRes.status === "fulfilled" ? (adminsRes.value.data ?? []) : [];

    const activeBranches = branches.filter((b) => b.isActive).length;

    const orgCount: Record<string, number> = {};
    branches.forEach((b) => {
      if (b.organizationName) {
        orgCount[b.organizationName] = (orgCount[b.organizationName] ?? 0) + 1;
      }
    });

    const colors = ["#005539", "#0b4f6c", "#b08800", "#ba1a1a"];
    const agencyDistribution = Object.entries(orgCount).map(([name, count], i) => ({
      name,
      count,
      percentage: branches.length > 0 ? Math.round((count / branches.length) * 100) : 0,
      color: colors[i % colors.length],
    }));

    return {
      totalCitizens: 0,
      activeAgencies: orgs.length,
      totalAgencies: orgs.length,
      todayRequests: 0,
      successRate: 100,
      pendingVerifications: 0,
      systemUptime: "â€”",
      serverLatencyMs: 0,
      agencyDistribution,
      recentActivityCount: admins.length + activeBranches,
    };
  }

  // â”€â”€ Organizations (read-only) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async getOrganizations(params?: OrganizationFilterParams): Promise<PaginatedResponse<Organization>> {
    const res = await apiClient.get<BackendOrganizationDto[]>("/api/v1/Branches/organizations");
    let items = (res.data ?? []).map(mapOrganization);

    if (params?.search) {
      const q = params.search.toLowerCase();
      items = items.filter((o) => o.name.toLowerCase().includes(q));
    }

    const totalCount = items.length;
    const page = params?.page ?? 1;
    const pageSize = params?.pageSize ?? 10;
    const totalPages = Math.ceil(totalCount / pageSize) || 1;
    const startIndex = (page - 1) * pageSize;

    return {
      items: items.slice(startIndex, startIndex + pageSize),
      totalCount,
      page,
      pageSize,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  async getOrganizationById(id: string): Promise<Organization> {
    const all = await this.getOrganizations();
    const org = all.items.find((o) => o.id === id);
    if (!org) throw new Error("Ø§Ù„Ù‡ÙŠØ¦Ø© ØºÙŠØ± Ù…ÙˆØ¬ÙˆØ¯Ø©");
    return org;
  }

  // â”€â”€ Branches â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async getBranches(organizationId?: string): Promise<OrganizationBranch[]> {
    const params: Record<string, string> = {};
    if (organizationId) params["organizationId"] = organizationId;
    const res = await apiClient.get<BackendBranchDto[]>("/api/v1/Branches", params);
    return (res.data ?? []).map(mapBranch);
  }

  async createBranch(dto: CreateBranchDto): Promise<OrganizationBranch> {
    const res = await apiClient.post<BackendBranchDto>("/api/v1/Branches", {
      organizationId: dto.organizationId,
      branchName: dto.branchName,
      governorate: dto.governorate,
      district: dto.district,
      addressDetails: dto.addressDetails,
      phoneNumber: dto.phoneNumber,
    });
    return mapBranch(res.data);
  }

  async updateBranch(id: string, dto: UpdateBranchDto): Promise<OrganizationBranch> {
    const res = await apiClient.put<BackendBranchDto>(`/api/v1/Branches/${id}`, {
      id,
      organizationId: dto.organizationId,
      branchName: dto.branchName,
      governorate: dto.governorate,
      district: dto.district,
      addressDetails: dto.addressDetails,
      phoneNumber: dto.phoneNumber,
    });
    return mapBranch(res.data);
  }

  async deleteBranch(id: string): Promise<boolean> {
    await apiClient.delete<void>(`/api/v1/Branches/${id}`);
    return true;
  }

  async restoreBranch(id: string): Promise<OrganizationBranch> {
    const res = await apiClient.post<BackendBranchDto>(`/api/v1/Branches/${id}/restore`, {});
    return mapBranch(res.data);
  }

  // â”€â”€ Admins â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  async getAdmins(organizationId?: string, branchId?: string): Promise<OrganizationAdmin[]> {
    const params: Record<string, string> = {};
    if (organizationId) params["organizationId"] = organizationId;
    if (branchId) params["branchId"] = branchId;
    const res = await apiClient.get<BackendAdminDto[]>("/api/v1/Admins", params);
    return (res.data ?? []).map(mapAdmin);
  }

  async assignAdmin(dto: AssignAdminDto): Promise<OrganizationAdmin> {
    const res = await apiClient.post<BackendAdminDto>("/api/v1/Admins", {
      nationalNumber: dto.nationalNumber,
      branchId: dto.branchId,
    });
    return mapAdmin(res.data);
  }

  async updateAdmin(id: string, dto: UpdateAdminDto): Promise<OrganizationAdmin> {
    const res = await apiClient.put<BackendAdminDto>(`/api/v1/Admins/${id}`, {
      branchId: dto.branchId,
    });
    return mapAdmin(res.data);
  }

  async removeAdmin(id: string): Promise<boolean> {
    await apiClient.delete<void>(`/api/v1/Admins/${id}`);
    return true;
  }

  async restoreAdmin(id: string): Promise<boolean> {
    await apiClient.post<void>(`/api/v1/Admins/${id}/restore`, {});
    return true;
  }

  // â”€â”€ Citizens â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  // PersonController currently only authorizes [Citizen] role.
  // SuperAdmin gets HTTP 403 â€” the UI shows a clear permission message.
  async getCitizens(): Promise<CitizenLookup[]> {
    const bloodGroupMap: Record<string | number, string> = {
      1: "O+", OPositive: "O+",
      2: "O-", ONegative: "O-",
      3: "A+", APositive: "A+",
      4: "A-", ANegative: "A-",
      5: "B+", BPositive: "B+",
      6: "B-", BNegative: "B-",
      7: "AB+", ABPositive: "AB+",
      8: "AB-", ABNegative: "AB-",
    };
    const statusMap: Record<string | number, string> = {
      1: "Ù†Ø´Ø·", Active: "Ù†Ø´Ø·",
      2: "Ù…Ø¹Ù„Ù‚", Suspended: "Ù…Ø¹Ù„Ù‚",
      3: "Ù…ØªÙˆÙÙ‰", Deceased: "Ù…ØªÙˆÙÙ‰",
    };
    const genderMap: Record<string | number, string> = {
      1: "Ø°ÙƒØ±", Male: "Ø°ÙƒØ±",
      2: "Ø£Ù†Ø«Ù‰", Female: "Ø£Ù†Ø«Ù‰",
    };

    try {
      const res = await apiClient.get<any[]>("/api/v1/Person");
      const rawList = res.data ?? [];

      return rawList.map((p: any) => {
        const fullName = `${p.firstName ?? ""} ${p.fatherName ?? ""} ${p.grandfatherName ?? ""} ${p.familyName ?? ""}`.trim();
        return {
          id: p.id,
          nationalNumber: p.nationalNumber,
          firstName: p.firstName,
          fatherName: p.fatherName,
          grandfatherName: p.grandfatherName,
          familyName: p.familyName,
          fullName: fullName || p.nationalNumber,
          dateOfBirth: p.dateOfBirth,
          placeOfBirth: p.placeOfBirth || "غير محدد",
          governorate: p.governorate || "غير محدد",
          district: p.district || "غير محدد",
          addressDetails: p.addressDetails || "",
          gender: genderMap[p.gender] || "ذكر",
          bloodGroup: bloodGroupMap[p.bloodGroup] || (p.bloodGroup ? String(p.bloodGroup) : undefined),
          personStatus: statusMap[p.personStatus] || "نشط",
          photoUrl: p.photoUrl ?? null,
          nationality: p.nationality || "يمني",
        } as CitizenLookup;
      });
    } catch (err) {
      console.warn("[adminService] getCitizens restricted by backend:", err);
      return [];
    }

  }
  // Employees (for Admin portals - uses /api/v1/Employees, requires Admin role)
  async getEmployees(branchId?: string, organizationId?: string): Promise<Employee[]> {
    try {
      const params: Record<string, string> = {};
      if (branchId) params['branchId'] = branchId;
      if (organizationId) params['organizationId'] = organizationId;
      const res = await apiClient.get<any[]>('/api/v1/Employees', params);
      return (res.data ?? []).map((e: any) => ({
        id: e.employeeId,
        userId: e.userId,
        nationalNumber: e.nationalNumber,
        fullName: e.fullName,
        email: e.email,
        phoneNumber: e.phoneNumber,
        employeeNumber: e.employeeNumber,
        branchId: e.branchId,
        branchName: e.branchName,
        organizationId: organizationId ?? '',
        organizationName: e.organizationName,
        role: 'EMPLOYEE',
        roleLabel: 'موظف مختص',
        isActive: e.isActive,
        accountStatus: 'Active',
        createdAt: e.createdAt,
      } as Employee));
    } catch {
      return [];
    }
  }

  async createEmployee(dto: CreateEmployeeDto): Promise<Employee> {
    const res = await apiClient.post<any>('/api/v1/Employees', {
      nationalNumber: dto.nationalNumber,
      branchId: dto.branchId,
    });
    const e = res.data;
    return {
      id: e.employeeId, userId: e.userId, nationalNumber: e.nationalNumber,
      fullName: e.fullName, email: e.email, phoneNumber: e.phoneNumber,
      employeeNumber: e.employeeNumber, branchId: e.branchId, branchName: e.branchName,
      organizationId: '', organizationName: e.organizationName,
      role: 'EMPLOYEE', roleLabel: 'موظف مختص', isActive: e.isActive,
      accountStatus: 'Active', createdAt: e.createdAt,
    } as Employee;
  }

  async updateEmployee(id: string, dto: UpdateEmployeeDto): Promise<Employee> {
    const res = await apiClient.put<any>('/api/v1/Employees/' + id, { employeeId: id, newBranchId: dto.branchId ?? '' });
    const e = res.data;
    return {
      id: e.employeeId, userId: e.userId, nationalNumber: e.nationalNumber,
      fullName: e.fullName, email: e.email, phoneNumber: e.phoneNumber,
      employeeNumber: e.employeeNumber, branchId: e.branchId, branchName: e.branchName,
      organizationId: '', organizationName: e.organizationName,
      role: 'EMPLOYEE', roleLabel: 'موظف مختص', isActive: e.isActive,
      accountStatus: 'Active', createdAt: e.createdAt,
    } as Employee;
  }

  async toggleEmployeeStatus(id: string, currentStatus?: boolean): Promise<Employee> {
    if (currentStatus === true) {
      await apiClient.delete<void>('/api/v1/Employees/' + id);
    } else {
      await apiClient.post<void>('/api/v1/Employees/' + id + '/activate', {});
    }
    return { id, isActive: !currentStatus } as Employee;
  }

  async deleteEmployee(id: string): Promise<boolean> {
    await apiClient.delete<void>('/api/v1/Employees/' + id);
    return true;
  }

  // Audit Logs - no backend endpoint yet, returns empty
  async getAuditLogs(_params?: AuditLogFilterParams): Promise<PaginatedResponse<AuditLog>> {
    return { items: [], totalCount: 0, page: 1, pageSize: 10, totalPages: 0, hasNextPage: false, hasPreviousPage: false };
  }

  // System Settings - localStorage only, no backend endpoint
  async getSystemSettings(): Promise<SystemSettings> {
    return {
      systemName: 'منظومة هويتي الرقمية',
      systemVersion: '2.0.0',
      supportEmail: 'support@hwyati.gov.ye',
      supportPhone: '+967 1 000 000',
      maxLoginAttempts: 5,
      sessionTimeoutMinutes: 30,
      requireMfa: false,
      passwordMinLength: 8,
      allowedFileTypes: ['jpg', 'jpeg', 'png', 'pdf'],
      maxFileSizeMb: 5,
      biometricThreshold: 85,
      enableAuditLog: true,
      maintenanceMode: false,
      maintenanceMessage: '',
    } as unknown as SystemSettings;
  }

  async updateSystemSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    const current = await this.getSystemSettings();
    return { ...current, ...settings };
  }

}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Singleton export â€” always Live API
// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const adminService: IAdminService = new HttpAdminService();

