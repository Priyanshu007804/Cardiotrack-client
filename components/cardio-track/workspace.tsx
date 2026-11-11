"use client"

import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react"
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"
import { Activity, AlertCircle, ArrowDownRight, ArrowRight, ArrowUpRight, Bell, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, ClipboardList, Download, FileHeart, FilePlus2, Filter, HeartPulse, LayoutDashboard, LockKeyhole, LogOut, Menu, MoreHorizontal, Plus, Search, Settings, ShieldCheck, Stethoscope, TestTube2, UserRound, UserRoundPlus, UsersRound, X } from "lucide-react"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import type { LucideIcon } from "lucide-react"
import { demoAdmissions, demoDoctors, demoPatients, demoRecords, demoReports, demoTests, roleSections, type Admission, type DiagnosticTest, type MedicalRecord, type MedicalReport, type Patient, type Role, type Section } from "./data"

const sectionNames: Record<Section, string> = { overview: "Overview", patients: "Patients", doctors: "Doctors", records: "Clinical records", diagnostics: "Diagnostic tests", reports: "Medical reports", admissions: "Hospital stays", staff: "Staff access", settings: "Settings" }
const sectionIcons: Record<Section, LucideIcon> = { overview: LayoutDashboard, patients: UsersRound, doctors: Stethoscope, records: ClipboardList, diagnostics: TestTube2, reports: FileHeart, admissions: Activity, staff: UserRoundPlus, settings: Settings }
const patientUserId = "CT-24081"
const initialPatient = demoPatients[0]
const activityChartConfig = { visits: { label: "Patient visits", color: "var(--chart-1)" } } satisfies ChartConfig
const activityChartData = [{ day: "Mon", visits: 28 }, { day: "Tue", visits: 34 }, { day: "Wed", visits: 31 }, { day: "Thu", visits: 42 }, { day: "Fri", visits: 38 }, { day: "Sat", visits: 24 }, { day: "Sun", visits: 19 }]
const roleWelcome: Record<Role, string> = { Administrator: "Ananya", Doctor: "Arindam", "Hospital staff": "Meera", Patient: "Aditi" }

type ModalType = "patient" | "edit-patient" | "record" | "test" | "admission" | "report" | "discharge" | "assign" | "delete" | null

type WorkspaceProps = { role: Role; userName: string; onSignOut: () => void; onSwitchRole: (role: Role) => void }

export function Workspace({ role, userName, onSignOut, onSwitchRole }: WorkspaceProps) {
  const [section, setSection] = useState<Section>("overview")
  const [patients, setPatients] = useState(demoPatients)
  const [records, setRecords] = useState(demoRecords)
  const [tests, setTests] = useState(demoTests)
  const [reports, setReports] = useState(demoReports)
  const [admissions, setAdmissions] = useState(demoAdmissions)
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(role === "Patient" ? initialPatient : null)
  const [patientTab, setPatientTab] = useState("Overview")
  const [query, setQuery] = useState("")
  const [filter, setFilter] = useState("All patients")
  const [modal, setModal] = useState<ModalType>(null)
  const [modalDoctor, setModalDoctor] = useState("")
  const [targetId, setTargetId] = useState("")
  const [toast, setToast] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploading, setUploading] = useState(false)
  const [previewReport, setPreviewReport] = useState<MedicalReport | null>(null)
  const [menuOpen, setMenuOpen] = useState<"profile" | "notifications" | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [today] = useState("Thursday, 12 November 2026")

  const permittedSections = roleSections[role]
  const ownPatient = role === "Patient" ? patients.find((patient) => patient.id === patientUserId) ?? initialPatient : null
  const visiblePatients = useMemo(() => {
    const source = role === "Patient" ? patients.filter((patient) => patient.id === patientUserId) : patients
    return source.filter((patient) => {
      const matchesQuery = `${patient.name} ${patient.id} ${patient.department} ${patient.doctor}`.toLowerCase().includes(query.toLowerCase())
      const matchesStatus = filter === "All patients" || patient.status === filter
      return matchesQuery && matchesStatus
    })
  }, [patients, query, filter, role])
  const currentName = userName || roleWelcome[role]

  const notify = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(""), 3200)
  }
  const navigate = (next: Section) => {
    setSection(next)
    setQuery("")
    setMenuOpen(null)
    setMobileOpen(false)
    if (next !== "patients") setSelectedPatient(role === "Patient" ? ownPatient : null)
  }
  const openPatient = (patient: Patient) => {
    setSelectedPatient(patient)
    setPatientTab("Overview")
    setSection("patients")
  }
  const startModal = (next: ModalType) => {
    setModal(next)
    setUploadProgress(0)
    setUploading(false)
  }
  const openPatientEdit = (patient: Patient) => {
    setTargetId(patient.id)
    startModal("edit-patient")
  }

  const handleModalSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const value = (name: string) => String(formData.get(name) ?? "").trim()
    if (modal === "patient") {
      const name = value("name")
      const newPatient: Patient = { id: `CT-${24100 + patients.length}`, name, age: Number(value("age")) || 34, gender: value("gender"), phone: value("phone"), email: value("email"), bloodGroup: value("bloodGroup"), department: value("department"), doctor: value("doctor"), status: "Active", lastVisit: "12 Nov 2026", emergency: value("emergency"), address: value("address") }
      setPatients((previous) => [newPatient, ...previous])
      setModal(null)
      setSection("patients")
      notify(`${name} was added to the demonstration directory.`)
      return
    }
    if (modal === "edit-patient") {
      const currentPatient = patients.find((item) => item.id === targetId)
      if (!currentPatient) return
      const updatedPatient: Patient = { ...currentPatient, name: value("name"), age: Number(value("age")) || currentPatient.age, gender: value("gender"), phone: value("phone"), email: value("email"), bloodGroup: value("bloodGroup"), department: value("department"), doctor: value("doctor"), emergency: value("emergency"), address: value("address") }
      setPatients((previous) => previous.map((patient) => patient.id === updatedPatient.id ? updatedPatient : patient))
      setSelectedPatient(updatedPatient)
      setModal(null)
      notify(`${updatedPatient.name}'s demonstration profile was updated.`)
      return
    }
    if (modal === "record") {
      const patient = patients.find((item) => item.id === value("patientId")) ?? patients[0]
      const record: MedicalRecord = { id: `MR-${1090 + records.length}`, patientId: patient.id, patient: patient.name, title: value("title"), diagnosis: value("diagnosis"), doctor: value("doctor"), date: "12 Nov 2026", notes: value("notes") }
      setRecords((previous) => [record, ...previous])
      setModal(null)
      notify("Clinical note added to the demonstration record.")
      return
    }
    if (modal === "test") {
      const patient = patients.find((item) => item.id === value("patientId")) ?? patients[0]
      const test: DiagnosticTest = { id: `DX-${6105 + tests.length}`, patientId: patient.id, patient: patient.name, test: value("test"), department: value("department"), doctor: value("doctor"), date: value("date") || "14 Nov 2026", status: "Scheduled", note: value("note") }
      setTests((previous) => [test, ...previous])
      setModal(null)
      notify("Diagnostic test scheduled in the demonstration workspace.")
      return
    }
    if (modal === "admission") {
      const patient = patients.find((item) => item.id === value("patientId")) ?? patients[0]
      if (admissions.some((admission) => admission.patientId === patient.id && admission.status === "Admitted")) {
        notify("This patient already has an active hospital stay.")
        return
      }
      const admission: Admission = { id: `ADM-${742 + admissions.length}`, patientId: patient.id, patient: patient.name, ward: value("ward"), bed: value("bed"), admitted: "12 Nov 2026", status: "Admitted" }
      setAdmissions((previous) => [admission, ...previous])
      setModal(null)
      notify("Hospital stay opened in the demonstration workspace.")
      return
    }
    if (modal === "discharge") {
      setAdmissions((previous) => previous.map((admission) => admission.id === targetId ? { ...admission, status: "Discharged", discharged: "12 Nov 2026", notes: value("notes") } : admission))
      setModal(null)
      notify("Discharge recorded. Please ensure the care team has completed the clinical review.")
      return
    }
    if (modal === "assign") {
      const patient = patients.find((item) => item.id === value("patientId")) ?? patients[0]
      const updatedPatient = { ...patient, doctor: modalDoctor }
      setPatients((previous) => previous.map((item) => item.id === patient.id ? updatedPatient : item))
      setSelectedPatient((current) => current?.id === patient.id ? updatedPatient : current)
      notify(`${patient.name} is now assigned to ${modalDoctor} in this demonstration.`)
      setModal(null)
      return
    }
    if (modal === "report") {
      const file = formData.get("file")
      if (!(file instanceof File) || file.size === 0) {
        notify("Choose a PDF or image file to continue.")
        return
      }
      if (!/^(application\/pdf|image\/(jpeg|png))$/.test(file.type) || file.size > 10 * 1024 * 1024) {
        notify("Choose a PDF, JPG, or PNG file up to 10 MB.")
        return
      }
      const patient = patients.find((item) => item.id === value("patientId")) ?? patients[0]
      const report: MedicalReport = { id: `DOC-${2982 + reports.length}`, patientId: patient.id, patient: patient.name, name: file.name, type: value("type"), date: "12 Nov 2026", size: `${Math.max(1, Math.round(file.size / 1024))} KB`, file }
      setUploading(true)
      setUploadProgress(18)
      window.setTimeout(() => setUploadProgress(54), 180)
      window.setTimeout(() => setUploadProgress(82), 380)
      window.setTimeout(() => {
        setUploadProgress(100)
        setReports((previous) => [report, ...previous])
        setUploading(false)
        setModal(null)
        notify("Document added to this demonstration session only.")
      }, 680)
      return
    }
    if (modal === "delete") {
      setReports((previous) => previous.filter((report) => report.id !== targetId))
      setModal(null)
      notify("Document removed from this demonstration session.")
    }
  }

  const openDischarge = (id: string) => { setTargetId(id); startModal("discharge") }
  const openDelete = (id: string) => { setTargetId(id); startModal("delete") }
  const viewTitle = section === "patients" && selectedPatient ? selectedPatient.name : sectionNames[section]
  const needsSearch = ["patients", "records", "diagnostics", "reports", "admissions", "doctors", "staff"].includes(section)

  return (
    <main className={`workspace ${collapsed ? "sidebar-collapsed" : ""}`}>
      {mobileOpen && <button aria-label="Close navigation" className="mobile-scrim" onClick={() => setMobileOpen(false)} />}
      <aside className={`app-sidebar ${mobileOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-brand"><a className="brand-lockup" href="#workspace" onClick={(event) => { event.preventDefault(); navigate("overview") }}><span className="brand-mark"><HeartPulse aria-hidden="true" /></span><span className="brand-word">Cardio<span>Track</span></span></a><button className="sidebar-collapse" aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"} onClick={() => setCollapsed(!collapsed)}><ChevronLeft aria-hidden="true" /></button></div>
        <div className="hospital-context"><span className="hospital-mini-mark">S</span><span className="hospital-context-copy"><strong>Shantideep Medical Centre</strong><small>Kolkata · Demonstration</small></span><ChevronDown aria-hidden="true" /></div>
        <div className="sidebar-section-label">WORKSPACE</div>
        <nav className="side-nav" aria-label={`${role} navigation`}>
          {permittedSections.map((item) => {
            const Icon = sectionIcons[item]
            const active = section === item || (section === "patients" && selectedPatient && item === "patients")
            return <button key={item} className={`side-nav-item ${active ? "active" : ""}`} onClick={() => navigate(item)} aria-current={active ? "page" : undefined} title={collapsed ? sectionNames[item] : undefined}><Icon aria-hidden="true" /><span>{role === "Patient" && item === "overview" ? "My health" : role === "Patient" && item === "doctors" ? "My doctors" : role === "Patient" && item === "admissions" ? "Hospital stays" : sectionNames[item]}</span>{item === "admissions" && role !== "Patient" && <span className="nav-count">2</span>}</button>
          })}
        </nav>
        <div className="sidebar-bottom">
          <div className="sidebar-help"><CircleHelp aria-hidden="true" /><span><strong>Need assistance?</strong><small>Contact hospital support</small></span><ArrowUpRight aria-hidden="true" /></div>
          <div className="sidebar-user"><span className="user-avatar">{initials(currentName)}</span><span className="user-copy"><strong>{currentName}</strong><small>{role}</small></span><button aria-label="Open account menu" className="icon-button user-menu-button" onClick={() => setMenuOpen(menuOpen === "profile" ? null : "profile")}><MoreHorizontal aria-hidden="true" /></button></div>
        </div>
      </aside>

      <div className="app-main">
        <header className="app-topbar">
          <div className="topbar-left"><button className="mobile-nav-button icon-button" aria-label="Open navigation" onClick={() => setMobileOpen(true)}><Menu aria-hidden="true" /></button><div className="breadcrumbs"><span>Shantideep Medical Centre</span><ChevronRight aria-hidden="true" /><strong>{viewTitle}</strong></div></div>
          <div className="topbar-actions">
            {needsSearch && <label className="global-search"><Search aria-hidden="true" /><input aria-label={`Search ${viewTitle}`} placeholder={`Search ${viewTitle.toLowerCase()}…`} value={query} onChange={(event) => setQuery(event.target.value)} /><kbd>⌘ K</kbd></label>}
            <div className="relative-action"><button className={`icon-button notification-button ${menuOpen === "notifications" ? "selected" : ""}`} aria-label="Notifications" aria-expanded={menuOpen === "notifications"} onClick={() => setMenuOpen(menuOpen === "notifications" ? null : "notifications")}><Bell aria-hidden="true" /><span className="notification-dot" /></button>
              {menuOpen === "notifications" && <div className="popover-panel notification-popover"><div className="popover-heading"><strong>Recent activity</strong><span>2 new</span></div><div className="notice-item"><span className="notice-icon notice-blue"><CalendarDays aria-hidden="true" /></span><span><strong>Care team schedule updated</strong><small>Today · Hospital operations</small></span></div><div className="notice-item"><span className="notice-icon notice-green"><FileHeart aria-hidden="true" /></span><span><strong>New document added</strong><small>Today · Patient records</small></span></div><p className="notification-privacy"><LockKeyhole aria-hidden="true" /> Patient details are intentionally omitted.</p></div>}
            </div>
            <button className="topbar-profile" onClick={() => setMenuOpen(menuOpen === "profile" ? null : "profile")} aria-expanded={menuOpen === "profile"}><span className="user-avatar">{initials(currentName)}</span><span><strong>{currentName}</strong><small>{role}</small></span><ChevronDown aria-hidden="true" /></button>
            {menuOpen === "profile" && <div className="popover-panel profile-popover"><div className="profile-menu-heading"><span className="user-avatar">{initials(currentName)}</span><span><strong>{currentName}</strong><small>{role}</small></span></div><button onClick={() => { navigate("settings"); setMenuOpen(null) }}><Settings aria-hidden="true" /> Account settings</button><button onClick={() => { onSignOut(); setMenuOpen(null) }}><LogOut aria-hidden="true" /> Sign out</button><div className="role-switch"><label htmlFor="role-switch">Switch demonstration role</label><select id="role-switch" value={role} onChange={(event) => onSwitchRole(event.target.value as Role)}><option>Administrator</option><option>Doctor</option><option>Hospital staff</option><option>Patient</option></select></div></div>}
          </div>
        </header>

        {menuOpen && <button aria-label="Close menu" className="popover-dismiss" onClick={() => setMenuOpen(null)} />}
        <div className="workspace-content" id="workspace">
          {section === "overview" && <Overview role={role} name={currentName} patients={patients} records={records} tests={tests} admissions={admissions} onNavigate={navigate} onOpenPatient={openPatient} />}
          {section === "patients" && (selectedPatient ? <PatientProfile patient={selectedPatient} records={records.filter((item) => item.patientId === selectedPatient.id)} tests={tests.filter((item) => item.patientId === selectedPatient.id)} reports={reports.filter((item) => item.patientId === selectedPatient.id)} admissions={admissions.filter((item) => item.patientId === selectedPatient.id)} tab={patientTab} onTab={setPatientTab} onBack={() => setSelectedPatient(null)} onOpenReport={setPreviewReport} canEdit={role === "Administrator" || role === "Hospital staff"} onEdit={() => openPatientEdit(selectedPatient)} /> : <PatientDirectory patients={visiblePatients} role={role} query={query} filter={filter} onFilter={setFilter} onAdd={() => startModal("patient")} onOpen={openPatient} />)}
          {section === "doctors" && <DoctorsPage role={role} onAssign={(name) => { setModalDoctor(name); startModal("assign") }} onOpenPatient={openPatient} />}
          {section === "records" && <RecordsPage records={records.filter((item) => role !== "Patient" || item.patientId === patientUserId).filter((item) => `${item.patient} ${item.title} ${item.diagnosis}`.toLowerCase().includes(query.toLowerCase()))} role={role} onAdd={() => startModal("record")} onOpenPatient={openPatient} />}
          {section === "diagnostics" && <DiagnosticsPage tests={tests.filter((item) => role !== "Patient" || item.patientId === patientUserId).filter((item) => `${item.patient} ${item.test} ${item.department}`.toLowerCase().includes(query.toLowerCase()))} role={role} onAdd={() => startModal("test")} onOpenPatient={openPatient} />}
          {section === "reports" && <ReportsPage reports={reports.filter((item) => role !== "Patient" || item.patientId === patientUserId).filter((item) => `${item.patient} ${item.name} ${item.type}`.toLowerCase().includes(query.toLowerCase()))} role={role} onUpload={() => startModal("report")} onOpenPatient={openPatient} onPreview={setPreviewReport} onDelete={openDelete} />}
          {section === "admissions" && <AdmissionsPage admissions={admissions.filter((item) => role !== "Patient" || item.patientId === patientUserId).filter((item) => `${item.patient} ${item.ward} ${item.status}`.toLowerCase().includes(query.toLowerCase()))} role={role} onAdd={() => startModal("admission")} onDischarge={openDischarge} onOpenPatient={openPatient} />}
          {section === "staff" && <StaffPage />}
          {section === "settings" && <SettingsPage role={role} userName={currentName} onSignOut={onSignOut} />}
        </div>
      </div>
      {toast && <div className="toast-message" role="status"><span><Check aria-hidden="true" /></span>{toast}<button aria-label="Dismiss notification" onClick={() => setToast("")}><X aria-hidden="true" /></button></div>}
      {modal && <ActionDialog type={modal} role={role} patients={patients} patientToEdit={modal === "edit-patient" ? selectedPatient ?? undefined : undefined} doctor={modalDoctor} uploading={uploading} uploadProgress={uploadProgress} onClose={() => !uploading && setModal(null)} onSubmit={handleModalSubmit} onDelete={() => { setReports((previous) => previous.filter((report) => report.id !== targetId)); setModal(null); notify("Document removed from this demonstration session.") }} />}
      {previewReport && <ReportDialog report={previewReport} onClose={() => setPreviewReport(null)} />}
    </main>
  )
}

function Overview({ role, name, patients, records, tests, admissions, onNavigate, onOpenPatient }: { role: Role; name: string; patients: Patient[]; records: MedicalRecord[]; tests: DiagnosticTest[]; admissions: Admission[]; onNavigate: (section: Section) => void; onOpenPatient: (patient: Patient) => void }) {
  const patientView = role === "Patient"
  const activeAdmissions = admissions.filter((item) => item.status === "Admitted")
  const shownPatients = patientView ? patients.filter((item) => item.id === patientUserId) : patients
  const ownRecord = records.find((item) => item.patientId === patientUserId)
  const ownTest = tests.find((item) => item.patientId === patientUserId)
  const ownRecordCount = records.filter((item) => item.patientId === patientUserId).length
  const ownTests = tests.filter((item) => item.patientId === patientUserId)
  const upcomingTestCount = ownTests.filter((item) => item.status === "Scheduled").length
  const ownStays = admissions.filter((item) => item.patientId === patientUserId)
  const activeOwnStay = ownStays.some((item) => item.status === "Admitted")
  return <div className="page-stack">
    <div className="page-heading"><div><div className="eyebrow">{patientView ? "YOUR CARE, AT A GLANCE" : "HOSPITAL OPERATIONS"}</div><h1>{patientView ? `Good morning, ${name.split(" ")[0]}` : `Good morning, ${name.split(" ")[0]}`}</h1><p>{patientView ? "Your care information, brought together in one place." : "A clear view of today’s care activity at Shantideep Medical Centre."}</p></div><div className="date-chip"><CalendarDays aria-hidden="true" /> Thursday, 12 Nov 2026</div></div>
    <div className="demo-banner"><span><ShieldCheck aria-hidden="true" /></span><div><strong>Fictional demonstration data</strong><p>These sample records are illustrative only and do not represent live hospital information or clinical advice.</p></div><span className="demo-pill">DEMO</span></div>
    <div className="stats-grid">
      {patientView ? <>
        <StatCard label="Care team" value="1 doctor" detail="Your assigned physician" icon={Stethoscope} tone="teal" />
        <StatCard label="Clinical records" value={String(ownRecordCount).padStart(2, "0")} detail={ownRecordCount === 1 ? "1 entry in your history" : `${ownRecordCount} entries in your history`} icon={ClipboardList} tone="blue" />
        <StatCard label="Diagnostic tests" value={String(ownTests.length).padStart(2, "0")} detail={upcomingTestCount === 1 ? "1 upcoming appointment" : `${upcomingTestCount} upcoming appointments`} icon={TestTube2} tone="violet" />
        <StatCard label="Hospital stays" value={String(ownStays.length).padStart(2, "0")} detail={activeOwnStay ? "Active admission" : ownStays.length ? "Past hospital stays" : "No hospital stays recorded"} icon={Activity} tone="amber" />
      </> : <>
        <StatCard label="Registered patients" value={String(patients.length + 1248)} detail="Across all departments" icon={UsersRound} tone="teal" change="8.2%" />
        <StatCard label="Active admissions" value={String(activeAdmissions.length + 18)} detail="Across 6 wards" icon={Activity} tone="blue" change="3.1%" />
        <StatCard label="Discharged this month" value="86" detail="From 5 departments" icon={ArrowDownRight} tone="violet" change="12.4%" />
        <StatCard label="Care team" value="32 doctors" detail="Across 8 specialties" icon={Stethoscope} tone="amber" change="4 new" />
      </>}
    </div>
    <div className="overview-grid">
      <section className="surface-card activity-chart-card"><div className="card-heading"><div><h2>{patientView ? "Your care timeline" : "Care activity"}</h2><p>{patientView ? "Recent updates to your care record" : "Patient visits across the last 7 days"}</p></div><button className="button button-outline button-small" onClick={() => onNavigate(patientView ? "records" : "patients")}>View details <ArrowRight aria-hidden="true" /></button></div>
        {patientView ? <div className="timeline-list"><TimelineItem date="12 Nov" title="Follow-up consultation" subtitle="Cardiology · Dr. Arindam Bose" tone="teal" /><TimelineItem date="13 Nov" title="ECG appointment" subtitle="Scheduled · Cardiology" tone="blue" /><TimelineItem date="07 Nov" title="Clinical summary added" subtitle="Patient records" tone="amber" /></div> : <ChartContainer config={activityChartConfig} className="activity-chart-plot" aria-label="Demonstration patient visits across the last seven days"><BarChart accessibilityLayer data={activityChartData} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}><CartesianGrid vertical={false} /><XAxis dataKey="day" tickLine={false} axisLine={false} tickMargin={9} /><YAxis domain={[0, 50]} tickCount={6} tickLine={false} axisLine={false} width={34} /><ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} /><Bar dataKey="visits" fill="var(--color-visits)" radius={[5, 5, 0, 0]} maxBarSize={30} /></BarChart></ChartContainer>}
        <div className="chart-footnote"><span><i className="legend-dot" /> {patientView ? "Care events" : "Patient visits"}</span><span>Illustrative weekly activity</span></div>
      </section>
      <section className="surface-card care-queue-card"><div className="card-heading"><div><h2>{patientView ? "Your care team" : role === "Doctor" ? "Today’s schedule" : "Recent care activity"}</h2><p>{patientView ? "Your assigned physician" : "Updates across the hospital"}</p></div><button className="icon-button" aria-label="More activity options"><MoreHorizontal aria-hidden="true" /></button></div>
        {patientView ? <div className="doctor-compact"><span className="doctor-avatar avatar-teal">AB</span><div><strong>Dr. Arindam Bose</strong><small>Cardiology · Treating physician</small><span className="available-label"><i /> Your care team</span></div><button className="icon-button" aria-label="View your doctor" onClick={() => onNavigate("doctors")}><ArrowUpRight aria-hidden="true" /></button></div> : <div className="activity-list"><ActivityItem icon={UserRoundPlus} tone="teal" title="Patient registered" detail="New patient added to the directory" time="09:42 AM" /><ActivityItem icon={FilePlus2} tone="blue" title="Clinical note recorded" detail="Cardiology · Patient follow-up" time="10:18 AM" /><ActivityItem icon={TestTube2} tone="amber" title="Diagnostic test scheduled" detail="Cardiology · ECG appointment" time="11:05 AM" /><ActivityItem icon={FileHeart} tone="violet" title="Report added" detail="A new document is ready for review" time="11:32 AM" /></div>}
        <button className="activity-link" onClick={() => onNavigate(patientView ? "records" : "records")}>View {patientView ? "your records" : "all clinical activity"} <ArrowRight aria-hidden="true" /></button>
      </section>
    </div>
    <div className="bottom-overview-grid">
      <section className="surface-card table-card"><div className="card-heading"><div><h2>{patientView ? "Your latest records" : "Recently seen patients"}</h2><p>{patientView ? "Entries recorded by your care team" : "Latest patient activity across the hospital"}</p></div><button className="text-link" onClick={() => onNavigate(patientView ? "records" : "patients")}>View all <ArrowRight aria-hidden="true" /></button></div>
        {patientView ? <div className="record-preview-list">{[ownRecord, ownTest].filter(Boolean).map((item, index) => <button className="record-preview-row" key={item!.id} onClick={() => onNavigate(index === 0 ? "records" : "diagnostics")}><span className={`row-icon ${index === 0 ? "tone-teal" : "tone-blue"}`}>{index === 0 ? <ClipboardList /> : <TestTube2 />}</span><span><strong>{index === 0 ? "Follow-up consultation" : "ECG appointment"}</strong><small>{index === 0 ? "12 Nov 2026 · Clinical record" : "13 Nov 2026 · Scheduled test"}</small></span><ChevronRight aria-hidden="true" /></button>)}</div> : <div className="compact-patient-list">{patients.slice(0, 4).map((patient) => <button key={patient.id} className="compact-patient-row" onClick={() => onOpenPatient(patient)}><span className="patient-avatar">{initials(patient.name)}</span><span className="compact-patient-main"><strong>{patient.name}</strong><small>{patient.department}</small></span><span className="compact-patient-date">{patient.lastVisit}</span><ChevronRight aria-hidden="true" /></button>)}</div>}
      </section>
      <section className="surface-card quick-actions-card"><div className="card-heading"><div><h2>Quick actions</h2><p>Common tasks for your workspace</p></div></div><div className="quick-action-list">{(patientView ? [{ title: "View medical records", icon: ClipboardList, section: "records" as Section }, { title: "View upcoming tests", icon: TestTube2, section: "diagnostics" as Section }, { title: "Contact your care team", icon: Stethoscope, section: "doctors" as Section }] : [{ title: "Find a patient", icon: Search, section: "patients" as Section }, { title: "Review hospital stays", icon: Activity, section: "admissions" as Section }, { title: "Open clinical records", icon: FileHeart, section: "records" as Section }]).map((action) => <button className="quick-action" key={action.title} onClick={() => onNavigate(action.section)}><span><action.icon aria-hidden="true" /></span>{action.title}<ArrowRight aria-hidden="true" /></button>)}</div><div className="privacy-note"><LockKeyhole aria-hidden="true" /><span>Only authorized care team members can access patient details.</span></div></section>
    </div>
    <p className="page-disclaimer"><ShieldCheck aria-hidden="true" /> Demonstration data is fictional and not intended for clinical decisions.</p>
  </div>
}

function StatCard({ label, value, detail, icon: Icon, tone, change }: { label: string; value: string; detail: string; icon: LucideIcon; tone: string; change?: string }) {
  return <article className="stat-card"><div className={`stat-icon icon-${tone}`}><Icon aria-hidden="true" /></div><span className="stat-label">{label}</span><div className="stat-value-row"><strong>{value}</strong>{change && <span className="stat-change"><ArrowUpRight aria-hidden="true" /> {change}</span>}</div><span className="stat-detail">{detail}</span></article>
}

function TimelineItem({ date, title, subtitle, tone }: { date: string; title: string; subtitle: string; tone: string }) { return <div className="timeline-item"><span className={`timeline-dot dot-${tone}`} /><span className="timeline-date">{date}</span><span className="timeline-copy"><strong>{title}</strong><small>{subtitle}</small></span></div> }
function ActivityItem({ icon: Icon, tone, title, detail, time }: { icon: LucideIcon; tone: string; title: string; detail: string; time: string }) { return <div className="activity-item"><span className={`activity-icon icon-${tone}`}><Icon aria-hidden="true" /></span><span className="activity-copy"><strong>{title}</strong><small>{detail}</small></span><time>{time}</time></div> }

function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: ReactNode }) { return <div className="page-heading"><div><div className="eyebrow">{eyebrow}</div><h1>{title}</h1><p>{description}</p></div>{action && <div className="heading-action">{action}</div>}</div> }
function PatientDirectory({ patients, role, query, filter, onFilter, onAdd, onOpen }: { patients: Patient[]; role: Role; query: string; filter: string; onFilter: (value: string) => void; onAdd: () => void; onOpen: (patient: Patient) => void }) {
  return <div className="page-stack"><PageHeading eyebrow={role === "Patient" ? "YOUR CARE" : "PATIENT SERVICES"} title={role === "Patient" ? "My health profile" : "Patient directory"} description={role === "Patient" ? "Your personal details and care history." : "Search patient information and open an authorized care record."} action={role !== "Patient" && (role === "Administrator" || role === "Hospital staff") ? <button className="button button-primary" onClick={onAdd}><Plus aria-hidden="true" /> Register patient</button> : undefined} />
    <div className="directory-summary"><div><span className="directory-counter">{patients.length}</span><span>{role === "Patient" ? "personal record" : "patients shown"}</span></div>{role !== "Patient" && <label className="filter-select"><Filter aria-hidden="true" /><select value={filter} onChange={(event) => onFilter(event.target.value)} aria-label="Filter by patient status"><option>All patients</option><option>Active</option><option>Follow-up</option></select><ChevronDown aria-hidden="true" /></label>}</div>
    <section className="surface-card table-card full-table"><div className="table-scroll"><table><thead><tr><th>Patient</th><th>Patient ID</th><th>Department</th><th>Assigned doctor</th><th>Last visit</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{patients.map((patient) => <tr key={patient.id}><td><button className="table-person-button" onClick={() => onOpen(patient)}><span className="table-person"><span className="patient-avatar">{initials(patient.name)}</span><span><strong>{patient.name}</strong><small>{patient.age} years · {patient.gender}</small></span></span></button></td><td className="id-cell">{patient.id}</td><td>{patient.department}</td><td>{patient.doctor}</td><td>{patient.lastVisit}</td><td><StatusPill status={patient.status} /></td><td><button className="icon-button row-action" aria-label={`Open ${patient.name} profile`} onClick={(event) => { event.stopPropagation(); onOpen(patient) }}><ChevronRight aria-hidden="true" /></button></td></tr>)}</tbody></table></div>{patients.length === 0 && <EmptyState title={query ? "No matching patients" : "No patient records yet"} text={query ? "Try a different name, patient ID, or department." : "Register a patient to begin a care record."} />}
    <div className="table-footer"><span>Showing {patients.length ? 1 : 0}–{patients.length} of {patients.length} {role === "Patient" ? "record" : "patients"}</span><div><button className="icon-button" aria-label="Previous page" disabled><ChevronLeft aria-hidden="true" /></button><span className="page-number">1</span><button className="icon-button" aria-label="Next page" disabled><ChevronRight aria-hidden="true" /></button></div></div></section>
    <p className="page-disclaimer"><LockKeyhole aria-hidden="true" /> Patient details are visible only within the assigned, authorized workspace.</p>
  </div>
}

function PatientProfile({ patient, records, tests, reports, admissions, tab, onTab, onBack, onOpenReport, canEdit, onEdit }: { patient: Patient; records: MedicalRecord[]; tests: DiagnosticTest[]; reports: MedicalReport[]; admissions: Admission[]; tab: string; onTab: (tab: string) => void; onBack: () => void; onOpenReport: (report: MedicalReport) => void; canEdit: boolean; onEdit: () => void }) {
  const tabs = ["Overview", "Medical Records", "Diagnostic Tests", "Reports", "Hospital Stays"]
  return <div className="page-stack"><button className="back-link" onClick={onBack}><ChevronLeft aria-hidden="true" /> Back to patient directory</button><div className="patient-profile-heading"><span className="patient-profile-avatar">{initials(patient.name)}</span><div className="patient-profile-title"><div className="eyebrow">PATIENT PROFILE · {patient.id}</div><h1>{patient.name}</h1><p>{patient.age} years · {patient.gender} · {patient.department}</p></div><StatusPill status={patient.status} /><button className="button button-outline" onClick={() => onOpenReport(reports[0] ?? { id: "", patientId: patient.id, patient: patient.name, name: "Patient summary", type: "Summary", date: "12 Nov 2026", size: "—" })}><FileHeart aria-hidden="true" /> View summary</button></div>
    <nav className="profile-tabs" aria-label="Patient profile sections">{tabs.map((item) => <button key={item} onClick={() => onTab(item)} className={tab === item ? "selected" : ""} aria-current={tab === item ? "page" : undefined}>{item}{item === "Medical Records" && <span>{records.length}</span>}</button>)}</nav>
    {tab === "Overview" && <div className="patient-overview-grid"><section className="surface-card detail-card"><div className="card-heading"><div><h2>Patient information</h2><p>Personal details for care coordination</p></div>{canEdit && <button className="button button-outline button-small" onClick={onEdit}>Edit details</button>}</div><div className="detail-grid"><Detail label="Patient identifier" value={patient.id} /><Detail label="Date of birth" value="Not provided in this demonstration" /><Detail label="Blood group" value={patient.bloodGroup} /><Detail label="Phone number" value={patient.phone} /><Detail label="Email address" value={patient.email} /><Detail label="Department" value={patient.department} /><Detail label="Assigned doctor" value={patient.doctor} /><Detail label="Emergency contact" value={patient.emergency} /><Detail label="Address" value={patient.address} wide /></div></section><section className="surface-card history-card"><div className="card-heading"><div><h2>Recent care history</h2><p>Most recent entries in this record</p></div></div><div className="timeline-list">{records.slice(0, 3).map((record) => <TimelineItem key={record.id} date={record.date.split(" ").slice(0, 2).join(" ")} title={record.title} subtitle={`${record.doctor} · ${record.diagnosis}`} tone="teal" />)}{records.length === 0 && <EmptyState title="No clinical records" text="Documented care entries will appear here." />}</div></section></div>}
    {tab === "Medical Records" && <RecordList records={records} />}
    {tab === "Diagnostic Tests" && <DiagnosticList tests={tests} />}
    {tab === "Reports" && <ReportList reports={reports} onPreview={onOpenReport} />}
    {tab === "Hospital Stays" && <AdmissionList admissions={admissions} />}
    <p className="page-disclaimer"><ShieldCheck aria-hidden="true" /> Fictional demonstration information. Clinical decisions must be made by the treating healthcare professional.</p>
  </div>
}
function Detail({ label, value, wide }: { label: string; value: string; wide?: boolean }) { return <div className={`detail-field ${wide ? "detail-wide" : ""}`}><span>{label}</span><strong>{value}</strong></div> }

function DoctorsPage({ role, onAssign, onOpenPatient }: { role: Role; onAssign: (doctor: string) => void; onOpenPatient: (patient: Patient) => void }) {
  const doctors = role === "Patient" ? demoDoctors.filter((doctor) => doctor.name === initialPatient.doctor) : demoDoctors
  return <div className="page-stack"><PageHeading eyebrow={role === "Patient" ? "YOUR CARE TEAM" : "CLINICAL TEAM"} title={role === "Patient" ? "My doctors" : "Doctor directory"} description={role === "Patient" ? "Meet the clinicians supporting your care." : "Specialty, experience, and assigned care overview."} action={role === "Administrator" ? <button className="button button-outline" onClick={() => alert("Doctor onboarding is available to authorized hospital administrators.")}><Plus aria-hidden="true" /> Add doctor</button> : undefined} /><div className="doctor-grid">{doctors.map((doctor) => <article className="surface-card doctor-card" key={doctor.name}><div className="doctor-card-top"><span className={`doctor-avatar avatar-${doctor.tone}`}>{doctor.initials}</span><span className="doctor-availability"><i /> Available</span><button className="icon-button" aria-label={`More options for ${doctor.name}`}><MoreHorizontal aria-hidden="true" /></button></div><h2>{doctor.name}</h2><span className="specialty-label">{doctor.specialty}</span><p className="doctor-qualification">{doctor.qualifications}</p><div className="doctor-meta"><span><strong>{doctor.experience}</strong><small>Experience</small></span><span><strong>{doctor.registration}</strong><small>Registration</small></span></div><div className="doctor-card-footer"><span>{role === "Patient" ? "Your treating physician" : `${doctor.patients} assigned patients`}</span>{role === "Administrator" && <button className="button button-outline button-small" onClick={() => onAssign(doctor.name)}>Assign patient</button>}</div>{role !== "Patient" && <button className="doctor-patients-link" onClick={() => onOpenPatient(demoPatients.find((patient) => patient.doctor === doctor.name) ?? demoPatients[0])}>View assigned patients <ArrowRight aria-hidden="true" /></button>}</article>)}</div></div>
}

function RecordsPage({ records, role, onAdd, onOpenPatient }: { records: MedicalRecord[]; role: Role; onAdd: () => void; onOpenPatient: (patient: Patient) => void }) {
  return <div className="page-stack"><PageHeading eyebrow="CARE DOCUMENTATION" title={role === "Patient" ? "My medical records" : "Clinical records"} description={role === "Patient" ? "Structured notes shared with you by your care team." : "Chronological clinical documentation across patient care."} action={role === "Doctor" || role === "Administrator" ? <button className="button button-primary" onClick={onAdd}><Plus aria-hidden="true" /> New clinical note</button> : undefined} /><div className="record-list">{records.map((record) => <article className="surface-card record-card" key={record.id}><div className="record-card-icon"><ClipboardList aria-hidden="true" /></div><div className="record-card-main"><div className="record-card-top"><span className="eyebrow">{record.id} · {record.date}</span><StatusPill status="Documented" /></div><h2>{record.title}</h2><p className="record-diagnosis">{record.diagnosis}</p><p className="record-note">{record.notes}</p><div className="record-attribution"><span className="mini-doctor">{initials(record.doctor.replace("Dr. ", ""))}</span><span>{record.doctor} <i>·</i> {record.patient}</span><button className="text-link" onClick={() => onOpenPatient(demoPatients.find((item) => item.id === record.patientId) ?? demoPatients[0])}>Patient profile <ArrowUpRight aria-hidden="true" /></button></div></div></article>)}{records.length === 0 && <EmptyState title="No clinical notes" text="No clinical documentation matches this search." />}</div><p className="page-disclaimer"><ShieldCheck aria-hidden="true" /> Clinical records are fictional examples and should not be used to guide treatment.</p></div>
}

function DiagnosticsPage({ tests, role, onAdd, onOpenPatient }: { tests: DiagnosticTest[]; role: Role; onAdd: () => void; onOpenPatient: (patient: Patient) => void }) {
  return <div className="page-stack"><PageHeading eyebrow="DIAGNOSTIC SERVICES" title={role === "Patient" ? "My diagnostic tests" : "Diagnostic tests"} description={role === "Patient" ? "Your scheduled tests and reports shared by the care team." : "Coordinate testing and keep clinical follow-up in view."} action={role === "Doctor" || role === "Administrator" ? <button className="button button-primary" onClick={onAdd}><Plus aria-hidden="true" /> Schedule test</button> : undefined} /><section className="surface-card table-card full-table"><div className="table-scroll"><table><thead><tr><th>Test</th><th>Patient</th><th>Department</th><th>Requested by</th><th>Date</th><th>Status</th><th /></tr></thead><tbody>{tests.map((test) => <tr key={test.id}><td><span className="table-test"><span className="test-icon"><TestTube2 aria-hidden="true" /></span><span><strong>{test.test}</strong><small>{test.id}</small></span></span></td><td><button className="table-link" onClick={() => onOpenPatient(demoPatients.find((item) => item.id === test.patientId) ?? demoPatients[0])}>{test.patient}</button></td><td>{test.department}</td><td>{test.doctor}</td><td>{test.date}</td><td><StatusPill status={test.status} /></td><td><button className="icon-button row-action" aria-label={`View ${test.test} details`} onClick={() => alert(test.note)}><ArrowUpRight aria-hidden="true" /></button></td></tr>)}</tbody></table></div>{tests.length === 0 && <EmptyState title="No diagnostic tests" text="No test records match this search." />}<div className="table-footer"><span>{tests.length} test records · Demonstration data</span><div><button className="icon-button" aria-label="Previous page" disabled><ChevronLeft aria-hidden="true" /></button><span className="page-number">1</span><button className="icon-button" aria-label="Next page" disabled><ChevronRight aria-hidden="true" /></button></div></div></section><div className="notice-callout"><AlertCircle aria-hidden="true" /><p>Test statuses indicate workflow only. Results and clinical meaning must be reviewed by the treating healthcare professional.</p></div></div>
}

function ReportsPage({ reports, role, onUpload, onOpenPatient, onPreview, onDelete }: { reports: MedicalReport[]; role: Role; onUpload: () => void; onOpenPatient: (patient: Patient) => void; onPreview: (report: MedicalReport) => void; onDelete: (id: string) => void }) {
  return <div className="page-stack"><PageHeading eyebrow="DOCUMENT CENTRE" title={role === "Patient" ? "My medical reports" : "Medical reports"} description={role === "Patient" ? "Documents shared with you by your care team." : "Manage patient documents and authorized care attachments."} action={role !== "Patient" ? <button className="button button-primary" onClick={onUpload}><Plus aria-hidden="true" /> Upload document</button> : undefined} /><div className="document-note"><LockKeyhole aria-hidden="true" /><span>Files in this demonstration remain in this browser session only; no document is sent to hospital records.</span><span className="supported-files">PDF · JPG · PNG</span></div><section className="surface-card table-card full-table"><div className="table-scroll"><table><thead><tr><th>Document</th><th>Patient</th><th>Type</th><th>Date added</th><th>File size</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{reports.map((report) => <tr key={report.id}><td><button className="document-name" onClick={() => onPreview(report)}><span className="document-icon"><FileHeart aria-hidden="true" /></span><span><strong>{report.name}</strong><small>{report.id}</small></span></button></td><td>{role === "Patient" ? <span className="table-person-plain">{report.patient}</span> : <button className="table-link" onClick={() => onOpenPatient(demoPatients.find((item) => item.id === report.patientId) ?? demoPatients[0])}>{report.patient}</button>}</td><td>{report.type}</td><td>{report.date}</td><td>{report.size}</td><td><div className="table-actions"><button className="icon-button row-action" aria-label={`Preview ${report.name}`} onClick={() => onPreview(report)}><ArrowUpRight aria-hidden="true" /></button>{role === "Administrator" && <button className="icon-button row-action delete-action" aria-label={`Delete ${report.name}`} onClick={() => onDelete(report.id)}><MoreHorizontal aria-hidden="true" /></button>}</div></td></tr>)}</tbody></table></div>{reports.length === 0 && <EmptyState title="No documents yet" text="Documents shared with you will appear here." />}<div className="table-footer"><span>{reports.length} documents · Fictional demonstration records</span><div><button className="icon-button" aria-label="Previous page" disabled><ChevronLeft aria-hidden="true" /></button><span className="page-number">1</span><button className="icon-button" aria-label="Next page" disabled><ChevronRight aria-hidden="true" /></button></div></div></section></div>
}

function AdmissionsPage({ admissions, role, onAdd, onDischarge, onOpenPatient }: { admissions: Admission[]; role: Role; onAdd: () => void; onDischarge: (id: string) => void; onOpenPatient: (patient: Patient) => void }) {
  const current = admissions.filter((item) => item.status === "Admitted").length
  return <div className="page-stack"><PageHeading eyebrow="INPATIENT SERVICES" title={role === "Patient" ? "My hospital stays" : "Hospital stays"} description={role === "Patient" ? "Your admission and discharge history." : "Coordinate admissions, ward placement, and discharge."} action={role === "Hospital staff" || role === "Administrator" ? <button className="button button-primary" onClick={onAdd}><Plus aria-hidden="true" /> New admission</button> : undefined} /><div className="admission-summary-row"><div className="surface-card admission-summary"><span className="summary-icon icon-blue"><Activity aria-hidden="true" /></span><div><strong>{current}</strong><span>Active stays in view</span></div></div><div className="surface-card admission-summary"><span className="summary-icon icon-teal"><Check aria-hidden="true" /></span><div><strong>{admissions.filter((item) => item.status === "Discharged").length}</strong><span>Discharged in this view</span></div></div><div className="admission-summary-caption"><ShieldCheck aria-hidden="true" /> Patient details are shown only to authorized roles.</div></div><section className="surface-card table-card full-table"><div className="table-scroll"><table><thead><tr><th>Patient</th><th>Admission ID</th><th>Ward / service</th><th>Bed</th><th>Admitted</th><th>Status</th><th>Discharged</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>{admissions.map((admission) => <tr key={admission.id}><td><button className="table-link" onClick={() => onOpenPatient(demoPatients.find((item) => item.id === admission.patientId) ?? demoPatients[0])}>{admission.patient}</button></td><td className="id-cell">{admission.id}</td><td>{admission.ward}</td><td>{admission.bed}</td><td>{admission.admitted}</td><td><StatusPill status={admission.status} /></td><td>{admission.discharged ?? "—"}</td><td>{admission.status === "Admitted" && (role === "Hospital staff" || role === "Administrator") ? <button className="button button-outline button-small" onClick={() => onDischarge(admission.id)}>Discharge</button> : <button className="icon-button row-action" aria-label={`View admission for ${admission.patient}`} onClick={() => alert(admission.notes || "Active stay in the fictional demonstration workspace.")}><ArrowUpRight aria-hidden="true" /></button>}</td></tr>)}</tbody></table></div>{admissions.length === 0 && <EmptyState title="No hospital stays" text="No admission records are available in this view." />}<div className="table-footer"><span>{admissions.length} stays · Demonstration data</span><div><button className="icon-button" aria-label="Previous page" disabled><ChevronLeft aria-hidden="true" /></button><span className="page-number">1</span><button className="icon-button" aria-label="Next page" disabled><ChevronRight aria-hidden="true" /></button></div></div></section><div className="notice-callout"><AlertCircle aria-hidden="true" /><p>Before discharge, confirm the treating team has completed the discharge summary and patient instructions.</p></div></div>
}

function StaffPage() { return <div className="page-stack"><PageHeading eyebrow="WORKFORCE DIRECTORY" title="Staff access" description="Review role assignments and access status for this fictional hospital workspace." action={<button className="button button-outline" onClick={() => alert("New staff access is managed by an authorized hospital administrator.")}><Plus aria-hidden="true" /> Invite staff</button>} /><div className="notice-callout"><LockKeyhole aria-hidden="true" /><p>Access changes are restricted to hospital administrators. Sample staff identities are fictional.</p></div><section className="surface-card table-card full-table"><div className="table-scroll"><table><thead><tr><th>Staff member</th><th>Role</th><th>Department</th><th>Last activity</th><th>Access status</th><th><span className="sr-only">Options</span></th></tr></thead><tbody>{[{ name: "Meera Das", role: "Hospital staff", department: "Patient services", active: "Today, 10:42 AM" }, { name: "Dr. Arindam Bose", role: "Doctor", department: "Cardiology", active: "Today, 11:16 AM" }, { name: "Ananya Mukherjee", role: "Administrator", department: "Hospital operations", active: "Today, 09:20 AM" }, { name: "Dr. Priya Nair", role: "Doctor", department: "Internal Medicine", active: "Yesterday, 04:38 PM" }].map((staff) => <tr key={staff.name}><td><span className="table-person"><span className="patient-avatar">{initials(staff.name)}</span><span><strong>{staff.name}</strong><small>Fictional staff account</small></span></span></td><td>{staff.role}</td><td>{staff.department}</td><td>{staff.active}</td><td><StatusPill status="Active" /></td><td><button className="icon-button row-action" aria-label={`Manage ${staff.name}`} onClick={() => alert("Staff access settings are restricted to authorized administrators.")}><MoreHorizontal aria-hidden="true" /></button></td></tr>)}</tbody></table></div></section></div> }

function SettingsPage({ role, userName, onSignOut }: { role: Role; userName: string; onSignOut: () => void }) { return <div className="page-stack"><PageHeading eyebrow="ACCOUNT & ACCESS" title="Settings" description="Your account details and workspace access." /><div className="settings-grid"><section className="surface-card settings-card"><div className="settings-card-heading"><span className="settings-icon"><UserRound aria-hidden="true" /></span><div><h2>Profile</h2><p>Account identity for this demonstration</p></div></div><Detail label="Name" value={userName} /><Detail label="Workspace role" value={role} /><Detail label="Hospital" value="Shantideep Medical Centre · Kolkata" /><button className="button button-outline" onClick={() => alert("Contact hospital support to update account details.")}>Request profile update</button></section><section className="surface-card settings-card"><div className="settings-card-heading"><span className="settings-icon"><ShieldCheck aria-hidden="true" /></span><div><h2>Privacy & access</h2><p>Understand the demonstration permissions</p></div></div><div className="settings-privacy-row"><LockKeyhole aria-hidden="true" /><span><strong>Role-aware workspace</strong><small>Views are tailored to your selected role.</small></span></div><div className="settings-privacy-row"><FileHeart aria-hidden="true" /><span><strong>Fictional information</strong><small>No sample information represents a real patient.</small></span></div><div className="settings-privacy-row"><Activity aria-hidden="true" /><span><strong>Session-only changes</strong><small>Edits reset when you sign out of this demonstration.</small></span></div></section><section className="surface-card settings-card signout-card"><div><h2>End your session</h2><p>Return to the public CardioTrack welcome page.</p></div><button className="button button-outline" onClick={onSignOut}><LogOut aria-hidden="true" /> Sign out</button></section></div></div> }

function RecordList({ records }: { records: MedicalRecord[] }) { return <div className="surface-card table-card full-table"><div className="table-scroll"><table><thead><tr><th>Record</th><th>Diagnosis</th><th>Doctor</th><th>Clinical date</th><th>Patient</th><th><span className="sr-only">Details</span></th></tr></thead><tbody>{records.map((record) => <tr key={record.id}><td><span className="table-test"><span className="test-icon"><ClipboardList aria-hidden="true" /></span><span><strong>{record.title}</strong><small>{record.id}</small></span></span></td><td>{record.diagnosis}</td><td>{record.doctor}</td><td>{record.date}</td><td>{record.patient}</td><td><button className="icon-button row-action" aria-label={`View ${record.title}`} onClick={() => alert(record.notes)}><ArrowUpRight aria-hidden="true" /></button></td></tr>)}</tbody></table></div>{records.length === 0 && <EmptyState title="No medical records" text="Your care team has not shared any records in this category." />}</div> }
function DiagnosticList({ tests }: { tests: DiagnosticTest[] }) { return <div className="surface-card table-card full-table"><div className="table-scroll"><table><thead><tr><th>Test</th><th>Date</th><th>Requesting clinician</th><th>Status</th><th>Department</th></tr></thead><tbody>{tests.map((test) => <tr key={test.id}><td>{test.test}</td><td>{test.date}</td><td>{test.doctor}</td><td><StatusPill status={test.status} /></td><td>{test.department}</td></tr>)}</tbody></table></div>{tests.length === 0 && <EmptyState title="No diagnostic tests" text="Scheduled tests will be listed here." />}</div> }
function ReportList({ reports, onPreview }: { reports: MedicalReport[]; onPreview: (report: MedicalReport) => void }) { return <div className="report-list">{reports.map((report) => <button className="surface-card report-list-card" key={report.id} onClick={() => onPreview(report)}><span className="document-icon"><FileHeart aria-hidden="true" /></span><span><strong>{report.name}</strong><small>{report.type} · {report.date}</small></span><ArrowUpRight aria-hidden="true" /></button>)}{reports.length === 0 && <EmptyState title="No reports shared" text="Documents shared with you will appear here." />}</div> }
function AdmissionList({ admissions }: { admissions: Admission[] }) { return <div className="surface-card table-card full-table"><div className="table-scroll"><table><thead><tr><th>Hospital stay</th><th>Ward / service</th><th>Admission date</th><th>Discharge date</th><th>Status</th></tr></thead><tbody>{admissions.map((admission) => <tr key={admission.id}><td>{admission.id}</td><td>{admission.ward} · {admission.bed}</td><td>{admission.admitted}</td><td>{admission.discharged ?? "—"}</td><td><StatusPill status={admission.status} /></td></tr>)}</tbody></table></div>{admissions.length === 0 && <EmptyState title="No stays recorded" text="Hospital stays will appear here when shared by your care team." />}</div> }

function StatusPill({ status }: { status: string }) { const tone = /admitted|active|ready|documented/i.test(status) ? "green" : /follow|scheduled/i.test(status) ? "amber" : /progress/i.test(status) ? "blue" : "neutral"; return <span className={`status-pill status-${tone}`}><i />{status}</span> }
function EmptyState({ title, text }: { title: string; text: string }) { return <div className="empty-state"><span><Search aria-hidden="true" /></span><strong>{title}</strong><p>{text}</p></div> }

function ActionDialog({ type, role, patients, patientToEdit, doctor, uploading, uploadProgress, onClose, onSubmit, onDelete }: { type: Exclude<ModalType, null>; role: Role; patients: Patient[]; patientToEdit?: Patient; doctor: string; uploading: boolean; uploadProgress: number; onClose: () => void; onSubmit: (event: FormEvent<HTMLFormElement>) => void; onDelete: () => void }) {
  const titles: Record<Exclude<ModalType, null>, string> = { patient: "Register a patient", "edit-patient": "Edit patient details", record: "New clinical note", test: "Schedule diagnostic test", admission: "Open hospital stay", report: "Upload a medical document", discharge: "Confirm discharge", assign: "Assign patient to doctor", delete: "Remove document" }
  const descriptions: Record<Exclude<ModalType, null>, string> = { patient: "Add fictional patient details to this demonstration directory.", "edit-patient": "Update this fictional patient profile for the current browser session.", record: "Document a structured care entry for an existing patient.", test: "Coordinate a test appointment for a patient.", admission: "Create an admission and ward assignment.", report: "Add a PDF, JPG, or PNG document to this browser session.", discharge: "Record the discharge note after confirming the care transition.", assign: `Select a patient for ${doctor}.`, delete: "This action removes the selected document from this browser session." }
  const choices = patients.map((patient) => <option key={patient.id} value={patient.id}>{patient.name} · {patient.id}</option>)
  const Field = ({ label, name, required = false, children, type: inputType = "text", placeholder, defaultValue }: { label: string; name: string; required?: boolean; children?: ReactNode; type?: string; placeholder?: string; defaultValue?: string }) => <label className="form-field"><span>{label}{required && <i> *</i>}</span>{children ?? <input name={name} type={inputType} placeholder={placeholder} required={required} defaultValue={defaultValue} />}</label>
  const SelectField = ({ label, name, options, required = true, defaultValue }: { label: string; name: string; options: string[]; required?: boolean; defaultValue?: string }) => <label className="form-field"><span>{label}{required && <i> *</i>}</span><span className="select-wrap"><select name={name} required={required} defaultValue={defaultValue}>{options.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown aria-hidden="true" /></span></label>
  return <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !uploading) onClose() }} onKeyDown={(event) => { if (event.key === "Escape" && !uploading) onClose() }}><section className="action-dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><div className="dialog-heading"><div><span className="eyebrow">{type === "delete" || type === "discharge" ? "CONFIRMATION REQUIRED" : "DEMONSTRATION WORKSPACE"}</span><h2 id="dialog-title">{titles[type]}</h2><p>{descriptions[type]}</p></div><button className="icon-button" aria-label="Close dialog" onClick={onClose} disabled={uploading}><X aria-hidden="true" /></button></div>
    {type === "delete" ? <div className="dialog-body"><div className="sensitive-action-note"><AlertCircle aria-hidden="true" /><span>Document deletion is restricted to authorized users. This demonstration action cannot be undone in the current session.</span></div><div className="dialog-actions"><button className="button button-outline" onClick={onClose}>Cancel</button><button className="button button-danger" onClick={onDelete}>Remove document</button></div></div> : <form className="dialog-form" onSubmit={onSubmit}>
      {(type === "patient" || type === "edit-patient") && <><div className="form-grid"><Field label="Full name" name="name" required placeholder="Patient full name" defaultValue={patientToEdit?.name} /><Field label="Age" name="age" required type="number" placeholder="Age in years" defaultValue={patientToEdit ? String(patientToEdit.age) : undefined} /><SelectField label="Gender" name="gender" options={["Female", "Male", "Non-binary", "Prefer not to say"]} defaultValue={patientToEdit?.gender} /><SelectField label="Blood group" name="bloodGroup" options={["Unknown", "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]} defaultValue={patientToEdit?.bloodGroup} /><Field label="Phone number" name="phone" required type="tel" placeholder="+91 98XXX XXXXX" defaultValue={patientToEdit?.phone} /><Field label="Email address" name="email" type="email" placeholder="name@example.in" defaultValue={patientToEdit?.email} /><SelectField label="Department" name="department" options={["Cardiology", "Internal Medicine", "Neurology", "Orthopedics"]} defaultValue={patientToEdit?.department} /><SelectField label="Assigned doctor" name="doctor" options={demoDoctors.map((item) => item.name)} defaultValue={patientToEdit?.doctor} /><Field label="Emergency contact" name="emergency" placeholder="Name · phone number" defaultValue={patientToEdit?.emergency} /><Field label="Address" name="address" placeholder="Area, Kolkata" defaultValue={patientToEdit?.address} /></div><div className="form-assurance"><LockKeyhole aria-hidden="true" /> Registration and profile updates are restricted to authorized hospital staff.</div></>}
      {type === "record" && <><Field label="Patient" name="patientId" required><span className="select-wrap"><select name="patientId" required>{choices}</select><ChevronDown aria-hidden="true" /></span></Field><div className="form-grid"><Field label="Record title" name="title" required placeholder="e.g. Follow-up consultation" /><Field label="Diagnosis / reason" name="diagnosis" required placeholder="Documented by treating clinician" /><SelectField label="Attending doctor" name="doctor" options={demoDoctors.map((item) => item.name)} /><label className="form-field form-field-wide"><span>Treatment notes</span><textarea name="notes" rows={4} required placeholder="Write structured clinical observations and plan…" /></label></div><div className="notice-callout compact-notice"><AlertCircle aria-hidden="true" /><p>Do not enter real patient information into this fictional demonstration.</p></div></>}
      {type === "test" && <><Field label="Patient" name="patientId" required><span className="select-wrap"><select name="patientId" required>{choices}</select><ChevronDown aria-hidden="true" /></span></Field><div className="form-grid"><SelectField label="Diagnostic test" name="test" options={["ECG", "Echocardiogram", "Lipid Profile", "Complete Blood Count", "Chest X-ray"]} /><SelectField label="Department" name="department" options={["Cardiology", "Pathology", "Radiology", "Internal Medicine"]} /><SelectField label="Requesting doctor" name="doctor" options={demoDoctors.map((item) => item.name)} /><Field label="Scheduled date" name="date" type="date" required /><label className="form-field form-field-wide"><span>Clinical notes</span><textarea name="note" rows={3} placeholder="Purpose or scheduling notes" /></label></div><p className="field-help">Workflow status only. Do not enter or infer medical conclusions.</p></>}
      {type === "admission" && <><Field label="Patient" name="patientId" required><span className="select-wrap"><select name="patientId" required>{choices}</select><ChevronDown aria-hidden="true" /></span></Field><div className="form-grid"><SelectField label="Ward / service" name="ward" options={["Cardiac care · 3rd floor", "General medicine · 2nd floor", "Neurology · 3rd floor", "Orthopedics · 4th floor"]} /><Field label="Bed" name="bed" required placeholder="e.g. CC-14" /></div><div className="sensitive-action-note"><AlertCircle aria-hidden="true" /><span>The form will prevent a second active admission for the same patient.</span></div></>}
      {type === "discharge" && <><div className="sensitive-action-note"><ShieldCheck aria-hidden="true" /><span>Confirm that the treating team has reviewed the transition and discharge instructions before recording this status.</span></div><label className="form-field"><span>Discharge notes <i>*</i></span><textarea name="notes" rows={4} required placeholder="Document discharge coordination notes" /></label><label className="confirm-check"><input type="checkbox" required /><span>I confirm this discharge is ready to be recorded in the demonstration workspace.</span></label></>}
      {type === "assign" && <><div className="form-assurance"><Stethoscope aria-hidden="true" /> {doctor}</div><Field label="Patient" name="patientId" required><span className="select-wrap"><select name="patientId" required>{choices}</select><ChevronDown aria-hidden="true" /></span></Field><p className="field-help">This assignment is illustrative and is not sent to a live care team.</p></>}
      {type === "report" && <><Field label="Patient" name="patientId" required><span className="select-wrap"><select name="patientId" required>{choices}</select><ChevronDown aria-hidden="true" /></span></Field><div className="form-grid"><SelectField label="Document type" name="type" options={["Clinical summary", "Diagnostic report", "Referral", "Discharge summary", "Other"]} /><Field label="Description" name="description" placeholder="Optional brief description" /></div><label className="upload-dropzone"><input name="file" type="file" accept="application/pdf,image/jpeg,image/png,.pdf,.jpg,.jpeg,.png" required disabled={uploading} /><span className="upload-icon"><Download aria-hidden="true" /></span><strong>Choose a file or drop it here</strong><small>PDF, JPG, or PNG · up to 10 MB</small></label><div className="form-assurance"><LockKeyhole aria-hidden="true" /> Files remain in this browser session and are not sent to hospital records.</div>{uploading && <div className="upload-progress"><div><span>Adding document to this session</span><strong>{uploadProgress}%</strong></div><span className="progress-track"><i style={{ width: `${uploadProgress}%` }} /></span></div>}</>}
      <div className="dialog-actions"><button type="button" className="button button-outline" onClick={onClose} disabled={uploading}>Cancel</button><button className="button button-primary" type="submit" disabled={uploading}>{uploading ? "Adding document…" : type === "edit-patient" ? "Save patient details" : type === "patient" ? "Register patient" : type === "record" ? "Save clinical note" : type === "test" ? "Schedule test" : type === "admission" ? "Open admission" : type === "discharge" ? "Confirm discharge" : type === "assign" ? "Confirm assignment" : "Add document"}<ArrowRight aria-hidden="true" /></button></div>
    </form>}</section></div>
}

function ReportDialog({ report, onClose }: { report: MedicalReport; onClose: () => void }) { const url = useMemo(() => report.file ? URL.createObjectURL(report.file) : "", [report.file]); useEffect(() => () => { if (url) URL.revokeObjectURL(url) }, [url]); return <div className="dialog-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose() }}><section className="action-dialog report-dialog" role="dialog" aria-modal="true" aria-labelledby="report-dialog-title"><div className="dialog-heading"><div><span className="eyebrow">{report.id || "PATIENT SUMMARY"} · {report.date}</span><h2 id="report-dialog-title">{report.name}</h2><p>{report.type} · {report.size}</p></div><button className="icon-button" aria-label="Close preview" onClick={onClose}><X aria-hidden="true" /></button></div><div className="report-preview-content">{report.file?.type.startsWith("image/") ? <img src={url} alt={`Preview of ${report.name}`} /> : report.file?.type === "application/pdf" ? <iframe title={`Document preview: ${report.name}`} src={url} /> : <div className="sample-document"><span className="document-icon"><FileHeart aria-hidden="true" /></span><strong>Demonstration document</strong><p>This sample file is a fictional placeholder for document metadata. No clinical conclusions are included.</p><span>Patient: {report.patient}</span><span>Type: {report.type}</span></div>}</div><div className="dialog-actions">{url && <a className="button button-outline" href={url} download={report.name}><Download aria-hidden="true" /> Download</a>}<button className="button button-primary" onClick={onClose}>Done</button></div></section></div> }

function initials(name: string) { return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part.replace(".", "")[0]).join("").toUpperCase() }
