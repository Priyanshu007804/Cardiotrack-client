"use client"

import { useEffect, useState } from "react"
import { AuthExperience, PublicExperience } from "./public-experience"
import { Workspace } from "./workspace"
import type { Role } from "./data"
import { authApi, getAuthToken, getStoredUser } from "@/lib/api"

type Screen = "public" | "auth" | "workspace"

export function CardioTrackApp() {
  const [screen, setScreen] = useState<Screen>("public")
  const [role, setRole] = useState<Role>("Hospital staff")
  const [userName, setUserName] = useState("Hospital Staff")
  const [sessionExpired, setSessionExpired] = useState(false)

  // Restore session from localStorage if token exists
  useEffect(() => {
    const token = getAuthToken()
    const storedUser = getStoredUser()
    if (token && storedUser) {
      setRole(storedUser.clientRole as Role)
      setUserName(storedUser.name || storedUser.email.split("@")[0])
      setScreen("workspace")
    }
  }, [])

  const openSignIn = (requestedRole: Role) => {
    setRole(requestedRole)
    setSessionExpired(false)
    setScreen("auth")
  }

  const handleSignOut = () => {
    authApi.logout()
    setSessionExpired(true)
    setScreen("auth")
  }

  if (screen === "workspace") {
    return (
      <Workspace
        role={role}
        userName={userName}
        onSignOut={handleSignOut}
        onSwitchRole={(nextRole) => {
          setRole(nextRole)
          setSessionExpired(false)
          setScreen("auth")
        }}
      />
    )
  }

  if (screen === "auth") {
    return (
      <AuthExperience
        initialRole={role}
        sessionExpired={sessionExpired}
        onBack={() => {
          setSessionExpired(false)
          setScreen("public")
        }}
        onSuccess={(nextRole, name) => {
          setRole(nextRole)
          setUserName(name)
          setSessionExpired(false)
          setScreen("workspace")
        }}
      />
    )
  }

  return <PublicExperience onSignIn={openSignIn} />
}

