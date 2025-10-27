"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Phone, AlertCircle, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useOnboarding } from "@/contexts/onboarding-context"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://homehero-backend-oct-26-2025-production.up.railway.app"

export default function HomeownerPhoneVerification() {
  const router = useRouter()
  const { data, updateData } = useOnboarding()

  const [countryCode, setCountryCode] = useState(data.countryCode || "+1-US")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [step, setStep] = useState<"phone" | "code">("phone")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentOrigin, setCurrentOrigin] = useState<string>("")
  const [showTermsModal, setShowTermsModal] = useState(false)

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
    return country || "US"
  }

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const actualCountryCode = getCountryCodeOnly(countryCode)
      const fullPhoneNumber = `${actualCountryCode}${phoneNumber}`
      const country = getCountryFromCode(countryCode)

      const response = await fetch(`${API_BASE_URL}/api/users/request-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          phone_number: fullPhoneNumber,
          role: "homeowner",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        const errorMessage = errorData.error || "Failed to send verification code"
        if (errorMessage.toLowerCase().includes("already registered")) {
          setError("PHONE_REGISTERED")
        } else {
          throw new Error(errorMessage)
        }
        return
      }

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
    } catch (err) {
      console.error("[v0] Error sending code:", err)
      if (err instanceof TypeError && err.message === "Failed to fetch") {
        setError(
          `Unable to connect to backend. This is a CORS issue. Your backend needs to allow requests from: ${currentOrigin}`,
        )
      } else {
        setError(err instanceof Error ? err.message : "Failed to send code. Please try again.")
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

      sessionStorage.setItem("verification_code", verificationCode)
      sessionStorage.setItem("verified_phone_number", fullPhoneNumber)
      sessionStorage.setItem("phone_verified", "true")
      sessionStorage.setItem("terms_accepted", "true")
      sessionStorage.setItem("terms_accepted_at", new Date().toISOString())

      console.log("[v0] Verification code stored for later submission")

      const country = getCountryFromCode(countryCode)
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

      router.push("/onboarding/personal-info")
    } catch (err) {
      console.error("[v0] Error verifying code:", err)
      setError(err instanceof Error ? err.message : "Invalid verification code.")
    } finally {
      setIsLoading(false)
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
                    Welcome to homeHero. By accessing or using our platform, you agree to be bound by these Terms of
                    Service and all applicable laws and regulations. If you do not agree with any of these terms, you
                    are prohibited from using this platform.
                  </p>
                </section>

                <section className="mb-12">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">Platform Description</h3>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    homeHero is an online marketplace that connects customers seeking home services with qualified
                    service professionals (contractors). We provide the platform for these connections but are not a
                    party to the actual service agreements between customers and contractors.
                  </p>
                </section>

                <section className="mb-12">
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">User Accounts</h3>
                  <h4 className="text-xl font-semibold text-gray-900 mb-3">Account Creation</h4>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    To use homeHero, you must create an account and provide accurate, complete information. You are
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
                      <strong>Email:</strong> support@homehero.app
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
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-[#03353a] rounded-full flex items-center justify-center">
                  <Phone className="h-8 w-8 text-white" />
                </div>
              </div>

              <h1 className="text-3xl font-bold text-center mb-2 text-[#03353a]">
                {step === "phone" ? "Verify Your Phone" : "Enter Verification Code"}
              </h1>
              <p className="text-center text-gray-600 mb-8">
                {step === "phone"
                  ? "We'll send you a verification code"
                  : "Enter the 6-digit code we sent to your phone"}
              </p>

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

              {error && error.includes("CORS") && (
                <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-amber-900 mb-2">Backend CORS Configuration Needed</p>
                      <p className="text-xs text-amber-800 mb-2">{error}</p>
                      <div className="bg-amber-100 p-2 rounded text-xs font-mono text-amber-900 break-all">
                        {currentOrigin}
                      </div>
                      <p className="text-xs text-amber-700 mt-2">
                        Add this origin to your backend's CORS allowedOrigins array and restart your server.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {error && !error.includes("CORS") && error !== "PHONE_REGISTERED" && (
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
                        className="w-20 sm:w-28 px-1 sm:px-2 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03353a] focus:border-transparent outline-none transition-all bg-white text-sm cursor-pointer"
                      >
                        <option value="+1-US">🇺🇸 +1</option>
                        <option value="+44-GB">🇬🇧 +44</option>
                        <option value="+1-CA">🇨🇦 +1</option>
                        <option value="+61-AU">🇦🇺 +61</option>
                        <option value="+64-NZ">🇳🇿 +64</option>
                      </select>
                      <input
                        type="tel"
                        id="phone"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                        placeholder="5551234567"
                        maxLength={10}
                        className="flex-1 min-w-0 px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03353a] focus:border-transparent outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full px-6 py-3 bg-[#03353a] text-white rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Sending Code..." : "Send Verification Code"}
                  </button>

                  <p className="text-center text-sm text-gray-600 mt-4">
                    Have an account already?{" "}
                    <Link href="/login" className="text-[#328d87] hover:underline font-medium">
                      Log in
                    </Link>
                  </p>
                </form>
              ) : (
                <form onSubmit={handleVerifyCode} className="space-y-6">
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
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03353a] focus:border-transparent outline-none transition-all text-center text-2xl tracking-widest"
                      required
                    />
                  </div>

                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-1 h-4 w-4 text-[#03353a] border-gray-300 rounded focus:ring-[#03353a]"
                      required
                    />
                    <label htmlFor="terms" className="text-sm text-gray-700">
                      I agree to the{" "}
                      <button
                        type="button"
                        onClick={() => setShowTermsModal(true)}
                        className="text-[#328d87] hover:underline font-medium"
                      >
                        Terms of Service
                      </button>{" "}
                      for using homeHero
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading || !acceptedTerms}
                    className="w-full px-6 py-3 bg-[#03353a] text-white rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? "Verifying..." : "Verify & Continue"}
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push("/signup")}
                    className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Change phone number
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
