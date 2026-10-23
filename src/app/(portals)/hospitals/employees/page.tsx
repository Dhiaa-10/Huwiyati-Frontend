"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Search,
  CheckCircle2,
  AlertCircle,
  Phone,
  Mail,
  Eye,
  Power,
  RefreshCw,
  X,
  ShieldCheck,
  Activity,
  Heart,
  Stethoscope,
  Calendar,
} from "lucide-react";
import { employeesService } from "@/lib/api/employeesService";
import { Employee } from "@/types/admin";
import { useAuth } from "@/context/AuthContext";
import { useNotification } from "@/context/NotificationContext";

export default function HospitalEmployeesPage() {
  const { user } = useAuth();
  const { confirm, toast } = useNotification();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [branchName, setBranchName] = useState(user.branchName || "المستشفى العام");

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // Form states
  const [nationalNumber, setNationalNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  // Auto-dismiss feedback after 5 seconds
  useEffect(() => {
    if (!feedback) return;
    const t = setTimeout(() => setFeedback(null), 5000);
    return () => clearTimeout(t);
  }, [feedback]);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const res = await employeesService.getEmployees();
      if (res.isSuccess) {
        setEmployees(res.employees);
        if (res.branchName) setBranchName(res.branchName);
      } else {
        setFeedback({ type: "error", message: res.message || "حدث خطأ أثناء جلب الكادر الصحي." });
      }
    } catch {
      setFeedback({ type: "error", message: "تعذر الاتصال بالخادم لجلب الكادر الطبي." });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (emp: Employee) => {
    const isCurrentlyActive = emp.isActive;
    const isConfirmed = await confirm({
      title: isCurrentlyActive ? "تأكيد تعطيل حساب الكادر الطبي" : "تأكيد تنشيط حساب الكادر الطبي",
      message: isCurrentlyActive
        ? `هل أنت متأكد من تجميد صلاحيات الكادر الطبي (${emp.fullName})؟ لن يتمكن من تسجيل الدخول أو توثيق الوقائع الطبية حتى إعادة تنشيطه.`
        : `هل أنت متأكد من إعادة تنشيط وتفعيل حساب الكادر الطبي (${emp.fullName})؟`,
      type: isCurrentlyActive ? "warning" : "info",
      confirmText: isCurrentlyActive ? "نعم، تجميد الصلاحيات" : "نعم، تنشيط الحساب",
      cancelText: "إلغاء",
    });

    if (!isConfirmed) return;

    try {
      const res = isCurrentlyActive
        ? await employeesService.deactivateEmployee(emp.id)
        : await employeesService.activateEmployee(emp.id);

      if (res.isSuccess) {
        setEmployees((prev) =>
          prev.map((e) =>
            e.id === emp.id
              ? { ...e, isActive: !isCurrentlyActive, accountStatus: (!isCurrentlyActive ? "Active" : "Suspended") as "Active" | "Suspended" }
              : e
          )
        );
        if (selectedEmployee && selectedEmployee.id === emp.id) {
          setSelectedEmployee((prev) =>
            prev ? { ...prev, isActive: !isCurrentlyActive, accountStatus: (!isCurrentlyActive ? "Active" : "Suspended") as "Active" | "Suspended" } : null
          );
        }
        const sMsg = `تم ${!isCurrentlyActive ? "تنشيط" : "تعطيل"} حساب الكادر: (${emp.fullName}) بنجاح.`;
        toast.success(sMsg);
        setFeedback({
          type: "success",
          message: sMsg,
        });
      } else {
        const eMsg = res.message || "فشل تغيير حالة الحساب.";
        toast.error(eMsg);
        setFeedback({ type: "error", message: eMsg });
      }
    } catch {
      const eMsg = "فشل تغيير حالة الحساب.";
      toast.error(eMsg);
      setFeedback({ type: "error", message: eMsg });
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nationalNumber.trim()) {
      const eMsg = "يرجى إدخال الرقم الوطني للمواطن المراد تكليفه.";
      setModalError(eMsg);
      toast.error(eMsg);
      return;
    }
    setSubmitting(true);
    try {
      const res = await employeesService.assignEmployee(nationalNumber.trim());
      if (res.isSuccess && res.employee) {
        setEmployees((prev) => [res.employee!, ...prev]);
        setAddModalOpen(false);
        setNationalNumber("");
        setModalError(null);
        const sMsg = `تم تعيين الكادر الصحي (${res.employee.fullName}) برقم وظيفي: ${res.employee.employeeNumber} بنجاح.`;
        toast.success(sMsg);
        setFeedback({
          type: "success",
          message: sMsg,
        });
      } else {
        const eMsg = res.message || "حدث خطأ أثناء تكليف الكادر.";
        setModalError(eMsg);
        toast.error(eMsg);
      }
    } catch (err: any) {
      const eMsg = err?.message || "حدث خطأ أثناء تكليف الكادر.";
      setModalError(eMsg);
      toast.error(eMsg);
    } finally {
      setSubmitting(false);
    }
  };

  const openDetailsModal = async (emp: Employee) => {
    setSelectedEmployee(emp);
    setDetailsModalOpen(true);
    setFetchingDetails(true);
    try {
      const res = await employeesService.getEmployeeById(emp.id);
      if (res.isSuccess && res.employee) {
        setSelectedEmployee(res.employee);
      }
    } catch {
      // keep optimistic data
    } finally {
      setFetchingDetails(false);
    }
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchQuery =
      emp.fullName.toLowerCase().includes(search.toLowerCase()) ||
      emp.nationalNumber.includes(search) ||
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      emp.employeeNumber.toLowerCase().includes(search.toLowerCase()) ||
      (emp.roleLabel?.toLowerCase().includes(search.toLowerCase()) ?? false);

    const matchStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && emp.isActive) ||
      (statusFilter === "suspended" && !emp.isActive);

    return matchQuery && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Feedback Notification */}
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between shadow-lg text-xs font-bold ${
            feedback.type === "success"
              ? "bg-emerald-600 text-white border border-emerald-500"
              : "bg-rose-600 text-white border border-rose-500"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-white" />
            ) : (
              <AlertCircle className="w-4 h-4 text-white" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="opacity-70 hover:opacity-100 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner - Hwyati Sovereign Petrol Banner */}
      <div className="bg-gradient-to-l from-[#052F31] via-[#0C4A4E] to-[#103F43] rounded-2xl p-6 text-white shadow-md relative overflow-hidden border border-[#147A77]/30">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#147A77]/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 text-emerald-300 text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>إدارة الموارد البشرية والكوادر الصحية المعتمدة</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-white">دليل الأطباء والكوادر السريرية — {branchName}</h1>
            <p className="text-slate-200 text-xs md:text-sm mt-1">
              إدارة كادر ({branchName}) وحسابات وصلاحيات الأطباء، الجراحين، طواقم التمريض، ومسؤولي إدخال الوقائع الحيوية
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
            <button
              onClick={loadEmployees}
              disabled={loading}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors cursor-pointer"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={() => { setNationalNumber(""); setAddModalOpen(true); }}
              className="px-5 py-2.5 bg-[#147A77] hover:bg-[#0E5C59] text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>تكليف كادر صحي جديد</span>
            </button>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="mt-6 pt-4 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-white/10 p-3 rounded-xl border border-white/15 backdrop-blur-xs">
            <span className="text-slate-200">إجمالي الكادر الطبي:</span>
            <div className="text-lg font-black text-white mt-0.5">{employees.length} ممارس</div>
          </div>
          <div className="bg-white/10 p-3 rounded-xl border border-white/15 backdrop-blur-xs">
            <span className="text-slate-200">كوادر نشطة بالخدمة:</span>
            <div className="text-lg font-black text-emerald-300 mt-0.5">
              {employees.filter((e) => e.isActive).length} مفعّل
            </div>
          </div>
          <div className="bg-white/10 p-3 rounded-xl border border-white/15 backdrop-blur-xs">
            <span className="text-slate-200">كوادر موقوفة مؤقتاً:</span>
            <div className="text-lg font-black text-rose-300 mt-0.5">
              {employees.filter((e) => !e.isActive).length} موقوف
            </div>
          </div>
          <div className="bg-white/10 p-3 rounded-xl border border-white/15 backdrop-blur-xs">
            <span className="text-slate-200">نسبة الجاهزية التشغيلية:</span>
            <div className="text-lg font-black text-white mt-0.5">
              {employees.length > 0
                ? Math.round((employees.filter((e) => e.isActive).length / employees.length) * 100)
                : 100}%
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="بحث بالاسم، الرقم الوطني، أو الرقم الوظيفي..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0C4A4E]"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto text-xs">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
              statusFilter === "all"
                ? "bg-[#052F31] text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            كافة الكوادر ({employees.length})
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
              statusFilter === "active"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            النشطون بالخدمة ({employees.filter((e) => e.isActive).length})
          </button>
          <button
            onClick={() => setStatusFilter("suspended")}
            className={`px-3.5 py-1.5 rounded-xl font-bold transition whitespace-nowrap cursor-pointer ${
              statusFilter === "suspended"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            الموقوفون مؤقتاً ({employees.filter((e) => !e.isActive).length})
          </button>
        </div>
      </div>

      {/* Medical Staff Table */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50 text-slate-700 border-b border-slate-200 font-bold">
              <tr>
                <th className="p-3.5">الرقم الوظيفي / الاسم</th>
                <th className="p-3.5">المسمى الوظيفي</th>
                <th className="p-3.5">بيانات الاتصال</th>
                <th className="p-3.5">الرقم الوطني</th>
                <th className="p-3.5">حالة الصلاحية</th>
                <th className="p-3.5">تاريخ التعيين</th>
                <th className="p-3.5 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-500">
                      <RefreshCw className="w-5 h-5 animate-spin text-[#0C4A4E]" />
                      <span className="text-xs">جاري تحميل الكادر الطبي...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400 text-xs">
                    {employees.length === 0
                      ? "لا يوجد كادر طبي في هذه المنشأة حتى الآن."
                      : "لا توجد نتائج تطابق البحث الحالي."}
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-[#E6F1EE]/40 text-[#0C4A4E] flex items-center justify-center font-bold">
                          {emp.roleLabel?.includes("طبيب") || emp.roleLabel?.includes("جراح") ? (
                            <Stethoscope className="w-4 h-4" />
                          ) : emp.roleLabel?.includes("تمريض") || emp.roleLabel?.includes("ممرض") ? (
                            <Heart className="w-4 h-4 text-rose-600" />
                          ) : (
                            <Activity className="w-4 h-4 text-amber-600" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-[#052F31]">{emp.fullName}</div>
                          <div className="text-[11px] font-mono text-slate-400">{emp.employeeNumber || "—"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="text-slate-800 font-semibold">{emp.roleLabel}</div>
                      <div className="text-[11px] text-slate-400">{emp.branchName || branchName}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-mono text-slate-700">{emp.phoneNumber || "—"}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{emp.email || "—"}</div>
                    </td>
                    <td className="p-3.5 font-mono text-[#052F31] font-bold">{emp.nationalNumber}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1.5 ${
                          emp.isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            emp.isActive ? "bg-emerald-500" : "bg-rose-500"
                          }`}
                        />
                        {emp.isActive ? "مفعّل" : "موقوف مؤقتاً"}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-500 text-[11px]">
                      {emp.createdAt ? new Date(emp.createdAt).toLocaleDateString("ar-YE") : "—"}
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openDetailsModal(emp)}
                          title="عرض ملف وبيانات الكادر المعتمدة"
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-[#052F31] rounded-lg transition cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(emp)}
                          title={emp.isActive ? "إيقاف الصلاحية" : "تنشيط الصلاحية"}
                          className={`p-1.5 rounded-lg transition cursor-pointer ${
                            emp.isActive
                              ? "bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200"
                              : "bg-emerald-50 hover:bg-emerald-100 text-emerald-600 border border-emerald-200"
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Healthcare Worker Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden text-xs">
            <div className="bg-[#052F31] text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-sm flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-emerald-300" />
                <span>تكليف كادر صحي جديد بالمنشأة</span>
              </h3>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-white/70 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="p-6 space-y-4">
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-xs text-[#052F31]">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  التكليف المعتمد في: {branchName}
                </p>
                <p className="text-[11px] text-[#41484d] leading-relaxed">
                  أدخل الرقم الوطني للمواطن (11 خانة). يتحقق النظام آلياً من سجله المدني ووجود حساب مفعل له، ثم يلحقه بكادر المنشأة الصحية ويصدر رقمه الوظيفي الرسمي.
                </p>
              </div>

              <div>
                <label className="block text-slate-700 font-bold mb-1">الرقم الوطني الموحد للمواطن (11 خانة) *</label>
                <input
                  type="text"
                  required
                  maxLength={11}
                  placeholder="مثال: 01001000001"
                  value={nationalNumber}
                  onChange={(e) => setNationalNumber(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-mono text-xs focus:ring-2 focus:ring-[#0C4A4E] focus:outline-none"
                />
              </div>

              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-rose-700 text-xs font-bold animate-in fade-in">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span className="leading-relaxed">{modalError}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#0C4A4E] hover:bg-[#052F31] text-white rounded-xl font-bold transition flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-xs"
                >
                  {submitting ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4" />
                  )}
                  <span>{submitting ? "جاري التحقق والتكليف..." : "تأكيد التكليف والاعتماد"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Healthcare Worker Dossier Details Modal */}
      {detailsModalOpen && selectedEmployee && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden text-xs text-slate-700">
            <div className="bg-[#052F31] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-white/10 text-emerald-300">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">ملف وبيانات الممارس الصحي المعتمدة</h3>
                  <p className="text-[10px] text-slate-200">
                    {fetchingDetails ? "جاري مزامنة أحدث بيانات من الخادم..." : "سجل موثق من السجل المدني والهيكل الطبي"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="text-white/70 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Main Badge Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#E6F1EE]/40 text-[#0C4A4E] flex items-center justify-center font-bold text-base">
                  <Stethoscope className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-[#052F31]">{selectedEmployee.fullName}</h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#052F31]/5 text-[#052F31] border border-[#052F31]/10">
                      معتمد
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                    <span>الرقم الوظيفي:</span>
                    <span className="font-mono font-bold text-[#0C4A4E]">{selectedEmployee.employeeNumber}</span>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                    selectedEmployee.isActive
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}
                >
                  {selectedEmployee.isActive ? "نشط بالخدمة" : "موقوف مؤقتاً"}
                </span>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-500 font-semibold block">الرقم الوطني الموحد</span>
                  <span className="font-mono font-bold text-[#052F31] text-xs">{selectedEmployee.nationalNumber}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-500 font-semibold block">المنشأة الصحية التابع لها</span>
                  <span className="font-bold text-slate-800 text-xs">{selectedEmployee.branchName || branchName}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-500 font-semibold block">رقم الهاتف</span>
                  <div className="flex items-center gap-1.5 font-mono text-xs text-slate-700">
                    <Phone className="w-3 h-3 text-slate-400" />
                    <span>{selectedEmployee.phoneNumber || "غير مسجل"}</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-500 font-semibold block">البريد الإلكتروني</span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-700 truncate">
                    <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{selectedEmployee.email || "غير مسجل"}</span>
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-500 font-semibold block">المؤسسة الصحية</span>
                  <span className="font-semibold text-slate-700 text-xs">{selectedEmployee.organizationName || "المستشفيات والمرافق الصحية"}</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <span className="text-[10px] text-slate-500 font-semibold block">تاريخ الالتحاق والتكليف</span>
                  <div className="flex items-center gap-1.5 text-xs text-slate-700">
                    <Calendar className="w-3 h-3 text-slate-400" />
                    <span>
                      {selectedEmployee.createdAt
                        ? new Date(selectedEmployee.createdAt).toLocaleDateString("ar-YE")
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notice Note */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 text-[11px] leading-relaxed">
                <span className="text-[#052F31] font-bold block mb-0.5">ℹ️ إشعار تدقيق الهوية:</span>
                البيانات الشخصية مستخرجة وموثقة عبر السجل المدني المركزي. لتصحيح أو تعديل البيانات الشخصية يتم الرجوع لدائرة الأحوال المدنية.
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(selectedEmployee)}
                  className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition cursor-pointer text-xs ${
                    selectedEmployee.isActive
                      ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                      : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{selectedEmployee.isActive ? "إيقاف الصلاحية مؤقتاً" : "تنشيط الصلاحية الميدانية"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDetailsModalOpen(false)}
                  className="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
