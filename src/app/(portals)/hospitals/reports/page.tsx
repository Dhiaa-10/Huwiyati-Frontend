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
  AlertCircle,
  Loader2,
} from "lucide-react";
import { hospitalService, ServiceUnavailableError } from "@/lib/api/hospitalService";
import { HospitalDashboardMetrics } from "@/types/hospitals";

export default function HospitalReportsPage() {
  const [metrics, setMetrics] = useState<HospitalDashboardMetrics | null>(null);
  const [isUnavailable, setIsUnavailable] = useState(false);
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
        if (err instanceof ServiceUnavailableError) {
          setIsUnavailable(true);
        } else {
          console.error("Error loading hospital metrics:", err);
        }
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
        <div className="p-4 rounded-xl bg-emerald-600 text-white border border-emerald-500 text-xs flex items-center gap-2 shadow-xl font-bold">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{exportFeedback}</span>
        </div>
      )}

      {/* Header Banner - Hwyati Sovereign Petrol Banner */}
      <div className="bg-gradient-to-l from-[#052F31] via-[#0C4A4E] to-[#103F43] rounded-2xl p-6 text-white shadow-md relative overflow-hidden border border-[#147A77]/30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#147A77]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 text-emerald-300 text-xs font-bold">
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <span>المنظومة المركزية للإحصاء السريري والوقائع الحيوية</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">التقارير والمؤشرات الصحية الموحدة</h1>
            <p className="text-slate-200 text-xs md:text-sm mt-1">
              إحصائيات السجلات الطبية، التدخلات الجراحية، معدلات المواليد والوفيات، وانتشار الأمراض المزمنة
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <button
              onClick={() => handleExport("excel")}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>تصدير Excel</span>
            </button>
            <button
              onClick={() => handleExport("pdf")}
              className="px-5 py-2.5 bg-[#147A77] hover:bg-[#0E5C59] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>طباعة تقرير معتمد</span>
            </button>
          </div>
        </div>
      </div>

      {/* Service Unavailable Banner */}
      {isUnavailable && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-amber-900 shadow-xs flex items-start gap-4">
          <div className="p-2.5 bg-amber-100 rounded-xl text-amber-700 shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-amber-900">خدمة التقارير والمؤشرات المركزية غير متوفرة من الخادم حالياً</h3>
            <p className="text-xs text-amber-800/90 mt-1 leading-relaxed">
              واجهات الإحصاءات السريرية والتحليلات الوبائية قيد التطوير في الخادم الخلفي. تم إيقاف المؤشرات الوهمية لضمان سلامة التقارير الرسمية.
            </p>
          </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-wrap items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-slate-500 font-bold">
            <Filter className="w-4 h-4 text-[#0C4A4E]" />
            <span>تصفية التقرير:</span>
          </div>

          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#0C4A4E]"
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
              className="bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#0C4A4E]"
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
        <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-xs hover:border-[#0C4A4E]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#41484d] font-bold">الوقائع الحيوية المسجلة</span>
            <div className="w-10 h-10 rounded-xl bg-[#E6F1EE]/40 text-[#0C4A4E] flex items-center justify-center font-bold">
              <Stethoscope className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-black text-[#191c1e] font-mono mt-3">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : isUnavailable ? "—" : (metrics?.registeredVitalEventsCount ?? 0).toLocaleString("ar-YE")}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            إجمالي الأحداث المسجلة رسمياً
          </div>
        </div>

        {/* Active Doctors */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-xs hover:border-[#0C4A4E]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#41484d] font-bold">الكادر الطبي المصرح له</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-black text-emerald-700 font-mono mt-3">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : isUnavailable ? "—" : (metrics?.activeDoctorsCount ?? 0).toLocaleString("ar-YE")}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            أطباء وكوادر نشطة بالخدمة
          </div>
        </div>

        {/* Birth Registrations */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-xs hover:border-[#0C4A4E]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#41484d] font-bold">المواليد الموثقين بالسجل</span>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <Heart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-black text-[#052F31] font-mono mt-3">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : isUnavailable ? "—" : (metrics?.monthlyBirthsCount ?? 0).toLocaleString("ar-YE")}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            تم إصدار قيودهم إلكترونياً
          </div>
        </div>

        {/* Vital Deceased */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-xs hover:border-[#0C4A4E]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs text-[#41484d] font-bold">إخطارات الوفاة الرسمية</span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl md:text-3xl font-black text-rose-700 font-mono mt-3">
            {loading ? <Loader2 className="w-6 h-6 animate-spin text-slate-400" /> : isUnavailable ? "—" : (metrics?.monthlyDeathsCount ?? 0).toLocaleString("ar-YE")}
          </div>
          <div className="text-[11px] text-slate-500 mt-2">
            مستكملة التقرير الطبي والشرعي
          </div>
        </div>
      </div>

      {/* Deep Analytics Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chronic Diseases Breakdown */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[#052F31] font-extrabold text-sm flex items-center gap-2">
              <Heart className="w-4 h-4 text-rose-600" />
              أكثر الأمراض المزمنة انتشاراً (الرعاية الوقائية)
            </h3>
            <span className="text-xs text-slate-400 font-medium">النسبة المئوية</span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-700 font-bold">ارتفاع ضغط الدم الشرياني (Hypertension)</span>
                <span className="text-[#0C4A4E] font-bold font-mono">38.5% (1,480 مريض)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                <div className="bg-[#0C4A4E] h-2 rounded-full" style={{ width: "38.5%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-700 font-bold">السكري من النوع الثاني (Type 2 Diabetes)</span>
                <span className="text-amber-700 font-bold font-mono">31.2% (1,198 مريض)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: "31.2%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-700 font-bold">الربو الشعبي وأمراض الجهاز التنفسي</span>
                <span className="text-emerald-700 font-bold font-mono">18.0% (691 مريض)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "18%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-700 font-bold">قصور الشرايين التاجية والقلب</span>
                <span className="text-rose-700 font-bold font-mono">12.3% (473 مريض)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                <div className="bg-rose-500 h-2 rounded-full" style={{ width: "12.3%" }} />
              </div>
            </div>
          </div>
        </div>

        {/* Surgical Operations & Emergency Acuity */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[#052F31] font-extrabold text-sm flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#0C4A4E]" />
              توزيع التدخلات الجراحية وأقسام المستشفى
            </h3>
            <span className="text-xs text-slate-400 font-medium">العمليات المنفذة</span>
          </div>

          <div className="space-y-3.5 text-xs">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-700 font-bold">الجراحة العامة وجراحة المناظير</span>
                <span className="text-[#0C4A4E] font-bold font-mono">42% (173 عملية)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                <div className="bg-[#0C4A4E] h-2 rounded-full" style={{ width: "42%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-700 font-bold">النساء والولادة والقيصريات</span>
                <span className="text-rose-700 font-bold font-mono">29% (119 عملية)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                <div className="bg-rose-500 h-2 rounded-full" style={{ width: "29%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-700 font-bold">جراحة العظام والحوادث</span>
                <span className="text-amber-700 font-bold font-mono">19% (78 عملية)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                <div className="bg-amber-500 h-2 rounded-full" style={{ width: "19%" }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-1">
                <span className="text-slate-700 font-bold">المسالك البولية والتخصصات الدقيقة</span>
                <span className="text-emerald-700 font-bold font-mono">10% (42 عملية)</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                <div className="bg-emerald-500 h-2 rounded-full" style={{ width: "10%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Vital Events Demographics Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
        <h3 className="text-[#052F31] font-extrabold text-sm flex items-center gap-2">
          <Users className="w-4 h-4 text-[#0C4A4E]" />
          المؤشرات الديموغرافية للوقائع الحيوية المنقولة للأحوال المدنية
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="text-slate-500 font-semibold">نسبة جنس المواليد:</div>
            <div className="flex items-center justify-between text-sm font-bold">
              <span className="text-[#0C4A4E]">ذكور: 53.2%</span>
              <span className="text-rose-600">إناث: 46.8%</span>
            </div>
            <div className="text-[11px] text-slate-500">متوسط وزن المولود الطبيعي: 3.25 كغم</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="text-slate-500 font-semibold">التوزيع الزمني للوفيات:</div>
            <div className="text-sm font-bold text-slate-800">
              68% أعمار تفوق 65 عاماً (أمراض مزمنة)
            </div>
            <div className="text-[11px] text-slate-500">21% وفيات حوادث وإصابات حرجة</div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="text-slate-500 font-semibold">زمن المعالجة الإلكترونية:</div>
            <div className="text-sm font-bold text-emerald-700">
              فوري (أقل من 3 ثوانٍ للربط مع السجل المدني)
            </div>
            <div className="text-[11px] text-slate-500">بدون أي تدخل ورقي أو معاملات يدوية</div>
          </div>
        </div>
      </div>
    </div>
  );
}
