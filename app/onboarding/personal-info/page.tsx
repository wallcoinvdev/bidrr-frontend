"use client"

import type React from "react"
import { useSearchParams } from "next/navigation"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, User, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"
import { useOnboarding } from "@/contexts/onboarding-context"
import { useAuth } from "@/lib/auth-context"
import { ServicesSelector } from "@/components/services-selector"
import { getRegionsForCountry, getPostalCodeLabel, getRegionLabel, getPostalCodePlaceholder } from "@/lib/country-data"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.bidrr.ca"

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
  const searchParams = useSearchParams()
  const roleFromUrl = searchParams.get("role")

  const [country, setCountry] = useState(data.country || "CA")
  const [businessCountry, setBusinessCountry] = useState(data.businessCountry || data.country || "CA")

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [countryCode, setCountryCode] = useState("+1-CA")
  const [phoneNumber, setPhoneNumber] = useState("")
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
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    console.log("[v0] ========== ONBOARDING FORM LOADED ==========")
    console.log("[v0] PersonalInformation mounted")
    console.log("[v0] Role from URL:", roleFromUrl)
    console.log("[v0] Current role from context:", data.role)
    console.log("[v0] Current country from context:", data.country)
    console.log("[v0] Full onboarding data:", JSON.stringify(data, null, 2))
    console.log("[v0] localStorage state:", {
      token: !!localStorage.getItem("token"),
      user: !!localStorage.getItem("user"),
      onboarding_data: !!localStorage.getItem("homehero_onboarding_data"),
    })
    console.log("[v0] sessionStorage state:", {
      form_data: !!sessionStorage.getItem("onboarding_form_data"),
      terms_accepted: sessionStorage.getItem("terms_accepted"),
    })
    console.log("[v0] Timestamp:", new Date().toISOString())
    console.log("[v0] ================================================")

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
    console.log("[v0] Role from URL:", roleFromUrl)
    console.log("[v0] Current role from context:", data.role)

    if (roleFromUrl && (roleFromUrl === "homeowner" || roleFromUrl === "contractor")) {
      updateData({ role: roleFromUrl })
    }
  }, [roleFromUrl])

  useEffect(() => {
    const savedFormData = sessionStorage.getItem("onboarding_form_data")
    if (savedFormData) {
      try {
        const parsed = JSON.parse(savedFormData)
        setFirstName(parsed.firstName || "")
        setLastName(parsed.lastName || "")
        setEmail(parsed.email || "")
        setCountryCode(parsed.countryCode || "+1-CA")
        setPhoneNumber(parsed.phoneNumber || "")
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
      countryCode,
      phoneNumber,
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
    countryCode,
    phoneNumber,
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
    console.log("[v0] ========== FORM SUBMISSION START ==========")
    console.log("[v0] Form submitted by user")
    console.log("[v0] Role:", data.role)
    console.log("[v0] Email:", email)
    console.log("[v0] Phone:", phoneNumber)
    console.log("[v0] Terms accepted:", acceptedTerms)
    console.log("[v0] Timestamp:", new Date().toISOString())

    setIsLoading(true)
    setError(null)

    try {
      if (!acceptedTerms) {
        throw new Error("You must agree to the Terms of Service to continue")
      }

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match")
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters")
      }

      if (!phoneNumber || phoneNumber.length < 10) {
        throw new Error("Please enter a valid phone number")
      }

      const formattedPostalCode = formatPostalCode(postalCode, country)
      const formattedBusinessPostalCode = formatPostalCode(businessPostalCode, businessCountry)
      const actualCountryCode = countryCode.split("-")[0]
      const fullPhoneNumber = `${actualCountryCode}${phoneNumber}`

      const formData: any = {
        full_name: `${firstName} ${lastName}`,
        email,
        password,
        phone_number: fullPhoneNumber,
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
        formData.services = services
      }

      console.log("[v0] Saving form data to sessionStorage")
      console.log("[v0] Form data keys:", Object.keys(formData))
      sessionStorage.setItem("onboarding_form_data", JSON.stringify(formData))

      sessionStorage.setItem("terms_accepted", "true")
      sessionStorage.setItem("terms_accepted_at", new Date().toISOString())
      console.log("[v0] Terms acceptance saved to sessionStorage")

      updateData({
        firstName,
        lastName,
        email,
        phone: fullPhoneNumber,
        countryCode,
        address,
        city,
        region,
        country,
        postalCode: formattedPostalCode,
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

      console.log("[v0] Updated onboarding context")
      console.log("[v0] Redirecting to:", `/verify-phone/${data.role}`)
      console.log("[v0] ========== FORM SUBMISSION SUCCESS ==========")

      router.push(`/verify-phone/${data.role}`)
    } catch (err) {
      console.error("[v0] ========== FORM SUBMISSION ERROR ==========")
      console.error("[v0] Error:", err)
      console.error("[v0] Error type:", err instanceof Error ? err.constructor.name : typeof err)
      console.error("[v0] Error message:", err instanceof Error ? err.message : String(err))
      console.error("[v0] ===============================================")
      setError(err instanceof Error ? err.message : "Failed to save information. Please try again.")
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
                {data.role === "contractor" ? "Create Your Contractor Account" : "Create Your Customer Account"}
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
                      First Name <span className="text-red-500">*</span>
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
                      Last Name <span className="text-red-500">*</span>
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
                    Email Address <span className="text-red-500">*</span>
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
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={countryCode}
                      onChange={(e) => setCountryCode(e.target.value)}
                      className="w-20 sm:w-24 px-2 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03353a] focus:border-transparent outline-none transition-all bg-white text-sm cursor-pointer flex-shrink-0"
                    >
                      <option value="+1-CA">🇨🇦 +1</option>
                      {/* <option value="+1-US">🇺🇸 +1</option>
                      <option value="+44-GB">🇬🇧 +44</option>
                      <option value="+61-AU">🇦🇺 +61</option>
                      <option value="+64-NZ">🇳🇿 +64</option> */}
                    </select>
                    <input
                      type="tel"
                      id="phone"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                      placeholder="5551234567"
                      maxLength={10}
                      className="flex-1 min-w-0 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03353a] focus:border-transparent outline-none transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address <span className="text-red-500">*</span>
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
                      City <span className="text-red-500">*</span>
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
                      {getRegionLabel(country)} <span className="text-red-500">*</span>
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
                      Country <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="country"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03353a] focus:border-transparent outline-none transition-all bg-white cursor-pointer"
                      required
                    >
                      <option value="CA">Canada</option>
                      {/* <option value="US">United States</option>
                      <option value="UK">United Kingdom</option>
                      <option value="AU">Australia</option>
                      <option value="NZ">New Zealand</option> */}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                      {getPostalCodeLabel(country)} <span className="text-red-500">*</span>
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
                      Create Password <span className="text-red-500">*</span>
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
                      Confirm Password <span className="text-red-500">*</span>
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
                          Company Name <span className="text-red-500">*</span>
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
                          Company Size <span className="text-red-500">*</span>
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
                          Business Address <span className="text-red-500">*</span>
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
                            City <span className="text-red-500">*</span>
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
                            {getRegionLabel(businessCountry)} <span className="text-red-500">*</span>
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
                            Country <span className="text-red-500">*</span>
                          </label>
                          <select
                            id="businessCountry"
                            value={businessCountry}
                            onChange={(e) => setBusinessCountry(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e2bb12] focus:border-transparent outline-none transition-all bg-white cursor-pointer"
                            required
                          >
                            <option value="CA">Canada</option>
                            {/* <option value="US">United States</option>
                            <option value="UK">United Kingdom</option>
                            <option value="AU">Australia</option>
                            <option value="NZ">New Zealand</option> */}
                          </select>
                        </div>

                        <div>
                          <label htmlFor="businessPostalCode" className="block text-sm font-medium text-gray-700 mb-2">
                            {getPostalCodeLabel(businessCountry)} <span className="text-red-500">*</span>
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
                          Service Radius (km) <span className="text-red-500">*</span>
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
                          Services Offered <span className="text-red-500">*</span>
                        </label>
                        <p className="text-sm text-gray-500 mb-2">Select all services you offer</p>
                        <ServicesSelector selectedServices={services} onChange={setServices} />
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3 pt-4">
                  <input
                    type="checkbox"
                    id="acceptTerms"
                    checked={acceptedTerms}
                    onChange={(e) => setAcceptedTerms(e.target.checked)}
                    className="mt-1 h-4 w-4 text-[#03353a] focus:ring-[#03353a] border-gray-300 rounded cursor-pointer"
                    required
                  />
                  <label htmlFor="acceptTerms" className="text-sm text-gray-700 cursor-pointer">
                    <span className="text-red-500">*</span> I agree to the{" "}
                    <button
                      type="button"
                      onClick={() => setShowTermsModal(true)}
                      className="text-[#328d87] hover:underline font-medium"
                    >
                      Terms of Service
                    </button>{" "}
                    for using Bidrr
                  </label>
                </div>

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

        <Dialog open={showTermsModal} onOpenChange={setShowTermsModal}>
          <DialogContent className="max-w-4xl max-h-[80vh]">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold">Terms of Service</DialogTitle>
              <DialogDescription>Last updated: January 2025</DialogDescription>
            </DialogHeader>
            <ScrollArea className="h-[60vh] pr-4">
              <div className="space-y-6 text-sm">
                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Agreement to Terms</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Welcome to Bidrr. By accessing or using our platform, you agree to be bound by these Terms of
                    Service and all applicable laws and regulations. If you do not agree with any of these terms, you
                    are prohibited from using this platform.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Platform Description</h3>
                  <p className="text-gray-700 leading-relaxed">
                    Bidrr is an online marketplace that connects customers seeking home services with qualified service
                    professionals (contractors). We provide the platform for these connections but are not a party to
                    the actual service agreements between customers and contractors.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">User Accounts</h3>
                  <h4 className="text-base font-semibold text-gray-900 mb-2">Account Creation</h4>
                  <p className="text-gray-700 leading-relaxed mb-2">
                    To use Bidrr, you must create an account and provide accurate, complete information. You are
                    responsible for:
                  </p>
                  <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-1">
                    <li>Maintaining the confidentiality of your account credentials</li>
                    <li>All activities that occur under your account</li>
                    <li>Notifying us immediately of any unauthorized access</li>
                    <li>Ensuring your account information remains accurate and up-to-date</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">User Responsibilities</h3>
                  <h4 className="text-base font-semibold text-gray-900 mb-2">Customer Responsibilities</h4>
                  <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-1">
                    <li>Provide accurate project descriptions and requirements</li>
                    <li>Respond to contractor inquiries in a timely manner</li>
                    <li>Pay for services as agreed upon with contractors</li>
                    <li>Provide honest reviews and feedback</li>
                    <li>Comply with all applicable local laws and regulations</li>
                  </ul>

                  <h4 className="text-base font-semibold text-gray-900 mb-2">Contractor Responsibilities</h4>
                  <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-1">
                    <li>Provide valid licenses, insurance, and certifications upon customer request</li>
                    <li>Provide accurate service descriptions and pricing</li>
                    <li>Complete work professionally and as agreed</li>
                    <li>Respond to customer inquiries promptly</li>
                    <li>Comply with all applicable laws, regulations, and safety standards</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Prohibited Activities</h3>
                  <p className="text-gray-700 leading-relaxed mb-2">You may not:</p>
                  <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-1">
                    <li>Provide false or misleading information</li>
                    <li>Impersonate another person or entity</li>
                    <li>Engage in fraudulent activities</li>
                    <li>Harass, abuse, or harm other users</li>
                    <li>Circumvent platform fees by conducting transactions off-platform</li>
                    <li>Use automated systems to access the platform</li>
                    <li>Violate any applicable laws or regulations</li>
                  </ul>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Limitation of Liability</h3>
                  <p className="text-gray-700 leading-relaxed mb-2">
                    Bidrr is a platform that facilitates connections between customers and contractors. We do not:
                  </p>
                  <ul className="list-disc pl-6 mb-4 text-gray-700 space-y-1">
                    <li>Employ or control contractors</li>
                    <li>Guarantee the quality of services provided</li>
                    <li>Verify all contractor credentials (though we encourage verification)</li>
                    <li>Assume liability for work performed by contractors</li>
                  </ul>
                  <p className="text-gray-700 leading-relaxed">
                    To the maximum extent permitted by law, Bidrr shall not be liable for any indirect, incidental,
                    special, or consequential damages arising from your use of the platform.
                  </p>
                </section>

                <section>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact Us</h3>
                  <p className="text-gray-700 leading-relaxed mb-2">
                    If you have questions about these Terms of Service, please contact us at{" "}
                    <a href="mailto:support@bidrr.ca" className="text-[#328d87] hover:underline">
                      support@bidrr.ca
                    </a>
                  </p>
                </section>
              </div>
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}
