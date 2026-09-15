"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Car,
  ShieldAlert,
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  Plus,
  Users,
  TrendingUp,
  BarChart3,
  MapPin,
  Eye,
  ArrowUpRight,
  ShieldCheck,
  Zap,
  DollarSign,
  Activity,
  FileCheck2,
  PhoneCall,
  UserCheck,
} from "lucide-react";
import { trafficService } from "@/lib/api/trafficService";
import { TrafficDirectorMetrics, TrafficViolation, Vehicle } from "@/types/traffic";

export default function TrafficDashboardPage() {
  const [metrics, setMetrics] = useState<TrafficDirectorMetrics | null>(null);
  const [recentViolations, setRecentViolations] = useState<TrafficViolation[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDept, setSelectedDept] = useState("all");

  useEffect(() => {
    async function loadData() {
      try {
        const [m, v] = await Promise.all([
          trafficService.getDirectorMetrics(),
          trafficService.getTrafficViolations(),
        ]);
        setMetrics(m);
        setRecentViolations(v.slice(0, 6));
      } catch (err) {
        console.error("Failed to load traffic dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const sampleStaff = [
    { id: "TRF-9021", name: "ملازم أول / أحمد عبدالله العتيبي", department: "إصدار الرخص", status: "نشط بالخدمة", shift: "الصباحية", badge: "A1" },
    { id: "TRF-9022", name: "مساعد أول / صالح ناصر السقاف", department: "الرادار والضبط", status: "دورية ميدانية", shift: "المسائية", badge: "B3" },
    { id: "TRF-9023", name: "ملازم ثانٍ / فؤاد علي القديمي", department: "التحصيل والمخالفات", status: "نشط بالخدمة", shift: "الصباحية", badge: "C2" },
    { id: "TRF-9024", name: "رقيب أول / ياسين عمر بامطرف", department: "الفحص الفني", status: "في إجازة", shift: "الصباحية", badge: "D1" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-primary animate-pulse" />
              الرقابة المرورية المركزية الموحدة
            </span>
            <span className="text-xs text-secondary">| تحديث فوري مباشر</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary font-headline-lg">
            إدارة المرور - لوحة القيادة والمؤشرات العامة
          </h1>
          <p className="text-secondary text-sm md:text-base mt-1">
            متابعة حركة السير، رصد المخالفات الرادارية الآلية، إصدار وتجديد رخص القيادة وسجلات المركبات
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <Link
            href="/traffic/violations"
            className="px-4 py-2.5 bg-error hover:bg-error/90 text-white rounded-lg text-sm font-semibold shadow-sm transition-all flex items-center gap-2 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            قيد مخالفة جديدة
          </Link>
          <Link
            href="/traffic/licenses"
            className="px-4 py-2.5 bg-primary hover:bg-primary-container text-white rounded-lg text-sm font-semibold shadow-sm transition-all flex items-center gap-2 active:scale-95"
          >
            <FileCheck2 className="w-4 h-4" />
            معالجة طلبات الرخص
          </Link>
        </div>
      </div>

      {/* Bento Grid: Main KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Registered Vehicles */}
        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_4px_20px_rgba(11,79,108,0.05)] border border-outline-variant/30 relative overflow-hidden group hover:border-primary-container/40 hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary-fixed/20 rounded-bl-full -z-0"></div>
          <div className="flex justify-between items-start relative z-10 mb-3">
            <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
              إجمالي المركبات المسجلة
            </span>
            <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
              <Car className="w-5 h-5" />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-2xl md:text-3xl font-bold text-primary font-headline-lg tabular-nums">
              {metrics ? metrics.totalRegisteredVehicles.toLocaleString("ar-YE") : "842,100"}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-tertiary">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+340 مركبة مفحوصة هذا الأسبوع</span>
            </div>
          </div>
        </div>

        {/* Card 2: Active Driving Licenses */}
        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_4px_20px_rgba(11,79,108,0.05)] border border-outline-variant/30 relative overflow-hidden group hover:border-primary-container/40 hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-tertiary-fixed/20 rounded-bl-full -z-0"></div>
          <div className="flex justify-between items-start relative z-10 mb-3">
            <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
              رخص القيادة الذكية الفعالة
            </span>
            <div className="p-2.5 bg-tertiary/10 text-tertiary rounded-lg">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-2xl md:text-3xl font-bold text-primary font-headline-lg tabular-nums">
              {metrics ? metrics.totalActiveDrivingLicenses.toLocaleString("ar-YE") : "612,400"}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-tertiary">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>98.4% رخص إلكترونية ذكية مشفرة</span>
            </div>
          </div>
        </div>

        {/* Card 3: Today's Violations */}
        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_4px_20px_rgba(11,79,108,0.05)] border border-outline-variant/30 relative overflow-hidden group hover:border-error/40 hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-error-container/20 rounded-bl-full -z-0"></div>
          <div className="flex justify-between items-start relative z-10 mb-3">
            <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
              المخالفات المرصودة اليوم
            </span>
            <div className="p-2.5 bg-error/10 text-error rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-2xl md:text-3xl font-bold text-error font-headline-lg tabular-nums">
              {metrics ? metrics.todayViolationsCount.toLocaleString("ar-YE") : "845"}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-error">
              <span>{metrics?.unpaidViolationsCount || "1,420"} مخالفة قيد التحصيل</span>
            </div>
          </div>
        </div>

        {/* Card 4: Today's Collected Fines */}
        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_4px_20px_rgba(11,79,108,0.05)] border border-outline-variant/30 relative overflow-hidden group hover:border-tertiary/40 hover:shadow-md transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-tertiary-fixed/30 rounded-bl-full -z-0"></div>
          <div className="flex justify-between items-start relative z-10 mb-3">
            <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
              إيرادات التحصيل اليوم
            </span>
            <div className="p-2.5 bg-tertiary-container text-white rounded-lg">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="relative z-10">
            <div className="text-2xl md:text-3xl font-bold text-primary font-headline-lg tabular-nums">
              {metrics ? metrics.todayRevenueCollected.toLocaleString("ar-YE") : "14,850,000"}{" "}
              <span className="text-xs font-normal text-secondary">ريال</span>
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-tertiary">
              <Zap className="w-3.5 h-3.5" />
              <span>تحصيل إلكتروني عبر هوية باي 100%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row: Top Violations Breakdown & Active Patrols Radar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Violation Types (7 cols) */}
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_20px_rgba(11,79,108,0.05)] border border-outline-variant/30">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary-container" />
                تحليل وتوزيع المخالفات الأكثر رصداً
              </h3>
              <p className="text-xs text-secondary mt-0.5">وفق بيانات الرادارات الذكية والدوريات الميدانية</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-surface-container text-secondary rounded-full border border-outline-variant">
              الشهر الحالي
            </span>
          </div>

          <div className="space-y-4">
            {(metrics?.topViolationTypes || [
              { type: "تجاوز السرعة المقررة (رادار)", count: 420, percentage: 46 },
              { type: "قطع الإشارة الضوئية", count: 215, percentage: 24 },
              { type: "الوقوف الخاطئ والممنوع", count: 160, percentage: 18 },
              { type: "استخدام الهاتف أثناء القيادة", count: 110, percentage: 12 },
            ]).map((item, idx) => (
              <div key={idx} className="space-y-1.5">
                <div className="flex justify-between items-center text-sm">
                  <span className="font-semibold text-on-surface">{item.type}</span>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-mono font-bold text-primary tabular-nums">{item.count} مخالفة</span>
                    <span className="text-secondary font-mono font-bold">{item.percentage}%</span>
                  </div>
                </div>
                <div className="w-full h-2.5 bg-surface-container-high rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      idx === 0
                        ? "bg-error"
                        : idx === 1
                        ? "bg-amber-500"
                        : idx === 2
                        ? "bg-primary-container"
                        : "bg-tertiary-container"
                    }`}
                    style={{ width: `${item.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-outline-variant/30 flex items-center justify-between text-xs text-secondary">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-tertiary" />
              يتم إشعار المخالف آلياً عبر رسالة SMS وتطبيق هويتي فور رصد المخالفة
            </span>
            <Link href="/traffic/reports" className="text-primary hover:underline font-semibold">
              عرض التحليل الكامل &larr;
            </Link>
          </div>
        </div>

        {/* Radar & Patrols Deployment Status (5 cols) */}
        <div className="lg:col-span-5 bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_20px_rgba(11,79,108,0.05)] border border-outline-variant/30 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-primary flex items-center gap-2">
                <Users className="w-5 h-5 text-primary-container" />
                جاهزية الدوريات والمفارز
              </h3>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-tertiary bg-tertiary/10 px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-ping"></span>
                48 دورية متصلة
              </span>
            </div>

            <p className="text-xs text-secondary mb-4">
              توزيع المفارز الميدانية ودوريات الرادار في الشوارع والتقاطعات الرئيسية
            </p>

            {/* Governorate Quick Stats */}
            <div className="space-y-3">
              {(metrics?.branchIssuanceStats || [
                { branchName: "مرور أمانة العاصمة - الحصبة", governorate: "أمانة العاصمة", licensesToday: 184, violationsToday: 320 },
                { branchName: "مرور عدن - خور مكسر", governorate: "عدن", licensesToday: 112, violationsToday: 180 },
                { branchName: "مرور تعز - الحوبان", governorate: "تعز", licensesToday: 95, violationsToday: 140 },
                { branchName: "مرور حضرموت - المكلا", governorate: "حضرموت", licensesToday: 68, violationsToday: 85 },
              ]).map((b, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-surface-container-low border border-outline-variant/20 hover:border-primary/30 transition-all">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-on-surface">{b.branchName}</div>
                      <div className="text-[11px] text-secondary">{b.governorate}</div>
                    </div>
                  </div>
                  <div className="text-left font-mono text-xs">
                    <div className="text-primary font-bold">{b.licensesToday} رخصة</div>
                    <div className="text-error font-semibold">{b.violationsToday} مخالفة</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-outline-variant/30 flex justify-between items-center text-xs">
            <span className="text-secondary">إجمالي القوى البشرية: 150 ضابط ومساعد</span>
            <Link href="/traffic/employees" className="text-primary font-semibold hover:underline">
              إدارة الضباط &larr;
            </Link>
          </div>
        </div>
      </div>

      {/* Third Row: Live Violations Log Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(11,79,108,0.05)] border border-outline-variant/30 overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-low/40">
          <div>
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-error" />
              أحدث المخالفات المرورية المرصودة
            </h3>
            <p className="text-xs text-secondary mt-0.5">تحديث مباشر من شبكة الكاميرات ونقاط الضبط المروري</p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/traffic/violations"
              className="px-3.5 py-1.5 bg-primary-container text-white text-xs font-semibold rounded-lg hover:bg-primary transition-all flex items-center gap-1.5 shadow-sm"
            >
              <span>فتح سجل المخالفات الكامل</span>
              <Eye className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs md:text-sm">
            <thead>
              <tr className="bg-surface-container text-secondary border-b border-outline-variant/40 font-semibold">
                <th className="py-3 px-5">رقم المخالفة</th>
                <th className="py-3 px-5">لوحة المركبة</th>
                <th className="py-3 px-5">نوع المخالفة</th>
                <th className="py-3 px-5">الموقع والمحافظة</th>
                <th className="py-3 px-5">التاريخ والوقت</th>
                <th className="py-3 px-5">الغرامة</th>
                <th className="py-3 px-5">حالة السداد</th>
                <th className="py-3 px-5 text-center">إجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 font-body-sm text-on-surface">
              {recentViolations.map((v) => (
                <tr key={v.id} className="hover:bg-surface-container-lowest transition-colors">
                  <td className="py-3.5 px-5 font-mono text-xs text-secondary font-bold">
                    #{v.id.slice(0, 8)}
                  </td>
                  <td className="py-3.5 px-5 font-bold">
                    <span className="px-2.5 py-1 bg-surface-container rounded border border-outline-variant font-mono tracking-wider text-xs">
                      {v.plateNumber}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 font-semibold text-primary">
                    {v.violationType}
                  </td>
                  <td className="py-3.5 px-5 text-secondary text-xs">
                    {v.location} - <span className="font-semibold text-on-surface">{v.governorate}</span>
                  </td>
                  <td className="py-3.5 px-5 font-mono text-xs tabular-nums text-secondary">
                    {v.violationDate} {v.violationTime}
                  </td>
                  <td className="py-3.5 px-5 font-bold font-mono text-on-surface">
                    {v.fineAmount.toLocaleString("ar-YE")} <span className="text-[11px] font-normal text-secondary">ريال</span>
                  </td>
                  <td className="py-3.5 px-5">
                    {v.paymentStatus === "Paid" ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-tertiary-container/10 text-tertiary-container border border-tertiary-container/20">
                        <CheckCircle2 className="w-3 h-3" />
                        مسدد
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-error/10 text-error border border-error/20">
                        <Clock className="w-3 h-3" />
                        غير مسدد
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <Link
                      href={`/traffic/violations?plate=${encodeURIComponent(v.plateNumber)}`}
                      className="px-3 py-1 bg-surface border border-outline-variant rounded text-xs font-semibold text-primary hover:bg-surface-container-high transition-colors"
                    >
                      معاينة
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fourth Row: Staff Management Table (Matching Stitch Screen 21) */}
      <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(11,79,108,0.05)] border border-outline-variant/30 overflow-hidden">
        <div className="px-6 py-4 border-b border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-low/40">
          <div>
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-primary-container" />
              إدارة موظفي وضباط المرور بالفرع
            </h3>
            <p className="text-xs text-secondary mt-0.5">جاهزية المناوبات والمهام اليومية وفق الهيكل التنظيمي</p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="bg-surface border border-outline-variant rounded-lg py-1.5 px-3 text-xs font-medium text-on-surface focus:outline-none focus:border-primary"
            >
              <option value="all">جميع الأقسام</option>
              <option value="licenses">إصدار الرخص</option>
              <option value="radar">الرادار والضبط</option>
              <option value="fines">التحصيل والمخالفات</option>
            </select>
            <Link
              href="/traffic/employees"
              className="px-3.5 py-1.5 bg-primary hover:bg-primary-container text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              إضافة ضابط
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs md:text-sm">
            <thead>
              <tr className="bg-surface-container text-secondary border-b border-outline-variant/40 font-semibold">
                <th className="py-3 px-5">الرقم العسكري</th>
                <th className="py-3 px-5">اسم الضابط / الموظف</th>
                <th className="py-3 px-5">القسم</th>
                <th className="py-3 px-5">المناوبة</th>
                <th className="py-3 px-5">الحالة الميدانية</th>
                <th className="py-3 px-5 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 font-body-sm text-on-surface">
              {sampleStaff.map((staff) => (
                <tr key={staff.id} className="hover:bg-surface-container-lowest transition-colors">
                  <td className="py-3.5 px-5 font-mono text-xs font-bold text-primary">
                    {staff.id}
                  </td>
                  <td className="py-3.5 px-5 font-bold text-on-surface flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-primary-container text-white flex items-center justify-center text-xs font-bold">
                      {staff.name.slice(0, 1)}
                    </div>
                    <span>{staff.name}</span>
                  </td>
                  <td className="py-3.5 px-5 text-secondary">{staff.department}</td>
                  <td className="py-3.5 px-5 text-secondary font-mono text-xs">{staff.shift}</td>
                  <td className="py-3.5 px-5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-tertiary-container/10 text-tertiary-container border border-tertiary-container/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary-container"></span>
                      {staff.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-center">
                    <Link
                      href="/traffic/employees"
                      className="text-primary hover:underline text-xs font-semibold"
                    >
                      تعديل الصلاحيات
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
