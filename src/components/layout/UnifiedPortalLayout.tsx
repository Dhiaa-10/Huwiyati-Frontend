"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  ShieldAlert,
  Users,
  LogOut,
  Bell,
  Menu,
  X,
  RotateCcw,
  CheckCircle2,
  FileCheck2,
  UserCheck,
  ScrollText,
  Plane,
  BookOpenCheck,
  BarChart3,
  ExternalLink,
  Shield,
  Layers,
  Car,
  HeartPulse,
  Settings,
} from "lucide-react";
import { HwyatiLogo } from "@/components/ui/hwyati-logo";
import { useAuth, RoleType } from "@/context/AuthContext";
import { useSettings } from "@/context/SettingsContext";
import { SettingsModal } from "@/components/settings/SettingsModal";
import { adminService } from "@/lib/api/adminService";

export interface UnifiedPortalLayoutProps {
  portalType: "admin" | "civil-registry" | "passports" | "traffic" | "hospitals";
  portalTitle: string;
  portalSubtitle: string;
  children: React.ReactNode;
}

export function UnifiedPortalLayout({
  portalType,
  portalTitle,
  portalSubtitle,
  children,
}: UnifiedPortalLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, setRole, logout } = useAuth();
  const { language, openSettings } = useSettings();
  const isRtl = language === "ar";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const handleResetData = async () => {
    if (confirm("هل تريد بالتأكيد إعادة ضبط البيانات الوهمية إلى حالتها الافتراضية؟")) {
      await adminService.resetToDefaults();
      setResetSuccess(true);
      setTimeout(() => {
        setResetSuccess(false);
        window.location.reload();
      }, 800);
    }
  };

  // Determine navigation items based on Role and PortalType
  const getNavItems = () => {
    // 1. Super Admin Level
    if (user.role === "SUPER_ADMIN") {
      return [
        {
          label: "لوحة التحكم المركزية",
          href: "/admin",
          icon: LayoutDashboard,
          active: pathname === "/admin",
        },
        {
          label: "إدارة الهيئات والفروع",
          href: "/admin/agencies",
          icon: Building2,
          active: pathname.startsWith("/admin/agencies"),
        },
        {
          label: "سجلات الأمان والتدقيق الموحد",
          href: "/admin/audit-logs",
          icon: ShieldAlert,
          active: pathname.startsWith("/admin/audit-logs"),
        },
      ];
    }

    // 2. Agency Admin (Level 2 - Branch / Agency Director)
    if (user.role === "ADMIN") {
      if (portalType === "passports") {
        return [
          {
            label: "لوحة تحكم ومؤشرات الفرع",
            href: "/passports",
            icon: LayoutDashboard,
            active: pathname === "/passports",
          },
          {
            label: "إدارة ضباط وموظفي الفرع",
            href: "/passports/employees",
            icon: Users,
            active: pathname === "/passports/employees",
          },
          {
            label: "تقارير المعاملات والرقابة",
            href: "/passports/reports",
            icon: BarChart3,
            active: pathname === "/passports/reports",
          },
          {
            label: "اعتماد وفحص طلبات الجوازات",
            href: "/passports/requests",
            icon: FileCheck2,
            active: pathname === "/passports/requests",
          },
        ];
      }

      if (portalType === "traffic") {
        return [
          {
            label: "لوحة تحكم ومؤشرات المرور",
            href: "/traffic",
            icon: LayoutDashboard,
            active: pathname === "/traffic",
          },
          {
            label: "إدارة ضباط ودوريات المرور",
            href: "/traffic/employees",
            icon: Users,
            active: pathname === "/traffic/employees",
          },
          {
            label: "تقارير الحوادث والمخالفات",
            href: "/traffic/reports",
            icon: BarChart3,
            active: pathname === "/traffic/reports",
          },
          {
            label: "إدارة المركبات والمخالفات",
            href: "/traffic/violations",
            icon: Car,
            active: pathname === "/traffic/violations",
          },
          {
            label: "رخص القيادة الذكية",
            href: "/traffic/licenses",
            icon: FileCheck2,
            active: pathname === "/traffic/licenses",
          },
          {
            label: "سجل المركبات والملكيات",
            href: "/traffic/vehicles",
            icon: BookOpenCheck,
            active: pathname === "/traffic/vehicles",
          },
        ];
      }

      if (portalType === "hospitals") {
        return [
          {
            label: "لوحة تحكم ومؤشرات المستشفى",
            href: "/hospitals",
            icon: LayoutDashboard,
            active: pathname === "/hospitals",
          },
          {
            label: "إدارة الأطباء والكادر الطبي",
            href: "/hospitals/employees",
            icon: Users,
            active: pathname === "/hospitals/employees",
          },
          {
            label: "تقارير وإحصائيات المستشفى",
            href: "/hospitals/reports",
            icon: BarChart3,
            active: pathname === "/hospitals/reports",
          },
          {
            label: "السجل الطبي الموحد (EHR)",
            href: "/hospitals/records",
            icon: FileCheck2,
            active: pathname === "/hospitals/records",
          },
          {
            label: "تسجيل الوقائع الحيوية",
            href: "/hospitals/vital-events",
            icon: ScrollText,
            active: pathname === "/hospitals/vital-events",
          },
          {
            label: "طوارئ وفرز سريع",
            href: "/hospitals/emergency",
            icon: ShieldAlert,
            active: pathname === "/hospitals/emergency",
          },
        ];
      }

      // Civil Registry Admin
      return [
        {
          label: "لوحة تحكم ومؤشرات الفرع",
          href: "/civil-registry",
          icon: LayoutDashboard,
          active: pathname === "/civil-registry",
        },
        {
          label: "إدارة موظفي الفرع والصلاحيات",
          href: "/civil-registry/employees",
          icon: Users,
          active: pathname === "/civil-registry/employees",
        },
        {
          label: "تقارير المعاملات والإحصائيات",
          href: "/civil-registry/reports",
          icon: BarChart3,
          active: pathname === "/civil-registry/reports",
        },
        {
          label: "مراجعة وتدقيق الطلبات",
          href: "/civil-registry/requests",
          icon: FileCheck2,
          active: pathname === "/civil-registry/requests",
        },
      ];
    }

    // 3. Operational Officer (Level 3 - Operations & Frontline)
    if (portalType === "passports") {
      return [
        {
          label: "فحص ومعالجة طلبات الجوازات",
          href: "/passports/requests",
          icon: FileCheck2,
          active: pathname === "/passports/requests",
        },
        {
          label: "الرقابة بالمنافذ وسجلات السفر",
          href: "/passports/travel-records",
          icon: Plane,
          active: pathname === "/passports/travel-records",
        },
        {
          label: "سجل الجوازات الإلكترونية المعتمدة",
          href: "/passports/issued",
          icon: BookOpenCheck,
          active: pathname === "/passports/issued",
        },
      ];
    }

    if (portalType === "traffic") {
      return [
        {
          label: "رخص القيادة الذكية",
          href: "/traffic/licenses",
          icon: FileCheck2,
          active: pathname === "/traffic/licenses",
        },
        {
          label: "المركبات وقيد المخالفات",
          href: "/traffic/violations",
          icon: Car,
          active: pathname === "/traffic/violations",
        },
        {
          label: "سجل المركبات والملكيات",
          href: "/traffic/vehicles",
          icon: BookOpenCheck,
          active: pathname === "/traffic/vehicles",
        },
      ];
    }

    if (portalType === "hospitals") {
      return [
        {
          label: "السجل الطبي الموحد (EHR)",
          href: "/hospitals/records",
          icon: FileCheck2,
          active: pathname === "/hospitals/records",
        },
        {
          label: "طوارئ وفرز سريع",
          href: "/hospitals/emergency",
          icon: ShieldAlert,
          active: pathname === "/hospitals/emergency",
        },
        {
          label: "تسجيل الوقائع الحيوية",
          href: "/hospitals/vital-events",
          icon: ScrollText,
          active: pathname === "/hospitals/vital-events",
        },
      ];
    }

    // Civil Registry Officer
    return [
      {
        label: "تفعيل حسابات المواطنين حضورياً",
        href: "/civil-registry/activations",
        icon: UserCheck,
        active: pathname === "/civil-registry/activations",
      },
      {
        label: "مراجعة وتدقيق المستندات",
        href: "/civil-registry/requests",
        icon: FileCheck2,
        active: pathname === "/civil-registry/requests",
      },
      {
        label: "قيد وتوثيق الوقائع الحيوية",
        href: "/civil-registry/vital-events",
        icon: ScrollText,
        active: pathname === "/civil-registry/vital-events",
      },
    ];
  };

  const navItems = getNavItems();

  return (
    <div className="bg-[#f7f9fb] text-[#191c1e] min-h-screen flex flex-col md:flex-row font-['IBM_Plex_Sans_Arabic'] antialiased">
      {/* Mobile Header Bar */}
      <header className="md:hidden flex justify-between items-center w-full px-4 h-16 sticky top-0 z-50 bg-[#00374e] text-white border-b border-[#0b4f6c] shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 rounded-lg text-white/80 hover:bg-white/10"
            aria-label="فتح القائمة"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <HwyatiLogo size={28} showText={false} />
            <span className="font-bold text-sm text-white">{portalTitle}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={openSettings}
            title={isRtl ? "إعدادات المنظومة والمظهر" : "Settings"}
            className="p-2 text-[#97cdef] hover:text-white"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button
            onClick={handleResetData}
            title="إعادة ضبط البيانات"
            className="p-2 text-[#97cdef] hover:text-white"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
          <button onClick={handleLogout} className="p-2 text-rose-300 hover:text-rose-100">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Unified Side Navigation Bar (Desktop & Mobile Drawer) */}
      <aside
        className={`fixed ${isRtl ? "right-0 border-l" : "left-0 border-r"} top-0 h-full flex flex-col z-[60] border-[#c0c7ce]/20 bg-[#00374e] text-white w-72 shadow-2xl transition-transform duration-300 ${
          mobileMenuOpen
            ? "translate-x-0"
            : isRtl
            ? "translate-x-full md:translate-x-0"
            : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 flex flex-col items-center border-b border-[#c5e7ff]/10 relative text-center">
          <button
            onClick={() => setMobileMenuOpen(false)}
            className={`md:hidden absolute top-4 ${isRtl ? "left-4" : "right-4"} text-white/70 hover:text-white`}
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-16 h-16 rounded-2xl bg-[#0b4f6c] flex items-center justify-center mb-3 border-2 border-[#97cdef]/40 shadow-inner p-2">
            <HwyatiLogo size={46} showText={false} />
          </div>
          <h1 className="text-base font-extrabold text-white tracking-tight">
            {portalTitle}
          </h1>
          <p className="text-xs text-[#8ac0e1] font-medium mt-1">
            {portalSubtitle}
          </p>

          {/* Current Branch & Role Chip */}
          <div className="mt-3 w-full bg-[#001e2d]/60 rounded-xl px-3 py-2 border border-[#8ac0e1]/20 flex items-center justify-between text-right">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-gray-400 block truncate">الفرع الحالي:</span>
              <span className="text-xs font-bold text-white truncate block">
                {user.branchName}
              </span>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                user.role === "SUPER_ADMIN"
                  ? "bg-rose-500/20 text-rose-300 border border-rose-400/30"
                  : user.role === "ADMIN"
                  ? "bg-blue-500/20 text-blue-300 border border-blue-400/30"
                  : "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30"
              }`}
            >
              {user.role === "SUPER_ADMIN"
                ? "سوبر أدمن"
                : user.role === "ADMIN"
                ? "أدمن المؤسسة"
                : "موظف مختص"}
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-4 flex flex-col gap-1 px-3 overflow-y-auto">
          <div className="px-3 py-1.5 text-[11px] font-semibold text-white/40 uppercase tracking-wider">
            القوائم التشغيلية والخدمات
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  item.active
                    ? "bg-[#0b4f6c] text-[#8ac0e1] shadow-md border-r-4 border-[#97cdef] font-bold"
                    : "text-white/75 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${item.active ? "text-[#97cdef]" : "text-white/60"}`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* Quick Cross-Portal Switcher — visible only to SuperAdmin or super_admin_switch sessions */}
          {(user.role === "SUPER_ADMIN" || user.loginSource === "super_admin_switch") && (
            <>
              <div className="pt-4 pb-2 px-3 text-[11px] font-bold text-white/40 tracking-wider">
                بوابات المنظومة
              </div>
              {portalType !== "admin" && (
                <Link
                  href="/admin"
                  className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-white/70 hover:bg-white/5 hover:text-white transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-emerald-400" />
                    بوابة السوبر أدمن
                  </span>
                  <ExternalLink className="w-3 h-3 text-white/30" />
                </Link>
              )}

              {portalType !== "civil-registry" && (
                <Link
                  href="/civil-registry"
                  className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-white/70 hover:bg-white/5 hover:text-white transition-all"
                >
                  <span className="flex items-center gap-2">
                    <HwyatiLogo size={14} showText={false} />
                    الأحوال المدنية
                  </span>
                  <ExternalLink className="w-3 h-3 text-white/30" />
                </Link>
              )}

              {portalType !== "passports" && (
                <Link
                  href="/passports"
                  className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-white/70 hover:bg-white/5 hover:text-white transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Plane className="w-3.5 h-3.5 text-amber-400" />
                    الهجرة والجوازات
                  </span>
                  <ExternalLink className="w-3 h-3 text-white/30" />
                </Link>
              )}

              {portalType !== "traffic" && (
                <Link
                  href="/traffic"
                  className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-white/70 hover:bg-white/5 hover:text-white transition-all"
                >
                  <span className="flex items-center gap-2">
                    <Car className="w-3.5 h-3.5 text-blue-400" />
                    الإدارة العامة للمرور
                  </span>
                  <ExternalLink className="w-3 h-3 text-white/30" />
                </Link>
              )}

              {portalType !== "hospitals" && (
                <Link
                  href="/hospitals"
                  className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs text-white/70 hover:bg-white/5 hover:text-white transition-all"
                >
                  <span className="flex items-center gap-2">
                    <HeartPulse className="w-3.5 h-3.5 text-rose-400" />
                    المستشفيات والمنظومة الصحية
                  </span>
                  <ExternalLink className="w-3 h-3 text-white/30" />
                </Link>
              )}
            </>
          )}
        </nav>

        {/* User Card & Logout Button */}
        <div className="p-4 border-t border-[#c5e7ff]/10 bg-[#001e2d]/60 mt-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#0b4f6c] border border-[#8ac0e1]/40 flex items-center justify-center font-bold text-white text-xs shrink-0">
              {(() => {
                const cleaned = (user.fullName || "")
                  .replace(/^(م\.|د\.|العقيد\s+ركن|العقيد|العميد|المقدم|الرائد|النقيب|الملازم\s+أول|الملازم|المساعد|اللواء\s+د\.|اللواء|القاضي)\s+/, "")
                  .trim();
                const parts = cleaned.split(/\s+/);
                return parts.length >= 2 ? `${parts[0][0]}.${parts[parts.length - 1][0]}` : (parts[0]?.[0] || "م");
              })()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user.fullName}</p>
              <p className="text-[11px] text-[#8ac0e1] truncate">{user.jobTitle}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium text-rose-300 bg-rose-900/30 hover:bg-rose-900/50 border border-rose-800/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج من البوابة</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 ${isRtl ? "md:mr-72" : "md:ml-72"} min-h-screen flex flex-col overflow-x-hidden`}>
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-[#c0c7ce]/30 px-6 flex items-center justify-between sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3">
            <div className="bg-[#0b4f6c]/10 text-[#0b4f6c] p-2 rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#00374e]">{portalTitle}</h2>
              <p className="text-[11px] text-gray-500">{portalSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Interactive Authority Level Selector — SuperAdmin only */}
            {user.role === "SUPER_ADMIN" && (() => {
              const r: string = user.role;
              return (
                <div className="hidden sm:flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200 text-xs">
                  <span className="text-[11px] font-bold text-gray-500 px-2">مستوى الصلاحية:</span>
                  <button
                    type="button"
                    onClick={() => setRole("SUPER_ADMIN")}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      r === "SUPER_ADMIN"
                        ? "bg-[#ba1a1a] text-white shadow-sm"
                        : "text-gray-600 hover:text-black hover:bg-gray-200"
                    }`}
                  >
                    سوبر أدمن
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("ADMIN")}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      r === "ADMIN"
                        ? "bg-[#00374e] text-white shadow-sm"
                        : "text-gray-600 hover:text-black hover:bg-gray-200"
                    }`}
                  >
                    أدمن المؤسسة
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("EMPLOYEE")}
                    className={`px-3 py-1 rounded-lg font-bold transition-all ${
                      r === "EMPLOYEE"
                        ? "bg-[#003c27] text-white shadow-sm"
                        : "text-gray-600 hover:text-black hover:bg-gray-200"
                    }`}
                  >
                    موظف مختص
                  </button>
                </div>
              );
            })()}

            {/* Reset Defaults button */}
            <button
              onClick={handleResetData}
              title="إعادة ضبط البيانات الوهمية"
              className="p-2 text-gray-500 hover:text-[#0b4f6c] hover:bg-gray-100 rounded-lg transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Notifications */}
            <button className="p-2 text-gray-500 hover:text-[#0b4f6c] hover:bg-gray-100 rounded-lg relative transition-colors">
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-rose-500 absolute top-2 right-2"></span>
            </button>

            {/* Settings */}
            <button
              onClick={openSettings}
              title={isRtl ? "إعدادات المنظومة والمظهر" : "System & Appearance Settings"}
              className="p-2 text-gray-500 hover:text-[#0b4f6c] dark:text-gray-400 dark:hover:text-[#8ac0e1] hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {resetSuccess && (
          <div className="bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs px-6 py-2 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>تمت استعادة البيانات الأصلية بنجاح.</span>
          </div>
        )}

        {/* Portal Body Content */}
        <div className="flex-1 p-4 md:p-8 bg-[#f7f9fb]">{children}</div>
      </main>

      {/* Central System & Appearance Settings Modal */}
      <SettingsModal />
    </div>
  );
}

