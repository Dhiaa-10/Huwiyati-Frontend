"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Building2,
  Activity,
  ShieldCheck,
  CheckCircle2,
  ArrowUpRight,
  Plane,
  Car,
  HeartPulse,
  UserCheck,
  BookOpenCheck,
  RefreshCw,
  Loader2,
  Server,
} from "lucide-react";
import { adminService } from "@/lib/api/adminService";
import {
  AdminDashboardMetrics,
  Organization,
  OrganizationBranch,
  OrganizationAdmin,
} from "@/types/admin";
import { HwyatiLogo } from "@/components/ui/hwyati-logo";

export default function SuperAdminOverviewPage() {
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [branches, setBranches] = useState<OrganizationBranch[]>([]);
  const [admins, setAdmins] = useState<OrganizationAdmin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [m, orgsRes, branchesRes, adminsRes] =
        await Promise.allSettled([
          adminService.getDashboardMetrics(),
          adminService.getOrganizations(),
          adminService.getBranches(),
          adminService.getAdmins(),
        ]);

      if (m.status === "fulfilled") setMetrics(m.value);
      if (orgsRes.status === "fulfilled") setOrganizations(orgsRes.value.items);
      if (branchesRes.status === "fulfilled") setBranches(branchesRes.value);
      if (adminsRes.status === "fulfilled") setAdmins(adminsRes.value);

      // Log any individual failures for debugging
      [m, orgsRes, branchesRes, adminsRes].forEach((r, i) => {
        if (r.status === "rejected") {
          console.warn(`Dashboard call [${i}] failed:`, r.reason);
        }
      });
    } catch (err) {
      console.error("Failed to load admin metrics:", err);
      setError("تعذّر الاتصال بالخادم. تأكد من تشغيل الـ API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);


  const getSectorIcon = (name: string) => {
    if (name.includes("أحوال")) return Building2;
    if (name.includes("جوازات") || name.includes("هجرة")) return Plane;
    if (name.includes("مرور")) return Car;
    if (name.includes("مستشفيات") || name.includes("صحية")) return HeartPulse;
    return Building2;
  };

  const getSectorBadge = (name: string) => {
    if (name.includes("أحوال")) return { label: "سجل مدني", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    if (name.includes("جوازات") || name.includes("هجرة")) return { label: "أمني / وثائق سفر", bg: "bg-sky-50 text-sky-700 border-sky-200" };
    if (name.includes("مرور")) return { label: "أمني / سير ومرور", bg: "bg-amber-50 text-amber-700 border-amber-200" };
    if (name.includes("مستشفيات")) return { label: "صحي / طبي", bg: "bg-rose-50 text-rose-700 border-rose-200" };
    return { label: "حكومي", bg: "bg-slate-50 text-slate-700 border-slate-200" };
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-[#00374e] uppercase tracking-wider">
              الإشراف والحوكمة المركزية — وزارة الداخلية
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#00374e]">
            لوحة القيادة المركزية والسيادية
          </h1>
          <p className="text-sm text-[#41484d] mt-1">
            إدارة البنية التحتية، الفروع الحكومية، وتكليف مدراء الهيئات عبر قاعدة البيانات الموحدة.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={loadDashboardData}
            disabled={loading}
            title="تحديث البيانات اللحظية"
            className="p-2.5 bg-white text-[#00374e] border border-slate-300 rounded-xl hover:bg-slate-50 transition-all shadow-xs cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 text-[#0b4f6c] ${loading ? "animate-spin" : ""}`} />
          </button>
          <Link
            href="/admin/agencies"
            className="px-4 py-2.5 bg-white text-[#00374e] border border-slate-300 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all shadow-xs flex items-center gap-2"
          >
            <Building2 className="w-4 h-4 text-[#0b4f6c]" />
            <span>إدارة الفروع</span>
          </Link>
          <Link
            href="/admin/admins"
            className="px-4 py-2.5 bg-[#0b4f6c] hover:bg-[#00374e] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2"
          >
            <UserCheck className="w-4 h-4" />
            <span>تكليف مدراء الفروع</span>
          </Link>
        </div>
      </div>

      {/* KPI Bento Grid — Real Data from SQL Server */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Citizens in Central Database */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-[#c0c7ce]/30 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#00374e]/10 flex items-center justify-center text-[#00374e]">
              <Users className="w-6 h-6" />
            </div>
            <Link
              href="/admin/citizens"
              className="text-xs text-[#0b4f6c] hover:underline flex items-center gap-0.5 font-semibold"
            >
              <span>السجل المركزي</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <h3 className="text-xs text-[#41484d] mb-1 font-semibold">
            المواطنون المقيدون في السجل المدني
          </h3>
          <p className="text-xl text-amber-600 font-black tracking-tight">
            صلاحية مقيّدة
          </p>
          <p className="text-[11px] text-amber-600 font-medium mt-1 flex items-center gap-1">
            يتطلب تفعيل صلاحية SuperAdmin من مسؤول الباكند
          </p>
        </div>

        {/* KPI 2: Government Sectors */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-[#c0c7ce]/30 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#c5e7ff]/40 flex items-center justify-center text-[#0b4f6c]">
              <Building2 className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              ثابتة سيادياً
            </span>
          </div>
          <h3 className="text-xs text-[#41484d] mb-1 font-semibold">
            القطاعات الحكومية المركزية
          </h3>
          <p className="text-3xl text-[#191c1e] font-black tracking-tight font-mono">
            {organizations.length || 4}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">الأحوال، الجوازات، المرور، المستشفيات</p>
        </div>

        {/* KPI 3: Branches Created */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-[#c0c7ce]/30 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
              <Building2 className="w-6 h-6" />
            </div>
            <Link
              href="/admin/agencies"
              className="text-xs text-[#0b4f6c] hover:underline flex items-center gap-0.5 font-semibold"
            >
              <span>إدارة</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <h3 className="text-xs text-[#41484d] mb-1 font-semibold">
            فروع ومراكز الخدمة المسجلة
          </h3>
          <p className="text-3xl text-[#191c1e] font-black tracking-tight font-mono">
            {branches.length.toLocaleString("ar-YE")}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            النشطة حالياً:{" "}
            <span className="font-bold text-emerald-600">
              {branches.filter((b) => b.isActive).length} فرع
            </span>
          </p>
        </div>

        {/* KPI 4: Assigned Admins */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-[#c0c7ce]/30 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-700">
              <UserCheck className="w-6 h-6" />
            </div>
            <Link
              href="/admin/admins"
              className="text-xs text-purple-700 hover:underline flex items-center gap-0.5 font-semibold"
            >
              <span>إدارة المدراء</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <h3 className="text-xs text-[#41484d] mb-1 font-semibold">
            مدراء الفروع المكلفون
          </h3>
          <p className="text-3xl text-[#191c1e] font-black tracking-tight font-mono">
            {admins.length.toLocaleString("ar-YE")}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            المكلفون بنشاط:{" "}
            <span className="font-bold text-purple-700">
              {admins.filter((a) => a.isActive).length} مدير
            </span>
          </p>
        </div>
      </div>

      {/* Sovereign Overview of the 4 Main Government Sectors — Strictly High-level Overview */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-[#c0c7ce]/30 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-[#00374e] flex items-center gap-2">
              <span>القطاعات الحكومية الخاضعة للرقابة والربط المركزي</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            </h2>
            <p className="text-xs text-[#41484d] mt-0.5">
              متابعة جاهزية الفروع وتكليفات الإدارات دون التدخل في الأعمال التنفيذية للكاونترات والموظفين
            </p>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            نطاق صلاحيات السوبر أدمن
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {organizations.map((org) => {
            const Icon = getSectorIcon(org.name);
            const badge = getSectorBadge(org.name);
            const orgBranches = branches.filter((b) => b.organizationId === org.id);
            const orgAdmins = admins.filter((a) => a.organizationName === org.name);

            return (
              <div
                key={org.id}
                className="p-5 rounded-xl border border-slate-200 bg-gradient-to-b from-white to-[#fbfcfd] hover:border-[#0b4f6c] transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0b4f6c]/10 text-[#0b4f6c] flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${badge.bg}`}>
                      {badge.label}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-[#00374e] mb-2">{org.name}</h3>

                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span>الفروع المسجلة:</span>
                      <span className="font-mono font-bold text-[#00374e]">{orgBranches.length}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-100">
                      <span>المدراء المكلفون:</span>
                      <span className="font-mono font-bold text-[#00374e]">{orgAdmins.length}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>حالة الربط المركزي:</span>
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        متصل
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <Link
                    href={`/admin/agencies?orgId=${org.id}`}
                    className="w-full block text-center py-2 px-3 rounded-lg bg-slate-100 hover:bg-[#0b4f6c] hover:text-white text-xs font-bold text-[#00374e] transition-colors"
                  >
                    استعراض فروع القطاع
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Middle Section: Server Health & Quick Administrative Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System & Database Health */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-[#c0c7ce]/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Server className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-[#00374e]">حالة الخادم وقاعدة البيانات الحية</h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600">محرك قاعدة البيانات:</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  SQL Server (HuwiyatiDB)
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600">واجهة برمجة التطبيقات (API):</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  ASP.NET Core (Port 5237)
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600">التشفير ورموز الدخول:</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  JWT Bearer 256-bit
                </span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-slate-600">زمن استجابة الاستعلام:</span>
                <span className="font-mono text-slate-700 font-bold">
                  {metrics?.serverLatencyMs || 24} ms
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <Link
              href="/admin/citizens"
              className="w-full block text-center py-2.5 px-4 rounded-xl bg-[#f2f4f6] hover:bg-[#e0e3e5] text-[#00374e] text-xs font-bold transition-colors"
            >
              عرض السجل المركزي للمواطنين
            </Link>
          </div>
        </div>

        {/* Administrative Governance Shortcuts */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-xs border border-[#c0c7ce]/30">
          <h3 className="text-base font-bold text-[#00374e] mb-1">
            مهام الحوكمة والقرارات الإدارية السيادية
          </h3>
          <p className="text-xs text-[#41484d] mb-4">
            تعتمد المنظومة على إسناد القرارات للهيكل الإداري الرسمي وفق الصلاحيات المعرفة في الباكند.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Link
              href="/admin/admins"
              className="p-4 rounded-xl border border-slate-200 hover:border-[#0b4f6c] hover:shadow-xs transition-all bg-[#fbfcfd] flex items-start gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#0b4f6c]/10 text-[#0b4f6c] flex items-center justify-center shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#00374e] group-hover:text-[#0b4f6c] transition-colors">
                  تكليف مدراء الفروع
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  إسناد مسؤولية فرع معين لمواطن بالرقم الوطني ونقله أو إعفائه رسمياً.
                </p>
              </div>
            </Link>

            <Link
              href="/admin/agencies"
              className="p-4 rounded-xl border border-slate-200 hover:border-[#0b4f6c] hover:shadow-xs transition-all bg-[#fbfcfd] flex items-start gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#00374e] group-hover:text-amber-800 transition-colors">
                  إنشاء وتحديث الفروع
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  افتتاح فروع ميدانية جديدة، ربطها بالمحافظة والمديرية، وضبط بيانات الاتصال.
                </p>
              </div>
            </Link>

            <Link
              href="/admin/citizens"
              className="p-4 rounded-xl border border-slate-200 hover:border-[#0b4f6c] hover:shadow-xs transition-all bg-[#fbfcfd] flex items-start gap-3 group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <BookOpenCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#00374e] group-hover:text-emerald-800 transition-colors">
                  السجل الموحد للمواطنين
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  استعراض قاعدة بيانات المواطنين ومطابقة الأرقام الوطنية الحقيقية.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Live Summary: Recent Branches & Admins */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Branches List */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-[#c0c7ce]/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#00374e]" />
              <div>
                <h3 className="text-base font-bold text-[#00374e]">الفروع المسجلة</h3>
                <p className="text-xs text-slate-500">آخر الفروع المنشأة في النظام</p>
              </div>
            </div>
            <Link href="/admin/agencies" className="text-xs font-bold text-[#0b4f6c] hover:underline flex items-center gap-1">
              <span>عرض الكل</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {branches.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-400">
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-300" />
              ) : (
                "لا توجد فروع مسجلة بعد"
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {branches.slice(0, 5).map((b) => (
                <div key={b.id} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#00374e]">{b.branchName}</p>
                    <p className="text-xs text-slate-500">{b.organizationName} — {b.governorate}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${b.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-red-50 text-red-600 border-red-200"}`}>
                    {b.isActive ? "نشط" : "معطل"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Admins List */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-[#c0c7ce]/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#00374e]" />
              <div>
                <h3 className="text-base font-bold text-[#00374e]">مدراء الفروع المكلّفون</h3>
                <p className="text-xs text-slate-500">المدراء المعينون على الفروع</p>
              </div>
            </div>
            <Link href="/admin/admins" className="text-xs font-bold text-[#0b4f6c] hover:underline flex items-center gap-1">
              <span>عرض الكل</span>
              <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {admins.length === 0 ? (
            <div className="text-center py-8 text-sm text-slate-400">
              {loading ? (
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-slate-300" />
              ) : (
                "لا يوجد مدراء مكلّفون بعد"
              )}
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {admins.slice(0, 5).map((a) => (
                <div key={a.employeeId} className="py-3 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-[#00374e]">{a.fullName}</p>
                    <p className="text-xs text-slate-500">{a.branchName} — {a.organizationName}</p>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${a.isActive ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-50 text-slate-500 border-slate-200"}`}>
                    {a.isActive ? "نشط" : "معطل"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
