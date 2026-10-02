"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  CreditCard,
  Search,
  AlertCircle,
  Users,
  ShieldCheck,
  CheckCircle2,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function DrivingLicensesPage() {
  const { user } = useAuth();
  const [nationalNumber, setNationalNumber] = useState("");
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nationalNumber.trim()) return;
    setSearching(true);
    setTimeout(() => {
      setSearching(false);
      setSearched(true);
    }, 400);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/30 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-primary" />
              منظومة رخص القيادة الإلكترونية
            </span>
            <span className="text-xs text-secondary">| {user.branchName || "مرور أمانة العاصمة"}</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary font-headline-lg">
            إدارة وإصدار رخص القيادة
          </h1>
          <p className="text-secondary text-sm md:text-base mt-1">
            الاستعلام والتحقق من رخص القيادة وسجلات السائقين المعتمدة
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/traffic/employees"
            className="px-4 py-2.5 bg-primary hover:bg-primary-container text-white rounded-lg text-sm font-semibold shadow-sm transition-all flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            <span>كادر وضباط الفرع</span>
          </Link>
        </div>
      </div>

      {/* Backend Alignment Notice */}
      <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-900 space-y-3">
        <div className="flex items-center gap-2 font-bold text-amber-800 text-base">
          <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
          <span>تنبيه نظامي: وحدة رخص القيادة قيد التطوير في الخادم الخلفي (API Under Development)</span>
        </div>
        <p className="text-xs leading-relaxed text-secondary">
          الواجهة الخلفية الحالية (Huwiyati.API) لا تتضمن متحكمات (Controllers) خاصة برخص القيادة بعد. تم إيقاف عرض أي بيانات تجريبية أو وهمية لضمان تطابق الفرونت إند بنسبة 100% مع الباكند الفعلي.
        </p>
        <div className="pt-2 border-t border-amber-500/20 flex items-center gap-4 text-xs font-semibold">
          <span className="text-primary font-bold">الخدمات المفعلة لقطاع المرور حالياً:</span>
          <Link href="/traffic/employees" className="text-primary hover:underline flex items-center gap-1">
            <span>إدارة ضباط وكادر الفرع والتكليف الرسمي (/api/v1/Employees)</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </div>

      {/* Lookup Card */}
      <div className="bg-surface-container-lowest rounded-xl p-6 shadow-[0_4px_20px_rgba(11,79,108,0.05)] border border-outline-variant/30 space-y-4">
        <h3 className="text-sm font-bold text-primary flex items-center gap-2">
          <Search className="w-4 h-4 text-primary" />
          التحقق من سريان رخصة بالرقم الوطني الموحد
        </h3>
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            maxLength={11}
            value={nationalNumber}
            onChange={(e) => setNationalNumber(e.target.value.replace(/\D/g, ""))}
            placeholder="أدخل الرقم الوطني للمواطن (11 خانة)..."
            className="flex-1 bg-surface border border-outline-variant rounded-lg px-4 py-2.5 text-xs font-mono outline-none focus:border-primary"
          />
          <button
            type="submit"
            disabled={searching}
            className="px-6 py-2.5 bg-primary hover:bg-primary-container text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-2"
          >
            {searching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            <span>استعلام</span>
          </button>
        </form>

        {searched && (
          <div className="p-4 bg-surface rounded-xl border border-outline-variant/30 text-xs text-secondary text-center">
            لا توجد سجلات رخص مصدرة في قاعدة البيانات لهذا الرقم الوطني. سيتم تفعيل الخدمة فور اكتمال بناء وحدات المرور بالخادم.
          </div>
        )}
      </div>
    </div>
  );
}
