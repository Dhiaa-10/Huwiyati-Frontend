"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Search,
  UserCheck,
  Fingerprint,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  History,
  ShieldAlert,
  Clock,
  MapPin,
  Calendar,
  CreditCard,
  Camera,
  RefreshCw,
  X,
} from "lucide-react";
import { civilRegistryService } from "@/lib/api/civilRegistryService";
import { CitizenCivilRecord } from "@/types/civilRegistry";

function ActivationsContent() {
  const searchParams = useSearchParams();
  const initialNid = searchParams.get("nid") || "";

  const [nationalIdSearch, setNationalIdSearch] = useState(initialNid);
  const [searching, setSearching] = useState(false);
  const [citizen, setCitizen] = useState<CitizenCivilRecord | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Biometric scanning state
  const [scanning, setScanning] = useState(false);
  const [scanMatched, setScanMatched] = useState(false);

  // Notification / Modals
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("عدم تطابق البصمة الحيوية مع السجل الوطني");

  // Recent log history
  const [historyList, setHistoryList] = useState<
    { title: string; nid: string; time: string; status: "success" | "rejected" }[]
  >([
    {
      title: "تفعيل حساب مواطن",
      nid: "02010012345",
      time: "منذ 20 دقيقة",
      status: "success",
    },
    {
      title: "تفعيل حساب مواطن",
      nid: "04010067890",
      time: "منذ 45 دقيقة",
      status: "success",
    },
    {
      title: "رفض طلب تفعيل",
      nid: "01010099002",
      time: "منذ ساعتين",
      status: "rejected",
    },
  ]);

  const showNotification = (
    type: "success" | "error" | "info",
    message: string
  ) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const handleSearch = async (nidToSearch?: string) => {
    const q = (nidToSearch || nationalIdSearch).trim();
    if (!q) {
      alert("يرجى إدخال الرقم الوطني للمواطن (11 خانة).");
      return;
    }

    setSearching(true);
    setNotFound(false);
    setCitizen(null);
    setScanMatched(false);

    try {
      const found = await civilRegistryService.searchCitizenByNationalId(q);
      if (found) {
        setCitizen(found);
        if (found.accountStatus === "Active") {
          setScanMatched(true);
        }
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

  // Simulate scanning
  const handleStartBiometricScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setScanMatched(true);
      showNotification("success", "تمت مطابقة البصمة بنسبة 99.2% مع بيانات السجل المركزي.");
    }, 1800);
  };

  // Confirm Activation
  const handleActivateCitizen = async () => {
    if (!citizen) return;

    try {
      const res = await civilRegistryService.activateAccount({
        nationalNumber: citizen.nationalNumber,
        branchId: "22222222-bbbb-cccc-dddd-000000000001",
        officerUserId: "usr-civil-officer-01",
        biometricMatched: true,
      });

      setCitizen(res.citizen);
      showNotification("success", res.message);

      // Prepend to history
      setHistoryList((prev) => [
        {
          title: `تفعيل حساب: ${res.citizen.fullName}`,
          nid: res.citizen.nationalNumber,
          time: "الآن",
          status: "success",
        },
        ...prev,
      ]);
    } catch (err: any) {
      showNotification("error", err.message || "فشلت عملية التفعيل.");
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
      showNotification("info", "تم توثيق رفض التفعيل في سجل الأمان المركزي.");

      setHistoryList((prev) => [
        {
          title: `رفض تفعيل: ${citizen.fullName}`,
          nid: citizen.nationalNumber,
          time: "الآن",
          status: "rejected",
        },
        ...prev,
      ]);
    } catch (err) {
      showNotification("error", "فشلت عملية الرفض.");
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
              : notification.type === "error"
              ? "bg-rose-700 border border-rose-400"
              : "bg-[#0b4f6c] border border-sky-400"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-300" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2.5 h-2.5 rounded-full bg-[#00374e]"></span>
          <span className="text-xs font-bold text-[#00374e] uppercase tracking-wider">
            بوابة التحقق الحضوري الميداني
          </span>
        </div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-[#00374e]">
          تفعيل حسابات المواطنين (In-Person Biometric Activation)
        </h1>
        <p className="text-sm text-[#41484d] mt-1">
          مطابقة بصمة المواطن الحاضر في الفرع بالرقم الوطني لتفعيل دخوله إلى تطبيق هويتي الرقمي.
        </p>
      </div>

      {/* Search Bar (Stitch Screen 02) */}
      <div className="bg-white rounded-2xl border border-[#e0e3e5] p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 w-full relative">
            <label className="block text-xs font-bold text-[#00374e] mb-1.5">
              رقم الهوية الوطنية للمواطن (11 رقماً)
            </label>
            <div className="relative">
              <input
                type="text"
                maxLength={11}
                value={nationalIdSearch}
                onChange={(e) => setNationalIdSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="أدخل الرقم الوطني، مثال: 01010045678 أو 01010078901..."
                className="w-full bg-[#f7f9fb] border border-[#c0c7ce] rounded-xl px-4 py-3.5 text-base font-mono font-bold text-[#191c1e] placeholder:text-slate-400 focus:outline-none focus:border-[#0b4f6c] focus:ring-1 focus:ring-[#0b4f6c] transition-all"
              />
              <span className="absolute left-4 top-3.5 text-xs text-slate-400 font-mono">
                {nationalIdSearch.length}/11
              </span>
            </div>
          </div>

          <button
            onClick={() => handleSearch()}
            disabled={searching}
            className="w-full md:w-auto bg-[#00374e] hover:bg-[#0b4f6c] text-white px-8 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
          >
            {searching ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <Search className="w-5 h-5" />
            )}
            <span>بحث عن السجل المدني</span>
          </button>
        </div>

        {/* Quick hint buttons */}
        <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-slate-100 text-xs">
          <span className="text-slate-500 font-medium">سجلات تجريبية سريعة:</span>
          <button
            onClick={() => {
              setNationalIdSearch("01010045678");
              handleSearch("01010045678");
            }}
            className="font-mono bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded text-slate-700 transition-colors"
          >
            01010045678 (عبدالله الدوسري - معلق)
          </button>
          <button
            onClick={() => {
              setNationalIdSearch("01010078901");
              handleSearch("01010078901");
            }}
            className="font-mono bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded text-slate-700 transition-colors"
          >
            01010078901 (أروى الأنسي - معلق)
          </button>
          <button
            onClick={() => {
              setNationalIdSearch("02010012345");
              handleSearch("02010012345");
            }}
            className="font-mono bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded text-slate-700 transition-colors"
          >
            02010012345 (طارق بافضل - مفعل)
          </button>
        </div>
      </div>

      {/* Main Grid: Citizen Profile & History */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Citizen Details Area (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
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
                  <div className="w-32 h-40 rounded-xl overflow-hidden border-2 border-slate-200 shadow-sm shrink-0 bg-slate-100">
                    <img
                      src={citizen.photoUrl}
                      alt={citizen.fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Info Table */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <h3 className="text-lg font-bold text-[#00374e]">
                        {citizen.fullName}
                      </h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        الرقم الوطني الموحد:{" "}
                        <strong className="font-mono text-[#0b4f6c]">
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

              {/* Biometric Verification Box */}
              <div className="bg-white rounded-2xl border border-[#e0e3e5] p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Fingerprint className="w-6 h-6 text-[#00374e]" />
                    <h3 className="text-base font-bold text-[#00374e]">
                      المطابقة البايومترية الحية (Biometric Match)
                    </h3>
                  </div>

                  {scanMatched ? (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>تمت المطابقة بنجاح (99.2%)</span>
                    </span>
                  ) : scanning ? (
                    <span className="text-xs font-bold text-[#0b4f6c] bg-sky-50 px-3 py-1 rounded-full border border-sky-200 flex items-center gap-1.5 animate-pulse">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>جاري القراءة من الماسح الضوئي...</span>
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                      بانتظار وضع الإصبع على الجهاز
                    </span>
                  )}
                </div>

                {/* Visual Progress Bar */}
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-700 ${
                      scanMatched
                        ? "w-full bg-[#005539]"
                        : scanning
                        ? "w-2/3 bg-[#0b4f6c] animate-pulse"
                        : "w-0"
                    }`}
                  />
                </div>

                {/* Scan Trigger Button if not matched */}
                {!scanMatched && (
                  <button
                    onClick={handleStartBiometricScan}
                    disabled={scanning}
                    className="w-full py-3 bg-[#f2f4f6] hover:bg-[#e0e3e5] text-[#00374e] border border-slate-300 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    <Fingerprint className="w-4 h-4 text-[#0b4f6c]" />
                    <span>تشغيل الماسح البايومتري وقراءة البصمة الحية</span>
                  </button>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                {citizen.accountStatus !== "Active" ? (
                  <>
                    <button
                      onClick={handleActivateCitizen}
                      disabled={!scanMatched}
                      className="flex-1 bg-[#005539] hover:bg-[#003c27] text-white py-4 px-6 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
                    >
                      <UserCheck className="w-5 h-5" />
                      <span>تفعيل الحساب الرقمي للمواطن (موافق)</span>
                    </button>

                    <button
                      onClick={() => setRejectModalOpen(true)}
                      className="sm:w-44 bg-white hover:bg-rose-50 text-rose-700 border border-rose-200 py-4 px-6 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
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
              <Fingerprint className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-base font-bold text-slate-700">
                أدخل الرقم الوطني للمواطن لبدء عملية التفعيل
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                يقوم النظام بالتحقق التلقائي من قاعدة بيانات السجل المدني المركزي ومطابقة
                بيانات الهوية مع البصمة الحية في الفرع.
              </p>
            </div>
          )}
        </div>

        {/* History / Audit Sidebar (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-2xl border border-[#e0e3e5] p-6 shadow-xs">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-100">
              <History className="w-5 h-5 text-[#00374e]" />
              <h3 className="text-sm font-bold text-[#00374e]">
                حركات التفعيل الأخيرة بالفرع
              </h3>
            </div>

            <div className="space-y-3">
              {historyList.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-[#f7f9fb] border border-slate-200 rounded-xl flex items-start gap-3 text-xs"
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                      item.status === "success"
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-rose-100 text-rose-700"
                    }`}
                  >
                    {item.status === "success" ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="font-bold text-slate-800">{item.title}</div>
                    <div className="font-mono text-[11px] text-slate-500 mt-0.5">
                      الرقم الوطني: {item.nid}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      {item.time}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
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
              className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 mb-4 focus:outline-none focus:border-[#0b4f6c]"
            >
              <option value="عدم تطابق البصمة الحيوية مع السجل الوطني">
                عدم تطابق البصمة الحيوية مع السجل الوطني
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
