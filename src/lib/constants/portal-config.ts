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
      primary: "bg-[#0C4A4E]",
      bgLight: "bg-[#E6F1EE]",
      border: "border-[#BFE5DF]",
      text: "text-[#0C4A4E]",
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
      primary: "bg-[#147A77]",
      bgLight: "bg-[#E6F1EE]",
      border: "border-[#BFE5DF]",
      text: "text-[#147A77]",
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
      primary: "bg-[#147A77]",
      bgLight: "bg-[#E6F1EE]",
      border: "border-[#BFE5DF]",
      text: "text-[#147A77]",
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
      primary: "bg-[#147A77]",
      bgLight: "bg-[#E6F1EE]",
      border: "border-[#BFE5DF]",
      text: "text-[#147A77]",
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
      primary: "bg-[#103F43]",
      bgLight: "bg-[#F1F6F4]",
      border: "border-[#E7EEEB]",
      text: "text-[#103F43]",
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
      primary: "bg-[#437CA4]",
      bgLight: "bg-[#EAF4FB]",
      border: "border-[#BCE0F7]",
      text: "text-[#437CA4]",
    },
  },
};

export const STATUS_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string; dot: string }
> = {
  Pending: {
    label: "قيد الانتظار",
    bg: "bg-[#FFF3D8]",
    text: "text-[#9A762D]",
    border: "border-[#FCE1A8]",
    dot: "bg-[#9A762D]",
  },
  UnderReview: {
    label: "قيد المراجعة",
    bg: "bg-[#FFF3D8]",
    text: "text-[#9A762D]",
    border: "border-[#FCE1A8]",
    dot: "bg-[#9A762D]",
  },
  Approved: {
    label: "معتمد",
    bg: "bg-[#E5F7EE]",
    text: "text-[#126B58]",
    border: "border-[#A8E2C7]",
    dot: "bg-[#126B58]",
  },
  Rejected: {
    label: "مرفوض",
    bg: "bg-[#FFF0E7]",
    text: "text-[#B76648]",
    border: "border-[#FACDC0]",
    dot: "bg-[#B76648]",
  },
  Issued: {
    label: "تم الإصدار",
    bg: "bg-[#E6F1EE]",
    text: "text-[#147A77]",
    border: "border-[#BFE5DF]",
    dot: "bg-[#147A77]",
  },
  Completed: {
    label: "مكتمل",
    bg: "bg-[#E5F7EE]",
    text: "text-[#126B58]",
    border: "border-[#A8E2C7]",
    dot: "bg-[#126B58]",
  },
  Active: {
    label: "سارٍ / نشط",
    bg: "bg-[#E5F7EE]",
    text: "text-[#126B58]",
    border: "border-[#A8E2C7]",
    dot: "bg-[#126B58]",
  },
  Expired: {
    label: "منتهي",
    bg: "bg-[#FFF0E7]",
    text: "text-[#B76648]",
    border: "border-[#FACDC0]",
    dot: "bg-[#B76648]",
  },
  Suspended: {
    label: "موقوف",
    bg: "bg-[#FFF0E7]",
    text: "text-[#B76648]",
    border: "border-[#FACDC0]",
    dot: "bg-[#B76648]",
  },
};
