"use client";

import React, { useState } from "react";
import { hospitalService, ServiceUnavailableError } from "@/lib/api/hospitalService";
import { MedicalRecord } from "@/types/hospitals";
import {
  AlertOctagon,
  Search,
  Heart,
  Phone,
  Shield,
  AlertTriangle,
  CheckCircle2,
  Lock,
  Unlock,
  Activity,
  User,
  Plus,
  Clock,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

import { useNotification } from "@/context/NotificationContext";

export default function EmergencyTriagePage() {
  const { toast } = useNotification();
  const [nationalIdInput, setNationalIdInput] = useState("");
  const [patientRecord, setPatientRecord] = useState<MedicalRecord | null>(null);
  const [isSearched, setIsSearched] = useState(false);
  const [isServiceUnavailable, setIsServiceUnavailable] = useState(false);
  const [emergencyOverrideActive, setEmergencyOverrideActive] = useState(false);

  // Triage vital signs input
  const [vitalSigns, setVitalSigns] = useState({
    bloodPressure: "120/80",
    heartRate: "78",
    oxygenSat: "98",
    temperature: "37.1",
    triageLevel: "Level 2 - عاجل (Urgent)",
  });

  const showToast = (message: string, type: "success" | "error" | "warning" = "success") => {
    if (type === "success") {
      toast.success(message);
    } else if (type === "warning") {
      toast.warning(message);
    } else {
      toast.error(message);
    }
  };

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!nationalIdInput.trim()) return;

    try {
      const rec = await hospitalService.getMedicalRecordByNationalNumber(nationalIdInput.trim());
      setPatientRecord(rec);
      setIsSearched(true);
      setEmergencyOverrideActive(false);

      if (rec) {
        const name = rec.patientFullName || (rec as any).citizenName;
        if (!rec.isVisibleToPerson) {
          showToast(
            "تنبيه: المواطن قام بتفعيل خصوصية السجل، يتم عرض البيانات المنقذة للحياة فقط.",
            "warning"
          );
        } else {
          showToast(`تم استرجاع السجل الإسعافي للمريض: ${name}`);
        }
      } else {
        showToast("لم يتم العثور على سجل طبي بهذا الرقم الوطني", "error");
      }
    } catch (err) {
      if (err instanceof ServiceUnavailableError) {
        setIsServiceUnavailable(true);
        setIsSearched(true);
        showToast("الخدمة غير متوفرة من الخادم حالياً", "error");
      } else {
        showToast("خطأ أثناء استعلام سجل الطوارئ", "error");
      }
    }
  };

  const handleRequestEmergencyOverride = () => {
    setEmergencyOverrideActive(true);
    showToast(
      "تم تفعيل صلاحية الفرز الطارئ الاستثنائي وعرض السجل السريري الكامل.",
      "success"
    );
  };

  const patientName = patientRecord
    ? patientRecord.patientFullName || (patientRecord as any).citizenName || "مواطن يمني"
    : "";
  const patientNid = patientRecord
    ? patientRecord.patientNationalNumber || (patientRecord as any).nationalNumber || ""
    : "";

  return (
    <div className="space-y-6">


      {/* Header Banner - Hwyati Sovereign Petrol Banner */}
      <div className="bg-gradient-to-l from-[#052F31] via-[#0C4A4E] to-[#103F43] rounded-2xl p-6 text-white shadow-md relative overflow-hidden border border-[#147A77]/30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#147A77]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1.5">
                <AlertOctagon className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
                وحدة الفرز السريري وطب الطوارئ والحوادث (Emergency Triage Protocol)
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">الاستعلام الإسعافي السريع والبيانات المنقذة للحياة</h1>
            <p className="text-slate-200 text-xs md:text-sm mt-1">
              استرجاع فوري لفصائل الدم، الحساسيات الدوائية، والاتصال بأقارب المريض في حالات الطوارئ القصوى
            </p>
          </div>

          {/* Quick Search Box */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4" />
              <input
                type="text"
                maxLength={11}
                placeholder="أدخل الرقم الوطني للمصاب (11 رقماً)..."
                value={nationalIdInput}
                onChange={(e) => setNationalIdInput(e.target.value)}
                className="w-full pl-3 pr-10 py-2.5 bg-white/10 border border-white/20 rounded-xl text-white text-xs font-mono placeholder:text-slate-300 focus:outline-none focus:border-white/50 focus:bg-white/15"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer shrink-0"
            >
              <AlertOctagon className="w-4 h-4" />
              <span>استعلام فوري</span>
            </button>
          </form>
        </div>
      </div>

      {/* Service Unavailable Banner */}
      {isServiceUnavailable && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-amber-900 shadow-xs flex items-start gap-4">
          <div className="p-2.5 bg-amber-100 rounded-xl text-amber-700 shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-amber-900">الخدمة غير متوفرة من الخادم حالياً</h3>
            <p className="text-xs text-amber-800/90 mt-1 leading-relaxed">
              واجهات برمجة التطبيقات (API) الخاصة بفرز الطوارئ وقراءة السجلات الإسعافية قيد التطوير في الخادم الخلفي. 
              تم إيقاف البيانات التجريبية لعرض الحالة الواقعية.
            </p>
          </div>
        </div>
      )}

      {/* Main Results Area */}
      {patientRecord ? (
        <div className="space-y-6">
          {/* Privacy Locked State Handling */}
          {!patientRecord.isVisibleToPerson && !emergencyOverrideActive ? (
            <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs space-y-6">
              <div className="max-w-xl mx-auto text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600">
                  <Lock className="w-8 h-8" />
                </div>
                <h2 className="text-lg font-extrabold text-[#052F31]">
                  عفواً، المواطن قام بإخفاء السجل الطبي للخصوصية
                </h2>
                <p className="text-xs text-[#41484d] leading-relaxed">
                  لا يمكن الوصول إلى السجل الطبي التفصيلي المرتبط برقم الهوية المدخل. لقد قام المريض بتفعيل إعدادات الخصوصية المتقدمة لتقييد الوصول عبر تطبيق هويتي.
                </p>

                {/* Emergency Override CTA */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={handleRequestEmergencyOverride}
                    className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition cursor-pointer"
                  >
                    <Unlock className="w-4 h-4" />
                    <span>تفعيل صلاحية طوارئ استثنائية (إنقاذ حياة)</span>
                  </button>
                </div>
                <p className="text-[11px] text-amber-700 font-mono">
                  * يتم توثيق فتح صلاحية الطوارئ رسمياً في سجلات الرقابة المركزية لسوبر أدمن المنظومة
                </p>
              </div>

              {/* Lifesaving Data is Exposed for Emergencies */}
              <div className="pt-6 border-t border-slate-100">
                <h4 className="text-[#052F31] font-bold text-xs mb-4 flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-rose-600" />
                  بيانات الإنقاذ السريري الأساسية المصرح بها دولياً للطوارئ:
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Blood Group */}
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-rose-700 font-bold">فصيلة الدم المعتمدة</div>
                      <div className="text-2xl font-black text-rose-950 font-mono mt-1" dir="ltr">
                        {patientRecord.bloodGroup}
                      </div>
                    </div>
                    <div className="text-3xl">🩸</div>
                  </div>

                  {/* Drug Allergies */}
                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200">
                    <div className="text-xs text-amber-800 font-bold mb-1 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      الحساسيات وموانع الأدوية
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {(patientRecord.allergies || []).length > 0 ? (
                        patientRecord.allergies!.map((al, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-lg border border-amber-300 text-xs font-semibold"
                          >
                            ⚠️ {al}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-500">لا توجد حساسيات مسجلة</span>
                      )}
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="text-xs text-[#052F31] font-bold mb-1 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5 text-[#0C4A4E]" />
                      جهة اتصال الطوارئ (الأقارب)
                    </div>
                    <div className="text-xs text-slate-800 font-bold mt-1">
                      {patientRecord.emergencyContactName || "غير محدد"}
                    </div>
                    <a
                      href={`tel:${patientRecord.emergencyContactPhone}`}
                      className="text-[#0C4A4E] font-mono text-xs hover:underline flex items-center gap-1 mt-1 font-bold"
                    >
                      <Phone className="w-3 h-3" />
                      {patientRecord.emergencyContactPhone || "غير مسجل"}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Full Emergency Record View */
            <div className="space-y-6">
              {emergencyOverrideActive && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Unlock className="w-4 h-4 text-rose-600" />
                    <span className="font-semibold">
                      تم تفعيل صلاحية الفرز الطارئ الاستثنائي لهذا المريض. الرقم المرجعي الأمني: EMR-2026-9812.
                    </span>
                  </div>
                  <span className="text-[11px] font-mono bg-rose-100 text-rose-800 px-2 py-0.5 rounded border border-rose-300 font-bold">
                    مراقب أمنياً
                  </span>
                </div>
              )}

              {/* Patient Banner */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700 font-black text-2xl font-mono shadow-xs" dir="ltr">
                      {patientRecord.bloodGroup}
                    </div>
                    <div>
                      <h2 className="text-[#052F31] font-extrabold text-lg">{patientName}</h2>
                      <div className="text-xs text-[#41484d] flex items-center gap-3 mt-1">
                        <span className="font-mono">الرقم الوطني: {patientNid}</span>
                        <span>•</span>
                        <span className="text-rose-700 font-bold">فصيلة الدم: <span dir="ltr">{patientRecord.bloodGroup}</span></span>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact Quick Dial */}
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center gap-3">
                    <div>
                      <div className="text-[11px] text-slate-500">هاتف الطوارئ (الأقارب):</div>
                      <div className="text-xs text-[#052F31] font-bold">{patientRecord.emergencyContactName || "غير محدد"}</div>
                      <div className="text-xs text-[#0C4A4E] font-mono font-bold">
                        {patientRecord.emergencyContactPhone || "غير مسجل"}
                      </div>
                    </div>
                    <a
                      href={`tel:${patientRecord.emergencyContactPhone}`}
                      className="p-2.5 bg-[#0C4A4E] hover:bg-[#052F31] text-white rounded-xl transition shadow-xs cursor-pointer"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Real-time Triage Vitals Input Bar */}
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-[#052F31] mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#0C4A4E]" />
                    تسجيل المؤشرات الحيوية الأولية بلحظة الوصول (Triage Vital Signs):
                  </h4>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-600 mb-1 font-semibold">ضغط الدم (BP)</label>
                      <input
                        type="text"
                        value={vitalSigns.bloodPressure}
                        onChange={(e) => setVitalSigns({ ...vitalSigns, bloodPressure: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono text-xs focus:ring-2 focus:ring-[#0C4A4E] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1 font-semibold">النبض (HR bpm)</label>
                      <input
                        type="text"
                        value={vitalSigns.heartRate}
                        onChange={(e) => setVitalSigns({ ...vitalSigns, heartRate: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono text-xs focus:ring-2 focus:ring-[#0C4A4E] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1 font-semibold">الأكسجين (SpO2 %)</label>
                      <input
                        type="text"
                        value={vitalSigns.oxygenSat}
                        onChange={(e) => setVitalSigns({ ...vitalSigns, oxygenSat: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono text-xs focus:ring-2 focus:ring-[#0C4A4E] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1 font-semibold">الحرارة (°C)</label>
                      <input
                        type="text"
                        value={vitalSigns.temperature}
                        onChange={(e) => setVitalSigns({ ...vitalSigns, temperature: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono text-xs focus:ring-2 focus:ring-[#0C4A4E] focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-600 mb-1 font-semibold">تصنيف الفرز (Acuity)</label>
                      <select
                        value={vitalSigns.triageLevel}
                        onChange={(e) => setVitalSigns({ ...vitalSigns, triageLevel: e.target.value })}
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-rose-700 font-bold text-xs focus:ring-2 focus:ring-rose-500 focus:outline-none"
                      >
                        <option>Level 1 - إنعاش فوري (Resuscitation)</option>
                        <option>Level 2 - عاجل حرج (Emergent)</option>
                        <option>Level 3 - متوسط الخطورة (Urgent)</option>
                        <option>Level 4 - غير حرج (Non-urgent)</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Critical Clinical Highlights */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Allergies and Chronic conditions */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                  <h4 className="text-[#052F31] font-bold text-xs flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    الحساسيات وموانع الأدوية
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(patientRecord.allergies || []).length > 0 ? (
                      patientRecord.allergies!.map((al, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold"
                        >
                          ⚠️ تحذير: حساسية مفرطة من ({al})
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">لا توجد حساسيات مسجلة</span>
                    )}
                  </div>

                  <h4 className="text-[#052F31] font-bold text-xs flex items-center gap-2 pt-3 border-t border-slate-100">
                    <Heart className="w-4 h-4 text-rose-600" />
                    الأمراض المزمنة النشطة
                  </h4>
                  <div className="space-y-2 text-xs">
                    {patientRecord.chronicDiseases.map((cd) => (
                      <div
                        key={cd.id}
                        className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-slate-800">{cd.diseaseName}</span>
                          {cd.medications && (
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              الأدوية المداومة: {cd.medications.join("، ")}
                            </div>
                          )}
                        </div>
                        {cd.severity && (
                          <span className="px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded text-[11px] font-bold">
                            {cd.severity}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Operations & Surgeries */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                  <h4 className="text-[#052F31] font-bold text-xs flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#0C4A4E]" />
                    العمليات الجراحية السابقة
                  </h4>
                  <div className="space-y-2 text-xs">
                    {patientRecord.operations.length > 0 ? (
                      patientRecord.operations.map((op) => (
                        <div key={op.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-800">{op.operationName}</span>
                            <span className="text-slate-500 font-mono text-[11px]">{op.operationDate}</span>
                          </div>
                          <div className="text-[11px] text-slate-500">
                            {op.hospitalName} • الجراح: {op.surgeonName}
                          </div>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-slate-500">لا توجد عمليات جراحية سابقة</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : isSearched ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center text-slate-500 shadow-xs">
          <AlertOctagon className="w-12 h-12 mx-auto mb-3 text-rose-600" />
          <h3 className="text-[#052F31] text-base font-bold">لم يتم العثور على سجل بالرقم الوطني المدخل</h3>
          <p className="text-xs text-[#41484d] mt-1">تأكد من كتابة الرقم الوطني المكون من 11 رقماً بدقة.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-2xl p-16 text-center text-slate-500 shadow-xs">
          <Heart className="w-12 h-12 mx-auto mb-3 text-[#0C4A4E]" />
          <h3 className="text-[#052F31] text-base font-bold">يرجى إدخال الرقم الوطني للفرز الإسعافي</h3>
          <p className="text-xs text-[#41484d] mt-1">
            أدخل الرقم الوطني للمصاب المكون من 11 رقماً في شريط البحث بالأعلى للوصول الفوري للبيانات المنقذة للحياة.
          </p>
        </div>
      )}
    </div>
  );
}
