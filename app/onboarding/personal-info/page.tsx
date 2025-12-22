"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useOnboarding } from "@/contexts/onboarding-context"
import { Eye, EyeOff } from "lucide-react"
import { trackFormError, trackFormField } from "@/lib/analytics-client"
import { ServicesSelector } from "@/components/services-selector"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { ArrowLeft, User } from "lucide-react" // Added imports
import { TermsModal } from "@/components/terms-modal" // Added imports

const trackEvent = (eventName: string, eventData: any) => {
  console.log(`Event tracked: ${eventName}`, eventData)
}

const CANADIAN_PROVINCES = [
  { value: "Alberta", label: "Alberta" },
  { value: "British Columbia", label: "British Columbia" },
  { value: "Manitoba", label: "Manitoba" },
  { value: "New Brunswick", label: "New Brunswick" },
  { value: "Newfoundland and Labrador", label: "Newfoundland and Labrador" },
  { value: "Nova Scotia", label: "Nova Scotia" },
  { value: "Ontario", label: "Ontario" },
  { value: "Prince Edward Island", label: "Prince Edward Island" },
  { value: "Quebec", label: "Quebec" },
  { value: "Saskatchewan", label: "Saskatchewan" },
  { value: "Northwest Territories", label: "Northwest Territories" },
  { value: "Nunavut", label: "Nunavut" },
  { value: "Yukon", label: "Yukon" },
]

const IS_CANADA_ONLY_FORM = true

export default function PersonalInfoPage() {
  const router = useRouter()
  const { data, updateData } = useOnboarding()
  const searchParams = useSearchParams()
  const roleFromUrl = searchParams.get("role")
  const emailFromUrl = searchParams.get("email")
  const tempEmailFromUrl = searchParams.get("temp_email")

  const hasTrackedStart = useRef(false)

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [tempEmail, setTempEmail] = useState<string | null>(null)
  const [countryCode, setCountryCode] = useState("+1-CA")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [region, setRegion] = useState("")
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
  const [businessCountry, setBusinessCountry] = useState("Canada") // Added state for business country
  const [sameAsPersonalAddress, setSameAsPersonalAddress] = useState(false)
  const [radiusKm, setRadiusKm] = useState("50")
  const [services, setServices] = useState<string[]>([])
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const [showTermsModal, setShowTermsModal] = useState(false)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [servicesError, setServicesError] = useState<string | null>(null)
  const [hasInvalidServiceInput, setHasInvalidServiceInput] = useState(false)

  const [businessPostalCodeTouched, setBusinessPostalCodeTouched] = useState(false)

  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const trackedFields = useRef<Set<string>>(new Set())

  // Helper to validate postal code format
  const isValidPostalCode = (code: string) => {
    return /^[A-Za-z][0-9][A-Za-z] [0-9][A-Za-z][0-9]$/.test(code)
  }

  const formatPostalCode = (value: string) => {
    const clean = value
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, "")
      .slice(0, 6)
    if (clean.length > 3) {
      return clean.slice(0, 3) + " " + clean.slice(3)
    }
    return clean
  }

  // Helper to format phone number for input mask
  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    let formatted = ""
    if (cleaned.length > 0) {
      formatted += `(${cleaned.substring(0, 3)})`
    }
    if (cleaned.length > 3) {
      formatted += ` ${cleaned.substring(3, 6)}`
    }
    if (cleaned.length > 6) {
      formatted += `-${cleaned.substring(6, 10)}`
    }
    return formatted
  }

  const validateField = (fieldName: string, value: any): boolean => {
    switch (fieldName) {
      case "firstName":
        return value.trim().length > 0
      case "lastName":
        return data.role === "homeowner" || value.trim().length > 0
      case "email":
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      case "password":
        return value.length >= 6
      case "confirmPassword":
        return value === password
      case "acceptedTerms":
        return value === true
      case "phoneNumber":
        return data.role === "homeowner" || (value && value.replace(/\D/g, "").length >= 10)
      case "businessPostalCode":
        return data.role === "homeowner" || isValidPostalCode(value)
      case "services":
        return data.role === "homeowner" || (Array.isArray(value) && value.length > 0)
      case "region":
        return data.role === "homeowner" || (value && value !== "")
      case "businessRegion":
        return data.role === "homeowner" || (value && value !== "")
      case "companyName":
        return data.role === "homeowner" || value.trim().length > 0
      case "businessAddress":
        return data.role === "homeowner" || value.trim().length > 0
      case "businessCity":
        return data.role === "homeowner" || value.trim().length > 0
      case "businessCountry":
        return data.role === "homeowner" || (value && value !== "")
      default:
        return true
    }
  }

  const isFormValid = () => {
    if (data.role === "contractor" && (!region || region === "")) return false
    if (data.role === "contractor" && (!companyName || companyName === "")) return false
    if (data.role === "contractor" && (!businessAddress || businessAddress.trim() === "")) return false
    if (data.role === "contractor" && (!businessCity || businessCity.trim() === "")) return false
    if (!acceptedTerms) return false
    if (password !== confirmPassword) return false
    if (password.length < 6) return false
    if (data.role === "contractor" && (!phoneNumber || phoneNumber.length < 10)) return false
    if (data.role === "contractor" && (!businessRegion || businessRegion === "")) return false
    if (data.role === "contractor" && services.length === 0) return false
    if (!isValidPostalCode(businessPostalCode)) return false
    if (hasInvalidServiceInput) return false
    return true
  }

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    if (!hasTrackedStart.current) {
      const role = roleFromUrl || data.role || "unknown"
      trackEvent("onboarding_started", { role })
      hasTrackedStart.current = true
    }
  }, [roleFromUrl, data.role])

  useEffect(() => {
    if (roleFromUrl && (roleFromUrl === "homeowner" || roleFromUrl === "contractor")) {
      updateData({ role: roleFromUrl })
    }
  }, [roleFromUrl])

  useEffect(() => {
    if (emailFromUrl) {
      console.log("[v0] Email from URL:", emailFromUrl)
      setEmail(emailFromUrl)
      console.log("[v0] Email state set to:", emailFromUrl)
    } else {
      console.log("[v0] No email parameter in URL")
    }
    if (tempEmailFromUrl) {
      console.log("[v0] Temp email from URL:", tempEmailFromUrl)
      setTempEmail(tempEmailFromUrl)
    }
  }, [emailFromUrl, tempEmailFromUrl])

  useEffect(() => {
    const savedFormData = sessionStorage.getItem("onboarding_form_data")
    if (savedFormData) {
      try {
        const parsedData = JSON.parse(savedFormData)
        console.log("[v0] Loading saved form data:", parsedData)

        if (parsedData.first_name) setFirstName(parsedData.first_name)
        if (parsedData.last_name) setLastName(parsedData.last_name)
        if (parsedData.email) setEmail(parsedData.email)
        if (parsedData.phone_number) setPhoneNumber(parsedData.phone_number)
        if (parsedData.postal_code) setBusinessPostalCode(parsedData.postal_code) // Updated line
        if (parsedData.password) setPassword(parsedData.password)
        if (parsedData.password) setConfirmPassword(parsedData.password)
        if (parsedData.city) setCity(parsedData.city)
        if (parsedData.region) setRegion(parsedData.region)
        if (parsedData.address) setAddress(parsedData.address)
        if (parsedData.country_code) setCountryCode(parsedData.country_code)

        // Contractor fields
        if (parsedData.company_name) setCompanyName(parsedData.company_name)
        if (parsedData.company_size) setCompanySize(parsedData.company_size)
        if (parsedData.business_address) setBusinessAddress(parsedData.business_address)
        if (parsedData.business_city) setBusinessCity(parsedData.business_city)
        if (parsedData.business_region) setBusinessRegion(parsedData.business_region)
        if (parsedData.business_postal_code) setBusinessPostalCode(parsedData.business_postal_code)
        if (parsedData.radius_km) setRadiusKm(parsedData.radius_km)
        if (parsedData.services) setServices(parsedData.services)

        console.log("[v0] Form data loaded from sessionStorage")
      } catch (error) {
        console.error("[v0] Error loading saved form data:", error)
      }
    }
  }, [])

  const handleFieldBlur = (fieldName: string, value: string) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }))

    if (value && value.trim() !== "" && !trackedFields.current.has(fieldName)) {
      trackedFields.current.add(fieldName)
      trackFormField(fieldName, data.role || "unknown")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setServicesError(null)

    trackEvent("form_submitted", { role: data.role || "unknown" })

    const allTouched: Record<string, boolean> = {
      firstName: true,
      email: true,
      password: true,
      confirmPassword: true,
      acceptedTerms: true,
    }

    if (data.role === "contractor") {
      allTouched.phoneNumber = true
      allTouched.businessPostalCode = true
      allTouched.services = true
      allTouched.companyName = true
      allTouched.businessAddress = true
      allTouched.businessCity = true
      allTouched.businessRegion = true
      allTouched.businessCountry = true
      allTouched.lastName = true
    }

    setTouched(allTouched)

    const errors: Record<string, boolean> = {}
    let hasErrors = false

    if (!firstName.trim()) {
      errors.firstName = true
      hasErrors = true
      trackFormError("first_name", "empty", data.role || "unknown")
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = true
      hasErrors = true
      trackFormError("email", "invalid", data.role || "unknown")
    }
    if (password.length < 6) {
      errors.password = true
      hasErrors = true
      trackFormError("password", "too_short", data.role || "unknown")
    }
    if (password !== confirmPassword) {
      errors.confirmPassword = true
      hasErrors = true
      trackFormError("password", "mismatch", data.role || "unknown")
    }
    if (!acceptedTerms) {
      errors.acceptedTerms = true
      hasErrors = true
      trackFormError("terms", "not_accepted", data.role || "unknown")
    }

    if (data.role === "contractor") {
      if (!lastName || lastName.trim() === "") {
        errors.lastName = true
        hasErrors = true
        trackFormError("last_name", "empty", data.role)
      }
      if (!phoneNumber || phoneNumber.replace(/\D/g, "").length < 10) {
        errors.phoneNumber = true
        hasErrors = true
        trackFormError("phone", "invalid_length", data.role)
      }
      if (!isValidPostalCode(businessPostalCode)) {
        errors.businessPostalCode = true
        hasErrors = true
        trackFormError("business_postal_code", "invalid_format", data.role)
      }
      if (!businessRegion || businessRegion === "") {
        errors.businessRegion = true
        hasErrors = true
        trackFormError("business_region", "empty", data.role)
      }
      if (!businessCountry || businessCountry === "") {
        errors.businessCountry = true
        hasErrors = true
        trackFormError("business_country", "empty", data.role)
      }
      if (!companyName || companyName === "") {
        errors.companyName = true
        hasErrors = true
        trackFormError("company_name", "empty", data.role)
      }
      if (!businessAddress || businessAddress.trim() === "") {
        errors.businessAddress = true
        hasErrors = true
        trackFormError("business_address", "empty", data.role)
      }
      if (!businessCity || businessCity.trim() === "") {
        errors.businessCity = true
        hasErrors = true
        trackFormError("business_city", "empty", data.role)
      }
      if (services.length === 0) {
        setServicesError("Please select at least one service")
        hasErrors = true
        trackFormError("services", "empty", data.role)
      }
      if (hasInvalidServiceInput) {
        errors.services = true
        hasErrors = true
        trackFormError("services", "invalid_input", data.role)
      }
    }

    if (hasErrors) {
      console.log("[v0] Form validation failed. Errors:", errors)
      setFieldErrors(errors)
      setError("Please fill out all required fields correctly")
      setIsLoading(false)
      return
    }

    try {
      const emailCheckResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/check-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ email }),
      })

      const emailCheckResult = await emailCheckResponse.json()

      if (!emailCheckResponse.ok && emailCheckResult.exists) {
        setError("EMAIL_REGISTERED")
        setFieldErrors({ ...fieldErrors, email: true })
        setIsLoading(false)
        trackFormError("email", "already_registered", data.role || "unknown")
        return
      }
    } catch (emailCheckError) {
      console.error("[v0] Email check failed:", emailCheckError)
      // Continue with signup if check fails - let backend handle it
    }

    try {
      const actualCountryCode = countryCode.split("-")[0]
      const phoneDigits = phoneNumber.replace(/\D/g, "")
      const fullPhoneNumber = phoneDigits ? `${actualCountryCode}${phoneDigits}` : null

      const formData: any = {
        first_name: firstName,
        email,
        password,
      }

      if (fullPhoneNumber) {
        formData.phone_number = fullPhoneNumber
      }

      if (data.role === "contractor") {
        formData.last_name = lastName
        formData.address = address || null
        formData.city = city || null
        formData.region = region || null
        formData.country = "CA"
        formData.company_name = companyName
        formData.company_size = companySize
        formData.business_address = businessAddress
        formData.business_city = businessCity
        formData.business_region = businessRegion
        formData.business_country = "CA"
        formData.business_postal_code = businessPostalCode
        formData.radius_km = Number.parseInt(radiusKm)
        formData.services = services
      }

      if (tempEmail) {
        formData.temp_email = tempEmail
      }

      console.log("[v0] Saving to sessionStorage:", formData)
      sessionStorage.setItem("onboarding_form_data", JSON.stringify(formData))
      sessionStorage.setItem("terms_accepted", "true")
      sessionStorage.setItem("terms_accepted_at", new Date().toISOString())

      if (data.role === "homeowner" && data.jobTitle) {
        const existingJobDataString = sessionStorage.getItem("onboarding_job_data")
        const existingJobData = existingJobDataString ? JSON.parse(existingJobDataString) : {}

        const jobData = {
          jobTitle: data.jobTitle,
          jobService: data.jobService,
          jobDescription: data.jobDescription,
          jobTimeline: data.jobTimeline,
          jobCity: data.jobCity,
          jobRegion: data.jobRegion,
          jobPostalCode: data.jobPostalCode,
          // Preserve images if they exist
          jobImageDataUrls: existingJobData.jobImageDataUrls || [],
        }
        sessionStorage.setItem("onboarding_job_data", JSON.stringify(jobData))
        console.log("[v0] Job data saved to sessionStorage:", jobData)
      }

      updateData({
        firstName,
        email,
        phone: fullPhoneNumber,
        countryCode,
        ...(data.role === "contractor" && {
          lastName,
          address,
          city,
          region,
          country: "CA",
          companyName,
          companySize,
          businessAddress,
          businessCity,
          businessRegion: region,
          businessCountry: "CA",
          businessPostalCode,
          radiusKm: Number.parseInt(radiusKm),
          services,
        }),
      })

      trackEvent("form_submission_success", { role: data.role || "unknown" })

      const params = new URLSearchParams({ role: data.role || "unknown" })
      if (tempEmail) {
        params.set("temp_email", tempEmail)
      }
      router.push(`/verify-phone/${data.role}?${params.toString()}`)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      trackEvent("form_submission_error", {
        role: data.role || "unknown",
        error_message: errorMessage,
      })
      setError(err instanceof Error ? err.message : "Failed to save information. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="py-7">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
          {data.role === "homeowner" && data.jobTitle && (
            <button
              onClick={() => router.push("/onboarding/job-details")}
              className="mb-4 flex items-center gap-2 text-[#03353a] hover:text-[#03353a]/80 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Job Details</span>
            </button>
          )}

          <div className="flex justify-center mb-6">
            <div
              className={`w-16 h-16 ${data.role === "contractor" ? "bg-[#e2bb12]" : "bg-[#03353a]"} rounded-full flex items-center justify-center`}
            >
              <User
                className={`w-8 h-8 ${data.role === "contractor" ? "text-[#03353a]" : "text-white"}`}
                strokeWidth={2.5}
              />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-center mb-2 text-[#03353a]">
            {data.role === "contractor" ? "Create Your Contractor Account" : "Create Your Customer Account"}
          </h1>
          <p className="text-center text-[#03353a]/70 mb-8">
            {data.role === "contractor"
              ? "Tell us about yourself and your business"
              : "Tell us about yourself to get started"}
          </p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm break-words">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-6">
            {/* Personal Information Section (Contractor) */}
            {data.role === "contractor" && (
              <div className="mb-8">
                <div className="border-b border-gray-200 pb-3 mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                  <p className="text-sm text-gray-600 mt-1">Your contact details</p>
                </div>

                <div className="space-y-4">
                  {/* First Name */}
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="mb-2">
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => {
                        setFirstName(e.target.value)
                        if (touched.firstName) {
                          setFieldErrors((prev) => ({
                            ...prev,
                            firstName: !validateField("firstName", e.target.value),
                          }))
                        }
                      }}
                      onBlur={() => {
                        setTouched((prev) => ({ ...prev, firstName: true }))
                        setFieldErrors((prev) => ({
                          ...prev,
                          firstName: !validateField("firstName", firstName),
                        }))
                      }}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#03353a] focus:border-transparent text-sm sm:text-base ${
                        fieldErrors.firstName ? "border-red-500 bg-red-50" : "border-gray-300"
                      }`}
                      placeholder="Enter first name"
                      required
                    />
                    {fieldErrors.firstName && touched.firstName && (
                      <p className="text-red-500 text-xs mt-1">First name is required</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </Label>
                    <input
                      id="lastName"
                      type="text"
                      value={lastName}
                      onChange={(e) => {
                        setLastName(e.target.value)
                        if (touched.lastName) {
                          setFieldErrors((prev) => ({
                            ...prev,
                            lastName: !validateField("lastName", e.target.value),
                          }))
                        }
                      }}
                      onBlur={() => {
                        setTouched((prev) => ({ ...prev, lastName: true }))
                        setFieldErrors((prev) => ({
                          ...prev,
                          lastName: !validateField("lastName", lastName),
                        }))
                      }}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#03353a] focus:border-transparent text-sm sm:text-base ${
                        fieldErrors.lastName ? "border-red-500 bg-red-50" : "border-gray-300"
                      }`}
                      placeholder="Enter last name"
                      required
                    />
                    {fieldErrors.lastName && touched.lastName && (
                      <p className="text-red-500 text-xs mt-1">Last name is required</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="email" className="mb-2">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <p className="text-xs text-gray-600 mb-2 break-words">
                      You'll receive email notifications when new jobs are posted that match your services and area
                    </p>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (touched.email) {
                          setFieldErrors((prev) => ({
                            ...prev,
                            email: !validateField("email", e.target.value),
                          }))
                        }
                      }}
                      onBlur={() => {
                        setTouched((prev) => ({ ...prev, email: true }))
                        setFieldErrors((prev) => ({
                          ...prev,
                          email: !validateField("email", email),
                        }))
                      }}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#03353a] focus:border-transparent text-sm sm:text-base ${
                        fieldErrors.email ? "border-red-500 bg-red-50" : "border-gray-300"
                      }`}
                      placeholder="Enter your email"
                      required
                    />
                    {fieldErrors.email && touched.email && (
                      <p className="text-red-500 text-xs mt-1">Please enter a valid email address</p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber" className="mb-2">
                      Phone Number <span className="text-red-500">*</span>
                    </Label>
                    <div className="flex gap-2">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="w-20 sm:w-24 px-2 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03353a] focus:border-transparent outline-none transition-all bg-white text-sm cursor-pointer"
                      >
                        <option value="+1-CA">🇨🇦 +1</option>
                      </select>
                      <input
                        id="phoneNumber"
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={phoneNumber}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, "")
                          setPhoneNumber(digits)
                          if (touched.phoneNumber) {
                            setFieldErrors((prev) => ({
                              ...prev,
                              phoneNumber: !validateField("phoneNumber", digits),
                            }))
                          }
                        }}
                        onBlur={() => {
                          setTouched((prev) => ({ ...prev, phoneNumber: true }))
                          setFieldErrors((prev) => ({
                            ...prev,
                            phoneNumber: !validateField("phoneNumber", phoneNumber),
                          }))
                        }}
                        placeholder="5197601022"
                        maxLength={10}
                        className={`flex-1 min-w-0 px-3 sm:px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#03353a] focus:border-transparent outline-none transition-all ${
                          fieldErrors.phoneNumber ? "border-red-500 bg-red-50" : "border-gray-300"
                        }`}
                        required
                      />
                    </div>
                    {fieldErrors.phoneNumber && touched.phoneNumber && (
                      <p className="text-red-500 text-xs mt-1">Please enter a valid 10-digit phone number</p>
                    )}
                  </div>

                  {/* Password fields */}
                  <div className="space-y-2">
                    <Label htmlFor="password" className="mb-2">
                      Create Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value)
                          if (touched.password) {
                            setFieldErrors((prev) => ({
                              ...prev,
                              password: !validateField("password", e.target.value),
                            }))
                          }
                        }}
                        onBlur={() => {
                          setTouched((prev) => ({ ...prev, password: true }))
                          setFieldErrors((prev) => ({
                            ...prev,
                            password: !validateField("password", password),
                          }))
                        }}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#03353a] focus:border-transparent text-sm sm:text-base pr-10 ${
                          fieldErrors.password ? "border-red-500 bg-red-50" : "border-gray-300"
                        }`}
                        placeholder="Enter your password"
                        required
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {fieldErrors.password && touched.password ? (
                      <p className="text-sm text-red-500 max-w-full break-words">Must be at least 6 characters</p>
                    ) : (
                      <p className="text-sm text-gray-500 max-w-full break-words">Must be at least 6 characters</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword" className="mb-2">
                      Confirm Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value)
                          if (touched.confirmPassword) {
                            setFieldErrors((prev) => ({
                              ...prev,
                              confirmPassword: !validateField("confirmPassword", e.target.value),
                            }))
                          }
                        }}
                        onBlur={() => {
                          setTouched((prev) => ({ ...prev, confirmPassword: true }))
                          setFieldErrors((prev) => ({
                            ...prev,
                            confirmPassword: !validateField("confirmPassword", confirmPassword),
                          }))
                        }}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#03353a] focus:border-transparent text-sm sm:text-base pr-10 ${
                          fieldErrors.confirmPassword ? "border-red-500 bg-red-50" : "border-gray-300"
                        }`}
                        placeholder="Confirm your password"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {fieldErrors.confirmPassword && touched.confirmPassword ? (
                      <p className="text-sm text-red-500 max-w-full break-words">Passwords must match</p>
                    ) : (
                      <p className="text-sm text-gray-500 max-w-full break-words">Re-enter your password</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Personal Information - Homeowner View */}
            {data.role === "homeowner" && (
              <div className="mb-8">
                <div className="border-b border-gray-200 pb-3 mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
                  <p className="text-sm text-gray-600 mt-1">Your contact details</p>
                </div>

                <div className="space-y-4">
                  {/* First Name */}
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="mb-2">
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <input
                      id="firstName"
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      onBlur={() => handleFieldBlur("firstName", firstName)}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#03353a] focus:border-transparent text-sm sm:text-base ${
                        touched.firstName && fieldErrors.firstName ? "border-red-500 bg-red-50" : "border-gray-300"
                      }`}
                      placeholder="Enter first name"
                      required
                    />
                    {touched.firstName && fieldErrors.firstName && (
                      <p className="text-red-500 text-xs mt-1">First name is required</p>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-2">
                    <Label htmlFor="emailHomeowner" className="mb-2">
                      Email <span className="text-red-500">*</span>
                    </Label>
                    <p className="text-xs text-gray-600 mb-2 break-words">
                      You'll receive notifications when contractors bid on your projects
                    </p>
                    <input
                      id="emailHomeowner"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        if (touched.email) {
                          setFieldErrors((prev) => ({
                            ...prev,
                            email: !validateField("email", e.target.value),
                          }))
                        }
                      }}
                      onBlur={() => {
                        setTouched((prev) => ({ ...prev, email: true }))
                        setFieldErrors((prev) => ({
                          ...prev,
                          email: !validateField("email", email),
                        }))
                      }}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#03353a] focus:border-transparent text-sm sm:text-base ${
                        fieldErrors.email ? "border-red-500 bg-red-50" : "border-gray-300"
                      }`}
                      placeholder="Enter your email"
                      required
                    />
                    {fieldErrors.email && touched.email && (
                      <p className="text-red-500 text-xs mt-1">Please enter a valid email address</p>
                    )}
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumberHomeowner" className="mb-2">
                      Phone Number <span className="text-sm text-gray-500">(optional)</span>
                    </Label>
                    <div className="flex gap-2">
                      <select
                        value={countryCode}
                        onChange={(e) => setCountryCode(e.target.value)}
                        className="w-20 sm:w-24 px-2 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03353a] focus:border-transparent outline-none transition-all bg-white text-sm cursor-pointer"
                      >
                        <option value="+1-CA">🇨🇦 +1</option>
                      </select>
                      <input
                        id="phoneNumberHomeowner"
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={phoneNumber}
                        onChange={(e) => {
                          const digits = e.target.value.replace(/\D/g, "")
                          setPhoneNumber(digits)
                        }}
                        placeholder="5197601022"
                        maxLength={10}
                        className="flex-1 min-w-0 px-3 sm:px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03353a] focus:border-transparent outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Password fields */}
                  <div className="space-y-2">
                    <Label htmlFor="passwordHomeowner" className="mb-2">
                      Create Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <input
                        id="passwordHomeowner"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value)
                          if (touched.password) {
                            setFieldErrors((prev) => ({
                              ...prev,
                              password: !validateField("password", e.target.value),
                            }))
                          }
                        }}
                        onBlur={() => {
                          setTouched((prev) => ({ ...prev, password: true }))
                          setFieldErrors((prev) => ({
                            ...prev,
                            password: !validateField("password", password),
                          }))
                        }}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#03353a] focus:border-transparent text-sm sm:text-base pr-10 ${
                          fieldErrors.password ? "border-red-500 bg-red-50" : "border-gray-300"
                        }`}
                        placeholder="Enter your password"
                        required
                        minLength={6}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {fieldErrors.password && touched.password ? (
                      <p className="text-sm text-red-500 max-w-full break-words">Must be at least 6 characters</p>
                    ) : (
                      <p className="text-sm text-gray-500 max-w-full break-words">Must be at least 6 characters</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPasswordHomeowner" className="mb-2">
                      Confirm Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <input
                        id="confirmPasswordHomeowner"
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => {
                          setConfirmPassword(e.target.value)
                          if (touched.confirmPassword) {
                            setFieldErrors((prev) => ({
                              ...prev,
                              confirmPassword: !validateField("confirmPassword", e.target.value),
                            }))
                          }
                        }}
                        onBlur={() => {
                          setTouched((prev) => ({ ...prev, confirmPassword: true }))
                          setFieldErrors((prev) => ({
                            ...prev,
                            confirmPassword: !validateField("confirmPassword", confirmPassword),
                          }))
                        }}
                        className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#03353a] focus:border-transparent text-sm sm:text-base pr-10 ${
                          fieldErrors.confirmPassword ? "border-red-500 bg-red-50" : "border-gray-300"
                        }`}
                        placeholder="Confirm your password"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {fieldErrors.confirmPassword && touched.confirmPassword ? (
                      <p className="text-sm text-red-500 max-w-full break-words">Passwords must match</p>
                    ) : (
                      <p className="text-sm text-gray-500 max-w-full break-words">Re-enter your password</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Business Information Section (Contractor Only) */}
            {data.role === "contractor" && (
              <div className="mb-8">
                <div className="border-b border-gray-200 pb-3 mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Business Information</h2>
                  <p className="text-sm text-gray-600 mt-1">Your company details and service area</p>
                </div>

                <div className="space-y-4">
                  {/* Company Name */}
                  <div className="space-y-2">
                    <Label htmlFor="companyName" className="mb-2">
                      Company Name <span className="text-red-500">*</span>
                    </Label>
                    <input
                      id="companyName"
                      type="text"
                      value={companyName}
                      onChange={(e) => {
                        setCompanyName(e.target.value)
                        if (touched.companyName) {
                          setFieldErrors((prev) => ({
                            ...prev,
                            companyName: !validateField("companyName", e.target.value),
                          }))
                        }
                      }}
                      onBlur={() => {
                        setTouched((prev) => ({ ...prev, companyName: true }))
                        setFieldErrors((prev) => ({
                          ...prev,
                          companyName: !validateField("companyName", companyName),
                        }))
                      }}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#03353a] focus:border-transparent text-sm sm:text-base ${
                        fieldErrors.companyName && touched.companyName ? "border-red-500 bg-red-50" : "border-gray-300"
                      }`}
                      placeholder="Enter company name"
                      required
                    />
                    {fieldErrors.companyName && touched.companyName && (
                      <p className="text-red-500 text-xs mt-1">Company name is required</p>
                    )}
                  </div>

                  {/* Company Size */}
                  <div className="space-y-2">
                    <Label htmlFor="companySize" className="mb-2">
                      Company Size
                    </Label>
                    <select
                      id="companySize"
                      value={companySize}
                      onChange={(e) => setCompanySize(e.target.value)}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#03353a] focus:border-transparent text-sm sm:text-base"
                    >
                      <option value="1-5">1-5</option>
                      <option value="6-10">6-10</option>
                      <option value="11-20">11-20</option>
                      <option value="21-50">21-50</option>
                      <option value="50+">50+</option>
                    </select>
                  </div>

                  {/* Business Address */}
                  <div className="space-y-2">
                    <Label htmlFor="businessAddress" className="mb-2">
                      Business Address <span className="text-red-500">*</span>
                    </Label>
                    <input
                      id="businessAddress"
                      type="text"
                      value={businessAddress}
                      onChange={(e) => {
                        setBusinessAddress(e.target.value)
                        if (touched.businessAddress) {
                          setFieldErrors((prev) => ({
                            ...prev,
                            businessAddress: !validateField("businessAddress", e.target.value),
                          }))
                        }
                      }}
                      onBlur={() => {
                        setTouched((prev) => ({ ...prev, businessAddress: true }))
                        setFieldErrors((prev) => ({
                          ...prev,
                          businessAddress: !validateField("businessAddress", businessAddress),
                        }))
                      }}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#03353a] focus:border-transparent text-sm sm:text-base ${
                        fieldErrors.businessAddress && touched.businessAddress
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter business address"
                      required
                    />
                    {fieldErrors.businessAddress && touched.businessAddress && (
                      <p className="text-red-500 text-xs mt-1">Business address is required</p>
                    )}
                  </div>

                  {/* Business City */}
                  <div className="space-y-2">
                    <Label htmlFor="businessCity" className="mb-2">
                      Business City <span className="text-red-500">*</span>
                    </Label>
                    <input
                      id="businessCity"
                      type="text"
                      value={businessCity}
                      onChange={(e) => {
                        setBusinessCity(e.target.value)
                        if (touched.businessCity) {
                          setFieldErrors((prev) => ({
                            ...prev,
                            businessCity: !validateField("businessCity", e.target.value),
                          }))
                        }
                      }}
                      onBlur={() => {
                        setTouched((prev) => ({ ...prev, businessCity: true }))
                        setFieldErrors((prev) => ({
                          ...prev,
                          businessCity: !validateField("businessCity", businessCity),
                        }))
                      }}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#03353a] focus:border-transparent text-sm sm:text-base ${
                        fieldErrors.businessCity && touched.businessCity
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter business city"
                      required
                    />
                    {fieldErrors.businessCity && touched.businessCity && (
                      <p className="text-red-500 text-xs mt-1">Business city is required</p>
                    )}
                  </div>

                  {/* Business Region */}
                  <div className="space-y-2">
                    <Label htmlFor="businessRegion" className="mb-2">
                      Business Region <span className="text-red-500">*</span>
                    </Label>
                    <select
                      id="businessRegion"
                      value={businessRegion}
                      onChange={(e) => {
                        setBusinessRegion(e.target.value)
                        if (touched.businessRegion) {
                          setFieldErrors((prev) => ({
                            ...prev,
                            businessRegion: !validateField("businessRegion", e.target.value),
                          }))
                        }
                      }}
                      onBlur={() => {
                        setTouched((prev) => ({ ...prev, businessRegion: true }))
                        setFieldErrors((prev) => ({
                          ...prev,
                          businessRegion: !validateField("businessRegion", businessRegion),
                        }))
                      }}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#03353a] focus:border-transparent text-sm sm:text-base ${
                        fieldErrors.businessRegion && touched.businessRegion
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                      required
                    >
                      <option value="">Select Province/Territory</option>
                      {CANADIAN_PROVINCES.map((province) => (
                        <option key={province.value} value={province.value}>
                          {province.label}
                        </option>
                      ))}
                    </select>
                    {fieldErrors.businessRegion && touched.businessRegion && (
                      <p className="text-red-500 text-xs mt-1">Business region is required</p>
                    )}
                  </div>

                  {/* Business Postal Code */}
                  <div className="space-y-2">
                    <Label htmlFor="businessPostalCode" className="mb-2">
                      Business Postal Code <span className="text-red-500">*</span>
                    </Label>
                    <input
                      id="businessPostalCode"
                      type="text"
                      value={businessPostalCode}
                      onChange={(e) => {
                        const formatted = formatPostalCode(e.target.value)
                        setBusinessPostalCode(formatted)
                        if (touched.businessPostalCode) {
                          setFieldErrors((prev) => ({
                            ...prev,
                            businessPostalCode: !validateField("businessPostalCode", formatted),
                          }))
                        }
                      }}
                      onBlur={() => {
                        setTouched((prev) => ({ ...prev, businessPostalCode: true }))
                        setFieldErrors((prev) => ({
                          ...prev,
                          businessPostalCode: !validateField("businessPostalCode", businessPostalCode),
                        }))
                      }}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#03353a] focus:border-transparent text-sm sm:text-base ${
                        fieldErrors.businessPostalCode && touched.businessPostalCode
                          ? "border-red-500 bg-red-50"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter business postal code"
                      required
                    />
                    {fieldErrors.businessPostalCode && touched.businessPostalCode && (
                      <p className="text-red-500 text-xs mt-1">Please enter a valid postal code</p>
                    )}
                  </div>

                  {/* Business Country */}
                  <div className="space-y-2">
                    <Label htmlFor="businessCountry" className="mb-2">
                      Business Country <span className="text-red-500">*</span>
                    </Label>
                    <input
                      id="businessCountry"
                      type="text"
                      value={businessCountry}
                      readOnly
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-sm sm:text-base cursor-not-allowed"
                    />
                  </div>

                  {/* Services */}
                  <div className="space-y-2">
                    <Label htmlFor="services" className="mb-2">
                      Services <span className="text-red-500">*</span>
                    </Label>
                    <ServicesSelector
                      value={services}
                      onChange={setServices}
                      error={fieldErrors.services}
                      onInvalidInput={setHasInvalidServiceInput}
                    />
                    {servicesError && <p className="text-red-500 text-xs mt-1">{servicesError}</p>}
                  </div>
                </div>
              </div>
            )}

            {/* Terms and Conditions */}
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <input
                  id="acceptedTerms"
                  type="checkbox"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="w-4 h-4 mt-0.5 text-[#03353a] focus:ring-2 focus:ring-[#03353a] focus:border-transparent rounded flex-shrink-0"
                />
                <label htmlFor="acceptedTerms" className="text-sm leading-relaxed cursor-pointer">
                  I agree to the{" "}
                  <span className="text-blue-500 underline" onClick={() => setShowTermsModal(true)}>
                    Terms of Service
                  </span>{" "}
                  for using Bidrr
                </label>
              </div>
              {fieldErrors.acceptedTerms && touched.acceptedTerms && (
                <p className="text-red-500 text-xs mt-1">You must accept the terms and conditions</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#03353a] text-white py-3 px-4 rounded-lg hover:bg-[#03353a]/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              {isLoading ? "Loading..." : "Continue"}
            </button>
          </form>
        </div>
      </div>
      {showTermsModal && <TermsModal onClose={() => setShowTermsModal(false)} />}
    </div>
  )
}
