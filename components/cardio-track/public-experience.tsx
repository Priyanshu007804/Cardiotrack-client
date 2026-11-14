"use client"

import { useState, useEffect, type FormEvent } from "react"
import { ArrowLeft, ArrowRight, ArrowUpRight, Check, ChevronDown, Eye, EyeOff, FileHeart, HeartPulse, LockKeyhole, Menu, ShieldCheck, Stethoscope, UsersRound, X } from "lucide-react"
import type { Role } from "./data"
import { authApi, toClientRole } from "@/lib/api"

type PublicExperienceProps = {
  onSignIn: (role: Role) => void
}

const roles: Role[] = ["Hospital staff", "Doctor", "Administrator", "Patient"]

export function PublicExperience({ onSignIn }: PublicExperienceProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <main className="public-site">
      <header className="public-header">
        <a className="brand-lockup" href="#top" aria-label="CardioTrack home">
          <span className="brand-mark"><HeartPulse aria-hidden="true" /></span>
          <span className="brand-word">Cardio<span>Track</span></span>
        </a>
        <button className="mobile-menu-toggle" aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X /> : <Menu />}
        </button>
        <nav className={`public-nav ${menuOpen ? "is-open" : ""}`} aria-label="Main navigation">
          <a href="#care" onClick={() => setMenuOpen(false)}>Care coordination</a>
          <a href="#privacy" onClick={() => setMenuOpen(false)}>Privacy & trust</a>
          <button className="button button-outline button-small" onClick={() => onSignIn("Patient")}>Patient access <ArrowUpRight aria-hidden="true" /></button>
          <button className="button button-primary button-small" onClick={() => onSignIn("Hospital staff")}>Hospital sign in <ArrowRight aria-hidden="true" /></button>
        </nav>
      </header>

      <section className="hero-section" id="top">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-dot" /> CARE, CONNECTED</div>
          <h1>Connected care.<br /><em>Clearer decisions.</em><br />Better outcomes.</h1>
          <p className="hero-description">Bringing patients, doctors, and healthcare teams together through coordinated, accessible, and organized healthcare management.</p>
          <div className="hero-actions">
            <button className="button button-primary button-large" onClick={() => onSignIn("Hospital staff")}>Enter hospital workspace <ArrowRight aria-hidden="true" /></button>
            <button className="button button-quiet button-large" onClick={() => onSignIn("Patient")}>I&apos;m a patient <ArrowUpRight aria-hidden="true" /></button>
          </div>
          <div className="hero-assurance"><ShieldCheck aria-hidden="true" /><span>Designed around thoughtful, permission-aware care</span></div>
        </div>
        <div className="hero-visual">
          <img src="/cardiotrack-hero.png" alt="A cardiologist reviewing a patient's care plan during a consultation" />
          <div className="image-caption"><span className="caption-pulse"><HeartPulse aria-hidden="true" /></span><span><strong>Care moves forward</strong><small>One coordinated team, every step</small></span><ArrowUpRight aria-hidden="true" className="caption-arrow" /></div>
          <div className="hero-location"><span className="location-dot" /> KOLKATA · WEST BENGAL</div>
        </div>
      </section>

      <section className="trust-strip" aria-label="Care principles">
        <p>Better care starts with the right information, in the right hands.</p>
        <div className="trust-points"><span><Check aria-hidden="true" /> Patient-centred</span><span><Check aria-hidden="true" /> Team-coordinated</span><span><Check aria-hidden="true" /> Privacy-conscious</span></div>
      </section>

      <section className="capabilities-section" id="care">
        <div className="section-heading">
          <div><div className="eyebrow">A CLEARER VIEW OF CARE</div><h2>Everything connected.<br /><em>Nothing overlooked.</em></h2></div>
          <p>From the first registration to follow-up care, keep essential information organized around the people who need it.</p>
        </div>
        <div className="capability-grid">
          <CapabilityCard icon={<UsersRound />} number="01" title="Patient records" description="A considered view of patient details, care history, and current hospital stays." />
          <CapabilityCard icon={<Stethoscope />} number="02" title="Clinical documentation" description="Structured notes that help care teams maintain continuity from one visit to the next." />
          <CapabilityCard icon={<HeartPulse />} number="03" title="Diagnostic coordination" description="See tests, schedules, and reports together with their associated care teams." />
          <CapabilityCard icon={<FileHeart />} number="04" title="Hospital stays" description="Coordinate admissions, care transitions, and discharge documentation with clarity." />
        </div>
      </section>

      <section className="privacy-band" id="privacy">
        <div className="privacy-icon"><LockKeyhole aria-hidden="true" /></div>
        <div><div className="eyebrow">CARE WITH CONFIDENCE</div><h2>Information shared with care.</h2><p>Role-aware access keeps each workspace focused on what its people need. Patient information stays within the care experience—not on public pages.</p></div>
        <button className="button button-light" onClick={() => onSignIn("Hospital staff")}>Explore the workspace <ArrowRight aria-hidden="true" /></button>
      </section>

      <footer className="public-footer">
        <a className="brand-lockup" href="#top" aria-label="CardioTrack home"><span className="brand-mark"><HeartPulse aria-hidden="true" /></span><span className="brand-word">Cardio<span>Track</span></span></a>
        <p>Organized around better-connected care.</p>
        <span className="footer-hospital">A fictional demonstration experience · Kolkata</span>
      </footer>
    </main>
  )
}

function CapabilityCard({ icon, number, title, description }: { icon: React.ReactNode; number: string; title: string; description: string }) {
  return <article className="capability-card"><div className="capability-top"><span className="capability-icon">{icon}</span><span>{number}</span></div><h3>{title}</h3><p>{description}</p></article>
}

type AuthExperienceProps = {
  initialRole: Role
  sessionExpired?: boolean
  onBack: () => void
  onSuccess: (role: Role, name: string) => void
}

export function AuthExperience({ initialRole, sessionExpired = false, onBack, onSuccess }: AuthExperienceProps) {
  const [role, setRole] = useState<Role>(initialRole)
  const [screen, setScreen] = useState<"sign-in" | "register" | "forgot" | "reset" | "expired">(sessionExpired ? "expired" : "sign-in")

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
      setFeedback("If this address belongs to a registered account, reset instructions will be available through your care team.")
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

    if (screen === "register") {
      if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) {
        setError("Complete each field with a valid email and a password of at least 8 characters.")
        return
      }
      setLoading(true)
      try {
        await authApi.register(email, password)
        setFeedback("Registration successful! Please sign in with your credentials.")
        setScreen("sign-in")
      } catch (err: any) {
        setError(err.message || "Registration failed. Please try again.")
      } finally {
        setLoading(false)
      }
      return
    }

    if (!email.trim() || !/^\S+@\S+\.\S+$/.test(email) || !password) {
      setError("Enter a valid email address and password.")
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

  const title = screen === "forgot" ? "Reset your password" : screen === "reset" ? "Choose a new password" : screen === "register" ? "Patient registration" : screen === "expired" ? "Your session has ended" : "Welcome back"
  const subtitle = screen === "forgot" ? "Enter your email and we’ll guide you through the next step." : screen === "reset" ? "Choose a new password to continue to your account." : screen === "register" ? "Create a patient account with CardioTrack." : screen === "expired" ? "For your privacy, your previous session was signed out." : "Sign in to your CardioTrack care workspace."

  return (
    <main className="auth-page">
      <section className="auth-photo-panel">
        <img src="/cardiotrack-hero.png" alt="A doctor speaking with a patient in a hospital consultation room" />
        <div className="auth-photo-shade" />
        <button className="auth-back" onClick={onBack}><ArrowLeft aria-hidden="true" /> Back to CardioTrack</button>
        <div className="auth-photo-copy"><span className="auth-kicker">CARDIOTRACK · KOLKATA</span><h2>Care is a team effort.</h2><p>Keep the conversation—and the care—moving forward.</p></div>
        <span className="auth-demo-caption">Live Microservices Connected</span>
      </section>
      <section className="auth-form-panel">
        <a className="brand-lockup auth-brand" href="#" onClick={(event) => { event.preventDefault(); onBack() }}><span className="brand-mark"><HeartPulse aria-hidden="true" /></span><span className="brand-word">Cardio<span>Track</span></span></a>
        <div className="auth-form-wrap">
          <div className="eyebrow">SECURE CARE ACCESS</div>
          <h1>{title}</h1><p className="auth-subtitle">{subtitle}</p>
          <div className="demo-notice"><ShieldCheck aria-hidden="true" /><span><strong>Connected to Cloud Microservices</strong><br />Sign in with your registered email and password to access live records.</span></div>
          {screen !== "expired" && <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {screen === "register" && <label className="form-field"><span>Full name</span><input value={fullName} onChange={(event) => setFullName(event.target.value)} placeholder="Your name" autoComplete="name" required /></label>}
            {(screen !== "reset") && <label className="form-field"><span>Email address</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.in" autoComplete="email" required /></label>}
            {(screen === "sign-in" || screen === "register" || screen === "reset") && <label className="form-field"><span>{screen === "reset" ? "New password" : "Password"}</span><span className="password-wrap"><input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} placeholder="At least 8 characters" autoComplete={screen === "sign-in" ? "current-password" : "new-password"} required /><button type="button" className="password-toggle" aria-label={showPassword ? "Hide password" : "Show password"} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}</button></span></label>}
            {screen === "sign-in" && <div className="auth-form-note"><span>Sign in with your account credentials.</span><button type="button" onClick={() => { setScreen("forgot"); setFeedback(""); setError("") }}>Forgot password?</button></div>}
            {error && <p className="form-error" role="alert">{error}</p>}
            {feedback && <p className="form-success" role="status">{feedback}</p>}
            <button className="button button-primary auth-submit" type="submit" disabled={loading}>
              {loading ? "Connecting..." : screen === "sign-in" ? "Sign in to workspace" : screen === "forgot" ? "Continue" : screen === "register" ? "Submit registration" : "Update password"}
              <ArrowRight aria-hidden="true" />
            </button>
          </form>}
          {screen === "expired" && <div className="expired-actions"><button className="button button-primary auth-submit" onClick={() => { setScreen("sign-in"); setFeedback("") }}>Return to sign in <ArrowRight aria-hidden="true" /></button><p>Your session has ended. Please sign in again.</p></div>}
          {screen === "sign-in" && <div className="auth-form-footer"><span>New to patient access?</span><button onClick={() => { setRole("Patient"); setScreen("register"); setFeedback(""); setError("") }}>Register account</button></div>}
          {(screen === "forgot" || screen === "reset" || screen === "register") && <button className="text-back-button" onClick={() => { setScreen("sign-in"); setFeedback(""); setError("") }}><ArrowLeft aria-hidden="true" /> Back to sign in</button>}
          <div className="auth-privacy"><LockKeyhole aria-hidden="true" /> Protected with JWT Bearer authentication & Spring Security.</div>
        </div>
      </section>
    </main>
  )
}
