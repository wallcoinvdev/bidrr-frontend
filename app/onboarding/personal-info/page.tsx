"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, User, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { useOnboarding } from "@/contexts/onboarding-context"
import { useAuth } from "@/lib/auth-context"
import { ServicesSelector } from "@/components/services-selector"
import { getRegionsForCountry, getPostalCodeLabel, getRegionLabel, getPostalCodePlaceholder } from "@/lib/country-data"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.homehero.app"

const formatPostalCode = (value: string, country: string): string => {
  const cleaned = value.replace(/[^A-Za-z0-9]/g, "").toUpperCase()

  if (country === "CA") {
    if (cleaned.length === 6) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`
    }
  }

  return cleaned
}

const validateE164Phone = (phone: string): boolean => {
  // E.164 format: +[country code][number] (e.g., +13062225100)
  const e164Regex = /^\+[1-9]\d{10,14}$/
  return e164Regex.test(phone)
}

export default function PersonalInformation() {
  const router = useRouter()
  const { data, updateData } = useOnboarding()
  const { setUser } = useAuth()

  const [country, setCountry] = useState(data.country || "CA")
  const [businessCountry, setBusinessCountry] = useState(data.businessCountry || data.country || "CA")

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [region, setRegion] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [companyName, setCompanyName] = useState("")
  const [companySize, setCompanySize] = useState("2-10")
  const [businessAddress, setBusinessAddress] = useState("")
  const [businessCity, setBusinessCity] = useState("")
  const [businessRegion, setBusinessRegion] = useState("")
  const [businessPostalCode, setBusinessPostalCode] = useState("")
  const [sameAsPersonalAddress, setSameAsPersonalAddress] = useState(false)
  const [radiusKm, setRadiusKm] = useState("50")
  const [services, setServices] = useState<string[]>([])

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log("[v0] PersonalInformation mounted")
    console.log("[v0] Current role from context:", data.role)
    console.log("[v0] Current country from context:", data.country)
    console.log("[v0] Full onboarding data:", JSON.stringify(data, null, 2))

    // If role is missing or incorrect, try to recover from localStorage
    const storedData = localStorage.getItem("homehero_onboarding_data")
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData)
        console.log("[v0] Stored onboarding data:", JSON.stringify(parsed, null, 2))
        if (parsed.role && parsed.role !== data.role) {
          console.warn("[v0] Role mismatch! Context has:", data.role, "but localStorage has:", parsed.role)
        }
      } catch (e) {
        console.error("[v0] Error parsing stored data:", e)
      }
    }
  }, [])

  useEffect(() => {
    const savedFormData = sessionStorage.getItem("onboarding_form_data")
    if (savedFormData) {
      try {
        const parsed = JSON.parse(savedFormData)
        setFirstName(parsed.firstName || "")
        setLastName(parsed.lastName || "")
        setEmail(parsed.email || "")
        setAddress(parsed.address || "")
        setCity(parsed.city || "")
        setRegion(parsed.region || "")
        setCountry(parsed.country || "CA")
        setPostalCode(parsed.postalCode || "")
        if (data.role === "contractor") {
          setCompanyName(parsed.companyName || "")
          setCompanySize(parsed.companySize || "2-10")
          setBusinessAddress(parsed.businessAddress || "")
          setBusinessCity(parsed.businessCity || "")
          setBusinessRegion(parsed.businessRegion || "")
          setBusinessCountry(parsed.businessCountry || "CA")
          setBusinessPostalCode(parsed.businessPostalCode || "")
          setRadiusKm(parsed.radiusKm || "50")
          setServices(parsed.services || [])
        }
      } catch (err) {
        console.error("[v0] Error loading saved form data:", err)
      }
    }
  }, [])

  useEffect(() => {
    const formData = {
      firstName,
      lastName,
      email,
      address,
      city,
      region,
      country,
      postalCode,
      ...(data.role === "contractor" && {
        companyName,
        companySize,
        businessAddress,
        businessCity,
        businessRegion,
        businessCountry,
        businessPostalCode,
        radiusKm,
        services,
      }),
    }
    sessionStorage.setItem("onboarding_form_data", JSON.stringify(formData))
  }, [
    firstName,
    lastName,
    email,
    address,
    city,
    region,
    country,
    postalCode,
    companyName,
    companySize,
    businessAddress,
    businessCity,
    businessRegion,
    businessCountry,
    businessPostalCode,
    radiusKm,
    services,
    data.role,
  ])

  useEffect(() => {
    const newRegions = getRegionsForCountry(country)
    setRegion(newRegions[0])
  }, [country])

  useEffect(() => {
    const newBusinessRegions = getRegionsForCountry(businessCountry)
    setBusinessRegion(newBusinessRegions[0])
  }, [businessCountry])

  const handleSameAsPersonalAddress = (checked: boolean) => {
    setSameAsPersonalAddress(checked)
    if (checked) {
      setBusinessAddress(address)
      setBusinessCity(city)
      setBusinessRegion(region)
      setBusinessCountry(country)
      setBusinessPostalCode(postalCode)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (!data.phone || !validateE164Phone(data.phone)) {
        throw new Error(
          `Phone number must be in E.164 format (e.g., +13062225100). Current value: ${data.phone || "missing"}`,
        )
      }

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match")
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters")
      }

      const verificationCode = sessionStorage.getItem("verification_code")
      if (!verificationCode) {
        throw new Error("Verification code not found. Please verify your phone number again.")
      }

      console.log("[v0] Creating user account with real data")
      console.log("[v0] Phone:", data.phone)
      console.log("[v0] Role:", data.role)
      console.log("[v0] Verification code:", verificationCode ? "present" : "missing")

      const formattedPostalCode = formatPostalCode(postalCode, country)
      const formattedBusinessPostalCode = formatPostalCode(businessPostalCode, businessCountry)

      const formData: any = {
        full_name: `${firstName} ${lastName}`,
        email,
        address,
        city,
        region,
        country,
        postal_code: formattedPostalCode,
      }

      if (data.role === "contractor") {
        formData.company_name = companyName
        formData.company_size = companySize
        formData.business_address = businessAddress
        formData.business_city = businessCity
        formData.business_region = businessRegion
        formData.business_country = businessCountry
        formData.business_postal_code = formattedBusinessPostalCode
        formData.radius_km = Number.parseInt(radiusKm)
      }

      console.log("[v0] Step 1: Verifying phone with form data")
      const verifyResponse = await fetch(`${API_BASE_URL}/api/users/verify-phone`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          phone_number: data.phone,
          role: data.role,
          verification_code: verificationCode,
          form_data: formData,
        }),
      })

      if (!verifyResponse.ok) {
        const verifyError = await verifyResponse.json()
        console.error("[v0] Phone verification failed:", verifyError)
        throw new Error(verifyError.error || "Phone verification failed")
      }

      const verifyResult = await verifyResponse.json()
      console.log("[v0] Phone verified successfully with form data")

      if (verifyResult.token) {
        sessionStorage.setItem("verification_token", verifyResult.token)
      }

      console.log("[v0] Step 2: Creating user account")
      const signupPayload: any = {
        phone_number: data.phone,
        password,
        role: data.role,
        full_name: `${firstName} ${lastName}`,
        email,
        postal_code: formattedPostalCode,
      }

      const termsAccepted = sessionStorage.getItem("terms_accepted")
      const termsAcceptedAt = sessionStorage.getItem("terms_accepted_at")
      if (termsAccepted === "true" && termsAcceptedAt) {
        signupPayload.terms_accepted = true
        signupPayload.terms_accepted_at = termsAcceptedAt
        console.log("[v0] Including terms acceptance in signup:", {
          terms_accepted: true,
          terms_accepted_at: termsAcceptedAt,
        })
      }

      if (data.role === "homeowner") {
        signupPayload.address = address
        signupPayload.city = city
        signupPayload.region = region
        signupPayload.country = country
      }

      if (data.role === "contractor") {
        signupPayload.address = address
        signupPayload.city = city
        signupPayload.region = region
        signupPayload.country = country
        signupPayload.company_name = companyName
        signupPayload.company_size = companySize
        signupPayload.business_address = businessAddress
        signupPayload.business_city = businessCity
        signupPayload.business_region = businessRegion
        signupPayload.business_country = businessCountry
        signupPayload.business_postal_code = formattedBusinessPostalCode
        signupPayload.radius_km = Number.parseInt(radiusKm)
      }

      console.log("[v0] Full signup payload:", JSON.stringify(signupPayload, null, 2))

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
        console.error("[v0] Signup failed with status:", response.status)
        console.error("[v0] Error response:", JSON.stringify(result, null, 2))
        throw new Error(result.error || result.message || "Failed to create account")
      }

      console.log("[v0] Account created successfully")
      console.log("[v0] Signup response:", JSON.stringify(result, null, 2))

      console.log("[v0] Step 3: Logging in to get authentication token")
      const loginResponse = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({
          email,
          password,
          remember_me: false,
        }),
      })

      if (!loginResponse.ok) {
        const loginError = await loginResponse.json()
        console.error("[v0] Login after signup failed:", loginError)
        throw new Error("Account created but login failed. Please try logging in manually.")
      }

      const loginResult = await loginResponse.json()
      console.log("[v0] Login successful, token received")

      console.log("[v0] Clearing all localStorage data before storing new auth data")
      localStorage.clear()

      if (loginResult.token) {
        localStorage.setItem("token", loginResult.token)
        console.log("[v0] Token stored in localStorage")
      } else {
        throw new Error("Login successful but no token received")
      }

      if (loginResult.user) {
        localStorage.setItem("user", JSON.stringify(loginResult.user))
        console.log("[v0] User stored in localStorage:", JSON.stringify(loginResult.user))
        console.log("[v0] User role from response:", loginResult.user.role)
        setUser(loginResult.user)
      } else {
        throw new Error("Login successful but no user data received")
      }

      if (data.role === "contractor" && services.length > 0) {
        console.log("[v0] Sending services to /api/users/services:", services)
        try {
          const servicesResponse = await fetch(`${API_BASE_URL}/api/users/services`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${loginResult.token}`,
              "ngrok-skip-browser-warning": "true",
            },
            body: JSON.stringify({ services }),
          })

          if (!servicesResponse.ok) {
            const servicesError = await servicesResponse.json()
            console.error("[v0] Failed to save services:", servicesError)
            console.log("[v0] Services could not be saved, but account was created successfully")
          } else {
            console.log("[v0] Services saved successfully")
          }
        } catch (servicesErr) {
          console.error("[v0] Error saving services:", servicesErr)
          console.log("[v0] Continuing despite services error")
        }
      }

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
        firstName,
        lastName,
        email,
        address,
        city,
        region,
        country,
        postalCode: formattedPostalCode,
        token: loginResult.token,
        userId: loginResult.user?.id,
        ...(data.role === "contractor" && {
          companyName,
          companySize,
          businessAddress,
          businessCity,
          businessRegion,
          businessCountry,
          businessPostalCode: formattedBusinessPostalCode,
          radiusKm: Number.parseInt(radiusKm),
          services,
        }),
      })

      const targetDashboard = loginResult.user?.is_admin
        ? "/dashboard/admin"
        : data.role === "homeowner"
          ? "/dashboard/homeowner"
          : "/dashboard/contractor"
      console.log("[v0] Redirecting to dashboard:", targetDashboard)
      router.push(targetDashboard)
    } catch (err) {
      console.error("[v0] Error creating account:", err)
      setError(err instanceof Error ? err.message : "Failed to create account. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0D3D42] flex flex-col relative">
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
                <Image src="/images/logo-white.png" alt="HomeHero" width={160} height={40} className="h-10 w-auto" />
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
          <div className="w-full max-w-2xl">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              <div className="flex justify-center mb-6">
                <div
                  className={`w-16 h-16 ${data.role === "contractor" ? "bg-[#e2bb12]" : "bg-[#03353a]"} rounded-full flex items-center justify-center`}
                >
                  <User className={`h-8 w-8 ${data.role === "contractor" ? "text-[#03353a]" : "text-white"}`} />
                </div>
              </div>

              <h1 className="text-3xl font-bold text-center mb-2 text-[#03353a]">
                {data.role === "contractor" ? "Create Your Contractor Account" : "Create Your Account"}
              </h1>
              <p className="text-center text-gray-600 mb-8">
                {data.role === "contractor"
                  ? "Tell us about yourself and your business"
                  : "Tell us about yourself to get started"}
              </p>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600 text-center">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03353a] focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03353a] focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03353a] focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03353a] focus:border-transparent outline-none transition-all"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <input
                      type="text"
                      id="city"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03353a] focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
                      {getRegionLabel(country)}
                    </label>
                    <select
                      id="region"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03353a] focus:border-transparent outline-none transition-all bg-white cursor-pointer"
                      required
                    >
                      {getRegionsForCountry(country).map((r) => (
                        <option key={r} value={r}>
                          {r}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <select
                      id="country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03353a] focus:border-transparent outline-none transition-all bg-white cursor-pointer"
                      required
                    >
                      <option value="CA">Canada</option>
                      <option value="US">United States</option>
                      <option value="UK">United Kingdom</option>
                      <option value="AU">Australia</option>
                      <option value="NZ">New Zealand</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                      {getPostalCodeLabel(country)}
                    </label>
                    <input
                      type="text"
                      id="postalCode"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value.toUpperCase())}
                      onBlur={(e) => setPostalCode(formatPostalCode(e.target.value, country))}
                      placeholder={getPostalCodePlaceholder(country)}
                      maxLength={country === "CA" ? 7 : country === "UK" ? 8 : 10}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03353a] focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Create Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03353a] focus:border-transparent outline-none transition-all pr-12"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Must be at least 6 characters</p>
                  </div>

                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        id="confirmPassword"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03353a] focus:border-transparent outline-none transition-all pr-12"
                        required
                        minLength={6}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {data.role === "contractor" && (
                  <div className="border-t border-gray-200 pt-6 mt-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Business Information</h2>

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                          Company Name
                        </label>
                        <input
                          type="text"
                          id="companyName"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e2bb12] focus:border-transparent outline-none transition-all"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="companySize" className="block text-sm font-medium text-gray-700 mb-2">
                          Company Size
                        </label>
                        <select
                          id="companySize"
                          value={companySize}
                          onChange={(e) => setCompanySize(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e2bb12] focus:border-transparent outline-none transition-all"
                          required
                        >
                          <option value="1">1</option>
                          <option value="2-10">2-10</option>
                          <option value="11-50">11-50</option>
                          <option value="51-200">51-200</option>
                          <option value="200+">200+</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="sameAsPersonalAddress"
                          checked={sameAsPersonalAddress}
                          onChange={(e) => handleSameAsPersonalAddress(e.target.checked)}
                          className="h-4 w-4 text-[#e2bb12] focus:ring-[#e2bb12] border-gray-300 rounded cursor-pointer"
                        />
                        <label
                          htmlFor="sameAsPersonalAddress"
                          className="text-sm font-medium text-gray-700 cursor-pointer"
                        >
                          Same as personal address
                        </label>
                      </div>

                      <div>
                        <label htmlFor="businessAddress" className="block text-sm font-medium text-gray-700 mb-2">
                          Business Address
                        </label>
                        <input
                          type="text"
                          id="businessAddress"
                          value={businessAddress}
                          onChange={(e) => setBusinessAddress(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e2bb12] focus:border-transparent outline-none transition-all"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="businessCity" className="block text-sm font-medium text-gray-700 mb-2">
                            City
                          </label>
                          <input
                            type="text"
                            id="businessCity"
                            value={businessCity}
                            onChange={(e) => setBusinessCity(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e2bb12] focus:border-transparent outline-none transition-all"
                            required
                          />
                        </div>

                        <div>
                          <label htmlFor="businessRegion" className="block text-sm font-medium text-gray-700 mb-2">
                            {getRegionLabel(businessCountry)}
                          </label>
                          <select
                            id="businessRegion"
                            value={businessRegion}
                            onChange={(e) => setBusinessRegion(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e2bb12] focus:border-transparent outline-none transition-all bg-white cursor-pointer"
                            required
                          >
                            {getRegionsForCountry(businessCountry).map((r) => (
                              <option key={r} value={r}>
                                {r}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="businessCountry" className="block text-sm font-medium text-gray-700 mb-2">
                            Country
                          </label>
                          <select
                            id="businessCountry"
                            value={businessCountry}
                            onChange={(e) => setBusinessCountry(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e2bb12] focus:border-transparent outline-none transition-all bg-white cursor-pointer"
                            required
                          >
                            <option value="CA">Canada</option>
                            <option value="US">United States</option>
                            <option value="UK">United Kingdom</option>
                            <option value="AU">Australia</option>
                            <option value="NZ">New Zealand</option>
                          </select>
                        </div>

                        <div>
                          <label htmlFor="businessPostalCode" className="block text-sm font-medium text-gray-700 mb-2">
                            {getPostalCodeLabel(businessCountry)}
                          </label>
                          <input
                            type="text"
                            id="businessPostalCode"
                            value={businessPostalCode}
                            onChange={(e) => setBusinessPostalCode(e.target.value.toUpperCase())}
                            onBlur={(e) => setBusinessPostalCode(formatPostalCode(e.target.value, businessCountry))}
                            placeholder={getPostalCodePlaceholder(businessCountry)}
                            maxLength={businessCountry === "CA" ? 7 : businessCountry === "UK" ? 8 : 10}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e2bb12] focus:border-transparent outline-none transition-all"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="radiusKm" className="block text-sm font-medium text-gray-700 mb-2">
                          Service Radius (km)
                        </label>
                        <input
                          type="number"
                          id="radiusKm"
                          value={radiusKm}
                          onChange={(e) => setRadiusKm(e.target.value)}
                          min="1"
                          max="500"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e2bb12] focus:border-transparent outline-none transition-all"
                          required
                        />
                      </div>

                      <div>
                        <label htmlFor="services" className="block text-sm font-medium text-gray-700 mb-2">
                          Services Offered
                        </label>
                        <p className="text-sm text-gray-500 mb-2">Select all services you offer</p>
                        <ServicesSelector selectedServices={services} onChange={setServices} />
                      </div>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full px-6 py-3 ${data.role === "contractor" ? "bg-[#e2bb12] text-[#03353a]" : "bg-[#03353a] text-white"} rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isLoading ? "Creating Account..." : "Create Account & Continue"}
                </button>

                <p className="text-center text-sm text-gray-600 mt-4">
                  Have an account already?{" "}
                  <Link href="/login" className="text-[#328d87] hover:underline font-medium">
                    Log in
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
