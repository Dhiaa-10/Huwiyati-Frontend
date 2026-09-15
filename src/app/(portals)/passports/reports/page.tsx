"use client";

import React, { useState } from "react";
import {
  BarChart3,
  Download,
  CheckCircle2,
  TrendingUp,
  Plane,
  FileCheck2,
  ShieldAlert,
  ShieldCheck,
  Compass,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function PassportsReportsPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState("month");
  const [exportNotice, setExportNotice] = useState(false);

  const handleExport = () => {
    setExportNotice(true);
    setTimeout(() => setExportNotice(false), 3000);
  };

  const passportCategoryBreakdown = [
    { category: "جواز سفر عادي (مواطنين)", count: 3210, percentage: 76, color: "bg-blue-600" },
    { category: "جواز سفر تجديد إلكتروني", count: 720, percentage: 17, color: "bg-emerald-600" },
    { category: "جواز سفر دبلوماسي وخاص", count: 180, percentage: 4, color: "bg-amber-600" },
    { category: "بدل فاقد / تالف", count: 130, percentage: 3, color: "bg-rose-600" },
  ];

  const portMovementsData = [
    { port: "مطار صنعاء الدولي", entry: 12400, exit: 13800, flagCount: 2 },
    { port: "مطار عدن الدولي", entry: 9800, exit: 10400, flagCount: 1 },
    { port: "منفذ الوديعة البري", entry: 18900, exit: 21500, flagCount: 3 },
    { port: "منفذ شحن البري", entry: 3200, exit: 4100, flagCount: 0 },
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
            تقارير إصدار الجوازات والرقابة بالمنافذ
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            إحصائيات تدفق المسافرين عبر المنافذ الجوية والبرية، وأداء صالات الطباعة وفحص الطلبات
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
          <span>تم توليد التقرير الأمني والإحصائي لمصلحة الجوازات بنجاح.</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <span className="text-xs font-semibold text-gray-500">الجوازات المطبوعة والمعتمدة</span>
          <div className="text-2xl font-black text-[#00374e] mt-1 tabular-nums">4,240</div>
          <div className="mt-2 text-[11px] text-emerald-700 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+8.9% زيادة في سرعة الإنجاز</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <span className="text-xs font-semibold text-gray-500">إجمالي حركات العبور</span>
          <div className="text-2xl font-black text-blue-700 mt-1 tabular-nums">84,100</div>
          <div className="mt-2 text-[11px] text-gray-500">عبر 6 منافذ جوية وبرية وبحرية</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <span className="text-xs font-semibold text-gray-500">ضبط مسافرين محظورين</span>
          <div className="text-2xl font-black text-rose-700 mt-1 tabular-nums">6 حالات</div>
          <div className="mt-2 text-[11px] text-rose-700 font-bold">إحالة أمنية فورية</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <span className="text-xs font-semibold text-gray-500">إجمالي الرسوم المحصلة</span>
          <div className="text-2xl font-black text-[#00374e] mt-1 tabular-nums">
            50.8M <span className="text-xs text-gray-500 font-normal">ريال يمني</span>
          </div>
          <div className="mt-2 text-[11px] text-gray-500">إيداع مركزي بالحساب البنكي</div>
        </div>
      </div>

      {/* Grid: Categories & Port Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Passports Breakdown (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-[#00374e] flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-[#0b4f6c]" />
              تصنيف الجوازات المطبوعة حسب الفئة
            </h3>
            <p className="text-xs text-gray-500">نسبة الإصدارات العادية والدبلوماسية والبدل فاقد</p>
          </div>

          <div className="space-y-3.5">
            {passportCategoryBreakdown.map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-800">{item.category}</span>
                  <span className="font-mono text-gray-600 font-bold">
                    {item.count} وثيقة ({item.percentage}%)
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

        {/* Ports Movements Breakdown (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-[#00374e] flex items-center gap-2">
              <Plane className="w-4 h-4 text-[#0b4f6c]" />
              حركة القدوم والمغادرة بالمنافذ الرئيسية
            </h3>
            <p className="text-xs text-gray-500">مقارنة حركة الدخول والخروج والضبط الأمني</p>
          </div>

          <div className="space-y-3">
            {portMovementsData.map((p, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-gray-100 bg-gray-50/60 hover:bg-gray-100/70 transition-all flex items-center justify-between text-xs"
              >
                <div>
                  <h4 className="font-bold text-[#00374e]">{p.port}</h4>
                  <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                    <span className="text-emerald-700">قدوم: {p.entry.toLocaleString()}</span>
                    <span>•</span>
                    <span className="text-blue-700">مغادرة: {p.exit.toLocaleString()}</span>
                  </div>
                </div>
                <div className="text-left">
                  {p.flagCount > 0 ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                      ضبط {p.flagCount} مطلوبين
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                      حركة نظامية
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
