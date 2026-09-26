"use client";

import React, { useState, useEffect, Suspense } from "react";
import {
  Users,
  Search,
  Plus,
  RefreshCw,
  Eye,
  CheckCircle2,
  Clock,
  HeartHandshake,
  UserCheck,
  UserMinus,
  RotateCcw,
  Printer,
  X,
  Loader2,
  ShieldCheck,
  Building2,
  Calendar,
  FileText,
  UserPlus,
  Heart,
  Baby,
} from "lucide-react";
import { civilRegistryService } from "@/lib/api/civilRegistryService";
import {
  FamilySummaryDto,
  FamilyDto,
  FamilyMemberDto,
  CreateFamilyCardCommand,
  RenewFamilyCardCommand,
  AddWifeCommand,
  UpdateFamilyMemberStatusCommand,
} from "@/types/civilRegistry";
import { useAuth } from "@/context/AuthContext";

function FamiliesContent() {
  const { user } = useAuth();

  // Data states
  const [families, setFamilies] = useState<FamilySummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [renewModalOpen, setRenewModalOpen] = useState(false);
  const [addWifeModalOpen, setAddWifeModalOpen] = useState(false);
  const [selectedFamilyDetails, setSelectedFamilyDetails] = useState<FamilyDto | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [statusUpdateModal, setStatusUpdateModal] = useState<{
    familyId: string;
    personId: string;
    personName: string;
    currentStatus: string;
  } | null>(null);
  const [newStatusValue, setNewStatusValue] = useState(0); // 0=Active, 1=Divorced, 2=Deceased, 3=Left
  const [statusReason, setStatusReason] = useState("");

  // Notifications
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const showNotification = (type: "success" | "error" | "info", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const branchCivilRegistryDefault = user?.branchId || "018f7d9a-2000-7000-8000-000000000002";

  // Form: Create Family Card
  const [createForm, setCreateForm] = useState({
    husbandNationalNumber: "",
    wifeNationalNumber: "",
    marriageContractNumber: "MAR-2026-001",
    marriageDate: new Date().toISOString().split("T")[0],
  });

  // Form: Add Wife
  const [addWifeForm, setAddWifeForm] = useState({
    husbandNationalNumber: "",
    wifeNationalNumber: "",
    marriageContractNumber: "MAR-2026-002",
    marriageDate: new Date().toISOString().split("T")[0],
  });

  // Form: Renew Family Card
  const [renewForm, setRenewForm] = useState({
    familyNumber: "",
  });

  const fetchFamilies = async () => {
    setLoading(true);
    try {
      const data = await civilRegistryService.getFamilies();
      setFamilies(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشل جلب قائمة القيود العائلية من الباكند.";
      showNotification("error", msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFamilies();
  }, []);

  // Filtered Families
  const filteredFamilies = families.filter((f) => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return true;
    return (
      f.familyNumber.includes(q) ||
      f.headOfFamilyFullName.toLowerCase().includes(q) ||
      f.headOfFamilyNationalNumber.includes(q) ||
      f.branchName.toLowerCase().includes(q)
    );
  });

  // Open Family Tree / Details
  const handleViewFamily = async (familyId: string) => {
    setLoadingDetails(true);
    try {
      const details = await civilRegistryService.getFamilyById(familyId);
      setSelectedFamilyDetails(details);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشل جلب تفاصيل شجرة الأسرة.";
      showNotification("error", msg);
    } finally {
      setLoadingDetails(false);
    }
  };

  // Submit Create Family
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.husbandNationalNumber || !createForm.wifeNationalNumber) {
      alert("يرجى ملء الرقم الوطني للزوج والزوجة.");
      return;
    }

    setSubmitting(true);
    try {
      const cmd: CreateFamilyCardCommand = {
        husbandNationalNumber: createForm.husbandNationalNumber.trim(),
        wifeNationalNumber: createForm.wifeNationalNumber.trim(),
        marriageContractNumber: createForm.marriageContractNumber.trim(),
        marriageDate: createForm.marriageDate,
        issuingBranchId: branchCivilRegistryDefault,
      };

      const newFamily = await civilRegistryService.createFamilyCard(cmd);
      setCreateModalOpen(false);
      showNotification("success", `تم إنشاء القيد العائلي وإصدار البطاقة برقم [${newFamily.familyNumber}] بنجاح.`);
      fetchFamilies();
      setSelectedFamilyDetails(newFamily);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشلت عملية إنشاء القيد العائلي.";
      showNotification("error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Add Wife
  const handleAddWifeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addWifeForm.husbandNationalNumber || !addWifeForm.wifeNationalNumber) {
      alert("يرجى ملء الرقم الوطني للزوج والزوجة.");
      return;
    }

    setSubmitting(true);
    try {
      const cmd: AddWifeCommand = {
        husbandNationalNumber: addWifeForm.husbandNationalNumber.trim(),
        wifeNationalNumber: addWifeForm.wifeNationalNumber.trim(),
        marriageContractNumber: addWifeForm.marriageContractNumber.trim(),
        marriageDate: addWifeForm.marriageDate,
        issuingBranchId: branchCivilRegistryDefault,
      };

      const updated = await civilRegistryService.addWife(cmd);
      setAddWifeModalOpen(false);
      showNotification("success", "تم توثيق عقد الزواج وإضافة الزوجة للسجل العائلي بنجاح.");
      fetchFamilies();
      setSelectedFamilyDetails(updated);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشلت عملية إضافة الزوجة.";
      showNotification("error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Renew Family Card
  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewForm.familyNumber) {
      alert("يرجى إدخال رقم القيد العائلي.");
      return;
    }

    setSubmitting(true);
    try {
      const cmd: RenewFamilyCardCommand = {
        familyNumber: renewForm.familyNumber.trim(),
        issuingBranchId: branchCivilRegistryDefault,
      };

      const renewed = await civilRegistryService.renewFamilyCard(cmd);
      setRenewModalOpen(false);
      showNotification("success", `تم تجديد البطاقة العائلية رقم [${renewed.familyNumber}] بنجاح.`);
      fetchFamilies();
      setSelectedFamilyDetails(renewed);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشلت عملية تجديد البطاقة العائلية.";
      showNotification("error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Update Member Status
  const handleUpdateStatusSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusUpdateModal) return;

    setSubmitting(true);
    try {
      const cmd: UpdateFamilyMemberStatusCommand = {
        familyId: statusUpdateModal.familyId,
        personId: statusUpdateModal.personId,
        status: Number(newStatusValue),
        reason: statusReason,
      };

      await civilRegistryService.updateFamilyMemberStatus(cmd);
      setStatusUpdateModal(null);
      showNotification("success", "تم تحديث حالة فرد الأسرة وقيده في السجل المدني بنجاح.");
      if (selectedFamilyDetails) {
        handleViewFamily(selectedFamilyDetails.id);
      }
      fetchFamilies();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشل تحديث حالة فرد الأسرة.";
      showNotification("error", msg);
    } finally {
      setSubmitting(false);
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
              : "bg-rose-700 border border-rose-400"
          }`}
        >
          <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-[#00374e] uppercase tracking-wider">
              مصلحة الأحوال المدنية والسجل المدني • {user?.branchName || "الفرع المركزي"}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#00374e]">
            إدارة القيود والسجلات العائلية (Family Records)
          </h1>
          <p className="text-sm text-[#41484d] mt-1">
            فتح القيود العائلية، إصدار وتجديد البطاقات العائلية، توثيق الزيجات، وإدارة أفراد الأسرة حياً عبر الباكند.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchFamilies}
            disabled={loading}
            className="p-2.5 bg-white border border-[#e0e3e5] rounded-xl hover:bg-slate-50 text-slate-700 transition-all flex items-center gap-2 text-xs font-bold cursor-pointer"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 text-[#0b4f6c] ${loading ? "animate-spin" : ""}`} />
            <span>تحديث</span>
          </button>

          <button
            onClick={() => setAddWifeModalOpen(true)}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all border border-[#e0e3e5] flex items-center gap-2 cursor-pointer"
          >
            <HeartHandshake className="w-4 h-4 text-[#0b4f6c]" />
            <span>إضافة زوجة لقيد قائم</span>
          </button>

          <button
            onClick={() => setRenewModalOpen(true)}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all border border-[#e0e3e5] flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-slate-600" />
            <span>تجديد بطاقة عائلية</span>
          </button>

          <button
            onClick={() => setCreateModalOpen(true)}
            className="px-5 py-2.5 bg-[#0b4f6c] hover:bg-[#00374e] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إنشاء قيد وإصدار بطاقة عائلية</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#e0e3e5] shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-[#41484d]">السجلات والبطاقات العائلية</span>
            <span className="p-2 rounded-xl bg-[#c5e7ff]/40 text-[#0b4f6c]">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-[#00374e]">
            {families.length.toLocaleString("ar-YE")}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">قيد عائلي معتمد في السجل المركزي</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e0e3e5] shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-[#41484d]">البطاقات العائلية السارية</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-800">
            {families.filter((f) => f.status === "Active" || !f.status).length.toLocaleString("ar-YE")}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">سارية الصلاحية قانونياً</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e0e3e5] shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-[#41484d]">إجمالي أفراد الأسر المشمولين</span>
            <span className="p-2 rounded-xl bg-purple-50 text-purple-700">
              <UserCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-purple-900">
            {families.reduce((acc, f) => acc + (f.activeMembersCount || 0), 0).toLocaleString("ar-YE")}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">أرباب أسر وزوجات وأبناء</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="بحث برقم القيد العائلي (11 خانة)، اسم رب الأسرة، أو الرقم الوطني لرب الأسرة..."
          className="w-full pr-11 pl-4 py-3 bg-white border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0b4f6c] shadow-xs"
        />
      </div>

      {/* Families Table */}
      <div className="bg-white border border-[#e0e3e5] rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-[#0b4f6c]" />
            <p className="text-xs">جاري استرجاع السجلات العائلية الحية من الباكند...</p>
          </div>
        ) : filteredFamilies.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Users className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-sm">لا توجد سجلات عائلية مطابقة لمعايير البحث</p>
            <p className="text-xs text-slate-400 mt-1">يمكنك فتح قيد عائلي جديد بالضغط على الزر أعلاه.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#f7f9fb] border-b border-[#e0e3e5] text-[#41484d] font-bold">
                <tr>
                  <th className="py-3 px-4">رقم القيد العائلي</th>
                  <th className="py-3 px-4">رب الأسرة</th>
                  <th className="py-3 px-4">الرقم الوطني لرب الأسرة</th>
                  <th className="py-3 px-4">عدد الأفراد</th>
                  <th className="py-3 px-4">فرع الإصدار</th>
                  <th className="py-3 px-4">سريان البطاقة</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eceef0]">
                {filteredFamilies.map((fam) => {
                  const isActive = fam.status === "Active" || !fam.status;
                  return (
                    <tr key={fam.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#00374e]">
                        {fam.familyNumber}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#191c1e]">
                        {fam.headOfFamilyFullName}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {fam.headOfFamilyNationalNumber}
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-full font-bold bg-purple-50 text-purple-700 text-[11px] border border-purple-200">
                          {fam.activeMembersCount} أفراد
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {fam.branchName || "مصلحة الأحوال المدنية"}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {fam.issueDate} إلى {fam.expiryDate}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold flex items-center gap-1 w-fit ${
                            isActive
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              : "bg-amber-50 text-amber-700 border border-amber-200"
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{isActive ? "سارية" : fam.status}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => handleViewFamily(fam.id)}
                          className="px-3 py-1.5 bg-[#0b4f6c] hover:bg-[#00374e] text-white rounded-lg font-bold text-xs flex items-center gap-1.5 mx-auto transition-all cursor-pointer shadow-xs"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>شجرة الأسرة</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal 1: Create Family Card */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#e0e3e5]">
            <div className="flex justify-between items-center pb-4 border-b border-[#eceef0]">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#0b4f6c]" />
                <h3 className="font-extrabold text-[#00374e] text-base">
                  إنشاء قيد عائلي وإصدار بطاقة عائلية
                </h3>
              </div>
              <button
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 pt-4">
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-xs text-sky-900 leading-relaxed">
                يتم ربط الزوجين وتوثيق عقد الزواج وتوليد رقم قيد عائلي رسمي وإصدار البطاقة العائلية للزوج (رب الأسرة) تلقائياً.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الرقم الوطني للزوج (رب الأسرة - 11 خانة) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={11}
                  value={createForm.husbandNationalNumber}
                  onChange={(e) => setCreateForm({ ...createForm, husbandNationalNumber: e.target.value })}
                  placeholder="01001000001"
                  className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs font-mono focus:outline-none focus:border-[#0b4f6c]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الرقم الوطني للزوجة (11 خانة) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={11}
                  value={createForm.wifeNationalNumber}
                  onChange={(e) => setCreateForm({ ...createForm, wifeNationalNumber: e.target.value })}
                  placeholder="01001000002"
                  className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs font-mono focus:outline-none focus:border-[#0b4f6c]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رقم عقد الزواج *
                  </label>
                  <input
                    type="text"
                    required
                    value={createForm.marriageContractNumber}
                    onChange={(e) => setCreateForm({ ...createForm, marriageContractNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0b4f6c]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    تاريخ الزواج *
                  </label>
                  <input
                    type="date"
                    required
                    value={createForm.marriageDate}
                    onChange={(e) => setCreateForm({ ...createForm, marriageDate: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0b4f6c]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#eceef0]">
                <button
                  type="button"
                  onClick={() => setCreateModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#0b4f6c] hover:bg-[#00374e] text-white rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>إنشاء القيد وإصدار البطاقة</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add Wife */}
      {addWifeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e0e3e5]">
            <div className="flex justify-between items-center pb-4 border-b border-[#eceef0]">
              <div className="flex items-center gap-2">
                <HeartHandshake className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-[#00374e] text-base">
                  إضافة زوجة لقيد عائلي قائم
                </h3>
              </div>
              <button
                onClick={() => setAddWifeModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddWifeSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الرقم الوطني للزوج (11 خانة) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={11}
                  value={addWifeForm.husbandNationalNumber}
                  onChange={(e) => setAddWifeForm({ ...addWifeForm, husbandNationalNumber: e.target.value })}
                  placeholder="01001000001"
                  className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs font-mono focus:outline-none focus:border-[#0b4f6c]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الرقم الوطني للزوجة الجديدة (11 خانة) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={11}
                  value={addWifeForm.wifeNationalNumber}
                  onChange={(e) => setAddWifeForm({ ...addWifeForm, wifeNationalNumber: e.target.value })}
                  placeholder="01001000002"
                  className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs font-mono focus:outline-none focus:border-[#0b4f6c]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    رقم عقد الزواج *
                  </label>
                  <input
                    type="text"
                    required
                    value={addWifeForm.marriageContractNumber}
                    onChange={(e) => setAddWifeForm({ ...addWifeForm, marriageContractNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0b4f6c]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    تاريخ الزواج *
                  </label>
                  <input
                    type="date"
                    required
                    value={addWifeForm.marriageDate}
                    onChange={(e) => setAddWifeForm({ ...addWifeForm, marriageDate: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0b4f6c]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#eceef0]">
                <button
                  type="button"
                  onClick={() => setAddWifeModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>توثيق وإضافة</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: Renew Family Card */}
      {renewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e0e3e5]">
            <div className="flex justify-between items-center pb-4 border-b border-[#eceef0]">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-slate-700" />
                <h3 className="font-extrabold text-[#00374e] text-base">
                  تجديد بطاقة عائلية
                </h3>
              </div>
              <button
                onClick={() => setRenewModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRenewSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  رقم القيد / البطاقة العائلية (11 خانة) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={11}
                  value={renewForm.familyNumber}
                  onChange={(e) => setRenewForm({ ...renewForm, familyNumber: e.target.value })}
                  placeholder="02001000001"
                  className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs font-mono focus:outline-none focus:border-[#0b4f6c]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#eceef0]">
                <button
                  type="button"
                  onClick={() => setRenewModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#0b4f6c] hover:bg-[#00374e] text-white rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>تأكيد التجديد</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 4: Family Details & Tree Members View */}
      {selectedFamilyDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#0b4f6c]" />
                <h3 className="font-extrabold text-[#00374e] text-base">
                  سجل الأسرة التفصيلي وشجرة الأعضاء (قيد: {selectedFamilyDetails.familyNumber})
                </h3>
              </div>
              <button
                onClick={() => setSelectedFamilyDetails(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Family Summary Banner */}
            <div className="bg-gradient-to-r from-[#00374e] to-[#0b4f6c] rounded-2xl p-5 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-[10px] text-white/70 block">رب الأسرة:</span>
                <span className="font-black text-lg block">{selectedFamilyDetails.headOfFamilyFullName}</span>
                <span className="font-mono text-xs text-emerald-300">
                  الرقم الوطني: {selectedFamilyDetails.headOfFamilyNationalNumber}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/20">
                  <span className="text-white/70 block text-[10px]">فرع القيد:</span>
                  <span className="font-bold">{selectedFamilyDetails.branchName || "الأحوال المدنية"}</span>
                </div>
                <div className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/20">
                  <span className="text-white/70 block text-[10px]">الصلاحية:</span>
                  <span className="font-mono">{selectedFamilyDetails.issueDate} - {selectedFamilyDetails.expiryDate}</span>
                </div>
              </div>
            </div>

            {/* Members List */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-slate-700 flex items-center justify-between">
                <span>أفراد الأسرة المسجلين بالقيد ({selectedFamilyDetails.members?.length || 0}):</span>
                <span className="text-[11px] text-slate-400">محدثة ومربوطة بالسجل المدني المركزي</span>
              </h4>

              <div className="space-y-2">
                {selectedFamilyDetails.members && selectedFamilyDetails.members.length > 0 ? (
                  selectedFamilyDetails.members.map((m) => {
                    const isHead = m.relationshipType === "Head";
                    const isWife = m.relationshipType === "Wife";
                    const isSon = m.relationshipType === "Son";
                    const isDaughter = m.relationshipType === "Daughter";

                    return (
                      <div
                        key={m.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between hover:bg-slate-100/60 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center shrink-0">
                            {isHead && <ShieldCheck className="w-5 h-5 text-[#00374e]" />}
                            {isWife && <Heart className="w-5 h-5 text-pink-600" />}
                            {isSon && <Baby className="w-5 h-5 text-blue-600" />}
                            {isDaughter && <Baby className="w-5 h-5 text-pink-500" />}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-xs text-slate-900">{m.fullName}</span>
                              <span className="text-[10px] px-2 py-0.5 rounded font-bold bg-slate-200 text-slate-700">
                                {isHead ? "رب الأسرة" : isWife ? "زوجة" : isSon ? "ابن" : isDaughter ? "ابنة" : m.relationshipType}
                              </span>
                              <span
                                className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                  m.status === "Active"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : m.status === "Divorced"
                                    ? "bg-rose-100 text-rose-800"
                                    : "bg-slate-200 text-slate-700"
                                }`}
                              >
                                {m.status === "Active" ? "نشط" : m.status === "Divorced" ? "مطلق" : m.status}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                              الرقم الوطني: {m.nationalNumber} • الميلاد: {m.dateOfBirth}
                            </div>
                          </div>
                        </div>

                        {!isHead && (
                          <button
                            onClick={() =>
                              setStatusUpdateModal({
                                familyId: selectedFamilyDetails.id,
                                personId: m.personId,
                                personName: m.fullName,
                                currentStatus: m.status,
                              })
                            }
                            className="px-2.5 py-1 bg-white hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-lg text-[11px] font-semibold transition-all cursor-pointer"
                          >
                            تعديل الحالة
                          </button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-6 text-slate-400 text-xs">لا يوجد أفراد مسجلين في هذا القيد.</div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-between items-center pt-3 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-[#00374e] hover:bg-[#0b4f6c] text-white rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة السجل العائلي</span>
              </button>

              <button
                onClick={() => setSelectedFamilyDetails(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 5: Update Member Status */}
      {statusUpdateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-sm">
                تحديث حالة الفرد ({statusUpdateModal.personName})
              </h3>
              <button
                onClick={() => setStatusUpdateModal(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateStatusSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الحالة الجديدة *
                </label>
                <select
                  value={newStatusValue}
                  onChange={(e) => setNewStatusValue(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#0b4f6c]"
                >
                  <option value={0}>نشط (Active)</option>
                  <option value={1}>مطلق / مطلقة (Divorced)</option>
                  <option value={2}>متوفى (Deceased)</option>
                  <option value={3}>مغادر الأسرة (Left)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  سبب التغيير / رقم وثيقة الطلاق أو المغادرة
                </label>
                <input
                  type="text"
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="مثال: وثيقة طلاق صادرة من المحكمة..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#0b4f6c]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setStatusUpdateModal(null)}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-xs font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#0b4f6c] hover:bg-[#00374e] text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>حفظ التعديل</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function FamilyRecordsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">جاري تحميل القيود العائلية...</div>}>
      <FamiliesContent />
    </Suspense>
  );
}
