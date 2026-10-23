"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  UserCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ShieldAlert,
  Clock,
  MapPin,
  Calendar,
  CreditCard,
  Camera,
  RefreshCw,
  X,
  Smartphone,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { civilRegistryService } from "@/lib/api/civilRegistryService";
import { filesService } from "@/lib/api/filesService";
import { CitizenCivilRecord } from "@/types/civilRegistry";
import {
  apiGetCitizenAccountStatus,
  apiActivateCitizenAccount,
  CitizenAccountStatusDto,
} from "@/lib/api/authService";
import { useNotification } from "@/context/NotificationContext";

function ActivationsContent() {
  const searchParams = useSearchParams();
  const initialNid = searchParams.get("nid") || "";
  const { toast } = useNotification();

  const [nationalIdSearch, setNationalIdSearch] = useState(initialNid);
  const [searching, setSearching] = useState(false);
  const [citizen, setCitizen] = useState<CitizenCivilRecord | null>(null);
  const [accountInfo, setAccountInfo] = useState<CitizenAccountStatusDto | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Activation state
  const [activating, setActivating] = useState(false);

  // Notification / Modals
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("عدم تطابق البيانات أو الوثائق الرسمية");
  const [rejectError, setRejectError] = useState<string | null>(null);

  const showNotification = (
    type: "success" | "error" | "info",
    message: string
  ) => {
    if (type === "success") {
      toast.success(message);
      setRejectError(null);
    } else if (type === "error") {
      toast.error(message);
      setRejectError(message);
    } else {
      toast.info(message);
    }
  };

  const handleSearch = async (nidToSearch?: string) => {
    const q = (nidToSearch || nationalIdSearch).trim();
    if (!q) {
      showNotification("error", "يرجى إدخال الرقم الوطني للمواطن (11 خانة).");
      return;
    }

    setSearching(true);
    setNotFound(false);
    setCitizen(null);
    setAccountInfo(null);

    try {
      const [found, accountRes] = await Promise.all([
        civilRegistryService.searchCitizenByNationalId(q).catch(() => null),
        apiGetCitizenAccountStatus(q).catch(() => null),
      ]);

      if (accountRes && accountRes.isSuccess && accountRes.data) {
        setAccountInfo(accountRes.data);
      }

      if (found) {
        if (accountRes && accountRes.isSuccess && accountRes.data) {
          found.accountStatus = (accountRes.data.status as any) || "PendingActivation";
        } else {
          found.accountStatus = "PendingActivation";
        }
        setCitizen(found);
      } else if (accountRes && accountRes.isSuccess && accountRes.data) {
        const acc = accountRes.data;
        const fallbackCitizen: CitizenCivilRecord = {
          id: acc.personId || acc.userId || "temp-id",
          nationalNumber: acc.nationalNumber,
          firstName: acc.personFullName?.split(" ")[0] || "",
          fatherName: acc.personFullName?.split(" ")[1] || "",
          grandfatherName: acc.personFullName?.split(" ")[2] || "",
          familyName: acc.personFullName?.split(" ")[3] || "",
          fullName: acc.personFullName || "مواطن مسجل",
          motherName: "غير مسجل",
          dateOfBirth: "—",
          placeOfBirth: "—",
          gender: "Male",
          nationality: "يمني",
          maritalStatus: "Single",
          bloodType: "—",
          governorate: "—",
          district: "—",
          addressDetails: "",
          photoUrl: "",
          personStatus: "Active",
          accountStatus: (acc.status as any) || "PendingActivation",
          phoneNumber: acc.phoneNumber || "",
          email: acc.email || "",
          biometricRegistered: true,
          createdAt: acc.createdAt || new Date().toISOString(),
        };
        setCitizen(fallbackCitizen);
      } else {
        setNotFound(true);
      }
    } catch (err) {
      console.error(err);
      setNotFound(true);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    if (initialNid) {
      handleSearch(initialNid);
    }
  }, [initialNid]);

  // Confirm Activation
  const handleActivateCitizen = async () => {
    if (!citizen) return;

    setActivating(true);
    try {
      const res = await civilRegistryService.activateAccount({
        nationalNumber: citizen.nationalNumber,
        branchId: "22222222-bbbb-cccc-dddd-000000000001",
        officerUserId: "usr-civil-officer-01",
        biometricMatched: true,
      });

      setCitizen(res.citizen);
      if (accountInfo) {
        setAccountInfo({
          ...accountInfo,
          status: "Active",
          activatedAt: new Date().toISOString(),
        });
      }
      showNotification("success", res.message);
    } catch (err: any) {
      showNotification("error", err.message || "فشلت عملية التفعيل.");
    } finally {
      setActivating(false);
    }
  };

  // Reject Activation
  const handleRejectSubmit = async () => {
    if (!citizen) return;

    try {
      await civilRegistryService.rejectActivation(
        citizen.nationalNumber,
        rejectionReason
      );
      setRejectModalOpen(false);
      setRejectError(null);
      showNotification("info", "تم توثيق رفض التفعيل في سجل الأمان المركزي.");
    } catch (err: any) {
      const errMsg = err?.message || "فشلت عملية الرفض.";
      setRejectError(errMsg);
      showNotification("error", errMsg);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">


      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#052F31]"></span>
          <span className="text-xs font-bold text-[#052F31] uppercase tracking-wider">
            بوابة التحقق الحضوري الميداني
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#052F31]">
          تفعيل حسابات المواطنين (In-Person Account Activation)
        </h1>
        <p className="text-sm text-[#41484d] mt-1">
          التحقق من بيانات المواطن الحاضر في الفرع بالرقم الوطني لتفعيل دخوله إلى تطبيق هويتي الرقمي.
        </p>
      </div>

      {/* Search Bar (Stitch Screen 02) */}
      <div className="bg-white rounded-2xl border border-[#e0e3e5] p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full relative">
            <label className="block text-xs font-bold text-[#052F31] mb-1.5">
              رقم الهوية الوطنية للمواطن (11 رقماً)
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={11}
                value={nationalIdSearch}
                onChange={(e) => setNationalIdSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="أدخل الرقم الوطني للمواطن (11 رقماً)..."
                className="w-full bg-[#f7f9fb] border border-[#c0c7ce] rounded-xl px-4 py-3.5 text-base font-mono font-bold text-[#191c1e] placeholder:text-slate-400 focus:outline-none focus:border-[#0C4A4E] focus:ring-1 focus:ring-[#0C4A4E] transition-all"
              />
              <span className="absolute left-4 top-3.5 text-xs text-slate-400 font-mono">
                {nationalIdSearch.length}/11
              </span>
            </div>
          </div>

          <button
            onClick={() => handleSearch()}
            disabled={searching}
            className="w-full md:w-auto bg-[#052F31] hover:bg-[#0C4A4E] text-white px-8 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {searching ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            <span>بحث عن السجل المدني</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-6">
          {notFound ? (
            <div className="bg-white rounded-2xl border border-dashed border-rose-200 p-12 text-center">
              <XCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">
                لم يتم العثور على سجل بالرقم الوطني المدخل
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                تأكد من كتابة الرقم الوطني بشكل صحيح أو مراجعة قيود إصدار البطاقة الأولى.
              </p>
            </div>
          ) : citizen ? (
            <>
              {/* Profile Card */}
              <div className="bg-white rounded-2xl border border-[#e0e3e5] p-6 shadow-xs relative">
                {/* Status Badge */}
                <div className="absolute top-6 left-6">
                  {citizen.accountStatus === "Active" ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>الحساب مفعل ونشط</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold text-xs animate-pulse">
                      <Clock className="w-3.5 h-3.5" />
                      <span>غير مفعل - بانتظار التحقق</span>
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Photo */}
                  <div className="w-32 h-40 rounded-xl overflow-hidden border-2 border-slate-200 shadow-sm shrink-0 bg-slate-100 relative flex items-center justify-center">
                    {citizen.photoUrl ? (
                      <img
                        src={filesService.getFullUrl(citizen.photoUrl)}
                        alt={citizen.fullName}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const fallback = e.currentTarget.parentElement?.querySelector(".fallback-photo-placeholder");
                          if (fallback) fallback.classList.remove("hidden");
                        }}
                      />
                    ) : null}
                    <div
                      className={`fallback-photo-placeholder w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-2 text-center ${
                        citizen.photoUrl ? "hidden" : ""
                      }`}
                    >
                      <UserCheck className="w-10 h-10 text-slate-300 mb-1" />
                      <span className="text-[11px] font-medium text-slate-400 leading-tight">
                        لا توجد صورة مسجلة
                      </span>
                    </div>
                  </div>

                  {/* Info Table */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-[#052F31]">
                        {citizen.fullName}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        الرقم الوطني الموحد:{" "}
                        <strong className="font-mono text-[#0C4A4E]">
                          {citizen.nationalNumber}
                        </strong>
                      </p>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6 text-xs pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-slate-500 block">اسم الأم:</span>
                        <strong className="text-slate-800">{citizen.motherName}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">تاريخ ومحل الميلاد:</span>
                        <strong className="text-slate-800">
                          {citizen.dateOfBirth} ({citizen.placeOfBirth})
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">الجنسية والحالة الاجتماعية:</span>
                        <strong className="text-slate-800">
                          {citizen.nationality} - {citizen.maritalStatus === "Married" ? "متزوج" : "أعزب"}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">فصيلة الدم:</span>
                        <strong className="text-rose-700 font-mono font-bold">
                          {citizen.bloodType}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">محل الإقامة الحالي:</span>
                        <strong className="text-slate-800">
                          {citizen.governorate} - {citizen.district}
                        </strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block">رقم هاتف التواصل:</span>
                        <strong className="font-mono text-slate-800">
                          {citizen.phoneNumber}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Account Status Card from Identity */}
              <div className="bg-white rounded-2xl border border-[#e0e3e5] p-5 shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-[#052F31]" />
                    <h4 className="text-sm font-bold text-[#052F31]">
                      حالة الحساب الرقمي في تطبيق هويتي
                    </h4>
                  </div>
                  {accountInfo?.hasRegisteredAccount ? (
                    accountInfo.status === "Active" ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>مفعل ونشط</span>
                      </span>
                    ) : accountInfo.status === "PendingActivation" ? (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold animate-pulse">
                        <Clock className="w-3.5 h-3.5" />
                        <span>بانتظار التفعيل الحضوري</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
                        <XCircle className="w-3.5 h-3.5" />
                        <span>{accountInfo.status}</span>
                      </span>
                    )
                  ) : (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                      <span>غير مسجل عبر التطبيق</span>
                    </span>
                  )}
                </div>

                {accountInfo?.hasRegisteredAccount ? (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 block">البريد الإلكتروني المسجل:</span>
                      <strong className="text-slate-800 font-mono">
                        {accountInfo.email || "غير مسجل"}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">رقم هاتف التطبيق:</span>
                      <strong className="text-slate-800 font-mono">
                        {accountInfo.phoneNumber || "غير مسجل"}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">تاريخ التسجيل / التفعيل:</span>
                      <strong className="text-slate-800 font-mono">
                        {accountInfo.activatedAt
                          ? `مفعل: ${new Date(accountInfo.activatedAt).toLocaleDateString("ar-YE")}`
                          : accountInfo.createdAt
                          ? `مسجل: ${new Date(accountInfo.createdAt).toLocaleDateString("ar-YE")}`
                          : "—"}
                      </strong>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-amber-700 bg-amber-50/60 p-3 rounded-xl border border-amber-200">
                    لم يقم المواطن بإنشاء حساب إلكتروني عبر تطبيق هويتي حتى الآن. يمكن تفعيل حسابه بعد أن يكمل التسجيل الأولي من التطبيق، أو يتم تفعيله مسبقاً وسيرتبط حسابه تلقائياً عند التسجيل.
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                {citizen.accountStatus !== "Active" ? (
                  <>
                    <button
                      onClick={handleActivateCitizen}
                      disabled={activating}
                      className="flex-1 bg-[#005539] hover:bg-[#003c27] text-white py-4 px-6 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
                    >
                      {activating ? (
                        <RefreshCw className="w-5 h-5 animate-spin" />
                      ) : (
                        <UserCheck className="w-5 h-5" />
                      )}
                      <span>تفعيل الحساب الرقمي للمواطن (موافق)</span>
                    </button>

                    <button
                      onClick={() => setRejectModalOpen(true)}
                      disabled={activating}
                      className="sm:w-44 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 py-4 px-6 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      <XCircle className="w-5 h-5" />
                      <span>رفض التفعيل</span>
                    </button>
                  </>
                ) : (
                  <div className="w-full p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-xs font-bold">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>
                      هذا الحساب مفعل بالفعل ومصرح له بالدخول لخدمات تطبيق هويتي.
                    </span>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-[#e0e3e5] p-12 text-center">
              <UserCheck className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-base font-bold text-slate-700">
                أدخل الرقم الوطني للمواطن لبدء عملية التفعيل
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                يقوم النظام بالتحقق التلقائي من السجل المدني وبيانات الحساب الرقمي للمواطن لتفعيل حسابه.
              </p>
            </div>
          )}
      </div>

      {/* Reject Modal */}
      {rejectModalOpen && citizen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-rose-700 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <span>رفض طلب التفعيل</span>
              </h3>
              <button
                onClick={() => setRejectModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-3">
              يرجى تحديد سبب رفض التفعيل للمواطن <strong>({citizen.fullName})</strong>:
            </p>

            <select
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 mb-4 focus:outline-none focus:border-[#0C4A4E]"
            >
              <option value="عدم تطابق البيانات أو الوثائق الرسمية">
                عدم تطابق البيانات أو الوثائق الرسمية
              </option>
              <option value="اشتباه في انتحال شخصية أو تزوير بيانات">
                اشتباه في انتحال شخصية أو تزوير بيانات
              </option>
              <option value="البطاقة الشخصية منتهية أو تالفة تتطلب التجديد">
                البطاقة الشخصية منتهية أو تالفة تتطلب التجديد
              </option>
              <option value="عدم حضور صاحب الهوية شخصياً">
                عدم حضور صاحب الهوية شخصياً
              </option>
            </select>

            {rejectError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs text-rose-800 mb-3 animate-in fade-in">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="font-medium">{rejectError}</span>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => setRejectModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 rounded-lg border border-slate-300 hover:bg-slate-50"
              >
                إلغاء
              </button>
              <button
                onClick={handleRejectSubmit}
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-sm"
              >
                تأكيد الرفض
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CivilRegistryActivationsPage() {
  return (
    <Suspense fallback={<div className="p-10 text-center text-xs text-slate-500">جاري التحميل...</div>}>
      <ActivationsContent />
    </Suspense>
  );
}
