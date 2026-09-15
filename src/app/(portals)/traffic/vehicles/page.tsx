"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Car,
  Search,
  Plus,
  ShieldCheck,
  User,
  MapPin,
  Calendar,
  CreditCard,
  Printer,
  X,
  FileCheck2,
  AlertCircle,
  Eye,
  CheckCircle2,
  Sparkles,
  QrCode,
  Gauge,
} from "lucide-react";
import { trafficService } from "@/lib/api/trafficService";
import { Vehicle, VehicleType, RegisterVehicleDto } from "@/types/traffic";
import { civilRegistryService } from "@/lib/api/civilRegistryService";
import { useAuth } from "@/context/AuthContext";

export default function VehiclesDirectoryPage() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [governorateFilter, setGovernorateFilter] = useState("all");

  // Selected vehicle for electronic title card
  const [viewingVehicleCard, setViewingVehicleCard] = useState<Vehicle | null>(null);

  // New vehicle registration modal
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [formData, setFormData] = useState<RegisterVehicleDto>({
    plateNumber: "1/48921",
    plateGovernorate: "أمانة العاصمة",
    chassisNumber: "JTEBX21J7NK082914",
    engineNumber: "1GR-FE883921",
    vehicleType: "SUV",
    manufacturer: "تويوتا",
    model: "لاندكروزر برادو",
    manufactureYear: 2023,
    color: "أبيض لؤلؤي",
    ownerNationalNumber: "01010000001",
    issuingBranchId: "22222222-bbbb-cccc-dddd-000000000004",
  });
  const [ownerNameDisplay, setOwnerNameDisplay] = useState("هشام عبدالله عبدالرحمن الأغبري");
  const [registering, setRegistering] = useState(false);

  useEffect(() => {
    async function loadVehicles() {
      try {
        const list = await trafficService.getVehicles();
        setVehicles(list);
      } catch (err) {
        console.error("Failed to load vehicles:", err);
      } finally {
        setLoading(false);
      }
    }
    loadVehicles();
  }, []);

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegistering(true);
    try {
      const created = await trafficService.registerVehicle(formData);
      setVehicles((prev) => [created, ...prev]);
      setIsRegisterModalOpen(false);
      setViewingVehicleCard(created);
      alert(`تم تسجيل المركبة بنجاح وإصدار كرت الملكية الإلكتروني برقم لوحة: ${created.plateNumber}`);
    } catch (err) {
      console.error("Failed to register vehicle:", err);
      alert("حدث خطأ أثناء تسجيل المركبة.");
    } finally {
      setRegistering(false);
    }
  };

  const filteredVehicles = vehicles.filter((v) => {
    const q = searchQuery.toLowerCase();
    const matchQuery =
      v.plateNumber.toLowerCase().includes(q) ||
      v.manufacturer.toLowerCase().includes(q) ||
      v.model.toLowerCase().includes(q) ||
      v.chassisNumber.toLowerCase().includes(q) ||
      v.currentOwnerFullName.toLowerCase().includes(q) ||
      v.currentOwnerNationalId.includes(q);

    if (!matchQuery) return false;
    if (governorateFilter !== "all" && v.plateGovernorate !== governorateFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/30 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-primary" />
              السجل الوطني المركزي للمركبات
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary font-headline-lg">
            سجل المركبات وإثبات الملكيات
          </h1>
          <p className="text-secondary text-sm">
            إدارة بيانات المركبات، نقل وتثبيت الملكيات، الفحص الفني الدوري، وإصدار كروت الملكية الإلكترونية
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsRegisterModalOpen(true)}
            className="px-4 py-2.5 bg-[#00374e] hover:bg-[#0b4f6c] text-white rounded-lg text-sm font-semibold shadow-sm transition-all flex items-center gap-2 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            تسجيل مركبة جديدة
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-surface-container-lowest rounded-xl p-4 shadow-[0_4px_20px_rgba(11,79,108,0.05)] border border-outline-variant/30 flex flex-col sm:flex-row gap-4 justify-between items-center">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-secondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="بحث برقم اللوحة، رقم الشاصيه، اسم المالك، أو الرقم الوطني..."
            className="w-full bg-surface border border-outline-variant rounded-lg pr-9 pl-4 py-2.5 text-sm text-on-surface focus:outline-none focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={governorateFilter}
            onChange={(e) => setGovernorateFilter(e.target.value)}
            className="bg-surface border border-outline-variant rounded-lg px-3 py-2.5 text-xs font-semibold text-on-surface focus:outline-none focus:border-primary"
          >
            <option value="all">جميع المحافظات</option>
            <option value="أمانة العاصمة">أمانة العاصمة</option>
            <option value="عدن">عدن</option>
            <option value="تعز">تعز</option>
            <option value="حضرموت">حضرموت</option>
            <option value="الحديدة">الحديدة</option>
          </select>

          <span className="text-xs text-secondary font-mono whitespace-nowrap">
            العدد: {filteredVehicles.length} مركبة
          </span>
        </div>
      </div>

      {/* Vehicles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className="bg-surface-container-lowest rounded-2xl p-5 shadow-[0_4px_20px_rgba(11,79,108,0.05)] border border-outline-variant/30 hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Card top banner */}
              <div className="flex justify-between items-start mb-4">
                <div className="inline-flex items-center gap-2 bg-surface-container px-3 py-1.5 rounded-lg border border-primary/30">
                  <span className="font-mono font-bold text-sm text-primary tracking-wider">
                    {vehicle.plateNumber}
                  </span>
                  <span className="text-[11px] font-semibold text-secondary">({vehicle.plateGovernorate})</span>
                </div>

                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-tertiary-container/10 text-tertiary-container border border-tertiary-container/20">
                  {vehicle.status === "Active" ? "سارية المفعول" : "منتهية"}
                </span>
              </div>

              {/* Vehicle Title & Model */}
              <h3 className="text-base font-bold text-primary mb-1">
                {vehicle.manufacturer} {vehicle.model}
              </h3>
              <p className="text-xs text-secondary mb-4 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                موديل سنة: <span className="font-mono font-semibold text-on-surface">{vehicle.manufactureYear}</span> | اللون: {vehicle.color}
              </p>

              {/* Technical specs */}
              <div className="bg-surface-container-low/50 p-3 rounded-xl border border-outline-variant/20 space-y-2 text-xs mb-4">
                <div className="flex justify-between">
                  <span className="text-secondary">رقم القاعدة (الشاصيه):</span>
                  <span className="font-mono text-on-surface font-semibold text-[11px]">{vehicle.chassisNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">فئة ونوع المركبة:</span>
                  <span className="font-semibold text-primary">{vehicle.vehicleTypeLabel || vehicle.vehicleType}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">انتهاء رخصة السير:</span>
                  <span className="font-mono text-on-surface">{vehicle.licenseExpiryDate}</span>
                </div>
              </div>

              {/* Owner info */}
              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-surface border border-outline-variant/20 mb-4">
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <span className="text-[11px] text-secondary block">المالك المسجل:</span>
                  <span className="font-bold text-xs text-primary truncate block">{vehicle.currentOwnerFullName}</span>
                  <span className="text-[10px] font-mono text-secondary">ID: {vehicle.currentOwnerNationalId}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 pt-3 border-t border-outline-variant/30">
              <button
                onClick={() => setViewingVehicleCard(vehicle)}
                className="flex-1 py-2 bg-primary-container hover:bg-primary text-white text-xs font-semibold rounded-lg shadow-sm transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <CreditCard className="w-3.5 h-3.5" />
                كرت الملكية الإلكتروني
              </button>

              <Link
                href={`/traffic/violations?plate=${encodeURIComponent(vehicle.plateNumber)}`}
                className="px-3 py-2 bg-surface hover:bg-surface-container border border-outline-variant text-primary text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                title="سجل المخالفات"
              >
                <Eye className="w-3.5 h-3.5" />
                المخالفات
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Modal 1: Electronic Vehicle Ownership Card (كرت الملكية الذكي) */}
      {viewingVehicleCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-outline-variant max-w-xl w-full overflow-hidden">
            <div className="bg-primary text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base">كرت رخصة سير وملكيات المركبات الإلكتروني</h3>
              </div>
              <button
                onClick={() => setViewingVehicleCard(null)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Replica Title Card */}
              <div className="rounded-2xl p-5 text-white shadow-xl relative overflow-hidden bg-gradient-to-br from-[#00374e] via-[#0b4f6c] to-[#002231] border-2 border-amber-400/40">
                <div className="flex justify-between items-start border-b border-white/20 pb-3 mb-4">
                  <div>
                    <div className="text-xs font-bold text-amber-300">الجمهورية اليمنية - وزارة الداخلية</div>
                    <div className="text-[11px] text-white/90">الإدارة العامة للمرور - كرت رخصة سير مركبة</div>
                    <div className="text-[9px] text-white/60 tracking-wider">VEHICLE REGISTRATION CARD</div>
                  </div>
                  <div className="text-left font-mono">
                    <span className="bg-white/10 px-2.5 py-1 rounded text-amber-300 font-bold text-xs border border-white/20">
                      {viewingVehicleCard.plateNumber}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-[10px] text-white/70 block">الماركة والموديل:</span>
                    <span className="font-bold text-white text-sm">{viewingVehicleCard.manufacturer} {viewingVehicleCard.model}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/70 block">سنة الصنع والفئة:</span>
                    <span className="font-mono font-bold text-white">{viewingVehicleCard.manufactureYear} - {viewingVehicleCard.vehicleTypeLabel || viewingVehicleCard.vehicleType}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/70 block">اللون الأساسي:</span>
                    <span className="font-semibold text-white">{viewingVehicleCard.color}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-white/70 block">رقم القاعدة (VIN):</span>
                    <span className="font-mono font-bold text-amber-300 text-[11px]">{viewingVehicleCard.chassisNumber}</span>
                  </div>
                  <div className="col-span-2 border-t border-white/20 pt-2 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-white/70 block">المالك المسجل:</span>
                      <span className="font-bold text-sm text-white">{viewingVehicleCard.currentOwnerFullName}</span>
                      <span className="font-mono text-[10px] text-white/80 block">الرقم الوطني: {viewingVehicleCard.currentOwnerNationalId}</span>
                    </div>
                    <div className="w-12 h-12 bg-white rounded p-1 flex items-center justify-center">
                      <QrCode className="w-10 h-10 text-primary" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Status and Verification Info */}
              <div className="bg-surface-container rounded-xl p-4 text-xs space-y-2">
                <div className="flex justify-between">
                  <span className="text-secondary">رقم رخصة السير:</span>
                  <span className="font-mono font-semibold text-primary">{viewingVehicleCard.licenseNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">صلاحية ترخيص السير:</span>
                  <span className="font-mono font-semibold text-tertiary">{viewingVehicleCard.licenseExpiryDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-secondary">المحافظة التابع لها الترخيص:</span>
                  <span className="font-semibold text-on-surface">{viewingVehicleCard.plateGovernorate}</span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-semibold flex items-center gap-2 hover:bg-primary-container transition-all"
                >
                  <Printer className="w-4 h-4" />
                  طباعة الكرت الذكي
                </button>
                <button
                  onClick={() => setViewingVehicleCard(null)}
                  className="px-4 py-2 border border-outline-variant rounded-lg text-xs font-semibold text-secondary hover:bg-surface-container"
                >
                  إغلاق
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal 2: Register New Vehicle */}
      {isRegisterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-outline-variant max-w-lg w-full overflow-hidden">
            <div className="bg-primary text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Car className="w-5 h-5 text-white" />
                <h3 className="font-bold text-lg">تسجيل وترخيص مركبة جديدة</h3>
              </div>
              <button
                onClick={() => setIsRegisterModalOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRegisterSubmit} className="p-6 space-y-4 text-sm max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-primary mb-1">رقم اللوحة المقترح</label>
                  <input
                    type="text"
                    value={formData.plateNumber}
                    onChange={(e) => setFormData((prev) => ({ ...prev, plateNumber: e.target.value }))}
                    className="w-full bg-surface border border-outline-variant rounded-lg p-2.5 text-xs font-mono font-bold text-primary outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary mb-1">نوع وفئة المركبة</label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) => setFormData((prev) => ({ ...prev, vehicleType: e.target.value as VehicleType }))}
                    className="w-full bg-surface border border-outline-variant rounded-lg p-2.5 text-xs outline-none"
                  >
                    <option value="SUV">SUV (دفع رباعي)</option>
                    <option value="Sedan">Sedan (سيارة صالون)</option>
                    <option value="Truck">Truck (نقل بضائع / شاحنة)</option>
                    <option value="Bus">Bus (حافلة ركاب)</option>
                    <option value="Motorcycle">Motorcycle (دراجة نارية)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-primary mb-1">الماركة (الشركة)</label>
                  <input
                    type="text"
                    value={formData.manufacturer}
                    onChange={(e) => setFormData((prev) => ({ ...prev, manufacturer: e.target.value }))}
                    className="w-full bg-surface border border-outline-variant rounded-lg p-2.5 text-xs outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary mb-1">الموديل (الطراز)</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData((prev) => ({ ...prev, model: e.target.value }))}
                    className="w-full bg-surface border border-outline-variant rounded-lg p-2.5 text-xs outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary mb-1">سنة الصنع</label>
                  <input
                    type="number"
                    value={formData.manufactureYear}
                    onChange={(e) => setFormData((prev) => ({ ...prev, manufactureYear: Number(e.target.value) }))}
                    className="w-full bg-surface border border-outline-variant rounded-lg p-2.5 text-xs font-mono outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-primary mb-1">رقم الشاصيه (VIN)</label>
                  <input
                    type="text"
                    value={formData.chassisNumber}
                    onChange={(e) => setFormData((prev) => ({ ...prev, chassisNumber: e.target.value }))}
                    className="w-full bg-surface border border-outline-variant rounded-lg p-2.5 text-xs font-mono outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary mb-1">اللون الأساسي</label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                    className="w-full bg-surface border border-outline-variant rounded-lg p-2.5 text-xs outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-primary mb-1">الرقم الوطني للمالك (11 رقم)</label>
                  <input
                    type="text"
                    value={formData.ownerNationalNumber}
                    onChange={(e) => setFormData((prev) => ({ ...prev, ownerNationalNumber: e.target.value }))}
                    className="w-full bg-surface border border-outline-variant rounded-lg p-2.5 text-xs font-mono font-bold text-primary outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-primary mb-1">المحافظة</label>
                  <select
                    value={formData.plateGovernorate}
                    onChange={(e) => setFormData((prev) => ({ ...prev, plateGovernorate: e.target.value }))}
                    className="w-full bg-surface border border-outline-variant rounded-lg p-2.5 text-xs outline-none"
                  >
                    <option value="أمانة العاصمة">أمانة العاصمة</option>
                    <option value="عدن">عدن</option>
                    <option value="تعز">تعز</option>
                    <option value="حضرموت">حضرموت</option>
                    <option value="الحديدة">الحديدة</option>
                  </select>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsRegisterModalOpen(false)}
                  className="px-4 py-2 border border-outline-variant rounded-lg text-xs font-semibold text-secondary hover:bg-surface-container"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={registering}
                  className="px-6 py-2 bg-primary hover:bg-primary-container text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                >
                  {registering ? "جارِ التسجيل..." : "تسجيل وتثبيت الملكية"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
