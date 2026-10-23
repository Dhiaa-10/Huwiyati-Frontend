"use client";

import React, { useEffect, useRef } from "react";
import {
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Info,
  ShieldAlert,
  Shield,
  X,
} from "lucide-react";

export type DialogType = "danger" | "warning" | "info" | "success";

export interface DialogOptions {
  title?: string;
  message: string | React.ReactNode;
  type?: DialogType;
  icon?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  isConfirm?: boolean; // if false, it acts as an alert (single OK button)
  onConfirm?: () => void;
  onCancel?: () => void;
}

interface UnifiedDialogProps {
  isOpen: boolean;
  options: DialogOptions | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function UnifiedDialog({
  isOpen,
  options,
  onConfirm,
  onCancel,
}: UnifiedDialogProps) {
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Lock body scroll
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    // Auto focus confirm button for seamless accessibility
    const timer = setTimeout(() => {
      confirmBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, onCancel]);

  if (!isOpen || !options) return null;

  const type = options.type || (options.isConfirm ? "warning" : "info");
  const isConfirm = options.isConfirm ?? true;

  // Icon, colors, and badge styling based on type
  const renderIconAndStyles = () => {
    switch (type) {
      case "danger":
        return {
          icon: <ShieldAlert className="w-6 h-6 text-rose-600 dark:text-rose-400" />,
          badgeBg: "bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/50",
          confirmBtn:
            "bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white shadow-rose-900/20",
          defaultTitle: "تأكيد الإجراء الحساس",
          defaultConfirmText: "نعم، تأكيد",
        };
      case "warning":
        return {
          icon: <AlertTriangle className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
          badgeBg: "bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50",
          confirmBtn:
            "bg-[#9A762D] hover:bg-[#836324] active:bg-[#6c511d] text-white shadow-amber-900/20",
          defaultTitle: "تنبيه هام",
          defaultConfirmText: "متابعة",
        };
      case "success":
        return {
          icon: <CheckCircle2 className="w-6 h-6 text-[#126B58] dark:text-[#A8E2C7]" />,
          badgeBg: "bg-[#E5F7EE] dark:bg-[#126B58]/30 border-[#A8E2C7] dark:border-[#126B58]",
          confirmBtn:
            "bg-[#126B58] hover:bg-[#0C4A4E] active:bg-[#052F31] text-white shadow-emerald-900/20",
          defaultTitle: "تم بنجاح",
          defaultConfirmText: "حسناً",
        };
      case "info":
      default:
        return {
          icon: <Shield className="w-6 h-6 text-[#0C4A4E] dark:text-[#BFE5DF]" />,
          badgeBg: "bg-[#E6F1EE] dark:bg-[#07383B] border-[#BFE5DF] dark:border-[#147A77]/40",
          confirmBtn:
            "bg-[#0C4A4E] hover:bg-[#052F31] active:bg-[#031F21] text-white shadow-teal-900/20",
          defaultTitle: "تنبيه المنظومة",
          defaultConfirmText: isConfirm ? "تأكيد" : "حسناً، فهمت",
        };
    }
  };

  const styleConfig = renderIconAndStyles();
  const title = options.title || styleConfig.defaultTitle;
  const confirmText = options.confirmText || styleConfig.defaultConfirmText;
  const cancelText = options.cancelText || "إلغاء";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="unified-dialog-title"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-200 animate-in fade-in"
      dir="rtl"
    >
      {/* Click outside to cancel */}
      <div className="absolute inset-0" onClick={onCancel} />

      {/* Dialog Card */}
      <div className="relative w-full max-w-md bg-white dark:bg-[#052F31] rounded-2xl shadow-2xl border border-[#E7EEEB] dark:border-[#0C4A4E] p-6 overflow-hidden z-10 transition-all duration-200 animate-in zoom-in-95">
        {/* Subtle decorative top bar */}
        <div
          className={`absolute top-0 inset-x-0 h-1.5 ${
            type === "danger"
              ? "bg-rose-500"
              : type === "warning"
              ? "bg-amber-500"
              : type === "success"
              ? "bg-[#126B58]"
              : "bg-[#0C4A4E]"
          }`}
        />

        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 left-4 p-1.5 text-[#6D898A] hover:text-[#163D42] dark:hover:text-white rounded-lg hover:bg-[#F1F6F4] dark:hover:bg-white/10 transition-colors"
          title="إغلاق"
          aria-label="إغلاق"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-4 pt-1">
          {/* Icon Badge */}
          <div
            className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 shadow-xs ${styleConfig.badgeBg}`}
          >
            {options.icon || styleConfig.icon}
          </div>

          {/* Texts */}
          <div className="flex-1 min-w-0 pr-1">
            <h3
              id="unified-dialog-title"
              className="text-base font-bold text-[#163D42] dark:text-[#F1F6F4] leading-snug"
            >
              {title}
            </h3>
            <div className="text-xs sm:text-sm text-[#456A6D] dark:text-[#BFE5DF]/80 mt-1.5 leading-relaxed font-normal">
              {options.message}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-[#E7EEEB] dark:border-[#0C4A4E]/60">
          {isConfirm && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl border border-[#E7EEEB] dark:border-[#0C4A4E] text-[#456A6D] dark:text-[#BFE5DF]/80 hover:bg-[#F1F6F4] dark:hover:bg-[#07383B] text-xs sm:text-sm font-semibold transition-all active:scale-[0.98] cursor-pointer"
            >
              {cancelText}
            </button>
          )}

          <button
            ref={confirmBtnRef}
            type="button"
            onClick={onConfirm}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-sm transition-all active:scale-[0.98] cursor-pointer ${styleConfig.confirmBtn}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
