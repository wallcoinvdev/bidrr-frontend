"use client"

import { createContext, useContext, useState, useEffect, useRef, type ReactNode } from "react"
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
  token?: string
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const initRef = useRef(false)

  const isImpersonating = !!user?.impersonating_admin_id

  const fetchUserProfile = async (): Promise<User | null> => {
    try {
      const userData = await apiClient.request<User & { token?: string }>("/api/users/profile", {
        method: "GET",
        requiresAuth: true,
      })

      if (userData.token) {
        console.log("[v0] Storing token from profile response:", userData.token.substring(0, 20) + "...")
        localStorage.setItem("auth_token", userData.token)
      } else {
        console.log("[v0] Profile response missing token")
      }

      return userData
    } catch (error: any) {
      if (error.message !== "Authentication required" && error.message !== "Unauthorized") {
        console.error("Failed to fetch user profile:", error)
      }
      return null
    }
  }

  const refreshUser = async () => {
    const userData = await fetchUserProfile()
    if (userData) {
      setUser(userData)
      localStorage.setItem("user", JSON.stringify(userData))
    } else {
      localStorage.removeItem("user")
      localStorage.removeItem("auth_token")
      setUser(null)
    }

    setLoading(false)
  }

  const impersonateUser = async (userId: number) => {
    try {
      localStorage.setItem("is_impersonating", "true")

      const response = await apiClient.request<{ user: User; token?: string }>(`/api/admin/impersonate/${userId}`, {
        method: "POST",
        requiresAuth: true,
      })

      if (response.token) {
        localStorage.setItem("auth_token", response.token)
      }

      const impersonatedUser = {
        ...response.user,
        full_name: response.user.full_name || response.user.email,
        impersonating_admin_id: response.user.impersonating_admin_id,
      }

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
    localStorage.removeItem("is_impersonating")
    localStorage.removeItem("auth_token")
    window.location.href = "/dashboard/admin/users"
  }

  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    const initAuth = async () => {
      try {
        const userData = await fetchUserProfile()

        if (userData) {
          setUser(userData)
          localStorage.setItem("user", JSON.stringify(userData))
        } else {
          localStorage.removeItem("user")
          localStorage.removeItem("auth_token")
          setUser(null)
        }
      } catch (error) {
        localStorage.removeItem("user")
        localStorage.removeItem("auth_token")
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = async (
    email: string,
    password: string,
    rememberMe = false,
  ): Promise<User | { requires_2fa: boolean; temp_token: string; phone_number: string }> => {
    try {
      const response = await apiClient.request<{
        user?: User
        token?: string
        requires_2fa?: boolean
        temp_token?: string
        phone_number?: string
      }>("/api/users/login", {
        method: "POST",
        body: JSON.stringify({ email, password, remember_me: rememberMe }),
        requiresAuth: false,
      })

      if (response.requires_2fa && response.temp_token) {
        return {
          requires_2fa: true,
          temp_token: response.temp_token,
          phone_number: response.phone_number || "",
        }
      }

      if (response.token) {
        console.log("[v0] Storing token from login response:", response.token.substring(0, 20) + "...")
        localStorage.setItem("auth_token", response.token)
      } else {
        console.log("[v0] Login response missing token")
      }

      let userData: User | null = null
      try {
        userData = await fetchUserProfile()
      } catch (error) {
        console.warn("Failed to fetch full profile after login, using login response data:", error)
        userData = response.user || null
      }

      if (!userData) {
        throw new Error("Login response missing user data")
      }

      localStorage.setItem("user", JSON.stringify(userData))
      setUser(userData)

      return userData
    } catch (error: any) {
      console.error("Login error:", error)
      throw error
    }
  }

  const logout = () => {
    localStorage.removeItem("is_impersonating")
    localStorage.removeItem("auth_token")
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
