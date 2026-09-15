"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { SystemSettings } from "@/types/admin";
import { adminService } from "@/lib/api/adminService";

export type ThemeMode = "light" | "dark";
export type LanguageMode = "ar" | "en";
export type DisplayDensity = "comfortable" | "compact";

export interface AppPreferences {
  theme: ThemeMode;
  language: LanguageMode;
  density: DisplayDensity;
  soundAlerts: boolean;
  emailNotifications: boolean;
  biometricThreshold: number;
}

interface SettingsContextType {
  // Theme & Language
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  language: LanguageMode;
  setLanguage: (lang: LanguageMode) => void;
  toggleLanguage: () => void;
  density: DisplayDensity;
  setDensity: (density: DisplayDensity) => void;

  // Preferences
  soundAlerts: boolean;
  setSoundAlerts: (val: boolean) => void;
  emailNotifications: boolean;
  setEmailNotifications: (val: boolean) => void;
  biometricThreshold: number;
  setBiometricThreshold: (val: number) => void;

  // Modal State
  isSettingsOpen: boolean;
  openSettings: () => void;
  closeSettings: () => void;
  toggleSettings: () => void;

  // Central System Settings (backed by adminService / mockStore)
  systemSettings: SystemSettings;
  updateSystemSettings: (partial: Partial<SystemSettings>) => Promise<void>;
  isLoadingSettings: boolean;

  // Helper dictionary
  t: (key: string) => string;
}

const DEFAULT_PREFERENCES: AppPreferences = {
  theme: "light",
  language: "ar",
  density: "comfortable",
  soundAlerts: true,
  emailNotifications: true,
  biometricThreshold: 95,
};

const DEFAULT_SYSTEM_SETTINGS: SystemSettings = {
  maintenanceMode: false,
  allowPublicRegistration: true,
  maxLoginAttempts: 5,
  sessionTimeoutMinutes: 30,
  enforce2FAForAdmins: true,
  backupIntervalHours: 6,
  lastBackupDate: "2026-09-10T23:00:00Z",
};

// Bilingual dictionary for core application labels
const DICTIONARY: Record<LanguageMode, Record<string, string>> = {
  ar: {
    settingsTitle: "الإعدادات والتفضيلات",
    settingsSubtitle: "تخصيص المظهر، اللغة، وأمان المنظومة الوطنية",
    appearanceTab: "المظهر واللغة",
    securityTab: "الأمان والوصول",
    systemTab: "قواعد النظام المركزية",
    notificationsTab: "التنبيهات والإشعارات",
    backupTab: "النسخ الاحتياطي والمزامنة",
    aboutTab: "حول المنظومة",
    themeLabel: "سمة الواجهة",
    lightMode: "الوضع الفاتح (نهاري)",
    darkMode: "الوضع الداكن (ليلي)",
    languageLabel: "لغة التطبيق",
    arabic: "العربية (RTL)",
    english: "English (LTR)",
    densityLabel: "كثافة العرض",
    comfortable: "قياسي ومريح",
    compact: "مكثف ومضغوط",
    saveSuccess: "تم حفظ التفضيلات بنجاح",
    close: "إغلاق",
    resetDefaults: "استعادة الإعدادات الافتراضية",
    systemInfo: "منظومة هويتي الوطنية الموحدة — الإصدار 2.4.0",
    allAgenciesActive: "كافة القطاعات الحكومية الخمسة متصلة وتعمل بصورة طبيعية",
    createBackupNow: "إنشاء نسخة احتياطية الآن",
    backupSuccess: "تم إنشاء النسخة الاحتياطية بنجاح وحفظها مشفرة.",
  },
  en: {
    settingsTitle: "Settings & Preferences",
    settingsSubtitle: "Customize appearance, language, and national system security",
    appearanceTab: "Appearance & Language",
    securityTab: "Security & Access",
    systemTab: "Central System Rules",
    notificationsTab: "Notifications & Alerts",
    backupTab: "Backup & Sync",
    aboutTab: "About System",
    themeLabel: "Theme Mode",
    lightMode: "Light Mode (Day)",
    darkMode: "Dark Mode (Night)",
    languageLabel: "Application Language",
    arabic: "العربية (RTL)",
    english: "English (LTR)",
    densityLabel: "Interface Density",
    comfortable: "Comfortable (Standard)",
    compact: "Compact (Dense)",
    saveSuccess: "Preferences saved successfully",
    close: "Close",
    resetDefaults: "Reset to Default Settings",
    systemInfo: "Hawiyati Unified National Platform — Version 2.4.0",
    allAgenciesActive: "All 5 government agencies connected and operating normally",
    createBackupNow: "Create Backup Now",
    backupSuccess: "Backup created and encrypted successfully.",
  },
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("light");
  const [language, setLanguageState] = useState<LanguageMode>("ar");
  const [density, setDensityState] = useState<DisplayDensity>("comfortable");
  const [soundAlerts, setSoundAlertsState] = useState(true);
  const [emailNotifications, setEmailNotificationsState] = useState(true);
  const [biometricThreshold, setBiometricThresholdState] = useState(95);

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [systemSettings, setSystemSettings] = useState<SystemSettings>(DEFAULT_SYSTEM_SETTINGS);
  const [isLoadingSettings, setIsLoadingSettings] = useState(false);

  // Apply Theme to DOM
  const applyThemeToDOM = useCallback((t: ThemeMode) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    if (t === "dark") {
      root.classList.add("dark");
      root.setAttribute("data-theme", "dark");
    } else {
      root.classList.remove("dark");
      root.setAttribute("data-theme", "light");
    }
  }, []);

  // Apply Language & Direction to DOM
  const applyLanguageToDOM = useCallback((lang: LanguageMode) => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.setAttribute("lang", lang);
    root.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    if (document.body) {
      document.body.style.direction = lang === "ar" ? "rtl" : "ltr";
      document.body.style.textAlign = lang === "ar" ? "right" : "left";
    }
  }, []);

  // Load preferences and system settings on mount
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Load Theme
    const storedTheme = window.localStorage.getItem("hwyati_theme") as ThemeMode | null;
    if (storedTheme === "dark" || storedTheme === "light") {
      setThemeState(storedTheme);
      applyThemeToDOM(storedTheme);
    } else {
      const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const initialTheme = isSystemDark ? "dark" : "light";
      setThemeState(initialTheme);
      applyThemeToDOM(initialTheme);
    }

    // Load Language
    const storedLang = window.localStorage.getItem("hwyati_lang") as LanguageMode | null;
    if (storedLang === "ar" || storedLang === "en") {
      setLanguageState(storedLang);
      applyLanguageToDOM(storedLang);
    } else {
      applyLanguageToDOM("ar");
    }

    // Load Density
    const storedDensity = window.localStorage.getItem("hwyati_density") as DisplayDensity | null;
    if (storedDensity) {
      setDensityState(storedDensity);
    }

    // Load other preferences
    const storedSound = window.localStorage.getItem("hwyati_sound_alerts");
    if (storedSound !== null) setSoundAlertsState(storedSound === "true");

    const storedEmail = window.localStorage.getItem("hwyati_email_alerts");
    if (storedEmail !== null) setEmailNotificationsState(storedEmail === "true");

    const storedBio = window.localStorage.getItem("hwyati_bio_threshold");
    if (storedBio) setBiometricThresholdState(Number(storedBio));

    // Load central system settings
    setIsLoadingSettings(true);
    adminService
      .getSystemSettings()
      .then((settings) => {
        setSystemSettings(settings);
      })
      .catch((err) => {
        console.error("Failed to load system settings:", err);
      })
      .finally(() => {
        setIsLoadingSettings(false);
      });
  }, [applyThemeToDOM, applyLanguageToDOM]);

  // Set Theme Handler
  const setTheme = (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    applyThemeToDOM(newTheme);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("hwyati_theme", newTheme);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  // Set Language Handler
  const setLanguage = (newLang: LanguageMode) => {
    setLanguageState(newLang);
    applyLanguageToDOM(newLang);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("hwyati_lang", newLang);
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === "ar" ? "en" : "ar");
  };

  // Density Handler
  const setDensity = (newDensity: DisplayDensity) => {
    setDensityState(newDensity);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("hwyati_density", newDensity);
    }
  };

  const setSoundAlerts = (val: boolean) => {
    setSoundAlertsState(val);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("hwyati_sound_alerts", String(val));
    }
  };

  const setEmailNotifications = (val: boolean) => {
    setEmailNotificationsState(val);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("hwyati_email_alerts", String(val));
    }
  };

  const setBiometricThreshold = (val: number) => {
    setBiometricThresholdState(val);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("hwyati_bio_threshold", String(val));
    }
  };

  // Modal handlers
  const openSettings = () => setIsSettingsOpen(true);
  const closeSettings = () => setIsSettingsOpen(false);
  const toggleSettings = () => setIsSettingsOpen((prev) => !prev);

  // Update System Settings
  const updateSystemSettings = async (partial: Partial<SystemSettings>) => {
    try {
      const updated = await adminService.updateSystemSettings(partial);
      setSystemSettings(updated);
    } catch (err) {
      console.error("Failed to update system settings:", err);
      // Still update locally for smooth UX
      setSystemSettings((prev) => ({ ...prev, ...partial }));
    }
  };

  // Translate helper
  const t = (key: string): string => {
    return DICTIONARY[language]?.[key] || DICTIONARY.ar[key] || key;
  };

  return (
    <SettingsContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        language,
        setLanguage,
        toggleLanguage,
        density,
        setDensity,
        soundAlerts,
        setSoundAlerts,
        emailNotifications,
        setEmailNotifications,
        biometricThreshold,
        setBiometricThreshold,
        isSettingsOpen,
        openSettings,
        closeSettings,
        toggleSettings,
        systemSettings,
        updateSystemSettings,
        isLoadingSettings,
        t,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
