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
} from "lucide-react";
import { HwyatiLogo } from "@/components/ui/hwyati-logo";
import { useAuth, getProfileForRoleAndAgency } from "@/context/AuthContext";

type RoleType = "SUPER_ADMIN" | "ADMIN" | "EMPLOYEE";
type AgencyType = "المرور" | "الجوازات" | "الأحوال المدنية" | "المستشفيات";

export default function LoginPage() {
  const router = useRouter();
  const { updateSession } = useAuth();

  // State
  const [role, setRole] = useState<RoleType>("SUPER_ADMIN");
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [agency, setAgency] = useState<AgencyType>("الأحوال المدنية");
  const [isAgencyOverlayOpen, setIsAgencyOverlayOpen] = useState(false);

  // Form State
  const [identifier, setIdentifier] = useState("100100200300");
  const [password, setPassword] = useState("••••••••");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Role details
  const roleConfig = {
    SUPER_ADMIN: {
      label: "سوبر أدمن",
      indicatorColor: "bg-[#ba1a1a]",
      defaultAgency: "وزارة الداخلية (نظام شامل)",
    },
    ADMIN: {
      label: "أدمن",
      indicatorColor: "bg-[#00374e]",
      defaultAgency: agency,
    },
    EMPLOYEE: {
      label: "موظف",
      indicatorColor: "bg-[#003c27]",
      defaultAgency: agency,
    },
  };

  const handleRoleSelect = (newRole: RoleType) => {
    setRole(newRole);
    setIsRoleMenuOpen(false);
    setErrorMessage("");

    if (newRole === "SUPER_ADMIN") {
      setIdentifier("100100200300");
    } else if (newRole === "ADMIN") {
      setIdentifier("010100987654");
    } else {
      setIdentifier("020200554433");
    }
  };

  const handleAgencySelect = (selected: AgencyType) => {
    setAgency(selected);
    setIsAgencyOverlayOpen(false);
  };

  // Direct Login -> No OTP
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!identifier.trim()) {
      setErrorMessage("يرجى إدخال رقم الهوية أو البريد الإلكتروني");
      return;
    }

    if (!password.trim()) {
      setErrorMessage("يرجى إدخال كلمة المرور");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);

      const profile = getProfileForRoleAndAgency(role, agency as any);
      updateSession({
        fullName: profile.fullName,
        nationalNumber: profile.nationalNumber,
        role: role,
        agency: profile.agency,
        branchName: profile.branchName,
        jobTitle: profile.jobTitle,
        loginSource: "login_page", // locked to own portal — no cross-portal navigation
      });

      if (role === "SUPER_ADMIN") {
        router.push("/admin");
      } else if (role === "ADMIN") {
        if (agency === "الأحوال المدنية") {
          router.push("/civil-registry");
        } else if (agency === "الجوازات") {
          router.push("/passports");
        } else if (agency === "المرور") {
          router.push("/traffic");
        } else if (agency === "المستشفيات") {
          router.push("/hospitals");
        } else {
          router.push("/admin");
        }
      } else {
        // EMPLOYEE
        if (agency === "الأحوال المدنية") {
          router.push("/civil-registry/activations");
        } else if (agency === "الجوازات") {
          router.push("/passports/requests");
        } else if (agency === "المرور") {
          router.push("/traffic/violations");
        } else if (agency === "المستشفيات") {
          router.push("/hospitals/records");
        } else {
          router.push("/civil-registry/activations");
        }
      }
    }, 600);
  };

  return (
    <div className="bg-[#f7f9fb] min-h-screen flex flex-col items-center justify-center font-['IBM_Plex_Sans_Arabic'] text-[#191c1e] p-4 md:p-10 relative overflow-x-hidden">
      {/* Background Decorative Gradient Blobs from Stitch */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden flex justify-center items-center opacity-40">
        <div className="absolute w-[800px] h-[800px] bg-[#0b4f6c]/5 rounded-full blur-3xl -top-1/4 -right-1/4"></div>
        <div className="absolute w-[600px] h-[600px] bg-[#e7ded9]/20 rounded-full blur-3xl bottom-0 -left-1/4"></div>
      </div>

      {/* Role Selector in the top corner */}
      <div className="absolute top-6 left-6 z-20">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
            className="bg-white border border-[#c0c7ce]/40 rounded-full py-2 px-4 flex items-center gap-2 shadow-xs hover:bg-[#f2f4f6] transition-colors cursor-pointer"
          >
            <div className={`w-3 h-3 rounded-full ${roleConfig[role].indicatorColor}`}></div>
            <span className="text-sm font-medium text-[#191c1e]">
              {roleConfig[role].label}
            </span>
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

      {/* Main Login Card */}
      <main className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#c0c7ce]/40 overflow-hidden z-10 relative">
        {/* Ambient Top Highlight */}
        <div className="h-2 w-full bg-[#0b4f6c]"></div>

        <div className="p-8">
          {/* Header with Official Fingerprint Logo */}
          <div className="flex flex-col items-center mb-8">
            <HwyatiLogo size={64} showText={false} className="mb-4" />
            <h1 className="text-2xl font-bold text-[#00374e] text-center tracking-tight">
              Hawiyati
            </h1>
            <p className="text-sm text-[#41484d] text-center mt-1">
              بوابة تسجيل الدخول الموحدة
            </p>
          </div>

          {errorMessage && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700">
              {errorMessage}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            {/* Department Selector */}
            {role === "SUPER_ADMIN" ? (
              <div>
                <label className="block text-sm font-medium text-[#191c1e] mb-1.5">
                  الجهة الحكومية
                </label>
                <div className="w-full bg-[#f2f4f6] border border-[#c0c7ce]/60 rounded-xl py-3 px-4 flex items-center gap-2.5 text-[#191c1e]">
                  <Shield className="w-5 h-5 text-[#00374e]" />
                  <span className="text-sm font-semibold">
                    وزارة الداخلية (نظام شامل)
                  </span>
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

            {/* National ID / Email */}
            <div>
              <label className="block text-sm font-medium text-[#191c1e] mb-1.5">
                رقم الهوية الوطنية / البريد الإلكتروني
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="أدخل رقم الهوية أو البريد"
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
                    alert("يرجى التواصل مع مسؤول النظام لإعادة تعيين كلمة المرور.");
                  }}
                  className="text-xs text-[#0b4f6c] hover:text-[#00374e] transition-colors"
                >
                  نسيت كلمة المرور؟
                </a>
              </div>
            </div>

            {/* Direct Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#0b4f6c] text-white rounded-xl py-3.5 px-4 text-sm font-semibold flex items-center justify-center gap-2 hover:bg-[#00374e] transition-all active:scale-[0.98] mt-6 shadow-sm cursor-pointer disabled:opacity-70"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>جاري تسجيل الدخول...</span>
                </>
              ) : (
                <>
                  <span>تسجيل الدخول</span>
                  <ArrowLeft className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer / Security Notice */}
        <div className="bg-[#eceef0]/80 py-4 px-8 border-t border-[#c0c7ce]/30 flex items-center justify-center gap-2 text-xs text-[#41484d]">
          <ShieldCheck className="w-4 h-4 text-[#005539] shrink-0" />
          <p className="text-center">
            هذه البوابة تخضع لإشراف ورقابة الجهات الحكومية المختصة.
          </p>
        </div>
      </main>

      {/* AGENCY SELECTION GLASS OVERLAY */}
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
              <h2 className="text-2xl font-bold text-[#0b4f6c] mb-2">
                اختيار الجهة الحكومية
              </h2>
              <p className="text-sm text-[#41484d]">
                الرجاء اختيار الجهة التابع لها للمتابعة في النظام
              </p>
            </div>

            {/* 4-Cards Grid */}
            <div className="grid grid-cols-2 gap-4">
              {/* Traffic */}
              <button
                type="button"
                onClick={() => handleAgencySelect("المرور")}
                className="agency-card glass-panel rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-[#0b4f6c]"
              >
                <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Car className="w-7 h-7" />
                </div>
                <span className="text-base font-bold text-[#0b4f6c]">
                  المرور
                </span>
              </button>

              {/* Passports */}
              <button
                type="button"
                onClick={() => handleAgencySelect("الجوازات")}
                className="agency-card glass-panel rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-[#0b4f6c]"
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Plane className="w-7 h-7" />
                </div>
                <span className="text-base font-bold text-[#0b4f6c]">
                  الجوازات
                </span>
              </button>

              {/* Civil Registry */}
              <button
                type="button"
                onClick={() => handleAgencySelect("الأحوال المدنية")}
                className="agency-card glass-panel rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-[#0b4f6c]"
              >
                <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BadgeAlert className="w-7 h-7" />
                </div>
                <span className="text-base font-bold text-[#0b4f6c]">
                  الأحوال المدنية
                </span>
              </button>

              {/* Hospitals */}
              <button
                type="button"
                onClick={() => handleAgencySelect("المستشفيات")}
                className="agency-card glass-panel rounded-xl p-6 flex flex-col items-center justify-center gap-3 cursor-pointer group focus:outline-none focus:ring-2 focus:ring-[#0b4f6c]"
              >
                <div className="w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <HeartPulse className="w-7 h-7" />
                </div>
                <span className="text-base font-bold text-[#0b4f6c]">
                  المستشفيات
                </span>
              </button>
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
