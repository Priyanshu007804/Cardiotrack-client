export type Role = "Administrator" | "Doctor" | "Hospital staff" | "Patient"
export type Section = "overview" | "patients" | "doctors" | "records" | "diagnostics" | "reports" | "admissions" | "staff" | "settings"

export type Patient = {
  id: string
  name: string
  age: number
  gender: string
  phone: string
  email: string
  bloodGroup: string
  department: string
  doctor: string
  status: "Active" | "Follow-up"
  lastVisit: string
  emergency: string
  address: string
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

export const demoPatients: Patient[] = [
  { id: "CT-24081", name: "Aditi Sen", age: 38, gender: "Female", phone: "+91 98310 45218", email: "aditi.sen@example.in", bloodGroup: "B+", department: "Cardiology", doctor: "Dr. Arindam Bose", status: "Follow-up", lastVisit: "12 Nov 2026", emergency: "Rohan Sen · +91 98300 31842", address: "Ballygunge, Kolkata, West Bengal" },
  { id: "CT-24080", name: "Sourav Chatterjee", age: 56, gender: "Male", phone: "+91 98745 10296", email: "sourav.c@example.in", bloodGroup: "O+", department: "Internal Medicine", doctor: "Dr. Priya Nair", status: "Active", lastVisit: "11 Nov 2026", emergency: "Mita Chatterjee · +91 98302 77061", address: "Salt Lake, Kolkata, West Bengal" },
  { id: "CT-24079", name: "Nandita Roy", age: 29, gender: "Female", phone: "+91 99030 78144", email: "nandita.roy@example.in", bloodGroup: "A+", department: "Neurology", doctor: "Dr. Farhan Ali", status: "Active", lastVisit: "10 Nov 2026", emergency: "Sanjay Roy · +91 98314 90632", address: "Jadavpur, Kolkata, West Bengal" },
  { id: "CT-24078", name: "Debashish Ghosh", age: 47, gender: "Male", phone: "+91 98306 11973", email: "debashish.g@example.in", bloodGroup: "AB+", department: "Orthopedics", doctor: "Dr. Rituparna Dey", status: "Follow-up", lastVisit: "08 Nov 2026", emergency: "Moumita Ghosh · +91 98301 55780", address: "New Town, Kolkata, West Bengal" },
  { id: "CT-24077", name: "Ishita Banerjee", age: 63, gender: "Female", phone: "+91 99034 28415", email: "ishita.b@example.in", bloodGroup: "O-", department: "Cardiology", doctor: "Dr. Arindam Bose", status: "Active", lastVisit: "07 Nov 2026", emergency: "Anirban Banerjee · +91 98308 64120", address: "Alipore, Kolkata, West Bengal" },
  { id: "CT-24076", name: "Arjun Das", age: 42, gender: "Male", phone: "+91 98312 70954", email: "arjun.das@example.in", bloodGroup: "A-", department: "Internal Medicine", doctor: "Dr. Priya Nair", status: "Active", lastVisit: "06 Nov 2026", emergency: "Rina Das · +91 98304 55369", address: "Lake Town, Kolkata, West Bengal" },
]

export const demoDoctors = [
  { name: "Dr. Arindam Bose", specialty: "Cardiology", qualifications: "MBBS, MD (Medicine), DM (Cardiology)", experience: "16 years", registration: "WBMC 68421", patients: 42, initials: "AB", tone: "teal" },
  { name: "Dr. Priya Nair", specialty: "Internal Medicine", qualifications: "MBBS, MD (Internal Medicine)", experience: "12 years", registration: "WBMC 72913", patients: 36, initials: "PN", tone: "blue" },
  { name: "Dr. Farhan Ali", specialty: "Neurology", qualifications: "MBBS, MD, DM (Neurology)", experience: "10 years", registration: "WBMC 80126", patients: 28, initials: "FA", tone: "violet" },
  { name: "Dr. Rituparna Dey", specialty: "Orthopedics", qualifications: "MBBS, MS (Orthopedics), DNB", experience: "14 years", registration: "WBMC 71388", patients: 31, initials: "RD", tone: "amber" },
]

export const demoRecords: MedicalRecord[] = [
  { id: "MR-1084", patientId: "CT-24081", patient: "Aditi Sen", title: "Cardiology consultation", diagnosis: "Hypertension follow-up", doctor: "Dr. Arindam Bose", date: "12 Nov 2026", notes: "Follow-up consultation documented. Review observations and care plan with the treating clinician." },
  { id: "MR-1083", patientId: "CT-24080", patient: "Sourav Chatterjee", title: "Medicine consultation", diagnosis: "Routine follow-up", doctor: "Dr. Priya Nair", date: "11 Nov 2026", notes: "Patient history reviewed. Follow-up plan recorded by the attending physician." },
  { id: "MR-1082", patientId: "CT-24079", patient: "Nandita Roy", title: "Neurology review", diagnosis: "Headache assessment", doctor: "Dr. Farhan Ali", date: "10 Nov 2026", notes: "Clinical review completed. Please consult the care team for interpretation and next steps." },
  { id: "MR-1081", patientId: "CT-24077", patient: "Ishita Banerjee", title: "Cardiology consultation", diagnosis: "Cardiac review", doctor: "Dr. Arindam Bose", date: "07 Nov 2026", notes: "Consultation notes recorded for continuity of care." },
]

export const demoTests: DiagnosticTest[] = [
  { id: "DX-6104", patientId: "CT-24081", patient: "Aditi Sen", test: "ECG", department: "Cardiology", doctor: "Dr. Arindam Bose", date: "13 Nov 2026", status: "Scheduled", note: "Routine diagnostic appointment. Results require review by the treating clinician." },
  { id: "DX-6103", patientId: "CT-24080", patient: "Sourav Chatterjee", test: "Lipid Profile", department: "Pathology", doctor: "Dr. Priya Nair", date: "12 Nov 2026", status: "Report ready", note: "Report is available for review by the care team." },
  { id: "DX-6102", patientId: "CT-24079", patient: "Nandita Roy", test: "Complete Blood Count", department: "Pathology", doctor: "Dr. Farhan Ali", date: "11 Nov 2026", status: "In progress", note: "Sample processing in progress." },
  { id: "DX-6101", patientId: "CT-24077", patient: "Ishita Banerjee", test: "Echocardiogram", department: "Cardiology", doctor: "Dr. Arindam Bose", date: "07 Nov 2026", status: "Report ready", note: "Report is available for review by the care team." },
]

export const demoReports: MedicalReport[] = [
  { id: "DOC-2981", patientId: "CT-24081", patient: "Aditi Sen", name: "Consultation summary.pdf", type: "Clinical summary", date: "12 Nov 2026", size: "248 KB" },
  { id: "DOC-2980", patientId: "CT-24080", patient: "Sourav Chatterjee", name: "Lipid profile report.pdf", type: "Diagnostic report", date: "12 Nov 2026", size: "412 KB" },
  { id: "DOC-2979", patientId: "CT-24079", patient: "Nandita Roy", name: "Referral letter.pdf", type: "Referral", date: "10 Nov 2026", size: "186 KB" },
]

export const demoAdmissions: Admission[] = [
  { id: "ADM-0741", patientId: "CT-24077", patient: "Ishita Banerjee", ward: "Cardiac care · 3rd floor", bed: "CC-12", admitted: "10 Nov 2026", status: "Admitted" },
  { id: "ADM-0740", patientId: "CT-24080", patient: "Sourav Chatterjee", ward: "General medicine · 2nd floor", bed: "GM-08", admitted: "09 Nov 2026", status: "Admitted" },
  { id: "ADM-0739", patientId: "CT-24078", patient: "Debashish Ghosh", ward: "Orthopedics · 4th floor", bed: "OR-16", admitted: "04 Nov 2026", status: "Discharged", discharged: "08 Nov 2026", notes: "Discharge summary provided by care team." },
  { id: "ADM-0738", patientId: "CT-24076", patient: "Arjun Das", ward: "General medicine · 2nd floor", bed: "GM-03", admitted: "01 Nov 2026", status: "Discharged", discharged: "05 Nov 2026", notes: "Follow-up arranged with the attending physician." },
]

export const roleSections: Record<Role, Section[]> = {
  Administrator: ["overview", "patients", "doctors", "admissions", "records", "diagnostics", "reports", "staff"],
  Doctor: ["overview", "patients", "records", "diagnostics", "reports"],
  "Hospital staff": ["overview", "patients", "admissions", "reports"],
  Patient: ["overview", "doctors", "records", "diagnostics", "reports", "admissions"],
}
