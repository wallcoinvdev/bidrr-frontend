"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, BadgeCheck, AlertCircle, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useOnboarding } from "@/contexts/onboarding-context"
import { apiClient } from "@/lib/api-client"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.bidrr.ca"

export default function ContractorPhoneVerification() {
  const router = useRouter()
  const { data, updateData } = useOnboarding()

  const [countryCode, setCountryCode] = useState(data.countryCode || "+1-CA")
  const [phoneNumber, setPhoneNumber] = useState(data.phone?.replace(/^\+1/, "") || "")
  const [verificationCode, setVerificationCode] = useState("")
  const [step, setStep] = useState<"phone" | "code">("phone")
  const [isLoading, setIsLoading] = useState(false)
  const [isSkipping, setIsSkipping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentOrigin, setCurrentOrigin] = useState<string>("")
  const [showTermsModal, setShowTermsModal] = useState(false)

  useEffect(() => {
    console.log("[v0] ========== CONTRACTOR VERIFICATION PAGE LOADED ==========")
    console.log("[v0] Page URL:", typeof window !== "undefined" ? window.location.href : "SSR")
    console.log("[v0] Onboarding data present:", !!data)
    console.log("[v0] Onboarding data keys:", data ? Object.keys(data) : "no data")
    console.log("[v0] Role from onboarding:", data?.role)
    console.log("[v0] Email from onboarding:", data?.email)
    console.log("[v0] Phone from onboarding:", data?.phone)
    console.log("[v0] sessionStorage.onboarding_form_data:", !!sessionStorage.getItem("onboarding_form_data"))
    console.log("[v0] sessionStorage.terms_accepted:", sessionStorage.getItem("terms_accepted"))
    console.log("[v0] localStorage.token:", typeof window !== "undefined" ? localStorage.getItem("token") : "SSR")
    console.log("[v0] localStorage.user:", typeof window !== "undefined" ? !!localStorage.getItem("user") : "SSR")
    console.log("[v0] Timestamp:", new Date().toISOString())
    console.log("[v0] =============================================================")
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

      console.log("[v0] === CONTRACTOR PHONE VERIFICATION ===")
      console.log("[v0] Sending verification code to:", fullPhoneNumber)
      console.log("[v0] Country:", country)
      console.log("[v0] Role: contractor (hardcoded)")
      console.log("[v0] Request origin:", window.location.origin)

      await apiClient.request("/api/users/request-verification", {
        method: "POST",
        body: JSON.stringify({
          phone_number: fullPhoneNumber,
          role: "contractor",
        }),
        requiresAuth: false, // This endpoint doesn't require authentication
      })

      console.log("[v0] Verification code sent successfully")

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

      console.log("[v0] Updated onboarding context with role: contractor")

      setStep("code")
    } catch (err: any) {
      console.error("[v0] Error sending code:", err)

      const errorMessage = err.message || "Failed to send verification code"

      if (errorMessage.toLowerCase().includes("invalid") && errorMessage.toLowerCase().includes("phone")) {
        setError(
          "This phone number cannot receive verification codes. Please use a different number or click 'Skip for now' to continue without verification.",
        )
      } else if (errorMessage.toLowerCase().includes("already registered")) {
        setError("PHONE_REGISTERED")
      } else if (errorMessage.toLowerCase().includes("cors")) {
        setError(`CORS Error: ${errorMessage}`)
      } else {
        setError(errorMessage || "Failed to send verification code. Please try again or skip verification.")
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async () => {
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

      console.log("[v0] ========== ACCOUNT CREATION TRACKING START ==========")
      console.log("[v0] Creating contractor account with phone verification")
      console.log("[v0] Email:", formData.email)
      console.log("[v0] Phone:", fullPhoneNumber)
      console.log("[v0] Role: contractor")

      const heroHeadingVariation = localStorage.getItem("hero_heading_variation") || "unknown"
      console.log("[v0] Hero heading variation for this conversion:", heroHeadingVariation)

      console.log("[v0] Step 1: Verifying phone code")
      const verifyResponse = await fetch(`${API_BASE_URL}/api/users/verify-phone`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          phone_number: fullPhoneNumber,
          code: verificationCode, // Changed from verification_code to code
        }),
      })

      if (!verifyResponse.ok) {
        const verifyError = await verifyResponse.json()
        console.error("[v0] ❌ Phone verification failed:", verifyError)
        throw new Error(verifyError.error || "Phone verification failed")
      }

      const verifyResult = await verifyResponse.json()
      console.log("[v0] ✅ Phone verified successfully")

      console.log("[v0] Step 2: Creating contractor account")
      const signupPayload: any = {
        phone_number: fullPhoneNumber,
        password: formData.password,
        role: "contractor",
        full_name: formData.full_name,
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
        hero_heading_variation: heroHeadingVariation,
      }

      const termsAccepted = sessionStorage.getItem("terms_accepted")
      const termsAcceptedAt = sessionStorage.getItem("terms_accepted_at")

      if (termsAccepted === "true" && termsAcceptedAt) {
        signupPayload.terms_accepted = true
        signupPayload.terms_accepted_at = termsAcceptedAt
      } else {
        signupPayload.terms_accepted = true
        signupPayload.terms_accepted_at = new Date().toISOString()
      }

      console.log("[v0] Full signup payload:", JSON.stringify(signupPayload, null, 2))
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
      console.log("[v0] Signup API call took:", signupEndTime - signupStartTime, "ms")
      console.log("[v0] Signup response status:", response.status, response.statusText)

      const result = await response.json()
      console.log("[v0] Signup response body:", JSON.stringify(result, null, 2))

      if (!response.ok) {
        console.error("[v0] ❌ SIGNUP FAILED")
        console.error("[v0] Status:", response.status)
        console.error("[v0] Error:", JSON.stringify(result, null, 2))
        console.error("[v0] This error will cause the account to not be created")
        console.error("[v0] User should see error message and stay on verification page")
        throw new Error(result.error || result.message || "Failed to create account")
      }

      console.log("[v0] ✅ ACCOUNT CREATED SUCCESSFULLY")
      console.log("[v0] User ID from signup:", result.user?.id || result.id || "NOT PROVIDED")
      console.log("[v0] Account created at:", new Date().toISOString())

      if (!result.token) {
        throw new Error("No authentication token received from signup")
      }

      console.log("[v0] ✅ Using token from signup response")
      console.log("[v0] Token received:", result.token ? "YES" : "NO")
      console.log("[v0] Token length:", result.token?.length || 0)

      console.log("[v0] ========== LOCALSTORAGE DEBUG START ==========")
      console.log("[v0] Before storage - localStorage.token:", localStorage.getItem("token"))
      console.log("[v0] Before storage - localStorage.user:", localStorage.getItem("user"))
      console.log("[v0] Response token:", result.token)
      console.log("[v0] Response user:", result.user)

      sessionStorage.removeItem("verification_token")
      sessionStorage.removeItem("verified_phone_number")
      sessionStorage.removeItem("phone_verified")
      sessionStorage.removeItem("pending_phone_number")
      sessionStorage.removeItem("pending_country")
      sessionStorage.removeItem("pending_role")
      sessionStorage.removeItem("terms_accepted")
      sessionStorage.removeItem("terms_accepted_at")

      localStorage.setItem("token", result.token)
      if (result.user) {
        localStorage.setItem("user", JSON.stringify(result.user))
      }

      console.log("[v0] After storage - localStorage.token:", localStorage.getItem("token"))
      console.log("[v0] After storage - localStorage.user:", localStorage.getItem("user"))
      console.log("[v0] Storage verification - tokens match:", localStorage.getItem("token") === result.token)
      console.log("[v0] ========== LOCALSTORAGE DEBUG END ==========")

      console.log("[v0] ========== PRE-REDIRECT VERIFICATION ==========")
      console.log("[v0] About to redirect to:", result.user?.is_admin ? "/dashboard/admin" : "/dashboard/contractor")
      console.log("[v0] Final localStorage check before redirect:")
      console.log("[v0] - token exists:", !!localStorage.getItem("token"))
      console.log("[v0] - user exists:", !!localStorage.getItem("user"))
      console.log("[v0] - token length:", localStorage.getItem("token")?.length || 0)
      console.log("[v0] Current timestamp:", new Date().toISOString())
      console.log("[v0] ========== STARTING REDIRECT NOW ==========")

      updateData({
        phone: fullPhoneNumber,
        countryCode: countryCode,
        country: getCountryFromCode(countryCode),
        role: "contractor",
        token: result.token,
        userId: result.user?.id,
      })

      const targetDashboard = result.user?.is_admin ? "/dashboard/admin" : "/dashboard/contractor"
      console.log("[v0] Redirecting to dashboard:", targetDashboard)
      window.location.href = targetDashboard
    } catch (err) {
      console.error("[v0] Error verifying code:", err)
      console.error("[v0] ========== VERIFICATION ERROR DETAILS ==========")
      console.error("[v0] Error type:", err instanceof Error ? err.constructor.name : typeof err)
      console.error("[v0] Error message:", err instanceof Error ? err.message : String(err))
      console.error("[v0] Current localStorage state:")
      console.error("[v0] - token:", localStorage.getItem("token") ? "exists" : "null")
      console.error("[v0] - user:", localStorage.getItem("user") ? "exists" : "null")
      console.error("[v0] ========== ERROR DETAILS END ==========")
      setError(err instanceof Error ? err.message : "Invalid verification code.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = async () => {
    console.log("[v0] Skipping phone verification")
    setIsSkipping(true)
    setError(null)

    try {
      const savedFormData = sessionStorage.getItem("onboarding_form_data")
      if (!savedFormData) {
        throw new Error("Form data not found. Please complete the personal information form first.")
      }

      const formData = JSON.parse(savedFormData)

      console.log("[v0] ========== ACCOUNT CREATION TRACKING START (SKIP) ==========")
      console.log("[v0] Creating contractor account without phone verification")
      console.log("[v0] Email:", formData.email)
      console.log("[v0] Phone:", formData.phone_number)
      console.log("[v0] Role: contractor")

      const heroHeadingVariation = localStorage.getItem("hero_heading_variation") || "unknown"
      console.log("[v0] Hero heading variation for this conversion (skip):", heroHeadingVariation)

      const signupPayload: any = {
        phone_number: formData.phone_number,
        verification_code: "",
        password: formData.password,
        role: "contractor",
        full_name: formData.full_name,
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
      console.log("[v0] Signup API call took:", signupEndTime - signupStartTime, "ms")
      console.log("[v0] Signup response status:", response.status, response.statusText)

      const result = await response.json()
      console.log("[v0] Signup response body:", JSON.stringify(result, null, 2))

      if (!response.ok) {
        console.error("[v0] ❌ SIGNUP FAILED (SKIP)")
        console.error("[v0] Status:", response.status)
        console.error("[v0] Error:", JSON.stringify(result, null, 2))
        throw new Error(result.error || result.message || "Failed to create account")
      }

      console.log("[v0] ✅ ACCOUNT CREATED SUCCESSFULLY (SKIP)")
      console.log("[v0] User ID from signup:", result.user?.id || result.id || "NOT PROVIDED")
      console.log("[v0] Account created at:", new Date().toISOString())

      if (!result.token) {
        throw new Error("No authentication token received from signup")
      }

      console.log("[v0] ✅ Using token from signup response (NO SEPARATE LOGIN)")
      console.log("[v0] Token received:", result.token ? "YES" : "NO")
      console.log("[v0] Token length:", result.token?.length || 0)

      console.log("[v0] ========== LOCALSTORAGE DEBUG START (SKIP) ==========")
      console.log("[v0] Before storage - localStorage.token:", localStorage.getItem("token"))
      console.log("[v0] Before storage - localStorage.user:", localStorage.getItem("user"))
      console.log("[v0] Response token:", result.token)
      console.log("[v0] Response user:", result.user)

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

      localStorage.setItem("token", result.token)
      console.log("[v0] ✅ Token stored")
      console.log("[v0] Token preview:", result.token.substring(0, 20) + "...")

      if (result.user) {
        localStorage.setItem("user", JSON.stringify(result.user))
        console.log("[v0] ✅ User stored")
        console.log("[v0] User data:", JSON.stringify(result.user, null, 2))
      }

      console.log("[v0] After storage - localStorage.token:", localStorage.getItem("token"))
      console.log("[v0] After storage - localStorage.user:", localStorage.getItem("user"))
      console.log("[v0] Storage verification - tokens match:", localStorage.getItem("token") === result.token)
      console.log("[v0] ========== LOCALSTORAGE DEBUG END (SKIP) ==========")

      updateData({
        token: result.token,
        userId: result.user?.id,
      })

      const targetDashboard = result.user?.is_admin ? "/dashboard/admin" : "/dashboard/contractor"
      console.log("[v0] Redirecting to dashboard:", targetDashboard)
      console.log("[v0] ========== ACCOUNT CREATION TRACKING END (SKIP) ==========")
      window.location.href = targetDashboard
    } catch (err) {
      console.error("[v0] Error during skip:", err)
      setError(err instanceof Error ? err.message : "Failed to create account. Please try again.")
      setIsSkipping(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      <div
        className="fixed inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: "url('/living-room-background.jpg')" }}
      />
      <div className="fixed inset-0 bg-[#0d3d42]/95 z-0" />

      {showTermsModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-900">Terms of Service</h2>
              <button
                onClick={() => setShowTermsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="h-6 w-6 text-gray-600" />
              </button>
            </div>
            <div className="overflow-y-auto p-6 flex-1">
              <p className="text-gray-600 mb-8">Last updated: January 2025</p>

              <div className="prose prose-lg max-w-none">
                <section className="mb-12">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Agreement to Terms</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Welcome to Bidrr. By accessing or using our platform, you agree to be bound by these Terms of
                    Service and all applicable laws and regulations. If you do not agree with any of these terms, you
                    are prohibited from using this platform.
                  </p>
                </section>

                <section className="mb-12">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Platform Description</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Bidrr is an online marketplace that connects customers seeking home services with qualified service
                    professionals (contractors). We provide the platform for these connections but are not a party to
                    the actual service agreements between customers and contractors.
                  </p>
                </section>

                <section className="mb-12">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">User Accounts</h3>
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">Account Creation</h4>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    To use Bidrr, you must create an account and provide accurate, complete information. You are
                    responsible for:
                  </p>
                  <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                    <li>Maintaining the confidentiality of your account credentials</li>
                    <li>All activities that occur under your account</li>
                    <li>Notifying us immediately of any unauthorized access</li>
                    <li>Ensuring your account information remains accurate and up-to-date</li>
                  </ul>

                  <h4 className="text-xl font-semibold text-gray-900 mb-3">Account Types</h4>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    <strong>Customer Accounts:</strong> For individuals seeking home services
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    <strong>Contractor Accounts:</strong> For professionals offering home services
                  </p>
                </section>

                <section className="mb-12">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">User Responsibilities</h3>
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">Customer Responsibilities</h4>
                  <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                    <li>Provide accurate project descriptions and requirements</li>
                    <li>Respond to contractor inquiries in a timely manner</li>
                    <li>Pay for services as agreed upon with contractors</li>
                    <li>Provide honest reviews and feedback</li>
                    <li>Comply with all applicable local laws and regulations</li>
                  </ul>

                  <h4 className="text-xl font-semibold text-gray-900 mb-3">Contractor Responsibilities</h4>
                  <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                    <li>Provide valid licenses, insurance, and certifications upon customer request</li>
                    <li>Provide accurate service descriptions and pricing</li>
                    <li>Complete work professionally and as agreed</li>
                    <li>Respond to customer inquiries promptly</li>
                    <li>Comply with all applicable laws, regulations, and safety standards</li>
                  </ul>
                </section>

                <section className="mb-12">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Payments and Fees</h3>
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">Platform Fees</h4>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    <strong>Customers:</strong> Posting jobs is free. No platform fees for customers.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    <strong>Contractors:</strong> During our beta period, contractors receive 5 free bids per month.
                    After beta, a Pro subscription ($99/month) will include 5 bids per month with refunds for unused
                    bids when jobs are not secured. A free tier (1 bid per month) will also be available.
                  </p>
                </section>

                <section className="mb-12">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Prohibited Activities</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">You may not:</p>
                  <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
                    <li>Provide false or misleading information</li>
                    <li>Impersonate another person or entity</li>
                    <li>Engage in fraudulent activities</li>
                    <li>Harass, abuse, or harm other users</li>
                    <li>Circumvent platform fees by conducting transactions off-platform</li>
                    <li>Share email addresses or phone numbers through the platform messaging system</li>
                    <li>Use automated systems to access the platform</li>
                    <li>Violate any applicable laws or regulations</li>
                    <li>Post spam, malware, or malicious content</li>
                  </ul>
                </section>

                <section className="mb-12">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    If you have questions about these Terms of Service, please contact us:
                  </p>
                  <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                    <p className="text-gray-700">
                      <strong>Email:</strong> support@bidrr.ca
                    </p>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="border-b border-[#d8e2fb]/20 bg-[#0D3D42]/95 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="flex items-center justify-between h-20">
              <Link href="/" className="flex items-center">
                <Image src="/images/bidrr-white-logo.png" alt="Bidrr" width={140} height={35} className="h-8 w-auto" />
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
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-[#e2bb12]/10 rounded-full flex items-center justify-center">
                  <BadgeCheck className="h-10 w-10 text-[#e2bb12]" />
                </div>
              </div>

              <h1 className="text-3xl font-bold text-center mb-2 text-[#03353a]">
                {step === "phone" ? "Get Verified" : "Enter Verification Code"}
              </h1>
              <p className="text-center text-gray-600 mb-2">
                {step === "phone" ? "Stand out to potential customers" : "Enter the 6-digit code we sent to your phone"}
              </p>
              {step === "phone" && (
                <p className="text-center text-sm text-[#e2bb12] font-medium mb-8">
                  Verified contractors receive 5x more job inquiries
                </p>
              )}

              {error === "PHONE_REGISTERED" && (
                <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-blue-900 mb-2">Phone Number Already Registered</p>
                      <p className="text-sm text-blue-800 mb-3">
                        This phone number is already associated with an account. If this is your account, please log in
                        instead.
                      </p>
                      <Link
                        href="/login"
                        className="inline-block px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                      >
                        Go to Login
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {error && error !== "PHONE_REGISTERED" && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 text-center">{error}</p>
                </div>
              )}

              {step === "phone" ? (
                <form onSubmit={handleSendCode} className="space-y-4">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="w-20 sm:w-28 px-1 sm:px-2 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e2bb12] focus:border-transparent outline-none transition-all bg-white text-sm cursor-pointer"
                      >
                        <option value="+1-CA">🇨🇦 +1</option>
                      </select>
                      <input
                        type="tel"
                        id="phone"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                        placeholder="5551234567"
                        maxLength={10}
                        className="flex-1 min-w-0 px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e2bb12] focus:border-transparent outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-6 py-3 bg-[#e2bb12] text-[#03353a] rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Sending Code..." : "Send Verification Code"}
                  </button>

                  <button
                    type="button"
                    onClick={handleSkip}
                    disabled={isSkipping}
                    className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSkipping ? "Loading..." : "Skip for now"}
                  </button>

                  <p className="text-center text-sm text-gray-600 mt-4">
                    Have an account already?{" "}
                    <Link href="/login" className="text-[#328d87] hover:underline font-medium">
                      Log in
                    </Link>
                  </p>
                </form>
              ) : (
                <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
                  <div>
                    <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      id="code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                      placeholder="123456"
                      maxLength={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e2bb12] focus:border-transparent outline-none transition-all text-center text-2xl tracking-widest"
                      required
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleVerifyCode}
                    disabled={isLoading}
                    className="w-full px-6 py-3 bg-[#e2bb12] text-[#03353a] rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Verifying..." : "Verify & Continue"}
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
                    className="w-full px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSkipping ? "Loading..." : "Skip for now"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
