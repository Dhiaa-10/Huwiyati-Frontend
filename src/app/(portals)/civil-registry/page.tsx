"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  UserCheck,
  FileCheck,
  ScrollText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowUpRight,
  Fingerprint,
  TrendingUp,
  Search,
  RefreshCw,
} from "lucide-react";
import { civilRegistryService } from "@/lib/api/civilRegistryService";
import { CitizenCivilRecord, CivilRegistryMetrics } from "@/types/civilRegistry";

export default function CivilRegistryDashboardPage() {
  const [metrics, setMetrics] = useState<CivilRegistryMetrics | null>(null);
  const [pendingCitizens, setPendingCitizens] = useState<CitizenCivilRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [m, citizensRes] = await Promise.all([
        civilRegistryService.getDashboardMetrics(),
        civilRegistryService.getAllCitizens({ accountStatus: "PendingActivation", page: 1, pageSize: 6 }),
      ]);
      setMetrics(m);
      setPendingCitizens(citizensRes.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-[#00374e] uppercase tracking-wider">
              بوابة الأحوال المدنية والسجل المدني
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#00374e]">
            لوحة موظف السجل المدني والتحقق
          </h1>
          <p className="text-sm text-[#41484d] mt-1">
            إدارة طلبات الهوية الوطنية، مطابقة البصمة الحيوية، وتوثيق الواقعات الحيوية.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/civil-registry/activations"
            className="px-5 py-2.5 bg-[#0b4f6c] hover:bg-[#00374e] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2"
          >
            <UserCheck className="w-4 h-4" />
            <span>تفعيل حساب جديد (حضور شخصي)</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards (Matching Stitch Screen 17) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Active Officers */}
        <div className="bg-white p-6 rounded-2xl border border-[#e0e3e5] shadow-xs hover:border-[#0b4f6c]/40 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#c5e7ff]/40 flex items-center justify-center text-[#0b4f6c]">
              <Users className="w-6 h-6" />
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              ميداني
            </span>
          </div>
          <p className="text-xs text-[#41484d] mb-1 font-semibold">الموظفون النشطون بالفروع</p>
          <h3 className="text-3xl font-black text-[#191c1e] font-mono">
            {metrics ? metrics.activeCivilOfficersCount.toLocaleString("ar-YE") : "1,248"}
          </h3>
          <p className="text-[11px] text-slate-500 mt-2">عبر 18 فرعاً في عموم المحافظات</p>
        </div>

        {/* Card 2: Pending Activations */}
        <div className="bg-white p-6 rounded-2xl border border-[#e0e3e5] shadow-xs hover:border-[#0b4f6c]/40 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-700">
              <Clock className="w-6 h-6" />
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
              بانتظار الحضور
            </span>
          </div>
          <p className="text-xs text-[#41484d] mb-1 font-semibold">تفعيلات معلقة (حضور شخصي)</p>
          <h3 className="text-3xl font-black text-amber-700 font-mono">
            {metrics ? metrics.pendingActivationsCount : "4"}
          </h3>
          <p className="text-[11px] text-slate-500 mt-2">مواطنون بانتظار مسح البصمة في الفرع</p>
        </div>

        {/* Card 3: Processed Today */}
        <div className="bg-white p-6 rounded-2xl border border-[#e0e3e5] shadow-xs hover:border-[#0b4f6c]/40 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-700">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
              اليوم
            </span>
          </div>
          <p className="text-xs text-[#41484d] mb-1 font-semibold">معاملات وبطاقات أنجزت اليوم</p>
          <h3 className="text-3xl font-black text-emerald-700 font-mono">
            {metrics ? metrics.processedTodayCount : "84"}
          </h3>
          <p className="text-[11px] text-slate-500 mt-2">دقة المطابقة البايومترية: 99.4%</p>
        </div>
      </div>

      {/* Quick Navigation Action Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          href="/civil-registry/activations"
          className="p-5 bg-gradient-to-br from-[#00374e] to-[#0b4f6c] text-white rounded-2xl shadow-sm hover:shadow-md transition-all group flex items-center justify-between"
        >
          <div>
            <div className="text-xs text-[#8ac0e1] font-semibold">الخدمة الحيوية الرئيسية</div>
            <h4 className="text-base font-bold mt-1">تفعيل حسابات المواطنين</h4>
            <p className="text-xs text-white/70 mt-1">التحقق بالرقم الوطني والبصمة</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Fingerprint className="w-6 h-6 text-[#97cdef]" />
          </div>
        </Link>

        <Link
          href="/civil-registry/requests"
          className="p-5 bg-white border border-[#e0e3e5] rounded-2xl shadow-xs hover:shadow-md hover:border-[#0b4f6c]/40 transition-all group flex items-center justify-between"
        >
          <div>
            <div className="text-xs text-slate-500 font-semibold">الطلبات الإلكترونية</div>
            <h4 className="text-base font-bold text-[#00374e] mt-1">مراجعة طلبات البطاقات</h4>
            <p className="text-xs text-[#41484d] mt-1">إصدار وتجديد واستبدال فاقد</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-[#c5e7ff]/30 text-[#0b4f6c] flex items-center justify-center group-hover:scale-110 transition-transform">
            <FileCheck className="w-6 h-6" />
          </div>
        </Link>

        <Link
          href="/civil-registry/vital-events"
          className="p-5 bg-white border border-[#e0e3e5] rounded-2xl shadow-xs hover:shadow-md hover:border-[#0b4f6c]/40 transition-all group flex items-center justify-between"
        >
          <div>
            <div className="text-xs text-slate-500 font-semibold">السجل المدني المركزي</div>
            <h4 className="text-base font-bold text-[#00374e] mt-1">الوقائع الحيوية</h4>
            <p className="text-xs text-[#41484d] mt-1">شهادات الميلاد والوفاة والزواج</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ScrollText className="w-6 h-6" />
          </div>
        </Link>
      </div>

      {/* Pending Citizens Queue Table */}
      <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-xs p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[#00374e]">
              قائمة المواطنين المنتظرين للتفعيل في الفرع
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              مواطنون سجلوا عبر التطبيق وتوجهوا إلى الفرع لإتمام التحقق البايومتري الحضوري.
            </p>
          </div>

          <Link
            href="/civil-registry/activations"
            className="text-xs font-bold text-[#0b4f6c] hover:underline flex items-center gap-1"
          >
            <span>شاشة التفعيل المباشر</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center items-center gap-2 text-slate-400 text-xs">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>جاري التحميل...</span>
          </div>
        ) : pendingCitizens.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            لا يوجد مواطنون بانتظار التفعيل حالياً في هذا الفرع.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead className="bg-[#f7f9fb] border-b border-slate-200 text-xs font-bold text-slate-600">
                <tr>
                  <th className="py-3 px-4">اسم المواطن</th>
                  <th className="py-3 px-4">الرقم الوطني</th>
                  <th className="py-3 px-4">المحافظة والمديرية</th>
                  <th className="py-3 px-4">رقم الهاتف</th>
                  <th className="py-3 px-4">حالة البصمة</th>
                  <th className="py-3 px-4 text-center">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {pendingCitizens.map((citizen) => (
                  <tr key={citizen.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-800">{citizen.fullName}</div>
                      <div className="text-[11px] text-slate-400">تاريخ الميلاد: {citizen.dateOfBirth}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-[#0b4f6c]">
                      {citizen.nationalNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {citizen.governorate} - {citizen.district}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-500">
                      {citizen.phoneNumber}
                    </td>
                    <td className="py-3 px-4">
                      {citizen.biometricRegistered ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>مسجلة ({citizen.biometricMatchPercentage}%)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 px-2 py-0.5 rounded font-medium">
                          <AlertCircle className="w-3.5 h-3.5" />
                          <span>بانتظار البصمة</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Link
                        href={`/civil-registry/activations?nid=${citizen.nationalNumber}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0b4f6c] hover:bg-[#00374e] text-white font-bold text-[11px] transition-all"
                      >
                        <Fingerprint className="w-3.5 h-3.5" />
                        <span>تفعيل الآن</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
