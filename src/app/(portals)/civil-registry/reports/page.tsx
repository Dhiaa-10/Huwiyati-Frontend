"use client";

import React, { useState } from "react";
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  TrendingUp,
  FileCheck2,
  ScrollText,
  UserCheck,
  Building2,
  Printer,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function CivilRegistryReportsPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState("month");
  const [exportNotice, setExportNotice] = useState(false);

  const handleExport = () => {
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 3000);
  };

  const serviceBreakdown = [
    { service: "إصدار بطاقة شخصية ذكية (أول مرة)", count: 1840, percentage: 42, color: "bg-blue-600" },
    { service: "تجديد بطاقة شخصية ذكية", count: 1120, percentage: 26, color: "bg-emerald-600" },
    { service: "إصدار وتجديد بطاقة عائلية", count: 680, percentage: 16, color: "bg-purple-600" },
    { service: "قيد واقعة ميلاد مميكنة", count: 470, percentage: 11, color: "bg-amber-600" },
    { service: "تسجيل واقعة وفاة وتحديث السجل", count: 210, percentage: 5, color: "bg-rose-600" },
  ];

  const countersPerformance = [
    { counter: "كاونتر 01 (البصمة الحيوية)", officer: "ملازم أول أمين الحيمي", transactions: 340, avgMinutes: "8 دقيقة", rating: "99.4%" },
    { counter: "كاونتر 02 (التفعيل الحضوري)", officer: "ملازم سامي الضبيبي", transactions: 310, avgMinutes: "9 دقيقة", rating: "98.9%" },
    { counter: "كاونتر 03 (تدقيق الوثائق والأرشيف)", officer: "ملازم رشاد العديني", transactions: 280, avgMinutes: "11 دقيقة", rating: "99.1%" },
    { counter: "كاونتر 04 (الوقائع الحيوية)", officer: "مساعد أول فؤاد الذماري", transactions: 195, avgMinutes: "14 دقيقة", rating: "97.8%" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0b4f6c] mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            تقارير ومؤشرات الفرع - صلاحيات مدير المؤسسة (مستوى 2)
          </div>
          <h1 className="text-2xl font-bold text-[#00374e]">
            تقارير المعاملات والأداء الإحصائي للفرع
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            تحليل إجمالي المعاملات المنجزة، سرعة الخدمة، ومعدلات تطابق البصمة بالسجل المدني
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1 text-xs font-semibold shadow-sm">
            <button
              onClick={() => setPeriod("day")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                period === "day" ? "bg-[#00374e] text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              اليوم
            </button>
            <button
              onClick={() => setPeriod("week")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                period === "week" ? "bg-[#00374e] text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              هذا الأسبوع
            </button>
            <button
              onClick={() => setPeriod("month")}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                period === "month" ? "bg-[#00374e] text-white" : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              هذا الشهر
            </button>
          </div>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00374e] hover:bg-[#0b4f6c] text-white text-xs font-bold shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            <span>تصدير التقرير (PDF/Excel)</span>
          </button>
        </div>
      </div>

      {exportNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>تم توليد التقرير الشامل وإرساله للتحميل بنجاح.</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <span className="text-xs font-semibold text-gray-500">إجمالي المعاملات المكتملة</span>
          <div className="text-2xl font-black text-[#00374e] mt-1 tabular-nums">4,320</div>
          <div className="mt-2 text-[11px] text-emerald-700 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+14.2% مقارنة بالشهر السابق</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <span className="text-xs font-semibold text-gray-500">نسبة التطابق البايومتري</span>
          <div className="text-2xl font-black text-emerald-600 mt-1 tabular-nums">99.4%</div>
          <div className="mt-2 text-[11px] text-gray-500">دقة القارئ الضوئي للبصمة</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <span className="text-xs font-semibold text-gray-500">متوسط زمن خدمة المواطن</span>
          <div className="text-2xl font-black text-[#00374e] mt-1 tabular-nums">10.5 دقيقة</div>
          <div className="mt-2 text-[11px] text-emerald-700 font-bold">ضمن الحدود القياسية</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <span className="text-xs font-semibold text-gray-500">إجمالي الرسوم المحصلة</span>
          <div className="text-2xl font-black text-blue-700 mt-1 tabular-nums">
            18.4M <span className="text-xs text-gray-500 font-normal">ريال يمني</span>
          </div>
          <div className="mt-2 text-[11px] text-gray-500">سداد إلكتروني موحد عبر البوابة</div>
        </div>
      </div>

      {/* Grid: Services Breakdown & Counters Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Service Type Breakdown (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-[#00374e] flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-[#0b4f6c]" />
              توزيع المعاملات المنجزة حسب نوع الخدمة
            </h3>
            <p className="text-xs text-gray-500">إحصائيات استخراج البطاقات والوثائق الحيوية</p>
          </div>

          <div className="space-y-3.5">
            {serviceBreakdown.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-800">{item.service}</span>
                  <span className="font-mono text-gray-600 font-bold">
                    {item.count} معاملة ({item.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                  <div
                    style={{ width: `${item.percentage}%` }}
                    className={`h-full ${item.color}`}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Counters Performance Roster (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-[#00374e] flex items-center gap-2">
              <Building2 className="w-4 h-4 text-[#0b4f6c]" />
              كفاءة كاونترات وصالات خدمة الجمهور
            </h3>
            <p className="text-xs text-gray-500">متابعة الأداء اليومي ومعدل إنجاز الضباط المكلفين</p>
          </div>

          <div className="space-y-3">
            {countersPerformance.map((c, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-gray-100 bg-gray-50/60 hover:bg-gray-100/70 transition-all flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-bold text-[#00374e]">{c.counter}</h4>
                  <p className="text-[11px] text-gray-500">{c.officer}</p>
                </div>
                <div className="text-left">
                  <div className="font-bold text-[#0b4f6c] tabular-nums">
                    {c.transactions} معاملة
                  </div>
                  <div className="text-[10px] text-gray-400">
                    معدل الوقت: {c.avgMinutes} • الدقة: {c.rating}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
