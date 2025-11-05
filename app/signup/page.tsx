"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { AlertCircle, Loader2, CheckCircle, ArrowLeft, Briefcase, Home } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { ServicesSelector } from "@/components/services-selector"

const CANADIAN_PROVINCES = [
  { code: "AB", name: "Alberta" },
  { code: "BC", name: "British Columbia" },
  { code: "MB", name: "Manitoba" },
  { code: "NB", name: "New Brunswick" },
  { code: "NL", name: "Newfoundland and Labrador" },
  { code: "NT", name: "Northwest Territories" },
  { code: "NS", name: "Nova Scotia" },
  { code: "NU", name: "Nunavut" },
  { code: "ON", name: "Ontario" },
  { code: "PE", name: "Prince Edward Island" },
  { code: "QC", name: "Quebec" },
  { code: "SK", name: "Saskatchewan" },
  { code: "YT", name: "Yukon" },
]

export default function SignupPage() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [step, setStep] = useState<"role" | "details" | "verify">("role")
  const [role, setRole] = useState<"homeowner" | "contractor">(
    (searchParams.get("role") as "homeowner" | "contractor") || ""
  )

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [countryCode, setCountryCode] = useState("+1")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [region, setRegion] = useState("")

  const [companyName, setCompanyName] = useState("")
  const [businessAddress, setBusinessAddress] = useState("")
  const [businessCity, setBusinessCity] = useState("")
  const [businessRegion, setBusinessRegion] = useState("")
  const [radiusKm, setRadiusKm] = useState("50")
  const [services, setServices] = useState<string[]>([])

  const [verificationCode, setVerificationCode] = useState("")
  const [userId, setUserId] = useState<number | null>(null)

  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (searchParams.get("role")) {
      setStep("details")
    }
  }, [searchParams])

  const validatePostalCode = (code: string) => {
    const canadianPostalRegex = /^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/
    return canadianPostalRegex.test(code)
  }

  const validatePhoneNumber = (phone: string) => {
    const tenDigitRegex = /^\d{10}$/
    return tenDigitRegex.test(phone)
  }

  const handleRoleSelect = (selectedRole: "homeowner" | "contractor") => {
    setRole(selectedRole)
    router.push(`/signup?role=${selectedRole}`)
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      return
    }

    if (!validatePhoneNumber(phoneNumber)) {
      setError("Please enter a valid 10-digit phone number")
      return
    }

    if (!validatePostalCode(postalCode)) {
      setError("Please enter a valid Canadian postal code (e.g., A1A 1A1)")
      return
    }

    if (role === "homeowner" && (!address || !city || !region)) {
      setError("Please enter your complete address")
      return
    }

    if (role === "contractor" && services.length === 0) {
      setError("Please select at least one service")
      return
    }

    if (role === "contractor" && (!businessCity || !businessRegion)) {
      setError("Please enter city and select province")
      return
    }

    setLoading(true)

    try {
      const fullPhoneNumber = `${countryCode}${phoneNumber}`

      const payload: any = {
        full_name: fullName,
        email,
        phone_number: fullPhoneNumber,
        postal_code: postalCode,
        password,
        role,
        country: "CA",
      }

      if (role === "contractor") {
        payload.company_name = companyName
        payload.business_address = businessAddress
        payload.city = businessCity
        payload.region = businessRegion
        payload.radius_km = Number.parseInt(radiusKm)
        payload.services = services
      } else {
        payload.address = address
        payload.city = city
        payload.region = region
      }

      const response = await apiClient.request<{ user: any }>("/api/users/signup", {
        method: "POST",
        body: JSON.stringify(payload),
      })

      setUserId(response.user.id)
      setStep("verify")
    } catch (err: any) {
      setError(err.message || "Failed to create account")
    } finally {
      setLoading(false)
    }
  }

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const fullPhoneNumber = `${countryCode}${phoneNumber}`

      await apiClient.request("/api/users/verify-phone", {
        method: "POST",
        body: JSON.stringify({
          phone_number: fullPhoneNumber,
          verification_code: verificationCode,
        }),
      })

      router.push("/login?verified=true")
    } catch (err: any) {
      setError(err.message || "Invalid verification code")
    } finally {
      setLoading(false)
    }
  }

  if (step === "role") {
    return (
      <div className="min-h-screen relative flex flex-col">
        <div
          className="fixed inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: "url('/living-room-background.jpg')" }}
        />
        <div className="fixed inset-0 bg-[#0d3d42]/95 z-0" />

        <div className="relative z-10 flex flex-col min-h-screen">
          <header className="border-b border-[#d8e2fb]/10 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center">
                  <Image src="/images/logo-white.png" alt="Bidrr" width={140} height={35} className="h-8 w-auto" />
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

          <div className="flex-1 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-2xl">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-[#d8e2fb] mb-2">Join Bidrr</h2>
                <p className="text-[#d8e2fb]/70">Choose how you want to use Bidrr</p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <button
                  onClick={() => handleRoleSelect("homeowner")}
                  className="bg-[#03353a] border-2 border-[#d8e2fb]/20 hover:border-[#328d87] rounded-lg p-8 text-left transition-all group"
                >
                  <div className="h-12 w-12 bg-[#328d87]/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#328d87]/30 transition-colors">
                    <CheckCircle className="h-6 w-6 text-[#328d87]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#d8e2fb] mb-2">I want to Post a Job</h3>
                  <p className="text-[#d8e2fb]/70">Post projects and hire trusted contractors for your home</p>
                </button>

                <button
                  onClick={() => handleRoleSelect("contractor")}
                  className="bg-[#03353a] border-2 border-[#d8e2fb]/20 hover:border-[#328d87] rounded-lg p-8 text-left transition-all group"
                >
                  <div className="h-12 w-12 bg-[#328d87]/20 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#328d87]/30 transition-colors">
                    <CheckCircle className="h-6 w-6 text-[#328d87]" />
                  </div>
                  <h3 className="text-xl font-semibold text-[#d8e2fb] mb-2">I'm a Contractor</h3>
                  <p className="text-[#d8e2fb]/70">Find new projects and grow your business</p>
                </button>
              </div>

              <p className="mt-6 text-center text-sm text-[#d8e2fb]/60">
                Already have an account?{" "}
                <Link href="/login" className="text-[#e2bb12] font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (step === "verify") {
    return (
      <div className="min-h-screen relative flex flex-col">
        <div
          className="fixed inset-0 bg-cover bg-center z-0"
          style={{ backgroundImage: "url('/living-room-background.jpg')" }}
        />
        <div className="fixed inset-0 bg-[#0d3d42]/95 z-0" />

        <div className="relative z-10 flex flex-col min-h-screen">
          <header className="border-b border-[#d8e2fb]/10 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4">
              <div className="flex items-center justify-between">
                <Link href="/" className="flex items-center">
                  <Image src="/images/logo-white.png" alt="Bidrr" width={140} height={35} className="h-8 w-auto" />
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

          <div className="flex-1 flex items-center justify-center px-4 py-12">
            <div className="w-full max-w-md">
              <div className="bg-[#03353a] border border-[#d8e2fb]/20 rounded-lg p-8 shadow-lg">
                <div className="text-center mb-6">
                  <div className="h-16 w-16 bg-[#328d87]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-[#328d87]" />
                  </div>
                  <h2 className="text-2xl font-bold text-[#d8e2fb] mb-2">Verify Your Phone</h2>
                  <p className="text-[#d8e2fb]/70">
                    We sent a verification code to{" "}
                    <span className="font-medium text-[#d8e2fb]">
                      {countryCode}
                      {phoneNumber}
                    </span>
                  </p>
                </div>

                {error && (
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-red-400">{error}</p>
                  </div>
                )}

                <form onSubmit={handleVerification} className="space-y-4">
                  <div>
                    <label htmlFor="code" className="block text-sm font-medium text-[#d8e2fb] mb-2">
                      Verification Code
                    </label>
                    <input
                      id="code"
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-[#0D3D42] border border-[#d8e2fb]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#328d87] text-[#d8e2fb] text-center text-2xl tracking-widest"
                      placeholder="000000"
                      maxLength={6}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#e2bb12] text-[#0D3D42] py-3 rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                    {loading ? "Verifying..." : "Verify Phone"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative flex flex-col">
      <div
        className="fixed inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: "url('/living-room-background.jpg')" }}
      />
      <div className="fixed inset-0 bg-[#0d3d42]/95 z-0" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="border-b border-[#d8e2fb]/10 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center">
                <Image src="/images/logo-white.png" alt="Bidrr" width={140} height={35} className="h-8 w-auto" />
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

        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-2xl">
            <div className="bg-[#03353a] border border-[#d8e2fb]/20 rounded-lg p-8 shadow-lg">
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => {
                    window.location.href = "/signup"
                  }}
                  className="text-[#e2bb12] hover:underline text-sm mb-4"
                >
                  ← Change role
                </button>
                <div className="flex items-center gap-3 mb-3">
                  {role === "contractor" ? (
                    <div className="h-12 w-12 bg-[#328d87]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Briefcase className="h-6 w-6 text-[#328d87]" />
                    </div>
                  ) : (
                    <div className="h-12 w-12 bg-[#328d87]/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Home className="h-6 w-6 text-[#328d87]" />
                    </div>
                  )}
                  <h2 className="text-3xl font-bold text-[#d8e2fb]">
                    {role === "homeowner" ? "Customer Account" : "Contractor Account"}
                  </h2>
                </div>
                <p className="text-[#d8e2fb]/70">Fill in your details to get started</p>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 mb-6 flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <form onSubmit={handleSignup} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-[#d8e2fb] mb-2">
                      Full Name *
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-[#0D3D42] border border-[#d8e2fb]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#328d87] text-[#d8e2fb]"
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-[#d8e2fb] mb-2">
                      Email Address *
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-[#0D3D42] border border-[#d8e2fb]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#328d87] text-[#d8e2fb]"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-[#d8e2fb] mb-2">
                    Phone Number *
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-32 px-3 py-3 bg-[#0D3D42] border border-[#d8e2fb]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#328d87] text-[#d8e2fb]"
                    >
                      <option value="+1">🇨🇦 +1</option>
                    </select>
                    <input
                      id="phone"
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "")
                        if (value.length <= 10) {
                          setPhoneNumber(value)
                        }
                      }}
                      required
                      className="flex-1 px-4 py-3 bg-[#0D3D42] border border-[#d8e2fb]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#328d87] text-[#d8e2fb]"
                      placeholder="1234567890"
                      maxLength={10}
                    />
                  </div>
                  <p className="text-xs text-[#d8e2fb]/60 mt-1">Enter 10-digit phone number</p>
                </div>

                {role === "contractor" && (
                  <>
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium text-[#d8e2fb] mb-2">
                        Company Name *
                      </label>
                      <input
                        id="company"
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-[#0D3D42] border border-[#d8e2fb]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#328d87] text-[#d8e2fb]"
                        placeholder="Smith Contracting"
                      />
                    </div>

                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-[#d8e2fb] mb-2">
                        Business Address *
                      </label>
                      <input
                        id="address"
                        type="text"
                        value={businessAddress}
                        onChange={(e) => setBusinessAddress(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-[#0D3D42] border border-[#d8e2fb]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#328d87] text-[#d8e2fb]"
                        placeholder="123 Main Street"
                      />
                    </div>

                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-[#d8e2fb] mb-2">
                        City *
                      </label>
                      <input
                        id="city"
                        type="text"
                        value={businessCity}
                        onChange={(e) => setBusinessCity(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-[#0D3D42] border border-[#d8e2fb]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#328d87] text-[#d8e2fb]"
                        placeholder="Toronto"
                      />
                    </div>

                    <div>
                      <label htmlFor="province" className="block text-sm font-medium text-[#d8e2fb] mb-2">
                        Province *
                      </label>
                      <select
                        id="province"
                        value={businessRegion}
                        onChange={(e) => setBusinessRegion(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-[#0D3D42] border border-[#d8e2fb]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#328d87] text-[#d8e2fb]"
                      >
                        <option value="">Select a province</option>
                        {CANADIAN_PROVINCES.map((province) => (
                          <option key={province.code} value={province.code}>
                            {province.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="postal" className="block text-sm font-medium text-[#d8e2fb] mb-2">
                        Postal Code *
                      </label>
                      <input
                        id="postal"
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value.toUpperCase())}
                        required
                        className="w-full px-4 py-3 bg-[#0D3D42] border border-[#d8e2fb]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#328d87] text-[#d8e2fb]"
                        placeholder="A1A 1A1"
                      />
                      <p className="text-xs text-[#d8e2fb]/60 mt-1">Format: A1A 1A1</p>
                    </div>

                    <div>
                      <label htmlFor="radius" className="block text-sm font-medium text-[#d8e2fb] mb-2">
                        Service Radius (km) *
                      </label>
                      <input
                        id="radius"
                        type="number"
                        value={radiusKm}
                        onChange={(e) => setRadiusKm(e.target.value)}
                        required
                        min="1"
                        className="w-full px-4 py-3 bg-[#0D3D42] border border-[#d8e2fb]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#328d87] text-[#d8e2fb]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#d8e2fb] mb-2">Services Offered *</label>
                      <ServicesSelector selectedServices={services} onChange={setServices} />
                    </div>
                  </>
                )}

                {role === "homeowner" && (
                  <>
                    <div>
                      <label htmlFor="address" className="block text-sm font-medium text-[#d8e2fb] mb-2">
                        Address *
                      </label>
                      <input
                        id="address"
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-[#0D3D42] border border-[#d8e2fb]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#328d87] text-[#d8e2fb]"
                        placeholder="123 Main Street"
                      />
                    </div>

                    <div>
                      <label htmlFor="homeowner-city" className="block text-sm font-medium text-[#d8e2fb] mb-2">
                        City *
                      </label>
                      <input
                        id="homeowner-city"
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-[#0D3D42] border border-[#d8e2fb]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#328d87] text-[#d8e2fb]"
                        placeholder="Toronto"
                      />
                    </div>

                    <div>
                      <label htmlFor="homeowner-province" className="block text-sm font-medium text-[#d8e2fb] mb-2">
                        Province *
                      </label>
                      <select
                        id="homeowner-province"
                        value={region}
                        onChange={(e) => setRegion(e.target.value)}
                        required
                        className="w-full px-4 py-3 bg-[#0D3D42] border border-[#d8e2fb]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#328d87] text-[#d8e2fb]"
                      >
                        <option value="">Select a province</option>
                        {CANADIAN_PROVINCES.map((province) => (
                          <option key={province.code} value={province.code}>
                            {province.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label htmlFor="postal" className="block text-sm font-medium text-[#d8e2fb] mb-2">
                        Postal Code *
                      </label>
                      <input
                        id="postal"
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value.toUpperCase())}
                        required
                        className="w-full px-4 py-3 bg-[#0D3D42] border border-[#d8e2fb]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#328d87] text-[#d8e2fb]"
                        placeholder="A1A 1A1"
                      />
                      <p className="text-xs text-[#d8e2fb]/60 mt-1">Format: A1A 1A1</p>
                    </div>
                  </>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-[#d8e2fb] mb-2">
                      Password *
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full px-4 py-3 bg-[#0D3D42] border border-[#d8e2fb]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#328d87] text-[#d8e2fb]"
                      placeholder="••••••••"
                    />
                    <p className="text-xs text-[#d8e2fb]/60 mt-1">Minimum 6 characters</p>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-[#d8e2fb] mb-2">
                      Confirm Password *
                    </label>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full px-4 py-3 bg-[#0D3D42] border border-[#d8e2fb]/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#328d87] text-[#d8e2fb]"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#e2bb12] text-[#0D3D42] py-3 rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                  {loading ? "Creating account..." : "Create Account"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-[#d8e2fb]/60">
                Already have an account?{" "}
                <Link href="/login" className="text-[#e2bb12] font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  )
}
