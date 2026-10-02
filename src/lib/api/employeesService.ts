/**
 * Huwiyati - Employees Management API Service (Real ASP.NET Core Backend)
 * Integrates with /api/v1/Employees
 * Requires Admin Role (Authorization: Bearer <token>)
 */

import { apiClient } from "./client";
import { Employee } from "@/types/admin";

export interface BackendEmployeeDto {
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

export interface EmployeesFetchResult {
  isSuccess: boolean;
  employees: Employee[];
  branchName?: string;
  organizationName?: string;
  branchId?: string;
  message?: string;
}

function getRoleLabel(orgName?: string): string {
  if (!orgName) return "موظف مختص";
  if (orgName.includes("الأحوال") || orgName.includes("المدنية")) return "موظف أحوال مدنية";
  if (orgName.includes("الجوازات") || orgName.includes("الهجرة")) return "ضابط جوازات ومنافذ";
  if (orgName.includes("المرور") || orgName.includes("السير")) return "ضابط شرطة سير";
  if (orgName.includes("المستشفى") || orgName.includes("الصحة")) return "كادر صحي وسريري";
  return "موظف مختص";
}

function mapBackendEmployee(dto: BackendEmployeeDto): Employee {
  return {
    id: dto.employeeId,
    userId: dto.userId,
    branchId: dto.branchId,
    branchName: dto.branchName,
    organizationId: "",
    organizationName: dto.organizationName,
    employeeNumber: dto.employeeNumber,
    nationalNumber: dto.nationalNumber,
    fullName: dto.fullName || dto.nationalNumber,
    email: dto.email || "",
    phoneNumber: dto.phoneNumber || "",
    role: "EMPLOYEE",
    roleLabel: getRoleLabel(dto.organizationName),
    isActive: dto.isActive,
    accountStatus: dto.isActive ? "Active" : "Suspended",
    createdAt: dto.createdAt,
  };
}

class EmployeesService {
  /**
   * Fetch all employees in current Admin's branch.
   * Backend uses the token UserId to strictly resolve the Admin's BranchId.
   */
  async getEmployees(): Promise<EmployeesFetchResult> {
    try {
      const res = await apiClient.get<BackendEmployeeDto[]>("/api/v1/Employees");
      const list = res.data ?? [];
      const employees = list.map(mapBackendEmployee);

      const first = list[0];
      return {
        isSuccess: true,
        employees,
        branchName: first?.branchName,
        organizationName: first?.organizationName,
        branchId: first?.branchId,
        message: res.message,
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error("[EmployeesService] getEmployees failed:", err);
      return {
        isSuccess: false,
        employees: [],
        message: errMsg || "فشل جلب موظفي الفرع من الخادم.",
      };
    }
  }

  /**
   * Fetch single employee details by ID from current Admin's branch.
   */
  async getEmployeeById(employeeId: string): Promise<{ isSuccess: boolean; employee?: Employee; message?: string }> {
    try {
      const res = await apiClient.get<BackendEmployeeDto>(`/api/v1/Employees/${employeeId}`);
      if (res.isSuccess && res.data) {
        return {
          isSuccess: true,
          employee: mapBackendEmployee(res.data),
          message: res.message,
        };
      }
      return {
        isSuccess: false,
        message: res.message || "لم يتم العثور على بيانات الموظف في هذا الفرع.",
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error("[EmployeesService] getEmployeeById failed:", err);
      return {
        isSuccess: false,
        message: errMsg || "فشل جلب تفاصيل الموظف من الخادم.",
      };
    }
  }

  /**
   * Assign an existing citizen as an employee to current Admin's branch.
   * Backend requires only `nationalNumber`. Branch and EmployeeNumber are resolved automatically.
   */
  async assignEmployee(nationalNumber: string): Promise<{ isSuccess: boolean; employee?: Employee; message: string }> {
    try {
      const res = await apiClient.post<BackendEmployeeDto>("/api/v1/Employees", {
        nationalNumber: nationalNumber.trim(),
      });

      if (res.isSuccess && res.data) {
        return {
          isSuccess: true,
          employee: mapBackendEmployee(res.data),
          message: res.message || "تم تعيين الموظف وإصدار الرقم الوظيفي بنجاح.",
        };
      }

      return {
        isSuccess: false,
        message: res.message || "فشل تعيين الموظف.",
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error("[EmployeesService] assignEmployee failed:", err);
      let msg = errMsg || "حدث خطأ أثناء تعيين الموظف.";
      if (msg.includes("not found")) {
        msg = "المواطن غير مسجل في السجل المدني.";
      } else if (msg.includes("active user account")) {
        msg = "المواطن ليس لديه حساب مستخدم نشط في النظام.";
      } else if (msg.includes("already assigned")) {
        msg = "هذا المواطن معين مسبقاً كموظف أو مدير في أحد الفروع.";
      }
      return {
        isSuccess: false,
        message: msg,
      };
    }
  }

  /**
   * Deactivate an employee in the Admin's branch
   */
  async deactivateEmployee(employeeId: string): Promise<{ isSuccess: boolean; message: string }> {
    try {
      const res = await apiClient.delete<void>(`/api/v1/Employees/${employeeId}`);
      return {
        isSuccess: res.isSuccess,
        message: res.message || "تم تعطيل حساب الموظف بنجاح.",
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error("[EmployeesService] deactivateEmployee failed:", err);
      return {
        isSuccess: false,
        message: errMsg || "فشل تعطيل حساب الموظف.",
      };
    }
  }

  /**
   * Activate an employee in the Admin's branch
   */
  async activateEmployee(employeeId: string): Promise<{ isSuccess: boolean; message: string }> {
    try {
      const res = await apiClient.post<void>(`/api/v1/Employees/${employeeId}/activate`, {});
      return {
        isSuccess: res.isSuccess,
        message: res.message || "تم تنشيط حساب الموظف بنجاح.",
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error("[EmployeesService] activateEmployee failed:", err);
      return {
        isSuccess: false,
        message: errMsg || "فشل تنشيط حساب الموظف.",
      };
    }
  }

  /**
   * Transfer employee to a new branch
   */
  async transferEmployee(employeeId: string, newBranchId: string): Promise<{ isSuccess: boolean; message: string }> {
    try {
      const res = await apiClient.put<BackendEmployeeDto>(`/api/v1/Employees/${employeeId}`, {
        employeeId,
        newBranchId,
      });
      return {
        isSuccess: res.isSuccess,
        message: res.message || "تم نقل الموظف للفرع الجديد بنجاح.",
      };
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error("[EmployeesService] transferEmployee failed:", err);
      return {
        isSuccess: false,
        message: errMsg || "فشل نقل الموظف.",
      };
    }
  }
}

export const employeesService = new EmployeesService();
