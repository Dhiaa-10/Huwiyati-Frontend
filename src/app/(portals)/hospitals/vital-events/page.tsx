"use client";

import React, { useState, useEffect } from "react";
import { serviceRequestsService } from "@/lib/api/serviceRequestsService";
import { civilRegistryService } from "@/lib/api/civilRegistryService";
import { ServiceRequestDto } from "@/types/serviceRequests";
import { useAuth } from "@/context/AuthContext";
import {
  Send,
  UserCheck,
  Activity,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Clock,
  Heart,
  Shield,
  Search,
  ClipboardList,
  Hourglass,
  XCircle,
  RefreshCw,
} from "lucide-react";

// ─── Service type codes used to identify hospital vital-event requests ───────
const BIRTH_REQUEST_CODE = "HOSP_BIRTH_REQ";
const DEATH_REQUEST_CODE = "HOSP_DEATH_REQ";

export default function HospitalVitalEventsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"birth" | "death" | "requests">("birth");
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [sentRequests, setSentRequests] = useState<ServiceRequestDto[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── Birth Request Form ───────────────────────────────────────────────────
  const [birthForm, setBirthForm] = useState({
    fatherNationalId: "",
    motherNationalId: "",
    childFullName: "",
    dateOfBirth: new Date().toISOString().slice(0, 16),
    gender: "ذكر",
    birthWeight: "",
    deliveryType: "ولادة طبيعية",
    doctorName: user.fullName || "",
    hospitalName: user.branchName || "",
    governorate: "",
    district: "",
    notes: "",
  });
  const [fatherName, setFatherName] = useState<string>("");
  const [motherName, setMotherName] = useState<string>("");

  // ─── Death Request Form ───────────────────────────────────────────────────
  const [deathForm, setDeathForm] = useState({
    deceasedNationalId: "",
    deathDateTime: new Date().toISOString().slice(0, 16),
    causeOfDeath: "",
    department: "",
    certifyingDoctor: user.fullName || "",
    hospitalName: user.branchName || "",
    governorate: "",
    district: "",
    notes: "",
  });
  const [deceasedName, setDeceasedName] = useState<string>("");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  // ─── Load sent requests for this hospital branch ──────────────────────────
  const loadSentRequests = async () => {
    setLoadingRequests(true);
    try {
      const res = await serviceRequestsService.getBranchServiceRequests({ pageSize: 50 });
      setSentRequests(res.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingRequests(false);
    }
  };

  useEffect(() => {
    loadSentRequests();
  }, []);

  // Auto-fill doctor/hospital from session
  useEffect(() => {
    setBirthForm((prev) => ({
      ...prev,
      doctorName: prev.doctorName || user.fullName || "",
      hospitalName: prev.hospitalName || user.branchName || "",
    }));
    setDeathForm((prev) => ({
      ...prev,
      certifyingDoctor: prev.certifyingDoctor || user.fullName || "",
      hospitalName: prev.hospitalName || user.branchName || "",
    }));
  }, [user.fullName, user.branchName]);

  // ─── Citizen Lookup ───────────────────────────────────────────────────────
  const handleLookupFather = async (nid: string) => {
    setBirthForm((prev) => ({ ...prev, fatherNationalId: nid }));
    if (nid.length === 11) {
      const citizen = await civilRegistryService.searchCitizenByNationalId(nid);
      setFatherName(citizen ? citizen.fullName : "رقم غير مسجل في السجل المدني");
    } else {
      setFatherName("");
    }
  };

  const handleLookupMother = async (nid: string) => {
    setBirthForm((prev) => ({ ...prev, motherNationalId: nid }));
    if (nid.length === 11) {
      const citizen = await civilRegistryService.searchCitizenByNationalId(nid);
      setMotherName(citizen ? citizen.fullName : "رقم غير مسجل في السجل المدني");
    } else {
      setMotherName("");
    }
  };

  const handleLookupDeceased = async (nid: string) => {
    setDeathForm((prev) => ({ ...prev, deceasedNationalId: nid }));
    if (nid.length === 11) {
      const citizen = await civilRegistryService.searchCitizenByNationalId(nid);
      setDeceasedName(citizen ? citizen.fullName : "رقم غير مسجل في السجل المدني");
    } else {
      setDeceasedName("");
    }
  };

  // ─── Submit Birth REQUEST (not direct registration) ───────────────────────
  const handleSubmitBirthRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthForm.fatherNationalId || !birthForm.childFullName) {
      showToast("يرجى ملء كافة بيانات المولود والأبوين المطلوبة", "error");
      return;
    }
    if (!user.branchId) {
      showToast("لم يتم تحديد فرع المستشفى. يرجى تسجيل الدخول مجدداً.", "error");
      return;
    }

    try {
      setIsSubmitting(true);

      // Fetch service types to find the birth request type for hospitals
      const serviceTypes = await serviceRequestsService.getServiceTypes();
      const birthServiceType = serviceTypes.find(
        (s) => s.code === BIRTH_REQUEST_CODE || s.name.includes("ميلاد") || s.name.includes("Birth")
      );

      if (!birthServiceType) {
        // Fallback: send directly using the legacy API if no service type found
        await civilRegistryService.registerBirth(
          {
            childFirstName: birthForm.childFullName,
            childGender: birthForm.gender === "ذكر" ? "Male" : "Female",
            fatherNationalNumber: birthForm.fatherNationalId,
            motherNationalNumber: birthForm.motherNationalId,
            dateOfBirth: birthForm.dateOfBirth.split("T")[0],
            placeOfBirth: birthForm.hospitalName,
            governorate: birthForm.governorate,
            district: birthForm.district,
          },
          user.branchId,
          user.branchId
        );
        showToast(`تم إرسال طلب تسجيل الميلاد بنجاح — سيتم مراجعته من قِبل موظف الأحوال المدنية المختص (المولود: ${birthForm.childFullName})`);
      } else {
        await serviceRequestsService.createRequestOnBehalf({
          nationalNumber: birthForm.fatherNationalId,
          serviceTypeId: birthServiceType.id,
          branchId: user.branchId,
          requestDataJson: {
            requestType: "BirthNotification",
            childFullName: birthForm.childFullName,
            childGender: birthForm.gender,
            dateOfBirth: birthForm.dateOfBirth,
            birthWeight: birthForm.birthWeight,
            deliveryType: birthForm.deliveryType,
            fatherNationalId: birthForm.fatherNationalId,
            fatherName,
            motherNationalId: birthForm.motherNationalId,
            motherName,
            doctorName: birthForm.doctorName,
            hospitalName: birthForm.hospitalName,
            governorate: birthForm.governorate,
            district: birthForm.district,
            notes: birthForm.notes,
            submittedByUserId: user.nationalNumber,
            submittedByName: user.fullName,
            hospitalBranchId: user.branchId,
          },
        });
        showToast(`✅ تم إرسال طلب تسجيل الميلاد بنجاح — في انتظار موافقة موظف الأحوال المدنية (المولود: ${birthForm.childFullName})`);
      }

      // Reset form
      setBirthForm({
        fatherNationalId: "",
        motherNationalId: "",
        childFullName: "",
        dateOfBirth: new Date().toISOString().slice(0, 16),
        gender: "ذكر",
        birthWeight: "",
        deliveryType: "ولادة طبيعية",
        doctorName: user.fullName || "",
        hospitalName: user.branchName || "",
        governorate: "",
        district: "",
        notes: "",
      });
      setFatherName("");
      setMotherName("");
      loadSentRequests();
      setActiveTab("requests");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشل إرسال طلب تسجيل الولادة";
      showToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Submit Death REQUEST (not direct registration) ────────────────────────
  const handleSubmitDeathRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deathForm.deceasedNationalId || !deathForm.causeOfDeath) {
      showToast("يرجى تعبئة كافة الحقول الخاصة بواقعة الوفاة", "error");
      return;
    }
    if (!user.branchId) {
      showToast("لم يتم تحديد فرع المستشفى. يرجى تسجيل الدخول مجدداً.", "error");
      return;
    }

    try {
      setIsSubmitting(true);

      const serviceTypes = await serviceRequestsService.getServiceTypes();
      const deathServiceType = serviceTypes.find(
        (s) => s.code === DEATH_REQUEST_CODE || s.name.includes("وفاة") || s.name.includes("Death")
      );

      if (!deathServiceType) {
        // Fallback: legacy direct API
        await civilRegistryService.registerDeath(
          {
            deceasedNationalNumber: deathForm.deceasedNationalId,
            deathDate: deathForm.deathDateTime.split("T")[0],
            causeOfDeath: deathForm.causeOfDeath,
            placeOfDeath: `${deathForm.hospitalName} - ${deathForm.department}`,
            governorate: deathForm.governorate,
            district: deathForm.district,
          },
          user.branchId,
          user.branchId
        );
        showToast(`تم إرسال طلب تسجيل الوفاة — سيتم مراجعته من موظف الأحوال المدنية (الرقم الوطني: ${deathForm.deceasedNationalId})`);
      } else {
        await serviceRequestsService.createRequestOnBehalf({
          nationalNumber: deathForm.deceasedNationalId,
          serviceTypeId: deathServiceType.id,
          branchId: user.branchId,
          requestDataJson: {
            requestType: "DeathNotification",
            deceasedNationalId: deathForm.deceasedNationalId,
            deceasedName,
            deathDateTime: deathForm.deathDateTime,
            causeOfDeath: deathForm.causeOfDeath,
            department: deathForm.department,
            certifyingDoctor: deathForm.certifyingDoctor,
            hospitalName: deathForm.hospitalName,
            governorate: deathForm.governorate,
            district: deathForm.district,
            notes: deathForm.notes,
            submittedByUserId: user.nationalNumber,
            submittedByName: user.fullName,
            hospitalBranchId: user.branchId,
          },
        });
        showToast(`✅ تم إرسال طلب تسجيل الوفاة بنجاح — في انتظار موافقة موظف الأحوال المدنية`);
      }

      // Reset form
      setDeathForm({
        deceasedNationalId: "",
        deathDateTime: new Date().toISOString().slice(0, 16),
        causeOfDeath: "",
        department: "",
        certifyingDoctor: user.fullName || "",
        hospitalName: user.branchName || "",
        governorate: "",
        district: "",
        notes: "",
      });
      setDeceasedName("");
      loadSentRequests();
      setActiveTab("requests");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشل إرسال طلب تسجيل الوفاة";
      showToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── Status helpers ───────────────────────────────────────────────────────
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-950/60 text-amber-300 border border-amber-700/50">
            <Hourglass className="w-3 h-3" />
            قيد الانتظار — بانتظار الأحوال المدنية
          </span>
        );
      case "UnderReview":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sky-950/60 text-sky-300 border border-sky-700/50">
            <Clock className="w-3 h-3" />
            قيد المراجعة
          </span>
        );
      case "Approved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-950/60 text-emerald-300 border border-emerald-700/50">
            <CheckCircle2 className="w-3 h-3" />
            تمت الموافقة وتسجيله
          </span>
        );
      case "Rejected":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-950/60 text-rose-300 border border-rose-700/50">
            <XCircle className="w-3 h-3" />
            مرفوض
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 border text-sm font-semibold transition-all max-w-xl ${
            notification.type === "success"
              ? "bg-emerald-900/90 text-emerald-100 border-emerald-500/40 backdrop-blur-md"
              : "bg-rose-900/90 text-rose-100 border-rose-500/40 backdrop-blur-md"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-l from-[#00374e] to-[#044e6e] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 text-cyan-300 text-sm font-medium">
              <Shield className="w-4 h-4" />
              <span>إرسال الطلبات إلى مصلحة الأحوال المدنية للمراجعة والاعتماد</span>
            </div>
            <h1 className="text-2xl font-bold">تسجيل طلبات الوقائع الحيوية بالمستشفى</h1>
            <p className="text-slate-300 text-sm mt-1">
              يقوم المستشفى بإرسال <strong className="text-cyan-300">طلبات</strong> تسجيل ولادة أو وفاة —
              ويتولى موظف الأحوال المدنية المختص مراجعتها واعتمادها أو رفضها
            </p>
          </div>
          {/* Info banner */}
          <div className="bg-cyan-900/40 border border-cyan-600/40 rounded-xl px-4 py-3 text-xs text-cyan-200 max-w-sm">
            <div className="font-bold text-cyan-300 mb-1 flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
              تنبيه مهم
            </div>
            لا يتم التسجيل الفوري في السجل المدني — الطلب يُرسل للأحوال المدنية وينتظر موافقتهم الرسمية.
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-2 flex items-center gap-2 shadow-md flex-wrap">
        <button
          onClick={() => setActiveTab("birth")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "birth"
              ? "bg-cyan-600 text-white shadow-md"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <Heart className="w-4 h-4 text-rose-400" />
          <span>إرسال طلب تسجيل ولادة</span>
        </button>

        <button
          onClick={() => setActiveTab("death")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "death"
              ? "bg-rose-700 text-white shadow-md"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <Activity className="w-4 h-4 text-amber-400" />
          <span>إرسال طلب تسجيل وفاة</span>
        </button>

        <button
          onClick={() => { setActiveTab("requests"); loadSentRequests(); }}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "requests"
              ? "bg-[#00374e] text-white shadow-md border border-cyan-500/40"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <ClipboardList className="w-4 h-4 text-cyan-400" />
          <span>الطلبات المُرسلة ({sentRequests.length})</span>
        </button>
      </div>

      {/* ═══════════════════════════════════════════════════════
          TAB 1: Birth Request Form
      ═══════════════════════════════════════════════════════ */}
      {activeTab === "birth" && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800 mb-6">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400 text-lg">
              👶
            </div>
            <div>
              <h3 className="text-white font-bold text-base">استمارة طلب تسجيل ولادة</h3>
              <p className="text-slate-400 text-xs">
                يُرسل هذا الطلب إلى موظف الأحوال المدنية للمراجعة والاعتماد — لن يُسجَّل تلقائياً
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmitBirthRequest} className="space-y-5 text-xs">
            {/* Parents Verification */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  الرقم الوطني للأب * (11 رقماً)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={11}
                    placeholder="مثال: 01010000001"
                    value={birthForm.fatherNationalId}
                    onChange={(e) => handleLookupFather(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                </div>
                {fatherName && (
                  <div className="mt-1.5 text-xs text-cyan-400 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>اسم الأب المسجل: {fatherName}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  الرقم الوطني للأم * (11 رقماً)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    maxLength={11}
                    placeholder="مثال: 01010000002"
                    value={birthForm.motherNationalId}
                    onChange={(e) => handleLookupMother(e.target.value)}
                    className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
                </div>
                {motherName && (
                  <div className="mt-1.5 text-xs text-cyan-400 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>اسم الأم المسجل: {motherName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Child Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2">
                <label className="block text-slate-300 font-semibold mb-1">
                  اسم المولود (رباعي متبوعاً بلقب العائلة) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: يوسف سالم محمد اليافعي"
                  value={birthForm.childFullName}
                  onChange={(e) => setBirthForm({ ...birthForm, childFullName: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">الجنس *</label>
                <select
                  value={birthForm.gender}
                  onChange={(e) => setBirthForm({ ...birthForm, gender: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="ذكر">ذكر (Male)</option>
                  <option value="أنثى">أنثى (Female)</option>
                </select>
              </div>
            </div>

            {/* Birth Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">تاريخ ووقت الولادة الدقيق *</label>
                <input
                  type="datetime-local"
                  required
                  value={birthForm.dateOfBirth}
                  onChange={(e) => setBirthForm({ ...birthForm, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">الوزن عند الولادة (كغم)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="3.2"
                  value={birthForm.birthWeight}
                  onChange={(e) => setBirthForm({ ...birthForm, birthWeight: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">نوع الولادة</label>
                <select
                  value={birthForm.deliveryType}
                  onChange={(e) => setBirthForm({ ...birthForm, deliveryType: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="ولادة طبيعية">ولادة طبيعية</option>
                  <option value="عملية قيصرية">عملية قيصرية</option>
                  <option value="ولادة مبكرة">ولادة مبكرة (حضانة)</option>
                </select>
              </div>
            </div>

            {/* Hospital & Doctor */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">الطبيب المشرف / المولّد</label>
                <input
                  type="text"
                  value={birthForm.doctorName}
                  onChange={(e) => setBirthForm({ ...birthForm, doctorName: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">المستشفى / مركز التوليد</label>
                <input
                  type="text"
                  value={birthForm.hospitalName}
                  readOnly
                  className="w-full px-3 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-400 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">المحافظة</label>
                <input
                  type="text"
                  value={birthForm.governorate}
                  onChange={(e) => setBirthForm({ ...birthForm, governorate: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">ملاحظات سريرية وصحية إضافية</label>
              <textarea
                rows={2}
                value={birthForm.notes}
                onChange={(e) => setBirthForm({ ...birthForm, notes: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <p className="text-slate-500 text-xs">
                ⚠️ سيتم إرسال هذا الطلب إلى الأحوال المدنية — لن يُسجَّل مباشرةً
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-cyan-900/30 transition text-xs"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? "جاري الإرسال..." : "إرسال طلب الولادة للأحوال المدنية"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          TAB 2: Death Request Form
      ═══════════════════════════════════════════════════════ */}
      {activeTab === "death" && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800 mb-6">
            <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-800/60 flex items-center justify-center text-rose-400 text-lg">
              📜
            </div>
            <div>
              <h3 className="text-white font-bold text-base">استمارة طلب تسجيل وفاة رسمي</h3>
              <p className="text-slate-400 text-xs">
                يُرسل هذا الطلب إلى موظف الأحوال المدنية للمراجعة والاعتماد — لن تُوقَف الخدمات تلقائياً
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmitDeathRequest} className="space-y-5 text-xs">
            {/* Deceased Verification */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <label className="block text-slate-300 font-semibold mb-1">
                الرقم الوطني للمتوفى * (11 رقماً)
              </label>
              <div className="relative max-w-md">
                <input
                  type="text"
                  required
                  maxLength={11}
                  placeholder="أدخل الرقم الوطني للمتوفى (11 رقماً)..."
                  value={deathForm.deceasedNationalId}
                  onChange={(e) => handleLookupDeceased(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:border-rose-500"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
              </div>
              {deceasedName && (
                <div className="mt-2 text-xs text-rose-300 flex items-center gap-1.5 font-semibold">
                  <UserCheck className="w-4 h-4 text-rose-400" />
                  <span>اسم المتوفى المسجل: {deceasedName}</span>
                </div>
              )}
            </div>

            {/* Death Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">تاريخ ووقت الوفاة المعلن *</label>
                <input
                  type="datetime-local"
                  required
                  value={deathForm.deathDateTime}
                  onChange={(e) => setDeathForm({ ...deathForm, deathDateTime: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">القسم / الجناح بالمستشفى</label>
                <input
                  type="text"
                  value={deathForm.department}
                  onChange={(e) => setDeathForm({ ...deathForm, department: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">السبب المباشر للوفاة *</label>
              <input
                type="text"
                required
                placeholder="السبب السريري المباشر بحسب التقرير الطبي..."
                value={deathForm.causeOfDeath}
                onChange={(e) => setDeathForm({ ...deathForm, causeOfDeath: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">الطبيب المعتمد لشهادة الوفاة</label>
                <input
                  type="text"
                  value={deathForm.certifyingDoctor}
                  onChange={(e) => setDeathForm({ ...deathForm, certifyingDoctor: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">المستشفى</label>
                <input
                  type="text"
                  value={deathForm.hospitalName}
                  readOnly
                  className="w-full px-3 py-2.5 bg-slate-950/50 border border-slate-800 rounded-xl text-slate-400 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">المحافظة</label>
                <input
                  type="text"
                  value={deathForm.governorate}
                  onChange={(e) => setDeathForm({ ...deathForm, governorate: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">ملاحظات وتفاصيل التقرير الطبي</label>
              <textarea
                rows={2}
                value={deathForm.notes}
                onChange={(e) => setDeathForm({ ...deathForm, notes: e.target.value })}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex items-center justify-between gap-3 pt-4 border-t border-slate-800">
              <p className="text-slate-500 text-xs">
                ⚠️ سيتم إرسال هذا الطلب إلى الأحوال المدنية — لن تُوقَف الخدمات تلقائياً
              </p>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-rose-700 hover:bg-rose-600 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-rose-950/40 transition text-xs"
              >
                <Send className="w-4 h-4" />
                <span>{isSubmitting ? "جاري الإرسال..." : "إرسال طلب الوفاة للأحوال المدنية"}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════
          TAB 3: Sent Requests Tracking
      ═══════════════════════════════════════════════════════ */}
      {activeTab === "requests" && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-bold text-base flex items-center gap-2">
              <ClipboardList className="w-4 h-4 text-cyan-400" />
              الطلبات المُرسلة للأحوال المدنية
            </h3>
            <button
              onClick={loadSentRequests}
              className="flex items-center gap-1 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              تحديث
            </button>
          </div>

          {loadingRequests ? (
            <div className="py-12 flex justify-center items-center gap-3">
              <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
              <span className="text-slate-400 text-sm">جاري تحميل الطلبات...</span>
            </div>
          ) : sentRequests.length === 0 ? (
            <div className="py-16 text-center">
              <FileText className="w-12 h-12 text-slate-700 mx-auto mb-3" />
              <p className="text-slate-400 text-sm font-medium">لا توجد طلبات مُرسلة حتى الآن</p>
              <p className="text-slate-600 text-xs mt-1">قم بإرسال طلب ولادة أو وفاة من التبويبات أعلاه</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
                  <tr>
                    <th className="p-3">رقم الطلب</th>
                    <th className="p-3">نوع الطلب</th>
                    <th className="p-3">الرقم الوطني</th>
                    <th className="p-3">تاريخ الإرسال</th>
                    <th className="p-3">حالة الطلب</th>
                    <th className="p-3">سبب الرفض</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {sentRequests.map((req) => {
                    let parsed: any = {};
                    try { parsed = req.requestDataJson ? JSON.parse(req.requestDataJson as unknown as string) : {}; } catch {}
                    const reqType = parsed.requestType;
                    return (
                      <tr key={req.id} className="hover:bg-slate-800/40 transition">
                        <td className="p-3 font-mono text-cyan-400 font-semibold">{req.requestNumber}</td>
                        <td className="p-3">
                          {reqType === "BirthNotification" ? (
                            <span className="px-2 py-1 rounded-lg text-[11px] font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/60">
                              👶 طلب ولادة
                            </span>
                          ) : reqType === "DeathNotification" ? (
                            <span className="px-2 py-1 rounded-lg text-[11px] font-bold bg-rose-950 text-rose-300 border border-rose-800/60">
                              📜 طلب وفاة
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-lg text-[11px] font-bold bg-slate-800 text-slate-300">
                              {req.serviceTypeName || "طلب"}
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-mono text-slate-300">{req.nationalNumber}</td>
                        <td className="p-3 font-mono text-slate-400">
                          {new Date(req.submissionDate || req.createdAt).toLocaleDateString("ar-YE")}
                        </td>
                        <td className="p-3">{getStatusBadge(req.status)}</td>
                        <td className="p-3 text-rose-400 text-[11px]">
                          {req.rejectionReason || "—"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
