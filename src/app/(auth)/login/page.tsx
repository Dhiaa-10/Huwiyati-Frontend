"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Shield,
  Lock,
  User,
  Building2,
  Car,
  Plane,
  HeartPulse,
  BadgeAlert,
  ArrowLeft,
  ChevronDown,
  X,
  ShieldCheck,
  Loader2,
  KeyRound,
  CheckCircle2,
} from "lucide-react";
import { HwyatiLogo } from "@/components/ui/hwyati-logo";
import { useAuth, getProfileForRoleAndAgency } from "@/context/AuthContext";
import type { AgencyType, RoleType } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import {
  apiLogin,
  apiVerifyDevice,
  saveToken,
  saveAuthTokens,
  clearAuthStorage,
  getDeviceIdentifier,
  decodeRolesFromToken,
  decodeBranchIdFromToken,
  type LoginResult,
} from "@/lib/api/authService";
import { employeesService } from "@/lib/api/employeesService";
import { serviceRequestsService } from "@/lib/api/serviceRequestsService";
import { getApiBaseUrl } from "@/lib/api/client";

// ─── Helpers ──────────────────────────────────────────────────────────────────

type ActiveRoleType = Exclude<RoleType, "NONE">;

interface DemoAccount {
  role: ActiveRoleType;
  roleLabel: string;
  nationalNumber: string;
  name: string;
  agency: AgencyType;
  badgeColor: string;
  category: "admin" | "employee";
  branchId?: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  // ══════════════════════════════════════════════════════════════════
  // حسابات الإدارة والمشرفين
  // ══════════════════════════════════════════════════════════════════
  {
    role: "SUPER_ADMIN",
    roleLabel: "سوبر أدمن",
    nationalNumber: "01011135650",
    name: "مصعب محمد أحمد ناشر النجري",
    agency: "وزارة الداخلية",
    badgeColor: "bg-[#E6F1EE] text-[#052F31] border-[#BFE5DF]",
    category: "admin",
  },
  {
    role: "ADMIN",
    roleLabel: "أدمن الأحوال المدنية",
    nationalNumber: "01011135651",
    name: "أحمد محمود علي المدير",
    agency: "الأحوال المدنية",
    branchId: "018f7d9a-2000-7000-8000-000000000002",
    badgeColor: "bg-[#E6F1EE] text-[#147A77] border-[#BFE5DF]",
    category: "admin",
  },
  {
    role: "ADMIN",
    roleLabel: "أدمن المستشفيات",
    nationalNumber: "01011200001",
    name: "يوسف حمود عبده المخلافي",
    agency: "المستشفيات",
    branchId: "018f7d9a-2000-7000-8000-000000000003",
    badgeColor: "bg-[#EAF4FB] text-[#437CA4] border-[#BCE0F7]",
    category: "admin",
  },
  {
    role: "ADMIN",
    roleLabel: "أدمن الجوازات",
    nationalNumber: "01011200002",
    name: "وليد ناجي محمد القباطي",
    agency: "الجوازات",
    branchId: "018f7d9a-2000-7000-8000-000000000005",
    badgeColor: "bg-[#E6F1EE] text-[#147A77] border-[#BFE5DF]",
    category: "admin",
  },
  {
    role: "ADMIN",
    roleLabel: "أدمن المرور",
    nationalNumber: "01011200003",
    name: "عمر فارع سالم الحمادي",
    agency: "المرور",
    branchId: "018f7d9a-2000-7000-8000-000000000001",
    badgeColor: "bg-[#FFF3D8] text-[#9A762D] border-[#FCE1A8]",
    category: "admin",
  },

  // ══════════════════════════════════════════════════════════════════
  // حسابات الموظفين التنفيذيين
  // ══════════════════════════════════════════════════════════════════
  {
    role: "EMPLOYEE",
    roleLabel: "موظف الأحوال المدنية",
    nationalNumber: "01011200007",
    name: "سارة عبد المجيد محمد السالمي",
    agency: "الأحوال المدنية",
    branchId: "018f7d9a-2000-7000-8000-000000000001",
    badgeColor: "bg-[#E6F1EE] text-[#147A77] border-[#BFE5DF]",
    category: "employee",
  },
  {
    role: "EMPLOYEE",
    roleLabel: "موظف المستشفيات",
    nationalNumber: "01011200004",
    name: "ريم طارق عبد الله الدهمشي",
    agency: "المستشفيات",
    branchId: "018f7d9a-2000-7000-8000-000000000003",
    badgeColor: "bg-[#EAF4FB] text-[#437CA4] border-[#BCE0F7]",
    category: "employee",
  },
  {
    role: "EMPLOYEE",
    roleLabel: "موظف الجوازات",
    nationalNumber: "01011200005",
    name: "باسل أمين خالد الشرعبي",
    agency: "الجوازات",
    branchId: "018f7d9a-2000-7000-8000-000000000005",
    badgeColor: "bg-[#E6F1EE] text-[#147A77] border-[#BFE5DF]",
    category: "employee",
  },
  {
    role: "EMPLOYEE",
    roleLabel: "موظف المرور",
    nationalNumber: "01011200006",
    name: "منصور علي حسن الشوكاني",
    agency: "المرور",
    branchId: "018f7d9a-2000-7000-8000-000000000001",
    badgeColor: "bg-[#FFF3D8] text-[#9A762D] border-[#FCE1A8]",
    category: "employee",
  },
];


/** Map backend role string → our frontend RoleType */
function mapBackendRole(roles: string[]): ActiveRoleType {
  if (roles.some((r) => r === "SuperAdmin")) return "SUPER_ADMIN";
  if (roles.some((r) => r === "Admin")) return "ADMIN";
  return "EMPLOYEE";
}

/** Map frontend role type to backend role string expected by FluentValidation */
function toBackendRole(role: ActiveRoleType): string {
  if (role === "SUPER_ADMIN") return "SuperAdmin";
  if (role === "ADMIN") return "Admin";
  return "Employee";
}

/** Get authoritative backend branch ID for agency */
function getBranchIdForAgency(agency: AgencyType): string | undefined {
  switch (agency) {
    case "الجوازات":
      return "018f7d9a-2000-7000-8000-000000000005";
    case "المستشفيات":
      return "018f7d9a-2000-7000-8000-000000000003";
    case "المرور":
      return "018f7d9a-2000-7000-8000-000000000001";
    case "الأحوال المدنية":
      return "018f7d9a-2000-7000-8000-000000000001";
    default:
      return "018f7d9a-2000-7000-8000-000000000001";
  }
}

/** Decide where to redirect after successful login — always redirects to dashboard for all accounts and levels */
function getRedirectPath(role: RoleType, agency: AgencyType): string {
  if (role === "SUPER_ADMIN") return "/admin";

  if (agency === "الجوازات") return "/passports";
  if (agency === "المستشفيات") return "/hospitals";
  if (agency === "المرور") return "/traffic";
  if (agency === "الأحوال المدنية") return "/civil-registry";

  return "/civil-registry";
}

// ─── Component ────────────────────────────────────────────────────────────────

type LoginStep = "credentials" | "device_otp";

export default function LoginPage() {
  const router = useRouter();
  const { updateSession } = useAuth();
  const { alert } = useNotification();

  // UI State
  const [role, setRole] = useState<ActiveRoleType>("SUPER_ADMIN");
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [agency, setAgency] = useState<AgencyType>("وزارة الداخلية");
  const [isAgencyOverlayOpen, setIsAgencyOverlayOpen] = useState(false);

  // Step: "credentials" or "device_otp"
  const [step, setStep] = useState<LoginStep>("credentials");

  // Form fields — strictly empty by default (no unwanted auto-fill)
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");

  // Pending device verification data
  const [pendingUserId, setPendingUserId] = useState("");
  const [pendingLoginResult, setPendingLoginResult] = useState<LoginResult | null>(null);

  // Loading / error
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Quick demo accounts filter & feedback
  const [demoFilter, setDemoFilter] = useState<"all" | "admin" | "employee">("all");
  const [filledAccountKey, setFilledAccountKey] = useState<string | null>(null);

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const roleConfig: Record<ActiveRoleType, { label: string; indicatorColor: string }> = {
    SUPER_ADMIN: { label: "سوبر أدمن", indicatorColor: "bg-[#052F31]" },
    ADMIN: { label: "أدمن", indicatorColor: "bg-[#0C4A4E]" },
    EMPLOYEE: { label: "موظف", indicatorColor: "bg-[#147A77]" },
  };

  const handleRoleSelect = (newRole: ActiveRoleType) => {
    setRole(newRole);
    setIsRoleMenuOpen(false);
    setErrorMessage("");
    // Keep identifier and password intact without auto-fill
    if (newRole === "SUPER_ADMIN") {
      setAgency("وزارة الداخلية");
    } else if (agency === "وزارة الداخلية") {
      setAgency("الأحوال المدنية");
    }
  };

  const handleAgencySelect = (selected: AgencyType) => {
    setAgency(selected);
    setIsAgencyOverlayOpen(false);
  };

  /** Complete the session after a successful authentication */
  const completeSession = async (result: LoginResult, expectedRole?: ActiveRoleType) => {
    // Persist JWT and Refresh Token
    saveAuthTokens(result.accessToken, result.refreshToken);

    // Decode actual backend roles from token
    const backendRoles = decodeRolesFromToken(result.accessToken);
    const tokenIsSuperAdmin = backendRoles.includes("SuperAdmin");
    const tokenIsAdmin      = backendRoles.includes("Admin");
    const tokenIsEmployee   = backendRoles.includes("Employee") || backendRoles.includes("Citizen");

    // ── STRICT ROLE CHECK ──────────────────────────────────────────────────────
    // The role the user explicitly selected in the UI MUST match what the backend token says.
    // This prevents SuperAdmin accounts from logging in as Employee/Admin and vice versa.
    const selectedRole = expectedRole ?? role;

    if (selectedRole === "SUPER_ADMIN" && !tokenIsSuperAdmin) {
      clearAuthStorage();
      setErrorMessage("هذا الحساب ليس سوبر أدمن. يرجى اختيار الرتبة الصحيحة من القائمة.");
      return;
    }
    if (selectedRole === "ADMIN" && !tokenIsAdmin) {
      clearAuthStorage();
      setErrorMessage("هذا الحساب ليس أدمناً. يرجى اختيار الرتبة الصحيحة (موظف / سوبر أدمن).");
      return;
    }
    if (selectedRole === "EMPLOYEE" && !tokenIsEmployee) {
      clearAuthStorage();
      setErrorMessage("هذا الحساب ليس حساب موظف. يرجى اختيار الرتبة الصحيحة.");
      return;
    }

    // ── RESOLVE AUTHORITATIVE ROLE ────────────────────────────────────────────
    // Now that validation passed, use the selected role as authoritative
    const resolvedRole: RoleType = selectedRole;

    // Resolve agency
    let resolvedAgency: AgencyType = agency;
    let actualBranchName = "";
    let actualBranchId = "";
    let actualJobTitle = "";

    if (resolvedRole === "SUPER_ADMIN") {
      resolvedAgency = "وزارة الداخلية";
      actualJobTitle = "مشرف عام المنظومة الوطنية (سوبر أدمن)";
      actualBranchName = "المركز الوطني لتقنية المعلومات - ديوان الوزارة";
      actualBranchId = "22222222-bbbb-cccc-dddd-000000000001";
    } else {
      // ── 1. FETCH REAL BRANCH DATA FOR ADMIN OR EMPLOYEE ───────────────────
      if (resolvedRole === "ADMIN") {
        try {
          const empRes = await employeesService.getEmployees();
          if (empRes.isSuccess) {
            // Try to find this specific user's employee record by nationalNumber
            const loginNationalNumber = result.nationalNumber || identifier.trim();
            const myRecord = empRes.employees.find(
              (e) => e.nationalNumber === loginNationalNumber
            );

            if (myRecord) {
              actualBranchName = myRecord.branchName || "";
              actualBranchId = myRecord.branchId || "";
            } else if (empRes.branchName) {
              actualBranchName = empRes.branchName;
              actualBranchId = empRes.branchId || "";
            }

            // Resolve agency from organizationName returned by backend
            const orgName = myRecord?.organizationName || empRes.organizationName || "";
            if (orgName.includes("أحوال") || orgName.includes("السجل المدني") || orgName.includes("المدنية")) {
              resolvedAgency = "الأحوال المدنية";
            } else if (orgName.includes("جوازات") || orgName.includes("هجرة") || orgName.includes("الجنسية")) {
              resolvedAgency = "الجوازات";
            } else if (orgName.includes("مرور") || orgName.includes("السير")) {
              resolvedAgency = "المرور";
            } else if (orgName.includes("مستشف") || orgName.includes("صحة") || orgName.includes("طب")) {
              resolvedAgency = "المستشفيات";
            } else if (agency && agency !== "وزارة الداخلية") {
              resolvedAgency = agency;
            }
          }
        } catch (e) {
          console.warn("[Login] Could not fetch real branch data for admin:", e);
        }
      } else if (resolvedRole === "EMPLOYEE") {
        // Decode authoritative branch from token first
        const tokenBranchId = decodeBranchIdFromToken(result.accessToken);
        if (tokenBranchId) {
          actualBranchId = tokenBranchId;
        } else {
          try {
            const requestsRes = await serviceRequestsService.getBranchServiceRequests({ pageSize: 1 });
            if (requestsRes.items && requestsRes.items.length > 0) {
              const firstReq = requestsRes.items[0];
              if (firstReq.branchName) {
                actualBranchName = firstReq.branchName;
              }
              if (firstReq.branchId) {
                actualBranchId = firstReq.branchId;
              }
            }
          } catch (e) {
            console.warn("[Login] Could not fetch branch requests for employee:", e);
          }
        }
      }

      // ── 2. DECODE BRANCH ID FROM TOKEN IF NOT YET RESOLVED ────────────────
      const tokenBranchId = decodeBranchIdFromToken(result.accessToken);
      if (!actualBranchId && tokenBranchId) {
        actualBranchId = tokenBranchId;
      }

      // ── 3. MAP SEEDED BRANCH NAMES AUTHORITATIVELY ────────────────────────
      const KNOWN_BRANCHES: Record<string, { name: string; agency: AgencyType }> = {
        "018f7d9a-2000-7000-8000-000000000001": {
          name: "مصلحة الأحوال المدنية - صنعاء (المركز الرئيسي)",
          agency: "الأحوال المدنية",
        },
        "018f7d9a-2000-7000-8000-000000000002": {
          name: "مصلحة الأحوال المدنية - عدن",
          agency: "الأحوال المدنية",
        },
        "018f7d9a-2000-7000-8000-000000000003": {
          name: "مستشفى الثورة العام",
          agency: "المستشفيات",
        },
        "018f7d9a-2000-7000-8000-000000000004": {
          name: "مستشفى الجمهوري التعليمي",
          agency: "المستشفيات",
        },
        "018f7d9a-2000-7000-8000-000000000005": {
          name: "مصلحة الهجرة والجوازات والجنسية - صنعاء",
          agency: "الجوازات",
        },
      };

      if (actualBranchId && KNOWN_BRANCHES[actualBranchId]) {
        if (!actualBranchName) {
          actualBranchName = KNOWN_BRANCHES[actualBranchId].name;
        }
        if (!resolvedAgency || resolvedAgency === "وزارة الداخلية") {
          resolvedAgency = KNOWN_BRANCHES[actualBranchId].agency;
        }
      }

      // ── 4. FALLBACK BY AGENCY IF STILL EMPTY ──────────────────────────────
      if (!actualBranchName) {
        if (agency && agency !== "وزارة الداخلية") resolvedAgency = agency;
        if (resolvedAgency === "الجوازات") {
          actualBranchName = "مصلحة الهجرة والجوازات والجنسية - صنعاء";
          actualBranchId = actualBranchId || "018f7d9a-2000-7000-8000-000000000005";
        } else if (resolvedAgency === "الأحوال المدنية") {
          actualBranchName = "مصلحة الأحوال المدنية - صنعاء (المركز الرئيسي)";
          actualBranchId = actualBranchId || "018f7d9a-2000-7000-8000-000000000001";
        } else if (resolvedAgency === "المرور") {
          actualBranchName = "إدارة شرطة السير والمرور - صنعاء";
          actualBranchId = actualBranchId || "018f7d9a-2000-7000-8000-000000000001";
        } else if (resolvedAgency === "المستشفيات") {
          actualBranchName = "مستشفى الثورة العام";
          actualBranchId = actualBranchId || "018f7d9a-2000-7000-8000-000000000003";
        }
      }

      // ── 5. SET JOB TITLE BASED ON ROLE AND AGENCY ─────────────────────────
      if (resolvedRole === "ADMIN") {
        if (resolvedAgency === "الجوازات") actualJobTitle = "مدير عام فرع الهجرة والجوازات";
        else if (resolvedAgency === "الأحوال المدنية") actualJobTitle = "مدير فرع الأحوال المدنية";
        else if (resolvedAgency === "المرور") actualJobTitle = "مدير إدارة المرور";
        else if (resolvedAgency === "المستشفيات") actualJobTitle = "مدير عام المستشفى";
        else actualJobTitle = "مدير الفرع";
      } else {
        if (resolvedAgency === "الجوازات") actualJobTitle = "موظف فحص واعتماد الجوازات";
        else if (resolvedAgency === "الأحوال المدنية") actualJobTitle = "موظف كاونتر وتفعيل بيومتري حضوري";
        else if (resolvedAgency === "المرور") actualJobTitle = "موظف الرخص والمخالفات";
        else if (resolvedAgency === "المستشفيات") actualJobTitle = "مسؤول السجل الطبي والمواليد";
        else actualJobTitle = "موظف مختص";
      }
    }

    const profile = getProfileForRoleAndAgency(resolvedRole, resolvedAgency);
    if (!actualBranchName) actualBranchName = profile.branchName;
    if (!actualJobTitle) actualJobTitle = profile.jobTitle;

    // Update AuthContext session with verified live data
    updateSession({
      fullName: result.fullName || profile.fullName,
      nationalNumber: result.nationalNumber || profile.nationalNumber,
      role: resolvedRole,
      agency: resolvedAgency,
      branchName: actualBranchName,
      branchId: actualBranchId,
      jobTitle: actualJobTitle,
      loginSource: "login_page",
    });

    const targetUrl = getRedirectPath(resolvedRole, resolvedAgency);
    router.push(targetUrl);
  };

  // ── Step 1: Login with credentials ──────────────────────────────────────────

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    // Fallback to DOM input values in case browser autofill or password manager filled inputs directly
    const form = e.currentTarget;
    const elements = form.elements as HTMLFormControlsCollection;
    const nationalNumberInput = elements.namedItem("nationalNumber") as HTMLInputElement | null;
    const passwordInput = elements.namedItem("password") as HTMLInputElement | null;

    const currentIdentifier = identifier.trim() || nationalNumberInput?.value.trim() || "";
    const currentPassword = password.trim() || passwordInput?.value.trim() || "";

    if (!currentIdentifier) {
      setErrorMessage("يرجى إدخال رقم الهوية الوطنية");
      return;
    }
    if (!currentPassword) {
      setErrorMessage("يرجى إدخال كلمة المرور");
      return;
    }

    if (currentIdentifier !== identifier) setIdentifier(currentIdentifier);
    if (currentPassword !== password) setPassword(currentPassword);

    setIsLoading(true);
    try {
      const deviceId = getDeviceIdentifier(currentIdentifier);
      const requestedBackendRole = toBackendRole(role);
      const matchingAccount = DEMO_ACCOUNTS.find(
        (a) => a.nationalNumber === currentIdentifier
      );
      const branchId =
        requestedBackendRole === "SuperAdmin"
          ? undefined
          : matchingAccount?.branchId || getBranchIdForAgency(agency);

      const res = await apiLogin({
        nationalNumber: currentIdentifier,
        password: currentPassword,
        requestedRole: requestedBackendRole,
        branchId: branchId,
        deviceIdentifier: deviceId,
        deviceName: "Huwiyati Web Portal",
        operatingSystem: typeof navigator !== "undefined" ? navigator.platform : "Web",
      });

      if (!res.isSuccess) {
        // Collect detailed validation errors if returned from backend
        const errorList = res.errors && res.errors.length > 0 ? res.errors.join("، ") : "";
        const msg = res.message ?? "فشل تسجيل الدخول. تحقق من بياناتك.";

        if (errorList) {
          setErrorMessage(`${msg} (${errorList})`);
        } else if (msg.includes("Invalid National Number or Password")) {
          setErrorMessage("رقم الهوية أو كلمة المرور غير صحيحة.");
        } else if (msg.includes("Access Denied: You do not possess")) {
          setErrorMessage("تم رفض الوصول: هذا الحساب لا يملك صلاحية الرتبة المطلوبة.");
        } else if (msg.includes("Branch ID is required")) {
          setErrorMessage("معرّف الفرع مطلوب لتسجيل دخول موظفي ومشرفي الفروع.");
        } else if (msg.includes("not assigned as an active staff member")) {
          setErrorMessage("تم رفض الوصول: الحساب غير مسجل كموظف نشط في هذا الفرع.");
        } else if (msg.includes("suspended")) {
          setErrorMessage("حسابك موقوف من قِبل الإدارة. يرجى مراجعة أحد مراكز الخدمة.");
        } else if (msg.includes("deactivated")) {
          setErrorMessage(
            "حسابك معطّل. يرجى طلب رمز إعادة التفعيل عبر خيار نسيت كلمة المرور."
          );
        } else {
          setErrorMessage(msg);
        }
        return;
      }

      const loginData = res.data!;

      // Case A: trusted device → direct login
      if (!loginData.requiresDeviceVerification) {
        await completeSession(loginData);
        return;
      }

      // Case B: new device → show OTP step
      setPendingUserId(loginData.userId);
      setPendingLoginResult(loginData);
      setStep("device_otp");
      setSuccessMessage(
        "جهاز جديد! تم إرسال رمز التحقق إلى بريدك الإلكتروني المسجّل. أدخله أدناه خلال 5 دقائق."
      );
    } catch (err) {
      setErrorMessage("تعذّر الاتصال بالخادم. تحقق من أن الباكند يعمل على المنفذ 5237.");
      console.error("[Login]", err);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Step 2: Verify device OTP ────────────────────────────────────────────────

  const handleDeviceVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!otpCode.trim() || otpCode.length < 6) {
      setErrorMessage("أدخل الرمز المكوّن من 6 أرقام.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiVerifyDevice({
        nationalNumber: identifier.trim(),
        deviceIdentifier: getDeviceIdentifier(identifier.trim()),
        code: otpCode.trim(),
      });

      if (!res.isSuccess || !res.data) {
        setErrorMessage(res.message ?? "رمز التحقق غير صحيح أو منتهي الصلاحية.");
        return;
      }

      await completeSession(res.data);
    } catch (err) {
      setErrorMessage("تعذّر التحقق من الرمز. حاول مرة أخرى.");
      console.error("[VerifyDevice]", err);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="bg-[#FBFBF8] min-h-screen flex flex-col items-center justify-center font-sans text-[#163D42] p-4 md:p-10 relative overflow-x-hidden">
      {/* Background Decorative Gradient Blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex justify-center items-center opacity-40">
        <div className="absolute w-[800px] h-[800px] bg-[#0C4A4E]/5 rounded-full blur-3xl -top-1/4 -right-1/4"></div>
        <div className="absolute w-[600px] h-[600px] bg-[#147A77]/5 rounded-full blur-3xl bottom-0 -left-1/4"></div>
      </div>

      {/* Role Selector — top left corner */}
      {step === "credentials" && (
        <div className="absolute top-6 left-6 z-20">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
              className="bg-white border border-[#E7EEEB] rounded-full py-2 px-4 flex items-center gap-2 shadow-xs hover:bg-[#F1F6F4] transition-colors cursor-pointer"
            >
              <div className={`w-3 h-3 rounded-full ${roleConfig[role].indicatorColor}`}></div>
              <span className="text-sm font-medium text-[#163D42]">{roleConfig[role].label}</span>
              <ChevronDown className="w-4 h-4 text-[#6D898A]" />
            </button>

            {isRoleMenuOpen && (
              <div className="absolute top-full mt-2 left-0 w-44 bg-white border border-[#E7EEEB] rounded-xl shadow-lg overflow-hidden py-1 z-30 animate-in fade-in slide-in-from-top-2">
                <button
                  type="button"
                  onClick={() => handleRoleSelect("SUPER_ADMIN")}
                  className="w-full text-right px-4 py-2.5 hover:bg-[#F1F6F4] text-sm text-[#163D42] flex items-center gap-2.5 cursor-pointer"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-[#052F31]"></div>
                  <span>سوبر أدمن</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelect("ADMIN")}
                  className="w-full text-right px-4 py-2.5 hover:bg-[#F1F6F4] text-sm text-[#163D42] flex items-center gap-2.5 cursor-pointer"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-[#0C4A4E]"></div>
                  <span>أدمن</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelect("EMPLOYEE")}
                  className="w-full text-right px-4 py-2.5 hover:bg-[#F1F6F4] text-sm text-[#163D42] flex items-center gap-2.5 cursor-pointer"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-[#147A77]"></div>
                  <span>موظف</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Login Card */}
      <main className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#E7EEEB] overflow-hidden z-10 relative">
        {/* Accent top stripe */}
        <div className="h-2 w-full bg-[#0C4A4E]"></div>

        <div className="p-8">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <HwyatiLogo size={64} showText={false} className="mb-4" />
            <h1 className="text-2xl font-bold text-[#0C4A4E] text-center tracking-tight font-arabic">
              Hawiyati
            </h1>
            <p className="text-sm text-[#456A6D] text-center mt-1">
              {step === "credentials"
                ? "بوابة تسجيل الدخول الموحدة"
                : "التحقق من الجهاز الجديد"}
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-[#FFF0E7] border border-[#FACDC0] text-xs text-[#B76648]">
              {errorMessage}
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-[#E5F7EE] border border-[#A8E2C7] text-xs text-[#126B58] flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-[#126B58]" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ── STEP 1: Credentials Form ── */}
          {step === "credentials" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Agency Selector */}
              {role === "SUPER_ADMIN" ? (
                <div>
                  <label className="block text-sm font-medium text-[#163D42] mb-1.5">
                    الجهة الحكومية
                  </label>
                  <div className="w-full bg-[#F1F6F4] border border-[#E7EEEB] rounded-xl py-3 px-4 flex items-center gap-2.5 text-[#163D42]">
                    <Shield className="w-5 h-5 text-[#0C4A4E]" />
                    <span className="text-sm font-semibold">وزارة الداخلية (نظام شامل)</span>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-[#163D42] mb-1.5">
                    الجهة الحكومية
                  </label>
                  <div
                    onClick={() => setIsAgencyOverlayOpen(true)}
                    className="relative cursor-pointer group"
                  >
                    <input
                      readOnly
                      type="text"
                      value={agency}
                      placeholder="اختر الجهة"
                      className="w-full bg-[#F1F6F4] border border-[#E7EEEB] rounded-xl py-3 px-4 pe-12 ps-10 focus:border-[#178A86] focus:ring-2 focus:ring-[#178A86]/20 transition-all text-sm text-[#163D42] cursor-pointer group-hover:border-[#147A77]"
                    />
                    <Building2 className="w-5 h-5 absolute end-4 top-1/2 -translate-y-1/2 text-[#6D898A]" />
                    <ChevronDown className="w-4 h-4 absolute start-4 top-1/2 -translate-y-1/2 text-[#6D898A]" />
                  </div>
                </div>
              )}

              {/* National Number */}
              <div>
                <label htmlFor="nationalNumber" className="block text-sm font-medium text-[#163D42] mb-1.5">
                  رقم الهوية الوطنية
                </label>
                <div className="relative">
                  <input
                    id="nationalNumber"
                    name="nationalNumber"
                    type="text"
                    required
                    autoComplete="username"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="أدخل رقم الهوية"
                    className="w-full bg-[#F1F6F4] border border-[#E7EEEB] rounded-xl py-3 px-4 pe-12 focus:border-[#178A86] focus:ring-2 focus:ring-[#178A86]/20 transition-all text-sm text-[#163D42] placeholder-[#6D898A]/60"
                  />
                  <User className="w-5 h-5 absolute end-4 top-1/2 -translate-y-1/2 text-[#6D898A]" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-[#163D42] mb-1.5">
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#F1F6F4] border border-[#E7EEEB] rounded-xl py-3 px-4 pe-12 focus:border-[#178A86] focus:ring-2 focus:ring-[#178A86]/20 transition-all text-sm text-[#163D42] placeholder-[#6D898A]/60"
                  />
                  <Lock className="w-5 h-5 absolute end-4 top-1/2 -translate-y-1/2 text-[#6D898A]" />
                </div>
                <div className="flex justify-end mt-1.5">
                  <a
                    href="#"
                    onClick={async (e) => {
                      e.preventDefault();
                      await alert({
                        title: "إرشادات استعادة كلمة المرور",
                        message: "لأسباب تتعلق بالسياسات الأمنية للرقابة المركزية، يرجى مراجعة المشرف الإداري في قطاعك أو مسؤول النظام المركزي لتحديث بيانات المرور.",
                        type: "info",
                        confirmText: "حسناً، فهمت",
                      });
                    }}
                    className="text-xs text-[#147A77] hover:text-[#0C4A4E] transition-colors"
                  >
                    نسيت كلمة المرور؟
                  </a>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#0C4A4E] text-white rounded-xl py-3.5 px-4 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#052F31] transition-all active:scale-[0.98] mt-6 shadow-sm cursor-pointer disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري التحقق...</span>
                  </>
                ) : (
                  <>
                    <span>تسجيل الدخول</span>
                    <ArrowLeft className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ── STEP 2: Device OTP Verification ── */}
          {step === "device_otp" && (
            <form onSubmit={handleDeviceVerify} className="space-y-5">
              <div className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#E6F1EE] text-[#0C4A4E] mx-auto flex items-center justify-center mb-3">
                  <KeyRound className="w-7 h-7" />
                </div>
                <p className="text-xs text-[#456A6D] leading-relaxed">
                  تم اكتشاف جهاز جديد. أدخل الرمز المُرسل إلى بريدك الإلكتروني المسجّل.
                </p>
              </div>

              {/* OTP input */}
              <div>
                <label className="block text-sm font-medium text-[#163D42] mb-1.5">
                  رمز التحقق (6 أرقام)
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full bg-[#F1F6F4] border border-[#E7EEEB] rounded-xl py-3 px-4 text-center text-2xl font-mono tracking-widest focus:border-[#178A86] focus:ring-2 focus:ring-[#178A86]/20 transition-all text-[#163D42]"
                />
                {/* Dev Helper: Fetch OTP from test endpoint */}
                <div className="mt-2 text-center">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        const apiBase = getApiBaseUrl();
                        const res = await fetch(`${apiBase}/api/Test/latest-otp/${identifier.trim()}`);
                        if (res.ok) {
                          const data = await res.json();
                          if (data.latestOTP) {
                            setOtpCode(data.latestOTP);
                          }
                        }
                      } catch (err) {
                        console.error("Failed to fetch dev OTP", err);
                      }
                    }}
                    className="text-xs text-[#147A77] hover:underline cursor-pointer font-medium"
                  >
                    ⚡ استرجاع رمز التحقق التجريبي تلقائياً (بيئة التطوير)
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || otpCode.length < 6}
                className="w-full bg-[#0C4A4E] text-white rounded-xl py-3.5 px-4 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#052F31] transition-all active:scale-[0.98] shadow-sm cursor-pointer disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>جاري التحقق...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>تأكيد الجهاز والدخول</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("credentials");
                  setOtpCode("");
                  setErrorMessage("");
                  setSuccessMessage("");
                  clearAuthStorage();
                }}
                className="w-full text-xs text-[#6D898A] hover:text-[#0C4A4E] transition-colors py-2"
              >
                العودة لتسجيل الدخول
              </button>
            </form>
          )}
        </div>

        {/* Security Notice Footer */}
        <div className="bg-[#F1F6F4] py-4 px-8 border-t border-[#E7EEEB] flex items-center justify-center gap-2 text-xs text-[#456A6D]">
          <ShieldCheck className="w-4 h-4 text-[#126B58] shrink-0" />
          <p className="text-center">هذه البوابة تخضع لإشراف ورقابة الجهات الحكومية المختصة.</p>
        </div>
      </main>

      {/* Quick Test Accounts Card (Optional helper for development / QA) */}
      {step === "credentials" && (
        <div className="w-full max-w-md mt-4 bg-white/95 backdrop-blur-md rounded-2xl p-4 border border-[#E7EEEB] shadow-xs z-10">
          <div className="flex items-center justify-between font-bold text-[#0C4A4E] mb-2.5">
            <span className="text-xs">💡 حسابات معتمدة في قاعدة البيانات (للتجربة السريعة):</span>
            <span className="text-[10px] text-[#6D898A] font-mono">كلمة المرور: Password123</span>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 mb-2.5">
            <button
              type="button"
              onClick={() => setDemoFilter("all")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                demoFilter === "all"
                  ? "bg-[#0C4A4E] text-white shadow-2xs"
                  : "bg-[#F1F6F4] text-[#456A6D] hover:bg-[#E7EEEB]"
              }`}
            >
              الكل ({DEMO_ACCOUNTS.length})
            </button>
            <button
              type="button"
              onClick={() => setDemoFilter("admin")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                demoFilter === "admin"
                  ? "bg-[#0C4A4E] text-white shadow-2xs"
                  : "bg-[#F1F6F4] text-[#456A6D] hover:bg-[#E7EEEB]"
              }`}
            >
              حسابات الإدارة ({DEMO_ACCOUNTS.filter((a) => a.category === "admin").length})
            </button>
            <button
              type="button"
              onClick={() => setDemoFilter("employee")}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                demoFilter === "employee"
                  ? "bg-[#0C4A4E] text-white shadow-2xs"
                  : "bg-[#F1F6F4] text-[#456A6D] hover:bg-[#E7EEEB]"
              }`}
            >
              حسابات الموظفين ({DEMO_ACCOUNTS.filter((a) => a.category === "employee").length})
            </button>
          </div>

          {/* Accounts List */}
          <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
            {DEMO_ACCOUNTS.filter((acc) => {
              if (demoFilter === "admin") return acc.category === "admin";
              if (demoFilter === "employee") return acc.category === "employee";
              return true;
            }).map((acc) => {
              const accountKey = `${acc.role}-${acc.nationalNumber}-${acc.agency}-${acc.roleLabel}`;
              const isFilled = filledAccountKey === accountKey;
              return (
                <div
                  key={accountKey}
                  className={`flex items-center justify-between p-2 rounded-xl transition-all border ${
                    isFilled
                      ? "bg-[#E6F1EE] border-[#147A77] ring-1 ring-[#147A77]"
                      : "bg-[#F1F6F4]/50 hover:bg-[#F1F6F4] border-[#E7EEEB]"
                  }`}
                >
                  <div className="min-w-0 pr-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${acc.badgeColor}`}>
                        {acc.roleLabel}
                      </span>
                      <span className="font-semibold text-[#163D42] text-[11px] truncate">
                        {acc.name}
                      </span>
                    </div>
                    <p className="text-[10px] text-[#456A6D] font-mono mt-0.5">
                      {acc.nationalNumber} • {acc.agency}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIdentifier(acc.nationalNumber);
                      setPassword("Password123");
                      setRole(acc.role);
                      setAgency(acc.agency);
                      setErrorMessage("");
                      setFilledAccountKey(accountKey);
                      setTimeout(() => setFilledAccountKey(null), 2500);
                    }}
                    className={`text-[11px] font-bold px-2.5 py-1 rounded-lg transition-all shrink-0 cursor-pointer shadow-2xs ${
                      isFilled
                        ? "bg-[#126B58] text-white border border-[#126B58]"
                        : "text-[#0C4A4E] hover:text-[#052F31] bg-white hover:bg-[#E6F1EE] border border-[#BFE5DF]"
                    }`}
                  >
                    {isFilled ? "✓ تم التحديد" : "تعبئة الحقول"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Agency Selection Overlay */}
      {isAgencyOverlayOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glassmorphism-overlay animate-in fade-in duration-200">
          <div className="glass-panel rounded-2xl w-full max-w-2xl p-8 relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setIsAgencyOverlayOpen(false)}
              className="absolute top-5 left-5 text-[#6D898A] hover:text-[#163D42] p-1.5 rounded-full hover:bg-[#F1F6F4] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-[#0C4A4E] mb-2 font-arabic">اختيار الجهة الحكومية</h2>
              <p className="text-sm text-[#456A6D]">
                الرجاء اختيار الجهة التابع لها للمتابعة في النظام
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {(
                [
                  { key: "المرور", icon: <Car className="w-7 h-7" />, color: "bg-[#FFF3D8] text-[#9A762D]" },
                  { key: "الجوازات", icon: <Plane className="w-7 h-7" />, color: "bg-[#E6F1EE] text-[#147A77]" },
                  { key: "الأحوال المدنية", icon: <BadgeAlert className="w-7 h-7" />, color: "bg-[#E6F1EE] text-[#0C4A4E]" },
                  { key: "المستشفيات", icon: <HeartPulse className="w-7 h-7" />, color: "bg-[#EAF4FB] text-[#437CA4]" },
                ] as const
              ).map(({ key, icon, color }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleAgencySelect(key as AgencyType)}
                  className="agency-card glass-panel rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-[#178A86]"
                >
                  <div
                    className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    {icon}
                  </div>
                  <span className="text-base font-bold text-[#163D42]">{key}</span>
                </button>
              ))}
            </div>

            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => setIsAgencyOverlayOpen(false)}
                className="text-xs text-[#456A6D] hover:text-[#0C4A4E] transition-colors py-2 px-5 rounded-full border border-transparent hover:border-[#E7EEEB] cursor-pointer"
              >
                إلغاء والعودة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
