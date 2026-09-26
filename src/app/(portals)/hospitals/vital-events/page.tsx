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

export default function HospitalVitalEventsPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"birth" | "death" | "history">("birth");
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" } | null>(null);
  const [recentEvents, setRecentEvents] = useState<VitalEvent[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Birth Form — cleared defaults, hospital/doctor auto-filled from session
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

  // Death Form — cleared defaults, hospital/doctor auto-filled from session
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
    setTimeout(() => setNotification(null), 4500);
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
      const citizen = await civilRegistryService.searchCitizenByNationalId(nid);
      if (citizen) {
        setFatherName(citizen.fullName);
      } else {
        setFatherName("رقم غير مسجل في السجل المدني");
      }
    } else {
      setFatherName("");
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

      {/* Header Banner */}
      <div className="bg-gradient-to-l from-[#00374e] to-[#044e6e] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 text-cyan-300 text-sm font-medium">
              <Shield className="w-4 h-4" />
              <span>الربط الشبكي المباشر مع مصلحة الأحوال المدنية والسجل المدني</span>
            </div>
            <h1 className="text-2xl font-bold">تسجيل وتوثيق الوقائع الحيوية بالمستشفى</h1>
            <p className="text-slate-300 text-sm mt-1">
              إدخال وقائع الميلاد وإخطارات الوفاة إلكترونياً وتوثيقها فورياً في قواعد بيانات الهوية الوطنية
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-2 flex items-center gap-2 shadow-md">
        <button
          onClick={() => setActiveTab("birth")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "birth"
              ? "bg-cyan-600 text-white shadow-md"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <Heart className="w-4 h-4 text-rose-400" />
          <span>تسجيل واقعة ميلاد جديدة</span>
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
          <span>تسجيل واقعة وفاة رسمية</span>
        </button>

        <button
          onClick={() => setActiveTab("history")}
          className={`px-5 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "history"
              ? "bg-[#00374e] text-white shadow-md border border-cyan-500/40"
              : "text-slate-400 hover:text-white hover:bg-slate-800"
          }`}
        >
          <FileText className="w-4 h-4 text-cyan-400" />
          <span>الوقائع المسجلة والمرسلة مؤخراً ({recentEvents.length})</span>
        </button>
      </div>

      {/* TAB 1: Birth Form */}
      {activeTab === "birth" && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800 mb-6">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400 text-lg">
              👶
            </div>
            <div>
              <h3 className="text-white font-bold text-base">استمارة بلاغ ولادة إلكتروني</h3>
              <p className="text-slate-400 text-xs">
                يتم إرسال هذا الإخطار المشفر إلى السجل المدني لإصدار قيد الميلاد المبدئي وشهادة الميلاد
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmitBirth} className="space-y-5 text-xs">
            {/* Parents Verification Row */}
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

            {/* Hospital & Attending Doctor */}
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
                  onChange={(e) => setBirthForm({ ...birthForm, hospitalName: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
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

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-cyan-900/30 transition text-xs"
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
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800 mb-6">
            <div className="w-10 h-10 rounded-xl bg-rose-950/80 border border-rose-800/60 flex items-center justify-center text-rose-400 text-lg">
              📜
            </div>
            <div>
              <h3 className="text-white font-bold text-base">استمارة إخطار وإعلان وفاة رسمي</h3>
              <p className="text-slate-400 text-xs">
                يتم إرسال هذا التقرير الجنائي والسريري مباشرة إلى السجل المدني لإصدار شهادة الوفاة وإيقاف الخدمات
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmitDeath} className="space-y-5 text-xs">
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
                  onChange={(e) => setDeathForm({ ...deathForm, hospitalName: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-rose-500"
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

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-rose-700 hover:bg-rose-600 disabled:opacity-50 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-rose-950/40 transition text-xs"
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
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-white font-bold text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              سجل الوقائع الحيوية المرسلة إلكترونياً
            </h3>
            <span className="text-xs text-slate-400 font-medium">
              مرتبطة مباشرة بالسجل المدني المركزي
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
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
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {recentEvents.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3 font-mono text-cyan-400 font-semibold">{ev.certificateNumber}</td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                          ev.eventType === "Birth"
                            ? "bg-cyan-950 text-cyan-300 border border-cyan-800/60"
                            : ev.eventType === "Death"
                            ? "bg-rose-950 text-rose-300 border border-rose-800/60"
                            : "bg-emerald-950 text-emerald-300 border border-emerald-800/60"
                        }`}
                      >
                        {ev.eventType === "Birth" ? "👶 ميلاد" : ev.eventType === "Death" ? "📜 وفاة" : ev.eventType}
                      </span>
                    </td>
                    <td className="p-3 font-semibold text-white">{ev.subjectName}</td>
                    <td className="p-3 font-mono text-slate-400">{ev.eventDate}</td>
                    <td className="p-3 text-slate-400">{ev.placeOfEvent}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>موثق بالسجل المدني</span>
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">{ev.approvedByOfficer || "النظام الآلي الموحد"}</td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => window.print()}
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-medium transition inline-flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3 text-cyan-400" />
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
