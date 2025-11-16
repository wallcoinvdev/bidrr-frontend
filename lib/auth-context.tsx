"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { apiClient } from "./api-client"

interface User {
  id: number
  email: string
  full_name: string
  role: "homeowner" | "contractor"
  phone_number?: string
  phone_verified?: boolean
  is_admin?: boolean
  company_name?: string
  logo_url?: string
  company_size?: string
  business_address?: string
  radius_km?: number
  services?: string[]
  website?: string
  social_links?: {
    facebook?: string
    instagram?: string
    linkedin?: string
  }
  review_sites?: {
    google?: string
    yelp?: string
  }
  google_business_url?: string
  notification_frequency?: string
  bids_limit?: number
  current_bids?: number
  last_reset?: string
  subscription_tier?: string
  city?: string
  province?: string
  postal_code?: string
  impersonating_admin_id?: number
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (
    email: string,
    password: string,
    rememberMe?: boolean,
  ) => Promise<User | { requires_2fa: boolean; temp_token: string; phone_number: string }>
  logout: () => void
  setUser: (user: User | null) => void
  refreshUser: () => Promise<void>
  impersonateUser: (userId: number) => Promise<void>
  exitImpersonation: () => void
  isImpersonating: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function decodeToken(
  token: string,
): { id: number; role: "homeowner" | "contractor"; is_admin?: boolean; impersonating_admin_id?: number } | null {
  try {
    const base64Url = token.split(".")[1]
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/")
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    )
    const payload = JSON.parse(jsonPayload)
    return {
      id: payload.id,
      role: payload.role,
      is_admin: payload.is_admin,
      impersonating_admin_id: payload.impersonating_admin_id,
    }
  } catch (error) {
    console.error("[v0] Failed to decode token:", error)
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const isImpersonating = !!user?.impersonating_admin_id

  const fetchUserProfile = async (token: string): Promise<User | null> => {
    try {
      const userData = await apiClient.request<User>("/api/users/profile", {
        method: "GET",
        requiresAuth: true,
      })

      const tokenData = decodeToken(token)
      if (tokenData?.impersonating_admin_id) {
        userData.impersonating_admin_id = tokenData.impersonating_admin_id
      }

      return userData
    } catch (error: any) {
      console.error("[v0] Failed to fetch user profile:", error)
      const tokenData = decodeToken(token)
      if (tokenData) {
        return {
          id: tokenData.id,
          email: "",
          full_name: "",
          role: tokenData.role,
          is_admin: tokenData.is_admin,
          impersonating_admin_id: tokenData.impersonating_admin_id,
        }
      }
      return null
    }
  }

  const refreshUser = async () => {
    const token = localStorage.getItem("token")
    if (!token) return

    const userData = await fetchUserProfile(token)
    if (userData) {
      setUser(userData)
      localStorage.setItem("user", JSON.stringify(userData))
    } else {
      localStorage.removeItem("token")
      localStorage.removeItem("refresh_token")
      localStorage.removeItem("user")
      setUser(null)
    }

    setLoading(false)
  }

  const impersonateUser = async (userId: number) => {
    try {
      const originalToken = localStorage.getItem("token")
      if (originalToken) {
        localStorage.setItem("admin_token", originalToken)
      }

      const response = await apiClient.request<{ token: string; user: User }>(`/api/admin/impersonate/${userId}`, {
        method: "POST",
        requiresAuth: true,
      })

      // Ensure full_name is set for banner display
      const impersonatedUser = {
        ...response.user,
        full_name: response.user.full_name || response.user.email,
        impersonating_admin_id: response.user.impersonating_admin_id,
      }

      localStorage.setItem("token", response.token)
      localStorage.setItem("user", JSON.stringify(impersonatedUser))
      setUser(impersonatedUser)

      const targetDashboard = response.user.role === "homeowner" ? "/dashboard/homeowner" : "/dashboard/contractor"
      window.location.href = targetDashboard
    } catch (error: any) {
      console.error("[v0] Impersonation failed:", error)
      alert("Failed to switch to user account: " + (error.message || "Unknown error"))
    }
  }

  const exitImpersonation = () => {
    const adminToken = localStorage.getItem("admin_token")
    if (adminToken) {
      localStorage.setItem("token", adminToken)
      localStorage.removeItem("admin_token")
      window.location.href = "/dashboard/admin/users"
    } else {
      console.error("[v0] No admin token found to restore")
      logout()
    }
  }

  useEffect(() => {
    const initAuth = async () => {
      const urlParams = new URLSearchParams(window.location.search)
      const tokenFromUrl = urlParams.get("token")

      if (tokenFromUrl) {
        localStorage.setItem("token", tokenFromUrl)
        window.history.replaceState({}, "", window.location.pathname)
      }

      const token = localStorage.getItem("token")

      if (!token) {
        localStorage.removeItem("user")
        localStorage.removeItem("refresh_token")
        setUser(null)
        setLoading(false)
        return
      }

      const userData = await fetchUserProfile(token)

      if (userData) {
        setUser(userData)
        localStorage.setItem("user", JSON.stringify(userData))
      } else {
        localStorage.removeItem("token")
        localStorage.removeItem("refresh_token")
        localStorage.removeItem("user")
        setUser(null)
      }

      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (
    email: string,
    password: string,
    rememberMe = false,
  ): Promise<User | { requires_2fa: boolean; temp_token: string; phone_number: string }> => {
    try {
      console.log("[v0] ========== LOGIN ATTEMPT ==========")
      console.log("[v0] Email:", email)
      console.log("[v0] Timestamp:", new Date().toISOString())

      const response = await apiClient.request<{
        token?: string
        refresh_token?: string
        user?: User
        requires_2fa?: boolean
        temp_token?: string
        phone_number?: string
      }>("/api/users/login", {
        method: "POST",
        body: JSON.stringify({ email, password, remember_me: rememberMe }),
      })

      if (response.requires_2fa && response.temp_token) {
        return {
          requires_2fa: true,
          temp_token: response.temp_token,
          phone_number: response.phone_number || "",
        }
      }

      if (!response.token) {
        throw new Error("Login response missing authentication token")
      }

      localStorage.setItem("token", response.token)
      if (response.refresh_token) {
        localStorage.setItem("refresh_token", response.refresh_token)
      }

      console.log("[v0] ✅ LOGIN SUCCESSFUL")
      console.log("[v0] Token stored in localStorage")

      const fullProfile = await fetchUserProfile(response.token)
      const userData = fullProfile || response.user

      if (!userData) {
        throw new Error("Login response missing user data")
      }

      console.log("[v0] User ID:", userData.id)
      console.log("[v0] User role:", userData.role)

      localStorage.setItem("user", JSON.stringify(userData))
      setUser(userData)

      return userData
    } catch (error: any) {
      console.error("[v0] Login error:", error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem("admin_token")
    window.location.href = "/logout"
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        setUser,
        refreshUser,
        impersonateUser,
        exitImpersonation,
        isImpersonating,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
