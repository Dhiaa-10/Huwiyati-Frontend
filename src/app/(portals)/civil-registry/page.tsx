"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import {
  Users,
  CreditCard,
  Baby,
  HeartCrack,
  Clock,
  CheckCircle2,
  ArrowUpRight,
  ShieldCheck,
  RefreshCw,
  Eye,
  FileCheck2,
  Plus,
} from "lucide-react";
import { civilRegistryService } from "@/lib/api/civilRegistryService";
import {
  BirthCertificateDto,
  DeathCertificateDto,
  NationalIdCardDto,
  FamilySummaryDto,
} from "@/types/civilRegistry";
import { useAuth } from "@/context/AuthContext";

function CivilRegistryDashboardContent() {
  const { user } = useAuth();

  const [cards, setCards] = useState<NationalIdCardDto[]>([]);
  const [families, setFamilies] = useState<FamilySummaryDto[]>([]);
  const [births, setBirths] = useState<BirthCertificateDto[]>([]);
  const [deaths, setDeaths] = useState<DeathCertificateDto[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [c, f, b, d] = await Promise.all([
        civilRegistryService.getNationalIdCards().catch(() => []),
        civilRegistryService.getFamilies().catch(() => []),
        civilRegistryService.getBirthCertificates().catch(() => []),
        civilRegistryService.getDeathCertificates().catch(() => []),
      ]);
      setCards(c);
      setFamilies(f);
      setBirths(b);
      setDeaths(d);
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalActiveCards = cards.filter((c) => c.status === "Active" || !c.status).length;
  const totalFamilies = families.length;
  const totalBirths = births.length;
  const totalDeaths = deaths.length;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-[#00374e] uppercase tracking-wider">
              مصلحة الأحوال المدنية والسجل المدني • {user?.branchName || "الفرع المركزي"}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#00374e]">
            لوحة تحكم ومؤشرات السجل المدني
          </h1>
          <p className="text-sm text-[#41484d] mt-1">
            متابعة فورية ومباشرة للبطاقات الشخصية، القيود العائلية، والوقائع الحيوية المرتبطة بالباكند الحي.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 bg-white border border-[#e0e3e5] rounded-xl hover:bg-slate-50 text-slate-700 transition-all flex items-center gap-2 text-xs font-bold cursor-pointer"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 text-[#0b4f6c] ${loading ? "animate-spin" : ""}`} />
            <span>تحديث المؤشرات</span>
          </button>

          <Link
            href="/civil-registry/id-cards"
            className="px-5 py-2.5 bg-[#0b4f6c] hover:bg-[#00374e] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إصدار بطاقة شخصية</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards (Live from Backend) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: National ID Cards */}
        <div className="bg-white p-6 rounded-2xl border border-[#e0e3e5] shadow-xs hover:border-[#0b4f6c]/40 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-[#c5e7ff]/40 flex items-center justify-center text-[#0b4f6c]">
              <CreditCard className="w-6 h-6" />
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              سارية
            </span>
          </div>
          <p className="text-xs text-[#41484d] mb-1 font-semibold">البطاقات الشخصية السارية</p>
          <h3 className="text-3xl font-black text-[#191c1e] font-mono">
            {totalActiveCards.toLocaleString("ar-YE")}
          </h3>
          <p className="text-[11px] text-slate-500 mt-2">من إجمالي {cards.length} مسجلة بالنظام</p>
        </div>

        {/* Card 2: Family Cards */}
        <div className="bg-white p-6 rounded-2xl border border-[#e0e3e5] shadow-xs hover:border-[#0b4f6c]/40 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-purple-50 flex items-center justify-center text-purple-700">
              <Users className="w-6 h-6" />
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">
              قيود معتمدة
            </span>
          </div>
          <p className="text-xs text-[#41484d] mb-1 font-semibold">القيود والبطاقات العائلية</p>
          <h3 className="text-3xl font-black text-purple-900 font-mono">
            {totalFamilies.toLocaleString("ar-YE")}
          </h3>
          <p className="text-[11px] text-slate-500 mt-2">عقود زواج وسجلات أسر موثقة</p>
        </div>

        {/* Card 3: Birth Certificates */}
        <div className="bg-white p-6 rounded-2xl border border-[#e0e3e5] shadow-xs hover:border-[#0b4f6c]/40 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-sky-50 flex items-center justify-center text-sky-700">
              <Baby className="w-6 h-6" />
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800">
              مقيد
            </span>
          </div>
          <p className="text-xs text-[#41484d] mb-1 font-semibold">شهادات الميلاد الصادرة</p>
          <h3 className="text-3xl font-black text-sky-800 font-mono">
            {totalBirths.toLocaleString("ar-YE")}
          </h3>
          <p className="text-[11px] text-slate-500 mt-2">أرقام وطنية ممنوحة للمواليد</p>
        </div>

        {/* Card 4: Death Certificates */}
        <div className="bg-white p-6 rounded-2xl border border-[#e0e3e5] shadow-xs hover:border-[#0b4f6c]/40 transition-all">
          <div className="flex justify-between items-start mb-4">
            <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center text-rose-700">
              <HeartCrack className="w-6 h-6" />
            </div>
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">
              مثبت
            </span>
          </div>
          <p className="text-xs text-[#41484d] mb-1 font-semibold">شهادات الوفاة المسجلة</p>
          <h3 className="text-3xl font-black text-rose-800 font-mono">
            {totalDeaths.toLocaleString("ar-YE")}
          </h3>
          <p className="text-[11px] text-slate-500 mt-2">إيقاف قيود وتحديث سجلات</p>
        </div>
      </div>

      {/* Quick Navigation Action Grid (Only Real Backend Modules) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <Link
          href="/civil-registry/id-cards"
          className="p-5 bg-gradient-to-br from-[#00374e] to-[#0b4f6c] text-white rounded-2xl shadow-sm hover:shadow-md transition-all group flex items-center justify-between"
        >
          <div>
            <div className="text-xs text-[#8ac0e1] font-semibold">الهوية الوطنية والبطاقات الذكية</div>
            <h4 className="text-base font-bold mt-1">إدارة البطاقات الشخصية</h4>
            <p className="text-xs text-white/70 mt-1">إصدار، تجديد، ومعاينة رقمية للبطاقة</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center group-hover:scale-110 transition-transform">
            <CreditCard className="w-6 h-6 text-[#97cdef]" />
          </div>
        </Link>

        <Link
          href="/civil-registry/families"
          className="p-5 bg-white border border-[#e0e3e5] rounded-2xl shadow-xs hover:shadow-md hover:border-[#0b4f6c]/40 transition-all group flex items-center justify-between"
        >
          <div>
            <div className="text-xs text-slate-500 font-semibold">السجل العائلي والزواج</div>
            <h4 className="text-base font-bold text-[#00374e] mt-1">القيود والبطاقات العائلية</h4>
            <p className="text-xs text-[#41484d] mt-1">إصدار بطاقة عائلية وشجرة الأسرة</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users className="w-6 h-6" />
          </div>
        </Link>

        <Link
          href="/civil-registry/vital-events"
          className="p-5 bg-white border border-[#e0e3e5] rounded-2xl shadow-xs hover:shadow-md hover:border-[#0b4f6c]/40 transition-all group flex items-center justify-between"
        >
          <div>
            <div className="text-xs text-slate-500 font-semibold">السجل المدني المركزي</div>
            <h4 className="text-base font-bold text-[#00374e] mt-1">الوقائع الحيوية الرسمية</h4>
            <p className="text-xs text-[#41484d] mt-1">شهادات الميلاد والوفاة الحية</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </Link>
      </div>

      {/* Live Recent Registered Documents Table */}
      <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-xs p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-[#00374e]">
              آخر البطاقات الشخصية الصادرة عبر النظام
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              بيانات حية ومسترجعة مباشرة من قاعدة بيانات الأحوال المدنية.
            </p>
          </div>

          <Link
            href="/civil-registry/id-cards"
            className="text-xs font-bold text-[#0b4f6c] hover:underline flex items-center gap-1"
          >
            <span>عرض كافة البطاقات</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center items-center gap-2 text-slate-400 text-xs">
            <RefreshCw className="w-4 h-4 animate-spin text-[#0b4f6c]" />
            <span>جاري استرجاع السجلات الحية...</span>
          </div>
        ) : cards.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            لا توجد بطاقات مسجلة حالياً.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead className="bg-[#f7f9fb] border-b border-slate-200 text-xs font-bold text-slate-600">
                <tr>
                  <th className="py-3 px-4">اسم المواطن</th>
                  <th className="py-3 px-4">الرقم الوطني الدائم</th>
                  <th className="py-3 px-4">فرع الإصدار</th>
                  <th className="py-3 px-4">تاريخ الإصدار</th>
                  <th className="py-3 px-4">تاريخ الانتهاء</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4 text-center">إجراء</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {cards.slice(0, 5).map((card) => (
                  <tr key={card.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-800">
                      {card.fullName}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                      {card.nationalNumber}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {card.branchName || "مصلحة الأحوال المدنية"}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {card.issueDate}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {card.expiryDate}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold text-[10px] border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{card.status || "سارية"}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Link
                        href="/civil-registry/id-cards"
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#0b4f6c] hover:bg-[#00374e] text-white font-bold text-[11px] transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>معاينة</span>
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

export default function CivilRegistryDashboardPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">جاري تحميل لوحة التحكم...</div>}>
      <CivilRegistryDashboardContent />
    </Suspense>
  );
}
