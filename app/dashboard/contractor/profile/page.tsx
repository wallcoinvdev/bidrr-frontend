"use client"

import type React from "react"
import { useRef } from "react"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { User, Building2, Upload, Camera, Briefcase, LinkIcon, HelpCircle, Phone, BadgeCheck } from 'lucide-react'
import { useAuth } from "@/lib/auth-context"
import { apiClient } from "@/lib/api-client"
import { ServicesSelector } from "@/components/services-selector"
import { useRouter } from 'next/navigation'
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

export default function ContractorProfilePage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, refreshUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [isUploadingLogo, setIsUploadingLogo] = useState(false)
  const [isUploadingAgentPhoto, setIsUploadingAgentPhoto] = useState(false)
  const logoInputRef = useRef<HTMLInputElement>(null)
  const agentPhotoInputRef = useRef<HTMLInputElement>(null)

  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [previewTitle, setPreviewTitle] = useState<string>("")
  const [showGoogleModal, setShowGoogleModal] = useState(false)

  const [phoneCountryCode, setPhoneCountryCode] = useState("+1")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [isCodeSent, setIsCodeSent] = useState(false)
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationError, setVerificationError] = useState<string | null>(null)
  const [verificationSuccess, setVerificationSuccess] = useState<string | null>(null)

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [googleVerified, setGoogleVerified] = useState(false)
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [region, setRegion] = useState("")
  const [country, setCountry] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [companySize, setCompanySize] = useState("")
  const [businessAddress, setBusinessAddress] = useState("")
  const [businessCity, setBusinessCity] = useState("")
  const [businessRegion, setBusinessRegion] = useState("")
  const [businessCountry, setBusinessCountry] = useState("")
  const [businessPostalCode, setBusinessPostalCode] = useState("")
  const [radiusKm, setRadiusKm] = useState("")
  const [logoUrl, setLogoUrl] = useState("")
  const [agentPhotoUrl, setAgentPhotoUrl] = useState("")
  const [googleBusinessUrl, setGoogleBusinessUrl] = useState("")
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false)
  const [services, setServices] = useState<string[]>([])
  const [isSavingServices, setIsSavingServices] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await apiClient.request<any>("/api/users/profile", {
          method: "GET",
          requiresAuth: true,
        })

        const nameToUse = profile.full_name || profile.name || ""
        setFullName(nameToUse)
        setEmail(profile.email || "")
        setPhone(profile.phone_number || "")

        const isVerified = profile.phone_verified || false
        setPhoneVerified(isVerified)

        if (profile.phone_number) {
          setPhoneNumber(profile.phone_number.replace("+1", ""))
        }

        setAddress(profile.address || "")
        setCity(profile.city || "")
        setRegion(profile.region || "")
        setCountry(profile.country || "")
        setPostalCode(profile.postal_code || "")
        setCompanyName(profile.company_name || "")
        setCompanySize(profile.company_size || "")
        setBusinessAddress(profile.business_address || "")
        setBusinessCity(profile.business_city || "")
        setBusinessRegion(profile.business_region || "")
        setBusinessCountry(profile.business_country || "")
        setBusinessPostalCode(profile.business_postal_code || "")
        setRadiusKm(profile.radius_km?.toString() || "")
        setLogoUrl(profile.logo_url || "")
        setAgentPhotoUrl(profile.agent_photo_url || "")
        setServices(profile.services || [])
        setGoogleBusinessUrl(profile.google_business_url || "")

        const isGoogleVerified = !!(profile.google_business_url && profile.google_business_url.trim() !== "")
        setGoogleVerified(isGoogleVerified)
      } catch (err) {
        console.error("Error fetching profile:", err)
      }
    }

    fetchProfile()
  }, [])

  const handleConnectGoogle = async () => {
    if (!googleBusinessUrl) {
      toast({
        title: "URL Required",
        description: "Please enter a Google Business URL",
        variant: "destructive",
      })
      return
    }

    const isValidGoogleUrl =
      googleBusinessUrl.includes("google.com/maps") ||
      googleBusinessUrl.includes("maps.app.goo.gl") ||
      googleBusinessUrl.includes("place_id=")

    if (!isValidGoogleUrl) {
      toast({
        title: "Invalid URL Format",
        description: "Please use a Google Maps URL with a place_id.",
        variant: "destructive",
      })
      return
    }

    setIsConnectingGoogle(true)
    setError(null)
    setSuccess(null)

    try {
      await apiClient.request("/api/users/profile", {
        method: "PUT",
        body: JSON.stringify({
          google_business_url: googleBusinessUrl,
        }),
        requiresAuth: true,
      })

      await refreshUser()
      toast({
        title: "Connected Successfully",
        description: "Google Business connected and reviews synced!",
      })
      setSuccess("Google Business connected successfully!")
      setGoogleVerified(true)
    } catch (err) {
      console.error("Google Business connection error:", err)
      const errorMessage = err instanceof Error ? err.message : String(err)
      toast({
        title: "Connection Failed",
        description: errorMessage,
        variant: "destructive",
      })
      setError(`Failed to connect: ${errorMessage}`)
    } finally {
      setIsConnectingGoogle(false)
    }
  }

  const handleDisconnectGoogle = async () => {
    if (!confirm("Are you sure you want to disconnect your Google Business profile?")) return

    setIsConnectingGoogle(true)
    setError(null)
    setSuccess(null)

    try {
      await apiClient.request("/api/users/profile", {
        method: "PUT",
        body: JSON.stringify({
          google_business_url: "",
        }),
        requiresAuth: true,
      })

      setGoogleBusinessUrl("")
      setGoogleVerified(false)
      await refreshUser()
      toast({
        title: "Disconnected",
        description: "Google Business profile disconnected successfully",
      })
      setSuccess("Google Business disconnected successfully!")
    } catch (err) {
      console.error("Error disconnecting Google Business:", err)
      const errorMessage = err instanceof Error ? err.message : String(err)
      toast({
        title: "Disconnection Failed",
        description: errorMessage,
        variant: "destructive",
      })
      setError(`Failed to disconnect: ${errorMessage}`)
    } finally {
      setIsConnectingGoogle(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await apiClient.request("/api/users/profile", {
        method: "PUT",
        body: JSON.stringify({
          name: fullName,
          full_name: fullName,
          email,
          address,
          city,
          region,
          country,
          postal_code: postalCode,
          company_name: companyName,
          company_size: companySize,
          business_address: businessAddress,
          business_city: businessCity,
          business_region: businessRegion,
          business_country: businessCountry,
          business_postal_code: businessPostalCode,
          radius_km: Number.parseInt(radiusKm),
          logo_url: logoUrl,
          agent_photo_url: agentPhotoUrl,
        }),
        requiresAuth: true,
      })

      await refreshUser()
      setSuccess("Profile updated successfully!")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Please upload a JPG, PNG, or WEBP image")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB")
      return
    }

    setIsUploadingLogo(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("logo", file)

      const data = await apiClient.uploadFormData<any>("/api/users/profile/logo", formData, "POST", true)
      setLogoUrl(data.logo_url)
      setSuccess("Company logo updated successfully!")
      await refreshUser()
    } catch (error) {
      console.error("Error uploading logo:", error)
      setError("Failed to upload logo")
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const handleAgentPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Please upload a JPG, PNG, or WEBP image")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB")
      return
    }

    setIsUploadingAgentPhoto(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("photo", file)

      const data = await apiClient.uploadFormData<any>("/api/users/profile/agent-photo", formData, "POST", true)
      setAgentPhotoUrl(data.agent_photo_url)
      setSuccess("Agent photo updated successfully!")
      await refreshUser()
    } catch (error) {
      console.error("Error uploading agent photo:", error)
      setError(error instanceof Error ? error.message : "Failed to upload photo")
    } finally {
      setIsUploadingAgentPhoto(false)
    }
  }

  const handleLogoDelete = async () => {
    if (!confirm("Are you sure you want to remove your company logo?")) return

    setIsUploadingLogo(true)
    setError(null)

    try {
      await apiClient.request("/api/users/profile/logo", {
        method: "DELETE",
        requiresAuth: true,
      })

      setLogoUrl("")
      setSuccess("Company logo removed successfully!")
      await refreshUser()
    } catch (error) {
      console.error("Error deleting logo:", error)
      setError(error instanceof Error ? error.message : "Failed to delete logo")
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const handleAgentPhotoDelete = async () => {
    if (!confirm("Are you sure you want to remove your agent photo?")) return

    setIsUploadingAgentPhoto(true)
    setError(null)

    try {
      await apiClient.request("/api/users/profile/agent-photo", {
        method: "DELETE",
        requiresAuth: true,
      })

      setAgentPhotoUrl("")
      setSuccess("Agent photo removed successfully!")
      await refreshUser()
    } catch (error) {
      console.error("Error deleting agent photo:", error)
      setError(error instanceof Error ? error.message : "Failed to delete photo")
    } finally {
      setIsUploadingAgentPhoto(false)
    }
  }

  const handleSaveServices = async () => {
    setIsSavingServices(true)
    setError(null)
    setSuccess(null)

    try {
      await apiClient.request("/api/users/services", {
        method: "POST",
        body: JSON.stringify({ services }),
        requiresAuth: true,
      })

      setSuccess("Services updated successfully!")
      await refreshUser()
    } catch (err) {
      console.error("Error saving services:", err)
      setError(err instanceof Error ? err.message : "Failed to update services")
    } finally {
      setIsSavingServices(false)
    }
  }

  const handleSendCode = async () => {
    setIsSendingCode(true)
    setVerificationError(null)
    setVerificationSuccess(null)

    const fullPhoneNumber = `${phoneCountryCode}${phoneNumber}`

    if (phoneNumber.length < 10) {
      setVerificationError("Please enter a valid phone number")
      setIsSendingCode(false)
      return
    }

    try {
      await apiClient.request("/api/users/request-verification", {
        method: "POST",
        body: JSON.stringify({
          phone_number: fullPhoneNumber,
          role: "contractor",
          user_id: user?.id,
        }),
        requiresAuth: true,
      })

      setIsCodeSent(true)
      setVerificationSuccess("Verification code sent! Check your phone.")
    } catch (err: any) {
      console.error("Error sending verification code:", err)
      setVerificationError(err.message || "Failed to send verification code")
    } finally {
      setIsSendingCode(false)
    }
  }

  const handleVerifyCode = async () => {
    setIsVerifying(true)
    setVerificationError(null)

    try {
      await apiClient.request("/api/users/verify-phone", {
        method: "POST",
        body: JSON.stringify({
          phone_number: `${phoneCountryCode}${phoneNumber}`,
          verification_code: verificationCode,
        }),
        requiresAuth: true,
      })

      setVerificationSuccess("Phone verified successfully!")
      setPhoneVerified(true)
      await refreshUser()
    } catch (err: any) {
      setVerificationError(err.message || "Invalid verification code")
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <DashboardLayout userRole="contractor">
      <div className="min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="mb-6 max-w-4xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-gray-600 mt-2 text-sm md:text-base">Update your personal and business information</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 max-w-4xl mx-auto text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 max-w-4xl mx-auto text-sm">
            {success}
          </div>
        )}

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Photos */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
            <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Profile Photos
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* Company Logo */}
              <div className="w-full">
                <p className="text-sm font-medium text-gray-700 mb-3">Company Logo</p>
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="relative w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center border-2 border-gray-200 flex-shrink-0">
                    {logoUrl ? (
                      <img
                        src={logoUrl || "/placeholder.svg"}
                        alt="Company logo"
                        className="w-full h-full object-contain p-2"
                      />
                    ) : (
                      <div className="text-center p-2">
                        <Upload className="w-6 h-6 md:w-8 md:h-8 text-gray-400 mx-auto mb-1" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={isUploadingLogo}
                      className="w-full mb-2 px-3 md:px-4 py-2 bg-[#328d87] text-white rounded-lg hover:bg-[#2a7872] disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                    >
                      <Upload className="w-4 h-4" />
                      {isUploadingLogo ? "Uploading..." : "Upload"}
                    </button>
                    {logoUrl && (
                      <button
                        type="button"
                        onClick={handleLogoDelete}
                        disabled={isUploadingLogo}
                        className="w-full px-3 md:px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                      >
                        Remove
                      </button>
                    )}
                    <p className="text-xs text-gray-500 mt-2 break-words">
                      Recommended: 800x800px, PNG or JPG. Max 5MB. Click to preview.
                    </p>
                  </div>
                </div>
              </div>

              {/* Agent Photo */}
              <div className="w-full">
                <p className="text-sm font-medium text-gray-700 mb-3">Agent Photo</p>
                <div className="flex items-start gap-3 md:gap-4">
                  <div className="relative w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center border-2 border-[#328d87] flex-shrink-0">
                    {agentPhotoUrl ? (
                      <img
                        src={agentPhotoUrl || "/placeholder.svg"}
                        alt="Agent photo"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="text-center">
                        <Upload className="w-6 h-6 md:w-8 md:h-8 text-gray-400 mx-auto mb-1" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <input
                      ref={agentPhotoInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleAgentPhotoUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => agentPhotoInputRef.current?.click()}
                      disabled={isUploadingAgentPhoto}
                      className="w-full mb-2 px-3 md:px-4 py-2 bg-[#328d87] text-white rounded-lg hover:bg-[#2a7872] disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                    >
                      <Upload className="w-4 h-4" />
                      {isUploadingAgentPhoto ? "Uploading..." : "Upload"}
                    </button>
                    {agentPhotoUrl && (
                      <button
                        type="button"
                        onClick={handleAgentPhotoDelete}
                        disabled={isUploadingAgentPhoto}
                        className="w-full px-3 md:px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
                      >
                        Remove
                      </button>
                    )}
                    <p className="text-xs text-gray-500 mt-2 break-words">
                      Recommended: 400x400px. Max 5MB. Click to preview.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Personal Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center gap-2">
                <User className="w-5 h-5" />
                Personal Information
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent text-sm md:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent text-sm md:text-base"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    disabled
                    className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 text-sm md:text-base"
                  />
                  <p className="text-xs text-gray-500 mt-1">Phone number cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent text-sm md:text-base"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent text-sm md:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Province/State</label>
                    <input
                      type="text"
                      value={region}
                      onChange={(e) => setRegion(e.target.value)}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent text-sm md:text-base"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <input
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent text-sm md:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent text-sm md:text-base"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Business Information */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold mb-4 md:mb-6 flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                Business Information
              </h2>

              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent text-sm md:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Company Size</label>
                    <select
                      value={companySize}
                      onChange={(e) => setCompanySize(e.target.value)}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent text-sm md:text-base"
                    >
                      <option value="">Select size</option>
                      <option value="2-10">2-10</option>
                      <option value="11-50">11-50</option>
                      <option value="51-200">51-200</option>
                      <option value="201+">201+</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Business Street Address</label>
                  <input
                    type="text"
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent text-sm md:text-base"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business City</label>
                    <input
                      type="text"
                      value={businessCity}
                      onChange={(e) => setBusinessCity(e.target.value)}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent text-sm md:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Province/State</label>
                    <input
                      type="text"
                      value={businessRegion}
                      onChange={(e) => setBusinessRegion(e.target.value)}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent text-sm md:text-base"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Country</label>
                    <input
                      type="text"
                      value={businessCountry}
                      onChange={(e) => setBusinessCountry(e.target.value)}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent text-sm md:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Business Postal Code</label>
                    <input
                      type="text"
                      value={businessPostalCode}
                      onChange={(e) => setBusinessPostalCode(e.target.value)}
                      className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent text-sm md:text-base"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service Radius (km)</label>
                  <input
                    type="number"
                    value={radiusKm}
                    onChange={(e) => setRadiusKm(e.target.value)}
                    className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent text-sm md:text-base"
                    placeholder="250"
                  />
                </div>
              </div>

              <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => router.push("/contractor")}
                  className="w-full sm:w-auto px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm md:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full sm:w-auto px-6 py-2 bg-[#328d87] text-white rounded-lg hover:bg-[#2a7872] disabled:opacity-50 text-sm md:text-base"
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>

            {/* Google Business Profile */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
                  <LinkIcon className="w-5 h-5" />
                  <span className="break-words">Google Business Profile</span>
                  {googleVerified && <BadgeCheck className="w-5 h-5 text-yellow-500 flex-shrink-0" />}
                </h2>
              </div>

              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                    <label className="block text-sm font-medium text-gray-700">Google Business URL</label>
                    <button
                      type="button"
                      onClick={() => setShowGoogleModal(true)}
                      className="text-[#328d87] hover:text-[#2a7872] flex items-center gap-1 text-sm"
                    >
                      <HelpCircle className="w-4 h-4 flex-shrink-0" />
                      <span className="whitespace-nowrap">How to find this URL</span>
                    </button>
                  </div>
                  <input
                    type="url"
                    value={googleBusinessUrl}
                    onChange={(e) => setGoogleBusinessUrl(e.target.value)}
                    placeholder="https://www.google.com/maps/place/..."
                    className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] text-sm md:text-base break-all"
                    disabled={googleVerified}
                  />
                  <p className="text-xs text-gray-500 mt-1 break-words">
                    Connect your Google Business profile to sync reviews and ratings with your HomeHero account
                  </p>
                </div>

                {googleVerified ? (
                  <div className="flex items-center gap-2 text-green-700">
                    <BadgeCheck className="w-5 h-5 flex-shrink-0" />
                    <span className="text-sm font-medium">Google Business connected!</span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={handleConnectGoogle}
                    disabled={isConnectingGoogle || !googleBusinessUrl}
                    className="w-full sm:w-auto px-6 py-2 bg-[#328d87] text-white rounded-lg hover:bg-[#2a7872] disabled:opacity-50 text-sm md:text-base"
                  >
                    {isConnectingGoogle ? "Connecting..." : "Connect Google Business"}
                  </button>
                )}
              </div>
            </div>

            {/* Phone Verification */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
              <div className="flex items-center gap-2 mb-4 md:mb-6">
                <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Phone Verification
                  {phoneVerified && <BadgeCheck className="w-5 h-5 text-blue-500 flex-shrink-0" />}
                </h2>
              </div>

              <p className="text-sm text-gray-600 mb-4">
                Verify your phone number to build trust and increase your response rate
              </p>

              {phoneVerified ? (
                <div className="p-3 md:p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <BadgeCheck className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium">Phone verified!</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 break-words">
                    <span className="font-medium">Verified number:</span> {phone}
                  </p>
                  <ul className="mt-3 space-y-1 text-sm text-gray-700">
                    <li className="flex items-start gap-2">
                      <BadgeCheck className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Verified badge displayed on your profile</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <BadgeCheck className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Increased trust and credibility with homeowners</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <BadgeCheck className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Higher response rate on job postings</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <BadgeCheck className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                      <span>Priority support from our team</span>
                    </li>
                  </ul>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <div className="flex gap-2">
                      <select
                        value={phoneCountryCode}
                        onChange={(e) => setPhoneCountryCode(e.target.value)}
                        className="w-16 sm:w-20 px-2 md:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] text-sm"
                        disabled={isCodeSent}
                      >
                        <option value="+1">🇨🇦 +1</option>
                      </select>
                      <input
                        type="tel"
                        inputMode="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                        placeholder="3062225100"
                        maxLength={10}
                        className="flex-1 min-w-0 px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] text-sm md:text-base"
                        disabled={isCodeSent}
                      />
                    </div>
                  </div>

                  {!isCodeSent ? (
                    <button
                      type="button"
                      onClick={handleSendCode}
                      disabled={isSendingCode || phoneNumber.length < 10}
                      className="w-full px-6 py-2 bg-[#328d87] text-white rounded-lg hover:bg-[#2a7872] disabled:opacity-50 text-sm md:text-base"
                    >
                      {isSendingCode ? "Processing..." : "Send Verification Code"}
                    </button>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Verification Code</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          pattern="[0-9]*"
                          value={verificationCode}
                          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                          placeholder="Enter 6-digit code"
                          maxLength={6}
                          className="w-full px-3 md:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] text-center text-lg tracking-wider"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleVerifyCode}
                        disabled={isVerifying || verificationCode.length !== 6}
                        className="w-full px-6 py-2 bg-[#328d87] text-white rounded-lg hover:bg-[#2a7872] disabled:opacity-50 text-sm md:text-base"
                      >
                        {isVerifying ? "Processing..." : "Verify Phone"}
                      </button>
                    </div>
                  )}

                  {verificationError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm flex items-start gap-2">
                      <HelpCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span className="break-words">{verificationError}</span>
                    </div>
                  )}

                  {verificationSuccess && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
                      {verificationSuccess}
                    </div>
                  )}

                  <div className="p-3 md:p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-900 mb-2">Benefits of Verification:</p>
                    <ul className="text-sm text-blue-800 space-y-1">
                      <li>✓ Verified badge displayed on your profile</li>
                      <li>✓ Increased trust and credibility with homeowners</li>
                      <li>✓ Higher response rate on job postings</li>
                      <li>✓ Priority support from our team</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Services Offered */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 md:p-6">
              <h2 className="text-lg md:text-xl font-bold mb-4 flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Services Offered
              </h2>

              <p className="text-sm text-gray-600 mb-4">
                Manage the services your business offers. These services will be used to match you with relevant job
                postings.
              </p>

              <ServicesSelector value={services} onChange={setServices} />

              <div className="flex justify-end mt-4">
                <button
                  type="button"
                  onClick={handleSaveServices}
                  disabled={isSavingServices}
                  className="w-full sm:w-auto px-6 py-2 bg-[#328d87] text-white rounded-lg hover:bg-[#2a7872] disabled:opacity-50 text-sm md:text-base"
                >
                  {isSavingServices ? "Saving..." : "Save Services"}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>

      <Dialog open={showGoogleModal} onOpenChange={setShowGoogleModal}>
        <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto overflow-x-hidden">
          <DialogHeader>
            <DialogTitle className="text-xl">How to Find Your Google Business URL</DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-[#328d87] text-white rounded-full flex items-center justify-center font-semibold">
                1
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-2">Visit Google Maps</h3>
                <p className="text-sm text-gray-600 mb-2 break-words">
                  Open your web browser and navigate to{" "}
                  <a
                    href="https://maps.google.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#328d87] hover:underline break-all"
                  >
                    maps.google.com
                  </a>
                </p>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-xs text-amber-900 font-medium mb-1">📱 Important for Mobile & Tablet Users:</p>
                  <p className="text-xs text-amber-800 break-words">
                    You MUST use your web browser (Safari, Chrome, Firefox, etc.), NOT the Google Maps app. If the Maps
                    app opens automatically, select "Open in Browser" or manually paste the link into your browser. URLs
                    from the Maps app (maps.app.goo.gl/...) will NOT work.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-[#328d87] text-white rounded-full flex items-center justify-center font-semibold">
                2
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-2">Search for Your Business</h3>
                <p className="text-sm text-gray-600 break-words">
                  Type your business name in the search bar and press Enter. Select your business from the search
                  results to open its profile page.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-[#328d87] text-white rounded-full flex items-center justify-center font-semibold">
                3
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-2">Copy the URL</h3>
                <p className="text-sm text-gray-600 mb-2 break-words">
                  Once your business profile is displayed, copy the complete URL from your browser's address bar. The
                  URL should look similar to:
                </p>
                <div className="bg-gray-100 rounded-lg p-3 font-mono text-xs text-gray-800 break-all">
                  https://www.google.com/maps/place/YourBusinessName/@latitude,longitude,zoom/data=...
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-[#328d87] text-white rounded-full flex items-center justify-center font-semibold">
                4
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 mb-2">Paste and Connect</h3>
                <p className="text-sm text-gray-600 break-words">
                  Paste the copied URL into the Google Business URL field above and click the "Connect" button to sync
                  your Google reviews and ratings.
                </p>
              </div>
            </div>

            {/* Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-900 mb-1">Note:</p>
              <p className="text-sm text-blue-800 break-words">
                Make sure you're logged into the Google account associated with your business to ensure you're viewing
                the correct business profile.
              </p>
            </div>
          </div>

          <DialogFooter>
            <button
              type="button"
              onClick={() => setShowGoogleModal(false)}
              className="px-6 py-2 bg-[#328d87] text-white rounded-lg hover:bg-[#2a7872]"
            >
              Got it
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
