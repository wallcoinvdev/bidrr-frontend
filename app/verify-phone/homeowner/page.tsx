"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ArrowLeft, BadgeCheck, AlertCircle, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useOnboarding } from "@/contexts/onboarding-context"
import { usePageTitle } from "@/hooks/use-page-title"
import { apiClient } from "@/lib/api-client"
import { trackEvent } from "@/lib/analytics"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.bidrr.ca"

export default function VerifyPhoneHomeowner() {
  const router = useRouter()
  const { data, updateData } = useOnboarding()

  usePageTitle("Verify Phone")

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

  const [countryCode, setCountryCode] = useState(data.countryCode || "+1")
  const [phoneNumber, setPhoneNumber] = useState(getInitialPhoneNumber())
  const [verificationCode, setVerificationCode] = useState("")
  const [step, setStep] = useState<"phone" | "code">("phone")
  const [isLoading, setIsLoading] = useState(false)
  const [isSkipping, setIsSkipping] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentOrigin, setCurrentOrigin] = useState<string>("")
  const [showTermsModal, setShowTermsModal] = useState(false)
  const [phoneFieldInvalid, setPhoneFieldInvalid] = useState(false)

  const codeInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    trackEvent("phone_verification_started", { role: "homeowner" })

    if (typeof window !== "undefined") {
      setCurrentOrigin(window.location.origin)
    }

    const formData = sessionStorage.getItem("onboarding_form_data")
    if (!formData) {
      // No form data - user may have navigated directly
    }
  }, [])

  const getCountryCodeOnly = (fullCode: string) => {
    return fullCode.split("-")[0]
  }

  const getCountryFromCode = (fullCode: string): string => {
    const country = fullCode.split("-")[1]
    return country || "CA"
  }

  const handleSendCode = async (e?: React.FormEvent) => {
    if (e) {
      e.preventDefault()
    }

    if (!phoneNumber || phoneNumber.length < 10) {
      setError("Please enter a valid phone number")
      setPhoneFieldInvalid(true) // Mark field as invalid
      return
    }

    setPhoneFieldInvalid(false) // Clear invalid state on valid input
    setIsLoading(true)
    setError(null)

    trackEvent("verification_code_requested", { role: "homeowner" })

    try {
      const savedFormData = sessionStorage.getItem("onboarding_form_data")
      if (!savedFormData) {
        throw new Error("Form data not found")
      }

      const formData = JSON.parse(savedFormData)

      const actualCountryCode = countryCode.split("-")[0]
      const fullPhoneNumber = `${actualCountryCode}${phoneNumber}`

      const heroHeadingVariation = localStorage.getItem("hero_heading_variation") || null

      const signupPayload: any = {
        password: formData.password,
        role: "homeowner",
        first_name: formData.first_name,
        email: formData.email,
        phone_number: fullPhoneNumber,
        terms_accepted: true,
        terms_accepted_at: new Date().toISOString(),
        hero_heading_variation: heroHeadingVariation,
      }

      console.log("[v0] Signup request payload:", signupPayload)

      const response = await apiClient.post(
        "/api/users/request-verification",
        {
          phone_number: fullPhoneNumber,
          role: "homeowner",
          email: formData.email,
        },
        { requiresAuth: false },
      )

      sessionStorage.setItem("pending_phone_number", fullPhoneNumber)
      sessionStorage.setItem("pending_country", getCountryFromCode(countryCode))

      updateData({
        phone: fullPhoneNumber,
        countryCode: countryCode,
        country: getCountryFromCode(countryCode),
        role: "homeowner",
        address: "",
        city: "",
        region: "",
        province: "",
        postalCode: "",
      })

      trackEvent("verification_code_sent", { role: "homeowner" })
      setStep("code")
    } catch (err: any) {
      if (err.message?.toLowerCase().includes("already registered")) {
        setError("PHONE_REGISTERED")
        trackEvent("verification_code_failed", { role: "homeowner", error: "phone_already_registered" })
      } else {
        setError(
          "Unable to send verification code to this number. This could be due to an invalid phone number or SMS service restrictions. Please try a different number or click 'Skip for now' to continue without verification.",
        )
        trackEvent("verification_code_failed", { role: "homeowner", error: "sms_send_failed" })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()

    setIsLoading(true)
    setError(null)

    trackEvent("verification_code_entered", { role: "homeowner" })

    try {
      const actualCountryCode = getCountryCodeOnly(countryCode)
      const fullPhoneNumber = `${actualCountryCode}${phoneNumber}`

      const savedFormData = sessionStorage.getItem("onboarding_form_data")
      if (!savedFormData) {
        throw new Error("Form data not found. Please complete the personal information form first.")
      }

      const formData = JSON.parse(savedFormData)

      const jobDataString = sessionStorage.getItem("onboarding_job_data")
      const jobData = jobDataString ? JSON.parse(jobDataString) : null

      console.log("[v0] Form data from session:", formData)
      console.log("[v0] Job data from session:", jobData)

      const heroHeadingVariation = localStorage.getItem("hero_heading_variation") || null

      const signupPayload: any = {
        phone_number: fullPhoneNumber,
        verification_code: verificationCode,
        password: formData.password,
        role: "homeowner",
        first_name: formData.first_name,
        email: formData.email,
        terms_accepted: true,
        terms_accepted_at: sessionStorage.getItem("terms_accepted_at") || new Date().toISOString(),
        hero_heading_variation: heroHeadingVariation,
      }

      console.log("[v0] Signup payload:", signupPayload)

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

      trackEvent("verification_success", { role: "homeowner" })

      trackEvent("signup_complete", { role: "homeowner", verification_status: "verified" })

      localStorage.setItem("auth_token", result.token)
      if (result.user) {
        localStorage.setItem("user", JSON.stringify(result.user))
      }

      if (jobData && jobData.jobTitle && jobData.jobService) {
        try {
          console.log("[v0] Creating mission from signup flow (verified)")
          console.log("[v0] Job data images:", jobData.jobImageDataUrls)

          const missionFormData = new FormData()
          missionFormData.append("title", jobData.jobTitle)
          missionFormData.append("service", jobData.jobService)
          missionFormData.append("job_details", jobData.jobDescription || "")
          missionFormData.append("completion_timeline", jobData.jobTimeline || "within_1_month")
          missionFormData.append("city", jobData.jobCity || "")
          missionFormData.append("region", jobData.jobRegion || "")
          missionFormData.append("postal_code", jobData.jobPostalCode || "")
          missionFormData.append("country", "Canada")

          if (
            jobData.jobImageDataUrls &&
            Array.isArray(jobData.jobImageDataUrls) &&
            jobData.jobImageDataUrls.length > 0
          ) {
            console.log("[v0] Processing images, count:", jobData.jobImageDataUrls.length)
            for (let i = 0; i < jobData.jobImageDataUrls.length; i++) {
              const dataUrl = jobData.jobImageDataUrls[i]
              try {
                console.log("[v0] Converting image", i, "data URL length:", dataUrl?.length || 0)
                const response = await fetch(dataUrl)
                const blob = await response.blob()
                const file = new File([blob], `image-${i}.jpg`, { type: "image/jpeg" })
                missionFormData.append("images", file)
                console.log("[v0] Image", i, "added to FormData, size:", blob.size)
              } catch (err) {
                console.error("[v0] Failed to convert image data URL:", err)
              }
            }
          } else {
            console.log("[v0] No images to process:", {
              hasJobImageDataUrls: !!jobData.jobImageDataUrls,
              isArray: Array.isArray(jobData.jobImageDataUrls),
              length: jobData.jobImageDataUrls?.length || 0,
            })
          }

          console.log("[v0] Mission FormData entries:")
          for (const [key, value] of missionFormData.entries()) {
            console.log(`[v0]   ${key}: ${value}`)
          }

          await apiClient.uploadFormData("/api/missions", missionFormData, "POST", true)

          console.log("[v0] Mission created successfully")

          sessionStorage.removeItem("onboarding_job_data")

          updateData({
            jobTitle: undefined,
            jobService: undefined,
            jobDescription: undefined,
            jobImages: undefined,
            jobTimeline: undefined,
            jobAddress: undefined,
            jobCity: undefined,
            jobRegion: undefined,
            jobPostalCode: undefined,
          })
        } catch (missionError) {
          console.error("[v0] Failed to create mission:", missionError)
        }
      }

      sessionStorage.setItem("account_created_at", new Date().toISOString())
      sessionStorage.setItem("account_user_id", result.user?.id || result.id || "unknown")
      sessionStorage.setItem("account_email", formData.email)
      sessionStorage.setItem("account_role", "homeowner")

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

      const targetDashboard = result.user?.is_admin ? "/dashboard/admin" : "/dashboard/homeowner"
      window.location.href = targetDashboard
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Invalid verification code."
      if (errorMessage.toLowerCase().includes("email already registered")) {
        setError("EMAIL_REGISTERED")
        trackEvent("verification_failed", { role: "homeowner", error: "email_already_registered" })
      } else {
        trackEvent("verification_failed", { role: "homeowner", error: errorMessage })
        setError(errorMessage)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = async () => {
    try {
      console.log("[v0] handleSkip called")
      setError(null)

      const formDataString = sessionStorage.getItem("onboarding_form_data")
      const jobDataString = sessionStorage.getItem("onboarding_job_data")

      if (!formDataString) {
        throw new Error("No form data found. Please complete the form again.")
      }

      const formData = JSON.parse(formDataString)
      const jobData = jobDataString ? JSON.parse(jobDataString) : null

      console.log("[v0] Form data from session:", formData)
      console.log("[v0] Job data from session:", jobData)

      const heroHeadingVariation = localStorage.getItem("hero_heading_variation") || null

      const signupPayload: any = {
        password: formData.password,
        role: "homeowner",
        first_name: formData.first_name,
        email: formData.email,
        terms_accepted: true,
        terms_accepted_at: new Date().toISOString(),
        hero_heading_variation: heroHeadingVariation,
      }

      console.log("[v0] Signup payload:", signupPayload)

      const response = await fetch(`${API_BASE_URL}/api/users/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify(signupPayload),
      })

      const result = await response.json()
      console.log("[v0] Signup response:", result)

      if (!response.ok) {
        throw new Error(result.error || result.message || "Failed to create account")
      }

      if (!result.token) {
        throw new Error("No authentication token received from signup")
      }

      trackEvent("signup_complete", { role: "homeowner", verification_status: "skipped" })

      localStorage.setItem("auth_token", result.token)
      if (result.user) {
        localStorage.setItem("user", JSON.stringify(result.user))
      }

      updateData({
        token: result.token,
        userId: result.user?.id,
      })

      if (jobData && jobData.jobTitle && jobData.jobService) {
        try {
          console.log("[v0] Creating mission from signup flow (skipped verification)")
          console.log("[v0] Job data images:", jobData.jobImageDataUrls)

          const missionFormData = new FormData()
          missionFormData.append("title", jobData.jobTitle)
          missionFormData.append("service", jobData.jobService)
          missionFormData.append("job_details", jobData.jobDescription || "")
          missionFormData.append("completion_timeline", jobData.jobTimeline || "within_1_month")
          missionFormData.append("city", jobData.jobCity || "")
          missionFormData.append("region", jobData.jobRegion || "")
          missionFormData.append("postal_code", jobData.jobPostalCode || "")
          missionFormData.append("country", "Canada")

          if (
            jobData.jobImageDataUrls &&
            Array.isArray(jobData.jobImageDataUrls) &&
            jobData.jobImageDataUrls.length > 0
          ) {
            console.log("[v0] Processing images, count:", jobData.jobImageDataUrls.length)
            for (let i = 0; i < jobData.jobImageDataUrls.length; i++) {
              const dataUrl = jobData.jobImageDataUrls[i]
              try {
                console.log("[v0] Converting image", i, "data URL length:", dataUrl?.length || 0)
                const response = await fetch(dataUrl)
                const blob = await response.blob()
                const file = new File([blob], `image-${i}.jpg`, { type: "image/jpeg" })
                missionFormData.append("images", file)
                console.log("[v0] Image", i, "added to FormData, size:", blob.size)
              } catch (err) {
                console.error("[v0] Failed to convert image data URL:", err)
              }
            }
          } else {
            console.log("[v0] No images to process:", {
              hasJobImageDataUrls: !!jobData.jobImageDataUrls,
              isArray: Array.isArray(jobData.jobImageDataUrls),
              length: jobData.jobImageDataUrls?.length || 0,
            })
          }

          console.log("[v0] Mission FormData entries:")
          for (const [key, value] of missionFormData.entries()) {
            console.log(`[v0]   ${key}: ${value}`)
          }

          await apiClient.uploadFormData("/api/missions", missionFormData, "POST", true)

          console.log("[v0] Mission created successfully")

          sessionStorage.removeItem("onboarding_job_data")
        } catch (missionError) {
          console.error("[v0] Failed to create mission:", missionError)
        }
      }

      sessionStorage.removeItem("onboarding_form_data")

      const targetDashboard = result.user?.is_admin ? "/dashboard/admin" : "/dashboard/homeowner"
      window.location.href = targetDashboard
    } catch (err) {
      console.error("[v0] handleSkip error:", err)
      const errorMessage = err instanceof Error ? err.message : "Failed to create account. Please try again."
      if (errorMessage.toLowerCase().includes("email already registered")) {
        setError("EMAIL_REGISTERED")
        trackEvent("form_submission_error", { role: "homeowner", error: "email_already_registered" })
      } else {
        trackEvent("form_submission_error", { role: "homeowner", error: errorMessage })
        setError(errorMessage)
      }
    } finally {
      setIsSkipping(false)
    }
  }

  const handleVerifyAndSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsVerifying(true)
    setError(null)

    trackEvent("verification_attempted", { role: "homeowner" })

    try {
      const savedFormData = sessionStorage.getItem("onboarding_form_data")
      if (!savedFormData) {
        throw new Error("Form data not found")
      }

      const formData = JSON.parse(savedFormData)

      const jobDataString = sessionStorage.getItem("onboarding_job_data")
      const jobData = jobDataString ? JSON.parse(jobDataString) : null

      console.log("[v0] Form data from session:", formData)
      console.log("[v0] Job data from session:", jobData)

      const heroHeadingVariation = localStorage.getItem("hero_heading_variation") || null

      const signupPayload: any = {
        phone_number: `${countryCode}${phoneNumber}`,
        verification_code: verificationCode,
        password: formData.password,
        role: "homeowner",
        first_name: formData.first_name,
        email: formData.email,
        terms_accepted: true,
        terms_accepted_at: sessionStorage.getItem("terms_accepted_at") || new Date().toISOString(),
        hero_heading_variation: heroHeadingVariation,
      }

      console.log("[v0] Signup payload:", signupPayload)

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

      trackEvent("verification_success", { role: "homeowner" })

      trackEvent("signup_complete", { role: "homeowner", verification_status: "verified" })

      localStorage.setItem("auth_token", result.token)
      if (result.user) {
        localStorage.setItem("user", JSON.stringify(result.user))
      }

      if (jobData && jobData.jobTitle && jobData.jobService) {
        try {
          console.log("[v0] Creating mission from signup flow (verified)")
          console.log("[v0] Job data images:", jobData.jobImageDataUrls)

          const missionFormData = new FormData()
          missionFormData.append("title", jobData.jobTitle)
          missionFormData.append("service", jobData.jobService)
          missionFormData.append("job_details", jobData.jobDescription || "")
          missionFormData.append("completion_timeline", jobData.jobTimeline || "within_1_month")
          missionFormData.append("city", jobData.jobCity || "")
          missionFormData.append("region", jobData.jobRegion || "")
          missionFormData.append("postal_code", jobData.jobPostalCode || "")
          missionFormData.append("country", "Canada")

          if (
            jobData.jobImageDataUrls &&
            Array.isArray(jobData.jobImageDataUrls) &&
            jobData.jobImageDataUrls.length > 0
          ) {
            console.log("[v0] Processing images, count:", jobData.jobImageDataUrls.length)
            for (let i = 0; i < jobData.jobImageDataUrls.length; i++) {
              const dataUrl = jobData.jobImageDataUrls[i]
              try {
                console.log("[v0] Converting image", i, "data URL length:", dataUrl?.length || 0)
                const response = await fetch(dataUrl)
                const blob = await response.blob()
                const file = new File([blob], `image-${i}.jpg`, { type: "image/jpeg" })
                missionFormData.append("images", file)
                console.log("[v0] Image", i, "added to FormData, size:", blob.size)
              } catch (err) {
                console.error("[v0] Failed to convert image data URL:", err)
              }
            }
          } else {
            console.log("[v0] No images to process:", {
              hasJobImageDataUrls: !!jobData.jobImageDataUrls,
              isArray: Array.isArray(jobData.jobImageDataUrls),
              length: jobData.jobImageDataUrls?.length || 0,
            })
          }

          console.log("[v0] Mission FormData entries:")
          for (const [key, value] of missionFormData.entries()) {
            console.log(`[v0]   ${key}: ${value}`)
          }

          await apiClient.uploadFormData("/api/missions", missionFormData, "POST", true)

          console.log("[v0] Mission created successfully")

          sessionStorage.removeItem("onboarding_job_data")

          updateData({
            jobTitle: undefined,
            jobService: undefined,
            jobDescription: undefined,
            jobImages: undefined,
            jobTimeline: undefined,
            jobAddress: undefined,
            jobCity: undefined,
            jobRegion: undefined,
            jobPostalCode: undefined,
          })
        } catch (missionError) {
          console.error("[v0] Failed to create mission:", missionError)
        }
      }

      sessionStorage.setItem("account_created_at", new Date().toISOString())
      sessionStorage.setItem("account_user_id", result.user?.id || result.id || "unknown")
      sessionStorage.setItem("account_email", formData.email)
      sessionStorage.setItem("account_role", "homeowner")

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

      const targetDashboard = result.user?.is_admin ? "/dashboard/admin" : "/dashboard/homeowner"
      window.location.href = targetDashboard
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Invalid verification code."
      if (errorMessage.toLowerCase().includes("email already registered")) {
        setError("EMAIL_REGISTERED")
        trackEvent("verification_failed", { role: "homeowner", error: "email_already_registered" })
      } else {
        trackEvent("verification_failed", { role: "homeowner", error: errorMessage })
        setError(errorMessage)
      }
    } finally {
      setIsVerifying(false)
    }
  }

  useEffect(() => {
    if (verificationCode.length === 6 && step === "code") {
      const timer = setTimeout(() => {
        handleVerifyAndSignup(new Event("submit") as any)
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

            {error === "EMAIL_REGISTERED" && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-red-900 mb-1">Email already registered</h3>
                    <p className="text-sm text-red-800 mb-3">
                      This email is already associated with an account. Please go back and use a different email or log
                      in instead.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Link
                        href={`/onboarding/personal-info?role=homeowner&email=${encodeURIComponent(data.email || "")}`}
                        className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium text-center"
                      >
                        Go Back & Change Email
                      </Link>
                      <Link
                        href="/login"
                        className="inline-block px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium text-center"
                      >
                        Log In
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {error && error !== "PHONE_REGISTERED" && error !== "EMAIL_REGISTERED" && (
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
                      <option value="+1">🇨🇦 +1</option>
                    </select>
                    <input
                      type="tel"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      id="phoneNumber"
                      value={phoneNumber}
                      onChange={(e) => {
                        setPhoneNumber(e.target.value.replace(/\D/g, ""))
                        if (phoneFieldInvalid) setPhoneFieldInvalid(false)
                      }}
                      className={`flex-1 min-w-0 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#03353a] focus:border-[#03353a]/100 ${
                        phoneFieldInvalid ? "border-red-500" : "border-gray-300"
                      }`}
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
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setError(null)
                    handleSkip()
                  }}
                  disabled={isLoading || isSkipping}
                  className="w-full bg-gray-100 text-gray-700 py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isSkipping ? "Processing..." : "Skip Verification"}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyAndSignup} className="space-y-6">
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
                  disabled={isLoading || isVerifying}
                  className="w-full bg-[#03353a] text-white py-3 px-4 rounded-lg hover:bg-[#02292d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                >
                  {isLoading || isVerifying ? "Processing..." : "Verify Code"}
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    setError(null)
                    handleSkip()
                  }}
                  disabled={isLoading || isSkipping || isVerifying}
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
