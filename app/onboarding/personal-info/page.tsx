"use client"

import type React from "react"
import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Eye, EyeOff, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { useOnboarding } from "@/contexts/onboarding-context"
import { ServicesSelector } from "@/components/services-selector"
import TermsModal from "@/components/terms-modal"

export default function PersonalInfoPage() {
  const router = useRouter()
  const { data, updateData } = useOnboarding()
  const searchParams = useSearchParams()
  const roleFromUrl = searchParams.get("role")

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
  const [servicesError, setServicesError] = useState<string | null>(null)

  const [postalCodeTouched, setPostalCodeTouched] = useState(false)
  const [businessPostalCodeTouched, setBusinessPostalCodeTouched] = useState(false)

  // Helper to validate postal code format
  const isValidPostalCode = (code: string) => {
    return /^[A-Za-z][0-9][A-Za-z][0-9][A-Za-z][0-9]$/.test(code)
  }

  useEffect(() => {
    if (roleFromUrl && (roleFromUrl === "homeowner" || roleFromUrl === "contractor")) {
      updateData({ role: roleFromUrl })
    }
  }, [roleFromUrl])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setServicesError(null)

    try {
      if (!region || region === "") {
        throw new Error("Please select a province")
      }

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

      if (data.role === "contractor" && (!businessRegion || businessRegion === "")) {
        throw new Error("Please select a province for your business")
      }

      if (data.role === "contractor" && services.length === 0) {
        setServicesError("Please select at least one service you offer")
        setIsLoading(false)
        return
      }

      if (!postalCodeTouched || !isValidPostalCode(postalCode)) {
        throw new Error("Please enter a valid postal code")
      }

      if (data.role === "contractor" && (!businessPostalCodeTouched || !isValidPostalCode(businessPostalCode))) {
        throw new Error("Please enter a valid business postal code")
      }

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
        country: "CA",
        postal_code: postalCode,
      }

      if (data.role === "contractor") {
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

      sessionStorage.setItem("onboarding_form_data", JSON.stringify(formData))
      sessionStorage.setItem("terms_accepted", "true")
      sessionStorage.setItem("terms_accepted_at", new Date().toISOString())

      updateData({
        firstName,
        lastName,
        email,
        phone: fullPhoneNumber,
        countryCode,
        address,
        city,
        region,
        country: "CA",
        postalCode,
        ...(data.role === "contractor" && {
          companyName,
          companySize,
          businessAddress,
          businessCity,
          businessRegion,
          businessCountry: "CA",
          businessPostalCode,
          radiusKm: Number.parseInt(radiusKm),
          services,
        }),
      })

      router.push(`/verify-phone/${data.role}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save information. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
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

          {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">{error}</div>}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#03353a] mb-2">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#03353a]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#03353a] mb-2">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#03353a]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#03353a] mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#03353a]"
                required
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-sm font-medium text-[#03353a] mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-24 sm:w-28 px-2 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-[#03353a] text-sm"
                >
                  <option value="+1-CA">🇨🇦 +1</option>
                </select>
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                  placeholder="5551234567"
                  maxLength={10}
                  className="flex-1 min-w-0 px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#03353a]"
                  required
                />
              </div>
            </div>

            {/* Address fields */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#03353a] mb-2">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#03353a]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#03353a] mb-2">
                  City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#03353a]"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#03353a] mb-2">
                  Province <span className="text-red-500">*</span>
                </label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-[#03353a]"
                  required
                >
                  <option value="">Select a province</option>
                  <option value="Alberta">Alberta</option>
                  <option value="British Columbia">British Columbia</option>
                  <option value="Manitoba">Manitoba</option>
                  <option value="New Brunswick">New Brunswick</option>
                  <option value="Newfoundland and Labrador">Newfoundland and Labrador</option>
                  <option value="Northwest Territories">Northwest Territories</option>
                  <option value="Nova Scotia">Nova Scotia</option>
                  <option value="Nunavut">Nunavut</option>
                  <option value="Ontario">Ontario</option>
                  <option value="Prince Edward Island">Prince Edward Island</option>
                  <option value="Quebec">Quebec</option>
                  <option value="Saskatchewan">Saskatchewan</option>
                  <option value="Yukon">Yukon</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#03353a] mb-2">
                  Country <span className="text-red-500">*</span>
                </label>
                <select
                  value="Canada"
                  className="w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-[#03353a]"
                  disabled
                >
                  <option>Canada</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#03353a] mb-2">
                  Postal Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value.toUpperCase().replace(/\s/g, "").slice(0, 6))}
                  onBlur={() => setPostalCodeTouched(true)}
                  placeholder="A1A1A1"
                  maxLength={6}
                  minLength={6}
                  pattern="[A-Za-z][0-9][A-Za-z][0-9][A-Za-z][0-9]"
                  title="Please enter a valid Canadian postal code (e.g., A1A1A1)"
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#03353a] ${
                    postalCodeTouched && !isValidPostalCode(postalCode) ? "border-red-500 focus:ring-red-500" : ""
                  }`}
                  required
                />
                {postalCodeTouched && !isValidPostalCode(postalCode) && (
                  <p className="text-red-500 text-xs mt-1">
                    Please enter a valid 6-character postal code (e.g., A1A1A1)
                  </p>
                )}
              </div>
            </div>

            {/* Password fields */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#03353a] mb-2">
                  Create Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-[#03353a]"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-md transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="text-xs text-[#03353a]/60 mt-1">Must be at least 6 characters</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#03353a] mb-2">
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-3 pr-12 border rounded-lg focus:ring-2 focus:ring-[#03353a]"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-100 rounded-md transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Contractor-specific fields */}
            {data.role === "contractor" && (
              <div className="space-y-4 pt-6 border-t">
                <h2 className="text-xl font-semibold text-[#03353a]">Business Information</h2>
                <div>
                  <label className="block text-sm font-medium text-[#03353a] mb-2">
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#03353a]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#03353a] mb-2">
                    Company Size <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={companySize}
                    onChange={(e) => setCompanySize(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-[#03353a]"
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
                    checked={sameAsPersonalAddress}
                    onChange={(e) => {
                      setSameAsPersonalAddress(e.target.checked)
                      if (e.target.checked) {
                        setBusinessAddress(address)
                        setBusinessCity(city)
                        setBusinessRegion(region)
                        setBusinessPostalCode(postalCode)
                        setBusinessPostalCodeTouched(true)
                      }
                    }}
                    className="h-4 w-4"
                  />
                  <label className="text-sm text-[#03353a]">Same as personal address</label>
                </div>

                {/* Business Street Address field */}
                <div>
                  <label className="block text-sm font-medium text-[#03353a] mb-2">
                    Business Street Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#03353a]"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#03353a] mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={businessCity}
                      onChange={(e) => {
                        setBusinessCity(e.target.value)
                        if (sameAsPersonalAddress) setSameAsPersonalAddress(false)
                      }}
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#03353a]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#03353a] mb-2">
                      Province <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={businessRegion}
                      onChange={(e) => {
                        setBusinessRegion(e.target.value)
                        if (sameAsPersonalAddress) setSameAsPersonalAddress(false)
                      }}
                      className="w-full px-4 py-3 border rounded-lg bg-white focus:ring-2 focus:ring-[#03353a]"
                      required
                    >
                      <option value="">Select a province</option>
                      <option value="Alberta">Alberta</option>
                      <option value="British Columbia">British Columbia</option>
                      <option value="Manitoba">Manitoba</option>
                      <option value="New Brunswick">New Brunswick</option>
                      <option value="Newfoundland and Labrador">Newfoundland and Labrador</option>
                      <option value="Northwest Territories">Northwest Territories</option>
                      <option value="Nova Scotia">Nova Scotia</option>
                      <option value="Nunavut">Nunavut</option>
                      <option value="Ontario">Ontario</option>
                      <option value="Prince Edward Island">Prince Edward Island</option>
                      <option value="Quebec">Quebec</option>
                      <option value="Saskatchewan">Saskatchewan</option>
                      <option value="Yukon">Yukon</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#03353a] mb-2">
                      Postal Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={businessPostalCode}
                      onChange={(e) => {
                        setBusinessPostalCode(e.target.value.toUpperCase().replace(/\s/g, "").slice(0, 6))
                        if (sameAsPersonalAddress) setSameAsPersonalAddress(false)
                      }}
                      onBlur={() => setBusinessPostalCodeTouched(true)}
                      placeholder="A1A1A1"
                      maxLength={6}
                      minLength={6}
                      pattern="[A-Za-z][0-9][A-Za-z][0-9][A-Za-z][0-9]"
                      title="Please enter a valid Canadian postal code (e.g., A1A1A1)"
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#03353a] ${
                        businessPostalCodeTouched && !isValidPostalCode(businessPostalCode)
                          ? "border-red-500 focus:ring-red-500"
                          : ""
                      }`}
                      required
                    />
                    {businessPostalCodeTouched && !isValidPostalCode(businessPostalCode) && (
                      <p className="text-red-500 text-xs mt-1">
                        {sameAsPersonalAddress
                          ? "Personal postal code is invalid. Please fix it above."
                          : "Please enter a valid 6-character postal code (e.g., A1A1A1)"}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[#03353a] mb-2">
                      Service Radius (km) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={radiusKm}
                      onChange={(e) => setRadiusKm(e.target.value)}
                      min="1"
                      max="500"
                      className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#03353a]"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#03353a] mb-2">
                    Services Offered <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-[#03353a]/60 mb-2">Select all services you offer</p>
                  <ServicesSelector
                    value={services}
                    onChange={(newServices) => {
                      setServices(newServices)
                      if (newServices.length > 0) {
                        setServicesError(null)
                      }
                    }}
                    error={servicesError || undefined}
                  />
                </div>
              </div>
            )}

            {/* Terms acceptance */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 h-4 w-4"
                required
              />
              <label className="text-sm text-[#03353a]">
                <span className="text-red-500">*</span> I agree to the{" "}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    setShowTermsModal(true)
                  }}
                  className="text-[#03353a] underline font-medium hover:text-[#e2bb12]"
                >
                  Terms of Service
                </button>{" "}
                for using Bidrr
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#e2bb12] text-[#03353a] font-semibold py-3 px-4 rounded-lg hover:bg-[#d4a810] disabled:opacity-50"
            >
              {isLoading ? "Processing..." : "Create Account & Continue"}
            </button>

            <p className="text-center text-sm text-[#03353a]/70 mt-4">
              Have an account already?{" "}
              <a href="/login" className="text-[#03353a] underline font-medium">
                Log in
              </a>
            </p>
          </form>
        </div>
      </div>
      {showTermsModal && <TermsModal onClose={() => setShowTermsModal(false)} />}
    </div>
  )
}
