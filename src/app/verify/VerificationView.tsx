"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Search,
  QrCode,
  Calendar,
  MapPin,
  User,
  FileText,
  Printer,
  RefreshCw,
  Loader2,
  Award,
  Clock,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { HwyatiLogo } from "@/components/ui/hwyati-logo";
import { verificationService, DocumentVerificationResultDto } from "@/lib/api/verificationService";
import { filesService } from "@/lib/api/filesService";

interface VerificationViewProps {
  initialPayload?: string;
}

export default function VerificationView({ initialPayload }: VerificationViewProps) {
  const [payloadInput, setPayloadInput] = useState(initialPayload || "");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DocumentVerificationResultDto | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleVerify = async (tokenToVerify?: string) => {
    const raw = tokenToVerify || payloadInput;
    const token = verificationService.extractPayloadToken(raw);

    if (!token) {
      setError("يرجى إدخال رمز التحقق أو مسح الرمز من الوثيقة.");
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const data = await verificationService.verifyDocument(token);
      setResult(data);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : "تعذر التحقق من الوثيقة. يرجى التأكد من صحة الرمز المدخل.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialPayload) {
      handleVerify(initialPayload);
    }
  }, [initialPayload]);

  const getDocTypeLabel = (type: string) => {
    switch (type) {
      case "NationalIdCard":
        return "البطاقة الشخصية الذكية (National ID)";
      case "Passport":
        return "جواز السفر الإلكتروني (Passport)";
      case "FamilyCard":
        return "البطاقة العائلية (Family Card)";
      case "BirthCertificate":
        return "شهادة الميلاد الرقمية (Birth Certificate)";
      case "DeathCertificate":
        return "شهادة الوفاة الرسمية (Death Certificate)";
      default:
        return type;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-[#F8FAF9] to-slate-100 text-slate-800 flex flex-col justify-between p-4 md:p-8 font-arabic">
      {/* Header */}
      <header className="max-w-4xl mx-auto w-full flex items-center justify-between pb-6 border-b border-slate-200">
        <HwyatiLogo size={46} showText={true} />
        <div className="text-left flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs font-bold text-[#0C4A4E] hover:text-[#052F31] flex items-center gap-1.5 bg-white border border-slate-200 px-3.5 py-1.5 rounded-xl shadow-xs transition-colors"
          >
            <span>بوابة الموظفين</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto w-full my-8">
        {/* Verification Form Card */}
        <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-slate-200/50 border border-slate-200/80 mb-6">
          <div className="text-center max-w-lg mx-auto mb-6">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-teal-50 text-teal-700 mb-3 border border-teal-100 shadow-xs">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <h1 className="text-xl md:text-2xl font-black text-[#052F31]">
              بوابة التحقق الرسمية من الوثائق الوطنية
            </h1>
            <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
              تحقق فوري من صحة ومطابقة البطاقات الشخصية، الجوازات، والشهادات الرسمية الصادرة عن مصلحة الأحوال المدنية والجوازات.
            </p>
          </div>

          {/* Search / Token Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify();
            }}
            className="flex flex-col sm:flex-row items-center gap-3"
          >
            <div className="relative flex-1 w-full">
              <input
                type="text"
                value={payloadInput}
                onChange={(e) => setPayloadInput(e.target.value)}
                placeholder="أدخل رمز التحقق (Token) أو الصق الرابط الكامل الممسوح..."
                className="w-full pl-4 pr-11 py-3 text-xs md:text-sm bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:border-[#0C4A4E] focus:bg-white transition-all font-mono"
              />
              <QrCode className="w-5 h-5 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 bg-[#0C4A4E] hover:bg-[#052F31] text-white rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow-md disabled:opacity-60"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              <span>فحص الوثيقة</span>
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3 animate-fade-in">
              <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <div className="flex-1 font-semibold">{error}</div>
            </div>
          )}
        </div>

        {/* Verification Result Card */}
        {result && (
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden animate-fade-in">
            {/* Status Banner */}
            <div
              className={`p-6 border-b flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right ${
                result.isValid
                  ? "bg-emerald-500/10 border-emerald-200 text-emerald-950"
                  : "bg-rose-500/10 border-rose-200 text-rose-950"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                    result.isValid
                      ? "bg-emerald-600 text-white"
                      : "bg-rose-600 text-white"
                  }`}
                >
                  {result.isValid ? (
                    <CheckCircle2 className="w-7 h-7" />
                  ) : (
                    <AlertTriangle className="w-7 h-7" />
                  )}
                </div>
                <div>
                  <h2 className="text-base font-black">
                    {result.isValid
                      ? "وثيقة رسمية أصلية ومعتمدة"
                      : "وثيقة غير صالحة أو منتهية الصلاحية"}
                  </h2>
                  <p className="text-xs opacity-80 mt-0.5">
                    {result.isValid
                      ? "تم التحقق ومطابقة البيانات بنجاح مع قاعدة البيانات المركزية لوزارة الداخلية."
                      : "حالة الوثيقة في السجل الرسمي غير نشطة أو تجاوزت تاريخ الصلاحية القانوني."}
                  </p>
                </div>
              </div>

              <div
                className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider inline-block ${
                  result.isValid
                    ? "bg-emerald-600 text-white"
                    : "bg-rose-600 text-white"
                }`}
              >
                {result.status}
              </div>
            </div>

            {/* Document Details Body */}
            <div className="p-6 md:p-8 space-y-6">
              {/* Holder Profile & Document Type Header */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 pb-6 border-b border-slate-100">
                <div className="relative w-24 h-28 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shrink-0 shadow-inner flex items-center justify-center">
                  {result.holderPhotoUrl ? (
                    <img
                      src={filesService.getFullUrl(result.holderPhotoUrl)}
                      alt={result.holderName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-slate-400" />
                  )}
                </div>

                <div className="text-center sm:text-right flex-1">
                  <span className="inline-block px-3 py-1 bg-[#0C4A4E]/10 text-[#0C4A4E] rounded-lg text-xs font-bold mb-1.5">
                    {getDocTypeLabel(result.documentType)}
                  </span>
                  <h3 className="text-lg md:text-xl font-black text-slate-900 leading-tight">
                    {result.holderName}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono mt-1">
                    الرقم الرسمي: <span className="font-bold text-slate-800">{result.documentNumber}</span>
                  </p>
                </div>
              </div>

              {/* Grid of Verified Attributes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>جهة الإصدار / الفرع</span>
                  </div>
                  <div className="font-bold text-slate-800 text-sm">
                    {result.issuingBranchName || "الفرع المركزي المعتمد"}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <FileText className="w-3.5 h-3.5" />
                    <span>نوع المستند الرقمي</span>
                  </div>
                  <div className="font-bold text-slate-800 text-sm">
                    {result.documentType}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>تاريخ الإصدار</span>
                  </div>
                  <div className="font-bold text-slate-800 text-sm font-mono">
                    {result.issueDate || "غير محدد"}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-400 mb-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>تاريخ الانتهاء</span>
                  </div>
                  <div
                    className={`font-bold text-sm font-mono ${
                      result.isValid ? "text-slate-800" : "text-rose-600"
                    }`}
                  >
                    {result.expiryDate || "دائم / غير محدد"}
                  </div>
                </div>
              </div>

              {/* Verification Stamp / Seal */}
              <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-teal-900">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-teal-600 shrink-0" />
                  <div>
                    <span className="font-bold block">ختم التحقق الرقمي الرسمي</span>
                    <span className="text-[11px] text-teal-700">
                      تم الفحص والاستعلام المباشر عبر بروتوكول Selective Disclosure الآمن.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-[11px] font-mono text-teal-800 bg-white px-3 py-1.5 rounded-xl border border-teal-200">
                  <Clock className="w-3 h-3 text-teal-600" />
                  <span>
                    {new Date(result.verificationTimestamp).toLocaleString("ar-YE", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>طباعة إشعار التحقق</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-4xl mx-auto w-full text-center text-xs text-slate-400 pt-6 border-t border-slate-200">
        <p>منظومة هويتي الوطنية الموحدة • مصلحة الأحوال المدنية والجوازات • الجمهورية اليمنية</p>
      </footer>
    </div>
  );
}
