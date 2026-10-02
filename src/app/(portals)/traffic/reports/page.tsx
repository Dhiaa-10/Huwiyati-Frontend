"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  BarChart3,
  Users,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Download,
  Calendar,
  ExternalLink,
} from "lucide-react";
import { employeesService } from "@/lib/api/employeesService";
import { Employee } from "@/types/admin";
import { useAuth } from "@/context/AuthContext";

export default function TrafficReportsPage() {
  const { user } = useAuth();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [branchName, setBranchName] = useState(user.branchName || "مرور أمانة العاصمة");

  useEffect(() => {
    async function load() {
      try {
        const res = await employeesService.getEmployees();
        if (res.isSuccess) {
          setEmployees(res.employees);
          if (res.branchName) setBranchName(res.branchName);
        }
      } catch {
        // empty
      } finally {
        setLoading(false);
      }
    }
    load();
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
              <BarChart3 className="w-3.5 h-3.5 text-primary" />
              التقارير الإحصائية والتشغيلية المعتمدة
            </span>
            <span className="text-xs text-secondary">| {branchName}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary font-headline-lg">
            تقرير الجاهزية التشغيلية والقوة الميدانية
          </h1>
          <p className="text-secondary text-sm md:text-base mt-1">
            إحصائيات كادر الفرع، نسب التفعيل، ومؤشرات التوزيع الميداني المعتمدة في الخادم
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/traffic/employees"
            className="px-4 py-2.5 bg-primary hover:bg-primary-container text-white rounded-lg text-sm font-semibold shadow-sm transition-all flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            <span>كادر الفرع</span>
          </Link>
        </div>
      </div>

      {/* Backend Alignment Notice */}
      <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl text-xs text-amber-900 flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <p className="font-bold text-amber-800 text-sm">
            ملاحظة إحصائية: تقارير مستخرجة من قاعدة البيانات الحية
          </p>
          <p className="text-secondary leading-relaxed">
            تمت مطابقة هذا التقرير ليعتمد حصراً على سجلات الكادر الميداني المعتمدة في الخادم عبر <code className="font-mono bg-white/70 px-1 py-0.5 rounded text-primary">/api/v1/Employees</code>. تم استبعاد أي أرقام عشوائية أو غير مبنية على الخادم.
          </p>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/30">
          <span className="text-xs font-semibold text-secondary">إجمالي الكادر المقيد بالفرع</span>
          <div className="text-3xl font-bold text-primary mt-1 font-headline-lg">
            {loading ? "..." : employees.length}
          </div>
          <div className="text-xs text-secondary mt-1">ضباط وموظفون مسجلون</div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/30">
          <span className="text-xs font-semibold text-secondary">القوة الميدانية النشطة</span>
          <div className="text-3xl font-bold text-tertiary mt-1 font-headline-lg">
            {loading ? "..." : activeOfficers.length}
          </div>
          <div className="text-xs text-tertiary mt-1">على رأس العمل</div>
        </div>

        <div className="bg-surface-container-lowest rounded-xl p-5 border border-outline-variant/30">
          <span className="text-xs font-semibold text-secondary">نسبة الجاهزية الميدانية</span>
          <div className="text-3xl font-bold text-primary mt-1 font-headline-lg">
            {loading
              ? "..."
              : employees.length > 0
              ? `${Math.round((activeOfficers.length / employees.length) * 100)}%`
              : "100%"}
          </div>
          <div className="text-xs text-secondary mt-1">نسبة التشغيل الفعلي</div>
        </div>
      </div>
    </div>
  );
}
