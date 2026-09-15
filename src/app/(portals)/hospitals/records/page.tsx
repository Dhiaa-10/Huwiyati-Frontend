"use client";

import React, { useState, useEffect } from "react";
import { hospitalService } from "@/lib/api/hospitalService";
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
} from "lucide-react";

export default function MedicalRecordsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [allRecords, setAllRecords] = useState<MedicalRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<MedicalRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"diagnoses" | "operations" | "chronic">("diagnoses");
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Modals
  const [showAddDiagnosisModal, setShowAddDiagnosisModal] = useState(false);
  const [showAddOperationModal, setShowAddOperationModal] = useState(false);
  const [showAddChronicModal, setShowAddChronicModal] = useState(false);
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Form states
  const [diagnosisForm, setDiagnosisForm] = useState<AddDiagnosisDto>({
    diagnosisName: "",
    doctorName: "د. عبدالحكيم السقاف",
    hospitalName: "مستشفى الثورة العام - صنعاء",
    icdCode: "",
    description: "",
    treatmentPlan: "",
    status: "Active",
  });

  const [operationForm, setOperationForm] = useState<AddOperationDto>({
    operationName: "",
    surgeonName: "د. هاني الأصبحي",
    hospitalName: "مستشفى الثورة العام - صنعاء",
    operationDate: new Date().toISOString().split("T")[0],
    anesthesiaType: "تخدير كلي",
    complications: "لا توجد مضاعفات بحمد الله",
    notes: "تمت العملية بنجاح والمريض في قسم الرقابة السريرية",
  });

  const [chronicForm, setChronicForm] = useState<AddChronicDiseaseDto>({
    diseaseName: "",
    diagnosedDate: new Date().toISOString().split("T")[0],
    treatingDoctor: "د. عفاف حميد",
    medications: [],
    severity: "Moderate",
    status: "Active",
  });
  const [medicationsInput, setMedicationsInput] = useState("");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
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
      console.error(err);
      showToast("حدث خطأ أثناء تحميل السجلات الطبية", "error");
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
        showToast(`تم العثور على الملف الطبي للمواطن: ${rec.patientFullName || (rec as any).citizenName}`);
      } else {
        showToast("لم يتم العثور على سجل طبي بهذا الرقم الوطني", "error");
      }
    } catch {
      showToast("خطأ أثناء البحث", "error");
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
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 border text-sm font-semibold transition-all ${
            notification.type === "success"
              ? "bg-emerald-900/90 text-emerald-100 border-emerald-500/40 backdrop-blur-md"
              : "bg-rose-900/90 text-rose-100 border-rose-500/40 backdrop-blur-md"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-rose-400" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Banner & Search */}
      <div className="bg-gradient-to-l from-[#00374e] to-[#044e6e] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2 text-cyan-300 text-sm font-medium">
              <Activity className="w-4 h-4" />
              <span>المنظومة الوطنية الموحدة للسجلات الصحية الإلكترونية (EHR)</span>
            </div>
            <h1 className="text-2xl font-bold">ملف السجل الطبي الموحد للمواطن</h1>
            <p className="text-slate-300 text-sm mt-1">
              ربط مركزي يتيح للأطباء المصرح لهم مراجعة التاريخ السريري، فصائل الدم، الحساسيات، والعمليات السابقة
            </p>
          </div>

          {/* Quick Search Form */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                placeholder="ابحث بالرقم الوطني أو اسم المريض..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-9 py-2.5 bg-slate-900/60 border border-slate-700/80 rounded-xl text-white text-sm placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-sm font-semibold transition flex items-center gap-1.5 shadow-md shadow-cyan-900/30 shrink-0"
            >
              <span>بحث</span>
            </button>
          </form>
        </div>

        {/* Quick Patient Switcher Pills */}
        <div className="mt-5 pt-4 border-t border-slate-700/50 flex items-center gap-2 overflow-x-auto text-xs pb-1">
          <span className="text-slate-400 font-medium shrink-0 flex items-center gap-1">
            <User className="w-3.5 h-3.5 text-cyan-400" />
            سجلات للمعاينة السريعة:
          </span>
          {allRecords.map((rec) => {
            const name = rec.patientFullName || (rec as any).citizenName;
            return (
              <button
                key={rec.id}
                onClick={() => setSelectedRecord(rec)}
                className={`px-3 py-1.5 rounded-lg border transition shrink-0 flex items-center gap-1.5 ${
                  selectedRecord?.id === rec.id
                    ? "bg-cyan-500 text-slate-950 font-bold border-cyan-400"
                    : "bg-slate-900/40 text-slate-300 border-slate-700 hover:bg-slate-800"
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-500" />
                <span>{name}</span>
                <span className="opacity-75 font-mono">({rec.bloodGroup})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Patient Content Area */}
      {selectedRecord ? (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left/Sidebar: Patient Vital Profile & Emergency Sheet */}
          <div className="lg:col-span-1 space-y-5">
            {/* Main Vital Card */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
              <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#00374e] to-cyan-700 border border-cyan-500/40 flex items-center justify-center text-cyan-200 font-bold text-xl shadow-inner">
                  {patientName.slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <h3 className="text-white font-bold text-base truncate">{patientName}</h3>
                  <div className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                    <Shield className="w-3 h-3 text-cyan-400" />
                    <span className="font-mono tracking-wider">{patientNid}</span>
                  </div>
                </div>
              </div>

              {/* Blood Group & Primary Lifesaving Metric */}
              <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-rose-950/60 to-slate-900 border border-rose-900/50 flex items-center justify-between">
                <div>
                  <div className="text-xs text-rose-300 font-medium flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-rose-400" />
                    فصيلة الدم المعتمدة
                  </div>
                  <div className="text-2xl font-black text-rose-400 font-mono mt-0.5">
                    {selectedRecord.bloodGroup}
                  </div>
                </div>
                <div className="w-12 h-12 rounded-xl bg-rose-900/40 border border-rose-700/50 flex items-center justify-center text-rose-400 text-xl font-bold shadow-lg">
                  🩸
                </div>
              </div>

              {/* Allergies */}
              <div className="mt-4">
                <div className="text-xs font-semibold text-amber-400 flex items-center gap-1.5 mb-2">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>الحساسيات المعروفة والموانع:</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(selectedRecord.allergies || []).length > 0 ? (
                    selectedRecord.allergies!.map((allergy, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-amber-950/40 text-amber-300 border border-amber-800/40 rounded-lg text-xs font-medium"
                      >
                        ⚠️ {allergy}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-slate-400">لا توجد حساسيات مسجلة</span>
                  )}
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="mt-4 pt-4 border-t border-slate-800 text-xs space-y-2">
                <div className="text-slate-400 font-medium">جهة الاتصال في الطوارئ:</div>
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                  <div className="text-slate-200 font-semibold">{selectedRecord.emergencyContactName || "غير محدد"}</div>
                  <div className="text-cyan-400 font-mono flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    <span>{selectedRecord.emergencyContactPhone || "غير مسجل"}</span>
                  </div>
                </div>
              </div>

              {/* Citizen Visibility Toggle Switch */}
              <div className="mt-5 pt-4 border-t border-slate-800">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-300">ظهور السجل للمواطن:</span>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      selectedRecord.isVisibleToPerson
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60"
                        : "bg-amber-950 text-amber-400 border border-amber-800/60"
                    }`}
                  >
                    {selectedRecord.isVisibleToPerson ? "متاح في هويتي" : "سري / محجوب"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mb-3 leading-relaxed">
                  يتيح هذا الخيار للمواطن مراجعة هذا السجل والتقارير الطبية في تطبيقه الشخصي.
                </p>
                <button
                  onClick={handleToggleVisibility}
                  className={`w-full py-2 px-3 rounded-xl font-semibold text-xs transition flex items-center justify-center gap-2 border ${
                    selectedRecord.isVisibleToPerson
                      ? "bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700"
                      : "bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 border-emerald-700/60"
                  }`}
                >
                  {selectedRecord.isVisibleToPerson ? (
                    <>
                      <EyeOff className="w-4 h-4 text-amber-400" />
                      <span>حظر العرض عن المواطن</span>
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4 text-emerald-400" />
                      <span>إتاحة السجل للمواطن في تطبيقه</span>
                    </>
                  )}
                </button>
              </div>

              {/* Print / Report button */}
              <div className="mt-3">
                <button
                  onClick={() => setShowPrintModal(true)}
                  className="w-full py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-semibold text-xs transition flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4 text-cyan-400" />
                  <span>طباعة تقرير طبي معتمد</span>
                </button>
              </div>
            </div>
          </div>

          {/* Right/Main: Clinical Diagnoses, Operations & Chronic Conditions */}
          <div className="lg:col-span-3 space-y-4">
            {/* Tabs Header */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-2 flex items-center justify-between gap-2 flex-wrap shadow-md">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab("diagnoses")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                    activeTab === "diagnoses"
                      ? "bg-[#00374e] text-white shadow-md border border-cyan-500/40"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>التشخيصات والزيارات ({selectedRecord.diagnoses.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab("operations")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                    activeTab === "operations"
                      ? "bg-[#00374e] text-white shadow-md border border-cyan-500/40"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Crosshair className="w-4 h-4 text-rose-400" />
                  <span>العمليات الجراحية ({selectedRecord.operations.length})</span>
                </button>

                <button
                  onClick={() => setActiveTab("chronic")}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                    activeTab === "chronic"
                      ? "bg-[#00374e] text-white shadow-md border border-cyan-500/40"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
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
                    className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>إضافة تشخيص طبي</span>
                  </button>
                )}
                {activeTab === "operations" && (
                  <button
                    onClick={() => setShowAddOperationModal(true)}
                    className="px-3.5 py-2 bg-rose-700 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span>تسجيل عملية جراحية</span>
                  </button>
                )}
                {activeTab === "chronic" && (
                  <button
                    onClick={() => setShowAddChronicModal(true)}
                    className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md transition"
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
                      className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition space-y-3 shadow-md"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400">
                            <Activity className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-white font-bold text-sm flex items-center gap-2">
                              {diag.diagnosisName || (diag as any).conditionName}
                              {diag.icdCode && (
                                <span className="text-[11px] font-mono px-2 py-0.5 bg-slate-800 text-cyan-300 rounded border border-slate-700">
                                  ICD-10: {diag.icdCode}
                                </span>
                              )}
                            </h4>
                            <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                              <span>المستشفى: {diag.hospitalName || selectedRecord.hospitalName}</span>
                              <span>•</span>
                              <span>الطبيب: {diag.doctorName}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                              diag.status === "Active"
                                ? "bg-amber-950/80 text-amber-300 border-amber-800/60"
                                : diag.status === "Resolved"
                                ? "bg-emerald-950/80 text-emerald-300 border-emerald-800/60"
                                : "bg-sky-950/80 text-sky-300 border-sky-800/60"
                            }`}
                          >
                            {diag.status === "Active"
                              ? "نشط / قيد العلاج"
                              : diag.status === "Resolved"
                              ? "تم الشفاء"
                              : "تحت الملاحظة"}
                          </span>
                          <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {diag.diagnosedAt || (diag as any).diagnosisDate}
                          </span>
                        </div>
                      </div>

                      <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-2 text-xs">
                        <div>
                          <span className="text-slate-400 font-semibold">التفاصيل السريرية: </span>
                          <span className="text-slate-200">{diag.description}</span>
                        </div>
                        {diag.treatmentPlan && (
                          <div className="pt-2 border-t border-slate-800/60">
                            <span className="text-cyan-400 font-semibold">الخطة العلاجية والدوائية: </span>
                            <span className="text-slate-300">{diag.treatmentPlan}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
                    <Activity className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                    <p className="text-sm">لا توجد تشخيصات مسجلة لهذا المريض حتى الآن.</p>
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
                      className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition space-y-3 shadow-md"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-rose-950/80 border border-rose-800/60 flex items-center justify-center text-rose-400">
                            <Crosshair className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-white font-bold text-sm">{op.operationName}</h4>
                            <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                              <span>المستشفى: {op.hospitalName}</span>
                              <span>•</span>
                              <span>الجراح المشرف: {op.surgeonName}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2.5 py-1 bg-slate-800 text-slate-300 rounded-full border border-slate-700 font-semibold">
                            {op.anesthesiaType || "تخدير جراحي"}
                          </span>
                          <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {op.operationDate}
                          </span>
                        </div>
                      </div>

                      <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-2 text-xs">
                        {op.complications && (
                          <div>
                            <span className="text-slate-400 font-semibold">المضاعفات / الملاحظات الجراحية: </span>
                            <span className="text-slate-200">{op.complications}</span>
                          </div>
                        )}
                        {op.notes && (
                          <div className="pt-2 border-t border-slate-800/60">
                            <span className="text-rose-400 font-semibold">ملاحظات ما بعد الجراحة: </span>
                            <span className="text-slate-300">{op.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
                    <Crosshair className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                    <p className="text-sm">لا توجد عمليات جراحية مسجلة لهذا المريض.</p>
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
                      className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 hover:border-slate-700 transition space-y-3 shadow-md"
                    >
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-9 h-9 rounded-xl bg-amber-950/80 border border-amber-800/60 flex items-center justify-center text-amber-400">
                            <Heart className="w-4 h-4" />
                          </div>
                          <div>
                            <h4 className="text-white font-bold text-sm">{cd.diseaseName}</h4>
                            <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
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
                              className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                                cd.severity === "Severe"
                                  ? "bg-rose-950/80 text-rose-300 border-rose-800/60"
                                  : cd.severity === "Moderate"
                                  ? "bg-amber-950/80 text-amber-300 border-amber-800/60"
                                  : "bg-blue-950/80 text-blue-300 border-blue-800/60"
                              }`}
                            >
                              درجة المرض: {cd.severity === "Severe" ? "شديد" : cd.severity === "Moderate" ? "متوسط" : "خفيف"}
                            </span>
                          )}
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                              cd.status === "Active"
                                ? "bg-amber-950/80 text-amber-300 border-amber-800/60"
                                : "bg-emerald-950/80 text-emerald-300 border-emerald-800/60"
                            }`}
                          >
                            {cd.status === "Active" ? "نشط" : "مستقر / تحت السيطرة"}
                          </span>
                        </div>
                      </div>

                      {cd.medications && cd.medications.length > 0 && (
                        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 space-y-2 text-xs">
                          <span className="text-amber-400 font-semibold">الأدوية المداومة والجرعات:</span>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {cd.medications.map((med, i) => (
                              <span
                                key={i}
                                className="px-2.5 py-1 bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-xs"
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
                  <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
                    <Heart className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                    <p className="text-sm">لا توجد أمراض مزمنة مسجلة لهذا المريض.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-16 text-center text-slate-400">
          <AlertCircle className="w-12 h-12 mx-auto mb-3 text-cyan-500" />
          <h3 className="text-white text-lg font-bold">لا يوجد مريض محدد</h3>
          <p className="text-sm mt-1">يرجى البحث بالرقم الوطني أو اختيار أحد السجلات السريعة بالأعلى.</p>
        </div>
      )}

      {/* MODAL 1: Add Diagnosis */}
      {showAddDiagnosisModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-white font-bold text-base flex items-center gap-2">
                <Activity className="w-5 h-5 text-cyan-400" />
                إضافة تشخيص سريري جديد
              </h3>
              <button
                onClick={() => setShowAddDiagnosisModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddDiagnosis} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">اسم الحالة المرضية / التشخيص *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: التهاب الشعب الهوائية الحاد"
                  value={diagnosisForm.diagnosisName}
                  onChange={(e) => setDiagnosisForm({ ...diagnosisForm, diagnosisName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">رمز التصنيف الدولي (ICD-10)</label>
                  <input
                    type="text"
                    placeholder="مثال: J20.9"
                    value={diagnosisForm.icdCode || ""}
                    onChange={(e) => setDiagnosisForm({ ...diagnosisForm, icdCode: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">الحالة السريرية</label>
                  <select
                    value={diagnosisForm.status}
                    onChange={(e) =>
                      setDiagnosisForm({
                        ...diagnosisForm,
                        status: e.target.value as "Active" | "Resolved" | "UnderObservation",
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Active">نشط / قيد العلاج</option>
                    <option value="UnderObservation">تحت الملاحظة</option>
                    <option value="Resolved">تم الشفاء</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">الطبيب المشرف</label>
                  <input
                    type="text"
                    value={diagnosisForm.doctorName}
                    onChange={(e) => setDiagnosisForm({ ...diagnosisForm, doctorName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">المستشفى / المنشأة</label>
                  <input
                    type="text"
                    value={diagnosisForm.hospitalName}
                    onChange={(e) => setDiagnosisForm({ ...diagnosisForm, hospitalName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">الوصف السريري والأعراض *</label>
                <textarea
                  rows={2}
                  required
                  placeholder="وصف الأعراض، الفحص السريري، نتائج الفحوصات الأولية..."
                  value={diagnosisForm.description}
                  onChange={(e) => setDiagnosisForm({ ...diagnosisForm, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">الخطة العلاجية والوصفة الطبية</label>
                <textarea
                  rows={2}
                  placeholder="الأدوية، الجرعات، التوصيات الطبية والمتابعة..."
                  value={diagnosisForm.treatmentPlan || ""}
                  onChange={(e) => setDiagnosisForm({ ...diagnosisForm, treatmentPlan: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddDiagnosisModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-semibold flex items-center gap-1.5"
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-white font-bold text-base flex items-center gap-2">
                <Crosshair className="w-5 h-5 text-rose-400" />
                تسجيل عملية جراحية أو تداخل طبي
              </h3>
              <button
                onClick={() => setShowAddOperationModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddOperation} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">اسم العملية الجراحية *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: استئصال الزائدة الدودية بالمنظار"
                  value={operationForm.operationName}
                  onChange={(e) => setOperationForm({ ...operationForm, operationName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">الجراح المسؤول *</label>
                  <input
                    type="text"
                    required
                    value={operationForm.surgeonName}
                    onChange={(e) => setOperationForm({ ...operationForm, surgeonName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">نوع التخدير</label>
                  <select
                    value={operationForm.anesthesiaType}
                    onChange={(e) => setOperationForm({ ...operationForm, anesthesiaType: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                  >
                    <option value="تخدير كلي">تخدير كلي (General)</option>
                    <option value="تخدير نصفي (Spinal)">تخدير نصفي (Spinal)</option>
                    <option value="تخدير موضعي (Local)">تخدير موضعي (Local)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">تاريخ إجراء العملية</label>
                  <input
                    type="date"
                    value={operationForm.operationDate}
                    onChange={(e) => setOperationForm({ ...operationForm, operationDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">المستشفى</label>
                  <input
                    type="text"
                    value={operationForm.hospitalName}
                    onChange={(e) => setOperationForm({ ...operationForm, hospitalName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">المضاعفات الملحوظة (إن وجدت)</label>
                <input
                  type="text"
                  placeholder="لا توجد مضاعفات بحمد الله"
                  value={operationForm.complications || ""}
                  onChange={(e) => setOperationForm({ ...operationForm, complications: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">تقرير العملية وملاحظات النقاهة</label>
                <textarea
                  rows={2}
                  placeholder="ملاحظات بعد التدخل الجراحي..."
                  value={operationForm.notes || ""}
                  onChange={(e) => setOperationForm({ ...operationForm, notes: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddOperationModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-rose-700 hover:bg-rose-600 text-white rounded-xl font-semibold flex items-center gap-1.5"
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-white font-bold text-base flex items-center gap-2">
                <Heart className="w-5 h-5 text-amber-400" />
                قيد مرض مزمن ومتابعة علاجية
              </h3>
              <button
                onClick={() => setShowAddChronicModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddChronic} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">اسم المرض المزمن *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: ارتفاع ضغط الدم الأساسي (Hypertension)"
                  value={chronicForm.diseaseName}
                  onChange={(e) => setChronicForm({ ...chronicForm, diseaseName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">شدة المرض</label>
                  <select
                    value={chronicForm.severity}
                    onChange={(e) =>
                      setChronicForm({
                        ...chronicForm,
                        severity: e.target.value as "Mild" | "Moderate" | "Severe",
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Mild">خفيف (Mild)</option>
                    <option value="Moderate">متوسط (Moderate)</option>
                    <option value="Severe">شديد (Severe)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">حالة المرض الحالية</label>
                  <select
                    value={chronicForm.status}
                    onChange={(e) =>
                      setChronicForm({
                        ...chronicForm,
                        status: e.target.value as "Active" | "Managed" | "Controlled",
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                  >
                    <option value="Active">نشط</option>
                    <option value="Controlled">مستقر / تحت السيطرة</option>
                    <option value="Managed">قيد الإدارة السريرية</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">الطبيب المتابع</label>
                <input
                  type="text"
                  value={chronicForm.treatingDoctor || ""}
                  onChange={(e) => setChronicForm({ ...chronicForm, treatingDoctor: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">الأدوية المداومة (مفصولة بفاصلة)</label>
                <input
                  type="text"
                  placeholder="مثال: أملوديبين 5 ملجم، كونكور 2.5 ملجم"
                  value={medicationsInput}
                  onChange={(e) => setMedicationsInput(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddChronicModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-semibold flex items-center gap-1.5"
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-white font-bold text-base flex items-center gap-2">
                <Printer className="w-5 h-5 text-cyan-400" />
                معاينة تقرير السجل الطبي الإلكتروني المعتمد
              </h3>
              <button
                onClick={() => setShowPrintModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Official Report Mock Canvas */}
            <div className="bg-white text-slate-900 p-6 rounded-xl border border-slate-300 space-y-4 font-sans text-xs">
              <div className="flex items-center justify-between border-b-2 border-[#00374e] pb-3">
                <div className="text-right">
                  <div className="font-bold text-sm text-[#00374e]">الجمهورية اليمنية</div>
                  <div className="text-[11px] text-slate-600">وزارة الصحة العامة والسكان</div>
                  <div className="text-[11px] text-slate-600">المنظومة الوطنية الموحدة (هويتي)</div>
                </div>
                <div className="text-center font-bold text-base text-[#00374e]">
                  تقرير الحالة والسجل الطبي الإلكتروني الموحد
                </div>
                <div className="text-left text-[11px] text-slate-500 font-mono">
                  <div>تاريخ الإصدار: {new Date().toLocaleDateString("ar-YE")}</div>
                  <div>رقم الوثيقة: MED-{patientNid.slice(-6)}</div>
                </div>
              </div>

              {/* Patient Basic Data */}
              <div className="grid grid-cols-3 gap-2 bg-slate-100 p-3 rounded border border-slate-200">
                <div>
                  <span className="text-slate-500">اسم المريض: </span>
                  <span className="font-bold">{patientName}</span>
                </div>
                <div>
                  <span className="text-slate-500">الرقم الوطني: </span>
                  <span className="font-mono font-bold">{patientNid}</span>
                </div>
                <div>
                  <span className="text-slate-500">فصيلة الدم: </span>
                  <span className="font-mono font-bold text-rose-700">{selectedRecord.bloodGroup}</span>
                </div>
              </div>

              {/* Allergies & Alerts */}
              <div>
                <h5 className="font-bold text-slate-800 border-b pb-1 mb-1">الحساسيات وموانع الأدوية:</h5>
                <p className="text-slate-700">
                  {(selectedRecord.allergies || []).length > 0
                    ? selectedRecord.allergies!.join("، ")
                    : "لا توجد حساسيات مسجلة بحسب الفحوصات المتوفرة."}
                </p>
              </div>

              {/* Diagnoses Summary */}
              <div>
                <h5 className="font-bold text-slate-800 border-b pb-1 mb-1">أحدث التشخيصات السريرية:</h5>
                <ul className="list-disc list-inside space-y-1 text-slate-700">
                  {selectedRecord.diagnoses.map((d, i) => (
                    <li key={i}>
                      <span className="font-semibold">{d.diagnosisName || (d as any).conditionName}</span> ({d.diagnosedAt || (d as any).diagnosisDate}) - المشرف: {d.doctorName}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Chronic Diseases */}
              {selectedRecord.chronicDiseases.length > 0 && (
                <div>
                  <h5 className="font-bold text-slate-800 border-b pb-1 mb-1">الأمراض المزمنة والأدوية المستمرة:</h5>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    {selectedRecord.chronicDiseases.map((c, i) => (
                      <li key={i}>
                        <span className="font-semibold">{c.diseaseName}</span> {c.medications && `- الأدوية: ${c.medications.join("، ")}`}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Surgeries */}
              {selectedRecord.operations.length > 0 && (
                <div>
                  <h5 className="font-bold text-slate-800 border-b pb-1 mb-1">التدخلات الجراحية السابقة:</h5>
                  <ul className="list-disc list-inside space-y-1 text-slate-700">
                    {selectedRecord.operations.map((o, i) => (
                      <li key={i}>
                        <span className="font-semibold">{o.operationName}</span> ({o.operationDate}) - الجراح: {o.surgeonName}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="pt-4 border-t border-slate-300 flex justify-between items-center text-[10px] text-slate-500">
                <span>وثيقة معتمدة وموقعة إلكترونياً من المركز الوطني للمعلومات الصحية</span>
                <span className="font-mono">VERIFIED BY HAWIYATI HEALTH NETWORK</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setShowPrintModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold"
              >
                إغلاق
              </button>
              <button
                onClick={() => {
                  window.print();
                  setShowPrintModal(false);
                }}
                className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md"
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
