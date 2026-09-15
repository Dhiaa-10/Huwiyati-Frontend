"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Activity,
  Stethoscope,
  Users,
  Baby,
  HeartPulse,
  History,
  Search,
  Plus,
  FileDown,
  ShieldCheck,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Bed,
  CheckCircle2,
  Clock,
  Eye,
  FileText,
  UserCheck,
} from "lucide-react";
import { hospitalService } from "@/lib/api/hospitalService";
import { HospitalDashboardMetrics } from "@/types/hospitals";
import { useAuth } from "@/context/AuthContext";

export default function HospitalsDashboardPage() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<HospitalDashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [patientSearch, setPatientSearch] = useState("");

  const sampleStaff = [
    {
      id: "MD-883492",
      name: "د. سامي فؤاد المنصوب",
      email: "sami.mansoob@thawra.gov.ye",
      role: "AuthorizedDoctor",
      roleLabel: "استشاري أمراض باطنية",
      lastLogin: "اليوم، 08:45 ص",
      status: "Active",
    },
    {
      id: "MD-883493",
      name: "د. جميلة عبدالكريم الصبري",
      email: "jamila.sabri@thawra.gov.ye",
      role: "AuthorizedDoctor",
      roleLabel: "أخصائية قلب وقسطرة",
      lastLogin: "اليوم، 09:12 ص",
      status: "Active",
    },
    {
      id: "MD-883494",
      name: "د. نجيب طه العريقي",
      email: "najeeb.oraigi@thawra.gov.ye",
      role: "Surgeon",
      roleLabel: "استشاري جراحة عامة ومناظير",
      lastLogin: "أمس، 06:30 م",
      status: "Active",
    },
    {
      id: "ST-502118",
      name: "أمل يحيى الأنسي",
      email: "amal.ansi@thawra.gov.ye",
      role: "DataEntry",
      roleLabel: "أخصائية تسجيل وقائع حيوية",
      lastLogin: "اليوم، 07:50 ص",
      status: "Active",
    },
  ];

  useEffect(() => {
    async function loadData() {
      try {
        const m = await hospitalService.getDashboardMetrics();
        setMetrics(m);
      } catch (err) {
        console.error("Failed to load hospital metrics:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header (Matching Stitch Screen 01) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5">
              <HeartPulse className="w-3.5 h-3.5 text-error animate-pulse" />
              منظومة السجلات الطبية والوقائع الحيوية
            </span>
            <span className="text-xs text-secondary">| ربط مركزي مع الأحوال المدنية</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary font-headline-lg">
            هيئة مستشفى الثورة العام النموذجي - صنعاء
          </h1>
          <p className="text-secondary text-sm md:text-base mt-1">
            نظرة عامة على إدارة المستشفى، تدقيق السجلات الطبية الموحدة، ومتابعة تسجيل المواليد والوفيات
          </p>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/hospitals/vital-events"
            className="px-4 py-2.5 bg-primary hover:bg-primary-container text-white rounded-lg text-sm font-semibold shadow-sm transition-all flex items-center gap-2 active:scale-95"
          >
            <Baby className="w-4 h-4 text-white" />
            تسجيل واقعة حيوية
          </Link>
          <Link
            href="/hospitals/records"
            className="px-4 py-2.5 bg-tertiary-container hover:bg-tertiary-container/90 text-white rounded-lg text-sm font-semibold shadow-sm transition-all flex items-center gap-2 active:scale-95"
          >
            <Search className="w-4 h-4 text-white" />
            استعراض السجل الطبي
          </Link>
        </div>
      </div>

      {/* Quick Patient National ID Triage Lookup Bar */}
      <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_4px_20px_rgba(11,79,108,0.05)] border border-outline-variant/30 flex flex-col sm:flex-row items-center gap-4">
        <div className="flex items-center gap-2 text-primary font-bold text-sm shrink-0">
          <Stethoscope className="w-5 h-5 text-primary-container" />
          <span>استعلام فوري عن مريض:</span>
        </div>
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-secondary" />
          <input
            type="text"
            value={patientSearch}
            onChange={(e) => setPatientSearch(e.target.value)}
            placeholder="أدخل الرقم الوطني للمريض (مثال: 01010000001)..."
            className="w-full bg-surface border border-outline-variant rounded-lg pr-9 pl-4 py-2 text-sm text-on-surface focus:outline-none focus:border-primary font-mono"
          />
        </div>
        <Link
          href={`/hospitals/records?nid=${encodeURIComponent(patientSearch || "01010000001")}`}
          className="px-5 py-2 bg-primary text-white text-xs font-semibold rounded-lg hover:bg-primary-container transition-all flex items-center gap-1.5 shrink-0"
        >
          <span>فتح السجل الطبي</span>
          <Eye className="w-3.5 h-3.5" />
        </Link>
        <Link
          href={`/hospitals/emergency?nid=${encodeURIComponent(patientSearch || "01010000001")}`}
          className="px-4 py-2 bg-error/10 hover:bg-error/20 border border-error/30 text-error text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 shrink-0"
        >
          <span>فرز طوارئ</span>
          <AlertTriangle className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Bento Grid: KPI Cards (Matching Stitch Screen 01) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Vital Events */}
        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_4px_20px_rgba(11,79,108,0.05)] border border-outline-variant/30 relative overflow-hidden group hover:border-tertiary-container/30 hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-tertiary-container/10 text-tertiary-container rounded-lg">
              <Baby className="w-5 h-5" />
            </div>
            <span className="font-label-md text-xs font-bold bg-tertiary-container/10 text-tertiary-container px-2.5 py-1 rounded-full flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> +12% هذا الشهر
            </span>
          </div>
          <h3 className="text-xs font-semibold text-secondary mb-1">الأحداث الحيوية المسجلة</h3>
          <div className="text-2xl md:text-3xl font-bold text-primary font-headline-lg tabular-nums">
            {metrics ? metrics.registeredVitalEventsCount.toLocaleString("ar-YE") : "1,248"}
          </div>
          <div className="mt-3 pt-3 border-t border-surface-container flex justify-between text-xs text-secondary">
            <span>مواليد: <strong className="text-tertiary font-mono">1,102</strong></span>
            <span>وفيات: <strong className="text-error font-mono">146</strong></span>
          </div>
        </div>

        {/* Card 2: Active Doctors */}
        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_4px_20px_rgba(11,79,108,0.05)] border border-outline-variant/30 relative overflow-hidden group hover:border-primary-container/30 hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
              <Stethoscope className="w-5 h-5" />
            </div>
            <span className="font-label-md text-xs font-bold bg-surface-container text-primary px-2.5 py-1 rounded-full">
              طاقم مصرح له
            </span>
          </div>
          <h3 className="text-xs font-semibold text-secondary mb-1">الأطباء والكادر الطبي النشط</h3>
          <div className="text-2xl md:text-3xl font-bold text-primary font-headline-lg tabular-nums">
            {metrics ? metrics.activeDoctorsCount.toLocaleString("ar-YE") : "342"}
          </div>
          <div className="mt-3 pt-3 border-t border-surface-container flex justify-between text-xs text-secondary">
            <span>على رأس العمل: <strong className="text-tertiary font-mono">85</strong></span>
            <span>في إجازة: <strong className="text-secondary font-mono">12</strong></span>
          </div>
        </div>

        {/* Card 3: Registry Access Logs */}
        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_4px_20px_rgba(11,79,108,0.05)] border border-outline-variant/30 relative overflow-hidden group hover:border-primary-container/30 hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-secondary-container rounded-lg text-primary">
              <History className="w-5 h-5" />
            </div>
            <span className="font-label-md text-xs font-bold bg-error/10 text-error px-2.5 py-1 rounded-full flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" /> 3 تنبيهات
            </span>
          </div>
          <h3 className="text-xs font-semibold text-secondary mb-1">سجلات الوصول للسجل الطبي</h3>
          <div className="text-2xl md:text-3xl font-bold text-primary font-headline-lg tabular-nums">
            {metrics ? metrics.accessLogsCount.toLocaleString("ar-YE") : "8,930"}
          </div>
          <div className="mt-3 pt-3 border-t border-surface-container flex justify-between text-xs text-secondary">
            <span>قراءة واستعراض: <strong className="font-mono">7,500</strong></span>
            <span>تحديث وتشخيص: <strong className="font-mono">1,430</strong></span>
          </div>
        </div>

        {/* Card 4: Inpatients & ICU */}
        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_4px_20px_rgba(11,79,108,0.05)] border border-outline-variant/30 relative overflow-hidden group hover:border-primary-container/30 hover:shadow-md transition-all">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2.5 bg-error/10 text-error rounded-lg">
              <Bed className="w-5 h-5" />
            </div>
            <span className="font-label-md text-xs font-bold bg-error/10 text-error px-2.5 py-1 rounded-full">
              العناية المركزة 82%
            </span>
          </div>
          <h3 className="text-xs font-semibold text-secondary mb-1">المرضى المنومين بالهيئة</h3>
          <div className="text-2xl md:text-3xl font-bold text-primary font-headline-lg tabular-nums">
            {metrics ? metrics.activeInpatients.toLocaleString("ar-YE") : "184"}
          </div>
          <div className="mt-3 pt-3 border-t border-surface-container flex justify-between text-xs text-secondary">
            <span>السعة الكلية: <strong className="font-mono">250 سرير</strong></span>
            <span>الأسرة المتاحة: <strong className="text-tertiary font-mono">66</strong></span>
          </div>
        </div>
      </div>

      {/* Second Row: Staff Table & Live EHR Access Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Staff Table Section (7 cols) Matching Stitch Screen 01 */}
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(11,79,108,0.05)] border border-outline-variant/30 overflow-hidden">
          <div className="p-5 border-b border-surface-container flex justify-between items-center bg-surface-container-low/40">
            <div>
              <h2 className="font-bold text-base text-primary flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-primary-container" />
                دليل موظفي وأطباء المستشفى
              </h2>
              <p className="text-xs text-secondary mt-0.5">الصلاحيات والوصول للسجل الطبي للمرضى</p>
            </div>
            <Link
              href="/hospitals/employees"
              className="text-xs font-semibold text-primary hover:underline"
            >
              إدارة الكادر الكامل &larr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-surface-container border-b border-outline-variant/40 font-semibold text-secondary">
                <tr>
                  <th className="py-3 px-4">الاسم</th>
                  <th className="py-3 px-4">رقم الترخيص</th>
                  <th className="py-3 px-4">الفئة والتخصص</th>
                  <th className="py-3 px-4">آخر دخول</th>
                  <th className="py-3 px-4">الحالة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20 font-body-sm text-on-surface">
                {sampleStaff.map((staff, idx) => (
                  <tr key={idx} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary-container text-white flex items-center justify-center font-bold text-xs">
                          {staff.name.slice(0, 1)}
                        </div>
                        <div>
                          <div className="font-bold text-primary">{staff.name}</div>
                          <div className="text-[10px] text-secondary font-mono">{staff.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-semibold text-secondary">
                      {staff.id}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary font-semibold text-[11px]">
                        <Stethoscope className="w-3 h-3" />
                        {staff.roleLabel}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-secondary">{staff.lastLogin}</td>
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-tertiary-container/10 text-tertiary-container font-semibold text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container"></span>
                        نشط بالخدمة
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live EHR Access Logs Feed (5 cols) */}
        <div className="lg:col-span-5 bg-surface-container-lowest rounded-xl p-5 shadow-[0_4px_20px_rgba(11,79,108,0.05)] border border-outline-variant/30 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-base font-bold text-primary flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-tertiary" />
                  سجل رقابة وتدقيق الوصول الطبي الموحد
                </h3>
                <p className="text-xs text-secondary mt-0.5">تسجيل فوري مشفر لكل عملية فتح لسجلات المرضى</p>
              </div>
              <span className="w-2 h-2 rounded-full bg-tertiary animate-ping"></span>
            </div>

            <div className="space-y-3">
              {(metrics?.recentAccessLogs || []).map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/20 hover:border-primary/30 transition-all text-xs"
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-primary">{log.doctorName}</span>
                    <span className="text-[11px] text-secondary font-mono">{log.timestamp}</span>
                  </div>
                  <div className="flex items-center justify-between text-secondary">
                    <span>الإجراء: <strong className="text-on-surface">{log.action}</strong></span>
                    <Link
                      href={`/hospitals/records?nid=${log.patientId}`}
                      className="text-[11px] font-mono font-bold text-primary hover:underline"
                    >
                      {log.patientName} &larr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-outline-variant/30 flex justify-between items-center text-xs text-secondary">
            <span>متوافق مع معايير حماية البيانات الصحية</span>
            <span className="text-primary font-semibold">ISO 27799 / HIPAA</span>
          </div>
        </div>
      </div>
    </div>
  );
}
