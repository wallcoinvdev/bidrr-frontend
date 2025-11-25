"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, BadgeCheck, AlertCircle, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useOnboarding } from "@/contexts/onboarding-context"
import { apiClient } from "@/lib/api-client"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.bidrr.ca"

export default function HomeownerPhoneVerification() {
  const router = useRouter()
  const { data, updateData } = useOnboarding()

  const getInitialPhoneNumber = () => {
    // First try to get from onboarding context
    if (data.phone) {
      return data.phone.replace(/^\+1/, "")
    }

    // Only access sessionStorage on client side
    if (typeof window !== "undefined") {
      const savedFormData = sessionStorage.getItem("onboarding_form_data")
      if (savedFormData) {
        try {
          const formData = JSON.parse(savedFormData)
          if (formData.phone_number) {
            return formData.phone_number.replace(/^\+1/, "")
          }
        } catch (e) {
          console.error("[v0] Error parsing form data:", e)
        }
      }
    }

    return ""
  }

  const [countryCode, setCountryCode] = useState(data.countryCode || "+1-CA")
  const [phoneNumber, setPhoneNumber] = useState(getInitialPhoneNumber())
  const [verificationCode, setVerificationCode] = useState("")
  const [step, setStep] = useState<"phone" | "code">("phone")
  const [isLoading, setIsLoading] = useState(false)
  const [isSkipping, setIsSkipping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentOrigin, setCurrentOrigin] = useState<string>("")
  const [showTermsModal, setShowTermsModal] = useState(false)

  const codeInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    console.log("[v0] ========== HOMEOWNER VERIFICATION PAGE LOADED ==========")
    console.log("[v0] Timestamp:", new Date().toISOString())
    console.log("[v0] User Role: HOMEOWNER")
    console.log("[v0] Current URL:", typeof window !== "undefined" ? window.location.href : "N/A")

    if (typeof window !== "undefined") {
      setCurrentOrigin(window.location.origin)
      const existingToken = localStorage.getItem("token")
      const existingUser = localStorage.getItem("user")

      console.log("[v0] localStorage state on page load:")
      console.log("[v0] - Token exists:", existingToken ? "YES" : "NO")
      console.log("[v0] - User exists:", existingUser ? "YES" : "NO")

      if (existingToken) {
        console.log("[v0] ⚠️ WARNING: User already has token, why are they on verification page?")
        console.log("[v0] Token preview:", existingToken.substring(0, 20) + "...")
      }
    }

    const formData = sessionStorage.getItem("onboarding_form_data")
    console.log("[v0] Onboarding form data in sessionStorage:", formData ? "YES" : "NO")
    if (formData) {
      try {
        const parsed = JSON.parse(formData)
        console.log("[v0] Form data email:", parsed.email || "NOT PROVIDED")
        console.log("[v0] Form data phone:", parsed.phone_number || "NOT PROVIDED")
        console.log("[v0] Form data role:", parsed.role || "NOT PROVIDED")
      } catch (e) {
        console.error("[v0] Error parsing form data:", e)
      }
    } else {
      console.log("[v0] ⚠️ WARNING: No onboarding form data found - user may have skipped onboarding")
    }

    console.log("[v0] ============================================================")
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentOrigin(window.location.origin)
    }
  }, [])

  const getCountryCodeOnly = (fullCode: string) => {
    return fullCode.split("-")[0]
  }

  const getCountryFromCode = (fullCode: string): string => {
    const country = fullCode.split("-")[1]
    return country || "CA"
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const actualCountryCode = getCountryCodeOnly(countryCode)
      const fullPhoneNumber = `${actualCountryCode}${phoneNumber}`
      const country = getCountryFromCode(countryCode)

      if (phoneNumber.length < 10) {
        setError("Please enter a valid 10-digit phone number")
        setIsLoading(false)
        return
      }

      const savedFormData = sessionStorage.getItem("onboarding_form_data")
      const formData = savedFormData ? JSON.parse(savedFormData) : {}

      console.log("[v0] ========== HOMEOWNER: REQUESTING VERIFICATION CODE ==========")
      console.log("[v0] Phone number:", fullPhoneNumber)
      console.log("[v0] Email:", formData.email || "N/A")
      console.log("[v0] Role: homeowner")
      console.log("[v0] Timestamp:", new Date().toISOString())

      const response = await apiClient.post(
        "/api/users/request-verification",
        {
          phone_number: fullPhoneNumber,
          role: "homeowner",
          email: formData.email, // Include email as backend expects it
        },
        { requiresAuth: false },
      )

      console.log("[v0] ✅ Verification code sent successfully")
      console.log("[v0] Response:", response)

      sessionStorage.setItem("pending_phone_number", fullPhoneNumber)
      sessionStorage.setItem("pending_country", country)

      updateData({
        phone: fullPhoneNumber,
        countryCode: countryCode,
        country: country,
        role: "homeowner",
        address: "",
        city: "",
        region: "",
        province: "",
        postalCode: "",
      })

      setStep("code")
    } catch (err: any) {
      console.error("[v0] ❌ Error sending verification code:", err)
      console.error("[v0] Error details:", {
        message: err.message,
        stack: err.stack,
        timestamp: new Date().toISOString(),
      })

      if (err.message?.toLowerCase().includes("already registered")) {
        setError("PHONE_REGISTERED")
      } else {
        setError(
          "Unable to send verification code to this number. This could be due to an invalid phone number or SMS service restrictions. Please try a different number or click 'Skip for now' to continue without verification.",
        )
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsLoading(true)
    setError(null)

    try {
      const actualCountryCode = getCountryCodeOnly(countryCode)
      const fullPhoneNumber = `${actualCountryCode}${phoneNumber}`

      const savedFormData = sessionStorage.getItem("onboarding_form_data")
      if (!savedFormData) {
        throw new Error("Form data not found. Please complete the personal information form first.")
      }

      const formData = JSON.parse(savedFormData)

      console.log("[v0] ========== HOMEOWNER: ACCOUNT CREATION WITH VERIFICATION ==========")
      console.log("[v0] Phone:", fullPhoneNumber)
      console.log("[v0] Code length:", verificationCode.length)
      console.log("[v0] Timestamp:", new Date().toISOString())

      const heroHeadingVariation = localStorage.getItem("hero_heading_variation") || null
      console.log("[v0] Hero heading variation for this conversion:", heroHeadingVariation)

      const signupPayload: any = {
        phone_number: fullPhoneNumber,
        verification_code: verificationCode, // Include code in signup
        password: formData.password,
        role: "homeowner",
        full_name: formData.full_name,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        region: formData.region,
        country: formData.country,
        postal_code: formData.postal_code,
        terms_accepted: true,
        terms_accepted_at: sessionStorage.getItem("terms_accepted_at") || new Date().toISOString(),
        hero_heading_variation: heroHeadingVariation,
      }

      console.log("[v0] Signup payload:", JSON.stringify(signupPayload, null, 2))
      console.log("[v0] Calling /api/users/signup...")

      const signupStartTime = Date.now()
      const response = await fetch(`${API_BASE_URL}/api/users/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(signupPayload),
      })

      const signupEndTime = Date.now()
      const apiCallDuration = signupEndTime - signupStartTime
      console.log("[v0] Signup API call completed in:", apiCallDuration, "ms")
      console.log("[v0] Response status:", response.status, response.statusText)

      const result = await response.json()
      console.log("[v0] Signup response:", JSON.stringify(result, null, 2))

      if (!response.ok) {
        console.error("[v0] ❌ HOMEOWNER SIGNUP FAILED")
        console.error("[v0] Status:", response.status)
        console.error("[v0] Error:", result)
        throw new Error(result.error || result.message || "Failed to create account")
      }

      console.log("[v0] ✅ HOMEOWNER ACCOUNT CREATED SUCCESSFULLY")
      console.log("[v0] User ID:", result.user?.id || result.id || "NOT PROVIDED")
      console.log("[v0] Email:", formData.email)
      console.log("[v0] Role: homeowner")
      console.log("[v0] Created at:", new Date().toISOString())

      if (!result.token) {
        console.error("[v0] ❌ CRITICAL: No token received from signup")
        throw new Error("No authentication token received from signup")
      }

      console.log("[v0] ✅ Token received from signup")

      sessionStorage.setItem("account_created_at", new Date().toISOString())
      sessionStorage.setItem("account_user_id", result.user?.id || result.id || "unknown")
      sessionStorage.setItem("account_email", formData.email)
      sessionStorage.setItem("account_role", "homeowner")

      // Clear session storage
      sessionStorage.removeItem("onboarding_form_data")
      sessionStorage.removeItem("verification_code")
      sessionStorage.removeItem("verification_token")
      sessionStorage.removeItem("verified_phone_number")
      sessionStorage.removeItem("phone_verified")
      sessionStorage.removeItem("pending_phone_number")
      sessionStorage.removeItem("pending_country")
      sessionStorage.removeItem("pending_role")
      sessionStorage.removeItem("terms_accepted")
      sessionStorage.removeItem("terms_accepted_at")

      // Store auth data
      localStorage.setItem("token", result.token)
      if (result.user) {
        localStorage.setItem("user", JSON.stringify(result.user))
      }

      updateData({
        phone: fullPhoneNumber,
        countryCode: countryCode,
        country: getCountryFromCode(countryCode),
        role: "homeowner",
        token: result.token,
        userId: result.user?.id,
      })

      const targetDashboard = result.user?.is_admin ? "/dashboard/admin" : "/dashboard/homeowner"
      console.log("[v0] Redirecting to:", targetDashboard)
      console.log("[v0] ========== HOMEOWNER VERIFICATION COMPLETE ==========")

      window.location.href = targetDashboard
    } catch (err) {
      console.error("[v0] ❌ Error during homeowner verification:", err)
      console.error("[v0] Error details:", {
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        timestamp: new Date().toISOString(),
      })
      setError(err instanceof Error ? err.message : "Invalid verification code.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = async () => {
    console.log("[v0] ========== HOMEOWNER: SKIP VERIFICATION ==========")
    setIsSkipping(true)
    setError(null)

    try {
      const savedFormData = sessionStorage.getItem("onboarding_form_data")
      if (!savedFormData) {
        throw new Error("Form data not found. Please complete the personal information form first.")
      }

      const formData = JSON.parse(savedFormData)

      const heroHeadingVariation = localStorage.getItem("hero_heading_variation") || null

      const signupPayload: any = {
        phone_number: formData.phone_number,
        password: formData.password,
        role: "homeowner",
        full_name: formData.full_name,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        region: formData.region,
        country: formData.country,
        postal_code: formData.postal_code,
        terms_accepted: true,
        terms_accepted_at: new Date().toISOString(),
        hero_heading_variation: heroHeadingVariation,
      }

      const response = await fetch(`${API_BASE_URL}/api/users/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(signupPayload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || result.message || "Failed to create account")
      }

      if (!result.token) {
        throw new Error("No authentication token received from signup")
      }

      // Store auth data
      localStorage.setItem("token", result.token)
      if (result.user) {
        localStorage.setItem("user", JSON.stringify(result.user))
      }

      // Clear session storage
      sessionStorage.removeItem("onboarding_form_data")

      updateData({
        token: result.token,
        userId: result.user?.id,
      })

      const targetDashboard = result.user?.is_admin ? "/dashboard/admin" : "/dashboard/homeowner"
      window.location.href = targetDashboard
    } catch (err) {
      console.error("[v0] ❌ Error during homeowner skip:", err)
      setError(err instanceof Error ? err.message : "Failed to create account. Please try again.")
      setIsSkipping(false)
    }
  }

  useEffect(() => {
    if (verificationCode.length === 6 && step === "code") {
      const timer = setTimeout(() => {
        handleVerifyCode(new Event("submit") as any)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [verificationCode])

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0">
        <img src="/living-room-background.jpg" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#03353a]/95 via-[#0d3d42]/90 to-[#328d87]/85" />
      </div>

      {showTermsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold">Terms of Service</h2>
              <button
                onClick={() => setShowTermsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-6 space-y-4">{/* Terms content */}</div>
          </div>
        </div>
      )}

      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center text-sm text-white hover:text-[#e2bb12] transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="max-w-lg mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-[#d8e2fb] rounded-full flex items-center justify-center">
                <BadgeCheck className="w-8 h-8 text-[#03353a]" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
              {step === "phone" ? "Get Verified" : "Enter Verification Code"}
            </h1>
            <p className="text-center text-gray-600 mb-2">
              {step === "phone"
                ? "Boost your credibility on the platform"
                : "Enter the 6-digit code we sent to your phone"}
            </p>
            {step === "phone" && (
              <p className="text-center text-[#03353a] font-medium mb-6">
                Verified users receive 3x more responses from contractors
              </p>
            )}

            {error === "PHONE_REGISTERED" && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-amber-900 mb-1">Phone Number Already Registered</h3>
                    <p className="text-sm text-amber-800 mb-3">
                      This phone number is already associated with an account. If this is your account, please log in
                      instead.
                    </p>
                    <Link
                      href="/login"
                      className="inline-block px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
                    >
                      Go to Login
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {error && error !== "PHONE_REGISTERED" && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
            )}

            {step === "phone" ? (
              <form onSubmit={handleSendCode} className="space-y-6">
                <div>
                  <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-20 sm:w-24 px-2 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03353a] focus:border-[#03353a]/100 bg-white text-sm"
                    >
                      <option value="+1-CA">🇨🇦 +1</option>
                    </select>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      id="phoneNumber"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                      className="flex-1 min-w-0 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03353a] focus:border-[#03353a]/100"
                      placeholder="Enter phone"
                      maxLength={10}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#03353a] text-white py-3 px-4 rounded-lg hover:bg-[#02292d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isLoading ? "Processing..." : "Send Verification Code"}
                </button>

                <button
                  type="button"
                  onClick={handleSkip}
                  disabled={isLoading || isSkipping}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isSkipping ? "Processing..." : "Skip Verification"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode} className="space-y-6">
                <div>
                  <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-2">
                    Verification Code
                  </label>
                  <input
                    ref={codeInputRef}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    id="verificationCode"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03353a] focus:border-[#03353a]/100 text-center text-2xl tracking-widest"
                    placeholder="000000"
                    maxLength={6}
                  />
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Code will auto-submit when all 6 digits are entered
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#03353a] text-white py-3 px-4 rounded-lg hover:bg-[#02292d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isLoading ? "Processing..." : "Verify Code"}
                </button>

                <button
                  type="button"
                  onClick={handleSkip}
                  disabled={isLoading || isSkipping}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isSkipping ? "Processing..." : "Skip Verification"}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
