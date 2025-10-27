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
  notification_frequency?: string
  bids_limit?: number
  current_bids?: number
  last_reset?: string
  subscription_tier?: string
  // Homeowner-specific fields
  city?: string
  province?: string
  postal_code?: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string, rememberMe?: boolean) => Promise<User>
  logout: () => void
  setUser: (user: User | null) => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function decodeToken(token: string): { id: number; role: "homeowner" | "contractor" } | null {
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
    return { id: payload.id, role: payload.role }
  } catch (error) {
    console.error("[v0] Failed to decode token:", error)
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchUserProfile = async (token: string): Promise<User | null> => {
    try {
      const userData = await apiClient.request<User>("/api/users/profile", {
        method: "GET",
        requiresAuth: true,
      })
      return userData
    } catch (error: any) {
      console.error("[v0] Failed to fetch user profile:", error)
      if (error.message?.includes("401") || error.message?.includes("Authentication required")) {
        localStorage.removeItem("token")
        localStorage.removeItem("refresh_token")
        localStorage.removeItem("user")
        return null
      }
      // For other errors, try to decode token as fallback
      const tokenData = decodeToken(token)
      if (tokenData) {
        return {
          id: tokenData.id,
          email: "",
          full_name: "",
          role: tokenData.role,
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
    }
  }

  useEffect(() => {
    const initAuth = async () => {
      // Check for token in URL (OAuth redirect)
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

  const login = async (email: string, password: string, rememberMe = false): Promise<User> => {
    const response = await apiClient.request<{ token: string; refresh_token?: string; user: User }>(
      "/api/users/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password, remember_me: rememberMe }),
      },
    )

    localStorage.setItem("token", response.token)
    if (response.refresh_token) {
      localStorage.setItem("refresh_token", response.refresh_token)
    }

    const userData = response.user
    if (!userData) {
      throw new Error("Login response missing user data")
    }

    localStorage.setItem("user", JSON.stringify(userData))
    setUser(userData)

    return userData
  }

  const logout = () => {
    window.location.href = "/logout"
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, setUser, refreshUser }}>
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
