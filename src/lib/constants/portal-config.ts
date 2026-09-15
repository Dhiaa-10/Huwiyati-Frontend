import { UserRole } from "@/types/auth";

export interface PortalConfig {
  role: UserRole;
  title: string;
  shortTitle: string;
  subtitle: string;
  routePrefix: string;
  badgeText: string;
  colorClass: {
    primary: string;
    bgLight: string;
    border: string;
    text: string;
  };
}

export const PORTALS_CONFIG: Record<UserRole, PortalConfig> = {
  SUPER_ADMIN: {
    role: "SUPER_ADMIN",
    title: "منظومة هويتي - الإشراف العام ورئاسة المنظومة",
    shortTitle: "السوبر أدمن",
    subtitle: "إدارة الهيئات الحكومية والصلاحيات والرقابة العامة",
    routePrefix: "/admin",
    badgeText: "إدارة عليا",
    colorClass: {
      primary: "bg-emerald-700",
      bgLight: "bg-emerald-50",
      border: "border-emerald-200",
      text: "text-emerald-700",
    },
  },
  CIVIL_MANAGER: {
    role: "CIVIL_MANAGER",
    title: "مصلحة الأحوال المدنية والسجل المدني - إدارة الفرع",
    shortTitle: "إدارة الأحوال المدنية",
    subtitle: "متابعة أعمال الموظفين والطلبات والتقارير الإحصائية",
    routePrefix: "/civil-registry",
    badgeText: "مدير الأحوال",
    colorClass: {
      primary: "bg-sky-700",
      bgLight: "bg-sky-50",
      border: "border-sky-200",
      text: "text-sky-700",
    },
  },
  CIVIL_OFFICER: {
    role: "CIVIL_OFFICER",
    title: "مصلحة الأحوال المدنية والسجل المدني",
    shortTitle: "الأحوال المدنية",
    subtitle: "تفعيل الحسابات، إصدار وتجديد البطاقات، المواليد، الوفيات، والزواج",
    routePrefix: "/civil-registry",
    badgeText: "موظف أحوال",
    colorClass: {
      primary: "bg-sky-700",
      bgLight: "bg-sky-50",
      border: "border-sky-200",
      text: "text-sky-700",
    },
  },
  PASSPORT_OFFICER: {
    role: "PASSPORT_OFFICER",
    title: "مصلحة الهجرة والجوازات والجنسية",
    shortTitle: "الهجرة والجوازات",
    subtitle: "طلبات تجديد الجوازات، تدقيق الوثائق، وسجلات المنافذ والسفر",
    routePrefix: "/passports",
    badgeText: "موظف جوازات",
    colorClass: {
      primary: "bg-indigo-700",
      bgLight: "bg-indigo-50",
      border: "border-indigo-200",
      text: "text-indigo-700",
    },
  },
  TRAFFIC_OFFICER: {
    role: "TRAFFIC_OFFICER",
    title: "الإدارة العامة للمرور",
    shortTitle: "المرور",
    subtitle: "إدارة رخص القيادة، رخص المركبات، والمخالفات المرورية",
    routePrefix: "/traffic",
    badgeText: "موظف مرور",
    colorClass: {
      primary: "bg-amber-700",
      bgLight: "bg-amber-50",
      border: "border-amber-200",
      text: "text-amber-700",
    },
  },
  HOSPITAL_OFFICER: {
    role: "HOSPITAL_OFFICER",
    title: "بوابة المنشآت الصحية والمستشفيات",
    shortTitle: "المستشفيات",
    subtitle: "تسجيل بلاغات الولادة والوفاة وإدارة السجل الطبي",
    routePrefix: "/hospital",
    badgeText: "موظف صحي",
    colorClass: {
      primary: "bg-teal-700",
      bgLight: "bg-teal-50",
      border: "border-teal-200",
      text: "text-teal-700",
    },
  },
};

export const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  Pending: {
    label: "قيد الانتظار",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    dot: "bg-amber-500",
  },
  UnderReview: {
    label: "قيد المراجعة",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    dot: "bg-blue-500",
  },
  Approved: {
    label: "معتمد",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  Rejected: {
    label: "مرفوض",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    dot: "bg-rose-500",
  },
  Issued: {
    label: "تم الإصدار",
    bg: "bg-teal-50",
    text: "text-teal-700",
    border: "border-teal-200",
    dot: "bg-teal-500",
  },
  Completed: {
    label: "مكتمل",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  Active: {
    label: "سارٍ / نشط",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    dot: "bg-emerald-500",
  },
  Expired: {
    label: "منتهي",
    bg: "bg-slate-100",
    text: "text-slate-600",
    border: "border-slate-200",
    dot: "bg-slate-400",
  },
  Suspended: {
    label: "موقوف",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    dot: "bg-rose-500",
  },
};
