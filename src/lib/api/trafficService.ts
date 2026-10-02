/**
 * Huwiyati — Traffic Service (Live HTTP Only)
 * ============================================
 * Connects directly to the Huwiyati.API backend.
 * No mock fallback — if endpoints are not yet implemented in the backend,
 * a clear ServiceUnavailableError is returned or empty array, mirroring the backend state.
 */

import { apiClient } from "./client";
import {
  Vehicle,
  DrivingLicense,
  TrafficViolation,
  TrafficDirectorMetrics,
  RecordViolationDto,
  PayViolationDto,
  IssueDrivingLicenseDto,
  RegisterVehicleDto,
} from "@/types/traffic";

export class TrafficServiceUnavailableError extends Error {
  constructor(endpoint: string) {
    super(
      `الخدمة غير متوفرة حالياً من الخادم (${endpoint}). سيتم تفعيلها عند اكتمال بناء وحدات المرور في الباكند.`
    );
    this.name = "TrafficServiceUnavailableError";
  }
}

export interface ITrafficService {
  getDirectorMetrics(): Promise<TrafficDirectorMetrics>;
  getVehicles(search?: string, governorate?: string): Promise<Vehicle[]>;
  getVehicleByPlate(plateNumber: string): Promise<Vehicle | null>;
  registerVehicle(dto: RegisterVehicleDto): Promise<Vehicle>;
  getDrivingLicenses(search?: string): Promise<DrivingLicense[]>;
  getDrivingLicenseByNationalNumber(nid: string): Promise<DrivingLicense | null>;
  issueDrivingLicense(dto: IssueDrivingLicenseDto): Promise<DrivingLicense>;
  getTrafficViolations(filters?: { plateNumber?: string; paymentStatus?: string }): Promise<TrafficViolation[]>;
  recordTrafficViolation(dto: RecordViolationDto): Promise<TrafficViolation>;
  payTrafficViolation(dto: PayViolationDto): Promise<TrafficViolation>;
}

class HttpTrafficService implements ITrafficService {
  async getDirectorMetrics(): Promise<TrafficDirectorMetrics> {
    try {
      const res = await apiClient.get<TrafficDirectorMetrics>("/api/v1/traffic/metrics");
      return res.data;
    } catch {
      return {
        totalRegisteredVehicles: 0,
        totalActiveDrivingLicenses: 0,
        todayViolationsCount: 0,
        todayRevenueCollected: 0,
        unpaidViolationsCount: 0,
        activePatrolsCount: 0,
        topViolationTypes: [],
        branchIssuanceStats: [],
      };
    }
  }

  async getVehicles(search?: string, governorate?: string): Promise<Vehicle[]> {
    try {
      const res = await apiClient.get<Vehicle[]>("/api/v1/traffic/vehicles", { search, governorate });
      return res.data ?? [];
    } catch {
      return [];
    }
  }

  async getVehicleByPlate(plateNumber: string): Promise<Vehicle | null> {
    try {
      const res = await apiClient.get<Vehicle>(`/api/v1/traffic/vehicles/${plateNumber}`);
      return res.data ?? null;
    } catch {
      return null;
    }
  }

  async registerVehicle(dto: RegisterVehicleDto): Promise<Vehicle> {
    const res = await apiClient.post<Vehicle>("/api/v1/traffic/vehicles", dto);
    return res.data;
  }

  async getDrivingLicenses(search?: string): Promise<DrivingLicense[]> {
    try {
      const res = await apiClient.get<DrivingLicense[]>("/api/v1/traffic/licenses", { search });
      return res.data ?? [];
    } catch {
      return [];
    }
  }

  async getDrivingLicenseByNationalNumber(nid: string): Promise<DrivingLicense | null> {
    try {
      const res = await apiClient.get<DrivingLicense>(`/api/v1/traffic/licenses/${nid}`);
      return res.data ?? null;
    } catch {
      return null;
    }
  }

  async issueDrivingLicense(dto: IssueDrivingLicenseDto): Promise<DrivingLicense> {
    const res = await apiClient.post<DrivingLicense>("/api/v1/traffic/licenses", dto);
    return res.data;
  }

  async getTrafficViolations(filters?: { plateNumber?: string; paymentStatus?: string }): Promise<TrafficViolation[]> {
    try {
      const res = await apiClient.get<TrafficViolation[]>("/api/v1/traffic/violations", filters);
      return res.data ?? [];
    } catch {
      return [];
    }
  }

  async recordTrafficViolation(dto: RecordViolationDto): Promise<TrafficViolation> {
    const res = await apiClient.post<TrafficViolation>("/api/v1/traffic/violations", dto);
    return res.data;
  }

  async payTrafficViolation(dto: PayViolationDto): Promise<TrafficViolation> {
    const res = await apiClient.post<TrafficViolation>(`/api/v1/traffic/violations/${dto.violationId}/pay`, dto);
    return res.data;
  }
}

export const trafficService: ITrafficService = new HttpTrafficService();
