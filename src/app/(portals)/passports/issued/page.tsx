"use client";

import React, { useState, useEffect } from "react";
import {
  BookOpenCheck,
  Search,
  ShieldCheck,
  ShieldAlert,
  Calendar,
  Building2,
  QrCode,
  Eye,
  RefreshCw,
  X,
  Printer,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { passportsService } from "@/lib/api/passportsService";
import { PassportRecord } from "@/types/passports";
import { HwyatiLogo } from "@/components/ui/hwyati-logo";

export default function IssuedPassportsPage() {
  const [passports, setPassports] = useState<PassportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPassport, setSelectedPassport] = useState<PassportRecord | null>(null);
  const [ePassportModalOpen, setEPassportModalOpen] = useState(false);

  useEffect(() => {
    loadPassports();
  }, [statusFilter]);

  const loadPassports = async () => {
    setLoading(true);
    try {
      const items = await passportsService.getPassports(
        search,
        statusFilter === "all" ? undefined : statusFilter
      );
      setPassports(items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInspect = (pass: PassportRecord) => {
    setSelectedPassport(pass);
    setEPassportModalOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0b4f6c] mb-1">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            السجل العام للجوازات الإلكترونية الصادرة
          </div>
          <h1 className="text-2xl font-bold text-[#00374e]">
            سجل الجوازات الإلكترونية المعتمدة
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            الأرشيف الموحد لكافة جوازات السفر الصادرة من جميع فروع الجمهورية والممثليات بالخارج
          </p>
        </div>

        <button
          onClick={loadPassports}
          disabled={loading}
          className="p-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors shadow-sm self-start md:self-auto"
          title="تحديث البيانات"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#0b4f6c]" : ""}`} />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="البحث برقم الجواز، الاسم، أو الرقم الوطني..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadPassports()}
            className="w-full pl-3 pr-9 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#0b4f6c]"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full md:w-auto overflow-x-auto text-xs">
          {[
            { label: "كافة الجوازات", value: "all" },
            { label: "سارية المفعول (Active)", value: "Active" },
            { label: "منتهية الصلاحية (Expired)", value: "Expired" },
            { label: "ملغاة أو تالفة (Canceled)", value: "Canceled" },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={`px-3 py-1.5 rounded-lg transition-colors font-medium whitespace-nowrap ${
                statusFilter === tab.value
                  ? "bg-[#00374e] text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Passports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-full py-16 text-center text-xs text-gray-400 flex flex-col items-center gap-2">
            <RefreshCw className="w-6 h-6 animate-spin text-[#0b4f6c]" />
            <span>جاري تحميل سجلات الجوازات...</span>
          </div>
        ) : passports.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-gray-400">
            لا توجد جوازات مطابقة لمعايير البحث.
          </div>
        ) : (
          passports.map((pass) => (
            <div
              key={pass.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:border-[#0b4f6c]/40 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Card Top */}
                <div className="flex items-start justify-between gap-3 mb-3 border-b border-gray-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-14 rounded-lg bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                      <img
                        src={pass.photoUrl}
                        alt={pass.fullName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-gray-900 group-hover:text-[#00374e] transition-colors">
                        {pass.fullName}
                      </h4>
                      <p className="text-[11px] font-mono text-[#0b4f6c] font-bold mt-0.5">
                        {pass.passportNumber}
                      </p>
                      <p className="text-[10px] text-gray-400 font-mono">
                        رقم وطني: {pass.nationalNumber}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      pass.status === "Active"
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : pass.status === "Expired"
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-rose-50 text-rose-700 border border-rose-200"
                    }`}
                  >
                    {pass.status === "Active"
                      ? "ساري"
                      : pass.status === "Expired"
                      ? "منتهي"
                      : "ملغي"}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-1.5 text-xs text-gray-600">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-[11px]">نوع الجواز:</span>
                    <span className="font-semibold text-gray-800">{pass.passportTypeLabel}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-[11px]">فرع الإصدار:</span>
                    <span className="font-semibold text-gray-800">{pass.issuingBranchName}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-[11px]">تاريخ الانتهاء:</span>
                    <span className="font-mono text-gray-800">{pass.expiryDate}</span>
                  </div>

                  {pass.isWatchlistBanned && (
                    <div className="mt-2 p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] font-bold flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      <span>مدرج بقائمة حظر السفر</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom inspect button */}
              <div className="pt-4 border-t border-gray-100 mt-4 flex items-center justify-between">
                <span className="text-[10px] text-gray-400">
                  الإصدار: {pass.issueDate}
                </span>
                <button
                  onClick={() => handleInspect(pass)}
                  className="px-3 py-1.5 rounded-lg bg-[#00374e] hover:bg-[#0b4f6c] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>معاينة وثيقة الجواز</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Electronic Passport Digital Replica Modal */}
      {ePassportModalOpen && selectedPassport && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#002f43] text-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-2xl border border-[#0b4f6c] relative overflow-hidden animate-fade-in">
            {/* Background Hologram overlay */}
            <div className="absolute inset-0 bg-[radial-gradient(#8ac0e1_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none"></div>

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#8ac0e1]/20 pb-4 relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#094863] flex items-center justify-center p-1.5 border border-[#8ac0e1]/30">
                  <HwyatiLogo size={28} showText={false} />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">
                    جواز سفر إلكتروني يمني رسمي (e-Passport)
                  </h3>
                  <p className="text-[11px] text-[#8ac0e1]">
                    REPUBLIC OF YEMEN • PASSPORT • مصلحة الهجرة والجوازات
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEPassportModalOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Passport Data Page Visual Replica */}
            <div className="bg-gradient-to-br from-[#f8fafc] to-[#e2e8f0] text-gray-900 rounded-2xl p-6 shadow-inner border-2 border-amber-400/60 relative z-10 space-y-5">
              {/* Header inside passport */}
              <div className="flex items-center justify-between border-b border-gray-300 pb-3">
                <div>
                  <div className="text-[11px] font-bold text-[#00374e]">
                    الجمهورية اليمنية • REPUBLIC OF YEMEN
                  </div>
                  <div className="text-[9px] text-gray-500 font-mono tracking-wider">
                    PASSPORT TYPE: {selectedPassport.passportType.toUpperCase()}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-gray-500">رقم الجواز / Passport No.</div>
                  <div className="text-base font-black font-mono text-[#00374e]">
                    {selectedPassport.passportNumber}
                  </div>
                </div>
              </div>

              {/* Citizen Photo & Details */}
              <div className="flex flex-col sm:flex-row gap-5 items-start">
                <div className="w-32 h-40 rounded-xl border-2 border-gray-400 overflow-hidden bg-gray-200 shrink-0 shadow-md relative">
                  <img
                    src={selectedPassport.photoUrl}
                    alt={selectedPassport.fullName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-center text-white py-0.5 font-mono">
                    YEM-BIO-CHIP
                  </div>
                </div>

                <div className="flex-1 grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-gray-500 block">الاسم الكامل / Full Name</span>
                    <span className="font-bold text-gray-900 text-sm">
                      {selectedPassport.fullName}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-500 block">اسم الأم / Mother Name</span>
                    <span className="font-semibold text-gray-800">
                      {selectedPassport.motherName}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-500 block">الرقم الوطني / National ID</span>
                    <span className="font-mono font-bold text-gray-900">
                      {selectedPassport.nationalNumber}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-500 block">الجنس / Sex</span>
                    <span className="font-semibold text-gray-800">
                      {selectedPassport.gender === "Male" ? "ذكر / M" : "أنثى / F"}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-500 block">تاريخ الإصدار / Date of Issue</span>
                    <span className="font-mono font-semibold text-gray-800">
                      {selectedPassport.issueDate}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] text-gray-500 block">تاريخ الانتهاء / Date of Expiry</span>
                    <span className="font-mono font-bold text-emerald-800">
                      {selectedPassport.expiryDate}
                    </span>
                  </div>

                  <div className="col-span-2">
                    <span className="text-[10px] text-gray-500 block">جهة الإصدار / Authority</span>
                    <span className="font-semibold text-gray-800">
                      {selectedPassport.issuingBranchName} - مصلحة الهجرة والجوازات
                    </span>
                  </div>
                </div>
              </div>

              {/* Machine Readable Zone (MRZ) */}
              <div className="p-3 bg-gray-100 rounded-xl border border-gray-300 font-mono text-[11px] tracking-widest text-gray-700 leading-relaxed overflow-x-auto select-all">
                <div>P&lt;YEM{selectedPassport.fullName.replace(/\s+/g, "&lt;&lt;").slice(0, 30)}&lt;&lt;&lt;&lt;&lt;</div>
                <div>{selectedPassport.passportNumber}4YEM8501015M3012318&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;&lt;02</div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between relative z-10 pt-2 border-t border-[#8ac0e1]/20">
              <div className="text-xs text-[#8ac0e1]">
                الضابط المسؤول: الرائد خالد يحيى العريقي
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-all flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة الشهادة الرقمية</span>
                </button>
                <button
                  onClick={() => setEPassportModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-[#0b4f6c] hover:bg-[#8ac0e1] hover:text-[#001e2d] text-white text-xs font-bold transition-all"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
