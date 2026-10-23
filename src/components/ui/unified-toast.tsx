"use client";

import React from "react";
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface UnifiedToastContainerProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}

export function UnifiedToastContainer({ toasts, onDismiss }: UnifiedToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div
      dir="rtl"
      className="fixed top-6 left-1/2 -translate-x-1/2 z-[100000] flex flex-col items-center gap-3 w-full max-w-xl px-4 pointer-events-none select-none"
    >
      {toasts.map((toast) => {
        const renderConfig = () => {
          switch (toast.type) {
            case "success":
              return {
                title: "تمت العملية بنجاح",
                icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />,
                badge: "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800/60 text-emerald-700 dark:text-emerald-300",
                titleColor: "text-emerald-900 dark:text-emerald-200",
                borderAccent: "border-r-4 border-r-emerald-500",
                cardBg: "bg-white/95 dark:bg-[#042426]/95 border-emerald-100 dark:border-emerald-900/50 shadow-emerald-950/10",
              };
            case "error":
              return {
                title: "تعذر إتمام الإجراء",
                icon: <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />,
                badge: "bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300",
                titleColor: "text-rose-900 dark:text-rose-200",
                borderAccent: "border-r-4 border-r-rose-600",
                cardBg: "bg-white/95 dark:bg-[#1a080b]/95 border-rose-100 dark:border-rose-900/50 shadow-rose-950/15",
              };
            case "warning":
              return {
                title: "تنبيه المنظومة",
                icon: <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />,
                badge: "bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800/60 text-amber-700 dark:text-amber-300",
                titleColor: "text-amber-900 dark:text-amber-200",
                borderAccent: "border-r-4 border-r-amber-500",
                cardBg: "bg-white/95 dark:bg-[#1d1404]/95 border-amber-100 dark:border-amber-900/50 shadow-amber-950/10",
              };
            case "info":
            default:
              return {
                title: "إشعار رسمي",
                icon: <Info className="w-5 h-5 text-[#0C4A4E] dark:text-[#A8E2C7] shrink-0" />,
                badge: "bg-teal-50 dark:bg-[#07383B] border-teal-200 dark:border-[#147A77]/40 text-[#0C4A4E] dark:text-[#A8E2C7]",
                titleColor: "text-[#0C4A4E] dark:text-[#E6F1EE]",
                borderAccent: "border-r-4 border-r-[#147A77]",
                cardBg: "bg-white/95 dark:bg-[#052F31]/95 border-[#E7EEEB] dark:border-[#0C4A4E] shadow-[#052F31]/10",
              };
          }
        };

        const config = renderConfig();

        return (
          <div
            key={toast.id}
            role="alert"
            className={`pointer-events-auto w-full flex items-start justify-between gap-3.5 p-4 rounded-2xl shadow-2xl backdrop-blur-xl border ${config.cardBg} ${config.borderAccent} transition-all duration-300 animate-in slide-in-from-top-4 fade-in`}
          >
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className={`p-2 rounded-xl border flex items-center justify-center shrink-0 ${config.badge}`}>
                {config.icon}
              </div>

              <div className="flex-1 min-w-0 pt-0.5">
                <h4 className={`text-xs font-bold uppercase tracking-wider mb-1 ${config.titleColor}`}>
                  {config.title}
                </h4>
                <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium leading-relaxed break-words whitespace-pre-line">
                  {toast.message}
                </p>
              </div>
            </div>

            <button
              onClick={() => onDismiss(toast.id)}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors shrink-0 cursor-pointer"
              title="إغلاق التنبيه"
              aria-label="إغلاق التنبيه"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
