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
  Plane,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import { employeesService } from "@/lib/api/employeesService";
import { Employee } from "@/types/admin";
import { useAuth } from "@/context/AuthContext";

export default function PassportsEmployeesPage() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [branchName, setBranchName] = useState(user.branchName || "فرع الجوازات");

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
        setFeedback({ type: "error", message: res.message || "حدث خطأ أثناء جلب كادر الجوازات." });
      }
    } catch {
      setFeedback({ type: "error", message: "تعذر الاتصال بالخادم لجلب كادر الجوازات." });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
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
          message: `تم تعيين الضابط (${res.employee.fullName}) برقم وظيفي: ${res.employee.employeeNumber} بنجاح.`,
        });
      } else {
        setFeedback({ type: "error", message: res.message });
      }
    } catch {
      setFeedback({ type: "error", message: "حدث خطأ أثناء تعيين الضابط." });
    } finally {
      setSubmitting(false);
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
          message: `تم ${!isCurrentlyActive ? "تنشيط" : "تعطيل"} صلاحيات الضابط (${emp.fullName}).`,
        });
      } else {
        setFeedback({ type: "error", message: res.message });
      }
    } catch {
      setFeedback({ type: "error", message: "فشل تحديث حالة الحساب." });
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

  const filtered = employees.filter((e) => {
    const matchesSearch =
      e.fullName.toLowerCase().includes(search.toLowerCase()) ||
      e.nationalNumber.includes(search) ||
      e.employeeNumber.toLowerCase().includes(search.toLowerCase()) ||
      e.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && e.isActive) ||
      (statusFilter === "suspended" && !e.isActive);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-[#0b4f6c] mb-1">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            صلاحيات مدير المؤسسة / مدير الفرع (مستوى 2)
          </div>
          <h1 className="text-2xl font-bold text-[#00374e]">
            إدارة ضباط وكوادر الجوازات — {branchName}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            إدارة كادر مصلحة الهجرة والجوازات لفرع ({branchName}) وتكليف ضباط جدد ومتابعة مهامهم الميدانية
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadEmployees}
            disabled={loading}
            className="p-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-[#0b4f6c]" : ""}`} />
          </button>
          <button
            onClick={() => { setNationalNumber(""); setAddModalOpen(true); }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00374e] hover:bg-[#0b4f6c] text-white text-xs font-bold shadow-sm transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>تعيين ضابط / موظف جديد</span>
          </button>
        </div>
      </div>

      {/* Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between ${
            feedback.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : "bg-rose-50 border-rose-200 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span className="font-semibold">{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="p-1 hover:bg-black/5 rounded">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-semibold">إجمالي الكادر والضباط</span>
            <div className="text-2xl font-black text-[#00374e] mt-1">{employees.length} ضابطاً</div>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-blue-700">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-semibold">ضباط على رأس العمل (نشط)</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {employees.filter((e) => e.isActive).length} نشط
            </div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-semibold">حسابات موقوفة مؤقتاً</span>
            <div className="text-2xl font-black text-rose-600 mt-1">
              {employees.filter((e) => !e.isActive).length} موقوف
            </div>
          </div>
          <div className="p-3 rounded-xl bg-rose-50 text-rose-700">
            <AlertCircle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-semibold">نسبة الجاهزية التشغيلية</span>
            <div className="text-2xl font-black text-[#00374e] mt-1">
              {employees.length > 0
                ? Math.round((employees.filter((e) => e.isActive).length / employees.length) * 100)
                : 100}%
            </div>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 text-purple-700">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="البحث بالاسم أو الرقم الوظيفي أو الوطني..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-3 pr-9 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#0b4f6c]"
          />
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none bg-white"
          >
            <option value="all">كافة الكوادر والضباط ({employees.length})</option>
            <option value="active">الضباط النشطون بالخدمة ({employees.filter((e) => e.isActive).length})</option>
            <option value="suspended">الحسابات الموقوفة مؤقتاً ({employees.filter((e) => !e.isActive).length})</option>
          </select>
        </div>
      </div>

      {/* Officers Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-gray-100/70 text-gray-700 font-bold border-b border-gray-200">
                <th className="py-3.5 px-5">اسم الضابط / الموظف</th>
                <th className="py-3.5 px-5">الرقم العسكري / الوظيفي</th>
                <th className="py-3.5 px-5">الرقم الوطني</th>
                <th className="py-3.5 px-5">الصفة والمهمة المكلف بها</th>
                <th className="py-3.5 px-5">بيانات الاتصال</th>
                <th className="py-3.5 px-5 text-center">الحالة</th>
                <th className="py-3.5 px-5 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <RefreshCw className="w-5 h-5 animate-spin text-[#0b4f6c]" />
                      <span className="text-xs">جاري تحميل كادر ضباط الجوازات...</span>
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 text-xs">
                    {employees.length === 0
                      ? "لا يوجد ضباط في هذا الفرع حتى الآن."
                      : "لا يوجد ضباط يطابقون معايير البحث."}
                  </td>
                </tr>
              ) : (
                filtered.map((emp) => (
                  <tr key={emp.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-gray-900">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#00374e] text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {emp.fullName.slice(0, 2)}
                        </div>
                        <div>
                          <div>{emp.fullName}</div>
                          <div className="text-[10px] text-gray-400 font-normal">
                            {emp.branchName || branchName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 font-mono font-bold text-[#00374e]">
                      {emp.employeeNumber}
                    </td>
                    <td className="py-3.5 px-5 font-mono text-gray-600">
                      {emp.nationalNumber}
                    </td>
                    <td className="py-3.5 px-5 font-medium text-gray-800">
                      <div className="flex items-center gap-1.5">
                        <Plane className="w-3 h-3 text-blue-400 shrink-0" />
                        <span>{emp.roleLabel}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-gray-600 space-y-0.5">
                      <div className="flex items-center gap-1 font-mono text-[11px]">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span>{emp.phoneNumber || "—"}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-gray-400">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span className="truncate max-w-[150px]">{emp.email || "—"}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          emp.isActive
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {emp.isActive ? "نشط بالخدمة" : "موقوف مؤقتاً"}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleToggleStatus(emp)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            emp.isActive
                              ? "border-amber-200 hover:bg-amber-50 text-amber-700"
                              : "border-emerald-200 hover:bg-emerald-50 text-emerald-700"
                          }`}
                          title={emp.isActive ? "إيقاف الصلاحيات مؤقتاً" : "إعادة التفعيل"}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openDetailsModal(emp)}
                          className="p-1.5 rounded-lg border border-gray-200 hover:bg-blue-50 text-gray-600 hover:text-[#0b4f6c] transition-colors"
                          title="عرض ملف وبيانات الضابط المعتمدة"
                        >
                          <Eye className="w-3.5 h-3.5" />
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

      {/* Add Officer Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl border border-gray-100">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-[#00374e] flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#0b4f6c]" />
                تعيين ضابط / موظف جديد في فرع ({branchName})
              </h3>
              <button
                onClick={() => setAddModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="p-3 bg-blue-50/60 border border-blue-200/60 rounded-xl text-blue-900 space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-xs text-[#00374e]">
                  <CheckCircle2 className="w-4 h-4 text-[#0b4f6c]" />
                  التحقق من الهوية الوطنية والسجل المدني
                </p>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  أدخل الرقم الوطني للمواطن (11 خانة). يتحقق النظام آلياً من سجله المدني ووجود حساب مفعل له، ثم يلحقه بكادر الجوازات ويصدر رقمه الوظيفي الرسمي.
                </p>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">الرقم الوطني للمواطن (11 خانة):</label>
                <input
                  type="text"
                  required
                  maxLength={11}
                  value={nationalNumber}
                  onChange={(e) => setNationalNumber(e.target.value.replace(/\D/g, ""))}
                  placeholder="مثال: 01001000001"
                  className="w-full p-2.5 border border-gray-200 rounded-xl font-mono text-sm focus:outline-none focus:border-[#0b4f6c]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-[#00374e] hover:bg-[#0b4f6c] text-white font-bold transition-all shadow-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{submitting ? "جاري التكليف..." : "تأكيد تعيين الضابط"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Officer Dossier Details Modal */}
      {detailsModalOpen && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl border border-gray-100 text-xs">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#00374e]/10 text-[#00374e]">
                  <ShieldCheck className="w-5 h-5 text-[#0b4f6c]" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#00374e]">ملف وبيانات الضابط المعتمدة</h3>
                  <p className="text-[10px] text-gray-400">
                    {fetchingDetails ? "جاري مزامنة أحدث بيانات من الخادم..." : "سجل موثق من السجل المدني ومصلحة الجوازات"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Officer Main Badge */}
            <div className="p-4 bg-gradient-to-r from-blue-50/70 to-slate-50 border border-blue-100 rounded-2xl flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#00374e] text-white flex items-center justify-center font-bold text-base shadow-sm">
                {selectedEmployee.fullName.slice(0, 2)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-bold text-sm text-[#00374e]">{selectedEmployee.fullName}</h4>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    معتمد
                  </span>
                </div>
                <div className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-2">
                  <span>الرقم الوظيفي:</span>
                  <span className="font-mono font-bold text-[#00374e]">{selectedEmployee.employeeNumber}</span>
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
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                <span className="text-[10px] text-gray-400 font-semibold block">الرقم الوطني الموحد</span>
                <span className="font-mono font-bold text-gray-800 text-xs">{selectedEmployee.nationalNumber}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                <span className="text-[10px] text-gray-400 font-semibold block">الفرع الملحق به</span>
                <span className="font-bold text-gray-800 text-xs">{selectedEmployee.branchName || branchName}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                <span className="text-[10px] text-gray-400 font-semibold block">رقم الهاتف</span>
                <div className="flex items-center gap-1.5 font-mono text-xs text-gray-700">
                  <Phone className="w-3 h-3 text-gray-400" />
                  <span>{selectedEmployee.phoneNumber || "غير مسجل"}</span>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                <span className="text-[10px] text-gray-400 font-semibold block">البريد الإلكتروني</span>
                <div className="flex items-center gap-1.5 text-xs text-gray-700 truncate">
                  <Mail className="w-3 h-3 text-gray-400 shrink-0" />
                  <span className="truncate">{selectedEmployee.email || "غير مسجل"}</span>
                </div>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                <span className="text-[10px] text-gray-400 font-semibold block">المؤسسة التابعة</span>
                <span className="font-semibold text-gray-700 text-xs">{selectedEmployee.organizationName || "مصلحة الهجرة والجوازات"}</span>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                <span className="text-[10px] text-gray-400 font-semibold block">تاريخ الالتحاق والتكليف</span>
                <div className="flex items-center gap-1.5 text-xs text-gray-700">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <span>
                    {selectedEmployee.createdAt
                      ? new Date(selectedEmployee.createdAt).toLocaleDateString("ar-YE")
                      : "—"}
                  </span>
                </div>
              </div>
            </div>

            {/* Security note */}
            <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-amber-900 text-[11px] leading-relaxed">
              <span className="font-bold block mb-0.5">ℹ️ تنبيه إداري ونظامي:</span>
              البيانات الشخصية والاسم الرباعي مستخرجة مركزياً من السجل المدني ولا يمكن تعديلها يدوياً من صلاحيات الفرع.
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => handleToggleStatus(selectedEmployee)}
                className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-all ${
                  selectedEmployee.isActive
                    ? "bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200"
                    : "bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200"
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{selectedEmployee.isActive ? "تعطيل الصلاحيات مؤقتاً" : "إعادة تنشيط الصلاحيات"}</span>
              </button>
              <button
                type="button"
                onClick={() => setDetailsModalOpen(false)}
                className="px-5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold transition-all"
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
