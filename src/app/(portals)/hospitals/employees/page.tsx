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

export default function HospitalEmployeesPage() {
  const { user } = useAuth();
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
    try {
      const isCurrentlyActive = emp.isActive;
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
        setFeedback({
          type: "success",
          message: `تم ${!isCurrentlyActive ? "تنشيط" : "تعطيل"} حساب الكادر: (${emp.fullName}) بنجاح.`,
        });
      } else {
        setFeedback({ type: "error", message: res.message });
      }
    } catch {
      setFeedback({ type: "error", message: "فشل تغيير حالة الحساب." });
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nationalNumber.trim()) {
      setFeedback({ type: "error", message: "يرجى إدخال الرقم الوطني للمواطن المراد تكليفه." });
      return;
    }
    setSubmitting(true);
    try {
      const res = await employeesService.assignEmployee(nationalNumber.trim());
      if (res.isSuccess && res.employee) {
        setEmployees((prev) => [res.employee!, ...prev]);
        setAddModalOpen(false);
        setNationalNumber("");
        setFeedback({
          type: "success",
          message: `تم تعيين الكادر الصحي (${res.employee.fullName}) برقم وظيفي: ${res.employee.employeeNumber} بنجاح.`,
        });
      } else {
        setFeedback({ type: "error", message: res.message });
      }
    } catch {
      setFeedback({ type: "error", message: "حدث خطأ أثناء تكليف الكادر." });
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
          className={`p-4 rounded-xl flex items-center justify-between shadow-lg text-xs font-semibold ${
            feedback.type === "success"
              ? "bg-emerald-950/90 text-emerald-200 border border-emerald-800"
              : "bg-rose-950/90 text-rose-200 border border-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-400" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="opacity-70 hover:opacity-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-gradient-to-l from-[#00374e] to-[#044e6e] rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 text-cyan-300 text-sm font-medium">
              <ShieldCheck className="w-4 h-4" />
              <span>إدارة الموارد البشرية والكوادر الصحية المعتمدة</span>
            </div>
            <h1 className="text-2xl font-bold">دليل الأطباء والكوادر السريرية — {branchName}</h1>
            <p className="text-slate-300 text-sm mt-1">
              إدارة كادر ({branchName}) وحسابات وصلاحيات الأطباء، الجراحين، طواقم التمريض، ومسؤولي إدخال الوقائع الحيوية
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
            <button
              onClick={loadEmployees}
              disabled={loading}
              className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition-colors"
              title="تحديث البيانات"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
            <button
              onClick={() => { setNationalNumber(""); setAddModalOpen(true); }}
              className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-cyan-950/40"
            >
              <UserPlus className="w-4 h-4" />
              <span>تكليف كادر صحي جديد</span>
            </button>
          </div>
        </div>

        {/* Quick Metrics Bar */}
        <div className="mt-6 pt-4 border-t border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-700/40">
            <span className="text-slate-400">إجمالي الكادر الطبي:</span>
            <div className="text-lg font-bold text-white mt-0.5">{employees.length} ممارس</div>
          </div>
          <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-700/40">
            <span className="text-slate-400">كوادر نشطة بالخدمة:</span>
            <div className="text-lg font-bold text-emerald-400 mt-0.5">
              {employees.filter((e) => e.isActive).length} مفعّل
            </div>
          </div>
          <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-700/40">
            <span className="text-slate-400">كوادر موقوفة مؤقتاً:</span>
            <div className="text-lg font-bold text-rose-400 mt-0.5">
              {employees.filter((e) => !e.isActive).length} موقوف
            </div>
          </div>
          <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-700/40">
            <span className="text-slate-400">نسبة الجاهزية التشغيلية:</span>
            <div className="text-lg font-bold text-cyan-400 mt-0.5">
              {employees.length > 0
                ? Math.round((employees.filter((e) => e.isActive).length / employees.length) * 100)
                : 100}%
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="بحث بالاسم، الرقم الوطني، أو الرقم الوظيفي..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-3 pr-9 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto text-xs">
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap ${
              statusFilter === "all"
                ? "bg-cyan-600 text-white shadow"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            كافة الكوادر ({employees.length})
          </button>
          <button
            onClick={() => setStatusFilter("active")}
            className={`px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap ${
              statusFilter === "active"
                ? "bg-emerald-600 text-white shadow"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            النشطون بالخدمة ({employees.filter((e) => e.isActive).length})
          </button>
          <button
            onClick={() => setStatusFilter("suspended")}
            className={`px-3 py-1.5 rounded-xl font-semibold transition whitespace-nowrap ${
              statusFilter === "suspended"
                ? "bg-rose-600 text-white shadow"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            الموقوفون مؤقتاً ({employees.filter((e) => !e.isActive).length})
          </button>
        </div>
      </div>

      {/* Medical Staff Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-950/60 text-slate-400 border-b border-slate-800">
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
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-slate-400">
                      <RefreshCw className="w-5 h-5 animate-spin text-cyan-500" />
                      <span className="text-xs">جاري تحميل الكادر الطبي...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 text-xs">
                    {employees.length === 0
                      ? "لا يوجد كادر طبي في هذه المنشأة حتى الآن."
                      : "لا توجد نتائج تطابق البحث الحالي."}
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-800/40 transition">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400 font-bold">
                          {emp.roleLabel?.includes("طبيب") || emp.roleLabel?.includes("جراح") ? (
                            <Stethoscope className="w-4 h-4" />
                          ) : emp.roleLabel?.includes("تمريض") || emp.roleLabel?.includes("ممرض") ? (
                            <Heart className="w-4 h-4 text-rose-400" />
                          ) : (
                            <Activity className="w-4 h-4 text-amber-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-white">{emp.fullName}</div>
                          <div className="text-[11px] font-mono text-slate-400">{emp.employeeNumber || "—"}</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <div className="text-white font-semibold">{emp.roleLabel}</div>
                      <div className="text-[11px] text-slate-400">{emp.branchName || branchName}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-mono text-slate-300">{emp.phoneNumber || "—"}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{emp.email || "—"}</div>
                    </td>
                    <td className="p-3.5 font-mono text-cyan-400">{emp.nationalNumber}</td>
                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
                          emp.isActive
                            ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60"
                            : "bg-rose-950 text-rose-400 border border-rose-800/60"
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            emp.isActive ? "bg-emerald-400" : "bg-rose-400"
                          }`}
                        />
                        {emp.isActive ? "مفعّل" : "موقوف مؤقتاً"}
                      </span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-400 text-[11px]">
                      {emp.createdAt ? new Date(emp.createdAt).toLocaleDateString("ar-YE") : "—"}
                    </td>
                    <td className="p-3.5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => openDetailsModal(emp)}
                          title="عرض ملف وبيانات الكادر المعتمدة"
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-cyan-400 rounded-lg transition"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(emp)}
                          title={emp.isActive ? "إيقاف الصلاحية" : "تنشيط الصلاحية"}
                          className={`p-1.5 rounded-lg transition ${
                            emp.isActive
                              ? "bg-rose-950/60 hover:bg-rose-900 text-rose-400 border border-rose-800/40"
                              : "bg-emerald-950/60 hover:bg-emerald-900 text-emerald-400 border border-emerald-800/40"
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-white font-bold text-sm flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-cyan-400" />
                <span>تكليف كادر صحي جديد بالمنشأة</span>
              </h3>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-4">
              <div className="p-3 bg-cyan-950/40 border border-cyan-800/40 rounded-xl text-cyan-200 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-xs text-cyan-400">
                  <CheckCircle2 className="w-4 h-4" />
                  التكليف المعتمد في: {branchName}
                </p>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  أدخل الرقم الوطني للمواطن (11 خانة). يتحقق النظام آلياً من سجله المدني ووجود حساب مفعل له، ثم يلحقه بكادر المنشأة الصحية ويصدر رقمه الوظيفي الرسمي.
                </p>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">الرقم الوطني الموحد للمواطن (11 خانة) *</label>
                <input
                  type="text"
                  required
                  maxLength={11}
                  placeholder="مثال: 01001000001"
                  value={nationalNumber}
                  onChange={(e) => setNationalNumber(e.target.value.replace(/\D/g, ""))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold transition flex items-center gap-1.5 disabled:opacity-50"
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
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 text-xs text-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-cyan-950/80 border border-cyan-800/60 text-cyan-400">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm">ملف وبيانات الممارس الصحي المعتمدة</h3>
                  <p className="text-[10px] text-slate-400">
                    {fetchingDetails ? "جاري مزامنة أحدث بيانات من الخادم..." : "سجل موثق من السجل المدني والهيكل الطبي"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Main Badge Card */}
            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 flex items-center justify-center font-bold text-base">
                <Stethoscope className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-white">{selectedEmployee.fullName}</h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/60">
                    معتمد
                  </span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-2">
                  <span>الرقم الوظيفي:</span>
                  <span className="font-mono font-bold text-cyan-400">{selectedEmployee.employeeNumber}</span>
                </div>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                  selectedEmployee.isActive
                    ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60"
                    : "bg-rose-950 text-rose-400 border border-rose-800/60"
                }`}
              >
                {selectedEmployee.isActive ? "نشط بالخدمة" : "موقوف مؤقتاً"}
              </span>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold block">الرقم الوطني الموحد</span>
                <span className="font-mono font-bold text-cyan-300 text-xs">{selectedEmployee.nationalNumber}</span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold block">المنشأة الصحية التابع لها</span>
                <span className="font-bold text-white text-xs">{selectedEmployee.branchName || branchName}</span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold block">رقم الهاتف</span>
                <div className="flex items-center gap-1.5 font-mono text-xs text-slate-300">
                  <Phone className="w-3 h-3 text-slate-400" />
                  <span>{selectedEmployee.phoneNumber || "غير مسجل"}</span>
                </div>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold block">البريد الإلكتروني</span>
                <div className="flex items-center gap-1.5 text-xs text-slate-300 truncate">
                  <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                  <span className="truncate">{selectedEmployee.email || "غير مسجل"}</span>
                </div>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold block">المؤسسة الصحية</span>
                <span className="font-semibold text-slate-300 text-xs">{selectedEmployee.organizationName || "المستشفيات والمرافق الصحية"}</span>
              </div>
              <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold block">تاريخ الالتحاق والتكليف</span>
                <div className="flex items-center gap-1.5 text-xs text-slate-300">
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
            <div className="p-3 bg-slate-950/90 border border-slate-800 rounded-xl text-slate-400 text-[11px] leading-relaxed">
              <span className="text-cyan-400 font-bold block mb-0.5">ℹ️ إشعار تدقيق الهوية:</span>
              البيانات الشخصية مستخرجة وموثقة عبر السجل المدني المركزي. لتصحيح أو تعديل البيانات الشخصية يتم الرجوع لدائرة الأحوال المدنية.
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => handleToggleStatus(selectedEmployee)}
                className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition ${
                  selectedEmployee.isActive
                    ? "bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-800/60"
                    : "bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/60"
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{selectedEmployee.isActive ? "إيقاف الصلاحية مؤقتاً" : "تنشيط الصلاحية الميدانية"}</span>
              </button>
              <button
                type="button"
                onClick={() => setDetailsModalOpen(false)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold transition"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
