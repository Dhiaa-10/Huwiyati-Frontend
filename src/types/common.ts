export type RequestStatus =
  | "Pending"
  | "UnderReview"
  | "Approved"
  | "Rejected"
  | "Issued"
  | "Completed";

export interface PaginationParams {
  page: number;
  pageSize: number;
  total: number;
}

export interface StatsMetric {
  id: string;
  label: string;
  value: number | string;
  change?: string;
  isPositive?: boolean;
  subtext?: string;
  iconName?: string;
  colorTheme?: "emerald" | "blue" | "amber" | "rose" | "purple";
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}
