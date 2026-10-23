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
  Building2,
  RefreshCw,
  X,
  Printer,
  ChevronRight,
  Ban,
  PlusCircle,
  AlertCircle,
  CreditCard,
} from "lucide-react";
import { civilRegistryService } from "@/lib/api/civilRegistryService";
import { filesService } from "@/lib/api/filesService";
import { CivilServiceRequest } from "@/types/civilRegistry";
import { CreateRequestModal } from "@/components/shared/CreateRequestModal";
import { useNotification } from "@/context/NotificationContext";

export default function CivilRequestsPage() {
  const { toast } = useNotification();
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
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Notification
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const showNotification = (
    type: "success" | "error" | "info",
    message: string
  ) => {
    if (type === "success") {
      toast.success(message);
      setModalError(null);
    } else if (type === "error") {
      toast.error(message);
      setModalError(message);
    } else {
      toast.info(message);
    }
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
    setIsCancelling(false);
    setCancellationReason("");
    setModalError(null);
  };

  const handleStartReview = async () => {
    if (!selectedRequest || actionLoading) return;
    setActionLoading(true);
    setModalError(null);
    try {
      const updated = await civilRegistryService.updateRequestStatus({
        requestId: selectedRequest.id,
        status: "UnderReview",
        officerNotes: officerNotes || "تم استلام المعاملة والبدء في فحص وتدقيق البيانات ومطابقة البصمة.",
      });

      setRequests((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r))
      );
      setSelectedRequest(updated);
      showNotification("info", `تم بدء فحص الطلب رقم ${updated.requestNumber}.`);
    } catch (err: any) {
      showNotification("error", err?.message || "فشل تحديث حالة الطلب إلى قيد المراجعة.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest || actionLoading) return;
    setActionLoading(true);
    setModalError(null);
    try {
      const updated = await civilRegistryService.updateRequestStatus({
        requestId: selectedRequest.id,
        status: "Approved",
        officerNotes: officerNotes || "تمت المراجعة والاعتماد واستيفاء كافة الشروط الرسمية.",
      });

      setRequests((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r))
      );
      setSelectedRequest(updated);
      showNotification("success", `تم اعتماد الطلب رقم ${updated.requestNumber} بنجاح.`);
    } catch (err: any) {
      showNotification("error", err?.message || "فشلت عملية الاعتماد.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleIssue = async () => {
    if (!selectedRequest || actionLoading) return;
    setActionLoading(true);
    setModalError(null);
    try {
      const updated = await civilRegistryService.updateRequestStatus({
        requestId: selectedRequest.id,
        status: "Issued",
        officerNotes: officerNotes || "تم إصدار وطباعة الوثيقة الرسمية والكرت الذكي بنجاح.",
      });

      setRequests((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r))
      );
      setSelectedRequest(updated);
      showNotification("success", `تم إصدار وطباعة وثيقة الطلب رقم ${updated.requestNumber} بنجاح.`);
    } catch (err: any) {
      showNotification("error", err?.message || "فشلت عملية الإصدار والطباعة.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || actionLoading) return;
    if (!rejectionReason.trim()) {
      showNotification("error", "يرجى كتابة سبب الرفض لتوضيحه للمواطن.");
      return;
    }

    setActionLoading(true);
    setModalError(null);
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
      setSelectedRequest(updated);
      setIsRejecting(false);
      showNotification("info", `تم رفض الطلب رقم ${updated.requestNumber}.`);
    } catch (err: any) {
      showNotification("error", err?.message || "فشلت عملية الرفض.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!selectedRequest) return;
    setActionLoading(true);
    try {
      const updated = await civilRegistryService.cancelRequest(
        selectedRequest.id,
        cancellationReason.trim() || undefined
      );

      setRequests((prev) =>
        prev.map((r) => (r.id === updated.id ? updated : r))
      );
      setSelectedRequest(updated);
      setIsCancelling(false);
      setCancellationReason("");
      showNotification("info", `تم إلغاء الطلب رقم ${updated.requestNumber} بنجاح.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشلت عملية إلغاء الطلب.";
      showNotification("error", msg);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">


      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#052F31]"></span>
            <span className="text-xs font-bold text-[#052F31] uppercase tracking-wider">
              السجل المدني المركزي
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#052F31]">
            مراجعة الطلبات والوثائق (Service Requests Review)
          </h1>
          <p className="text-sm text-[#41484d] mt-1">
            فحص ومراجعة طلبات إصدار وتجديد البطاقات الشخصية والوثائق العائلية واعتمادها للطباعة.
          </p>
        </div>

        <button
          onClick={() => setCreateModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#052F31] hover:bg-[#0C4A4E] text-white font-bold text-xs shadow-md transition-all active:scale-98 shrink-0 self-start sm:self-center"
        >
          <PlusCircle className="w-4 h-4" />
          <span>طلب جديد بالنيابة</span>
        </button>
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
                className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg pr-10 pl-4 py-2 text-sm text-[#191c1e] focus:outline-none focus:border-[#0C4A4E]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#41484d]">حالة الطلب</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg px-4 py-2 text-sm text-[#191c1e] focus:outline-none focus:border-[#0C4A4E]"
            >
              <option value="all">جميع الحالات</option>
              <option value="Pending">قيد الانتظار (Pending)</option>
              <option value="UnderReview">قيد المراجعة الفنية (Under Review)</option>
              <option value="Approved">تم الاعتماد (Approved)</option>
              <option value="Issued">تم الإصدار والطباعة (Issued)</option>
              <option value="Rejected">مرفوض (Rejected)</option>
              <option value="Cancelled">ملغي (Cancelled)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#41484d]">نوع الخدمة</label>
            <select
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg px-4 py-2 text-sm text-[#191c1e] focus:outline-none focus:border-[#0C4A4E]"
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
            <RefreshCw className="w-8 h-8 text-[#0C4A4E] animate-spin" />
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
              <thead className="bg-[#f0eadd]/60 border-b border-[#c0c7ce]/50 font-bold text-[#052F31]">
                <tr>
                  <th className="py-4 px-6">رقم الطلب</th>
                  <th className="py-4 px-6">مقدم الطلب</th>
                  <th className="py-4 px-6">الخدمة المطلوبة</th>
                  <th className="py-4 px-6">تاريخ التقديم</th>
                  <th className="py-4 px-6">الحالة</th>
                  <th className="py-4 px-6 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e0e3e5]/70">
                {requests.map((req) => (
                  <tr key={req.id} className="hover:bg-[#f7f9fb] transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-[#0C4A4E]">
                      {req.requestNumber}
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-slate-200 border border-slate-300 shrink-0 relative flex items-center justify-center">
                          {req.personPhoto ? (
                            <img
                              src={filesService.getFullUrl(req.personPhoto)}
                              alt={req.personFullName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                                const fb = e.currentTarget.parentElement?.querySelector(".fallback-table-avatar");
                                if (fb) fb.classList.remove("hidden");
                              }}
                            />
                          ) : null}
                          <div className={`fallback-table-avatar w-full h-full flex items-center justify-center bg-slate-200 text-slate-600 text-xs font-bold ${req.personPhoto ? "hidden" : ""}`}>
                            {req.personFullName?.trim().charAt(0) || "م"}
                          </div>
                        </div>
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
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          req.status === "Issued"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                            : req.status === "Approved"
                            ? "bg-blue-50 text-blue-700 border border-blue-200"
                            : req.status === "UnderReview"
                            ? "bg-sky-50 text-[#0C4A4E] border border-sky-200"
                            : req.status === "Rejected"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : req.status === "Cancelled"
                            ? "bg-gray-100 text-gray-700 border border-gray-300"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {req.status === "Issued"
                          ? "تم الإصدار والطباعة"
                          : req.status === "Approved"
                          ? "معتمد"
                          : req.status === "UnderReview"
                          ? "قيد المراجعة"
                          : req.status === "Rejected"
                          ? "مرفوض"
                          : req.status === "Cancelled"
                          ? "ملغي"
                          : "قيد الانتظار"}
                      </span>
                    </td>

                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleOpenReview(req)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#f2f4f6] hover:bg-[#0C4A4E] hover:text-white text-[#052F31] font-bold transition-all"
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
                <div className="w-10 h-10 rounded-xl bg-[#E6F1EE] text-[#052F31] flex items-center justify-center">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#052F31]">
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
                <div className="w-14 h-14 rounded-xl overflow-hidden border border-slate-300 bg-slate-200 shrink-0 relative flex items-center justify-center">
                  {selectedRequest.personPhoto ? (
                    <img
                      src={filesService.getFullUrl(selectedRequest.personPhoto)}
                      alt={selectedRequest.personFullName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                        const fb = e.currentTarget.parentElement?.querySelector(".fallback-modal-avatar");
                        if (fb) fb.classList.remove("hidden");
                      }}
                    />
                  ) : null}
                  <div className={`fallback-modal-avatar w-full h-full flex items-center justify-center bg-slate-200 text-slate-600 font-bold text-lg ${selectedRequest.personPhoto ? "hidden" : ""}`}>
                    {selectedRequest.personFullName?.trim().charAt(0) || "م"}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">
                    {selectedRequest.personFullName}
                  </h4>
                  <div className="font-mono text-slate-500 mt-0.5">
                    الرقم الوطني: {selectedRequest.personNationalNumber}
                  </div>
                </div>
              </div>

              {/* Status Specific Guidance Notice */}
              {selectedRequest.status === "Approved" && (
                <div className="p-4 bg-teal-50 border border-teal-200 rounded-xl space-y-1.5 animate-in fade-in">
                  <div className="flex items-center gap-2 text-[#052F31] font-bold">
                    <CheckCircle2 className="w-4 h-4 text-[#0C4A4E] shrink-0" />
                    <span>الطلب معتمد إدارياً وجاهز للتنفيذ والإصدار</span>
                  </div>
                  <p className="text-xs text-slate-700 leading-relaxed">
                    تم استيفاء الشروط واعتماد الطلب. لتطبيق التعديلات فعلياً في قاعدة البيانات وتحديث بيانات المواطن وإصدار البطاقة الجديدة، يرجى النقر على زر <strong>"إصدار وطباعة الوثيقة الرسمية"</strong> أدناه.
                  </p>
                </div>
              )}

              {selectedRequest.status === "Issued" && (
                <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl space-y-2 animate-in fade-in">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>تم تطبيق التعديلات وإصدار الوثيقة رسمياً</span>
                  </div>
                  <p className="text-xs text-emerald-800 leading-relaxed">
                    تم ترحيل البيانات وتحديث سجل المواطن وتوليد البطاقة الجديدة بنجاح في قاعدة البيانات. يمكنك مراجعة البطاقة في شاشة إدارة البطاقات الشخصية.
                  </p>
                  <div className="pt-1">
                    <a
                      href="/civil-registry/id-cards"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors shadow-xs"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>الانتقال لإدارة البطاقات الشخصية</span>
                    </a>
                  </div>
                </div>
              )}

              {/* Request Submitted Data Details */}
              {selectedRequest.requestData && Object.keys(selectedRequest.requestData).length > 0 && (
                <div className="p-4 bg-[#f8fafc] border border-slate-200 rounded-xl space-y-2">
                  <h4 className="font-bold text-slate-700 text-xs flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-[#0C4A4E]" />
                    <span>البيانات المقدمة في الطلب:</span>
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-[11px]">
                    {selectedRequest.requestData.governorate && (
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">المحافظة:</span>
                        <span className="font-semibold text-slate-700">{selectedRequest.requestData.governorate}</span>
                      </div>
                    )}
                    {selectedRequest.requestData.district && (
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">المديرية:</span>
                        <span className="font-semibold text-slate-700">{selectedRequest.requestData.district}</span>
                      </div>
                    )}
                    {selectedRequest.requestData.addressDetails && (
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">تفاصيل العنوان:</span>
                        <span className="font-semibold text-slate-700">{selectedRequest.requestData.addressDetails}</span>
                      </div>
                    )}
                    {selectedRequest.requestData.maritalStatus !== undefined && (
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">الحالة الاجتماعية:</span>
                        <span className="font-semibold text-slate-700">
                          {Number(selectedRequest.requestData.maritalStatus) === 1
                            ? "أعزب"
                            : Number(selectedRequest.requestData.maritalStatus) === 2
                            ? "متزوج"
                            : Number(selectedRequest.requestData.maritalStatus) === 3
                            ? "مطلق"
                            : Number(selectedRequest.requestData.maritalStatus) === 4
                            ? "أرمل"
                            : "غير محدد"}
                        </span>
                      </div>
                    )}
                    {selectedRequest.requestData.familyNumber && (
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">رقم البطاقة العائلية:</span>
                        <span className="font-semibold text-slate-700 font-mono">{selectedRequest.requestData.familyNumber}</span>
                      </div>
                    )}
                    {selectedRequest.requestData.firstName && (
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">اسم المولود:</span>
                        <span className="font-semibold text-slate-700">{selectedRequest.requestData.firstName}</span>
                      </div>
                    )}
                    {selectedRequest.requestData.dateOfBirth && (
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">تاريخ الميلاد:</span>
                        <span className="font-semibold text-slate-700 font-mono">{selectedRequest.requestData.dateOfBirth}</span>
                      </div>
                    )}
                    {selectedRequest.requestData.deathDate && (
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">تاريخ الوفاة:</span>
                        <span className="font-semibold text-slate-700 font-mono">{selectedRequest.requestData.deathDate}</span>
                      </div>
                    )}
                    {selectedRequest.requestData.causeOfDeath && (
                      <div className="bg-white p-2 rounded-lg border border-slate-200">
                        <span className="text-slate-400 block text-[10px]">سبب الوفاة:</span>
                        <span className="font-semibold text-slate-700">{selectedRequest.requestData.causeOfDeath}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

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
                        <FileText className="w-4 h-4 text-[#0C4A4E]" />
                        <span className="font-semibold text-slate-700">{att.name}</span>
                      </div>
                      <span className="text-[11px] text-[#0C4A4E] hover:underline cursor-pointer">
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
                  className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#0C4A4E]"
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

              {/* Cancellation Field if cancelling */}
              {isCancelling && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl space-y-2">
                  <label className="block font-bold text-amber-900">
                    سبب إلغاء الطلب (اختياري):
                  </label>
                  <textarea
                    rows={2}
                    value={cancellationReason}
                    onChange={(e) => setCancellationReason(e.target.value)}
                    placeholder="اكتب سبب إلغاء الطلب إن وجد..."
                    className="w-full bg-white border border-amber-300 rounded-lg p-2 text-xs text-amber-950 focus:outline-none focus:border-amber-500"
                  />
                </div>
              )}

              {/* Status info if cancelled */}
              {selectedRequest.status === "Cancelled" && (
                <div className="p-3 bg-gray-100 border border-gray-300 rounded-xl space-y-1">
                  <div className="flex items-center gap-2 text-gray-800 font-bold">
                    <Ban className="w-4 h-4 text-gray-600" />
                    <span>تم إلغاء هذا الطلب بواسطة الموظف المختص</span>
                  </div>
                  {selectedRequest.rejectionReason && (
                    <p className="text-[11px] text-gray-600">
                      سبب الإلغاء: {selectedRequest.rejectionReason}
                    </p>
                  )}
                </div>
              )}

              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-800 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-medium">{modalError}</span>
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
                {!isRejecting && !isCancelling ? (
                  <>
                    {(selectedRequest.status === "Pending" ||
                      selectedRequest.status === "UnderReview") && (
                      <button
                        type="button"
                        onClick={() => setIsCancelling(true)}
                        className="px-4 py-2 border border-rose-300 text-rose-700 hover:bg-rose-50 rounded-xl font-bold flex items-center gap-1.5 transition-all text-xs"
                      >
                        <Ban className="w-3.5 h-3.5 text-rose-600" />
                        <span>إلغاء المعاملة</span>
                      </button>
                    )}

                    {selectedRequest.status !== "Issued" &&
                      selectedRequest.status !== "Rejected" &&
                      selectedRequest.status !== "Cancelled" && (
                        <button
                          type="button"
                          onClick={() => setIsRejecting(true)}
                          className="px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl font-bold"
                        >
                          رفض الطلب
                        </button>
                      )}

                    {selectedRequest.status === "Pending" && (
                      <button
                        type="button"
                        onClick={handleStartReview}
                        disabled={actionLoading}
                        className="px-5 py-2 bg-[#0C4A4E] hover:bg-[#052F31] text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                      >
                        {actionLoading ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Clock className="w-4 h-4" />
                        )}
                        <span>بدء التدقيق والفحص</span>
                      </button>
                    )}

                    {selectedRequest.status === "UnderReview" && (
                      <button
                        type="button"
                        onClick={handleApprove}
                        disabled={actionLoading}
                        className="px-6 py-2 bg-[#0C4A4E] hover:bg-[#052F31] text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                      >
                        {actionLoading ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4" />
                        )}
                        <span>اعتماد الطلب</span>
                      </button>
                    )}

                    {selectedRequest.status === "Approved" && (
                      <button
                        type="button"
                        onClick={handleIssue}
                        disabled={actionLoading}
                        className="px-6 py-2 bg-[#005539] hover:bg-[#003c27] text-white rounded-xl font-bold flex items-center gap-1.5 shadow-sm disabled:opacity-50"
                      >
                        {actionLoading ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <Printer className="w-4 h-4" />
                        )}
                        <span>إصدار وطباعة الوثيقة الرسمية</span>
                      </button>
                    )}

                    {selectedRequest.status === "Issued" && (
                      <div className="px-5 py-2 bg-emerald-100 text-emerald-800 rounded-xl font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>تمت الطباعة والإصدار بنجاح</span>
                      </div>
                    )}

                    {selectedRequest.status === "Cancelled" && (
                      <div className="px-5 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold flex items-center gap-1.5 border border-gray-300">
                        <Ban className="w-4 h-4 text-gray-500" />
                        <span>طلب ملغي</span>
                      </div>
                    )}
                  </>
                ) : isCancelling ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsCancelling(false)}
                      className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl"
                    >
                      تراجع
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelRequest}
                      disabled={actionLoading}
                      className="px-6 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-xl font-bold shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {actionLoading ? (
                        <RefreshCw className="w-4 h-4 animate-spin text-rose-400" />
                      ) : (
                        <Ban className="w-4 h-4 text-rose-400" />
                      )}
                      <span>تأكيد إلغاء الطلب</span>
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
                      disabled={actionLoading}
                      className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-sm flex items-center gap-1.5 disabled:opacity-50"
                    >
                      {actionLoading && <RefreshCw className="w-4 h-4 animate-spin" />}
                      <span>تأكيد الرفض وإشعار المواطن</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Request on Behalf Modal (M-2) */}
      <CreateRequestModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        portalType="civil-registry"
        onSuccess={(newReq) => {
          fetchRequests();
          showNotification(
            "success",
            `تم تقديم الطلب رقم (${newReq.requestNumber}) بنجاح وقيده في السجل المدني.`
          );
        }}
      />
    </div>
  );
}
