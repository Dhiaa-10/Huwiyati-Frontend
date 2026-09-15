"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  Search,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  ShieldCheck,
  AlertTriangle,
  FileText,
  Eye,
  Download,
  Printer,
  QrCode,
  Sparkles,
  Calendar,
  CheckSquare,
  Square,
  ZoomIn,
} from "lucide-react";
import { trafficService } from "@/lib/api/trafficService";
import { civilRegistryService } from "@/lib/api/civilRegistryService";
import { DrivingLicense, LicenseCategory } from "@/types/traffic";
import { CitizenCivilRecord } from "@/types/civilRegistry";
import { useAuth } from "@/context/AuthContext";

export default function DrivingLicensesPage() {
  const { user } = useAuth();
  const [licenses, setLicenses] = useState<DrivingLicense[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  // Selected application/license state
  const [selectedLicense, setSelectedLicense] = useState<DrivingLicense | null>(null);
  const [matchedCitizen, setMatchedCitizen] = useState<CitizenCivilRecord | null>(null);

  // Checkboxes for verification
  const [isOldVerified, setIsOldVerified] = useState(true);
  const [isCertVerified, setIsCertVerified] = useState(true);

  // New Application Modal state
  const [isNewAppModalOpen, setIsNewAppModalOpen] = useState(false);
  const [newNid, setNewNid] = useState("01010000004");
  const [newCategory, setNewCategory] = useState<LicenseCategory>("Private");
  const [newBloodGroup, setNewBloodGroup] = useState("O+");
  const [newBranchName, setNewBranchName] = useState("مرور أمانة العاصمة - الحصبة");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const list = await trafficService.getDrivingLicenses();
        setLicenses(list);
        if (list.length > 0) {
          setSelectedLicense(list[0]);
          fetchCitizen(list[0].nationalNumber);
        }
      } catch (err) {
        console.error("Failed to load licenses:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const fetchCitizen = async (nid: string) => {
    try {
      const c = await civilRegistryService.searchCitizenByNationalId(nid);
      setMatchedCitizen(c);
    } catch {
      setMatchedCitizen(null);
    }
  };

  const handleSelectLicense = (lic: DrivingLicense) => {
    setSelectedLicense(lic);
    fetchCitizen(lic.nationalNumber);
  };

  const filteredLicenses = licenses.filter((l) => {
    const matchSearch =
      l.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.nationalNumber.includes(searchQuery) ||
      l.licenseNumber.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchSearch) return false;
    if (typeFilter === "all") return true;
    if (typeFilter === "expired") return l.status === "Expired";
    if (typeFilter === "active") return l.status === "Active";
    return true;
  });

  // Approve & Issue License
  const handleApproveAndIssue = async () => {
    if (!selectedLicense) return;
    setProcessing(true);
    try {
      const updated = await trafficService.issueDrivingLicense({
        nationalNumber: selectedLicense.nationalNumber,
        category: selectedLicense.category,
        issuingBranchId: selectedLicense.issuingBranchId || "22222222-bbbb-cccc-dddd-000000000004",
        issuingBranchName: selectedLicense.issuingBranchName || "مرور أمانة العاصمة - الحصبة",
        bloodGroup: selectedLicense.bloodGroup || "O+",
      });

      setLicenses((prev) =>
        prev.map((item) => (item.id === selectedLicense.id ? updated : item))
      );
      setSelectedLicense(updated);
      alert(`تم اعتماد وإصدار رخصة القيادة الذكية بنجاح برقم: ${updated.licenseNumber}`);
    } catch (err) {
      console.error("Failed to approve license:", err);
      alert("حدث خطأ أثناء إصدار الرخصة.");
    } finally {
      setProcessing(false);
    }
  };

  // Submit New License Application
  const handleCreateNewApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    try {
      const created = await trafficService.issueDrivingLicense({
        nationalNumber: newNid,
        category: newCategory,
        issuingBranchId: "22222222-bbbb-cccc-dddd-000000000004",
        issuingBranchName: newBranchName,
        bloodGroup: newBloodGroup,
      });

      setLicenses((prev) => [created, ...prev]);
      setSelectedLicense(created);
      fetchCitizen(created.nationalNumber);
      setIsNewAppModalOpen(false);
      alert(`تم تسجيل طلب الرخصة وإصدارها بنجاح برقم: ${created.licenseNumber}`);
    } catch (err) {
      console.error("Failed to submit new license:", err);
      alert("فشل إنشاء الطلب. تأكد من صحة الرقم الوطني.");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/30 pb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-primary" />
              منظومة الرخص الذكية الموحدة
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary font-headline-lg">
            إدارة وفحص رخص القيادة الذكية
          </h1>
          <p className="text-secondary text-sm">
            تدقيق ومطابقة طلبات الإصدار والتجديد، الفحص الطبي الجنائي، وإصدار كروت القيادة الرقمية المشفرة
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsNewAppModalOpen(true)}
            className="px-4 py-2 bg-[#00374e] hover:bg-[#0b4f6c] text-white rounded-lg text-sm font-semibold shadow-sm transition-all flex items-center gap-2 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            طلب رخصة جديدة
          </button>
        </div>
      </div>

      {/* Main 3-Column Split View Matching Stitch Screen 25 */}
      <div className="grid grid-cols-12 gap-6">
        {/* Col 1: Requests & Licenses List (4 cols) */}
        <div className="col-span-12 lg:col-span-4 bg-surface-container-lowest rounded-xl shadow-[0_4px_20px_rgba(11,79,108,0.05)] border border-outline-variant/30 flex flex-col overflow-hidden h-[750px]">
          {/* Search and Filters */}
          <div className="p-4 border-b border-outline-variant/30 bg-surface-container-low/40 space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-secondary" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="بحث بالاسم أو الرقم الوطني..."
                className="w-full bg-white border border-outline-variant rounded-lg pr-9 pl-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setTypeFilter("all")}
                className={`flex-1 py-1 rounded font-semibold transition-all ${
                  typeFilter === "all" ? "bg-primary text-white" : "bg-white text-secondary border border-outline-variant"
                }`}
              >
                الكل ({licenses.length})
              </button>
              <button
                onClick={() => setTypeFilter("active")}
                className={`flex-1 py-1 rounded font-semibold transition-all ${
                  typeFilter === "active" ? "bg-tertiary text-white" : "bg-white text-secondary border border-outline-variant"
                }`}
              >
                سارية
              </button>
              <button
                onClick={() => setTypeFilter("expired")}
                className={`flex-1 py-1 rounded font-semibold transition-all ${
                  typeFilter === "expired" ? "bg-error text-white" : "bg-white text-secondary border border-outline-variant"
                }`}
              >
                منتهية / تجديد
              </button>
            </div>
          </div>

          {/* List items */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 divide-y divide-outline-variant/10">
            {filteredLicenses.map((lic) => {
              const isSelected = selectedLicense?.id === lic.id;
              const isExpired = lic.status === "Expired";
              return (
                <div
                  key={lic.id}
                  onClick={() => handleSelectLicense(lic)}
                  className={`p-3.5 rounded-xl cursor-pointer transition-all relative overflow-hidden border ${
                    isSelected
                      ? "bg-primary/5 border-primary shadow-sm"
                      : "bg-surface-container-lowest border-outline-variant/30 hover:border-primary/40 hover:bg-surface-container-low/20"
                  }`}
                >
                  {isSelected && <div className="absolute right-0 top-0 bottom-0 w-1 bg-primary"></div>}

                  <div className="flex justify-between items-start mb-1.5">
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        isExpired
                          ? "bg-amber-100 text-amber-800 border border-amber-300"
                          : "bg-tertiary/10 text-tertiary border border-tertiary/20"
                      }`}
                    >
                      {isExpired ? "طلب تجديد" : "رخصة سارية"}
                    </span>
                    <span className="font-mono text-xs font-bold text-primary">{lic.licenseNumber}</span>
                  </div>

                  <h4 className="font-bold text-sm text-on-surface mb-1">{lic.fullName}</h4>

                  <div className="flex items-center justify-between text-xs text-secondary">
                    <span className="font-mono">الهوية: {lic.nationalNumber}</span>
                    <span className="font-semibold text-primary-container">{lic.categoryLabel || lic.category}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Col 2 & 3: Detail Split View Matching Screen 25 (8 cols) */}
        {selectedLicense ? (
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Box 1: Citizen Verified Info Card */}
              <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_4px_20px_rgba(11,79,108,0.05)] border border-outline-variant/30 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-primary flex items-center gap-2 mb-4">
                    <User className="w-5 h-5 text-primary-container" />
                    بيانات السجل المدني للمواطن
                  </h3>

                  <div className="flex gap-4 mb-4">
                    <div className="w-20 h-24 rounded-lg bg-surface-container border border-outline-variant flex items-center justify-center text-primary font-bold overflow-hidden shrink-0">
                      {matchedCitizen?.photoUrl || selectedLicense.photoUrl ? (
                        <img src={matchedCitizen?.photoUrl || selectedLicense.photoUrl} alt="صورة المواطن" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-10 h-10 text-secondary" />
                      )}
                    </div>
                    <div className="space-y-1.5 flex-1 text-xs">
                      <div>
                        <span className="text-secondary block">الاسم الرباعي الكامل:</span>
                        <span className="font-bold text-sm text-primary">{selectedLicense.fullName}</span>
                      </div>
                      <div>
                        <span className="text-secondary block">الرقم الوطني الموحد:</span>
                        <span className="font-mono font-bold text-on-surface">{selectedLicense.nationalNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <div>
                          <span className="text-secondary block">فصيلة الدم:</span>
                          <span className="font-bold text-error font-mono">{selectedLicense.bloodGroup}</span>
                        </div>
                        <div>
                          <span className="text-secondary block">الفرع الصادر منه:</span>
                          <span className="font-semibold text-on-surface">{selectedLicense.issuingBranchName}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Security Checks Verification */}
                  <div className="border-t border-outline-variant/30 pt-3 space-y-2 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5 text-secondary">
                        <ShieldCheck className="w-4 h-4 text-tertiary" />
                        السجل الجنائي والأمني (وزارة الداخلية):
                      </span>
                      <span className="px-2 py-0.5 bg-tertiary/10 text-tertiary font-bold rounded">
                        سليم ولا توجد قيود
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5 text-secondary">
                        <AlertTriangle className="w-4 h-4 text-secondary" />
                        المخالفات المرورية غير المسددة:
                      </span>
                      <span className="px-2 py-0.5 bg-surface-container text-on-surface font-bold rounded font-mono">
                        0 ريال (مستوفٍ)
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="flex items-center gap-1.5 text-secondary">
                        <FileText className="w-4 h-4 text-primary" />
                        اللياقة الطبية وفحص النظر:
                      </span>
                      <span className="px-2 py-0.5 bg-tertiary/10 text-tertiary font-bold rounded">
                        لائق طبياً (مستشفى الثورة)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-outline-variant/30">
                  <label className="flex items-center gap-2 text-xs font-semibold text-primary cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isOldVerified}
                      onChange={(e) => setIsOldVerified(e.target.checked)}
                      className="rounded text-primary focus:ring-primary w-4 h-4"
                    />
                    <span>تم التحقق من مطابقة البيانات مع قاعدة بيانات الأحوال المدنية</span>
                  </label>
                </div>
              </div>

              {/* Box 2: Driving School & Training Certificate Verification */}
              <div className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_4px_20px_rgba(11,79,108,0.05)] border border-outline-variant/30 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-base font-bold text-primary flex items-center gap-2">
                      <FileText className="w-5 h-5 text-primary-container" />
                      شهادة مدرسة القيادة والاختبار الفني
                    </h3>
                    <span className="text-[11px] bg-tertiary/10 text-tertiary font-bold px-2 py-0.5 rounded">
                      ناجح بتفوق
                    </span>
                  </div>

                  <div className="p-3 bg-surface-container-low rounded-lg border border-outline-variant/30 space-y-2 text-xs mb-3">
                    <div className="flex justify-between">
                      <span className="text-secondary">المعهد / المدرسة:</span>
                      <span className="font-semibold text-on-surface">مدرسة المرور النموذجية للقيادة</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary">فئة التدريب والاختبار:</span>
                      <span className="font-bold text-primary">{selectedLicense.categoryLabel || selectedLicense.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary">رقم محضر الاختبار:</span>
                      <span className="font-mono text-on-surface">TEST-YE-88421</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-secondary">الضابط الفاحص:</span>
                      <span className="font-semibold text-on-surface">نقيب / رضوان أحمد القاضي</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-lg border border-dashed border-outline-variant bg-white text-center">
                    <FileText className="w-8 h-8 text-primary mx-auto mb-1" />
                    <span className="text-xs font-bold text-primary block">شهادة الفحص الفني المعتمدة.pdf</span>
                    <span className="text-[11px] text-secondary">مشفرة برمز QR وموقعة إلكترونياً</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-outline-variant/30">
                  <label className="flex items-center gap-2 text-xs font-semibold text-primary cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isCertVerified}
                      onChange={(e) => setIsCertVerified(e.target.checked)}
                      className="rounded text-primary focus:ring-primary w-4 h-4"
                    />
                    <span>الشهادة مستوفية لكافة الشروط ومصدقة من شرطة السير</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Box 3: Realistic Digital Driving License Replica Card */}
            <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_20px_rgba(11,79,108,0.05)] border border-outline-variant/30">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-bold text-primary flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-amber-500" />
                  معاينة بطاقة رخصة القيادة الذكية المشفرة (Smart Driving License Replica)
                </h3>
                <span className="text-xs text-secondary font-mono">ISO/IEC 18013-5 COMPLIANT</span>
              </div>

              {/* Physical Card Simulation (Credit card size, Petrol Blue & Gold gradient) */}
              <div className="max-w-xl mx-auto rounded-2xl p-6 text-white shadow-2xl relative overflow-hidden bg-gradient-to-br from-[#00374e] via-[#0b4f6c] to-[#002231] border-2 border-amber-400/40">
                {/* Security Hologram & Chip effect */}
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-2xl -z-0"></div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-amber-400/10 rounded-full blur-xl -z-0"></div>

                {/* Card Header */}
                <div className="flex justify-between items-start border-b border-white/20 pb-3 mb-4 relative z-10">
                  <div>
                    <div className="text-[11px] font-bold text-amber-300">الجمهورية اليمنية - وزارة الداخلية</div>
                    <div className="text-[10px] text-white/80">الإدارة العامة للمرور - رخصة قيادة ذكية</div>
                    <div className="text-[9px] text-white/60 tracking-wider">REPUBLIC OF YEMEN - DRIVING LICENSE</div>
                  </div>
                  <div className="text-left font-mono">
                    <div className="text-xs font-bold text-amber-300">{selectedLicense.licenseNumber}</div>
                    <div className="text-[9px] text-white/70">{selectedLicense.categoryLabel || selectedLicense.category}</div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="grid grid-cols-12 gap-4 items-center relative z-10">
                  {/* Photo & Smart Chip */}
                  <div className="col-span-4 flex flex-col items-center gap-2">
                    <div className="w-24 h-28 rounded-lg bg-white/10 border-2 border-white/40 overflow-hidden shadow-inner flex items-center justify-center">
                      {matchedCitizen?.photoUrl || selectedLicense.photoUrl ? (
                        <img src={matchedCitizen?.photoUrl || selectedLicense.photoUrl} alt="صورة الرخصة" className="w-full h-full object-cover" />
                      ) : (
                        <User className="w-12 h-12 text-white/60" />
                      )}
                    </div>
                    {/* Chip Graphic */}
                    <div className="w-10 h-7 rounded bg-amber-400/80 border border-amber-300 flex items-center justify-center shadow-xs">
                      <div className="w-8 h-5 border border-amber-600/50 rounded-xs grid grid-cols-2 gap-0.5">
                        <div className="border-r border-amber-600/50"></div>
                        <div></div>
                      </div>
                    </div>
                  </div>

                  {/* Citizen Credentials */}
                  <div className="col-span-8 space-y-2 text-xs">
                    <div>
                      <span className="text-[10px] text-white/70 block">الاسم الكامل / Full Name:</span>
                      <span className="font-bold text-sm text-white block">{selectedLicense.fullName}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-white/70 block">الرقم الوطني / National ID:</span>
                        <span className="font-mono font-bold text-amber-300">{selectedLicense.nationalNumber}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-white/70 block">فصيلة الدم / Blood Group:</span>
                        <span className="font-mono font-bold text-red-400 text-sm">{selectedLicense.bloodGroup}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <span className="text-[10px] text-white/70 block">تاريخ الإصدار / Issue:</span>
                        <span className="font-mono text-white/90">{selectedLicense.issueDate}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-white/70 block">تاريخ الانتهاء / Expiry:</span>
                        <span className="font-mono font-bold text-amber-300">{selectedLicense.expiryDate}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-white/20">
                      <div>
                        <span className="text-[9px] text-white/60 block">الفرع الصادر منه / Branch:</span>
                        <span className="font-semibold text-white/90">{selectedLicense.issuingBranchName}</span>
                      </div>
                      <div className="w-12 h-12 bg-white rounded p-1 flex items-center justify-center">
                        <QrCode className="w-10 h-10 text-primary" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-outline-variant/30">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2.5 border border-outline-variant hover:bg-surface-container rounded-lg text-xs font-semibold text-primary transition-all flex items-center gap-2"
                >
                  <Printer className="w-4 h-4" />
                  طباعة كرت الرخصة
                </button>

                <button
                  onClick={handleApproveAndIssue}
                  disabled={processing || !isOldVerified || !isCertVerified}
                  className="px-6 py-2.5 bg-[#00374e] hover:bg-[#0b4f6c] text-white rounded-lg text-xs font-semibold shadow-sm transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {processing ? "جارِ الإصدار والتوقيع..." : "إصدار / تجديد الرخصة وتوثيقها"}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="col-span-12 lg:col-span-8 flex items-center justify-center bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-12 text-center text-secondary">
            <div>
              <CreditCard className="w-12 h-12 text-secondary mx-auto mb-2 opacity-50" />
              <p className="font-bold text-base">اختر رخصة أو طلب لمعاينته وتدقيقه</p>
            </div>
          </div>
        )}
      </div>

      {/* Modal: New License Application */}
      {isNewAppModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl border border-outline-variant max-w-md w-full overflow-hidden">
            <div className="bg-primary text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5" />
                <h3 className="font-bold text-lg">طلب إصدار رخصة قيادة جديدة</h3>
              </div>
              <button
                onClick={() => setIsNewAppModalOpen(false)}
                className="p-1 hover:bg-white/20 rounded-full transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateNewApplication} className="p-6 space-y-4 text-sm">
              <div>
                <label className="block text-xs font-bold text-primary mb-1">الرقم الوطني للمواطن (11 رقم)</label>
                <input
                  type="text"
                  value={newNid}
                  onChange={(e) => setNewNid(e.target.value)}
                  placeholder="01010000004"
                  className="w-full bg-surface border border-outline-variant rounded-lg p-2.5 text-xs font-mono font-bold text-primary outline-none"
                  required
                />
                <span className="text-[11px] text-secondary mt-1 block">
                  يتم التحقق آلياً من بلوغ السن القانوني (18 سنة) والسجل الجنائي.
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-primary mb-1">فئة الرخصة المطلوبة</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as LicenseCategory)}
                  className="w-full bg-surface border border-outline-variant rounded-lg p-2.5 text-xs outline-none font-semibold text-on-surface"
                >
                  <option value="Private">خصوصي (سيارات ركاب خفيفة)</option>
                  <option value="CommercialLight">عمومي خفيف (أجرة وحافلات نقل ركاب)</option>
                  <option value="CommercialHeavy">نقل ثقيل ومعدات ثقيلة</option>
                  <option value="Motorcycle">دراجة نارية</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-primary mb-1">فصيلة الدم</label>
                  <select
                    value={newBloodGroup}
                    onChange={(e) => setNewBloodGroup(e.target.value)}
                    className="w-full bg-surface border border-outline-variant rounded-lg p-2.5 text-xs outline-none font-mono"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary mb-1">الفرع الصادر منه</label>
                  <select
                    value={newBranchName}
                    onChange={(e) => setNewBranchName(e.target.value)}
                    className="w-full bg-surface border border-outline-variant rounded-lg p-2.5 text-xs outline-none"
                  >
                    <option value="مرور أمانة العاصمة - الحصبة">مرور أمانة العاصمة - الحصبة</option>
                    <option value="مرور عدن - خور مكسر">مرور عدن - خور مكسر</option>
                    <option value="مرور تعز - الحوبان">مرور تعز - الحوبان</option>
                    <option value="مرور حضرموت - المكلا">مرور حضرموت - المكلا</option>
                    <option value="مرور الحديدة - الكورنيش">مرور الحديدة - الكورنيش</option>
                  </select>
                </div>
              </div>

              <div className="p-3 bg-surface-container rounded-lg text-xs text-secondary space-y-1">
                <div className="flex items-center gap-1.5 font-semibold text-primary">
                  <ShieldCheck className="w-4 h-4 text-tertiary" />
                  رسوم الإصدار المقررة: 12,000 ريال يمني
                </div>
                <p>تشمل الفحص الفني، رسوم البطاقة الذكية، والتحقق البصري.</p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsNewAppModalOpen(false)}
                  className="px-4 py-2 border border-outline-variant rounded-lg text-xs font-semibold text-secondary hover:bg-surface-container"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={processing}
                  className="px-6 py-2 bg-primary hover:bg-primary-container text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                >
                  {processing ? "جارِ الاعتماد..." : "اعتماد وإصدار فوري"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
