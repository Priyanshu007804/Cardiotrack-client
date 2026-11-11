"use client"

import { useState } from "react"
import { AuthExperience, PublicExperience } from "./public-experience"
import { Workspace } from "./workspace"
import type { Role } from "./data"

type Screen = "public" | "auth" | "workspace"

export function CardioTrackApp() {
  const [screen, setScreen] = useState<Screen>("public")
  const [role, setRole] = useState<Role>("Hospital staff")
  const [userName, setUserName] = useState("Meera Das")
  const [sessionExpired, setSessionExpired] = useState(false)

  const openSignIn = (requestedRole: Role) => {
    setRole(requestedRole)
    setSessionExpired(false)
    setScreen("auth")
  }

  if (screen === "workspace") {
    return <Workspace role={role} userName={userName} onSignOut={() => { setSessionExpired(true); setScreen("auth") }} onSwitchRole={(nextRole) => { setRole(nextRole); setSessionExpired(false); setScreen("auth") }} />
  }

  if (screen === "auth") {
    return <AuthExperience initialRole={role} sessionExpired={sessionExpired} onBack={() => { setSessionExpired(false); setScreen("public") }} onSuccess={(nextRole, name) => { setRole(nextRole); setUserName(name); setSessionExpired(false); setScreen("workspace") }} />
  }

  return <PublicExperience onSignIn={openSignIn} />
}
