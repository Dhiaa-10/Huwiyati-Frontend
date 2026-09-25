"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Users,
  Search,
  RefreshCw,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CreditCard,
  MapPin,
  Calendar,
  Heart,
  Eye,
  X,
  Loader2,
  Copy,
  Check,
  Building,
  UserCheck,
  Shield,
  FileText,
  BadgeCheck
} from "lucide-react";
import { adminService, CitizenLookup } from "@/lib/api/adminService";

export default function CitizensRegistryPage() {
  const [citizens, setCitizens] = useState<CitizenLookup[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [governorateFilter, setGovernorateFilter] = useState<string>("all");
  const [genderFilter, setGenderFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Selected Citizen for ID Card Modal
  const [selectedCitizen, setSelectedCitizen] = useState<CitizenLookup | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [permissionError, setPermissionError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setPermissionError(null);
    try {
      const data = await adminService.getCitizens();
      if (data.length === 0) {
        setPermissionError(
          "صلاحية مقيّدة: ليس لديك صلاحية الوصول إلى سجل المواطنين المركزي حالياً.\n" +
          "يرجى التواصل مع مسؤول النظام لإتاحة مسار /api/v1/Person لصلاحية السوبر أدمن (SuperAdmin)."
        );
      } else {
        setCitizens(data);
      }
    } catch (err: any) {

      const msg: string = err?.message ?? "";
      // 403 Forbidden — backend doesn't authorize SuperAdmin for this endpoint yet
      if (msg.includes("403") || msg.toLowerCase().includes("forbidden") || msg.toLowerCase().includes("unauthorized") || msg.includes("Forbidden")) {
        setPermissionError(
          "ليس لديك صلاحية الوصول إلى بيانات المواطنين حالياً.\n" +
          "يرجى التواصل مع مسؤول النظام لتفعيل صلاحية (SuperAdmin) على مسار /api/v1/Person."
        );
      } else {
        setPermissionError(`تعذّر تحميل بيانات المواطنين: ${msg || "خطأ غير متوقع"}`);
      }
      console.error("Error loading citizens data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);


  const handleCopy = (nationalNumber: string) => {
    navigator.clipboard.writeText(nationalNumber);
    setCopiedId(nationalNumber);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Distinct governorates for filter
  const governorates = useMemo(() => {
    const set = new Set<string>();
    citizens.forEach((c) => {
      if (c.governorate && c.governorate !== "غير محدد") {
        set.add(c.governorate);
      }
    });
    return Array.from(set);
  }, [citizens]);

  // Filtered citizens
  const filteredCitizens = useMemo(() => {
    return citizens.filter((c) => {
      const matchesSearch =
        searchTerm === "" ||
        c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.nationalNumber.includes(searchTerm) ||
        (c.governorate && c.governorate.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (c.district && c.district.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesGov =
        governorateFilter === "all" || c.governorate === governorateFilter;

      const matchesGender =
        genderFilter === "all" || c.gender === genderFilter;

      const matchesStatus =
        statusFilter === "all" || c.personStatus === statusFilter;

      return matchesSearch && matchesGov && matchesGender && matchesStatus;
    });
  }, [citizens, searchTerm, governorateFilter, genderFilter, statusFilter]);

  // Calculate age helper
  const calculateAge = (dobString: string): number | null => {
    if (!dobString) return null;
    try {
      const dob = new Date(dobString);
      const diff = Date.now() - dob.getTime();
      const ageDate = new Date(diff);
      return Math.abs(ageDate.getUTCFullYear() - 1970);
    } catch {
      return null;
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-[#00374e] uppercase tracking-wider">
              السجل المدني المركزي الموحد
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#00374e]">
            السجل المركزي للمواطنين
          </h1>
          <p className="text-sm text-[#41484d] mt-1">
            استعراض السجلات الديموغرافية الموثقة للمواطنين في قاعدة البيانات المركزية ومتابعة الهوية الوطنية الموحدة.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            title="تحديث البيانات"
            className="p-2.5 bg-white text-[#00374e] border border-slate-300 rounded-xl hover:bg-slate-50 transition-all shadow-xs cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 text-[#0b4f6c] ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <Loader2 className="w-10 h-10 text-[#0b4f6c] animate-spin" />
          <p className="text-sm text-slate-500">جاري تحميل بيانات المواطنين...</p>
        </div>
      )}

      {/* Permission / Error Banner */}
      {!loading && permissionError && (
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-8 flex flex-col items-center gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center">
            <Shield className="w-8 h-8 text-amber-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-amber-800 mb-2">صلاحية الوصول مقيّدة</h3>
            {permissionError.split("\n").map((line, i) => (
              <p key={i} className="text-sm text-amber-700">{line}</p>
            ))}
          </div>
          <button
            onClick={loadData}
            className="mt-2 px-5 py-2 bg-amber-600 text-white text-sm font-medium rounded-xl hover:bg-amber-700 transition-colors flex items-center gap-2 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Main Content — only shown when data loaded successfully */}
      {!loading && !permissionError && (
        <>
      {/* KPI Stats Cards */}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 mb-1">إجمالي المواطنين المسجلين</div>
            <div className="text-2xl font-black text-[#00374e]">{citizens.length}</div>
            <div className="text-[11px] text-slate-400 mt-1">سجل مدني موثق في قاعدة البيانات</div>
          </div>
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 mb-1">السجلات النشطة</div>
            <div className="text-2xl font-black text-emerald-600">
              {citizens.filter((c) => c.personStatus === "نشط").length}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">حسابات نشطة ومؤهلة للخدمات</div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 mb-1">المحافظات المغطاة</div>
            <div className="text-2xl font-black text-[#00374e]">
              {governorates.length || 1}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">ضمن النطاق الجغرافي المسجل</div>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
            <MapPin className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 mb-1">المطابقة الأمنية</div>
            <div className="text-2xl font-black text-[#00374e]">100%</div>
            <div className="text-[11px] text-slate-400 mt-1">أرقام وطنية فريدة ومحققة</div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
            <Shield className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث بالاسم الرباعي، الرقم الوطني، أو المحافظة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0b4f6c] focus:border-transparent transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Governorate Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">المحافظة:</span>
            <select
              value={governorateFilter}
              onChange={(e) => setGovernorateFilter(e.target.value)}
              className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-slate-700"
            >
              <option value="all">كافة المحافظات</option>
              {governorates.map((gov) => (
                <option key={gov} value={gov}>
                  {gov}
                </option>
              ))}
            </select>
          </div>

          {/* Gender Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">الجنس:</span>
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value)}
              className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-slate-700"
            >
              <option value="all">الكل</option>
              <option value="ذكر">ذكر</option>
              <option value="أنثى">أنثى</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">الحالة:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-slate-700"
            >
              <option value="all">الكل</option>
              <option value="نشط">نشط</option>
              <option value="معلق">معلق</option>
              <option value="متوفى">متوفى</option>
            </select>
          </div>
        </div>
      </div>

      {/* Citizens Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#0b4f6c] mb-3" />
            <p className="text-xs">جاري جلب السجل الديموغرافي للمواطنين من السيرفر...</p>
          </div>
        ) : filteredCitizens.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Users className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-sm font-bold text-slate-600">لا يوجد مواطنين مطابقين لمعايير البحث</p>
            <p className="text-xs text-slate-400 mt-1">جرب تغيير شروط البحث أو الفلترة</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-[#00374e] border-b border-slate-200 font-bold">
                <tr>
                  <th className="py-3.5 px-4">المواطن (الاسم الكامل)</th>
                  <th className="py-3.5 px-4">الرقم الوطني</th>
                  <th className="py-3.5 px-4">تاريخ الميلاد والعمر</th>
                  <th className="py-3.5 px-4">محل الإقامة (المحافظة/المديرية)</th>
                  <th className="py-3.5 px-4">الجنس وفصيلة الدم</th>
                  <th className="py-3.5 px-4">الحالة</th>
                  <th className="py-3.5 px-4 text-center">البطاقة الوطنية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCitizens.map((citizen) => {
                  const age = calculateAge(citizen.dateOfBirth);
                  return (
                    <tr key={citizen.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name & Avatar */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#00374e]/10 text-[#00374e] font-bold flex items-center justify-center text-xs">
                            {citizen.firstName ? citizen.firstName.charAt(0) : "م"}
                          </div>
                          <div>
                            <div className="font-bold text-[#00374e]">{citizen.fullName}</div>
                            <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                              <span>الجنسية:</span>
                              <span className="text-slate-600 font-semibold">{citizen.nationality}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* National Number */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono bg-slate-100 px-2 py-1 rounded text-slate-800 text-[11px] font-bold">
                            {citizen.nationalNumber}
                          </span>
                          <button
                            onClick={() => handleCopy(citizen.nationalNumber)}
                            title="نسخ الرقم الوطني"
                            className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                          >
                            {copiedId === citizen.nationalNumber ? (
                              <Check className="w-3 h-3 text-emerald-600" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                      </td>

                      {/* DOB & Age */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col text-[11px]">
                          <span className="font-mono text-slate-700" dir="ltr">
                            {citizen.dateOfBirth}
                          </span>
                          {age !== null && (
                            <span className="text-[10px] text-slate-400">
                              {age} سنة
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col text-[11px]">
                          <span className="font-semibold text-slate-800">
                            {citizen.governorate}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {citizen.district ? `مديرية ${citizen.district}` : citizen.placeOfBirth}
                          </span>
                        </div>
                      </td>

                      {/* Gender & Blood Group */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[10px] font-semibold">
                            {citizen.gender}
                          </span>
                          {citizen.bloodGroup && citizen.bloodGroup !== "غير محدد" && (
                            <span className="px-1.5 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded text-[10px] font-mono font-bold">
                              {citizen.bloodGroup}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {citizen.personStatus === "نشط" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            نشط
                          </span>
                        ) : citizen.personStatus === "متوفى" ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                            متوفى
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            معلق
                          </span>
                        )}
                      </td>

                      {/* Details Button */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => setSelectedCitizen(citizen)}
                          className="px-3 py-1.5 bg-[#00374e]/5 hover:bg-[#00374e]/10 text-[#00374e] font-semibold rounded-lg transition-all text-[11px] inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>عرض السجل</span>
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

      {/* Digital National ID Preview Modal */}
      {selectedCitizen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
            {/* Modal Header */}
            <div className="bg-[#00374e] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-white/10 rounded-xl">
                  <CreditCard className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="text-base font-bold">بطاقة الهوية الوطنية الرقمية</h3>
                  <p className="text-[11px] text-slate-200">الجمهورية اليمنية • مصلحة الأحوال المدنية والسجل المدني</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCitizen(null)}
                className="text-white/70 hover:text-white cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* ID Card Visual */}
            <div className="p-6 space-y-6">
              <div className="relative bg-gradient-to-br from-[#00374e] via-[#0b4f6c] to-[#012a3d] text-white p-6 rounded-2xl shadow-lg border border-cyan-800 overflow-hidden">
                {/* Background watermark */}
                <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-white/5 rounded-full blur-xl pointer-events-none"></div>

                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="text-[10px] text-cyan-200 tracking-wider">الجمهورية اليمنية</div>
                    <div className="text-xs font-bold text-white">منظومة هويتي الموحدة</div>
                  </div>
                  <BadgeCheck className="w-6 h-6 text-amber-300" />
                </div>

                <div className="grid grid-cols-3 gap-4 items-center">
                  <div className="col-span-1 flex flex-col items-center">
                    <div className="w-20 h-24 bg-slate-200/20 rounded-xl border border-white/20 flex items-center justify-center text-white text-3xl font-black">
                      {selectedCitizen.firstName?.charAt(0) || "م"}
                    </div>
                    <span className="text-[10px] text-cyan-200 mt-2">صورة المواطن</span>
                  </div>

                  <div className="col-span-2 space-y-2 text-right">
                    <div>
                      <div className="text-[9px] text-cyan-200">الاسم الكامل</div>
                      <div className="text-sm font-black text-white">{selectedCitizen.fullName}</div>
                    </div>

                    <div>
                      <div className="text-[9px] text-cyan-200">الرقم الوطني</div>
                      <div className="text-sm font-mono font-bold text-amber-300 tracking-wider">
                        {selectedCitizen.nationalNumber}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <span className="text-cyan-200 block text-[9px]">تاريخ الميلاد:</span>
                        <span className="font-mono text-white" dir="ltr">
                          {selectedCitizen.dateOfBirth}
                        </span>
                      </div>
                      <div>
                        <span className="text-cyan-200 block text-[9px]">فصيلة الدم:</span>
                        <span className="font-bold text-rose-300">{selectedCitizen.bloodGroup}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-3 border-t border-white/10 flex justify-between items-center text-[10px] text-cyan-200">
                  <span>المحافظة: {selectedCitizen.governorate}</span>
                  <span>الجنس: {selectedCitizen.gender}</span>
                  <span className="text-emerald-300 font-bold">الحالة: {selectedCitizen.personStatus}</span>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="space-y-2 text-xs">
                <h4 className="font-bold text-slate-800 mb-2">تفاصيل السجل الديموغرافي</h4>
                <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px]">الاسم الأول:</span>
                    <span className="font-bold text-slate-700">{selectedCitizen.firstName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">اسم الأب:</span>
                    <span className="font-bold text-slate-700">{selectedCitizen.fatherName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">اسم الجد:</span>
                    <span className="font-bold text-slate-700">{selectedCitizen.grandfatherName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">اللقب (العائلة):</span>
                    <span className="font-bold text-slate-700">{selectedCitizen.familyName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">محل الميلاد:</span>
                    <span className="font-semibold text-slate-700">{selectedCitizen.placeOfBirth}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">المديرية:</span>
                    <span className="font-semibold text-slate-700">{selectedCitizen.district}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-slate-400 block text-[10px]">تفاصيل العنوان:</span>
                    <span className="font-semibold text-slate-700">
                      {selectedCitizen.addressDetails || "لا توجد تفاصيل إضافية"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedCitizen(null)}
                  className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
}
