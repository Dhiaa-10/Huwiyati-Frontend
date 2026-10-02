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
  Car,
  ShieldCheck,
  Calendar,
} from "lucide-react";
import { employeesService } from "@/lib/api/employeesService";
import { Employee } from "@/types/admin";
import { useAuth } from "@/context/AuthContext";

export default function TrafficEmployeesPage() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [branchName, setBranchName] = useState(user.branchName || "مرور أمانة العاصمة");

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
        setFeedback({ type: "error", message: res.message || "حدث خطأ أثناء جلب كادر المرور." });
      }
    } catch {
      setFeedback({ type: "error", message: "تعذر الاتصال بالخادم لجلب كادر المرور." });
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
          message: `تم ${!isCurrentlyActive ? "تنشيط" : "إيقاف"} حساب الضابط (${emp.fullName}) بنجاح.`,
        });
      } else {
        setFeedback({ type: "error", message: res.message });
      }
    } catch {
      setFeedback({ type: "error", message: "حدث خطأ أثناء تغيير الحالة." });
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
    const matchSearch =
      emp.fullName.toLowerCase().includes(search.toLowerCase()) ||
      emp.nationalNumber.includes(search) ||
      emp.employeeNumber.toLowerCase().includes(search.toLowerCase()) ||
      emp.email.toLowerCase().includes(search.toLowerCase());

    if (!matchSearch) return false;
    if (statusFilter === "active") return emp.isActive;
    if (statusFilter === "inactive") return !emp.isActive;
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
            onClick={loadEmployees}
            disabled={loading}
            className="p-2.5 border border-outline-variant rounded-lg text-secondary hover:bg-surface-container transition-colors"
            title="تحديث البيانات"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-primary" : ""}`} />
          </button>
          <button
            onClick={() => { setNationalNumber(""); setAddModalOpen(true); }}
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
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-surface border border-outline-variant rounded-lg px-3 py-2.5 text-xs font-semibold text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="all">جميع الحالات ({employees.length})</option>
            <option value="active">نشط بالخدمة ({employees.filter((e) => e.isActive).length})</option>
            <option value="inactive">موقوف مؤقتاً ({employees.filter((e) => !e.isActive).length})</option>
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
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-secondary">
                      <RefreshCw className="w-5 h-5 animate-spin text-primary" />
                      <span className="text-xs">جاري تحميل كادر شرطة المرور...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-secondary text-xs">
                    {employees.length === 0
                      ? "لا يوجد ضباط في هذا الفرع حتى الآن."
                      : "لا توجد نتائج تطابق البحث الحالي."}
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                          {emp.fullName.slice(0, 1)}
                        </div>
                        <div>
                          <div className="font-bold text-primary">{emp.fullName}</div>
                          <div className="text-[11px] text-secondary">
                            تاريخ التعيين: {emp.createdAt ? emp.createdAt.split("T")[0] : "—"}
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
                        <span className="font-mono">{emp.email || "—"}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        <span className="font-mono">{emp.phoneNumber || "—"}</span>
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
                          onClick={() => openDetailsModal(emp)}
                          className="p-1.5 hover:bg-surface-container rounded-lg text-primary transition-colors"
                          title="عرض ملف وبيانات الضابط المعتمدة"
                        >
                          <Eye className="w-4 h-4" />
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
                ))
              )}
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
                  أدخل الرقم الوطني للمواطن المسجل (11 خانة). يتحقق النظام آلياً من سجله المدني وتفعيل حسابه، ثم يلحقه بكادر شرطة السير ويصدر رقمه الوظيفي العسكري المعتمد.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-primary mb-1">الرقم الوطني للمواطن / المكلف (11 خانة) *</label>
                <input
                  type="text"
                  maxLength={11}
                  required
                  value={nationalNumber}
                  onChange={(e) => setNationalNumber(e.target.value.replace(/\D/g, ""))}
                  placeholder="مثال: 01001000001"
                  className="w-full bg-surface border border-outline-variant rounded-lg p-2.5 text-xs font-mono outline-none focus:border-primary"
                />
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
                  <span>{submitting ? "جاري التكليف..." : "تأكيد تعيين الضابط"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Officer Dossier Details */}
      {detailsModalOpen && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-outline-variant max-w-lg w-full overflow-hidden text-xs">
            <div className="bg-primary text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-white" />
                <div>
                  <h3 className="font-bold text-base">ملف وبيانات الضابط المعتمدة</h3>
                  <p className="text-[10px] text-white/80">
                    {fetchingDetails ? "جاري مزامنة أحدث بيانات من الخادم..." : "سجل موثق من السجل المدني والإدارة العامة للمرور"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDetailsModalOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Officer Card */}
              <div className="p-4 bg-surface-container-lowest border border-outline-variant/40 rounded-xl flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary text-white flex items-center justify-center font-bold text-base">
                  <Car className="w-6 h-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-primary">{selectedEmployee.fullName}</h4>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-primary/10 text-primary border border-primary/20">
                      معتمد
                    </span>
                  </div>
                  <div className="text-[11px] text-secondary mt-0.5 flex items-center gap-2">
                    <span>الرقم العسكري:</span>
                    <span className="font-mono font-bold text-primary">{selectedEmployee.employeeNumber}</span>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                    selectedEmployee.isActive
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-rose-50 text-rose-700 border border-rose-200"
                  }`}
                >
                  {selectedEmployee.isActive ? "نشط بالميدان" : "موقوف مؤقتاً"}
                </span>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-surface rounded-xl border border-outline-variant/30 space-y-1">
                  <span className="text-[10px] text-secondary font-semibold block">الرقم الوطني الموحد</span>
                  <span className="font-mono font-bold text-on-surface text-xs">{selectedEmployee.nationalNumber}</span>
                </div>
                <div className="p-3 bg-surface rounded-xl border border-outline-variant/30 space-y-1">
                  <span className="text-[10px] text-secondary font-semibold block">فرع المرور التابع له</span>
                  <span className="font-bold text-on-surface text-xs">{selectedEmployee.branchName || branchName}</span>
                </div>
                <div className="p-3 bg-surface rounded-xl border border-outline-variant/30 space-y-1">
                  <span className="text-[10px] text-secondary font-semibold block">رقم الهاتف</span>
                  <div className="flex items-center gap-1.5 font-mono text-xs text-on-surface">
                    <Phone className="w-3 h-3 text-secondary" />
                    <span>{selectedEmployee.phoneNumber || "غير مسجل"}</span>
                  </div>
                </div>
                <div className="p-3 bg-surface rounded-xl border border-outline-variant/30 space-y-1">
                  <span className="text-[10px] text-secondary font-semibold block">البريد الإلكتروني</span>
                  <div className="flex items-center gap-1.5 text-xs text-on-surface truncate">
                    <Mail className="w-3 h-3 text-secondary shrink-0" />
                    <span className="truncate">{selectedEmployee.email || "غير مسجل"}</span>
                  </div>
                </div>
                <div className="p-3 bg-surface rounded-xl border border-outline-variant/30 space-y-1">
                  <span className="text-[10px] text-secondary font-semibold block">الإدارة العامة</span>
                  <span className="font-semibold text-on-surface text-xs">{selectedEmployee.organizationName || "شرطة السير والمرور"}</span>
                </div>
                <div className="p-3 bg-surface rounded-xl border border-outline-variant/30 space-y-1">
                  <span className="text-[10px] text-secondary font-semibold block">تاريخ الالتحاق والتكليف</span>
                  <div className="flex items-center gap-1.5 text-xs text-on-surface">
                    <Calendar className="w-3 h-3 text-secondary" />
                    <span>
                      {selectedEmployee.createdAt
                        ? new Date(selectedEmployee.createdAt).toLocaleDateString("ar-YE")
                        : "—"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Notification Banner */}
              <div className="p-3 bg-amber-50/70 border border-amber-200/60 rounded-xl text-amber-900 text-[11px] leading-relaxed">
                <span className="font-bold block mb-0.5">ℹ️ تنبيه إداري ونظامي:</span>
                البيانات الشخصية والاسم مستخرجة مركزياً من السجل المدني ولا يمكن تعديلها يدوياً من صلاحيات الفرع.
              </div>

              {/* Modal Actions */}
              <div className="pt-2 flex items-center justify-between border-t border-outline-variant/20">
                <button
                  type="button"
                  onClick={() => handleToggleStatus(selectedEmployee)}
                  className={`px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-all ${
                    selectedEmployee.isActive
                      ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                      : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{selectedEmployee.isActive ? "إيقاف الصلاحيات مؤقتاً" : "إعادة تفعيل الصلاحيات"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDetailsModalOpen(false)}
                  className="px-5 py-2 border border-outline-variant rounded-lg text-xs font-semibold text-secondary hover:bg-surface-container"
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
