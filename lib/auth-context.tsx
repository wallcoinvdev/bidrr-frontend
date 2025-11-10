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
  is_admin?: boolean // Added is_admin field for admin users
  // Contractor-specific fields
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
  google_business_url?: string // Added google_business_url field for Google verified badge persistence
  notification_frequency?: string
  bids_limit?: number
  current_bids?: number
  last_reset?: string
  subscription_tier?: string
  // Homeowner-specific fields
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

      console.log("[v0] fetchUserProfile response:", userData)
      console.log("[v0] google_business_url in profile:", userData?.google_business_url)

      const tokenData = decodeToken(token)
      if (tokenData?.impersonating_admin_id) {
        userData.impersonating_admin_id = tokenData.impersonating_admin_id
      }

      return userData
    } catch (error: any) {
      console.error("[v0] Failed to fetch user profile:", error)
      if (error.message?.includes("401") || error.message?.includes("Authentication required")) {
        localStorage.removeItem("token")
        localStorage.removeItem("refresh_token")
        localStorage.removeItem("user")
        return null
      }
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
      console.log("[v0] Admin impersonating user:", userId)

      // Store original admin token before impersonating
      const originalToken = localStorage.getItem("token")
      if (originalToken) {
        localStorage.setItem("admin_token", originalToken)
      }

      // Call backend to get impersonation token
      const response = await apiClient.request<{ token: string; user: User }>(`/api/admin/impersonate/${userId}`, {
        method: "POST",
        requiresAuth: true,
      })

      // Set new impersonation token
      localStorage.setItem("token", response.token)
      localStorage.setItem("user", JSON.stringify(response.user))
      setUser(response.user)

      // Redirect to appropriate dashboard
      const targetDashboard = response.user.role === "homeowner" ? "/dashboard/homeowner" : "/dashboard/contractor"

      window.location.href = targetDashboard
    } catch (error: any) {
      console.error("[v0] Impersonation failed:", error)
      alert("Failed to switch to user account: " + (error.message || "Unknown error"))
    }
  }

  const exitImpersonation = () => {
    console.log("[v0] Exiting impersonation")

    // Restore original admin token
    const adminToken = localStorage.getItem("admin_token")
    if (adminToken) {
      localStorage.setItem("token", adminToken)
      localStorage.removeItem("admin_token")

      // Redirect back to admin panel
      window.location.href = "/dashboard/admin/users"
    } else {
      console.error("[v0] No admin token found to restore")
      logout()
    }
  }

  useEffect(() => {
    const initAuth = async () => {
      console.log("[v0] ========== AUTH CONTEXT INIT START ==========")
      console.log("[v0] Current URL:", window.location.href)
      console.log("[v0] Current pathname:", window.location.pathname)
      console.log("[v0] localStorage.token:", localStorage.getItem("token"))
      console.log("[v0] localStorage.user:", localStorage.getItem("user"))
      console.log("[v0] localStorage.refresh_token:", localStorage.getItem("refresh_token"))
      console.log("[v0] Timestamp:", new Date().toISOString())

      const urlParams = new URLSearchParams(window.location.search)
      const tokenFromUrl = urlParams.get("token")

      if (tokenFromUrl) {
        console.log("[v0] ✅ Token found in URL, saving to localStorage")
        localStorage.setItem("token", tokenFromUrl)
        window.history.replaceState({}, "", window.location.pathname)
      }

      const token = localStorage.getItem("token")

      if (!token) {
        console.log("[v0] ❌ No token found in localStorage")
        console.log("[v0] Clearing any remaining auth data")
        localStorage.removeItem("user")
        localStorage.removeItem("refresh_token")
        setUser(null)
        setLoading(false)
        console.log("[v0] ========== AUTH INIT COMPLETE (NO TOKEN) ==========")
        return
      }

      console.log("[v0] ✅ Token found, length:", token.length)
      console.log("[v0] Token preview (first 20 chars):", token.substring(0, 20))
      console.log("[v0] Fetching user profile...")

      const fetchStartTime = Date.now()
      const userData = await fetchUserProfile(token)
      const fetchEndTime = Date.now()

      console.log("[v0] Profile fetch took:", fetchEndTime - fetchStartTime, "ms")

      if (userData) {
        console.log("[v0] ✅ User profile fetched successfully")
        console.log("[v0] User ID:", userData.id)
        console.log("[v0] User email:", userData.email)
        console.log("[v0] User role:", userData.role)
        setUser(userData)
        localStorage.setItem("user", JSON.stringify(userData))
      } else {
        console.log("[v0] ❌ Failed to fetch user profile")
        console.log("[v0] This triggers automatic logout")
        console.log("[v0] Clearing all auth data")
        localStorage.removeItem("token")
        localStorage.removeItem("refresh_token")
        localStorage.removeItem("user")
        setUser(null)
      }

      setLoading(false)
      console.log("[v0] ========== AUTH INIT COMPLETE ==========")
    }

    initAuth()
  }, [])

  const login = async (
    email: string,
    password: string,
    rememberMe = false,
  ): Promise<User | { requires_2fa: boolean; temp_token: string; phone_number: string }> => {
    console.log("[v0] ========== LOGIN FUNCTION START ==========")

    try {
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

      console.log("[v0] Login API response received")
      console.log("[v0] Response keys:", Object.keys(response))

      if (response.requires_2fa && response.temp_token) {
        console.log("[v0] 2FA required, returning 2FA data")
        return {
          requires_2fa: true,
          temp_token: response.temp_token,
          phone_number: response.phone_number || "",
        }
      }

      console.log("[v0] User from login response:", response.user)
      console.log("[v0] google_business_url in login response:", response.user?.google_business_url)

      if (!response.token) {
        throw new Error("Login response missing authentication token")
      }

      localStorage.setItem("token", response.token)
      if (response.refresh_token) {
        localStorage.setItem("refresh_token", response.refresh_token)
      }

      console.log("[v0] Token stored, now fetching full profile...")

      const fullProfile = await fetchUserProfile(response.token)

      console.log("[v0] Full profile fetch completed")
      console.log("[v0] Full profile data:", fullProfile)
      console.log("[v0] google_business_url in full profile:", fullProfile?.google_business_url)

      const userData = fullProfile || response.user

      console.log("[v0] Final userData to store:", userData)
      console.log("[v0] google_business_url in final userData:", userData?.google_business_url)

      if (!userData) {
        throw new Error("Login response missing user data")
      }

      localStorage.setItem("user", JSON.stringify(userData))
      setUser(userData)

      console.log("[v0] User data stored in localStorage")
      console.log("[v0] Verifying stored data...")
      const storedUser = localStorage.getItem("user")
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser)
        console.log("[v0] Verified google_business_url in stored user:", parsedUser.google_business_url)
      }
      console.log("[v0] ========== LOGIN FUNCTION END ==========")

      return userData
    } catch (error: any) {
      console.error("[v0] ========== LOGIN FUNCTION ERROR ==========")
      console.error("[v0] Error:", error)
      console.error("[v0] Error message:", error.message)
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
