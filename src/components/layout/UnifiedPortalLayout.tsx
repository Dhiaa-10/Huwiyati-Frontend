"use client";

import React, { useState, useEffect } from "react";
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
  CreditCard,
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
  const { user, logout, isAuthenticated, isInitialized } = useAuth();
  const { language, openSettings } = useSettings();
  const isRtl = language === "ar";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Strict Role Boundary & Session Protection:
  // 1. Unauthenticated sessions are redirected immediately to /login
  // 2. SuperAdmin is strictly confined to /admin (sovereign supervision).
  // 3. Operational roles are strictly confined to their agency portals.
  useEffect(() => {
    if (!isInitialized) return;

    if (!isAuthenticated || user.role === "NONE" || !user.role) {
      router.replace("/login");
      return;
    }

    if (user.role === "SUPER_ADMIN" && portalType !== "admin") {
      router.replace("/admin");
    } else if (user.role !== "SUPER_ADMIN" && portalType === "admin") {
      if (user.agency === "الأحوال المدنية") router.replace("/civil-registry");
      else if (user.agency === "الجوازات") router.replace("/passports");
      else if (user.agency === "المرور") router.replace("/traffic");
      else if (user.agency === "المستشفيات") router.replace("/hospitals");
      else router.replace("/login");
    }
  }, [user.role, user.agency, isAuthenticated, isInitialized, portalType, router]);

  const handleLogout = () => {
    logout();
    router.replace("/login");
  };

  // Determine navigation items based on Role and PortalType
  const getNavItems = () => {
    // 1. Super Admin Level
    if (user.role === "SUPER_ADMIN") {
      return [
        {
          label: "لوحة القيادة المركزية",
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
          label: "تكليف وإدارة مدراء الفروع",
          href: "/admin/admins",
          icon: UserCheck,
          active: pathname.startsWith("/admin/admins"),
        },
        {
          label: "السجل المركزي للمواطنين",
          href: "/admin/citizens",
          icon: BookOpenCheck,
          active: pathname.startsWith("/admin/citizens"),
        },
        // سجلات التدقيق والإعدادات مؤجلة — لا يوجد endpoint في الباكند حالياً
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
            label: "سجل الجوازات الإلكترونية والإصدار",
            href: "/passports/issued",
            icon: BookOpenCheck,
            active: pathname.startsWith("/passports/issued"),
          },
          {
            label: "الرقابة بالمنافذ وسجلات السفر",
            href: "/passports/travel-records",
            icon: Plane,
            active: pathname.startsWith("/passports/travel-records"),
          },
          {
            label: "تقارير وإحصائيات السفر",
            href: "/passports/reports",
            icon: BarChart3,
            active: pathname === "/passports/reports",
          },
          {
            label: "إدارة ضباط وموظفي الفرع",
            href: "/passports/employees",
            icon: Users,
            active: pathname === "/passports/employees",
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
          label: "إدارة البطاقات الشخصية",
          href: "/civil-registry/id-cards",
          icon: CreditCard,
          active: pathname.startsWith("/civil-registry/id-cards"),
        },
        {
          label: "القيود والبطاقات العائلية",
          href: "/civil-registry/families",
          icon: Users,
          active: pathname.startsWith("/civil-registry/families"),
        },
        {
          label: "توثيق الوقائع الحيوية",
          href: "/civil-registry/vital-events",
          icon: ScrollText,
          active: pathname.startsWith("/civil-registry/vital-events"),
        },
        {
          label: "إدارة موظفي الفرع والصلاحيات",
          href: "/civil-registry/employees",
          icon: UserCheck,
          active: pathname === "/civil-registry/employees",
        },
      ];
    }

    // 3. Operational Officer (Level 3 - Operations & Frontline)
    if (portalType === "passports") {
      return [
        {
          label: "سجل الجوازات الإلكترونية المعتمدة",
          href: "/passports/issued",
          icon: BookOpenCheck,
          active: pathname.startsWith("/passports/issued"),
        },
        {
          label: "الرقابة بالمنافذ وسجلات السفر",
          href: "/passports/travel-records",
          icon: Plane,
          active: pathname.startsWith("/passports/travel-records"),
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
        label: "لوحة تحكم السجل المدني",
        href: "/civil-registry",
        icon: LayoutDashboard,
        active: pathname === "/civil-registry",
      },
      {
        label: "إدارة البطاقات الشخصية",
        href: "/civil-registry/id-cards",
        icon: CreditCard,
        active: pathname.startsWith("/civil-registry/id-cards"),
      },
      {
        label: "القيود والبطاقات العائلية",
        href: "/civil-registry/families",
        icon: Users,
        active: pathname.startsWith("/civil-registry/families"),
      },
      {
        label: "توثيق الوقائع الحيوية",
        href: "/civil-registry/vital-events",
        icon: ScrollText,
        active: pathname.startsWith("/civil-registry/vital-events"),
      },
    ];
  };

  const navItems = getNavItems();

  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-[#052F31] flex items-center justify-center" dir="rtl">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-[#0C4A4E] border-t-[#147A77] rounded-full animate-spin"></div>
          <span className="text-[#BFE5DF] text-xs font-semibold">جارٍ التحقق من صلاحيات الجلسة...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user.role === "NONE" || !user.role) {
    return null;
  }

  return (
    <div className="bg-[#FBFBF8] text-[#163D42] min-h-screen flex flex-col md:flex-row antialiased font-sans">
      {/* Mobile Header Bar */}
      <header className="md:hidden flex justify-between items-center w-full px-4 h-16 sticky top-0 z-50 bg-[#052F31] text-white border-b border-[#0C4A4E] shadow-md">
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
            className="p-2 text-[#BFE5DF] hover:text-white"
          >
            <Settings className="w-5 h-5" />
          </button>
          <button onClick={handleLogout} className="p-2 text-rose-300 hover:text-rose-100">
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Unified Side Navigation Bar (Desktop & Mobile Drawer) */}
      <aside
        className={`fixed ${isRtl ? "right-0 border-l" : "left-0 border-r"} top-0 h-full flex flex-col z-[60] border-[#E7EEEB]/15 bg-[#052F31] text-white w-72 shadow-2xl transition-transform duration-300 ${
          mobileMenuOpen
            ? "translate-x-0"
            : isRtl
            ? "translate-x-full md:translate-x-0"
            : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 flex flex-col items-center border-b border-[#BFE5DF]/10 relative text-center">
          <button
            onClick={() => setMobileMenuOpen(false)}
            className={`md:hidden absolute top-4 ${isRtl ? "left-4" : "right-4"} text-white/70 hover:text-white`}
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-16 h-16 rounded-2xl bg-[#0C4A4E] flex items-center justify-center mb-3 border-2 border-[#BFE5DF]/30 shadow-inner p-2">
            <HwyatiLogo size={46} showText={false} />
          </div>
          <h1 className="text-base font-extrabold text-white tracking-tight">
            {portalTitle}
          </h1>
          <p className="text-xs text-[#BFE5DF] font-medium mt-1">
            {portalSubtitle}
          </p>

          {/* Current Branch & Role Chip */}
          <div className="mt-3 w-full bg-[#031F21]/80 rounded-xl px-3 py-2 border border-[#BFE5DF]/15 flex items-center justify-between text-right">
            <div className="min-w-0 flex-1">
              <span className="text-[10px] text-[#BFE5DF]/70 block truncate">الفرع الحالي:</span>
              <span className="text-xs font-bold text-white truncate block">
                {user.branchName}
              </span>
            </div>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                user.role === "SUPER_ADMIN"
                  ? "bg-[#0C4A4E] text-[#BFE5DF] border border-[#BFE5DF]/30"
                  : user.role === "ADMIN"
                  ? "bg-[#103F43] text-[#BFE5DF] border border-[#147A77]/40"
                  : "bg-[#147A77]/40 text-[#BFE5DF] border border-[#147A77]/50"
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
                    ? "bg-[#0C4A4E] text-[#BFE5DF] shadow-md border-r-4 border-[#147A77] font-bold"
                    : "text-white/75 hover:text-white hover:bg-white/10"
                }`}
              >
                <Icon
                  className={`w-5 h-5 ${item.active ? "text-[#BFE5DF]" : "text-white/60"}`}
                />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* User Card & Logout Button */}
        <div className="p-4 border-t border-[#BFE5DF]/10 bg-[#031F21]/80 mt-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full bg-[#0C4A4E] border border-[#BFE5DF]/40 flex items-center justify-center font-bold text-white text-xs shrink-0">
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
              <p className="text-[11px] text-[#BFE5DF] truncate">{user.jobTitle}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium text-rose-200 bg-rose-900/30 hover:bg-rose-900/50 border border-rose-800/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>تسجيل الخروج من البوابة</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={`flex-1 ${isRtl ? "md:mr-72" : "md:ml-72"} min-h-screen flex flex-col overflow-x-hidden`}>
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-[#E7EEEB] px-6 flex items-center justify-between sticky top-0 z-30 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-3">
            <div className="bg-[#E6F1EE] text-[#0C4A4E] p-2 rounded-lg">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#163D42]">{portalTitle}</h2>
              <p className="text-[11px] text-[#456A6D]">{portalSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Authority level badge — read-only display */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#F1F6F4] rounded-xl border border-[#E7EEEB] text-xs">
              <span
                className={`w-2 h-2 rounded-full ${
                  user.role === "SUPER_ADMIN"
                    ? "bg-[#052F31]"
                    : user.role === "ADMIN"
                    ? "bg-[#0C4A4E]"
                    : "bg-[#147A77]"
                }`}
              />
              <span className="font-bold text-[#163D42]">
                {user.role === "SUPER_ADMIN"
                  ? "سوبر أدمن • الإشراف والرقابة المركزية"
                  : user.role === "ADMIN"
                  ? `أدمن المؤسسة • ${user.agency}`
                  : `موظف مختص • ${user.agency}`}
              </span>
            </div>

            {/* Notifications */}
            <button className="p-2 text-[#456A6D] hover:text-[#0C4A4E] hover:bg-[#F1F6F4] rounded-lg relative transition-colors cursor-pointer">
              <Bell className="w-4 h-4" />
              <span className="w-2 h-2 rounded-full bg-[#B76648] absolute top-2 right-2"></span>
            </button>

            {/* Settings */}
            <button
              onClick={openSettings}
              title={isRtl ? "إعدادات المنظومة والمظهر" : "System & Appearance Settings"}
              className="p-2 text-[#456A6D] hover:text-[#0C4A4E] dark:text-[#BFE5DF] dark:hover:text-white hover:bg-[#F1F6F4] dark:hover:bg-white/5 rounded-lg transition-colors cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Portal Body Content */}
        <div className="flex-1 p-4 md:p-8 bg-[#FBFBF8]">{children}</div>
      </main>

      {/* Central System & Appearance Settings Modal */}
      <SettingsModal />
    </div>
  );
}

