import { apiClient } from "./client";
import { mockStore } from "./mockStore";
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

const simulateDelay = (ms: number = 200) =>
  new Promise((resolve) => setTimeout(resolve, ms));

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

class MockTrafficService implements ITrafficService {
  async getDirectorMetrics(): Promise<TrafficDirectorMetrics> {
    await simulateDelay(150);
    return mockStore.getTrafficDirectorMetrics();
  }

  async getVehicles(search?: string, governorate?: string): Promise<Vehicle[]> {
    await simulateDelay(200);
    return mockStore.getVehicles(search, governorate);
  }

  async getVehicleByPlate(plateNumber: string): Promise<Vehicle | null> {
    await simulateDelay(150);
    const v = mockStore.getVehicleByPlate(plateNumber);
    return v || null;
  }

  async registerVehicle(dto: RegisterVehicleDto): Promise<Vehicle> {
    await simulateDelay(300);
    return mockStore.registerVehicle(dto);
  }

  async getDrivingLicenses(search?: string): Promise<DrivingLicense[]> {
    await simulateDelay(200);
    return mockStore.getDrivingLicenses(search);
  }

  async getDrivingLicenseByNationalNumber(nid: string): Promise<DrivingLicense | null> {
    await simulateDelay(150);
    const l = mockStore.getDrivingLicenseByNationalNumber(nid);
    return l || null;
  }

  async issueDrivingLicense(dto: IssueDrivingLicenseDto): Promise<DrivingLicense> {
    await simulateDelay(350);
    return mockStore.issueDrivingLicense(dto);
  }

  async getTrafficViolations(filters?: { plateNumber?: string; paymentStatus?: string }): Promise<TrafficViolation[]> {
    await simulateDelay(200);
    return mockStore.getTrafficViolations(filters);
  }

  async recordTrafficViolation(dto: RecordViolationDto): Promise<TrafficViolation> {
    await simulateDelay(300);
    return mockStore.recordTrafficViolation(dto);
  }

  async payTrafficViolation(dto: PayViolationDto): Promise<TrafficViolation> {
    await simulateDelay(350);
    return mockStore.payTrafficViolation(dto);
  }
}

class HttpTrafficService implements ITrafficService {
  async getDirectorMetrics(): Promise<TrafficDirectorMetrics> {
    const res = await apiClient.get<TrafficDirectorMetrics>("/api/traffic/metrics");
    return res.data;
  }

  async getVehicles(search?: string, governorate?: string): Promise<Vehicle[]> {
    const res = await apiClient.get<Vehicle[]>("/api/traffic/vehicles", { search, governorate });
    return res.data;
  }

  async getVehicleByPlate(plateNumber: string): Promise<Vehicle | null> {
    const res = await apiClient.get<Vehicle>(`/api/traffic/vehicles/${plateNumber}`);
    return res.data;
  }

  async registerVehicle(dto: RegisterVehicleDto): Promise<Vehicle> {
    const res = await apiClient.post<Vehicle>("/api/traffic/vehicles", dto);
    return res.data;
  }

  async getDrivingLicenses(search?: string): Promise<DrivingLicense[]> {
    const res = await apiClient.get<DrivingLicense[]>("/api/traffic/licenses", { search });
    return res.data;
  }

  async getDrivingLicenseByNationalNumber(nid: string): Promise<DrivingLicense | null> {
    const res = await apiClient.get<DrivingLicense>(`/api/traffic/licenses/${nid}`);
    return res.data;
  }

  async issueDrivingLicense(dto: IssueDrivingLicenseDto): Promise<DrivingLicense> {
    const res = await apiClient.post<DrivingLicense>("/api/traffic/licenses", dto);
    return res.data;
  }

  async getTrafficViolations(filters?: { plateNumber?: string; paymentStatus?: string }): Promise<TrafficViolation[]> {
    const res = await apiClient.get<TrafficViolation[]>("/api/traffic/violations", filters);
    return res.data;
  }

  async recordTrafficViolation(dto: RecordViolationDto): Promise<TrafficViolation> {
    const res = await apiClient.post<TrafficViolation>("/api/traffic/violations", dto);
    return res.data;
  }

  async payTrafficViolation(dto: PayViolationDto): Promise<TrafficViolation> {
    const res = await apiClient.post<TrafficViolation>(`/api/traffic/violations/${dto.violationId}/pay`, dto);
    return res.data;
  }
}

const isMockMode = process.env.NEXT_PUBLIC_USE_MOCKS !== "false";

export const trafficService: ITrafficService = isMockMode
  ? new MockTrafficService()
  : new HttpTrafficService();
