"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import {
  Building2,
  Search,
  Plus,
  Filter,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  RotateCcw,
  MapPin,
  Phone,
  Layers,
  RefreshCw,
  X,
  Loader2,
  AlertCircle,
  Building,
} from "lucide-react";
import { adminService } from "@/lib/api/adminService";
import {
  Organization,
  OrganizationBranch,
  CreateBranchDto,
  UpdateBranchDto,
} from "@/types/admin";

export default function AgenciesAndBranchesPage() {
  const searchParams = useSearchParams();
  const initialOrgId = searchParams.get("orgId") || "all";

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [branches, setBranches] = useState<OrganizationBranch[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrgFilter, setSelectedOrgFilter] = useState<string>(initialOrgId);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Notifications
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<OrganizationBranch | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State for Add
  const [branchForm, setBranchForm] = useState<CreateBranchDto>({
    organizationId: "",
    branchName: "",
    governorate: "أمانة العاصمة",
    district: "",
    addressDetails: "",
    phoneNumber: "",
    isActive: true,
  });

  // Form State for Edit
  const [editForm, setEditForm] = useState<UpdateBranchDto>({
    branchName: "",
    governorate: "",
    phoneNumber: "",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [orgsRes, branchesRes] = await Promise.all([
        adminService.getOrganizations(),
        adminService.getBranches(),
      ]);
      setOrganizations(orgsRes.items);
      setBranches(branchesRes);

      if (orgsRes.items.length > 0 && !branchForm.organizationId) {
        setBranchForm((prev) => ({ ...prev, organizationId: orgsRes.items[0].id }));
      }
    } catch (err: any) {
      console.error("Error loading branches data:", err);
      setNotification({
        type: "error",
        message: "تعذر تحميل بيانات الفروع من الخادم.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!branchForm.branchName || !branchForm.organizationId) return;

    setSubmitting(true);
    try {
      await adminService.createBranch(branchForm);
      setNotification({
        type: "success",
        message: `تم إنشاء الفرع "${branchForm.branchName}" بنجاح في قاعدة البيانات.`,
      });
      setIsAddModalOpen(false);
      setBranchForm({
        organizationId: organizations[0]?.id || "",
        branchName: "",
        governorate: "أمانة العاصمة",
        district: "",
        addressDetails: "",
        phoneNumber: "",
        isActive: true,
      });
      await loadData();
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err?.message || "فشلت عملية إنشاء الفرع في الخادم.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenEdit = (b: OrganizationBranch) => {
    setSelectedBranch(b);
    setEditForm({
      organizationId: b.organizationId,
      branchName: b.branchName,
      governorate: b.governorate,
      district: b.district,
      addressDetails: b.addressDetails || "",
      phoneNumber: b.phoneNumber || "",
    });
    setIsEditModalOpen(true);
  };

  const handleUpdateBranch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBranch) return;

    setSubmitting(true);
    try {
      await adminService.updateBranch(selectedBranch.id, editForm);
      setNotification({
        type: "success",
        message: `تم تحديث بيانات الفرع "${editForm.branchName}" بنجاح.`,
      });
      setIsEditModalOpen(false);
      await loadData();
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err?.message || "فشلت عملية تحديث بيانات الفرع.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBranch = async (branch: OrganizationBranch) => {
    if (!confirm(`هل أنت متأكد من تعطيل/تجميد الفرع "${branch.branchName}"؟`)) return;

    try {
      await adminService.deleteBranch(branch.id);
      setNotification({
        type: "success",
        message: `تم تعطيل الفرع "${branch.branchName}" بنجاح.`,
      });
      await loadData();
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err?.message || "فشل تعطيل الفرع.",
      });
    }
  };

  const handleRestoreBranch = async (branch: OrganizationBranch) => {
    try {
      await adminService.restoreBranch(branch.id);
      setNotification({
        type: "success",
        message: `تمت إعادة تفعيل الفرع "${branch.branchName}" بنجاح.`,
      });
      await loadData();
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err?.message || "فشلت إعادة تفعيل الفرع.",
      });
    }
  };

  // Filtered branches
  const filteredBranches = useMemo(() => {
    return branches.filter((b) => {
      const matchesOrg =
        selectedOrgFilter === "all" || b.organizationId === selectedOrgFilter;
      const matchesSearch =
        searchTerm === "" ||
        b.branchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.governorate.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (b.district && b.district.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (b.phoneNumber && b.phoneNumber.includes(searchTerm));
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && b.isActive) ||
        (statusFilter === "inactive" && !b.isActive);

      return matchesOrg && matchesSearch && matchesStatus;
    });
  }, [branches, selectedOrgFilter, searchTerm, statusFilter]);

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-[#00374e] uppercase tracking-wider">
              الهيكل التنظيمي السيادي
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#00374e]">
            إدارة الهيئات والفروع الحكومية
          </h1>
          <p className="text-sm text-[#41484d] mt-1">
            استعراض الفروع المعتمدة في قاعدة البيانات المركزية، افتتاح فروع جديدة، وضبط التفعيل.
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
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-[#0b4f6c] hover:bg-[#00374e] text-white text-xs font-bold rounded-xl transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>إضافة فرع جديد</span>
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

      {/* 4 Sovereign Government Organizations Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
        <button
          onClick={() => setSelectedOrgFilter("all")}
          className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
            selectedOrgFilter === "all"
              ? "bg-[#0b4f6c] text-white border-[#0b4f6c] shadow-xs"
              : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
          }`}
        >
          <p className="text-xs font-bold">كافة القطاعات</p>
          <p className={`text-[11px] mt-0.5 ${selectedOrgFilter === "all" ? "text-sky-200" : "text-slate-400"}`}>
            {branches.length} فرع
          </p>
        </button>

        {organizations.map((org) => {
          const count = branches.filter((b) => b.organizationId === org.id).length;
          const isSelected = selectedOrgFilter === org.id;
          return (
            <button
              key={org.id}
              onClick={() => setSelectedOrgFilter(org.id)}
              className={`p-3 rounded-xl border text-center transition-all cursor-pointer ${
                isSelected
                  ? "bg-[#0b4f6c] text-white border-[#0b4f6c] shadow-xs"
                  : "bg-white text-slate-700 border-slate-200 hover:border-slate-300"
              }`}
            >
              <p className="text-xs font-bold truncate">{org.name}</p>
              <p className={`text-[11px] mt-0.5 ${isSelected ? "text-sky-200" : "text-slate-400"}`}>
                {count} فرع
              </p>
            </button>
          );
        })}
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-2xl p-4 shadow-xs border border-[#c0c7ce]/30 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="البحث باسم الفرع، المحافظة، المديرية..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#f2f4f6] border border-slate-200 rounded-xl py-2 ps-9 pe-4 text-xs text-[#191c1e] focus:border-[#0b4f6c] focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[#f2f4f6] border border-slate-200 rounded-xl py-2 px-3 text-xs text-slate-700 focus:outline-hidden"
          >
            <option value="all">كافة الحالات</option>
            <option value="active">الفروع النشطة فقط</option>
            <option value="inactive">الفروع المعطلة / المجمدة</option>
          </select>
        </div>
      </div>

      {/* Branches Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-[#c0c7ce]/30 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Building className="w-4 h-4 text-[#00374e]" />
            <h2 className="text-sm font-bold text-[#00374e]">
              قائمة الفروع والمراكز المعتمدة ({filteredBranches.length})
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-mono">
            {branches.filter((b) => b.isActive).length} فرع نشط
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse">
            <thead className="bg-[#f7f9fb] border-b border-slate-200 text-slate-600 text-xs font-bold">
              <tr>
                <th className="py-3.5 px-4">اسم الفرع</th>
                <th className="py-3.5 px-4">القطاع الحكومي</th>
                <th className="py-3.5 px-4">المحافظة والمديرية</th>
                <th className="py-3.5 px-4">تفاصيل العنوان</th>
                <th className="py-3.5 px-4">رقم الهاتف</th>
                <th className="py-3.5 px-4">الحالة</th>
                <th className="py-3.5 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#0b4f6c]" />
                    <span>جاري تحميل بيانات الفروع من قاعدة البيانات...</span>
                  </td>
                </tr>
              ) : filteredBranches.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    لا توجد فروع مسجلة مطابقة لمعايير البحث الحالية.
                  </td>
                </tr>
              ) : (
                filteredBranches.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-[#00374e]">
                      {b.branchName}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {b.organizationName || "القطاع المركزي"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{b.governorate} {b.district ? `— ${b.district}` : ""}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs truncate">
                      {b.addressDetails || "—"}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 font-mono">
                      {b.phoneNumber || "—"}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                          b.isActive
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        {b.isActive ? "نشط" : "معطل / مجمد"}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(b)}
                          title="تعديل بيانات الفرع"
                          className="p-1.5 text-slate-600 hover:text-[#0b4f6c] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        {b.isActive ? (
                          <button
                            onClick={() => handleDeleteBranch(b)}
                            title="تعطيل / تجميد الفرع"
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleRestoreBranch(b)}
                            title="إعادة تفعيل الفرع"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Add New Branch */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#0b4f6c]/10 text-[#0b4f6c] flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#00374e] text-sm">إضافة فرع حكومي جديد</h3>
                  <p className="text-[11px] text-slate-500">
                    تسجيل فرع جديد وربطه بإحدى الهيئات الأربع في قاعدة البيانات
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBranch} className="p-6 space-y-4 text-right text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">القطاع الحكومي التابع له *</label>
                <select
                  required
                  value={branchForm.organizationId}
                  onChange={(e) => setBranchForm({ ...branchForm, organizationId: e.target.value })}
                  className="w-full bg-[#f2f4f6] border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-800 focus:border-[#0b4f6c] focus:outline-hidden"
                >
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">اسم الفرع *</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: فرع الصافية النموذجي"
                  value={branchForm.branchName}
                  onChange={(e) => setBranchForm({ ...branchForm, branchName: e.target.value })}
                  className="w-full bg-[#f2f4f6] border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-800 focus:border-[#0b4f6c] focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">المحافظة *</label>
                  <input
                    type="text"
                    required
                    placeholder="أمانة العاصمة"
                    value={branchForm.governorate}
                    onChange={(e) => setBranchForm({ ...branchForm, governorate: e.target.value })}
                    className="w-full bg-[#f2f4f6] border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-800 focus:border-[#0b4f6c] focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1.5">المديرية *</label>
                  <input
                    type="text"
                    required
                    placeholder="السبعين"
                    value={branchForm.district}
                    onChange={(e) => setBranchForm({ ...branchForm, district: e.target.value })}
                    className="w-full bg-[#f2f4f6] border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-800 focus:border-[#0b4f6c] focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">تفاصيل العنوان والموقع</label>
                <input
                  type="text"
                  placeholder="شارع تعز، جوار جولة 45"
                  value={branchForm.addressDetails || ""}
                  onChange={(e) => setBranchForm({ ...branchForm, addressDetails: e.target.value })}
                  className="w-full bg-[#f2f4f6] border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-800 focus:border-[#0b4f6c] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">رقم الهاتف الرسمي</label>
                <input
                  type="text"
                  placeholder="01234567"
                  value={branchForm.phoneNumber || ""}
                  onChange={(e) => setBranchForm({ ...branchForm, phoneNumber: e.target.value })}
                  className="w-full bg-[#f2f4f6] border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-800 font-mono focus:border-[#0b4f6c] focus:outline-hidden"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-[#0b4f6c] hover:bg-[#00374e] text-white rounded-xl font-bold flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>حفظ وإضافة الفرع</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Edit Branch */}
      {isEditModalOpen && selectedBranch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-[#f8fafc]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#00374e] text-sm">تعديل بيانات الفرع</h3>
                  <p className="text-[11px] text-slate-500">{selectedBranch.branchName}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpdateBranch} className="p-6 space-y-4 text-right text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1.5">اسم الفرع *</label>
                <input
                  type="text"
                  required
                  value={editForm.branchName}
                  onChange={(e) => setEditForm({ ...editForm, branchName: e.target.value })}
                  className="w-full bg-[#f2f4f6] border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-800 focus:border-[#0b4f6c] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">المحافظة</label>
                <input
                  type="text"
                  value={editForm.governorate || ""}
                  onChange={(e) => setEditForm({ ...editForm, governorate: e.target.value })}
                  className="w-full bg-[#f2f4f6] border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-800 focus:border-[#0b4f6c] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1.5">رقم الهاتف</label>
                <input
                  type="text"
                  value={editForm.phoneNumber || ""}
                  onChange={(e) => setEditForm({ ...editForm, phoneNumber: e.target.value })}
                  className="w-full bg-[#f2f4f6] border border-slate-200 rounded-xl py-2.5 px-3 text-xs text-slate-800 font-mono focus:border-[#0b4f6c] focus:outline-hidden"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-[#0b4f6c] hover:bg-[#00374e] text-white rounded-xl font-bold flex items-center gap-2 cursor-pointer disabled:opacity-60"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>حفظ التعديلات</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
