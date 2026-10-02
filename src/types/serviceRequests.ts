export type RequestStatus =
  | "Pending"
  | "UnderReview"
  | "Approved"
  | "Rejected"
  | "Issued"
  | "Cancelled";

export const REQUEST_STATUS_LABELS: Record<RequestStatus, string> = {
  Pending: "قيد الانتظار",
  UnderReview: "قيد المراجعة الفنية",
  Approved: "تم الاعتماد",
  Rejected: "مرفوض",
  Issued: "تم الإصدار والطباعة",
  Cancelled: "ملغي",
};

export const REQUEST_STATUS_COLORS: Record<
  RequestStatus,
  { bg: string; text: string; border: string; badge: string }
> = {
  Pending: {
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
    badge: "bg-amber-100 text-amber-800 border-amber-300",
  },
  UnderReview: {
    bg: "bg-sky-50",
    text: "text-sky-800",
    border: "border-sky-200",
    badge: "bg-sky-100 text-sky-800 border-sky-300",
  },
  Approved: {
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-800 border-blue-300",
  },
  Rejected: {
    bg: "bg-rose-50",
    text: "text-rose-800",
    border: "border-rose-200",
    badge: "bg-rose-100 text-rose-800 border-rose-300",
  },
  Issued: {
    bg: "bg-emerald-50",
    text: "text-emerald-800",
    border: "border-emerald-200",
    badge: "bg-emerald-100 text-emerald-800 border-emerald-300",
  },
  Cancelled: {
    bg: "bg-gray-100",
    text: "text-gray-700",
    border: "border-gray-200",
    badge: "bg-gray-200 text-gray-700 border-gray-300",
  },
};

export interface RequestStatusHistoryDto {
  id: string;
  serviceRequestId: string;
  requestNumber: string;
  status: RequestStatus;
  note?: string;
  createdAt: string;
  createdBy?: string;
}

export interface ServiceRequestDto {
  id: string;
  requestNumber: string;
  personId: string;
  personFullName: string;
  nationalNumber: string;
  serviceTypeId: string;
  serviceTypeName: string;
  serviceTypeCode: string;
  branchId: string;
  branchName: string;
  status: RequestStatus;
  rejectionReason?: string | null;
  requestDataJson?: string | null;
  submissionDate: string;
  completedDate?: string | null;
  createdAt: string;
  createdBy?: string | null;
  statusHistory?: RequestStatusHistoryDto[];
}

export interface ServiceTypeDto {
  id: string;
  name: string;
  code: string;
  organizationId: string;
  isActive: boolean;
}

export interface PaginatedList<T> {
  items: T[];
  pageIndex: number;
  totalPages: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface ChangeServiceRequestStatusCommand {
  serviceRequestId: string;
  newStatus: RequestStatus;
  note?: string;
  rejectionReason?: string;
}

export interface CreateServiceRequestCommand {
  personId?: string;
  nationalNumber?: string;
  serviceTypeId: string;
  branchId: string;
  requestDataJson?: unknown;
}

export interface CancelServiceRequestCommand {
  serviceRequestId: string;
  cancellationReason?: string;
}
