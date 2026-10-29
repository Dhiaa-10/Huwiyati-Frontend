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
import {
  useAuth,
  resolveAgencyFromOrgName,
  resolveJobTitle,
  mapBackendRoleToFrontend,
} from "@/context/AuthContext";
import type { AgencyType, RoleType } from "@/context/AuthContext";
import {
  apiLogin,
  apiVerifyDevice,
  saveToken,
  saveRefreshToken,
  clearAuthStorage,
  getDeviceIdentifier,
  decodeToken,
  type LoginResult,
} from "@/lib/api/authService";
import { employeesService } from "@/lib/api/employeesService";

// ─── Types & Constants ────────────────────────────────────────────────────────

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

/**
 * Demo quick-fill accounts — national numbers match the backend DbInitializer seeds.
 * Passwords are set by the seeder (default: "Admin@123" / "Employee@123").
 */
const DEMO_ACCOUNTS: DemoAccount[] = [
  // ── Admins & SuperAdmins ─────────────────────────────────────────────────
  {
    role: "SUPER_ADMIN",
    roleLabel: "سوبر أدمن",
    nationalNumber: "01011131317",
    name: "ضياء محمد عبدالمجيد السالمي",
    agency: "وزارة الداخلية",
    badgeColor: "bg-[#E6F1EE] text-[#052F31] border-[#BFE5DF]",
    category: "admin",
  },
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
  // ── Employees ────────────────────────────────────────────────────────────
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

// ─── Pure helpers (no side-effects) ──────────────────────────────────────────

/** Converts our UI role to the string the backend expects in LoginCommand.RequestedRole */
function getBackendRoleString(role: ActiveRoleType): "SuperAdmin" | "Admin" | "Employee" {
  switch (role) {
    case "SUPER_ADMIN": return "SuperAdmin";
    case "ADMIN":       return "Admin";
    case "EMPLOYEE":    return "Employee";
  }
}

/** Portal route per role / agency after successful login */
function getRedirectPath(role: RoleType, agency: AgencyType): string {
  if (role === "SUPER_ADMIN") return "/admin";
  if (role === "ADMIN") {
    if (agency === "الأحوال المدنية") return "/civil-registry";
    if (agency === "الجوازات")       return "/passports";
    if (agency === "المرور")          return "/traffic";
    if (agency === "المستشفيات")     return "/hospitals";
    return "/civil-registry";
  }
  // EMPLOYEE
  if (agency === "الأحوال المدنية") return "/civil-registry/activations";
  if (agency === "الجوازات")        return "/passports/requests";
  if (agency === "المرور")           return "/traffic/violations";
  if (agency === "المستشفيات")      return "/hospitals/records";
  return "/civil-registry/activations";
}

/**
 * Translates a raw backend error message (English) into a user-friendly Arabic string.
 * Covers every possible 401 / 403 case from LoginHandler and VerifyDeviceHandler.
 */
function translateBackendError(message: string): string {
  const m = message ?? "";

  // ── 401 ─────────────────────────────────────────────────────────────────
  if (m.includes("Invalid National Number or Password"))
    return "رقم الهوية الوطنية أو كلمة المرور غير صحيحة.";
  if (m.includes("Invalid National Number or code"))
    return "رقم الهوية أو رمز التحقق غير صحيح.";
  if (m.includes("Invalid or expired verification code"))
    return "رمز التحقق غير صحيح أو انتهت صلاحيته. اطلب رمزاً جديداً.";

  // ── 403 — account status ─────────────────────────────────────────────────
  if (m.includes("suspended") || m.includes("Suspended"))
    return "حسابك موقوف من قِبل الإدارة. يرجى مراجعة أحد مراكز الخدمة لإعادة التفعيل.";
  if (m.includes("deactivated") || m.includes("Deactivated"))
    return "حسابك غير مفعَّل. يرجى طلب رمز إعادة التفعيل.";

  // ── 403 — role / branch checks ───────────────────────────────────────────
  if (m.includes("do not possess") || m.includes("possess the"))
    return "هذا الحساب لا يملك الصلاحية المطلوبة. تأكد من اختيار الرتبة الصحيحة لحسابك.";
  if (m.includes("not assigned as an active staff member"))
    return "لا يوجد تكليف إداري نشط لهذا الحساب. يرجى التواصل مع الإدارة.";
  if (m.includes("assigned branch is inactive"))
    return "الفرع المرتبط بحسابك معطَّل. يرجى التواصل مع مشرف النظام.";
  if (m.includes("not affiliated with the selected organization"))
    return "حسابك غير مرتبط بالجهة المحددة. يرجى اختيار الجهة الصحيحة.";
  if (m.includes("Access Denied"))
    return "وصول مرفوض: " + m.replace("Access Denied:", "").trim();

  // ── Device verification ───────────────────────────────────────────────────
  if (m.includes("Device record not found"))
    return "لم يُعثر على سجل الجهاز. حاول تسجيل الدخول من جديد.";
  if (m.includes("Failed to send device verification OTP"))
    return "فشل إرسال رمز التحقق. تحقق من إعداد البريد الإلكتروني في الخادم.";

  // ── Generic fallback ─────────────────────────────────────────────────────
  return m || "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.";
}

// ─── Component ────────────────────────────────────────────────────────────────

type LoginStep = "credentials" | "device_otp";

export default function LoginPage() {
  const router = useRouter();
  const { updateSession } = useAuth();

  // ── UI State ──────────────────────────────────────────────────────────────
  const [role, setRole] = useState<ActiveRoleType>("SUPER_ADMIN");
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [agency, setAgency] = useState<AgencyType>("وزارة الداخلية");
  const [isAgencyOverlayOpen, setIsAgencyOverlayOpen] = useState(false);

  // Form
  const [step, setStep] = useState<LoginStep>("credentials");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");

  // Pending device verification state
  const [pendingLoginResult, setPendingLoginResult] = useState<LoginResult | null>(null);

  // Feedback
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Demo accounts filter
  const [demoFilter, setDemoFilter] = useState<"all" | "admin" | "employee">("all");
  const [filledAccountKey, setFilledAccountKey] = useState<string | null>(null);

  // ── Role / Agency label maps ───────────────────────────────────────────────
  const roleConfig: Record<ActiveRoleType, { label: string; indicatorColor: string }> = {
    SUPER_ADMIN: { label: "سوبر أدمن",   indicatorColor: "bg-[#052F31]" },
    ADMIN:       { label: "أدمن",         indicatorColor: "bg-[#0C4A4E]" },
    EMPLOYEE:    { label: "موظف",         indicatorColor: "bg-[#147A77]" },
  };

  const agencyConfig: { id: AgencyType; label: string; icon: React.ReactNode }[] = [
    { id: "الأحوال المدنية", label: "الأحوال المدنية",  icon: <User className="w-4 h-4" /> },
    { id: "الجوازات",        label: "الجوازات",          icon: <Plane className="w-4 h-4" /> },
    { id: "المرور",           label: "المرور",            icon: <Car className="w-4 h-4" /> },
    { id: "المستشفيات",      label: "المستشفيات",        icon: <HeartPulse className="w-4 h-4" /> },
  ];

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleRoleSelect = (newRole: ActiveRoleType) => {
    setRole(newRole);
    setIsRoleMenuOpen(false);
    setErrorMessage("");
    if (newRole === "SUPER_ADMIN") setAgency("وزارة الداخلية");
    else if (agency === "وزارة الداخلية") setAgency("الأحوال المدنية");
  };

  const handleAgencySelect = (selected: AgencyType) => {
    setAgency(selected);
    setIsAgencyOverlayOpen(false);
  };

  const fillDemo = (account: DemoAccount) => {
    setRole(account.role);
    setAgency(account.agency);
    setIdentifier(account.nationalNumber);
    setPassword("Admin@123");
    setFilledAccountKey(account.nationalNumber);
    setErrorMessage("");
    setSuccessMessage("");
  };

  // ─────────────────────────────────────────────────────────────────────────
  // completeSession
  //   Called with a valid LoginResult (accessToken is non-empty).
  //   1. Persists tokens.
  //   2. Decodes JWT claims → role, branchId, organizationId.
  //   3. Validates that the backend-confirmed role matches what the user selected.
  //   4. For Admin/Employee: fetches real branch/org name from /api/v1/Employees.
  //   5. Updates AuthContext and redirects.
  // ─────────────────────────────────────────────────────────────────────────
  const completeSession = async (result: LoginResult) => {
    // 1. Persist tokens
    saveToken(result.accessToken);
    if (result.refreshToken) saveRefreshToken(result.refreshToken);

    // 2. Decode JWT claims
    const claims = decodeToken(result.accessToken);

    // 3. Validate backend-confirmed role vs. UI selection
    // In ASP.NET Identity, a user may have multiple roles (e.g. ["Citizen", "Admin"] or ["Admin", "Citizen"])
    const availableRoles: ActiveRoleType[] = claims.roles
      .map((r) => mapBackendRoleToFrontend(r))
      .filter((r): r is ActiveRoleType => r !== "NONE");

    const hasRequestedRole = availableRoles.includes(role);

    if (!hasRequestedRole) {
      clearAuthStorage();
      if (availableRoles.length === 0) {
        setErrorMessage("لم يتم التعرف على دور هذا الحساب. يرجى التواصل مع مشرف النظام.");
      } else if (role === "SUPER_ADMIN") {
        setErrorMessage("هذا الحساب ليس سوبر أدمن. يرجى اختيار الرتبة الصحيحة.");
      } else if (role === "ADMIN") {
        setErrorMessage("هذا الحساب ليس أدمن. يرجى اختيار الرتبة المناسبة (موظف / سوبر أدمن).");
      } else {
        setErrorMessage("هذا الحساب ليس حساب موظف. يرجى اختيار الرتبة الصحيحة.");
      }
      return;
    }

    const confirmedRole: ActiveRoleType = role;

    // 4. Resolve agency & branch info
    let resolvedAgency: AgencyType = confirmedRole === "SUPER_ADMIN" ? "وزارة الداخلية" : agency;
    let resolvedBranchName = "";
    let resolvedBranchId = claims.branchId ?? "";
    let resolvedOrgId = claims.organizationId ?? "";

    if (confirmedRole === "ADMIN") {
      // Fetch real branch & org name from /api/v1/Employees (uses token from localStorage)
      try {
        const empRes = await employeesService.getEmployees();
        if (empRes.isSuccess && empRes.organizationName) {
          resolvedAgency = resolveAgencyFromOrgName(empRes.organizationName);
          resolvedBranchName = empRes.branchName ?? resolvedBranchName;
          if (empRes.branchId) resolvedBranchId = empRes.branchId;
        }
      } catch (e) {
        // Non-fatal: agency/branch fallback to what we have from JWT claims
        console.warn("[Login] Could not fetch employee branch info:", e);
      }
    }

    // 5. Update AuthContext with real backend data
    updateSession({
      fullName:       result.fullName || claims.fullName || "",
      nationalNumber: result.nationalNumber || claims.nationalNumber || "",
      role:           confirmedRole,
      agency:         resolvedAgency,
      branchName:     resolvedBranchName,
      branchId:       resolvedBranchId,
      organizationId: resolvedOrgId,
      jobTitle:       resolveJobTitle(confirmedRole, resolvedAgency),
      loginSource:    "login_page",
    });

    // 6. Redirect to the correct portal
    const target = getRedirectPath(confirmedRole, resolvedAgency);
    router.push(target);
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Step 1 — Login with credentials
  // ─────────────────────────────────────────────────────────────────────────
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!identifier.trim()) { setErrorMessage("يرجى إدخال رقم الهوية الوطنية"); return; }
    if (!password.trim())   { setErrorMessage("يرجى إدخال كلمة المرور"); return; }

    setIsLoading(true);
    try {
      const deviceId     = getDeviceIdentifier(identifier.trim());
      const backendRole  = getBackendRoleString(role);

      // For Admin/Employee we pass the organizationId selected in UI (if available in JWT after login)
      // so the backend can validate branch affiliation.
      // We don't pass it for SuperAdmin — they have no branch restriction.
      const res = await apiLogin({
        nationalNumber:  identifier.trim(),
        password:        password.trim(),
        requestedRole:   backendRole,
        deviceIdentifier: deviceId,
        deviceName:      "Huwiyati Web Portal",
        operatingSystem: typeof navigator !== "undefined" ? navigator.platform : "Web",
      });

      if (!res.isSuccess || !res.data) {
        setErrorMessage(translateBackendError(res.message ?? ""));
        return;
      }

      const loginData = res.data;

      // Case A: trusted device → login complete
      if (!loginData.requiresDeviceVerification) {
        await completeSession(loginData);
        return;
      }

      // Case B: new / untrusted device → OTP sent to email
      setPendingLoginResult(loginData);
      setStep("device_otp");
      setSuccessMessage(
        "تم الكشف عن جهاز جديد! تم إرسال رمز التحقق إلى بريدك الإلكتروني المسجَّل. أدخله أدناه خلال 5 دقائق."
      );
    } catch (err) {
      setErrorMessage("تعذّر الاتصال بالخادم. تحقق من أن الباكند يعمل على المنفذ 5237.");
      console.error("[Login]", err);
    } finally {
      setIsLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Step 2 — Verify new device with OTP
  // ─────────────────────────────────────────────────────────────────────────
  const handleDeviceVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!otpCode.trim() || otpCode.length < 6) {
      setErrorMessage("أدخل الرمز المكوّن من 6 أرقام الذي وصل إلى بريدك الإلكتروني.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await apiVerifyDevice({
        nationalNumber:   identifier.trim(),
        deviceIdentifier: getDeviceIdentifier(identifier.trim()),
        code:             otpCode.trim(),
      });

      if (!res.isSuccess || !res.data) {
        setErrorMessage(translateBackendError(res.message ?? ""));
        return;
      }

      // الجهاز أصبح موثوقاً في قاعدة البيانات الآن.
      // إذا كانت كلمة المرور متوفرة في النموذج، نستدعي apiLogin فوراً للحصول على التوكن المكتمل بالفرع والجهة وبيانات التجديد
      let finalLoginResult = res.data;
      if (password.trim()) {
        try {
          const freshLogin = await apiLogin({
            nationalNumber:  identifier.trim(),
            password:        password.trim(),
            requestedRole:   getBackendRoleString(role),
            deviceIdentifier: getDeviceIdentifier(identifier.trim()),
            deviceName:      "Huwiyati Web Portal",
            operatingSystem: typeof navigator !== "undefined" ? navigator.platform : "Web",
          });
          if (freshLogin.isSuccess && freshLogin.data && !freshLogin.data.requiresDeviceVerification) {
            finalLoginResult = freshLogin.data;
          }
        } catch {
          // في حال حدوث أي استثناء نعتمد على نتيجة verify-device
        }
      }

      await completeSession(finalLoginResult);
    } catch (err) {
      setErrorMessage("تعذّر التحقق من الرمز. حاول مرة أخرى.");
      console.error("[VerifyDevice]", err);
    } finally {
      setIsLoading(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  const filteredDemoAccounts = DEMO_ACCOUNTS.filter(
    (a) => demoFilter === "all" || a.category === demoFilter
  );

  return (
    <div className="bg-[#FBFBF8] min-h-screen flex flex-col items-center justify-center font-sans text-[#163D42] p-4 md:p-10 relative overflow-x-hidden">
      {/* Background Decorative Gradient Blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex justify-center items-center opacity-40">
        <div className="absolute w-[800px] h-[800px] bg-[#0C4A4E]/5 rounded-full blur-3xl -top-1/4 -right-1/4"></div>
        <div className="absolute w-[600px] h-[600px] bg-[#147A77]/5 rounded-full blur-3xl bottom-0 -left-1/4"></div>
      </div>

      {/* Role Selector — top left */}
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
                {(["SUPER_ADMIN", "ADMIN", "EMPLOYEE"] as ActiveRoleType[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => handleRoleSelect(r)}
                    className="w-full text-right px-4 py-2.5 hover:bg-[#F1F6F4] text-sm text-[#163D42] flex items-center gap-2.5 cursor-pointer"
                  >
                    <div className={`w-2.5 h-2.5 rounded-full ${roleConfig[r].indicatorColor}`}></div>
                    <span>{roleConfig[r].label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Agency Selector Overlay */}
      {isAgencyOverlayOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-80 relative">
            <button
              onClick={() => setIsAgencyOverlayOpen(false)}
              className="absolute top-3 left-3 text-[#6D898A] hover:text-[#163D42] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-center font-bold text-[#163D42] mb-4">اختر الجهة الحكومية</h3>
            <div className="flex flex-col gap-2">
              {agencyConfig.map(({ id, label, icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => handleAgencySelect(id)}
                  className={`flex items-center gap-3 p-3 rounded-xl border transition-all cursor-pointer ${
                    agency === id
                      ? "border-[#147A77] bg-[#E6F1EE] text-[#147A77]"
                      : "border-[#E7EEEB] hover:bg-[#F1F6F4] text-[#163D42]"
                  }`}
                >
                  {icon}
                  <span className="font-medium">{label}</span>
                  {agency === id && <CheckCircle2 className="w-4 h-4 ml-auto" />}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Main Card */}
      <div className="w-full max-w-md z-10">
        <div className="bg-white rounded-3xl shadow-xl border border-[#E7EEEB] overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-b from-[#0C4A4E] to-[#147A77] p-8 text-center text-white">
            <div className="flex justify-center mb-4">
              <HwyatiLogo className="w-14 h-14" />
            </div>
            <h1 className="text-2xl font-bold tracking-wide">هُوِيَّتِي</h1>
            <p className="text-sm mt-1 text-white/80">المنظومة الوطنية للهوية والخدمات المدنية</p>

            {step === "credentials" && (
              <div className="mt-4 flex items-center justify-center gap-2 bg-white/10 rounded-full py-1.5 px-4 text-sm">
                <Shield className="w-4 h-4" />
                <span>لوحة التحكم — {roleConfig[role].label}</span>
              </div>
            )}
            {step === "device_otp" && (
              <div className="mt-4 flex items-center justify-center gap-2 bg-white/10 rounded-full py-1.5 px-4 text-sm">
                <ShieldCheck className="w-4 h-4" />
                <span>التحقق من الجهاز</span>
              </div>
            )}
          </div>

          {/* Form Body */}
          <div className="p-8">

            {/* ── Step: Credentials ─────────────────────────────────── */}
            {step === "credentials" && (
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {/* Agency selector (only for Admin / Employee) */}
                {role !== "SUPER_ADMIN" && (
                  <div>
                    <label className="block text-xs font-semibold text-[#6D898A] mb-1.5 uppercase tracking-wider">
                      الجهة الحكومية
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsAgencyOverlayOpen(true)}
                      className="w-full flex items-center justify-between bg-[#F8FAF9] border border-[#E7EEEB] rounded-xl px-4 py-3 text-sm hover:border-[#147A77] transition-colors cursor-pointer"
                    >
                      <span className="font-medium text-[#163D42]">{agency}</span>
                      <ChevronDown className="w-4 h-4 text-[#6D898A]" />
                    </button>
                  </div>
                )}

                {/* National Number */}
                <div>
                  <label className="block text-xs font-semibold text-[#6D898A] mb-1.5 uppercase tracking-wider">
                    رقم الهوية الوطنية
                  </label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6D898A]" />
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={11}
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value.replace(/\D/g, ""))}
                      placeholder="أدخل رقم الهوية"
                      className="w-full bg-[#F8FAF9] border border-[#E7EEEB] rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#147A77] focus:border-transparent transition-all text-right placeholder:text-[#A0B5B6]"
                      dir="rtl"
                      autoComplete="username"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label className="block text-xs font-semibold text-[#6D898A] mb-1.5 uppercase tracking-wider">
                    كلمة المرور
                  </label>
                  <div className="relative">
                    <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6D898A]" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="أدخل كلمة المرور"
                      className="w-full bg-[#F8FAF9] border border-[#E7EEEB] rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#147A77] focus:border-transparent transition-all text-right placeholder:text-[#A0B5B6]"
                      dir="rtl"
                      autoComplete="current-password"
                    />
                  </div>
                </div>

                {/* Error / Success */}
                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 text-red-700 text-sm">
                    <BadgeAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#0C4A4E] hover:bg-[#147A77] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /><span>جارٍ التحقق...</span></>
                  ) : (
                    <><Shield className="w-5 h-5" /><span>تسجيل الدخول</span></>
                  )}
                </button>
              </form>
            )}

            {/* ── Step: Device OTP ──────────────────────────────────── */}
            {step === "device_otp" && (
              <form onSubmit={handleDeviceVerify} className="space-y-4">
                {successMessage && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-start gap-2 text-emerald-700 text-sm">
                    <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{successMessage}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-[#6D898A] mb-1.5 uppercase tracking-wider">
                    رمز التحقق (6 أرقام)
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6D898A]" />
                    <input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="000000"
                      className="w-full bg-[#F8FAF9] border border-[#E7EEEB] rounded-xl px-4 py-3 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-[#147A77] focus:border-transparent tracking-[0.4em] text-center placeholder:text-[#A0B5B6]"
                      autoFocus
                    />
                  </div>
                </div>

                {errorMessage && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2 text-red-700 text-sm">
                    <BadgeAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#0C4A4E] hover:bg-[#147A77] disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isLoading ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /><span>جارٍ التحقق...</span></>
                  ) : (
                    <><ShieldCheck className="w-5 h-5" /><span>تحقق وأكمل الدخول</span></>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => { setStep("credentials"); setOtpCode(""); setErrorMessage(""); setSuccessMessage(""); }}
                  className="w-full flex items-center justify-center gap-2 text-[#6D898A] hover:text-[#163D42] text-sm py-2 cursor-pointer transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>العودة لتسجيل الدخول</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* ── Quick Demo Accounts ──────────────────────────────────────────── */}
        {step === "credentials" && (
          <div className="mt-6 bg-white rounded-2xl border border-[#E7EEEB] shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[#E7EEEB]">
              <span className="text-xs font-semibold text-[#6D898A] uppercase tracking-wider">
                حسابات تجريبية سريعة
              </span>
              <div className="flex gap-1">
                {(["all", "admin", "employee"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setDemoFilter(f)}
                    className={`text-xs px-2.5 py-1 rounded-full transition-colors cursor-pointer ${
                      demoFilter === f
                        ? "bg-[#0C4A4E] text-white"
                        : "bg-[#F1F6F4] text-[#6D898A] hover:bg-[#E6F1EE]"
                    }`}
                  >
                    {f === "all" ? "الكل" : f === "admin" ? "إدارة" : "موظفون"}
                  </button>
                ))}
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto divide-y divide-[#F1F6F4]">
              {filteredDemoAccounts.map((account) => (
                <button
                  key={account.nationalNumber}
                  type="button"
                  onClick={() => fillDemo(account)}
                  className={`w-full flex items-center justify-between px-4 py-3 text-right hover:bg-[#F8FAF9] transition-colors cursor-pointer ${
                    filledAccountKey === account.nationalNumber ? "bg-[#E6F1EE]" : ""
                  }`}
                >
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium text-[#163D42] truncate max-w-[200px]">
                      {account.name}
                    </span>
                    <span className="text-xs text-[#6D898A] font-mono mt-0.5">
                      {account.nationalNumber}
                    </span>
                  </div>
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${account.badgeColor}`}>
                    {account.roleLabel}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
