"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  RefreshCw,
  Phone,
  Mail,
  CreditCard,
  Calendar,
  UserCheck,
  ShieldCheck,
  ShieldAlert,
  Loader2,
} from "lucide-react";
import {
  apiGetAllUserAccounts,
  apiActivateCitizenAccount,
  RegisteredUserAccountDto,
} from "@/lib/api/authService";

import { useNotification } from "@/context/NotificationContext";

export default function AdminUsersManagementPage() {
  const { toast } = useNotification();
  const [users, setUsers] = useState<RegisteredUserAccountDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all");

  // Activation Action State
  const [activatingNid, setActivatingNid] = useState<string | null>(null);

  const showNotification = (type: "success" | "error" | "info", message: string) => {
    if (type === "success") {
      toast.success(message);
    } else if (type === "error") {
      toast.error(message);
    } else {
      toast.info(message);
    }
  };

  const loadUsers = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const res = await apiGetAllUserAccounts();
      if (res.isSuccess && Array.isArray(res.data)) {
        setUsers(res.data);
      } else {
        showNotification("error", res.message || "تعذر تحميل حسابات المستخدمين");
      }
    } catch (err: any) {
      console.error("Failed to load user accounts:", err);
      showNotification("error", err.message || "حدث خطأ أثناء جلب قائمة المستخدمين");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // Handle immediate manual activation by SuperAdmin
  const handleActivateUser = async (user: RegisteredUserAccountDto) => {
    if (activatingNid) return;
    setActivatingNid(user.nationalNumber);

    try {
      const res = await apiActivateCitizenAccount(user.nationalNumber);
      if (res.isSuccess) {
        showNotification("success", `تم تفعيل حساب المواطن (${user.fullName}) بنجاح.`);
        // Update local state
        setUsers((prev) =>
          prev.map((u) =>
            u.nationalNumber === user.nationalNumber
              ? { ...u, status: "Active", activatedAt: new Date().toISOString() }
              : u
          )
        );
      } else {
        showNotification("error", res.message || "فشلت عملية التفعيل.");
      }
    } catch (err: any) {
      console.error("Activation failed:", err);
      showNotification("error", err.message || "فشلت عملية التفعيل.");
    } finally {
      setActivatingNid(null);
    }
  };

  // Metrics calculation
  const metrics = useMemo(() => {
    const total = users.length;
    const active = users.filter((u) => u.status === "Active").length;
    const pending = users.filter((u) => u.status === "PendingActivation").length;
    const suspended = users.filter(
      (u) => u.status === "Suspended" || u.status === "Deactivated"
    ).length;

    return { total, active, pending, suspended };
  }, [users]);

  // Filtered list
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchesSearch =
        searchTerm === "" ||
        u.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.nationalNumber?.includes(searchTerm) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phoneNumber?.includes(searchTerm);

      const matchesStatus =
        selectedStatusFilter === "all" || u.status === selectedStatusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [users, searchTerm, selectedStatusFilter]);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">


      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#052F31]"></span>
            <span className="text-xs font-bold text-[#052F31] uppercase tracking-wider">
              الإدارة المركزية السيادية
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#052F31]">
            حسابات المستخدمين الرقمية (Digital User Accounts)
          </h1>
          <p className="text-sm text-[#41484d] mt-1">
            سجل الحسابات الإلكترونية المسجلة عبر تطبيق هويتي، مع إمكانية المراقبة والتفعيل المباشر.
          </p>
        </div>

        <button
          onClick={() => loadUsers(true)}
          disabled={loading || refreshing}
          className="self-start md:self-auto bg-white hover:bg-slate-50 text-[#052F31] border border-slate-300 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin text-[#0C4A4E]" : ""}`} />
          <span>تحديث السجل</span>
        </button>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-[#e0e3e5] p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0C4A4E] flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">إجمالي الحسابات</span>
            <div className="text-2xl font-black text-[#052F31] font-mono">{metrics.total}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#e0e3e5] p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-[#005539] flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">الحسابات النشطة والمفعلة</span>
            <div className="text-2xl font-black text-[#005539] font-mono">{metrics.active}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#e0e3e5] p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">بانتظار التفعيل الحضوري</span>
            <div className="text-2xl font-black text-amber-700 font-mono">{metrics.pending}</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#e0e3e5] p-5 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-500 font-medium block">معلقة / غير نشطة</span>
            <div className="text-2xl font-black text-rose-700 font-mono">{metrics.suspended}</div>
          </div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white rounded-2xl border border-[#e0e3e5] p-4 shadow-xs flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="بحث بالاسم، الرقم الوطني، البريد، أو الهاتف..."
            className="w-full bg-[#f7f9fb] border border-[#c0c7ce] rounded-xl pr-10 pl-4 py-2.5 text-xs text-[#191c1e] placeholder:text-slate-400 focus:outline-none focus:border-[#0C4A4E]"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 text-xs text-slate-600 shrink-0">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="font-bold">حالة الحساب:</span>
          </div>
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="bg-[#f7f9fb] border border-[#c0c7ce] rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-none focus:border-[#0C4A4E]"
          >
            <option value="all">جميع الحالات ({users.length})</option>
            <option value="Active">مفعل (Active)</option>
            <option value="PendingActivation">قيد التفعيل (PendingActivation)</option>
            <option value="Suspended">معلق (Suspended)</option>
            <option value="Deactivated">ملغي (Deactivated)</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-[#e0e3e5] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#052F31] mx-auto" />
            <p className="text-xs text-slate-500 font-medium">جاري تحميل سجلات المستخدمين من الباكند...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-16 text-center space-y-3">
            <Users className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-sm font-bold text-slate-700">لا توجد حسابات مطابقة للبحث</h3>
            <p className="text-xs text-slate-400">
              {searchTerm || selectedStatusFilter !== "all"
                ? "جرب تغيير معايير البحث أو تصفية الحالات."
                : "لم يتم تسجيل أي حسابات مستخدمين في النظام حتى الآن."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-[#f7f9fb] border-b border-[#e0e3e5] text-xs font-bold text-[#052F31]">
                  <th className="p-4">المستخدم / المواطن</th>
                  <th className="p-4">الرقم الوطني</th>
                  <th className="p-4">بيانات الاتصال</th>
                  <th className="p-4">تاريخ التسجيل</th>
                  <th className="p-4">حالة الحساب</th>
                  <th className="p-4">تاريخ التفعيل</th>
                  <th className="p-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {filteredUsers.map((u) => {
                  const isActivating = activatingNid === u.nationalNumber;
                  const isPending = u.status === "PendingActivation";
                  const isActive = u.status === "Active";

                  return (
                    <tr key={u.userId} className="hover:bg-slate-50/70 transition-colors">
                      {/* Name & ID */}
                      <td className="p-4">
                        <div className="font-bold text-slate-800">{u.fullName}</div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                          ID: {u.userId.slice(0, 13)}...
                        </div>
                      </td>

                      {/* National Number */}
                      <td className="p-4">
                        <span className="font-mono font-bold text-[#0C4A4E] bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100">
                          {u.nationalNumber}
                        </span>
                      </td>

                      {/* Contact Info */}
                      <td className="p-4 space-y-1">
                        {u.email && (
                          <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                            <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="font-mono">{u.email}</span>
                          </div>
                        )}
                        {u.phoneNumber && (
                          <div className="flex items-center gap-1.5 text-slate-600 text-[11px]">
                            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                            <span className="font-mono">{u.phoneNumber}</span>
                          </div>
                        )}
                        {!u.email && !u.phoneNumber && (
                          <span className="text-slate-400 text-[11px]">—</span>
                        )}
                      </td>

                      {/* Created At */}
                      <td className="p-4 text-slate-600 font-mono text-[11px]">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString("ar-YE") : "—"}
                      </td>

                      {/* Status */}
                      <td className="p-4">
                        {isActive ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold text-[11px]">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>مفعل</span>
                          </span>
                        ) : isPending ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-bold text-[11px] animate-pulse">
                            <Clock className="w-3 h-3" />
                            <span>قيد التفعيل</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 font-bold text-[11px]">
                            <XCircle className="w-3 h-3" />
                            <span>{u.status}</span>
                          </span>
                        )}
                      </td>

                      {/* Activated At */}
                      <td className="p-4 text-slate-600 font-mono text-[11px]">
                        {u.activatedAt ? new Date(u.activatedAt).toLocaleDateString("ar-YE") : "—"}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-center">
                        {isPending ? (
                          <button
                            onClick={() => handleActivateUser(u)}
                            disabled={isActivating}
                            className="bg-[#005539] hover:bg-[#003c27] text-white px-3 py-1.5 rounded-lg font-bold text-[11px] flex items-center justify-center gap-1.5 shadow-xs transition-all disabled:opacity-50 mx-auto"
                          >
                            {isActivating ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <UserCheck className="w-3.5 h-3.5" />
                            )}
                            <span>تفعيل فوري</span>
                          </button>
                        ) : isActive ? (
                          <span className="text-[11px] text-emerald-700 font-medium">
                            تم التوثيق
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
