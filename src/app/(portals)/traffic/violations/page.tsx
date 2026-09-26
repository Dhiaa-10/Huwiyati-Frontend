"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Car,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Filter,
  Download,
  CreditCard,
  User,
  MapPin,
  Calendar,
  X,
  Printer,
  ShieldCheck,
  FileText,
  DollarSign,
  AlertCircle,
  Eye,
  Camera,
} from "lucide-react";
import { trafficService } from "@/lib/api/trafficService";
import { Vehicle, TrafficViolation, RecordViolationDto } from "@/types/traffic";
import { useAuth } from "@/context/AuthContext";

function ViolationsContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const initialPlate = searchParams.get("plate") || "";

  const [searchQuery, setSearchQuery] = useState(initialPlate);
  const [activeFilter, setActiveFilter] = useState<"all" | "Unpaid" | "Paid">("all");
  const [violations, setViolations] = useState<TrafficViolation[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedViolationToPay, setSelectedViolationToPay] = useState<TrafficViolation | null>(null);
  const [paymentSuccessReceipt, setPaymentSuccessReceipt] = useState<TrafficViolation | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"ElectronicWallet" | "BankCard" | "BranchCash">("ElectronicWallet");

  // Form state for adding violation
  const [formData, setFormData] = useState({
    plateNumber: "",
    violationType: "تجاوز السرعة المقررة (10-20 كم/س)",
    fineAmount: 15000,
    violationTime: "14:30",
    location: "شارع الستين الغربي - تقاطع مذبح",
    governorate: "أمانة العاصمة",
    cameraRadarId: "RADAR-SNA-04",
    description: "رصد آلي عبر كاميرا السرعة - تجاوز بمقدار 25 كم/س",
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        const [viols, vechs] = await Promise.all([
          trafficService.getTrafficViolations(),
          trafficService.getVehicles(),
        ]);
        setViolations(viols);
        setVehicles(vechs);

        if (initialPlate) {
          const matched = vechs.find(
            (v) => v.plateNumber.toLowerCase() === initialPlate.toLowerCase()
          );
          if (matched) setSelectedVehicle(matched);
        } else if (vechs.length > 0) {
          setSelectedVehicle(vechs[0]);
        }
      } catch (err) {
        console.error("Error loading traffic data:", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, [initialPlate]);

  // Handle Search
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) {
      if (vehicles.length > 0) setSelectedVehicle(vehicles[0]);
      return;
    }

    const q = searchQuery.trim().toLowerCase();
    const foundVehicle = vehicles.find(
      (v) =>
        v.plateNumber.toLowerCase().includes(q) ||
        v.chassisNumber.toLowerCase().includes(q) ||
        v.currentOwnerNationalId.includes(q) ||
        v.currentOwnerFullName.toLowerCase().includes(q)
    );

    if (foundVehicle) {
      setSelectedVehicle(foundVehicle);
    } else {
      const foundViol = violations.find((v) => v.plateNumber.toLowerCase().includes(q));
      if (foundViol) {
        const matchingV = vehicles.find((v) => v.plateNumber === foundViol.plateNumber);
        if (matchingV) setSelectedVehicle(matchingV);
      }
    }
  };

  const currentVehicleViolations = selectedVehicle
    ? violations.filter((v) => v.plateNumber === selectedVehicle.plateNumber)
    : violations;

  const displayViolations = currentVehicleViolations.filter((v) => {
    if (activeFilter === "all") return true;
    return v.paymentStatus === activeFilter;
  });

  const unpaidCount = currentVehicleViolations.filter((v) => v.paymentStatus === "Unpaid").length;
  const totalUnpaidAmount = currentVehicleViolations
    .filter((v) => v.paymentStatus === "Unpaid")
    .reduce((acc, curr) => acc + curr.fineAmount, 0);

  const violationPresets: { [key: string]: number } = {
    "تجاوز السرعة المقررة (10-20 كم/س)": 15000,
    "قطع الإشارة الضوئية الحمراء": 30000,
    "الوقوف الممنوع وعرقلة السير": 10000,
    "استخدام الهاتف النقال أثناء القيادة": 12000,
    "عدم ربط حزام الأمان": 8000,
    "عكس اتجاه السير": 25000,
    "قيادة مركبة بدون رخصة سارية": 20000,
  };

  const handleViolationTypeChange = (type: string) => {
    setFormData((prev) => ({
      ...prev,
      violationType: type,
      fineAmount: violationPresets[type] || 10000,
    }));
  };

  const handleCreateViolation = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const targetPlate = selectedVehicle?.plateNumber || formData.plateNumber;
      const newV = await trafficService.recordTrafficViolation({
        plateNumber: targetPlate,
        violationType: formData.violationType,
        fineAmount: Number(formData.fineAmount),
        violationTime: formData.violationTime,
        location: formData.location,
        governorate: formData.governorate,
        cameraRadarId: formData.cameraRadarId,
        description: formData.description,
        recordedByOfficerName: user?.fullName || "المساعد نشوان عادل الوجيه",
      });

      setViolations((prev) => [newV, ...prev]);
      setIsAddModalOpen(false);
      alert("تم قيد المخالفة بنجاح وتوثيقها في سجلات الرقابة المركزية وإشعار مالك المركبة.");
    } catch (err) {
      console.error("Failed to record violation:", err);
      alert("حدث خطأ أثناء قيد المخالفة.");
    } finally {
      setSubmitting(false);
    }
  };

  const handlePayViolation = async () => {
    if (!selectedViolationToPay) return;
    setSubmitting(true);
    try {
      const updated = await trafficService.payTrafficViolation({
        violationId: selectedViolationToPay.id,
        paymentMethod,
        referenceNumber: `PAY-TRF-${Date.now().toString().slice(-6)}`,
      });

      setViolations((prev) =>
        prev.map((v) => (v.id === updated.id ? updated : v))
      );
      setPaymentSuccessReceipt(updated);
      setIsPayModalOpen(false);
    } catch (err) {
      console.error("Failed to settle violation:", err);
      alert("حدث خطأ أثناء إتمام عملية السداد.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-error/10 text-error border border-error/20 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-error" />
              الضبط والتحصيل المروري الموحد
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary font-headline-lg">
            إدارة المركبات والمخالفات المرورية
          </h1>
          <p className="text-secondary text-sm md:text-base mt-1">
            الاستعلام السريع عن بيانات المركبات، قيد المخالفات الميدانية والرادارية، وتسوية السداد إلكترونياً
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (selectedVehicle) {
                setFormData((prev) => ({ ...prev, plateNumber: selectedVehicle.plateNumber }));
              }
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2.5 bg-error hover:bg-error/90 text-white rounded-lg text-sm font-semibold shadow-sm transition-all flex items-center gap-2 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            تسجيل مخالفة جديدة
          </button>
        </div>
      </div>

      {/* Main Search Hero (Matching Stitch Screen 06) */}
      <div className="bg-gradient-to-r from-surface-container-lowest to-surface-container-low rounded-xl p-6 md:p-8 shadow-sm border border-outline-variant/30 text-center relative overflow-hidden">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-xl md:text-2xl font-bold text-primary mb-2">
            البحث عن مركبة أو سجل مخالفات
          </h2>
          <p className="text-secondary text-sm mb-6">
            أدخل رقم اللوحة، رقم القاعدة (الشاصيه)، أو الرقم الوطني للمالك للاستعلام الفوري
          </p>

          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3 justify-center">
            <div className="relative flex-1">
              <Car className="w-5 h-5 absolute right-4 top-1/2 -translate-y-1/2 text-secondary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="مثال: 1/14285 أو 01010000001 أو تويوتا"
                className="w-full bg-white border border-outline-variant rounded-lg py-3 pr-12 pl-4 text-sm md:text-base text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary shadow-sm"
              />
            </div>
            <button
              type="submit"
              className="bg-primary hover:bg-primary-container text-white font-semibold px-8 py-3 rounded-lg shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              بحث فوري
            </button>
          </form>

          {/* Quick Select from existing mock vehicles */}
          <div className="flex items-center justify-center gap-2 mt-4 flex-wrap text-xs text-secondary">
            <span>مركبات نموذجية للتجربة:</span>
            {vehicles.map((v) => (
              <button
                key={v.id}
                onClick={() => {
                  setSelectedVehicle(v);
                  setSearchQuery(v.plateNumber);
                }}
                className={`px-2.5 py-1 rounded-full border transition-all ${
                  selectedVehicle?.id === v.id
                    ? "bg-primary text-white border-primary font-bold"
                    : "bg-white border-outline-variant hover:border-primary text-primary"
                }`}
              >
                {v.plateNumber} ({v.model})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Vehicle Details & Actions (Matching Stitch Screen 06 & 04) */}
      {selectedVehicle && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Vehicle Info Card (8 cols) */}
          <div className="lg:col-span-8 bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_20px_rgba(11,79,108,0.05)] border border-outline-variant/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-2 h-full bg-primary-container"></div>
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-xl font-bold text-primary flex items-center gap-2">
                  <Car className="w-6 h-6 text-primary-container" />
                  بيانات ورخصة سير المركبة
                </h3>
                <p className="text-xs text-secondary mt-0.5">
                  رقم الشاصيه: <span className="font-mono font-semibold text-on-surface">{selectedVehicle.chassisNumber}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-tertiary-container/10 text-tertiary-container text-xs font-semibold rounded-full border border-tertiary-container/20">
                  {selectedVehicle.status === "Active" ? "ترخيص سارٍ" : "منتهي الصلاحية"}
                </span>
                <span className="px-3 py-1 bg-surface-container text-secondary text-xs font-semibold rounded-full border border-outline-variant">
                  {selectedVehicle.vehicleTypeLabel || selectedVehicle.vehicleType}
                </span>
              </div>
            </div>

            {/* Spec details grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-surface-container-low/40 border border-outline-variant/20 mb-6">
              <div>
                <span className="block text-xs text-secondary mb-1">الماركة والموديل</span>
                <span className="block font-bold text-sm md:text-base text-primary">
                  {selectedVehicle.manufacturer} {selectedVehicle.model}
                </span>
              </div>
              <div>
                <span className="block text-xs text-secondary mb-1">سنة الصنع</span>
                <span className="block font-bold text-sm md:text-base text-on-surface font-mono">
                  {selectedVehicle.manufactureYear}
                </span>
              </div>
              <div>
                <span className="block text-xs text-secondary mb-1">رقم اللوحة</span>
                <div className="inline-flex items-center gap-2 bg-white px-3 py-1 rounded border border-primary/40 shadow-xs">
                  <span className="font-bold text-primary font-mono tracking-wider text-sm">
                    {selectedVehicle.plateNumber}
                  </span>
                </div>
              </div>
              <div>
                <span className="block text-xs text-secondary mb-1">اللون والمحافظة</span>
                <span className="block font-bold text-sm text-on-surface">
                  {selectedVehicle.color} - {selectedVehicle.plateGovernorate}
                </span>
              </div>
            </div>

            {/* Registered Owner Box */}
            <div className="bg-surface-container-low p-4 rounded-lg border border-outline-variant/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <span className="block text-xs text-secondary">المالك المسجل (هوية وطنية موثقة)</span>
                  <span className="block font-bold text-base text-primary">
                    {selectedVehicle.currentOwnerFullName}
                  </span>
                  <span className="block font-mono text-xs text-secondary">
                    الرقم الوطني: {selectedVehicle.currentOwnerNationalId}
                  </span>
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs text-secondary block">تاريخ انتهاء الترخيص الدوري</span>
                <span className="text-xs font-mono font-semibold text-on-surface">
                  {selectedVehicle.licenseExpiryDate}
                </span>
              </div>
            </div>
          </div>

          {/* Action & Fines Summary Card (4 cols) */}
          <div className="lg:col-span-4 bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_20px_rgba(11,79,108,0.05)] border border-outline-variant/30 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-primary flex items-center gap-2 text-base">
                  <DollarSign className="w-5 h-5 text-error" />
                  المستحقات والغرامات
                </h4>
                <span className="text-xs font-bold text-error bg-error/10 px-2 py-0.5 rounded-full">
                  {unpaidCount} غير مسددة
                </span>
              </div>

              <div className="p-4 rounded-lg bg-error-container/10 border border-error/20 mb-4 text-center">
                <span className="text-xs text-secondary block mb-1">إجمالي الغرامات غير المسددة</span>
                <div className="text-3xl font-bold font-mono text-error">
                  {totalUnpaidAmount.toLocaleString("ar-YE")}{" "}
                  <span className="text-sm font-normal text-secondary">ريال يمني</span>
                </div>
              </div>

              <div className="space-y-2 text-xs text-secondary mb-6">
                <div className="flex justify-between">
                  <span>إجمالي المخالفات المسجلة:</span>
                  <span className="font-bold text-on-surface">{currentVehicleViolations.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>المخالفات المسددة:</span>
                  <span className="font-bold text-tertiary">
                    {currentVehicleViolations.filter((v) => v.paymentStatus === "Paid").length}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  setFormData((prev) => ({ ...prev, plateNumber: selectedVehicle.plateNumber }));
                  setIsAddModalOpen(true);
                }}
                className="w-full bg-error hover:bg-error/90 text-white font-semibold py-2.5 rounded-lg shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2 text-sm"
              >
                <Plus className="w-4 h-4" />
                قيد مخالفة على هذه المركبة
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Violations Table (Matching Stitch Screen 04) */}
      <div className="bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(11,79,108,0.05)] border border-outline-variant/30 overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-5 border-b border-outline-variant/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-surface-container-low/40">
          <div>
            <h3 className="text-lg font-bold text-primary flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary-container" />
              سجل المخالفات المرورية المسجلة
            </h3>
            <p className="text-xs text-secondary mt-0.5">
              {selectedVehicle
                ? `المخالفات الخاصة بالمركبة: ${selectedVehicle.plateNumber}`
                : "جميع المخالفات المرصودة بالنظام"}
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex items-center gap-2">
            <div className="flex bg-surface-container p-1 rounded-lg border border-outline-variant text-xs">
              <button
                onClick={() => setActiveFilter("all")}
                className={`px-3 py-1 rounded-md transition-all font-semibold ${
                  activeFilter === "all" ? "bg-white text-primary shadow-xs" : "text-secondary"
                }`}
              >
                الكل ({currentVehicleViolations.length})
              </button>
              <button
                onClick={() => setActiveFilter("Unpaid")}
                className={`px-3 py-1 rounded-md transition-all font-semibold ${
                  activeFilter === "Unpaid" ? "bg-white text-error shadow-xs" : "text-secondary"
                }`}
              >
                غير مسدد ({unpaidCount})
              </button>
              <button
                onClick={() => setActiveFilter("Paid")}
                className={`px-3 py-1 rounded-md transition-all font-semibold ${
                  activeFilter === "Paid" ? "bg-white text-tertiary shadow-xs" : "text-secondary"
                }`}
              >
                مسدد ({currentVehicleViolations.length - unpaidCount})
              </button>
            </div>
          </div>
        </div>

        {/* Violations Table List */}
        <div className="overflow-x-auto">
          <table className="w-full text-right border-collapse text-xs md:text-sm">
            <thead>
              <tr className="bg-surface-container text-secondary border-b border-outline-variant/40 font-semibold">
                <th className="py-3.5 px-5">رقم المخالفة</th>
                <th className="py-3.5 px-5">نوع المخالفة</th>
                <th className="py-3.5 px-5">التاريخ والوقت</th>
                <th className="py-3.5 px-5">الموقع</th>
                <th className="py-3.5 px-5">المبلغ (ريال)</th>
                <th className="py-3.5 px-5">الرادار / الراصد</th>
                <th className="py-3.5 px-5">الحالة</th>
                <th className="py-3.5 px-5 text-center">الإجراء</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/20 font-body-sm text-on-surface">
              {displayViolations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-secondary">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <CheckCircle2 className="w-8 h-8 text-tertiary" />
                      <p className="font-semibold text-base">لا توجد مخالفات مسجلة لهذه المركبة بهذا الفلتر</p>
                      <p className="text-xs">سجل المركبة نظيف وممتثل لكافة القواعد واللوائح المرورية.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                displayViolations.map((v) => (
                  <tr key={v.id} className="hover:bg-surface-container-lowest transition-colors">
                    <td className="py-4 px-5 font-mono text-xs font-bold text-secondary">
                      #{v.id.slice(0, 8)}
                    </td>
                    <td className="py-4 px-5">
                      <div className="font-semibold text-primary flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        {v.violationType}
                      </div>
                      {v.description && (
                        <div className="text-[11px] text-secondary mt-0.5">{v.description}</div>
                      )}
                    </td>
                    <td className="py-4 px-5 font-mono text-xs tabular-nums text-secondary">
                      {v.violationDate} <br />
                      <span className="text-[11px] text-outline">{v.violationTime}</span>
                    </td>
                    <td className="py-4 px-5 text-xs text-secondary">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-secondary" />
                        <span>{v.location}</span>
                      </div>
                      <span className="text-[11px] text-on-surface font-semibold">{v.governorate}</span>
                    </td>
                    <td className="py-4 px-5 font-bold font-mono text-on-surface">
                      <span className={v.paymentStatus === "Paid" ? "line-through text-secondary" : "text-error"}>
                        {v.fineAmount.toLocaleString("ar-YE")}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-xs">
                      <span className="font-mono text-[11px] text-secondary block">{v.cameraRadarId || "دورية"}</span>
                      <span className="text-[11px] text-on-surface">{v.recordedByOfficerName}</span>
                    </td>
                    <td className="py-4 px-5">
                      {v.paymentStatus === "Paid" ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-tertiary-container/10 text-tertiary-container border border-tertiary-container/20">
                          <CheckCircle2 className="w-3 h-3" />
                          مسدد
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-error/10 text-error border border-error/20">
                          <Clock className="w-3 h-3" />
                          غير مسدد
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-5 text-center">
                      {v.paymentStatus === "Unpaid" ? (
                        <button
                          onClick={() => {
                            setSelectedViolationToPay(v);
                            setIsPayModalOpen(true);
                          }}
                          className="px-3.5 py-1.5 bg-primary-container hover:bg-primary text-white text-xs font-semibold rounded-md shadow-sm transition-all active:scale-95"
                        >
                          تأكيد السداد
                        </button>
                      ) : (
                        <button
                          onClick={() => setPaymentSuccessReceipt(v)}
                          className="px-3 py-1 bg-surface border border-outline-variant hover:bg-surface-container text-xs font-semibold rounded-md text-primary transition-all flex items-center gap-1 mx-auto"
                        >
                          <Printer className="w-3 h-3" />
                          الإيصال
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal 1: Add Violation Modal (Screen 06) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-outline-variant max-w-lg w-full overflow-hidden">
            <div className="bg-error text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-lg">قيد مخالفة مرورية جديدة</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateViolation} className="p-6 space-y-4 text-sm max-h-[80vh] overflow-y-auto">
              <div className="p-3 bg-surface-container rounded-lg border border-outline-variant/40 flex items-center justify-between">
                <span className="text-secondary text-xs">المركبة المستهدفة:</span>
                <span className="font-mono font-bold text-primary bg-white px-3 py-1 rounded border border-outline-variant">
                  {selectedVehicle?.plateNumber || formData.plateNumber || "1/14285"}
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-primary mb-1">نوع المخالفة</label>
                <select
                  value={formData.violationType}
                  onChange={(e) => handleViolationTypeChange(e.target.value)}
                  className="w-full bg-surface border border-outline-variant rounded-lg p-2.5 text-xs text-on-surface focus:ring-1 focus:ring-primary outline-none"
                >
                  {Object.keys(violationPresets).map((t) => (
                    <option key={t} value={t}>
                      {t} ({violationPresets[t].toLocaleString("ar-YE")} ريال)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-primary mb-1">الغرامة المقررة (ريال)</label>
                  <input
                    type="number"
                    value={formData.fineAmount}
                    onChange={(e) => setFormData((prev) => ({ ...prev, fineAmount: Number(e.target.value) }))}
                    className="w-full bg-surface border border-outline-variant rounded-lg p-2 text-xs font-mono font-bold text-error outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary mb-1">توقيت الرصد</label>
                  <input
                    type="text"
                    value={formData.violationTime}
                    onChange={(e) => setFormData((prev) => ({ ...prev, violationTime: e.target.value }))}
                    className="w-full bg-surface border border-outline-variant rounded-lg p-2 text-xs font-mono outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-primary mb-1">الموقع والشارع</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData((prev) => ({ ...prev, location: e.target.value }))}
                    className="w-full bg-surface border border-outline-variant rounded-lg p-2 text-xs outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary mb-1">المحافظة</label>
                  <select
                    value={formData.governorate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, governorate: e.target.value }))}
                    className="w-full bg-surface border border-outline-variant rounded-lg p-2 text-xs outline-none"
                  >
                    <option value="أمانة العاصمة">أمانة العاصمة</option>
                    <option value="عدن">عدن</option>
                    <option value="تعز">تعز</option>
                    <option value="الحديدة">الحديدة</option>
                    <option value="إب">إب</option>
                    <option value="حضرموت">حضرموت</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-primary mb-1">معرّف الرادار أو رقم الدورية</label>
                <input
                  type="text"
                  value={formData.cameraRadarId}
                  onChange={(e) => setFormData((prev) => ({ ...prev, cameraRadarId: e.target.value }))}
                  className="w-full bg-surface border border-outline-variant rounded-lg p-2 text-xs font-mono outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-primary mb-1">ملاحظات إضافية وتوثيق الضبط</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-surface border border-outline-variant rounded-lg p-2 text-xs outline-none"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-outline-variant rounded-lg text-xs font-semibold text-secondary hover:bg-surface-container"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-error hover:bg-error/90 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                >
                  {submitting ? "جارِ الحفظ..." : "حفظ وقيد المخالفة"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Pay Violation Modal (Screen 04) */}
      {isPayModalOpen && selectedViolationToPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-outline-variant max-w-md w-full overflow-hidden">
            <div className="bg-primary text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                <h3 className="font-bold text-lg">سداد وتسوية المخالفة</h3>
              </div>
              <button
                onClick={() => setIsPayModalOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className="bg-surface-container p-4 rounded-xl space-y-2">
                <div className="flex justify-between text-xs text-secondary">
                  <span>رقم المخالفة:</span>
                  <span className="font-mono font-bold text-primary">#{selectedViolationToPay.id.slice(0, 8)}</span>
                </div>
                <div className="flex justify-between text-xs text-secondary">
                  <span>نوع المخالفة:</span>
                  <span className="font-semibold text-on-surface">{selectedViolationToPay.violationType}</span>
                </div>
                <div className="flex justify-between text-xs text-secondary">
                  <span>لوحة المركبة:</span>
                  <span className="font-mono font-bold text-on-surface">{selectedViolationToPay.plateNumber}</span>
                </div>
                <div className="border-t border-outline-variant/40 pt-2 flex justify-between items-center">
                  <span className="font-bold text-primary">إجمالي المبلغ المطلوب:</span>
                  <span className="text-xl font-bold font-mono text-error">
                    {selectedViolationToPay.fineAmount.toLocaleString("ar-YE")} ريال
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-primary mb-2">طريقة السداد المعتمدة</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3 p-3 border border-outline-variant rounded-lg cursor-pointer hover:bg-surface-container">
                    <input
                      type="radio"
                      name="payMethod"
                      value="ElectronicWallet"
                      checked={paymentMethod === "ElectronicWallet"}
                      onChange={() => setPaymentMethod("ElectronicWallet")}
                      className="text-primary"
                    />
                    <span className="font-semibold text-xs text-primary">محفظة "هوية باي" الرقمية (خصم مباشر فوري)</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-outline-variant rounded-lg cursor-pointer hover:bg-surface-container">
                    <input
                      type="radio"
                      name="payMethod"
                      value="BankCard"
                      checked={paymentMethod === "BankCard"}
                      onChange={() => setPaymentMethod("BankCard")}
                      className="text-primary"
                    />
                    <span className="font-semibold text-xs text-on-surface">بطاقة بنكية / بطاقة ائتمان</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border border-outline-variant rounded-lg cursor-pointer hover:bg-surface-container">
                    <input
                      type="radio"
                      name="payMethod"
                      value="BranchCash"
                      checked={paymentMethod === "BranchCash"}
                      onChange={() => setPaymentMethod("BranchCash")}
                      className="text-primary"
                    />
                    <span className="font-semibold text-xs text-on-surface">تحصيل نقدي عبر شباك الفرع</span>
                  </label>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-surface-container-low text-xs text-secondary flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-tertiary shrink-0" />
                <span>الضابط المسؤول عن التسوية: {user?.fullName || "المساعد نشوان عادل الوجيه"}</span>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsPayModalOpen(false)}
                  className="px-4 py-2 border border-outline-variant rounded-lg text-xs font-semibold text-secondary hover:bg-surface-container"
                >
                  إلغاء
                </button>
                <button
                  onClick={handlePayViolation}
                  disabled={submitting}
                  className="px-6 py-2 bg-primary-container hover:bg-primary text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {submitting ? "جارِ التأكيد..." : "تأكيد واستلام السداد"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 3: Payment Receipt View */}
      {paymentSuccessReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-outline-variant max-w-md w-full overflow-hidden">
            <div className="bg-tertiary-container text-white p-5 text-center relative">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2 text-white" />
              <h3 className="font-bold text-lg">إيصال سداد مخالفة إلكتروني رسمي</h3>
              <p className="text-xs text-white/80">وزارة الداخلية - الإدارة العامة للمرور</p>
              <button
                onClick={() => setPaymentSuccessReceipt(null)}
                className="absolute left-4 top-4 p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-white" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm font-body-md">
              <div className="border border-outline-variant rounded-xl p-4 space-y-2.5 bg-surface-container-low/30">
                <div className="flex justify-between text-xs text-secondary">
                  <span>الرقم المرجعي للإيصال:</span>
                  <span className="font-mono font-bold text-primary">{paymentSuccessReceipt.paymentReference}</span>
                </div>
                <div className="flex justify-between text-xs text-secondary">
                  <span>رقم المخالفة:</span>
                  <span className="font-mono font-bold text-on-surface">#{paymentSuccessReceipt.id.slice(0, 8)}</span>
                </div>
                <div className="flex justify-between text-xs text-secondary">
                  <span>رقم اللوحة:</span>
                  <span className="font-mono font-bold text-on-surface">{paymentSuccessReceipt.plateNumber}</span>
                </div>
                <div className="flex justify-between text-xs text-secondary">
                  <span>نوع المخالفة:</span>
                  <span className="font-semibold text-on-surface">{paymentSuccessReceipt.violationType}</span>
                </div>
                <div className="flex justify-between text-xs text-secondary">
                  <span>تاريخ وتوقيت السداد:</span>
                  <span className="font-mono text-on-surface">{new Date().toLocaleString("ar-YE")}</span>
                </div>
                <div className="border-t border-outline-variant pt-2 flex justify-between items-center">
                  <span className="font-bold text-primary">المبلغ المسدد:</span>
                  <span className="text-xl font-bold font-mono text-tertiary">
                    {paymentSuccessReceipt.fineAmount.toLocaleString("ar-YE")} ريال
                  </span>
                </div>
              </div>

              <div className="text-center text-xs text-secondary space-y-1">
                <p>هذا المستند صادر إلكترونياً من بوابة هويتي الحكومية الموحدة ولا يحتاج لختم خطي.</p>
                <p className="font-mono text-[10px] text-outline">HASH: {paymentSuccessReceipt.id}-VERIFIED</p>
              </div>

              <div className="pt-2 flex items-center justify-center gap-3">
                <button
                  onClick={() => window.print()}
                  className="px-5 py-2.5 bg-primary text-white rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-primary-container transition-all"
                >
                  <Printer className="w-4 h-4" />
                  طباعة الإيصال
                </button>
                <button
                  onClick={() => setPaymentSuccessReceipt(null)}
                  className="px-5 py-2.5 border border-outline-variant rounded-lg text-xs font-semibold text-secondary hover:bg-surface-container"
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

export default function ViolationsPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500">جاري التحميل...</div>}>
      <ViolationsContent />
    </Suspense>
  );
}
