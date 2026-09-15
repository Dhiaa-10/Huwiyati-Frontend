"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Building2,
  Activity,
  AlertTriangle,
  HardDrive,
  TrendingUp,
  Download,
  Plus,
  History,
  ShieldCheck,
  CheckCircle2,
  ArrowUpRight,
  RefreshCw,
  Server,
  Zap,
  Plane,
  Car,
  HeartPulse,
  ExternalLink,
} from "lucide-react";
import { adminService } from "@/lib/api/adminService";
import { AdminDashboardMetrics, AuditLog } from "@/types/admin";
import { useAuth } from "@/context/AuthContext";

export default function SuperAdminOverviewPage() {
  const router = useRouter();
  const { updateSession } = useAuth();
  const [metrics, setMetrics] = useState<AdminDashboardMetrics | null>(null);
  const [recentLogs, setRecentLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  /** Navigate to a sub-portal as SuperAdmin observer — preserves full cross-portal switcher */
  const enterPortal = (url: string) => {
    updateSession({ loginSource: "super_admin_switch" });
    router.push(url);
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [m, logsRes] = await Promise.all([
        adminService.getDashboardMetrics(),
        adminService.getAuditLogs({ page: 1, pageSize: 5 }),
      ]);
      setMetrics(m);
      setRecentLogs(logsRes.items);
    } catch (err) {
      console.error("Failed to load admin metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-[#00374e] uppercase tracking-wider">
              المؤشرات التشغيلية للمنظومة
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#00374e]">
            لوحة القيادة المركزية (Overview)
          </h1>
          <p className="text-sm text-[#41484d] mt-1">
            الرصد المباشر لتدفق العمليات، صحة الخوادم، وسجلات الربط بين الهيئات الحكومية.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/audit-logs"
            className="px-4 py-2.5 bg-white text-[#00374e] border border-slate-300 text-xs font-bold rounded-xl hover:bg-slate-50 transition-all shadow-xs flex items-center gap-2"
          >
            <History className="w-4 h-4 text-[#0b4f6c]" />
            <span>سجل الأمان والتدقيق</span>
          </Link>
          <Link
            href="/admin/agencies"
            className="px-5 py-2.5 bg-[#0b4f6c] hover:bg-[#00374e] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2"
          >
            <Building2 className="w-4 h-4" />
            <span>إدارة الهيئات</span>
          </Link>
        </div>
      </div>

      {/* Portals Direct Access Cards */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-[#c0c7ce]/30">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <h2 className="text-base font-bold text-[#00374e] flex items-center gap-2">
              <span>بوابات القطاعات والهيئات الخدمية المركزية</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </h2>
            <p className="text-xs text-[#41484d] mt-0.5">
              الدخول المباشر والرقابة المركزية على كافة بوابات المنظومة الوطنية
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              4 بوابات جاهزة للتشغيل
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Civil Registry */}
          <button
            onClick={() => enterPortal("/civil-registry")}
            className="p-4 rounded-xl border border-slate-200 hover:border-[#0b4f6c] hover:shadow-md transition-all bg-gradient-to-br from-white to-sky-50/40 group flex flex-col justify-between text-right w-full cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                  <Building2 className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                  مدني
                </span>
              </div>
              <h3 className="font-bold text-sm text-[#00374e] group-hover:text-[#0b4f6c] transition-colors">
                الأحوال المدنية والسجل المدني
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                الهويات الوطنية، شهادات الميلاد والوفاة، والتحقق البايومتري.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#0b4f6c]">
              <span>دخول البوابة</span>
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-[-2px] transition-transform" />
            </div>
          </button>

          {/* Passports */}
          <button
            onClick={() => enterPortal("/passports")}
            className="p-4 rounded-xl border border-slate-200 hover:border-[#0b4f6c] hover:shadow-md transition-all bg-gradient-to-br from-white to-amber-50/40 group flex flex-col justify-between text-right w-full cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                  <Plane className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  أمني / سفر
                </span>
              </div>
              <h3 className="font-bold text-sm text-[#00374e] group-hover:text-[#0b4f6c] transition-colors">
                الهجرة والجوازات والجنسية
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                الجوازات الإلكترونية، تدقيق الوثائق، وإدارة حركة المنافذ.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#0b4f6c]">
              <span>دخول البوابة</span>
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-[-2px] transition-transform" />
            </div>
          </button>

          {/* Traffic */}
          <button
            onClick={() => enterPortal("/traffic")}
            className="p-4 rounded-xl border border-slate-200 hover:border-[#0b4f6c] hover:shadow-md transition-all bg-gradient-to-br from-white to-blue-50/40 group flex flex-col justify-between text-right w-full cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                  <Car className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  أمني / مرور
                </span>
              </div>
              <h3 className="font-bold text-sm text-[#00374e] group-hover:text-[#0b4f6c] transition-colors">
                الإدارة العامة للمرور
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                ضبط المخالفات، رخص القيادة الذكية، وسجل المركبات والملكيات.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#0b4f6c]">
              <span>دخول البوابة</span>
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-[-2px] transition-transform" />
            </div>
          </button>

          {/* Hospitals */}
          <button
            onClick={() => enterPortal("/hospitals")}
            className="p-4 rounded-xl border border-slate-200 hover:border-[#0b4f6c] hover:shadow-md transition-all bg-gradient-to-br from-white to-rose-50/40 group flex flex-col justify-between text-right w-full cursor-pointer"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                  <HeartPulse className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  صحي / مستشفيات
                </span>
              </div>
              <h3 className="font-bold text-sm text-[#00374e] group-hover:text-[#0b4f6c] transition-colors">
                المستشفيات والمنظومة الصحية
              </h3>
              <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                السجل الطبي الموحد (EHR)، توثيق الوقائع الحيوية، والفرز الإسعافي.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#0b4f6c]">
              <span>دخول البوابة</span>
              <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-[-2px] transition-transform" />
            </div>
          </button>
        </div>

      </div>

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Citizens */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-[#c0c7ce]/30 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#00374e]/10 flex items-center justify-center text-[#00374e]">
              <Users className="w-6 h-6" />
            </div>
            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full flex items-center gap-1 border border-emerald-200">
              <TrendingUp className="w-3.5 h-3.5" />
              +2.4%
            </span>
          </div>
          <h3 className="text-xs text-[#41484d] mb-1 font-semibold">
            إجمالي المواطنين المسجلين
          </h3>
          <p className="text-2xl text-[#191c1e] font-black tracking-tight font-mono">
            {metrics ? metrics.totalCitizens.toLocaleString("ar-YE") : "3,482,914"}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">سجل رقمي موحد معتمد</p>
        </div>

        {/* KPI 2: Active Agencies */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-[#c0c7ce]/30 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#c5e7ff]/40 flex items-center justify-center text-[#0b4f6c]">
              <Building2 className="w-6 h-6" />
            </div>
            <Link
              href="/admin/agencies"
              className="text-xs text-[#0b4f6c] hover:underline flex items-center gap-0.5 font-semibold"
            >
              <span>تفاصيل</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <h3 className="text-xs text-[#41484d] mb-1 font-semibold">
            الهيئات والوزارات النشطة
          </h3>
          <p className="text-2xl text-[#191c1e] font-black tracking-tight font-mono">
            {metrics ? metrics.activeAgencies : "7"}{" "}
            <span className="text-xs text-slate-400 font-normal">
              / {metrics ? metrics.totalAgencies : "8"}
            </span>
          </p>
          <p className="text-[11px] text-slate-500 mt-1">مرتبطة بالبوابة المركزية</p>
        </div>

        {/* KPI 3: Requests Today */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-[#c0c7ce]/30 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
              <Zap className="w-6 h-6" />
            </div>
            <span className="px-2 py-0.5 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
              اليوم
            </span>
          </div>
          <h3 className="text-xs text-[#41484d] mb-1 font-semibold">
            حجم العمليات الرقمية اليوم
          </h3>
          <p className="text-2xl text-[#191c1e] font-black tracking-tight font-mono">
            {metrics ? metrics.todayRequests.toLocaleString("ar-YE") : "18,452"}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            نسبة الإنجاز: {metrics ? `${metrics.successRate}%` : "99.8%"}
          </p>
        </div>

        {/* KPI 4: Server Health */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-[#c0c7ce]/30 relative overflow-hidden group hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
              <Server className="w-6 h-6" />
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse"></span>
          </div>
          <h3 className="text-xs text-[#41484d] mb-1 font-semibold">
            استقرار الخوادم (Uptime)
          </h3>
          <p className="text-2xl text-[#191c1e] font-black tracking-tight font-mono">
            {metrics ? metrics.systemUptime : "99.98%"}
          </p>
          <p className="text-[11px] text-slate-500 mt-1">
            زمن الاستجابة: {metrics ? `${metrics.serverLatencyMs}ms` : "42ms"}
          </p>
        </div>
      </div>

      {/* Middle Section: Distribution & System Resources */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agencies Distribution */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-xs border border-[#c0c7ce]/30">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-[#00374e]">
                توزيع العمليات الميدانية حسب الهيئة
              </h3>
              <p className="text-xs text-[#41484d] mt-0.5">
                نسبة المعاملات المنجزة عبر المنظومة خلال آخر 24 ساعة.
              </p>
            </div>
            <Link
              href="/admin/agencies"
              className="text-xs font-bold text-[#0b4f6c] hover:underline"
            >
              عرض الكل
            </Link>
          </div>

          <div className="space-y-4">
            {metrics?.agencyDistribution.map((item) => (
              <div key={item.name} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#191c1e]">{item.name}</span>
                  <span className="font-mono text-slate-500">
                    {item.count.toLocaleString("ar-YE")} طلب ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${item.percentage}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Server & Security Status */}
        <div className="bg-white rounded-2xl p-6 shadow-xs border border-[#c0c7ce]/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-[#00374e]">حالة المنظومة المركزية</h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600">بوابة التوقيع الرقمي (ECDSA):</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  متصل ونشط
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600">قاعدة البيانات الموحدة (MSSQL):</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  مزامنة لحظية
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600">سيرفر التنبيهات (SMS/Push):</span>
                <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  جاهز للخدمة
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100">
                <span className="text-slate-600">طلبات التفعيل المعلقة:</span>
                <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200 font-mono">
                  {metrics?.pendingVerifications || 142} طلب
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <Link
              href="/admin/agencies"
              className="w-full block text-center py-2.5 px-4 rounded-xl bg-[#f2f4f6] hover:bg-[#e0e3e5] text-[#00374e] text-xs font-bold transition-colors"
            >
              الانتقال إلى إدارة الهيئات والفروع
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Audit Trail Table */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-[#c0c7ce]/30">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#00374e]" />
            <div>
              <h3 className="text-base font-bold text-[#00374e]">آخر العمليات وسجلات التدقيق</h3>
              <p className="text-xs text-slate-500">
                الأنشطة الإدارية والأمنية الأخيرة المنفذة عبر النظام.
              </p>
            </div>
          </div>

          <Link
            href="/admin/audit-logs"
            className="text-xs font-bold text-[#0b4f6c] hover:underline flex items-center gap-1"
          >
            <span>عرض كافة السجلات</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-[#f7f9fb] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4 text-xs font-bold text-slate-600">العملية</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-600">المستخدم</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-600">الجهة</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-600">عنوان IP</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-600">الحالة</th>
                <th className="py-3 px-4 text-xs font-bold text-slate-600">التوقيت</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {recentLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-semibold text-slate-800">{log.action}</td>
                  <td className="py-3 px-4 text-slate-700">{log.userFullName}</td>
                  <td className="py-3 px-4 text-slate-600">{log.entityName}</td>
                  <td className="py-3 px-4 font-mono text-slate-500">{log.ipAddress}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        log.status === "Success"
                          ? "bg-emerald-50 text-emerald-700"
                          : log.status === "Warning"
                          ? "bg-amber-50 text-amber-700"
                          : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {log.status === "Success" ? "ناجح" : log.status === "Warning" ? "تنبيه" : "فشل"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString("ar-YE")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
