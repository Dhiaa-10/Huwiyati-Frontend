"use client";

import React, { useState, useEffect } from "react";
import {
  FileCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  FileText,
  CreditCard,
  Building2,
  RefreshCw,
  X,
  Printer,
  ChevronRight,
} from "lucide-react";
import { civilRegistryService } from "@/lib/api/civilRegistryService";
import { CivilServiceRequest } from "@/types/civilRegistry";

export default function CivilRequestsPage() {
  const [requests, setRequests] = useState<CivilServiceRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");

  // Review Modal state
  const [selectedRequest, setSelectedRequest] = useState<CivilServiceRequest | null>(null);
  const [officerNotes, setOfficerNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  // Notification
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const showNotification = (
    type: "success" | "error" | "info",
    message: string
  ) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await civilRegistryService.getServiceRequests({
        search: searchTerm,
        status: statusFilter,
        serviceCode: serviceFilter,
        page: 1,
        pageSize: 50,
      });
      setRequests(res.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, [searchTerm, statusFilter, serviceFilter]);

  const handleOpenReview = (req: CivilServiceRequest) => {
    setSelectedRequest(req);
    setOfficerNotes(req.officerNotes || "");
    setRejectionReason(req.rejectionReason || "");
    setIsRejecting(false);
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    try {
      const updated = await civilRegistryService.updateRequestStatus({
        requestId: selectedRequest.id,
        status: "Approved",
        officerNotes: officerNotes || "تمت المراجعة والاعتماد واستيفاء كافة الشروط الرسمية.",
      });

      setRequests((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r))
      );
      setSelectedRequest(null);
      showNotification("success", `تم اعتماد الطلب رقم ${updated.requestNumber} بنجاح.`);
    } catch (err) {
      showNotification("error", "فشلت عملية الاعتماد.");
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    if (!rejectionReason.trim()) {
      alert("يرجى كتابة سبب الرفض لتوضيحه للمواطن.");
      return;
    }

    try {
      const updated = await civilRegistryService.updateRequestStatus({
        requestId: selectedRequest.id,
        status: "Rejected",
        rejectionReason,
        officerNotes,
      });

      setRequests((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r))
      );
      setSelectedRequest(null);
      showNotification("info", `تم رفض الطلب رقم ${updated.requestNumber}.`);
    } catch (err) {
      showNotification("error", "فشلت عملية الرفض.");
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-5 left-1/2 -translate-x-1/2 z-[999] px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-white text-sm font-semibold transition-all ${
            notification.type === "success"
              ? "bg-[#005539] border border-emerald-400"
              : notification.type === "error"
              ? "bg-rose-700 border border-rose-400"
              : "bg-[#0b4f6c] border border-sky-400"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-300" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00374e]"></span>
          <span className="text-xs font-bold text-[#00374e] uppercase tracking-wider">
            السجل المدني المركزي
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#00374e]">
          مراجعة الطلبات والوثائق (Service Requests Review)
        </h1>
        <p className="text-sm text-[#41484d] mt-1">
          فحص ومراجعة طلبات إصدار وتجديد البطاقات الشخصية والوثائق العائلية واعتمادها للطباعة.
        </p>
      </div>

      {/* Filters (Stitch Screen 18) */}
      <div className="bg-white rounded-2xl border border-[#e0e3e5] p-5 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#41484d]">بحث سريع</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute right-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث برقم الطلب، اسم المواطن، أو الرقم الوطني..."
                className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg pr-10 pl-4 py-2 text-sm text-[#191c1e] focus:outline-none focus:border-[#0b4f6c]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#41484d]">حالة الطلب</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg px-4 py-2 text-sm text-[#191c1e] focus:outline-none focus:border-[#0b4f6c]"
            >
              <option value="all">جميع الحالات</option>
              <option value="Pending">قيد الانتظار (Pending)</option>
              <option value="UnderReview">قيد المراجعة الفنية (Under Review)</option>
              <option value="Approved">تم الاعتماد (Approved)</option>
              <option value="Rejected">مرفوض (Rejected)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#41484d]">نوع الخدمة</label>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg px-4 py-2 text-sm text-[#191c1e] focus:outline-none focus:border-[#0b4f6c]"
            >
              <option value="all">جميع الخدمات</option>
              <option value="NAT_ID_NEW">إصدار بطاقة شخصية جديدة</option>
              <option value="NAT_ID_RENEW">تجديد بطاقة شخصية</option>
              <option value="FAMILY_CARD_NEW">إصدار بطاقة عائلية</option>
              <option value="BIRTH_CERT">شهادة ميلاد مميكنة</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests Table */}
      <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center items-center gap-3">
            <RefreshCw className="w-8 h-8 text-[#0b4f6c] animate-spin" />
            <span className="text-sm font-medium text-slate-500">جاري تحميل الطلبات...</span>
          </div>
        ) : requests.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">لا توجد طلبات تطابق معايير البحث</h4>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead className="bg-[#f0eadd]/60 border-b border-[#c0c7ce]/50 font-bold text-[#00374e]">
                <tr>
                  <th className="py-4 px-6">رقم الطلب</th>
                  <th className="py-4 px-6">مقدم الطلب</th>
                  <th className="py-4 px-6">الخدمة المطلوبة</th>
                  <th className="py-4 px-6">تاريخ التقديم</th>
                  <th className="py-4 px-6">الرسوم</th>
                  <th className="py-4 px-6">الحالة</th>
                  <th className="py-4 px-6 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e0e3e5]/70">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-[#f7f9fb] transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-[#0b4f6c]">
                      {req.requestNumber}
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={req.personPhoto}
                          alt={req.personFullName}
                          className="w-8 h-8 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <div className="font-bold text-slate-800">{req.personFullName}</div>
                          <div className="font-mono text-[11px] text-slate-500">
                            {req.personNationalNumber}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-800">{req.serviceName}</div>
                      <div className="text-[11px] text-slate-500">{req.branchName}</div>
                    </td>

                    <td className="py-4 px-6 font-mono text-slate-500">
                      {new Date(req.submissionDate).toLocaleDateString("ar-YE")}
                    </td>

                    <td className="py-4 px-6">
                      <span className="font-mono font-bold text-slate-700">
                        {req.fee.toLocaleString("ar-YE")} ريال
                      </span>
                      <span className="text-[10px] text-emerald-600 block">مسدد</span>
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          req.status === "Approved"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : req.status === "UnderReview"
                            ? "bg-sky-50 text-[#0b4f6c] border border-sky-200"
                            : req.status === "Rejected"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {req.status === "Approved"
                          ? "معتمد"
                          : req.status === "UnderReview"
                          ? "قيد المراجعة"
                          : req.status === "Rejected"
                          ? "مرفوض"
                          : "جديد"}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleOpenReview(req)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#f2f4f6] hover:bg-[#0b4f6c] hover:text-white text-[#00374e] font-bold transition-all"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>فحص ومراجعة</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal (Stitch Screen 18 Modal) */}
      {selectedRequest && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#c5e7ff] text-[#00374e] flex items-center justify-center">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#00374e]">
                    مراجعة الطلب: {selectedRequest.requestNumber}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {selectedRequest.serviceName} - {selectedRequest.branchName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-1.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              {/* Applicant Card */}
              <div className="p-4 bg-[#f7f9fb] border border-slate-200 rounded-xl flex items-center gap-4">
                <img
                  src={selectedRequest.personPhoto}
                  alt={selectedRequest.personFullName}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-300"
                />
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    {selectedRequest.personFullName}
                  </h4>
                  <div className="font-mono text-slate-500 mt-0.5">
                    الرقم الوطني: {selectedRequest.personNationalNumber}
                  </div>
                  <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                    الرسوم: {selectedRequest.fee.toLocaleString("ar-YE")} ريال (مدفوعة إلكترونياً)
                  </div>
                </div>
              </div>

              {/* Attachments Section */}
              <div>
                <h4 className="font-bold text-slate-700 mb-2">المرفقات والوثائق المقدمة:</h4>
                <div className="space-y-2">
                  {selectedRequest.attachments.map((att, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#0b4f6c]" />
                        <span className="font-semibold text-slate-700">{att.name}</span>
                      </div>
                      <span className="text-[11px] text-[#0b4f6c] hover:underline cursor-pointer">
                        معاينة الوثيقة
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Officer Notes Input */}
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  ملاحظات الضابط المختص:
                </label>
                <textarea
                  rows={2}
                  value={officerNotes}
                  onChange={(e) => setOfficerNotes(e.target.value)}
                  placeholder="اكتب أي توجيهات أو ملاحظات إدارية..."
                  className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#0b4f6c]"
                />
              </div>

              {/* Rejection Field if rejecting */}
              {isRejecting && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                  <label className="block font-bold text-rose-800">
                    سبب الرفض (سيظهر في تطبيق المواطن):
                  </label>
                  <textarea
                    rows={2}
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="وضح سبب رفض الطلب بالتفصيل..."
                    className="w-full bg-white border border-rose-300 rounded-lg p-2 text-xs text-rose-900 focus:outline-none focus:border-rose-500"
                  />
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="p-6 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setSelectedRequest(null)}
                className="px-4 py-2 border border-slate-300 text-slate-600 rounded-xl font-bold"
              >
                إغلاق
              </button>

              <div className="flex items-center gap-2">
                {!isRejecting ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsRejecting(true)}
                      className="px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl font-bold"
                    >
                      رفض الطلب
                    </button>
                    <button
                      type="button"
                      onClick={handleApprove}
                      className="px-6 py-2 bg-[#005539] hover:bg-[#003c27] text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>اعتماد وطباعة الوثيقة</span>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsRejecting(false)}
                      className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl"
                    >
                      تراجع
                    </button>
                    <button
                      type="button"
                      onClick={handleReject}
                      className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-sm"
                    >
                      تأكيد الرفض وإشعار المواطن
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
