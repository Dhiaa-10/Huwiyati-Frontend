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

// ─── Helpers ──────────────────────────────────────────────────────────────────

const defaultCredentials: Record<RoleType, { id: string; pass: string; agency: AgencyType }> = {
  SUPER_ADMIN: { id: "01011131317", pass: "Password123", agency: "وزارة الداخلية" },
  ADMIN: { id: "01011135650", pass: "Password123", agency: "الأحوال المدنية" },
  EMPLOYEE: { id: "01011108594", pass: "Password123", agency: "الأحوال المدنية" },
};

/** Map backend role string → our frontend RoleType */
function mapBackendRole(roles: string[]): RoleType {
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
  const [role, setRole] = useState<RoleType>("SUPER_ADMIN");
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [agency, setAgency] = useState<AgencyType>("وزارة الداخلية");
  const [isAgencyOverlayOpen, setIsAgencyOverlayOpen] = useState(false);

  // Step: "credentials" or "device_otp"
  const [step, setStep] = useState<LoginStep>("credentials");

  // Form fields (prefilled with SuperAdmin defaults)
  const [identifier, setIdentifier] = useState("01011131317");
  const [password, setPassword] = useState("Password123");
  const [otpCode, setOtpCode] = useState("");

  // Pending device verification data
  const [pendingUserId, setPendingUserId] = useState("");
  const [pendingLoginResult, setPendingLoginResult] = useState<LoginResult | null>(null);

  // Loading / error
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const roleConfig = {
    SUPER_ADMIN: { label: "سوبر أدمن", indicatorColor: "bg-[#ba1a1a]" },
    ADMIN: { label: "أدمن", indicatorColor: "bg-[#00374e]" },
    EMPLOYEE: { label: "موظف", indicatorColor: "bg-[#003c27]" },
  };

  const handleRoleSelect = (newRole: RoleType) => {
    setRole(newRole);
    setIsRoleMenuOpen(false);
    setErrorMessage("");
    // Automatically switch inputs to match the selected role
    setIdentifier(defaultCredentials[newRole].id);
    setPassword(defaultCredentials[newRole].pass);
    setAgency(defaultCredentials[newRole].agency);
  };

  const handleAgencySelect = (selected: AgencyType) => {
    setAgency(selected);
    setIsAgencyOverlayOpen(false);
  };

  /** Complete the session after a successful authentication */
  const completeSession = (result: LoginResult) => {
    // Persist JWT
    saveToken(result.accessToken);

    // Prioritize the role explicitly chosen on the login screen
    const resolvedRole: RoleType = role;

    // Determine agency from role
    const resolvedAgency: AgencyType =
      resolvedRole === "SUPER_ADMIN" ? "وزارة الداخلية" : agency;

    // Load appropriate institutional profile
    const profile = getProfileForRoleAndAgency(resolvedRole, resolvedAgency);

    // Update AuthContext session
    updateSession({
      fullName: result.fullName || profile.fullName,
      nationalNumber: result.nationalNumber || profile.nationalNumber,
      role: resolvedRole,
      agency: resolvedAgency,
      branchName: profile.branchName,
      jobTitle: profile.jobTitle,
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
        completeSession(loginData);
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

      completeSession(res.data);
    } catch (err) {
      setErrorMessage("تعذّر التحقق من الرمز. حاول مرة أخرى.");
      console.error("[VerifyDevice]", err);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="bg-[#f7f9fb] min-h-screen flex flex-col items-center justify-center font-['IBM_Plex_Sans_Arabic'] text-[#191c1e] p-4 md:p-10 relative overflow-x-hidden">
      {/* Background Decorative Gradient Blobs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex justify-center items-center opacity-40">
        <div className="absolute w-[800px] h-[800px] bg-[#0b4f6c]/5 rounded-full blur-3xl -top-1/4 -right-1/4"></div>
        <div className="absolute w-[600px] h-[600px] bg-[#e7ded9]/20 rounded-full blur-3xl bottom-0 -left-1/4"></div>
      </div>

      {/* Role Selector — top left corner */}
      {step === "credentials" && (
        <div className="absolute top-6 left-6 z-20">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
              className="bg-white border border-[#c0c7ce]/40 rounded-full py-2 px-4 flex items-center gap-2 shadow-xs hover:bg-[#f2f4f6] transition-colors cursor-pointer"
            >
              <div className={`w-3 h-3 rounded-full ${roleConfig[role].indicatorColor}`}></div>
              <span className="text-sm font-medium text-[#191c1e]">{roleConfig[role].label}</span>
              <ChevronDown className="w-4 h-4 text-[#71787e]" />
            </button>

            {isRoleMenuOpen && (
              <div className="absolute top-full mt-2 left-0 w-44 bg-white border border-[#c0c7ce]/40 rounded-xl shadow-lg overflow-hidden py-1 z-30 animate-in fade-in slide-in-from-top-2">
                <button
                  type="button"
                  onClick={() => handleRoleSelect("SUPER_ADMIN")}
                  className="w-full text-right px-4 py-2.5 hover:bg-[#f2f4f6] text-sm text-[#191c1e] flex items-center gap-2.5 cursor-pointer"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-[#ba1a1a]"></div>
                  <span>سوبر أدمن</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelect("ADMIN")}
                  className="w-full text-right px-4 py-2.5 hover:bg-[#f2f4f6] text-sm text-[#191c1e] flex items-center gap-2.5 cursor-pointer"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-[#00374e]"></div>
                  <span>أدمن</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelect("EMPLOYEE")}
                  className="w-full text-right px-4 py-2.5 hover:bg-[#f2f4f6] text-sm text-[#191c1e] flex items-center gap-2.5 cursor-pointer"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-[#003c27]"></div>
                  <span>موظف</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Login Card */}
      <main className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#c0c7ce]/40 overflow-hidden z-10 relative">
        {/* Accent top stripe */}
        <div className="h-2 w-full bg-[#0b4f6c]"></div>

        <div className="p-8">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <HwyatiLogo size={64} showText={false} className="mb-4" />
            <h1 className="text-2xl font-bold text-[#00374e] text-center tracking-tight">
              Hawiyati
            </h1>
            <p className="text-sm text-[#41484d] text-center mt-1">
              {step === "credentials"
                ? "بوابة تسجيل الدخول الموحدة"
                : "التحقق من الجهاز الجديد"}
            </p>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {errorMessage}
            </div>
          )}

          {/* Success Banner */}
          {successMessage && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-700 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* ── STEP 1: Credentials Form ── */}
          {step === "credentials" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Agency Selector */}
              {role === "SUPER_ADMIN" ? (
                <div>
                  <label className="block text-sm font-medium text-[#191c1e] mb-1.5">
                    الجهة الحكومية
                  </label>
                  <div className="w-full bg-[#f2f4f6] border border-[#c0c7ce]/60 rounded-xl py-3 px-4 flex items-center gap-2.5 text-[#191c1e]">
                    <Shield className="w-5 h-5 text-[#00374e]" />
                    <span className="text-sm font-semibold">وزارة الداخلية (نظام شامل)</span>
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-[#191c1e] mb-1.5">
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
                      className="w-full bg-[#f2f4f6] border border-[#71787e]/40 rounded-xl py-3 px-4 pe-12 ps-10 focus:border-[#0b4f6c] focus:ring-2 focus:ring-[#0b4f6c]/20 transition-all text-sm text-[#191c1e] cursor-pointer group-hover:border-[#0b4f6c]"
                    />
                    <Building2 className="w-5 h-5 absolute end-4 top-1/2 -translate-y-1/2 text-[#71787e]" />
                    <ChevronDown className="w-4 h-4 absolute start-4 top-1/2 -translate-y-1/2 text-[#71787e]" />
                  </div>
                </div>
              )}

              {/* National Number */}
              <div>
                <label className="block text-sm font-medium text-[#191c1e] mb-1.5">
                  رقم الهوية الوطنية
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="أدخل رقم الهوية"
                    className="w-full bg-[#f2f4f6] border border-[#71787e]/40 rounded-xl py-3 px-4 pe-12 focus:border-[#0b4f6c] focus:ring-2 focus:ring-[#0b4f6c]/20 transition-all text-sm text-[#191c1e] placeholder-[#41484d]/50"
                  />
                  <User className="w-5 h-5 absolute end-4 top-1/2 -translate-y-1/2 text-[#71787e]" />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-[#191c1e] mb-1.5">
                  كلمة المرور
                </label>
                <div className="relative">
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-[#f2f4f6] border border-[#71787e]/40 rounded-xl py-3 px-4 pe-12 focus:border-[#0b4f6c] focus:ring-2 focus:ring-[#0b4f6c]/20 transition-all text-sm text-[#191c1e] placeholder-[#41484d]/50"
                  />
                  <Lock className="w-5 h-5 absolute end-4 top-1/2 -translate-y-1/2 text-[#71787e]" />
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
                    className="text-xs text-[#0b4f6c] hover:text-[#00374e] transition-colors"
                  >
                    نسيت كلمة المرور؟
                  </a>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-[#0b4f6c] text-white rounded-xl py-3.5 px-4 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#00374e] transition-all active:scale-[0.98] mt-6 shadow-sm cursor-pointer disabled:opacity-70"
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
                <div className="w-14 h-14 rounded-2xl bg-[#0b4f6c]/10 text-[#0b4f6c] mx-auto flex items-center justify-center mb-3">
                  <KeyRound className="w-7 h-7" />
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  تم اكتشاف جهاز جديد. أدخل الرمز المُرسل إلى بريدك الإلكتروني المسجّل.
                </p>
              </div>

              {/* OTP input */}
              <div>
                <label className="block text-sm font-medium text-[#191c1e] mb-1.5">
                  رمز التحقق (6 أرقام)
                </label>
                <input
                  type="text"
                  required
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full bg-[#f2f4f6] border border-[#71787e]/40 rounded-xl py-3 px-4 text-center text-2xl font-mono tracking-widest focus:border-[#0b4f6c] focus:ring-2 focus:ring-[#0b4f6c]/20 transition-all"
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
                    className="text-xs text-[#0b4f6c] hover:underline cursor-pointer font-medium"
                  >
                    ⚡ استرجاع رمز التحقق التجريبي تلقائياً (بيئة التطوير)
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || otpCode.length < 6}
                className="w-full bg-[#0b4f6c] text-white rounded-xl py-3.5 px-4 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#00374e] transition-all active:scale-[0.98] shadow-sm cursor-pointer disabled:opacity-70"
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
                className="w-full text-xs text-gray-400 hover:text-[#0b4f6c] transition-colors py-2"
              >
                العودة لتسجيل الدخول
              </button>
            </form>
          )}
        </div>

        {/* Security Notice Footer */}
        <div className="bg-[#eceef0]/80 py-4 px-8 border-t border-[#c0c7ce]/30 flex items-center justify-center gap-2 text-xs text-[#41484d]">
          <ShieldCheck className="w-4 h-4 text-[#005539] shrink-0" />
          <p className="text-center">هذه البوابة تخضع لإشراف ورقابة الجهات الحكومية المختصة.</p>
        </div>
      </main>

      {/* Agency Selection Overlay */}
      {isAgencyOverlayOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 glassmorphism-overlay animate-in fade-in duration-200">
          <div className="glass-panel rounded-2xl w-full max-w-2xl p-8 relative shadow-2xl animate-in zoom-in-95 duration-200">
            <button
              type="button"
              onClick={() => setIsAgencyOverlayOpen(false)}
              className="absolute top-5 left-5 text-[#71787e] hover:text-[#191c1e] p-1.5 rounded-full hover:bg-slate-200/50 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-[#0b4f6c] mb-2">اختيار الجهة الحكومية</h2>
              <p className="text-sm text-[#41484d]">
                الرجاء اختيار الجهة التابع لها للمتابعة في النظام
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {(
                [
                  { key: "المرور", icon: <Car className="w-7 h-7" />, color: "bg-amber-50 text-amber-700" },
                  { key: "الجوازات", icon: <Plane className="w-7 h-7" />, color: "bg-indigo-50 text-indigo-700" },
                  { key: "الأحوال المدنية", icon: <BadgeAlert className="w-7 h-7" />, color: "bg-sky-50 text-sky-700" },
                  { key: "المستشفيات", icon: <HeartPulse className="w-7 h-7" />, color: "bg-teal-50 text-teal-700" },
                ] as const
              ).map(({ key, icon, color }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => handleAgencySelect(key as AgencyType)}
                  className="agency-card glass-panel rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-[#0b4f6c]"
                >
                  <div
                    className={`w-14 h-14 rounded-2xl ${color} flex items-center justify-center group-hover:scale-110 transition-transform`}
                  >
                    {icon}
                  </div>
                  <span className="text-base font-bold text-[#0b4f6c]">{key}</span>
                </button>
              ))}
            </div>

            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => setIsAgencyOverlayOpen(false)}
                className="text-xs text-[#41484d] hover:text-[#0b4f6c] transition-colors py-2 px-5 rounded-full border border-transparent hover:border-[#c0c7ce] cursor-pointer"
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
