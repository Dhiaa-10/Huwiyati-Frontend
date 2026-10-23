"use client";

import React, { useState, useEffect } from "react";
import { hospitalService, ServiceUnavailableError } from "@/lib/api/hospitalService";
import { useAuth } from "@/context/AuthContext";
import {
  MedicalRecord,
  MedicalDiagnosis,
  MedicalOperation,
  ChronicDisease,
  AddDiagnosisDto,
  AddOperationDto,
  AddChronicDiseaseDto,
} from "@/types/hospitals";
import {
  Search,
  User,
  Activity,
  Heart,
  Shield,
  AlertTriangle,
  Plus,
  Eye,
  EyeOff,
  CheckCircle2,
  Phone,
  Calendar,
  FileText,
  Printer,
  Crosshair,
  Clock,
  X,
  Check,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { useNotification } from "@/context/NotificationContext";

export default function MedicalRecordsPage() {
  const { user } = useAuth();
  const { toast } = useNotification();
  const [searchQuery, setSearchQuery] = useState("");
  const [allRecords, setAllRecords] = useState<MedicalRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isServiceUnavailable, setIsServiceUnavailable] = useState(false);
  const [activeTab, setActiveTab] = useState<"diagnoses" | "operations" | "chronic">("diagnoses");
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);

  // Modals
  const [showAddDiagnosisModal, setShowAddDiagnosisModal] = useState(false);
  const [showAddOperationModal, setShowAddOperationModal] = useState(false);
  const [showAddChronicModal, setShowAddChronicModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Form states — dynamically filled from user session
  const [diagnosisForm, setDiagnosisForm] = useState<AddDiagnosisDto>({
    diagnosisName: "",
    doctorName: user.fullName || "",
    hospitalName: user.branchName || "",
    icdCode: "",
    description: "",
    treatmentPlan: "",
    status: "Active",
  });

  const [operationForm, setOperationForm] = useState<AddOperationDto>({
    operationName: "",
    surgeonName: user.fullName || "",
    hospitalName: user.branchName || "",
    operationDate: new Date().toISOString().split("T")[0],
    anesthesiaType: "تخدير كلي",
    complications: "لا توجد مضاعفات بحمد الله",
    notes: "تمت العملية بنجاح والمريض في قسم الرقابة السريرية",
  });

  const [chronicForm, setChronicForm] = useState<AddChronicDiseaseDto>({
    diseaseName: "",
    diagnosedDate: new Date().toISOString().split("T")[0],
    treatingDoctor: user.fullName || "",
    medications: [],
    severity: "Moderate",
    status: "Active",
  });
  const [medicationsInput, setMedicationsInput] = useState("");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    if (type === "success") {
      toast.success(message);
      setModalError(null);
    } else {
      toast.error(message);
      setModalError(message);
    }
  };

  const loadRecords = async () => {
    try {
      setIsLoading(true);
      const data = await hospitalService.getMedicalRecords();
      setAllRecords(data);
      if (data.length > 0 && !selectedRecord) {
        setSelectedRecord(data[0]);
      }
    } catch (err) {
      if (err instanceof ServiceUnavailableError) {
        setIsServiceUnavailable(true);
      } else {
        console.error(err);
        showToast("حدث خطأ أثناء تحميل السجلات الطبية", "error");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      loadRecords();
      return;
    }
    try {
      const rec = await hospitalService.getMedicalRecordByNationalNumber(searchQuery.trim());
      if (rec) {
        setSelectedRecord(rec);
        showToast(`تم العثور على الملف الطبي للمواطن: ${rec.patientFullName}`);
      } else {
        showToast("لم يتم العثور على سجل طبي بهذا الرقم الوطني", "error");
      }
    } catch (err) {
      if (err instanceof ServiceUnavailableError) {
        setIsServiceUnavailable(true);
        showToast("الخدمة غير متوفرة من الخادم حالياً", "error");
      } else {
        showToast("خطأ أثناء البحث", "error");
      }
    }
  };

  const handleToggleVisibility = async () => {
    if (!selectedRecord) return;
    try {
      const updated = await hospitalService.toggleRecordVisibility({
        recordId: selectedRecord.id,
        isVisible: !selectedRecord.isVisibleToPerson,
      });
      setSelectedRecord(updated);
      showToast(
        updated.isVisibleToPerson
          ? "تم فتح إتاحة السجل للمواطن عبر تطبيق هويتي بنجاح"
          : "تم حظر إتاحة السجل الطبي عن المواطن (سري للمستشفيات فقط)"
      );
      setAllRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    } catch {
      showToast("فشل تحديث خصوصية السجل", "error");
    }
  };

  const handleAddDiagnosis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord || !diagnosisForm.diagnosisName.trim()) return;
    try {
      const updated = await hospitalService.addDiagnosis({
        ...diagnosisForm,
        patientNationalNumber: selectedRecord.patientNationalNumber,
      });
      setSelectedRecord(updated);
      setAllRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setShowAddDiagnosisModal(false);
      setDiagnosisForm({
        diagnosisName: "",
        doctorName: "د. عبدالحكيم السقاف",
        hospitalName: "مستشفى الثورة العام - صنعاء",
        icdCode: "",
        description: "",
        treatmentPlan: "",
        status: "Active",
      });
      showToast("تم توثيق التشخيص السريري وإضافته للسجل الطبي الموحد بنجاح");
    } catch {
      showToast("فشل إضافة التشخيص الطبي", "error");
    }
  };

  const handleAddOperation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord || !operationForm.operationName.trim()) return;
    try {
      const updated = await hospitalService.addOperation({
        ...operationForm,
        patientNationalNumber: selectedRecord.patientNationalNumber,
      });
      setSelectedRecord(updated);
      setAllRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setShowAddOperationModal(false);
      setOperationForm({
        operationName: "",
        surgeonName: "د. هاني الأصبحي",
        hospitalName: "مستشفى الثورة العام - صنعاء",
        operationDate: new Date().toISOString().split("T")[0],
        anesthesiaType: "تخدير كلي",
        complications: "لا توجد مضاعفات بحمد الله",
        notes: "تمت العملية بنجاح والمريض في قسم الرقابة السريرية",
      });
      showToast("تم توثيق العملية الجراحية وإرفاقها بملف المريض بنجاح");
    } catch {
      showToast("فشل إضافة العملية الجراحية", "error");
    }
  };

  const handleAddChronic = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecord || !chronicForm.diseaseName.trim()) return;
    try {
      const meds = medicationsInput
        .split(",")
        .map((m) => m.trim())
        .filter((m) => m.length > 0);
      const payload: AddChronicDiseaseDto = {
        ...chronicForm,
        patientNationalNumber: selectedRecord.patientNationalNumber,
        medications: meds.length > 0 ? meds : ["حسب الوصفة المعتمدة"],
      };
      const updated = await hospitalService.addChronicDisease(payload);
      setSelectedRecord(updated);
      setAllRecords((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
      setShowAddChronicModal(false);
      setChronicForm({
        diseaseName: "",
        diagnosedDate: new Date().toISOString().split("T")[0],
        treatingDoctor: "د. عفاف حميد",
        medications: [],
        severity: "Moderate",
        status: "Active",
      });
      setMedicationsInput("");
      showToast("تم قيد المرض المزمن والبروتوكول العلاجي بنجاح");
    } catch {
      showToast("فشل قيد المرض المزمن", "error");
    }
  };

  const patientName = selectedRecord ? (selectedRecord.patientFullName || (selectedRecord as any).citizenName || "مواطن يمني") : "";
  const patientNid = selectedRecord ? (selectedRecord.patientNationalNumber || (selectedRecord as any).nationalNumber || "") : "";

  return (
    <div className="space-y-6">


      {/* Top Banner & Search - Hwyati Sovereign Petrol Banner */}
      <div className="bg-gradient-to-l from-[#052F31] via-[#0C4A4E] to-[#103F43] rounded-2xl p-6 text-white shadow-md relative overflow-hidden border border-[#147A77]/30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#147A77]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 text-emerald-300 text-xs font-bold">
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>المنظومة الوطنية الموحدة للسجلات الصحية الإلكترونية (EHR)</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">ملف السجل الطبي الموحد للمواطن</h1>
            <p className="text-slate-200 text-xs md:text-sm mt-1">
              ربط مركزي يتيح للأطباء المصرح لهم مراجعة التاريخ السريري، فصائل الدم، الحساسيات، والعمليات السابقة
            </p>
          </div>

          {/* Quick Search Form */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
              <input
                type="text"
                placeholder="ابحث بالرقم الوطني أو اسم المريض..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-10 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-xs placeholder:text-slate-300 focus:outline-none focus:border-white/50 focus:bg-white/15 transition"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-[#147A77] hover:bg-[#0E5C59] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
            >
              <span>بحث</span>
            </button>
          </form>
        </div>

        {/* Quick Patient Switcher Pills */}
        <div className="mt-5 pt-4 border-t border-white/15 flex items-center gap-2 overflow-x-auto text-xs pb-1">
          <span className="text-slate-200 font-bold shrink-0 flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-emerald-300" />
            سجلات للمعاينة السريعة:
          </span>
          {allRecords.map((rec) => {
            const name = rec.patientFullName || (rec as any).citizenName;
            return (
              <button
                key={rec.id}
                onClick={() => setSelectedRecord(rec)}
                className={`px-3 py-1.5 rounded-xl border transition shrink-0 flex items-center gap-1.5 cursor-pointer text-xs font-bold ${
                  selectedRecord?.id === rec.id
                    ? "bg-white text-[#052F31] border-white shadow-xs"
                    : "bg-white/10 text-white/90 border-white/15 hover:bg-white/20"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-400" />
                <span>{name}</span>
                <span className="opacity-80 font-mono" dir="ltr">({rec.bloodGroup})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Service Unavailable Banner */}
      {isServiceUnavailable && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-amber-900 shadow-xs flex items-start gap-4">
          <div className="p-2.5 bg-amber-100 rounded-xl text-amber-700 shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-amber-900">الخدمة غير متوفرة من الخادم حالياً</h3>
            <p className="text-xs text-amber-800/90 mt-1 leading-relaxed">
              واجهات برمجة التطبيقات (API Endpoints) الخاصة بالسجلات الطبية الإلكترونية (EHR) والتشخيصات السريرية قيد التطوير في الخادم الخلفي. 
              تم تعطيل البيانات الوهمية (Mock Data) استجابة للتحديث المباشر للمنظومة.
            </p>
          </div>
        </div>
      )}

      {/* Main Patient Content Area */}
      {selectedRecord ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left/Sidebar: Patient Vital Profile & Emergency Sheet */}
          <div className="lg:col-span-1 space-y-5">
            {/* Main Vital Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs relative overflow-hidden">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
                <div className="w-14 h-14 rounded-2xl bg-[#E6F1EE]/40 text-[#0C4A4E] border border-[#0C4A4E]/20 flex items-center justify-center font-bold text-xl shadow-xs">
                  {patientName.slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <h3 className="text-[#052F31] font-extrabold text-base truncate">{patientName}</h3>
                  <div className="text-xs text-[#41484d] flex items-center gap-1 mt-0.5">
                    <Shield className="w-3 h-3 text-[#0C4A4E]" />
                    <span className="font-mono tracking-wider">{patientNid}</span>
                  </div>
                </div>
              </div>

              {/* Blood Group & Primary Lifesaving Metric */}
              <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between">
                <div>
                  <div className="text-xs text-rose-700 font-bold flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-rose-600" />
                    فصيلة الدم المعتمدة
                  </div>
                  <div className="text-2xl font-black text-rose-950 font-mono mt-0.5" dir="ltr">
                    {selectedRecord.bloodGroup}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-rose-100 border border-rose-200 flex items-center justify-center text-rose-700 text-xl font-bold shadow-xs">
                  🩸
                </div>
              </div>

              {/* Allergies */}
              <div className="mt-4">
                <div className="text-xs font-bold text-amber-800 flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                  <span>الحساسيات المعروفة والموانع:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedRecord.allergies || []).length > 0 ? (
                    selectedRecord.allergies!.map((allergy, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-xs font-semibold"
                      >
                        ⚠️ {allergy}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-500">لا توجد حساسيات مسجلة</span>
                  )}
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="mt-4 pt-4 border-t border-slate-100 text-xs space-y-2">
                <div className="text-slate-500 font-semibold">جهة الاتصال في الطوارئ:</div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="text-[#052F31] font-bold">{selectedRecord.emergencyContactName || "غير محدد"}</div>
                  <div className="text-[#0C4A4E] font-mono flex items-center gap-1 font-bold">
                    <Phone className="w-3 h-3" />
                    <span>{selectedRecord.emergencyContactPhone || "غير مسجل"}</span>
                  </div>
                </div>
              </div>

              {/* Citizen Visibility Toggle Switch */}
              <div className="mt-5 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-700">ظهور السجل للمواطن:</span>
                  <span
                    className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                      selectedRecord.isVisibleToPerson
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    {selectedRecord.isVisibleToPerson ? "متاح في هويتي" : "سري / محجوب"}
                  </span>
                </div>
                <p className="text-[11px] text-[#41484d] mb-3 leading-relaxed">
                  يتيح هذا الخيار للمواطن مراجعة هذا السجل والتقارير الطبية في تطبيقه الشخصي.
                </p>
                <button
                  onClick={handleToggleVisibility}
                  className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 border cursor-pointer ${
                    selectedRecord.isVisibleToPerson
                      ? "bg-slate-50 hover:bg-slate-100 text-amber-700 border-amber-200"
                      : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200"
                  }`}
                >
                  {selectedRecord.isVisibleToPerson ? (
                    <>
                      <EyeOff className="w-4 h-4 text-amber-600" />
                      <span>حظر العرض عن المواطن</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 text-emerald-600" />
                      <span>إتاحة السجل للمواطن في تطبيقه</span>
                    </>
                  )}
                </button>
              </div>

              {/* Print / Report button */}
              <div className="mt-3">
                <button
                  onClick={() => setShowPrintModal(true)}
                  className="w-full py-2.5 px-3 bg-slate-50 hover:bg-slate-100 text-[#052F31] border border-slate-200 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                >
                  <Printer className="w-4 h-4 text-[#0C4A4E]" />
                  <span>طباعة تقرير طبي معتمد</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right/Main: Clinical Diagnoses, Operations & Chronic Conditions */}
          <div className="lg:col-span-3 space-y-4">
            {/* Tabs Header */}
            <div className="bg-white border border-slate-200 rounded-2xl p-2 flex items-center justify-between gap-2 flex-wrap shadow-xs">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("diagnoses")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    activeTab === "diagnoses"
                      ? "bg-[#052F31] text-white shadow-xs"
                      : "text-slate-600 hover:text-[#052F31] hover:bg-slate-100"
                  }`}
                >
                  <Activity className="w-4 h-4 text-emerald-400" />
                  <span>التشخيصات والزيارات ({selectedRecord.diagnoses.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab("operations")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    activeTab === "operations"
                      ? "bg-[#052F31] text-white shadow-xs"
                      : "text-slate-600 hover:text-[#052F31] hover:bg-slate-100"
                  }`}
                >
                  <Crosshair className="w-4 h-4 text-rose-400" />
                  <span>العمليات الجراحية ({selectedRecord.operations.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab("chronic")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                    activeTab === "chronic"
                      ? "bg-[#052F31] text-white shadow-xs"
                      : "text-slate-600 hover:text-[#052F31] hover:bg-slate-100"
                  }`}
                >
                  <Heart className="w-4 h-4 text-amber-400" />
                  <span>الأمراض المزمنة ({selectedRecord.chronicDiseases.length})</span>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {activeTab === "diagnoses" && (
                  <button
                    onClick={() => setShowAddDiagnosisModal(true)}
                    className="px-3.5 py-2 bg-[#0C4A4E] hover:bg-[#052F31] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة تشخيص طبي</span>
                  </button>
                )}
                {activeTab === "operations" && (
                  <button
                    onClick={() => setShowAddOperationModal(true)}
                    className="px-3.5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>تسجيل عملية جراحية</span>
                  </button>
                )}
                {activeTab === "chronic" && (
                  <button
                    onClick={() => setShowAddChronicModal(true)}
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>قيد مرض مزمن</span>
                  </button>
                )}
              </div>
            </div>

            {/* TAB 1: Diagnoses List */}
            {activeTab === "diagnoses" && (
              <div className="space-y-3">
                {selectedRecord.diagnoses.length > 0 ? (
                  selectedRecord.diagnoses.map((diag) => (
                    <div
                      key={diag.id}
                      className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-[#0C4A4E]/40 transition space-y-3 shadow-xs"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-[#E6F1EE]/40 text-[#0C4A4E] flex items-center justify-center font-bold">
                            <Activity className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-[#052F31] font-bold text-sm flex items-center gap-2">
                              {diag.diagnosisName || (diag as any).conditionName}
                              {diag.icdCode && (
                                <span className="text-[11px] font-mono px-2 py-0.5 bg-slate-100 text-[#052F31] rounded border border-slate-200 font-bold">
                                  ICD-10: {diag.icdCode}
                                </span>
                              )}
                            </h4>
                            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                              <span>المستشفى: {diag.hospitalName || selectedRecord.hospitalName}</span>
                              <span>•</span>
                              <span>الطبيب: {diag.doctorName}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                              diag.status === "Active"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : diag.status === "Resolved"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                : "bg-sky-50 text-sky-700 border border-sky-200"
                            }`}
                          >
                            {diag.status === "Active"
                              ? "نشط / قيد العلاج"
                              : diag.status === "Resolved"
                              ? "تم الشفاء"
                              : "تحت الملاحظة"}
                          </span>
                          <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {diag.diagnosedAt || (diag as any).diagnosisDate}
                          </span>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
                        <div>
                          <span className="text-slate-500 font-bold">التفاصيل السريرية: </span>
                          <span className="text-slate-800">{diag.description}</span>
                        </div>
                        {diag.treatmentPlan && (
                          <div className="pt-2 border-t border-slate-200">
                            <span className="text-[#052F31] font-bold">الخطة العلاجية والدوائية: </span>
                            <span className="text-slate-700">{diag.treatmentPlan}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 shadow-xs">
                    <Activity className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                    <p className="text-sm font-semibold">لا توجد تشخيصات مسجلة لهذا المريض حتى الآن.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Surgical Operations List */}
            {activeTab === "operations" && (
              <div className="space-y-3">
                {selectedRecord.operations.length > 0 ? (
                  selectedRecord.operations.map((op) => (
                    <div
                      key={op.id}
                      className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-rose-300 transition space-y-3 shadow-xs"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center font-bold">
                            <Crosshair className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-[#052F31] font-bold text-sm">{op.operationName}</h4>
                            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                              <span>المستشفى: {op.hospitalName}</span>
                              <span>•</span>
                              <span>الجراح المشرف: {op.surgeonName}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200 font-bold">
                            {op.anesthesiaType || "تخدير جراحي"}
                          </span>
                          <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {op.operationDate}
                          </span>
                        </div>
                      </div>

                      <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
                        {op.complications && (
                          <div>
                            <span className="text-slate-500 font-bold">المضاعفات / الملاحظات الجراحية: </span>
                            <span className="text-slate-800">{op.complications}</span>
                          </div>
                        )}
                        {op.notes && (
                          <div className="pt-2 border-t border-slate-200">
                            <span className="text-rose-700 font-bold">ملاحظات ما بعد الجراحة: </span>
                            <span className="text-slate-700">{op.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 shadow-xs">
                    <Crosshair className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                    <p className="text-sm font-semibold">لا توجد عمليات جراحية مسجلة لهذا المريض.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: Chronic Diseases List */}
            {activeTab === "chronic" && (
              <div className="space-y-3">
                {selectedRecord.chronicDiseases.length > 0 ? (
                  selectedRecord.chronicDiseases.map((cd) => (
                    <div
                      key={cd.id}
                      className="bg-white border border-slate-200 rounded-2xl p-5 hover:border-amber-300 transition space-y-3 shadow-xs"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
                            <Heart className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-[#052F31] font-bold text-sm">{cd.diseaseName}</h4>
                            <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                              <span>تاريخ التشخيص: {cd.diagnosedDate}</span>
                              {cd.treatingDoctor && (
                                <>
                                  <span>•</span>
                                  <span>الطبيب المتابع: {cd.treatingDoctor}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {cd.severity && (
                            <span
                              className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                                cd.severity === "Severe"
                                  ? "bg-rose-50 text-rose-700 border-rose-200"
                                  : cd.severity === "Moderate"
                                  ? "bg-amber-50 text-amber-700 border-amber-200"
                                  : "bg-blue-50 text-blue-700 border-blue-200"
                              }`}
                            >
                              درجة المرض: {cd.severity === "Severe" ? "شديد" : cd.severity === "Moderate" ? "متوسط" : "خفيف"}
                            </span>
                          )}
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-bold border ${
                              cd.status === "Active"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            }`}
                          >
                            {cd.status === "Active" ? "نشط" : "مستقر / تحت السيطرة"}
                          </span>
                        </div>
                      </div>

                      {cd.medications && cd.medications.length > 0 && (
                        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2 text-xs">
                          <span className="text-amber-800 font-bold">الأدوية المداومة والجرعات:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {cd.medications.map((med, i) => (
                              <span
                                key={i}
                                className="px-2.5 py-1 bg-white text-slate-700 border border-slate-200 rounded-lg text-xs font-medium shadow-2xs"
                              >
                                💊 {med}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-500 shadow-xs">
                    <Heart className="w-8 h-8 mx-auto mb-2 text-slate-400" />
                    <p className="text-sm font-semibold">لا توجد أمراض مزمنة مسجلة لهذا المريض.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center text-slate-500 shadow-xs">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center gap-3">
              <Loader2 className="w-10 h-10 animate-spin text-[#0C4A4E]" />
              <p className="text-xs text-slate-500">جاري الاستعلام من الخادم...</p>
            </div>
          ) : isServiceUnavailable ? (
            <div className="flex flex-col items-center justify-center gap-2">
              <AlertCircle className="w-12 h-12 text-amber-600 mb-2" />
              <h3 className="text-[#052F31] text-base font-bold">الخدمة غير متوفرة من الخادم حالياً</h3>
              <p className="text-xs text-[#41484d] max-w-md">
                خدمة استعراض وإدارة السجلات الطبية الموحدة (EHR) قيد البناء في الخادم الخلفي. تم إيقاف البيانات التجريبية لعرض الحالة الفعلية للربط.
              </p>
            </div>
          ) : (
            <div>
              <AlertCircle className="w-12 h-12 mx-auto mb-3 text-[#0C4A4E]" />
              <h3 className="text-[#052F31] text-base font-bold">لا يوجد مريض محدد</h3>
              <p className="text-xs text-[#41484d] mt-1">يرجى البحث بالرقم الوطني للمريض (11 رقماً) لاستعراض السجل الطبي.</p>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: Add Diagnosis */}
      {showAddDiagnosisModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden text-xs">
            <div className="bg-[#052F31] text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-300" />
                <span>إضافة تشخيص سريري جديد</span>
              </h3>
              <button
                onClick={() => setShowAddDiagnosisModal(false)}
                className="text-white/70 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddDiagnosis} className="p-6 space-y-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">اسم الحالة المرضية / التشخيص *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: التهاب الشعب الهوائية الحاد"
                  value={diagnosisForm.diagnosisName}
                  onChange={(e) => setDiagnosisForm({ ...diagnosisForm, diagnosisName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-[#0C4A4E] focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">رمز التصنيف الدولي (ICD-10)</label>
                  <input
                    type="text"
                    placeholder="مثال: J20.9"
                    value={diagnosisForm.icdCode || ""}
                    onChange={(e) => setDiagnosisForm({ ...diagnosisForm, icdCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-[#0C4A4E] focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">الحالة السريرية</label>
                  <select
                    value={diagnosisForm.status}
                    onChange={(e) =>
                      setDiagnosisForm({
                        ...diagnosisForm,
                        status: e.target.value as "Active" | "Resolved" | "UnderObservation",
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-[#0C4A4E] focus:outline-none"
                  >
                    <option value="Active">نشط / قيد العلاج</option>
                    <option value="UnderObservation">تحت الملاحظة</option>
                    <option value="Resolved">تم الشفاء</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">الطبيب المشرف</label>
                  <input
                    type="text"
                    value={diagnosisForm.doctorName}
                    onChange={(e) => setDiagnosisForm({ ...diagnosisForm, doctorName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-[#0C4A4E] focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">المستشفى / المنشأة</label>
                  <input
                    type="text"
                    value={diagnosisForm.hospitalName}
                    onChange={(e) => setDiagnosisForm({ ...diagnosisForm, hospitalName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-[#0C4A4E] focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">الوصف السريري والأعراض *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="وصف الأعراض، الفحص السريري، نتائج الفحوصات الأولية..."
                  value={diagnosisForm.description}
                  onChange={(e) => setDiagnosisForm({ ...diagnosisForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-[#0C4A4E] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">الخطة العلاجية والوصفة الطبية</label>
                <textarea
                  rows={2}
                  placeholder="الأدوية، الجرعات، التوصيات الطبية والمتابعة..."
                  value={diagnosisForm.treatmentPlan || ""}
                  onChange={(e) => setDiagnosisForm({ ...diagnosisForm, treatmentPlan: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-[#0C4A4E] focus:outline-none"
                />
              </div>

              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-800 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-medium">{modalError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddDiagnosisModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#0C4A4E] hover:bg-[#052F31] text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>حفظ وإدراج في السجل</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Add Operation */}
      {showAddOperationModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden text-xs">
            <div className="bg-[#052F31] text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Crosshair className="w-5 h-5 text-rose-300" />
                <span>تسجيل عملية جراحية أو تداخل طبي</span>
              </h3>
              <button
                onClick={() => setShowAddOperationModal(false)}
                className="text-white/70 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddOperation} className="p-6 space-y-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">اسم العملية الجراحية *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: استئصال الزائدة الدودية بالمنظار"
                  value={operationForm.operationName}
                  onChange={(e) => setOperationForm({ ...operationForm, operationName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">الجراح المسؤول *</label>
                  <input
                    type="text"
                    required
                    value={operationForm.surgeonName}
                    onChange={(e) => setOperationForm({ ...operationForm, surgeonName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">نوع التخدير</label>
                  <select
                    value={operationForm.anesthesiaType}
                    onChange={(e) => setOperationForm({ ...operationForm, anesthesiaType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  >
                    <option value="تخدير كلي">تخدير كلي (General)</option>
                    <option value="تخدير نصفي (Spinal)">تخدير نصفي (Spinal)</option>
                    <option value="تخدير موضعي (Local)">تخدير موضعي (Local)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">تاريخ إجراء العملية</label>
                  <input
                    type="date"
                    value={operationForm.operationDate}
                    onChange={(e) => setOperationForm({ ...operationForm, operationDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">المستشفى</label>
                  <input
                    type="text"
                    value={operationForm.hospitalName}
                    onChange={(e) => setOperationForm({ ...operationForm, hospitalName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">المضاعفات الملحوظة (إن وجدت)</label>
                <input
                  type="text"
                  placeholder="لا توجد مضاعفات بحمد الله"
                  value={operationForm.complications || ""}
                  onChange={(e) => setOperationForm({ ...operationForm, complications: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">تقرير العملية وملاحظات النقاهة</label>
                <textarea
                  rows={2}
                  placeholder="ملاحظات بعد التدخل الجراحي..."
                  value={operationForm.notes || ""}
                  onChange={(e) => setOperationForm({ ...operationForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-800 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-medium">{modalError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddOperationModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>توثيق العملية في السجل</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: Add Chronic Disease */}
      {showAddChronicModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden text-xs">
            <div className="bg-[#052F31] text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Heart className="w-5 h-5 text-amber-300" />
                <span>قيد مرض مزمن ومتابعة علاجية</span>
              </h3>
              <button
                onClick={() => setShowAddChronicModal(false)}
                className="text-white/70 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddChronic} className="p-6 space-y-4">
              <div>
                <label className="block text-slate-700 font-bold mb-1">اسم المرض المزمن *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: ارتفاع ضغط الدم الأساسي (Hypertension)"
                  value={chronicForm.diseaseName}
                  onChange={(e) => setChronicForm({ ...chronicForm, diseaseName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">شدة المرض</label>
                  <select
                    value={chronicForm.severity}
                    onChange={(e) =>
                      setChronicForm({
                        ...chronicForm,
                        severity: e.target.value as "Mild" | "Moderate" | "Severe",
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Mild">خفيف (Mild)</option>
                    <option value="Moderate">متوسط (Moderate)</option>
                    <option value="Severe">شديد (Severe)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-700 font-bold mb-1">حالة المرض الحالية</label>
                  <select
                    value={chronicForm.status}
                    onChange={(e) =>
                      setChronicForm({
                        ...chronicForm,
                        status: e.target.value as "Active" | "Managed" | "Controlled",
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                  >
                    <option value="Active">نشط</option>
                    <option value="Controlled">مستقر / تحت السيطرة</option>
                    <option value="Managed">قيد الإدارة السريرية</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">الطبيب المتابع</label>
                <input
                  type="text"
                  value={chronicForm.treatingDoctor || ""}
                  onChange={(e) => setChronicForm({ ...chronicForm, treatingDoctor: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">الأدوية المداومة (مفصولة بفاصلة)</label>
                <input
                  type="text"
                  placeholder="مثال: أملوديبين 5 ملجم، كونكور 2.5 ملجم"
                  value={medicationsInput}
                  onChange={(e) => setMedicationsInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-800 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-medium">{modalError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddChronicModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>حفظ وتثبيت في السجل</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: Official Medical Summary Certificate Print / Preview */}
      {showPrintModal && selectedRecord && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="bg-[#052F31] text-white p-5 flex items-center justify-between shrink-0">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Printer className="w-4 h-4 text-emerald-300" />
                <span>معاينة تقرير السجل الطبي الإلكتروني المعتمد</span>
              </h3>
              <button
                onClick={() => setShowPrintModal(false)}
                className="text-white/70 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Official Report Mock Canvas */}
            <div className="p-6 overflow-y-auto space-y-4 text-xs text-slate-800">
              <div className="flex items-center justify-between border-b-2 border-[#052F31] pb-3">
                <div className="text-right">
                  <div className="font-bold text-sm text-[#052F31]">الجمهورية اليمنية</div>
                  <div className="text-[11px] text-slate-500">وزارة الصحة العامة والسكان</div>
                  <div className="text-[11px] text-slate-500">المنظومة الوطنية الموحدة (هويتي)</div>
                </div>
                <div className="text-center font-bold text-base text-[#052F31]">
                  تقرير الحالة والسجل الطبي الإلكتروني الموحد
                </div>
                <div className="text-left text-[11px] text-slate-500 font-mono">
                  <div>تاريخ الإصدار: {new Date().toLocaleDateString("ar-YE")}</div>
                  <div>رقم الوثيقة: MED-{patientNid.slice(-6)}</div>
                </div>
              </div>

              {/* Patient Basic Data */}
              <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500">اسم المريض: </span>
                  <span className="font-bold text-[#052F31]">{patientName}</span>
                </div>
                <div>
                  <span className="text-slate-500">الرقم الوطني: </span>
                  <span className="font-mono font-bold text-[#052F31]">{patientNid}</span>
                </div>
                <div>
                  <span className="text-slate-500">فصيلة الدم: </span>
                  <span className="font-mono font-bold text-rose-700" dir="ltr">{selectedRecord.bloodGroup}</span>
                </div>
              </div>

              {/* Allergies & Alerts */}
              <div>
                <h5 className="font-bold text-[#052F31] border-b border-slate-200 pb-1 mb-1">الحساسيات وموانع الأدوية:</h5>
                <p className="text-slate-700">
                  {(selectedRecord.allergies || []).length > 0
                    ? selectedRecord.allergies!.join("، ")
                    : "لا توجد حساسيات مسجلة بحسب الفحوصات المتوفرة."}
                </p>
              </div>

              {/* Diagnoses Summary */}
              <div>
                <h5 className="font-bold text-[#052F31] border-b border-slate-200 pb-1 mb-1">أحدث التشخيصات السريرية:</h5>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  {selectedRecord.diagnoses.map((d, i) => (
                    <li key={i}>
                      <span className="font-semibold text-slate-900">{d.diagnosisName || (d as any).conditionName}</span> ({d.diagnosedAt || (d as any).diagnosisDate}) - المشرف: {d.doctorName}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Chronic Diseases */}
              {selectedRecord.chronicDiseases.length > 0 && (
                <div>
                  <h5 className="font-bold text-[#052F31] border-b border-slate-200 pb-1 mb-1">الأمراض المزمنة والأدوية المستمرة:</h5>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    {selectedRecord.chronicDiseases.map((c, i) => (
                      <li key={i}>
                        <span className="font-semibold text-slate-900">{c.diseaseName}</span> {c.medications && `- الأدوية: ${c.medications.join("، ")}`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Surgeries */}
              {selectedRecord.operations.length > 0 && (
                <div>
                  <h5 className="font-bold text-[#052F31] border-b border-slate-200 pb-1 mb-1">التدخلات الجراحية السابقة:</h5>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    {selectedRecord.operations.map((o, i) => (
                      <li key={i}>
                        <span className="font-semibold text-slate-900">{o.operationName}</span> ({o.operationDate}) - الجراح: {o.surgeonName}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-500">
                <span>وثيقة معتمدة وموقعة إلكترونياً من المركز الوطني للمعلومات الصحية</span>
                <span className="font-mono font-bold text-[#052F31]">VERIFIED BY HAWIYATI HEALTH NETWORK</span>
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-end gap-2 bg-slate-50">
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold cursor-pointer"
              >
                إغلاق
              </button>
              <button
                onClick={() => {
                  window.print();
                  setShowPrintModal(false);
                }}
                className="px-5 py-2 bg-[#0C4A4E] hover:bg-[#052F31] text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>إرسال لأمر الطباعة</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
