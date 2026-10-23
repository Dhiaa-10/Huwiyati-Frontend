"use client";

import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  X,
  QrCode,
  ShieldCheck,
  ExternalLink,
  Copy,
  Check,
  Printer,
} from "lucide-react";
import Link from "next/link";

export interface QrCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  documentType: string;
  documentNumber: string;
  holderName: string;
  qrPayload?: string;
}

export function QrCodeModal({
  isOpen,
  onClose,
  title,
  documentType,
  documentNumber,
  holderName,
  qrPayload,
}: QrCodeModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const payload = qrPayload || documentNumber;
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";
  const verificationUrl = `${baseUrl}/verify/${encodeURIComponent(payload)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-arabic animate-fade-in">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100">
              <QrCode className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-[#052F31] text-sm">{title}</h3>
              <p className="text-[11px] text-slate-400">رمز الاستجابة السريعة المعتمد رسمياً</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 cursor-pointer p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Document Info Card */}
        <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-slate-400">المواطن:</span>
            <span className="font-bold text-slate-800">{holderName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">رقم الوثيقة:</span>
            <span className="font-mono font-bold text-[#0C4A4E]">{documentNumber}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">نوع المستند:</span>
            <span className="font-semibold text-slate-700">{documentType}</span>
          </div>
        </div>

        {/* QR Code Container */}
        <div className="flex flex-col items-center justify-center p-5 bg-gradient-to-b from-slate-50 to-white rounded-2xl border border-slate-200/80 shadow-inner">
          <div className="p-3 bg-white rounded-xl shadow-md border border-slate-100">
            <QRCodeSVG
              value={verificationUrl}
              size={180}
              level="M"
              includeMargin={true}
            />
          </div>
          <p className="text-[10px] text-slate-400 mt-3 text-center">
            امسح الرمز بكاميرا الهاتف للتحقق المباشر من صحة وسريان الوثيقة
          </p>
        </div>

        {/* Token String Box */}
        <div className="flex items-center gap-2 p-2 rounded-xl bg-slate-100/70 border border-slate-200 text-[11px] font-mono text-slate-600">
          <span className="truncate flex-1" dir="ltr">
            {payload}
          </span>
          <button
            onClick={handleCopy}
            className="p-1.5 hover:bg-white rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
            title="نسخ الرابط"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between gap-3 pt-2 border-t border-slate-100">
          <Link
            href={`/verify/${encodeURIComponent(payload)}`}
            target="_blank"
            className="flex-1 py-2.5 px-4 bg-[#0C4A4E] hover:bg-[#052F31] text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-sm"
          >
            <ShieldCheck className="w-4 h-4 text-emerald-300" />
            <span>فحص صحة الوثيقة</span>
            <ExternalLink className="w-3 h-3 opacity-70" />
          </Link>

          <button
            onClick={onClose}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}
