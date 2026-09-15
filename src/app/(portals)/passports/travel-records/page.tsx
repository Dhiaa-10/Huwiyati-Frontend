"use client";

import React, { useState, useEffect } from "react";
import {
  Plane,
  QrCode,
  Search,
  ShieldCheck,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  ArrowDownLeft,
  ArrowUpRight,
  Camera,
  RefreshCw,
  Compass,
  FileCheck,
  User,
  Clock,
  Car,
} from "lucide-react";
import { passportsService } from "@/lib/api/passportsService";
import {
  PassportRecord,
  TravelRecord,
  TravelMovementType,
  BorderPortType,
} from "@/types/passports";

export default function TravelRecordsAndPortsPage() {
  const [records, setRecords] = useState<TravelRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [movementFilter, setMovementFilter] = useState("all");
  const [flaggedOnly, setFlaggedOnly] = useState(false);

  // Scanner & Active Traveler state
  const [scannedPassportNumber, setScannedPassportNumber] = useState("08451234");
  const [activePassport, setActivePassport] = useState<PassportRecord | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  // Travel Form state
  const [movementType, setMovementType] = useState<TravelMovementType>("Exit");
  const [selectedPort, setSelectedPort] = useState("مطار صنعاء الدولي");
  const [portType, setPortType] = useState<BorderPortType>("Airport");
  const [country, setCountry] = useState("المملكة العربية السعودية");
  const [flightNumber, setFlightNumber] = useState("IY-601");
  const [securityNotes, setSecurityNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [movementAlert, setMovementAlert] = useState<{
    type: "success" | "danger";
    text: string;
  } | null>(null);

  useEffect(() => {
    loadTravelRecords();
    handleScanPassport("08451234");
  }, []);

  const loadTravelRecords = async () => {
    setLoading(true);
    try {
      const res = await passportsService.getTravelRecords({
        search,
        movementType: movementFilter === "all" ? undefined : movementFilter,
        isFlagged: flaggedOnly ? true : undefined,
      });
      setRecords(res.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleScanPassport = async (passNum: string) => {
    setIsScanning(true);
    setScanMessage("جاري قراءة الشريحة الإلكترونية وفحص القوائم الأمنية...");
    try {
      const p = await passportsService.getPassportByNumber(passNum);
      setTimeout(() => {
        setActivePassport(p);
        setIsScanning(false);
        setScanMessage(null);
      }, 350);
    } catch (err) {
      setIsScanning(false);
      setScanMessage("فشل قراءة بيانات الجواز.");
    }
  };

  const handleRecordMovement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activePassport) return;

    setSubmitting(true);
    setMovementAlert(null);

    try {
      const res = await passportsService.recordTravelMovement({
        passportNumber: activePassport.passportNumber,
        movementType,
        portName: selectedPort,
        portType,
        destinationOrOriginCountry: country,
        flightOrVehicleNumber: flightNumber,
        officerUserId: "01010025671",
        officerName: "النقيب عادل قاسم الأنسي",
        securityNotes: securityNotes || undefined,
      });

      if (res.isFlagged) {
        setMovementAlert({
          type: "danger",
          text: `تم حظر المغادرة والتحفظ على المسافر فوراً! ${res.message}`,
        });
      } else {
        setMovementAlert({
          type: "success",
          text: `تم ختم الجواز وتسجيل حركة ال${
            movementType === "Entry" ? "دخول" : "مغادرة"
          } بنجاح عبر ${selectedPort}.`,
        });
      }

      // Refresh records list
      loadTravelRecords();
    } catch (err) {
      console.error(err);
      setMovementAlert({ type: "danger", text: "حدث خطأ أثناء تسجيل حركة العبور." });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0b4f6c] mb-1">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping"></span>
            نظام الرقابة بالمنافذ الحدودية والجوازات - صلاحيات ضابط المنفذ (مستوى 3)
          </div>
          <h1 className="text-2xl font-bold text-[#00374e]">
            سجلات السفر والمنافذ البرية والجوية
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            التحقق من صلاحية الجواز، كشف قوائم المنع من السفر لحظياً، وتسجيل حركات الدخول والمغادرة
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadTravelRecords}
            disabled={loading}
            className="p-2 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#0b4f6c]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Movement Result Banner */}
      {movementAlert && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between animate-fade-in ${
            movementAlert.type === "success"
              ? "bg-emerald-50 border-emerald-300 text-emerald-900"
              : "bg-rose-100 border-rose-400 text-rose-950 font-bold"
          }`}
        >
          <div className="flex items-center gap-3">
            {movementAlert.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <ShieldAlert className="w-6 h-6 text-rose-600 shrink-0 animate-bounce" />
            )}
            <span>{movementAlert.text}</span>
          </div>
          <button
            onClick={() => setMovementAlert(null)}
            className="text-xs text-gray-500 hover:text-black font-semibold"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Scanner & Traveler Profile Section (Bento Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Scanner Card (Left 4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-[#00374e] flex items-center gap-2">
                <QrCode className="w-4 h-4 text-[#0b4f6c]" />
                ماسح الجوازات الإلكتروني
              </h3>
              <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-bold">
                e-MRZ / QR
              </span>
            </div>

            {/* Quick Demo Selector */}
            <div>
              <label className="text-[11px] font-bold text-gray-600 block mb-1.5">
                نماذج تجربة سريعة (محاكاة المسح):
              </label>
              <div className="grid grid-cols-1 gap-1.5 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setScannedPassportNumber("08451234");
                    handleScanPassport("08451234");
                  }}
                  className={`p-2 rounded-xl text-right border transition-all ${
                    scannedPassportNumber === "08451234"
                      ? "border-[#0b4f6c] bg-blue-50/70 text-[#00374e] font-bold"
                      : "border-gray-200 hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>أحمد محمد السالمي (سليم)</span>
                    <span className="font-mono text-[10px] text-gray-500">08451234</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setScannedPassportNumber("07119023");
                    handleScanPassport("07119023");
                  }}
                  className={`p-2 rounded-xl text-right border transition-all ${
                    scannedPassportNumber === "07119023"
                      ? "border-rose-400 bg-rose-50 text-rose-900 font-bold"
                      : "border-gray-200 hover:bg-gray-50 text-gray-700"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-rose-700">فارس العديني (مطلوب أمنياً)</span>
                    <span className="font-mono text-[10px] text-rose-600">07119023</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Manual Passport Number Search */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-gray-600">أو إدخال رقم الجواز يدوياً:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={scannedPassportNumber}
                  onChange={(e) => setScannedPassportNumber(e.target.value)}
                  placeholder="مثال: 08451234"
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-xs font-mono font-bold focus:outline-none focus:border-[#0b4f6c]"
                />
                <button
                  type="button"
                  onClick={() => handleScanPassport(scannedPassportNumber)}
                  className="px-3 py-2 bg-[#00374e] text-white rounded-xl text-xs font-bold hover:bg-[#0b4f6c] transition-colors"
                >
                  مسح
                </button>
              </div>
            </div>

            {/* Scanner Visual Frame */}
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center bg-gray-50/50 flex flex-col items-center justify-center relative overflow-hidden group">
              {isScanning ? (
                <div className="py-4 space-y-2">
                  <div className="w-12 h-12 border-4 border-[#0b4f6c] border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs text-[#0b4f6c] font-bold animate-pulse">
                    جاري المسح وفحص القوائم...
                  </p>
                </div>
              ) : (
                <>
                  <Camera className="w-8 h-8 text-gray-400 mb-2 group-hover:text-[#0b4f6c] transition-colors" />
                  <p className="text-xs text-gray-500">
                    ضع جواز السفر أو رمز الاستجابة السريعة أمام القارئ
                  </p>
                  <button
                    type="button"
                    onClick={() => handleScanPassport(scannedPassportNumber)}
                    className="mt-3 px-4 py-1.5 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs font-bold transition-all"
                  >
                    إعادة المسح الضوئي
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Citizen Traveler Data Card (Right 8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between">
          <div>
            {/* Header & Watchlist Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4 mb-5">
              <div>
                <h3 className="text-base font-bold text-[#00374e]">
                  بيانات المسافر وصلاحية وثيقة السفر
                </h3>
                <p className="text-xs text-gray-500">
                  الفحص الأمني الموحد وقاعدة بيانات الهجرة والجوازات
                </p>
              </div>

              {activePassport ? (
                activePassport.isWatchlistBanned ? (
                  <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-100 text-rose-900 border border-rose-300 animate-pulse text-xs font-black">
                    <ShieldAlert className="w-4 h-4 text-rose-600" />
                    <span>ممنوع من السفر - مطلوب قضائياً</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>آمن للسفر (سجل سليم)</span>
                  </div>
                )
              ) : null}
            </div>

            {activePassport ? (
              <div className="space-y-5">
                {activePassport.isWatchlistBanned && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-300 text-rose-900 text-xs flex items-start gap-2.5">
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold">تنبيه أمني عاجل صادر من الجهات القضائية المختصة:</div>
                      <div className="mt-0.5">{activePassport.watchlistReason}</div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  {/* Photo */}
                  <div className="w-28 h-36 rounded-xl border border-gray-200 overflow-hidden bg-gray-100 shrink-0 shadow-sm relative">
                    <img
                      src={activePassport.photoUrl}
                      alt={activePassport.fullName}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Grid details */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <span className="text-gray-400 text-[10px]">الاسم الرباعي للمسافر:</span>
                      <p className="font-bold text-gray-900 text-sm mt-0.5">
                        {activePassport.fullName}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <span className="text-gray-400 text-[10px]">رقم جواز السفر:</span>
                      <p className="font-bold text-[#00374e] font-mono text-sm mt-0.5">
                        {activePassport.passportNumber}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <span className="text-gray-400 text-[10px]">الرقم الوطني:</span>
                      <p className="font-bold text-gray-800 font-mono mt-0.5">
                        {activePassport.nationalNumber}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <span className="text-gray-400 text-[10px]">تاريخ الانتهاء:</span>
                      <p className="font-bold text-gray-800 font-mono mt-0.5">
                        {activePassport.expiryDate} (ساري الصلاحية)
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <span className="text-gray-400 text-[10px]">جهة الإصدار:</span>
                      <p className="font-bold text-gray-800 mt-0.5">
                        {activePassport.issuingBranchName}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <span className="text-gray-400 text-[10px]">نوع الجواز:</span>
                      <p className="font-bold text-[#0b4f6c] mt-0.5">
                        {activePassport.passportTypeLabel}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-10 text-center text-xs text-gray-400">
                قم بمسح الجواز أو اختيار مسافر لعرض ملفه الأمني.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Movement Recording Form (Stitch Screen 15) */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
        <div className="flex items-center gap-2 border-b border-gray-100 pb-3 mb-5">
          <div className="p-2 rounded-xl bg-[#0b4f6c]/10 text-[#0b4f6c]">
            <Plane className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#00374e]">تسجيل حركة العبور وختم الجواز</h3>
            <p className="text-xs text-gray-500">
              تسجيل خروج أو قدوم المسافر وتوثيق بيانات الرحلة والمنفذ
            </p>
          </div>
        </div>

        <form onSubmit={handleRecordMovement} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Movement Type Toggle */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">نوع الحركة:</label>
              <div className="grid grid-cols-2 gap-1 bg-gray-100 p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setMovementType("Exit")}
                  className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                    movementType === "Exit"
                      ? "bg-[#00374e] text-white shadow-sm"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>مغادرة (خروج)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMovementType("Entry")}
                  className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                    movementType === "Entry"
                      ? "bg-emerald-700 text-white shadow-sm"
                      : "text-gray-600 hover:text-black"
                  }`}
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  <span>قدوم (دخول)</span>
                </button>
              </div>
            </div>

            {/* Port Selection */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">المنفذ الحدودي:</label>
              <select
                value={selectedPort}
                onChange={(e) => {
                  setSelectedPort(e.target.value);
                  setPortType(e.target.value.includes("مطار") ? "Airport" : "LandPort");
                }}
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:border-[#0b4f6c] bg-white"
              >
                <option value="مطار صنعاء الدولي">مطار صنعاء الدولي (جوي)</option>
                <option value="مطار عدن الدولي">مطار عدن الدولي (جوي)</option>
                <option value="منفذ الوديعة البري">منفذ الوديعة البري (بري)</option>
                <option value="منفذ شحن البري">منفذ شحن البري (بري)</option>
                <option value="ميناء عدن البحري">ميناء عدن البحري (بحري)</option>
              </select>
            </div>

            {/* Destination/Origin Country */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">
                {movementType === "Exit" ? "وجهة السفر (المقصد):" : "بلد القدوم:"}
              </label>
              <select
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none focus:border-[#0b4f6c] bg-white"
              >
                <option value="المملكة العربية السعودية">المملكة العربية السعودية</option>
                <option value="جمهورية مصر العربية">جمهورية مصر العربية</option>
                <option value="المملكة الأردنية الهاشمية">المملكة الأردنية الهاشمية</option>
                <option value="الإمارات العربية المتحدة">الإمارات العربية المتحدة</option>
                <option value="الجمهورية التركية">الجمهورية التركية</option>
                <option value="سلطنة عمان">سلطنة عمان</option>
                <option value="ماليزيا">ماليزيا</option>
                <option value="الهند">الهند</option>
              </select>
            </div>

            {/* Flight / Vehicle number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700">رقم الرحلة / المركبة:</label>
              <input
                type="text"
                value={flightNumber}
                onChange={(e) => setFlightNumber(e.target.value)}
                placeholder="مثال: IY-601 أو لوحة رقم 12345"
                className="w-full p-2.5 rounded-xl border border-gray-200 text-xs font-mono font-bold focus:outline-none focus:border-[#0b4f6c] bg-white"
              />
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="text-[11px] text-gray-500">
              ضابط المنفذ المعتمد: <strong>النقيب عادل قاسم الأنسي</strong> • التوثيق أوتوماتيكي ومربوط بالغرفة المركزية
            </div>

            <button
              type="submit"
              disabled={submitting || !activePassport}
              className={`px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 ${
                activePassport?.isWatchlistBanned
                  ? "bg-rose-600 hover:bg-rose-700 text-white"
                  : "bg-[#00374e] hover:bg-[#0b4f6c] text-white"
              } disabled:opacity-50`}
            >
              {activePassport?.isWatchlistBanned ? (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  <span>تنفيذ إجراء المنع والتحفظ الفوري</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>اعتماد العبور وختم الجواز الإلكتروني</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Live Travel Records Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gray-50/50">
          <div>
            <h3 className="text-sm font-bold text-[#00374e] flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#0b4f6c]" />
              سجل العبور اللحظي عبر المنافذ
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              كافة حركات السفر المسجلة حديثاً في منظومة الجوازات
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="البحث بالاسم أو رقم الجواز..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && loadTravelRecords()}
                className="pl-4 pr-9 py-2 rounded-xl border border-gray-200 text-xs w-full sm:w-56 focus:outline-none focus:border-[#0b4f6c] bg-white"
              />
            </div>

            <select
              value={movementFilter}
              onChange={(e) => setMovementFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none bg-white"
            >
              <option value="all">كل الحركات</option>
              <option value="Entry">دخول (قدوم)</option>
              <option value="Exit">خروج (مغادرة)</option>
            </select>

            <label className="flex items-center gap-1.5 text-xs text-rose-700 font-semibold cursor-pointer select-none">
              <input
                type="checkbox"
                checked={flaggedOnly}
                onChange={(e) => setFlaggedOnly(e.target.checked)}
                className="rounded border-rose-300 text-rose-600 focus:ring-rose-500"
              />
              <span>تنبيهات أمنية فقط</span>
            </label>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-gray-100/70 text-gray-700 font-bold border-b border-gray-200">
                <th className="py-3 px-5">اسم المسافر</th>
                <th className="py-3 px-5">رقم الجواز</th>
                <th className="py-3 px-5">نوع الحركة</th>
                <th className="py-3 px-5">المنفذ الحدودي</th>
                <th className="py-3 px-5">البلد والرحلة</th>
                <th className="py-3 px-5">الوقت والتاريخ</th>
                <th className="py-3 px-5">ضابط المنفذ</th>
                <th className="py-3 px-5 text-center">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">
                    جاري تحميل سجلات السفر...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-gray-400">
                    لا توجد حركات عبور مسجلة.
                  </td>
                </tr>
              ) : (
                records.map((r) => (
                  <tr
                    key={r.id}
                    className={`hover:bg-blue-50/30 transition-colors ${
                      r.isFlagged ? "bg-rose-50/40" : ""
                    }`}
                  >
                    <td className="py-3 px-5 font-semibold text-gray-900">{r.fullName}</td>
                    <td className="py-3 px-5 font-mono font-bold text-[#00374e]">
                      {r.passportNumber}
                    </td>
                    <td className="py-3 px-5">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          r.movementType === "Entry"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-blue-50 text-blue-800 border border-blue-200"
                        }`}
                      >
                        {r.movementType === "Entry" ? (
                          <ArrowDownLeft className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <ArrowUpRight className="w-3 h-3 text-blue-600" />
                        )}
                        {r.movementType === "Entry" ? "قدوم" : "مغادرة"}
                      </span>
                    </td>
                    <td className="py-3 px-5 text-gray-700">{r.portName}</td>
                    <td className="py-3 px-5 text-gray-700">
                      <div>{r.destinationOrOriginCountry}</div>
                      {r.flightOrVehicleNumber && (
                        <div className="text-[10px] text-gray-400 font-mono">
                          {r.flightOrVehicleNumber}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-5 text-gray-500 tabular-nums">
                      {new Date(r.timestamp).toLocaleString("ar-YE", {
                        hour: "2-digit",
                        minute: "2-digit",
                        day: "numeric",
                        month: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-5 text-gray-600">{r.officerName}</td>
                    <td className="py-3 px-5 text-center">
                      {r.isFlagged ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                          <ShieldAlert className="w-3 h-3 text-rose-600" />
                          حظر أمني
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          نظامي
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
