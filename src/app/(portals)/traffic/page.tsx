"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Car,
  ShieldCheck,
  CheckCircle2,
  Users,
  Eye,
  Activity,
  UserCheck,
  RefreshCw,
  AlertCircle,
  Clock,
  Layers,
  Phone,
  Mail,
} from "lucide-react";
import { employeesService } from "@/lib/api/employeesService";
import { Employee } from "@/types/admin";
import { useAuth } from "@/context/AuthContext";

export default function TrafficDashboardPage() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [branchName, setBranchName] = useState(user.branchName || "مرور أمانة العاصمة");

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await employeesService.getEmployees();
      if (res.isSuccess) {
        setEmployees(res.employees);
        if (res.branchName) setBranchName(res.branchName);
      }
    } catch {
      // Keep optimistic empty state
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const activeOfficers = employees.filter((e) => e.isActive);
  const inactiveOfficers = employees.filter((e) => !e.isActive);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-primary animate-pulse" />
              الرقابة المرورية وكادر السير الميداني
            </span>
            <span className="text-xs text-secondary">| ربط مركزي مباشر مع قاعدة البيانات</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary font-headline-lg">
            إدارة المرور - {branchName}
          </h1>
          <p className="text-secondary text-sm md:text-base mt-1">
            إدارة كادر وقوة ضباط المرور، التكليف الإداري المعتمد، ومتابعة الجاهزية التشغيلية للفرع
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 border border-outline-variant rounded-lg text-secondary hover:bg-surface-container transition-colors shadow-xs"
            title="تحديث البيانات من الخادم"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-primary" : ""}`} />
          </button>
          <Link
            href="/traffic/employees"
            className="px-4 py-2.5 bg-primary hover:bg-primary-container text-white rounded-lg text-sm font-semibold shadow-sm transition-all flex items-center gap-2 active:scale-95"
          >
            <Users className="w-4 h-4" />
            إدارة كادر الفرع
          </Link>
        </div>
      </div>

      {/* Backend Alignment Notice */}
      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-900 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-amber-800 text-sm">
            حالة ربط الأنظمة المرورية بالواجهة الخلفية (Backend Status)
          </p>
          <p className="text-secondary leading-relaxed">
            الخدمة المفعلة والمربوطة حالياً بالخادم هي <strong>إدارة كادر وضباط المرور والتحقق السيادي من الهوية</strong> عبر واجهة <code className="font-mono bg-white/70 px-1 py-0.5 rounded text-primary">/api/v1/Employees</code>. خدمات رخص القيادة وتسجيل المركبات والمخالفات الرادارية الآلية قيد الإعداد في الواجهة الخلفية وسيتم ربطها فور اكتمالها في الخادم.
          </p>
        </div>
      </div>

      {/* Real Live KPI Stats Cards from Backend */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Officers */}
        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_4px_20px_rgba(11,79,108,0.05)] border border-outline-variant/30">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
              إجمالي قوة وكادر الفرع
            </span>
            <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary font-headline-lg tabular-nums">
              {loading ? "..." : employees.length}
            </div>
            <div className="text-xs text-secondary mt-1">
              ضابط وفاحص مسجلين بالفرع
            </div>
          </div>
        </div>

        {/* Card 2: Active Field Officers */}
        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_4px_20px_rgba(11,79,108,0.05)] border border-outline-variant/30">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
              ضباط على رأس العمل (نشط)
            </span>
            <div className="p-2.5 bg-tertiary/10 text-tertiary rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-tertiary font-headline-lg tabular-nums">
              {loading ? "..." : activeOfficers.length}
            </div>
            <div className="text-xs text-tertiary mt-1">
              صلاحيات ميدانية ورصد معتمدة
            </div>
          </div>
        </div>

        {/* Card 3: Suspended / Leave */}
        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_4px_20px_rgba(11,79,108,0.05)] border border-outline-variant/30">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
              حسابات موقوفة أو مجازة
            </span>
            <div className="p-2.5 bg-error/10 text-error rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-error font-headline-lg tabular-nums">
              {loading ? "..." : inactiveOfficers.length}
            </div>
            <div className="text-xs text-error mt-1">
              معطل مؤقتاً لأسباب إدارية
            </div>
          </div>
        </div>

        {/* Card 4: Readiness Rate */}
        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_4px_20px_rgba(11,79,108,0.05)] border border-outline-variant/30">
          <div className="flex justify-between items-start mb-3">
            <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
              نسبة الجاهزية التشغيلية
            </span>
            <div className="p-2.5 bg-primary/10 text-primary rounded-lg">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div>
            <div className="text-3xl font-bold text-primary font-headline-lg tabular-nums">
              {loading
                ? "..."
                : employees.length > 0
                ? `${Math.round((activeOfficers.length / employees.length) * 100)}%`
                : "100%"}
            </div>
            <div className="text-xs text-secondary mt-1">
              من القوة الميدانية المعتمدة
            </div>
          </div>
        </div>
      </div>

      {/* Real Officers Table (Live from /api/v1/Employees) */}
      <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(11,79,108,0.05)] border border-outline-variant/30 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-primary flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-primary" />
              كادر وضباط الفرع المعتمدين في النظام
            </h3>
            <p className="text-xs text-secondary mt-0.5">
              بيانات الكادر الميداني المستخرجة مباشرة من قاعدة بيانات الخادم
            </p>
          </div>
          <Link
            href="/traffic/employees"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span>عرض كافة الموظفين ({employees.length})</span>
            <Eye className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="bg-surface-container text-secondary font-semibold border-b border-outline-variant/30">
                <th className="py-3 px-4">اسم الضابط</th>
                <th className="py-3 px-4">الرقم العسكري / الوظيفي</th>
                <th className="py-3 px-4">الرقم الوطني الموحد</th>
                <th className="py-3 px-4">الدور والمسمى الوظيفي</th>
                <th className="py-3 px-4">بيانات الاتصال</th>
                <th className="py-3 px-4 text-center">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-secondary">
                    <RefreshCw className="w-4 h-4 animate-spin inline-block ml-2 text-primary" />
                    جاري تحميل كادر الفرع من الخادم...
                  </td>
                </tr>
              ) : employees.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-secondary">
                    لا يوجد موظفون مسجلون في هذا الفرع حالياً. يمكنك تعيين ضباط عبر شاشة إدارة الموظفين.
                  </td>
                </tr>
              ) : (
                employees.slice(0, 6).map((emp) => (
                  <tr key={emp.id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="py-3 px-4 font-bold text-primary">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[11px]">
                          {emp.fullName.slice(0, 1)}
                        </div>
                        <div>
                          <div>{emp.fullName}</div>
                          <div className="text-[10px] text-secondary font-normal font-mono">
                            {emp.branchName || branchName}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-primary">
                      {emp.employeeNumber}
                    </td>
                    <td className="py-3 px-4 font-mono text-secondary">
                      {emp.nationalNumber}
                    </td>
                    <td className="py-3 px-4 font-semibold text-secondary">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-primary/5 text-primary text-[11px]">
                        <Car className="w-3 h-3" />
                        {emp.roleLabel}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-secondary space-y-0.5">
                      <div className="flex items-center gap-1 font-mono text-[10px]">
                        <Phone className="w-2.5 h-2.5 text-secondary/60" />
                        <span>{emp.phoneNumber || "—"}</span>
                      </div>
                      <div className="flex items-center gap-1 font-mono text-[10px]">
                        <Mail className="w-2.5 h-2.5 text-secondary/60" />
                        <span className="truncate max-w-[120px]">{emp.email || "—"}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          emp.isActive
                            ? "bg-tertiary-container/10 text-tertiary-container border border-tertiary-container/20"
                            : "bg-error/10 text-error border border-error/20"
                        }`}
                      >
                        {emp.isActive ? "نشط بالخدمة" : "موقوف مؤقتاً"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
