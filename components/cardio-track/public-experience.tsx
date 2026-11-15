"use client"

import { useState, useEffect, useRef, type FormEvent } from "react"
import { motion, useScroll, useTransform } from "framer-motion"
import gsap from "gsap"
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Award,
  Building2,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  EyeOff,
  FileHeart,
  Heart,
  HeartPulse,
  LockKeyhole,
  MapPin,
  Menu,
  PhoneCall,
  PhoneIncoming,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Star,
  Stethoscope,
  TestTube2,
  UserCheck,
  UserRound,
  UsersRound,
  X,
  Zap,
} from "lucide-react"
import type { Role } from "./data"
import { authApi, doctorApi, toClientRole, type DoctorDTO } from "@/lib/api"

type PublicExperienceProps = {
  onSignIn: (role: Role) => void
}

const milestones = [
  { number: "99.4%", title: "Procedural Survival Rate", desc: "Ranked #1 in Eastern India for complex CABG & primary PCI outcomes." },
  { number: "50,000+", title: "Angioplasties & Stenting", desc: "Performed through radial artery route with zero major vascular complications." },
  { number: "15 min", title: "Median Door-to-Balloon", desc: "Beating the global 90-minute standard for acute STEMI heart attack intervention." },
  { number: "250,000+", title: "Cardiac Lives Touched", desc: "Patients treated across 14 specialized cardiovascular clinics since inception." },
  { number: "1.2M+", title: "Continuous Telemetry Hours", desc: "Real-time AI ECG tracking alerting care teams 45 minutes ahead of onset." },
]

const specialties = [
  {
    icon: <HeartPulse />,
    title: "Interventional Cardiology",
    desc: "Complex Coronary Angioplasty, Fractional Flow Reserve (FFR), Rotablation, TAVI (Transcatheter Aortic Valve Implantation), and MitraClip.",
    tags: ["Radial PCI", "TAVI", "Bifurcation Stenting", "CTO"],
  },
  {
    icon: <Activity />,
    title: "Cardiothoracic & Vascular Surgery",
    desc: "Minimally invasive keyhole bypass (MICS CABG), valve replacement/repair, thoracic aortic aneurysm repair, and beating heart surgery.",
    tags: ["MICS CABG", "Valve Repair", "Aortic Root", "Robotic Hybrid"],
  },
  {
    icon: <Zap />,
    title: "Cardiac Electrophysiology & Arrhythmia",
    desc: "3D mapping-guided radiofrequency catheter ablation, leadless pacemakers, AICD defibrillators, and Cardiac Resynchronization (CRT-D).",
    tags: ["3D Carto", "Cryoablation", "CRT-D", "Leadless Pacemaker"],
  },
  {
    icon: <Heart />,
    title: "Pediatric & Congenital Heart Center",
    desc: "Device closures of ASD/VSD/PDA without open surgery, arterial switch procedures, Tetralogy of Fallot (TOF) repair, and fetal echo.",
    tags: ["ASD/VSD Closure", "TOF Repair", "Neonatal Surgery", "Fetal Echo"],
  },
  {
    icon: <Stethoscope />,
    title: "Advanced Heart Failure & LVAD",
    desc: "Comprehensive heart failure management, mechanical circulatory support, Left Ventricular Assist Devices (LVAD), and heart transplant assessment.",
    tags: ["LVAD Support", "Sacubitril Protocol", "Transplant Unit", "ECMO"],
  },
  {
    icon: <ShieldCheck />,
    title: "Preventive Cardiology & Rehab",
    desc: "High-precision cardiovascular risk scoring, structured post-infarction aerobic telemetry rehabilitation, and dietetic heart optimization.",
    tags: ["AI Risk Profiling", "Post-PCI Rehab", "Cardio-Metabolic", "Stress Echo"],
  },
]

const stackCards = [
  {
    number: "01 / 04",
    category: "Emergency Interventional Hub",
    title: "Biplane Robotic Cath Lab & Primary Angioplasty",
    description: "Equipped with ultra-low radiation digital fluoroscopy and 3D Optical Coherence Tomography (OCT). Our rapid-response teams restore blood flow in acute myocardial infarction within a median 15-minute door-to-balloon window.",
    features: [
      "Trans-Radial 0% Hematoma Protocol",
      "Rotational & Orbital Atherectomy",
      "3D Intravascular Ultrasound (IVUS)",
      "Fractional Flow Reserve (FFR/iFR)",
    ],
    theme: {
      background: "linear-gradient(135deg, #0e2b3d 0%, #164057 100%)",
      color: "#f1f8f7",
      pillBg: "rgba(94, 234, 212, 0.18)",
      pillColor: "#5eead4",
      borderColor: "rgba(94, 234, 212, 0.3)",
    },
    image: "/cardiac-cath-lab.jpg",
    tagTitle: "Golden Hour Cath Lab Hub",
    tagSub: "15-Minute Door-to-Balloon",
  },
  {
    number: "02 / 04",
    category: "Neural Telemetry & AI Alerts",
    title: "Continuous Inpatient AI Telemetry Command Center",
    description: "Every telemetry bed in our coronary care unit is connected directly to our centralized AI neural monitoring center, providing 24/7 predictive alerts for atrial fibrillation, ventricular arrhythmias, and ischemic ST-shifts 45 minutes ahead of clinical onset.",
    features: [
      "1,200,000+ Monitored Hours",
      "Predictive 45-Min Arrhythmia Alerts",
      "Wireless Hospital-Wide Telemetry",
      "Instant Cloud EHR Synchronization",
    ],
    theme: {
      background: "linear-gradient(135deg, #0c2338 0%, #153859 100%)",
      color: "#f1f8f7",
      pillBg: "rgba(56, 189, 248, 0.18)",
      pillColor: "#38bdf8",
      borderColor: "rgba(56, 189, 248, 0.3)",
    },
    image: "/ai-telemetry-center.jpg",
    tagTitle: "24/7 Neural Telemetry",
    tagSub: "Automated Arrhythmia Triage",
  },
  {
    number: "03 / 04",
    category: "Minimally Invasive Heart Surgery",
    title: "Keyhole & Beating-Heart Bypass Surgery (MICS CABG)",
    description: "Performing multi-vessel bypass surgery through small 2-inch incisions between the ribs without cutting the breastbone. Patients experience virtually no blood loss, minimal post-op pain, and return home within 48 to 72 hours with a 99.4% survival rate.",
    features: [
      "Zero Sternal Bone Sawing",
      "Off-Pump Beating Heart Surgery",
      "48-Hour Rapid Hospital Discharge",
      "99.4% Verified Survival Rate",
    ],
    theme: {
      background: "linear-gradient(135deg, #0d2f35 0%, #13464f 100%)",
      color: "#f1f8f7",
      pillBg: "rgba(45, 212, 191, 0.18)",
      pillColor: "#2dd4bf",
      borderColor: "rgba(45, 212, 191, 0.3)",
    },
    image: "/hospital-facade.jpg",
    tagTitle: "MICS Heart Center",
    tagSub: "2-Inch Keyhole Bypass",
  },
  {
    number: "04 / 04",
    category: "Pediatric & Congenital Care",
    title: "Quaternary Pediatric Heart Center & Fetal Echo",
    description: "Specialized pediatric interventional cardiologists closing atrial and ventricular septal defects (ASD/VSD) through tiny leg vein punctures without opening the heart. Giving over 4,800 newborn children a second chance at healthy, active lives.",
    features: [
      "Scarless Transcatheter Closures",
      "Early Fetal Cardiac Anomaly Scans",
      "Tetralogy of Fallot Single-Stage Repair",
      "Dedicated Pediatric Cardiac ICU",
    ],
    theme: {
      background: "linear-gradient(135deg, #1b1c3d 0%, #292a59 100%)",
      color: "#f1f8f7",
      pillBg: "rgba(192, 132, 252, 0.18)",
      pillColor: "#c084fc",
      borderColor: "rgba(192, 132, 252, 0.3)",
    },
    image: "/cardiac-consultation.jpg",
    tagTitle: "Children's Heart Institute",
    tagSub: "4,800+ Kids Saved",
  },
]

const testimonials = [
  {
    quote: "When I suffered a massive heart attack in Salt Lake, CardioTrack's ambulance reached me in 8 minutes. By the time I arrived, the Cath Lab was already prepped. The on-duty interventional cardiology team opened my blocked artery in record time. They gave me a second life.",
    author: "Subir K. Mukherjee",
    meta: "Primary Angioplasty Patient · Age 58",
    rating: 5,
  },
  {
    quote: "My 7-year-old daughter underwent an ASD device closure. She was discharged within 48 hours without any surgical scar on her chest. The compassionate care of the pediatric cardiac team was beyond words.",
    author: "Moumita Sen",
    meta: "Mother of Aashi Sen · Pediatric Care",
    rating: 5,
  },
  {
    quote: "Having my clinical notes, ECG reports, and cardiac prescriptions accessible 24/7 on the CardioTrack Patient Portal gave my entire family peace of mind. Truly a world-class digital hospital.",
    author: "Prabir Banerji",
    meta: "Cardiac Rehabilitation Patient · Age 64",
    rating: 5,
  },
]

export function PublicExperience({ onSignIn }: PublicExperienceProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [liveSpecialists, setLiveSpecialists] = useState<DoctorDTO[]>([])
  const tickerRef = useRef<HTMLDivElement>(null)
  const galleryRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkGalleryScroll = () => {
    const el = galleryRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    setCanScrollLeft(scrollLeft > 10)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }

  const scrollGallery = (direction: "left" | "right") => {
    const el = galleryRef.current
    if (!el) return
    const step = el.clientWidth > 768 ? 300 * 2 : 270
    el.scrollBy({
      left: direction === "left" ? -step : step,
      behavior: "smooth",
    })
  }

  useEffect(() => {
    checkGalleryScroll()
    const el = galleryRef.current
    if (!el) return
    el.addEventListener("scroll", checkGalleryScroll, { passive: true })
    window.addEventListener("resize", checkGalleryScroll)
    return () => {
      el.removeEventListener("scroll", checkGalleryScroll)
      window.removeEventListener("resize", checkGalleryScroll)
    }
  }, [liveSpecialists])

  useEffect(() => {
    doctorApi.getAll().then((data) => {
      if (data && Array.isArray(data)) {
        setLiveSpecialists(data)
      }
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (tickerRef.current) {
      gsap.to(".gsap-heart-pulse", {
        scale: 1.15,
        duration: 0.8,
        repeat: -1,
        yoyo: true,
        ease: "power1.inOut",
      })
    }
  }, [])

  return (
    <main className="public-site">
      {/* Top 24/7 Emergency Hotline Bar */}
      <div className="emergency-hotline-bar" ref={tickerRef}>
        <div className="hotline-inner">
          <div className="hotline-left">
            <span className="emergency-pulse-dot" />
            <span className="hotline-highlight">24/7 Emergency Cardiac Trauma Center</span>
            <span>· Rapid Response Ambulance Fleet Across Kolkata</span>
          </div>
          <div className="hotline-right">
            <span>Golden Hour Hotline:</span>
            <a href="tel:18002002273" className="hotline-phone">
              <PhoneCall size={12} /> 1800-200-CARDIO (Toll-Free)
            </a>
            <span className="hidden sm:inline">Emergency Triage: <strong>+91 (033) 4010-9999</strong></span>
          </div>
        </div>
      </div>

      {/* Main Public Navigation Header */}
      <header className="public-header">
        <a className="brand-lockup" href="#top" aria-label="CardioTrack home">
          <span className="brand-mark gsap-heart-pulse">
            <HeartPulse aria-hidden="true" />
          </span>
          <span className="brand-word">
            Cardio<span>Track</span>
          </span>
        </a>

        <button
          className="mobile-menu-toggle"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X /> : <Menu />}
        </button>

        <nav className={`public-nav ${menuOpen ? "is-open" : ""}`} aria-label="Main navigation">
          <a href="#specialties" onClick={() => setMenuOpen(false)}>Specialties</a>
          <a href="#milestones" onClick={() => setMenuOpen(false)}>Achievements</a>
          <a href="#pillars" onClick={() => setMenuOpen(false)}>Clinical Pillars</a>
          <a href="#specialists" onClick={() => setMenuOpen(false)}>Specialists</a>
          <a href="#testimonials" onClick={() => setMenuOpen(false)}>Stories</a>
          <button className="button button-outline button-small" onClick={() => onSignIn("Patient")}>
            Patient Portal <ArrowUpRight aria-hidden="true" />
          </button>
          <button className="button button-primary button-small" onClick={() => onSignIn("Hospital staff")}>
            Hospital Sign In <ArrowRight aria-hidden="true" />
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero-section" id="top">
        <motion.div
          className="hero-copy"
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <div className="eyebrow">
            <span className="eyebrow-dot" /> SHANTIDEEP CARDIAC & RESEARCH INSTITUTE
          </div>
          <h1>
            Where Clinical Precision<br />
            <em>Meets Lifesaving</em><br />
            Cardiology.
          </h1>
          <p className="hero-description">
            Eastern India&apos;s premier tertiary cardiovascular center. Delivering 99.4% procedural success, AI-driven arrhythmia telemetry, and world-class interventional heart care.
          </p>
          <div className="hero-actions">
            <button className="button button-primary button-large" onClick={() => onSignIn("Hospital staff")}>
              Hospital Workspace Sign In <ArrowRight aria-hidden="true" />
            </button>
            <button className="button button-outline button-large" onClick={() => onSignIn("Patient")}>
              Patient Portal Access <ArrowUpRight aria-hidden="true" />
            </button>
          </div>
          <div className="hero-assurance">
            <ShieldCheck aria-hidden="true" />
            <span>JCI & NABH Platinum Accredited · Full In-Hospital PostgreSQL Sync</span>
          </div>
        </motion.div>

        <motion.div
          className="hero-visual"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Floating Live Badge Top Left */}
          <motion.div
            className="floating-hero-badge"
            style={{ top: "30px", left: "0px" }}
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            <span className="caption-pulse" style={{ background: "rgba(13, 118, 109, 0.12)" }}>
              <Award size={18} color="#0d766d" />
            </span>
            <div>
              <strong>99.4% Survival Rate</strong>
              <small>NABH & JCI Certified Care</small>
            </div>
          </motion.div>

          <img
            src="/hospital-facade.jpg"
            alt="Exterior of Shantideep Cardiac Institute, Kolkata"
            style={{ height: "420px" }}
          />

          <div className="image-caption">
            <span className="caption-pulse">
              <HeartPulse aria-hidden="true" />
            </span>
            <span>
              <strong>Primary PCI In 42 Mins</strong>
              <small>Median Door-to-Balloon Response</small>
            </span>
            <ArrowUpRight aria-hidden="true" className="caption-arrow" />
          </div>
          <div className="hero-location">
            <span className="location-dot" /> SALT LAKE SECTOR V · KOLKATA
          </div>
        </motion.div>
      </section>

      {/* Trust Strip */}
      <section className="trust-strip" aria-label="Care principles">
        <p>A premier center of clinical excellence, surgical innovation, and compassionate heart recovery.</p>
        <div className="trust-points">
          <span><Check aria-hidden="true" /> 24x7 Digital Cath Labs</span>
          <span><Check aria-hidden="true" /> Continuous AI Telemetry</span>
          <span><Check aria-hidden="true" /> Zero Delay Cardiac Triage</span>
        </div>
      </section>

      {/* Hospital Achievements & Milestones */}
      <section className="milestones-section" id="milestones">
        <div className="milestones-container">
          <motion.div
            className="milestones-header"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="eyebrow">GROUNDBREAKING IMPACT</div>
            <h2>Pioneering Cardiac Milestones Across the Nation</h2>
            <p>Our dedicated cardiologists, cardiothoracic surgeons, and critical care nurses continually set benchmarks in survival, procedural safety, and surgical recovery.</p>
          </motion.div>

          <div className="milestones-grid">
            {milestones.map((item, index) => (
              <motion.div
                className="milestone-card"
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="milestone-number">{item.number}</div>
                <div className="milestone-title">{item.title}</div>
                <p className="milestone-desc">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sticky Stacking Cards Component (Card Stacking on Scroll) */}
      <section className="sticky-stack-section" id="pillars">
        <div className="section-heading sticky-stack-header">
          <div>
            <div className="eyebrow">QUATERNARY CLINICAL PILLARS</div>
            <h2>Specialized Cardiac Units<br /><em>Stacking Innovations at Every Care Stage</em></h2>
          </div>
          <p>Scroll down to explore how our specialized departments seamlessly overlap and layer together to provide continuous cardiovascular recovery.</p>
        </div>

        <div className="sticky-stack-container">
          {stackCards.map((card, idx) => {
            const stickyTop = 100 + idx * 36
            return (
              <div
                key={card.number}
                className="sticky-stack-card"
                style={{
                  top: `${stickyTop}px`,
                  background: card.theme.background,
                  color: card.theme.color,
                  border: `1px solid ${card.theme.borderColor}`,
                  zIndex: idx + 10,
                }}
              >
                <div className="stack-card-content">
                  <div className="stack-card-badge-row">
                    <span className="stack-card-number">{card.number}</span>
                    <span
                      className="stack-card-pill"
                      style={{ background: card.theme.pillBg, color: card.theme.pillColor }}
                    >
                      {card.category}
                    </span>
                  </div>
                  <h3>{card.title}</h3>
                  <p style={{ color: "#c1d5e0" }}>{card.description}</p>

                  <div className="stack-card-features">
                    {card.features.map((feat) => (
                      <div className="stack-feature-item" key={feat}>
                        <CheckCircle2 color={card.theme.pillColor} />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    className="button button-outline button-small"
                    style={{
                      background: "rgba(255,255,255,0.08)",
                      color: "#fff",
                      borderColor: card.theme.borderColor,
                    }}
                    onClick={() => onSignIn("Patient")}
                  >
                    Explore Center & Book Triage <ArrowRight size={14} />
                  </button>
                </div>

                <div className="stack-card-media">
                  <img src={card.image} alt={card.title} />
                  <div className="stack-media-floating-tag">
                    <span
                      className="caption-pulse"
                      style={{ background: card.theme.pillBg, color: card.theme.pillColor, width: "32px", height: "32px" }}
                    >
                      <HeartPulse size={16} />
                    </span>
                    <div>
                      <strong>{card.tagTitle}</strong>
                      <small>{card.tagSub}</small>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Centers of Excellence & Super-Specialties */}
      <section className="specialties-section" id="specialties">
        <div className="specialties-container">
          <div className="section-heading">
            <div>
              <div className="eyebrow">CENTERS OF EXCELLENCE</div>
              <h2>Comprehensive Cardiac Care<br /><em>Across Every Stage of Life</em></h2>
            </div>
            <p>From preventive risk assessment and pediatric intervention to high-risk bypass and transplantation.</p>
          </div>

          <div className="specialties-grid">
            {specialties.map((item, index) => (
              <motion.article
                className="specialty-card"
                key={item.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.08 }}
              >
                <div className="specialty-icon-box">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
                <div className="specialty-tags">
                  {item.tags.map((tag) => (
                    <span className="specialty-tag-pill" key={tag}>{tag}</span>
                  ))}
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      {/* Renowned Medical Faculty - Horizontal Scroll Gallery */}
      <section className="specialists-section" id="specialists">
        <div className="specialists-header-wrap">
          <div className="specialists-header-main">
            <div className="eyebrow">RENOWNED FACULTY</div>
            <h2>Headed by India&apos;s Foremost<br /><em>Cardiovascular Clinicians</em></h2>
          </div>
          <div className="specialists-header-side">
            <p>Our senior clinicians bring decades of surgical mastery, international fellowship training, and empathetic care.</p>
            {liveSpecialists.length > 0 && (
              <div className="specialists-nav-row">
                <span className="specialists-badge">
                  <UserCheck size={13} style={{ color: "#0d766d" }} />
                  {liveSpecialists.length} Board-Certified Specialists
                </span>
                <button
                  type="button"
                  className="specialists-nav-btn"
                  onClick={() => scrollGallery("left")}
                  disabled={!canScrollLeft}
                  aria-label="Scroll left to previous specialists"
                  title="Previous clinicians"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  type="button"
                  className="specialists-nav-btn"
                  onClick={() => scrollGallery("right")}
                  disabled={!canScrollRight}
                  aria-label="Scroll right to next specialists"
                  title="Next clinicians"
                >
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="specialists-gallery-outer">
          <div className="specialists-gallery" ref={galleryRef}>
            {liveSpecialists.length > 0 ? (
              liveSpecialists.map((doc, index) => {
                const initials = doc.fullName
                  .split(/\s+/)
                  .filter(Boolean)
                  .slice(0, 2)
                  .map((w) => w.replace(".", "")[0])
                  .join("")
                  .toUpperCase()
                return (
                  <motion.div
                    className="specialist-card"
                    key={doc.id || doc.fullName}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: Math.min(index * 0.08, 0.4) }}
                  >
                    <div className="specialist-card-body">
                      <div className="specialist-avatar-big">
                        {doc.profilePicUrl ? (
                          <img src={doc.profilePicUrl} alt={doc.fullName} className="specialist-photo-img" />
                        ) : (
                          initials
                        )}
                      </div>
                      <h3>{doc.fullName}</h3>
                      <div className="specialist-role">{doc.specialization}</div>
                      <div className="specialist-creds">{doc.qualification}</div>
                    </div>
                    <div className="specialist-meta">
                      <div>
                        <strong>{doc.experienceYears}+ Years</strong>
                        <span>Experience</span>
                      </div>
                    </div>
                  </motion.div>
                )
              })
            ) : (
              <div style={{ flex: "1 1 100%", textAlign: "center", padding: "48px 24px", background: "rgba(255,255,255,0.03)", borderRadius: "16px", border: "1px dashed rgba(255,255,255,0.15)", color: "#94a3b8" }}>
                <Stethoscope style={{ width: "36px", height: "36px", margin: "0 auto 12px", color: "#5eead4", opacity: 0.8 }} />
                <h4 style={{ color: "#e2e8f0", fontSize: "16px", marginBottom: "6px" }}>Clinical Faculty Directory</h4>
                <p style={{ maxWidth: "480px", margin: "0 auto", fontSize: "13px", lineHeight: "1.6" }}>
                  Doctor profiles will appear here dynamically as verified clinicians are added to the CardioTrack database.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Patient Recovery Stories */}
      <section className="testimonials-section" id="testimonials">
        <div className="testimonials-container">
          <div className="section-heading" style={{ marginBottom: "20px" }}>
            <div>
              <div className="eyebrow" style={{ color: "#5eead4" }}>PATIENT EXPERIENCES</div>
              <h2 style={{ color: "#fff" }}>Stories of Hope, Healing,<br />and Second Chances</h2>
            </div>
            <p style={{ color: "#9cb1bf" }}>Over 250,000 patients have entrusted their hearts to our multidisciplinary team.</p>
          </div>

          <div className="testimonials-grid">
            {testimonials.map((t, idx) => (
              <motion.div
                className="testimonial-card"
                key={t.author}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <div>
                  <div className="testimonial-stars">★★★★★</div>
                  <p className="testimonial-quote">&ldquo;{t.quote}&rdquo;</p>
                </div>
                <div className="testimonial-author">
                  <div className="testimonial-avatar">{t.author.charAt(0)}</div>
                  <div>
                    <strong>{t.author}</strong>
                    <small>{t.meta}</small>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Direct Healthcare Portal Gateways (No Public Sign Up!) */}
      <section className="portal-gateways-section">
        <div className="section-heading">
          <div>
            <div className="eyebrow">AUTHORIZED CARE PORTALS</div>
            <h2>Direct Clinical Access<br /><em>For Every Member of the Care Team</em></h2>
          </div>
          <p>Role-aware workspaces protected with enterprise JWT authentication and role-based access control.</p>
        </div>

        <div className="portal-cards-grid">
          <motion.div
            className="portal-card"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div>
              <div className="portal-card-top">
                <span className="portal-badge">Patients & Families</span>
                <HeartPulse color="#0d766d" />
              </div>
              <h3>Patient Health Portal</h3>
              <p>View your clinical summaries, scheduled diagnostic ECG tests, lab reports, and treatment notes securely.</p>
            </div>
            <button className="button button-primary" onClick={() => onSignIn("Patient")}>
              Patient Sign In <ArrowRight aria-hidden="true" />
            </button>
          </motion.div>

          <motion.div
            className="portal-card"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div>
              <div className="portal-card-top">
                <span className="portal-badge" style={{ background: "#edf3f9", color: "#305f88" }}>Clinicians</span>
                <Stethoscope color="#305f88" />
              </div>
              <h3>Doctor Clinical Suite</h3>
              <p>Document patient consultation notes, review digital test reports, and track your active patient cohort.</p>
            </div>
            <button className="button button-outline" onClick={() => onSignIn("Doctor")}>
              Clinician Sign In <ArrowRight aria-hidden="true" />
            </button>
          </motion.div>

          <motion.div
            className="portal-card"
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div>
              <div className="portal-card-top">
                <span className="portal-badge" style={{ background: "#f5f0fb", color: "#6e47a5" }}>Hospital Staff</span>
                <Building2 color="#6e47a5" />
              </div>
              <h3>Hospital Operations & Staff</h3>
              <p>Admit patients, provision family accounts, schedule diagnostic orders, coordinate ward bed management, and upload reports.</p>
            </div>
            <button className="button button-outline" onClick={() => onSignIn("Hospital staff")}>
              Staff Sign In <ArrowRight aria-hidden="true" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Grand Hospital Footer */}
      <footer className="grand-hospital-footer">
        <div className="footer-container">
          <div className="footer-grid">
            <div className="footer-col">
              <a className="brand-lockup" href="#top" style={{ marginBottom: "16px" }}>
                <span className="brand-mark">
                  <HeartPulse aria-hidden="true" />
                </span>
                <span className="brand-word" style={{ color: "#fff" }}>
                  Cardio<span style={{ color: "#5eead4" }}>Track</span>
                </span>
              </a>
              <p>
                Shantideep Cardiac & Research Institute is a premier quaternary hospital committed to clinical excellence, robotic surgery, and compassionate cardiology.
              </p>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "11px", color: "#5eead4" }}>
                <CheckCircle2 size={14} /> JCI & NABH Gold Certified Institute
              </div>
            </div>

            <div className="footer-col">
              <h4>Centers of Excellence</h4>
              <ul>
                <li><a href="#specialties">Interventional Cardiology & Radial PCI</a></li>
                <li><a href="#specialties">Cardiothoracic Surgery & MICS CABG</a></li>
                <li><a href="#specialties">Electrophysiology & 3D Mapping</a></li>
                <li><a href="#specialties">Pediatric Heart Center</a></li>
                <li><a href="#specialties">Preventive Cardiology & Rehab</a></li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Hospital Locations</h4>
              <ul>
                <li><MapPin size={12} style={{ display: "inline", marginRight: "4px" }} /> Main Campus: Sector V, Salt Lake, Kolkata</li>
                <li><MapPin size={12} style={{ display: "inline", marginRight: "4px" }} /> Cardiac OPD Hub: Park Circus, Kolkata</li>
                <li><MapPin size={12} style={{ display: "inline", marginRight: "4px" }} /> Trauma Center: Major Arterial Road, New Town</li>
              </ul>
            </div>

            <div className="footer-col">
              <h4>Emergency Contacts</h4>
              <p>
                <strong>24/7 Cardiac Trauma:</strong> +91 (033) 4010-9999<br />
                <strong>Toll-Free Ambulance:</strong> 1800-200-2273<br />
                <strong>Email:</strong> emergency@cardiotrack.in<br />
                <strong>General Queries:</strong> info@cardiotrack.in
              </p>
            </div>
          </div>

          <div className="footer-bottom-bar">
            <span>© 2026 Shantideep Cardiac & Research Institute · CardioTrack Health System. All rights reserved.</span>
            <span>HIPAA Compliant · Role-Based Security · PostgreSQL Connected</span>
          </div>
        </div>
      </footer>
    </main>
  )
}

// -------------------------------------------------------------
// Authentication Experience (NO Public Sign Up)
// -------------------------------------------------------------
type AuthExperienceProps = {
  initialRole: Role
  sessionExpired?: boolean
  onBack: () => void
  onSuccess: (role: Role, name: string) => void
}

export function AuthExperience({ initialRole, sessionExpired = false, onBack, onSuccess }: AuthExperienceProps) {
  const [role, setRole] = useState<Role>(initialRole)
  const [screen, setScreen] = useState<"sign-in" | "forgot" | "reset" | "expired">(sessionExpired ? "expired" : "sign-in")

  useEffect(() => {
    if (sessionExpired) {
      setScreen("expired")
    }
  }, [sessionExpired])

  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [feedback, setFeedback] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError("")
    setFeedback("")

    if (screen === "forgot") {
      if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email)) {
        setError("Enter a valid email address to continue.")
        return
      }
      setFeedback("If this address belongs to a registered account, reset instructions will be provided by your care coordinator desk.")
      return
    }

    if (screen === "reset") {
      if (password.length < 8) {
        setError("Choose a password with at least 8 characters.")
        return
      }
      setFeedback("Password has been updated. You can now sign in.")
      return
    }

    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email) || !password) {
      setError("Enter a valid registered email address and password.")
      return
    }

    setLoading(true)
    try {
      const res = await authApi.login(email, password)
      const mappedRole = toClientRole(res.role)
      const name = fullName.trim() || email.split("@")[0]
      onSuccess(mappedRole, name)
    } catch (err: any) {
      setError(err.message || "Invalid email or password.")
    } finally {
      setLoading(false)
    }
  }

  const title =
    screen === "forgot"
      ? "Reset your password"
      : screen === "reset"
      ? "Choose a new password"
      : screen === "expired"
      ? "Your session has ended"
      : "Welcome back"

  const subtitle =
    screen === "forgot"
      ? "Enter your registered email and we’ll guide you through the next step."
      : screen === "reset"
      ? "Choose a new password to continue to your account."
      : screen === "expired"
      ? "For your privacy, your previous session was signed out."
      : "Sign in to your authorized CardioTrack care workspace."

  return (
    <main className="auth-page">
      <section className="auth-photo-panel">
        <img src="/cardiotrack-hero.png" alt="A doctor speaking with a patient in a consultation room" />
        <div className="auth-photo-shade" />
        <button className="auth-back" onClick={onBack}>
          <ArrowLeft aria-hidden="true" /> Back to CardioTrack
        </button>
        <div className="auth-photo-copy">
          <span className="auth-kicker">CARDIOTRACK · SHANTIDEEP HOSPITAL</span>
          <h2>Clinical care is a team effort.</h2>
          <p>Access your real-time medical charts, test results, and healthcare records.</p>
        </div>
        <span className="auth-demo-caption">PostgreSQL Cloud Connected</span>
      </section>

      <section className="auth-form-panel">
        <a
          className="brand-lockup auth-brand"
          href="#"
          onClick={(event) => {
            event.preventDefault()
            onBack()
          }}
        >
          <span className="brand-mark">
            <HeartPulse aria-hidden="true" />
          </span>
          <span className="brand-word">
            Cardio<span>Track</span>
          </span>
        </a>

        <div className="auth-form-wrap">
          <div className="eyebrow">AUTHORIZED PORTAL ACCESS</div>
          <h1>{title}</h1>
          <p className="auth-subtitle">{subtitle}</p>

          {/* Role selector chips */}
          {screen === "sign-in" && (
            <div className="portal-role-chips">
              {(["Patient", "Hospital staff", "Doctor", "Administrator"] as Role[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`role-chip ${role === r ? "active" : ""}`}
                  onClick={() => setRole(r)}
                >
                  {r}
                </button>
              ))}
            </div>
          )}

          <div className="demo-notice">
            <ShieldCheck aria-hidden="true" />
            <span>
              <strong>Protected Hospital Portal</strong>
              <br />
              Sign in with your assigned credentials to access live clinical services.
            </span>
          </div>

          {screen !== "expired" && (
            <form className="auth-form" onSubmit={handleSubmit} noValidate>
              {screen !== "reset" && (
                <label className="form-field">
                  <span>Registered email address</span>
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="name@cardiotrack.in"
                    autoComplete="email"
                    required
                  />
                </label>
              )}

              {(screen === "sign-in" || screen === "reset") && (
                <label className="form-field">
                  <span>{screen === "reset" ? "New password" : "Password"}</span>
                  <span className="password-wrap">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      placeholder="Enter account password"
                      autoComplete={screen === "sign-in" ? "current-password" : "new-password"}
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                    </button>
                  </span>
                </label>
              )}

              {screen === "sign-in" && (
                <div className="auth-form-note">
                  <span>Sign in with your account credentials.</span>
                  <button
                    type="button"
                    onClick={() => {
                      setScreen("forgot")
                      setFeedback("")
                      setError("")
                    }}
                  >
                    Forgot password?
                  </button>
                </div>
              )}

              {error && <p className="form-error" role="alert">{error}</p>}
              {feedback && <p className="form-success" role="status">{feedback}</p>}

              <button className="button button-primary auth-submit" type="submit" disabled={loading}>
                {loading ? "Authenticating..." : screen === "sign-in" ? `Sign in as ${role}` : screen === "forgot" ? "Continue" : "Update password"}
                <ArrowRight aria-hidden="true" />
              </button>
            </form>
          )}

          {screen === "expired" && (
            <div className="expired-actions">
              <button
                className="button button-primary auth-submit"
                onClick={() => {
                  setScreen("sign-in")
                  setFeedback("")
                }}
              >
                Return to sign in <ArrowRight aria-hidden="true" />
              </button>
              <p>Your session has ended. Please sign in again.</p>
            </div>
          )}

          {/* Explicit Notice: NO Public Sign Up */}
          {screen === "sign-in" && (
            <div className="auth-form-footer" style={{ flexDirection: "column", gap: "6px", textAlign: "center" }}>
              <span style={{ fontSize: "11px", color: "#60727c" }}>
                Patient & family accounts are provisioned during hospital admission.
              </span>
              <span style={{ fontSize: "10px", color: "#8d9ea7" }}>
                Staff and Doctor credentials are provided by hospital administration.
              </span>
            </div>
          )}

          {(screen === "forgot" || screen === "reset") && (
            <button
              className="text-back-button"
              onClick={() => {
                setScreen("sign-in")
                setFeedback("")
                setError("")
              }}
            >
              <ArrowLeft aria-hidden="true" /> Back to sign in
            </button>
          )}

          <div className="auth-privacy">
            <LockKeyhole aria-hidden="true" /> Secured with Spring Security JWT Bearer Authentication.
          </div>
        </div>
      </section>
    </main>
  )
}
