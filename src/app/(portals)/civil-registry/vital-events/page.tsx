"use client";

import React, { useState, useEffect, Suspense } from "react";
import {
  ScrollText,
  Search,
  Plus,
  CheckCircle2,
  Calendar,
  Building2,
  Baby,
  HeartCrack,
  X,
  RefreshCw,
  Printer,
  FileText,
  Loader2,
  ShieldCheck,
  Eye,
  AlertCircle,
  User,
  Clock,
} from "lucide-react";
import { civilRegistryService } from "@/lib/api/civilRegistryService";
import {
  BirthCertificateDto,
  DeathCertificateDto,
  IssueBirthCertificateCommand,
  IssueDeathCertificateCommand,
} from "@/types/civilRegistry";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";

function VitalEventsContent() {
  const { user } = useAuth();
  const { toast } = useNotification();
  const [activeTab, setActiveTab] = useState<"birth" | "death">("birth");

  // Data states
  const [birthCertificates, setBirthCertificates] = useState<BirthCertificateDto[]>([]);
  const [deathCertificates, setDeathCertificates] = useState<DeathCertificateDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalError, setModalError] = useState<string | null>(null);

  // Modals
  const [birthModalOpen, setBirthModalOpen] = useState(false);
  const [deathModalOpen, setDeathModalOpen] = useState(false);
  const [selectedBirth, setSelectedBirth] = useState<BirthCertificateDto | null>(null);
  const [selectedDeath, setSelectedDeath] = useState<DeathCertificateDto | null>(null);

  const showNotification = (type: "success" | "error" | "info", message: string) => {
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

  // Branch fallbacks from seeds if not set in user profile
  const isNonCivilBranch =
    user?.branchId === "018f7d9a-2000-7000-8000-000000000003" ||
    user?.branchId === "018f7d9a-2000-7000-8000-000000000004" ||
    user?.branchId === "018f7d9a-2000-7000-8000-000000000005";
  const branchCivilRegistryDefault = (!isNonCivilBranch && user?.branchId) ? user.branchId : "018f7d9a-2000-7000-8000-000000000001";
  const branchHospitalDefault = "018f7d9a-2000-7000-8000-000000000003"; // مستشفى الثورة العام النموذجي

  // New Birth Form
  const [birthForm, setBirthForm] = useState({
    firstName: "",
    gender: 0, // 0 = Male, 1 = Female
    bloodGroup: 6, // 6 = OPos
    dateOfBirth: new Date().toISOString().split("T")[0],
    placeOfBirth: "صنعاء",
    fatherNationalNumber: "",
    motherNationalNumber: "",
    governorate: "أمانة العاصمة",
    district: "السبعين",
    addressDetails: "شارع حدة",
  });
  const [fatherFamily, setFatherFamily] = useState<{ id: string; familyNumber: string } | null>(null);
  const [isLookingUpFather, setIsLookingUpFather] = useState(false);

  const handleLookupFatherCivil = async (nid: string) => {
    setBirthForm((prev) => ({ ...prev, fatherNationalNumber: nid }));
    if (nid.length === 11) {
      setIsLookingUpFather(true);
      try {
        const families = await civilRegistryService.getFamilies();
        const fam = families.find((f) => f.headOfFamilyNationalNumber?.trim() === nid.trim());
        if (fam) {
          setFatherFamily({ id: fam.id, familyNumber: fam.familyNumber });
        } else {
          setFatherFamily(null);
        }
      } catch (e) {
        console.error("Error looking up family:", e);
      } finally {
        setIsLookingUpFather(false);
      }
    } else {
      setFatherFamily(null);
    }
  };

  // New Death Form
  const [deathForm, setDeathForm] = useState({
    nationalNumber: "",
    deathDate: new Date().toISOString().split("T")[0],
    placeOfDeath: "مستشفى الثورة العام",
    causeOfDeath: "توقف القلب والتنفس",
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [births, deaths] = await Promise.all([
        civilRegistryService.getBirthCertificates(),
        civilRegistryService.getDeathCertificates(),
      ]);
      setBirthCertificates(births);
      setDeathCertificates(deaths);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشل جلب سجلات الوقائع الحيوية من الباكند.";
      showNotification("error", msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filter births by branch if user is not SUPER_ADMIN or Civil Registry
  const branchBirths = React.useMemo(() => {
    if (!user || user.role === "SUPER_ADMIN" || !user.branchId || user.agency === "الأحوال المدنية") {
      return birthCertificates;
    }
    const userBranchId = user.branchId.toLowerCase();
    const userBranchName = user.branchName?.trim().toLowerCase();
    return birthCertificates.filter(
      (b) =>
        (b.hospitalBranchId && b.hospitalBranchId.toLowerCase() === userBranchId) ||
        (userBranchName && b.hospitalName && b.hospitalName.trim().toLowerCase() === userBranchName)
    );
  }, [birthCertificates, user]);

  // Filter deaths by branch if user is not SUPER_ADMIN or Civil Registry
  const branchDeaths = React.useMemo(() => {
    if (!user || user.role === "SUPER_ADMIN" || !user.branchId || user.agency === "الأحوال المدنية") {
      return deathCertificates;
    }
    const userBranchId = user.branchId.toLowerCase();
    const userBranchName = user.branchName?.trim().toLowerCase();
    return deathCertificates.filter(
      (d) =>
        (d.issuingBranchId && d.issuingBranchId.toLowerCase() === userBranchId) ||
        (userBranchName && d.issuingBranchName && d.issuingBranchName.trim().toLowerCase() === userBranchName) ||
        (d.hospitalBranchId && d.hospitalBranchId.toLowerCase() === userBranchId) ||
        (userBranchName && d.hospitalName && d.hospitalName.trim().toLowerCase() === userBranchName)
    );
  }, [deathCertificates, user]);

  // Filtered Births within user's branch
  const filteredBirths = branchBirths.filter((b) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      b.certificateNumber.toLowerCase().includes(q) ||
      b.childFullName.toLowerCase().includes(q) ||
      b.childNationalNumber.includes(q) ||
      b.fatherNationalNumber.includes(q) ||
      b.fatherFullName.toLowerCase().includes(q)
    );
  });

  // Filtered Deaths within user's branch
  const filteredDeaths = branchDeaths.filter((d) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      d.certificateNumber.toLowerCase().includes(q) ||
      d.fullName.toLowerCase().includes(q) ||
      d.nationalNumber.includes(q)
    );
  });

  // Submit Birth
  const handleBirthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthForm.firstName || !birthForm.fatherNationalNumber || !birthForm.motherNationalNumber) {
      showNotification("error", "يرجى ملء اسم المولود والرقم الوطني للأب والرقم الوطني للأم.");
      return;
    }

    setSubmitting(true);
    try {
      let targetFamilyId = fatherFamily?.id;
      if (!targetFamilyId) {
        const families = await civilRegistryService.getFamilies().catch(() => []);
        const match = families.find(
          (f) => f.headOfFamilyNationalNumber?.trim() === birthForm.fatherNationalNumber.trim()
        );
        if (match) {
          targetFamilyId = match.id;
        }
      }

      if (!targetFamilyId) {
        showNotification(
          "error",
          "لم يتم العثور على قيد عائلي نشط لرب الأسرة (الأب). يشترط السجل المدني وجود بطاقة عائلية سارية لإضافة المولود إليها."
        );
        setSubmitting(false);
        return;
      }

      const cmd: IssueBirthCertificateCommand = {
        fatherNationalNumber: birthForm.fatherNationalNumber.trim(),
        motherNationalNumber: birthForm.motherNationalNumber.trim(),
        firstName: birthForm.firstName.trim(),
        dateOfBirth: birthForm.dateOfBirth,
        placeOfBirth: birthForm.placeOfBirth || "صنعاء",
        gender: Number(birthForm.gender),
        bloodGroup: Number(birthForm.bloodGroup),
        governorate: birthForm.governorate || "أمانة العاصمة",
        district: birthForm.district || "السبعين",
        addressDetails: birthForm.addressDetails || "شارع حدة",
        hospitalBranchId: branchHospitalDefault,
        familyId: targetFamilyId,
        issuingBranchId: branchCivilRegistryDefault,
      };

      const created = await civilRegistryService.issueBirthCertificate(cmd);
      setBirthCertificates((prev) => [created, ...prev]);
      setBirthModalOpen(false);
      setBirthForm({
        firstName: "",
        gender: 0,
        bloodGroup: 6,
        dateOfBirth: new Date().toISOString().split("T")[0],
        placeOfBirth: "صنعاء",
        fatherNationalNumber: "",
        motherNationalNumber: "",
        governorate: "أمانة العاصمة",
        district: "السبعين",
        addressDetails: "شارع حدة",
      });
      setFatherFamily(null);
      showNotification("success", `تم إصدار شهادة الميلاد وتوليد الرقم الوطني [${created.childNationalNumber}] بنجاح.`);
      setSelectedBirth(created);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشلت عملية إصدار شهادة الميلاد.";
      showNotification("error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Death
  const handleDeathSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deathForm.nationalNumber) {
      showNotification("error", "يرجى إدخال الرقم الوطني للمتوفى.");
      return;
    }

    setSubmitting(true);
    try {
      const cmd: IssueDeathCertificateCommand = {
        nationalNumber: deathForm.nationalNumber.trim(),
        hospitalBranchId: branchHospitalDefault,
        issuingBranchId: branchCivilRegistryDefault,
        deathDate: deathForm.deathDate,
        placeOfDeath: deathForm.placeOfDeath,
        causeOfDeath: deathForm.causeOfDeath,
      };

      const created = await civilRegistryService.issueDeathCertificate(cmd);
      setDeathCertificates((prev) => [created, ...prev]);
      setDeathModalOpen(false);
      setDeathForm({
        nationalNumber: "",
        deathDate: new Date().toISOString().split("T")[0],
        placeOfDeath: "مستشفى الثورة العام",
        causeOfDeath: "توقف القلب والتنفس",
      });
      showNotification("success", `تم قيد واقعة الوفاة وإصدار الشهادة رقم [${created.certificateNumber}] بنجاح.`);
      setSelectedDeath(created);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشلت عملية تسجيل شهادة الوفاة.";
      showNotification("error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">


      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-[#052F31] uppercase tracking-wider">
              مصلحة الأحوال المدنية والسجل المدني • {user?.branchName || "الفرع المركزي"}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#052F31]">
            توثيق الوقائع الحيوية (Vital Events)
          </h1>
          <p className="text-sm text-[#41484d] mt-1">
            إصدار وقيد شهادات الميلاد الرسمية والوفيات عبر الربط المباشر مع الباكند وقاعدة البيانات المركزية.
          </p>
          {user?.role !== "SUPER_ADMIN" && user?.branchName && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mt-2">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>
                {user.agency === "الأحوال المدنية"
                  ? `الفرع المعتمد للتوثيق والاعتماد: ${user.branchName}`
                  : `نطاق العرض محدد بوقائع فرع: ${user.branchName}`}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchData}
            disabled={loading}
            className="p-2.5 bg-white border border-[#e0e3e5] rounded-xl hover:bg-slate-50 text-slate-700 transition-all flex items-center gap-2 text-xs font-bold cursor-pointer"
            title="تحديث البيانات الحية"
          >
            <RefreshCw className={`w-4 h-4 text-[#0C4A4E] ${loading ? "animate-spin" : ""}`} />
            <span>تحديث</span>
          </button>

          {activeTab === "birth" ? (
            <button
              onClick={() => setBirthModalOpen(true)}
              className="px-5 py-2.5 bg-[#0C4A4E] hover:bg-[#052F31] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>إصدار شهادة ميلاد رسمية</span>
            </button>
          ) : (
            <button
              onClick={() => setDeathModalOpen(true)}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>قيد واقعة وفاة رسمية</span>
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#e0e3e5] gap-4">
        <button
          onClick={() => setActiveTab("birth")}
          className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all cursor-pointer border-b-2 ${
            activeTab === "birth"
              ? "border-[#052F31] text-[#052F31]"
              : "border-transparent text-[#71787e] hover:text-[#052F31]"
          }`}
        >
          <Baby className="w-4 h-4" />
          <span>شهادات الميلاد المسجلة ({branchBirths.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("death")}
          className={`pb-3 text-sm font-bold flex items-center gap-2 transition-all cursor-pointer border-b-2 ${
            activeTab === "death"
              ? "border-rose-700 text-rose-800"
              : "border-transparent text-[#71787e] hover:text-rose-700"
          }`}
        >
          <HeartCrack className="w-4 h-4" />
          <span>شهادات الوفاة المسجلة ({branchDeaths.length})</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder={
            activeTab === "birth"
              ? "بحث برقم الشهادة، الرقم الوطني للطفل، اسم الطفل، أو الرقم الوطني للأب..."
              : "بحث برقم شهادة الوفاة، الرقم الوطني للمتوفى، أو الاسم..."
          }
          className="w-full pr-11 pl-4 py-3 bg-white border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0C4A4E] shadow-xs"
        />
      </div>

      {/* Tab 1: Birth Certificates Table */}
      {activeTab === "birth" && (
        <div className="bg-white border border-[#e0e3e5] rounded-2xl shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-[#0C4A4E]" />
              <p className="text-xs">جاري استرجاع شهادات الميلاد الحية من الباكند...</p>
            </div>
          ) : filteredBirths.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <Baby className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-sm">لا توجد شهادات ميلاد مسجلة مطابقة للبحث</p>
              <p className="text-xs text-slate-400 mt-1">يمكنك إصدار شهادة ميلاد رسمية جديدة بالضغط على الزر أعلاه.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#f7f9fb] border-b border-[#e0e3e5] text-[#41484d] font-bold">
                  <tr>
                    <th className="py-3 px-4">رقم الشهادة</th>
                    <th className="py-3 px-4">اسم المولود</th>
                    <th className="py-3 px-4">الرقم الوطني الممنوح</th>
                    <th className="py-3 px-4">اسم الأب ورقم هويته</th>
                    <th className="py-3 px-4">تاريخ الميلاد</th>
                    <th className="py-3 px-4">المستشفى</th>
                    <th className="py-3 px-4 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eceef0]">
                  {filteredBirths.map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#052F31]">
                        {b.certificateNumber}
                      </td>
                      <td className="py-3 px-4 font-semibold text-[#191c1e]">
                        <div className="flex items-center gap-2">
                          <Baby className="w-4 h-4 text-sky-600" />
                          <span>{b.childFullName}</span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${b.gender === "Female" ? "bg-pink-50 text-pink-700" : "bg-blue-50 text-blue-700"}`}>
                            {b.gender === "Female" ? "أنثى" : "ذكر"}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-700 bg-emerald-50/40 rounded px-2">
                        {b.childNationalNumber}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-800">{b.fatherFullName}</div>
                        <div className="font-mono text-[10px] text-slate-500">{b.fatherNationalNumber}</div>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {b.dateOfBirth}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {b.hospitalName || "مستشفى الثورة العام"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedBirth(b)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-[#E6F1EE] text-[#052F31] rounded-lg font-bold text-xs flex items-center gap-1.5 mx-auto transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>عرض الشهادة</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Death Certificates Table */}
      {activeTab === "death" && (
        <div className="bg-white border border-[#e0e3e5] rounded-2xl shadow-xs overflow-hidden">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
              <Loader2 className="w-8 h-8 animate-spin text-rose-700" />
              <p className="text-xs">جاري استرجاع شهادات الوفاة الحية من الباكند...</p>
            </div>
          ) : filteredDeaths.length === 0 ? (
            <div className="py-16 text-center text-slate-500">
              <HeartCrack className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p className="font-semibold text-sm">لا توجد وقائع وفاة مسجلة مطابقة للبحث</p>
              <p className="text-xs text-slate-400 mt-1">يمكنك تسجيل واقعة وفاة رسمية بالضغط على الزر أعلاه.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#f7f9fb] border-b border-[#e0e3e5] text-[#41484d] font-bold">
                  <tr>
                    <th className="py-3 px-4">رقم الشهادة</th>
                    <th className="py-3 px-4">اسم المتوفى</th>
                    <th className="py-3 px-4">الرقم الوطني</th>
                    <th className="py-3 px-4">تاريخ الوفاة</th>
                    <th className="py-3 px-4">مكان وسبب الوفاة</th>
                    <th className="py-3 px-4">جهة الإصدار</th>
                    <th className="py-3 px-4 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eceef0]">
                  {filteredDeaths.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">
                        {d.certificateNumber}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900">
                        <div className="flex items-center gap-2">
                          <HeartCrack className="w-4 h-4 text-rose-600" />
                          <span>{d.fullName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-700">
                        {d.nationalNumber}
                      </td>
                      <td className="py-3 px-4 font-mono text-rose-800 font-semibold">
                        {d.deathDate}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        <div>{d.placeOfDeath || "المستشفى"}</div>
                        <div className="text-[10px] text-slate-400">{d.causeOfDeath || "طبيعية"}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {d.issuingBranchName || "فرع الأحوال المدنية"}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedDeath(d)}
                          className="px-3 py-1.5 bg-slate-100 hover:bg-rose-50 text-rose-800 rounded-lg font-bold text-xs flex items-center gap-1.5 mx-auto transition-all cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>عرض الشهادة</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Modal 1: Issue Birth Certificate */}
      {birthModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-[#e0e3e5] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-[#eceef0]">
              <div className="flex items-center gap-2">
                <Baby className="w-5 h-5 text-[#0C4A4E]" />
                <h3 className="font-extrabold text-[#052F31] text-base">
                  إصدار شهادة ميلاد رسمية جديدة
                </h3>
              </div>
              <button
                onClick={() => setBirthModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBirthSubmit} className="space-y-4 pt-4">
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-xs text-sky-900 leading-relaxed">
                يتم قيد المولود في قاعدة البيانات المركزية وتوليد رقم وطني فريد له مكون من 11 خانة وربطه بسجل والديه والفرع الحالي تلقائياً.
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    اسم المولود الأول *
                  </label>
                  <input
                    type="text"
                    required
                    value={birthForm.firstName}
                    onChange={(e) => setBirthForm({ ...birthForm, firstName: e.target.value })}
                    placeholder="مثال: محمد، سارة..."
                    className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0C4A4E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الجنس *
                  </label>
                  <select
                    value={birthForm.gender}
                    onChange={(e) => setBirthForm({ ...birthForm, gender: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0C4A4E]"
                  >
                    <option value={0}>ذكر (Male)</option>
                    <option value={1}>أنثى (Female)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الرقم الوطني للأب (11 خانة) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={11}
                    value={birthForm.fatherNationalNumber}
                    onChange={(e) => handleLookupFatherCivil(e.target.value)}
                    placeholder="01001000001"
                    className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs font-mono focus:outline-none focus:border-[#0C4A4E]"
                  />
                  {isLookingUpFather && (
                    <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1 font-medium">
                      <Clock className="w-3 h-3 animate-spin" />
                      <span>جارٍ التحقق من قيد العائلة...</span>
                    </div>
                  )}
                  {fatherFamily && !isLookingUpFather && (
                    <div className="mt-1 text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>قيد العائلة مرتبط: بطاقة العائلة رقم ({fatherFamily.familyNumber})</span>
                    </div>
                  )}
                  {!fatherFamily && !isLookingUpFather && birthForm.fatherNationalNumber.length === 11 && (
                    <div className="mt-1 text-[11px] text-amber-700 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3 h-3 text-amber-600" />
                      <span>تنبيه: لا يوجد قيد عائلي نشط مسجل لهذا الأب</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الرقم الوطني للأم (11 خانة) *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={11}
                    value={birthForm.motherNationalNumber}
                    onChange={(e) => setBirthForm({ ...birthForm, motherNationalNumber: e.target.value })}
                    placeholder="01001000002"
                    className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs font-mono focus:outline-none focus:border-[#0C4A4E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    تاريخ الميلاد *
                  </label>
                  <input
                    type="date"
                    required
                    value={birthForm.dateOfBirth}
                    onChange={(e) => setBirthForm({ ...birthForm, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0C4A4E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    فصيلة الدم
                  </label>
                  <select
                    value={birthForm.bloodGroup}
                    onChange={(e) => setBirthForm({ ...birthForm, bloodGroup: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0C4A4E]"
                  >
                    <option value={0}>A+</option>
                    <option value={1}>A-</option>
                    <option value={2}>B+</option>
                    <option value={3}>B-</option>
                    <option value={4}>AB+</option>
                    <option value={5}>AB-</option>
                    <option value={6}>O+</option>
                    <option value={7}>O-</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    المحافظة
                  </label>
                  <input
                    type="text"
                    value={birthForm.governorate}
                    onChange={(e) => setBirthForm({ ...birthForm, governorate: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0C4A4E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    المديرية
                  </label>
                  <input
                    type="text"
                    value={birthForm.district}
                    onChange={(e) => setBirthForm({ ...birthForm, district: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0C4A4E]"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    تفاصيل السكن ومحل الإقامة *
                  </label>
                  <input
                    type="text"
                    required
                    value={birthForm.addressDetails}
                    onChange={(e) => setBirthForm({ ...birthForm, addressDetails: e.target.value })}
                    placeholder="مثال: حي حدة - شارع بيروت"
                    className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0C4A4E]"
                  />
                </div>
              </div>

              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-800 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-medium">{modalError}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-[#eceef0]">
                <button
                  type="button"
                  onClick={() => setBirthModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#0C4A4E] hover:bg-[#052F31] text-white rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>حفظ وإصدار الوثيقة</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Issue Death Certificate */}
      {deathModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e0e3e5]">
            <div className="flex justify-between items-center pb-4 border-b border-[#eceef0]">
              <div className="flex items-center gap-2">
                <HeartCrack className="w-5 h-5 text-rose-700" />
                <h3 className="font-extrabold text-slate-900 text-base">
                  قيد واقعة وفاة رسمية
                </h3>
              </div>
              <button
                onClick={() => setDeathModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDeathSubmit} className="space-y-4 pt-4">
              <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-900 leading-relaxed">
                سيتم تحديث سجل المواطن في قاعدة البيانات إلى (متوفى Deceased) وإيقاف سريان بطاقته الشخصية وجواز سفره تلقائياً.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الرقم الوطني للمتوفى (11 خانة) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={11}
                  value={deathForm.nationalNumber}
                  onChange={(e) => setDeathForm({ ...deathForm, nationalNumber: e.target.value })}
                  placeholder="01001000005"
                  className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs font-mono focus:outline-none focus:border-rose-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  تاريخ الوفاة *
                </label>
                <input
                  type="date"
                  required
                  value={deathForm.deathDate}
                  onChange={(e) => setDeathForm({ ...deathForm, deathDate: e.target.value })}
                  className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-rose-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  مكان الوفاة
                </label>
                <input
                  type="text"
                  value={deathForm.placeOfDeath}
                  onChange={(e) => setDeathForm({ ...deathForm, placeOfDeath: e.target.value })}
                  className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-rose-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  سبب الوفاة
                </label>
                <input
                  type="text"
                  value={deathForm.causeOfDeath}
                  onChange={(e) => setDeathForm({ ...deathForm, causeOfDeath: e.target.value })}
                  className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-rose-600"
                />
              </div>

              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-800 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-medium">{modalError}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-[#eceef0]">
                <button
                  type="button"
                  onClick={() => setDeathModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>تأكيد وقيد الوفاة</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: View & Print Birth Certificate Document */}
      {selectedBirth && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-[#052F31] text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span>شهادة ميلاد رسمية صالحة قانونياً</span>
              </h3>
              <button
                onClick={() => setSelectedBirth(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Certificate Canvas */}
            <div className="p-6 my-4 border-2 border-dashed border-[#0C4A4E]/30 rounded-2xl bg-amber-50/20 space-y-5">
              <div className="text-center space-y-1">
                <p className="text-xs font-bold text-slate-600">الجمهورية اليمنية • وزارة الداخلية</p>
                <p className="text-xs font-extrabold text-[#052F31]">مصلحة الأحوال المدنية والسجل المدني</p>
                <h2 className="text-xl font-black text-slate-900 pt-1">شـهـادة مـيـلاد</h2>
                <p className="font-mono text-xs font-bold text-slate-500">رقم القيد: {selectedBirth.certificateNumber}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">اسم المولود بالكامل:</span>
                  <span className="font-bold text-sm text-[#052F31]">{selectedBirth.childFullName}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">الرقم الوطني الدائم:</span>
                  <span className="font-mono font-bold text-sm text-emerald-700">{selectedBirth.childNationalNumber}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">اسم الأب ورقم هويته:</span>
                  <span className="font-semibold">{selectedBirth.fatherFullName} ({selectedBirth.fatherNationalNumber})</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">اسم الأم ورقم هويتها:</span>
                  <span className="font-semibold">{selectedBirth.motherFullName} ({selectedBirth.motherNationalNumber})</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">تاريخ ومكان الميلاد:</span>
                  <span className="font-semibold">{selectedBirth.dateOfBirth} - {selectedBirth.placeOfBirth}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">المستشفى المُبلغ:</span>
                  <span className="font-semibold">{selectedBirth.hospitalName}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2 border-t border-slate-200">
                <span>تاريخ التحرير: {selectedBirth.issueDate}</span>
                <span className="font-mono">HASH: {selectedBirth.id.substring(0, 12)}... (VERIFIED)</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-[#052F31] hover:bg-[#0C4A4E] text-white rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الشهادة</span>
              </button>
              <button
                onClick={() => setSelectedBirth(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: View & Print Death Certificate Document */}
      {selectedDeath && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h3 className="font-extrabold text-rose-800 text-base flex items-center gap-2">
                <FileText className="w-5 h-5 text-rose-700" />
                <span>شهادة وفاة رسمية</span>
              </h3>
              <button
                onClick={() => setSelectedDeath(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Certificate Canvas */}
            <div className="p-6 my-4 border-2 border-dashed border-rose-300 rounded-2xl bg-rose-50/20 space-y-5">
              <div className="text-center space-y-1">
                <p className="text-xs font-bold text-slate-600">الجمهورية اليمنية • وزارة الداخلية</p>
                <p className="text-xs font-extrabold text-[#052F31]">مصلحة الأحوال المدنية والسجل المدني</p>
                <h2 className="text-xl font-black text-rose-900 pt-1">شـهـادة وفـاة</h2>
                <p className="font-mono text-xs font-bold text-slate-500">رقم القيد: {selectedDeath.certificateNumber}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs pt-2">
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">اسم المتوفى بالكامل:</span>
                  <span className="font-bold text-sm text-slate-900">{selectedDeath.fullName}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">الرقم الوطني:</span>
                  <span className="font-mono font-bold text-sm text-slate-800">{selectedDeath.nationalNumber}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">تاريخ الوفاة:</span>
                  <span className="font-semibold text-rose-800">{selectedDeath.deathDate}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200">
                  <span className="text-slate-400 block text-[10px]">مكان الوفاة:</span>
                  <span className="font-semibold">{selectedDeath.placeOfDeath || "غير محدد"}</span>
                </div>
                <div className="bg-white p-3 rounded-xl border border-slate-200 col-span-2">
                  <span className="text-slate-400 block text-[10px]">سبب الوفاة:</span>
                  <span className="font-semibold">{selectedDeath.causeOfDeath || "طبيعية"}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-[10px] text-slate-500 pt-2 border-t border-slate-200">
                <span>تاريخ التحرير: {selectedDeath.issueDate}</span>
                <span className="font-mono">HASH: {selectedDeath.id.substring(0, 12)}... (OFFICIAL RECORD)</span>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الشهادة</span>
              </button>
              <button
                onClick={() => setSelectedDeath(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VitalEventsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">جاري تحميل الوقائع الحيوية...</div>}>
      <VitalEventsContent />
    </Suspense>
  );
}
