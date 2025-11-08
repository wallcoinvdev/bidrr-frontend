"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { AlertCircle, Loader2, ArrowLeft, Shield, Eye, EyeOff } from "lucide-react"

const GOOGLE_OAUTH_URL = "https://api.bidrr.ca/api/users/google"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [show2FA, setShow2FA] = useState(false)
  const [twoFactorCode, setTwoFactorCode] = useState("")
  const [tempToken, setTempToken] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")
  const { login, user, loading: authLoading, setUser } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const errorParam = searchParams.get("error")
    if (errorParam === "session_expired") {
      setError("Your session has expired. Please log in again.")
    }
  }, [searchParams])

  useEffect(() => {
    if (user && !authLoading && !loading) {
      const targetDashboard = user.is_admin
        ? "/dashboard/admin"
        : user.role === "homeowner"
          ? "/dashboard/homeowner"
          : "/dashboard/contractor"
      router.replace(targetDashboard)
    }
  }, [user, authLoading, loading, router])

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#0D3D42] flex items-center justify-center">
        <div className="text-white text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p>Loading...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log("[v0] ========== LOGIN ATTEMPT TRACKING START ==========")
    console.log("[v0] Login form submitted")
    console.log("[v0] Email:", email)
    console.log("[v0] Remember me:", rememberMe)
    console.log("[v0] Timestamp:", new Date().toISOString())

    const accountCreatedAt = sessionStorage.getItem("account_created_at")
    const accountUserId = sessionStorage.getItem("account_user_id")
    const accountEmail = sessionStorage.getItem("account_email")

    if (accountCreatedAt && accountEmail === email) {
      const createdTime = new Date(accountCreatedAt)
      const now = new Date()
      const minutesSinceCreation = (now.getTime() - createdTime.getTime()) / 1000 / 60

      console.log("[v0] 🔍 ACCOUNT TRACKING INFO:")
      console.log("[v0] - This account was created:", accountCreatedAt)
      console.log("[v0] - User ID at creation:", accountUserId)
      console.log("[v0] - Minutes since creation:", minutesSinceCreation.toFixed(2))
      console.log("[v0] - Attempting to log in with same email")
    } else {
      console.log("[v0] No recent account creation tracked for this email")
    }

    setError("")
    setLoading(true)

    try {
      const requestBody = { email, password, remember_me: rememberMe }
      console.log("[v0] Making login request to:", "https://api.bidrr.ca/api/users/login")
      console.log("[v0] Request body (password hidden):", { ...requestBody, password: "[HIDDEN]" })

      const loginStartTime = Date.now()
      const response = await fetch("https://api.bidrr.ca/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      const loginEndTime = Date.now()
      console.log("[v0] Login API call took:", loginEndTime - loginStartTime, "ms")
      console.log("[v0] Login response status:", response.status, response.statusText)
      console.log("[v0] Login response ok:", response.ok)

      const data = await response.json()
      console.log("[v0] Login response data:", JSON.stringify(data, null, 2))

      if (!response.ok) {
        console.log("[v0] ❌ LOGIN FAILED")
        console.log("[v0] Error from backend:", data.error)

        if (accountCreatedAt && accountEmail === email && response.status === 429) {
          console.log("[v0] ⚠️ RATE LIMIT: Recently created account is rate-limited")
          console.log("[v0] This is NOT account deletion - just rate limiting from previous attempts")
        } else if (accountCreatedAt && accountEmail === email) {
          console.log("[v0] 🚨 CRITICAL: Account was just created but login failed!")
          console.log("[v0] This suggests the account was deleted or credentials are wrong")
          console.log("[v0] Backend should check if user exists in database")
        }

        throw new Error(data.error || "Invalid email or password")
      }

      console.log("[v0] ✅ LOGIN SUCCESSFUL")
      console.log("[v0] User ID from login:", data.user?.id)
      console.log("[v0] User role:", data.user?.role)
      console.log("[v0] Token received:", data.token ? "YES" : "NO")

      // Check if 2FA is required (admin users)
      if (data.requires_2fa) {
        console.log("[v0] 2FA required, showing 2FA form")
        setTempToken(data.temp_token)
        setPhoneNumber(data.phone_number)
        setShow2FA(true)
        setLoading(false)
        return
      }

      // Non-admin login - store token and user data
      console.log("[v0] Storing authentication data in localStorage")
      localStorage.setItem("token", data.token)
      if (data.refresh_token) {
        localStorage.setItem("refresh_token", data.refresh_token)
      }
      localStorage.setItem("user", JSON.stringify(data.user))
      console.log("[v0] ✅ Token and user data stored")

      // Update AuthContext
      setUser(data.user)

      const targetDashboard = data.user.is_admin
        ? "/dashboard/admin"
        : data.user.role === "homeowner"
          ? "/dashboard/homeowner"
          : "/dashboard/contractor"

      console.log("[v0] ========== LOGIN ATTEMPT TRACKING END ==========")
      console.log("[v0] SUMMARY:")
      console.log("[v0] - Login successful: YES")
      console.log("[v0] - User ID:", data.user?.id)
      console.log("[v0] - Email:", email)
      console.log("[v0] - Redirecting to:", targetDashboard)
      console.log("[v0] ===================================================")

      router.replace(targetDashboard)
    } catch (err: any) {
      console.error("[v0] ❌ LOGIN ERROR CAUGHT")
      console.error("[v0] Error message:", err.message)
      console.error("[v0] Error type:", err.name)

      if (accountCreatedAt && accountEmail === email) {
        if (err.message.includes("Account locked") || err.message.includes("Try again in")) {
          console.log("[v0] ⚠️ RATE LIMIT: Account exists but is temporarily locked")
          console.log("[v0] Account created at:", accountCreatedAt)
          console.log("[v0] Account user ID:", accountUserId)
          console.log("[v0] This is NOT account deletion - just rate limiting")
        } else {
          console.error("[v0] 🚨 CRITICAL ERROR: Recently created account cannot log in!")
          console.error("[v0] Account created at:", accountCreatedAt)
          console.error("[v0] Account user ID:", accountUserId)
          console.error("[v0] This is the recurring account deletion bug!")
        }
      }

      console.log("[v0] ========== LOGIN ATTEMPT TRACKING END ==========")

      let errorMessage = err.message || "Invalid email or password. Please try again."

      if (errorMessage.includes("Account locked") || errorMessage.includes("Try again in")) {
        // Extract the time from the error message
        const timeMatch = errorMessage.match(/(\d+)\s+minute/)
        const minutes = timeMatch ? timeMatch[1] : "a few"

        errorMessage = `Your account is temporarily locked due to multiple failed login attempts. Please wait ${minutes} minutes and try again. Your account is safe and has not been deleted.`
      } else if (errorMessage.includes("Too many login attempts")) {
        errorMessage =
          "Too many failed login attempts. Please wait 15 minutes before trying again. Your account is safe and has not been deleted."
      } else if (errorMessage.includes("Invalid credentials")) {
        errorMessage = "Invalid email or password. If you don't have an account yet, please sign up below."
      }

      setError(errorMessage)
      setLoading(false)
    }
  }

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("https://api.bidrr.ca/api/auth/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          temp_token: tempToken,
          code: twoFactorCode,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Invalid 2FA code")
      }

      localStorage.setItem("token", data.token)
      if (data.refresh_token) {
        localStorage.setItem("refresh_token", data.refresh_token)
      }
      localStorage.setItem("user", JSON.stringify(data.user))

      setUser(data.user)
      setLoading(false)
    } catch (err: any) {
      setError(err.message || "Invalid 2FA code. Please try again.")
      setLoading(false)
    }
  }

  const handleResend2FA = async () => {
    setError("")
    setLoading(true)

    try {
      const response = await fetch("https://api.bidrr.ca/api/auth/resend-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ temp_token: tempToken }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to resend code")
      }

      setError("")
      alert("A new code has been sent to your phone")
    } catch (err: any) {
      setError(err.message || "Failed to resend code. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      <div
        className="fixed inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: "url('/living-room-background.jpg')" }}
      />
      <div className="fixed inset-0 bg-[#0d3d42]/95 z-0" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="border-b border-[#d8e2fb]/20 bg-[#0D3D42]/95 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="flex items-center justify-between h-20">
              <Link href="/" className="flex items-center">
                <Image
                  src="/images/logo-white.png"
                  alt="HomeHero"
                  width={160}
                  height={40}
                  className="h-8 md:h-10 w-auto"
                />
              </Link>
              <Link
                href="/"
                className="text-sm font-medium text-[#d8e2fb] hover:text-white transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              {!show2FA ? (
                <>
                  <h1 className="text-3xl font-bold text-center mb-2 text-[#03353a]">Welcome back</h1>
                  <p className="text-center text-gray-600 mb-8">Sign in to your HomeHero account</p>

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e2bb12] focus:border-transparent outline-none transition-all"
                        placeholder="you@example.com"
                      />
                    </div>

                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          minLength={6}
                          className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e2bb12] focus:border-transparent outline-none transition-all"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                          aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                          {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="remember"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 text-[#e2bb12] border-gray-300 rounded focus:ring-2 focus:ring-[#e2bb12]"
                      />
                      <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                        Remember me
                      </label>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full px-6 py-3 bg-[#e2bb12] text-[#03353a] rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                      {loading ? "Signing in..." : "Sign In"}
                    </button>
                  </form>

                  <div className="mt-4 text-center">
                    <Link href="/forgot-password" className="text-sm text-[#328d87] font-medium hover:underline">
                      Forgot your password?
                    </Link>
                  </div>

                  <p className="mt-6 text-center text-sm text-gray-600">
                    Don't have an account?{" "}
                    <Link href="/signup" className="text-[#328d87] font-medium hover:underline">
                      Sign up
                    </Link>
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-[#e2bb12]/10 p-3 rounded-full">
                      <Shield className="h-8 w-8 text-[#e2bb12]" />
                    </div>
                  </div>
                  <h1 className="text-3xl font-bold text-center mb-2 text-[#03353a]">Two-Factor Authentication</h1>
                  <p className="text-center text-gray-600 mb-8">
                    Enter the 6-digit code sent to{" "}
                    {phoneNumber?.replace(/(\d{2})(\d{3})(\d{3})(\d{4})/, "+$1 ($2) $3-$4")}
                  </p>

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handle2FASubmit} className="space-y-4">
                    <div>
                      <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                        Verification Code
                      </label>
                      <input
                        id="code"
                        type="text"
                        value={twoFactorCode}
                        onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        required
                        maxLength={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e2bb12] focus:border-transparent outline-none transition-all text-center text-2xl tracking-widest font-mono"
                        placeholder="000000"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading || twoFactorCode.length !== 6}
                      className="w-full px-6 py-3 bg-[#e2bb12] text-[#03353a] rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                      {loading ? "Verifying..." : "Verify Code"}
                    </button>
                  </form>

                  <div className="mt-6 text-center">
                    <button
                      onClick={handleResend2FA}
                      disabled={loading}
                      className="text-sm text-[#328d87] font-medium hover:underline disabled:opacity-50"
                    >
                      Didn't receive a code? Resend
                    </button>
                  </div>

                  <div className="mt-4 text-center">
                    <button
                      onClick={() => {
                        setShow2FA(false)
                        setTwoFactorCode("")
                        setTempToken("")
                        setError("")
                      }}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      ← Back to login
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
