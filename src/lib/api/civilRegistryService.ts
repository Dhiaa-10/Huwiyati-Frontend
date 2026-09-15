import { apiClient } from "./client";
import { mockStore } from "./mockStore";
import { PaginatedResponse } from "@/types/api";
import {
  CitizenCivilRecord,
  CivilServiceRequest,
  VitalEvent,
  CivilRegistryMetrics,
  CitizenFilterParams,
  ServiceRequestFilterParams,
  VitalEventFilterParams,
  ActivateAccountDto,
  UpdateRequestStatusDto,
  RegisterBirthCertificateDto,
  RegisterDeathCertificateDto,
} from "@/types/civilRegistry";

const simulateDelay = (ms: number = 200) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export interface ICivilRegistryService {
  getDashboardMetrics(): Promise<CivilRegistryMetrics>;
  searchCitizenByNationalId(nationalNumber: string): Promise<CitizenCivilRecord | null>;
  getAllCitizens(params?: CitizenFilterParams): Promise<PaginatedResponse<CitizenCivilRecord>>;
  activateAccount(dto: ActivateAccountDto): Promise<{ success: boolean; message: string; citizen: CitizenCivilRecord }>;
  rejectActivation(nationalNumber: string, reason: string): Promise<{ success: boolean; message: string }>;
  getServiceRequests(params?: ServiceRequestFilterParams): Promise<PaginatedResponse<CivilServiceRequest>>;
  updateRequestStatus(dto: UpdateRequestStatusDto): Promise<CivilServiceRequest>;
  getVitalEvents(params?: VitalEventFilterParams): Promise<PaginatedResponse<VitalEvent>>;
  registerBirth(dto: RegisterBirthCertificateDto): Promise<VitalEvent>;
  registerDeath(dto: RegisterDeathCertificateDto): Promise<VitalEvent>;
}

class MockCivilRegistryService implements ICivilRegistryService {
  async getDashboardMetrics(): Promise<CivilRegistryMetrics> {
    await simulateDelay(150);
    return mockStore.getCivilRegistryMetrics();
  }

  async searchCitizenByNationalId(nationalNumber: string): Promise<CitizenCivilRecord | null> {
    await simulateDelay(250);
    const citizen = mockStore.getCitizenByNationalNumber(nationalNumber);
    return citizen || null;
  }

  async getAllCitizens(params?: CitizenFilterParams): Promise<PaginatedResponse<CitizenCivilRecord>> {
    await simulateDelay(200);
    let items = mockStore.getCitizens();

    if (params?.search) {
      const q = params.search.trim().toLowerCase();
      items = items.filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) ||
          c.nationalNumber.includes(q) ||
          c.phoneNumber.includes(q)
      );
    }

    if (params?.accountStatus && params.accountStatus !== "all") {
      items = items.filter((c) => c.accountStatus === params.accountStatus);
    }

    if (params?.governorate && params.governorate !== "all") {
      items = items.filter((c) => c.governorate === params.governorate);
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

  async activateAccount(dto: ActivateAccountDto): Promise<{ success: boolean; message: string; citizen: CitizenCivilRecord }> {
    await simulateDelay(350);
    const citizen = mockStore.activateCitizen(dto.nationalNumber, dto.notes);
    return {
      success: true,
      message: `تم التحقق البايومتري وتفعيل الحساب الرقمي للمواطن ${citizen.fullName} بنجاح.`,
      citizen,
    };
  }

  async rejectActivation(nationalNumber: string, reason: string): Promise<{ success: boolean; message: string }> {
    await simulateDelay(250);
    const ok = mockStore.rejectCitizenActivation(nationalNumber, reason);
    return {
      success: ok,
      message: ok ? "تم تسجيل رفض طلب التفعيل وتوثيق السبب في السجل الأمني." : "المواطن غير موجود.",
    };
  }

  async getServiceRequests(params?: ServiceRequestFilterParams): Promise<PaginatedResponse<CivilServiceRequest>> {
    await simulateDelay(200);
    let items = mockStore.getCivilRequests();

    if (params?.search) {
      const q = params.search.trim().toLowerCase();
      items = items.filter(
        (r) =>
          r.requestNumber.toLowerCase().includes(q) ||
          r.personFullName.toLowerCase().includes(q) ||
          r.personNationalNumber.includes(q) ||
          r.serviceName.toLowerCase().includes(q)
      );
    }

    if (params?.status && params.status !== "all") {
      items = items.filter((r) => r.status === params.status);
    }

    if (params?.serviceCode && params.serviceCode !== "all") {
      items = items.filter((r) => r.serviceCode === params.serviceCode);
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

  async updateRequestStatus(dto: UpdateRequestStatusDto): Promise<CivilServiceRequest> {
    await simulateDelay(300);
    return mockStore.updateCivilRequestStatus(
      dto.requestId,
      dto.status,
      dto.officerNotes,
      dto.rejectionReason
    );
  }

  async getVitalEvents(params?: VitalEventFilterParams): Promise<PaginatedResponse<VitalEvent>> {
    await simulateDelay(200);
    let items = mockStore.getVitalEvents();

    if (params?.search) {
      const q = params.search.trim().toLowerCase();
      items = items.filter(
        (v) =>
          v.certificateNumber.toLowerCase().includes(q) ||
          v.subjectName.toLowerCase().includes(q) ||
          v.subjectNationalNumber?.includes(q)
      );
    }

    if (params?.eventType && params.eventType !== "all") {
      items = items.filter((v) => v.eventType === params.eventType);
    }

    if (params?.governorate && params.governorate !== "all") {
      items = items.filter((v) => v.governorate === params.governorate);
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

  async registerBirth(dto: RegisterBirthCertificateDto): Promise<VitalEvent> {
    await simulateDelay(350);
    return mockStore.createVitalEvent({
      eventType: "Birth",
      eventDate: dto.dateOfBirth,
      subjectName: `${dto.childFirstName} (ابن/ابنة رقم ${dto.fatherNationalNumber})`,
      placeOfEvent: dto.placeOfBirth,
      governorate: dto.governorate,
      district: dto.district,
      hospitalName: "مستشفى الولادة المعتمد",
      status: "Verified",
      approvedByOfficer: "ملازم أول أمين الحيمي",
    });
  }

  async registerDeath(dto: RegisterDeathCertificateDto): Promise<VitalEvent> {
    await simulateDelay(350);
    return mockStore.createVitalEvent({
      eventType: "Death",
      eventDate: dto.deathDate,
      subjectName: `واقعة وفاة - رقم وطني ${dto.deceasedNationalNumber}`,
      subjectNationalNumber: dto.deceasedNationalNumber,
      placeOfEvent: dto.placeOfDeath,
      causeOfDeath: dto.causeOfDeath,
      governorate: dto.governorate,
      district: dto.district,
      hospitalName: "مستشفى الثورة العام",
      status: "Verified",
      approvedByOfficer: "ملازم أول أمين الحيمي",
    });
  }
}

class HttpCivilRegistryService implements ICivilRegistryService {
  async getDashboardMetrics(): Promise<CivilRegistryMetrics> {
    const res = await apiClient.get<CivilRegistryMetrics>("/api/civil-registry/metrics");
    return res.data;
  }

  async searchCitizenByNationalId(nationalNumber: string): Promise<CitizenCivilRecord | null> {
    const res = await apiClient.get<CitizenCivilRecord>(`/api/civil-registry/citizens/${nationalNumber}`);
    return res.data;
  }

  async getAllCitizens(params?: CitizenFilterParams): Promise<PaginatedResponse<CitizenCivilRecord>> {
    const res = await apiClient.get<PaginatedResponse<CitizenCivilRecord>>("/api/civil-registry/citizens", params);
    return res.data;
  }

  async activateAccount(dto: ActivateAccountDto): Promise<{ success: boolean; message: string; citizen: CitizenCivilRecord }> {
    const res = await apiClient.post<{ success: boolean; message: string; citizen: CitizenCivilRecord }>("/api/civil-registry/activations", dto);
    return res.data;
  }

  async rejectActivation(nationalNumber: string, reason: string): Promise<{ success: boolean; message: string }> {
    const res = await apiClient.post<{ success: boolean; message: string }>(`/api/civil-registry/activations/${nationalNumber}/reject`, { reason });
    return res.data;
  }

  async getServiceRequests(params?: ServiceRequestFilterParams): Promise<PaginatedResponse<CivilServiceRequest>> {
    const res = await apiClient.get<PaginatedResponse<CivilServiceRequest>>("/api/civil-registry/requests", params);
    return res.data;
  }

  async updateRequestStatus(dto: UpdateRequestStatusDto): Promise<CivilServiceRequest> {
    const res = await apiClient.put<CivilServiceRequest>(`/api/civil-registry/requests/${dto.requestId}/status`, dto);
    return res.data;
  }

  async getVitalEvents(params?: VitalEventFilterParams): Promise<PaginatedResponse<VitalEvent>> {
    const res = await apiClient.get<PaginatedResponse<VitalEvent>>("/api/civil-registry/vital-events", params);
    return res.data;
  }

  async registerBirth(dto: RegisterBirthCertificateDto): Promise<VitalEvent> {
    const res = await apiClient.post<VitalEvent>("/api/civil-registry/vital-events/birth", dto);
    return res.data;
  }

  async registerDeath(dto: RegisterDeathCertificateDto): Promise<VitalEvent> {
    const res = await apiClient.post<VitalEvent>("/api/civil-registry/vital-events/death", dto);
    return res.data;
  }
}

const isMockMode = process.env.NEXT_PUBLIC_USE_MOCKS !== "false";

export const civilRegistryService: ICivilRegistryService = isMockMode
  ? new MockCivilRegistryService()
  : new HttpCivilRegistryService();
