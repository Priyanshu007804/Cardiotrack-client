/**
 * CardioTrack API Integration Layer
 * Connects Frontend directly to Spring Boot API Gateway
 */

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  "https://cardiotrack-api-gateway.onrender.com";

export type ClientRole = "Administrator" | "Doctor" | "Hospital staff" | "Patient";
export type BackendRole = "ADMIN" | "DOCTOR" | "STAFF" | "PATIENT";

export interface StoredUser {
  userId: number;
  email: string;
  role: BackendRole;
  clientRole: ClientRole;
  name?: string;
}

export interface AuthResponseDTO {
  userId: number;
  email: string;
  role: string;
  message: string;
  token?: string;
}

export interface UserSummaryDTO {
  id: number;
  email: string;
  role: BackendRole;
  enabled: boolean;
}

export interface PatientDTO {
  id: number;
  name: string;
  age: number;
  gender: string;
}

export interface DoctorDTO {
  id: number;
  userId: number;
  fullName: string;
  qualification: string;
  specialization: string;
  experienceYears: number;
  registrationNumber: string;
}

export interface MedicalRecordDTO {
  id: number;
  patientId: number;
  doctorId?: number;
  diagnosis: string;
  notes?: string;
  recordDate?: string;
}

export interface MedicalTestDTO {
  id: number;
  patientId: number;
  doctorId?: number;
  hospitalStayId?: number;
  testName: string;
  testType: string;
  testDate: string;
  results?: string;
  interpretation?: string;
}

export interface HospitalStayDTO {
  id: number;
  patientId: number;
  admissionDate: string;
  dischargeDate?: string;
  admissionReason: string;
  notes?: string;
  status: "ADMITTED" | "DISCHARGED";
}

export interface MedicalReportDTO {
  id: number;
  patientId: number;
  medicalTestId?: number;
  fileName: string;
  contentType: string;
  fileSizeBytes: number;
  uploadedAt: string;
  uploadedById: number;
}

export const toClientRole = (role?: string): ClientRole => {
  const normalized = (role || "").replace("ROLE_", "").toUpperCase();
  switch (normalized) {
    case "ADMIN":
      return "Administrator";
    case "DOCTOR":
      return "Doctor";
    case "STAFF":
      return "Hospital staff";
    case "PATIENT":
    default:
      return "Patient";
  }
};

export const toBackendRole = (role: ClientRole): BackendRole => {
  switch (role) {
    case "Administrator":
      return "ADMIN";
    case "Doctor":
      return "DOCTOR";
    case "Hospital staff":
      return "STAFF";
    case "Patient":
    default:
      return "PATIENT";
  }
};

export const getAuthToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("cardiotrack_token");
};

export const setAuthToken = (token: string): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("cardiotrack_token", token);
  }
};

export const removeAuthToken = (): void => {
  if (typeof window !== "undefined") {
    localStorage.removeItem("cardiotrack_token");
    localStorage.removeItem("cardiotrack_user");
  }
};

export const getStoredUser = (): StoredUser | null => {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("cardiotrack_user");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const setStoredUser = (user: StoredUser): void => {
  if (typeof window !== "undefined") {
    localStorage.setItem("cardiotrack_user", JSON.stringify(user));
  }
};

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();
  const headers = new Headers(options.headers || {});

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const base = API_BASE_URL.replace(/\/$/, "");
  const path = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const url = endpoint.startsWith("http") ? endpoint : `${base}${path}`;

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `Request failed (${response.status})`;
    try {
      const errorBody = await response.json();
      if (errorBody && errorBody.message) {
        errorMessage = errorBody.message;
      } else if (typeof errorBody === "string") {
        errorMessage = errorBody;
      }
    } catch {
      try {
        const text = await response.text();
        if (text) errorMessage = text;
      } catch {
        // Fallback
      }
    }
    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return {} as T;
  }

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  return (await response.text()) as unknown as T;
}

// -------------------------------------------------------------
// Auth API
// -------------------------------------------------------------
export const authApi = {
  async register(email: string, password: string): Promise<AuthResponseDTO> {
    return request<AuthResponseDTO>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async login(email: string, password: string): Promise<AuthResponseDTO> {
    const data = await request<AuthResponseDTO>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    if (data.token) {
      setAuthToken(data.token);
      setStoredUser({
        userId: data.userId,
        email: data.email,
        role: (data.role?.replace("ROLE_", "") as BackendRole) || "PATIENT",
        clientRole: toClientRole(data.role),
      });
    }

    return data;
  },

  async createDoctorAccount(email: string, password: string): Promise<AuthResponseDTO> {
    return request<AuthResponseDTO>("/api/auth/admin/doctors", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async createStaffAccount(email: string, password: string): Promise<AuthResponseDTO> {
    return request<AuthResponseDTO>("/api/auth/admin/staff", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async createPatientAccount(email: string, password: string): Promise<AuthResponseDTO> {
    return request<AuthResponseDTO>("/api/auth/admin/patients", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  async getAllUsers(): Promise<UserSummaryDTO[]> {
    return request<UserSummaryDTO[]>("/api/auth/admin/users");
  },

  async updateUserRole(userId: number | string, role: BackendRole): Promise<AuthResponseDTO> {
    return request<AuthResponseDTO>(`/api/auth/admin/users/${userId}/role?role=${role}`, {
      method: "PUT",
    });
  },

  logout(): void {
    removeAuthToken();
  },
};

// -------------------------------------------------------------
// Patient API
// -------------------------------------------------------------
export const patientApi = {
  async getAll(): Promise<PatientDTO[]> {
    return request<PatientDTO[]>("/api/patients");
  },

  async getById(id: number | string): Promise<PatientDTO> {
    return request<PatientDTO>(`/api/patients/${id}`);
  },

  async create(data: { name: string; age?: number; gender?: string; userId?: number }): Promise<PatientDTO> {
    const url = data.userId ? `/api/patients?userId=${data.userId}` : "/api/patients";
    return request<PatientDTO>(url, {
      method: "POST",
      body: JSON.stringify({ name: data.name, age: data.age, gender: data.gender }),
    });
  },

  async update(
    id: number | string,
    data: { name?: string; age?: number; gender?: string }
  ): Promise<PatientDTO> {
    return request<PatientDTO>(`/api/patients/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async delete(id: number | string): Promise<void> {
    return request<void>(`/api/patients/${id}`, {
      method: "DELETE",
    });
  },

  async getMyProfile(): Promise<PatientDTO> {
    return request<PatientDTO>("/api/patients/me/profile");
  },

  async createMyProfile(data: { name: string; age?: number; gender?: string }): Promise<PatientDTO> {
    return request<PatientDTO>("/api/patients/me/profile", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateMyProfile(data: { name?: string; age?: number; gender?: string }): Promise<PatientDTO> {
    return request<PatientDTO>("/api/patients/me/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },
};

// -------------------------------------------------------------
// Doctor API
// -------------------------------------------------------------
export const doctorApi = {
  async getAll(): Promise<DoctorDTO[]> {
    return request<DoctorDTO[]>("/api/doctors");
  },

  async getById(id: number | string): Promise<DoctorDTO> {
    return request<DoctorDTO>(`/api/doctors/${id}`);
  },

  async getMyProfile(): Promise<DoctorDTO> {
    return request<DoctorDTO>("/api/doctors/me/profile");
  },

  async createMyProfile(data: {
    fullName: string;
    qualification: string;
    specialization: string;
    experienceYears: number;
    registrationNumber: string;
  }): Promise<DoctorDTO> {
    return request<DoctorDTO>("/api/doctors/me/profile", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async createProfile(userId: number, data: {
    fullName: string;
    qualification: string;
    specialization: string;
    experienceYears: number;
    registrationNumber: string;
  }): Promise<DoctorDTO> {
    return request<DoctorDTO>(`/api/doctors?userId=${userId}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async update(id: number | string, data: Partial<DoctorDTO>): Promise<DoctorDTO> {
    return request<DoctorDTO>(`/api/doctors/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async delete(id: number | string): Promise<void> {
    return request<void>(`/api/doctors/${id}`, {
      method: "DELETE",
    });
  },
};

// -------------------------------------------------------------
// Doctor Assignment API
// -------------------------------------------------------------
export const doctorAssignmentApi = {
  async assign(doctorId: number | string, patientId: number | string): Promise<any> {
    return request<any>(`/api/doctor-assignments?doctorId=${doctorId}&patientId=${patientId}`, {
      method: "POST",
    });
  },

  async getMyDoctors(): Promise<any[]> {
    return request<any[]>("/api/doctor-assignments/my-doctors");
  },

  async getPatientsByDoctor(doctorId: number | string): Promise<any[]> {
    return request<any[]>(`/api/doctor-assignments/doctor/${doctorId}`);
  },

  async getDoctorsByPatient(patientId: number | string): Promise<any[]> {
    return request<any[]>(`/api/doctor-assignments/patient/${patientId}`);
  },

  async deactivate(doctorId: number | string, patientId: number | string): Promise<void> {
    return request<void>(
      `/api/doctor-assignments/doctor/${doctorId}/patient/${patientId}`,
      { method: "DELETE" }
    );
  },
};

// -------------------------------------------------------------
// Clinical Records & Tests API
// -------------------------------------------------------------
export const clinicalApi = {
  async getRecordsByPatient(patientId: number | string): Promise<MedicalRecordDTO[]> {
    return request<MedicalRecordDTO[]>(`/api/medical-records/patient/${patientId}`);
  },

  async getMyRecords(): Promise<MedicalRecordDTO[]> {
    return request<MedicalRecordDTO[]>("/api/medical-records/my-records");
  },

  async createRecord(
    patientId: number | string,
    data: { diagnosis: string; notes?: string; doctorId?: number }
  ): Promise<MedicalRecordDTO> {
    return request<MedicalRecordDTO>(`/api/medical-records/patient/${patientId}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async updateRecord(
    id: number | string,
    data: { diagnosis?: string; notes?: string; doctorId?: number }
  ): Promise<MedicalRecordDTO> {
    return request<MedicalRecordDTO>(`/api/medical-records/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async deleteRecord(id: number | string): Promise<void> {
    return request<void>(`/api/medical-records/${id}`, {
      method: "DELETE",
    });
  },

  async getTestsByPatient(patientId: number | string): Promise<MedicalTestDTO[]> {
    return request<MedicalTestDTO[]>(`/api/medical-tests/patient/${patientId}`);
  },

  async getMyTests(): Promise<MedicalTestDTO[]> {
    return request<MedicalTestDTO[]>("/api/medical-tests/my-tests");
  },

  async createTest(
    patientId: number | string,
    data: {
      testName: string;
      testType: string;
      testDate: string;
      results?: string;
      interpretation?: string;
      doctorId?: number;
      hospitalStayId?: number;
    }
  ): Promise<MedicalTestDTO> {
    return request<MedicalTestDTO>(`/api/medical-tests/patient/${patientId}`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async deleteTest(id: number | string): Promise<void> {
    return request<void>(`/api/medical-tests/${id}`, {
      method: "DELETE",
    });
  },
};

// -------------------------------------------------------------
// Hospital Stays (Admissions) API
// -------------------------------------------------------------
export const hospitalApi = {
  async getStaysByPatient(patientId: number | string): Promise<HospitalStayDTO[]> {
    return request<HospitalStayDTO[]>(`/api/patients/${patientId}/hospital-stays`);
  },

  async getMyStays(): Promise<HospitalStayDTO[]> {
    return request<HospitalStayDTO[]>("/api/hospital-stays/my-stays");
  },

  async admitPatient(
    patientId: number | string,
    data: { admissionReason: string; notes?: string }
  ): Promise<HospitalStayDTO> {
    return request<HospitalStayDTO>(`/api/patients/${patientId}/hospital-stays`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async dischargePatient(
    patientId: number | string,
    stayId: number | string
  ): Promise<HospitalStayDTO> {
    return request<HospitalStayDTO>(
      `/api/patients/${patientId}/hospital-stays/${stayId}/discharge`,
      { method: "PUT" }
    );
  },
};

// -------------------------------------------------------------
// Medical Reports API
// -------------------------------------------------------------
export const reportApi = {
  async getReportsByPatient(patientId: number | string): Promise<MedicalReportDTO[]> {
    return request<MedicalReportDTO[]>(`/api/patients/${patientId}/medical-reports`);
  },

  async getMyReports(): Promise<MedicalReportDTO[]> {
    return request<MedicalReportDTO[]>("/api/medical-reports/my-reports");
  },

  async uploadReport(
    patientId: number | string,
    file: File,
    medicalTestId?: number
  ): Promise<MedicalReportDTO> {
    const formData = new FormData();
    formData.append("file", file);
    if (medicalTestId) {
      formData.append("medicalTestId", String(medicalTestId));
    }

    return request<MedicalReportDTO>(`/api/patients/${patientId}/medical-reports`, {
      method: "POST",
      body: formData,
    });
  },

  async deleteReport(patientId: number | string, reportId: number | string): Promise<void> {
    return request<void>(`/api/patients/${patientId}/medical-reports/${reportId}`, {
      method: "DELETE",
    });
  },
};

