"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Stethoscope,
  Baby,
  HeartPulse,
  History,
  Search,
  ShieldCheck,
  AlertTriangle,
  TrendingUp,
  Bed,
  Eye,
  UserCheck,
  Loader2,
} from "lucide-react";
import { hospitalService, ServiceUnavailableError } from "@/lib/api/hospitalService";
import { employeesService } from "@/lib/api/employeesService";
import { HospitalDashboardMetrics } from "@/types/hospitals";
import { Employee } from "@/types/admin";
import { useAuth } from "@/context/AuthContext";

export default function HospitalsDashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<HospitalDashboardMetrics | null>(null);
  const [metricsUnavailable, setMetricsUnavailable] = useState(false);
  const [loading, setLoading] = useState(true);
  const [staffList, setStaffList] = useState<Employee[]>([]);
  const [staffLoading, setStaffLoading] = useState(true);
  const [patientSearch, setPatientSearch] = useState("");

  useEffect(() => {
    // Load dashboard metrics
    async function loadMetrics() {
      try {
        const m = await hospitalService.getDashboardMetrics();
        setMetrics(m);
      } catch (err) {
        if (err instanceof ServiceUnavailableError) {
          setMetricsUnavailable(true);
        } else {
          console.error("Failed to load hospital metrics:", err);
        }
      } finally {
        setLoading(false);
      }
    }

    // Load real staff list from backend
    async function loadStaff() {
      try {
        const result = await employeesService.getEmployees();
        if (result.isSuccess) {
          setStaffList(result.employees.filter((e) => e.isActive).slice(0, 8));
        }
      } catch (err) {
        console.error("Failed to load staff list:", err);
      } finally {
        setStaffLoading(false);
      }
    }

    loadMetrics();
    loadStaff();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-[#052F31] uppercase tracking-wider">
              منظومة السجلات الطبية والوقائع الحيوية • ربط مركزي مع الأحوال المدنية
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#052F31]">
            {user.branchName || "بوابة هيئة المستشفيات"}
          </h1>
          <p className="text-sm text-[#41484d] mt-1">
            نظرة عامة على إدارة المستشفى، تدقيق السجلات الطبية الموحدة، ومتابعة تسجيل المواليد والوفيات
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/hospitals/vital-events"
            className="px-5 py-2.5 bg-[#0C4A4E] hover:bg-[#052F31] text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
          >
            <Baby className="w-4 h-4 text-white" />
            <span>تسجيل واقعة حيوية</span>
          </Link>
          <Link
            href="/hospitals/records"
            className="px-5 py-2.5 bg-white border border-[#e0e3e5] hover:bg-slate-50 text-[#052F31] rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2 active:scale-95 cursor-pointer"
          >
            <Search className="w-4 h-4 text-[#0C4A4E]" />
            <span>استعراض السجل الطبي</span>
          </Link>
        </div>
      </div>

      {/* Quick Patient National ID Triage Lookup Bar */}
      <div className="bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2 text-[#052F31] font-bold text-xs shrink-0">
          <div className="p-2 bg-[#E6F1EE]/40 text-[#0C4A4E] rounded-xl">
            <Stethoscope className="w-4 h-4" />
          </div>
          <span>استعلام فوري عن مريض:</span>
        </div>
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={patientSearch}
            onChange={(e) => setPatientSearch(e.target.value)}
            placeholder="أدخل الرقم الوطني للمريض (مثال: 01010000001)..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-10 pl-4 py-2.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0C4A4E] font-mono"
          />
        </div>
        <Link
          href={`/hospitals/records?nid=${encodeURIComponent(patientSearch || "01010000001")}`}
          className="px-5 py-2.5 bg-[#0C4A4E] hover:bg-[#052F31] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
        >
          <span>فتح السجل الطبي</span>
          <Eye className="w-3.5 h-3.5" />
        </Link>
        <Link
          href={`/hospitals/emergency?nid=${encodeURIComponent(patientSearch || "01010000001")}`}
          className="px-4 py-2.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
        >
          <span>فرز طوارئ</span>
          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
        </Link>
      </div>

      {/* Bento Grid: KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Vital Events */}
        <div className="bg-white rounded-2xl p-5 md:p-6 shadow-xs border border-slate-200 hover:border-[#0C4A4E]/40 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#E6F1EE]/40 text-[#0C4A4E] flex items-center justify-center">
              <Baby className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold bg-[#052F31]/5 text-[#052F31] border border-[#052F31]/10 px-2.5 py-1 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-[#0C4A4E]" /> الوقائع الحيوية
            </span>
          </div>
          <h3 className="text-xs font-semibold text-[#41484d] mb-1">الأحداث الحيوية المسجلة</h3>
          <div className="text-2xl md:text-3xl font-black text-[#191c1e] font-mono tabular-nums">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : metricsUnavailable ? "—" : (metrics?.registeredVitalEventsCount ?? 0).toLocaleString("ar-YE")}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-500">
            <span>مواليد: <strong className="text-[#052F31] font-mono">{metrics?.monthlyBirthsCount ?? "—"}</strong></span>
            <span>وفيات: <strong className="text-rose-600 font-mono">{metrics?.monthlyDeathsCount ?? "—"}</strong></span>
          </div>
        </div>

        {/* Card 2: Active Doctors */}
        <div className="bg-white rounded-2xl p-5 md:p-6 shadow-xs border border-slate-200 hover:border-[#0C4A4E]/40 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <Stethoscope className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">
              طاقم مصرح له
            </span>
          </div>
          <h3 className="text-xs font-semibold text-[#41484d] mb-1">الأطباء والكادر الطبي النشط</h3>
          <div className="text-2xl md:text-3xl font-black text-[#191c1e] font-mono tabular-nums">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : metricsUnavailable ? "—" : (metrics?.activeDoctorsCount ?? 0).toLocaleString("ar-YE")}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-500">
            <span>إجمالي الكادر: <strong className="text-[#052F31] font-mono">{metrics?.totalAuthorizedStaff ?? "—"}</strong></span>
          </div>
        </div>

        {/* Card 3: Registry Access Logs */}
        <div className="bg-white rounded-2xl p-5 md:p-6 shadow-xs border border-slate-200 hover:border-[#0C4A4E]/40 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <History className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-full">
              سجلات الوصول
            </span>
          </div>
          <h3 className="text-xs font-semibold text-[#41484d] mb-1">سجلات الوصول للسجل الطبي</h3>
          <div className="text-2xl md:text-3xl font-black text-[#191c1e] font-mono tabular-nums">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : metricsUnavailable ? "—" : (metrics?.accessLogsCount ?? 0).toLocaleString("ar-YE")}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
            <span>وصول مسجل ومراقَب من الخادم</span>
          </div>
        </div>

        {/* Card 4: Inpatients & ICU */}
        <div className="bg-white rounded-2xl p-5 md:p-6 shadow-xs border border-slate-200 hover:border-[#0C4A4E]/40 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
              <Bed className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-full">
              {metrics ? `ICU ${metrics.icuOccupancyPercentage ?? "—"}%` : "العناية المركزة"}
            </span>
          </div>
          <h3 className="text-xs font-semibold text-[#41484d] mb-1">المرضى المنومين بالهيئة</h3>
          <div className="text-2xl md:text-3xl font-black text-[#191c1e] font-mono tabular-nums">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : metricsUnavailable ? "—" : (metrics?.activeInpatients ?? 0).toLocaleString("ar-YE")}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">
            <span>بيانات مباشرة من الخادم</span>
          </div>
        </div>
      </div>

      {/* Second Row: Staff Table & Live EHR Access Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Staff Table Section (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/60">
            <div>
              <h2 className="font-bold text-sm text-[#052F31] flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-[#0C4A4E]" />
                دليل موظفي وأطباء المستشفى
              </h2>
              <p className="text-xs text-[#41484d] mt-0.5">الصلاحيات والوصول للسجل الطبي للمرضى</p>
            </div>
            <Link
              href="/hospitals/employees"
              className="text-xs font-bold text-[#0C4A4E] hover:underline"
            >
              إدارة الكادر الكامل &larr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            {staffLoading ? (
              <div className="flex justify-center items-center py-12">
                <Loader2 className="w-6 h-6 animate-spin text-[#0C4A4E]" />
                <span className="mr-2 text-xs text-slate-500">جاري تحميل كادر المستشفى...</span>
              </div>
            ) : staffList.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-500 text-xs gap-2">
                <UserCheck className="w-8 h-8 text-slate-300" />
                <p>لا يوجد موظفون نشطون في الفرع حالياً</p>
                <Link href="/hospitals/employees" className="text-[#0C4A4E] text-xs font-bold hover:underline">
                  إضافة موظف جديد ←
                </Link>
              </div>
            ) : (
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                  <tr>
                    <th className="py-3 px-4">الاسم</th>
                    <th className="py-3 px-4">الرقم الوظيفي</th>
                    <th className="py-3 px-4">الوصف الوظيفي</th>
                    <th className="py-3 px-4">الرقم الوطني</th>
                    <th className="py-3 px-4">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {staffList.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#052F31] text-white flex items-center justify-center font-bold text-xs">
                            {emp.fullName.slice(0, 1)}
                          </div>
                          <div>
                            <div className="font-bold text-[#052F31]">{emp.fullName}</div>
                            <div className="text-[10px] text-slate-400 font-mono">{emp.email || "—"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-semibold text-slate-600">
                        {emp.employeeNumber || "—"}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#052F31]/5 text-[#052F31] border border-[#052F31]/10 font-semibold text-[11px]">
                          <Stethoscope className="w-3 h-3 text-[#0C4A4E]" />
                          {emp.roleLabel || "موظف"}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-600 text-[11px]">
                        {emp.nationalNumber}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[11px] ${emp.isActive ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${emp.isActive ? "bg-emerald-500" : "bg-rose-500"}`}></span>
                          {emp.isActive ? "نشط بالخدمة" : "معطّل"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Live EHR Access Logs Feed (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 shadow-xs border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-sm font-bold text-[#052F31] flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  سجل رقابة وتدقيق الوصول الطبي الموحد
                </h3>
                <p className="text-xs text-[#41484d] mt-0.5">تسجيل فوري مشفر لكل عملية فتح لسجلات المرضى</p>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            </div>

            <div className="space-y-3">
              {(metrics?.recentAccessLogs || []).map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-[#0C4A4E]/40 transition-all text-xs"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-[#052F31]">{log.doctorName}</span>
                    <span className="text-[11px] text-slate-500 font-mono">{log.timestamp}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600">
                    <span>الإجراء: <strong className="text-slate-800">{log.action}</strong></span>
                    <Link
                      href={`/hospitals/records?nid=${log.patientId}`}
                      className="text-[11px] font-mono font-bold text-[#0C4A4E] hover:underline"
                    >
                      {log.patientName} &larr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs text-slate-500">
            <span>متوافق مع معايير حماية البيانات الصحية</span>
            <span className="text-[#052F31] font-bold font-mono">ISO 27799 / HIPAA</span>
          </div>
        </div>
      </div>
    </div>
  );
}
