"use client";

import React, { useState, useEffect, Suspense } from "react";
import {
  CreditCard,
  Search,
  Plus,
  RefreshCw,
  Eye,
  History,
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCcw,
  Printer,
  X,
  Loader2,
  ShieldCheck,
  QrCode,
  User,
  Calendar,
  Building2,
  MapPin,
} from "lucide-react";
import { civilRegistryService } from "@/lib/api/civilRegistryService";
import {
  NationalIdCardDto,
  IssueNationalIdCardCommand,
  RenewNationalIdCardCommand,
} from "@/types/civilRegistry";
import { useAuth } from "@/context/AuthContext";

function IdCardsContent() {
  const { user } = useAuth();

  // Data states
  const [cards, setCards] = useState<NationalIdCardDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modals
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [renewModalOpen, setRenewModalOpen] = useState(false);
  const [viewCardModal, setViewCardModal] = useState<NationalIdCardDto | null>(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyCards, setHistoryCards] = useState<NationalIdCardDto[]>([]);
  const [historyNationalNumber, setHistoryNationalNumber] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(false);

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

  // Form: Issue Card
  const [issueForm, setIssueForm] = useState({
    firstName: "",
    fatherName: "",
    grandfatherName: "",
    familyName: "",
    dateOfBirth: "1995-05-15",
    placeOfBirth: "صنعاء",
    gender: 0, // 0 = Male, 1 = Female
    bloodGroup: 6, // 6 = OPos
    maritalStatus: 0, // 0 = Single, 1 = Married
    nationality: "يمني",
    governorate: "أمانة العاصمة",
    district: "السبعين",
    addressDetails: "شارع حدة",
  });

  // Form: Renew Card
  const [renewForm, setRenewForm] = useState({
    nationalNumber: "",
    maritalStatus: 1,
    governorate: "أمانة العاصمة",
    district: "السبعين",
    addressDetails: "شارع حدة",
  });

  const fetchCards = async () => {
    setLoading(true);
    try {
      const data = await civilRegistryService.getNationalIdCards();
      setCards(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشل جلب قائمة البطاقات الشخصية من الباكند.";
      showNotification("error", msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCards();
  }, []);

  // Filtered Cards
  const filteredCards = cards.filter((c) => {
    const q = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !q ||
      c.nationalNumber.includes(q) ||
      c.fullName.toLowerCase().includes(q) ||
      c.branchName.toLowerCase().includes(q);

    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "Active" && (c.status === "Active" || !c.status)) ||
      c.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Submit Issue
  const handleIssueSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!issueForm.firstName || !issueForm.fatherName || !issueForm.familyName) {
      alert("يرجى ملء الاسم الرباعي كاملاً.");
      return;
    }

    setSubmitting(true);
    try {
      const cmd: IssueNationalIdCardCommand = {
        firstName: issueForm.firstName.trim(),
        fatherName: issueForm.fatherName.trim(),
        grandfatherName: issueForm.grandfatherName.trim() || issueForm.fatherName.trim(),
        familyName: issueForm.familyName.trim(),
        dateOfBirth: issueForm.dateOfBirth,
        placeOfBirth: issueForm.placeOfBirth,
        gender: Number(issueForm.gender),
        bloodGroup: Number(issueForm.bloodGroup),
        maritalStatus: Number(issueForm.maritalStatus),
        nationality: issueForm.nationality,
        governorate: issueForm.governorate,
        district: issueForm.district,
        addressDetails: issueForm.addressDetails,
        issuingBranchId: branchCivilRegistryDefault,
      };

      const newCard = await civilRegistryService.issueNationalIdCard(cmd);
      setCards((prev) => [newCard, ...prev]);
      setIssueModalOpen(false);
      showNotification("success", `تم إصدار البطاقة الشخصية الذكية برقم وطني [${newCard.nationalNumber}] بنجاح.`);
      setViewCardModal(newCard);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشلت عملية إصدار البطاقة الشخصية.";
      showNotification("error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Submit Renew
  const handleRenewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renewForm.nationalNumber) {
      alert("يرجى إدخال الرقم الوطني للمواطن.");
      return;
    }

    setSubmitting(true);
    try {
      const cmd: RenewNationalIdCardCommand = {
        nationalNumber: renewForm.nationalNumber.trim(),
        maritalStatus: Number(renewForm.maritalStatus),
        governorate: renewForm.governorate,
        district: renewForm.district,
        addressDetails: renewForm.addressDetails,
        issuingBranchId: branchCivilRegistryDefault,
      };

      const renewed = await civilRegistryService.renewNationalIdCard(cmd);
      setCards((prev) => [renewed, ...prev.filter((c) => c.nationalNumber !== renewed.nationalNumber)]);
      setRenewModalOpen(false);
      showNotification("success", `تم تجديد البطاقة الشخصية للرقم الوطني [${renewed.nationalNumber}] لمدة 10 سنوات بنجاح.`);
      setViewCardModal(renewed);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشلت عملية تجديد البطاقة الشخصية.";
      showNotification("error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  // Load History
  const handleViewHistory = async (nationalNumber: string) => {
    setHistoryNationalNumber(nationalNumber);
    setHistoryModalOpen(true);
    setLoadingHistory(true);
    try {
      const history = await civilRegistryService.getNationalIdCardHistory(nationalNumber);
      setHistoryCards(history);
    } catch {
      setHistoryCards([]);
    } finally {
      setLoadingHistory(false);
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
            إدارة البطاقات الشخصية والهوية الوطنية (National ID Cards)
          </h1>
          <p className="text-sm text-[#41484d] mt-1">
            إصدار وتجديد البطاقات الذكية، إسناد الأرقام الوطنية، ومطابقة الهوية الرقمية مباشرة مع الباكند.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchCards}
            disabled={loading}
            className="p-2.5 bg-white border border-[#e0e3e5] rounded-xl hover:bg-slate-50 text-slate-700 transition-all flex items-center gap-2 text-xs font-bold cursor-pointer"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 text-[#0b4f6c] ${loading ? "animate-spin" : ""}`} />
            <span>تحديث</span>
          </button>

          <button
            onClick={() => setRenewModalOpen(true)}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all border border-[#e0e3e5] flex items-center gap-2 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4 text-slate-600" />
            <span>تجديد بطاقة قائمة</span>
          </button>

          <button
            onClick={() => setIssueModalOpen(true)}
            className="px-5 py-2.5 bg-[#0b4f6c] hover:bg-[#00374e] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إصدار بطاقة شخصية جديدة</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#e0e3e5] shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-[#41484d]">البطاقات الشخصية النشطة</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-[#00374e]">
            {cards.filter((c) => c.status === "Active" || !c.status).length.toLocaleString("ar-YE")}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">سارية المفعول قانونياً</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e0e3e5] shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-[#41484d]">البطاقات المنتهية الصلاحية</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-amber-800">
            {cards.filter((c) => c.status === "Expired").length.toLocaleString("ar-YE")}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">بحاجة لتجديد رسمي</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e0e3e5] shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-[#41484d]">إجمالي سجلات الهوية</span>
            <span className="p-2 rounded-xl bg-sky-50 text-sky-700">
              <CreditCard className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            {cards.length.toLocaleString("ar-YE")}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">مسجلة في قاعدة السجل المدني</span>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-2xl border border-[#e0e3e5] shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث بالرقم الوطني (11 خانة)، اسم المواطن، أو الفرع..."
            className="w-full pr-11 pl-4 py-2.5 bg-[#f7f9fb] border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0b4f6c]"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#f7f9fb] border border-[#e0e3e5] rounded-xl px-4 py-2 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="all">كافة الحالات</option>
            <option value="Active">نشطة وسارية</option>
            <option value="Expired">منتهية الصلاحية</option>
            <option value="Suspended">موقوفة</option>
          </select>
        </div>
      </div>

      {/* Cards Table */}
      <div className="bg-white border border-[#e0e3e5] rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-[#0b4f6c]" />
            <p className="text-xs">جاري استرجاع البطاقات الشخصية الحية من الباكند...</p>
          </div>
        ) : filteredCards.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <CreditCard className="w-12 h-12 mx-auto text-slate-300 mb-2" />
            <p className="font-semibold text-sm">لا توجد بطاقات شخصية مطابقة لمعايير البحث</p>
            <p className="text-xs text-slate-400 mt-1">يمكنك إصدار بطاقة شخصية جديدة بالضغط على الزر أعلاه.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#f7f9fb] border-b border-[#e0e3e5] text-[#41484d] font-bold">
                <tr>
                  <th className="py-3 px-4">الرقم الوطني</th>
                  <th className="py-3 px-4">اسم المواطن</th>
                  <th className="py-3 px-4">فرع الإصدار</th>
                  <th className="py-3 px-4">تاريخ الإصدار</th>
                  <th className="py-3 px-4">تاريخ الانتهاء</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eceef0]">
                {filteredCards.map((card) => {
                  const isActive = card.status === "Active" || !card.status;
                  return (
                    <tr key={card.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                        {card.nationalNumber}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#191c1e]">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-[#0b4f6c]" />
                          <span>{card.fullName}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {card.branchName || "مصلحة الأحوال المدنية"}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {card.issueDate}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {card.expiryDate}
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
                          <span>{isActive ? "نشطة وسارية" : card.status}</span>
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setViewCardModal(card)}
                            className="px-3 py-1.5 bg-slate-100 hover:bg-[#c5e7ff] text-[#00374e] rounded-lg font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                            title="معاينة البطاقة الذكية"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>معاينة</span>
                          </button>

                          <button
                            onClick={() => handleViewHistory(card.nationalNumber)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                            title="سجل البطاقات السابقة"
                          >
                            <History className="w-3.5 h-3.5" />
                            <span>السجل</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal 1: Issue New National ID Card */}
      {issueModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-[#e0e3e5] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-[#eceef0]">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#0b4f6c]" />
                <h3 className="font-extrabold text-[#00374e] text-base">
                  إصدار بطاقة شخصية ذكية جديدة
                </h3>
              </div>
              <button
                onClick={() => setIssueModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleIssueSubmit} className="space-y-4 pt-4">
              <div className="bg-sky-50 border border-sky-200 rounded-xl p-3 text-xs text-sky-900 leading-relaxed">
                تقوم هذه العملية بإنشاء قيد مواطن جديد أو إصدار الهوية الوطنية وإصدار بطاقة ذكية صالحة لمدة 10 سنوات وتوليد رمز QR مشفر تلقائياً.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الاسم الأول *
                  </label>
                  <input
                    type="text"
                    required
                    value={issueForm.firstName}
                    onChange={(e) => setIssueForm({ ...issueForm, firstName: e.target.value })}
                    placeholder="مثال: محمد"
                    className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0b4f6c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    اسم الأب *
                  </label>
                  <input
                    type="text"
                    required
                    value={issueForm.fatherName}
                    onChange={(e) => setIssueForm({ ...issueForm, fatherName: e.target.value })}
                    placeholder="مثال: عبد الله"
                    className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0b4f6c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    اسم الجد
                  </label>
                  <input
                    type="text"
                    value={issueForm.grandfatherName}
                    onChange={(e) => setIssueForm({ ...issueForm, grandfatherName: e.target.value })}
                    placeholder="مثال: أحمد"
                    className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0b4f6c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    اللقب / اسم العائلة *
                  </label>
                  <input
                    type="text"
                    required
                    value={issueForm.familyName}
                    onChange={(e) => setIssueForm({ ...issueForm, familyName: e.target.value })}
                    placeholder="مثال: الشامي"
                    className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0b4f6c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    تاريخ الميلاد *
                  </label>
                  <input
                    type="date"
                    required
                    value={issueForm.dateOfBirth}
                    onChange={(e) => setIssueForm({ ...issueForm, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0b4f6c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    مكان الميلاد
                  </label>
                  <input
                    type="text"
                    value={issueForm.placeOfBirth}
                    onChange={(e) => setIssueForm({ ...issueForm, placeOfBirth: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0b4f6c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الجنس
                  </label>
                  <select
                    value={issueForm.gender}
                    onChange={(e) => setIssueForm({ ...issueForm, gender: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0b4f6c]"
                  >
                    <option value={0}>ذكر (Male)</option>
                    <option value={1}>أنثى (Female)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الحالة الاجتماعية
                  </label>
                  <select
                    value={issueForm.maritalStatus}
                    onChange={(e) => setIssueForm({ ...issueForm, maritalStatus: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0b4f6c]"
                  >
                    <option value={0}>أعزب (Single)</option>
                    <option value={1}>متزوج (Married)</option>
                    <option value={2}>مطلق (Divorced)</option>
                    <option value={3}>أرمل (Widowed)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    فصيلة الدم
                  </label>
                  <select
                    value={issueForm.bloodGroup}
                    onChange={(e) => setIssueForm({ ...issueForm, bloodGroup: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0b4f6c]"
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
                    value={issueForm.governorate}
                    onChange={(e) => setIssueForm({ ...issueForm, governorate: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0b4f6c]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    العنوان التفصيلي
                  </label>
                  <input
                    type="text"
                    value={issueForm.addressDetails}
                    onChange={(e) => setIssueForm({ ...issueForm, addressDetails: e.target.value })}
                    placeholder="الحي، الشارع، رقم المنزل"
                    className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0b4f6c]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#eceef0]">
                <button
                  type="button"
                  onClick={() => setIssueModalOpen(false)}
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
                  <span>إصدار البطاقة الآن</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Renew ID Card */}
      {renewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-[#e0e3e5]">
            <div className="flex justify-between items-center pb-4 border-b border-[#eceef0]">
              <div className="flex items-center gap-2">
                <RotateCcw className="w-5 h-5 text-slate-700" />
                <h3 className="font-extrabold text-[#00374e] text-base">
                  تجديد بطاقة شخصية
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
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 leading-relaxed">
                يسمح بالتجديد إذا كانت البطاقة منتهية أو يتبقى على انتهائها 90 يوماً أو أقل. سيتم إلغاء سريان البطاقة القديمة تلقائياً وإصدار بطاقة سارية لعشر سنوات قادمة.
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  الرقم الوطني للمواطن (11 خانة) *
                </label>
                <input
                  type="text"
                  required
                  maxLength={11}
                  value={renewForm.nationalNumber}
                  onChange={(e) => setRenewForm({ ...renewForm, nationalNumber: e.target.value })}
                  placeholder="مثال: 01001000001"
                  className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs font-mono focus:outline-none focus:border-[#0b4f6c]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  تحديث الحالة الاجتماعية
                </label>
                <select
                  value={renewForm.maritalStatus}
                  onChange={(e) => setRenewForm({ ...renewForm, maritalStatus: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0b4f6c]"
                >
                  <option value={0}>أعزب (Single)</option>
                  <option value={1}>متزوج (Married)</option>
                  <option value={2}>مطلق (Divorced)</option>
                  <option value={3}>أرمل (Widowed)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  المحافظة الحالية
                </label>
                <input
                  type="text"
                  value={renewForm.governorate}
                  onChange={(e) => setRenewForm({ ...renewForm, governorate: e.target.value })}
                  className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0b4f6c]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  العنوان التفصيلي الحالي
                </label>
                <input
                  type="text"
                  value={renewForm.addressDetails}
                  onChange={(e) => setRenewForm({ ...renewForm, addressDetails: e.target.value })}
                  className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0b4f6c]"
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
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>تأكيد التجديد</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 3: View Digital National ID Card (Preview) */}
      {viewCardModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-[#00374e] text-sm">
                  البطاقة الشخصية الذكية (معاينة رقمية رسمية)
                </h3>
              </div>
              <button
                onClick={() => setViewCardModal(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Smart ID Card Graphic Canvas */}
            <div className="w-full bg-gradient-to-br from-[#00374e] via-[#0b4f6c] to-[#002233] text-white p-5 rounded-2xl shadow-xl relative overflow-hidden border border-[#c5e7ff]/30">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

              {/* Card Header */}
              <div className="flex justify-between items-start border-b border-white/20 pb-3 mb-4">
                <div>
                  <p className="text-[10px] text-white/70 font-semibold">الجمهورية اليمنية • وزارة الداخلية</p>
                  <p className="text-xs font-bold text-white tracking-wide">مصلحة الأحوال المدنية والسجل المدني</p>
                  <p className="text-[9px] text-[#c5e7ff] font-mono mt-0.5">REPUBLIC OF YEMEN • NATIONAL ID</p>
                </div>
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
              </div>

              {/* Card Body */}
              <div className="flex gap-4 items-center">
                <div className="w-20 h-24 rounded-xl bg-white/20 border border-white/30 flex flex-col items-center justify-center text-white/60 text-[10px] shrink-0 overflow-hidden">
                  <User className="w-10 h-10 mb-1 text-white/80" />
                  <span>صورة المواطن</span>
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
                  <div>
                    <span className="text-[9px] text-white/60 block">الاسم بالكامل:</span>
                    <span className="font-extrabold text-xs text-white truncate block">{viewCardModal.fullName}</span>
                  </div>
                  <div>
                    <span className="text-[9px] text-white/60 block">الرقم الوطني الدائم:</span>
                    <span className="font-mono font-black text-sm text-emerald-300 tracking-wider block">
                      {viewCardModal.nationalNumber}
                    </span>
                  </div>
                  <div className="flex gap-4 text-[9px] text-white/80 pt-1">
                    <div>
                      <span className="text-white/50 block">الإصدار:</span>
                      <span className="font-mono">{viewCardModal.issueDate}</span>
                    </div>
                    <div>
                      <span className="text-white/50 block">الانتهاء:</span>
                      <span className="font-mono">{viewCardModal.expiryDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer */}
              <div className="mt-4 pt-3 border-t border-white/15 flex justify-between items-center text-[10px]">
                <div className="font-mono text-white/60 text-[9px]">
                  {viewCardModal.branchName || "فرع مصلحة الأحوال المدنية"}
                </div>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[9px]">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>معتمد ورقمي</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
              <button
                onClick={() => window.print()}
                className="px-5 py-2.5 bg-[#00374e] hover:bg-[#0b4f6c] text-white rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Printer className="w-4 h-4" />
                <span>طباعة الوثيقة</span>
              </button>
              <button
                onClick={() => setViewCardModal(null)}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Card History */}
      {historyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-[#0b4f6c]" />
                <h3 className="font-extrabold text-[#00374e] text-base">
                  سجل تاريخ بطاقات المواطن ({historyNationalNumber})
                </h3>
              </div>
              <button
                onClick={() => setHistoryModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3">
              {loadingHistory ? (
                <div className="py-12 flex justify-center items-center gap-2 text-slate-500 text-xs">
                  <Loader2 className="w-5 h-5 animate-spin text-[#0b4f6c]" />
                  <span>جاري استرجاع الأرشيف التاريخي...</span>
                </div>
              ) : historyCards.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-xs">
                  لا توجد بطاقات سابقة مسجلة لهذا الرقم الوطني.
                </div>
              ) : (
                <div className="space-y-3">
                  {historyCards.map((hc, idx) => (
                    <div
                      key={hc.id || idx}
                      className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex justify-between items-center"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[#00374e]">{hc.fullName}</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                              hc.status === "Active"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {hc.status === "Active" ? "بطاقة حالية نشطة" : hc.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-1 font-mono">
                          الإصدار: {hc.issueDate} • الانتهاء: {hc.expiryDate}
                        </div>
                      </div>
                      <div className="font-mono text-xs text-slate-600">
                        {hc.branchName || "الفرع"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-100">
              <button
                onClick={() => setHistoryModalOpen(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
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

export default function NationalIdCardsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">جاري تحميل البطاقات الشخصية...</div>}>
      <IdCardsContent />
    </Suspense>
  );
}
