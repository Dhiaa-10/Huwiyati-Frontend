import { apiClient } from "./client";
import {
  ServiceRequestDto,
  ServiceTypeDto,
  PaginatedList,
  ChangeServiceRequestStatusCommand,
  CreateServiceRequestCommand,
  CancelServiceRequestCommand,
  RequestStatus,
} from "@/types/serviceRequests";

export interface GetBranchRequestsParams {
  status?: RequestStatus | string;
  searchKeyword?: string;
  pageNumber?: number;
  pageSize?: number;
}

class ServiceRequestsService {
  /**
   * Fetch all requests for the currently logged-in employee's branch.
   * Endpoint: GET /api/v1/employee/service-requests
   */
  public async getBranchServiceRequests(
    params?: GetBranchRequestsParams
  ): Promise<PaginatedList<ServiceRequestDto>> {
    try {
      const queryParams: Record<string, string | number> = {};
      if (params?.status && params.status !== "all") {
        queryParams["Status"] = params.status;
      }
      if (params?.searchKeyword && params.searchKeyword.trim()) {
        queryParams["SearchKeyword"] = params.searchKeyword.trim();
      }
      if (params?.pageNumber) {
        queryParams["PageNumber"] = params.pageNumber;
      }
      if (params?.pageSize) {
        queryParams["PageSize"] = params.pageSize;
      }

      const res = await apiClient.get<PaginatedList<ServiceRequestDto>>(
        "/api/v1/employee/service-requests",
        queryParams
      );

      return (
        res.data ?? {
          items: [],
          pageIndex: 1,
          totalPages: 1,
          totalCount: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        }
      );
    } catch (err) {
      console.error("[ServiceRequestsService] getBranchServiceRequests failed:", err);
      return {
        items: [],
        pageIndex: 1,
        totalPages: 0,
        totalCount: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      };
    }
  }

  /**
   * Fetch a single request by its UUID.
   * Endpoint: GET /api/v1/employee/service-requests/{id}
   */
  public async getServiceRequestById(id: string): Promise<ServiceRequestDto | null> {
    try {
      const res = await apiClient.get<ServiceRequestDto>(
        `/api/v1/employee/service-requests/${id}`
      );
      return res.data ?? null;
    } catch (err) {
      console.error(`[ServiceRequestsService] getServiceRequestById failed for ${id}:`, err);
      return null;
    }
  }

  /**
   * Change request state (Pending -> UnderReview -> Approved / Rejected -> Issued).
   * Endpoint: POST /api/v1/employee/service-requests/change-status
   */
  public async changeRequestStatus(
    command: ChangeServiceRequestStatusCommand
  ): Promise<ServiceRequestDto> {
    const res = await apiClient.post<ServiceRequestDto>(
      "/api/v1/employee/service-requests/change-status",
      command
    );

    if (!res.isSuccess || !res.data) {
      throw new Error(res.message || "فشل تحديث حالة الطلب");
    }

    return res.data;
  }

  /**
   * Create a new request on behalf of a citizen.
   * Endpoint: POST /api/v1/employee/service-requests
   */
  public async createRequestOnBehalf(
    command: CreateServiceRequestCommand
  ): Promise<ServiceRequestDto> {
    const res = await apiClient.post<ServiceRequestDto>(
      "/api/v1/employee/service-requests",
      command
    );

    if (!res.isSuccess || !res.data) {
      throw new Error(res.message || "فشل إنشاء طلب الخدمة");
    }

    return res.data;
  }

  /**
   * Cancel a request on behalf of citizen.
   * Endpoint: POST /api/v1/employee/service-requests/cancel
   */
  public async cancelRequestOnBehalf(
    command: CancelServiceRequestCommand
  ): Promise<ServiceRequestDto> {
    const res = await apiClient.post<ServiceRequestDto>(
      "/api/v1/employee/service-requests/cancel",
      command
    );

    if (!res.isSuccess || !res.data) {
      throw new Error(res.message || "فشل إلغاء الطلب");
    }

    return res.data;
  }

  /**
   * Fetch available ServiceTypes.
   * Endpoint: GET /api/v1/employee/service-requests/service-types
   */
  public async getServiceTypes(organizationId?: string): Promise<ServiceTypeDto[]> {
    try {
      const params = organizationId ? { organizationId } : undefined;
      const res = await apiClient.get<ServiceTypeDto[]>(
        "/api/v1/employee/service-requests/service-types",
        params
      );
      return res.data ?? [];
    } catch (err) {
      console.error("[ServiceRequestsService] getServiceTypes failed:", err);
      return [];
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Citizen Endpoints (api/v1/citizen/service-requests)
  // ─────────────────────────────────────────────────────────────

  public async getCitizenRequests(params?: {
    status?: RequestStatus | string;
    searchKeyword?: string;
    pageNumber?: number;
    pageSize?: number;
  }): Promise<PaginatedList<ServiceRequestDto>> {
    try {
      const queryParams: Record<string, string | number> = {};
      if (params?.status && params.status !== "all") queryParams["Status"] = params.status;
      if (params?.searchKeyword) queryParams["SearchKeyword"] = params.searchKeyword;
      if (params?.pageNumber) queryParams["PageNumber"] = params.pageNumber;
      if (params?.pageSize) queryParams["PageSize"] = params.pageSize;

      const res = await apiClient.get<PaginatedList<ServiceRequestDto>>(
        "/api/v1/citizen/service-requests",
        queryParams
      );
      return (
        res.data ?? {
          items: [],
          pageIndex: 1,
          totalPages: 0,
          totalCount: 0,
          hasNextPage: false,
          hasPreviousPage: false,
        }
      );
    } catch {
      return {
        items: [],
        pageIndex: 1,
        totalPages: 0,
        totalCount: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      };
    }
  }
}

export const serviceRequestsService = new ServiceRequestsService();
