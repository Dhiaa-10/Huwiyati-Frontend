"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type RoleType = "SUPER_ADMIN" | "ADMIN" | "EMPLOYEE";
export type AgencyType = "الأحوال المدنية" | "الجوازات" | "المرور" | "المستشفيات" | "وزارة الداخلية";

export interface UserSession {
  fullName: string;
  nationalNumber: string;
  role: RoleType;
  agency: AgencyType;
  branchName: string;
  branchId: string;
  jobTitle: string;
  /**
   * "login_page"        → user authenticated via the login screen
   *                       → portal navigation is LOCKED to their own portal
   * "super_admin_switch" → SuperAdmin jumped into this portal from the admin panel
   *                       → full cross-portal switcher is available
   */
  loginSource: "login_page" | "super_admin_switch";
}

interface AuthContextType {
  user: UserSession;
  setRole: (role: RoleType) => void;
  setAgency: (agency: AgencyType) => void;
  updateSession: (partial: Partial<UserSession>) => void;
  logout: () => void;
}

const STORAGE_KEY = "hwyati_auth_session";

const DEFAULT_USER: UserSession = {
  fullName: "ضياء محمد عبدالمجيد السالمي",
  nationalNumber: "01011131317",
  role: "SUPER_ADMIN",
  agency: "وزارة الداخلية",
  branchName: "المركز الوطني لتقنية المعلومات - ديوان الوزارة",
  branchId: "22222222-bbbb-cccc-dddd-000000000001",
  jobTitle: "مشرف عام المنظومة الوطنية (سوبر أدمن)",
  loginSource: "login_page",
};

export const getProfileForRoleAndAgency = (role: RoleType, agency: AgencyType) => {
  if (role === "SUPER_ADMIN") {
    return {
      fullName: "ضياء محمد عبدالمجيد السالمي",
      nationalNumber: "01011131317",
      agency: "وزارة الداخلية" as AgencyType,
      jobTitle: "مشرف عام المنظومة الوطنية (سوبر أدمن)",
      branchName: "المركز الوطني لتقنية المعلومات - ديوان الوزارة",
    };
  }

  if (role === "ADMIN") {
    switch (agency) {
      case "الجوازات":
        return {
          fullName: "العميد فؤاد منصور العريقي",
          nationalNumber: "01010025671",
          agency,
          jobTitle: "مدير عام مصلحة الهجرة والجوازات - فرع الأمانة",
          branchName: "الفرع الرئيسي - صنعاء",
        };
      case "المرور":
        return {
          fullName: "العقيد ركن نبيل قاسم الصبري",
          nationalNumber: "01010034890",
          agency,
          jobTitle: "مدير عام الإدارة العامة لمرور أمانة العاصمة",
          branchName: "مرور أمانة العاصمة - الحصبة",
        };
      case "المستشفيات":
        return {
          fullName: "د. عادل محمد الأغبري",
          nationalNumber: "01010041289",
          agency,
          jobTitle: "مدير عام المنظومة الطبية والربط المركزي",
          branchName: "هيئة مستشفى الثورة العام النموذجي - صنعاء",
        };
      default:
        return {
          fullName: "اللواء د. هاشم محمد الوادعي",
          nationalNumber: "01010019842",
          agency: "الأحوال المدنية" as AgencyType,
          jobTitle: "مدير عام الأحوال المدنية والسجل المدني - فرع الأمانة",
          branchName: "فرع عصر - أمانة العاصمة",
        };
    }
  }

  // EMPLOYEE
  switch (agency) {
    case "الجوازات":
      return {
        fullName: "الرائد خالد يحيى العريقي",
        nationalNumber: "01010022334",
        agency,
        jobTitle: "ضابط فحص واعتماد الجوازات - كاونتر 2",
        branchName: "صالة إصدار وتجديد الجوازات",
      };
    case "المرور":
      return {
        fullName: "المساعد نشوان عادل الوجيه",
        nationalNumber: "01010033445",
        agency,
        jobTitle: "ضابط فحص رخص القيادة وكروت الملكية",
        branchName: "وحدة الضبط المروري وإصدار الرخص",
      };
    case "المستشفيات":
      return {
        fullName: "د. مريم عبدالرحمن القاضي",
        nationalNumber: "01010044556",
        agency,
        jobTitle: "طبيبة استقبال ومسؤولة السجل الطبي (EHR)",
        branchName: "العيادات الخارجية والسجل الطبي الموحد",
      };
    default:
      return {
        fullName: "ملازم أول أمين عبدالله الحيمي",
        nationalNumber: "01010048123",
        agency: "الأحوال المدنية" as AgencyType,
        jobTitle: "موظف كاونتر وتفعيل بيومتري حضوري",
        branchName: "صالة التفعيل الحضوري والتحقق البيومتري",
      };
  }
};

const AuthContext = createContext<AuthContextType>({
  user: DEFAULT_USER,
  setRole: () => {},
  setAgency: () => {},
  updateSession: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession>(DEFAULT_USER);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        if (stored) {
          setUser(JSON.parse(stored));
        }
      } catch (e) {
        console.error("Failed to load auth session", e);
      }
    }
  }, []);

  const saveUser = (newUser: UserSession) => {
    setUser(newUser);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      } catch (e) {
        console.error("Failed to save auth session", e);
      }
    }
  };

  const setRole = (newRole: RoleType) => {
    const profile = getProfileForRoleAndAgency(newRole, user.agency);
    const updated: UserSession = {
      ...user,
      role: newRole,
      fullName: profile.fullName,
      nationalNumber: profile.nationalNumber,
      jobTitle: profile.jobTitle,
      branchName: profile.branchName,
      agency: profile.agency,
    };
    saveUser(updated);
  };

  const setAgency = (newAgency: AgencyType) => {
    const profile = getProfileForRoleAndAgency(user.role, newAgency);
    const updated: UserSession = {
      ...user,
      agency: newAgency,
      fullName: profile.fullName,
      nationalNumber: profile.nationalNumber,
      jobTitle: profile.jobTitle,
      branchName: profile.branchName,
    };
    saveUser(updated);
  };

  const updateSession = (partial: Partial<UserSession>) => {
    const updated = { ...user, ...partial };
    saveUser(updated);
  };

  const logout = () => {
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem("hwyati_auth_token");
    }
    setUser(DEFAULT_USER);
  };

  return (
    <AuthContext.Provider value={{ user, setRole, setAgency, updateSession, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
