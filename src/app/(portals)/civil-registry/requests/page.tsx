"use client";

import React, { useState, useEffect } from "react";
import {
  FileCheck,
  Search,
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
  Heart,
  Activity,
  Baby,
  Stethoscope,
  CalendarDays,
  Hospital,
  User2,
} from "lucide-react";
import { civilRegistryService } from "@/lib/api/civilRegistryService";
import { serviceRequestsService } from "@/lib/api/serviceRequestsService";
import { CivilServiceRequest } from "@/types/civilRegistry";
import { ServiceRequestDto } from "@/types/serviceRequests";

// ─── Parsed data shape for hospital vital-event requests ─────────────────────
interface BirthRequestData {
  requestType: "BirthNotification";
  childFullName: string;
  childGender: string;
  dateOfBirth: string;
  birthWeight?: string;
  deliveryType?: string;
  fatherNationalId: string;
  fatherName?: string;
  motherNationalId: string;
  motherName?: string;
  doctorName?: string;
  hospitalName?: string;
  governorate?: string;
  district?: string;
  notes?: string;
  submittedByName?: string;
}

interface DeathRequestData {
  requestType: "DeathNotification";
  deceasedNationalId: string;
  deceasedName?: string;
  deathDateTime: string;
  causeOfDeath: string;
  department?: string;
  certifyingDoctor?: string;
  hospitalName?: string;
  governorate?: string;
  district?: string;
  notes?: string;
  submittedByName?: string;
}

type HospitalRequestData = BirthRequestData | DeathRequestData | null;

function parseRequestData(req: ServiceRequestDto): HospitalRequestData {
  try {
    if (!req.requestDataJson) return null;
    const raw = typeof req.requestDataJson === "string"
      ? JSON.parse(req.requestDataJson)
      : req.requestDataJson;
    if (raw?.requestType === "BirthNotification" || raw?.requestType === "DeathNotification") {
      return raw as HospitalRequestData;
    }
  } catch {}
  return null;
}

function isHospitalVitalRequest(req: ServiceRequestDto): boolean {
  const data = parseRequestData(req);
  return data !== null;
}

type ActiveView = "civil" | "hospital";

export default function CivilRequestsPage() {
  const [activeView, setActiveView] = useState<ActiveView>("civil");

  // ─── Civil Requests state ─────────────────────────────────────────────────
  const [requests, setRequests] = useState<CivilServiceRequest[]>([]);
  const [loadingCivil, setLoadingCivil] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");

  // ─── Hospital Vital-Event Requests state ──────────────────────────────────
  const [hospitalRequests, setHospitalRequests] = useState<ServiceRequestDto[]>([]);
  const [loadingHospital, setLoadingHospital] = useState(true);
  const [hospitalStatusFilter, setHospitalStatusFilter] = useState<string>("all");
  const [hospitalTypeFilter, setHospitalTypeFilter] = useState<string>("all");

  // ─── Review Modal ──────────────────────────────────────────────────────────
  const [selectedRequest, setSelectedRequest] = useState<CivilServiceRequest | null>(null);
  const [officerNotes, setOfficerNotes] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  // ─── Hospital Request Review Modal ────────────────────────────────────────
  const [selectedHospitalRequest, setSelectedHospitalRequest] = useState<ServiceRequestDto | null>(null);
  const [hospitalOfficerNotes, setHospitalOfficerNotes] = useState("");
  const [hospitalRejectionReason, setHospitalRejectionReason] = useState("");
  const [isHospitalRejecting, setIsHospitalRejecting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // ─── Notification ──────────────────────────────────────────────────────────
  const [notification, setNotification] = useState<{ type: "success" | "error" | "info"; message: string } | null>(null);

  const showNotification = (type: "success" | "error" | "info", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // ─── Load Civil Requests ──────────────────────────────────────────────────
  const fetchCivilRequests = async () => {
    setLoadingCivil(true);
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
      setLoadingCivil(false);
    }
  };

  // ─── Load Hospital Vital-Event Requests ───────────────────────────────────
  const fetchHospitalRequests = async () => {
    setLoadingHospital(true);
    try {
      const res = await serviceRequestsService.getBranchServiceRequests({
        status: hospitalStatusFilter === "all" ? undefined : hospitalStatusFilter as any,
        pageSize: 100,
      });
      // Filter: only show hospital vital-event requests
      const vitalReqs = res.items.filter(isHospitalVitalRequest);
      // Further filter by type
      const filtered =
        hospitalTypeFilter === "all"
          ? vitalReqs
          : vitalReqs.filter((r) => {
              const data = parseRequestData(r);
              if (!data) return false;
              if (hospitalTypeFilter === "birth") return data.requestType === "BirthNotification";
              if (hospitalTypeFilter === "death") return data.requestType === "DeathNotification";
              return true;
            });
      setHospitalRequests(filtered);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingHospital(false);
    }
  };

  useEffect(() => { fetchCivilRequests(); }, [searchTerm, statusFilter, serviceFilter]);
  useEffect(() => { fetchHospitalRequests(); }, [hospitalStatusFilter, hospitalTypeFilter]);

  // ─── Civil Request Actions ────────────────────────────────────────────────
  const handleOpenReview = (req: CivilServiceRequest) => {
    setSelectedRequest(req);
    setOfficerNotes(req.officerNotes || "");
    setRejectionReason(req.rejectionReason || "");
    setIsRejecting(false);
  };

  const handleStartReview = async () => {
    if (!selectedRequest) return;
    try {
      const updated = await civilRegistryService.updateRequestStatus({
        requestId: selectedRequest.id,
        status: "UnderReview",
        officerNotes: officerNotes || "تم استلام المعاملة والبدء في فحص وتدقيق البيانات.",
      });
      setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setSelectedRequest(updated);
      showNotification("info", `تم بدء فحص الطلب رقم ${updated.requestNumber}.`);
    } catch {
      showNotification("error", "فشل تحديث حالة الطلب.");
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;
    try {
      const updated = await civilRegistryService.updateRequestStatus({
        requestId: selectedRequest.id,
        status: "Approved",
        officerNotes: officerNotes || "تمت المراجعة والاعتماد واستيفاء كافة الشروط الرسمية.",
      });
      setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setSelectedRequest(updated);
      showNotification("success", `تم اعتماد الطلب رقم ${updated.requestNumber} بنجاح.`);
    } catch {
      showNotification("error", "فشلت عملية الاعتماد.");
    }
  };

  const handleIssue = async () => {
    if (!selectedRequest) return;
    try {
      const updated = await civilRegistryService.updateRequestStatus({
        requestId: selectedRequest.id,
        status: "Issued",
        officerNotes: officerNotes || "تم إصدار وطباعة الوثيقة الرسمية بنجاح.",
      });
      setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setSelectedRequest(updated);
      showNotification("success", `تم إصدار وثيقة الطلب رقم ${updated.requestNumber} بنجاح.`);
    } catch {
      showNotification("error", "فشلت عملية الإصدار.");
    }
  };

  const handleReject = async () => {
    if (!selectedRequest) return;
    if (!rejectionReason.trim()) {
      alert("يرجى كتابة سبب الرفض.");
      return;
    }
    try {
      const updated = await civilRegistryService.updateRequestStatus({
        requestId: selectedRequest.id,
        status: "Rejected",
        rejectionReason,
        officerNotes,
      });
      setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setSelectedRequest(updated);
      setIsRejecting(false);
      showNotification("info", `تم رفض الطلب رقم ${updated.requestNumber}.`);
    } catch {
      showNotification("error", "فشلت عملية الرفض.");
    }
  };

  // ─── Hospital Request: Approve (executes actual registration) ─────────────
  const handleApproveHospitalRequest = async () => {
    if (!selectedHospitalRequest) return;
    const data = parseRequestData(selectedHospitalRequest);
    if (!data) return;
    setIsProcessing(true);
    try {
      if (data.requestType === "BirthNotification") {
        // Execute actual birth registration in civil registry
        await civilRegistryService.registerBirth({
          childFirstName: data.childFullName,
          childGender: data.childGender === "ذكر" || data.childGender === "Male" ? "Male" : "Female",
          fatherNationalNumber: data.fatherNationalId,
          motherNationalNumber: data.motherNationalId,
          dateOfBirth: data.dateOfBirth.split("T")[0],
          placeOfBirth: data.hospitalName || "",
          governorate: data.governorate || "",
          district: data.district || "",
        });
      } else if (data.requestType === "DeathNotification") {
        // Execute actual death registration in civil registry
        await civilRegistryService.registerDeath({
          deceasedNationalNumber: data.deceasedNationalId,
          deathDate: data.deathDateTime.split("T")[0],
          causeOfDeath: data.causeOfDeath,
          placeOfDeath: `${data.hospitalName || ""} - ${data.department || ""}`,
          governorate: data.governorate || "",
          district: data.district || "",
        });
      }

      // Mark service request as Approved
      await serviceRequestsService.changeRequestStatus({
        serviceRequestId: selectedHospitalRequest.id,
        newStatus: "Approved",
        note: hospitalOfficerNotes || "تم اعتماد الطلب وتسجيله في السجل المدني.",
      });

      setHospitalRequests((prev) =>
        prev.map((r) => r.id === selectedHospitalRequest.id ? { ...r, status: "Approved" } : r)
      );
      setSelectedHospitalRequest(null);
      showNotification(
        "success",
        data.requestType === "BirthNotification"
          ? `✅ تمت الموافقة على طلب الولادة وتسجيله في السجل المدني (${data.childFullName})`
          : `✅ تمت الموافقة على طلب الوفاة وتسجيله في السجل المدني`
      );
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشل تنفيذ عملية التسجيل";
      showNotification("error", msg);
    } finally {
      setIsProcessing(false);
    }
  };

  // ─── Hospital Request: Reject ──────────────────────────────────────────────
  const handleRejectHospitalRequest = async () => {
    if (!selectedHospitalRequest) return;
    if (!hospitalRejectionReason.trim()) {
      alert("يرجى كتابة سبب الرفض.");
      return;
    }
    setIsProcessing(true);
    try {
      await serviceRequestsService.changeRequestStatus({
        serviceRequestId: selectedHospitalRequest.id,
        newStatus: "Rejected",
        note: hospitalOfficerNotes,
        rejectionReason: hospitalRejectionReason,
      });
      setHospitalRequests((prev) =>
        prev.map((r) => r.id === selectedHospitalRequest.id ? { ...r, status: "Rejected", rejectionReason: hospitalRejectionReason } : r)
      );
      setSelectedHospitalRequest(null);
      setIsHospitalRejecting(false);
      showNotification("info", `تم رفض الطلب وإشعار المستشفى بسبب الرفض.`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشل تنفيذ الرفض";
      showNotification("error", msg);
    } finally {
      setIsProcessing(false);
    }
  };

  // ─── Status badge helpers ──────────────────────────────────────────────────
  const getStatusBadge = (status: string) => {
    const map: Record<string, { label: string; cls: string }> = {
      Pending:     { label: "قيد الانتظار",      cls: "bg-amber-50 text-amber-700 border-amber-200" },
      UnderReview: { label: "قيد المراجعة",       cls: "bg-sky-50 text-sky-700 border-sky-200" },
      Approved:    { label: "تمت الموافقة",       cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
      Issued:      { label: "تم الإصدار",         cls: "bg-emerald-50 text-emerald-700 border-emerald-200" },
      Rejected:    { label: "مرفوض",             cls: "bg-rose-50 text-rose-700 border-rose-200" },
    };
    const s = map[status] || { label: status, cls: "bg-gray-100 text-gray-700 border-gray-200" };
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${s.cls}`}>
        {s.label}
      </span>
    );
  };

  const pendingHospitalCount = hospitalRequests.filter((r) => r.status === "Pending").length;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-5 left-1/2 -translate-x-1/2 z-[999] px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-white text-sm font-semibold transition-all max-w-xl ${
            notification.type === "success"
              ? "bg-[#005539] border border-emerald-400"
              : notification.type === "error"
              ? "bg-rose-700 border border-rose-400"
              : "bg-[#0b4f6c] border border-sky-400"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-300 shrink-0" />
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
          مراجعة الطلبات والوثائق
        </h1>
        <p className="text-sm text-[#41484d] mt-1">
          فحص ومراجعة طلبات المواطنين وطلبات المستشفيات (ولادة / وفاة) واعتمادها أو رفضها.
        </p>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-3 border-b border-[#e0e3e5] pb-1">
        <button
          onClick={() => setActiveView("civil")}
          className={`px-5 py-2.5 text-sm font-bold rounded-t-xl transition flex items-center gap-2 ${
            activeView === "civil"
              ? "bg-white border border-b-white border-[#e0e3e5] text-[#00374e] -mb-px"
              : "text-slate-500 hover:text-[#00374e]"
          }`}
        >
          <FileText className="w-4 h-4" />
          طلبات الخدمات المدنية
        </button>
        <button
          onClick={() => setActiveView("hospital")}
          className={`px-5 py-2.5 text-sm font-bold rounded-t-xl transition flex items-center gap-2 relative ${
            activeView === "hospital"
              ? "bg-white border border-b-white border-[#e0e3e5] text-[#00374e] -mb-px"
              : "text-slate-500 hover:text-[#00374e]"
          }`}
        >
          <Hospital className="w-4 h-4" />
          طلبات المستشفيات (ولادة / وفاة)
          {pendingHospitalCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] flex items-center justify-center font-bold">
              {pendingHospitalCount}
            </span>
          )}
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════════════════════
          VIEW A: Civil Service Requests
      ═══════════════════════════════════════════════════════════════════════ */}
      {activeView === "civil" && (
        <>
          {/* Filters */}
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
                  <option value="Pending">قيد الانتظار</option>
                  <option value="UnderReview">قيد المراجعة الفنية</option>
                  <option value="Approved">تم الاعتماد</option>
                  <option value="Issued">تم الإصدار والطباعة</option>
                  <option value="Rejected">مرفوض</option>
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
            {loadingCivil ? (
              <div className="py-20 flex justify-center items-center gap-3">
                <RefreshCw className="w-8 h-8 text-[#0b4f6c] animate-spin" />
                <span className="text-sm font-medium text-slate-500">جاري تحميل الطلبات...</span>
              </div>
            ) : requests.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700">لا توجد طلبات</h4>
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
                        <td className="py-4 px-6 font-mono font-bold text-[#0b4f6c]">{req.requestNumber}</td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={req.personPhoto}
                              alt={req.personFullName}
                              className="w-8 h-8 rounded-full object-cover border border-slate-200"
                            />
                            <div>
                              <div className="font-bold text-slate-800">{req.personFullName}</div>
                              <div className="font-mono text-[11px] text-slate-500">{req.personNationalNumber}</div>
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
                        <td className="py-4 px-6">{getStatusBadge(req.status)}</td>
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
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          VIEW B: Hospital Vital-Event Requests
      ═══════════════════════════════════════════════════════════════════════ */}
      {activeView === "hospital" && (
        <>
          {/* Info Banner */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <strong>صلاحية حصرية للأحوال المدنية:</strong> الطلبات الواردة من المستشفيات لا تُسجَّل تلقائياً —
              يجب على موظف أو مدير الأحوال المدنية <strong>الموافقة</strong> لإتمام التسجيل الرسمي في السجل المدني،
              أو <strong>الرفض</strong> مع إشعار المستشفى بالسبب.
            </div>
          </div>

          {/* Hospital Filters */}
          <div className="bg-white rounded-2xl border border-[#e0e3e5] p-5 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#41484d]">نوع الواقعة</label>
                <select
                  value={hospitalTypeFilter}
                  onChange={(e) => setHospitalTypeFilter(e.target.value)}
                  className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg px-4 py-2 text-sm text-[#191c1e] focus:outline-none focus:border-[#0b4f6c]"
                >
                  <option value="all">ولادة ووفاة</option>
                  <option value="birth">طلبات الولادة فقط</option>
                  <option value="death">طلبات الوفاة فقط</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-[#41484d]">حالة الطلب</label>
                <select
                  value={hospitalStatusFilter}
                  onChange={(e) => setHospitalStatusFilter(e.target.value)}
                  className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg px-4 py-2 text-sm text-[#191c1e] focus:outline-none focus:border-[#0b4f6c]"
                >
                  <option value="all">جميع الحالات</option>
                  <option value="Pending">قيد الانتظار</option>
                  <option value="Approved">تمت الموافقة</option>
                  <option value="Rejected">مرفوض</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={fetchHospitalRequests}
                  className="flex items-center gap-2 px-4 py-2 bg-[#00374e] text-white rounded-lg text-sm font-bold hover:bg-[#004d6b] transition"
                >
                  <RefreshCw className="w-4 h-4" />
                  تحديث القائمة
                </button>
              </div>
            </div>
          </div>

          {/* Hospital Requests Table */}
          <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-sm overflow-hidden">
            {loadingHospital ? (
              <div className="py-20 flex justify-center items-center gap-3">
                <RefreshCw className="w-8 h-8 text-[#0b4f6c] animate-spin" />
                <span className="text-sm font-medium text-slate-500">جاري تحميل الطلبات...</span>
              </div>
            ) : hospitalRequests.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <Hospital className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-slate-700">لا توجد طلبات من المستشفيات</h4>
                <p className="text-xs text-slate-500 mt-1">ستظهر هنا الطلبات التي يرسلها موظفو المستشفيات</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-right border-collapse text-xs">
                  <thead className="bg-[#f0eadd]/60 border-b border-[#c0c7ce]/50 font-bold text-[#00374e]">
                    <tr>
                      <th className="py-4 px-6">رقم الطلب</th>
                      <th className="py-4 px-6">نوع الواقعة</th>
                      <th className="py-4 px-6">البيانات الأساسية</th>
                      <th className="py-4 px-6">المستشفى المُرسِل</th>
                      <th className="py-4 px-6">تاريخ الإرسال</th>
                      <th className="py-4 px-6">الحالة</th>
                      <th className="py-4 px-6 text-center">إجراء الأحوال المدنية</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#e0e3e5]/70">
                    {hospitalRequests.map((req) => {
                      const data = parseRequestData(req);
                      const isBirth = data?.requestType === "BirthNotification";
                      const isDeath = data?.requestType === "DeathNotification";
                      return (
                        <tr key={req.id} className="hover:bg-[#f7f9fb] transition-colors">
                          <td className="py-4 px-6 font-mono font-bold text-[#0b4f6c]">{req.requestNumber}</td>
                          <td className="py-4 px-6">
                            {isBirth ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-cyan-100 text-cyan-700 border border-cyan-300">
                                <Baby className="w-3.5 h-3.5" />
                                طلب ولادة
                              </span>
                            ) : isDeath ? (
                              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-100 text-rose-700 border border-rose-300">
                                <Activity className="w-3.5 h-3.5" />
                                طلب وفاة
                              </span>
                            ) : (
                              <span className="text-slate-500">غير محدد</span>
                            )}
                          </td>
                          <td className="py-4 px-6">
                            {isBirth && data?.requestType === "BirthNotification" && (
                              <div>
                                <div className="font-bold text-slate-800">
                                  {(data as BirthRequestData).childFullName}
                                </div>
                                <div className="text-slate-500 text-[11px] mt-0.5">
                                  الأب: {(data as BirthRequestData).fatherNationalId}
                                  {(data as BirthRequestData).fatherName && ` — ${(data as BirthRequestData).fatherName}`}
                                </div>
                              </div>
                            )}
                            {isDeath && data?.requestType === "DeathNotification" && (
                              <div>
                                <div className="font-bold text-slate-800">
                                  {(data as DeathRequestData).deceasedName || (data as DeathRequestData).deceasedNationalId}
                                </div>
                                <div className="text-slate-500 text-[11px] mt-0.5">
                                  السبب: {(data as DeathRequestData).causeOfDeath}
                                </div>
                              </div>
                            )}
                          </td>
                          <td className="py-4 px-6 text-slate-600">
                            {data?.hospitalName || req.branchName || "—"}
                          </td>
                          <td className="py-4 px-6 font-mono text-slate-500">
                            {new Date(req.submissionDate || req.createdAt).toLocaleDateString("ar-YE")}
                          </td>
                          <td className="py-4 px-6">{getStatusBadge(req.status)}</td>
                          <td className="py-4 px-6 text-center">
                            {req.status === "Pending" || req.status === "UnderReview" ? (
                              <button
                                onClick={() => {
                                  setSelectedHospitalRequest(req);
                                  setHospitalOfficerNotes("");
                                  setHospitalRejectionReason("");
                                  setIsHospitalRejecting(false);
                                }}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#00374e] text-white font-bold text-[11px] hover:bg-[#004d6b] transition"
                              >
                                <FileCheck className="w-3.5 h-3.5" />
                                مراجعة واتخاذ قرار
                              </button>
                            ) : req.status === "Approved" ? (
                              <span className="inline-flex items-center gap-1 text-emerald-600 text-[11px] font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                تم التسجيل
                              </span>
                            ) : req.status === "Rejected" ? (
                              <span className="inline-flex items-center gap-1 text-rose-600 text-[11px] font-bold">
                                <XCircle className="w-3.5 h-3.5" />
                                مرفوض
                              </span>
                            ) : null}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          MODAL A: Civil Service Request Review
      ═══════════════════════════════════════════════════════════════════════ */}
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
              <button onClick={() => setSelectedRequest(null)} className="p-1.5 text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5 text-xs">
              <div className="p-4 bg-[#f7f9fb] border border-slate-200 rounded-xl flex items-center gap-4">
                <img src={selectedRequest.personPhoto} alt={selectedRequest.personFullName} className="w-14 h-14 rounded-xl object-cover border border-slate-300" />
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{selectedRequest.personFullName}</h4>
                  <div className="font-mono text-slate-500 mt-0.5">الرقم الوطني: {selectedRequest.personNationalNumber}</div>
                  <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                    الرسوم: {selectedRequest.fee.toLocaleString("ar-YE")} ريال (مدفوعة إلكترونياً)
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-bold text-slate-700 mb-2">المرفقات والوثائق المقدمة:</h4>
                <div className="space-y-2">
                  {selectedRequest.attachments.map((att, idx) => (
                    <div key={idx} className="p-3 bg-white border border-slate-200 rounded-lg flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText className="w-4 h-4 text-[#0b4f6c]" />
                        <span className="font-semibold text-slate-700">{att.name}</span>
                      </div>
                      <span className="text-[11px] text-[#0b4f6c] hover:underline cursor-pointer">معاينة الوثيقة</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">ملاحظات الضابط المختص:</label>
                <textarea
                  rows={2}
                  value={officerNotes}
                  onChange={(e) => setOfficerNotes(e.target.value)}
                  placeholder="اكتب أي توجيهات أو ملاحظات إدارية..."
                  className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#0b4f6c]"
                />
              </div>

              {isRejecting && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                  <label className="block font-bold text-rose-800">سبب الرفض (سيُشعَر به المواطن):</label>
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

            <div className="p-6 border-t border-slate-100 flex items-center justify-between">
              <button onClick={() => setSelectedRequest(null)} className="px-4 py-2 border border-slate-300 text-slate-600 rounded-xl font-bold">
                إغلاق
              </button>
              <div className="flex items-center gap-2">
                {!isRejecting ? (
                  <>
                    {selectedRequest.status !== "Issued" && selectedRequest.status !== "Rejected" && (
                      <button onClick={() => setIsRejecting(true)} className="px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl font-bold">
                        رفض الطلب
                      </button>
                    )}
                    {selectedRequest.status === "Pending" && (
                      <button onClick={handleStartReview} className="px-5 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold flex items-center gap-1.5">
                        <Clock className="w-4 h-4" /> بدء التدقيق
                      </button>
                    )}
                    {selectedRequest.status === "UnderReview" && (
                      <button onClick={handleApprove} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4" /> اعتماد الطلب
                      </button>
                    )}
                    {selectedRequest.status === "Approved" && (
                      <button onClick={handleIssue} className="px-6 py-2 bg-[#005539] hover:bg-[#003c27] text-white rounded-xl font-bold flex items-center gap-1.5">
                        <Printer className="w-4 h-4" /> إصدار وطباعة
                      </button>
                    )}
                    {selectedRequest.status === "Issued" && (
                      <div className="px-5 py-2 bg-emerald-100 text-emerald-800 rounded-xl font-bold flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" /> تمت الطباعة والإصدار
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <button onClick={() => setIsRejecting(false)} className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl">
                      تراجع
                    </button>
                    <button onClick={handleReject} className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold">
                      تأكيد الرفض وإشعار المواطن
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════════
          MODAL B: Hospital Vital-Event Request Review
      ═══════════════════════════════════════════════════════════════════════ */}
      {selectedHospitalRequest && (() => {
        const data = parseRequestData(selectedHospitalRequest);
        const isBirth = data?.requestType === "BirthNotification";
        const isDeath = data?.requestType === "DeathNotification";
        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
              {/* Modal Header */}
              <div className={`flex items-center justify-between p-6 border-b border-slate-100 ${isBirth ? "bg-cyan-50" : "bg-rose-50"}`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl ${isBirth ? "bg-cyan-100" : "bg-rose-100"}`}>
                    {isBirth ? "👶" : "📜"}
                  </div>
                  <div>
                    <h3 className={`text-base font-bold ${isBirth ? "text-cyan-800" : "text-rose-800"}`}>
                      {isBirth ? "مراجعة طلب تسجيل ولادة" : "مراجعة طلب تسجيل وفاة"}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {selectedHospitalRequest.requestNumber} — {data?.hospitalName || selectedHospitalRequest.branchName}
                    </p>
                  </div>
                </div>
                <button onClick={() => setSelectedHospitalRequest(null)} className="p-1.5 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-5 text-xs">
                {/* Hospital & Submitter info */}
                <div className="p-4 bg-[#f7f9fb] border border-slate-200 rounded-xl">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2">
                      <Hospital className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="text-slate-500">المستشفى المُرسِل</div>
                        <div className="font-bold text-slate-800">{data?.hospitalName || "—"}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <User2 className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="text-slate-500">أرسله</div>
                        <div className="font-bold text-slate-800">{data?.submittedByName || "—"}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="text-slate-500">تاريخ الإرسال</div>
                        <div className="font-bold text-slate-800">
                          {new Date(selectedHospitalRequest.submissionDate || selectedHospitalRequest.createdAt).toLocaleString("ar-YE")}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Birth Details */}
                {isBirth && data?.requestType === "BirthNotification" && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-[#00374e] flex items-center gap-2">
                      <Baby className="w-4 h-4" /> بيانات واقعة الولادة
                    </h4>
                    <div className="grid grid-cols-2 gap-3 p-4 bg-cyan-50 border border-cyan-200 rounded-xl">
                      <div>
                        <div className="text-slate-500">اسم المولود</div>
                        <div className="font-bold text-slate-800 text-sm">{(data as BirthRequestData).childFullName}</div>
                      </div>
                      <div>
                        <div className="text-slate-500">الجنس</div>
                        <div className="font-bold text-slate-800">{(data as BirthRequestData).childGender}</div>
                      </div>
                      <div>
                        <div className="text-slate-500">تاريخ ووقت الولادة</div>
                        <div className="font-bold text-slate-800 font-mono">
                          {new Date((data as BirthRequestData).dateOfBirth).toLocaleString("ar-YE")}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500">نوع الولادة</div>
                        <div className="font-bold text-slate-800">{(data as BirthRequestData).deliveryType || "—"}</div>
                      </div>
                      <div>
                        <div className="text-slate-500">الوزن عند الولادة</div>
                        <div className="font-bold text-slate-800">
                          {(data as BirthRequestData).birthWeight ? `${(data as BirthRequestData).birthWeight} كغم` : "—"}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-500">الطبيب المشرف</div>
                        <div className="font-bold text-slate-800">{(data as BirthRequestData).doctorName || "—"}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
                      <div>
                        <div className="text-slate-500">الرقم الوطني للأب</div>
                        <div className="font-bold font-mono text-slate-800">{(data as BirthRequestData).fatherNationalId}</div>
                        {(data as BirthRequestData).fatherName && (
                          <div className="text-cyan-600 text-[11px]">{(data as BirthRequestData).fatherName}</div>
                        )}
                      </div>
                      <div>
                        <div className="text-slate-500">الرقم الوطني للأم</div>
                        <div className="font-bold font-mono text-slate-800">{(data as BirthRequestData).motherNationalId}</div>
                        {(data as BirthRequestData).motherName && (
                          <div className="text-cyan-600 text-[11px]">{(data as BirthRequestData).motherName}</div>
                        )}
                      </div>
                      <div>
                        <div className="text-slate-500">المحافظة</div>
                        <div className="font-bold text-slate-800">{(data as BirthRequestData).governorate || "—"}</div>
                      </div>
                    </div>
                    {(data as BirthRequestData).notes && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
                        <strong>ملاحظات المستشفى:</strong> {(data as BirthRequestData).notes}
                      </div>
                    )}
                  </div>
                )}

                {/* Death Details */}
                {isDeath && data?.requestType === "DeathNotification" && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-[#00374e] flex items-center gap-2">
                      <Stethoscope className="w-4 h-4" /> بيانات واقعة الوفاة
                    </h4>
                    <div className="grid grid-cols-2 gap-3 p-4 bg-rose-50 border border-rose-200 rounded-xl">
                      <div>
                        <div className="text-slate-500">الرقم الوطني للمتوفى</div>
                        <div className="font-bold font-mono text-slate-800 text-sm">{(data as DeathRequestData).deceasedNationalId}</div>
                        {(data as DeathRequestData).deceasedName && (
                          <div className="text-rose-600 text-[11px] font-semibold">{(data as DeathRequestData).deceasedName}</div>
                        )}
                      </div>
                      <div>
                        <div className="text-slate-500">تاريخ ووقت الوفاة</div>
                        <div className="font-bold text-slate-800 font-mono">
                          {new Date((data as DeathRequestData).deathDateTime).toLocaleString("ar-YE")}
                        </div>
                      </div>
                      <div className="col-span-2">
                        <div className="text-slate-500">السبب المباشر للوفاة</div>
                        <div className="font-bold text-rose-800 text-sm">{(data as DeathRequestData).causeOfDeath}</div>
                      </div>
                      <div>
                        <div className="text-slate-500">القسم / الجناح</div>
                        <div className="font-bold text-slate-800">{(data as DeathRequestData).department || "—"}</div>
                      </div>
                      <div>
                        <div className="text-slate-500">الطبيب المعتمد</div>
                        <div className="font-bold text-slate-800">{(data as DeathRequestData).certifyingDoctor || "—"}</div>
                      </div>
                      <div>
                        <div className="text-slate-500">المحافظة</div>
                        <div className="font-bold text-slate-800">{(data as DeathRequestData).governorate || "—"}</div>
                      </div>
                    </div>
                    {(data as DeathRequestData).notes && (
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
                        <strong>ملاحظات المستشفى:</strong> {(data as DeathRequestData).notes}
                      </div>
                    )}
                  </div>
                )}

                {/* Officer Notes */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">ملاحظات موظف الأحوال المدنية:</label>
                  <textarea
                    rows={2}
                    value={hospitalOfficerNotes}
                    onChange={(e) => setHospitalOfficerNotes(e.target.value)}
                    placeholder="أضف أي ملاحظات أو توجيهات..."
                    className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:outline-none focus:border-[#0b4f6c]"
                  />
                </div>

                {/* Rejection Reason */}
                {isHospitalRejecting && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl space-y-2">
                    <label className="block font-bold text-rose-800">
                      سبب الرفض (سيُشعَر به المستشفى):
                    </label>
                    <textarea
                      rows={2}
                      value={hospitalRejectionReason}
                      onChange={(e) => setHospitalRejectionReason(e.target.value)}
                      placeholder="وضح سبب رفض الطلب بالتفصيل..."
                      className="w-full bg-white border border-rose-300 rounded-lg p-2 text-xs text-rose-900 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                )}
              </div>

              {/* Modal Actions */}
              <div className="p-6 border-t border-slate-100 flex items-center justify-between gap-3">
                <button
                  onClick={() => { setSelectedHospitalRequest(null); setIsHospitalRejecting(false); }}
                  className="px-4 py-2 border border-slate-300 text-slate-600 rounded-xl font-bold"
                >
                  إغلاق
                </button>

                {selectedHospitalRequest.status === "Approved" ? (
                  <div className="px-5 py-2 bg-emerald-100 text-emerald-800 rounded-xl font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    تمت الموافقة وتسجيله في السجل المدني
                  </div>
                ) : selectedHospitalRequest.status === "Rejected" ? (
                  <div className="px-5 py-2 bg-rose-100 text-rose-800 rounded-xl font-bold flex items-center gap-1.5">
                    <XCircle className="w-4 h-4 text-rose-600" />
                    مرفوض
                  </div>
                ) : !isHospitalRejecting ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsHospitalRejecting(true)}
                      className="px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl font-bold"
                    >
                      رفض الطلب
                    </button>
                    <button
                      onClick={handleApproveHospitalRequest}
                      disabled={isProcessing}
                      className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-2 shadow-sm"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      {isProcessing
                        ? "جاري التسجيل في السجل المدني..."
                        : isBirth
                        ? "قبول وتسجيل الولادة رسمياً"
                        : "قبول وتسجيل الوفاة رسمياً"}
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsHospitalRejecting(false)}
                      className="px-4 py-2 text-slate-500 hover:bg-slate-100 rounded-xl"
                    >
                      تراجع
                    </button>
                    <button
                      onClick={handleRejectHospitalRequest}
                      disabled={isProcessing}
                      className="px-6 py-2 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl font-bold"
                    >
                      {isProcessing ? "جاري الرفض..." : "تأكيد الرفض وإشعار المستشفى"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
