import { apiClient } from "./client";
import { mockStore } from "./mockStore";
import { PaginatedResponse } from "@/types/api";
import {
  Organization,
  OrganizationBranch,
  Employee,
  AuditLog,
  AdminDashboardMetrics,
  SystemSettings,
  CreateOrganizationDto,
  UpdateOrganizationDto,
  CreateBranchDto,
  UpdateBranchDto,
  CreateEmployeeDto,
  UpdateEmployeeDto,
  OrganizationFilterParams,
  AuditLogFilterParams,
} from "@/types/admin";

// Simulated network delay for realistic frontend loading states
const simulateDelay = (ms: number = 200) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export interface IAdminService {
  getDashboardMetrics(): Promise<AdminDashboardMetrics>;
  getOrganizations(params?: OrganizationFilterParams): Promise<PaginatedResponse<Organization>>;
  getOrganizationById(id: string): Promise<Organization>;
  createOrganization(dto: CreateOrganizationDto): Promise<Organization>;
  updateOrganization(id: string, dto: UpdateOrganizationDto): Promise<Organization>;
  toggleOrganizationStatus(id: string): Promise<Organization>;
  deleteOrganization(id: string): Promise<boolean>;
  getBranches(organizationId?: string): Promise<OrganizationBranch[]>;
  createBranch(dto: CreateBranchDto): Promise<OrganizationBranch>;
  updateBranch(id: string, dto: UpdateBranchDto): Promise<OrganizationBranch>;
  deleteBranch(id: string): Promise<boolean>;
  getEmployees(branchId?: string, organizationId?: string): Promise<Employee[]>;
  createEmployee(dto: CreateEmployeeDto): Promise<Employee>;
  updateEmployee(id: string, dto: UpdateEmployeeDto): Promise<Employee>;
  toggleEmployeeStatus(id: string): Promise<Employee>;
  deleteEmployee(id: string): Promise<boolean>;
  getAuditLogs(params?: AuditLogFilterParams): Promise<PaginatedResponse<AuditLog>>;
  getSystemSettings(): Promise<SystemSettings>;
  updateSystemSettings(settings: Partial<SystemSettings>): Promise<SystemSettings>;
  resetToDefaults(): Promise<void>;
}

/**
 * Mock Implementation: Uses persistent in-memory / localStorage store
 */
class MockAdminService implements IAdminService {
  async getDashboardMetrics(): Promise<AdminDashboardMetrics> {
    await simulateDelay(150);
    return mockStore.getDashboardMetrics();
  }

  async getOrganizations(params?: OrganizationFilterParams): Promise<PaginatedResponse<Organization>> {
    await simulateDelay(200);
    let items = mockStore.getOrganizations();

    // Search filter
    if (params?.search) {
      const q = params.search.trim().toLowerCase();
      items = items.filter(
        (o) =>
          o.name.toLowerCase().includes(q) ||
          o.code.toLowerCase().includes(q) ||
          o.directorName.toLowerCase().includes(q)
      );
    }

    // Type filter
    if (params?.type && params.type !== "all") {
      items = items.filter((o) => o.type === params.type);
    }

    // Status filter
    if (params?.status && params.status !== "all") {
      const isActive = params.status === "active";
      items = items.filter((o) => o.isActive === isActive);
    }

    const totalCount = items.length;
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const totalPages = Math.ceil(totalCount / pageSize) || 1;

    const startIndex = (page - 1) * pageSize;
    const paginatedItems = items.slice(startIndex, startIndex + pageSize);

    return {
      items: paginatedItems,
      totalCount,
      page,
      pageSize,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  async getOrganizationById(id: string): Promise<Organization> {
    await simulateDelay(100);
    const org = mockStore.getOrganizationById(id);
    if (!org) throw new Error("الهيئة غير موجودة");
    return org;
  }

  async createOrganization(dto: CreateOrganizationDto): Promise<Organization> {
    await simulateDelay(300);
    return mockStore.createOrganization(dto);
  }

  async updateOrganization(id: string, dto: UpdateOrganizationDto): Promise<Organization> {
    await simulateDelay(250);
    return mockStore.updateOrganization(id, dto);
  }

  async toggleOrganizationStatus(id: string): Promise<Organization> {
    await simulateDelay(200);
    return mockStore.toggleOrganizationStatus(id);
  }

  async deleteOrganization(id: string): Promise<boolean> {
    await simulateDelay(250);
    return mockStore.deleteOrganization(id);
  }

  async getBranches(organizationId?: string): Promise<OrganizationBranch[]> {
    await simulateDelay(150);
    return mockStore.getBranches(organizationId);
  }

  async createBranch(dto: CreateBranchDto): Promise<OrganizationBranch> {
    await simulateDelay(250);
    return mockStore.createBranch(dto);
  }

  async updateBranch(id: string, dto: UpdateBranchDto): Promise<OrganizationBranch> {
    await simulateDelay(200);
    return mockStore.updateBranch(id, dto);
  }

  async deleteBranch(id: string): Promise<boolean> {
    await simulateDelay(200);
    return mockStore.deleteBranch(id);
  }

  async getEmployees(branchId?: string, organizationId?: string): Promise<Employee[]> {
    await simulateDelay(200);
    return mockStore.getEmployees(branchId, organizationId);
  }

  async createEmployee(dto: CreateEmployeeDto): Promise<Employee> {
    await simulateDelay(300);
    return mockStore.createEmployee(dto);
  }

  async updateEmployee(id: string, dto: UpdateEmployeeDto): Promise<Employee> {
    await simulateDelay(300);
    return mockStore.updateEmployee(id, dto);
  }

  async toggleEmployeeStatus(id: string): Promise<Employee> {
    await simulateDelay(200);
    return mockStore.toggleEmployeeStatus(id);
  }

  async deleteEmployee(id: string): Promise<boolean> {
    await simulateDelay(250);
    return mockStore.deleteEmployee(id);
  }

  async getAuditLogs(params?: AuditLogFilterParams): Promise<PaginatedResponse<AuditLog>> {
    await simulateDelay(150);
    let items = mockStore.getAuditLogs();

    if (params?.search) {
      const q = params.search.trim().toLowerCase();
      items = items.filter(
        (l) =>
          l.action.toLowerCase().includes(q) ||
          l.userFullName.toLowerCase().includes(q) ||
          l.userNationalNumber.includes(q) ||
          l.entityName.toLowerCase().includes(q) ||
          l.ipAddress.includes(q)
      );
    }

    if (params?.status && params.status !== "all") {
      items = items.filter((l) => l.status.toLowerCase() === params.status?.toLowerCase());
    }

    if (params?.actionType && params.actionType !== "all") {
      items = items.filter((l) => l.actionType === params.actionType);
    }

    const totalCount = items.length;
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const totalPages = Math.ceil(totalCount / pageSize) || 1;

    const startIndex = (page - 1) * pageSize;
    const paginatedItems = items.slice(startIndex, startIndex + pageSize);

    return {
      items: paginatedItems,
      totalCount,
      page,
      pageSize,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  async getSystemSettings(): Promise<SystemSettings> {
    await simulateDelay(100);
    return mockStore.getSystemSettings();
  }

  async updateSystemSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    await simulateDelay(200);
    return mockStore.updateSystemSettings(settings);
  }

  async resetToDefaults(): Promise<void> {
    mockStore.resetToDefaults();
  }
}

/**
 * Live HTTP Implementation: Calls ASP.NET Core Web API
 */
class HttpAdminService implements IAdminService {
  async getDashboardMetrics(): Promise<AdminDashboardMetrics> {
    const res = await apiClient.get<AdminDashboardMetrics>("/api/admin/metrics");
    return res.data;
  }

  async getOrganizations(params?: OrganizationFilterParams): Promise<PaginatedResponse<Organization>> {
    const res = await apiClient.get<PaginatedResponse<Organization>>("/api/admin/organizations", params);
    return res.data;
  }

  async getOrganizationById(id: string): Promise<Organization> {
    const res = await apiClient.get<Organization>(`/api/admin/organizations/${id}`);
    return res.data;
  }

  async createOrganization(dto: CreateOrganizationDto): Promise<Organization> {
    const res = await apiClient.post<Organization>("/api/admin/organizations", dto);
    return res.data;
  }

  async updateOrganization(id: string, dto: UpdateOrganizationDto): Promise<Organization> {
    const res = await apiClient.put<Organization>(`/api/admin/organizations/${id}`, dto);
    return res.data;
  }

  async toggleOrganizationStatus(id: string): Promise<Organization> {
    const res = await apiClient.put<Organization>(`/api/admin/organizations/${id}/toggle-status`, {});
    return res.data;
  }

  async deleteOrganization(id: string): Promise<boolean> {
    const res = await apiClient.delete<boolean>(`/api/admin/organizations/${id}`);
    return res.data;
  }

  async getBranches(organizationId?: string): Promise<OrganizationBranch[]> {
    const res = await apiClient.get<OrganizationBranch[]>("/api/admin/branches", { organizationId });
    return res.data;
  }

  async createBranch(dto: CreateBranchDto): Promise<OrganizationBranch> {
    const res = await apiClient.post<OrganizationBranch>("/api/admin/branches", dto);
    return res.data;
  }

  async updateBranch(id: string, dto: UpdateBranchDto): Promise<OrganizationBranch> {
    const res = await apiClient.put<OrganizationBranch>(`/api/admin/branches/${id}`, dto);
    return res.data;
  }

  async deleteBranch(id: string): Promise<boolean> {
    const res = await apiClient.delete<boolean>(`/api/admin/branches/${id}`);
    return res.data;
  }

  async getEmployees(branchId?: string, organizationId?: string): Promise<Employee[]> {
    const res = await apiClient.get<Employee[]>("/api/admin/employees", { branchId, organizationId });
    return res.data;
  }

  async createEmployee(dto: CreateEmployeeDto): Promise<Employee> {
    const res = await apiClient.post<Employee>("/api/admin/employees", dto);
    return res.data;
  }

  async updateEmployee(id: string, dto: UpdateEmployeeDto): Promise<Employee> {
    const res = await apiClient.put<Employee>(`/api/admin/employees/${id}`, dto);
    return res.data;
  }

  async toggleEmployeeStatus(id: string): Promise<Employee> {
    const res = await apiClient.put<Employee>(`/api/admin/employees/${id}/toggle-status`, {});
    return res.data;
  }

  async deleteEmployee(id: string): Promise<boolean> {
    const res = await apiClient.delete<boolean>(`/api/admin/employees/${id}`);
    return res.data;
  }

  async getAuditLogs(params?: AuditLogFilterParams): Promise<PaginatedResponse<AuditLog>> {
    const res = await apiClient.get<PaginatedResponse<AuditLog>>("/api/admin/audit-logs", params);
    return res.data;
  }

  async getSystemSettings(): Promise<SystemSettings> {
    const res = await apiClient.get<SystemSettings>("/api/admin/settings");
    return res.data;
  }

  async updateSystemSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    const res = await apiClient.put<SystemSettings>("/api/admin/settings", settings);
    return res.data;
  }

  async resetToDefaults(): Promise<void> {
    console.warn("resetToDefaults is only supported in Mock mode.");
  }
}

// Automatically switch between Mock and Live API based on environment variable
const isMockMode = process.env.NEXT_PUBLIC_USE_MOCKS !== "false";

export const adminService: IAdminService = isMockMode
  ? new MockAdminService()
  : new HttpAdminService();
