"use client"

import { useEffect, useState, useCallback } from "react"
import { AuthExperience, PublicExperience } from "./public-experience"
import { Workspace } from "./workspace"
import type { Role } from "./data"
import { authApi, getAuthToken, getStoredUser, isTokenExpired, getTokenRemainingMs } from "@/lib/api"

type Screen = "public" | "auth" | "workspace"

export function CardioTrackApp() {
  const [screen, setScreen] = useState<Screen>("public")
  const [role, setRole] = useState<Role>("Hospital staff")
  const [userName, setUserName] = useState("Hospital Staff")
  const [sessionExpired, setSessionExpired] = useState(false)

  // Handle automatic session expiration (JWT expired or 401 Unauthorized)
  const handleSessionExpired = useCallback(() => {
    authApi.logout()
    setSessionExpired(true)
    setScreen("auth")
  }, [])

  // Restore session from localStorage if token exists & is still valid
  useEffect(() => {
    const token = getAuthToken()
    const storedUser = getStoredUser()
    if (token && storedUser) {
      if (isTokenExpired(token)) {
        handleSessionExpired()
        return
      }
      setRole(storedUser.clientRole as Role)
      setUserName(storedUser.name || storedUser.email.split("@")[0])
      setScreen("workspace")
    }
  }, [handleSessionExpired])

  // Listen to session-expired events dispatched from request failures or API layer
  useEffect(() => {
    window.addEventListener("cardiotrack:session-expired", handleSessionExpired)
    return () => {
      window.removeEventListener("cardiotrack:session-expired", handleSessionExpired)
    }
  }, [handleSessionExpired])

  // Active token expiration timer & interval check while in workspace
  useEffect(() => {
    if (screen !== "workspace") return

    const checkToken = () => {
      const token = getAuthToken()
      if (!token || isTokenExpired(token)) {
        handleSessionExpired()
        return true
      }
      return false
    }

    if (checkToken()) return

    const token = getAuthToken()
    const remainingMs = getTokenRemainingMs(token)
    let timerId: ReturnType<typeof setTimeout> | undefined

    if (remainingMs > 0 && remainingMs < 2147483647) {
      timerId = setTimeout(() => {
        handleSessionExpired()
      }, remainingMs)
    }

    // Periodic check every 10 seconds (handles system sleep / background tab resume)
    const intervalId = setInterval(() => {
      checkToken()
    }, 10000)

    return () => {
      if (timerId) clearTimeout(timerId)
      clearInterval(intervalId)
    }
  }, [screen, handleSessionExpired])

  const openSignIn = (requestedRole: Role) => {
    setRole(requestedRole)
    setSessionExpired(false)
    setScreen("auth")
  }

  const handleSignOut = () => {
    authApi.logout()
    setSessionExpired(false)
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

