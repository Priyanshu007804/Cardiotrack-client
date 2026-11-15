export type Role = "Administrator" | "Doctor" | "Hospital staff" | "Patient"
export type Section = "overview" | "patients" | "doctors" | "records" | "diagnostics" | "reports" | "admissions" | "staff" | "settings"

export type Patient = {
  id: string
  name: string
  age: number
  gender: string
  userId?: number
  email?: string
  status?: string
  lastVisit?: string
}

export type MedicalRecord = {
  id: string
  patientId: string
  patient: string
  title: string
  diagnosis: string
  doctor: string
  date: string
  notes: string
}

export type DiagnosticTest = {
  id: string
  patientId: string
  patient: string
  test: string
  department: string
  doctor: string
  date: string
  status: "Scheduled" | "In progress" | "Report ready"
  note: string
}

export type MedicalReport = {
  id: string
  patientId: string
  patient: string
  name: string
  type: string
  date: string
  size: string
  file?: File
}

export type Admission = {
  id: string
  patientId: string
  patient: string
  ward: string
  bed: string
  admitted: string
  status: "Admitted" | "Discharged"
  discharged?: string
  notes?: string
}

export const demoPatients: Patient[] = []

export const demoDoctors: any[] = []

export const demoRecords: MedicalRecord[] = []

export const demoTests: DiagnosticTest[] = []

export const demoReports: MedicalReport[] = []

export const demoAdmissions: Admission[] = []

export const roleSections: Record<Role, Section[]> = {
  Administrator: ["overview", "patients", "doctors", "admissions", "records", "diagnostics", "reports", "staff", "settings"],
  Doctor: ["overview", "patients", "records", "diagnostics", "reports", "settings"],
  "Hospital staff": ["overview", "patients", "admissions", "reports", "settings"],
  Patient: ["overview", "patients", "doctors", "records", "diagnostics", "reports", "admissions", "settings"],
}
