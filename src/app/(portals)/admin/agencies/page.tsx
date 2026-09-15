"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Building2,
  Search,
  Plus,
  Filter,
  MoreVertical,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  ExternalLink,
  MapPin,
  Phone,
  Mail,
  Shield,
  Activity,
  Layers,
  AlertTriangle,
  X,
  RefreshCw,
  FolderGit2,
} from "lucide-react";
import { adminService } from "@/lib/api/adminService";
import {
  Organization,
  OrganizationBranch,
  AgencyType,
  AgencyStatus,
  CreateOrganizationDto,
  UpdateOrganizationDto,
  CreateBranchDto,
} from "@/types/admin";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function AgenciesManagementPage() {
  const { updateSession } = useAuth();
  const router = useRouter();
  const [agencies, setAgencies] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Notification Banner
  const [notification, setNotification] = useState<{
    type: "success" | "error" | "info";
    message: string;
  } | null>(null);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isBranchesModalOpen, setIsBranchesModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Selected agency for edit/branches/delete
  const [selectedAgency, setSelectedAgency] = useState<Organization | null>(null);
  const [agencyBranches, setAgencyBranches] = useState<OrganizationBranch[]>([]);
  const [loadingBranches, setLoadingBranches] = useState(false);

  // New Agency Form Data
  const [formData, setFormData] = useState<CreateOrganizationDto>({
    name: "",
    code: "",
    type: "civil",
    description: "",
    directorName: "",
    directorNationalId: "",
    directorPhone: "",
    directorEmail: "",
    isActive: true,
  });

  // New Branch Form inside Branches Modal
  const [newBranchData, setNewBranchData] = useState<{
    branchName: string;
    governorate: string;
    district: string;
    phoneNumber: string;
    managerName: string;
  }>({
    branchName: "",
    governorate: "أمانة العاصمة",
    district: "",
    phoneNumber: "",
    managerName: "",
  });

  const getPortalUrlForAgency = (code: string) => {
    switch (code) {
      case "CIVIL_REGISTRY":
        return "/civil-registry";
      case "PASSPORTS":
        return "/passports";
      case "TRAFFIC":
        return "/traffic";
      case "HEALTH":
        return "/hospitals";
      default:
        return null;
    }
  };

  // Fetch Agencies on Mount
  const fetchAgencies = async () => {
    setLoading(true);
    try {
      const response = await adminService.getOrganizations({
        search: searchTerm,
        type: typeFilter as AgencyType,
        status: statusFilter as AgencyStatus,
        page: 1,
        pageSize: 50,
      });
      setAgencies(response.items);
    } catch (err) {
      console.error(err);
      showNotification("error", "تعذر جلب بيانات الهيئات.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgencies();
  }, [searchTerm, typeFilter, statusFilter]);

  const showNotification = (
    type: "success" | "error" | "info",
    message: string
  ) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  // Toggle Agency Status (Active / Inactive)
  const handleToggleStatus = async (agency: Organization) => {
    try {
      const updated = await adminService.toggleOrganizationStatus(agency.id);
      setAgencies((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
      showNotification(
        "success",
        `تم تغيير حالة ${agency.name} إلى (${updated.isActive ? "نشط" : "غير نشط"}).`
      );
    } catch (err) {
      showNotification("error", "فشل في تحديث حالة الجهة.");
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (agency: Organization) => {
    setSelectedAgency(agency);
    setFormData({
      name: agency.name,
      code: agency.code,
      type: agency.type,
      description: agency.description || "",
      directorName: agency.directorName,
      directorNationalId: agency.directorNationalId,
      directorPhone: agency.directorPhone,
      directorEmail: agency.directorEmail,
      isActive: agency.isActive,
    });
    setIsEditModalOpen(true);
  };

  // Open Branches Modal
  const handleOpenBranches = async (agency: Organization) => {
    setSelectedAgency(agency);
    setIsBranchesModalOpen(true);
    setLoadingBranches(true);
    try {
      const branches = await adminService.getBranches(agency.id);
      setAgencyBranches(branches);
    } catch (err) {
      showNotification("error", "تعذر جلب فروع الهيئة.");
    } finally {
      setLoadingBranches(false);
    }
  };

  // Add Branch Submit
  const handleAddBranchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgency) return;
    if (!newBranchData.branchName.trim()) {
      alert("يرجى إدخال اسم الفرع");
      return;
    }

    try {
      const created = await adminService.createBranch({
        organizationId: selectedAgency.id,
        branchName: newBranchData.branchName,
        governorate: newBranchData.governorate,
        district: newBranchData.district || "المركز",
        phoneNumber: newBranchData.phoneNumber,
        managerName: newBranchData.managerName,
        isActive: true,
      });

      setAgencyBranches((prev) => [...prev, created]);
      // Update branch count on the agency
      setAgencies((prev) =>
        prev.map((item) =>
          item.id === selectedAgency.id
            ? { ...item, branchesCount: item.branchesCount + 1 }
            : item
        )
      );

      setNewBranchData({
        branchName: "",
        governorate: "أمانة العاصمة",
        district: "",
        phoneNumber: "",
        managerName: "",
      });

      showNotification("success", `تمت إضافة الفرع (${created.branchName}) بنجاح.`);
    } catch (err) {
      showNotification("error", "فشلت إضافة الفرع.");
    }
  };

  // Delete Branch Submit
  const handleDeleteBranch = async (branchId: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الفرع؟")) return;
    try {
      await adminService.deleteBranch(branchId);
      setAgencyBranches((prev) => prev.filter((b) => b.id !== branchId));
      if (selectedAgency) {
        setAgencies((prev) =>
          prev.map((item) =>
            item.id === selectedAgency.id
              ? { ...item, branchesCount: Math.max(0, item.branchesCount - 1) }
              : item
          )
        );
      }
      showNotification("info", "تم حذف الفرع.");
    } catch (err) {
      showNotification("error", "تعذر حذف الفرع.");
    }
  };

  // Submit Add Agency
  const handleAddAgencySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.code.trim()) {
      alert("يرجى ملء اسم الجهة ورمزها الرسمي.");
      return;
    }

    try {
      const created = await adminService.createOrganization(formData);
      setAgencies((prev) => [created, ...prev]);
      setIsAddModalOpen(false);
      setFormData({
        name: "",
        code: "",
        type: "civil",
        description: "",
        directorName: "",
        directorNationalId: "",
        directorPhone: "",
        directorEmail: "",
        isActive: true,
      });
      showNotification("success", `تمت إضافة الجهة (${created.name}) بنجاح.`);
    } catch (err) {
      showNotification("error", "تعذر إنشاء الجهة الجديدة.");
    }
  };

  // Submit Edit Agency
  const handleEditAgencySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgency) return;

    try {
      const updated = await adminService.updateOrganization(
        selectedAgency.id,
        formData
      );
      setAgencies((prev) =>
        prev.map((item) => (item.id === updated.id ? updated : item))
      );
      setIsEditModalOpen(false);
      showNotification("success", `تم تحديث بيانات (${updated.name}) بنجاح.`);
    } catch (err) {
      showNotification("error", "تعذر تحديث بيانات الجهة.");
    }
  };

  // Delete Agency Submit
  const handleDeleteAgencySubmit = async () => {
    if (!selectedAgency) return;
    try {
      await adminService.deleteOrganization(selectedAgency.id);
      setAgencies((prev) => prev.filter((item) => item.id !== selectedAgency.id));
      setIsDeleteModalOpen(false);
      showNotification("info", `تم حذف (${selectedAgency.name}) نهائياً من المنظومة.`);
    } catch (err) {
      showNotification("error", "تعذر حذف الجهة.");
    }
  };

  // Summary counts
  const totalAgencies = agencies.length;
  const activeAgencies = agencies.filter((a) => a.isActive).length;
  const totalBranches = agencies.reduce((acc, curr) => acc + curr.branchesCount, 0);

  return (
    <div className="p-6 md:p-10 max-w-[1400px] mx-auto">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed top-5 left-1/2 -translate-x-1/2 z-[999] px-6 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-white text-sm font-semibold transition-all ${
            notification.type === "success"
              ? "bg-[#005539] border border-emerald-400"
              : notification.type === "error"
              ? "bg-rose-700 border border-rose-400"
              : "bg-[#0b4f6c] border border-sky-400"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-300" />
          ) : (
            <AlertTriangle className="w-5 h-5 text-amber-300" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#00374e]"></span>
            <span className="text-xs font-bold text-[#00374e] uppercase tracking-wider">
              بوابة المشرف العام
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#00374e]">
            إدارة الهيئات والجهات الحكومية
          </h1>
          <p className="text-sm text-[#41484d] mt-1.5">
            التحكم المركزي في الجهات الرسمية، ربط الفروع بالمحافظات، وتحديث صلاحيات الربط البيني.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="bg-[#0b4f6c] hover:bg-[#00374e] text-white px-5 py-2.5 rounded-xl font-medium text-sm flex items-center gap-2 shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-5 h-5" />
            <span>إضافة جهة جديدة</span>
          </button>
        </div>
      </div>

      {/* Quick Summary KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border border-[#e0e3e5] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-[#41484d]">إجمالي الهيئات المسجلة</div>
            <div className="text-2xl font-black text-[#00374e] mt-1 font-mono">
              {totalAgencies} <span className="text-xs font-normal text-slate-500">جهة</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-[#c5e7ff]/40 text-[#0b4f6c] flex items-center justify-center">
            <Building2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e0e3e5] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-[#41484d]">الهيئات النشطة حالياً</div>
            <div className="text-2xl font-black text-emerald-700 mt-1 font-mono">
              {activeAgencies}{" "}
              <span className="text-xs font-normal text-slate-500">/ {totalAgencies}</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-[#e0e3e5] shadow-xs flex items-center justify-between">
          <div>
            <div className="text-xs text-[#41484d]">إجمالي الفروع بالمحافظات</div>
            <div className="text-2xl font-black text-[#0b4f6c] mt-1 font-mono">
              {totalBranches} <span className="text-xs font-normal text-slate-500">فرعاً</span>
            </div>
          </div>
          <div className="w-10 h-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
            <MapPin className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filters Card (Stitch Screen 09) */}
      <div className="bg-white rounded-xl border border-[#e0e3e5] p-5 mb-6 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Input */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#41484d]">بحث سريع</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute right-3.5 top-3 text-[#71787e]" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="البحث باسم الجهة، الرمز، أو المدير المسؤول..."
                className="w-full bg-[#f7f9fb] border border-[#c0c7ce] rounded-lg pr-10 pl-4 py-2 text-sm text-[#191c1e] placeholder:text-slate-400 focus:outline-none focus:border-[#0b4f6c] focus:ring-1 focus:ring-[#0b4f6c] transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute left-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
                >
                  مسح
                </button>
              )}
            </div>
          </div>

          {/* Type Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#41484d]">تصنيف الجهة</label>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full bg-[#f7f9fb] border border-[#c0c7ce] rounded-lg px-4 py-2 text-sm text-[#191c1e] focus:outline-none focus:border-[#0b4f6c] focus:ring-1 focus:ring-[#0b4f6c] cursor-pointer transition-all"
            >
              <option value="all">جميع التصنيفات</option>
              <option value="security">أمني / سيادي</option>
              <option value="civil">مدني / خدمي</option>
              <option value="health">صحي / مستشفيات</option>
              <option value="judicial">قضائي / توثيق</option>
              <option value="financial">مالي / ضرائب</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-[#41484d]">حالة النشاط</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full bg-[#f7f9fb] border border-[#c0c7ce] rounded-lg px-4 py-2 text-sm text-[#191c1e] focus:outline-none focus:border-[#0b4f6c] focus:ring-1 focus:ring-[#0b4f6c] cursor-pointer transition-all"
            >
              <option value="all">الكل (نشط وغير نشط)</option>
              <option value="active">نشط فقط</option>
              <option value="inactive">غير نشط / معطل</option>
            </select>
          </div>
        </div>
      </div>

      {/* Data Table Card (Stitch Screen 09 Exact Layout) */}
      <div className="bg-white rounded-xl border border-[#e0e3e5] shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <RefreshCw className="w-8 h-8 text-[#0b4f6c] animate-spin" />
            <div className="text-sm font-medium text-slate-500">جاري تحميل بيانات الهيئات...</div>
          </div>
        ) : agencies.length === 0 ? (
          <div className="py-16 text-center">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-700">لا توجد هيئات تطابق البحث</h3>
            <p className="text-xs text-slate-500 mt-1">
              جرب تغيير معايير البحث أو الفلاتر لعرض النتائج.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead className="bg-[#f0eadd]/60 border-b border-[#c0c7ce]/50">
                <tr>
                  <th className="py-4 px-6 text-xs font-bold text-[#00374e] whitespace-nowrap">
                    اسم الجهة الرسمية
                  </th>
                  <th className="py-4 px-6 text-xs font-bold text-[#00374e] whitespace-nowrap">
                    الرمز والتصنيف
                  </th>
                  <th className="py-4 px-6 text-xs font-bold text-[#00374e] whitespace-nowrap">
                    المدير المسؤول
                  </th>
                  <th className="py-4 px-6 text-xs font-bold text-[#00374e] whitespace-nowrap text-center">
                    الفروع بالمحافظات
                  </th>
                  <th className="py-4 px-6 text-xs font-bold text-[#00374e] whitespace-nowrap">
                    الحالة
                  </th>
                  <th className="py-4 px-6 text-xs font-bold text-[#00374e] whitespace-nowrap text-center">
                    إجراءات سريعة
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#e0e3e5]/70 text-sm">
                {agencies.map((agency) => (
                  <tr
                    key={agency.id}
                    className="hover:bg-[#f7f9fb] transition-colors group"
                  >
                    {/* Agency Name */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#c5e7ff] text-[#00374e] flex items-center justify-center flex-shrink-0 font-bold">
                          <Building2 className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-[#191c1e] text-sm group-hover:text-[#0b4f6c] transition-colors">
                            {agency.name}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5 line-clamp-1 max-w-[280px]">
                            {agency.description || "جهة حكومية مرتبطة بالسجل المركزي."}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Code & Type */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="font-mono text-xs font-bold text-[#0b4f6c] bg-[#c5e7ff]/30 px-2 py-0.5 rounded border border-[#97cdef]/40">
                          {agency.code}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          {agency.typeLabel}
                        </span>
                      </div>
                    </td>

                    {/* Director */}
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-semibold text-slate-800 text-xs">
                          {agency.directorName}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500 mt-0.5">
                          هاتف: {agency.directorPhone}
                        </div>
                      </div>
                    </td>

                    {/* Branches Button & Count */}
                    <td className="py-4 px-6 text-center">
                      <button
                        onClick={() => handleOpenBranches(agency)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#f2f4f6] hover:bg-[#e0e3e5] text-xs font-semibold text-[#00374e] transition-colors border border-slate-200"
                        title="عرض وإدارة فروع هذه الهيئة"
                      >
                        <MapPin className="w-3.5 h-3.5 text-[#0b4f6c]" />
                        <span className="font-mono font-bold">{agency.branchesCount}</span>
                        <span>فروع</span>
                      </button>
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-6">
                      <button
                        onClick={() => handleToggleStatus(agency)}
                        title="انقر لتغيير الحالة (تفعيل / تعطيل)"
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all hover:scale-105 active:scale-95 ${
                          agency.isActive
                            ? "bg-[#005539]/10 text-[#005539] border-[#005539]/20"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}
                      >
                        <span
                          className={`w-2 h-2 rounded-full ${
                            agency.isActive ? "bg-[#005539]" : "bg-rose-600"
                          }`}
                        ></span>
                        <span>{agency.isActive ? "نشط" : "غير نشط"}</span>
                      </button>
                    </td>

                    {/* Actions Menu */}
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {getPortalUrlForAgency(agency.code) && (
                          <button
                            onClick={() => {
                              updateSession({ loginSource: "super_admin_switch" });
                              router.push(getPortalUrlForAgency(agency.code)!);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#00374e] hover:bg-[#0b4f6c] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                            title={`الدخول المباشر إلى بوابة ${agency.name}`}
                          >
                            <ExternalLink className="w-3 h-3 text-[#8ac0e1]" />
                            <span>دخول البوابة</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenEdit(agency)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-[#0b4f6c] hover:bg-slate-100 transition-colors"
                          title="تعديل بيانات الجهة"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenBranches(agency)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
                          title="إدارة فروع الجهة"
                        >
                          <FolderGit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            setSelectedAgency(agency);
                            setIsDeleteModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="حذف الجهة"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer info */}
        <div className="p-4 border-t border-[#e0e3e5] bg-[#f7f9fb] flex flex-col sm:flex-row items-center justify-between text-xs text-[#41484d]">
          <span>
            عرض <strong className="font-mono">{agencies.length}</strong> من أصل{" "}
            <strong className="font-mono">{totalAgencies}</strong> جهة حكومية
          </span>
          <span className="text-[11px] text-slate-400 mt-2 sm:mt-0">
            تحديث فوري عبر Mock Store / ASP.NET Core API Service
          </span>
        </div>
      </div>

      {/* ======================= ADD AGENCY MODAL ======================= */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#c5e7ff] text-[#00374e] flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#00374e]">
                    إضافة جهة حكومية جديدة
                  </h3>
                  <p className="text-xs text-slate-500">
                    ربط هيئة أو مصلحة جديدة بالمنظومة الوطنية الموحدة.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddAgencySubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    اسم الجهة الرسمي *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="مثال: وزارة النقل والمواصلات"
                    className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0b4f6c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    كود الجهة (Code) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    placeholder="مثال: TRANSPORT"
                    className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg px-3 py-2 text-sm uppercase font-mono focus:outline-none focus:border-[#0b4f6c]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    تصنيف الهيئة *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as AgencyType })
                    }
                    className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0b4f6c]"
                  >
                    <option value="civil">مدني / خدمي</option>
                    <option value="security">أمني / سيادي</option>
                    <option value="health">صحي / مستشفيات</option>
                    <option value="judicial">قضائي / توثيق</option>
                    <option value="financial">مالي / ضرائب</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    اسم المدير المسؤول *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.directorName}
                    onChange={(e) =>
                      setFormData({ ...formData, directorName: e.target.value })
                    }
                    placeholder="مثال: اللواء الركن علي أحمد"
                    className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0b4f6c]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    الرقم الوطني للمدير
                  </label>
                  <input
                    type="text"
                    maxLength={11}
                    value={formData.directorNationalId}
                    onChange={(e) =>
                      setFormData({ ...formData, directorNationalId: e.target.value })
                    }
                    placeholder="010100xxxxx"
                    className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#0b4f6c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    رقم الهاتف الرسمي
                  </label>
                  <input
                    type="text"
                    value={formData.directorPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, directorPhone: e.target.value })
                    }
                    placeholder="+967 77xxxxxxx"
                    className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#0b4f6c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    value={formData.directorEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, directorEmail: e.target.value })
                    }
                    placeholder="info@agency.gov.ye"
                    className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0b4f6c]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  وصف المهام والمسؤوليات
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="موجز عن اختصاصات الهيئة وخدماتها..."
                  className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0b4f6c]"
                ></textarea>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="isActiveCheck"
                  checked={formData.isActive}
                  onChange={(e) =>
                    setFormData({ ...formData, isActive: e.target.checked })
                  }
                  className="w-4 h-4 text-[#0b4f6c] rounded border-slate-300 focus:ring-[#0b4f6c]"
                />
                <label
                  htmlFor="isActiveCheck"
                  className="text-xs font-medium text-slate-700 cursor-pointer"
                >
                  تفعيل نشاط الهيئة فور الإنشاء في المنظومة
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 text-sm font-medium hover:bg-slate-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-[#0b4f6c] hover:bg-[#00374e] text-white text-sm font-bold shadow-sm"
                >
                  حفظ وتسجيل الهيئة
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= EDIT AGENCY MODAL ======================= */}
      {isEditModalOpen && selectedAgency && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Edit2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#00374e]">
                    تعديل بيانات: {selectedAgency.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    تحديث بيانات الاتصال أو الإدارة الرسمية للجهة.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsEditModalOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditAgencySubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    اسم الجهة الرسمي *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0b4f6c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    كود الجهة (Code) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) =>
                      setFormData({ ...formData, code: e.target.value })
                    }
                    className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg px-3 py-2 text-sm uppercase font-mono focus:outline-none focus:border-[#0b4f6c]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    تصنيف الهيئة *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as AgencyType })
                    }
                    className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0b4f6c]"
                  >
                    <option value="civil">مدني / خدمي</option>
                    <option value="security">أمني / سيادي</option>
                    <option value="health">صحي / مستشفيات</option>
                    <option value="judicial">قضائي / توثيق</option>
                    <option value="financial">مالي / ضرائب</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    اسم المدير المسؤول *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.directorName}
                    onChange={(e) =>
                      setFormData({ ...formData, directorName: e.target.value })
                    }
                    className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0b4f6c]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    الرقم الوطني للمدير
                  </label>
                  <input
                    type="text"
                    maxLength={11}
                    value={formData.directorNationalId}
                    onChange={(e) =>
                      setFormData({ ...formData, directorNationalId: e.target.value })
                    }
                    className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#0b4f6c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    رقم الهاتف الرسمي
                  </label>
                  <input
                    type="text"
                    value={formData.directorPhone}
                    onChange={(e) =>
                      setFormData({ ...formData, directorPhone: e.target.value })
                    }
                    className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#0b4f6c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    البريد الإلكتروني
                  </label>
                  <input
                    type="email"
                    value={formData.directorEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, directorEmail: e.target.value })
                    }
                    className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0b4f6c]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  الوصف
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="w-full bg-[#f7f9fb] border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#0b4f6c]"
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 text-sm font-medium hover:bg-slate-50"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-[#0b4f6c] hover:bg-[#00374e] text-white text-sm font-bold shadow-sm"
                >
                  حفظ التعديلات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================= BRANCHES MODAL ======================= */}
      {isBranchesModalOpen && selectedAgency && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#c5e7ff] text-[#00374e] flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#00374e]">
                    فروع {selectedAgency.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    استعراض وإضافة مراكز المعالجة التابعة للهيئة في المحافظات.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsBranchesModalOpen(false)}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 flex-1 space-y-6">
              {/* Existing Branches List */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  الفروع الحالية المسجلة ({agencyBranches.length})
                </h4>

                {loadingBranches ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    جاري تحميل الفروع...
                  </div>
                ) : agencyBranches.length === 0 ? (
                  <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500 border border-dashed border-slate-200">
                    لا توجد فروع مسجلة لهذه الهيئة حتى الآن. يمكنك إضافة فرع جديد أدناه.
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                    {agencyBranches.map((branch) => (
                      <div
                        key={branch.id}
                        className="p-3 bg-[#f7f9fb] border border-slate-200 rounded-xl flex items-center justify-between hover:border-[#0b4f6c]/40 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center text-[#0b4f6c]">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-bold text-slate-800">
                              {branch.branchName}
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {branch.governorate} - {branch.district} | مدير الفرع: {branch.managerName || "غير محدد"}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs text-slate-500">
                            {branch.phoneNumber || "بدون هاتف"}
                          </span>
                          <button
                            onClick={() => handleDeleteBranch(branch.id)}
                            className="text-rose-500 hover:text-rose-700 p-1"
                            title="حذف هذا الفرع"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add New Branch Form */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
                <h4 className="text-xs font-bold text-[#00374e] mb-3 flex items-center gap-1.5">
                  <Plus className="w-4 h-4" />
                  <span>إضافة فرع جديد للهيئة</span>
                </h4>

                <form onSubmit={handleAddBranchSubmit} className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        اسم الفرع *
                      </label>
                      <input
                        type="text"
                        required
                        value={newBranchData.branchName}
                        onChange={(e) =>
                          setNewBranchData({
                            ...newBranchData,
                            branchName: e.target.value,
                          })
                        }
                        placeholder="مثال: فرع الصافية النموذجي"
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#0b4f6c]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        المحافظة *
                      </label>
                      <select
                        value={newBranchData.governorate}
                        onChange={(e) =>
                          setNewBranchData({
                            ...newBranchData,
                            governorate: e.target.value,
                          })
                        }
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#0b4f6c]"
                      >
                        <option value="أمانة العاصمة">أمانة العاصمة (صنعاء)</option>
                        <option value="عدن">عدن</option>
                        <option value="تعز">تعز</option>
                        <option value="حضرموت">حضرموت</option>
                        <option value="الحديدة">الحديدة</option>
                        <option value="إب">إب</option>
                        <option value="ذمار">ذمار</option>
                        <option value="مأرب">مأرب</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        المديرية
                      </label>
                      <input
                        type="text"
                        value={newBranchData.district}
                        onChange={(e) =>
                          setNewBranchData({
                            ...newBranchData,
                            district: e.target.value,
                          })
                        }
                        placeholder="معين، صيرة، المكلا..."
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#0b4f6c]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        مدير الفرع
                      </label>
                      <input
                        type="text"
                        value={newBranchData.managerName}
                        onChange={(e) =>
                          setNewBranchData({
                            ...newBranchData,
                            managerName: e.target.value,
                          })
                        }
                        placeholder="اسم المسؤول"
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#0b4f6c]"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                        هاتف الفرع
                      </label>
                      <input
                        type="text"
                        value={newBranchData.phoneNumber}
                        onChange={(e) =>
                          setNewBranchData({
                            ...newBranchData,
                            phoneNumber: e.target.value,
                          })
                        }
                        placeholder="+967 x xxxxxx"
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono focus:outline-none focus:border-[#0b4f6c]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="bg-[#0b4f6c] hover:bg-[#00374e] text-white px-4 py-1.5 rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>إضافة الفرع الآن</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setIsBranchesModalOpen(false)}
                className="px-5 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================= DELETE CONFIRM MODAL ======================= */}
      {isDeleteModalOpen && selectedAgency && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 text-center">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <h3 className="text-lg font-bold text-slate-800 mb-2">
              تأكيد حذف الجهة الحكومية
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              هل أنت متأكد من حذف جهة <strong>({selectedAgency.name})</strong> نهائياً من
              المنظومة المركزية؟ سيؤدي ذلك أيضاً إلى إزالة جميع الفروع وسجلات الربط
              التابعة لها.
            </p>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50"
              >
                إلغاء الأمر
              </button>
              <button
                onClick={handleDeleteAgencySubmit}
                className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-md shadow-rose-200"
              >
                نعم، احذف نهائياً
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
