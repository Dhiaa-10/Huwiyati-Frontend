"use client";

import React, { useState } from "react";
import { hospitalService } from "@/lib/api/hospitalService";
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
} from "lucide-react";

export default function EmergencyTriagePage() {
  const [nationalIdInput, setNationalIdInput] = useState("1010045678");
  const [patientRecord, setPatientRecord] = useState<MedicalRecord | null>(null);
  const [isSearched, setIsSearched] = useState(false);
  const [emergencyOverrideActive, setEmergencyOverrideActive] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" | "warning" } | null>(null);

  // Triage vital signs input
  const [vitalSigns, setVitalSigns] = useState({
    bloodPressure: "120/80",
    heartRate: "78",
    oxygenSat: "98",
    temperature: "37.1",
    triageLevel: "Level 2 - عاجل (Urgent)",
  });

  const showToast = (message: string, type: "success" | "error" | "warning" = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4500);
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
    } catch {
      showToast("خطأ أثناء استعلام سجل الطوارئ", "error");
    }
  };

  const handleRequestEmergencyOverride = () => {
    setEmergencyOverrideActive(true);
    showToast(
      "تم تفعيل صلاحية الفرز الطارئ الاستثنائي وتوثيق الإجراء في السجل الأمني المركزي للرقابة.",
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
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 border text-sm font-semibold transition-all ${
            notification.type === "success"
              ? "bg-emerald-900/90 text-emerald-100 border-emerald-500/40 backdrop-blur-md"
              : notification.type === "warning"
              ? "bg-amber-900/90 text-amber-100 border-amber-500/40 backdrop-blur-md"
              : "bg-rose-900/90 text-rose-100 border-rose-500/40 backdrop-blur-md"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : notification.type === "warning" ? (
            <AlertTriangle className="w-5 h-5 text-amber-400" />
          ) : (
            <AlertOctagon className="w-5 h-5 text-rose-400" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-l from-rose-950 via-[#00374e] to-slate-900 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden border border-rose-900/30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 text-rose-300 text-sm font-medium">
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              <span>وحدة الفرز السريري وطب الطوارئ والحوادث (Emergency Triage Protocol)</span>
            </div>
            <h1 className="text-2xl font-bold">الاستعلام الإسعافي السريع والبيانات المنقذة للحياة</h1>
            <p className="text-slate-300 text-sm mt-1">
              استرجاع فوري لفصائل الدم، الحساسيات الدوائية، والاتصال بأقارب المريض في حالات الطوارئ القصوى
            </p>
          </div>

          {/* Quick Search Box */}
          <form onSubmit={handleSearch} className="flex items-center gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
              <input
                type="text"
                maxLength={10}
                placeholder="أدخل الرقم الوطني للمصاب..."
                value={nationalIdInput}
                onChange={(e) => setNationalIdInput(e.target.value)}
                className="w-full pl-3 pr-9 py-2.5 bg-slate-950/80 border border-rose-900/60 rounded-xl text-white text-sm font-mono placeholder-slate-400 focus:outline-none focus:border-rose-400"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-rose-700 hover:bg-rose-600 text-white rounded-xl text-sm font-bold transition flex items-center gap-1.5 shadow-lg shadow-rose-950/40 shrink-0"
            >
              <AlertOctagon className="w-4 h-4" />
              <span>استعلام فوري</span>
            </button>
          </form>
        </div>
      </div>

      {/* Quick Access ID buttons for simulation */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3 flex items-center gap-2 overflow-x-auto text-xs">
        <span className="text-slate-400 shrink-0 flex items-center gap-1 font-semibold">
          <User className="w-3.5 h-3.5 text-cyan-400" />
          حالات للاختبار السريع:
        </span>
        <button
          onClick={() => {
            setNationalIdInput("1010045678");
            setTimeout(() => handleSearch(), 50);
          }}
          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-rose-300 rounded-lg border border-slate-700 font-mono flex items-center gap-1"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          1010045678 (سجل محجوب بالخصوصية)
        </button>
        <button
          onClick={() => {
            setNationalIdInput("1010023456");
            setTimeout(() => handleSearch(), 50);
          }}
          className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-cyan-300 rounded-lg border border-slate-700 font-mono flex items-center gap-1"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          1010023456 (سجل كامل مفتوح O+)
        </button>
      </div>

      {/* Main Results Area */}
      {patientRecord ? (
        <div className="space-y-6">
          {/* Privacy Locked State Handling (Screen 07 exact match) */}
          {!patientRecord.isVisibleToPerson && !emergencyOverrideActive ? (
            <div className="bg-slate-900/90 border border-amber-900/50 rounded-2xl p-8 shadow-2xl space-y-6">
              <div className="max-w-xl mx-auto text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-amber-950/80 border-2 border-amber-600/60 flex items-center justify-center mx-auto text-amber-400">
                  <Lock className="w-10 h-10" />
                </div>
                <h2 className="text-xl font-bold text-white">
                  عفواً، المواطن قام بإخفاء السجل الطبي للخصوصية
                </h2>
                <p className="text-slate-300 text-xs leading-relaxed">
                  لا يمكن الوصول إلى السجل الطبي التفصيلي المرتبط برقم الهوية المدخل. لقد قام المريض بتفعيل إعدادات الخصوصية المتقدمة لتقييد الوصول عبر تطبيق هويتي.
                </p>

                {/* Emergency Override CTA */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={handleRequestEmergencyOverride}
                    className="px-6 py-2.5 bg-rose-700 hover:bg-rose-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-rose-950/40 transition"
                  >
                    <Unlock className="w-4 h-4" />
                    <span>تفعيل صلاحية طوارئ استثنائية (إنقاذ حياة)</span>
                  </button>
                </div>
                <p className="text-[11px] text-amber-400/80 font-mono">
                  * يتم توثيق فتح صلاحية الطوارئ رسمياً في سجلات الرقابة المركزية لسوبر أدمن المنظومة
                </p>
              </div>

              {/* Lifesaving Data is Exposed for Emergencies */}
              <div className="pt-6 border-t border-slate-800">
                <h4 className="text-white font-bold text-sm mb-4 flex items-center gap-2 text-rose-300">
                  <AlertOctagon className="w-4 h-4 text-rose-500" />
                  بيانات الإنقاذ السريري الأساسية المصرح بها دولياً للطوارئ:
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Blood Group */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-rose-900/60 flex items-center justify-between">
                    <div>
                      <div className="text-xs text-rose-400 font-semibold">فصيلة الدم المعتمدة</div>
                      <div className="text-2xl font-black text-white font-mono mt-1">
                        {patientRecord.bloodGroup}
                      </div>
                    </div>
                    <div className="text-3xl">🩸</div>
                  </div>

                  {/* Drug Allergies */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-amber-900/60">
                    <div className="text-xs text-amber-400 font-semibold mb-1 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      الحساسيات وموانع الأدوية
                    </div>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {(patientRecord.allergies || []).length > 0 ? (
                        patientRecord.allergies!.map((al, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 bg-amber-950/80 text-amber-300 rounded border border-amber-800/60 text-xs font-semibold"
                          >
                            ⚠️ {al}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">لا توجد حساسيات مسجلة</span>
                      )}
                    </div>
                  </div>

                  {/* Emergency Contact */}
                  <div className="p-4 rounded-xl bg-slate-950 border border-slate-800">
                    <div className="text-xs text-cyan-400 font-semibold mb-1 flex items-center gap-1">
                      <Phone className="w-3.5 h-3.5" />
                      جهة اتصال الطوارئ (الأقارب)
                    </div>
                    <div className="text-xs text-slate-200 font-bold mt-1">
                      {patientRecord.emergencyContactName || "غير محدد"}
                    </div>
                    <a
                      href={`tel:${patientRecord.emergencyContactPhone}`}
                      className="text-cyan-300 font-mono text-xs hover:underline flex items-center gap-1 mt-1 font-bold"
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
                <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-700/60 text-rose-200 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Unlock className="w-4 h-4 text-rose-400" />
                    <span>
                      تم تفعيل صلاحية الفرز الطارئ الاستثنائي لهذا المريض. الرقم المرجعي الأمني: EMR-2026-9812.
                    </span>
                  </div>
                  <span className="text-[11px] font-mono bg-rose-900/60 px-2 py-0.5 rounded border border-rose-800">
                    مراقب أمنياً
                  </span>
                </div>
              )}

              {/* Patient Banner */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-rose-950 to-slate-900 border border-rose-700/50 flex items-center justify-center text-rose-400 font-black text-2xl font-mono shadow-inner">
                      {patientRecord.bloodGroup}
                    </div>
                    <div>
                      <h2 className="text-white font-bold text-lg">{patientName}</h2>
                      <div className="text-xs text-slate-400 flex items-center gap-3 mt-1">
                        <span className="font-mono">الرقم الوطني: {patientNid}</span>
                        <span>•</span>
                        <span className="text-rose-400 font-semibold">فصيلة الدم: {patientRecord.bloodGroup}</span>
                      </div>
                    </div>
                  </div>

                  {/* Emergency Contact Quick Dial */}
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-3">
                    <div>
                      <div className="text-[11px] text-slate-400">هاتف الطوارئ (الأقارب):</div>
                      <div className="text-xs text-white font-bold">{patientRecord.emergencyContactName || "غير محدد"}</div>
                      <div className="text-xs text-cyan-400 font-mono font-bold">
                        {patientRecord.emergencyContactPhone || "غير مسجل"}
                      </div>
                    </div>
                    <a
                      href={`tel:${patientRecord.emergencyContactPhone}`}
                      className="p-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                {/* Real-time Triage Vitals Input Bar */}
                <div className="mt-5 pt-4 border-t border-slate-800/80">
                  <h4 className="text-xs font-bold text-slate-300 mb-3 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    تسجيل المؤشرات الحيوية الأولية بلحظة الوصول (Triage Vital Signs):
                  </h4>

                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-xs">
                    <div>
                      <label className="block text-slate-400 mb-1">ضغط الدم (BP)</label>
                      <input
                        type="text"
                        value={vitalSigns.bloodPressure}
                        onChange={(e) => setVitalSigns({ ...vitalSigns, bloodPressure: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">النبض (HR bpm)</label>
                      <input
                        type="text"
                        value={vitalSigns.heartRate}
                        onChange={(e) => setVitalSigns({ ...vitalSigns, heartRate: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">الأكسجين (SpO2 %)</label>
                      <input
                        type="text"
                        value={vitalSigns.oxygenSat}
                        onChange={(e) => setVitalSigns({ ...vitalSigns, oxygenSat: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">الحرارة (°C)</label>
                      <input
                        type="text"
                        value={vitalSigns.temperature}
                        onChange={(e) => setVitalSigns({ ...vitalSigns, temperature: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 mb-1">تصنيف الفرز (Acuity)</label>
                      <select
                        value={vitalSigns.triageLevel}
                        onChange={(e) => setVitalSigns({ ...vitalSigns, triageLevel: e.target.value })}
                        className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-rose-300 font-semibold"
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
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <h4 className="text-white font-bold text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    الحساسيات وموانع الأدوية
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(patientRecord.allergies || []).length > 0 ? (
                      patientRecord.allergies!.map((al, idx) => (
                        <div
                          key={idx}
                          className="px-3 py-1.5 rounded-xl bg-amber-950/60 border border-amber-800/60 text-amber-300 text-xs font-semibold"
                        >
                          ⚠️ تحذير: حساسية مفرطة من ({al})
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">لا توجد حساسيات مسجلة</span>
                    )}
                  </div>

                  <h4 className="text-white font-bold text-sm flex items-center gap-2 pt-3 border-t border-slate-800">
                    <Heart className="w-4 h-4 text-rose-400" />
                    الأمراض المزمنة النشطة
                  </h4>
                  <div className="space-y-2 text-xs">
                    {patientRecord.chronicDiseases.map((cd) => (
                      <div
                        key={cd.id}
                        className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 flex items-center justify-between"
                      >
                        <div>
                          <span className="font-bold text-slate-200">{cd.diseaseName}</span>
                          {cd.medications && (
                            <div className="text-[11px] text-slate-400 mt-0.5">
                              الأدوية المداومة: {cd.medications.join("، ")}
                            </div>
                          )}
                        </div>
                        {cd.severity && (
                          <span className="px-2 py-0.5 bg-rose-950 text-rose-300 border border-rose-800/60 rounded text-[11px] font-bold">
                            {cd.severity}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Operations & Surgeries */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <h4 className="text-white font-bold text-sm flex items-center gap-2">
                    <Shield className="w-4 h-4 text-cyan-400" />
                    العمليات الجراحية السابقة
                  </h4>
                  <div className="space-y-2 text-xs">
                    {patientRecord.operations.length > 0 ? (
                      patientRecord.operations.map((op) => (
                        <div key={op.id} className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-200">{op.operationName}</span>
                            <span className="text-slate-400 font-mono text-[11px]">{op.operationDate}</span>
                          </div>
                          <div className="text-[11px] text-slate-400">
                            {op.hospitalName} • الجراح: {op.surgeonName}
                          </div>
                        </div>
                      ))
                    ) : (
                      <span className="text-xs text-slate-400">لا توجد عمليات جراحية سابقة</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : isSearched ? (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-16 text-center text-slate-400">
          <AlertOctagon className="w-12 h-12 mx-auto mb-3 text-rose-500" />
          <h3 className="text-white text-lg font-bold">لم يتم العثور على سجل بالرقم الوطني المدخل</h3>
          <p className="text-xs mt-1">تأكد من كتابة الرقم الوطني المكون من 10 أرقام بدقة.</p>
        </div>
      ) : (
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-16 text-center text-slate-400">
          <Heart className="w-12 h-12 mx-auto mb-3 text-cyan-500" />
          <h3 className="text-white text-lg font-bold">يرجى البحث بالرقم الوطني للفرز الإسعافي</h3>
          <p className="text-xs mt-1">
            أو اختر أحد الأرقام التجريبية في الشريط العلوي لتجربة سيناريو السجل المحجوب وسيناريو السجل المفتوح.
          </p>
        </div>
      )}
    </div>
  );
}
