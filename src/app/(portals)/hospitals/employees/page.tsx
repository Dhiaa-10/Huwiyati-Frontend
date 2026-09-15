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
  Power,
  RefreshCw,
  X,
  ShieldCheck,
  Activity,
  Heart,
  Stethoscope,
} from "lucide-react";
import { adminService } from "@/lib/api/adminService";
import { Employee } from "@/types/admin";
import { useAuth } from "@/context/AuthContext";

export default function HospitalEmployeesPage() {
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
  const [role, setRole] = useState("Doctor");
  const [roleLabel, setRoleLabel] = useState("طبيب استشاري باطنية");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      // Fetch employees filtered or all
      const all = await adminService.getEmployees();
      const hospitalStaff = all.filter(
        (e) =>
          e.organizationId === "11111111-aaaa-bbbb-cccc-000000000005" ||
          e.role.toLowerCase().includes("doctor") ||
          e.role.toLowerCase().includes("health") ||
          e.role.toLowerCase().includes("hospital") ||
          e.role.toLowerCase().includes("nurse") ||
          e.role.toLowerCase().includes("medical") ||
          e.roleLabel?.includes("طبيب") ||
          e.roleLabel?.includes("صحة") ||
          e.roleLabel?.includes("مستشفى") ||
          e.roleLabel?.includes("جراح") ||
          e.roleLabel?.includes("تمريض")
      );

      // If empty in mock, display initial realistic medical personnel
      if (hospitalStaff.length === 0) {
        const initialMockStaff: Employee[] = [
          {
            id: "emp-hosp-001",
            userId: "usr-hosp-001",
            fullName: "د. هاني الأصبحي",
            nationalNumber: "1010077889",
            email: "h.asbahi@health.hwyati.gov.ye",
            phoneNumber: "+967 771 888 999",
            organizationId: "11111111-aaaa-bbbb-cccc-000000000005",
            branchId: "branch-hosp-01",
            organizationName: "مستشفى الثورة العام - صنعاء",
            branchName: "قسم الجراحة العامة والعمليات",
            role: "Surgeon",
            roleLabel: "استشاري جراحة عامة ومناظير",
            accountStatus: "Active",
            isActive: true,
            employeeNumber: "MED-0941",
            createdAt: "2024-01-15",
            lastLogin: "2026-09-10 21:30",
          },
          {
            id: "emp-hosp-002",
            userId: "usr-hosp-002",
            fullName: "د. عبدالحكيم السقاف",
            nationalNumber: "1010066554",
            email: "a.saqqaf@health.hwyati.gov.ye",
            phoneNumber: "+967 772 444 333",
            organizationId: "11111111-aaaa-bbbb-cccc-000000000005",
            branchId: "branch-hosp-01",
            organizationName: "مستشفى الثورة العام - صنعاء",
            branchName: "العيادات الخارجية والباطنية",
            role: "Doctor",
            roleLabel: "طبيب استشاري باطنية وقلب",
            accountStatus: "Active",
            isActive: true,
            employeeNumber: "MED-0812",
            createdAt: "2024-02-10",
            lastLogin: "2026-09-10 18:45",
          },
          {
            id: "emp-hosp-003",
            userId: "usr-hosp-003",
            fullName: "د. أروى القباطي",
            nationalNumber: "1010055443",
            email: "arwa.q@health.hwyati.gov.ye",
            phoneNumber: "+967 773 222 111",
            organizationId: "11111111-aaaa-bbbb-cccc-000000000005",
            branchId: "branch-hosp-01",
            organizationName: "مستشفى الثورة العام - صنعاء",
            branchName: "قسم النساء والولادة والأطفال",
            role: "VitalEventsRegistrar",
            roleLabel: "طبيبة نساء وتوليد ومسؤولة قيد المواليد",
            accountStatus: "Active",
            isActive: true,
            employeeNumber: "MED-1102",
            createdAt: "2024-03-20",
            lastLogin: "2026-09-10 19:15",
          },
          {
            id: "emp-hosp-004",
            userId: "usr-hosp-004",
            fullName: "د. عفاف حميد",
            nationalNumber: "1010044332",
            email: "afaf.h@health.hwyati.gov.ye",
            phoneNumber: "+967 775 888 123",
            organizationId: "11111111-aaaa-bbbb-cccc-000000000005",
            branchId: "branch-hosp-01",
            organizationName: "مستشفى الثورة العام - صنعاء",
            branchName: "مركز الأمراض المزمنة والغدد الصماء",
            role: "Doctor",
            roleLabel: "استشارية الغدد الصماء والسكري",
            accountStatus: "Active",
            isActive: true,
            employeeNumber: "MED-0733",
            createdAt: "2024-04-05",
            lastLogin: "2026-09-09 14:20",
          },
          {
            id: "emp-hosp-005",
            userId: "usr-hosp-005",
            fullName: "حسين صالح المطري",
            nationalNumber: "1010033221",
            email: "h.matari@health.hwyati.gov.ye",
            phoneNumber: "+967 777 999 444",
            organizationId: "11111111-aaaa-bbbb-cccc-000000000005",
            branchId: "branch-hosp-01",
            organizationName: "مستشفى الثورة العام - صنعاء",
            branchName: "وحدة الفرز السريري والطوارئ",
            role: "Nurse",
            roleLabel: "مشرف تمريض وفرز إسعافي",
            accountStatus: "Active",
            isActive: true,
            employeeNumber: "MED-1450",
            createdAt: "2024-05-12",
            lastLogin: "2026-09-10 22:00",
          },
        ];
        setEmployees(initialMockStaff);
      } else {
        setEmployees(hospitalStaff);
      }
    } catch (err) {
      console.error(err);
      setFeedback({ type: "error", message: "حدث خطأ أثناء جلب الكادر الطبي" });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (emp: Employee) => {
    try {
      const updated = await adminService.toggleEmployeeStatus(emp.id);
      setEmployees((prev) =>
        prev.map((e) => (e.id === updated.id ? updated : e))
      );
      setFeedback({
        type: "success",
        message: `تم تغيير حالة حساب الكادر: ${updated.fullName} إلى (${updated.accountStatus === "Active" ? "نشط" : "موقوف"})`,
      });
    } catch {
      setFeedback({ type: "error", message: "فشل تغيير حالة الحساب" });
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newEmp = await adminService.createEmployee({
        fullName,
        nationalNumber,
        email,
        phoneNumber,
        organizationId: "11111111-aaaa-bbbb-cccc-000000000005",
        branchId: "branch-hosp-01",
        role,
        roleLabel,
      });

      setEmployees((prev) => [newEmp, ...prev]);
      setAddModalOpen(false);
      resetForm();
      setFeedback({ type: "success", message: `تم قيد الكادر الطبي/التمريضي الجديد (${fullName}) بنجاح` });
    } catch {
      setFeedback({ type: "error", message: "فشل إضافة الكادر الطبي" });
    }
  };

  const handleEditEmployee = async (e: React.FormEvent) => {
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

      setEmployees((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
      setEditModalOpen(false);
      resetForm();
      setFeedback({ type: "success", message: `تم تحديث بيانات الكادر (${fullName}) بنجاح` });
    } catch {
      setFeedback({ type: "error", message: "فشل تحديث البيانات" });
    }
  };

  const resetForm = () => {
    setFullName("");
    setNationalNumber("");
    setEmail("");
    setPhoneNumber("");
    setRole("Doctor");
    setRoleLabel("طبيب استشاري باطنية");
    setSelectedEmployee(null);
  };

  const openEditModal = (emp: Employee) => {
    setSelectedEmployee(emp);
    setFullName(emp.fullName);
    setNationalNumber(emp.nationalNumber);
    setEmail(emp.email);
    setPhoneNumber(emp.phoneNumber);
    setRole(emp.role);
    setRoleLabel(emp.roleLabel || "");
    setEditModalOpen(true);
  };

  const filteredEmployees = employees.filter((emp) => {
    const matchQuery =
      emp.fullName.toLowerCase().includes(search.toLowerCase()) ||
      emp.nationalNumber.includes(search) ||
      emp.email.toLowerCase().includes(search.toLowerCase()) ||
      emp.roleLabel?.toLowerCase().includes(search.toLowerCase());

    const matchDept =
      departmentFilter === "all" ||
      (departmentFilter === "doctors" && (emp.role === "Doctor" || emp.role === "Surgeon")) ||
      (departmentFilter === "nursing" && emp.role === "Nurse") ||
      (departmentFilter === "registrars" && emp.role === "VitalEventsRegistrar");

    return matchQuery && matchDept;
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
            <h1 className="text-2xl font-bold">دليل الأطباء والكوادر السريرية والتمريضية</h1>
            <p className="text-slate-300 text-sm mt-1">
              إدارة حسابات وصلاحيات الأطباء، الجراحين، طواقم التمريض، ومسؤولي إدخال الوقائع الحيوية بالمستشفى
            </p>
          </div>

          <button
            onClick={() => {
              resetForm();
              setAddModalOpen(true);
            }}
            className="px-5 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-lg shadow-cyan-950/40 shrink-0 self-start md:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>إضافة كادر صحي جديد</span>
          </button>
        </div>

        {/* Quick Metrics Bar */}
        <div className="mt-6 pt-4 border-t border-slate-700/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-700/40">
            <span className="text-slate-400">إجمالي الكادر الطبي:</span>
            <div className="text-lg font-bold text-white mt-0.5">{employees.length} ممارس</div>
          </div>
          <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-700/40">
            <span className="text-slate-400">أطباء واستشاريين:</span>
            <div className="text-lg font-bold text-cyan-400 mt-0.5">
              {employees.filter((e) => e.role === "Doctor" || e.role === "Surgeon").length} طبيب
            </div>
          </div>
          <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-700/40">
            <span className="text-slate-400">طواقم الفرز والتمريض:</span>
            <div className="text-lg font-bold text-rose-400 mt-0.5">
              {employees.filter((e) => e.role === "Nurse").length} ممرض
            </div>
          </div>
          <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-700/40">
            <span className="text-slate-400">حسابات نشطة:</span>
            <div className="text-lg font-bold text-emerald-400 mt-0.5">
              {employees.filter((e) => e.accountStatus === "Active").length} مفعّل
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
          <input
            type="text"
            placeholder="بحث بالاسم، الرقم الوطني، أو التخصص..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-3 pr-9 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-cyan-500"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto text-xs">
          <button
            onClick={() => setDepartmentFilter("all")}
            className={`px-3 py-1.5 rounded-xl font-semibold transition ${
              departmentFilter === "all"
                ? "bg-cyan-600 text-white shadow"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            الكل ({employees.length})
          </button>
          <button
            onClick={() => setDepartmentFilter("doctors")}
            className={`px-3 py-1.5 rounded-xl font-semibold transition ${
              departmentFilter === "doctors"
                ? "bg-cyan-600 text-white shadow"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            الأطباء والجراحين
          </button>
          <button
            onClick={() => setDepartmentFilter("nursing")}
            className={`px-3 py-1.5 rounded-xl font-semibold transition ${
              departmentFilter === "nursing"
                ? "bg-cyan-600 text-white shadow"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            التمريض والفرز
          </button>
          <button
            onClick={() => setDepartmentFilter("registrars")}
            className={`px-3 py-1.5 rounded-xl font-semibold transition ${
              departmentFilter === "registrars"
                ? "bg-cyan-600 text-white shadow"
                : "bg-slate-800 text-slate-400 hover:text-white"
            }`}
          >
            إدخال الوقائع
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
                <th className="p-3.5">المسمى الوظيفي والقسم</th>
                <th className="p-3.5">بيانات الاتصال</th>
                <th className="p-3.5">الرقم الوطني</th>
                <th className="p-3.5">حالة الصلاحية</th>
                <th className="p-3.5">آخر تسجيل دخول</th>
                <th className="p-3.5 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {filteredEmployees.map((emp) => (
                <tr key={emp.id} className="hover:bg-slate-800/40 transition">
                  <td className="p-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-cyan-950/80 border border-cyan-800/60 flex items-center justify-center text-cyan-400 font-bold">
                        {emp.role === "Doctor" || emp.role === "Surgeon" ? (
                          <Stethoscope className="w-4 h-4" />
                        ) : emp.role === "Nurse" ? (
                          <Heart className="w-4 h-4 text-rose-400" />
                        ) : (
                          <Activity className="w-4 h-4 text-amber-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-bold text-white">{emp.fullName}</div>
                        <div className="text-[11px] font-mono text-slate-400">{emp.employeeNumber || "MED-0000"}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <div className="text-white font-semibold">{emp.roleLabel || emp.role}</div>
                    <div className="text-[11px] text-slate-400">{emp.branchName || "المستشفى الرئيسي"}</div>
                  </td>
                  <td className="p-3.5">
                    <div className="font-mono text-slate-300">{emp.phoneNumber}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{emp.email}</div>
                  </td>
                  <td className="p-3.5 font-mono text-cyan-400">{emp.nationalNumber}</td>
                  <td className="p-3.5">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold inline-flex items-center gap-1 ${
                        emp.accountStatus === "Active"
                          ? "bg-emerald-950 text-emerald-400 border border-emerald-800/60"
                          : "bg-rose-950 text-rose-400 border border-rose-800/60"
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          emp.accountStatus === "Active" ? "bg-emerald-400" : "bg-rose-400"
                        }`}
                      />
                      {emp.accountStatus === "Active" ? "مفعّل" : "موقوف مؤقتاً"}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono text-slate-400 text-[11px]">{emp.lastLogin || "اليوم 08:30"}</td>
                  <td className="p-3.5">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => openEditModal(emp)}
                        title="تعديل البيانات"
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleToggleStatus(emp)}
                        title={emp.accountStatus === "Active" ? "إيقاف الصلاحية" : "تنشيط الصلاحية"}
                        className={`p-1.5 rounded-lg transition ${
                          emp.accountStatus === "Active"
                            ? "bg-rose-950/60 hover:bg-rose-900 text-rose-400 border border-rose-800/40"
                            : "bg-emerald-950/60 hover:bg-emerald-900 text-emerald-400 border border-emerald-800/40"
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {(addModalOpen || editModalOpen) && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-white font-bold text-sm flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-cyan-400" />
                <span>{addModalOpen ? "تسجيل ممارس صحي جديد" : "تعديل بيانات الممارس الصحي"}</span>
              </h3>
              <button
                onClick={() => {
                  setAddModalOpen(false);
                  setEditModalOpen(false);
                  resetForm();
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={addModalOpen ? handleAddEmployee : handleEditEmployee} className="space-y-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">الاسم الرباعي واللقب *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: د. عبدالرحمن صالح العولقي"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {addModalOpen && (
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">الرقم الوطني الموحد (10 أرقام) *</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    placeholder="10100XXXXX"
                    value={nationalNumber}
                    onChange={(e) => setNationalNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">البريد الإلكتروني *</label>
                  <input
                    type="email"
                    required
                    placeholder="doctor@health.hwyati.gov.ye"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">رقم الهاتف *</label>
                  <input
                    type="text"
                    required
                    placeholder="+967 77X XXX XXX"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white font-mono focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">نوع الكادر / الدور</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="Doctor">طبيب استشاري / أخصائي</option>
                    <option value="Surgeon">استشاري جراحة عامة</option>
                    <option value="Nurse">تمريض عناية وفرز إسعافي</option>
                    <option value="VitalEventsRegistrar">مسؤول قيد الوقائع الحيوية</option>
                    <option value="HospitalAdmin">مشرف إداري وسريري</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">المسمى الوظيفي المعتمد</label>
                  <input
                    type="text"
                    required
                    placeholder="مثال: استشاري جراحة المخ والأعصاب"
                    value={roleLabel}
                    onChange={(e) => setRoleLabel(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setAddModalOpen(false);
                    setEditModalOpen(false);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl font-bold transition flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{addModalOpen ? "حفظ واعتماد الكادر" : "تحديث البيانات"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
