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
  Upload,
  QrCode,
  AlertCircle,
  CreditCard,
  Sparkles,
} from "lucide-react";
import { civilRegistryService } from "@/lib/api/civilRegistryService";
import { filesService } from "@/lib/api/filesService";
import { QrCodeModal } from "@/components/shared/QrCodeModal";
import {
  FamilySummaryDto,
  FamilyDto,
  FamilyMemberDto,
  CreateFamilyCardCommand,
  RenewFamilyCardCommand,
  AddWifeCommand,
  UpdateFamilyMemberStatusCommand,
  FamilyMemberStatus,
} from "@/types/civilRegistry";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";

function FamiliesContent() {
  const { user } = useAuth();
  const { toast } = useNotification();

  // Data states
  const [families, setFamilies] = useState<FamilySummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [modalError, setModalError] = useState<string | null>(null);

  // Scope: "branch" | "all"
  const [viewScope, setViewScope] = useState<"branch" | "all">("branch");

  // Official Family Card Preview Modal
  const [viewCardFamily, setViewCardFamily] = useState<FamilyDto | null>(null);
  const [loadingCard, setLoadingCard] = useState<string | null>(null);

  // In-memory cache of full family details to support searching by wife/dependents
  const [familiesDetailsCache, setFamiliesDetailsCache] = useState<Record<string, FamilyDto>>({});

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [renewModalOpen, setRenewModalOpen] = useState(false);
  const [addWifeModalOpen, setAddWifeModalOpen] = useState(false);
  const [selectedFamilyDetails, setSelectedFamilyDetails] = useState<FamilyDto | null>(null);
  const [qrModalFamily, setQrModalFamily] = useState<FamilyDto | null>(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [statusUpdateModal, setStatusUpdateModal] = useState<{
    familyMemberId: string;
    personName: string;
    currentStatus: string;
  } | null>(null);
  const [newMemberStatus, setNewMemberStatus] = useState<FamilyMemberStatus>("Active");
  const [leftAtDate, setLeftAtDate] = useState("");

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

  const branchCivilRegistryDefault = user?.branchId || "018f7d9a-2000-7000-8000-000000000001";


  // Form: Create Family Card
  const [createForm, setCreateForm] = useState({
    husbandNationalNumber: "",
    wifeNationalNumber: "",
    marriageContractNumber: "MAR-2026-001",
    marriageDate: new Date().toISOString().split("T")[0],
    contractPhotoUrl: "",
  });

  // Form: Add Wife
  const [addWifeForm, setAddWifeForm] = useState({
    husbandNationalNumber: "",
    wifeNationalNumber: "",
    marriageContractNumber: "MAR-2026-002",
    marriageDate: new Date().toISOString().split("T")[0],
    contractPhotoUrl: "",
  });

  const [uploadingCreateDoc, setUploadingCreateDoc] = useState(false);
  const [createDocFileName, setCreateDocFileName] = useState("");
  const [uploadingAddWifeDoc, setUploadingAddWifeDoc] = useState(false);
  const [addWifeDocFileName, setAddWifeDocFileName] = useState("");

  const handleCreateDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingCreateDoc(true);
    try {
      const docUrl = await filesService.uploadDocument(file);
      setCreateForm((prev) => ({ ...prev, contractPhotoUrl: docUrl }));
      setCreateDocFileName(file.name);
      showNotification("success", "تم إرفاق وثيقة عقد الزواج بنجاح.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشل رفع وثيقة عقد الزواج.";
      showNotification("error", msg);
    } finally {
      setUploadingCreateDoc(false);
    }
  };

  const handleAddWifeDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAddWifeDoc(true);
    try {
      const docUrl = await filesService.uploadDocument(file);
      setAddWifeForm((prev) => ({ ...prev, contractPhotoUrl: docUrl }));
      setAddWifeDocFileName(file.name);
      showNotification("success", "تم إرفاق وثيقة عقد الزواج بنجاح.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشل رفع وثيقة عقد الزواج.";
      showNotification("error", msg);
    } finally {
      setUploadingAddWifeDoc(false);
    }
  };

  // Form: Renew Family Card
  const [renewForm, setRenewForm] = useState({
    familyNumber: "",
  });

  const fetchFamilies = async () => {
    setLoading(true);
    try {
      const data = await civilRegistryService.getFamilies();
      setFamilies(data);

      // Background prefetch details for search and wife display
      data.forEach(async (f) => {
        try {
          const detail = await civilRegistryService.getFamilyById(f.id);
          if (detail) {
            setFamiliesDetailsCache((prev) => ({ ...prev, [f.id]: detail }));
          }
        } catch {}
      });
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

  // Filter families by branch if user is not SUPER_ADMIN and scope is "branch"
  const branchFamilies = React.useMemo(() => {
    if (viewScope === "all" || !user || user.role === "SUPER_ADMIN" || !user.branchId) {
      return families;
    }
    const userBranchId = user.branchId.toLowerCase();
    const userBranchName = user.branchName?.trim().toLowerCase();
    return families.filter(
      (f) =>
        (f.issuingBranchId && f.issuingBranchId.toLowerCase() === userBranchId) ||
        (userBranchName && f.branchName && f.branchName.trim().toLowerCase() === userBranchName)
    );
  }, [families, user, viewScope]);

  // Filtered Families: smart search supporting husband, wife, children, and national search fallback
  const filteredFamilies = React.useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return branchFamilies;

    // Search in current branch view first
    const primary = branchFamilies.filter((f) => {
      const basicMatch =
        f.familyNumber.toLowerCase().includes(q) ||
        f.headOfFamilyFullName.toLowerCase().includes(q) ||
        f.headOfFamilyNationalNumber.toLowerCase().includes(q) ||
        f.branchName.toLowerCase().includes(q);

      if (basicMatch) return true;

      const cached = familiesDetailsCache[f.id];
      if (cached && cached.members) {
        return cached.members.some(
          (m) =>
            m.nationalNumber.toLowerCase().includes(q) ||
            m.fullName.toLowerCase().includes(q)
        );
      }
      return false;
    });

    if (primary.length > 0) return primary;

    // If not found in current branch, search across ALL families nationally so nothing is hidden
    return families.filter((f) => {
      const basicMatch =
        f.familyNumber.toLowerCase().includes(q) ||
        f.headOfFamilyFullName.toLowerCase().includes(q) ||
        f.headOfFamilyNationalNumber.toLowerCase().includes(q) ||
        f.branchName.toLowerCase().includes(q);

      if (basicMatch) return true;

      const cached = familiesDetailsCache[f.id];
      if (cached && cached.members) {
        return cached.members.some(
          (m) =>
            m.nationalNumber.toLowerCase().includes(q) ||
            m.fullName.toLowerCase().includes(q)
        );
      }
      return false;
    });
  }, [branchFamilies, families, searchTerm, familiesDetailsCache]);

  // Open Official Digital Family Card Preview
  const handleViewCard = async (fam: FamilySummaryDto) => {
    setLoadingCard(fam.id);
    try {
      let details = familiesDetailsCache[fam.id];
      if (!details) {
        const res = await civilRegistryService.getFamilyById(fam.id);
        if (res) {
          details = res;
          setFamiliesDetailsCache((prev) => ({ ...prev, [fam.id]: res }));
        }
      }
      if (details) {
        setViewCardFamily(details);
      } else {
        showNotification("error", "تعذر جلب تفاصيل البطاقة العائلية.");
      }
    } catch (err: unknown) {
      showNotification("error", "فشل جلب تفاصيل البطاقة العائلية.");
    } finally {
      setLoadingCard(null);
    }
  };

  // Open Family Tree / Details
  const handleViewFamily = async (familyId: string) => {
    setLoadingDetails(true);
    try {
      const details = await civilRegistryService.getFamilyById(familyId);
      setSelectedFamilyDetails(details);
      if (details) {
        setFamiliesDetailsCache((prev) => ({ ...prev, [familyId]: details }));
      }
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
      showNotification("error", "يرجى ملء الرقم الوطني للزوج والزوجة.");
      return;
    }

    setSubmitting(true);
    try {
      const cmd: CreateFamilyCardCommand = {
        husbandNationalNumber: createForm.husbandNationalNumber.trim(),
        wifeNationalNumber: createForm.wifeNationalNumber.trim(),
        marriageContractNumber: createForm.marriageContractNumber.trim(),
        marriageDate: createForm.marriageDate,
        contractPhotoUrl: createForm.contractPhotoUrl.trim() || undefined,
        issuingBranchId: branchCivilRegistryDefault,
      };

      const newFamily = await civilRegistryService.createFamilyCard(cmd);
      setCreateModalOpen(false);
      setCreateForm({
        husbandNationalNumber: "",
        wifeNationalNumber: "",
        marriageContractNumber: "MAR-2026-001",
        marriageDate: new Date().toISOString().split("T")[0],
        contractPhotoUrl: "",
      });
      setCreateDocFileName("");
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
      showNotification("error", "يرجى ملء الرقم الوطني للزوج والزوجة.");
      return;
    }

    setSubmitting(true);
    try {
      const cmd: AddWifeCommand = {
        husbandNationalNumber: addWifeForm.husbandNationalNumber.trim(),
        wifeNationalNumber: addWifeForm.wifeNationalNumber.trim(),
        marriageContractNumber: addWifeForm.marriageContractNumber.trim(),
        marriageDate: addWifeForm.marriageDate,
        contractPhotoUrl: addWifeForm.contractPhotoUrl.trim() || undefined,
        issuingBranchId: branchCivilRegistryDefault,
      };

      const updated = await civilRegistryService.addWife(cmd);
      setAddWifeModalOpen(false);
      setAddWifeForm({
        husbandNationalNumber: "",
        wifeNationalNumber: "",
        marriageContractNumber: "MAR-2026-002",
        marriageDate: new Date().toISOString().split("T")[0],
        contractPhotoUrl: "",
      });
      setAddWifeDocFileName("");
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
      showNotification("error", "يرجى إدخال رقم القيد العائلي.");
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
        familyMemberId: statusUpdateModal.familyMemberId,
        newStatus: newMemberStatus,
        leftAt: leftAtDate ? new Date(leftAtDate).toISOString() : undefined,
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
            إدارة القيود والبطاقات العائلية (Family Cards & Records)
          </h1>
          <p className="text-sm text-[#41484d] mt-1">
            فتح القيود العائلية، إصدار وتجديد ومعاينة البطاقات العائلية، توثيق الزيجات، وإدارة أفراد الأسرة حياً عبر الباكند.
          </p>

          {/* Scope Selector: Branch vs National Scope */}
          <div className="flex flex-wrap items-center gap-2 mt-2.5">
            <button
              type="button"
              onClick={() => setViewScope("branch")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewScope === "branch"
                  ? "bg-emerald-50 border border-emerald-300 text-emerald-800 shadow-2xs ring-1 ring-emerald-300"
                  : "bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600"
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>سجلات فرعي ({user?.branchName || "الفرع الحالي"})</span>
            </button>

            <button
              type="button"
              onClick={() => setViewScope("all")}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewScope === "all"
                  ? "bg-[#0C4A4E] text-white border border-[#0C4A4E] shadow-2xs"
                  : "bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-600"
              }`}
            >
              <Users className="w-3.5 h-3.5 text-emerald-300" />
              <span>جميع الفروع (السجل المدني الوطني الموحد)</span>
            </button>

            {searchTerm && (
              <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                <span>بحث ذكي شامل (يشمل الزوج والزوجة والأبناء)</span>
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchFamilies}
            disabled={loading}
            className="p-2.5 bg-white border border-[#e0e3e5] rounded-xl hover:bg-slate-50 text-slate-700 transition-all flex items-center gap-2 text-xs font-bold cursor-pointer"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 text-[#0C4A4E] ${loading ? "animate-spin" : ""}`} />
            <span>تحديث</span>
          </button>

          <button
            onClick={() => setAddWifeModalOpen(true)}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all border border-[#e0e3e5] flex items-center gap-2 cursor-pointer"
          >
            <HeartHandshake className="w-4 h-4 text-[#0C4A4E]" />
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
            className="px-5 py-2.5 bg-[#0C4A4E] hover:bg-[#052F31] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
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
            <span className="text-xs font-bold text-[#41484d]">
              {viewScope === "branch" ? "سجلات الفرع العائلية" : "إجمالي القيود بالجمهورية"}
            </span>
            <span className="p-2 rounded-xl bg-[#E6F1EE]/40 text-[#0C4A4E]">
              <Users className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-[#052F31]">
            {branchFamilies.length.toLocaleString("ar-YE")}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {viewScope === "branch" ? `صادرة ومقيدة بفرع (${user?.branchName || "الفرع الحالي"})` : "سجلات معتمدة بالسجل المدني المركزي"}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e0e3e5] shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-[#41484d]">البطاقات العائلية السارية</span>
            <span className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-emerald-800">
            {branchFamilies.filter((f) => f.status === "Active" || !f.status).length.toLocaleString("ar-YE")}
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
            {branchFamilies.reduce((acc, f) => acc + (f.activeMembersCount || 0), 0).toLocaleString("ar-YE")}
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
          placeholder="بحث برقم القيد أو البطاقة العائلية (11 خانة)، اسم رب الأسرة، أو الرقم الوطني للزوج أو الزوجة..."
          className="w-full pr-11 pl-16 py-3 bg-white border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0C4A4E] shadow-xs font-medium"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm("")}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer px-2 py-1 rounded bg-slate-100 hover:bg-slate-200"
          >
            مسح
          </button>
        )}
      </div>

      {/* Families Table */}
      <div className="bg-white border border-[#e0e3e5] rounded-2xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
            <Loader2 className="w-8 h-8 animate-spin text-[#0C4A4E]" />
            <p className="text-xs">جاري استرجاع السجلات العائلية الحية من الباكند...</p>
          </div>
        ) : filteredFamilies.length === 0 ? (
          <div className="py-16 text-center text-slate-500 space-y-2">
            <Users className="w-12 h-12 mx-auto text-slate-300 mb-1" />
            <p className="font-semibold text-sm">لا توجد سجلات عائلية مطابقة لمعايير البحث</p>
            <p className="text-xs text-slate-400">
              {viewScope === "branch"
                ? "القيد قد يكون مقيداً بفرع آخر. جرب التبديل إلى (جميع الفروع) للبحث على مستوى الجمهورية."
                : "يمكنك فتح قيد عائلي جديد بالضغط على الزر أعلاه."}
            </p>
            {viewScope === "branch" && (
              <button
                type="button"
                onClick={() => setViewScope("all")}
                className="mt-2 px-3.5 py-1.5 bg-[#0C4A4E] hover:bg-[#052F31] text-white rounded-lg text-xs font-bold cursor-pointer"
              >
                البحث في جميع فروع الجمهورية
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-[#f7f9fb] border-b border-[#e0e3e5] text-[#41484d] font-bold">
                <tr>
                  <th className="py-3 px-4">رقم البطاقة / القيد</th>
                  <th className="py-3 px-4">رب الأسرة (الزوج)</th>
                  <th className="py-3 px-4">الرقم الوطني للزوج</th>
                  <th className="py-3 px-4">الزوجة المشمولة</th>
                  <th className="py-3 px-4">عدد الأفراد</th>
                  <th className="py-3 px-4">فرع الإصدار</th>
                  <th className="py-3 px-4">سريان البطاقة</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4 text-center">إجراءات البطاقة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eceef0]">
                {filteredFamilies.map((fam) => {
                  const isActive = fam.status === "Active" || !fam.status;
                  const cached = familiesDetailsCache[fam.id];
                  const activeWives = cached?.members?.filter(
                    (m) => m.relationshipType === "Wife" && m.status === "Active"
                  );
                  const firstWife = activeWives && activeWives.length > 0 ? activeWives[0] : null;

                  return (
                    <tr key={fam.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-[#052F31]">
                        <div className="flex items-center gap-1.5">
                          <CreditCard className="w-3.5 h-3.5 text-[#147A77]" />
                          <span>{fam.familyNumber}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold text-[#191c1e]">
                        {fam.headOfFamilyFullName}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {fam.headOfFamilyNationalNumber}
                      </td>
                      <td className="py-3 px-4">
                        {firstWife ? (
                          <div>
                            <span className="font-bold text-[#052F31] block">{firstWife.fullName}</span>
                            <span className="text-[10px] text-slate-500 font-mono block">
                              {firstWife.nationalNumber} {activeWives && activeWives.length > 1 && `(+${activeWives.length - 1} زوجات)`}
                            </span>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">قيد الزوجة مسجل</span>
                        )}
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
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewCard(fam)}
                            disabled={loadingCard === fam.id}
                            className="px-3 py-1.5 bg-[#0C4A4E] hover:bg-[#052F31] text-white rounded-lg font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-60"
                            title="معاينة وطباعة البطاقة العائلية الإلكترونية"
                          >
                            {loadingCard === fam.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <CreditCard className="w-3.5 h-3.5" />
                            )}
                            <span>معاينة البطاقة العائلية</span>
                          </button>

                          <button
                            onClick={() => handleViewFamily(fam.id)}
                            className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs flex items-center gap-1 transition-all cursor-pointer border border-slate-200"
                            title="عرض تفاصيل القيد وشجرة أفراد الأسرة"
                          >
                            <Users className="w-3.5 h-3.5 text-slate-600" />
                            <span>شجرة الأسرة</span>
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

      {/* Modal 1: Create Family Card */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-[#e0e3e5]">
            <div className="flex justify-between items-center pb-4 border-b border-[#eceef0]">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#0C4A4E]" />
                <h3 className="font-extrabold text-[#052F31] text-base">
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
                  className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs font-mono focus:outline-none focus:border-[#0C4A4E]"
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
                  className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs font-mono focus:outline-none focus:border-[#0C4A4E]"
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
                    className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0C4A4E]"
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
                    className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0C4A4E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  صورة / مسح عقد الزواج (اختياري)
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex items-center justify-center gap-2 p-3 border-2 border-dashed border-[#e0e3e5] rounded-xl hover:border-[#0C4A4E] cursor-pointer transition-all bg-slate-50/50 hover:bg-slate-50">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={handleCreateDocUpload}
                      disabled={uploadingCreateDoc}
                    />
                    {uploadingCreateDoc ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#0C4A4E]" />
                    ) : (
                      <Upload className="w-4 h-4 text-slate-500" />
                    )}
                    <span className="text-xs text-slate-600 font-medium">
                      {uploadingCreateDoc
                        ? "جاري رفع الوثيقة..."
                        : createForm.contractPhotoUrl
                        ? "تم إرفاق صورة العقد (انقر للتغيير)"
                        : "رفع صورة أو PDF لعقد الزواج"}
                    </span>
                  </label>
                </div>
                {createForm.contractPhotoUrl && (
                  <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 animate-in fade-in">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-700">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-emerald-900 truncate">
                          {createDocFileName || "تم إرفاق وثيقة عقد الزواج بنجاح"}
                        </p>
                        <p className="text-[10px] text-emerald-700">
                          تم حفظ الوثيقة وجاهزة للاعتماد
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCreateForm((prev) => ({ ...prev, contractPhotoUrl: "" }));
                        setCreateDocFileName("");
                      }}
                      className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors shrink-0 cursor-pointer"
                    >
                      إزالة
                    </button>
                  </div>
                )}
              </div>

              {modalError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2 animate-in fade-in">
                  <div className="flex items-start gap-2 text-xs text-rose-800">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-bold">{modalError}</p>
                      {modalError.includes("يمتلك بالفعل بطاقة عائلية") && (
                        <p className="text-[11px] text-rose-700 mt-1">
                          الزوج مسجل مسبقاً ولديه بطاقة عائلية نشطة. يمكنك التوجه مباشرة لخدمة (إضافة زوجة) لربطها بنفس القيد العائلي أو البحث عن بطاقته ومعاينتها.
                        </p>
                      )}
                    </div>
                  </div>

                  {modalError.includes("يمتلك بالفعل بطاقة عائلية") && (
                    <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-rose-200/60">
                      <button
                        type="button"
                        onClick={() => {
                          const hNum = createForm.husbandNationalNumber;
                          const wNum = createForm.wifeNationalNumber;
                          const cNum = createForm.marriageContractNumber;
                          const mDate = createForm.marriageDate;
                          const cUrl = createForm.contractPhotoUrl;
                          const cFileName = createDocFileName;
                          setCreateModalOpen(false);
                          setModalError(null);
                          setAddWifeForm({
                            husbandNationalNumber: hNum,
                            wifeNationalNumber: wNum,
                            marriageContractNumber: cNum,
                            marriageDate: mDate,
                            contractPhotoUrl: cUrl,
                          });
                          setAddWifeDocFileName(cFileName);
                          setAddWifeModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <HeartHandshake className="w-3.5 h-3.5" />
                        <span>فتح خدمة (إضافة زوجة) ونقل البيانات تلقائياً</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const hNum = createForm.husbandNationalNumber;
                          setCreateModalOpen(false);
                          setModalError(null);
                          setViewScope("all");
                          setSearchTerm(hNum);
                        }}
                        className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Search className="w-3.5 h-3.5" />
                        <span>تحديد ومعاينة بطاقة الزوج في الجدول</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

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
                  className="px-5 py-2 bg-[#0C4A4E] hover:bg-[#052F31] text-white rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer disabled:opacity-60"
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
                <h3 className="font-extrabold text-[#052F31] text-base">
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
                  className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs font-mono focus:outline-none focus:border-[#0C4A4E]"
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
                  className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs font-mono focus:outline-none focus:border-[#0C4A4E]"
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
                    className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0C4A4E]"
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
                    className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0C4A4E]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  صورة / مسح عقد الزواج (اختياري)
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex-1 flex items-center justify-center gap-2 p-3 border-2 border-dashed border-[#e0e3e5] rounded-xl hover:border-emerald-600 cursor-pointer transition-all bg-slate-50/50 hover:bg-slate-50">
                    <input
                      type="file"
                      accept="image/*,application/pdf"
                      className="hidden"
                      onChange={handleAddWifeDocUpload}
                      disabled={uploadingAddWifeDoc}
                    />
                    {uploadingAddWifeDoc ? (
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                    ) : (
                      <Upload className="w-4 h-4 text-slate-500" />
                    )}
                    <span className="text-xs text-slate-600 font-medium">
                      {uploadingAddWifeDoc
                        ? "جاري رفع الوثيقة..."
                        : addWifeForm.contractPhotoUrl
                        ? "تم إرفاق صورة العقد (انقر للتغيير)"
                        : "رفع صورة أو PDF لعقد الزواج"}
                    </span>
                  </label>
                </div>
                {addWifeForm.contractPhotoUrl && (
                  <div className="mt-2 p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3 animate-in fade-in">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 text-emerald-700">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-emerald-900 truncate">
                          {addWifeDocFileName || "تم إرفاق وثيقة عقد الزواج بنجاح"}
                        </p>
                        <p className="text-[10px] text-emerald-700">
                          تم حفظ الوثيقة وجاهزة للاعتماد
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setAddWifeForm((prev) => ({ ...prev, contractPhotoUrl: "" }));
                        setAddWifeDocFileName("");
                      }}
                      className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors shrink-0 cursor-pointer"
                    >
                      إزالة
                    </button>
                  </div>
                )}
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
                <h3 className="font-extrabold text-[#052F31] text-base">
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
                  className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs font-mono focus:outline-none focus:border-[#0C4A4E]"
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
                  onClick={() => setRenewModalOpen(false)}
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
                  <span>تأكيد التجديد</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Official Digital Family Card (معاينة البطاقة العائلية الإلكترونية) */}
      {viewCardFamily && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[95vh] overflow-y-auto space-y-5">
            {/* Modal Header */}
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-extrabold text-[#052F31] text-base">
                  البطاقة العائلية الإلكترونية (معاينة رقمية رسمية)
                </h3>
              </div>
              <button
                onClick={() => setViewCardFamily(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Electronic Family Card Graphic */}
            <div className="w-full bg-gradient-to-br from-[#052F31] via-[#0C4A4E] to-[#042426] text-white p-6 rounded-3xl shadow-xl relative overflow-hidden border-2 border-emerald-500/30">
              {/* Background watermark badge */}
              <div className="absolute -top-12 -left-12 w-48 h-48 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-teal-300/10 rounded-full blur-2xl pointer-events-none"></div>

              {/* Card Official Top Bar */}
              <div className="flex justify-between items-start border-b border-white/20 pb-4 mb-4 relative z-10">
                <div>
                  <p className="text-[11px] text-white/80 font-bold tracking-wide">الجمهورية اليمنية • وزارة الداخلية</p>
                  <p className="text-sm font-extrabold text-white mt-0.5">مصلحة الأحوال المدنية والسجل المدني</p>
                  <p className="text-[9px] text-emerald-300 font-mono tracking-wider mt-0.5">
                    REPUBLIC OF YEMEN • CIVIL REGISTRY AUTHORITY • FAMILY CARD
                  </p>
                </div>

                <div className="text-left bg-white/10 px-3.5 py-2 rounded-xl border border-white/20 backdrop-blur-xs">
                  <span className="text-[10px] text-emerald-200 font-bold block">رقم القيد العائلي</span>
                  <span className="text-base font-black font-mono tracking-wider text-white">
                    {viewCardFamily.familyNumber}
                  </span>
                </div>
              </div>

              {/* Head of Family (Husband) Section */}
              <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 border border-white/15 mb-4 relative z-10">
                <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-white/15">
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span className="text-xs font-black text-emerald-200">بيانات رب الأسرة (الزوج)</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-white/70 block">الاسم الرباعي واللقب:</span>
                    <span className="font-extrabold text-white text-sm block">
                      {viewCardFamily.headOfFamilyFullName}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/70 block">الرقم الوطني الدائم:</span>
                    <span className="font-mono font-black text-emerald-300 text-sm tracking-wider block">
                      {viewCardFamily.headOfFamilyNationalNumber}
                    </span>
                  </div>
                </div>
              </div>

              {/* Wives Section */}
              <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 border border-white/15 mb-4 relative z-10">
                <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-white/15">
                  <div className="flex items-center gap-2">
                    <HeartHandshake className="w-4 h-4 text-pink-300" />
                    <span className="text-xs font-black text-pink-200">الزوجة / الزوجات المشمولات في القيد</span>
                  </div>
                  <span className="text-[10px] bg-pink-500/20 text-pink-200 px-2 py-0.5 rounded-full font-bold">
                    {viewCardFamily.members?.filter((m) => m.relationshipType === "Wife").length || 0} زوجة
                  </span>
                </div>

                <div className="space-y-2">
                  {viewCardFamily.members?.filter((m) => m.relationshipType === "Wife").length > 0 ? (
                    viewCardFamily.members
                      ?.filter((m) => m.relationshipType === "Wife")
                      .map((wife, idx) => (
                        <div
                          key={wife.id || idx}
                          className="bg-black/20 rounded-xl p-2.5 flex items-center justify-between border border-white/10 text-xs"
                        >
                          <div>
                            <span className="font-bold text-white block">{wife.fullName}</span>
                            <span className="font-mono text-[11px] text-emerald-300 block">
                              الرقم الوطني: {wife.nationalNumber}
                            </span>
                          </div>
                          <div className="text-left">
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                wife.status === "Active"
                                  ? "bg-emerald-500/30 text-emerald-200 border border-emerald-400/40"
                                  : "bg-rose-500/30 text-rose-200 border border-rose-400/40"
                              }`}
                            >
                              {wife.status === "Active" ? "عصمة نشطة" : wife.status}
                            </span>
                          </div>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-2 text-white/60 text-xs">
                      لا توجد زوجة مقيدة حالياً في هذا السجل العائلي
                    </div>
                  )}
                </div>
              </div>

              {/* Children Section */}
              {viewCardFamily.members?.some((m) => m.relationshipType === "Son" || m.relationshipType === "Daughter") && (
                <div className="bg-white/10 backdrop-blur-xs rounded-2xl p-4 border border-white/15 mb-4 relative z-10">
                  <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-white/15">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-sky-300" />
                      <span className="text-xs font-black text-sky-200">الأبناء والبنات المشمولون</span>
                    </div>
                    <span className="text-[10px] bg-sky-500/20 text-sky-200 px-2 py-0.5 rounded-full font-bold">
                      {
                        viewCardFamily.members?.filter(
                          (m) => m.relationshipType === "Son" || m.relationshipType === "Daughter"
                        ).length
                      }{" "}
                      أفراد
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {viewCardFamily.members
                      ?.filter((m) => m.relationshipType === "Son" || m.relationshipType === "Daughter")
                      .map((child, idx) => (
                        <div
                          key={child.id || idx}
                          className="bg-black/20 rounded-xl p-2 border border-white/10 text-xs flex justify-between items-center"
                        >
                          <div>
                            <span className="font-bold text-white block">{child.fullName}</span>
                            <span className="font-mono text-[10px] text-white/70 block">
                              {child.relationshipType === "Son" ? "ابن" : "ابنة"} • {child.nationalNumber}
                            </span>
                          </div>
                          <span className="text-[10px] font-mono text-white/60">{child.dateOfBirth}</span>
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* Card Meta & Barcode Footer */}
              <div className="border-t border-white/20 pt-3 flex flex-wrap justify-between items-center gap-3 text-[11px] text-white/80 relative z-10">
                <div className="space-y-0.5">
                  <div>
                    <span className="text-white/60">فرع الإصدار: </span>
                    <span className="font-bold text-white">{viewCardFamily.branchName || "مصلحة الأحوال المدنية"}</span>
                  </div>
                  <div>
                    <span className="text-white/60">تاريخ الإصدار والانتهاء: </span>
                    <span className="font-mono text-emerald-200">
                      {viewCardFamily.issueDate} - {viewCardFamily.expiryDate}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="text-left font-mono text-[10px] text-emerald-200 bg-emerald-950/40 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                    <span className="block font-bold">وثيقة رقمية معتمدة</span>
                    <span>OFFICIAL YEMEN RECORD</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-white p-1 flex items-center justify-center shrink-0">
                    <QrCode className="w-8 h-8 text-slate-900" />
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-wrap justify-between items-center gap-3 pt-3 border-t border-slate-100">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const target = viewCardFamily;
                    setQrModalFamily(target);
                  }}
                  className="px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-teal-200"
                >
                  <QrCode className="w-3.5 h-3.5 text-teal-600" />
                  <span>فحص رمز QR للبطاقة</span>
                </button>

                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-slate-200"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-600" />
                  <span>طباعة البطاقة</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const target = viewCardFamily;
                    setViewCardFamily(null);
                    setSelectedFamilyDetails(target);
                  }}
                  className="px-3.5 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-purple-200"
                >
                  <Users className="w-3.5 h-3.5 text-purple-600" />
                  <span>إدارة شجرة أفراد الأسرة</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setViewCardFamily(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal 4: Family Details & Tree Members View */}
      {selectedFamilyDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#0C4A4E]" />
                <h3 className="font-extrabold text-[#052F31] text-base">
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
            <div className="bg-gradient-to-r from-[#052F31] to-[#0C4A4E] rounded-2xl p-5 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
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
                            {isHead && <ShieldCheck className="w-5 h-5 text-[#052F31]" />}
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
                            onClick={() => {
                              setStatusUpdateModal({
                                familyMemberId: m.id,
                                personName: m.fullName,
                                currentStatus: m.status,
                              });
                              setNewMemberStatus(
                                m.status === "Divorced" || m.status === "Deceased" || m.status === "Separated"
                                  ? m.status
                                  : "Active"
                              );
                              setLeftAtDate("");
                            }}
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
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setQrModalFamily(selectedFamilyDetails);
                  }}
                  className="px-3.5 py-2.5 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-teal-200"
                >
                  <QrCode className="w-3.5 h-3.5 text-teal-600" />
                  <span>فحص رمز QR</span>
                </button>

                <button
                  onClick={() => window.print()}
                  className="px-4 py-2.5 bg-[#052F31] hover:bg-[#0C4A4E] text-white rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة السجل</span>
                </button>
              </div>

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
                  value={newMemberStatus}
                  onChange={(e) => setNewMemberStatus(e.target.value as FamilyMemberStatus)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#0C4A4E]"
                >
                  <option value="Active">نشط (Active)</option>
                  <option value="Divorced">مطلق / مطلقة (Divorced)</option>
                  <option value="Deceased">متوفى (Deceased)</option>
                  <option value="Separated">منفصل عن الأسرة (Separated)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  تاريخ الانفصال / الوفاة / المغادرة (اختياري)
                </label>
                <input
                  type="date"
                  value={leftAtDate}
                  onChange={(e) => setLeftAtDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:outline-none focus:border-[#0C4A4E]"
                />
              </div>

              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-800 animate-in fade-in">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span className="font-medium">{modalError}</span>
                </div>
              )}

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
                  className="px-5 py-2 bg-[#0C4A4E] hover:bg-[#052F31] text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>حفظ التعديل</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Verification Modal */}
      {qrModalFamily && (
        <QrCodeModal
          isOpen={!!qrModalFamily}
          onClose={() => setQrModalFamily(null)}
          title="رمز التحقق للقيد والبطاقة العائلية"
          documentType="البطاقة العائلية الرسمية"
          documentNumber={qrModalFamily.familyNumber}
          holderName={qrModalFamily.headOfFamilyFullName}
          qrPayload={qrModalFamily.qrCodePayload || qrModalFamily.familyNumber}
        />
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
