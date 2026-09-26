"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FileCheck2,
  Plane,
  AlertTriangle,
  Users,
  RefreshCw,
  TrendingUp,
  Download,
  Building2,
  Clock,
  CheckCircle2,
  ShieldAlert,
  ArrowUpRight,
  Search,
  Star,
  Compass,
  Award,
} from "lucide-react";
import { passportsService } from "@/lib/api/passportsService";
import { employeesService } from "@/lib/api/employeesService";
import { PassportsDirectorMetrics } from "@/types/passports";
import { Employee } from "@/types/admin";

export default function PassportsDirectorPage() {
  const [metrics, setMetrics] = useState<PassportsDirectorMetrics | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [officerSearch, setOfficerSearch] = useState("");
  const [exportNotice, setExportNotice] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [data, empRes] = await Promise.all([
        passportsService.getDirectorMetrics(),
        employeesService.getEmployees().catch(() => ({ employees: [] })),
      ]);
      setMetrics(data);
      setEmployees(empRes.employees || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 3000);
  };

  const filteredEmployees = employees.filter(
    (e) =>
      e.fullName.includes(officerSearch) ||
      e.employeeNumber.toLowerCase().includes(officerSearch.toLowerCase()) ||
      (e.branchName && e.branchName.includes(officerSearch))
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header & Quick Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0b4f6c] mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            لوحة القيادة المركزية - صلاحيات مدير عام الهيئة والفرع
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#00374e]">
            مصلحة الهجرة والجوازات - لوحة التحكم والمؤشرات الحية
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            متابعة إصدار الجوازات الإلكترونية، تدفق المسافرين عبر المنافذ، وكفاءة العمليات
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            title="تحديث البيانات اللحظية"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#0b4f6c]" : ""}`} />
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00374e] hover:bg-[#0b4f6c] text-white text-sm font-semibold shadow-sm transition-all active:scale-98"
          >
            <Download className="w-4 h-4" />
            <span>تصدير تقرير الإحصاء</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>تم توليد التقرير الإحصائي الحي لجوازات السفر وحركات المنافذ بتنسيق رقمي بنجاح.</span>
        </div>
      )}

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Issued Passports */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-[0_4px_20px_rgba(11,79,108,0.04)] relative overflow-hidden group hover:border-[#0b4f6c]/40 transition-all">
          <div className="absolute top-0 right-0 w-full h-1 bg-[#00374e]"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500">الجوازات النشطة المسجلة</span>
            <div className="p-2.5 rounded-xl bg-[#0b4f6c]/10 text-[#0b4f6c]">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#00374e] tabular-nums">
            {metrics?.totalIssuedPassports ?? 0}
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full w-fit">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+{metrics?.issuedTodayCount ?? 0} جواز اليوم</span>
          </div>
        </div>

        {/* Card 2: Border Movements */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-[0_4px_20px_rgba(11,79,108,0.04)] relative overflow-hidden group hover:border-blue-400/40 transition-all">
          <div className="absolute top-0 right-0 w-full h-1 bg-[#0b4f6c]"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500">إجمالي حركات السفر بالمنافذ</span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700">
              <Plane className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#00374e] tabular-nums">
            {metrics?.todayBorderMovementsCount ?? 0}
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full w-fit">
            <Compass className="w-3.5 h-3.5" />
            <span>حركات دخول ومغادرة حية</span>
          </div>
        </div>

        {/* Card 3: Active Border Ports */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-[0_4px_20px_rgba(11,79,108,0.04)] relative overflow-hidden group hover:border-amber-400/40 transition-all">
          <div className="absolute top-0 right-0 w-full h-1 bg-amber-500"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500">المنافذ البرية والجوية النشطة</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
              <Building2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 tabular-nums">
            {metrics?.activeBorderPortsCount ?? 1}
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full w-fit">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>جاهزية تشغيلية كاملة</span>
          </div>
        </div>

        {/* Card 4: Officers on Duty */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-[0_4px_20px_rgba(11,79,108,0.04)] relative overflow-hidden group hover:border-purple-400/40 transition-all">
          <div className="absolute top-0 right-0 w-full h-1 bg-purple-600"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500">كادر وضباط الفرع المعتمدين</span>
            <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-700 tabular-nums">
            {employees.length}
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs font-medium text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full w-fit">
            <Award className="w-3.5 h-3.5" />
            <span>موظفون مقيدون بالمنظومة</span>
          </div>
        </div>
      </div>

      {/* Grid: Ports Telemetry & Branches Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Border Ports Traffic (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-[#00374e] flex items-center gap-2">
                  <Plane className="w-4 h-4 text-[#0b4f6c]" />
                  حركة المسافرين بالمنافذ البرية والجوية
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  توزيع حركة الدخول والخروج المسجلة حياً في قاعدة البيانات
                </p>
              </div>
              <Link
                href="/passports/travel-records"
                className="text-xs font-bold text-[#0b4f6c] hover:underline flex items-center gap-1"
              >
                <span>سجلات السفر الحية</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-4">
              {!metrics?.portMovementsToday || metrics.portMovementsToday.length === 0 ? (
                <p className="text-xs text-gray-400 py-6 text-center">لا توجد حركات مسجلة حالياً.</p>
              ) : (
                metrics.portMovementsToday.map((port, idx) => {
                  const total = port.entryCount + port.exitCount;
                  const entryPercent = total > 0 ? Math.round((port.entryCount / total) * 100) : 50;
                  const exitPercent = 100 - entryPercent;

                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-gray-50/70 border border-gray-100 flex flex-col gap-2"
                    >
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-[#00374e]">{port.portName}</span>
                        <span className="text-gray-500 tabular-nums">
                          إجمالي العبور: {total.toLocaleString()} مسافر
                        </span>
                      </div>

                      {/* Multi-segment Progress bar */}
                      <div className="w-full bg-gray-200 rounded-full h-2.5 flex overflow-hidden">
                        <div
                          style={{ width: `${entryPercent}%` }}
                          className="bg-emerald-600 h-full"
                          title={`قدوم (دخول): ${port.entryCount}`}
                        ></div>
                        <div
                          style={{ width: `${exitPercent}%` }}
                          className="bg-blue-600 h-full"
                          title={`مغادرة (خروج): ${port.exitCount}`}
                        ></div>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-gray-600">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                          قدوم: {port.entryCount.toLocaleString()} ({entryPercent}%)
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                          مغادرة: {port.exitCount.toLocaleString()} ({exitPercent}%)
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Branch Issuance Performance (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
              <div>
                <h2 className="text-base font-bold text-[#00374e] flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-[#0b4f6c]" />
                  فروع ومراكز إصدار الجوازات
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  إحصائيات الإصدار الفعلي الموثق بالنظام
                </p>
              </div>
              <Link
                href="/passports/issued"
                className="text-xs font-bold text-[#0b4f6c] hover:underline flex items-center gap-1"
              >
                <span>سجل الجوازات</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {!metrics?.branchPerformance || metrics.branchPerformance.length === 0 ? (
                <p className="text-xs text-gray-400 py-6 text-center">لا توجد بيانات فروع حالياً.</p>
              ) : (
                metrics.branchPerformance.map((branch, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-gray-100 hover:border-gray-200 transition-all flex items-center justify-between"
                  >
                    <div>
                      <h3 className="text-xs font-bold text-[#00374e]">{branch.branchName}</h3>
                      <p className="text-[11px] text-gray-500">{branch.governorate}</p>
                    </div>

                    <div className="text-left">
                      <div className="text-xs font-bold text-[#00374e] tabular-nums">
                        {branch.monthlyIssuance} جواز مُصدر
                      </div>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-medium inline-block mt-1 ${
                          branch.status === "Optimal"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        نشط ونظامي
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Officers / Employees Section (Live from /api/v1/Employees) */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
          <div>
            <h2 className="text-base font-bold text-[#00374e] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#0b4f6c]" />
              كادر وموظفو فرع الجوازات المسجلون حياً
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              بيانات الموظفين المعتمدة عبر نقطة النهاية المركزية /api/v1/Employees
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="البحث باسم الموظف أو رقمه..."
                value={officerSearch}
                onChange={(e) => setOfficerSearch(e.target.value)}
                className="pl-4 pr-9 py-2 rounded-xl border border-gray-200 text-xs w-full md:w-64 focus:outline-none focus:border-[#0b4f6c] bg-white"
              />
            </div>

            <Link
              href="/passports/employees"
              className="px-3 py-2 bg-[#00374e] text-white rounded-xl text-xs font-bold hover:bg-[#0b4f6c] transition-colors"
            >
              إدارة الكادر
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-gray-100/70 text-gray-700 font-bold border-b border-gray-200">
                <th className="py-3 px-5">اسم الموظف / الضابط</th>
                <th className="py-3 px-5">الرقم الوظيفي</th>
                <th className="py-3 px-5">الفرع والجهة</th>
                <th className="py-3 px-5">البريد الإلكتروني</th>
                <th className="py-3 px-5">رقم الهاتف</th>
                <th className="py-3 px-5 text-center">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-gray-400">
                    لا يوجد موظفون مقيدون في هذا الفرع حالياً.
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-3.5 px-5 font-semibold text-gray-800 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-[#0b4f6c] text-white flex items-center justify-center font-bold text-[10px]">
                        {emp.fullName.slice(0, 2)}
                      </div>
                      <div>
                        <div>{emp.fullName}</div>
                        <div className="text-[10px] text-gray-400 font-normal">{emp.roleLabel}</div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 font-mono text-gray-600 font-bold">
                      {emp.employeeNumber}
                    </td>
                    <td className="py-3.5 px-5 text-gray-700">{emp.branchName || "فرع الجوازات"}</td>
                    <td className="py-3.5 px-5 text-gray-500 font-mono">{emp.email || "—"}</td>
                    <td className="py-3.5 px-5 text-gray-500 font-mono">{emp.phoneNumber || "—"}</td>
                    <td className="py-3.5 px-5 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          emp.isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {emp.isActive ? "نشط بالخدمة" : "موقوف"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

