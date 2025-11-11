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

export default function HomeownerPhoneVerification() {
  const router = useRouter()
  const { data, updateData } = useOnboarding()

  const [countryCode, setCountryCode] = useState(data.countryCode || "+1-CA")
  const [phoneNumber, setPhoneNumber] = useState(data.phone?.replace(/^\+1/, "") || "")
  const [verificationCode, setVerificationCode] = useState("")
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [step, setStep] = useState<"phone" | "code">("phone")
  const [isLoading, setIsLoading] = useState(false)
  const [isSkipping, setIsSkipping] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentOrigin, setCurrentOrigin] = useState<string>("")
  const [showTermsModal, setShowTermsModal] = useState(false)

  useEffect(() => {
    console.log("[v0] ========== HOMEOWNER VERIFICATION PAGE LOADED ==========")
    console.log("[v0] Timestamp:", new Date().toISOString())
    console.log("[v0] User Role: HOMEOWNER")
    console.log("[v0] Current URL:", typeof window !== "undefined" ? window.location.href : "N/A")

    // Check localStorage state
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

    // Check sessionStorage for onboarding data
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

      console.log("[v0] ========== HOMEOWNER: REQUESTING VERIFICATION CODE ==========")
      console.log("[v0] Phone number:", fullPhoneNumber)
      console.log("[v0] Role: homeowner")
      console.log("[v0] Timestamp:", new Date().toISOString())

      const response = await apiClient.request("/api/users/request-verification", {
        method: "POST",
        body: JSON.stringify({
          phone_number: fullPhoneNumber,
          role: "homeowner",
        }),
        requiresAuth: false, // This endpoint doesn't require authentication
      })

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

    if (!acceptedTerms) {
      setError("You must accept the Terms of Service to continue")
      return
    }

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
      console.log("[v0] Step 1: Verifying phone code")
      console.log("[v0] Phone:", fullPhoneNumber)
      console.log("[v0] Code length:", verificationCode.length)
      console.log("[v0] Timestamp:", new Date().toISOString())

      const heroHeadingVariation = localStorage.getItem("hero_heading_variation") || "unknown"
      console.log("[v0] Hero heading variation for this conversion:", heroHeadingVariation)

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

      if (verifyResult.token) {
        sessionStorage.setItem("verification_token", verifyResult.token)
        console.log("[v0] Verification token stored in sessionStorage")
      }

      console.log("[v0] Step 2: Creating homeowner account")
      console.log("[v0] Email:", formData.email)
      console.log("[v0] Full name:", formData.full_name)
      console.log("[v0] Phone:", fullPhoneNumber)

      const signupPayload: any = {
        phone_number: fullPhoneNumber,
        password: formData.password,
        role: "homeowner",
        full_name: formData.full_name,
        email: formData.email,
        address: formData.address,
        city: formData.city,
        region: formData.region,
        country: formData.country,
        postal_code: formData.postal_code,
        hero_heading_variation: heroHeadingVariation,
      }

      sessionStorage.setItem("terms_accepted", "true")
      sessionStorage.setItem("terms_accepted_at", new Date().toISOString())

      signupPayload.terms_accepted = true
      signupPayload.terms_accepted_at = new Date().toISOString()

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
      console.log("[v0] Token length:", result.token.length)
      console.log("[v0] Token preview:", result.token.substring(0, 20) + "...")

      // Store account creation tracking info
      sessionStorage.setItem("account_created_at", new Date().toISOString())
      sessionStorage.setItem("account_user_id", result.user?.id || result.id || "unknown")
      sessionStorage.setItem("account_email", formData.email)
      sessionStorage.setItem("account_role", "homeowner")

      console.log("[v0] Clearing sessionStorage...")
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
      console.log("[v0] ✅ sessionStorage cleared")

      console.log("[v0] Storing authentication data in localStorage...")
      console.log("[v0] BEFORE localStorage.setItem - Token exists:", localStorage.getItem("token") ? "YES" : "NO")

      // Store auth data in localStorage
      localStorage.setItem("token", result.token)
      console.log("[v0] ✅ Token stored in localStorage")
      console.log("[v0] Token verification - reading back:", localStorage.getItem("token") ? "SUCCESS" : "FAILED")

      if (result.user) {
        localStorage.setItem("user", JSON.stringify(result.user))
        console.log("[v0] ✅ User data stored in localStorage")
        console.log("[v0] User data:", JSON.stringify(result.user, null, 2))
      }

      console.log("[v0] AFTER localStorage.setItem:")
      console.log("[v0] - Token in localStorage:", localStorage.getItem("token") ? "YES" : "NO")
      console.log("[v0] - User in localStorage:", localStorage.getItem("user") ? "YES" : "NO")

      updateData({
        phone: fullPhoneNumber,
        countryCode: countryCode,
        country: getCountryFromCode(countryCode),
        role: "homeowner",
        token: result.token,
        userId: result.user?.id,
      })

      const targetDashboard = result.user?.is_admin ? "/dashboard/admin" : "/dashboard/homeowner"
      console.log("[v0] PRE-REDIRECT VERIFICATION:")
      console.log("[v0] - Target dashboard:", targetDashboard)
      console.log("[v0] - Token in localStorage:", localStorage.getItem("token") ? "YES" : "NO")
      console.log("[v0] - Token length:", localStorage.getItem("token")?.length || 0)
      console.log("[v0] - User in localStorage:", localStorage.getItem("user") ? "YES" : "NO")
      console.log("[v0] Initiating redirect to:", targetDashboard)
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
    console.log("[v0] User chose to skip phone verification")
    console.log("[v0] Timestamp:", new Date().toISOString())

    setIsSkipping(true)
    setError(null)

    try {
      const savedFormData = sessionStorage.getItem("onboarding_form_data")
      if (!savedFormData) {
        console.error("[v0] ❌ No form data found in sessionStorage")
        throw new Error("Form data not found. Please complete the personal information form first.")
      }

      const formData = JSON.parse(savedFormData)
      console.log("[v0] Form data retrieved from sessionStorage")
      console.log("[v0] Email:", formData.email)
      console.log("[v0] Phone:", formData.phone_number)

      const heroHeadingVariation = localStorage.getItem("hero_heading_variation") || "unknown"
      console.log("[v0] Hero heading variation for this conversion (skip):", heroHeadingVariation)

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
        console.error("[v0] ❌ HOMEOWNER SIGNUP FAILED (SKIP)")
        console.error("[v0] Status:", response.status)
        console.error("[v0] Error:", result)

        let errorMessage = "Failed to create account. "

        if (response.status === 500) {
          errorMessage += "The server encountered an error. This might be because:\n\n"
          errorMessage += "• Your email or phone number is already registered\n"
          errorMessage += "• There's a temporary server issue\n\n"
          errorMessage += "Please try:\n"
          errorMessage += "1. Using a different email address\n"
          errorMessage += "2. Logging in if you already have an account\n"
          errorMessage += "3. Contacting support if the issue persists"
        } else if (response.status === 409) {
          errorMessage = "This email or phone number is already registered. Please log in instead."
        } else {
          errorMessage += result.error || result.message || "Please try again."
        }

        throw new Error(errorMessage)
      }

      console.log("[v0] ✅ HOMEOWNER ACCOUNT CREATED SUCCESSFULLY (SKIP)")
      console.log("[v0] User ID:", result.user?.id || result.id || "NOT PROVIDED")
      console.log("[v0] Email:", formData.email)
      console.log("[v0] Role: homeowner")
      console.log("[v0] Created at:", new Date().toISOString())

      if (!result.token) {
        console.error("[v0] ❌ CRITICAL: No token received from signup")
        throw new Error("No authentication token received from signup")
      }

      console.log("[v0] ✅ Token received from signup")
      console.log("[v0] Token length:", result.token.length)
      console.log("[v0] Token preview:", result.token.substring(0, 20) + "...")

      console.log("[v0] BEFORE localStorage.setItem - Token exists:", localStorage.getItem("token") ? "YES" : "NO")

      // Store auth data in localStorage
      localStorage.setItem("token", result.token)
      console.log("[v0] ✅ Token stored in localStorage")
      console.log("[v0] Token verification - reading back:", localStorage.getItem("token") ? "SUCCESS" : "FAILED")

      if (result.user) {
        localStorage.setItem("user", JSON.stringify(result.user))
        console.log("[v0] ✅ User data stored in localStorage")
        console.log("[v0] User data:", JSON.stringify(result.user, null, 2))
      }

      console.log("[v0] AFTER localStorage.setItem:")
      console.log("[v0] - Token in localStorage:", localStorage.getItem("token") ? "YES" : "NO")
      console.log("[v0] - User in localStorage:", localStorage.getItem("user") ? "YES" : "NO")

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

      updateData({
        token: result.token,
        userId: result.user?.id,
      })

      const targetDashboard = result.user?.is_admin ? "/dashboard/admin" : "/dashboard/homeowner"
      console.log("[v0] PRE-REDIRECT VERIFICATION:")
      console.log("[v0] - Target dashboard:", targetDashboard)
      console.log("[v0] - Token in localStorage:", localStorage.getItem("token") ? "YES" : "NO")
      console.log("[v0] - Token length:", localStorage.getItem("token")?.length || 0)
      console.log("[v0] - User in localStorage:", localStorage.getItem("user") ? "YES" : "NO")
      console.log("[v0] Initiating redirect to:", targetDashboard)
      console.log("[v0] ========== HOMEOWNER SKIP COMPLETE ==========")

      window.location.href = targetDashboard
    } catch (err) {
      console.error("[v0] ❌ Error during homeowner skip:", err)
      console.error("[v0] Error details:", {
        message: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        timestamp: new Date().toISOString(),
      })
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
                <div className="w-16 h-16 bg-[#328d87]/10 rounded-full flex items-center justify-center">
                  <BadgeCheck className="h-10 w-10 text-[#328d87]" />
                </div>
              </div>

              <h1 className="text-3xl font-bold text-center mb-2 text-[#03353a]">
                {step === "phone" ? "Get Verified" : "Enter Verification Code"}
              </h1>
              <p className="text-center text-gray-600 mb-2">
                {step === "phone"
                  ? "Boost your credibility on the platform"
                  : "Enter the 6-digit code we sent to your phone"}
              </p>
              {step === "phone" && (
                <p className="text-center text-sm text-[#328d87] font-medium mb-8">
                  Verified users receive 3x more responses from contractors
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
                        className="w-20 sm:w-28 px-1 sm:px-2 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03353a] focus:border-[#03353a]/100"
                      >
                        <option value="+1-CA">Canada (+1)</option>
                        <option value="+1-US">United States (+1)</option>
                        {/* Add more country codes as needed */}
                      </select>
                      <input
                        type="tel"
                        id="phone"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03353a] focus:border-[#03353a]/100"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="h-4 w-4 text-[#03353a] focus:ring-[#03353a] focus:ring-2 border-gray-300 rounded"
                    />
                    <label htmlFor="terms" className="ml-3 text-sm text-gray-700">
                      I accept the{" "}
                      <button
                        onClick={() => setShowTermsModal(true)}
                        className="text-[#03353a] font-medium hover:underline"
                      >
                        Terms of Service
                      </button>
                    </label>
                  </div>
                  <button
                    type="submit"
                    className="w-full px-4 py-3 bg-[#03353a] text-white text-sm font-medium rounded-lg hover:bg-[#03353a]/90 transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? "Loading..." : "Send Verification Code"}
                  </button>
                  <button
                    onClick={handleSkip}
                    className="w-full px-4 py-3 bg-gray-200 text-[#03353a] text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors mt-4"
                    disabled={isLoading}
                  >
                    {isLoading ? "Loading..." : "Skip for now"}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyCode} className="space-y-4">
                  <div>
                    <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                      Verification Code
                    </label>
                    <input
                      type="text"
                      id="code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03353a] focus:border-[#03353a]/100"
                      placeholder="Enter the 6-digit code"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full px-4 py-3 bg-[#03353a] text-white text-sm font-medium rounded-lg hover:bg-[#03353a]/90 transition-colors"
                    disabled={isLoading}
                  >
                    {isLoading ? "Loading..." : "Verify Code"}
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
