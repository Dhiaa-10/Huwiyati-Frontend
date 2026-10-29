"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth, AgencyType, RoleType } from "@/context/AuthContext";
import { getToken, isTokenValid } from "@/lib/api/authService";

export type PortalType = "admin" | "civil-registry" | "passports" | "traffic" | "hospitals";

interface PortalGuardResult {
  isChecking: boolean;
  isAuthorized: boolean;
}

/** Mapping each agency to its corresponding portal route */
const AGENCY_PORTAL_MAP: Record<AgencyType, PortalType> = {
  "وزارة الداخلية": "admin",
  "الأحوال المدنية": "civil-registry",
  "الجوازات": "passports",
  "المرور": "traffic",
  "المستشفيات": "hospitals",
};

/** Get the primary landing route for an agency */
export function getAgencyHomeRoute(agency: AgencyType, role: RoleType): string {
  if (role === "SUPER_ADMIN") return "/admin";
  switch (agency) {
    case "الأحوال المدنية":
      return role === "ADMIN" ? "/civil-registry" : "/civil-registry/activations";
    case "الجوازات":
      return role === "ADMIN" ? "/passports" : "/passports/requests";
    case "المرور":
      return role === "ADMIN" ? "/traffic" : "/traffic/violations";
    case "المستشفيات":
      return role === "ADMIN" ? "/hospitals" : "/hospitals/records";
    default:
      return "/login";
  }
}

/**
 * usePortalGuard - Strict Client-side Route Guard for Portal Layouts
 * Enforces role isolation, agency boundary validation, and token freshness.
 */
export function usePortalGuard(targetPortal: PortalType): PortalGuardResult {
  const router = useRouter();
  const { user, isAuthenticated, isInitialized } = useAuth();
  const [isAuthorized, setIsAuthorized] = useState<boolean>(false);

  useEffect(() => {
    if (!isInitialized) return;

    const token = getToken();

    // 1. Basic Auth check
    if (!isAuthenticated || !token || !isTokenValid(token) || user.role === "NONE") {
      setIsAuthorized(false);
      router.replace("/login");
      return;
    }

    // 2. SuperAdmin Boundary check
    if (user.role === "SUPER_ADMIN") {
      if (targetPortal === "admin") {
        setIsAuthorized(true);
        return;
      }
      // SuperAdmin accessing operational agency portal
      if (user.loginSource === "super_admin_switch") {
        setIsAuthorized(true);
        return;
      }
      // Otherwise keep SuperAdmin in the national control panel
      setIsAuthorized(false);
      router.replace("/admin");
      return;
    }

    // 3. Admin / Employee Boundary check
    // Operational staff must NEVER access the sovereign /admin portal
    if (targetPortal === "admin") {
      setIsAuthorized(false);
      const home = getAgencyHomeRoute(user.agency, user.role);
      router.replace(home);
      return;
    }

    // Operational staff must ONLY access their assigned agency's portal
    const allowedPortal = AGENCY_PORTAL_MAP[user.agency];
    if (allowedPortal !== targetPortal) {
      setIsAuthorized(false);
      const home = getAgencyHomeRoute(user.agency, user.role);
      router.replace(home);
      return;
    }

    // All checks passed!
    setIsAuthorized(true);
  }, [user.role, user.agency, user.loginSource, isAuthenticated, isInitialized, targetPortal, router]);

  return {
    isChecking: !isInitialized || !isAuthorized,
    isAuthorized,
  };
}
