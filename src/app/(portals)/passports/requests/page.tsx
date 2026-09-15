"use client";

import React, { useState, useEffect } from "react";
import {
  FileCheck2,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Printer,
  ShieldCheck,
  AlertCircle,
  FileText,
  User,
  Calendar,
  CreditCard,
  Building2,
  RefreshCw,
  Eye,
  Check,
  X,
  Sparkles,
} from "lucide-react";
import { passportsService } from "@/lib/api/passportsService";
import { PassportRequest } from "@/types/passports";

export default function PassportRequestsPage() {
  const [requests, setRequests] = useState<PassportRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<PassportRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [urgentOnly, setUrgentOnly] = useState(false);
  const [officerNotes, setOfficerNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Rejection modal state
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  useEffect(() => {
    loadRequests();
  }, [statusFilter, urgentOnly]);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const res = await passportsService.getPassportRequests({
        search,
        status: statusFilter === "all" ? undefined : statusFilter,
        urgentOnly: urgentOnly ? true : undefined,
      });
      setRequests(res.items);
      if (res.items.length > 0) {
        // Keep selected if exists, else select first
        const found = res.items.find((r) => r.id === selectedRequest?.id);
        setSelectedRequest(found || res.items[0]);
        setOfficerNotes(found?.officerNotes || res.items[0].officerNotes || "");
      } else {
        setSelectedRequest(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (req: PassportRequest) => {
    setSelectedRequest(req);
    setOfficerNotes(req.officerNotes || "");
    setFeedback(null);
  };

  const handleUpdateStatus = async (
    newStatus: "UnderReview" | "Approved" | "Rejected" | "Printed",
    reason?: string
  ) => {
    if (!selectedRequest) return;
    setActionLoading(true);
    try {
      const updated = await passportsService.updatePassportRequestStatus({
        requestId: selectedRequest.id,
        status: newStatus,
        officerNotes: officerNotes.trim() || undefined,
        rejectionReason: reason,
      });

      setSelectedRequest(updated);
      setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));

      let msg = "";
      if (newStatus === "Printed") {
        msg = `تم اعتماد وطباعة جواز السفر للمواطن (${updated.fullName}) وإرسال إشعار فوري لاستلام الجواز.`;
      } else if (newStatus === "Approved") {
        msg = `تم اعتماد طلب الجواز رقم (${updated.requestNumber}) وجدولة الطباعة الآلية.`;
      } else if (newStatus === "UnderReview") {
        msg = `تم فتح المعاملة والبدء في فحص وتدقيق الوثائق.`;
      } else {
        msg = `تم تسجيل رفض الطلب وتوثيق السبب في السجل الأمني للمواطن.`;
      }

      setFeedback({ type: newStatus === "Rejected" ? "error" : "success", message: msg });
      setRejectModalOpen(false);
      setRejectionReason("");
    } catch (err) {
      console.error(err);
      setFeedback({ type: "error", message: "حدث خطأ أثناء تحديث حالة الطلب." });
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
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            صلاحيات ضابط الفحص والاعتماد (مستوى 3)
          </div>
          <h1 className="text-2xl font-bold text-[#00374e]">
            فحص ومعالجة طلبات الجوازات الواردة
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            تدقيق طلبات الإصدار والتجديد، مطابقة البصمات مع السجل المدني، وطباعة الجوازات الإلكترونية
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadRequests}
            disabled={loading}
            className="p-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            title="تحديث القائمة"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#0b4f6c]" : ""}`} />
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between animate-fade-in ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold">{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="p-1 hover:bg-black/5 rounded">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Split-View Canvas (Master / Detail) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Right Pane: Requests List (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-200 shadow-sm flex flex-col overflow-hidden">
          {/* Filter Bar */}
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="البحث برقم الطلب، الاسم، أو الرقم الوطني..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadRequests()}
                className="w-full pl-3 pr-9 py-2 bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#0b4f6c]"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1 overflow-x-auto text-[11px]">
                {[
                  { label: "الكل", value: "all" },
                  { label: "معلق", value: "Pending" },
                  { label: "قيد المراجعة", value: "UnderReview" },
                  { label: "تم الاعتماد", value: "Approved" },
                  { label: "تمت الطباعة", value: "Printed" },
                ].map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setStatusFilter(tab.value)}
                    className={`px-2.5 py-1 rounded-lg transition-colors font-medium whitespace-nowrap ${
                      statusFilter === tab.value
                        ? "bg-[#00374e] text-white"
                        : "text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <label className="flex items-center gap-1.5 text-xs text-rose-700 font-semibold cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={urgentOnly}
                  onChange={(e) => setUrgentOnly(e.target.checked)}
                  className="rounded border-rose-300 text-rose-600 focus:ring-rose-500"
                />
                <span>عاجل فقط</span>
              </label>
            </div>
          </div>

          {/* List Items */}
          <div className="divide-y divide-gray-100 max-h-[640px] overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-xs text-gray-400 flex flex-col items-center gap-2">
                <RefreshCw className="w-5 h-5 animate-spin text-[#0b4f6c]" />
                <span>جاري تحميل طلبات الجوازات...</span>
              </div>
            ) : requests.length === 0 ? (
              <div className="p-8 text-center text-xs text-gray-400">
                لا توجد طلبات تطابق معايير البحث المحددة.
              </div>
            ) : (
              requests.map((req) => {
                const isSelected = selectedRequest?.id === req.id;
                return (
                  <div
                    key={req.id}
                    onClick={() => handleSelect(req)}
                    className={`p-4 cursor-pointer transition-all border-r-4 ${
                      isSelected
                        ? "bg-blue-50/50 border-[#0b4f6c]"
                        : "hover:bg-gray-50 border-transparent"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-100 border border-gray-200 overflow-hidden shrink-0">
                          <img
                            src={req.photoUrl}
                            alt={req.fullName}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-gray-900 leading-tight">
                            {req.fullName}
                          </h4>
                          <span className="text-[10px] font-mono text-gray-500">
                            {req.nationalNumber}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {req.urgentPriority && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                            عاجل
                          </span>
                        )}
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            req.status === "Printed"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : req.status === "Approved"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : req.status === "UnderReview"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : req.status === "Rejected"
                              ? "bg-rose-50 text-rose-700 border border-rose-200"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {req.status === "Printed"
                            ? "تمت الطباعة"
                            : req.status === "Approved"
                            ? "معتمد"
                            : req.status === "UnderReview"
                            ? "قيد التدقيق"
                            : req.status === "Rejected"
                            ? "مرفوض"
                            : "جديد"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-gray-500 mt-2">
                      <span className="text-[#0b4f6c] font-medium">{req.serviceName}</span>
                      <span className="tabular-nums font-mono">{req.requestNumber}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Left Pane: Inspector & Action Bar (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6">
          {selectedRequest ? (
            <>
              {/* Inspector Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
                <div className="flex items-center gap-3">
                  <div className="w-14 h-16 rounded-xl overflow-hidden border border-gray-200 bg-gray-100 shrink-0 shadow-sm">
                    <img
                      src={selectedRequest.photoUrl}
                      alt={selectedRequest.fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-[#00374e]">
                        {selectedRequest.fullName}
                      </h3>
                      {selectedRequest.urgentPriority && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800">
                          معاملة مستعجلة
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {selectedRequest.serviceName} • {selectedRequest.branchName}
                    </p>
                    <p className="text-[11px] font-mono text-[#0b4f6c] mt-0.5 font-semibold">
                      {selectedRequest.requestNumber}
                    </p>
                  </div>
                </div>

                {/* Status Badging */}
                <div className="text-left">
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                      selectedRequest.status === "Printed"
                        ? "bg-emerald-100 text-emerald-800"
                        : selectedRequest.status === "Approved"
                        ? "bg-blue-100 text-blue-800"
                        : selectedRequest.status === "UnderReview"
                        ? "bg-amber-100 text-amber-800"
                        : selectedRequest.status === "Rejected"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    الحالة: {selectedRequest.status}
                  </span>
                  <div className="text-[10px] text-gray-400 mt-1">
                    تاريخ التقديم: {selectedRequest.submissionDate}
                  </div>
                </div>
              </div>

              {/* Civil Registry Biometric Verification Match */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-50/70 to-teal-50/70 border border-emerald-200/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-600 text-white shadow-sm">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-950">
                      تطابق سجل الأحوال المدنية والبصمة الرقمية
                    </h4>
                    <p className="text-[11px] text-emerald-700">
                      الهوية الوطنية <strong>{selectedRequest.nationalNumber}</strong> مفعلة وموثقة بيومترياً بنسبة 99.4%
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-800 bg-emerald-100/80 px-2.5 py-1 rounded-lg border border-emerald-300">
                  سجل سليم
                </span>
              </div>

              {/* Details Bento Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                  <span className="text-gray-400 text-[11px]">الرقم الوطني للمواطن</span>
                  <p className="font-bold text-gray-800 font-mono text-sm">
                    {selectedRequest.nationalNumber}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                  <span className="text-gray-400 text-[11px]">رقم الجواز السابق</span>
                  <p className="font-bold text-gray-800 font-mono text-sm">
                    {selectedRequest.previousPassportNumber || "لا يوجد (إصدار أول مرة)"}
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                  <span className="text-gray-400 text-[11px]">رسوم الخدمة المقررة</span>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#00374e] font-mono text-sm">
                      {selectedRequest.fee.toLocaleString()} ريال يمني
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-emerald-100 text-emerald-800">
                      تم السداد إلكترونياً
                    </span>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                  <span className="text-gray-400 text-[11px]">الفرع المخصص للاستلام</span>
                  <p className="font-bold text-gray-800">{selectedRequest.branchName}</p>
                </div>
              </div>

              {/* Attachments Section */}
              <div>
                <h4 className="text-xs font-bold text-[#00374e] mb-2.5 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-[#0b4f6c]" />
                  المرفقات والوثائق الرسمية المرفوعة
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {selectedRequest.attachments.map((att, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-gray-100/70 transition-colors flex items-center justify-between group"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <FileCheck2 className="w-4 h-4 text-[#0b4f6c] shrink-0" />
                        <span className="text-xs text-gray-700 font-medium truncate">
                          {att.name}
                        </span>
                      </div>
                      <span className="text-[10px] text-gray-400 group-hover:text-[#0b4f6c] font-bold">
                        معاينة
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Officer Notes Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700">
                  ملاحظات ضابط الفحص والاعتماد (الرائد خالد يحيى العريقي):
                </label>
                <textarea
                  rows={2}
                  value={officerNotes}
                  onChange={(e) => setOfficerNotes(e.target.value)}
                  placeholder="أدخل أي ملاحظات فنية أو أمنية حول استيفاء الشروط..."
                  className="w-full p-3 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-[#0b4f6c] bg-white resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={() => setRejectModalOpen(true)}
                  disabled={actionLoading || selectedRequest.status === "Rejected"}
                  className="px-4 py-2.5 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-all disabled:opacity-50"
                >
                  رفض الطلب
                </button>

                <div className="flex items-center gap-2.5">
                  {selectedRequest.status === "Pending" && (
                    <button
                      onClick={() => handleUpdateStatus("UnderReview")}
                      disabled={actionLoading}
                      className="px-4 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-xs font-bold text-gray-700 transition-all shadow-sm"
                    >
                      بدء التدقيق
                    </button>
                  )}

                  {selectedRequest.status !== "Printed" && (
                    <button
                      onClick={() => handleUpdateStatus("Approved")}
                      disabled={actionLoading || selectedRequest.status === "Approved"}
                      className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                    >
                      اعتماد الطلب
                    </button>
                  )}

                  <button
                    onClick={() => handleUpdateStatus("Printed")}
                    disabled={actionLoading || selectedRequest.status === "Printed"}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00374e] hover:bg-[#0b4f6c] text-white text-xs font-bold shadow-md transition-all active:scale-98 disabled:opacity-50"
                  >
                    <Printer className="w-4 h-4" />
                    <span>
                      {selectedRequest.status === "Printed" ? "تمت طباعة الجواز" : "اعتماد وطباعة الجواز الآن"}
                    </span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-xs text-gray-400">
              اختر طلباً من القائمة للمعاينة والتدقيق والطباعة.
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl border border-gray-100 animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                رفض طلب إصدار الجواز
              </h3>
              <button
                onClick={() => setRejectModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-600">
              سيتم إشعار المواطن رسمياً بسبب الرفض وتسجيل ذلك في ملف التدقيق الخاص بـ (
              {selectedRequest?.fullName}).
            </p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-700">سبب الرفض:</label>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="مثال: الصورة المرفقة لا تطابق المعايير البايومترية، أو عدم وضوح سند السداد..."
                className="w-full p-3 rounded-xl border border-gray-200 text-xs focus:outline-none focus:border-rose-500 bg-white"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-100"
              >
                إلغاء
              </button>
              <button
                onClick={() =>
                  handleUpdateStatus(
                    "Rejected",
                    rejectionReason || "عدم استيفاء الشروط والوثائق المطلوبة"
                  )
                }
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-all shadow-sm"
              >
                تأكيد الرفض
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
