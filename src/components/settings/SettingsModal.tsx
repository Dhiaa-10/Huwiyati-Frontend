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
      <div className="relative w-full max-w-4xl bg-white dark:bg-[#052F31] rounded-3xl shadow-2xl border border-[#E7EEEB] dark:border-[#0C4A4E] overflow-hidden flex flex-col max-h-[90vh] z-10 transition-colors">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-[#E7EEEB] dark:border-[#0C4A4E]/60 flex items-center justify-between bg-[#F1F6F4] dark:bg-[#031F21]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0C4A4E] dark:bg-[#052F31] text-white flex items-center justify-center shadow-sm">
              <Settings className="w-5 h-5 animate-spin-slow" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#163D42] dark:text-[#BFE5DF]">
                {t("settingsTitle")}
              </h2>
              <p className="text-xs text-[#456A6D] dark:text-[#BFE5DF]/70">
                {t("settingsSubtitle")}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {saveBanner && (
              <span className="text-xs font-semibold text-[#126B58] dark:text-[#BFE5DF] bg-[#E5F7EE] dark:bg-[#126B58]/30 px-3 py-1 rounded-full border border-[#A8E2C7] dark:border-[#126B58] animate-in fade-in flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                <span>{t("saveSuccess")}</span>
              </span>
            )}
            <button
              onClick={closeSettings}
              className="p-2 text-[#6D898A] hover:text-[#163D42] dark:hover:text-white rounded-full hover:bg-[#E7EEEB] dark:hover:bg-white/10 transition-colors"
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
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-l border-[#E7EEEB] dark:border-[#0C4A4E]/40 p-3 bg-[#F1F6F4] dark:bg-[#031F21] flex md:flex-col gap-1 overflow-x-auto md:overflow-y-auto shrink-0">
            <button
              onClick={() => setActiveTab("appearance")}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-start shrink-0 md:w-full ${
                activeTab === "appearance"
                  ? "bg-[#0C4A4E] text-white shadow-sm dark:bg-[#147A77]"
                  : "text-[#456A6D] dark:text-[#BFE5DF]/80 hover:bg-[#E7EEEB] dark:hover:bg-white/5"
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>{t("appearanceTab")}</span>
            </button>

            <button
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-start shrink-0 md:w-full ${
                activeTab === "security"
                  ? "bg-[#0C4A4E] text-white shadow-sm dark:bg-[#147A77]"
                  : "text-[#456A6D] dark:text-[#BFE5DF]/80 hover:bg-[#E7EEEB] dark:hover:bg-white/5"
              }`}
            >
              <Shield className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{t("securityTab")}</span>
            </button>

            <button
              onClick={() => setActiveTab("system")}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-start shrink-0 md:w-full ${
                activeTab === "system"
                  ? "bg-[#0C4A4E] text-white shadow-sm dark:bg-[#147A77]"
                  : "text-[#456A6D] dark:text-[#BFE5DF]/80 hover:bg-[#E7EEEB] dark:hover:bg-white/5"
              }`}
            >
              <Sliders className="w-4 h-4 text-sky-400 shrink-0" />
              <span>{t("systemTab")}</span>
            </button>

            <button
              onClick={() => setActiveTab("notifications")}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-start shrink-0 md:w-full ${
                activeTab === "notifications"
                  ? "bg-[#0C4A4E] text-white shadow-sm dark:bg-[#147A77]"
                  : "text-[#456A6D] dark:text-[#BFE5DF]/80 hover:bg-[#E7EEEB] dark:hover:bg-white/5"
              }`}
            >
              <Bell className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{t("notificationsTab")}</span>
            </button>

            <button
              onClick={() => setActiveTab("backup")}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-start shrink-0 md:w-full ${
                activeTab === "backup"
                  ? "bg-[#0C4A4E] text-white shadow-sm dark:bg-[#147A77]"
                  : "text-[#456A6D] dark:text-[#BFE5DF]/80 hover:bg-[#E7EEEB] dark:hover:bg-white/5"
              }`}
            >
              <Database className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>{t("backupTab")}</span>
            </button>

            <button
              onClick={() => setActiveTab("about")}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all text-start shrink-0 md:w-full ${
                activeTab === "about"
                  ? "bg-[#0C4A4E] text-white shadow-sm dark:bg-[#147A77]"
                  : "text-[#456A6D] dark:text-[#BFE5DF]/80 hover:bg-[#E7EEEB] dark:hover:bg-white/5"
              }`}
            >
              <Info className="w-4 h-4 text-teal-400 shrink-0" />
              <span>{t("aboutTab")}</span>
            </button>
          </div>

          {/* Tab Content Panel */}
          <div className="flex-1 p-6 overflow-y-auto bg-white dark:bg-[#052F31] text-[#163D42] dark:text-[#F1F6F4]">
            {/* TAB 1: APPEARANCE & LANGUAGE */}
            {activeTab === "appearance" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                {/* Theme Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#6D898A] dark:text-[#BFE5DF]/70 mb-3">
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
                          ? "border-[#0C4A4E] ring-2 ring-[#0C4A4E]/20 bg-[#E6F1EE]/50 shadow-sm"
                          : "border-[#E7EEEB] dark:border-[#0C4A4E]/40 hover:border-[#147A77]/40 dark:hover:border-[#0C4A4E] bg-white dark:bg-[#031F21]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                          <Sun className="w-5 h-5" />
                        </div>
                        {theme === "light" && (
                          <div className="w-6 h-6 rounded-full bg-[#0C4A4E] text-white flex items-center justify-center">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#163D42] dark:text-[#BFE5DF]">
                          {t("lightMode")}
                        </h4>
                        <p className="text-xs text-[#456A6D] dark:text-[#BFE5DF]/70 mt-1">
                          واجهة نهارية رسمية بالخلفية العاجية والألوان البترولية المعتمدة.
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
                          ? "border-[#178A86] ring-2 ring-[#178A86]/30 bg-[#07383B] shadow-sm text-white"
                          : "border-[#E7EEEB] dark:border-[#0C4A4E]/40 hover:border-[#147A77]/40 dark:hover:border-[#0C4A4E] bg-white dark:bg-[#031F21]"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-[#0C4A4E] text-[#BFE5DF] flex items-center justify-center">
                          <Moon className="w-5 h-5" />
                        </div>
                        {theme === "dark" && (
                          <div className="w-6 h-6 rounded-full bg-[#178A86] text-white flex items-center justify-center font-bold">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-[#163D42] dark:text-[#BFE5DF]">
                          {t("darkMode")}
                        </h4>
                        <p className="text-xs text-[#456A6D] dark:text-[#BFE5DF]/70 mt-1">
                          سمة داكنة باللون البترولي الليلي العميق متناسقة تماماً مع ألوان التطبيق.
                        </p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Language Selector */}
                <div className="pt-4 border-t border-[#E7EEEB] dark:border-[#0C4A4E]/30">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#6D898A] dark:text-[#BFE5DF]/70 mb-3">
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
                          ? "border-[#0C4A4E] dark:border-[#178A86] ring-2 ring-[#0C4A4E]/20 dark:ring-[#178A86]/30 bg-[#E6F1EE]/50 dark:bg-[#07383B] shadow-sm"
                          : "border-[#E7EEEB] dark:border-[#0C4A4E]/40 hover:border-[#147A77]/40 dark:hover:border-[#0C4A4E] bg-white dark:bg-[#031F21]"
                      }`}
                    >
                      <div className="text-2xl">🇾🇪</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-[#163D42] dark:text-white font-arabic">
                          العربية (IBM Plex Sans Arabic)
                        </div>
                        <div className="text-xs text-[#456A6D] dark:text-[#BFE5DF]/70">
                          الاتجاه من اليمين لليسار (RTL)
                        </div>
                      </div>
                      {language === "ar" && (
                        <CheckCircle2 className="w-5 h-5 text-[#126B58] dark:text-[#BFE5DF] shrink-0" />
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
                          ? "border-[#0C4A4E] dark:border-[#178A86] ring-2 ring-[#0C4A4E]/20 dark:ring-[#178A86]/30 bg-[#E6F1EE]/50 dark:bg-[#07383B] shadow-sm"
                          : "border-[#E7EEEB] dark:border-[#0C4A4E]/40 hover:border-[#147A77]/40 dark:hover:border-[#0C4A4E] bg-white dark:bg-[#031F21]"
                      }`}
                    >
                      <div className="w-8 h-8 rounded-full bg-[#F1F6F4] dark:bg-white/10 flex items-center justify-center text-[#163D42] dark:text-white">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-sm text-[#163D42] dark:text-white font-latin">
                          English (IBM Plex Sans)
                        </div>
                        <div className="text-xs text-[#456A6D] dark:text-[#BFE5DF]/70">
                          Left-to-Right orientation (LTR)
                        </div>
                      </div>
                      {language === "en" && (
                        <CheckCircle2 className="w-5 h-5 text-[#126B58] dark:text-[#BFE5DF] shrink-0" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Display Density */}
                <div className="pt-4 border-t border-[#E7EEEB] dark:border-[#0C4A4E]/30">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#6D898A] dark:text-[#BFE5DF]/70 mb-3">
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
                          ? "bg-[#0C4A4E] text-white border-[#0C4A4E] dark:bg-[#147A77] dark:border-[#147A77]"
                          : "bg-[#F1F6F4] dark:bg-[#031F21] text-[#456A6D] dark:text-[#BFE5DF] border-transparent hover:bg-[#E7EEEB]"
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
                          ? "bg-[#0C4A4E] text-white border-[#0C4A4E] dark:bg-[#147A77] dark:border-[#147A77]"
                          : "bg-[#F1F6F4] dark:bg-[#031F21] text-[#456A6D] dark:text-[#BFE5DF] border-transparent hover:bg-[#E7EEEB]"
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
                <div className="flex items-center justify-between p-4 rounded-2xl border border-[#E7EEEB] dark:border-[#0C4A4E]/40 bg-[#FBFBF8] dark:bg-[#031F21]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#E6F1EE] dark:bg-[#07383B] text-[#0C4A4E] dark:text-[#BFE5DF] flex items-center justify-center">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#163D42] dark:text-white">
                        فرض المصادقة الثنائية (2FA) لمسؤولي القطاعات
                      </h4>
                      <p className="text-xs text-[#456A6D] dark:text-[#BFE5DF]/70 mt-0.5">
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
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#126B58]"></div>
                  </label>
                </div>

                {/* Session Inactivity Timeout */}
                <div className="p-4 rounded-2xl border border-[#E7EEEB] dark:border-[#0C4A4E]/40 bg-[#FBFBF8] dark:bg-[#031F21]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#EAF4FB] dark:bg-[#07383B] text-[#437CA4] dark:text-[#BFE5DF] flex items-center justify-center">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#163D42] dark:text-white">
                          مهلة الجلسة عند الخمول (Session Timeout)
                        </h4>
                        <p className="text-xs text-[#456A6D] dark:text-[#BFE5DF]/70 mt-0.5">
                          تسجيل الخروج التلقائي عند عدم وجود نشاط للحفاظ على سرية السجلات الحكومية.
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#0C4A4E] dark:text-[#BFE5DF] bg-[#E6F1EE] dark:bg-[#07383B] px-3 py-1 rounded-full border border-[#BFE5DF] dark:border-[#0C4A4E]">
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
                            ? "bg-[#0C4A4E] text-white border-[#0C4A4E] dark:bg-[#147A77] dark:border-[#147A77]"
                            : "bg-white dark:bg-[#07383B] text-[#163D42] dark:text-gray-300 border-[#E7EEEB] dark:border-[#0C4A4E]/40 hover:bg-[#F1F6F4]"
                        }`}
                      >
                        {mins} دقيقة
                      </button>
                    ))}
                  </div>
                </div>

                {/* Max Login Attempts */}
                <div className="p-4 rounded-2xl border border-[#E7EEEB] dark:border-[#0C4A4E]/40 bg-[#FBFBF8] dark:bg-[#031F21]">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-sm font-bold text-[#163D42] dark:text-white">
                        الحد الأقصى لمحاولات تسجيل الدخول الخاطئة
                      </h4>
                      <p className="text-xs text-[#456A6D] dark:text-[#BFE5DF]/70 mt-0.5">
                        حظر الحساب مؤقتاً عند تجاوز عدد المحاولات الخاطئة لحمايته من هجمات التخمين.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-[#9A762D] dark:text-amber-400 bg-[#FFF3D8] dark:bg-amber-950/60 px-3 py-1 rounded-full border border-[#FCE1A8] dark:border-amber-800">
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
                            ? "bg-[#0C4A4E] text-white border-[#0C4A4E] dark:bg-[#147A77] dark:border-[#147A77]"
                            : "bg-white dark:bg-[#07383B] text-[#163D42] dark:text-gray-300 border-[#E7EEEB] dark:border-[#0C4A4E]/40 hover:bg-[#F1F6F4]"
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
                <div className="p-4 rounded-2xl border border-[#FACDC0] dark:border-rose-900/50 bg-[#FFF0E7]/50 dark:bg-rose-950/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#FFF0E7] dark:bg-rose-900/60 text-[#B76648] dark:text-rose-300 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#B76648] dark:text-rose-200">
                          وضع الصيانة الشامل للمنظومة
                        </h4>
                        <p className="text-xs text-[#B76648]/80 dark:text-rose-300/80 mt-0.5">
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
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#B76648]"></div>
                    </label>
                  </div>
                </div>

                {/* Public Registration */}
                <div className="flex items-center justify-between p-4 rounded-2xl border border-[#E7EEEB] dark:border-[#0C4A4E]/40 bg-[#FBFBF8] dark:bg-[#031F21]">
                  <div>
                    <h4 className="text-sm font-bold text-[#163D42] dark:text-white">
                      السماح بالتسجيل الذاتي للمواطنين
                    </h4>
                    <p className="text-xs text-[#456A6D] dark:text-[#BFE5DF]/70 mt-0.5">
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
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#126B58]"></div>
                  </label>
                </div>

                {/* Biometric Threshold Slider */}
                <div className="p-4 rounded-2xl border border-[#E7EEEB] dark:border-[#0C4A4E]/40 bg-[#FBFBF8] dark:bg-[#031F21]">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#E6F1EE] dark:bg-[#07383B] text-[#147A77] dark:text-[#BFE5DF] flex items-center justify-center">
                        <Fingerprint className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#163D42] dark:text-white">
                          عتبة التحقق البيومتري (بصمة الإصبع والوجه)
                        </h4>
                        <p className="text-xs text-[#456A6D] dark:text-[#BFE5DF]/70 mt-0.5">
                          الحد الأدنى لنسبة التطابق المطلوبة لاعتماد الهويات الوطنية وتفعيل الحسابات.
                        </p>
                      </div>
                    </div>
                    <span className="text-xs font-bold text-[#147A77] dark:text-[#BFE5DF] bg-[#E6F1EE] dark:bg-[#07383B] px-3 py-1 rounded-full border border-[#BFE5DF] dark:border-[#147A77]">
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
                    className="w-full accent-[#0C4A4E] dark:accent-[#147A77] cursor-pointer"
                  />
                  <div className="flex justify-between text-[11px] text-[#6D898A] mt-1">
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
                <div className="flex items-center justify-between p-4 rounded-2xl border border-[#E7EEEB] dark:border-[#0C4A4E]/40 bg-[#FBFBF8] dark:bg-[#031F21]">
                  <div>
                    <h4 className="text-sm font-bold text-[#163D42] dark:text-white">
                      التنبيهات الصوتية للعمليات العاجلة
                    </h4>
                    <p className="text-xs text-[#456A6D] dark:text-[#BFE5DF]/70 mt-0.5">
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
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0C4A4E]"></div>
                  </label>
                </div>

                {/* Email alerts */}
                <div className="flex items-center justify-between p-4 rounded-2xl border border-[#E7EEEB] dark:border-[#0C4A4E]/40 bg-[#FBFBF8] dark:bg-[#031F21]">
                  <div>
                    <h4 className="text-sm font-bold text-[#163D42] dark:text-white">
                      إشعارات البريد الإلكتروني للمسؤولين
                    </h4>
                    <p className="text-xs text-[#456A6D] dark:text-[#BFE5DF]/70 mt-0.5">
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
                    <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0C4A4E]"></div>
                  </label>
                </div>
              </div>
            )}

            {/* TAB 5: BACKUP & SYNC */}
            {activeTab === "backup" && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="p-5 rounded-2xl border border-[#E7EEEB] dark:border-[#0C4A4E]/40 bg-[#FBFBF8] dark:bg-[#031F21] space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[#163D42] dark:text-white">
                        النسخ الاحتياطي التلقائي المشفر (Automated Backup)
                      </h4>
                      <p className="text-xs text-[#456A6D] dark:text-[#BFE5DF]/70 mt-0.5">
                        يتم حفظ نسخة احتياطية من قواعد بيانات الهيئات الخمس بتشفير AES-256 الحكومي.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-[#126B58] dark:text-[#BFE5DF] bg-[#E5F7EE] dark:bg-[#126B58]/30 px-3 py-1 rounded-full border border-[#A8E2C7] dark:border-[#126B58]">
                      كل {systemSettings.backupIntervalHours} ساعات
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-2 text-xs">
                    <div className="p-3 rounded-xl bg-white dark:bg-[#07383B] border border-[#E7EEEB] dark:border-[#0C4A4E]/30">
                      <span className="text-[#6D898A] block mb-1">آخر نسخة احتياطية:</span>
                      <span className="font-bold text-[#163D42] dark:text-white">
                        {new Date(systemSettings.lastBackupDate).toLocaleDateString("ar-YE", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div className="p-3 rounded-xl bg-white dark:bg-[#07383B] border border-[#E7EEEB] dark:border-[#0C4A4E]/30">
                      <span className="text-[#6D898A] block mb-1">حجم البيانات التراكمي:</span>
                      <span className="font-bold text-[#163D42] dark:text-white">
                        42.8 ميجابايت (سجلات مدمجة)
                      </span>
                    </div>
                  </div>

                  {backupProgress !== null && (
                    <div className="space-y-1.5 pt-2">
                      <div className="flex justify-between text-xs text-[#0C4A4E] dark:text-[#BFE5DF] font-bold">
                        <span>جاري تجميع قواعد البيانات الخمس وتشفير الحزمة...</span>
                        <span>{backupProgress}%</span>
                      </div>
                      <div className="w-full h-2.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        <div
                          className="h-full bg-[#126B58] transition-all duration-150 rounded-full"
                          style={{ width: `${backupProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {backupSuccess && (
                    <div className="p-3 rounded-xl bg-[#E5F7EE] dark:bg-[#126B58]/30 border border-[#A8E2C7] dark:border-[#126B58] text-xs text-[#126B58] dark:text-[#BFE5DF] flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#126B58]" />
                      <span>{t("backupSuccess")}</span>
                    </div>
                  )}

                  <div className="pt-2">
                    <button
                      type="button"
                      disabled={backupProgress !== null}
                      onClick={handleBackupNow}
                      className="w-full py-3 px-4 rounded-xl bg-[#0C4A4E] hover:bg-[#052F31] text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
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
                  <div className="w-20 h-20 rounded-3xl bg-[#0C4A4E] dark:bg-[#052F31] p-3 flex items-center justify-center shadow-lg border-2 border-[#BFE5DF]/40">
                    <HwyatiLogo size={56} showText={false} />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-extrabold text-[#0C4A4E] dark:text-white">
                    Hawiyati Enterprise Platform
                  </h3>
                  <p className="text-xs text-[#456A6D] dark:text-[#BFE5DF]/70 mt-1">
                    {t("systemInfo")}
                  </p>
                  <p className="text-xs font-semibold text-[#126B58] dark:text-[#BFE5DF] mt-2 bg-[#E5F7EE] dark:bg-[#126B58]/30 py-1.5 px-4 rounded-full inline-block border border-[#A8E2C7] dark:border-[#126B58]">
                    {t("allAgenciesActive")}
                  </p>
                </div>

                <div className="max-w-md mx-auto grid grid-cols-2 gap-2 text-start text-xs pt-4 border-t border-[#E7EEEB] dark:border-[#0C4A4E]/30">
                  <div className="p-3 rounded-xl bg-[#F1F6F4] dark:bg-[#031F21]">
                    <span className="text-[#6D898A] block text-[11px]">حالة البوابة:</span>
                    <span className="font-bold text-[#163D42] dark:text-white">جاهز للتشغيل والربط</span>
                  </div>
                  <div className="p-3 rounded-xl bg-[#F1F6F4] dark:bg-[#031F21]">
                    <span className="text-[#6D898A] block text-[11px]">شهادة التشفير:</span>
                    <span className="font-bold text-[#163D42] dark:text-white">ECDSA P-384 صالحة</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-3 border-t border-[#E7EEEB] dark:border-[#0C4A4E]/40 flex items-center justify-between bg-[#F1F6F4] dark:bg-[#031F21] text-xs text-[#456A6D] dark:text-[#BFE5DF]/70">
          <span>يتم تطبيق التغييرات فورياً وحفظها تلقائياً.</span>
          <button
            onClick={closeSettings}
            className="px-5 py-2 rounded-xl bg-[#0C4A4E] hover:bg-[#052F31] dark:bg-[#147A77] dark:hover:bg-[#178A86] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            {t("close")}
          </button>
        </div>
      </div>
    </div>
  );
}
