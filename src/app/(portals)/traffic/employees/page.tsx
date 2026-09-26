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
  Power,
  RefreshCw,
  X,
  Car,
  ShieldCheck,
  Star,
  Zap,
} from "lucide-react";
import { employeesService } from "@/lib/api/employeesService";
import { Employee } from "@/types/admin";
import { useAuth } from "@/context/AuthContext";

export default function TrafficEmployeesPage() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [branchName, setBranchName] = useState(user.branchName || "مرور أمانة العاصمة");

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Form states
  const [fullName, setFullName] = useState("");
  const [nationalNumber, setNationalNumber] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("TrafficOfficer");
  const [roleLabel, setRoleLabel] = useState("ضابط دورية ورصد مخالفات");
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
        setFeedback({ type: "error", message: res.message || "حدث خطأ أثناء جلب كادر المرور" });
      }
    } catch (err: any) {
      console.error(err);
      setFeedback({ type: "error", message: "تعذر الاتصال بالخادم لجلب كادر المرور" });
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
        setEmployees([res.employee, ...employees]);
        setAddModalOpen(false);
        resetForm();
        setFeedback({
          type: "success",
          message: `تم تعيين الضابط (${res.employee.fullName}) برقم وظيفي: ${res.employee.employeeNumber} بنجاح.`,
        });
      } else {
        setFeedback({ type: "error", message: res.message });
      }
    } catch (err: any) {
      console.error(err);
      setFeedback({ type: "error", message: "حدث خطأ أثناء تعيين الضابط." });
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    setEmployees(employees.map((emp) => (emp.id === selectedEmployee.id ? { ...emp, roleLabel } : emp)));
    setEditModalOpen(false);
    setSelectedEmployee(null);
    resetForm();
    setFeedback({
      type: "success",
      message: `تم تحديث بيانات الضابط بنجاح.`,
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
          message: `تم ${!isCurrentlyActive ? "تنشيط" : "إيقاف"} حساب الضابط (${emp.fullName}) بنجاح.`,
        });
      } else {
        setFeedback({ type: "error", message: res.message });
      }
    } catch (err) {
      console.error(err);
      setFeedback({ type: "error", message: "حدث خطأ أثناء تغيير الحالة." });
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
    setRole("TrafficOfficer");
    setRoleLabel("ضابط دورية ورصد مخالفات");
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchSearch =
      emp.fullName.toLowerCase().includes(search.toLowerCase()) ||
      emp.nationalNumber.includes(search) ||
      emp.email.toLowerCase().includes(search.toLowerCase());

    if (!matchSearch) return false;
    if (departmentFilter === "active") return emp.isActive;
    if (departmentFilter === "inactive") return !emp.isActive;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-primary" />
              المستوى الثاني: إدارة ضباط وموظفي الفرع
            </span>
            <span className="text-xs text-secondary">| الصلاحيات الميدانية والرقابية</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary font-headline-lg">
            إدارة ضباط ودوريات شرطة المرور — {branchName}
          </h1>
          <p className="text-secondary text-sm md:text-base mt-1">
            إدارة كادر وقوة شرطة السير الخاصة بفرع ({branchName}) وتكليف ضباط جدد ومتابعة المناوبات الميدانية
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              resetForm();
              setAddModalOpen(true);
            }}
            className="px-4 py-2.5 bg-primary hover:bg-primary-container text-white rounded-lg text-sm font-semibold shadow-sm transition-all flex items-center gap-2 active:scale-95"
          >
            <UserPlus className="w-4 h-4" />
            تعيين ضابط / فاحص جديد
          </button>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between gap-3 border ${
            feedback.type === "success"
              ? "bg-tertiary-container/10 border-tertiary-container/30 text-tertiary-container"
              : "bg-error/10 border-error/30 text-error"
          }`}
        >
          <div className="flex items-center gap-2 text-sm font-semibold">
            {feedback.type === "success" ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <span>{feedback.message}</span>
          </div>
          <button onClick={() => setFeedback(null)} className="p-1 hover:opacity-75">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/30 shadow-[0_4px_20px_rgba(11,79,108,0.05)]">
          <div className="text-xs font-semibold text-secondary mb-1">إجمالي الكادر والضباط بالفرع</div>
          <div className="text-3xl font-bold text-primary font-headline-lg">{employees.length}</div>
          <div className="text-xs text-secondary mt-1">مسجلين في الهيكل التنظيمي للمرور</div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/30 shadow-[0_4px_20px_rgba(11,79,108,0.05)]">
          <div className="text-xs font-semibold text-secondary mb-1">ضباط بالخدمة الميدانية النشطة</div>
          <div className="text-3xl font-bold text-tertiary font-headline-lg">
            {employees.filter((e) => e.isActive).length}
          </div>
          <div className="text-xs text-tertiary mt-1">صلاحيات الرصد والفحص مفعلة</div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/30 shadow-[0_4px_20px_rgba(11,79,108,0.05)]">
          <div className="text-xs font-semibold text-secondary mb-1">حسابات موقوفة أو في إجازة</div>
          <div className="text-3xl font-bold text-error font-headline-lg">
            {employees.filter((e) => !e.isActive).length}
          </div>
          <div className="text-xs text-error mt-1">معلقة مؤقتاً لأسباب إدارية</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface-container-lowest rounded-xl p-4 shadow-[0_4px_20px_rgba(11,79,108,0.05)] border border-outline-variant/30 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-secondary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم، الرقم العسكري/الوطني، أو البريد الإلكتروني..."
            className="w-full bg-surface border border-outline-variant rounded-lg pr-9 pl-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="bg-surface border border-outline-variant rounded-lg px-3 py-2.5 text-xs font-semibold text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="all">جميع الحالات</option>
            <option value="active">نشط بالخدمة</option>
            <option value="inactive">موقوف مؤقتاً</option>
          </select>
        </div>
      </div>

      {/* Officers Table */}
      <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(11,79,108,0.05)] border border-outline-variant/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs md:text-sm">
            <thead>
              <tr className="bg-surface-container text-secondary border-b border-outline-variant/40 font-semibold">
                <th className="py-3.5 px-5">اسم الضابط / الموظف</th>
                <th className="py-3.5 px-5">الرقم الوطني / العسكري</th>
                <th className="py-3.5 px-5">المسمى الوظيفي والدور</th>
                <th className="py-3.5 px-5">بيانات الاتصال</th>
                <th className="py-3.5 px-5">الحالة</th>
                <th className="py-3.5 px-5 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 font-body-sm text-on-surface">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-surface-container-lowest transition-colors">
                  <td className="py-4 px-5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                        {emp.fullName.slice(0, 1)}
                      </div>
                      <div>
                        <div className="font-bold text-primary">{emp.fullName}</div>
                        <div className="text-[11px] text-secondary">
                          تاريخ التعيين: {emp.createdAt.split("T")[0]}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-5 font-mono text-xs font-bold text-on-surface">
                    {emp.nationalNumber}
                  </td>
                  <td className="py-4 px-5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
                      <Car className="w-3.5 h-3.5" />
                      {emp.roleLabel}
                    </span>
                  </td>
                  <td className="py-4 px-5 text-xs text-secondary space-y-0.5">
                    <div className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      <span className="font-mono">{emp.email}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      <span className="font-mono">{emp.phoneNumber}</span>
                    </div>
                  </td>
                  <td className="py-4 px-5">
                    {emp.isActive ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-tertiary-container/10 text-tertiary-container border border-tertiary-container/20">
                        <CheckCircle2 className="w-3 h-3" />
                        نشط بالخدمة
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-error/10 text-error border border-error/20">
                        <Power className="w-3 h-3" />
                        موقوف
                      </span>
                    )}
                  </td>
                  <td className="py-4 px-5 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEditModal(emp)}
                        className="p-1.5 hover:bg-surface-container rounded-lg text-primary transition-colors"
                        title="تعديل البيانات"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(emp)}
                        className={`p-1.5 hover:bg-surface-container rounded-lg transition-colors ${
                          emp.isActive ? "text-error" : "text-tertiary"
                        }`}
                        title={emp.isActive ? "إيقاف الحساب" : "تفعيل الحساب"}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add Officer */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-outline-variant max-w-lg w-full overflow-hidden">
            <div className="bg-primary text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-white" />
                <h3 className="font-bold text-lg">تعيين ضابط / فاحص مرور جديد</h3>
              </div>
              <button
                onClick={() => setAddModalOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="p-6 space-y-4 text-sm max-h-[80vh] overflow-y-auto">
              <div className="p-3 bg-primary/5 border border-primary/20 rounded-xl text-primary space-y-1">
                <p className="font-bold flex items-center gap-1.5 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-primary" />
                  التكليف في الفرع الحالي: {branchName}
                </p>
                <p className="text-[11px] text-secondary leading-relaxed">
                  أدخل الرقم الوطني للمواطن المسجل (11 خانة)، وسيقوم النظام بالتحقق منه آلياً وتكليفه بفرعك وإصدار رقمه الوظيفي العسكري.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-primary mb-1">الرقم الوطني للمواطن / المكلف (11 خانة)</label>
                <input
                  type="text"
                  maxLength={11}
                  value={nationalNumber}
                  onChange={(e) => setNationalNumber(e.target.value)}
                  placeholder="مثال: 01001000001"
                  className="w-full bg-surface border border-outline-variant rounded-lg p-2.5 text-xs font-mono outline-none focus:border-primary"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-bold text-primary mb-1">الدور والمهام الميدانية في الفرع</label>
                <select
                  value={role}
                  onChange={(e) => {
                    setRole(e.target.value);
                    if (e.target.value === "TrafficOfficer") setRoleLabel("ضابط دورية ورصد مخالفات");
                    if (e.target.value === "LicensingOfficer") setRoleLabel("ضابط إصدار الرخص الذكية");
                    if (e.target.value === "RadarTech") setRoleLabel("مهندس تقني وفاحص رادارات");
                    if (e.target.value === "InspectionOfficer") setRoleLabel("ضابط الفحص الفني الدوري");
                  }}
                  className="w-full bg-surface border border-outline-variant rounded-lg p-2.5 text-xs outline-none font-semibold text-primary"
                >
                  <option value="TrafficOfficer">TrafficOfficer (دورية وضبط)</option>
                  <option value="LicensingOfficer">LicensingOfficer (إصدار رخص)</option>
                  <option value="RadarTech">RadarTech (تقني رادار)</option>
                  <option value="InspectionOfficer">InspectionOfficer (فحص فني)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 border border-outline-variant rounded-lg text-xs font-semibold text-secondary hover:bg-surface-container"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-primary hover:bg-primary-container text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {submitting && <RefreshCw className="w-3.5 h-3.5 animate-spin" />}
                  <span>{submitting ? "جاري التكليف..." : "تعيين وحفظ"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Officer */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-outline-variant max-w-lg w-full overflow-hidden">
            <div className="bg-primary text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-white" />
                <h3 className="font-bold text-lg">تعديل بيانات الضابط</h3>
              </div>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="p-6 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-primary mb-1">الاسم الكامل</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-surface border border-outline-variant rounded-lg p-2.5 text-xs outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-primary mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-surface border border-outline-variant rounded-lg p-2.5 text-xs font-mono outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary mb-1">رقم الهاتف</label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full bg-surface border border-outline-variant rounded-lg p-2.5 text-xs font-mono outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-primary mb-1">المسمى الوظيفي</label>
                <input
                  type="text"
                  value={roleLabel}
                  onChange={(e) => setRoleLabel(e.target.value)}
                  className="w-full bg-surface border border-outline-variant rounded-lg p-2.5 text-xs outline-none"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 border border-outline-variant rounded-lg text-xs font-semibold text-secondary hover:bg-surface-container"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary hover:bg-primary-container text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                >
                  تحديث البيانات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
