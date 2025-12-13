"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, BadgeCheck, AlertCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { useOnboarding } from "@/contexts/onboarding-context"
import { apiClient } from "@/lib/api-client"
import { trackEvent } from "@/lib/analytics"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.bidrr.ca"

export default function ContractorPhoneVerification() {
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
          console.error("Error parsing form data:", e)
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
    trackEvent("phone_verification_started", { role: "contractor" })

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

    trackEvent("verification_code_requested", { role: "contractor" })

    try {
      const actualCountryCode = getCountryCodeOnly(countryCode)
      const fullPhoneNumber = `${actualCountryCode}${phoneNumber}`
      const country = getCountryFromCode(countryCode)

      if (phoneNumber.length < 10) {
        setError("Please enter a valid 10-digit phone number")
        trackEvent("verification_code_failed", { role: "contractor", error: "invalid_phone_length" })
        setIsLoading(false)
        return
      }

      const savedFormData = sessionStorage.getItem("onboarding_form_data")
      const formData = savedFormData ? JSON.parse(savedFormData) : {}

      await apiClient.post(
        "/api/users/request-verification",
        {
          phone_number: fullPhoneNumber,
          role: "contractor",
          email: formData.email,
        },
        { requiresAuth: false },
      )

      sessionStorage.setItem("pending_phone_number", fullPhoneNumber)
      sessionStorage.setItem("pending_country", country)
      sessionStorage.setItem("pending_role", "contractor")

      updateData({
        phone: fullPhoneNumber,
        countryCode: countryCode,
        country: country,
        role: "contractor",
        address: "",
        city: "",
        region: "",
        province: "",
        postalCode: "",
      })

      trackEvent("verification_code_sent", { role: "contractor" })
      setStep("code")
    } catch (err: any) {
      console.error("Error sending code:", err)

      const errorMessage = err.message || "Failed to send verification code"

      if (errorMessage.toLowerCase().includes("already registered")) {
        setError("PHONE_REGISTERED")
        trackEvent("verification_code_failed", { role: "contractor", error: "phone_already_registered" })
      } else {
        setError(errorMessage || "Failed to send verification code. Please try again or skip verification.")
        trackEvent("verification_code_failed", { role: "contractor", error: "sms_send_failed" })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    trackEvent("verification_code_entered", { role: "contractor" })

    try {
      const actualCountryCode = getCountryCodeOnly(countryCode)
      const fullPhoneNumber = `${actualCountryCode}${phoneNumber}`

      const savedFormData = sessionStorage.getItem("onboarding_form_data")
      if (!savedFormData) {
        throw new Error("Form data not found. Please complete the personal information form first.")
      }

      const formData = JSON.parse(savedFormData)
      console.log("[v0] FormData from sessionStorage:", formData)

      const heroHeadingVariation = localStorage.getItem("hero_heading_variation") || null

      const tempEmail = formData.temp_email || null
      console.log("[v0] Temp email extracted:", tempEmail)

      const signupPayload: any = {
        phone_number: fullPhoneNumber,
        verification_code: verificationCode,
        password: formData.password,
        role: "contractor",
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        region: formData.region,
        country: formData.country,
        postal_code: formData.postal_code,
        company_name: formData.company_name,
        company_size: formData.company_size,
        business_address: formData.business_address,
        business_city: formData.business_city,
        business_region: formData.business_region,
        business_country: formData.business_country,
        business_postal_code: formData.business_postal_code,
        radius_km: formData.radius_km,
        services: formData.services,
        terms_accepted: true,
        terms_accepted_at: sessionStorage.getItem("terms_accepted_at") || new Date().toISOString(),
        hero_heading_variation: heroHeadingVariation,
        temp_email: tempEmail, // Include temp_email in signup payload
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

      trackEvent("verification_success", { role: "contractor" })

      trackEvent("signup_complete", { role: "contractor", verification_status: "verified" })

      sessionStorage.removeItem("onboarding_form_data")
      sessionStorage.removeItem("verification_token")
      sessionStorage.removeItem("verified_phone_number")
      sessionStorage.removeItem("phone_verified")
      sessionStorage.removeItem("pending_phone_number")
      sessionStorage.removeItem("pending_country")
      sessionStorage.removeItem("pending_role")
      sessionStorage.removeItem("terms_accepted")
      sessionStorage.removeItem("terms_accepted_at")

      localStorage.setItem("auth_token", result.token)
      if (result.user) {
        localStorage.setItem("user", JSON.stringify(result.user))
      }

      updateData({
        phone: fullPhoneNumber,
        countryCode: countryCode,
        country: getCountryFromCode(countryCode),
        role: "contractor",
        token: result.token,
        userId: result.user?.id,
      })

      const targetDashboard = result.user?.is_admin ? "/dashboard/admin" : "/dashboard/contractor"
      window.location.href = targetDashboard
    } catch (err) {
      console.error("Error verifying code:", err)
      trackEvent("verification_failed", { role: "contractor", error: err instanceof Error ? err.message : "unknown" })
      setError(err instanceof Error ? err.message : "Invalid verification code.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = async () => {
    setIsSkipping(true)
    setError(null)

    trackEvent("verification_skipped", { role: "contractor" })

    try {
      const savedFormData = sessionStorage.getItem("onboarding_form_data")
      if (!savedFormData) {
        throw new Error("Form data not found. Please complete the personal information form first.")
      }

      const formData = JSON.parse(savedFormData)
      console.log("[v0] FormData from sessionStorage (skip):", formData)

      const heroHeadingVariation = localStorage.getItem("hero_heading_variation") || null

      const tempEmail = formData.temp_email || null
      console.log("[v0] Temp email extracted (skip):", tempEmail)

      const signupPayload: any = {
        phone_number: formData.phone_number,
        verification_code: "",
        password: formData.password,
        role: "contractor",
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        region: formData.region,
        country: formData.country,
        postal_code: formData.postal_code,
        company_name: formData.company_name,
        company_size: formData.company_size,
        business_address: formData.business_address,
        business_city: formData.business_city,
        business_region: formData.business_region,
        business_country: formData.business_country,
        business_postal_code: formData.business_postal_code,
        radius_km: formData.radius_km,
        services: formData.services,
        terms_accepted: true,
        terms_accepted_at: new Date().toISOString(),
        hero_heading_variation: heroHeadingVariation,
        temp_email: tempEmail, // Include temp_email in skip signup payload
      }
      console.log("[v0] Signup payload being sent:", signupPayload)

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

      trackEvent("signup_complete", { role: "contractor", verification_status: "skipped" })

      sessionStorage.removeItem("onboarding_form_data")
      sessionStorage.removeItem("verification_token")
      sessionStorage.removeItem("verified_phone_number")
      sessionStorage.removeItem("phone_verified")
      sessionStorage.removeItem("pending_phone_number")
      sessionStorage.removeItem("pending_country")
      sessionStorage.removeItem("pending_role")
      sessionStorage.removeItem("terms_accepted")
      sessionStorage.removeItem("terms_accepted_at")

      localStorage.setItem("auth_token", result.token)
      if (result.user) {
        localStorage.setItem("user", JSON.stringify(result.user))
      }

      updateData({
        token: result.token,
        userId: result.user?.id,
      })

      const targetDashboard = result.user?.is_admin ? "/dashboard/admin" : "/dashboard/contractor"
      window.location.href = targetDashboard
    } catch (err) {
      console.error("Error during skip:", err)
      trackEvent("form_submission_error", { role: "contractor", error: err instanceof Error ? err.message : "unknown" })
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
              <div className="w-16 h-16 bg-[#e2bb12] rounded-full flex items-center justify-center">
                <BadgeCheck className="w-8 h-8 text-white" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-center text-[#03353a] mb-2">
              {step === "phone" ? "Get Verified" : "Enter Verification Code"}
            </h1>
            <p className="text-center text-gray-600 mb-2">
              {step === "phone" ? "Stand out to potential customers" : "Enter the 6-digit code we sent to your phone"}
            </p>
            {step === "phone" && (
              <p className="text-center text-[#e2bb12] font-medium mb-6">
                Verified contractors receive 5x more job inquiries
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
                      className="w-20 sm:w-24 px-2 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e2bb12] focus:border-transparent outline-none transition-all bg-white text-sm cursor-pointer"
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
                      placeholder="Enter phone"
                      maxLength={10}
                      className="flex-1 min-w-0 px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e2bb12] focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#e2bb12] text-white py-3 px-4 rounded-lg hover:bg-[#d4a810] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isLoading ? "Processing..." : "Send Verification Code"}
                </button>

                <button
                  type="button"
                  onClick={handleSkip}
                  disabled={isSkipping}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isSkipping ? "Processing..." : "Skip Verification"}
                </button>

                <p className="text-center text-sm text-gray-600">
                  Have an account already?{" "}
                  <Link href="/login" className="text-[#e2bb12] hover:underline font-medium">
                    Log in
                  </Link>
                </p>
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
                    placeholder="123456"
                    maxLength={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e2bb12] focus:border-transparent outline-none transition-all text-center text-2xl tracking-widest"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-2 text-center">
                    Code will auto-submit when all 6 digits are entered
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-[#e2bb12] text-white py-3 px-4 rounded-lg hover:bg-[#d4a810] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isLoading ? "Processing..." : "Verify & Continue"}
                </button>

                <button
                  type="button"
                  onClick={() => setStep("phone")}
                  className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Change phone number
                </button>

                <button
                  type="button"
                  onClick={handleSkip}
                  disabled={isSkipping}
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
