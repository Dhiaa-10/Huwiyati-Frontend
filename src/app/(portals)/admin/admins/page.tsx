"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  ShieldCheck,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  XCircle,
  Edit3,
  UserX,
  UserCheck,
  RefreshCw,
  X,
  Loader2,
  AlertCircle,
  Building2,
  Phone,
  Mail,
  CreditCard,
  Building,
  User,
  ExternalLink,
  ChevronRight,
  Shield,
  Layers
} from "lucide-react";
import { adminService, CitizenLookup } from "@/lib/api/adminService";
import {
  Organization,
  OrganizationBranch,
  OrganizationAdmin,
  AssignAdminDto,
  UpdateAdminDto,
} from "@/types/admin";

export default function OrganizationAdminsPage() {
  const [admins, setAdmins] = useState<OrganizationAdmin[]>([]);
  const [branches, setBranches] = useState<OrganizationBranch[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [citizens, setCitizens] = useState<CitizenLookup[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedOrgFilter, setSelectedOrgFilter] = useState<string>("all");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all");

  // Notifications
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Modal States
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isRelieveConfirmOpen, setIsRelieveConfirmOpen] = useState(false);
  const [selectedAdmin, setSelectedAdmin] = useState<OrganizationAdmin | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Assign Form
  const [selectedOrgForAssign, setSelectedOrgForAssign] = useState<string>("all");
  const [assignForm, setAssignForm] = useState<AssignAdminDto>({
    nationalNumber: "",
    branchId: "",
  });

  // Transfer Form
  const [transferBranchId, setTransferBranchId] = useState<string>("");

  const loadData = async () => {
    setLoading(true);
    try {
      const [adminsRes, branchesRes, orgsRes, citizensRes] = await Promise.all([
        adminService.getAdmins(),
        adminService.getBranches(),
        adminService.getOrganizations(),
        adminService.getCitizens(),
      ]);

      setAdmins(adminsRes);
      setBranches(branchesRes);
      setOrganizations(orgsRes.items);
      setCitizens(citizensRes);

      if (orgsRes.items.length > 0 && selectedOrgForAssign === "all") {
        setSelectedOrgForAssign(orgsRes.items[0].id);
      }
    } catch (err: any) {
      console.error("Error loading admins data:", err);
      setNotification({
        type: "error",
        message: "تعذر تحميل بيانات مدراء الفروع من الخادم.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update branch options when org changes in assign modal
  const assignableBranches = useMemo(() => {
    if (!selectedOrgForAssign || selectedOrgForAssign === "all") return branches.filter((b) => b.isActive);
    return branches.filter(
      (b) => b.organizationId === selectedOrgForAssign && b.isActive
    );
  }, [branches, selectedOrgForAssign]);

  // If org changes, reset branchId if not in the new org
  useEffect(() => {
    if (assignableBranches.length > 0) {
      setAssignForm((prev) => ({
        ...prev,
        branchId: assignableBranches[0].id,
      }));
    } else {
      setAssignForm((prev) => ({ ...prev, branchId: "" }));
    }
  }, [assignableBranches]);

  // Citizen hint for assign form
  const matchedCitizen = useMemo(() => {
    const trimmed = assignForm.nationalNumber.trim();
    if (trimmed.length < 5) return null;
    return citizens.find((c) => c.nationalNumber === trimmed) || null;
  }, [assignForm.nationalNumber, citizens]);

  // Handle Assign Admin
  const handleAssignAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignForm.nationalNumber || !assignForm.branchId) return;

    setSubmitting(true);
    try {
      await adminService.assignAdmin({
        nationalNumber: assignForm.nationalNumber.trim(),
        branchId: assignForm.branchId,
      });

      setNotification({
        type: "success",
        message: `تم تكليف المدير بنجاح ومنحه صلاحيات الإدارة للفرع.`,
      });
      setIsAssignModalOpen(false);
      setAssignForm({
        nationalNumber: "",
        branchId: assignableBranches[0]?.id || "",
      });
      await loadData();
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err?.message || "فشلت عملية تكليف المدير في الخادم.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Transfer Branch
  const handleTransferAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAdmin || !transferBranchId) return;

    setSubmitting(true);
    try {
      await adminService.updateAdmin(selectedAdmin.employeeId, {
        branchId: transferBranchId,
      });

      setNotification({
        type: "success",
        message: `تم نقل المدير ${selectedAdmin.fullName} إلى الفرع الجديد بنجاح.`,
      });
      setIsTransferModalOpen(false);
      setSelectedAdmin(null);
      await loadData();
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err?.message || "فشلت عملية نقل المدير.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Relieve Admin
  const handleRelieveAdmin = async () => {
    if (!selectedAdmin) return;

    setSubmitting(true);
    try {
      await adminService.removeAdmin(selectedAdmin.employeeId);
      setNotification({
        type: "success",
        message: `تم إعفاء ${selectedAdmin.fullName} من إدارة الفرع بنجاح (يبقى كموظف اعتيادي).`,
      });
      setIsRelieveConfirmOpen(false);
      setSelectedAdmin(null);
      await loadData();
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err?.message || "فشلت عملية إعفاء المدير.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Handle Restore Admin
  const handleRestoreAdmin = async (admin: OrganizationAdmin) => {
    setSubmitting(true);
    try {
      await adminService.restoreAdmin(admin.employeeId);
      setNotification({
        type: "success",
        message: `تمت استعادة صلاحيات الإدارة للمدير ${admin.fullName} بنجاح.`,
      });
      await loadData();
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err?.message || "فشلت عملية استعادة الصلاحيات.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Filtered Admins
  const filteredAdmins = useMemo(() => {
    return admins.filter((a) => {
      const matchesSearch =
        searchTerm === "" ||
        a.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.nationalNumber.includes(searchTerm) ||
        a.employeeNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        a.organizationName.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesOrg =
        selectedOrgFilter === "all" ||
        a.organizationName.toLowerCase().includes(selectedOrgFilter.toLowerCase());

      const matchesStatus =
        selectedStatusFilter === "all" ||
        (selectedStatusFilter === "active" && a.isActive) ||
        (selectedStatusFilter === "inactive" && !a.isActive);

      return matchesSearch && matchesOrg && matchesStatus;
    });
  }, [admins, searchTerm, selectedOrgFilter, selectedStatusFilter]);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-[#00374e] uppercase tracking-wider">
              الإشراف والرقابة السيادية
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#00374e]">
            تكليف وإدارة مدراء الفروع
          </h1>
          <p className="text-sm text-[#41484d] mt-1">
            إسناد قيادة فروع الهيئات الحكومية (الأحوال المدنية، الجوازات، المرور، المستشفيات) وضبط صلاحياتهم.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            title="تحديث البيانات"
            className="p-2.5 bg-white text-[#00374e] border border-slate-300 rounded-xl hover:bg-slate-50 transition-all shadow-xs cursor-pointer disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 text-[#0b4f6c] ${loading ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setIsAssignModalOpen(true)}
            className="px-4 py-2.5 bg-[#0b4f6c] hover:bg-[#00374e] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>تكليف مدير فرع جديد</span>
          </button>
        </div>
      </div>

      {/* Notification Banner */}
      {notification && (
        <div
          className={`p-4 rounded-xl flex items-center justify-between text-xs font-semibold ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-rose-50 text-rose-800 border border-rose-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            <span>{notification.message}</span>
          </div>
          <button
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 mb-1">إجمالي المدراء المكلفين</div>
            <div className="text-2xl font-black text-[#00374e]">{admins.length}</div>
            <div className="text-[11px] text-slate-400 mt-1">مسجلين رسمياً في النظام</div>
          </div>
          <div className="p-3 bg-blue-50 text-blue-700 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 mb-1">المدراء على رأس العمل</div>
            <div className="text-2xl font-black text-emerald-600">
              {admins.filter((a) => a.isActive).length}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">يمارسون الصلاحيات التشغيلية</div>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl">
            <UserCheck className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 mb-1">الفروع الحكومية النشطة</div>
            <div className="text-2xl font-black text-[#00374e]">
              {branches.filter((b) => b.isActive).length}
            </div>
            <div className="text-[11px] text-slate-400 mt-1">عبر كافة الهيئات السيادية</div>
          </div>
          <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl">
            <Building className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs font-medium text-slate-500 mb-1">المواطنين في السجل المركزي</div>
            <div className="text-2xl font-black text-[#00374e]">{citizens.length}</div>
            <div className="text-[11px] text-slate-400 mt-1">متاحين للترقية والتكليف</div>
          </div>
          <div className="p-3 bg-amber-50 text-amber-700 rounded-xl">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="بحث بالاسم، الرقم الوطني، الرقم الوظيفي، أو الفرع..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pr-10 pl-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-[#0b4f6c] focus:border-transparent transition-all"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Org Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">الهيئة:</span>
            <select
              value={selectedOrgFilter}
              onChange={(e) => setSelectedOrgFilter(e.target.value)}
              className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-slate-700"
            >
              <option value="all">كافة الهيئات السيادية</option>
              {organizations.map((org) => (
                <option key={org.id} value={org.name}>
                  {org.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-slate-500">الحالة:</span>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden text-slate-700"
            >
              <option value="all">الكل</option>
              <option value="active">نشط (مكلف)</option>
              <option value="inactive">معفى من الإدارة</option>
            </select>
          </div>
        </div>
      </div>

      {/* Admins Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-[#0b4f6c] mb-3" />
            <p className="text-xs">جاري جلب سجلات مدراء الفروع من الخادم المركزي...</p>
          </div>
        ) : filteredAdmins.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Shield className="w-12 h-12 text-slate-300 mb-3" />
            <p className="text-sm font-bold text-slate-600">لا يوجد مدراء فروع مطابقين للبحث</p>
            <p className="text-xs text-slate-400 mt-1">
              {searchTerm || selectedOrgFilter !== "all" || selectedStatusFilter !== "all"
                ? "جرب تعديل خيارات البحث أو التصفية"
                : "يمكنك تكليف مدير فرع جديد بالنقر على زر التكليف أعلاه"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 text-[#00374e] border-b border-slate-200 font-bold">
                <tr>
                  <th className="py-3.5 px-4">المدير المكلف</th>
                  <th className="py-3.5 px-4">الرقم الوطني</th>
                  <th className="py-3.5 px-4">الجهة والفرع</th>
                  <th className="py-3.5 px-4">الرقم الوظيفي</th>
                  <th className="py-3.5 px-4">بيانات الاتصال</th>
                  <th className="py-3.5 px-4">الحالة</th>
                  <th className="py-3.5 px-4 text-center">الإجراءات والعمليات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAdmins.map((admin) => (
                  <tr key={admin.employeeId} className="hover:bg-slate-50/70 transition-colors">
                    {/* Admin Name & Avatar */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#00374e]/10 text-[#00374e] font-bold flex items-center justify-center text-xs">
                          {admin.fullName ? admin.fullName.charAt(0) : "م"}
                        </div>
                        <div>
                          <div className="font-bold text-[#00374e]">{admin.fullName || "مدير فرع"}</div>
                          <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                            <span>تاريخ التعيين:</span>
                            <span dir="ltr">
                              {new Date(admin.createdAt).toLocaleDateString("ar-YE")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* National Number */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono bg-slate-100 px-2 py-1 rounded text-slate-700 text-[11px] font-semibold">
                        {admin.nationalNumber}
                      </span>
                    </td>

                    {/* Org & Branch */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-slate-800 flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-[#0b4f6c]" />
                          {admin.organizationName}
                        </span>
                        <span className="text-[11px] text-slate-500">{admin.branchName}</span>
                      </div>
                    </td>

                    {/* Employee Number */}
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-slate-600 bg-slate-50 px-2 py-0.5 rounded border border-slate-200 text-[11px]">
                        {admin.employeeNumber}
                      </span>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-0.5 text-[11px] text-slate-500">
                        {admin.phoneNumber && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-2.5 h-2.5 text-slate-400" />
                            <span dir="ltr">{admin.phoneNumber}</span>
                          </span>
                        )}
                        {admin.email && (
                          <span className="flex items-center gap-1 text-[10px] text-slate-400">
                            <Mail className="w-2.5 h-2.5 text-slate-400" />
                            {admin.email}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {admin.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" />
                          نشط (مكلف)
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                          <XCircle className="w-3 h-3" />
                          معفى من الإدارة
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {admin.isActive ? (
                          <>
                            <button
                              onClick={() => {
                                setSelectedAdmin(admin);
                                setTransferBranchId(admin.branchId);
                                setIsTransferModalOpen(true);
                              }}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer"
                              title="نقل المدير لفرع آخر"
                            >
                              <Edit3 className="w-3 h-3 text-[#0b4f6c]" />
                              <span>نقل فرع</span>
                            </button>
                            <button
                              onClick={() => {
                                setSelectedAdmin(admin);
                                setIsRelieveConfirmOpen(true);
                              }}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer"
                              title="إعفاء من منصب الإدارة"
                            >
                              <UserX className="w-3 h-3 text-rose-600" />
                              <span>إعفاء</span>
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleRestoreAdmin(admin)}
                            disabled={submitting}
                            className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 cursor-pointer"
                            title="إعادة التكليف كمدير"
                          >
                            <UserCheck className="w-3 h-3 text-emerald-600" />
                            <span>إعادة تكليف</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Assign New Branch Admin */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#00374e]/10 text-[#00374e] rounded-lg">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#00374e]">تكليف مدير فرع جديد</h3>
                  <p className="text-xs text-slate-500">إسناد إدارة أحد الفروع لمواطن مسجل في السجل المدني</p>
                </div>
              </div>
              <button
                onClick={() => setIsAssignModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAssignAdmin} className="p-5 space-y-4">
              {/* Select Organization */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  1. الهيئة الحكومية التابع لها الفرع
                </label>
                <select
                  value={selectedOrgForAssign}
                  onChange={(e) => setSelectedOrgForAssign(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0b4f6c] focus:outline-hidden"
                >
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Branch */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  2. الفرع المطلوب إسناد إدارته
                </label>
                {assignableBranches.length === 0 ? (
                  <div className="p-3 bg-amber-50 text-amber-800 text-xs rounded-xl border border-amber-200">
                    لا توجد فروع نشطة متاحة لهذه الهيئة. يرجى إنشاء فرع أولاً من صفحة الهيئات.
                  </div>
                ) : (
                  <select
                    value={assignForm.branchId}
                    onChange={(e) =>
                      setAssignForm((prev) => ({ ...prev, branchId: e.target.value }))
                    }
                    className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0b4f6c] focus:outline-hidden"
                  >
                    {assignableBranches.map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.branchName} — {branch.governorate} ({branch.district})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Citizen National Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  3. الرقم الوطني للمواطن المرشح للإدارة
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="مثال: 01011135650"
                    value={assignForm.nationalNumber}
                    onChange={(e) =>
                      setAssignForm((prev) => ({ ...prev, nationalNumber: e.target.value }))
                    }
                    className="w-full text-xs p-2.5 pr-8 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0b4f6c] focus:outline-hidden font-mono"
                  />
                  <CreditCard className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2" />
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  يجب أن يكون المواطن مسجلاً في السجل المدني ويمتلك حساب مستخدم نشط.
                </span>

                {/* Live Lookup Match Banner */}
                {matchedCitizen && (
                  <div className="mt-2.5 p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <div>
                        <div className="text-xs font-bold text-emerald-800">
                          {matchedCitizen.fullName}
                        </div>
                        <div className="text-[10px] text-emerald-600">
                          {matchedCitizen.governorate} • {matchedCitizen.gender} • مسجل في السجل المركزي
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                      سجل موثق
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting || !assignForm.branchId || !assignForm.nationalNumber}
                  className="px-5 py-2 bg-[#0b4f6c] hover:bg-[#00374e] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>جاري التكليف...</span>
                    </>
                  ) : (
                    <span>اعتماد تكليف المدير</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Transfer Branch */}
      {isTransferModalOpen && selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-[#00374e]/10 text-[#00374e] rounded-lg">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#00374e]">نقل المدير إلى فرع آخر</h3>
                  <p className="text-xs text-slate-500">{selectedAdmin.fullName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsTransferModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleTransferAdmin} className="p-5 space-y-4">
              <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                <div className="text-slate-500">الفرع الحالي:</div>
                <div className="font-bold text-[#00374e]">{selectedAdmin.branchName} ({selectedAdmin.organizationName})</div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  اختر الفرع الجديد المطلوب نقل المدير إليه:
                </label>
                <select
                  value={transferBranchId}
                  onChange={(e) => setTransferBranchId(e.target.value)}
                  className="w-full text-xs p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-[#0b4f6c] focus:outline-hidden"
                >
                  {branches
                    .filter((b) => b.isActive)
                    .map((branch) => (
                      <option key={branch.id} value={branch.id}>
                        {branch.branchName} — {branch.organizationName || branch.governorate}
                      </option>
                    ))}
                </select>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting || !transferBranchId}
                  className="px-5 py-2 bg-[#0b4f6c] hover:bg-[#00374e] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>جاري النقل...</span>
                    </>
                  ) : (
                    <span>تأكيد النقل</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal: Relieve Admin */}
      {isRelieveConfirmOpen && selectedAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center gap-3">
              <div className="p-3 bg-rose-100 text-rose-600 rounded-full">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">تأكيد إعفاء مدير الفرع</h3>
                <p className="text-xs text-slate-500">سحب الصلاحيات الإدارية عن الفرع</p>
              </div>
            </div>

            <div className="p-5 text-xs text-slate-600 space-y-3">
              <p>
                هل أنت متأكد من رغبتك في إعفاء المدير <strong className="text-slate-900">{selectedAdmin.fullName}</strong> من إدارة فرع <strong className="text-slate-900">{selectedAdmin.branchName}</strong>؟
              </p>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-800 text-[11px] leading-relaxed">
                ملاحظة: سيتم إسقاط صلاحيات الإدارة (Admin) فقط، وسيظل المستخدم محتفظاً بسجله كموظف اعتيادي ومواطن في النظام. يمكن إعادة تكليفه لاحقاً في أي وقت.
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsRelieveConfirmOpen(false)}
                className="px-4 py-2 text-xs text-slate-600 hover:bg-slate-200 rounded-xl transition-all cursor-pointer"
              >
                تراجع
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleRelieveAdmin}
                className="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>جاري التنفيذ...</span>
                  </>
                ) : (
                  <span>تأكيد الإعفاء</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
