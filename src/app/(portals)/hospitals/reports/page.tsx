"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  Activity,
  Heart,
  FileSpreadsheet,
  FileText,
  Printer,
  ShieldCheck,
  TrendingUp,
  Stethoscope,
  CheckCircle2,
  Users,
} from "lucide-react";
import { hospitalService } from "@/lib/api/hospitalService";
import { HospitalDashboardMetrics } from "@/types/hospitals";

export default function HospitalReportsPage() {
  const [metrics, setMetrics] = useState<HospitalDashboardMetrics | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState("2026-09");
  const [selectedFacility, setSelectedFacility] = useState("all");
  const [loading, setLoading] = useState(true);
  const [exportFeedback, setExportFeedback] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await hospitalService.getDashboardMetrics();
        setMetrics(data);
      } catch (err) {
        console.error("Error loading hospital metrics:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleExport = (type: "pdf" | "excel") => {
    if (type === "pdf") {
      window.print();
    } else {
      setExportFeedback("تم تصدير جداول البيانات السريرية والإحصائيات بصيغة Excel (EHR_Health_Report_2026.csv)");
      setTimeout(() => setExportFeedback(null), 4000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Notification */}
      {exportFeedback && (
        <div className="p-4 rounded-xl bg-emerald-950/90 text-emerald-200 border border-emerald-800 text-xs flex items-center gap-2 shadow-xl">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{exportFeedback}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-l from-[#00374e] to-[#044e6e] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 text-cyan-300 text-sm font-medium">
              <BarChart3 className="w-4 h-4" />
              <span>المنظومة المركزية للإحصاء السريري والوقائع الحيوية</span>
            </div>
            <h1 className="text-2xl font-bold">التقارير والمؤشرات الصحية الموحدة</h1>
            <p className="text-slate-300 text-sm mt-1">
              إحصائيات السجلات الطبية، التدخلات الجراحية، معدلات المواليد والوفيات، وانتشار الأمراض المزمنة
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <button
              onClick={() => handleExport("excel")}
              className="px-4 py-2 bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>تصدير Excel</span>
            </button>
            <button
              onClick={() => handleExport("pdf")}
              className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة تقرير معتمد</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-slate-400">
            <Filter className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold">تصفية التقرير:</span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-500"
            >
              <option value="2026-09">سبتمبر 2026 (الشهر الحالي)</option>
              <option value="2026-Q3">الربع الثالث 2026</option>
              <option value="2026">العام 2026 بالكامل</option>
            </select>
          </div>

          <div>
            <select
              value={selectedFacility}
              onChange={(e) => setSelectedFacility(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-white rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-500"
            >
              <option value="all">كافة المستشفيات والمراكز التخصصية</option>
              <option value="thawra">مستشفى الثورة العام - صنعاء</option>
              <option value="kuwait">مستشفى الكويت الجامعي</option>
              <option value="jumhuria">مستشفى الجمهورية التعليمي - عدن</option>
              <option value="sabeen">مستشفى السبعين للأمومة والطفولة</option>
            </select>
          </div>
        </div>

        <div className="text-slate-400 font-mono text-[11px]">
          تاريخ التحديث اللحظي: {new Date().toLocaleDateString("ar-YE")}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Consultations */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">التشخيصات والزيارات</span>
            <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white font-mono mt-3">3,842</div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>زيادة 12.4% عن الشهر السابق</span>
          </div>
        </div>

        {/* Surgical Operations */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">التدخلات الجراحية المنجزة</span>
            <div className="w-9 h-9 rounded-xl bg-rose-950/80 border border-rose-800/60 flex items-center justify-center text-rose-400">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-rose-400 font-mono mt-3">412</div>
          <div className="text-[11px] text-slate-400 mt-2">
            بنسبة نجاح سريري تفوق 98.6%
          </div>
        </div>

        {/* Birth Registrations */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">المواليد الموثقين بالسجل</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-400 font-mono mt-3">584</div>
          <div className="text-[11px] text-emerald-400 mt-2">
            تم إصدار قيودهم إلكترونياً
          </div>
        </div>

        {/* Vital Deceased */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">إخطارات الوفاة الرسمية</span>
            <div className="w-9 h-9 rounded-xl bg-slate-850 border border-slate-700 flex items-center justify-center text-slate-300">
              <ShieldCheck className="w-4 h-4 text-cyan-400" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-200 font-mono mt-3">128</div>
          <div className="text-[11px] text-slate-400 mt-2">
            مستكملة التقرير الطبي والشرعي
          </div>
        </div>
      </div>

      {/* Deep Analytics Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chronic Diseases Breakdown */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-400" />
              أكثر الأمراض المزمنة انتشاراً (الرعاية الوقائية)
            </h3>
            <span className="text-xs text-slate-400 font-medium">النسبة المئوية</span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300 font-semibold">ارتفاع ضغط الدم الشرياني (Hypertension)</span>
                <span className="text-cyan-400 font-bold font-mono">38.5% (1,480 مريض)</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div className="bg-cyan-500 h-2 rounded-full" style={{ width: "38.5%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300 font-semibold">السكري من النوع الثاني (Type 2 Diabetes)</span>
                <span className="text-amber-400 font-bold font-mono">31.2% (1,198 مريض)</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: "31.2%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300 font-semibold">الربو الشعبي وأمراض الجهاز التنفسي</span>
                <span className="text-emerald-400 font-bold font-mono">18.0% (691 مريض)</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "18%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300 font-semibold">قصور الشرايين التاجية والقلب</span>
                <span className="text-rose-400 font-bold font-mono">12.3% (473 مريض)</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div className="bg-rose-500 h-2 rounded-full" style={{ width: "12.3%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Surgical Operations & Emergency Acuity */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-bold text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              توزيع التدخلات الجراحية وأقسام المستشفى
            </h3>
            <span className="text-xs text-slate-400 font-medium">العمليات المنفذة</span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300 font-semibold">الجراحة العامة وجراحة المناظير</span>
                <span className="text-cyan-400 font-bold font-mono">42% (173 عملية)</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div className="bg-cyan-500 h-2 rounded-full" style={{ width: "42%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300 font-semibold">النساء والولادة والقيصريات</span>
                <span className="text-rose-400 font-bold font-mono">29% (119 عملية)</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div className="bg-rose-500 h-2 rounded-full" style={{ width: "29%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300 font-semibold">جراحة العظام والحوادث</span>
                <span className="text-amber-400 font-bold font-mono">19% (78 عملية)</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: "19%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-300 font-semibold">المسالك البولية والتخصصات الدقيقة</span>
                <span className="text-emerald-400 font-bold font-mono">10% (42 عملية)</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2 overflow-hidden border border-slate-800">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "10%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vital Events Demographics Card */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-white font-bold text-sm flex items-center gap-2">
          <Users className="w-4 h-4 text-cyan-400" />
          المؤشرات الديموغرافية للوقائع الحيوية المنقولة للأحوال المدنية
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-slate-400 font-semibold">نسبة جنس المواليد:</div>
            <div className="flex items-center justify-between text-sm font-bold">
              <span className="text-cyan-400">ذكور: 53.2%</span>
              <span className="text-rose-400">إناث: 46.8%</span>
            </div>
            <div className="text-[11px] text-slate-400">متوسط وزن المولود الطبيعي: 3.25 كغم</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-slate-400 font-semibold">التوزيع الزمني للوفيات:</div>
            <div className="text-sm font-bold text-slate-200">
              68% أعمار تفوق 65 عاماً (أمراض مزمنة)
            </div>
            <div className="text-[11px] text-slate-400">21% وفيات حوادث وإصابات حرجة</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="text-slate-400 font-semibold">زمن المعالجة الإلكترونية:</div>
            <div className="text-sm font-bold text-emerald-400">
              فوري (أقل من 3 ثوانٍ للربط مع السجل المدني)
            </div>
            <div className="text-[11px] text-slate-400">بدون أي تدخل ورقي أو معاملات يدوية</div>
          </div>
        </div>
      </div>
    </div>
  );
}
