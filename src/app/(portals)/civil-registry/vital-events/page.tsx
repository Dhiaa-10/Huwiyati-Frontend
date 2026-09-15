"use client";

import React, { useState, useEffect } from "react";
import {
  ScrollText,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  Calendar,
  Building2,
  FileSpreadsheet,
  Download,
  Baby,
  HeartCrack,
  HeartHandshake,
  X,
  RefreshCw,
} from "lucide-react";
import { civilRegistryService } from "@/lib/api/civilRegistryService";
import { VitalEvent, VitalEventType } from "@/types/civilRegistry";

export default function VitalEventsPage() {
  const [events, setEvents] = useState<VitalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [govFilter, setGovFilter] = useState<string>("all");

  // Modals
  const [birthModalOpen, setBirthModalOpen] = useState(false);
  const [deathModalOpen, setDeathModalOpen] = useState(false);

  // New Birth Form
  const [birthForm, setBirthForm] = useState({
    childFirstName: "",
    childGender: "Male" as "Male" | "Female",
    dateOfBirth: new Date().toISOString().split("T")[0],
    placeOfBirth: "صنعاء - السبعين",
    fatherNationalNumber: "",
    motherNationalNumber: "",
    hospitalOrganizationId: "11111111-aaaa-bbbb-cccc-000000000004",
    governorate: "أمانة العاصمة",
    district: "السبعين",
  });

  // New Death Form
  const [deathForm, setDeathForm] = useState({
    deceasedNationalNumber: "",
    deathDate: new Date().toISOString().split("T")[0],
    placeOfDeath: "مستشفى الثورة العام",
    causeOfDeath: "قصور كلوي حاد",
    governorate: "أمانة العاصمة",
    district: "صنعاء القديمة",
  });

  // Notification
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  const showNotification = (
    type: "success" | "error" | "info",
    message: string
  ) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 4000);
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const res = await civilRegistryService.getVitalEvents({
        search: searchTerm,
        eventType: typeFilter,
        governorate: govFilter,
        page: 1,
        pageSize: 50,
      });
      setEvents(res.items);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [searchTerm, typeFilter, govFilter]);

  const handleBirthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthForm.childFirstName || !birthForm.fatherNationalNumber) {
      alert("يرجى ملء اسم المولود والرقم الوطني للأب.");
      return;
    }

    try {
      const created = await civilRegistryService.registerBirth(birthForm);
      setEvents((prev) => [created, ...prev]);
      setBirthModalOpen(false);
      setBirthForm({
        childFirstName: "",
        childGender: "Male",
        dateOfBirth: new Date().toISOString().split("T")[0],
        placeOfBirth: "صنعاء - السبعين",
        fatherNationalNumber: "",
        motherNationalNumber: "",
        hospitalOrganizationId: "11111111-aaaa-bbbb-cccc-000000000004",
        governorate: "أمانة العاصمة",
        district: "السبعين",
      });
      showNotification(
        "success",
        `تم قيد واقعة الميلاد وإصدار الشهادة رقم [${created.certificateNumber}].`
      );
    } catch (err) {
      showNotification("error", "فشلت عملية تسجيل واقعة الميلاد.");
    }
  };

  const handleDeathSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!deathForm.deceasedNationalNumber) {
      alert("يرجى إدخال الرقم الوطني للمتوفى.");
      return;
    }

    try {
      const created = await civilRegistryService.registerDeath(deathForm);
      setEvents((prev) => [created, ...prev]);
      setDeathModalOpen(false);
      showNotification(
        "success",
        `تم تسجيل شهادة الوفاة وتحديث سجل المتوفى برقم [${created.certificateNumber}].`
      );
    } catch (err) {
      showNotification("error", "فشلت عملية تسجيل الوفاة.");
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
      {/* Toast */}
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
            <span className="w-2.5 h-2.5 rounded-full bg-[#00374e]"></span>
            <span className="text-xs font-bold text-[#00374e] uppercase tracking-wider">
              السجل المدني المركزي
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#00374e]">
            تسجيل وتوثيق الوقائع الحيوية (Vital Events)
          </h1>
          <p className="text-sm text-[#41484d] mt-1">
            قيد شهادات الميلاد، وثائق الوفاة، وعقود الزواج الواردة من المستشفيات والمحاكم المعتمدة.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setDeathModalOpen(true)}
            className="px-4 py-2.5 bg-rose-50 text-rose-800 hover:bg-rose-100 border border-rose-200 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5"
          >
            <HeartCrack className="w-4 h-4 text-rose-600" />
            <span>قيد واقعة وفاة</span>
          </button>

          <button
            onClick={() => setBirthModalOpen(true)}
            className="px-5 py-2.5 bg-[#0b4f6c] hover:bg-[#00374e] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-1.5"
          >
            <Baby className="w-4 h-4" />
            <span>تسجيل واقعة ميلاد جديدة</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-[#e0e3e5] p-5 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#41484d]">بحث سريع</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute right-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ابحث برقم الشهادة، اسم المولود أو المتوفى..."
                className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg pr-10 pl-4 py-2 text-sm text-[#191c1e] focus:outline-none focus:border-[#0b4f6c]"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#41484d]">نوع الواقعة</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg px-4 py-2 text-sm text-[#191c1e] focus:outline-none focus:border-[#0b4f6c]"
            >
              <option value="all">جميع الوقائع</option>
              <option value="Birth">واقعة ميلاد (Birth)</option>
              <option value="Marriage">عقد زواج (Marriage)</option>
              <option value="Death">واقعة وفاة (Death)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#41484d]">المحافظة</label>
            <select
              value={govFilter}
              onChange={(e) => setGovFilter(e.target.value)}
              className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg px-4 py-2 text-sm text-[#191c1e] focus:outline-none focus:border-[#0b4f6c]"
            >
              <option value="all">جميع المحافظات</option>
              <option value="أمانة العاصمة">أمانة العاصمة (صنعاء)</option>
              <option value="عدن">عدن</option>
              <option value="تعز">تعز</option>
              <option value="حضرموت">حضرموت</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Table */}
      <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex justify-center items-center gap-3">
            <RefreshCw className="w-8 h-8 text-[#0b4f6c] animate-spin" />
            <span className="text-sm font-medium text-slate-500">جاري تحميل الوقائع...</span>
          </div>
        ) : events.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <ScrollText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-slate-700">لا توجد وقائع تطابق البحث</h4>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse text-xs">
              <thead className="bg-[#f0eadd]/60 border-b border-[#c0c7ce]/50 font-bold text-[#00374e]">
                <tr>
                  <th className="py-4 px-6">رقم الشهادة / الوثيقة</th>
                  <th className="py-4 px-6">نوع الواقعة</th>
                  <th className="py-4 px-6">المعني بالواقعة</th>
                  <th className="py-4 px-6">الجهة المصدرة / المبلغة</th>
                  <th className="py-4 px-6">المحافظة والمديرية</th>
                  <th className="py-4 px-6">تاريخ الحدوث</th>
                  <th className="py-4 px-6">المعتمد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e0e3e5]/70">
                {events.map((ev) => (
                  <tr key={ev.id} className="hover:bg-[#f7f9fb] transition-colors">
                    <td className="py-4 px-6 font-mono font-bold text-[#0b4f6c]">
                      {ev.certificateNumber}
                    </td>

                    <td className="py-4 px-6">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-bold text-[11px] ${
                          ev.eventType === "Birth"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : ev.eventType === "Marriage"
                            ? "bg-purple-50 text-purple-700 border border-purple-200"
                            : "bg-slate-100 text-slate-700 border border-slate-300"
                        }`}
                      >
                        {ev.eventType === "Birth" && <Baby className="w-3.5 h-3.5" />}
                        {ev.eventType === "Marriage" && <HeartHandshake className="w-3.5 h-3.5" />}
                        {ev.eventType === "Death" && <HeartCrack className="w-3.5 h-3.5" />}
                        <span>
                          {ev.eventType === "Birth"
                            ? "واقعة ميلاد"
                            : ev.eventType === "Marriage"
                            ? "عقد زواج"
                            : "واقعة وفاة"}
                        </span>
                      </span>
                    </td>

                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-800">{ev.subjectName}</div>
                      {ev.subjectNationalNumber && (
                        <div className="font-mono text-[11px] text-slate-500">
                          {ev.subjectNationalNumber}
                        </div>
                      )}
                    </td>

                    <td className="py-4 px-6 text-slate-700">
                      {ev.hospitalName || ev.courtName || "السجل المدني"}
                    </td>

                    <td className="py-4 px-6 text-slate-600">
                      {ev.governorate} - {ev.district}
                    </td>

                    <td className="py-4 px-6 font-mono text-slate-500">
                      {ev.eventDate}
                    </td>

                    <td className="py-4 px-6 text-slate-600 font-medium">
                      {ev.approvedByOfficer}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Register Birth Modal */}
      {birthModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Baby className="w-6 h-6 text-[#0b4f6c]" />
                <h3 className="text-base font-bold text-[#00374e]">
                  قيد واقعة ولادة جديدة
                </h3>
              </div>
              <button
                onClick={() => setBirthModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBirthSubmit} className="py-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  اسم المولود الأول *
                </label>
                <input
                  type="text"
                  required
                  value={birthForm.childFirstName}
                  onChange={(e) =>
                    setBirthForm({ ...birthForm, childFirstName: e.target.value })
                  }
                  placeholder="مثال: يوسف، فاطمة..."
                  className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#0b4f6c]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">الجنس *</label>
                  <select
                    value={birthForm.childGender}
                    onChange={(e) =>
                      setBirthForm({
                        ...birthForm,
                        childGender: e.target.value as "Male" | "Female",
                      })
                    }
                    className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#0b4f6c]"
                  >
                    <option value="Male">ذكر</option>
                    <option value="Female">أنثى</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    تاريخ الولادة *
                  </label>
                  <input
                    type="date"
                    required
                    value={birthForm.dateOfBirth}
                    onChange={(e) =>
                      setBirthForm({ ...birthForm, dateOfBirth: e.target.value })
                    }
                    className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-[#0b4f6c]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    الرقم الوطني للأب *
                  </label>
                  <input
                    type="text"
                    required
                    maxLength={11}
                    value={birthForm.fatherNationalNumber}
                    onChange={(e) =>
                      setBirthForm({
                        ...birthForm,
                        fatherNationalNumber: e.target.value,
                      })
                    }
                    placeholder="010100xxxxx"
                    className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#0b4f6c]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    الرقم الوطني للأم
                  </label>
                  <input
                    type="text"
                    maxLength={11}
                    value={birthForm.motherNationalNumber}
                    onChange={(e) =>
                      setBirthForm({
                        ...birthForm,
                        motherNationalNumber: e.target.value,
                      })
                    }
                    placeholder="010100xxxxx"
                    className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#0b4f6c]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">المحافظة</label>
                  <input
                    type="text"
                    value={birthForm.governorate}
                    onChange={(e) =>
                      setBirthForm({ ...birthForm, governorate: e.target.value })
                    }
                    className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">المديرية</label>
                  <input
                    type="text"
                    value={birthForm.district}
                    onChange={(e) =>
                      setBirthForm({ ...birthForm, district: e.target.value })
                    }
                    className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg px-3 py-2 text-xs"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setBirthModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#0b4f6c] hover:bg-[#00374e] text-white rounded-xl font-bold shadow-sm"
                >
                  قيد وتوليد الرقم الوطني
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Register Death Modal */}
      {deathModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <HeartCrack className="w-6 h-6 text-rose-700" />
                <h3 className="text-base font-bold text-[#00374e]">
                  قيد واقعة وفاة رسمية
                </h3>
              </div>
              <button
                onClick={() => setDeathModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDeathSubmit} className="py-4 space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  الرقم الوطني للمتوفى *
                </label>
                <input
                  type="text"
                  required
                  maxLength={11}
                  value={deathForm.deceasedNationalNumber}
                  onChange={(e) =>
                    setDeathForm({
                      ...deathForm,
                      deceasedNationalNumber: e.target.value,
                    })
                  }
                  placeholder="010100xxxxx"
                  className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#0b4f6c]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">تاريخ الوفاة *</label>
                <input
                  type="date"
                  required
                  value={deathForm.deathDate}
                  onChange={(e) =>
                    setDeathForm({ ...deathForm, deathDate: e.target.value })
                  }
                  className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">سبب الوفاة</label>
                <input
                  type="text"
                  value={deathForm.causeOfDeath}
                  onChange={(e) =>
                    setDeathForm({ ...deathForm, causeOfDeath: e.target.value })
                  }
                  placeholder="الوصف الطبي الرسمي..."
                  className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg px-3 py-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setDeathModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-600 rounded-xl"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-rose-700 hover:bg-rose-800 text-white rounded-xl font-bold shadow-sm"
                >
                  تسجيل الوفاة وإيقاف القيد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
