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

export const demoDoctors = [
  { name: "Dr. Arindam Bose", specialty: "Cardiology", qualifications: "MBBS, MD (Medicine), DM (Cardiology)", experience: "16 years", registration: "WBMC 68421", patients: 0, initials: "AB", tone: "teal" },
  { name: "Dr. Priya Nair", specialty: "Internal Medicine", qualifications: "MBBS, MD (Internal Medicine)", experience: "12 years", registration: "WBMC 72913", patients: 0, initials: "PN", tone: "blue" },
  { name: "Dr. Farhan Ali", specialty: "Neurology", qualifications: "MBBS, MD, DM (Neurology)", experience: "10 years", registration: "WBMC 80126", patients: 0, initials: "FA", tone: "violet" },
  { name: "Dr. Rituparna Dey", specialty: "Orthopedics", qualifications: "MBBS, MS (Orthopedics), DNB", experience: "14 years", registration: "WBMC 71388", patients: 0, initials: "RD", tone: "amber" },
]

export const demoRecords: MedicalRecord[] = []

export const demoTests: DiagnosticTest[] = []

export const demoReports: MedicalReport[] = []

export const demoAdmissions: Admission[] = []

export const roleSections: Record<Role, Section[]> = {
  Administrator: ["overview", "patients", "doctors", "admissions", "records", "diagnostics", "reports", "staff"],
  Doctor: ["overview", "patients", "records", "diagnostics", "reports"],
  "Hospital staff": ["overview", "patients", "admissions", "reports"],
  Patient: ["overview", "patients", "doctors", "records", "diagnostics", "reports", "admissions"],
}
