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
import {
  apiLogin,
  apiVerifyDevice,
  saveToken,
  clearAuthStorage,
  getDeviceIdentifier,
  decodeRolesFromToken,
  type LoginResult,
} from "@/lib/api/authService";
import { employeesService } from "@/lib/api/employeesService";

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
    badgeColor: "bg-[#E6F1EE] text-[#147A77] border-[#BFE5DF]",
    category: "admin",
  },
  {
    role: "ADMIN",
    roleLabel: "أدمن المستشفيات",
    nationalNumber: "01011200001",
    name: "يوسف حمود عبده المخلافي",
    agency: "المستشفيات",
    badgeColor: "bg-[#EAF4FB] text-[#437CA4] border-[#BCE0F7]",
    category: "admin",
  },
  {
    role: "ADMIN",
    roleLabel: "أدمن الجوازات",
    nationalNumber: "01011200002",
    name: "وليد ناجي محمد القباطي",
    agency: "الجوازات",
    badgeColor: "bg-[#E6F1EE] text-[#147A77] border-[#BFE5DF]",
    category: "admin",
  },
  {
    role: "ADMIN",
    roleLabel: "أدمن المرور",
    nationalNumber: "01011200003",
    name: "عمر فارع سالم الحمادي",
    agency: "المرور",
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
    badgeColor: "bg-[#E6F1EE] text-[#147A77] border-[#BFE5DF]",
    category: "employee",
  },
  {
    role: "EMPLOYEE",
    roleLabel: "موظف المستشفيات",
    nationalNumber: "01011200004",
    name: "ريم طارق عبد الله الدهمشي",
    agency: "المستشفيات",
    badgeColor: "bg-[#EAF4FB] text-[#437CA4] border-[#BCE0F7]",
    category: "employee",
  },
  {
    role: "EMPLOYEE",
    roleLabel: "موظف الجوازات",
    nationalNumber: "01011200005",
    name: "باسل أمين خالد الشرعبي",
    agency: "الجوازات",
    badgeColor: "bg-[#E6F1EE] text-[#147A77] border-[#BFE5DF]",
    category: "employee",
  },
  {
    role: "EMPLOYEE",
    roleLabel: "موظف المرور",
    nationalNumber: "01011200006",
    name: "منصور علي حسن الشوكاني",
    agency: "المرور",
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

/** Decide where to redirect after successful login */
function getRedirectPath(role: RoleType, agency: AgencyType): string {
  if (role === "SUPER_ADMIN") return "/admin";
  if (role === "ADMIN") {
    if (agency === "الأحوال المدنية") return "/civil-registry";
    if (agency === "الجوازات") return "/passports";
    if (agency === "المرور") return "/traffic";
    if (agency === "المستشفيات") return "/hospitals";
    return "/civil-registry";
  }
  // EMPLOYEE
  if (agency === "الأحوال المدنية") return "/civil-registry/activations";
  if (agency === "الجوازات") return "/passports/requests";
  if (agency === "المرور") return "/traffic/violations";
  if (agency === "المستشفيات") return "/hospitals/records";
  return "/civil-registry/activations";
}

// ─── Component ────────────────────────────────────────────────────────────────

type LoginStep = "credentials" | "device_otp";

export default function LoginPage() {
  const router = useRouter();
  const { updateSession } = useAuth();

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
    // Persist JWT
    saveToken(result.accessToken);

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
    } else if (resolvedRole === "ADMIN") {
      // Honor user's explicit selection if made in UI; otherwise fallback to backend detection
      if (agency && agency !== "وزارة الداخلية") {
        resolvedAgency = agency;
      } else {
        try {
          const empRes = await employeesService.getEmployees();
          if (empRes.isSuccess && (empRes.organizationName || empRes.branchName)) {
            const orgName = empRes.organizationName ?? "";
            if (orgName.includes("أحوال") || orgName.includes("السجل المدني")) {
              resolvedAgency = "الأحوال المدنية";
            } else if (orgName.includes("جوازات") || orgName.includes("هجرة")) {
              resolvedAgency = "الجوازات";
            } else if (orgName.includes("مرور")) {
              resolvedAgency = "المرور";
            } else if (orgName.includes("مستشف") || orgName.includes("صحة")) {
              resolvedAgency = "المستشفيات";
            }
          }
        } catch (e) {
          console.warn("[Login] Could not auto-detect admin branch/agency:", e);
        }
      }

      if (resolvedAgency === "الجوازات") {
        actualBranchName = "مصلحة الهجرة والجوازات والجنسية - صنعاء";
        actualBranchId = "018f7d9a-2000-7000-8000-000000000005";
        actualJobTitle = "مدير عام فرع الهجرة والجوازات";
      } else if (resolvedAgency === "الأحوال المدنية") {
        actualBranchName = "مصلحة الأحوال المدنية - صنعاء";
        actualBranchId = "018f7d9a-2000-7000-8000-000000000001";
        actualJobTitle = "مدير فرع الأحوال المدنية";
      } else if (resolvedAgency === "المرور") {
        actualBranchName = "إدارة شرطة السير والمرور - صنعاء";
        actualBranchId = "018f7d9a-2000-7000-8000-000000000003";
        actualJobTitle = "مدير إدارة المرور";
      } else if (resolvedAgency === "المستشفيات") {
        actualBranchName = "هيئة مستشفى الثورة العام النموذجي";
        actualBranchId = "018f7d9a-2000-7000-8000-000000000003";
        actualJobTitle = "مدير عام المستشفى";
      }
    } else if (resolvedRole === "EMPLOYEE") {
      if (agency && agency !== "وزارة الداخلية") {
        resolvedAgency = agency;
      }
      if (resolvedAgency === "الجوازات") {
        actualBranchName = "مصلحة الهجرة والجوازات والجنسية - صنعاء";
        actualBranchId = "018f7d9a-2000-7000-8000-000000000005";
        actualJobTitle = "موظف فحص واعتماد الجوازات";
      } else if (resolvedAgency === "الأحوال المدنية") {
        actualBranchName = "مصلحة الأحوال المدنية - صنعاء";
        actualBranchId = "018f7d9a-2000-7000-8000-000000000001";
        actualJobTitle = "موظف كاونتر وتفعيل بيومتري حضوري";
      } else if (resolvedAgency === "المرور") {
        actualBranchName = "إدارة شرطة السير والمرور - صنعاء";
        actualBranchId = "018f7d9a-2000-7000-8000-000000000003";
        actualJobTitle = "موظف الرخص والمخالفات";
      } else if (resolvedAgency === "المستشفيات") {
        actualBranchName = "هيئة مستشفى الثورة العام النموذجي";
        actualBranchId = "018f7d9a-2000-7000-8000-000000000003";
        actualJobTitle = "مسؤول السجل الطبي والمواليد";
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

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!identifier.trim()) {
      setErrorMessage("يرجى إدخال رقم الهوية الوطنية");
      return;
    }
    if (!password.trim()) {
      setErrorMessage("يرجى إدخال كلمة المرور");
      return;
    }

    setIsLoading(true);
    try {
      const deviceId = getDeviceIdentifier(identifier.trim());

      const res = await apiLogin({
        nationalNumber: identifier.trim(),
        password: password.trim(),
        deviceIdentifier: deviceId,
        deviceName: "Huwiyati Web Portal",
        operatingSystem: typeof navigator !== "undefined" ? navigator.platform : "Web",
      });

      if (!res.isSuccess) {
        // Translate common backend error messages
        const msg = res.message ?? "فشل تسجيل الدخول. تحقق من بياناتك.";
        if (msg.includes("Invalid National Number or Password")) {
          setErrorMessage("رقم الهوية أو كلمة المرور غير صحيحة.");
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
                <label className="block text-sm font-medium text-[#163D42] mb-1.5">
                  رقم الهوية الوطنية
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
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
                <label className="block text-sm font-medium text-[#163D42] mb-1.5">
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
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
                    onClick={(e) => {
                      e.preventDefault();
                      alert(
                        "لنسيان كلمة المرور، يرجى التواصل مع مسؤول النظام أو استخدام خاصية نسيت كلمة المرور عند إتاحتها."
                      );
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
                        const res = await fetch(`http://localhost:5237/api/Test/latest-otp/${identifier.trim()}`);
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
