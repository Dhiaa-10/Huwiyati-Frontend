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
  PlusCircle,
  History,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import { passportsService } from "@/lib/api/passportsService";
import { PassportRecord, PassportType } from "@/types/passports";
import { HwyatiLogo } from "@/components/ui/hwyati-logo";
import { useAuth } from "@/context/AuthContext";

export default function IssuedPassportsPage() {
  const { user } = useAuth();
  const [passports, setPassports] = useState<PassportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedPassport, setSelectedPassport] = useState<PassportRecord | null>(null);
  const [ePassportModalOpen, setEPassportModalOpen] = useState(false);

  // Modals state
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [renewModalOpen, setRenewModalOpen] = useState(false);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);

  // Issue Passport Form
  const [issueForm, setIssueForm] = useState<{
    nationalNumber: string;
    passportType: PassportType;
    photoUrl: string;
  }>({
    nationalNumber: "",
    passportType: "Regular",
    photoUrl: "",
  });

  // Renew Passport Form
  const [renewForm, setRenewForm] = useState<{
    nationalNumber: string;
    passportType: PassportType;
  }>({
    nationalNumber: "",
    passportType: "Regular",
  });

  // History state
  const [historyNationalNumber, setHistoryNationalNumber] = useState("");
  const [historyRecords, setHistoryRecords] = useState<PassportRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Action status / feedback
  const [actionLoading, setActionLoading] = useState(false);
  const [alertFeedback, setAlertFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const defaultBranchId = user?.branchId || "018f7d9a-2000-7000-8000-000000000005";

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

  const handleOpenHistory = async (nationalNumber: string) => {
    setHistoryNationalNumber(nationalNumber);
    setHistoryModalOpen(true);
    setHistoryLoading(true);
    try {
      const records = await passportsService.getPassportHistory(nationalNumber);
      setHistoryRecords(records);
    } catch (err) {
      console.error(err);
      setHistoryRecords([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueForm.nationalNumber.trim()) return;

    setActionLoading(true);
    setAlertFeedback(null);
    try {
      const newPass = await passportsService.issuePassport({
        nationalNumber: issueForm.nationalNumber.trim(),
        passportType: issueForm.passportType,
        photoUrl: issueForm.photoUrl || null,
        issuingBranchId: defaultBranchId,
      });

      setAlertFeedback({
        type: "success",
        message: `تم إصدار جواز السفر الإلكتروني بنجاح برقم: (${newPass?.passportNumber || "جديد"}) للمواطن: ${newPass?.personFullName || ""}`,
      });
      setIssueModalOpen(false);
      setIssueForm({ nationalNumber: "", passportType: "Regular", photoUrl: "" });
      await loadPassports();
    } catch (err: any) {
      setAlertFeedback({
        type: "error",
        message: typeof err?.message === "string" ? err.message : "فشل إصدار جواز السفر. تأكد من صحة الرقم الوطني وعدم وجود جواز سارٍ",
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewForm.nationalNumber.trim()) return;

    setActionLoading(true);
    setAlertFeedback(null);
    try {
      const renewedPass = await passportsService.renewPassport({
        nationalNumber: renewForm.nationalNumber.trim(),
        issuingBranchId: defaultBranchId,
        passportType: renewForm.passportType,
      });

      setAlertFeedback({
        type: "success",
        message: `تم تجديد جواز السفر بنجاح برقم جديد: (${renewedPass?.passportNumber || ""}) للمواطن: ${renewedPass?.personFullName || ""}`,
      });
      setRenewModalOpen(false);
      setRenewForm({ nationalNumber: "", passportType: "Regular" });
      await loadPassports();
    } catch (err: any) {
      setAlertFeedback({
        type: "error",
        message: typeof err?.message === "string" ? err.message : "فشل تجديد جواز السفر. تأكد من وجود سجل للجواز سابقاً",
      });
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0b4f6c] mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            السجل الحي العام للجوازات الإلكترونية الصادرة
          </div>
          <h1 className="text-2xl font-bold text-[#00374e]">
            سجل الجوازات الإلكترونية المعتمدة
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            الأرشيف الموحد لكافة جوازات السفر الصادرة من جميع فروع الجمهورية والمنافذ الرسمية
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              setIssueForm({ nationalNumber: "", passportType: "Regular", photoUrl: "" });
              setIssueModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-[#00374e] hover:bg-[#0b4f6c] text-white text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
          >
            <PlusCircle className="w-4 h-4 text-emerald-400" />
            <span>إصدار جواز سفر جديد</span>
          </button>

          <button
            onClick={() => {
              setRenewForm({ nationalNumber: "", passportType: "Regular" });
              setRenewModalOpen(true);
            }}
            className="px-4 py-2 rounded-xl bg-white hover:bg-gray-50 text-[#00374e] border border-gray-200 text-xs font-bold transition-all flex items-center gap-2 shadow-sm"
          >
            <RotateCcw className="w-4 h-4 text-[#0b4f6c]" />
            <span>تجديد جواز سفر</span>
          </button>

          <button
            onClick={loadPassports}
            disabled={loading}
            className="p-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors shadow-sm self-start md:self-auto"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#0b4f6c]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Alert Feedback Toast */}
      {alertFeedback && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-semibold ${
            alertFeedback.type === "success"
              ? "bg-emerald-50 text-emerald-900 border border-emerald-200"
              : "bg-rose-50 text-rose-900 border border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {alertFeedback.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{typeof alertFeedback.message === "string" ? alertFeedback.message : "تمت العملية بنجاح"}</span>
          </div>
          <button onClick={() => setAlertFeedback(null)} className="p-1 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

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
            <span>جاري تحميل سجلات الجوازات الحية...</span>
          </div>
        ) : passports.length === 0 ? (
          <div className="col-span-full py-16 text-center text-xs text-gray-400">
            لا توجد جوازات مطابقة لمعايير البحث في قاعدة البيانات.
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
                      {pass.photoUrl ? (
                        <img
                          src={pass.photoUrl}
                          alt={pass.fullName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400 text-[10px]">
                          لا صورة
                        </div>
                      )}
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
                <button
                  onClick={() => handleOpenHistory(pass.nationalNumber)}
                  className="text-[11px] text-[#0b4f6c] hover:underline flex items-center gap-1 font-semibold"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>سجل الجوازات</span>
                </button>

                <button
                  onClick={() => handleInspect(pass)}
                  className="px-3 py-1.5 rounded-lg bg-[#00374e] hover:bg-[#0b4f6c] text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>معاينة الجواز</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal: Issue New Passport */}
      {issueModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl border border-gray-100 animate-fade-in">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#00374e]/10 text-[#00374e]">
                  <BookOpenCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">إصدار جواز سفر إلكتروني جديد</h3>
                  <p className="text-xs text-gray-500">إصدار جواز سفر معتمد لمواطن مقيد في الأحوال المدنية</p>
                </div>
              </div>
              <button onClick={() => setIssueModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleIssueSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  الرقم الوطني للمواطن (11 خانة) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: 01011135650"
                  value={issueForm.nationalNumber}
                  onChange={(e) => setIssueForm({ ...issueForm, nationalNumber: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:border-[#00374e] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  نوع الجواز المطلوب *
                </label>
                <select
                  value={issueForm.passportType}
                  onChange={(e) => setIssueForm({ ...issueForm, passportType: e.target.value as PassportType })}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:border-[#00374e]"
                >
                  <option value="Regular">جواز سفر عادي (Regular)</option>
                  <option value="Diplomatic">جواز سفر دبلوماسي (Diplomatic)</option>
                  <option value="Special">جواز سفر خاص / مهمة (Special)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  رابط الصورة الشخصية (اختياري)
                </label>
                <input
                  type="text"
                  placeholder="https://..."
                  value={issueForm.photoUrl}
                  onChange={(e) => setIssueForm({ ...issueForm, photoUrl: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:border-[#00374e]"
                />
              </div>

              <div className="p-3 rounded-xl bg-blue-50 border border-blue-100 text-blue-900 text-xs">
                <p className="font-semibold mb-1">ملاحظة نظامية:</p>
                <p className="text-[11px] text-blue-700">
                  سيتم التحقق آلياً من مطابقة السجل في السجل المدني وسلامة القيد الأمني قبل توليد رقم الجواز والشريحة الذكية المشفرة لمدة صلاحية 6 سنوات.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setIssueModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#00374e] hover:bg-[#0b4f6c] rounded-xl transition-colors shadow-sm flex items-center gap-2"
                >
                  {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <BookOpenCheck className="w-4 h-4" />}
                  <span>تأكيد الإصدار الآلي</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Renew Passport */}
      {renewModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full space-y-5 shadow-2xl border border-gray-100 animate-fade-in">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">تجديد جواز سفر منتهي أو شارِف</h3>
                  <p className="text-xs text-gray-500">إلغاء الجواز القديم وإصدار جواز سفر إلكتروني محدث لـ 6 سنوات</p>
                </div>
              </div>
              <button onClick={() => setRenewModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleRenewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  الرقم الوطني للمواطن *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: 01001000001"
                  value={renewForm.nationalNumber}
                  onChange={(e) => setRenewForm({ ...renewForm, nationalNumber: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:border-[#00374e] font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  نوع الجواز
                </label>
                <select
                  value={renewForm.passportType}
                  onChange={(e) => setRenewForm({ ...renewForm, passportType: e.target.value as PassportType })}
                  className="w-full px-3 py-2 text-xs border border-gray-300 rounded-xl focus:outline-none focus:border-[#00374e]"
                >
                  <option value="Regular">جواز سفر عادي (Regular)</option>
                  <option value="Diplomatic">جواز سفر دبلوماسي (Diplomatic)</option>
                  <option value="Special">جواز سفر خاص / مهمة (Special)</option>
                </select>
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
                <p className="font-semibold mb-1">تنبيه أمني وإجرائي:</p>
                <p className="text-[11px] text-amber-800">
                  سيتم تلقائياً تحويل حالة الجواز النشط القديم إلى منتهي/ملغي، وتوليد رقم وثيقة جديد وربط حركات المنافذ به.
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t">
                <button
                  type="button"
                  onClick={() => setRenewModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="px-5 py-2 text-xs font-bold text-white bg-[#00374e] hover:bg-[#0b4f6c] rounded-xl transition-colors shadow-sm flex items-center gap-2"
                >
                  {actionLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                  <span>تأكيد التجديد والإصدار</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Citizen Passport Lifetime History */}
      {historyModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-2xl w-full space-y-4 shadow-2xl border border-gray-100 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-50 text-purple-700">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base">سجل جوازات المواطن التاريخي</h3>
                  <p className="text-xs text-gray-500 font-mono">الرقم الوطني: {historyNationalNumber}</p>
                </div>
              </div>
              <button onClick={() => setHistoryModalOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {historyLoading ? (
              <div className="py-12 text-center text-xs text-gray-400 flex flex-col items-center gap-2">
                <RefreshCw className="w-6 h-6 animate-spin text-[#0b4f6c]" />
                <span>جاري استعلام السجل التاريخي للجوازات...</span>
              </div>
            ) : historyRecords.length === 0 ? (
              <div className="py-10 text-center text-xs text-gray-500">
                لا توجد سجلات سابقة مسجلة لهذا الرقم الوطني.
              </div>
            ) : (
              <div className="space-y-3">
                {historyRecords.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-sm text-[#00374e]">{rec.passportNumber}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            rec.status === "Active"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : rec.status === "Expired"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-rose-50 text-rose-700 border border-rose-200"
                          }`}
                        >
                          {rec.status === "Active" ? "ساري المفعول" : rec.status === "Expired" ? "منتهي الصلاحية" : "ملغي"}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 space-y-0.5">
                        <p>{rec.fullName}</p>
                        <p className="text-[11px] text-gray-500">
                          {rec.passportTypeLabel} • {rec.issuingBranchName}
                        </p>
                      </div>
                    </div>

                    <div className="text-left text-xs font-mono text-gray-500">
                      <div>إصدار: {rec.issueDate}</div>
                      <div>انتهاء: {rec.expiryDate}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-3 border-t">
              <button
                onClick={() => setHistoryModalOpen(false)}
                className="px-5 py-2 text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

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
                  {selectedPassport.photoUrl ? (
                    <img
                      src={selectedPassport.photoUrl}
                      alt={selectedPassport.fullName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400 text-xs">
                      صورة رسمية
                    </div>
                  )}
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
                الجهة المصدرة: {selectedPassport.issuingBranchName}
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

