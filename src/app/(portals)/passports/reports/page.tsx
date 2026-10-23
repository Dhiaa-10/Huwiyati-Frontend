"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  BarChart3,
  Download,
  CheckCircle2,
  TrendingUp,
  Plane,
  FileCheck2,
  RefreshCw,
  Globe2,
  Printer,
  FileSpreadsheet,
  ChevronDown,
  Building2,
  Calendar,
  Layers,
  ArrowDownLeft,
  ArrowUpRight,
  ShieldCheck,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { passportsService } from "@/lib/api/passportsService";
import { PassportRecord, TravelRecord } from "@/types/passports";

export default function PassportsReportsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [exportMenuOpen, setExportMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"travel" | "passports">("travel");

  const [passports, setPassports] = useState<PassportRecord[]>([]);
  const [travelRecords, setTravelRecords] = useState<TravelRecord[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadReportsData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setExportMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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
      console.error("[PassportsReports] Failed to load data:", err);
    } finally {
      setLoading(false);
    }
  };

  // 1. Dynamic Breakdown of Passport Types (100% Real Backend Data)
  const totalPass = passports.length;
  const regularCount = passports.filter((p) => p.passportType === "Regular").length;
  const diplomaticCount = passports.filter((p) => p.passportType === "Diplomatic").length;
  const specialCount = passports.filter((p) => p.passportType === "Special").length;

  const passportCategoryBreakdown = [
    {
      category: "جواز سفر عادي إلكتروني (Regular)",
      count: regularCount,
      percentage: totalPass > 0 ? Math.round((regularCount / totalPass) * 100) : 0,
      color: "bg-blue-600",
    },
    {
      category: "جواز سفر دبلوماسي (Diplomatic)",
      count: diplomaticCount,
      percentage: totalPass > 0 ? Math.round((diplomaticCount / totalPass) * 100) : 0,
      color: "bg-emerald-600",
    },
    {
      category: "جواز سفر خاص / مهمة (Special)",
      count: specialCount,
      percentage: totalPass > 0 ? Math.round((specialCount / totalPass) * 100) : 0,
      color: "bg-amber-600",
    },
  ];

  // 2. Dynamic Port Movements Breakdown (100% Real Backend Data)
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

  // Unique destinations (100% Real Backend Data)
  const uniqueCountries = new Set(
    travelRecords.map((t) => t.destinationOrOriginCountry).filter(Boolean)
  );

  // Helper for CSV escaping
  const escapeCsv = (val: any) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  // Real Excel (CSV) Export
  const handleExportExcel = () => {
    setExportMenuOpen(false);
    const dateStr = new Date().toISOString().split("T")[0];
    const timeStr = new Date().toLocaleTimeString("ar-YE");
    const branchName = user?.branchName || "مصلحة الهجرة والجوازات والجنسية - المركز الرئيسي";

    const rows: string[] = [];

    // Header section
    rows.push("الجمهورية اليمنية - وزارة الداخلية");
    rows.push("مصلحة الهجرة والجوازات والجنسية");
    rows.push(`تقرير إحصائيات إصدار الجوازات والرقابة بالمنافذ - تاريخ التوليد: ${dateStr} ${timeStr}`);
    rows.push(`الفرع / المنفذ: ${branchName}`);
    rows.push("");

    // Section 1: General KPIs
    rows.push("=== أولاً: المؤشرات الإحصائية العامة الحية ===");
    rows.push("المؤشر,القيمة,ملاحظات تشغيلية");
    rows.push(`الجوازات المعتمدة بالنظام,${passports.length},جوازات إلكترونية سارية ومعتمدة`);
    rows.push(`حركات العبور الموثقة,${travelRecords.length},سجلات قدوم ومغادرة حقيقية`);
    rows.push(`وجهات السفر المباشرة,${uniqueCountries.size},دول وجهات عبور دولية نشطة`);
    rows.push(`المنافذ المسجلة,${portMovementsData.length},منافذ برية وجوية نشطة ومسجلة`);
    rows.push("");

    // Section 2: Passports Breakdown
    rows.push("=== ثانياً: تصنيف الجوازات المعتمدة حسب الفئة ===");
    rows.push("فئة الجواز,العدد,النسبة المئوية");
    passportCategoryBreakdown.forEach((cat) => {
      rows.push(`${escapeCsv(cat.category)},${cat.count},${cat.percentage}%`);
    });
    rows.push("");

    // Section 3: Port Movements Breakdown
    rows.push("=== ثالثاً: حركة القدوم والمغادرة بالمنافذ ===");
    rows.push("اسم المنفذ,حركات القدوم,حركات المغادرة,إجمالي حركات العبور");
    if (portMovementsData.length === 0) {
      rows.push("لا توجد حركات منافذ مسجلة,0,0,0");
    } else {
      portMovementsData.forEach((p) => {
        rows.push(`${escapeCsv(p.port)},${p.entry},${p.exit},${p.entry + p.exit}`);
      });
    }
    rows.push("");

    // Section 4: Detailed Travel Records
    rows.push("=== رابعاً: السجل التفصيلي لحركات العبور والمسافرين ===");
    rows.push("رقم الجواز,اسم المسافر,الرقم الوطني,نوع الحركة,الوجهة / الدولة,المنفذ,تاريخ الحركة");
    if (travelRecords.length === 0) {
      rows.push("لا توجد سجلات سفر مقيدة حالياً,,,,,,");
    } else {
      travelRecords.forEach((t) => {
        const movementLabel = t.movementType === "Exit" ? "مغادرة" : "قدوم";
        rows.push(
          [
            escapeCsv(t.passportNumber),
            escapeCsv(t.fullName),
            escapeCsv(t.nationalNumber),
            escapeCsv(movementLabel),
            escapeCsv(t.destinationOrOriginCountry || "غير محدد"),
            escapeCsv(t.portName),
            escapeCsv(t.timestamp?.split("T")[0] || t.timestamp || "غير مسجل"),
          ].join(",")
        );
      });
    }
    rows.push("");

    // Section 5: Detailed Passports List
    rows.push("=== خامساً: السجل التفصيلي للجوازات المعتمدة بالنظام ===");
    rows.push("رقم الجواز,اسم حامل الجواز,الرقم الوطني,فئة الجواز,فرع الإصدار,تاريخ الإصدار,تاريخ الانتهاء,الحالة");
    if (passports.length === 0) {
      rows.push("لا توجد جوازات معتمدة مسجلة حالياً,,,,,,,");
    } else {
      passports.forEach((p) => {
        rows.push(
          [
            escapeCsv(p.passportNumber),
            escapeCsv(p.fullName),
            escapeCsv(p.nationalNumber),
            escapeCsv(p.passportTypeLabel || p.passportType),
            escapeCsv(p.issuingBranchName || "فرع الجوازات"),
            escapeCsv(p.issueDate || "غير محدد"),
            escapeCsv(p.expiryDate || "غير محدد"),
            escapeCsv(p.status === "Active" ? "ساري / نشط" : p.status),
          ].join(",")
        );
      });
    }

    const csvContent = rows.join("\r\n");
    // UTF-8 BOM ensures proper rendering of Arabic text in MS Excel
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `تقرير_إحصائيات_الجوازات_والمنافذ_${dateStr}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setExportNotice("تم تصدير ملف Excel (CSV) بنجاح متضمناً كافة البيانات الإحصائية وسجلات العبور.");
    setTimeout(() => setExportNotice(null), 4500);
  };

  // Real PDF (Print View) Export
  const handleExportPDF = () => {
    setExportMenuOpen(false);
    setExportNotice("جاري إعداد التقرير المعتمد وفتح نافذة حفظ / طباعة PDF...");
    setTimeout(() => {
      window.print();
      setExportNotice(null);
    }, 400);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Print Specific Global Styles */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 portrait;
            margin: 12mm;
          }
          aside,
          header,
          nav,
          footer,
          .print-hidden,
          button {
            display: none !important;
          }
          body {
            background: #ffffff !important;
            color: #000000 !important;
          }
          .print-only {
            display: block !important;
          }
          .print-card {
            border: 1px solid #e2e8f0 !important;
            box-shadow: none !important;
            page-break-inside: avoid;
            break-inside: avoid;
          }
        }
        @media screen {
          .print-only {
            display: none !important;
          }
        }
      `}</style>

      {/* Official Government Print Header (Visible ONLY on print/PDF) */}
      <div className="print-only mb-6 border-b-2 border-[#00374e] pb-4">
        <div className="flex items-center justify-between text-right">
          <div>
            <h2 className="text-sm font-bold text-gray-800">الجمهورية اليمنية</h2>
            <h2 className="text-sm font-bold text-gray-800">وزارة الداخلية</h2>
            <h1 className="text-base font-extrabold text-[#00374e]">
              مصلحة الهجرة والجوازات والجنسية
            </h1>
            <p className="text-xs text-gray-600 mt-0.5">
              {user?.branchName || "المركز الرئيسي - مصلحة الهجرة والجوازات والجنسية"}
            </p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 mx-auto rounded-full border-2 border-[#00374e] flex items-center justify-center font-bold text-[#00374e] text-xs">
              شعار المصلحة
            </div>
            <p className="text-[10px] text-gray-500 mt-1 font-mono">
              REP-PASS-{new Date().getFullYear()}-{String(passports.length).padStart(4, "0")}
            </p>
          </div>
          <div className="text-left text-xs text-gray-700 space-y-1">
            <p>
              <span className="font-bold">تاريخ التقرير: </span>
              {new Date().toISOString().split("T")[0]}
            </p>
            <p>
              <span className="font-bold">وقت التصدير: </span>
              {new Date().toLocaleTimeString("ar-YE")}
            </p>
            <p>
              <span className="font-bold">المأمور المسؤول: </span>
              {user?.fullName || "مدير فرع الجوازات"}
            </p>
          </div>
        </div>
        <div className="mt-3 text-center bg-gray-50 py-1.5 rounded border border-gray-200">
          <h3 className="text-sm font-bold text-[#00374e]">
            تقرير إحصائيات إصدار الجوازات والرقابة بالمنافذ الحدودية
          </h3>
        </div>
      </div>

      {/* Screen Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 print-hidden">
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
            className="p-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors shadow-sm disabled:opacity-50"
            title="تحديث التقارير"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#0b4f6c]" : ""}`} />
          </button>

          {/* Export Dropdown Menu */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setExportMenuOpen((prev) => !prev)}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00374e] hover:bg-[#0b4f6c] text-white text-xs font-bold shadow-sm transition-all disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>تصدير التقرير (PDF/Excel)</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${exportMenuOpen ? "rotate-180" : ""}`} />
            </button>

            {exportMenuOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in zoom-in-95">
                <div className="px-3 py-1.5 border-b border-gray-100">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                    اختر صيغة التصدير
                  </span>
                </div>
                <button
                  onClick={handleExportExcel}
                  className="w-full text-right px-4 py-2.5 hover:bg-emerald-50 text-gray-700 hover:text-emerald-800 text-xs font-semibold flex items-center gap-2.5 transition-colors"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <div className="font-bold">تصدير كملف Excel (CSV)</div>
                    <div className="text-[10px] text-gray-400 font-normal">
                      جداول بيانات كاملة بترميز UTF-8
                    </div>
                  </div>
                </button>
                <button
                  onClick={handleExportPDF}
                  className="w-full text-right px-4 py-2.5 hover:bg-blue-50 text-gray-700 hover:text-blue-800 text-xs font-semibold flex items-center gap-2.5 transition-colors border-t border-gray-50"
                >
                  <Printer className="w-4 h-4 text-blue-600 shrink-0" />
                  <div>
                    <div className="font-bold">تصدير / طباعة PDF معتمد</div>
                    <div className="text-[10px] text-gray-400 font-normal">
                      وثيقة رسمية بختم وترويسة الوزارة
                    </div>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Export Notice Feedback */}
      {exportNotice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2 animate-fade-in print-hidden">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{exportNotice}</span>
        </div>
      )}

      {/* KPI Cards (100% Real Backend Data) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm print-card">
          <span className="text-xs font-semibold text-gray-500">الجوازات المعتمدة بالنظام</span>
          <div className="text-2xl font-black text-[#00374e] mt-1 tabular-nums">
            {loading ? "..." : passports.length}
          </div>
          <div className="mt-2 text-[11px] text-emerald-700 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>جوازات إلكترونية سارية</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm print-card">
          <span className="text-xs font-semibold text-gray-500">حركات العبور الموثقة</span>
          <div className="text-2xl font-black text-blue-700 mt-1 tabular-nums">
            {loading ? "..." : travelRecords.length}
          </div>
          <div className="mt-2 text-[11px] text-gray-500">سجلات قدوم ومغادرة لحظية</div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm print-card">
          <span className="text-xs font-semibold text-gray-500">وجهات السفر المباشرة</span>
          <div className="text-2xl font-black text-indigo-700 mt-1 tabular-nums">
            {loading ? "..." : uniqueCountries.size}
          </div>
          <div className="mt-2 text-[11px] text-indigo-700 font-bold flex items-center gap-1">
            <Globe2 className="w-3.5 h-3.5" />
            <span>دول وجهات عبور دولية</span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-200 shadow-sm print-card">
          <span className="text-xs font-semibold text-gray-500">المنافذ المسجلة</span>
          <div className="text-2xl font-black text-[#00374e] mt-1 tabular-nums">
            {loading ? "..." : portMovementsData.length}
          </div>
          <div className="mt-2 text-[11px] text-gray-500">منافذ برية وجوية نشطة</div>
        </div>
      </div>

      {/* Grid: Categories & Port Movements */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Passports Breakdown (6 cols) */}
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4 print-card">
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
        <div className="lg:col-span-6 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4 print-card">
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

      {/* Detailed Live Records Section (100% Real Backend Data) */}
      <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm space-y-4 print-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-sm font-bold text-[#00374e] flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#0b4f6c]" />
              السجلات التفصيلية الحية المعتمدة
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              استعراض بيانات حركات السفر والجوازات المسترجعة مباشرة من قاعدة بيانات النظام
            </p>
          </div>

          {/* Tab Selector (Hidden during print) */}
          <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl self-start sm:self-auto print-hidden">
            <button
              onClick={() => setActiveTab("travel")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "travel"
                  ? "bg-white text-[#00374e] shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              حركات العبور ({travelRecords.length})
            </button>
            <button
              onClick={() => setActiveTab("passports")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === "passports"
                  ? "bg-white text-[#00374e] shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              الجوازات المعتمدة ({passports.length})
            </button>
          </div>
        </div>

        {/* Travel Movements Table */}
        {(activeTab === "travel" || typeof window !== "undefined") && (
          <div className={activeTab === "travel" ? "block" : "print-only mt-4"}>
            <div className="text-xs font-bold text-[#00374e] mb-2 print-only">
              جدول حركات العبور بالمنافذ:
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                    <th className="py-2.5 px-3">رقم الجواز</th>
                    <th className="py-2.5 px-3">اسم المسافر</th>
                    <th className="py-2.5 px-3">الرقم الوطني</th>
                    <th className="py-2.5 px-3">نوع الحركة</th>
                    <th className="py-2.5 px-3">الوجهة / الدولة</th>
                    <th className="py-2.5 px-3">المنفذ</th>
                    <th className="py-2.5 px-3">التاريخ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {travelRecords.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-6 text-center text-gray-400">
                        لا توجد حركات عبور مسجلة حتى الآن.
                      </td>
                    </tr>
                  ) : (
                    travelRecords.map((t) => (
                      <tr key={t.id} className="hover:bg-blue-50/20 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#00374e]">
                          {t.passportNumber}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-gray-900">{t.fullName}</td>
                        <td className="py-2.5 px-3 font-mono text-gray-600">{t.nationalNumber}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              t.movementType === "Exit"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            {t.movementType === "Exit" ? (
                              <ArrowUpRight className="w-3 h-3" />
                            ) : (
                              <ArrowDownLeft className="w-3 h-3" />
                            )}
                            {t.movementType === "Exit" ? "مغادرة" : "قدوم"}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-gray-700 font-medium">
                          {t.destinationOrOriginCountry || "غير محدد"}
                        </td>
                        <td className="py-2.5 px-3 text-gray-600">{t.portName}</td>
                        <td className="py-2.5 px-3 font-mono text-gray-500 text-[11px]">
                          {t.timestamp?.split("T")[0] || t.timestamp}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Passports Table */}
        {(activeTab === "passports" || typeof window !== "undefined") && (
          <div className={activeTab === "passports" ? "block" : "print-only mt-6"}>
            <div className="text-xs font-bold text-[#00374e] mb-2 print-only">
              جدول الجوازات الإلكترونية المعتمدة:
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                    <th className="py-2.5 px-3">رقم الجواز</th>
                    <th className="py-2.5 px-3">اسم المواطن</th>
                    <th className="py-2.5 px-3">الرقم الوطني</th>
                    <th className="py-2.5 px-3">فئة الجواز</th>
                    <th className="py-2.5 px-3">فرع الإصدار</th>
                    <th className="py-2.5 px-3">تاريخ الإصدار</th>
                    <th className="py-2.5 px-3">تاريخ الانتهاء</th>
                    <th className="py-2.5 px-3 text-center">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {passports.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-6 text-center text-gray-400">
                        لا توجد جوازات مسجلة حتى الآن.
                      </td>
                    </tr>
                  ) : (
                    passports.map((p) => (
                      <tr key={p.id} className="hover:bg-blue-50/20 transition-colors">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#00374e]">
                          {p.passportNumber}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-gray-900">{p.fullName}</td>
                        <td className="py-2.5 px-3 font-mono text-gray-600">{p.nationalNumber}</td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                              p.passportType === "Diplomatic"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : p.passportType === "Special"
                                ? "bg-amber-50 text-amber-700 border border-amber-200"
                                : "bg-blue-50 text-blue-700 border border-blue-200"
                            }`}
                          >
                            {p.passportTypeLabel || p.passportType}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-gray-600">
                          {p.issuingBranchName || "فرع الجوازات"}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-gray-500 text-[11px]">
                          {p.issueDate || "—"}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-gray-500 text-[11px]">
                          {p.expiryDate || "—"}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            {p.status === "Active" ? "ساري / معتمد" : p.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Official Government Print Footer & Signature Blocks (Visible ONLY on print/PDF) */}
      <div className="print-only mt-10 pt-6 border-t-2 border-gray-300">
        <div className="grid grid-cols-3 gap-6 text-center text-xs">
          <div className="space-y-12">
            <p className="font-bold text-gray-800">مأمور الرقابة والجوازات المناوب</p>
            <div className="border-b border-dotted border-gray-400 w-3/4 mx-auto"></div>
            <p className="text-[11px] text-gray-500">التوقيع / ........................</p>
          </div>
          <div className="space-y-4">
            <p className="font-bold text-gray-800">الختم الرسمي للمصلحة</p>
            <div className="w-20 h-20 mx-auto rounded-full border-2 border-dashed border-gray-400 flex items-center justify-center text-[10px] text-gray-400">
              ختم الإدارة
            </div>
          </div>
          <div className="space-y-12">
            <p className="font-bold text-gray-800">مدير عام الفرع / رئيس المصلحة</p>
            <div className="border-b border-dotted border-gray-400 w-3/4 mx-auto"></div>
            <p className="text-[11px] text-gray-500">التوقيع والاعتماد / ........................</p>
          </div>
        </div>
        <div className="mt-6 text-center text-[10px] text-gray-400">
          هذا التقرير صادر إلكترونياً من المنظومة المركزية الموحدة لوزارة الداخلية - مصلحة الهجرة والجوازات والجنسية.
        </div>
      </div>
    </div>
  );
}
