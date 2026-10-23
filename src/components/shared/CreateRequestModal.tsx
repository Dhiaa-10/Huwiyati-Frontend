"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  FilePlus2,
  Search,
  CheckCircle2,
  AlertCircle,
  Building2,
  Calendar,
  User,
  CreditCard,
  RefreshCw,
  Sparkles,
  Camera,
  Upload,
  Image as ImageIcon,
  Trash2,
  FileText,
} from "lucide-react";
import { serviceRequestsService } from "@/lib/api/serviceRequestsService";
import { civilRegistryService } from "@/lib/api/civilRegistryService";
import { adminService } from "@/lib/api/adminService";
import { filesService } from "@/lib/api/filesService";
import {
  ServiceTypeDto,
  ServiceRequestDto,
  CreateServiceRequestCommand,
} from "@/types/serviceRequests";
import { CitizenCivilRecord } from "@/types/civilRegistry";
import { useNotification } from "@/context/NotificationContext";

interface BranchOption {
  id: string;
  name: string;
  governorate?: string;
}

const DEFAULT_BRANCHES: BranchOption[] = [
  {
    id: "018f7d9a-2000-7000-8000-000000000001",
    name: "مصلحة الأحوال المدنية - صنعاء (المركز الرئيسي)",
    governorate: "أمانة العاصمة",
  },
  {
    id: "018f7d9a-2000-7000-8000-000000000002",
    name: "مصلحة الأحوال المدنية - عدن",
    governorate: "عدن",
  },
  {
    id: "018f7d9a-2000-7000-8000-000000000005",
    name: "مصلحة الهجرة والجوازات والجنسية - صنعاء",
    governorate: "أمانة العاصمة",
  },
  {
    id: "22222222-bbbb-cccc-dddd-000000000007",
    name: "مصلحة الهجرة والجوازات - فرع كريتر عدن",
    governorate: "عدن",
  },
  {
    id: "22222222-bbbb-cccc-dddd-000000000008",
    name: "منفذ الوديعة البري - مصلحة الجوازات",
    governorate: "حضرموت",
  },
  {
    id: "018f7d9a-2000-7000-8000-000000000003",
    name: "مستشفى الثورة العام",
    governorate: "أمانة العاصمة",
  },
  {
    id: "018f7d9a-2000-7000-8000-000000000004",
    name: "مستشفى الجمهوري التعليمي",
    governorate: "أمانة العاصمة",
  },
];

interface CreateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newRequest: ServiceRequestDto) => void;
  portalType: "civil-registry" | "passports";
}

export function CreateRequestModal({
  isOpen,
  onClose,
  onSuccess,
  portalType,
}: CreateRequestModalProps) {
  const { toast } = useNotification();

  // Loading & service type data
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [serviceTypes, setServiceTypes] = useState<ServiceTypeDto[]>([]);
  const [branches, setBranches] = useState<BranchOption[]>(DEFAULT_BRANCHES);

  // Form base values
  const [nationalNumber, setNationalNumber] = useState("");
  const [selectedServiceTypeId, setSelectedServiceTypeId] = useState("");
  const [selectedBranchId, setSelectedBranchId] = useState("");

  // Citizen search state
  const [searchingCitizen, setSearchingCitizen] = useState(false);
  const [foundCitizen, setFoundCitizen] = useState<CitizenCivilRecord | null>(null);
  const [citizenSearched, setCitizenSearched] = useState(false);

  // Dynamic fields
  // 1. National ID Renewal
  const [maritalStatus, setMaritalStatus] = useState<number>(1);
  const [governorate, setGovernorate] = useState("أمانة العاصمة");
  const [district, setDistrict] = useState("السبعين");
  const [addressDetails, setAddressDetails] = useState("شارع الستين");

  // 2. Passport Renewal
  const [passportType, setPassportType] = useState<number>(1);
  const [previousPassportNumber, setPreviousPassportNumber] = useState("");
  const [urgentPriority, setUrgentPriority] = useState(false);

  // 3. Family Card Renewal
  const [familyNumber, setFamilyNumber] = useState("");

  // 4. Birth Certificate Registration
  const [fatherNationalNumber, setFatherNationalNumber] = useState("");
  const [motherNationalNumber, setMotherNationalNumber] = useState("");
  const [childFirstName, setChildFirstName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [placeOfBirth, setPlaceOfBirth] = useState("صنعاء");
  const [childGender, setChildGender] = useState<number>(1); // 1: Male, 2: Female
  const [childBloodGroup, setChildBloodGroup] = useState<number>(1); // 1: O+
  const [hospitalBranchId, setHospitalBranchId] = useState("018f7d9a-2000-7000-8000-000000000003");

  // 5. Death Certificate Registration
  const [deceasedNationalNumber, setDeceasedNationalNumber] = useState("");
  const [deathDate, setDeathDate] = useState("");
  const [placeOfDeath, setPlaceOfDeath] = useState("صنعاء");
  const [causeOfDeath, setCauseOfDeath] = useState("طبيعية");

  // Photos and attachments
  const [photoUrl, setPhotoUrl] = useState("");
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [documentUrl, setDocumentUrl] = useState("");
  const [uploadingDoc, setUploadingDoc] = useState(false);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingPhoto(true);
    setErrorMsg(null);
    try {
      const url = await filesService.uploadPhoto(file);
      setPhotoUrl(url);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "فشل رفع الصورة الشخصية.");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDocumentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingDoc(true);
    setErrorMsg(null);
    try {
      const url = await filesService.uploadDocument(file);
      setDocumentUrl(url);
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "فشل رفع المستند.");
    } finally {
      setUploadingDoc(false);
    }
  };

  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      setLoadingInitial(true);
      setErrorMsg(null);
      try {
        const [allTypes, allBranches] = await Promise.all([
          serviceRequestsService.getServiceTypes().catch(() => []),
          adminService.getBranches().catch(() => []),
        ]);

        // Filter service types according to the portal
        let filteredTypes = allTypes;
        if (portalType === "passports") {
          filteredTypes = allTypes.filter(
            (t) => t.code.includes("PASSPORT") || t.name.includes("جواز")
          );
        } else {
          filteredTypes = allTypes.filter(
            (t) => !t.code.includes("PASSPORT") && !t.name.includes("جواز")
          );
        }

        // Fallback default service types if none returned by backend yet
        if (filteredTypes.length === 0) {
          if (portalType === "passports") {
            filteredTypes = [
              {
                id: "018f7d9a-6000-7000-8000-000000000002",
                name: "تجديد جواز سفر إلكتروني",
                code: "PASSPORT_RENEWAL",
                organizationId: "11111111-aaaa-bbbb-cccc-000000000002",
                organizationName: "مصلحة الهجرة والجوازات والجنسية",
                isActive: true,
              },
            ];
          } else {
            filteredTypes = [
              {
                id: "018f7d9a-6000-7000-8000-000000000001",
                name: "تجديد بطاقة شخصية",
                code: "NATIONAL_ID_RENEWAL",
                organizationId: "11111111-aaaa-bbbb-cccc-000000000001",
                organizationName: "مصلحة الأحوال المدنية والسجل المدني",
                isActive: true,
              },
              {
                id: "018f7d9a-6000-7000-8000-000000000003",
                name: "تجديد بطاقة عائلية",
                code: "FAMILY_CARD_RENEWAL",
                organizationId: "11111111-aaaa-bbbb-cccc-000000000001",
                organizationName: "مصلحة الأحوال المدنية والسجل المدني",
                isActive: true,
              },
              {
                id: "018f7d9a-6000-7000-8000-000000000004",
                name: "تسجيل شهادة ميلاد",
                code: "BIRTH_CERTIFICATE_REGISTRATION",
                organizationId: "11111111-aaaa-bbbb-cccc-000000000001",
                organizationName: "مصلحة الأحوال المدنية والسجل المدني",
                isActive: true,
              },
              {
                id: "018f7d9a-6000-7000-8000-000000000005",
                name: "تسجيل شهادة وفاة",
                code: "DEATH_CERTIFICATE_REGISTRATION",
                organizationId: "11111111-aaaa-bbbb-cccc-000000000001",
                organizationName: "مصلحة الأحوال المدنية والسجل المدني",
                isActive: true,
              },
            ];
          }
        }

        setServiceTypes(filteredTypes);
        if (filteredTypes.length > 0) {
          setSelectedServiceTypeId(filteredTypes[0].id);
        }

        // Branches
        if (allBranches && allBranches.length > 0) {
          const mapped: BranchOption[] = allBranches.map((b) => ({
            id: b.id,
            name: b.branchName,
            governorate: b.governorate,
          }));
          setBranches(mapped);
          setSelectedBranchId(mapped[0]?.id || DEFAULT_BRANCHES[0].id);
        } else {
          setBranches(DEFAULT_BRANCHES);
          const defaultId =
            portalType === "passports"
              ? "018f7d9a-2000-7000-8000-000000000005"
              : "018f7d9a-2000-7000-8000-000000000001";
          setSelectedBranchId(defaultId);
        }
      } catch (err) {
        console.warn("Failed to load initial dropdown data:", err);
      } finally {
        setLoadingInitial(false);
      }
    };

    loadData();
  }, [isOpen, portalType]);

  const selectedService = serviceTypes.find((s) => s.id === selectedServiceTypeId);

  const handleSearchCitizen = async () => {
    if (!nationalNumber.trim() || nationalNumber.trim().length !== 11) {
      const msg = "يرجى إدخال رقم وطني صحيح مكون من 11 رقماً.";
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    setSearchingCitizen(true);
    setErrorMsg(null);
    try {
      const res = await civilRegistryService.searchCitizenByNationalId(nationalNumber.trim());
      setFoundCitizen(res);
      setCitizenSearched(true);
      if (res) {
        setFatherNationalNumber(res.nationalNumber);
        setDeceasedNationalNumber(res.nationalNumber);
        if (res.photoUrl && !photoUrl) {
          setPhotoUrl(res.photoUrl);
        }
      }
    } catch (err: unknown) {
      setFoundCitizen(null);
      setCitizenSearched(true);
      const msg = err instanceof Error ? err.message : "لم يتم العثور على المواطن في السجل المدني.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setSearchingCitizen(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const natNum = nationalNumber.trim();
    if (!natNum || natNum.length !== 11) {
      const msg = "الرقم الوطني للمواطن مطلوب ويجب أن يتكون من 11 رقماً.";
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    if (!selectedServiceTypeId) {
      const msg = "يرجى اختيار نوع الخدمة.";
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    if (!selectedBranchId) {
      const msg = "يرجى اختيار الفرع المنفذ.";
      setErrorMsg(msg);
      toast.error(msg);
      return;
    }

    // Build dynamic requestDataJson according to serviceTypeCode
    let requestDataJson: Record<string, unknown> | null = null;
    const sCode = selectedService?.code || "";

    if (sCode === "NATIONAL_ID_RENEWAL") {
      requestDataJson = {
        nationalNumber: natNum,
        maritalStatus: Number(maritalStatus),
        governorate: governorate || "أمانة العاصمة",
        district: district || "معين",
        addressDetails: addressDetails || "شارع الستين",
        photoUrl: photoUrl || undefined,
        issuingBranchId: selectedBranchId,
      };
    } else if (sCode === "PASSPORT_RENEWAL") {
      requestDataJson = {
        nationalNumber: natNum,
        passportType: Number(passportType),
        previousPassportNumber: previousPassportNumber.trim() || undefined,
        photoUrl: photoUrl || undefined,
        urgentPriority,
        issuingBranchId: selectedBranchId,
      };
    } else if (sCode === "FAMILY_CARD_RENEWAL") {
      if (!familyNumber.trim()) {
        setErrorMsg("يرجى إدخال رقم البطاقة العائلية المراد تجديدها.");
        return;
      }
      requestDataJson = {
        familyNumber: familyNumber.trim(),
        issuingBranchId: selectedBranchId,
      };
    } else if (sCode === "BIRTH_CERTIFICATE_REGISTRATION") {
      if (!fatherNationalNumber.trim() || fatherNationalNumber.trim().length !== 11) {
        setErrorMsg("الرقم الوطني للأب مطلوب (11 رقماً).");
        return;
      }
      if (!motherNationalNumber.trim() || motherNationalNumber.trim().length !== 11) {
        setErrorMsg("الرقم الوطني للأم مطلوب (11 رقماً).");
        return;
      }
      if (!childFirstName.trim()) {
        setErrorMsg("اسم المولود الأول مطلوب.");
        return;
      }
      if (!dateOfBirth) {
        setErrorMsg("تاريخ ميلاد المولود مطلوب.");
        return;
      }

      requestDataJson = {
        fatherNationalNumber: fatherNationalNumber.trim(),
        motherNationalNumber: motherNationalNumber.trim(),
        firstName: childFirstName.trim(),
        dateOfBirth,
        placeOfBirth: placeOfBirth || "صنعاء",
        gender: Number(childGender),
        bloodGroup: Number(childBloodGroup),
        governorate: governorate || "أمانة العاصمة",
        district: district || "السبعين",
        addressDetails: addressDetails || "حي السلام",
        hospitalBranchId: hospitalBranchId || "018f7d9a-2000-7000-8000-000000000003",
        familyId: "018f7d9a-3000-7000-8000-000000000001",
        issuingBranchId: selectedBranchId,
      };
    } else if (sCode === "DEATH_CERTIFICATE_REGISTRATION") {
      if (!deceasedNationalNumber.trim() || deceasedNationalNumber.trim().length !== 11) {
        setErrorMsg("الرقم الوطني للمتوفى مطلوب (11 رقماً).");
        return;
      }
      if (!deathDate) {
        setErrorMsg("تاريخ الوفاة مطلوب.");
        return;
      }

      requestDataJson = {
        nationalNumber: deceasedNationalNumber.trim(),
        deathDate,
        placeOfDeath: placeOfDeath || "صنعاء",
        causeOfDeath: causeOfDeath || "طبيعية",
        hospitalBranchId: hospitalBranchId || "018f7d9a-2000-7000-8000-000000000003",
        issuingBranchId: selectedBranchId,
      };
    }

    setSubmitting(true);
    try {
      const command: CreateServiceRequestCommand = {
        nationalNumber: natNum,
        personId: foundCitizen?.id,
        serviceTypeId: selectedServiceTypeId,
        branchId: selectedBranchId,
        requestDataJson: requestDataJson ?? undefined,
      };

      const result = await serviceRequestsService.createRequestOnBehalf(command);
      toast.success(`تم تقديم طلب الخدمة بنجاح برقم: ${result.requestNumber || ""}`);
      onSuccess(result);
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "فشل إنشاء طلب الخدمة.";
      setErrorMsg(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl border border-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#052F31] text-white flex items-center justify-center shadow-sm">
              <FilePlus2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#052F31]">
                إنشاء طلب خدمة بالنيابة عن مواطن (Create Request on Behalf)
              </h3>
              <p className="text-xs text-slate-500">
                تقديم وقيد معاملة جديدة مباشرة في النظام المركزي
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 text-xs">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-rose-800 font-semibold animate-fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Citizen Lookup */}
          <div className="space-y-3 p-4 bg-[#f7f9fb] border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between">
              <label className="font-bold text-[#052F31] flex items-center gap-1.5">
                <User className="w-4 h-4 text-[#0C4A4E]" />
                <span>بيانات المواطن صاحب الطلب (National ID)</span>
                <span className="text-rose-500">*</span>
              </label>
              {foundCitizen && (
                <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  تم التحقق من السجل
                </span>
              )}
            </div>

            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  maxLength={11}
                  value={nationalNumber}
                  onChange={(e) => {
                    setNationalNumber(e.target.value.replace(/\D/g, ""));
                    setCitizenSearched(false);
                    setFoundCitizen(null);
                  }}
                  placeholder="أدخل الرقم الوطني للمواطن (11 رقماً)..."
                  className="w-full bg-white border border-slate-300 rounded-lg pr-4 pl-4 py-2.5 font-mono text-sm text-[#191c1e] focus:outline-none focus:border-[#0C4A4E]"
                />
              </div>

              <button
                type="button"
                onClick={handleSearchCitizen}
                disabled={searchingCitizen || nationalNumber.length !== 11}
                className="px-4 py-2.5 bg-[#0C4A4E] hover:bg-[#052F31] text-white rounded-lg font-bold flex items-center gap-1.5 transition-all disabled:opacity-50"
              >
                {searchingCitizen ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                <span>تحقق</span>
              </button>
            </div>

            {/* Found Citizen Card */}
            {foundCitizen && (
              <div className="p-3 bg-white border border-emerald-200 rounded-lg flex items-center gap-3 animate-fade-in">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center justify-center font-bold shrink-0">
                  <User className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <div className="font-bold text-slate-800 text-sm">
                    {foundCitizen.fullName}
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono">
                    الرقم الوطني: {foundCitizen.nationalNumber} • الحالة:{" "}
                    <span className="text-emerald-700 font-semibold">سجل نشط</span>
                  </div>
                </div>
              </div>
            )}

            {citizenSearched && !foundCitizen && (
              <p className="text-[11px] text-amber-700 font-semibold">
                لم يتم العثور على سجل سابق بالرقم الوطني، سيتم تسجيل الطلب مباشرة وربطه بهذا الرقم.
              </p>
            )}
          </div>

          {/* Section 2: Service & Branch Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-[#41484d] flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-[#0C4A4E]" />
                <span>نوع الخدمة المطلوبة</span>
                <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedServiceTypeId}
                onChange={(e) => setSelectedServiceTypeId(e.target.value)}
                className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg px-3 py-2 text-xs text-[#191c1e] focus:outline-none focus:border-[#0C4A4E]"
              >
                {serviceTypes.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.name} ({st.code})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="font-bold text-[#41484d] flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#0C4A4E]" />
                <span>فرع التنفيذ والإصدار</span>
                <span className="text-rose-500">*</span>
              </label>
              <select
                value={selectedBranchId}
                onChange={(e) => setSelectedBranchId(e.target.value)}
                className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg px-3 py-2 text-xs text-[#191c1e] focus:outline-none focus:border-[#0C4A4E]"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Section 3: Dynamic Fields Based on Service */}
          <div className="p-4 border border-slate-200 rounded-xl space-y-4 bg-white">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Sparkles className="w-4 h-4 text-[#0C4A4E]" />
              <h4 className="font-bold text-[#052F31]">
                بيانات المعاملة الإضافية ({selectedService?.name || "تفاصيل الخدمة"})
              </h4>
            </div>

            {/* A. National ID Renewal Form */}
            {selectedService?.code === "NATIONAL_ID_RENEWAL" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">الحالة الاجتماعية</label>
                  <select
                    value={maritalStatus}
                    onChange={(e) => setMaritalStatus(Number(e.target.value))}
                    className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg p-2 text-xs"
                  >
                    <option value={1}>أعزب (Single)</option>
                    <option value={2}>متزوج (Married)</option>
                    <option value={3}>مطلق (Divorced)</option>
                    <option value={4}>أرمل (Widowed)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">المحافظة</label>
                  <input
                    type="text"
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value)}
                    placeholder="مثال: أمانة العاصمة"
                    className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">المديرية</label>
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    placeholder="مثال: السبعين"
                    className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">تفاصيل العنوان</label>
                  <input
                    type="text"
                    value={addressDetails}
                    onChange={(e) => setAddressDetails(e.target.value)}
                    placeholder="مثال: شارع الستين - جوار البريد"
                    className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>

                {/* Biometric Photo Upload */}
                <div className="md:col-span-2 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 mt-1">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700 flex items-center gap-1.5 text-xs">
                      <Camera className="w-4 h-4 text-[#0C4A4E]" />
                      <span>الصورة الشخصية للمعاملة (Biometric Photo)</span>
                    </label>
                    {foundCitizen?.photoUrl && photoUrl !== foundCitizen.photoUrl && (
                      <button
                        type="button"
                        onClick={() => setPhotoUrl(foundCitizen.photoUrl)}
                        className="text-[11px] text-[#0C4A4E] hover:underline font-semibold"
                      >
                        استخدام صورة السجل المدني
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-16 h-20 rounded-lg overflow-hidden border border-slate-300 bg-white flex items-center justify-center shrink-0">
                      {photoUrl ? (
                        <img
                          src={filesService.getFullUrl(photoUrl)}
                          alt="صورة المعاملة"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-slate-300" />
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-700 shadow-xs transition-all">
                        <Upload className="w-3.5 h-3.5 text-[#0C4A4E]" />
                        <span>{uploadingPhoto ? "جاري الرفع..." : "رفع صورة حديثة"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          disabled={uploadingPhoto}
                          className="hidden"
                        />
                      </label>
                      {photoUrl && (
                        <button
                          type="button"
                          onClick={() => setPhotoUrl("")}
                          className="block text-[11px] text-rose-600 hover:underline"
                        >
                          إزالة الصورة
                        </button>
                      )}
                      <p className="text-[10px] text-slate-400">
                        خلفية بيضاء، ملامح واضحة، دقة لا تقل عن 600×600 بكسل.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* B. Passport Renewal Form */}
            {selectedService?.code === "PASSPORT_RENEWAL" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">نوع جواز السفر</label>
                  <select
                    value={passportType}
                    onChange={(e) => setPassportType(Number(e.target.value))}
                    className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg p-2 text-xs"
                  >
                    <option value={1}>جواز سفر عادي (Regular)</option>
                    <option value={2}>جواز سفر دبلوماسي (Diplomatic)</option>
                    <option value={3}>جواز سفر خاص (Special)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">
                    رقم الجواز السابق (إن وجد)
                  </label>
                  <input
                    type="text"
                    value={previousPassportNumber}
                    onChange={(e) => setPreviousPassportNumber(e.target.value)}
                    placeholder="مثال: 08451234"
                    className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg p-2 text-xs font-mono"
                  />
                </div>

                {/* Biometric Photo Upload for Passport */}
                <div className="md:col-span-2 p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2 mt-1">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700 flex items-center gap-1.5 text-xs">
                      <Camera className="w-4 h-4 text-[#0C4A4E]" />
                      <span>الصورة الشخصية للجواز (Biometric Passport Photo)</span>
                    </label>
                    {foundCitizen?.photoUrl && photoUrl !== foundCitizen.photoUrl && (
                      <button
                        type="button"
                        onClick={() => setPhotoUrl(foundCitizen.photoUrl)}
                        className="text-[11px] text-[#0C4A4E] hover:underline font-semibold"
                      >
                        استخدام صورة السجل المدني
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-16 h-20 rounded-lg overflow-hidden border border-slate-300 bg-white flex items-center justify-center shrink-0">
                      {photoUrl ? (
                        <img
                          src={filesService.getFullUrl(photoUrl)}
                          alt="صورة المعاملة"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-slate-300" />
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 rounded-lg text-xs font-bold text-slate-700 shadow-xs transition-all">
                        <Upload className="w-3.5 h-3.5 text-[#0C4A4E]" />
                        <span>{uploadingPhoto ? "جاري الرفع..." : "رفع صورة جواز حديثة"}</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoUpload}
                          disabled={uploadingPhoto}
                          className="hidden"
                        />
                      </label>
                      {photoUrl && (
                        <button
                          type="button"
                          onClick={() => setPhotoUrl("")}
                          className="block text-[11px] text-rose-600 hover:underline"
                        >
                          إزالة الصورة
                        </button>
                      )}
                      <p className="text-[10px] text-slate-400">
                        معايير ICAO: خلفية بيضاء نقية، الوجه بالكامل مكشوف، دقة عالية.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={urgentPriority}
                      onChange={(e) => setUrgentPriority(e.target.checked)}
                      className="rounded border-rose-300 text-rose-600 focus:ring-rose-500"
                    />
                    <span className="font-bold text-rose-700">
                      معاملة مستعجلة (تسريع إجراءات التدقيق والطباعة)
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* C. Family Card Renewal Form */}
            {selectedService?.code === "FAMILY_CARD_RENEWAL" && (
              <div className="space-y-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">
                    رقم البطاقة العائلية السابقة
                    <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={familyNumber}
                    onChange={(e) => setFamilyNumber(e.target.value)}
                    placeholder="مثال: FAM-0102030"
                    className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg p-2 text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {/* D. Birth Certificate Registration Form */}
            {selectedService?.code === "BIRTH_CERTIFICATE_REGISTRATION" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">
                    الرقم الوطني للأب <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={11}
                    value={fatherNationalNumber}
                    onChange={(e) => setFatherNationalNumber(e.target.value.replace(/\D/g, ""))}
                    placeholder="11 رقماً"
                    className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg p-2 text-xs font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">
                    الرقم الوطني للأم <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={11}
                    value={motherNationalNumber}
                    onChange={(e) => setMotherNationalNumber(e.target.value.replace(/\D/g, ""))}
                    placeholder="11 رقماً"
                    className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg p-2 text-xs font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">
                    اسم المولود <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={childFirstName}
                    onChange={(e) => setChildFirstName(e.target.value)}
                    placeholder="الاسم الأول للمولود"
                    className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">
                    تاريخ الميلاد <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">جنس المولود</label>
                  <select
                    value={childGender}
                    onChange={(e) => setChildGender(Number(e.target.value))}
                    className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg p-2 text-xs"
                  >
                    <option value={1}>ذكر (Male)</option>
                    <option value={2}>أنثى (Female)</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">فصيلة الدم</label>
                  <select
                    value={childBloodGroup}
                    onChange={(e) => setChildBloodGroup(Number(e.target.value))}
                    className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg p-2 text-xs font-mono"
                  >
                    <option value={1}>O+</option>
                    <option value={2}>O-</option>
                    <option value={3}>A+</option>
                    <option value={4}>A-</option>
                    <option value={5}>B+</option>
                    <option value={6}>B-</option>
                    <option value={7}>AB+</option>
                    <option value={8}>AB-</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">مكان الميلاد</label>
                  <input
                    type="text"
                    value={placeOfBirth}
                    onChange={(e) => setPlaceOfBirth(e.target.value)}
                    placeholder="مثال: صنعاء"
                    className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">مستشفى الولادة</label>
                  <select
                    value={hospitalBranchId}
                    onChange={(e) => setHospitalBranchId(e.target.value)}
                    className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg p-2 text-xs"
                  >
                    <option value="018f7d9a-2000-7000-8000-000000000003">
                      مستشفى الثورة العام النموذجي
                    </option>
                    <option value="018f7d9a-2000-7000-8000-000000000004">
                      مستشفى الجمهوري التعليمي
                    </option>
                  </select>
                </div>
              </div>
            )}

            {/* E. Death Certificate Registration Form */}
            {selectedService?.code === "DEATH_CERTIFICATE_REGISTRATION" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">
                    الرقم الوطني للمتوفى <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={11}
                    value={deceasedNationalNumber}
                    onChange={(e) => setDeceasedNationalNumber(e.target.value.replace(/\D/g, ""))}
                    placeholder="11 رقماً"
                    className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg p-2 text-xs font-mono"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">
                    تاريخ الوفاة <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={deathDate}
                    onChange={(e) => setDeathDate(e.target.value)}
                    className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">مكان الوفاة</label>
                  <input
                    type="text"
                    value={placeOfDeath}
                    onChange={(e) => setPlaceOfDeath(e.target.value)}
                    placeholder="مثال: مستشفى الثورة"
                    className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>

                <div className="flex flex-col gap-1">
                  <label className="font-semibold text-slate-700">سبب الوفاة</label>
                  <input
                    type="text"
                    value={causeOfDeath}
                    onChange={(e) => setCauseOfDeath(e.target.value)}
                    placeholder="مثال: سكتة قلبية / طبيعية"
                    className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg p-2 text-xs"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 border border-slate-300 text-slate-600 rounded-xl font-bold hover:bg-slate-50 transition-colors"
            >
              إلغاء
            </button>

            <button
              type="submit"
              disabled={submitting || loadingInitial}
              className="px-6 py-2.5 bg-[#052F31] hover:bg-[#0C4A4E] text-white rounded-xl font-bold shadow-md flex items-center gap-2 transition-all active:scale-98 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>جاري إنشاء الطلب...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>إرسال وإنشاء الطلب بالنيابة</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
