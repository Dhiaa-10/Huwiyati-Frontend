import initialOrganizations from "@/data/mock/organizations.json";
import initialBranches from "@/data/mock/branches.json";
import initialEmployees from "@/data/mock/employees.json";
import initialServiceTypes from "@/data/mock/service_types.json";
import initialAuditLogs from "@/data/mock/audit_logs.json";
import initialMetrics from "@/data/mock/system_metrics.json";
import initialSettings from "@/data/mock/system_settings.json";
import initialCitizens from "@/data/mock/citizens.json";
import initialCivilRequests from "@/data/mock/civil_requests.json";
import initialVitalEvents from "@/data/mock/vital_events.json";
import initialPassports from "@/data/mock/passports.json";
import initialPassportRequests from "@/data/mock/passport_requests.json";
import initialTravelRecords from "@/data/mock/travel_records.json";
import initialVehicles from "@/data/mock/vehicles.json";
import initialDrivingLicenses from "@/data/mock/driving_licenses.json";
import initialTrafficViolations from "@/data/mock/traffic_violations.json";
import initialMedicalRecords from "@/data/mock/medical_records.json";

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

import {
  Organization,
  OrganizationBranch,
  Employee,
  ServiceType,
  AuditLog,
  AdminDashboardMetrics,
  SystemSettings,
  CreateOrganizationDto,
  UpdateOrganizationDto,
  CreateBranchDto,
  UpdateBranchDto,
  CreateEmployeeDto,
  UpdateEmployeeDto,
} from "@/types/admin";

import {
  CitizenCivilRecord,
  CivilServiceRequest,
  VitalEvent,
  CivilRegistryMetrics,
  ActivateAccountDto,
  UpdateRequestStatusDto,
} from "@/types/civilRegistry";

import {
  PassportRecord,
  PassportRequest,
  TravelRecord,
  PassportsDirectorMetrics,
  RecordTravelMovementDto,
  UpdatePassportRequestStatusDto,
} from "@/types/passports";

import {
  Vehicle,
  DrivingLicense,
  TrafficViolation,
  TrafficDirectorMetrics,
  RecordViolationDto,
  PayViolationDto,
  IssueDrivingLicenseDto,
  RegisterVehicleDto,
} from "@/types/traffic";

const STORAGE_KEYS = {
  ORGANIZATIONS: "hwyati_mock_organizations_v1",
  BRANCHES: "hwyati_mock_branches_v1",
  EMPLOYEES: "hwyati_mock_employees_v2", // bumped: rich isolated employee rosters for all 4 agencies
  SERVICES: "hwyati_mock_services_v1",
  AUDIT_LOGS: "hwyati_mock_audit_logs_v1",
  SETTINGS: "hwyati_mock_settings_v1",
  CITIZENS: "hwyati_mock_citizens_v1",
  CIVIL_REQUESTS: "hwyati_mock_civil_requests_v1",
  VITAL_EVENTS: "hwyati_mock_vital_events_v2",       // bumped: added fatherNationalNumber/motherNationalNumber
  PASSPORTS: "hwyati_mock_passports_v1",
  PASSPORT_REQUESTS: "hwyati_mock_passport_requests_v1",
  TRAVEL_RECORDS: "hwyati_mock_travel_records_v1",
  VEHICLES: "hwyati_mock_vehicles_v2",               // bumped: owners corrected to real citizen NatIDs
  DRIVING_LICENSES: "hwyati_mock_driving_licenses_v2", // bumped: holders corrected to real citizen NatIDs
  TRAFFIC_VIOLATIONS: "hwyati_mock_traffic_violations_v2", // bumped: owners corrected to real citizen NatIDs
  MEDICAL_RECORDS: "hwyati_mock_medical_records_v2", // bumped: patients corrected to all 6 real citizens
};

// Safe helper for localStorage
function getStored<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }
  try {
    const item = window.localStorage.getItem(key);
    if (!item) {
      window.localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(item) as T;
  } catch (err) {
    console.warn(`Error reading localStorage key "${key}":`, err);
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error writing to localStorage key "${key}":`, err);
  }
}

// Generate simple mock UUID
function generateUUID(): string {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * In-Memory & LocalStorage Persistent Mock Store
 */
class MockStoreManager {
  private organizations: Organization[] = initialOrganizations as Organization[];
  private branches: OrganizationBranch[] = initialBranches as OrganizationBranch[];
  private employees: Employee[] = initialEmployees as Employee[];
  private serviceTypes: ServiceType[] = initialServiceTypes as ServiceType[];
  private auditLogs: AuditLog[] = initialAuditLogs as AuditLog[];
  private settings: SystemSettings = initialSettings as SystemSettings;
  private citizens: CitizenCivilRecord[] = initialCitizens as CitizenCivilRecord[];
  private civilRequests: CivilServiceRequest[] = initialCivilRequests as CivilServiceRequest[];
  private vitalEvents: VitalEvent[] = initialVitalEvents as VitalEvent[];
  private passports: PassportRecord[] = initialPassports as PassportRecord[];
  private passportRequests: PassportRequest[] = initialPassportRequests as PassportRequest[];
  private travelRecords: TravelRecord[] = initialTravelRecords as TravelRecord[];
  private vehicles: Vehicle[] = initialVehicles as Vehicle[];
  private drivingLicenses: DrivingLicense[] = initialDrivingLicenses as DrivingLicense[];
  private trafficViolations: TrafficViolation[] = initialTrafficViolations as TrafficViolation[];
  private medicalRecords: MedicalRecord[] = initialMedicalRecords as MedicalRecord[];

  constructor() {
    this.init();
  }

  private init() {
    if (typeof window !== "undefined") {
      this.organizations = getStored(STORAGE_KEYS.ORGANIZATIONS, initialOrganizations as Organization[]);
      this.branches = getStored(STORAGE_KEYS.BRANCHES, initialBranches as OrganizationBranch[]);
      this.employees = getStored(STORAGE_KEYS.EMPLOYEES, initialEmployees as Employee[]);
      this.serviceTypes = getStored(STORAGE_KEYS.SERVICES, initialServiceTypes as ServiceType[]);
      this.auditLogs = getStored(STORAGE_KEYS.AUDIT_LOGS, initialAuditLogs as AuditLog[]);
      this.settings = getStored(STORAGE_KEYS.SETTINGS, initialSettings as SystemSettings);
      this.citizens = getStored(STORAGE_KEYS.CITIZENS, initialCitizens as CitizenCivilRecord[]);
      this.civilRequests = getStored(STORAGE_KEYS.CIVIL_REQUESTS, initialCivilRequests as CivilServiceRequest[]);
      this.vitalEvents = getStored(STORAGE_KEYS.VITAL_EVENTS, initialVitalEvents as VitalEvent[]);
      this.passports = getStored(STORAGE_KEYS.PASSPORTS, initialPassports as PassportRecord[]);
      this.passportRequests = getStored(STORAGE_KEYS.PASSPORT_REQUESTS, initialPassportRequests as PassportRequest[]);
      this.travelRecords = getStored(STORAGE_KEYS.TRAVEL_RECORDS, initialTravelRecords as TravelRecord[]);
      this.vehicles = getStored(STORAGE_KEYS.VEHICLES, initialVehicles as Vehicle[]);
      this.drivingLicenses = getStored(STORAGE_KEYS.DRIVING_LICENSES, initialDrivingLicenses as DrivingLicense[]);
      this.trafficViolations = getStored(STORAGE_KEYS.TRAFFIC_VIOLATIONS, initialTrafficViolations as TrafficViolation[]);
      this.medicalRecords = getStored(STORAGE_KEYS.MEDICAL_RECORDS, initialMedicalRecords as MedicalRecord[]);
    }
  }

  public resetToDefaults(): void {
    if (typeof window !== "undefined") {
      Object.values(STORAGE_KEYS).forEach((key) => window.localStorage.removeItem(key));
    }
    this.organizations = [...(initialOrganizations as Organization[])];
    this.branches = [...(initialBranches as OrganizationBranch[])];
    this.employees = [...(initialEmployees as Employee[])];
    this.serviceTypes = [...(initialServiceTypes as ServiceType[])];
    this.auditLogs = [...(initialAuditLogs as AuditLog[])];
    this.settings = { ...(initialSettings as SystemSettings) };
    this.citizens = [...(initialCitizens as CitizenCivilRecord[])];
    this.civilRequests = [...(initialCivilRequests as CivilServiceRequest[])];
    this.vitalEvents = [...(initialVitalEvents as VitalEvent[])];
    this.passports = [...(initialPassports as PassportRecord[])];
    this.passportRequests = [...(initialPassportRequests as PassportRequest[])];
    this.travelRecords = [...(initialTravelRecords as TravelRecord[])];
    this.vehicles = [...(initialVehicles as Vehicle[])];
    this.drivingLicenses = [...(initialDrivingLicenses as DrivingLicense[])];
    this.trafficViolations = [...(initialTrafficViolations as TrafficViolation[])];
    this.medicalRecords = [...(initialMedicalRecords as MedicalRecord[])];
    this.saveAll();
  }

  private saveAll(): void {
    setStored(STORAGE_KEYS.ORGANIZATIONS, this.organizations);
    setStored(STORAGE_KEYS.BRANCHES, this.branches);
    setStored(STORAGE_KEYS.EMPLOYEES, this.employees);
    setStored(STORAGE_KEYS.SERVICES, this.serviceTypes);
    setStored(STORAGE_KEYS.AUDIT_LOGS, this.auditLogs);
    setStored(STORAGE_KEYS.SETTINGS, this.settings);
    setStored(STORAGE_KEYS.CITIZENS, this.citizens);
    setStored(STORAGE_KEYS.CIVIL_REQUESTS, this.civilRequests);
    setStored(STORAGE_KEYS.VITAL_EVENTS, this.vitalEvents);
    setStored(STORAGE_KEYS.PASSPORTS, this.passports);
    setStored(STORAGE_KEYS.PASSPORT_REQUESTS, this.passportRequests);
    setStored(STORAGE_KEYS.TRAVEL_RECORDS, this.travelRecords);
    setStored(STORAGE_KEYS.VEHICLES, this.vehicles);
    setStored(STORAGE_KEYS.DRIVING_LICENSES, this.drivingLicenses);
    setStored(STORAGE_KEYS.TRAFFIC_VIOLATIONS, this.trafficViolations);
  }

  // ===================== Organizations CRUD =====================

  public getOrganizations(): Organization[] {
    this.init();
    return [...this.organizations];
  }

  public getOrganizationById(id: string): Organization | undefined {
    this.init();
    return this.organizations.find((o) => o.id === id);
  }

  public createOrganization(dto: CreateOrganizationDto): Organization {
    this.init();
    const typeLabels: Record<string, string> = {
      security: "أمني",
      civil: "مدني",
      health: "صحي",
      judicial: "قضائي",
      financial: "مالي",
    };

    const newOrg: Organization = {
      id: generateUUID(),
      name: dto.name,
      code: dto.code.toUpperCase(),
      type: dto.type,
      typeLabel: typeLabels[dto.type] || "مدني",
      description: dto.description || "",
      directorName: dto.directorName,
      directorNationalId: dto.directorNationalId,
      directorPhone: dto.directorPhone,
      directorEmail: dto.directorEmail,
      branchesCount: 0,
      activeServicesCount: 0,
      establishedDate: new Date().toISOString().split("T")[0],
      isActive: dto.isActive !== undefined ? dto.isActive : true,
      createdAt: new Date().toISOString(),
      iconName: dto.iconName || "account_balance",
      badgeColor: "blue",
    };

    this.organizations.unshift(newOrg);
    this.saveOrganizations();

    // Log this action
    this.recordAuditLog({
      action: `إضافة هيئة حكومية جديدة: ${newOrg.name}`,
      actionType: "create",
      entityName: newOrg.name,
      entityId: newOrg.id,
      userFullName: "م. ضياء محمد عبدالمجيد السالمي",
      userNationalNumber: "01010000001",
      userRole: "SuperAdmin",
      ipAddress: "192.168.1.10",
      status: "Success",
      details: `تم تسجيل الهيئة في الدليل المركزي برمز [${newOrg.code}] ومديرها [${newOrg.directorName}].`,
    });

    return newOrg;
  }

  public updateOrganization(id: string, dto: UpdateOrganizationDto): Organization {
    this.init();
    const index = this.organizations.findIndex((o) => o.id === id);
    if (index === -1) {
      throw new Error(`الجهة ذات المعرف ${id} غير موجودة.`);
    }

    const current = this.organizations[index];
    const updated: Organization = {
      ...current,
      ...dto,
      code: dto.code ? dto.code.toUpperCase() : current.code,
      updatedAt: new Date().toISOString(),
    };

    this.organizations[index] = updated;
    this.saveOrganizations();

    this.recordAuditLog({
      action: `تعديل بيانات هيئة: ${updated.name}`,
      actionType: "update",
      entityName: updated.name,
      entityId: updated.id,
      userFullName: "م. ضياء محمد عبدالمجيد السالمي",
      userNationalNumber: "01010000001",
      userRole: "SuperAdmin",
      ipAddress: "192.168.1.10",
      status: "Success",
      details: `تم تحديث بيانات الاتصال والمسؤولين للهيئة في النظام.`,
    });

    return updated;
  }

  public toggleOrganizationStatus(id: string): Organization {
    this.init();
    const org = this.organizations.find((o) => o.id === id);
    if (!org) {
      throw new Error(`الجهة ذات المعرف ${id} غير موجودة.`);
    }

    org.isActive = !org.isActive;
    org.updatedAt = new Date().toISOString();
    this.saveOrganizations();

    this.recordAuditLog({
      action: `${org.isActive ? "تفعيل" : "تعطيل"} نشاط هيئة: ${org.name}`,
      actionType: "update",
      entityName: org.name,
      entityId: org.id,
      userFullName: "م. ضياء محمد عبدالمجيد السالمي",
      userNationalNumber: "01010000001",
      userRole: "SuperAdmin",
      ipAddress: "192.168.1.10",
      status: org.isActive ? "Success" : "Warning",
      details: `تم تغيير حالة الهيئة إلى ${org.isActive ? "نشط" : "غير نشط"}.`,
    });

    return org;
  }

  public deleteOrganization(id: string): boolean {
    this.init();
    const org = this.organizations.find((o) => o.id === id);
    if (!org) return false;

    this.organizations = this.organizations.filter((o) => o.id !== id);
    // Also remove associated branches
    this.branches = this.branches.filter((b) => b.organizationId !== id);

    this.saveOrganizations();
    this.saveBranches();

    this.recordAuditLog({
      action: `حذف هيئة حكومية: ${org.name}`,
      actionType: "delete",
      entityName: org.name,
      entityId: org.id,
      userFullName: "م. ضياء محمد عبدالمجيد السالمي",
      userNationalNumber: "01010000001",
      userRole: "SuperAdmin",
      ipAddress: "192.168.1.10",
      status: "Warning",
      details: `تم حذف الهيئة وجميع الفروع المرتبطة بها من المنظومة نهائياً.`,
    });

    return true;
  }

  private saveOrganizations(): void {
    setStored(STORAGE_KEYS.ORGANIZATIONS, this.organizations);
  }

  // ===================== Branches CRUD =====================

  public getBranches(organizationId?: string): OrganizationBranch[] {
    this.init();
    if (organizationId) {
      return this.branches.filter((b) => b.organizationId === organizationId);
    }
    return [...this.branches];
  }

  public createBranch(dto: CreateBranchDto): OrganizationBranch {
    this.init();
    const org = this.organizations.find((o) => o.id === dto.organizationId);
    const newBranch: OrganizationBranch = {
      id: generateUUID(),
      organizationId: dto.organizationId,
      organizationName: org ? org.name : undefined,
      branchName: dto.branchName,
      governorate: dto.governorate,
      district: dto.district,
      addressDetails: dto.addressDetails,
      phoneNumber: dto.phoneNumber,
      managerName: dto.managerName,
      isActive: dto.isActive !== undefined ? dto.isActive : true,
      createdAt: new Date().toISOString(),
    };

    this.branches.push(newBranch);
    if (org) {
      org.branchesCount = (org.branchesCount || 0) + 1;
      this.saveOrganizations();
    }
    this.saveBranches();

    this.recordAuditLog({
      action: `إضافة فرع جديد: ${newBranch.branchName}`,
      actionType: "create",
      entityName: org?.name || "فروع الهيئات",
      entityId: newBranch.id,
      userFullName: "م. ضياء محمد عبدالمجيد السالمي",
      userNationalNumber: "01010000001",
      userRole: "SuperAdmin",
      ipAddress: "192.168.1.10",
      status: "Success",
      details: `إضافة فرع في محافظة ${newBranch.governorate} مديرية ${newBranch.district}.`,
    });

    return newBranch;
  }

  public updateBranch(id: string, dto: UpdateBranchDto): OrganizationBranch {
    this.init();
    const index = this.branches.findIndex((b) => b.id === id);
    if (index === -1) throw new Error("الفرع غير موجود.");

    const current = this.branches[index];
    const updated = { ...current, ...dto };
    this.branches[index] = updated;
    this.saveBranches();
    return updated;
  }

  public deleteBranch(id: string): boolean {
    this.init();
    const branch = this.branches.find((b) => b.id === id);
    if (!branch) return false;

    this.branches = this.branches.filter((b) => b.id !== id);
    const org = this.organizations.find((o) => o.id === branch.organizationId);
    if (org && org.branchesCount > 0) {
      org.branchesCount -= 1;
      this.saveOrganizations();
    }
    this.saveBranches();
    return true;
  }

  private saveBranches(): void {
    setStored(STORAGE_KEYS.BRANCHES, this.branches);
  }

  // ===================== Employees CRUD (Branch Admin) =====================

  public getEmployees(branchId?: string, organizationId?: string): Employee[] {
    this.init();
    let list = [...this.employees];
    if (organizationId) {
      list = list.filter((e) => e.organizationId === organizationId);
    }
    if (branchId) {
      list = list.filter((e) => e.branchId === branchId);
    }
    return list;
  }

  public createEmployee(dto: CreateEmployeeDto): Employee {
    this.init();
    const branch = this.branches.find((b) => b.id === dto.branchId);
    const org = this.organizations.find((o) => o.id === dto.organizationId);

    const newEmp: Employee = {
      id: generateUUID(),
      userId: generateUUID(),
      branchId: dto.branchId,
      branchName: branch ? branch.branchName : undefined,
      organizationId: dto.organizationId,
      organizationName: org ? org.name : undefined,
      employeeNumber: dto.employeeNumber || `EMP-${Math.floor(1000 + Math.random() * 9000)}`,
      nationalNumber: dto.nationalNumber,
      fullName: dto.fullName,
      email: dto.email,
      phoneNumber: dto.phoneNumber,
      role: dto.role,
      roleLabel: dto.roleLabel,
      isActive: true,
      accountStatus: "Active",
      createdAt: new Date().toISOString(),
    };

    this.employees.unshift(newEmp);
    this.saveEmployees();

    this.recordAuditLog({
      action: `إضافة موظف جديد للفرع: ${newEmp.fullName} (${newEmp.employeeNumber})`,
      actionType: "create",
      entityName: branch?.branchName || "إدارة الموظفين",
      entityId: newEmp.employeeNumber,
      userFullName: "م. ضياء محمد عبدالمجيد السالمي",
      userNationalNumber: "01010000001",
      userRole: "BranchAdmin",
      ipAddress: "192.168.1.10",
      status: "Success",
      details: `تم تعيين الموظف في الفرع [${branch?.branchName}] بصفة [${newEmp.roleLabel}].`,
    });

    return newEmp;
  }

  public updateEmployee(id: string, dto: UpdateEmployeeDto): Employee {
    this.init();
    const index = this.employees.findIndex((e) => e.id === id);
    if (index === -1) throw new Error("الموظف غير موجود.");

    const current = this.employees[index];
    let branchName = current.branchName;
    if (dto.branchId && dto.branchId !== current.branchId) {
      const b = this.branches.find((br) => br.id === dto.branchId);
      if (b) branchName = b.branchName;
    }

    const updated: Employee = {
      ...current,
      ...dto,
      branchName,
    };

    this.employees[index] = updated;
    this.saveEmployees();

    this.recordAuditLog({
      action: `تعديل بيانات موظف: ${updated.fullName}`,
      actionType: "update",
      entityName: updated.branchName || "إدارة الموظفين",
      entityId: updated.employeeNumber,
      userFullName: "م. ضياء محمد عبدالمجيد السالمي",
      userNationalNumber: "01010000001",
      userRole: "BranchAdmin",
      ipAddress: "192.168.1.10",
      status: "Success",
      details: `تم تحديث الملف الوظيفي والحالة التشغيلية للموظف.`,
    });

    return updated;
  }

  public toggleEmployeeStatus(id: string): Employee {
    this.init();
    const emp = this.employees.find((e) => e.id === id);
    if (!emp) throw new Error("الموظف غير موجود.");

    emp.isActive = !emp.isActive;
    emp.accountStatus = emp.isActive ? "Active" : "Suspended";
    this.saveEmployees();

    this.recordAuditLog({
      action: `${emp.isActive ? "تفعيل" : "إيقاف مؤقت"} لحساب الموظف: ${emp.fullName}`,
      actionType: "update",
      entityName: emp.branchName || "إدارة الموظفين",
      entityId: emp.employeeNumber,
      userFullName: "م. ضياء محمد عبدالمجيد السالمي",
      userNationalNumber: "01010000001",
      userRole: "BranchAdmin",
      ipAddress: "192.168.1.10",
      status: emp.isActive ? "Success" : "Warning",
      details: `تم تغيير حالة حساب الموظف إلى [${emp.accountStatus}].`,
    });

    return emp;
  }

  public deleteEmployee(id: string): boolean {
    this.init();
    const emp = this.employees.find((e) => e.id === id);
    if (!emp) return false;

    this.employees = this.employees.filter((e) => e.id !== id);
    this.saveEmployees();

    this.recordAuditLog({
      action: `حذف موظف من الفرع: ${emp.fullName}`,
      actionType: "delete",
      entityName: emp.branchName || "إدارة الموظفين",
      entityId: emp.employeeNumber,
      userFullName: "م. ضياء محمد عبدالمجيد السالمي",
      userNationalNumber: "01010000001",
      userRole: "BranchAdmin",
      ipAddress: "192.168.1.10",
      status: "Warning",
      details: `تم حذف الموظف من كادر الفرع.`,
    });

    return true;
  }

  private saveEmployees(): void {
    setStored(STORAGE_KEYS.EMPLOYEES, this.employees);
  }

  // ===================== Audit Logs =====================

  public getAuditLogs(): AuditLog[] {
    this.init();
    return [...this.auditLogs];
  }

  public recordAuditLog(log: Omit<AuditLog, "id" | "timestamp">): AuditLog {
    this.init();
    const newEntry: AuditLog = {
      ...log,
      id: generateUUID(),
      timestamp: new Date().toISOString(),
    };
    this.auditLogs.unshift(newEntry);
    // Keep max 200 logs
    if (this.auditLogs.length > 200) {
      this.auditLogs = this.auditLogs.slice(0, 200);
    }
    setStored(STORAGE_KEYS.AUDIT_LOGS, this.auditLogs);
    return newEntry;
  }

  // ===================== Dashboard Telemetry =====================

  public getDashboardMetrics(): AdminDashboardMetrics {
    this.init();
    const totalAgencies = this.organizations.length;
    const activeAgencies = this.organizations.filter((o) => o.isActive).length;

    return {
      totalCitizens: initialMetrics.totalCitizens,
      activeAgencies,
      totalAgencies,
      todayRequests: initialMetrics.todayRequests,
      successRate: initialMetrics.successRate,
      pendingVerifications: initialMetrics.pendingVerifications,
      systemUptime: initialMetrics.systemUptime,
      serverLatencyMs: initialMetrics.serverLatencyMs,
      agencyDistribution: initialMetrics.agencyDistribution,
      recentActivityCount: this.auditLogs.length,
    };
  }

  // ===================== System Settings =====================

  public getSystemSettings(): SystemSettings {
    this.init();
    return { ...this.settings };
  }

  public updateSystemSettings(newSettings: Partial<SystemSettings>): SystemSettings {
    this.init();
    this.settings = { ...this.settings, ...newSettings };
    setStored(STORAGE_KEYS.SETTINGS, this.settings);
    return { ...this.settings };
  }

  // ===================== Civil Registry Operations =====================

  public getCitizens(): CitizenCivilRecord[] {
    this.init();
    return [...this.citizens];
  }

  public getCitizenByNationalNumber(nationalNumber: string): CitizenCivilRecord | undefined {
    this.init();
    const cleanNum = nationalNumber.trim();
    return this.citizens.find((c) => c.nationalNumber === cleanNum);
  }

  public activateCitizen(nationalNumber: string, notes?: string): CitizenCivilRecord {
    this.init();
    const citizen = this.citizens.find((c) => c.nationalNumber === nationalNumber.trim());
    if (!citizen) throw new Error("المواطن غير مسجل في السجل المدني.");

    citizen.accountStatus = "Active";
    citizen.activatedAt = new Date().toISOString();
    citizen.biometricRegistered = true;
    citizen.biometricMatchPercentage = 99.2;
    this.saveCitizens();

    this.recordAuditLog({
      action: `تفعيل حساب مواطن: ${citizen.fullName}`,
      actionType: "auth",
      entityName: "الأحوال المدنية والسجل المدني",
      entityId: citizen.nationalNumber,
      userFullName: "ملازم أول أمين عبدالله الحيمي",
      userNationalNumber: "01010048123",
      userRole: "CivilRegistryOfficer",
      ipAddress: "192.168.1.10",
      status: "Success",
      details: `تم التحقق البايومتري وتفعيل الحساب الرقمي للمواطن صاحب الرقم الوطني [${citizen.nationalNumber}]. ${notes || ""}`,
    });

    return citizen;
  }

  public rejectCitizenActivation(nationalNumber: string, reason: string): boolean {
    this.init();
    const citizen = this.citizens.find((c) => c.nationalNumber === nationalNumber.trim());
    if (!citizen) return false;

    this.recordAuditLog({
      action: `رفض تفعيل حساب مواطن: ${citizen.fullName}`,
      actionType: "security",
      entityName: "الأحوال المدنية والسجل المدني",
      entityId: citizen.nationalNumber,
      userFullName: "ملازم أول أمين عبدالله الحيمي",
      userNationalNumber: "01010048123",
      userRole: "CivilRegistryOfficer",
      ipAddress: "192.168.1.10",
      status: "Warning",
      details: `تم رفض تفعيل الحساب بسبب: ${reason}`,
    });

    return true;
  }

  private saveCitizens(): void {
    setStored(STORAGE_KEYS.CITIZENS, this.citizens);
  }

  public getCivilRequests(): CivilServiceRequest[] {
    this.init();
    return [...this.civilRequests];
  }

  public updateCivilRequestStatus(
    requestId: string,
    status: "UnderReview" | "Approved" | "Rejected" | "Issued" | "Completed",
    notes?: string,
    rejectionReason?: string
  ): CivilServiceRequest {
    this.init();
    const req = this.civilRequests.find((r) => r.id === requestId);
    if (!req) throw new Error("طلب الخدمة غير موجود.");

    req.status = status;
    if (notes) req.officerNotes = notes;
    if (rejectionReason) req.rejectionReason = rejectionReason;
    if (status === "Approved" || status === "Completed" || status === "Issued") {
      req.completedDate = new Date().toISOString();
    }
    this.saveCivilRequests();

    this.recordAuditLog({
      action: `تحديث حالة طلب ${req.serviceName}: ${status}`,
      actionType: "update",
      entityName: "مصلحة الأحوال المدنية",
      entityId: req.requestNumber,
      userFullName: "ملازم أول أمين عبدالله الحيمي",
      userNationalNumber: "01010048123",
      userRole: "CivilRegistryOfficer",
      ipAddress: "192.168.1.10",
      status: status === "Rejected" ? "Warning" : "Success",
      details: `تم تغيير حالة الطلب رقم [${req.requestNumber}] للمواطن [${req.personFullName}] إلى [${status}].`,
    });

    return req;
  }

  private saveCivilRequests(): void {
    setStored(STORAGE_KEYS.CIVIL_REQUESTS, this.civilRequests);
  }

  public getVitalEvents(): VitalEvent[] {
    this.init();
    return [...this.vitalEvents];
  }

  public createVitalEvent(event: Omit<VitalEvent, "id" | "registrationDate" | "certificateNumber">): VitalEvent {
    this.init();
    const prefix = event.eventType === "Birth" ? "BC" : event.eventType === "Death" ? "DC" : "MC";
    const certNum = `${prefix}-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const newEvent: VitalEvent = {
      ...event,
      id: generateUUID(),
      certificateNumber: certNum,
      registrationDate: new Date().toISOString(),
    };

    this.vitalEvents.unshift(newEvent);
    this.saveVitalEvents();

    this.recordAuditLog({
      action: `تسجيل واقعة حيوية جديدة (${event.eventType}): ${certNum}`,
      actionType: "create",
      entityName: "السجل المدني - الوقائع الحيوية",
      entityId: certNum,
      userFullName: "ملازم أول أمين عبدالله الحيمي",
      userNationalNumber: "01010048123",
      userRole: "CivilRegistryOfficer",
      ipAddress: "192.168.1.10",
      status: "Success",
      details: `قيد واقعة ${event.eventType} باسم [${event.subjectName}] في محافظة [${event.governorate}].`,
    });

    return newEvent;
  }

  private saveVitalEvents(): void {
    setStored(STORAGE_KEYS.VITAL_EVENTS, this.vitalEvents);
  }

  public getCivilRegistryMetrics(): CivilRegistryMetrics {
    this.init();
    const pendingActivations = this.citizens.filter((c) => c.accountStatus === "PendingActivation").length;
    return {
      totalRegisteredCitizens: this.citizens.length + 3482900,
      pendingActivationsCount: pendingActivations,
      processedTodayCount: 84,
      vitalEventsThisMonthCount: this.vitalEvents.length + 420,
      activeCivilOfficersCount: 1248,
      biometricAccuracyPercentage: 99.4,
    };
  }

  // ===================== Passports & Border Control =====================

  public getPassports(): PassportRecord[] {
    this.init();
    return [...this.passports];
  }

  public getPassportByNumber(passportNumber: string): PassportRecord | undefined {
    this.init();
    const cleanNum = passportNumber.trim();
    return this.passports.find((p) => p.passportNumber === cleanNum);
  }

  public getPassportByNationalNumber(nationalNumber: string): PassportRecord | undefined {
    this.init();
    const cleanNid = nationalNumber.trim();
    return this.passports.find((p) => p.nationalNumber === cleanNid);
  }

  public getPassportRequests(): PassportRequest[] {
    this.init();
    return [...this.passportRequests];
  }

  public updatePassportRequestStatus(
    requestId: string,
    status: "UnderReview" | "Approved" | "Rejected" | "Printed",
    notes?: string,
    rejectionReason?: string
  ): PassportRequest {
    this.init();
    const req = this.passportRequests.find((r) => r.id === requestId);
    if (!req) throw new Error("طلب الجواز غير موجود.");

    req.status = status;
    if (notes) req.officerNotes = notes;
    if (rejectionReason) req.rejectionReason = rejectionReason;
    if (status === "Approved" || status === "Printed") {
      req.completedDate = new Date().toISOString();
    }
    this.savePassportRequests();

    this.recordAuditLog({
      action: `معالجة طلب جواز سفر (${req.serviceName}): ${status}`,
      actionType: "update",
      entityName: "مصلحة الهجرة والجوازات",
      entityId: req.requestNumber,
      userFullName: "الرائد خالد يحيى العريقي",
      userNationalNumber: "01010022334",
      userRole: "PassportsOfficer",
      ipAddress: "192.168.1.10",
      status: status === "Rejected" ? "Warning" : "Success",
      details: `تم تحديث حالة طلب الجواز رقم [${req.requestNumber}] للمواطن [${req.fullName}] إلى [${status}].`,
    });

    return req;
  }

  private savePassportRequests(): void {
    setStored(STORAGE_KEYS.PASSPORT_REQUESTS, this.passportRequests);
  }

  public getTravelRecords(): TravelRecord[] {
    this.init();
    return [...this.travelRecords];
  }

  public recordTravelMovement(dto: RecordTravelMovementDto): {
    record: TravelRecord;
    isFlagged: boolean;
    message: string;
  } {
    this.init();
    const pass = this.getPassportByNumber(dto.passportNumber);
    const isWatchlistBanned = pass?.isWatchlistBanned || false;

    const newRecord: TravelRecord = {
      id: generateUUID(),
      personId: pass?.personId || generateUUID(),
      nationalNumber: pass?.nationalNumber || "00000000000",
      fullName: pass?.fullName || "مسافر مسجل بالمنفذ",
      passportNumber: dto.passportNumber,
      movementType: dto.movementType,
      destinationOrOriginCountry: dto.destinationOrOriginCountry,
      portName: dto.portName,
      portType: dto.portType,
      flightOrVehicleNumber: dto.flightOrVehicleNumber,
      officerUserId: dto.officerUserId,
      officerName: dto.officerName,
      timestamp: new Date().toISOString(),
      isFlagged: isWatchlistBanned,
      securityNotes: isWatchlistBanned
        ? `تنبيه أمني فوري: المسافر مدرج بقائمة الممنوعين من السفر (${pass?.watchlistReason})`
        : dto.securityNotes,
    };

    this.travelRecords.unshift(newRecord);
    this.saveTravelRecords();

    this.recordAuditLog({
      action: `تسجيل حركة عبور منفذ (${dto.movementType === "Entry" ? "دخول" : "مغادرة"}): ${dto.portName}`,
      actionType: isWatchlistBanned ? "security" : "create",
      entityName: "الرقابة والمنافذ الحدودية",
      entityId: dto.passportNumber,
      userFullName: "النقيب عادل قاسم الأنسي",
      userNationalNumber: "01010025671",
      userRole: "BorderControlOfficer",
      ipAddress: "192.168.1.10",
      status: isWatchlistBanned ? "Failed" : "Success",
      details: isWatchlistBanned
        ? `تم إيقاف المسافر صاحب الجواز رقم [${dto.passportNumber}] في [${dto.portName}] لوجود حظر سفر.`
        : `تسجيل عبور نظامي للجواز [${dto.passportNumber}] متجهاً إلى / قادماً من [${dto.destinationOrOriginCountry}].`,
    });

    return {
      record: newRecord,
      isFlagged: isWatchlistBanned,
      message: isWatchlistBanned
        ? "تحذير أمني: المسافر ممنوع من السفر بموجب تعميم قضائي/أمني واجب التنفيذ فوراً!"
        : "تم تسجيل حركة العبور وختم الجواز بنجاح.",
    };
  }

  private saveTravelRecords(): void {
    setStored(STORAGE_KEYS.TRAVEL_RECORDS, this.travelRecords);
  }

  public getPassportsDirectorMetrics(): PassportsDirectorMetrics {
    this.init();
    return {
      totalIssuedPassports: 1428902,
      issuedTodayCount: 1420,
      activeBorderPortsCount: 6,
      pendingReviewCount: this.passportRequests.filter((r) => r.status === "Pending" || r.status === "UnderReview").length,
      todayBorderMovementsCount: this.travelRecords.length + 3840,
      watchlistInterceptsCount: 3,
      branchPerformance: [
        { branchName: "الفرع الرئيسي - صنعاء", governorate: "أمانة العاصمة", dailyIssuance: 620, monthlyIssuance: 18400, status: "Optimal" },
        { branchName: "فرع كريتر - عدن", governorate: "عدن", dailyIssuance: 410, monthlyIssuance: 12200, status: "Optimal" },
        { branchName: "فرع المكلا - حضرموت", governorate: "حضرموت", dailyIssuance: 240, monthlyIssuance: 7100, status: "Optimal" },
        { branchName: "منفذ الوديعة البري", governorate: "حضرموت", dailyIssuance: 150, monthlyIssuance: 4500, status: "Crowded" },
      ],
      portMovementsToday: [
        { portName: "مطار صنعاء الدولي", entryCount: 1240, exitCount: 1350 },
        { portName: "مطار عدن الدولي", entryCount: 980, exitCount: 1020 },
        { portName: "منفذ الوديعة البري", entryCount: 1890, exitCount: 2100 },
        { portName: "منفذ شحن البري", entryCount: 320, exitCount: 410 },
      ],
    };
  }

  // ===================== Traffic Agency (Vehicles, Licenses, Violations) =====================

  public getVehicles(search?: string, governorate?: string): Vehicle[] {
    this.init();
    let list = [...this.vehicles];
    if (search) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (v) =>
          v.plateNumber.toLowerCase().includes(q) ||
          v.chassisNumber.toLowerCase().includes(q) ||
          v.currentOwnerFullName.toLowerCase().includes(q) ||
          v.currentOwnerNationalId.includes(q)
      );
    }
    if (governorate && governorate !== "all") {
      list = list.filter((v) => v.plateGovernorate === governorate);
    }
    return list;
  }

  public getVehicleByPlate(plateNumber: string): Vehicle | undefined {
    this.init();
    const clean = plateNumber.trim().toLowerCase();
    return this.vehicles.find((v) => v.plateNumber.toLowerCase().includes(clean));
  }

  public registerVehicle(dto: RegisterVehicleDto): Vehicle {
    this.init();
    const newVehicle: Vehicle = {
      id: generateUUID(),
      plateNumber: dto.plateNumber,
      plateGovernorate: dto.plateGovernorate,
      chassisNumber: dto.chassisNumber,
      engineNumber: dto.engineNumber,
      vehicleType: dto.vehicleType,
      vehicleTypeLabel: dto.vehicleType === "SUV" ? "سيارة جيب عائلية" : "صالون خصوصي",
      manufacturer: dto.manufacturer,
      model: dto.model,
      manufactureYear: dto.manufactureYear,
      color: dto.color,
      colorHex: "#3b82f6",
      status: "Active",
      currentOwnerPersonId: generateUUID(),
      currentOwnerNationalId: dto.ownerNationalNumber,
      currentOwnerFullName: "مالك مسجل بالنظام",
      currentOwnerPhone: "+967 770000000",
      licenseNumber: `VL-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      licenseExpiryDate: new Date(Date.now() + 365 * 24 * 3600 * 1000 * 5).toISOString().split("T")[0],
      isInspected: true,
      createdAt: new Date().toISOString(),
    };

    this.vehicles.unshift(newVehicle);
    this.saveVehicles();

    this.recordAuditLog({
      action: `تسجيل وترقيم مركبة جديدة: ${newVehicle.plateNumber}`,
      actionType: "create",
      entityName: "الإدارة العامة للمرور - الترقيم والتسجيل",
      entityId: newVehicle.plateNumber,
      userFullName: "المساعد نشوان عادل الوجيه",
      userNationalNumber: "01010033445",
      userRole: "TrafficOfficer",
      ipAddress: "192.168.1.10",
      status: "Success",
      details: `تم ترقيم مركبة [${newVehicle.manufacturer} ${newVehicle.model}] برقم اللوحة [${newVehicle.plateNumber}].`,
    });

    return newVehicle;
  }

  private saveVehicles(): void {
    setStored(STORAGE_KEYS.VEHICLES, this.vehicles);
  }

  public getDrivingLicenses(search?: string): DrivingLicense[] {
    this.init();
    let list = [...this.drivingLicenses];
    if (search) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (l) =>
          l.fullName.toLowerCase().includes(q) ||
          l.nationalNumber.includes(q) ||
          l.licenseNumber.toLowerCase().includes(q)
      );
    }
    return list;
  }

  public getDrivingLicenseByNationalNumber(nid: string): DrivingLicense | undefined {
    this.init();
    const clean = nid.trim();
    return this.drivingLicenses.find((l) => l.nationalNumber === clean);
  }

  public issueDrivingLicense(dto: IssueDrivingLicenseDto): DrivingLicense {
    this.init();
    const citizen = this.getCitizenByNationalNumber(dto.nationalNumber);

    const newLic: DrivingLicense = {
      id: generateUUID(),
      personId: citizen ? citizen.id : generateUUID(),
      nationalNumber: dto.nationalNumber,
      fullName: citizen ? citizen.fullName : "سائق معتمد",
      photoUrl: citizen?.photoUrl || "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300",
      dateOfBirth: citizen?.dateOfBirth || "1994-01-01",
      bloodGroup: dto.bloodGroup || "O+",
      licenseNumber: `DL-01-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      category: dto.category,
      categoryLabel: dto.category === "Private" ? "خصوصي (سيارات ركاب خفيفة)" : "نقل وعمومي",
      issuingBranchId: dto.issuingBranchId,
      issuingBranchName: dto.issuingBranchName,
      issueDate: new Date().toISOString().split("T")[0],
      expiryDate: new Date(Date.now() + 365 * 24 * 3600 * 1000 * 10).toISOString().split("T")[0],
      qrCodePayload: `HWYATI-DL-${dto.nationalNumber}-${Date.now()}`,
      status: "Active",
      pointsCount: 0,
    };

    this.drivingLicenses.unshift(newLic);
    this.saveDrivingLicenses();

    this.recordAuditLog({
      action: `إصدار رخصة قيادة إلكترونية جديدة: ${newLic.licenseNumber}`,
      actionType: "create",
      entityName: "الإدارة العامة للمرور - الرخص",
      entityId: newLic.licenseNumber,
      userFullName: "المساعد نشوان عادل الوجيه",
      userNationalNumber: "01010033445",
      userRole: "TrafficOfficer",
      ipAddress: "192.168.1.10",
      status: "Success",
      details: `تم إصدار رخصة قيادة من الفئة [${newLic.categoryLabel}] للمواطن [${newLic.fullName}].`,
    });

    return newLic;
  }

  private saveDrivingLicenses(): void {
    setStored(STORAGE_KEYS.DRIVING_LICENSES, this.drivingLicenses);
  }

  public getTrafficViolations(filters?: { plateNumber?: string; paymentStatus?: string }): TrafficViolation[] {
    this.init();
    let list = [...this.trafficViolations];
    if (filters?.plateNumber) {
      const q = filters.plateNumber.trim().toLowerCase();
      list = list.filter((v) => v.plateNumber.toLowerCase().includes(q));
    }
    if (filters?.paymentStatus && filters.paymentStatus !== "all") {
      list = list.filter((v) => v.paymentStatus === filters.paymentStatus);
    }
    return list;
  }

  public recordTrafficViolation(dto: RecordViolationDto): TrafficViolation {
    this.init();
    const vehicle = this.getVehicleByPlate(dto.plateNumber);

    const newViolation: TrafficViolation = {
      id: generateUUID(),
      vehicleId: vehicle ? vehicle.id : generateUUID(),
      plateNumber: dto.plateNumber,
      vehicleModel: vehicle ? `${vehicle.manufacturer} ${vehicle.model}` : "مركبة خصوصي",
      ownerNationalNumber: vehicle?.currentOwnerNationalId || "00000000000",
      ownerFullName: vehicle?.currentOwnerFullName || "مالك المركبة",
      violationType: dto.violationType,
      violationDate: new Date().toISOString().split("T")[0],
      violationTime: dto.violationTime || new Date().toLocaleTimeString("ar-YE", { hour: "2-digit", minute: "2-digit" }),
      location: dto.location,
      governorate: dto.governorate,
      fineAmount: dto.fineAmount,
      description: dto.description,
      recordedByUserId: "01010033445",
      recordedByOfficerName: dto.recordedByOfficerName || "المساعد نشوان عادل الوجيه",
      cameraRadarId: dto.cameraRadarId,
      paymentStatus: "Unpaid",
      createdAt: new Date().toISOString(),
    };

    this.trafficViolations.unshift(newViolation);
    this.saveTrafficViolations();

    this.recordAuditLog({
      action: `رصد وقيد مخالفة مرورية: ${newViolation.plateNumber} (${newViolation.violationType})`,
      actionType: "create",
      entityName: "الإدارة العامة للمرور - الضبط الميداني",
      entityId: newViolation.plateNumber,
      userFullName: "المساعد نشوان عادل الوجيه",
      userNationalNumber: "01010033445",
      userRole: "TrafficOfficer",
      ipAddress: "192.168.1.10",
      status: "Warning",
      details: `تم قيد مخالفة [${newViolation.violationType}] على المركبة [${newViolation.plateNumber}] في [${newViolation.location}] بغرامة [${newViolation.fineAmount} ريال].`,
    });

    return newViolation;
  }

  public payTrafficViolation(dto: PayViolationDto): TrafficViolation {
    this.init();
    const v = this.trafficViolations.find((vi) => vi.id === dto.violationId);
    if (!v) throw new Error("المخالفة غير موجودة.");

    v.paymentStatus = "Paid";
    v.paidAt = new Date().toISOString();
    v.paymentReference = dto.referenceNumber || `PAY-TRF-${Date.now().toString().slice(-6)}`;
    this.saveTrafficViolations();

    this.recordAuditLog({
      action: `سداد وتسوية مخالفة مرورية: ${v.plateNumber}`,
      actionType: "update",
      entityName: "الإدارة العامة للمرور - التحصيل الإلكتروني",
      entityId: v.plateNumber,
      userFullName: "المساعد نشوان عادل الوجيه",
      userNationalNumber: "01010033445",
      userRole: "TrafficOfficer",
      ipAddress: "192.168.1.10",
      status: "Success",
      details: `تم سداد المخالفة رقم [${v.id}] بمبلغ [${v.fineAmount} ريال] برقم مرجعي [${v.paymentReference}].`,
    });

    return v;
  }

  private saveTrafficViolations(): void {
    setStored(STORAGE_KEYS.TRAFFIC_VIOLATIONS, this.trafficViolations);
  }

  public getTrafficDirectorMetrics(): TrafficDirectorMetrics {
    this.init();
    const unpaid = this.trafficViolations.filter((v) => v.paymentStatus === "Unpaid").length;
    return {
      totalRegisteredVehicles: this.vehicles.length + 842100,
      totalActiveDrivingLicenses: this.drivingLicenses.length + 612400,
      todayViolationsCount: this.trafficViolations.length + 842,
      todayRevenueCollected: 14850000,
      unpaidViolationsCount: unpaid + 1420,
      activePatrolsCount: 48,
      topViolationTypes: [
        { type: "تجاوز السرعة المقررة (رادار)", count: 420, percentage: 46 },
        { type: "قطع الإشارة الضوئية", count: 215, percentage: 24 },
        { type: "الوقوف الخاطئ والممنوع", count: 160, percentage: 18 },
        { type: "استخدام الهاتف أثناء القيادة", count: 110, percentage: 12 },
      ],
      branchIssuanceStats: [
        { branchName: "مرور أمانة العاصمة - الحصبة", governorate: "أمانة العاصمة", licensesToday: 184, violationsToday: 320 },
        { branchName: "مرور عدن - خور مكسر", governorate: "عدن", licensesToday: 112, violationsToday: 180 },
        { branchName: "مرور تعز - الحوبان", governorate: "تعز", licensesToday: 95, violationsToday: 140 },
        { branchName: "مرور حضرموت - المكلا", governorate: "حضرموت", licensesToday: 68, violationsToday: 85 },
      ],
    };
  }

  // ======================== Medical Records (Module 4) ========================

  public getMedicalRecords(search?: string): MedicalRecord[] {
    this.init();
    if (!search || !search.trim()) return this.medicalRecords;
    const q = search.trim().toLowerCase();
    return this.medicalRecords.filter(
      (m) =>
        m.patientFullName.toLowerCase().includes(q) ||
        m.patientNationalNumber.includes(q) ||
        m.hospitalName.toLowerCase().includes(q)
    );
  }

  public getMedicalRecordByNationalNumber(nid: string): MedicalRecord | null {
    this.init();
    const clean = nid.trim();
    return this.medicalRecords.find((m) => m.patientNationalNumber === clean) || null;
  }

  public addDiagnosis(dto: AddDiagnosisDto): MedicalRecord {
    this.init();
    const nid = dto.patientNationalNumber || (this.medicalRecords[0]?.patientNationalNumber ?? "1010023456");
    let record = this.getMedicalRecordByNationalNumber(nid);
    if (!record) {
      const citizen = this.getCitizenByNationalNumber(nid);
      record = {
        id: generateUUID(),
        personId: citizen?.id || generateUUID(),
        patientNationalNumber: nid,
        patientFullName: citizen?.fullName || "مريض",
        patientGender: citizen?.gender || "ذكر",
        patientDateOfBirth: citizen?.dateOfBirth || "1990-01-01",
        bloodGroup: "O+",
        allergies: [],
        organizationBranchId: "22222222-bbbb-cccc-dddd-000000000003",
        hospitalName: "هيئة مستشفى الثورة العام النموذجي - صنعاء",
        isVisibleToPerson: true,
        diagnoses: [],
        operations: [],
        chronicDiseases: [],
        createdAt: new Date().toISOString(),
      };
      this.medicalRecords.push(record);
    }

    const newDiag: MedicalDiagnosis = {
      id: generateUUID(),
      medicalRecordId: record.id,
      diagnosisName: dto.diagnosisName,
      icdCode: dto.icdCode,
      description: dto.description,
      doctorName: dto.doctorName,
      diagnosedAt: new Date().toISOString().split("T")[0],
      treatmentPlan: dto.treatmentPlan,
      status: dto.status,
      hospitalName: dto.hospitalName,
    };

    record.diagnoses.unshift(newDiag);
    this.saveMedicalRecords();

    this.recordAuditLog({
      action: `إضافة تشخيص طبي: ${record.patientFullName} (${dto.diagnosisName})`,
      actionType: "create",
      entityName: "السجل الطبي الموحد - العيادات",
      entityId: record.patientNationalNumber,
      userFullName: dto.doctorName || "د. سامي فؤاد المنصوب",
      userNationalNumber: "01010000001",
      userRole: "Doctor",
      ipAddress: "192.168.1.50",
      status: "Success",
      details: `تم توثيق تشخيص طبي جديد [${dto.diagnosisName}] للمريض [${record.patientFullName}].`,
    });

    return record;
  }

  public addOperation(dto: AddOperationDto): MedicalRecord {
    this.init();
    const nid = dto.patientNationalNumber || (this.medicalRecords[0]?.patientNationalNumber ?? "1010023456");
    let record = this.getMedicalRecordByNationalNumber(nid);
    if (!record) {
      record = this.medicalRecords[0];
    }
    if (!record) throw new Error("السجل الطبي للمريض غير موجود.");

    const newOp: MedicalOperation = {
      id: generateUUID(),
      medicalRecordId: record.id,
      operationName: dto.operationName,
      operationDate: dto.operationDate,
      surgeonName: dto.surgeonName,
      hospitalName: dto.hospitalName,
      anesthesiaType: dto.anesthesiaType,
      complications: dto.complications,
      notes: dto.notes,
    };

    record.operations.unshift(newOp);
    this.saveMedicalRecords();

    this.recordAuditLog({
      action: `تسجيل عملية جراحية: ${record.patientFullName} (${dto.operationName})`,
      actionType: "create",
      entityName: "السجل الطبي الموحد - العمليات",
      entityId: record.patientNationalNumber,
      userFullName: dto.surgeonName,
      userNationalNumber: "01010000001",
      userRole: "Surgeon",
      ipAddress: "192.168.1.50",
      status: "Success",
      details: `تم تسجيل عملية جراحية [${dto.operationName}] بمستشفى [${dto.hospitalName}].`,
    });

    return record;
  }

  public addChronicDisease(dto: AddChronicDiseaseDto): MedicalRecord {
    this.init();
    const nid = dto.patientNationalNumber || (this.medicalRecords[0]?.patientNationalNumber ?? "1010023456");
    let record = this.getMedicalRecordByNationalNumber(nid);
    if (!record) {
      record = this.medicalRecords[0];
    }
    if (!record) throw new Error("السجل الطبي للمريض غير موجود.");

    const newDisease: ChronicDisease = {
      id: generateUUID(),
      medicalRecordId: record.id,
      diseaseName: dto.diseaseName,
      icdCode: dto.icdCode,
      diagnosedDate: dto.diagnosedDate,
      status: dto.status,
      severity: dto.severity,
      treatingDoctor: dto.treatingDoctor,
      medications: dto.medications,
    };

    record.chronicDiseases.unshift(newDisease);
    this.saveMedicalRecords();
    return record;
  }

  public toggleRecordVisibility(dto: ToggleVisibilityDto): MedicalRecord {
    this.init();
    const record = this.medicalRecords.find((m) => m.id === dto.recordId);
    if (!record) throw new Error("السجل الطبي غير موجود.");

    record.isVisibleToPerson = dto.isVisible;
    this.saveMedicalRecords();

    this.recordAuditLog({
      action: `تعديل خصوصية السجل الطبي: ${record.patientFullName}`,
      actionType: "update",
      entityName: "السجل الطبي الموحد - إعدادات الخصوصية",
      entityId: record.patientNationalNumber,
      userFullName: "د. عادل محمد الأغبري",
      userNationalNumber: "01010041289",
      userRole: "HospitalAdmin",
      ipAddress: "192.168.1.50",
      status: "Warning",
      details: `تم ${dto.isVisible ? "إظهار" : "إخفاء"} السجل الطبي للمريض في تطبيق هويتي الشخصي.`,
    });

    return record;
  }

  private saveMedicalRecords(): void {
    setStored(STORAGE_KEYS.MEDICAL_RECORDS, this.medicalRecords);
  }

  public getHospitalDashboardMetrics(): HospitalDashboardMetrics {
    this.init();
    return {
      registeredVitalEventsCount: this.vitalEvents.length + 1248,
      monthlyBirthsCount: 1102,
      monthlyDeathsCount: 146,
      activeDoctorsCount: 342,
      totalAuthorizedStaff: 420,
      accessLogsCount: 8930,
      activeInpatients: 184,
      icuOccupancyPercentage: 82,
      recentAccessLogs: [
        { id: "log-1", doctorName: "د. سامي فؤاد المنصوب", action: "استعراض السجل الشامل", patientName: "هشام عبدالله عبدالرحمن الأغبري", patientId: "01010000001", timestamp: "منذ 5 دقائق" },
        { id: "log-2", doctorName: "د. جميلة عبدالكريم الصبري", action: "تحديث تشخيص باطني", patientName: "فاطمة علي حسين الصبري", patientId: "01010000002", timestamp: "منذ 18 دقيقة" },
        { id: "log-3", doctorName: "د. وليد عمر باحشوان", action: "وصفة علاجية مزمنة", patientName: "طارق محمد عوض بافضل", patientId: "01010000003", timestamp: "منذ 34 دقيقة" },
        { id: "log-4", doctorName: "د. ماجد علي شرف الدين", action: "استعراض طوارئ محدود", patientName: "سارة أحمد قاسم المنصوري", patientId: "01010000004", timestamp: "منذ 1 ساعة" },
      ],
    };
  }
}

// Export singleton instance
export const mockStore = new MockStoreManager();
