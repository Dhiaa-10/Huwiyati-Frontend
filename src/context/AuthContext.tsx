"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import {
  getToken,
  saveToken,
  saveRefreshToken,
  clearAuthStorage,
  decodeToken,
  isTokenValid,
  tryRefreshSession,
} from "@/lib/api/authService";

// ─── Types ───────────────────────────────────────────────────────────────────

export type RoleType = "SUPER_ADMIN" | "ADMIN" | "EMPLOYEE" | "NONE";
export type AgencyType =
  | "الأحوال المدنية"
  | "الجوازات"
  | "المرور"
  | "المستشفيات"
  | "وزارة الداخلية";

export interface UserSession {
  /** Full name from the civil registry (JWT fullName claim) */
  fullName: string;
  /** National number (JWT name claim) */
  nationalNumber: string;
  /** Resolved frontend role */
  role: RoleType;
  /** Resolved government agency */
  agency: AgencyType;
  /** Branch name (resolved after login from employees API or service-centers-lookup) */
  branchName: string;
  /** Branch GUID from JWT BranchId claim (real backend value) */
  branchId: string;
  /** Organization GUID from JWT OrganizationId claim */
  organizationId: string;
  /** Job title (resolved from organization name after login) */
  jobTitle: string;
  /**
   * "login_page"         → authenticated via login page; portal navigation LOCKED to own portal
   * "super_admin_switch" → SuperAdmin switched into a portal; full cross-portal switcher available
   */
  loginSource: "login_page" | "super_admin_switch";
}

interface AuthContextType {
  user: UserSession;
  isAuthenticated: boolean;
  isInitialized: boolean;
  updateSession: (partial: Partial<UserSession>) => void;
  logout: () => void;
  /** @deprecated Use updateSession directly. Kept for backward-compat. */
  setRole: (role: RoleType) => void;
  /** @deprecated Use updateSession directly. Kept for backward-compat. */
  setAgency: (agency: AgencyType) => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STORAGE_KEY = "hwyati_auth_session";

export const EMPTY_USER: UserSession = {
  fullName: "",
  nationalNumber: "",
  role: "NONE",
  agency: "وزارة الداخلية",
  branchName: "",
  branchId: "",
  organizationId: "",
  jobTitle: "",
  loginSource: "login_page",
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Maps a backend role string to our frontend RoleType.
 * Backend sends: "SuperAdmin" | "Admin" | "Employee"
 */
export function mapBackendRoleToFrontend(backendRole: string): RoleType {
  if (backendRole === "SuperAdmin") return "SUPER_ADMIN";
  if (backendRole === "Admin") return "ADMIN";
  if (backendRole === "Employee") return "EMPLOYEE";
  return "NONE";
}

/**
 * Derives the AgencyType from an organization name returned by the backend.
 * Used after fetching /api/v1/Employees or /api/v1/service-centers-lookup.
 */
export function resolveAgencyFromOrgName(orgName: string): AgencyType {
  if (orgName.includes("أحوال") || orgName.includes("مدني") || orgName.includes("السجل")) {
    return "الأحوال المدنية";
  }
  if (orgName.includes("جواز") || orgName.includes("هجرة") || orgName.includes("إقامة")) {
    return "الجوازات";
  }
  if (orgName.includes("مرور") || orgName.includes("سير")) {
    return "المرور";
  }
  if (orgName.includes("مستشف") || orgName.includes("صحة") || orgName.includes("طب")) {
    return "المستشفيات";
  }
  return "وزارة الداخلية";
}

/**
 * Derives a job title string from the resolved role and agency.
 * These are UI-display labels only; the authoritative data comes from the backend.
 */
export function resolveJobTitle(role: RoleType, agency: AgencyType): string {
  if (role === "SUPER_ADMIN") return "مشرف عام المنظومة الوطنية";
  if (role === "ADMIN") {
    switch (agency) {
      case "الأحوال المدنية": return "مدير فرع الأحوال المدنية";
      case "الجوازات":       return "مدير عام فرع الهجرة والجوازات";
      case "المرور":          return "مدير إدارة المرور";
      case "المستشفيات":     return "مدير عام المستشفى";
      default:                return "مدير فرع";
    }
  }
  // EMPLOYEE
  switch (agency) {
    case "الأحوال المدنية": return "موظف كاونتر وتفعيل بيومتري";
    case "الجوازات":        return "موظف فحص واعتماد الجوازات";
    case "المرور":           return "موظف الرخص والمخالفات المرورية";
    case "المستشفيات":      return "مسؤول السجل الطبي والمواليد";
    default:                 return "موظف خدمات";
  }
}

/**
 * @deprecated Legacy helper kept for components that still import it.
 * New code should read branchName / jobTitle from the JWT claims or the
 * /api/v1/Employees response instead of using this static lookup.
 */
export const getProfileForRoleAndAgency = (role: RoleType, agency: AgencyType) => {
  return {
    fullName: "",
    nationalNumber: "",
    agency,
    jobTitle: resolveJobTitle(role, agency),
    branchName: "",
  };
};

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType>({
  user: EMPTY_USER,
  isAuthenticated: false,
  isInitialized: false,
  updateSession: () => {},
  logout: () => {},
  setRole: () => {},
  setAgency: () => {},
});

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession>(EMPTY_USER);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // ── Hydrate session from localStorage on mount ───────────────────────────
  useEffect(() => {
    if (typeof window === "undefined") return;

    const init = async () => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        const token = getToken();

        if (!stored || !token) {
          // No session at all
          setUser(EMPTY_USER);
          setIsAuthenticated(false);
          return;
        }

        // Token still valid?
        if (isTokenValid(token)) {
          const parsed: UserSession = JSON.parse(stored);
          if (parsed && parsed.role && parsed.role !== "NONE") {
            setUser(parsed);
            setIsAuthenticated(true);
            return;
          }
        }

        // Token expired — try silent refresh
        const newToken = await tryRefreshSession();
        if (newToken) {
          // Re-read stored session (claims might have changed minimally)
          const parsed: UserSession = JSON.parse(stored);
          const decoded = decodeToken(newToken);
          // Patch branchId / organizationId from the fresh token
          const patched: UserSession = {
            ...parsed,
            branchId: decoded.branchId ?? parsed.branchId,
            organizationId: decoded.organizationId ?? parsed.organizationId,
          };
          saveSession(patched);
          setIsAuthenticated(true);
        } else {
          // Refresh failed — force re-login
          setUser(EMPTY_USER);
          setIsAuthenticated(false);
          window.localStorage.removeItem(STORAGE_KEY);
        }
      } catch (e) {
        console.error("[AuthContext] Failed to hydrate session:", e);
        setUser(EMPTY_USER);
        setIsAuthenticated(false);
      } finally {
        setIsInitialized(true);
      }
    };

    init();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Internal save helper ─────────────────────────────────────────────────
  const saveSession = (newUser: UserSession) => {
    setUser(newUser);
    const authed = newUser.role !== "NONE";
    setIsAuthenticated(authed);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
      } catch (e) {
        console.error("[AuthContext] Failed to persist session:", e);
      }
    }
  };

  // ── Public API ───────────────────────────────────────────────────────────

  const updateSession = (partial: Partial<UserSession>) => {
    const updated = { ...user, ...partial };
    saveSession(updated);
  };

  const logout = () => {
    clearAuthStorage();
    setUser(EMPTY_USER);
    setIsAuthenticated(false);
  };

  // Backward-compat shims
  const setRole = (newRole: RoleType) => {
    updateSession({ role: newRole, jobTitle: resolveJobTitle(newRole, user.agency) });
  };

  const setAgency = (newAgency: AgencyType) => {
    updateSession({ agency: newAgency, jobTitle: resolveJobTitle(user.role, newAgency) });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isInitialized,
        updateSession,
        logout,
        setRole,
        setAgency,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
