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
  Upload,
  Camera,
  AlertCircle,
  UserCheck,
  Edit3,
} from "lucide-react";
import { civilRegistryService } from "@/lib/api/civilRegistryService";
import { filesService } from "@/lib/api/filesService";
import {
  NationalIdCardDto,
  IssueNationalIdCardCommand,
  RenewNationalIdCardCommand,
  UpdatePersonDataCommand,
  GenderType,
  MaritalStatusType,
} from "@/types/civilRegistry";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";
import { QrCodeModal } from "@/components/shared/QrCodeModal";

function IdCardsContent() {
  const { user } = useAuth();
  const { toast } = useNotification();

  // Data states
  const [cards, setCards] = useState<NationalIdCardDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [modalError, setModalError] = useState<string | null>(null);

  // Modals
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [renewModalOpen, setRenewModalOpen] = useState(false);
  const [viewCardModal, setViewCardModal] = useState<NationalIdCardDto | null>(null);
  const [qrModalCard, setQrModalCard] = useState<NationalIdCardDto | null>(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [historyCards, setHistoryCards] = useState<NationalIdCardDto[]>([]);
  const [historyNationalNumber, setHistoryNationalNumber] = useState("");
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Upload photo states
  const [uploadingIssuePhoto, setUploadingIssuePhoto] = useState(false);
  const [uploadingRenewPhoto, setUploadingRenewPhoto] = useState(false);

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

  const branchCivilRegistryDefault = user?.branchId || "018f7d9a-2000-7000-8000-000000000002";

  // Form: Issue Card
  const [issueForm, setIssueForm] = useState<{
    firstName: string;
    fatherName: string;
    grandfatherName: string;
    familyName: string;
    dateOfBirth: string;
    placeOfBirth: string;
    gender: GenderType;
    bloodGroup: string;
    maritalStatus: MaritalStatusType;
    nationality: string;
    governorate: string;
    district: string;
    addressDetails: string;
    photoUrl: string;
  }>({
    firstName: "",
    fatherName: "",
    grandfatherName: "",
    familyName: "",
    dateOfBirth: "1995-05-15",
    placeOfBirth: "صنعاء",
    gender: "Male",
    bloodGroup: "OPositive",
    maritalStatus: "Single",
    nationality: "يمني",
    governorate: "أمانة العاصمة",
    district: "السبعين",
    addressDetails: "شارع حدة",
    photoUrl: "",
  });

  // Form: Renew Card
  const [renewForm, setRenewForm] = useState<{
    nationalNumber: string;
    maritalStatus: MaritalStatusType;
    governorate: string;
    district: string;
    addressDetails: string;
    photoUrl: string;
  }>({
    nationalNumber: "",
    maritalStatus: "Married",
    governorate: "أمانة العاصمة",
    district: "السبعين",
    addressDetails: "شارع حدة",
    photoUrl: "",
  });

  // Helper: Calculate Days Remaining until card expiry
  const getDaysRemaining = (expiryDateStr?: string): number => {
    if (!expiryDateStr) return 0;
    const expiry = new Date(expiryDateStr);
    const today = new Date();
    expiry.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffMs = expiry.getTime() - today.getTime();
    return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  };

  // Form: Edit Person Data (تعديل وتحديث بيانات المواطن)
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [uploadingEditPhoto, setUploadingEditPhoto] = useState(false);
  const [searchingCitizenForEdit, setSearchingCitizenForEdit] = useState(false);
  const [editForm, setEditForm] = useState<{
    nationalNumber: string;
    firstName: string;
    fatherName: string;
    grandfatherName: string;
    familyName: string;
    dateOfBirth: string;
    placeOfBirth: string;
    maritalStatus: MaritalStatusType;
    bloodGroup: string;
    governorate: string;
    district: string;
    addressDetails: string;
    photoUrl: string;
  }>({
    nationalNumber: "",
    firstName: "",
    fatherName: "",
    grandfatherName: "",
    familyName: "",
    dateOfBirth: "1995-05-15",
    placeOfBirth: "صنعاء",
    maritalStatus: "Single",
    bloodGroup: "OPositive",
    governorate: "أمانة العاصمة",
    district: "السبعين",
    addressDetails: "شارع حدة",
    photoUrl: "",
  });

  const handleEditPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingEditPhoto(true);
    try {
      const path = await filesService.uploadPhoto(file);
      setEditForm((prev) => ({ ...prev, photoUrl: path }));
      showNotification("success", "تم رفع الصورة الشخصية بنجاح.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشل رفع الصورة الشخصية.";
      showNotification("error", msg);
    } finally {
      setUploadingEditPhoto(false);
    }
  };

  const handleOpenEditPerson = (card?: NationalIdCardDto) => {
    setModalError(null);
    if (card) {
      const parts = card.fullName ? card.fullName.trim().split(/\s+/) : [];
      setEditForm({
        nationalNumber: card.nationalNumber,
        firstName: (card as any).firstName || parts[0] || "",
        fatherName: (card as any).fatherName || parts[1] || "",
        grandfatherName: (card as any).grandfatherName || parts[2] || (parts[1] || ""),
        familyName: (card as any).familyName || (parts.length > 3 ? parts.slice(3).join(" ") : parts[parts.length - 1] || ""),
        dateOfBirth: card.dateOfBirth || "1995-05-15",
        placeOfBirth: card.placeOfBirth || "صنعاء",
        maritalStatus: (card.maritalStatus as MaritalStatusType) || "Single",
        bloodGroup: card.bloodGroup || "OPositive",
        governorate: card.governorate || "أمانة العاصمة",
        district: card.district || "السبعين",
        addressDetails: card.addressDetails || "شارع حدة",
        photoUrl: card.photoUrl || "",
      });

      civilRegistryService.searchCitizenByNationalId(card.nationalNumber).then((c) => {
        if (c) {
          setEditForm((prev) => ({
            ...prev,
            firstName: prev.firstName || c.firstName,
            fatherName: prev.fatherName || c.fatherName,
            grandfatherName: prev.grandfatherName || c.grandfatherName,
            familyName: prev.familyName || c.familyName,
            dateOfBirth: c.dateOfBirth && c.dateOfBirth !== "—" ? c.dateOfBirth : prev.dateOfBirth,
            placeOfBirth: c.placeOfBirth && c.placeOfBirth !== "—" ? c.placeOfBirth : prev.placeOfBirth,
            maritalStatus: (c.maritalStatus as MaritalStatusType) || prev.maritalStatus,
            governorate: c.governorate && c.governorate !== "—" ? c.governorate : prev.governorate,
            district: c.district && c.district !== "—" ? c.district : prev.district,
            addressDetails: c.addressDetails || prev.addressDetails,
            photoUrl: prev.photoUrl || c.photoUrl || "",
          }));
        }
      }).catch(() => {});
    } else {
      setEditForm({
        nationalNumber: "",
        firstName: "",
        fatherName: "",
        grandfatherName: "",
        familyName: "",
        dateOfBirth: "1995-05-15",
        placeOfBirth: "صنعاء",
        maritalStatus: "Single",
        bloodGroup: "OPositive",
        governorate: "أمانة العاصمة",
        district: "السبعين",
        addressDetails: "شارع حدة",
        photoUrl: "",
      });
    }
    setEditModalOpen(true);
  };

  const handleSearchCitizenForEdit = async (natNum: string) => {
    if (!natNum || natNum.trim().length !== 11) {
      showNotification("error", "يرجى إدخال رقم وطني صحيح مكون من 11 رقماً.");
      return;
    }
    setSearchingCitizenForEdit(true);
    setModalError(null);
    try {
      const matched = cards.find((c) => c.nationalNumber === natNum.trim());
      const citizen = await civilRegistryService.searchCitizenByNationalId(natNum.trim());
      if (citizen) {
        setEditForm((prev) => ({
          ...prev,
          firstName: citizen.firstName || (matched ? matched.fullName.split(" ")[0] : prev.firstName),
          fatherName: citizen.fatherName || (matched ? matched.fullName.split(" ")[1] : prev.fatherName),
          grandfatherName: citizen.grandfatherName || (matched ? matched.fullName.split(" ")[2] : prev.grandfatherName),
          familyName: citizen.familyName || (matched ? matched.fullName.split(" ")[3] : prev.familyName),
          dateOfBirth: citizen.dateOfBirth && citizen.dateOfBirth !== "—" ? citizen.dateOfBirth : prev.dateOfBirth,
          placeOfBirth: citizen.placeOfBirth && citizen.placeOfBirth !== "—" ? citizen.placeOfBirth : prev.placeOfBirth,
          maritalStatus: (citizen.maritalStatus as MaritalStatusType) || prev.maritalStatus,
          governorate: citizen.governorate && citizen.governorate !== "—" ? citizen.governorate : prev.governorate,
          district: citizen.district && citizen.district !== "—" ? citizen.district : prev.district,
          addressDetails: citizen.addressDetails || prev.addressDetails,
          photoUrl: citizen.photoUrl || (matched ? matched.photoUrl || "" : prev.photoUrl),
        }));
        showNotification("info", `تم استرجاع بيانات المواطن: ${citizen.fullName}`);
      } else if (matched) {
        const parts = matched.fullName.trim().split(/\s+/);
        setEditForm((prev) => ({
          ...prev,
          firstName: parts[0] || "",
          fatherName: parts[1] || "",
          grandfatherName: parts[2] || (parts[1] || ""),
          familyName: parts.length > 3 ? parts.slice(3).join(" ") : parts[parts.length - 1] || "",
          photoUrl: matched.photoUrl || "",
        }));
        showNotification("info", `تم استرجاع بيانات البطاقة: ${matched.fullName}`);
      } else {
        showNotification("error", "لم يتم العثور على قيد مواطن نشط بهذا الرقم الوطني.");
      }
    } catch {
      showNotification("error", "فشل استرجاع بيانات المواطن.");
    } finally {
      setSearchingCitizenForEdit(false);
    }
  };

  const handleEditPersonSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.nationalNumber || editForm.nationalNumber.trim().length !== 11) {
      showNotification("error", "يرجى إدخال رقم وطني صحيح مكون من 11 رقماً.");
      return;
    }
    if (!editForm.firstName || !editForm.fatherName || !editForm.familyName) {
      showNotification("error", "يرجى ملء الاسم الرباعي كاملاً للمواطن.");
      return;
    }

    setSubmitting(true);
    setModalError(null);
    try {
      const cmd: UpdatePersonDataCommand = {
        nationalNumber: editForm.nationalNumber.trim(),
        firstName: editForm.firstName.trim(),
        fatherName: editForm.fatherName.trim(),
        grandfatherName: editForm.grandfatherName.trim() || editForm.fatherName.trim(),
        familyName: editForm.familyName.trim(),
        dateOfBirth: editForm.dateOfBirth,
        placeOfBirth: editForm.placeOfBirth.trim() || "صنعاء",
        maritalStatus: editForm.maritalStatus,
        bloodGroup: editForm.bloodGroup,
        governorate: editForm.governorate.trim() || "أمانة العاصمة",
        district: editForm.district.trim() || "السبعين",
        addressDetails: editForm.addressDetails.trim() || "شارع حدة",
        photoUrl: editForm.photoUrl || undefined,
      };

      const updated = await civilRegistryService.updatePersonData(cmd);
      setCards((prev) =>
        prev.map((c) =>
          c.nationalNumber === cmd.nationalNumber
            ? {
                ...c,
                ...updated,
                fullName: updated?.fullName || `${cmd.firstName} ${cmd.fatherName} ${cmd.grandfatherName} ${cmd.familyName}`.trim(),
                photoUrl: cmd.photoUrl !== undefined ? cmd.photoUrl : c.photoUrl,
              }
            : c
        )
      );
      setEditModalOpen(false);
      showNotification(
        "success",
        `تم تحديث وتعديل بيانات المواطن والبطاقة الشخصية للرقم الوطني [${cmd.nationalNumber}] بنجاح، وتبقى صلاحية البطاقة كما هي دون تغيير.`
      );
      if (updated) {
        setViewCardModal(updated);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشلت عملية تحديث بيانات المواطن.";
      showNotification("error", msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenRenew = (card?: NationalIdCardDto) => {
    setModalError(null);
    if (card) {
      setRenewForm({
        nationalNumber: card.nationalNumber,
        maritalStatus: (card.maritalStatus as MaritalStatusType) || "Married",
        governorate: card.governorate || "أمانة العاصمة",
        district: card.district || "السبعين",
        addressDetails: card.addressDetails || "شارع حدة",
        photoUrl: card.photoUrl || "",
      });
    } else {
      setRenewForm({
        nationalNumber: "",
        maritalStatus: "Married",
        governorate: "أمانة العاصمة",
        district: "السبعين",
        addressDetails: "شارع حدة",
        photoUrl: "",
      });
    }
    setRenewModalOpen(true);
  };

  const handleIssuePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingIssuePhoto(true);
    try {
      const path = await filesService.uploadPhoto(file);
      setIssueForm((prev) => ({ ...prev, photoUrl: path }));
      showNotification("success", "تم رفع الصورة الشخصية بنجاح.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشل رفع الصورة الشخصية.";
      showNotification("error", msg);
    } finally {
      setUploadingIssuePhoto(false);
    }
  };

  const handleRenewPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingRenewPhoto(true);
    try {
      const path = await filesService.uploadPhoto(file);
      setRenewForm((prev) => ({ ...prev, photoUrl: path }));
      showNotification("success", "تم رفع الصورة الشخصية بنجاح.");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشل رفع الصورة الشخصية.";
      showNotification("error", msg);
    } finally {
      setUploadingRenewPhoto(false);
    }
  };

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

  // Isolate cards by branch if user is not SUPER_ADMIN
  const branchCards = React.useMemo(() => {
    if (!user || user.role === "SUPER_ADMIN" || !user.branchId) {
      return cards;
    }
    const userBranchId = user.branchId.toLowerCase();
    const userBranchName = user.branchName?.trim().toLowerCase();
    return cards.filter(
      (c) =>
        (c.issuingBranchId && c.issuingBranchId.toLowerCase() === userBranchId) ||
        (userBranchName && c.branchName && c.branchName.trim().toLowerCase() === userBranchName)
    );
  }, [cards, user]);

  // Filtered Cards within user's branch
  const filteredCards = branchCards.filter((c) => {
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
      showNotification("error", "يرجى ملء الاسم الرباعي كاملاً.");
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
        gender: issueForm.gender,
        bloodGroup: issueForm.bloodGroup,
        maritalStatus: issueForm.maritalStatus,
        nationality: issueForm.nationality,
        governorate: issueForm.governorate,
        district: issueForm.district,
        addressDetails: issueForm.addressDetails,
        photoUrl: issueForm.photoUrl || undefined,
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
      showNotification("error", "يرجى إدخال الرقم الوطني للمواطن.");
      return;
    }

    setSubmitting(true);
    try {
      const cmd: RenewNationalIdCardCommand = {
        nationalNumber: renewForm.nationalNumber.trim(),
        maritalStatus: renewForm.maritalStatus,
        governorate: renewForm.governorate,
        district: renewForm.district,
        addressDetails: renewForm.addressDetails,
        photoUrl: renewForm.photoUrl || undefined,
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
            إدارة البطاقات الشخصية والهوية الوطنية (National ID Cards)
          </h1>
          <p className="text-sm text-[#41484d] mt-1">
            إصدار وتجديد البطاقات الذكية، إسناد الأرقام الوطنية، ومطابقة الهوية الرقمية مباشرة مع الباكند.
          </p>
          {user?.role !== "SUPER_ADMIN" && user?.branchName && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold mt-2">
              <Building2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>نطاق العرض محدد بأعمال فرع: {user.branchName}</span>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={fetchCards}
            disabled={loading}
            className="p-2.5 bg-white border border-[#e0e3e5] rounded-xl hover:bg-slate-50 text-slate-700 transition-all flex items-center gap-2 text-xs font-bold cursor-pointer"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 text-[#0C4A4E] ${loading ? "animate-spin" : ""}`} />
            <span>تحديث</span>
          </button>

          <button
            onClick={() => handleOpenEditPerson()}
            className="px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold rounded-xl transition-all border border-emerald-200 flex items-center gap-2 cursor-pointer shadow-xs"
            title="تعديل وتحديث بيانات المواطن السارية (الحالة، العنوان، الصورة، فصيلة الدم) دون المساس بصلاحية الكرت"
          >
            <UserCheck className="w-4 h-4 text-emerald-700" />
            <span>تعديل بيانات مواطن / بطاقة</span>
          </button>

          <button
            onClick={() => handleOpenRenew()}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-all border border-[#e0e3e5] flex items-center gap-2 cursor-pointer"
            title="تجديد البطاقات المنتهية أو القريبة من الانتهاء (90 يوماً أو أقل)"
          >
            <RotateCcw className="w-4 h-4 text-slate-600" />
            <span>تجديد بطاقة قائمة</span>
          </button>

          <button
            onClick={() => setIssueModalOpen(true)}
            className="px-5 py-2.5 bg-[#0C4A4E] hover:bg-[#052F31] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
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
          <div className="text-2xl font-black font-mono text-[#052F31]">
            {branchCards.filter((c) => c.status === "Active" || !c.status).length.toLocaleString("ar-YE")}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {user?.role !== "SUPER_ADMIN" ? `سارية المفعول لفرع (${user?.branchName || "الفرع الحالى"})` : "سارية المفعول قانونياً"}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e0e3e5] shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-[#41484d]">البطاقات المنتهية الصلاحية</span>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-700">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-amber-800">
            {branchCards.filter((c) => c.status === "Expired").length.toLocaleString("ar-YE")}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">بحاجة لتجديد رسمي</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e0e3e5] shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-[#41484d]">
              {user?.role !== "SUPER_ADMIN" ? "إجمالي بطاقات الفرع" : "إجمالي سجلات الهوية"}
            </span>
            <span className="p-2 rounded-xl bg-sky-50 text-sky-700">
              <CreditCard className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl font-black font-mono text-slate-900">
            {branchCards.length.toLocaleString("ar-YE")}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {user?.role !== "SUPER_ADMIN" ? `صادرة من ${user?.branchName || "هذا الفرع"}` : "مسجلة في كافة فروع الجمهورية"}
          </span>
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
            className="w-full pr-11 pl-4 py-2.5 bg-[#f7f9fb] border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0C4A4E]"
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
            <Loader2 className="w-8 h-8 animate-spin text-[#0C4A4E]" />
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
                  const daysRemaining = getDaysRemaining(card.expiryDate);
                  const isEligibleForRenewal = !isActive || daysRemaining <= 90;

                  return (
                    <tr key={card.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                        {card.nationalNumber}
                      </td>
                      <td className="py-3 px-4 font-bold text-[#191c1e]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 overflow-hidden shrink-0 relative flex items-center justify-center">
                            {card.photoUrl ? (
                              <img
                                src={filesService.getFullUrl(card.photoUrl)}
                                alt={card.fullName}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  (e.target as HTMLElement).style.display = "none";
                                  const fallback = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                                  if (fallback) fallback.style.display = "flex";
                                }}
                              />
                            ) : null}
                            <div
                              className={`w-full h-full flex items-center justify-center bg-[#052F31]/10 text-[#052F31] font-bold text-xs ${
                                card.photoUrl ? "hidden" : "flex"
                              }`}
                            >
                              {card.fullName ? card.fullName.trim().charAt(0) : "م"}
                            </div>
                          </div>
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
                        <div>{card.expiryDate}</div>
                        <div className="text-[10px] text-slate-400">
                          {daysRemaining > 0 ? `متبقي ${daysRemaining} يوماً` : "منتهية الصلاحية"}
                        </div>
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
                        <div className="flex items-center justify-center gap-1.5 flex-wrap">
                          {/* Edit Person Data */}
                          <button
                            onClick={() => handleOpenEditPerson(card)}
                            className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                            title="تعديل وتحديث بيانات المواطن والبطاقة السارية"
                          >
                            <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                            <span>تعديل البيانات</span>
                          </button>

                          {/* Renew Card */}
                          {isEligibleForRenewal ? (
                            <button
                              onClick={() => handleOpenRenew(card)}
                              className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg font-bold text-xs flex items-center gap-1 transition-all cursor-pointer shadow-2xs"
                              title={`مؤهلة للتجديد (متبقي ${daysRemaining} يوماً)`}
                            >
                              <RotateCcw className="w-3.5 h-3.5 text-amber-700" />
                              <span>تجديد</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                showNotification(
                                  "info",
                                  `البطاقة سارية حتى ${card.expiryDate} (متبقي ${daysRemaining} يوماً). التجديد متاح فقط خلال 90 يوماً قبل الانتهاء. لتحديث الحالة أو العنوان استخدم زر (تعديل البيانات).`
                                );
                              }}
                              className="px-2 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 border border-slate-200 rounded-lg text-[11px] flex items-center gap-1 transition-all cursor-pointer"
                              title={`سارية (متبقي ${daysRemaining} يوماً) - انقر للمعلومات`}
                            >
                              <Clock className="w-3 h-3 text-slate-400" />
                              <span>سارية ({daysRemaining} ي)</span>
                            </button>
                          )}

                          <button
                            onClick={() => setQrModalCard(card)}
                            className="p-1.5 bg-slate-100 hover:bg-teal-50 hover:text-teal-700 text-slate-600 rounded-lg transition-colors cursor-pointer"
                            title="فحص رمز QR والتحقق الرسمي"
                          >
                            <QrCode className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setViewCardModal(card)}
                            className="px-2 py-1.5 bg-slate-100 hover:bg-[#E6F1EE] text-[#052F31] rounded-lg font-bold text-xs flex items-center gap-1 transition-all cursor-pointer"
                            title="معاينة البطاقة الذكية"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>معاينة</span>
                          </button>

                          <button
                            onClick={() => handleViewHistory(card.nationalNumber)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                            title="سجل البطاقات السابقة"
                          >
                            <History className="w-3.5 h-3.5" />
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
                <CreditCard className="w-5 h-5 text-[#0C4A4E]" />
                <h3 className="font-extrabold text-[#052F31] text-base">
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

              {/* Photo Upload with Live Preview */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-24 h-28 rounded-xl bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                  {issueForm.photoUrl ? (
                    <img
                      src={filesService.getFullUrl(issueForm.photoUrl)}
                      alt="الصورة الشخصية"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-2 text-slate-400">
                      <Camera className="w-8 h-8 mx-auto mb-1 opacity-50" />
                      <span className="text-[10px]">لا توجد صورة</span>
                    </div>
                  )}
                  {uploadingIssuePhoto && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-right w-full">
                  <div>
                    <label className="block text-xs font-bold text-slate-700">
                      الصورة الشخصية البيومترية للمواطن
                    </label>
                    <p className="text-[11px] text-slate-500">
                      يُفضل خلفية بيضاء وملامح واضحة (الحد الأقصى 3 ميجابايت بصيغ JPG, PNG, WEBP)
                    </p>
                  </div>

                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <label className="px-3 py-1.5 bg-[#052F31] hover:bg-[#0C4A4E] text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors flex items-center gap-1.5 shadow-sm">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{issueForm.photoUrl ? "تغيير الصورة" : "رفع صورة شخصية"}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/jpg"
                        onChange={handleIssuePhotoUpload}
                        className="hidden"
                        disabled={uploadingIssuePhoto}
                      />
                    </label>
                    {issueForm.photoUrl && (
                      <button
                        type="button"
                        onClick={() => setIssueForm((prev) => ({ ...prev, photoUrl: "" }))}
                        className="px-2.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold rounded-xl border border-rose-200 transition-colors"
                      >
                        إزالة
                      </button>
                    )}
                  </div>
                </div>
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
                    className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0C4A4E]"
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
                    className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0C4A4E]"
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
                    className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0C4A4E]"
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
                    className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0C4A4E]"
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
                    className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0C4A4E]"
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
                    className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0C4A4E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الجنس
                  </label>
                  <select
                    value={issueForm.gender}
                    onChange={(e) => setIssueForm({ ...issueForm, gender: e.target.value as GenderType })}
                    className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0C4A4E]"
                  >
                    <option value="Male">ذكر (Male)</option>
                    <option value="Female">أنثى (Female)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الحالة الاجتماعية
                  </label>
                  <select
                    value={issueForm.maritalStatus}
                    onChange={(e) => setIssueForm({ ...issueForm, maritalStatus: e.target.value as MaritalStatusType })}
                    className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0C4A4E]"
                  >
                    <option value="Single">أعزب (Single)</option>
                    <option value="Married">متزوج (Married)</option>
                    <option value="Divorced">مطلق (Divorced)</option>
                    <option value="Widowed">أرمل (Widowed)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    فصيلة الدم
                  </label>
                  <select
                    value={issueForm.bloodGroup}
                    onChange={(e) => setIssueForm({ ...issueForm, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0C4A4E]"
                  >
                    <option value="APositive">A+</option>
                    <option value="ANegative">A-</option>
                    <option value="BPositive">B+</option>
                    <option value="BNegative">B-</option>
                    <option value="ABPositive">AB+</option>
                    <option value="ABNegative">AB-</option>
                    <option value="OPositive">O+</option>
                    <option value="ONegative">O-</option>
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
                    className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0C4A4E]"
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
                  onClick={() => setIssueModalOpen(false)}
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
                <h3 className="font-extrabold text-[#052F31] text-base">
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

              {/* Smart Renewal Eligibility Check */}
              {(() => {
                const nat = renewForm.nationalNumber.trim();
                if (!nat || nat.length !== 11) return null;
                const matched = cards.find((c) => c.nationalNumber === nat);
                if (!matched) return null;
                const days = getDaysRemaining(matched.expiryDate);
                const isDisallowed = (matched.status === "Active" || !matched.status) && days > 90;
                if (isDisallowed) {
                  return (
                    <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl space-y-2.5 animate-in fade-in">
                      <div className="flex items-start gap-2.5">
                        <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                        <div className="text-xs text-rose-900 leading-relaxed">
                          <p className="font-extrabold text-rose-950">
                            لا يمكن تجديد البطاقة الشخصية حالياً؛ التجديد متاح فقط خلال 3 أشهر (90 يوماً) قبل الانتهاء.
                          </p>
                          <p className="mt-1 font-mono text-rose-800">
                            الأيام المتبقية لسريان البطاقة: <strong>{days} يوماً</strong> (تاريخ الانتهاء: {matched.expiryDate}).
                          </p>
                          <p className="mt-1 text-slate-700">
                            إذا كنت ترغب بتحديث الحالة الاجتماعية، العنوان أو الصورة الشخصية، يرجى استخدام خدمة <strong>تعديل بيانات المواطن</strong>.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setRenewModalOpen(false);
                          handleOpenEditPerson(matched);
                        }}
                        className="w-full py-2 px-3 bg-[#0C4A4E] hover:bg-[#052F31] text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>الانتقال لتعديل بيانات المواطن والبطاقة الآن</span>
                      </button>
                    </div>
                  );
                } else {
                  return (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-900">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>
                        البطاقة مؤهلة للتجديد (منتهية أو متبقي عليها {days} يوماً). سيتم إصدار بطاقة جديدة صالحة لـ 10 سنوات.
                      </span>
                    </div>
                  );
                }
              })()}

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
                  className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs font-mono focus:outline-none focus:border-[#0C4A4E]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  تحديث الحالة الاجتماعية
                </label>
                <select
                  value={renewForm.maritalStatus}
                  onChange={(e) => setRenewForm({ ...renewForm, maritalStatus: e.target.value as MaritalStatusType })}
                  className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0C4A4E]"
                >
                  <option value="Single">أعزب (Single)</option>
                  <option value="Married">متزوج (Married)</option>
                  <option value="Divorced">مطلق (Divorced)</option>
                  <option value="Widowed">أرمل (Widowed)</option>
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
                  className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0C4A4E]"
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
                  className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0C4A4E]"
                />
              </div>

              {/* Photo Upload with Live Preview */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-20 h-24 rounded-xl bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                  {renewForm.photoUrl ? (
                    <img
                      src={filesService.getFullUrl(renewForm.photoUrl)}
                      alt="الصورة الشخصية"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-2 text-slate-400">
                      <Camera className="w-6 h-6 mx-auto mb-1 opacity-50" />
                      <span className="text-[9px]">الصورة السابقة</span>
                    </div>
                  )}
                  {uploadingRenewPhoto && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-right w-full">
                  <div>
                    <label className="block text-xs font-bold text-slate-700">
                      تحديث الصورة الشخصية (اختياري)
                    </label>
                    <p className="text-[11px] text-slate-500">
                      يمكنك رفع صورة شخصية حديثة لاعتمادها في البطاقة المجددة
                    </p>
                  </div>

                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <label className="px-3 py-1.5 bg-[#052F31] hover:bg-[#0C4A4E] text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors flex items-center gap-1.5 shadow-sm">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{renewForm.photoUrl ? "تغيير الصورة" : "رفع صورة حديثة"}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/jpg"
                        onChange={handleRenewPhotoUpload}
                        className="hidden"
                        disabled={uploadingRenewPhoto}
                      />
                    </label>
                    {renewForm.photoUrl && (
                      <button
                        type="button"
                        onClick={() => setRenewForm((prev) => ({ ...prev, photoUrl: "" }))}
                        className="px-2.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold rounded-xl border border-rose-200 transition-colors"
                      >
                        إزالة
                      </button>
                    )}
                  </div>
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
                  onClick={() => setRenewModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting || (() => {
                    const nat = renewForm.nationalNumber.trim();
                    const matched = cards.find((c) => c.nationalNumber === nat);
                    return Boolean(matched && (matched.status === "Active" || !matched.status) && getDaysRemaining(matched.expiryDate) > 90);
                  })()}
                  className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
                <h3 className="font-extrabold text-[#052F31] text-sm">
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
            <div className="w-full bg-gradient-to-br from-[#052F31] via-[#0C4A4E] to-[#002233] text-white p-5 rounded-2xl shadow-xl relative overflow-hidden border border-[#E6F1EE]/30">
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none"></div>

              {/* Card Header */}
              <div className="flex justify-between items-start border-b border-white/20 pb-3 mb-4">
                <div>
                  <p className="text-[10px] text-white/70 font-semibold">الجمهورية اليمنية • وزارة الداخلية</p>
                  <p className="text-xs font-bold text-white tracking-wide">مصلحة الأحوال المدنية والسجل المدني</p>
                  <p className="text-[9px] text-[#E6F1EE] font-mono mt-0.5">REPUBLIC OF YEMEN • NATIONAL ID</p>
                </div>
                <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                </div>
              </div>

              {/* Card Body */}
              <div className="flex gap-4 items-center">
                <div className="w-20 h-24 rounded-xl bg-white/20 border border-white/30 flex items-center justify-center text-white/60 text-[10px] shrink-0 overflow-hidden relative shadow-inner">
                  {viewCardModal.photoUrl ? (
                    <img
                      src={filesService.getFullUrl(viewCardModal.photoUrl)}
                      alt={viewCardModal.fullName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                        const fallback = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = "flex";
                      }}
                    />
                  ) : null}
                  <div
                    className={`w-full h-full flex flex-col items-center justify-center text-white/80 ${
                      viewCardModal.photoUrl ? "hidden" : "flex"
                    }`}
                  >
                    <User className="w-8 h-8 mb-1 text-white/70" />
                    <span className="text-[9px]">صورة المواطن</span>
                  </div>
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

            <div className="flex justify-between items-center gap-3 pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  const targetCard = viewCardModal;
                  setViewCardModal(null);
                  setQrModalCard(targetCard);
                }}
                className="px-3.5 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer border border-teal-200"
              >
                <QrCode className="w-3.5 h-3.5 text-teal-600" />
                <span>رمز التحقق (QR)</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-[#052F31] hover:bg-[#0C4A4E] text-white rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>طباعة</span>
                </button>
                <button
                  onClick={() => setViewCardModal(null)}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
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
                <History className="w-5 h-5 text-[#0C4A4E]" />
                <h3 className="font-extrabold text-[#052F31] text-base">
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
                  <Loader2 className="w-5 h-5 animate-spin text-[#0C4A4E]" />
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
                          <span className="font-bold text-xs text-[#052F31]">{hc.fullName}</span>
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

      {/* Modal 5: QR Code Verification Modal */}
      {qrModalCard && (
        <QrCodeModal
          isOpen={!!qrModalCard}
          onClose={() => setQrModalCard(null)}
          title="رمز التحقق للبطاقة الشخصية"
          documentType="البطاقة الشخصية الذكية"
          documentNumber={qrModalCard.nationalNumber}
          holderName={qrModalCard.fullName}
          qrPayload={qrModalCard.qrCodePayload || qrModalCard.nationalNumber}
        />
      )}

      {/* Modal 6: Edit Person Data (تعديل وتحديث بيانات المواطن والبطاقة) */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-[#e0e3e5] max-h-[90vh] overflow-y-auto space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center pb-4 border-b border-[#eceef0]">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 text-emerald-700 rounded-xl">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-[#052F31] text-base">
                    تعديل بيانات المواطن والبطاقة الشخصية
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    تحديث بيانات القيد المدني للبطاقة السارية (متاح في أي وقت دون التأثير على صلاحية البطاقة)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditPersonSubmit} className="space-y-4 pt-1">
              {/* Info Banner */}
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-3.5 text-xs text-emerald-900 leading-relaxed flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  تقوم هذه الشاشة بتحديث بيانات المواطن (الحالة الاجتماعية، محل الإقامة، العنوان التفصيلي، فصيلة الدم، والصورة الشخصية) المرتبطة ببطاقته السارية، دون إلغاء البطاقة أو تغيير تاريخ انتهائها.
                </span>
              </div>

              {/* National Number Search / Input */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  الرقم الوطني للمواطن (11 خانة) *
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    required
                    maxLength={11}
                    value={editForm.nationalNumber}
                    onChange={(e) => setEditForm({ ...editForm, nationalNumber: e.target.value })}
                    placeholder="مثال: 01011135650"
                    className="flex-1 px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-[#0C4A4E] bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => handleSearchCitizenForEdit(editForm.nationalNumber)}
                    disabled={searchingCitizenForEdit || editForm.nationalNumber.length !== 11}
                    className="px-4 py-2 bg-[#0C4A4E] hover:bg-[#052F31] text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    {searchingCitizenForEdit ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Search className="w-3.5 h-3.5" />
                    )}
                    <span>استرجاع البيانات</span>
                  </button>
                </div>
              </div>

              {/* Photo Upload with Live Preview */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4">
                <div className="relative w-20 h-24 rounded-xl bg-slate-200 border border-slate-300 overflow-hidden flex items-center justify-center shrink-0 shadow-inner">
                  {editForm.photoUrl ? (
                    <img
                      src={filesService.getFullUrl(editForm.photoUrl)}
                      alt="الصورة الشخصية"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-2 text-slate-400">
                      <Camera className="w-6 h-6 mx-auto mb-1 opacity-50" />
                      <span className="text-[9px]">لا توجد صورة</span>
                    </div>
                  )}
                  {uploadingEditPhoto && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="w-5 h-5 text-white animate-spin" />
                    </div>
                  )}
                </div>

                <div className="flex-1 space-y-2 text-center sm:text-right w-full">
                  <div>
                    <label className="block text-xs font-bold text-slate-700">
                      تحديث الصورة الشخصية البيومترية (اختياري)
                    </label>
                    <p className="text-[11px] text-slate-500">
                      يمكنك رفع صورة شخصية حديثة للمواطن لاعتمادها في السجل المدني
                    </p>
                  </div>

                  <div className="flex items-center gap-2 justify-center sm:justify-start">
                    <label className="px-3 py-1.5 bg-[#052F31] hover:bg-[#0C4A4E] text-white text-xs font-semibold rounded-xl cursor-pointer transition-colors flex items-center gap-1.5 shadow-sm">
                      <Upload className="w-3.5 h-3.5" />
                      <span>{editForm.photoUrl ? "تغيير الصورة" : "رفع صورة حديثة"}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/jpg"
                        onChange={handleEditPhotoUpload}
                        className="hidden"
                        disabled={uploadingEditPhoto}
                      />
                    </label>
                    {editForm.photoUrl && (
                      <button
                        type="button"
                        onClick={() => setEditForm((prev) => ({ ...prev, photoUrl: "" }))}
                        className="px-2.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold rounded-xl border border-rose-200 transition-colors"
                      >
                        إزالة
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الاسم الأول *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.firstName}
                    onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0C4A4E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    اسم الأب *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.fatherName}
                    onChange={(e) => setEditForm({ ...editForm, fatherName: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0C4A4E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    اسم الجد *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.grandfatherName}
                    onChange={(e) => setEditForm({ ...editForm, grandfatherName: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0C4A4E]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    اللقب / العائلة *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.familyName}
                    onChange={(e) => setEditForm({ ...editForm, familyName: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0C4A4E]"
                  />
                </div>
              </div>

              {/* Demographic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    تاريخ الميلاد *
                  </label>
                  <input
                    type="date"
                    required
                    value={editForm.dateOfBirth}
                    onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0C4A4E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    محل الميلاد *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.placeOfBirth}
                    onChange={(e) => setEditForm({ ...editForm, placeOfBirth: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0C4A4E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    الحالة الاجتماعية *
                  </label>
                  <select
                    value={editForm.maritalStatus}
                    onChange={(e) => setEditForm({ ...editForm, maritalStatus: e.target.value as MaritalStatusType })}
                    className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0C4A4E]"
                  >
                    <option value="Single">أعزب (Single)</option>
                    <option value="Married">متزوج (Married)</option>
                    <option value="Divorced">مطلق (Divorced)</option>
                    <option value="Widowed">أرمل (Widowed)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    فصيلة الدم *
                  </label>
                  <select
                    value={editForm.bloodGroup}
                    onChange={(e) => setEditForm({ ...editForm, bloodGroup: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0C4A4E]"
                  >
                    <option value="OPositive">O+</option>
                    <option value="ONegative">O-</option>
                    <option value="APositive">A+</option>
                    <option value="ANegative">A-</option>
                    <option value="BPositive">B+</option>
                    <option value="BNegative">B-</option>
                    <option value="ABPositive">AB+</option>
                    <option value="ABNegative">AB-</option>
                  </select>
                </div>
              </div>

              {/* Address Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    المحافظة الحالية *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.governorate}
                    onChange={(e) => setEditForm({ ...editForm, governorate: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0C4A4E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    المديرية *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.district}
                    onChange={(e) => setEditForm({ ...editForm, district: e.target.value })}
                    className="w-full px-3 py-2 border border-[#e0e3e5] rounded-xl text-xs focus:outline-none focus:border-[#0C4A4E]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    العنوان التفصيلي *
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.addressDetails}
                    onChange={(e) => setEditForm({ ...editForm, addressDetails: e.target.value })}
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
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#0C4A4E] hover:bg-[#052F31] text-white rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer disabled:opacity-60 shadow-sm"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>حفظ وتحديث البيانات</span>
                </button>
              </div>
            </form>
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
