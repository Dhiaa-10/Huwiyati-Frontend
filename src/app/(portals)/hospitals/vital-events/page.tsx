"use client";

import React, { useState, useEffect } from "react";
import { civilRegistryService } from "@/lib/api/civilRegistryService";
import { VitalEvent } from "@/types/civilRegistry";
import { useAuth } from "@/context/AuthContext";
import {
  Send,
  UserCheck,
  Activity,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
  Printer,
  Clock,
  Heart,
  Shield,
  Search,
} from "lucide-react";

import { useNotification } from "@/context/NotificationContext";

export default function HospitalVitalEventsPage() {
  const { user } = useAuth();
  const { toast } = useNotification();
  const [activeTab, setActiveTab] = useState<"birth" | "death" | "history">("birth");
  const [recentEvents, setRecentEvents] = useState<VitalEvent[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Birth Form — cleared defaults, hospital/doctor auto-filled from session
  const [birthForm, setBirthForm] = useState({
    fatherNationalId: "",
    motherNationalId: "",
    childFullName: "",
    dateOfBirth: new Date().toISOString().slice(0, 16),
    gender: "ذكر",
    bloodGroup: 6,
    birthWeight: "",
    deliveryType: "ولادة طبيعية",
    doctorName: user.fullName || "",
    hospitalName: user.branchName || "",
    governorate: "أمانة العاصمة",
    district: "السبعين",
    addressDetails: "صنعاء - الجمهورية اليمنية",
    notes: "",
  });
  const [fatherName, setFatherName] = useState<string>("");
  const [motherName, setMotherName] = useState<string>("");
  const [fatherFamily, setFatherFamily] = useState<{ id: string; familyNumber: string } | null>(null);
  const [isLookingUpFather, setIsLookingUpFather] = useState(false);

  // Death Form — cleared defaults, hospital/doctor auto-filled from session
  const [deathForm, setDeathForm] = useState({
    deceasedNationalId: "",
    deathDateTime: new Date().toISOString().slice(0, 16),
    causeOfDeath: "",
    department: "",
    certifyingDoctor: user.fullName || "",
    hospitalName: user.branchName || "",
    governorate: "أمانة العاصمة",
    district: "السبعين",
    notes: "",
  });
  const [deceasedName, setDeceasedName] = useState<string>("");

  const showToast = (message: string, type: "success" | "error" = "success") => {
    if (type === "success") {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  const loadRecentEvents = async () => {
    try {
      const res = await civilRegistryService.getVitalEvents({ pageSize: 15 });
      setRecentEvents(res.items);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadRecentEvents();
  }, []);

  // Update hospital/doctor fields when user session loads
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

  // Lookup Father — NID must be 11 digits
  const handleLookupFather = async (nid: string) => {
    setBirthForm((prev) => ({ ...prev, fatherNationalId: nid }));
    if (nid.length === 11) {
      setIsLookingUpFather(true);
      try {
        const [citizen, families] = await Promise.all([
          civilRegistryService.searchCitizenByNationalId(nid),
          civilRegistryService.getFamilies().catch(() => []),
        ]);
        if (citizen) {
          setFatherName(citizen.fullName);
        } else {
          setFatherName("رقم غير مسجل في السجل المدني");
        }
        const fam = families.find((f) => f.headOfFamilyNationalNumber?.trim() === nid.trim());
        if (fam) {
          setFatherFamily({ id: fam.id, familyNumber: fam.familyNumber });
        } else {
          setFatherFamily(null);
        }
      } catch (err) {
        console.error("Error looking up father or family:", err);
      } finally {
        setIsLookingUpFather(false);
      }
    } else {
      setFatherName("");
      setFatherFamily(null);
    }
  };

  // Lookup Mother — NID must be 11 digits
  const handleLookupMother = async (nid: string) => {
    setBirthForm((prev) => ({ ...prev, motherNationalId: nid }));
    if (nid.length === 11) {
      const citizen = await civilRegistryService.searchCitizenByNationalId(nid);
      if (citizen) {
        setMotherName(citizen.fullName);
      } else {
        setMotherName("رقم غير مسجل في السجل المدني");
      }
    } else {
      setMotherName("");
    }
  };

  // Lookup Deceased — NID must be 11 digits
  const handleLookupDeceased = async (nid: string) => {
    setDeathForm((prev) => ({ ...prev, deceasedNationalId: nid }));
    if (nid.length === 11) {
      const citizen = await civilRegistryService.searchCitizenByNationalId(nid);
      if (citizen) {
        setDeceasedName(citizen.fullName);
      } else {
        setDeceasedName("رقم غير مسجل في السجل المدني");
      }
    } else {
      setDeceasedName("");
    }
  };

  const handleSubmitBirth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthForm.fatherNationalId || !birthForm.childFullName) {
      showToast("يرجى ملء كافة بيانات المولود والأبوين المطلوبة", "error");
      return;
    }
    if (!user.branchId) {
      showToast("لم يتم تحديد فرع المستشفى من الجلسة الحالية. يرجى تسجيل الدخول مجدداً.", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      const hospitalBranchId = user.branchId || "018f7d9a-2000-7000-8000-000000000003";
      const civilRegistryIssuingBranchId = "018f7d9a-2000-7000-8000-000000000001"; // مصلحة الأحوال المدنية - صنعاء (المركز الرئيسي)

      await civilRegistryService.registerBirth(
        {
          childFirstName: birthForm.childFullName,
          childGender: birthForm.gender === "ذكر" ? "Male" : "Female",
          fatherNationalNumber: birthForm.fatherNationalId,
          motherNationalNumber: birthForm.motherNationalId,
          dateOfBirth: birthForm.dateOfBirth.split("T")[0],
          placeOfBirth: birthForm.hospitalName || "المستشفى",
          governorate: birthForm.governorate || "أمانة العاصمة",
          district: birthForm.district || "السبعين",
          addressDetails: birthForm.addressDetails || "صنعاء - الجمهورية اليمنية",
          familyId: fatherFamily?.id,
          bloodGroup: Number(birthForm.bloodGroup),
        },
        hospitalBranchId,
        civilRegistryIssuingBranchId
      );

      showToast(
        `تم تسجيل بلاغ الميلاد بنجاح وإرسال الإخطار الرسمي إلى مصلحة الأحوال المدنية (المولود: ${birthForm.childFullName})`
      );
      loadRecentEvents();
      setActiveTab("history");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشل إرسال بلاغ الولادة للأحوال المدنية";
      showToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitDeath = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deathForm.deceasedNationalId || !deathForm.causeOfDeath) {
      showToast("يرجى تعبئة كافة الحقول الخاصة بواقعة الوفاة", "error");
      return;
    }
    if (!user.branchId) {
      showToast("لم يتم تحديد فرع المستشفى من الجلسة الحالية. يرجى تسجيل الدخول مجدداً.", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      const hospitalBranchId = user.branchId || "018f7d9a-2000-7000-8000-000000000003";
      const civilRegistryIssuingBranchId = "018f7d9a-2000-7000-8000-000000000001"; // مصلحة الأحوال المدنية - صنعاء (المركز الرئيسي)

      await civilRegistryService.registerDeath(
        {
          deceasedNationalNumber: deathForm.deceasedNationalId,
          deathDate: deathForm.deathDateTime.split("T")[0],
          causeOfDeath: deathForm.causeOfDeath,
          placeOfDeath: `${deathForm.hospitalName} - ${deathForm.department}`,
          governorate: deathForm.governorate,
          district: deathForm.district,
        },
        hospitalBranchId,
        civilRegistryIssuingBranchId
      );

      showToast(
        `تم قيد واقعة الوفاة وتثبيتها في السجل المدني الموحد للمتوفى ذو الرقم الوطني ${deathForm.deceasedNationalId}`
      );
      loadRecentEvents();
      setActiveTab("history");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشل إرسال إخطار الوفاة للأحوال المدنية";
      showToast(msg, "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">


      {/* Header Banner - Hwyati Sovereign Petrol Banner */}
      <div className="bg-gradient-to-l from-[#052F31] via-[#0C4A4E] to-[#103F43] rounded-2xl p-6 text-white shadow-md relative overflow-hidden border border-[#147A77]/30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#147A77]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 text-emerald-300 text-xs font-bold">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>الربط الشبكي المباشر مع مصلحة الأحوال المدنية والسجل المدني</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">تسجيل وتوثيق الوقائع الحيوية بالمستشفى</h1>
            <p className="text-slate-200 text-xs md:text-sm mt-1">
              إدخال وقائع الميلاد وإخطارات الوفاة إلكترونياً وتوثيقها فورياً في قواعد بيانات الهوية الوطنية
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border border-slate-200 rounded-2xl p-2 flex items-center gap-2 shadow-xs flex-wrap">
        <button
          onClick={() => setActiveTab("birth")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "birth"
              ? "bg-[#052F31] text-white shadow-xs"
              : "text-slate-600 hover:text-[#052F31] hover:bg-slate-100"
          }`}
        >
          <Heart className="w-4 h-4 text-rose-400" />
          <span>تسجيل واقعة ميلاد جديدة</span>
        </button>

        <button
          onClick={() => setActiveTab("death")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "death"
              ? "bg-rose-600 text-white shadow-xs"
              : "text-slate-600 hover:text-rose-700 hover:bg-slate-100"
          }`}
        >
          <Activity className="w-4 h-4 text-amber-500" />
          <span>تسجيل واقعة وفاة رسمية</span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === "history"
              ? "bg-[#0C4A4E] text-white shadow-xs"
              : "text-slate-600 hover:text-[#052F31] hover:bg-slate-100"
          }`}
        >
          <FileText className="w-4 h-4 text-[#0C4A4E]" />
          <span>الوقائع المسجلة والمرسلة مؤخراً ({recentEvents.length})</span>
        </button>
      </div>

      {/* TAB 1: Birth Form */}
      {activeTab === "birth" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#E6F1EE]/40 text-[#0C4A4E] border border-[#0C4A4E]/20 flex items-center justify-center text-lg">
              👶
            </div>
            <div>
              <h3 className="text-[#052F31] font-extrabold text-base">استمارة بلاغ ولادة إلكتروني</h3>
              <p className="text-[#41484d] text-xs">
                يتم إرسال هذا الإخطار المشفر إلى السجل المدني لإصدار قيد الميلاد المبدئي وشهادة الميلاد
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmitBirth} className="space-y-5 text-xs">
            {/* Parents Verification Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div>
                <label className="block text-slate-700 font-bold mb-1">
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
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-[#0C4A4E]"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                </div>
                {isLookingUpFather && (
                  <div className="mt-1.5 text-xs text-slate-500 flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    <span>جارٍ الاستعلام عن بيانات الأب وقيد العائلة...</span>
                  </div>
                )}
                {fatherName && !isLookingUpFather && (
                  <div className="mt-2 space-y-1.5">
                    <div className="text-xs text-[#0C4A4E] flex items-center gap-1 font-bold">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>اسم الأب المسجل: {fatherName}</span>
                    </div>
                    {fatherFamily ? (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>قيد العائلة مرتبط تلقائياً: بطاقة العائلة رقم ({fatherFamily.familyNumber})</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-xs font-medium">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                        <span>تنبيه: لا يوجد قيد عائلي نشط مسجل لهذا الأب بالسجل المدني</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">
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
                    className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-[#0C4A4E]"
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                </div>
                {motherName && (
                  <div className="mt-1.5 text-xs text-[#0C4A4E] flex items-center gap-1 font-bold">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>اسم الأم المسجل: {motherName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Child Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2">
                <label className="block text-slate-700 font-bold mb-1">
                  اسم المولود (رباعي متبوعاً بلقب العائلة) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: يوسف سالم محمد اليافعي"
                  value={birthForm.childFullName}
                  onChange={(e) => setBirthForm({ ...birthForm, childFullName: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0C4A4E]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">الجنس *</label>
                <select
                  value={birthForm.gender}
                  onChange={(e) => setBirthForm({ ...birthForm, gender: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0C4A4E]"
                >
                  <option value="ذكر">ذكر (Male)</option>
                  <option value="أنثى">أنثى (Female)</option>
                </select>
              </div>
            </div>

            {/* Birth Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-slate-700 font-bold mb-1">تاريخ ووقت الولادة الدقيق *</label>
                <input
                  type="datetime-local"
                  required
                  value={birthForm.dateOfBirth}
                  onChange={(e) => setBirthForm({ ...birthForm, dateOfBirth: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0C4A4E] font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">الوزن عند الولادة (كغم)</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="3.2"
                  value={birthForm.birthWeight}
                  onChange={(e) => setBirthForm({ ...birthForm, birthWeight: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0C4A4E] font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">نوع الولادة</label>
                <select
                  value={birthForm.deliveryType}
                  onChange={(e) => setBirthForm({ ...birthForm, deliveryType: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0C4A4E]"
                >
                  <option value="ولادة طبيعية">ولادة طبيعية</option>
                  <option value="عملية قيصرية">عملية قيصرية</option>
                  <option value="ولادة مبكرة">ولادة مبكرة (حضانة)</option>
                </select>
              </div>
            </div>

            {/* Hospital & Attending Doctor & Blood Group */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-slate-700 font-bold mb-1">الطبيب المشرف / المولّد</label>
                <input
                  type="text"
                  value={birthForm.doctorName}
                  onChange={(e) => setBirthForm({ ...birthForm, doctorName: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0C4A4E]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">المستشفى / مركز التوليد</label>
                <input
                  type="text"
                  value={birthForm.hospitalName}
                  onChange={(e) => setBirthForm({ ...birthForm, hospitalName: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0C4A4E]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">فصيلة دم المولود</label>
                <select
                  value={birthForm.bloodGroup}
                  onChange={(e) => setBirthForm({ ...birthForm, bloodGroup: Number(e.target.value) })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0C4A4E]"
                >
                  <option value={6}>O+</option>
                  <option value={7}>O-</option>
                  <option value={0}>A+</option>
                  <option value={1}>A-</option>
                  <option value={2}>B+</option>
                  <option value={3}>B-</option>
                  <option value={4}>AB+</option>
                  <option value={5}>AB-</option>
                </select>
              </div>
            </div>

            {/* Location & Address Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-slate-700 font-bold mb-1">المحافظة *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: أمانة العاصمة"
                  value={birthForm.governorate}
                  onChange={(e) => setBirthForm({ ...birthForm, governorate: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0C4A4E]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">المديرية *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: السبعين"
                  value={birthForm.district}
                  onChange={(e) => setBirthForm({ ...birthForm, district: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0C4A4E]"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">تفاصيل السكن ومحل الإقامة *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: حي حدة - شارع بيروت"
                  value={birthForm.addressDetails}
                  onChange={(e) => setBirthForm({ ...birthForm, addressDetails: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0C4A4E]"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">ملاحظات سريرية وصحية إضافية</label>
              <textarea
                rows={2}
                value={birthForm.notes}
                onChange={(e) => setBirthForm({ ...birthForm, notes: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0C4A4E]"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-[#0C4A4E] hover:bg-[#052F31] disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-2 shadow-sm transition text-xs cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>إرسال وتوثيق لدى مصلحة الأحوال المدنية</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: Death Form */}
      {activeTab === "death" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 mb-6">
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 flex items-center justify-center text-lg font-bold">
              📜
            </div>
            <div>
              <h3 className="text-[#052F31] font-extrabold text-base">استمارة إخطار وإعلان وفاة رسمي</h3>
              <p className="text-[#41484d] text-xs">
                يتم إرسال هذا التقرير الجنائي والسريري مباشرة إلى السجل المدني لإصدار شهادة الوفاة وإيقاف الخدمات
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmitDeath} className="space-y-5 text-xs">
            {/* Deceased Verification */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <label className="block text-slate-700 font-bold mb-1">
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
                  className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              </div>
              {deceasedName && (
                <div className="mt-2 text-xs text-rose-700 flex items-center gap-1.5 font-bold">
                  <UserCheck className="w-4 h-4 text-rose-600" />
                  <span>اسم المتوفى المسجل: {deceasedName}</span>
                </div>
              )}
            </div>

            {/* Death Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-slate-700 font-bold mb-1">تاريخ ووقت الوفاة المعلن *</label>
                <input
                  type="datetime-local"
                  required
                  value={deathForm.deathDateTime}
                  onChange={(e) => setDeathForm({ ...deathForm, deathDateTime: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">القسم / الجناح بالمستشفى</label>
                <input
                  type="text"
                  value={deathForm.department}
                  onChange={(e) => setDeathForm({ ...deathForm, department: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">السبب المباشر للوفاة *</label>
              <input
                type="text"
                required
                placeholder="السبب السريري المباشر بحسب التقرير الطبي..."
                value={deathForm.causeOfDeath}
                onChange={(e) => setDeathForm({ ...deathForm, causeOfDeath: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-slate-700 font-bold mb-1">الطبيب المعتمد لشهادة الوفاة</label>
                <input
                  type="text"
                  value={deathForm.certifyingDoctor}
                  onChange={(e) => setDeathForm({ ...deathForm, certifyingDoctor: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">المستشفى</label>
                <input
                  type="text"
                  value={deathForm.hospitalName}
                  onChange={(e) => setDeathForm({ ...deathForm, hospitalName: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">المحافظة</label>
                <input
                  type="text"
                  value={deathForm.governorate}
                  onChange={(e) => setDeathForm({ ...deathForm, governorate: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-bold mb-1">ملاحظات وتفاصيل التقرير الطبي</label>
              <textarea
                rows={2}
                value={deathForm.notes}
                onChange={(e) => setDeathForm({ ...deathForm, notes: e.target.value })}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-2 shadow-sm transition text-xs cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>إرسال إخطار الوفاة وتثبيته في السجل المدني</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 3: Recent Events Table */}
      {activeTab === "history" && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-[#052F31] font-extrabold text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-[#0C4A4E]" />
              سجل الوقائع الحيوية المرسلة إلكترونياً
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              مرتبطة مباشرة بالسجل المدني المركزي
            </span>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
                <tr>
                  <th className="p-3">رقم الإخطار</th>
                  <th className="p-3">نوع الواقعة</th>
                  <th className="p-3">اسم المعني</th>
                  <th className="p-3">تاريخ الواقعة</th>
                  <th className="p-3">مكان الواقعة</th>
                  <th className="p-3">حالة الاعتماد</th>
                  <th className="p-3">المشرف المعتمد</th>
                  <th className="p-3 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {recentEvents.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3 font-mono text-[#052F31] font-bold">{ev.certificateNumber}</td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                          ev.eventType === "Birth"
                            ? "bg-[#E6F1EE]/40 text-[#0C4A4E] border border-[#0C4A4E]/20"
                            : ev.eventType === "Death"
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        }`}
                      >
                        {ev.eventType === "Birth" ? "👶 ميلاد" : ev.eventType === "Death" ? "📜 وفاة" : ev.eventType}
                      </span>
                    </td>
                    <td className="p-3 font-bold text-[#052F31]">{ev.subjectName}</td>
                    <td className="p-3 font-mono text-slate-500">{ev.eventDate}</td>
                    <td className="p-3 text-slate-600">{ev.placeOfEvent}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>موثق بالسجل المدني</span>
                      </span>
                    </td>
                    <td className="p-3 text-slate-500">{ev.approvedByOfficer || "النظام الآلي الموحد"}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => window.print()}
                        className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 text-[#052F31] border border-slate-200 rounded-lg text-[11px] font-bold transition inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Printer className="w-3 h-3 text-[#0C4A4E]" />
                        <span>طباعة إخطار</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
