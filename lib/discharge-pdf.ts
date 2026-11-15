import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export interface DischargeSummaryData {
  patient: {
    id: string | number
    name: string
    age: number | string
    gender: string
    email?: string
  }
  admission: {
    id: string
    ward?: string
    bed?: string
    admitted: string
    discharged?: string
    notes?: string
    reason?: string
  }
  records?: Array<{
    diagnosis: string
    notes?: string
    doctor?: string
    date?: string
  }>
  tests?: Array<{
    testName: string
    testType?: string
    date?: string
    results?: string
    interpretation?: string
  }>
  careLogs?: Array<{
    category: string
    title: string
    description?: string
    logDate: string
    logTime?: string
    recordedBy?: string
  }>
  reports?: Array<{
    name: string
    type?: string
    date?: string
    size?: string
  }>
  attendingDoctor?: string
}

export async function generateDischargeSummaryPdf(data: DischargeSummaryData): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 14
  const contentWidth = pageWidth - margin * 2

  // 1. Hospital Header Banner
  doc.setFillColor(13, 118, 109) // CardioTrack Teal (#0d766d)
  doc.rect(0, 0, pageWidth, 28, "F")

  // Hospital Name & Sub-header
  doc.setTextColor(255, 255, 255)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(16)
  doc.text("CARDIOTRACK CONNECTED HOSPITAL", margin, 11)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(8.5)
  doc.setTextColor(204, 251, 241) // light teal
  doc.text(
    "Tertiary Cardiovascular Care & Research Institute | 24x7 Emergency Hotline: 1800-266-HEART",
    margin,
    17
  )
  doc.text("NABH & JCI Accredited | Digital EHR & Telemetry Network", margin, 22)

  // Document Title Pill on right side
  doc.setFont("helvetica", "bold")
  doc.setFontSize(9)
  doc.setTextColor(255, 255, 255)
  doc.text("DISCHARGE SUMMARY", pageWidth - margin - 38, 16)

  let cursorY = 36

  // Title Box
  doc.setFont("helvetica", "bold")
  doc.setFontSize(13)
  doc.setTextColor(23, 50, 72)
  doc.text("INPATIENT CLINICAL DISCHARGE SUMMARY", margin, cursorY)

  doc.setFont("helvetica", "normal")
  doc.setFontSize(8.5)
  doc.setTextColor(100, 116, 139)
  const generatedDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
  doc.text(`Generated: ${generatedDate} | Document ID: DS-${data.admission.id.replace(/\D/g, "") || "001"}`, pageWidth - margin, cursorY, { align: "right" })

  cursorY += 6

  // 2. Patient & Stay Demographics Table
  autoTable(doc, {
    startY: cursorY,
    head: [["PATIENT INFORMATION", "ADMISSION & DISCHARGE DETAILS"]],
    body: [
      [
        `Patient Name: ${data.patient.name}\nPatient ID: ${data.patient.id}\nAge / Gender: ${data.patient.age} Yrs / ${data.patient.gender}\nContact Email: ${data.patient.email || "Registered Patient"}`,
        `Admission ID: ${data.admission.id}\nWard & Bed: ${data.admission.ward || "Cardiology Ward"} (Bed ${data.admission.bed || "General"})\nAdmission Date: ${data.admission.admitted}\nDischarge Date: ${data.admission.discharged || "Completed"}`,
      ],
    ],
    theme: "striped",
    headStyles: {
      fillColor: [15, 39, 59], // Dark Navy
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: "bold",
      cellPadding: 3,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 41, 59],
      cellPadding: 4,
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
    margin: { left: margin, right: margin },
  })

  cursorY = (doc as any).lastAutoTable.finalY + 7

  // 3. Discharge Notes & Clinical Impression (from Admission record)
  if (data.admission.notes || data.admission.reason) {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(10.5)
    doc.setTextColor(13, 118, 109)
    doc.text("1. ADMISSION REASON & DISCHARGE INSTRUCTIONS", margin, cursorY)
    cursorY += 4

    const notesBody = [
      [
        "Reason for Admission",
        data.admission.reason || "Acute cardiovascular observation & stabilization",
      ],
      [
        "Discharge Instructions & Medical Plan",
        data.admission.notes || "Patient vitals stable. Advised regular cardiac telemetry follow-up, low-sodium heart-healthy diet, and timely medication compliance.",
      ],
    ]

    autoTable(doc, {
      startY: cursorY,
      body: notesBody,
      theme: "plain",
      bodyStyles: {
        fontSize: 8.5,
        textColor: [30, 41, 59],
        cellPadding: 3,
        lineColor: [226, 232, 240],
        lineWidth: 0.1,
      },
      columnStyles: {
        0: { fontStyle: "bold", cellWidth: 50, textColor: [15, 39, 59] },
        1: { cellWidth: contentWidth - 50 },
      },
      margin: { left: margin, right: margin },
    })

    cursorY = (doc as any).lastAutoTable.finalY + 7
  }

  // 4. Clinical Medical Records & Diagnoses during stay
  if (data.records && data.records.length > 0) {
    if (cursorY > pageHeight - 45) {
      doc.addPage()
      cursorY = 20
    }

    doc.setFont("helvetica", "bold")
    doc.setFontSize(10.5)
    doc.setTextColor(13, 118, 109)
    doc.text("2. CLINICAL RECORDS & DIAGNOSES", margin, cursorY)
    cursorY += 4

    const recordsRows = data.records.map((r, i) => [
      `#${i + 1}`,
      r.date || "During stay",
      r.diagnosis,
      r.doctor || "Attending Cardiologist",
      r.notes || "—",
    ])

    autoTable(doc, {
      startY: cursorY,
      head: [["#", "Date", "Diagnosis", "Physician", "Clinical Findings & Notes"]],
      body: recordsRows,
      theme: "grid",
      headStyles: {
        fillColor: [13, 118, 109],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: "bold",
        cellPadding: 2.5,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [30, 41, 59],
        cellPadding: 2.5,
        lineColor: [226, 232, 240],
        lineWidth: 0.2,
      },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: 24 },
        2: { cellWidth: 44, fontStyle: "bold" },
        3: { cellWidth: 36 },
        4: { cellWidth: contentWidth - 114 },
      },
      margin: { left: margin, right: margin },
    })

    cursorY = (doc as any).lastAutoTable.finalY + 7
  }

  // 5. Diagnostic Tests & Investigations
  if (data.tests && data.tests.length > 0) {
    if (cursorY > pageHeight - 45) {
      doc.addPage()
      cursorY = 20
    }

    doc.setFont("helvetica", "bold")
    doc.setFontSize(10.5)
    doc.setTextColor(13, 118, 109)
    doc.text("3. DIAGNOSTIC TESTS & LAB INVESTIGATIONS", margin, cursorY)
    cursorY += 4

    const testsRows = data.tests.map((t, i) => [
      `#${i + 1}`,
      t.testName,
      t.testType || "Cardiology",
      t.date || "During stay",
      t.results || "Completed & Verified",
      t.interpretation || "Normal / Evaluated by Specialist",
    ])

    autoTable(doc, {
      startY: cursorY,
      head: [["#", "Test Name", "Category", "Date", "Result Values", "Interpretation"]],
      body: testsRows,
      theme: "grid",
      headStyles: {
        fillColor: [15, 39, 59],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: "bold",
        cellPadding: 2.5,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [30, 41, 59],
        cellPadding: 2.5,
        lineColor: [226, 232, 240],
        lineWidth: 0.2,
      },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: 40, fontStyle: "bold" },
        2: { cellWidth: 26 },
        3: { cellWidth: 22 },
        4: { cellWidth: 40 },
        5: { cellWidth: contentWidth - 138 },
      },
      margin: { left: margin, right: margin },
    })

    cursorY = (doc as any).lastAutoTable.finalY + 7
  }

  // 6. Inpatient Daily Care Logs & Medication Schedule (Summary)
  if (data.careLogs && data.careLogs.length > 0) {
    if (cursorY > pageHeight - 45) {
      doc.addPage()
      cursorY = 20
    }

    doc.setFont("helvetica", "bold")
    doc.setFontSize(10.5)
    doc.setTextColor(13, 118, 109)
    doc.text("4. INPATIENT CARE LOG & CLINICAL TIMELINE", margin, cursorY)
    cursorY += 4

    const careRows = data.careLogs.slice(0, 12).map((c) => [
      `${c.logDate} ${c.logTime ? c.logTime.slice(0, 5) : ""}`.trim(),
      c.category.replace(/_/g, " "),
      c.title,
      c.recordedBy || "Hospital Staff",
      c.description || "Administered as prescribed",
    ])

    autoTable(doc, {
      startY: cursorY,
      head: [["Date & Time", "Care Category", "Event / Medication", "Administered By", "Clinical Remarks"]],
      body: careRows,
      theme: "grid",
      headStyles: {
        fillColor: [13, 118, 109],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: "bold",
        cellPadding: 2.5,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [30, 41, 59],
        cellPadding: 2.5,
        lineColor: [226, 232, 240],
        lineWidth: 0.2,
      },
      columnStyles: {
        0: { cellWidth: 28 },
        1: { cellWidth: 28 },
        2: { cellWidth: 44, fontStyle: "bold" },
        3: { cellWidth: 30 },
        4: { cellWidth: contentWidth - 130 },
      },
      margin: { left: margin, right: margin },
    })

    cursorY = (doc as any).lastAutoTable.finalY + 7
  }

  // 7. Medical Reports & Uploaded Diagnostic Attachments on File
  if (data.reports && data.reports.length > 0) {
    if (cursorY > pageHeight - 45) {
      doc.addPage()
      cursorY = 20
    }

    doc.setFont("helvetica", "bold")
    doc.setFontSize(10.5)
    doc.setTextColor(13, 118, 109)
    doc.text("5. ARCHIVED MEDICAL REPORTS & DOCUMENTS", margin, cursorY)
    cursorY += 4

    const reportRows = data.reports.map((rp, i) => [
      `#${i + 1}`,
      rp.name,
      rp.type || "Medical Document",
      rp.date || "On record",
      rp.size || "Cloud Stored",
      "Available via CardioTrack Portal",
    ])

    autoTable(doc, {
      startY: cursorY,
      head: [["#", "Document Name", "Classification", "Upload Date", "Size", "Digital Storage"]],
      body: reportRows,
      theme: "grid",
      headStyles: {
        fillColor: [15, 39, 59],
        textColor: [255, 255, 255],
        fontSize: 8,
        fontStyle: "bold",
        cellPadding: 2.5,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [30, 41, 59],
        cellPadding: 2.5,
        lineColor: [226, 232, 240],
        lineWidth: 0.2,
      },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: 50, fontStyle: "bold" },
        2: { cellWidth: 32 },
        3: { cellWidth: 24 },
        4: { cellWidth: 22 },
        5: { cellWidth: contentWidth - 138 },
      },
      margin: { left: margin, right: margin },
    })

    cursorY = (doc as any).lastAutoTable.finalY + 7
  }

  // 8. Sign-off & Verification Section
  if (cursorY > pageHeight - 45) {
    doc.addPage()
    cursorY = 25
  }

  cursorY += 4
  doc.setDrawColor(203, 213, 225)
  doc.setLineWidth(0.5)
  doc.line(margin, cursorY, pageWidth - margin, cursorY)
  cursorY += 6

  // Signatures / Stamps
  doc.setFont("helvetica", "bold")
  doc.setFontSize(8.5)
  doc.setTextColor(15, 39, 59)
  doc.text("TREATING CONSULTANT / CARDIOLOGIST", margin, cursorY)
  doc.text("HEAD OF CLINICAL SERVICES", pageWidth / 2, cursorY)
  doc.text("HOSPITAL MEDICAL RECORDS DEPT", pageWidth - margin, cursorY, { align: "right" })

  cursorY += 4
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.setTextColor(100, 116, 139)
  doc.text(data.attendingDoctor || "CardioTrack Clinical Faculty", margin, cursorY)
  doc.text("CardioTrack Inpatient Care", pageWidth / 2, cursorY)
  doc.text("Digitally Verified EHR", pageWidth - margin, cursorY, { align: "right" })

  cursorY += 8

  // Bottom Legal Disclaimer Box
  doc.setFillColor(248, 250, 252)
  doc.roundedRect(margin, cursorY, contentWidth, 14, 2, 2, "F")
  doc.setFont("helvetica", "italic")
  doc.setFontSize(7.5)
  doc.setTextColor(100, 116, 139)
  doc.text(
    "Notice: This is a verified digital discharge summary produced by CardioTrack Hospital Health Cloud. In case of cardiac emergency or acute symptoms, immediately visit the nearest emergency facility or call 1800-266-HEART.",
    margin + 3,
    cursorY + 5,
    { maxWidth: contentWidth - 6 }
  )
  doc.text(
    "Synchronized with PostgreSQL Inpatient Microservices & Cloud Telemetry Registry.",
    margin + 3,
    cursorY + 10
  )

  // Add Page Numbers on all pages
  const totalPages = (doc as any).internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(7.5)
    doc.setTextColor(148, 163, 184)
    doc.text(
      `Page ${i} of ${totalPages} · Confidential Inpatient Medical Summary · ${data.patient.name} (${data.patient.id})`,
      pageWidth / 2,
      pageHeight - 6,
      { align: "center" }
    )
  }

  // Trigger browser download
  const safeName = data.patient.name.replace(/[^a-zA-Z0-9]/g, "_")
  const fileName = `Discharge_Summary_${safeName}_${data.admission.id}.pdf`
  doc.save(fileName)
}
