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
} from "lucide-react";
import { passportsService } from "@/lib/api/passportsService";
import { PassportsDirectorMetrics } from "@/types/passports";

export default function PassportsDirectorPage() {
  const [metrics, setMetrics] = useState<PassportsDirectorMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [officerSearch, setOfficerSearch] = useState("");
  const [exportNotice, setExportNotice] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await passportsService.getDirectorMetrics();
      setMetrics(data);
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

  // Mock Active Officers for Director oversight
  const activeOfficers = [
    {
      name: "ملازم أول طارق عبدالملك الأنسي",
      code: "PO-7842",
      role: "ضابط فحص واعتماد",
      branch: "الفرع الرئيسي - صنعاء",
      queueCount: 5,
      queueStatus: "optimal",
      avgTime: "11 دقيقة",
      rating: 5,
    },
    {
      name: "نقيب فاطمة علي سعيد الجبلي",
      code: "PO-9103",
      role: "ضابط فحص مستعجل",
      branch: "فرع كريتر - عدن",
      queueCount: 22,
      queueStatus: "busy",
      avgTime: "17 دقيقة",
      rating: 4,
    },
    {
      name: "ملازم خالد بن عمر الكثيري",
      code: "PO-4421",
      role: "ضابط تدقيق الهوية الوطنية",
      branch: "فرع المكلا - حضرموت",
      queueCount: 8,
      queueStatus: "optimal",
      avgTime: "13 دقيقة",
      rating: 5,
    },
    {
      name: "رائد سامي منصور السنحاني",
      code: "PO-3319",
      role: "ضابط الرقابة بالمنافذ",
      branch: "مطار صنعاء الدولي",
      queueCount: 14,
      queueStatus: "optimal",
      avgTime: "2 دقيقة / مسافر",
      rating: 5,
    },
  ];

  const filteredOfficers = activeOfficers.filter(
    (o) =>
      o.name.includes(officerSearch) ||
      o.code.toLowerCase().includes(officerSearch.toLowerCase()) ||
      o.branch.includes(officerSearch)
  );

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header & Quick Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0b4f6c] mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            لوحة القيادة المركزية - صلاحيات المدير العام
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#00374e]">
            وكالة الجوازات - لوحة تحكم المدير
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            متابعة إصدار الجوازات، تدفق المسافرين عبر المنافذ، وضبط القوائم الأمنية في عموم المحافظات
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
          <span>تم توليد وتنزيل التقرير الإحصائي لجوازات السفر والمنافذ بتنسيق PDF/Excel بنجاح.</span>
        </div>
      )}

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Issued Passports */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-[0_4px_20px_rgba(11,79,108,0.04)] relative overflow-hidden group hover:border-[#0b4f6c]/40 transition-all">
          <div className="absolute top-0 right-0 w-full h-1 bg-[#00374e]"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500">الجوازات المُصدرة كلياً</span>
            <div className="p-2.5 rounded-xl bg-[#0b4f6c]/10 text-[#0b4f6c]">
              <FileCheck2 className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#00374e] tabular-nums">
            {metrics?.totalIssuedPassports.toLocaleString() || "1,428,902"}
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full w-fit">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+{metrics?.issuedTodayCount || 1420} جواز جديد اليوم</span>
          </div>
        </div>

        {/* Card 2: Border Movements */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-[0_4px_20px_rgba(11,79,108,0.04)] relative overflow-hidden group hover:border-blue-400/40 transition-all">
          <div className="absolute top-0 right-0 w-full h-1 bg-[#0b4f6c]"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500">حركات السفر عبر المنافذ</span>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-700">
              <Plane className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-[#00374e] tabular-nums">
            {metrics?.todayBorderMovementsCount.toLocaleString() || "45,102"}
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs font-medium text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full w-fit">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+12% مقارنة بالأسبوع الماضي</span>
          </div>
        </div>

        {/* Card 3: Pending Approvals */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-[0_4px_20px_rgba(11,79,108,0.04)] relative overflow-hidden group hover:border-amber-400/40 transition-all">
          <div className="absolute top-0 right-0 w-full h-1 bg-amber-500"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500">طلبات قيد المراجعة والطباعة</span>
            <div className="p-2.5 rounded-xl bg-amber-50 text-amber-700">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600 tabular-nums">
            {metrics?.pendingReviewCount || 342}
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs font-medium text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full w-fit">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>تتطلب اهتماماً ومعالجة</span>
          </div>
        </div>

        {/* Card 4: Security Watchlist Intercepts */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-[0_4px_20px_rgba(11,79,108,0.04)] relative overflow-hidden group hover:border-rose-400/40 transition-all">
          <div className="absolute top-0 right-0 w-full h-1 bg-rose-600"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-gray-500">ضبط مسافرين بقوائم الحظر</span>
            <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-700 tabular-nums">
            {metrics?.watchlistInterceptsCount || 3}
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs font-medium text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full w-fit">
            <span>تم التحفظ والإحالة الأمنية</span>
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
                  حركة المسافرين بالمنافذ البرية والجوية اليوم
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  توزيع حركة الدخول والخروج المسجلة إلكترونياً
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
              {metrics?.portMovementsToday.map((port, idx) => {
                const total = port.entryCount + port.exitCount;
                const entryPercent = Math.round((port.entryCount / total) * 100);
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
              })}
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
                  كفاءة فروع إصدار الجوازات
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  حجم المعاملات المطبوعة والجاهزة للتسليم
                </p>
              </div>
              <Link
                href="/passports/requests"
                className="text-xs font-bold text-[#0b4f6c] hover:underline flex items-center gap-1"
              >
                <span>معالجة الطلبات</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {metrics?.branchPerformance.map((branch, idx) => (
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
                      {branch.dailyIssuance} جواز اليوم
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium inline-block mt-1 ${
                        branch.status === "Optimal"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-amber-50 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {branch.status === "Optimal" ? "معدل مثالي" : "طابور مزدحم"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Officers Roster Section (Stitch Screen 16 Table) */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
          <div>
            <h2 className="text-base font-bold text-[#00374e] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#0b4f6c]" />
              ضباط الجوازات النشطون في الخدمة اللحظية
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              مراقبة سرعة التدقيق، قوائم الانتظار، ومؤشرات الجودة حسب المنافذ والفروع
            </p>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="البحث عن ضابط أو رقم عسكري..."
              value={officerSearch}
              onChange={(e) => setOfficerSearch(e.target.value)}
              className="pl-4 pr-9 py-2 rounded-xl border border-gray-200 text-xs w-full md:w-64 focus:outline-none focus:border-[#0b4f6c] bg-white"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-gray-100/70 text-gray-700 font-bold border-b border-gray-200">
                <th className="py-3 px-5">اسم الضابط</th>
                <th className="py-3 px-5">الرقم الوظيفي</th>
                <th className="py-3 px-5">الفرع / المنفذ</th>
                <th className="py-3 px-5">طابور الانتظار</th>
                <th className="py-3 px-5">متوسط وقت المعاملة</th>
                <th className="py-3 px-5 text-center">التقييم</th>
                <th className="py-3 px-5 text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOfficers.map((officer, idx) => (
                <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                  <td className="py-3.5 px-5 font-semibold text-gray-800 flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#0b4f6c] text-white flex items-center justify-center font-bold text-[10px]">
                      {officer.name.slice(0, 2)}
                    </div>
                    <div>
                      <div>{officer.name}</div>
                      <div className="text-[10px] text-gray-400 font-normal">{officer.role}</div>
                    </div>
                  </td>
                  <td className="py-3.5 px-5 font-mono text-gray-600 font-bold">
                    {officer.code}
                  </td>
                  <td className="py-3.5 px-5 text-gray-700">{officer.branch}</td>
                  <td className="py-3.5 px-5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium ${
                        officer.queueStatus === "optimal"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : "bg-rose-50 text-rose-700 border border-rose-200 font-bold"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          officer.queueStatus === "optimal" ? "bg-emerald-500" : "bg-rose-500"
                        }`}
                      ></span>
                      {officer.queueCount} مواطنين ({officer.queueStatus === "optimal" ? "طبيعي" : "ضغط عالٍ"})
                    </span>
                  </td>
                  <td className="py-3.5 px-5 tabular-nums text-gray-700 font-medium">
                    {officer.avgTime}
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <div className="flex items-center justify-center gap-0.5 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${
                            i < officer.rating ? "fill-amber-400" : "text-gray-200"
                          }`}
                        />
                      ))}
                    </div>
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <Link
                      href="/passports/requests"
                      className="px-2.5 py-1 rounded-lg bg-gray-100 hover:bg-[#0b4f6c] hover:text-white text-gray-700 transition-colors font-medium text-[11px]"
                    >
                      متابعة المهام
                    </Link>
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
