"use client";

import React, { useState, useEffect } from "react";
import {
  Users,
  UserPlus,
  Search,
  CheckCircle2,
  AlertCircle,
  Clock,
  Briefcase,
  Phone,
  Mail,
  Edit2,
  Trash2,
  ShieldAlert,
  Power,
  RefreshCw,
  X,
  Star,
} from "lucide-react";
import { employeesService } from "@/lib/api/employeesService";
import { Employee } from "@/types/admin";
import { useAuth } from "@/context/AuthContext";

export default function CivilRegistryEmployeesPage() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [branchName, setBranchName] = useState(user.branchName || "الفرع الرئيسي");

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Form states
  const [fullName, setFullName] = useState("");
  const [nationalNumber, setNationalNumber] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("CivilRegistryOfficer");
  const [roleLabel, setRoleLabel] = useState("ضابط تفعيل ومراجعة هويات");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      const res = await employeesService.getEmployees();
      if (res.isSuccess) {
        setEmployees(res.employees);
        if (res.branchName) setBranchName(res.branchName);
      } else {
        setFeedback({ type: "error", message: res.message || "حدث خطأ أثناء جلب كادر الفرع." });
      }
    } catch (err: any) {
      console.error(err);
      setFeedback({ type: "error", message: "تعذر الاتصال بالخادم لجلب الموظفين." });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nationalNumber.trim()) {
      setFeedback({ type: "error", message: "يرجى إدخال الرقم الوطني للمواطن المراد تعيينه." });
      return;
    }

    setSubmitting(true);
    try {
      const res = await employeesService.assignEmployee(nationalNumber.trim());
      if (res.isSuccess && res.employee) {
        setEmployees([res.employee, ...employees]);
        setAddModalOpen(false);
        resetForm();
        setFeedback({
          type: "success",
          message: `تم تكليف الموظف (${res.employee.fullName}) برقم وظيفي: ${res.employee.employeeNumber} بنجاح.`,
        });
      } else {
        setFeedback({ type: "error", message: res.message });
      }
    } catch (err: any) {
      console.error(err);
      setFeedback({ type: "error", message: "حدث خطأ أثناء تكليف الموظف." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    // Local update for display label
    setEmployees(employees.map((emp) => emp.id === selectedEmployee.id ? { ...emp, roleLabel } : emp));
    setEditModalOpen(false);
    setSelectedEmployee(null);
    resetForm();
    setFeedback({
      type: "success",
      message: `تم تحديث مسمى الموظف بنجاح.`,
    });
  };

  const handleToggleStatus = async (emp: Employee) => {
    try {
      const isCurrentlyActive = emp.isActive;
      const res = isCurrentlyActive
        ? await employeesService.deactivateEmployee(emp.id)
        : await employeesService.activateEmployee(emp.id);

      if (res.isSuccess) {
        setEmployees(employees.map((e) => (e.id === emp.id ? { ...e, isActive: !isCurrentlyActive, accountStatus: !isCurrentlyActive ? "Active" : "Suspended" } : e)));
        setFeedback({
          type: "success",
          message: `تم ${!isCurrentlyActive ? "تنشيط" : "تعطيل"} حساب الموظف (${emp.fullName}).`,
        });
      } else {
        setFeedback({ type: "error", message: res.message });
      }
    } catch (err) {
      console.error(err);
      setFeedback({ type: "error", message: "فشل تحديث حالة الحساب." });
    }
  };

  const handleDelete = async (emp: Employee) => {
    if (!confirm(`هل أنت متأكد من تعطيل/إلغاء تكليف الموظف (${emp.fullName}) من كادر الفرع؟`)) {
      return;
    }

    try {
      const res = await employeesService.deactivateEmployee(emp.id);
      if (res.isSuccess) {
        setEmployees(employees.map((e) => e.id === emp.id ? { ...e, isActive: false, accountStatus: "Suspended" } : e));
        setFeedback({
          type: "success",
          message: `تم تعطيل وإلغاء تكليف الموظف (${emp.fullName}) بنجاح.`,
        });
      } else {
        setFeedback({ type: "error", message: res.message });
      }
    } catch (err) {
      console.error(err);
      setFeedback({ type: "error", message: "فشل إلغاء تكليف الموظف." });
    }
  };

  const openEditModal = (emp: Employee) => {
    setSelectedEmployee(emp);
    setFullName(emp.fullName);
    setNationalNumber(emp.nationalNumber);
    setEmail(emp.email);
    setPhoneNumber(emp.phoneNumber);
    setRole(emp.role);
    setRoleLabel(emp.roleLabel);
    setEditModalOpen(true);
  };

  const resetForm = () => {
    setFullName("");
    setNationalNumber("");
    setEmail("");
    setPhoneNumber("");
    setRole("CivilRegistryOfficer");
    setRoleLabel("ضابط تفعيل ومراجعة هويات");
  };

  const filtered = employees.filter((e) => {
    const matchesSearch =
      e.fullName.includes(search) ||
      e.nationalNumber.includes(search) ||
      e.employeeNumber.toLowerCase().includes(search.toLowerCase());
    const matchesRole = roleFilter === "all" || e.role === roleFilter;
    return matchesSearch && matchesRole;
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
            إدارة موظفي الفرع والصلاحيات — {branchName}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            إدارة كادر مصلحة الأحوال المدنية الخاص بفرع ({branchName}) وتكليف موظفين جدد ومتابعة حالتهم الميدانية
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
            onClick={() => {
              resetForm();
              setAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#00374e] hover:bg-[#0b4f6c] text-white text-xs font-bold shadow-sm transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>إضافة موظف جديد للفرع</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between animate-fade-in ${
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

      {/* KPI Cards for Branch Admin */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-semibold">إجمالي كادر الفرع</span>
            <div className="text-2xl font-black text-[#00374e] mt-1">{employees.length} موظفاً</div>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-blue-700">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-semibold">الموظفون في الخدمة</span>
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
            <span className="text-xs text-gray-500 font-semibold">متوسط وقت المعاملة</span>
            <div className="text-2xl font-black text-[#00374e] mt-1">11 دقيقة</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-700">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-semibold">معاملات اليوم المنجزة</span>
            <div className="text-2xl font-black text-[#00374e] mt-1">84 معاملة</div>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 text-purple-700">
            <Briefcase className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
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
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none bg-white"
          >
            <option value="all">كافة الأدوار الوظيفية</option>
            <option value="CivilRegistryOfficer">ضباط التفعيل والمراجعة</option>
            <option value="CivilRegistryAdmin">مديرو الأقسام</option>
          </select>
        </div>
      </div>

      {/* Employees Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-gray-100/70 text-gray-700 font-bold border-b border-gray-200">
                <th className="py-3.5 px-5">اسم الموظف / الضابط</th>
                <th className="py-3.5 px-5">الرقم الوظيفي</th>
                <th className="py-3.5 px-5">الرقم الوطني</th>
                <th className="py-3.5 px-5">المسمى والصفة الوظيفية</th>
                <th className="py-3.5 px-5">بيانات الاتصال</th>
                <th className="py-3.5 px-5 text-center">الحالة</th>
                <th className="py-3.5 px-5 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    جاري تحميل بيانات الموظفين...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    لا يوجد موظفون يطابقون معايير البحث.
                  </td>
                </tr>
              ) : (
                filtered.map((emp) => (
                  <tr key={emp.id} className="hover:bg-blue-50/30 transition-colors">
                    <td className="py-3.5 px-5 font-bold text-gray-900 flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#00374e] text-white flex items-center justify-center font-bold text-xs">
                        {emp.fullName.slice(0, 2)}
                      </div>
                      <div>
                        <div>{emp.fullName}</div>
                        <div className="text-[10px] text-gray-400 font-normal">
                          {emp.branchName || "فرع أمانة العاصمة"}
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
                      {emp.roleLabel}
                    </td>
                    <td className="py-3.5 px-5 text-gray-600 space-y-0.5">
                      <div className="flex items-center gap-1 font-mono text-[11px]">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span>{emp.phoneNumber}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-gray-400">
                        <Mail className="w-3 h-3 text-gray-400" />
                        <span>{emp.email}</span>
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
                          title={emp.isActive ? "إيقاف الحساب مؤقتاً" : "إعادة تفعيل الحساب"}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => openEditModal(emp)}
                          className="p-1.5 rounded-lg border border-gray-200 hover:bg-blue-50 text-gray-600 hover:text-[#0b4f6c] transition-colors"
                          title="تعديل البيانات"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(emp)}
                          className="p-1.5 rounded-lg border border-gray-200 hover:bg-rose-50 text-gray-600 hover:text-rose-600 transition-colors"
                          title="حذف الموظف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Add Employee Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl border border-gray-100 animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-[#00374e] flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#0b4f6c]" />
                إضافة موظف / ضابط جديد للفرع
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
                  التكليف في الفرع الحالي: {branchName}
                </p>
                <p className="text-[11px] text-gray-600 leading-relaxed">
                  أدخل الرقم الوطني للمواطن المسجل (11 خانة)، وسيقوم النظام بالتحقق منه آلياً من السجل المدني وربطه بفرعك وإصدار رقمه الوظيفي الرسمي.
                </p>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">الرقم الوطني للمواطن (11 خانة):</label>
                <input
                  type="text"
                  required
                  maxLength={11}
                  value={nationalNumber}
                  onChange={(e) => setNationalNumber(e.target.value)}
                  placeholder="مثال: 01001000001"
                  className="w-full p-2.5 border border-gray-200 rounded-xl font-mono text-sm focus:outline-none focus:border-[#0b4f6c]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">المسمى الوظيفي والدور بالفرع:</label>
                <select
                  value={roleLabel}
                  onChange={(e) => {
                    setRoleLabel(e.target.value);
                    setRole(
                      e.target.value.includes("مدير")
                        ? "CivilRegistryAdmin"
                        : "CivilRegistryOfficer"
                    );
                  }}
                  className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0b4f6c] bg-white"
                >
                  <option value="ضابط تفعيل ومراجعة هويات">
                    ضابط تفعيل ومراجعة هويات (كاونتر البصمة)
                  </option>
                  <option value="ضابط تدقيق الوثائق والأرشيف">
                    ضابط تدقيق الوثائق والأرشيف الإلكتروني
                  </option>
                  <option value="مسؤول قيد الوقائع الحيوية (مواليد ووفيات)">
                    مسؤول قيد الوقائع الحيوية (مواليد ووفيات)
                  </option>
                  <option value="مساعد مدير الفرع">مساعد مدير الفرع</option>
                </select>
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
                  <span>{submitting ? "جاري التكليف..." : "تأكيد تكليف الموظف"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Employee Modal */}
      {editModalOpen && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl border border-gray-100 animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-[#00374e] flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#0b4f6c]" />
                تعديل بيانات الموظف: {selectedEmployee.fullName}
              </h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEdit} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-700">الاسم الرباعي الكامل:</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0b4f6c]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">الرقم الوطني:</label>
                  <input
                    type="text"
                    disabled
                    value={nationalNumber}
                    className="w-full p-2.5 border border-gray-200 rounded-xl font-mono bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">رقم الهاتف:</label>
                  <input
                    type="text"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full p-2.5 border border-gray-200 rounded-xl font-mono focus:outline-none focus:border-[#0b4f6c]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">البريد الإلكتروني الوظيفي:</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-xl font-mono focus:outline-none focus:border-[#0b4f6c]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">الصفة والوظيفة في الفرع:</label>
                <input
                  type="text"
                  required
                  value={roleLabel}
                  onChange={(e) => setRoleLabel(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0b4f6c]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00374e] hover:bg-[#0b4f6c] text-white font-bold transition-all shadow-sm"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
