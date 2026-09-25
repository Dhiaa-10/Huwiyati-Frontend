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
  Plane,
  Shield,
  Star,
} from "lucide-react";
import { adminService } from "@/lib/api/adminService";
import { Employee } from "@/types/admin";
import { useAuth } from "@/context/AuthContext";

export default function PassportsEmployeesPage() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  // Modals
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  // Form states
  const [fullName, setFullName] = useState("");
  const [nationalNumber, setNationalNumber] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [role, setRole] = useState("PassportsOfficer");
  const [roleLabel, setRoleLabel] = useState("ضابط فحص واعتماد الجوازات");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      // Organization for Passports
      const data = await adminService.getEmployees(undefined, "11111111-aaaa-bbbb-cccc-000000000002");
      setEmployees(data);
    } catch (err) {
      console.error(err);
      setFeedback({ type: "error", message: "حدث خطأ أثناء جلب كادر الجوازات" });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !nationalNumber || !email || !phoneNumber) {
      setFeedback({ type: "error", message: "يرجى تعبئة كافة الحقول المطلوبة." });
      return;
    }

    try {
      const newEmp = await adminService.createEmployee({
        fullName,
        nationalNumber,
        email,
        phoneNumber,
        role,
        roleLabel,
        branchId: "22222222-bbbb-cccc-dddd-000000000006",
        organizationId: "11111111-aaaa-bbbb-cccc-000000000002",
      });

      setEmployees([newEmp, ...employees]);
      setAddModalOpen(false);
      resetForm();
      setFeedback({
        type: "success",
        message: `تم تعيين الضابط (${newEmp.fullName}) بنجاح وإدراجه في كادر الفرع.`,
      });
    } catch (err) {
      console.error(err);
      setFeedback({ type: "error", message: "حدث خطأ أثناء تعيين الضابط." });
    }
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;

    try {
      const updated = await adminService.updateEmployee(selectedEmployee.id, {
        fullName,
        email,
        phoneNumber,
        role,
        roleLabel,
      });

      setEmployees(employees.map((e) => (e.id === updated.id ? updated : e)));
      setEditModalOpen(false);
      setSelectedEmployee(null);
      resetForm();
      setFeedback({
        type: "success",
        message: `تم تحديث بيانات الضابط (${updated.fullName}) بنجاح.`,
      });
    } catch (err) {
      console.error(err);
      setFeedback({ type: "error", message: "حدث خطأ أثناء تعديل بيانات الضابط." });
    }
  };

  const handleToggleStatus = async (emp: Employee) => {
    try {
      const updated = await adminService.toggleEmployeeStatus(emp.id, emp.isActive);
      setEmployees(employees.map((e) => (e.id === updated.id ? updated : e)));
      setFeedback({
        type: "success",
        message: `تم ${updated.isActive ? "تفعيل" : "تعطيل"} صلاحيات الضابط (${updated.fullName}).`,
      });
    } catch (err) {
      console.error(err);
      setFeedback({ type: "error", message: "فشل تحديث حالة الحساب." });
    }
  };

  const handleDelete = async (emp: Employee) => {
    if (!confirm(`هل أنت متأكد من حذف الضابط (${emp.fullName}) من سجل الفرع نهائياً؟`)) {
      return;
    }

    try {
      await adminService.deleteEmployee(emp.id);
      setEmployees(employees.filter((e) => e.id !== emp.id));
      setFeedback({
        type: "success",
        message: `تم حذف الضابط (${emp.fullName}) بنجاح.`,
      });
    } catch (err) {
      console.error(err);
      setFeedback({ type: "error", message: "فشل حذف الضابط." });
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
    setRole("PassportsOfficer");
    setRoleLabel("ضابط فحص واعتماد الجوازات");
  };

  const filtered = employees.filter((e) => {
    const matchesSearch =
      e.fullName.includes(search) ||
      e.nationalNumber.includes(search) ||
      e.employeeNumber.toLowerCase().includes(search.toLowerCase());
    const matchesDept =
      departmentFilter === "all" ||
      (departmentFilter === "issuance" && e.roleLabel.includes("فحص")) ||
      (departmentFilter === "ports" && e.roleLabel.includes("منافذ"));
    return matchesSearch && matchesDept;
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
            إدارة ضباط وكوادر الجوازات والمنافذ
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            إضافة وتعديل وحذف ضباط فحص الجوازات والرقابة بالمنافذ، ومتابعة نوبات الخدمة
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
            <span>تعيين ضابط / موظف جديد</span>
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

      {/* KPI Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-semibold">إجمالي الكادر والضباط</span>
            <div className="text-2xl font-black text-[#00374e] mt-1">{employees.length || 14} ضابطاً</div>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 text-blue-700">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-semibold">ضباط المنافذ الحدودية</span>
            <div className="text-2xl font-black text-amber-600 mt-1">6 منافذ</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-50 text-amber-700">
            <Plane className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-semibold">ضباط فحص الطلبات</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">8 كاونترات</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-700">
            <Shield className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-semibold">متوسط سرعة المعاملة</span>
            <div className="text-2xl font-black text-[#00374e] mt-1">12 دقيقة</div>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 text-purple-700">
            <Clock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="البحث بالاسم أو الرقم العسكري أو الوطني..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-3 pr-9 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs focus:outline-none focus:border-[#0b4f6c]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 text-xs font-medium focus:outline-none bg-white"
          >
            <option value="all">كافة الإدارات والمنافذ</option>
            <option value="issuance">شعبة الإصدار وتجديد الجوازات</option>
            <option value="ports">شعبة الرقابة والمنافذ الحدودية</option>
          </select>
        </div>
      </div>

      {/* Table */}
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
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    جاري تحميل كادر ضباط الجوازات...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-gray-400">
                    لا يوجد ضباط يطابقون معايير البحث.
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
                          {emp.branchName || "مصلحة الجوازات"}
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
                          title={emp.isActive ? "إيقاف الصلاحيات مؤقتاً" : "إعادة التفعيل"}
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
                          title="حذف الضابط"
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

      {/* Add Officer Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl border border-gray-100 animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-[#00374e] flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-[#0b4f6c]" />
                تعيين ضابط / موظف جديد في مصلحة الجوازات
              </h3>
              <button
                onClick={() => setAddModalOpen(false)}
                className="p-1 hover:bg-gray-100 rounded-lg text-gray-400"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-gray-700">الاسم والصفة العسكرية:</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="مثال: نقيب مروان علي الشامي"
                  className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0b4f6c]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-gray-700">الرقم الوطني (11 خانة):</label>
                  <input
                    type="text"
                    required
                    value={nationalNumber}
                    onChange={(e) => setNationalNumber(e.target.value)}
                    placeholder="01010029841"
                    className="w-full p-2.5 border border-gray-200 rounded-xl font-mono focus:outline-none focus:border-[#0b4f6c]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-gray-700">رقم الهاتف:</label>
                  <input
                    type="text"
                    required
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+967 773456789"
                    className="w-full p-2.5 border border-gray-200 rounded-xl font-mono focus:outline-none focus:border-[#0b4f6c]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">البريد الإلكتروني الرسمي:</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="m.alshami@passports.gov.ye"
                  className="w-full p-2.5 border border-gray-200 rounded-xl font-mono focus:outline-none focus:border-[#0b4f6c]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">الصفة والموقع المكلف به:</label>
                <select
                  value={roleLabel}
                  onChange={(e) => {
                    setRoleLabel(e.target.value);
                    setRole(
                      e.target.value.includes("مدير")
                        ? "PassportsAdmin"
                        : "PassportsOfficer"
                    );
                  }}
                  className="w-full p-2.5 border border-gray-200 rounded-xl focus:outline-none focus:border-[#0b4f6c] bg-white"
                >
                  <option value="ضابط فحص واعتماد الجوازات">
                    ضابط فحص واعتماد الجوازات (شعبة الإصدار)
                  </option>
                  <option value="ضابط الرقابة بالمنافذ الحدودية">
                    ضابط الرقابة بالمنافذ الحدودية (كشف قوائم الحظر)
                  </option>
                  <option value="ضابط تشغيل طابعات الجواز الإلكتروني">
                    ضابط تشغيل طابعات الجواز الإلكتروني
                  </option>
                  <option value="نائب مدير فرع الجوازات">نائب مدير فرع الجوازات</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#00374e] hover:bg-[#0b4f6c] text-white font-bold transition-all shadow-sm"
                >
                  حفظ وتكليف الضابط
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Officer Modal */}
      {editModalOpen && selectedEmployee && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4 shadow-xl border border-gray-100 animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="text-sm font-bold text-[#00374e] flex items-center gap-2">
                <Edit2 className="w-4 h-4 text-[#0b4f6c]" />
                تعديل بيانات الضابط: {selectedEmployee.fullName}
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
                <label className="font-bold text-gray-700">الاسم والصفة:</label>
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
                <label className="font-bold text-gray-700">البريد الإلكتروني:</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 border border-gray-200 rounded-xl font-mono focus:outline-none focus:border-[#0b4f6c]"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-gray-700">الصفة والموقع:</label>
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
