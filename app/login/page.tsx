"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useAuth } from "@/lib/auth-context"
import { AlertCircle, Loader2, ArrowLeft, Shield } from "lucide-react"

const GOOGLE_OAUTH_URL = "https://api.bidrr.ca/api/users/google"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
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
    setError("")
    setLoading(true)

    try {
      const response = await fetch("https://api.bidrr.ca/api/users/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, remember_me: rememberMe }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Login failed")
      }

      if (data.requires_2fa) {
        setShow2FA(true)
        setTempToken(data.temp_token)
        setPhoneNumber(data.phone_number)
        setLoading(false)
        return
      }

      localStorage.setItem("token", data.token)
      if (data.refresh_token) {
        localStorage.setItem("refresh_token", data.refresh_token)
      }
      localStorage.setItem("user", JSON.stringify(data.user))

      const targetDashboard = data.user.is_admin
        ? "/dashboard/admin"
        : data.user.role === "homeowner"
          ? "/dashboard/homeowner"
          : "/dashboard/contractor"

      router.replace(targetDashboard)
    } catch (err: any) {
      let errorMessage = err.message || "Invalid email or password. Please try again."

      if (errorMessage.includes("Too many login attempts")) {
        errorMessage =
          "Too many login attempts detected. Please wait 15 minutes before trying again. Note: This security feature currently blocks all attempts, even with correct credentials. We're working on improving this."
      }

      setError(errorMessage)
    } finally {
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
                      <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e2bb12] focus:border-transparent outline-none transition-all"
                        placeholder="••••••••"
                      />
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
