"use client";

import React, { useState, useEffect } from "react";
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  DollarSign,
  AlertTriangle,
  Car,
  CreditCard,
  Printer,
  ShieldCheck,
  TrendingUp,
  MapPin,
  CheckCircle2,
  FileSpreadsheet,
  FileText,
} from "lucide-react";
import { trafficService } from "@/lib/api/trafficService";
import { TrafficDirectorMetrics, TrafficViolation } from "@/types/traffic";

export default function TrafficReportsPage() {
  const [metrics, setMetrics] = useState<TrafficDirectorMetrics | null>(null);
  const [violations, setViolations] = useState<TrafficViolation[]>([]);
  const [selectedGovernorate, setSelectedGovernorate] = useState("all");
  const [selectedMonth, setSelectedMonth] = useState("2026-09");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [m, v] = await Promise.all([
          trafficService.getDirectorMetrics(),
          trafficService.getTrafficViolations(),
        ]);
        setMetrics(m);
        setViolations(v);
      } catch (err) {
        console.error("Error loading traffic reports:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalViolations = violations.length;
  const paidViolations = violations.filter((v) => v.paymentStatus === "Paid");
  const unpaidViolations = violations.filter((v) => v.paymentStatus === "Unpaid");
  const totalPaidRevenue = paidViolations.reduce((acc, c) => acc + c.fineAmount, 0);
  const totalUnpaidRevenue = unpaidViolations.reduce((acc, c) => acc + c.fineAmount, 0);

  const radarHotspots = [
    { location: "شارع الستين الغربي - تقاطع مذبح", count: 420, governorate: "أمانة العاصمة", speedLimit: 70, avgRecorded: 98 },
    { location: "طريق المطار - جسر النصر", count: 310, governorate: "أمانة العاصمة", speedLimit: 80, avgRecorded: 112 },
    { location: "خط الجسر البحري - المنصورة / خور مكسر", count: 285, governorate: "عدن", speedLimit: 80, avgRecorded: 105 },
    { location: "شارع جمال - جولة الحوض", count: 190, governorate: "تعز", speedLimit: 50, avgRecorded: 74 },
    { location: "شارع الستين الساحلي - المكلا", count: 145, governorate: "حضرموت", speedLimit: 60, avgRecorded: 82 },
  ];

  const handleExport = (type: "pdf" | "excel") => {
    alert(`جارِ تجهيز وتصدير التقرير المروري الشامل بصيغة ${type === "pdf" ? "PDF رسمي معتمد" : "Excel مصنف بالكامل"}...`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5">
              <BarChart3 className="w-3.5 h-3.5 text-primary" />
              المستوى الثاني: الرقابة والتحليل الإحصائي
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary font-headline-lg">
            تقارير ومؤشرات السلامة المرورية والتحصيل
          </h1>
          <p className="text-secondary text-sm md:text-base mt-1">
            تحليل معدلات المخالفات، النقاط السوداء للحوادث، كفاءة التحصيل المالي، ورصد الرادارات الذكية
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => handleExport("excel")}
            className="px-4 py-2.5 bg-surface-container hover:bg-surface-container-high border border-outline-variant text-primary rounded-lg text-xs font-semibold transition-all flex items-center gap-2"
          >
            <FileSpreadsheet className="w-4 h-4 text-tertiary" />
            تصدير كشف Excel
          </button>
          <button
            onClick={() => handleExport("pdf")}
            className="px-4 py-2.5 bg-primary hover:bg-primary-container text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-2 active:scale-95"
          >
            <Printer className="w-4 h-4" />
            طباعة تقرير PDF معتمد
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-surface-container-lowest rounded-xl p-4 shadow-[0_4px_20px_rgba(11,79,108,0.05)] border border-outline-variant/30 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-semibold text-secondary">
            <Calendar className="w-4 h-4 text-primary" />
            <span>الفترة الزمنية:</span>
          </div>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-surface border border-outline-variant rounded-lg px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary font-mono"
          />

          <div className="flex items-center gap-2 text-xs font-semibold text-secondary mr-2">
            <Filter className="w-4 h-4 text-primary" />
            <span>المحافظة:</span>
          </div>
          <select
            value={selectedGovernorate}
            onChange={(e) => setSelectedGovernorate(e.target.value)}
            className="bg-surface border border-outline-variant rounded-lg px-3 py-1.5 text-xs text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="all">كافة المحافظات</option>
            <option value="أمانة العاصمة">أمانة العاصمة</option>
            <option value="عدن">عدن</option>
            <option value="تعز">تعز</option>
            <option value="حضرموت">حضرموت</option>
            <option value="الحديدة">الحديدة</option>
          </select>
        </div>

        <span className="text-xs text-secondary font-mono">
          تم إنشاء التقرير: {new Date().toLocaleDateString("ar-YE")}
        </span>
      </div>

      {/* Revenue & Compliance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/30 shadow-[0_4px_20px_rgba(11,79,108,0.05)]">
          <div className="text-xs font-semibold text-secondary mb-1">إجمالي الإيرادات المحصلة</div>
          <div className="text-2xl md:text-3xl font-bold text-tertiary font-headline-lg tabular-nums">
            {(totalPaidRevenue + 14850000).toLocaleString("ar-YE")}{" "}
            <span className="text-xs font-normal text-secondary">ريال</span>
          </div>
          <div className="text-xs text-tertiary mt-2 flex items-center gap-1 font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>توريد مباشر للبنك المركزي اليمني</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/30 shadow-[0_4px_20px_rgba(11,79,108,0.05)]">
          <div className="text-xs font-semibold text-secondary mb-1">الغرامات المعلقة قيد السداد</div>
          <div className="text-2xl md:text-3xl font-bold text-error font-headline-lg tabular-nums">
            {(totalUnpaidRevenue + 4200000).toLocaleString("ar-YE")}{" "}
            <span className="text-xs font-normal text-secondary">ريال</span>
          </div>
          <div className="text-xs text-error mt-2 font-semibold">
            <span>{unpaidViolations.length + 142} مخالفة غير مسددة</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/30 shadow-[0_4px_20px_rgba(11,79,108,0.05)]">
          <div className="text-xs font-semibold text-secondary mb-1">نسبة الالتزام بالسداد الفوري</div>
          <div className="text-2xl md:text-3xl font-bold text-primary font-headline-lg tabular-nums">
            78.4%
          </div>
          <div className="text-xs text-secondary mt-2 font-semibold">
            <span>عبر تطبيق هويتي والمحافظ الرقمية</span>
          </div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/30 shadow-[0_4px_20px_rgba(11,79,108,0.05)]">
          <div className="text-xs font-semibold text-secondary mb-1">انخفاض الحوادث المرورية</div>
          <div className="text-2xl md:text-3xl font-bold text-tertiary font-headline-lg tabular-nums">
            -23.6%
          </div>
          <div className="text-xs text-tertiary mt-2 flex items-center gap-1 font-semibold">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>مقارنة بنفس الفترة من العام الماضي</span>
          </div>
        </div>
      </div>

      {/* Top Speed Cameras & Blackspots Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Radar Hotspots Table (7 cols) */}
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_20px_rgba(11,79,108,0.05)] border border-outline-variant/30">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                <MapPin className="w-5 h-5 text-error" />
                أعلى المواقع والتقاطعات تسجيلاً للمخالفات
              </h3>
              <p className="text-xs text-secondary mt-0.5">نقاط الرصد الراداري والدوريات الذكية</p>
            </div>
            <span className="px-2.5 py-0.5 bg-error/10 text-error text-xs font-bold rounded-full">
              نقاط حرجة
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead>
                <tr className="border-b border-outline-variant/30 text-secondary bg-surface-container-low/40">
                  <th className="py-2.5 px-3">الموقع والشارع</th>
                  <th className="py-2.5 px-3">المحافظة</th>
                  <th className="py-2.5 px-3 font-mono">السرعة المسموحة</th>
                  <th className="py-2.5 px-3 font-mono">متوسط سرعة الرصد</th>
                  <th className="py-2.5 px-3 font-mono">المخالفات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/20">
                {radarHotspots.map((spot, i) => (
                  <tr key={i} className="hover:bg-surface-container-lowest">
                    <td className="py-3 px-3 font-semibold text-primary">{spot.location}</td>
                    <td className="py-3 px-3 text-secondary">{spot.governorate}</td>
                    <td className="py-3 px-3 font-mono text-secondary">{spot.speedLimit} كم/س</td>
                    <td className="py-3 px-3 font-mono font-bold text-error">{spot.avgRecorded} كم/س</td>
                    <td className="py-3 px-3 font-mono font-bold text-primary">{spot.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Governorates Performance Breakdown (5 cols) */}
        <div className="lg:col-span-5 bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_20px_rgba(11,79,108,0.05)] border border-outline-variant/30 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-primary flex items-center gap-2 mb-2">
              <BarChart3 className="w-5 h-5 text-primary-container" />
              مؤشرات الفروع والمحافظات
            </h3>
            <p className="text-xs text-secondary mb-4">
              إحصائيات إنجاز المعاملات المرورية والرخص اليومية
            </p>

            <div className="space-y-3 text-xs">
              {(metrics?.branchIssuanceStats || [
                { branchName: "مرور أمانة العاصمة - الحصبة", governorate: "أمانة العاصمة", licensesToday: 184, violationsToday: 320 },
                { branchName: "مرور عدن - خور مكسر", governorate: "عدن", licensesToday: 112, violationsToday: 180 },
                { branchName: "مرور تعز - الحوبان", governorate: "تعز", licensesToday: 95, violationsToday: 140 },
                { branchName: "مرور حضرموت - المكلا", governorate: "حضرموت", licensesToday: 68, violationsToday: 85 },
              ]).map((branch, idx) => (
                <div key={idx} className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/20 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-primary">{branch.branchName}</div>
                    <div className="text-[11px] text-secondary">{branch.governorate}</div>
                  </div>
                  <div className="text-left font-mono">
                    <span className="text-tertiary font-bold block">{branch.licensesToday} رخصة</span>
                    <span className="text-error font-semibold block">{branch.violationsToday} مخالفة</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-outline-variant/30 mt-4 text-xs text-secondary flex items-center justify-between">
            <span>الربط المركزي مفعل لكافة الفروع</span>
            <span className="text-tertiary font-bold">100% متصل</span>
          </div>
        </div>
      </div>
    </div>
  );
}
