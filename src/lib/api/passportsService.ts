import { apiClient } from "./client";
import { mockStore } from "./mockStore";
import { PaginatedResponse } from "@/types/api";
import {
  PassportRecord,
  PassportRequest,
  TravelRecord,
  PassportsDirectorMetrics,
  PassportRequestFilterParams,
  TravelRecordFilterParams,
  RecordTravelMovementDto,
  UpdatePassportRequestStatusDto,
} from "@/types/passports";

const simulateDelay = (ms: number = 200) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export interface IPassportsService {
  getDirectorMetrics(): Promise<PassportsDirectorMetrics>;
  getPassports(search?: string, status?: string): Promise<PassportRecord[]>;
  getPassportByNumber(passportNumber: string): Promise<PassportRecord | null>;
  getPassportRequests(params?: PassportRequestFilterParams): Promise<PaginatedResponse<PassportRequest>>;
  updatePassportRequestStatus(dto: UpdatePassportRequestStatusDto): Promise<PassportRequest>;
  getTravelRecords(params?: TravelRecordFilterParams): Promise<PaginatedResponse<TravelRecord>>;
  recordTravelMovement(dto: RecordTravelMovementDto): Promise<{ record: TravelRecord; isFlagged: boolean; message: string }>;
}

class MockPassportsService implements IPassportsService {
  async getDirectorMetrics(): Promise<PassportsDirectorMetrics> {
    await simulateDelay(150);
    return mockStore.getPassportsDirectorMetrics();
  }

  async getPassports(search?: string, status?: string): Promise<PassportRecord[]> {
    await simulateDelay(200);
    let items = mockStore.getPassports();
    if (search) {
      const q = search.trim().toLowerCase();
      items = items.filter(
        (p) =>
          p.passportNumber.toLowerCase().includes(q) ||
          p.fullName.toLowerCase().includes(q) ||
          p.nationalNumber.includes(q)
      );
    }
    if (status && status !== "all") {
      items = items.filter((p) => p.status === status);
    }
    return items;
  }

  async getPassportByNumber(passportNumber: string): Promise<PassportRecord | null> {
    await simulateDelay(200);
    const item = mockStore.getPassportByNumber(passportNumber);
    return item || null;
  }

  async getPassportRequests(params?: PassportRequestFilterParams): Promise<PaginatedResponse<PassportRequest>> {
    await simulateDelay(200);
    let items = mockStore.getPassportRequests();

    if (params?.search) {
      const q = params.search.trim().toLowerCase();
      items = items.filter(
        (r) =>
          r.requestNumber.toLowerCase().includes(q) ||
          r.fullName.toLowerCase().includes(q) ||
          r.nationalNumber.includes(q) ||
          (r.previousPassportNumber && r.previousPassportNumber.toLowerCase().includes(q))
      );
    }

    if (params?.status && params.status !== "all") {
      items = items.filter((r) => r.status === params.status);
    }

    if (params?.urgentOnly) {
      items = items.filter((r) => r.urgentPriority);
    }

    if (params?.branchId && params.branchId !== "all") {
      items = items.filter((r) => r.branchId === params.branchId);
    }

    const totalCount = items.length;
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const totalPages = Math.ceil(totalCount / pageSize) || 1;
    const startIndex = (page - 1) * pageSize;

    return {
      items: items.slice(startIndex, startIndex + pageSize),
      totalCount,
      page,
      pageSize,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  async updatePassportRequestStatus(dto: UpdatePassportRequestStatusDto): Promise<PassportRequest> {
    await simulateDelay(300);
    return mockStore.updatePassportRequestStatus(
      dto.requestId,
      dto.status,
      dto.officerNotes,
      dto.rejectionReason
    );
  }

  async getTravelRecords(params?: TravelRecordFilterParams): Promise<PaginatedResponse<TravelRecord>> {
    await simulateDelay(200);
    let items = mockStore.getTravelRecords();

    if (params?.search) {
      const q = params.search.trim().toLowerCase();
      items = items.filter(
        (t) =>
          t.passportNumber.toLowerCase().includes(q) ||
          t.fullName.toLowerCase().includes(q) ||
          t.nationalNumber.includes(q) ||
          t.portName.toLowerCase().includes(q) ||
          t.destinationOrOriginCountry.toLowerCase().includes(q)
      );
    }

    if (params?.movementType && params.movementType !== "all") {
      items = items.filter((t) => t.movementType === params.movementType);
    }

    if (params?.portName && params.portName !== "all") {
      items = items.filter((t) => t.portName === params.portName);
    }

    if (params?.isFlagged !== undefined) {
      items = items.filter((t) => t.isFlagged === params.isFlagged);
    }

    const totalCount = items.length;
    const page = params?.page || 1;
    const pageSize = params?.pageSize || 10;
    const totalPages = Math.ceil(totalCount / pageSize) || 1;
    const startIndex = (page - 1) * pageSize;

    return {
      items: items.slice(startIndex, startIndex + pageSize),
      totalCount,
      page,
      pageSize,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  async recordTravelMovement(dto: RecordTravelMovementDto): Promise<{
    record: TravelRecord;
    isFlagged: boolean;
    message: string;
  }> {
    await simulateDelay(350);
    return mockStore.recordTravelMovement(dto);
  }
}

class HttpPassportsService implements IPassportsService {
  async getDirectorMetrics(): Promise<PassportsDirectorMetrics> {
    const res = await apiClient.get<PassportsDirectorMetrics>("/api/passports/director/metrics");
    return res.data;
  }

  async getPassports(search?: string, status?: string): Promise<PassportRecord[]> {
    const res = await apiClient.get<PassportRecord[]>("/api/passports", { search, status });
    return res.data;
  }

  async getPassportByNumber(passportNumber: string): Promise<PassportRecord | null> {
    const res = await apiClient.get<PassportRecord>(`/api/passports/${passportNumber}`);
    return res.data;
  }

  async getPassportRequests(params?: PassportRequestFilterParams): Promise<PaginatedResponse<PassportRequest>> {
    const res = await apiClient.get<PaginatedResponse<PassportRequest>>("/api/passports/requests", params);
    return res.data;
  }

  async updatePassportRequestStatus(dto: UpdatePassportRequestStatusDto): Promise<PassportRequest> {
    const res = await apiClient.put<PassportRequest>(`/api/passports/requests/${dto.requestId}/status`, dto);
    return res.data;
  }

  async getTravelRecords(params?: TravelRecordFilterParams): Promise<PaginatedResponse<TravelRecord>> {
    const res = await apiClient.get<PaginatedResponse<TravelRecord>>("/api/passports/travel-records", params);
    return res.data;
  }

  async recordTravelMovement(dto: RecordTravelMovementDto): Promise<{
    record: TravelRecord;
    isFlagged: boolean;
    message: string;
  }> {
    const res = await apiClient.post<{
      record: TravelRecord;
      isFlagged: boolean;
      message: string;
    }>("/api/passports/travel-records", dto);
    return res.data;
  }
}

const isMockMode = process.env.NEXT_PUBLIC_USE_MOCKS !== "false";

export const passportsService: IPassportsService = isMockMode
  ? new MockPassportsService()
  : new HttpPassportsService();
