"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Settings,
  Sun,
  Moon,
  Globe,
  Shield,
  Bell,
  Database,
  Info,
  Check,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Sliders,
  Lock,
  Clock,
  Fingerprint,
  RefreshCw,
  DownloadCloud,
  FileCheck,
  LayoutGrid,
} from "lucide-react";
import { useSettings } from "@/context/SettingsContext";
import { HwyatiLogo } from "@/components/ui/hwyati-logo";

type ActiveTab = "appearance" | "security" | "system" | "notifications" | "backup" | "about";

export function SettingsModal() {
  const {
    theme,
    setTheme,
    language,
    setLanguage,
    density,
    setDensity,
    soundAlerts,
    setSoundAlerts,
    emailNotifications,
    setEmailNotifications,
    biometricThreshold,
    setBiometricThreshold,
    isSettingsOpen,
    closeSettings,
    systemSettings,
    updateSystemSettings,
    t,
  } = useSettings();

  const [activeTab, setActiveTab] = useState<ActiveTab>("appearance");
  const [backupProgress, setBackupProgress] = useState<number | null>(null);
  const [backupSuccess, setBackupSuccess] = useState(false);
  const [saveBanner, setSaveBanner] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isSettingsOpen) {
        closeSettings();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isSettingsOpen, closeSettings]);

  if (!isSettingsOpen) return null;

  const showSavedFeedback = () => {
    setSaveBanner(true);
    setTimeout(() => setSaveBanner(false), 2000);
  };

  const handleBackupNow = () => {
    setBackupProgress(10);
    const interval = setInterval(() => {
      setBackupProgress((prev) => {
        if (prev === null) return 10;
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => {
            setBackupProgress(null);
            setBackupSuccess(true);
            updateSystemSettings({
              lastBackupDate: new Date().toISOString(),
            });
            setTimeout(() => setBackupSuccess(false), 3500);
          }, 400);
          return 100;
        }
        return prev + 20;
      });
    }, 180);
  };

  const isRtl = language === "ar";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 md:p-6 bg-black/65 backdrop-blur-md animate-in fade-in duration-200">
      {/* Click outside to close backdrop */}
      <div className="absolute inset-0" onClick={closeSettings} />

      {/* Main Modal Card */}
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#061f30] rounded-3xl shadow-2xl border border-[#c0c7ce]/50 dark:border-[#0b4f6c]/60 overflow-hidden flex flex-col max-h-[90vh] z-10 transition-colors">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-[#c0c7ce]/30 dark:border-[#0b4f6c]/40 flex items-center justify-between bg-[#f8fafc] dark:bg-[#041724]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#00374e] dark:bg-[#0b4f6c] text-white flex items-center justify-center shadow-sm">
              <Settings className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#00374e] dark:text-[#8ac0e1]">
                {t("settingsTitle")}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {t("settingsSubtitle")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {saveBanner && (
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 animate-in fade-in flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>{t("saveSuccess")}</span>
              </span>
            )}
            <button
              onClick={closeSettings}
              className="p-2 text-gray-400 hover:text-gray-700 dark:hover:text-white rounded-full hover:bg-gray-200/50 dark:hover:bg-white/10 transition-colors"
              title={t("close")}
              aria-label={t("close")}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body: Sidebar + Tab Content */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden min-h-[460px]">
          {/* Navigation Sidebar */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-l dark:border-[#0b4f6c]/30 p-3 bg-[#f7f9fb] dark:bg-[#041927] flex md:flex-col gap-1 overflow-x-auto md:overflow-y-auto shrink-0">
            <button
              onClick={() => setActiveTab("appearance")}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-start shrink-0 md:w-full ${
                activeTab === "appearance"
                  ? "bg-[#00374e] text-white shadow-sm dark:bg-[#0b4f6c]"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-white/5"
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{t("appearanceTab")}</span>
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-start shrink-0 md:w-full ${
                activeTab === "security"
                  ? "bg-[#00374e] text-white shadow-sm dark:bg-[#0b4f6c]"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-white/5"
              }`}
            >
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{t("securityTab")}</span>
            </button>

            <button
              onClick={() => setActiveTab("system")}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-start shrink-0 md:w-full ${
                activeTab === "system"
                  ? "bg-[#00374e] text-white shadow-sm dark:bg-[#0b4f6c]"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-white/5"
              }`}
            >
              <Sliders className="w-4 h-4 text-sky-400 shrink-0" />
              <span>{t("systemTab")}</span>
            </button>

            <button
              onClick={() => setActiveTab("notifications")}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-start shrink-0 md:w-full ${
                activeTab === "notifications"
                  ? "bg-[#00374e] text-white shadow-sm dark:bg-[#0b4f6c]"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-white/5"
              }`}
            >
              <Bell className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{t("notificationsTab")}</span>
            </button>

            <button
              onClick={() => setActiveTab("backup")}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-start shrink-0 md:w-full ${
                activeTab === "backup"
                  ? "bg-[#00374e] text-white shadow-sm dark:bg-[#0b4f6c]"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-white/5"
              }`}
            >
              <Database className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>{t("backupTab")}</span>
            </button>

            <button
              onClick={() => setActiveTab("about")}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-start shrink-0 md:w-full ${
                activeTab === "about"
                  ? "bg-[#00374e] text-white shadow-sm dark:bg-[#0b4f6c]"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-200/60 dark:hover:bg-white/5"
              }`}
            >
              <Info className="w-4 h-4 text-teal-400 shrink-0" />
              <span>{t("aboutTab")}</span>
            </button>
          </div>

          {/* Tab Content Panel */}
          <div className="flex-1 p-6 overflow-y-auto bg-white dark:bg-[#061f30] text-[#191c1e] dark:text-slate-100">
            {/* TAB 1: APPEARANCE & LANGUAGE */}
            {activeTab === "appearance" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Theme Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-3">
                    {t("themeLabel")}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Light Mode Card */}
                    <button
                      type="button"
                      onClick={() => {
                        setTheme("light");
                        showSavedFeedback();
                      }}
                      className={`p-4 rounded-2xl border text-start transition-all cursor-pointer relative group flex flex-col justify-between ${
                        theme === "light"
                          ? "border-[#00374e] ring-2 ring-[#00374e]/20 bg-sky-50/40 shadow-sm"
                          : "border-gray-200 dark:border-[#0b4f6c]/40 hover:border-gray-300 dark:hover:border-[#0b4f6c] bg-white dark:bg-[#041724]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                          <Sun className="w-5 h-5" />
                        </div>
                        {theme === "light" && (
                          <div className="w-6 h-6 rounded-full bg-[#00374e] text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#00374e] dark:text-[#8ac0e1]">
                          {t("lightMode")}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          واجهة نهارية مشرقة باللون الأبيض ودرجات الكحلي المعتمدة.
                        </p>
                      </div>
                    </button>

                    {/* Dark Mode Card */}
                    <button
                      type="button"
                      onClick={() => {
                        setTheme("dark");
                        showSavedFeedback();
                      }}
                      className={`p-4 rounded-2xl border text-start transition-all cursor-pointer relative group flex flex-col justify-between ${
                        theme === "dark"
                          ? "border-[#8ac0e1] ring-2 ring-[#8ac0e1]/30 bg-[#0b2b40] shadow-sm text-white"
                          : "border-gray-200 dark:border-[#0b4f6c]/40 hover:border-gray-300 dark:hover:border-[#0b4f6c] bg-white dark:bg-[#041724]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-900/60 text-indigo-300 flex items-center justify-center">
                          <Moon className="w-5 h-5" />
                        </div>
                        {theme === "dark" && (
                          <div className="w-6 h-6 rounded-full bg-[#8ac0e1] text-[#00374e] flex items-center justify-center font-bold">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#00374e] dark:text-[#8ac0e1]">
                          {t("darkMode")}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          سمة داكنة باللون الأسود والأزرق النفطي العميق متناسقة تماماً مع ألوان التطبيق.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Language Selector */}
                <div className="pt-4 border-t border-gray-100 dark:border-[#0b4f6c]/30">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-3">
                    {t("languageLabel")}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Arabic */}
                    <button
                      type="button"
                      onClick={() => {
                        setLanguage("ar");
                        showSavedFeedback();
                      }}
                      className={`p-4 rounded-2xl border text-start transition-all cursor-pointer relative flex items-center gap-3 ${
                        language === "ar"
                          ? "border-[#00374e] dark:border-[#8ac0e1] ring-2 ring-[#00374e]/20 dark:ring-[#8ac0e1]/30 bg-sky-50/40 dark:bg-[#0b2b40] shadow-sm"
                          : "border-gray-200 dark:border-[#0b4f6c]/40 hover:border-gray-300 dark:hover:border-[#0b4f6c] bg-white dark:bg-[#041724]"
                      }`}
                    >
                      <div className="text-2xl">🇾🇪</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-[#00374e] dark:text-white">
                          العربية (اليمن)
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          الاتجاه من اليمين لليسار (RTL)
                        </div>
                      </div>
                      {language === "ar" && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      )}
                    </button>

                    {/* English */}
                    <button
                      type="button"
                      onClick={() => {
                        setLanguage("en");
                        showSavedFeedback();
                      }}
                      className={`p-4 rounded-2xl border text-start transition-all cursor-pointer relative flex items-center gap-3 ${
                        language === "en"
                          ? "border-[#00374e] dark:border-[#8ac0e1] ring-2 ring-[#00374e]/20 dark:ring-[#8ac0e1]/30 bg-sky-50/40 dark:bg-[#0b2b40] shadow-sm"
                          : "border-gray-200 dark:border-[#0b4f6c]/40 hover:border-gray-300 dark:hover:border-[#0b4f6c] bg-white dark:bg-[#041724]"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-slate-700 dark:text-slate-200">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-[#00374e] dark:text-white">
                          English (International)
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          Left-to-Right orientation (LTR)
                        </div>
                      </div>
                      {language === "en" && (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Display Density */}
                <div className="pt-4 border-t border-gray-100 dark:border-[#0b4f6c]/30">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-400 mb-3">
                    {t("densityLabel")}
                  </label>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setDensity("comfortable");
                        showSavedFeedback();
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                        density === "comfortable"
                          ? "bg-[#00374e] text-white border-[#00374e] dark:bg-[#0b4f6c] dark:border-[#0b4f6c]"
                          : "bg-gray-100 dark:bg-[#041724] text-gray-700 dark:text-gray-300 border-transparent hover:bg-gray-200"
                      }`}
                    >
                      {t("comfortable")}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setDensity("compact");
                        showSavedFeedback();
                      }}
                      className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                        density === "compact"
                          ? "bg-[#00374e] text-white border-[#00374e] dark:bg-[#0b4f6c] dark:border-[#0b4f6c]"
                          : "bg-gray-100 dark:bg-[#041724] text-gray-700 dark:text-gray-300 border-transparent hover:bg-gray-200"
                      }`}
                    >
                      {t("compact")}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: SECURITY & ACCESS */}
            {activeTab === "security" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* 2FA Enforcement */}
                <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 dark:border-[#0b4f6c]/40 bg-[#f8fafc] dark:bg-[#041724]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#00374e] dark:text-white">
                        فرض المصادقة الثنائية (2FA) لمسؤولي القطاعات
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        إلزام كافة مسؤولي الأحوال، الجوازات، المرور، والمستشفيات بتأكيد الدخول عبر الرمز المؤقت.
                      </p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={systemSettings.enforce2FAForAdmins}
                      onChange={(e) => {
                        updateSystemSettings({ enforce2FAForAdmins: e.target.checked });
                        showSavedFeedback();
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#005539]"></div>
                  </label>
                </div>

                {/* Session Inactivity Timeout */}
                <div className="p-4 rounded-2xl border border-gray-200 dark:border-[#0b4f6c]/40 bg-[#f8fafc] dark:bg-[#041724]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-400 flex items-center justify-center">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#00374e] dark:text-white">
                          مهلة الجلسة عند الخمول (Session Timeout)
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          تسجيل الخروج التلقائي عند عدم وجود نشاط للحفاظ على سرية السجلات الحكومية.
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#0b4f6c] dark:text-[#8ac0e1] bg-sky-100 dark:bg-[#0b2b40] px-3 py-1 rounded-full">
                      {systemSettings.sessionTimeoutMinutes} دقيقة
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {[15, 30, 60].map((mins) => (
                      <button
                        key={mins}
                        type="button"
                        onClick={() => {
                          updateSystemSettings({ sessionTimeoutMinutes: mins });
                          showSavedFeedback();
                        }}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                          systemSettings.sessionTimeoutMinutes === mins
                            ? "bg-[#00374e] text-white border-[#00374e] dark:bg-[#0b4f6c] dark:border-[#0b4f6c]"
                            : "bg-white dark:bg-[#072439] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-[#0b4f6c]/40 hover:bg-gray-50"
                        }`}
                      >
                        {mins} دقيقة
                      </button>
                    ))}
                  </div>
                </div>

                {/* Max Login Attempts */}
                <div className="p-4 rounded-2xl border border-gray-200 dark:border-[#0b4f6c]/40 bg-[#f8fafc] dark:bg-[#041724]">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-bold text-[#00374e] dark:text-white">
                        الحد الأقصى لمحاولات تسجيل الدخول الخاطئة
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        حظر الحساب مؤقتاً عند تجاوز عدد المحاولات الخاطئة لحمايته من هجمات التخمين.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-3 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                      {systemSettings.maxLoginAttempts} محاولات
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-3">
                    {[3, 5, 10].map((attempts) => (
                      <button
                        key={attempts}
                        type="button"
                        onClick={() => {
                          updateSystemSettings({ maxLoginAttempts: attempts });
                          showSavedFeedback();
                        }}
                        className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all ${
                          systemSettings.maxLoginAttempts === attempts
                            ? "bg-[#00374e] text-white border-[#00374e] dark:bg-[#0b4f6c] dark:border-[#0b4f6c]"
                            : "bg-white dark:bg-[#072439] text-gray-700 dark:text-gray-300 border-gray-200 dark:border-[#0b4f6c]/40 hover:bg-gray-50"
                        }`}
                      >
                        {attempts} محاولات
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: SYSTEM CENTRAL RULES */}
            {activeTab === "system" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Maintenance Mode */}
                <div className="p-4 rounded-2xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                          وضع الصيانة الشامل للمنظومة
                        </h4>
                        <p className="text-xs text-rose-700/80 dark:text-rose-300/80 mt-0.5">
                          عند التفعيل، يتم تعليق استقبال الطلبات الجديدة من المواطنين مؤقتاً للصيانة الطارئة.
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={systemSettings.maintenanceMode}
                        onChange={(e) => {
                          updateSystemSettings({ maintenanceMode: e.target.checked });
                          showSavedFeedback();
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                    </label>
                  </div>
                </div>

                {/* Public Registration */}
                <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 dark:border-[#0b4f6c]/40 bg-[#f8fafc] dark:bg-[#041724]">
                  <div>
                    <h4 className="text-sm font-bold text-[#00374e] dark:text-white">
                      السماح بالتسجيل الذاتي للمواطنين
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      إتاحة إنشاء حساب مواطن جديد عبر تطبيق الهوية الذكية أو حصر التسجيل بالموظفين.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={systemSettings.allowPublicRegistration}
                      onChange={(e) => {
                        updateSystemSettings({ allowPublicRegistration: e.target.checked });
                        showSavedFeedback();
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#005539]"></div>
                  </label>
                </div>

                {/* Biometric Threshold Slider */}
                <div className="p-4 rounded-2xl border border-gray-200 dark:border-[#0b4f6c]/40 bg-[#f8fafc] dark:bg-[#041724]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-400 flex items-center justify-center">
                        <Fingerprint className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#00374e] dark:text-white">
                          عتبة التحقق البيومتري (بصمة الإصبع والوجه)
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          الحد الأدنى لنسبة التطابق المطلوبة لاعتماد الهويات الوطنية وتفعيل الحسابات.
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 px-3 py-1 rounded-full border border-teal-200 dark:border-teal-800">
                      {biometricThreshold}% (أمان عالٍ)
                    </span>
                  </div>

                  <input
                    type="range"
                    min="80"
                    max="99"
                    step="1"
                    value={biometricThreshold}
                    onChange={(e) => {
                      setBiometricThreshold(Number(e.target.value));
                      showSavedFeedback();
                    }}
                    className="w-full accent-[#005539] dark:accent-[#8ac0e1] cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-gray-400 mt-1">
                    <span>80% (تساهل)</span>
                    <span>90% (قياسي)</span>
                    <span>95% (موصى به للأحوال والجوازات)</span>
                    <span>99% (أمان عسكري فائق)</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: NOTIFICATIONS & ALERTS */}
            {activeTab === "notifications" && (
              <div className="space-y-4 animate-in fade-in duration-200">
                {/* Audio chime */}
                <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 dark:border-[#0b4f6c]/40 bg-[#f8fafc] dark:bg-[#041724]">
                  <div>
                    <h4 className="text-sm font-bold text-[#00374e] dark:text-white">
                      التنبيهات الصوتية للعمليات العاجلة
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      تشغيل نغمة صوتية رسمية عند رصد مخالفة جديدة، طلب جواز مستعجل، أو فرز طوارئ.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={soundAlerts}
                      onChange={(e) => {
                        setSoundAlerts(e.target.checked);
                        showSavedFeedback();
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0b4f6c]"></div>
                  </label>
                </div>

                {/* Email alerts */}
                <div className="flex items-center justify-between p-4 rounded-2xl border border-gray-200 dark:border-[#0b4f6c]/40 bg-[#f8fafc] dark:bg-[#041724]">
                  <div>
                    <h4 className="text-sm font-bold text-[#00374e] dark:text-white">
                      إشعارات البريد الإلكتروني للمسؤولين
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      إرسال تقرير إحصائي يومي ملخص لمدراء الهيئات والفروع.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={emailNotifications}
                      onChange={(e) => {
                        setEmailNotifications(e.target.checked);
                        showSavedFeedback();
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0b4f6c]"></div>
                  </label>
                </div>
              </div>
            )}

            {/* TAB 5: BACKUP & SYNC */}
            {activeTab === "backup" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="p-5 rounded-2xl border border-gray-200 dark:border-[#0b4f6c]/40 bg-[#f8fafc] dark:bg-[#041724] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[#00374e] dark:text-white">
                        النسخ الاحتياطي التلقائي المشفر (Automated Backup)
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        يتم حفظ نسخة احتياطية من قواعد بيانات الهيئات الخمس بتشفير AES-256 الحكومي.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-200 dark:border-emerald-800">
                      كل {systemSettings.backupIntervalHours} ساعات
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="p-3 rounded-xl bg-white dark:bg-[#072439] border border-gray-200 dark:border-[#0b4f6c]/30">
                      <span className="text-gray-400 block mb-1">آخر نسخة احتياطية:</span>
                      <span className="font-bold text-[#00374e] dark:text-white">
                        {new Date(systemSettings.lastBackupDate).toLocaleDateString("ar-YE", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-[#072439] border border-gray-200 dark:border-[#0b4f6c]/30">
                      <span className="text-gray-400 block mb-1">حجم البيانات التراكمي:</span>
                      <span className="font-bold text-[#00374e] dark:text-white">
                        42.8 ميجابايت (سجلات مدمجة)
                      </span>
                    </div>
                  </div>

                  {backupProgress !== null && (
                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-xs text-[#0b4f6c] dark:text-[#8ac0e1] font-bold">
                        <span>جاري تجميع قواعد البيانات الخمس وتشفير الحزمة...</span>
                        <span>{backupProgress}%</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 transition-all duration-150 rounded-full"
                          style={{ width: `${backupProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {backupSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{t("backupSuccess")}</span>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={backupProgress !== null}
                      onClick={handleBackupNow}
                      className="w-full py-3 px-4 rounded-xl bg-[#0b4f6c] hover:bg-[#00374e] text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <DownloadCloud className="w-4 h-4" />
                      <span>{t("createBackupNow")}</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: ABOUT */}
            {activeTab === "about" && (
              <div className="space-y-6 text-center py-4 animate-in fade-in duration-200">
                <div className="flex justify-center">
                  <div className="w-20 h-20 rounded-3xl bg-[#00374e] dark:bg-[#0b4f6c] p-3 flex items-center justify-center shadow-lg border-2 border-[#8ac0e1]/40">
                    <HwyatiLogo size={56} showText={false} />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-extrabold text-[#00374e] dark:text-white">
                    Hawiyati Enterprise Platform
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {t("systemInfo")}
                  </p>
                  <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 mt-2 bg-emerald-50 dark:bg-emerald-950/40 py-1.5 px-4 rounded-full inline-block border border-emerald-200 dark:border-emerald-800">
                    {t("allAgenciesActive")}
                  </p>
                </div>

                <div className="max-w-md mx-auto grid grid-cols-2 gap-2 text-start text-xs pt-4 border-t border-gray-100 dark:border-[#0b4f6c]/30">
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#041724]">
                    <span className="text-gray-400 block text-[11px]">حالة البوابة:</span>
                    <span className="font-bold text-[#00374e] dark:text-white">جاهز للتشغيل والربط</span>
                  </div>
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-[#041724]">
                    <span className="text-gray-400 block text-[11px]">شهادة التشفير:</span>
                    <span className="font-bold text-[#00374e] dark:text-white">ECDSA P-384 صالحة</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-3 border-t border-[#c0c7ce]/30 dark:border-[#0b4f6c]/40 flex items-center justify-between bg-[#f8fafc] dark:bg-[#041724] text-xs text-gray-500 dark:text-gray-400">
          <span>يتم تطبيق التغييرات فورياً وحفظها تلقائياً.</span>
          <button
            onClick={closeSettings}
            className="px-5 py-2 rounded-xl bg-[#00374e] hover:bg-[#0b4f6c] dark:bg-[#0b4f6c] dark:hover:bg-[#8ac0e1] text-white dark:hover:text-[#00374e] text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
}
