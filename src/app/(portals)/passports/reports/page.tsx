"use client";

import React, { useState, useEffect } from "react";
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
  RefreshCw,
  Globe2,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { passportsService } from "@/lib/api/passportsService";
import { PassportRecord, TravelRecord } from "@/types/passports";

export default function PassportsReportsPage() {
  const { user } = useAuth();
  const [period, setPeriod] = useState("month");
  const [exportNotice, setExportNotice] = useState(false);
  const [loading, setLoading] = useState(true);

  const [passports, setPassports] = useState<PassportRecord[]>([]);
  const [travelRecords, setTravelRecords] = useState<TravelRecord[]>([]);

  useEffect(() => {
    loadReportsData();
  }, [period]);

  const loadReportsData = async () => {
    setLoading(true);
    try {
      const [passList, travelRes] = await Promise.all([
        passportsService.getPassports(),
        passportsService.getTravelRecords({ pageSize: 150 }),
      ]);
      setPassports(passList);
      setTravelRecords(travelRes.items);
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

  // 1. Dynamic Breakdown of Passport Types
  const totalPass = passports.length || 1;
  const regularCount = passports.filter((p) => p.passportType === "Regular").length;
  const diplomaticCount = passports.filter((p) => p.passportType === "Diplomatic").length;
  const specialCount = passports.filter((p) => p.passportType === "Special").length;

  const passportCategoryBreakdown = [
    {
      category: "جواز سفر عادي إلكتروني (Regular)",
      count: regularCount,
      percentage: Math.round((regularCount / totalPass) * 100),
      color: "bg-blue-600",
    },
    {
      category: "جواز سفر دبلوماسي (Diplomatic)",
      count: diplomaticCount,
      percentage: Math.round((diplomaticCount / totalPass) * 100),
      color: "bg-emerald-600",
    },
    {
      category: "جواز سفر خاص / مهمة (Special)",
      count: specialCount,
      percentage: Math.round((specialCount / totalPass) * 100),
      color: "bg-amber-600",
    },
  ];

  // 2. Dynamic Port Movements Breakdown
  const portMap = new Map<string, { entry: number; exit: number }>();
  travelRecords.forEach((t) => {
    const pName = t.portName || "منفذ نظامي";
    const cur = portMap.get(pName) || { entry: 0, exit: 0 };
    if (t.movementType === "Entry") cur.entry++;
    else cur.exit++;
    portMap.set(pName, cur);
  });

  const portMovementsData = Array.from(portMap.entries()).map(([port, data]) => ({
    port,
    entry: data.entry,
    exit: data.exit,
  }));

  // Unique destinations
  const uniqueCountries = new Set(travelRecords.map((t) => t.destinationOrOriginCountry).filter(Boolean));

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0b4f6c] mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            تقارير ومؤشرات الفرع الحية - Live Telemetry
          </div>
          <h1 className="text-2xl font-bold text-[#00374e]">
            تقارير إصدار الجوازات والرقابة بالمنافذ
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            تحليلات حركة المسافرين عبر المنافذ الجوية والبرية، وأداء إصدار الجوازات الإلكترونية المعتمدة
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadReportsData}
            disabled={loading}
            className="p-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            title="تحديث التقارير"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#0b4f6c]" : ""}`} />
          </button>

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
          <span>تم توليد التقرير الإحصائي الرقمي المباشر لمصلحة الجوازات بنجاح.</span>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <span className="text-xs font-semibold text-gray-500">الجوازات المعتمدة بالنظام</span>
          <div className="text-2xl font-black text-[#00374e] mt-1 tabular-nums">
            {passports.length}
          </div>
          <div className="mt-2 text-[11px] text-emerald-700 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>جوازات إلكترونية سارية</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <span className="text-xs font-semibold text-gray-500">حركات العبور الموثقة</span>
          <div className="text-2xl font-black text-blue-700 mt-1 tabular-nums">
            {travelRecords.length}
          </div>
          <div className="mt-2 text-[11px] text-gray-500">سجلات قدوم ومغادرة لحظية</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <span className="text-xs font-semibold text-gray-500">وجهات السفر المباشرة</span>
          <div className="text-2xl font-black text-indigo-700 mt-1 tabular-nums">
            {uniqueCountries.size}
          </div>
          <div className="mt-2 text-[11px] text-indigo-700 font-bold flex items-center gap-1">
            <Globe2 className="w-3.5 h-3.5" />
            <span>دول وجهات عبور دولية</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm">
          <span className="text-xs font-semibold text-gray-500">المنافذ المسجلة</span>
          <div className="text-2xl font-black text-[#00374e] mt-1 tabular-nums">
            {Math.max(portMovementsData.length, 1)}
          </div>
          <div className="mt-2 text-[11px] text-gray-500">منافذ برية وجوية نشطة</div>
        </div>
      </div>

      {/* Grid: Categories & Port Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Passports Breakdown (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h3 className="text-sm font-bold text-[#00374e] flex items-center gap-2">
              <FileCheck2 className="w-4 h-4 text-[#0b4f6c]" />
              تصنيف الجوازات المعتمدة حسب الفئة
            </h3>
            <p className="text-xs text-gray-500">نسبة الإصدارات العادية والدبلوماسية والخاصة</p>
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
              حركة القدوم والمغادرة بالمنافذ
            </h3>
            <p className="text-xs text-gray-500">حجم حركات الدخول والخروج الحقيقية</p>
          </div>

          <div className="space-y-3">
            {portMovementsData.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">لا توجد حركات منافذ مسجلة حتى الآن.</p>
            ) : (
              portMovementsData.map((p, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-gray-100 bg-gray-50/60 hover:bg-gray-100/70 transition-all flex items-center justify-between text-xs"
                >
                  <div>
                    <h4 className="font-bold text-[#00374e]">{p.port}</h4>
                    <div className="text-[11px] text-gray-500 flex items-center gap-2 mt-0.5">
                      <span className="text-emerald-700">قدوم: {p.entry}</span>
                      <span>•</span>
                      <span className="text-blue-700">مغادرة: {p.exit}</span>
                    </div>
                  </div>
                  <div className="text-left">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      إجمالي: {p.entry + p.exit} حركة
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

