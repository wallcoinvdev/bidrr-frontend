"use client"

import type React from "react"
import { useRef } from "react"
import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import {
  User,
  Building2,
  MapPin,
  Phone,
  Mail,
  Upload,
  Camera,
  LinkIcon,
  Trash2,
  X,
  Briefcase,
  HelpCircle,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { apiClient } from "@/lib/api-client"
import { ServicesSelector } from "@/components/services-selector"

export default function ContractorProfile() {
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
  const [showGoogleInstructions, setShowGoogleInstructions] = useState(false)

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
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
        const profile = await apiClient.request("/api/users/profile", {
          method: "GET",
          requiresAuth: true,
        })

        console.log("[v0] Profile data received:", profile)
        console.log("[v0] Services from profile:", profile.services)
        console.log("[v0] Services type:", typeof profile.services)
        console.log("[v0] Services is array:", Array.isArray(profile.services))

        setFullName(profile.name || "")
        setEmail(profile.email || "")
        setPhone(profile.phone_number || "")
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

        console.log("[v0] Services state set to:", profile.services || [])

        const googleSite = profile.review_sites?.find((site: any) => site.site === "google")
        setGoogleBusinessUrl(googleSite?.url || "")
      } catch (err) {
        console.error("[v0] Error fetching profile:", err)
      }
    }

    fetchProfile()
  }, [])

  const handleConnectGoogle = async () => {
    if (!googleBusinessUrl) {
      setError("Please enter a Google Business URL")
      return
    }

    setIsConnectingGoogle(true)
    setError(null)
    setSuccess(null)

    try {
      console.log("[v0] Connecting Google Business with URL:", googleBusinessUrl)

      const response = await apiClient.request("/api/users/profile", {
        method: "PUT",
        body: JSON.stringify({
          google_business_url: googleBusinessUrl,
        }),
        requiresAuth: true,
      })

      console.log("[v0] Google Business connection successful:", response)

      await refreshUser()
      setSuccess("Google Business connected! Reviews will be synced shortly.")
    } catch (err) {
      console.error("[v0] Google Business connection error:", err)
      console.error("[v0] Error details:", {
        message: err instanceof Error ? err.message : String(err),
        url: googleBusinessUrl,
        fieldName: "google_business_url",
      })

      setError(err instanceof Error ? `Failed to connect: ${err.message}` : "Failed to connect Google Business")
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
    setSuccess(null)

    try {
      const formData = new FormData()
      formData.append("logo", file)

      console.log("[v0] Uploading logo via apiClient")
      console.log("[v0] File details:", { name: file.name, type: file.type, size: file.size })

      const data = await apiClient.uploadFormData<any>("/api/users/profile/logo", formData, "POST", true)

      console.log("[v0] Logo uploaded successfully:", data)
      const logoUrlWithTimestamp = data.logo_url + "?t=" + Date.now()
      setLogoUrl(data.logo_url)
      setSuccess("Company logo updated successfully!")
      await refreshUser()
      setTimeout(() => {
        const imgElement = document.querySelector('img[alt="Company logo"]') as HTMLImageElement
        if (imgElement) {
          imgElement.src = logoUrlWithTimestamp
        }
      }, 100)
    } catch (error) {
      console.error("[v0] Error uploading logo:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to upload logo"
      setError(
        `Logo upload failed: ${errorMessage}. This appears to be a backend server error. Please contact support if the issue persists.`,
      )
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
    setSuccess(null)

    try {
      const formData = new FormData()
      formData.append("photo", file)

      console.log("[v0] Uploading agent photo via apiClient")
      console.log("[v0] File details:", { name: file.name, type: file.type, size: file.size })

      const data = await apiClient.uploadFormData<any>("/api/users/profile/agent-photo", formData, "POST", true)

      console.log("[v0] Agent photo uploaded successfully:", data)
      const agentPhotoUrlWithTimestamp = data.agent_photo_url + "?t=" + Date.now()
      setAgentPhotoUrl(data.agent_photo_url)
      setSuccess("Agent photo updated successfully!")
      await refreshUser()
      setTimeout(() => {
        const imgElement = document.querySelector('img[alt="Agent photo"]') as HTMLImageElement
        if (imgElement) {
          imgElement.src = agentPhotoUrlWithTimestamp
        }
      }, 100)
    } catch (error) {
      console.error("[v0] Error uploading agent photo:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to upload photo"
      setError(
        `Photo upload failed: ${errorMessage}. This appears to be a backend server error. Please contact support if the issue persists.`,
      )
    } finally {
      setIsUploadingAgentPhoto(false)
    }
  }

  const handleLogoDelete = async () => {
    if (!confirm("Are you sure you want to remove your company logo?")) return

    setIsUploadingLogo(true)
    setError(null)
    setSuccess(null)

    try {
      await apiClient.request("/api/users/profile/logo", {
        method: "DELETE",
        requiresAuth: true,
      })

      console.log("[v0] Logo deleted successfully")
      setLogoUrl("")
      setSuccess("Company logo removed successfully!")
      await refreshUser()
    } catch (error) {
      console.error("[v0] Error deleting logo:", error)
      setError(error instanceof Error ? error.message : "Failed to delete logo")
    } finally {
      setIsUploadingLogo(false)
    }
  }

  const handleAgentPhotoDelete = async () => {
    if (!confirm("Are you sure you want to remove your agent photo?")) return

    setIsUploadingAgentPhoto(true)
    setError(null)
    setSuccess(null)

    try {
      await apiClient.request("/api/users/profile/agent-photo", {
        method: "DELETE",
        requiresAuth: true,
      })

      console.log("[v0] Agent photo deleted successfully")
      setAgentPhotoUrl("")
      setSuccess("Agent photo removed successfully!")
      await refreshUser()
    } catch (error) {
      console.error("[v0] Error deleting agent photo:", error)
      setError(error instanceof Error ? error.message : "Failed to delete photo")
    } finally {
      setIsUploadingAgentPhoto(false)
    }
  }

  const openImagePreview = (imageUrl: string, title: string) => {
    setPreviewImage(imageUrl)
    setPreviewTitle(title)
  }

  const closeImagePreview = () => {
    setPreviewImage(null)
    setPreviewTitle("")
  }

  const handleSaveServices = async () => {
    setIsSavingServices(true)
    setError(null)
    setSuccess(null)

    console.log("[v0] Saving services - current state:", services)
    console.log("[v0] Services array length:", services.length)
    console.log("[v0] Services being sent to backend:", JSON.stringify({ services }))

    try {
      await apiClient.request("/api/users/services", {
        method: "POST",
        body: JSON.stringify({ services }),
        requiresAuth: true,
      })

      console.log("[v0] Services saved successfully")
      setSuccess("Services updated successfully!")
      await refreshUser()
    } catch (err) {
      console.error("[v0] Error saving services:", err)
      setError(err instanceof Error ? err.message : "Failed to update services")
    } finally {
      setIsSavingServices(false)
    }
  }

  return (
    <DashboardLayout userRole="contractor">
      <div className="max-w-4xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile Settings</h1>
        <p className="text-gray-600 mb-8">Update your personal and business information</p>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        {previewImage && (
          <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={closeImagePreview}
          >
            <div className="relative max-w-4xl max-h-[90vh] w-full">
              <button
                onClick={closeImagePreview}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              >
                <X className="h-8 w-8" />
              </button>
              <div className="bg-white rounded-lg overflow-hidden">
                <div className="p-4 border-b border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900">{previewTitle}</h3>
                </div>
                <div className="p-4 flex items-center justify-center bg-gray-50">
                  <img
                    src={previewImage || "/placeholder.svg"}
                    alt={previewTitle}
                    className="max-w-full max-h-[70vh] object-contain"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {showGoogleInstructions && (
          <div
            className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            onClick={() => setShowGoogleInstructions(false)}
          >
            <div className="relative max-w-2xl w-full" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setShowGoogleInstructions(false)}
                className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
              >
                <X className="h-8 w-8" />
              </button>
              <div className="bg-white rounded-lg overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900">How to Find Your Google Business URL</h3>
                </div>
                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#328d87] text-white flex items-center justify-center font-semibold">
                        1
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">Visit Google Maps</h4>
                        <p className="text-gray-600 text-sm">
                          Open your web browser and navigate to{" "}
                          <a
                            href="https://maps.google.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#328d87] hover:underline font-medium"
                          >
                            maps.google.com
                          </a>
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#328d87] text-white flex items-center justify-center font-semibold">
                        2
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">Search for Your Business</h4>
                        <p className="text-gray-600 text-sm">
                          Type your business name in the search bar and press Enter. Select your business from the
                          search results to open its profile page.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#328d87] text-white flex items-center justify-center font-semibold">
                        3
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">Copy the URL</h4>
                        <p className="text-gray-600 text-sm mb-3">
                          Once your business profile is displayed, copy the complete URL from your browser's address
                          bar. The URL should look similar to:
                        </p>
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <code className="text-xs text-gray-700 break-all">
                            https://www.google.com/maps/place/Your+Business+Name/@latitude,longitude,zoom/data=...
                          </code>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[#328d87] text-white flex items-center justify-center font-semibold">
                        4
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-2">Paste and Connect</h4>
                        <p className="text-gray-600 text-sm">
                          Paste the copied URL into the Google Business URL field above and click the "Connect" button
                          to sync your Google reviews and ratings.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> Make sure you're logged into the Google account associated with your
                      business to ensure you're viewing the correct business profile.
                    </p>
                  </div>
                </div>
                <div className="p-6 border-t border-gray-200 flex justify-end">
                  <button
                    onClick={() => setShowGoogleInstructions(false)}
                    className="px-6 py-2 bg-[#328d87] text-white rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Got it
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile Photos */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Camera className="h-5 w-5 text-[#328d87]" />
              Profile Photos
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Company Logo</label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => logoUrl && openImagePreview(logoUrl, "Company Logo")}
                    disabled={!logoUrl}
                    className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-[#328d87] transition-all disabled:hover:ring-0 disabled:cursor-default"
                  >
                    {logoUrl ? (
                      <img
                        src={logoUrl || "/placeholder.svg"}
                        alt="Company logo"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                          const parent = e.currentTarget.parentElement
                          if (parent) {
                            parent.innerHTML =
                              '<svg class="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>'
                          }
                        }}
                      />
                    ) : (
                      <Building2 className="h-10 w-10 text-gray-400" />
                    )}
                  </button>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={isUploadingLogo}
                      className="px-4 py-2 bg-[#328d87] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
                    >
                      <Upload className="h-4 w-4" />
                      {isUploadingLogo ? "Uploading..." : "Upload Logo"}
                    </button>
                    {logoUrl && (
                      <button
                        type="button"
                        onClick={handleLogoDelete}
                        disabled={isUploadingLogo}
                        className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    )}
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Recommended: 800x800px, PNG or JPG. Max 5MB. {logoUrl && "Click to preview."}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Agent Photo</label>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => agentPhotoUrl && openImagePreview(agentPhotoUrl, "Agent Photo")}
                    disabled={!agentPhotoUrl}
                    className="w-24 h-24 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden hover:ring-2 hover:ring-[#328d87] transition-all disabled:hover:ring-0 disabled:cursor-default"
                  >
                    {agentPhotoUrl ? (
                      <img
                        src={agentPhotoUrl || "/placeholder.svg"}
                        alt="Agent photo"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none"
                          const parent = e.currentTarget.parentElement
                          if (parent) {
                            parent.innerHTML =
                              '<svg class="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>'
                          }
                        }}
                      />
                    ) : (
                      <User className="h-10 w-10 text-gray-400" />
                    )}
                  </button>
                  <div className="flex flex-col gap-2">
                    <button
                      type="button"
                      onClick={() => agentPhotoInputRef.current?.click()}
                      disabled={isUploadingAgentPhoto}
                      className="px-4 py-2 bg-[#328d87] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50"
                    >
                      <Upload className="h-4 w-4" />
                      {isUploadingAgentPhoto ? "Uploading..." : "Upload Photo"}
                    </button>
                    {agentPhotoUrl && (
                      <button
                        type="button"
                        onClick={handleAgentPhotoDelete}
                        disabled={isUploadingAgentPhoto}
                        className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        Remove
                      </button>
                    )}
                    <input
                      ref={agentPhotoInputRef}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleAgentPhotoUpload}
                      className="hidden"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Recommended: 400x400px. Max 5MB. {agentPhotoUrl && "Click to preview."}
                </p>
              </div>
            </div>
          </div>

          {/* Google Business Profile */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-[#328d87]" />
              Google Business Profile
            </h2>

            <div className="space-y-4">
              <div>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-2">
                  <label htmlFor="googleBusinessUrl" className="block text-sm font-medium text-gray-700">
                    Google Business URL
                  </label>
                  {/* Button shows next to label on desktop only */}
                  <button
                    type="button"
                    onClick={() => setShowGoogleInstructions(true)}
                    className="hidden md:flex items-center gap-1 text-sm text-[#328d87] hover:underline"
                  >
                    <HelpCircle className="h-4 w-4" />
                    How to find this URL
                  </button>
                </div>
                <input
                  type="url"
                  id="googleBusinessUrl"
                  value={googleBusinessUrl}
                  onChange={(e) => setGoogleBusinessUrl(e.target.value)}
                  placeholder="https://www.google.com/maps/place/..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent outline-none"
                />
                <p className="text-xs text-gray-500 mt-2">
                  Connect your Google Business profile to sync reviews and ratings with your homeHero account
                </p>
                {/* Button shows below descriptive text on mobile only */}
                <button
                  type="button"
                  onClick={() => setShowGoogleInstructions(true)}
                  className="flex md:hidden items-center gap-1 text-sm text-[#328d87] hover:underline mt-2"
                >
                  <HelpCircle className="h-4 w-4" />
                  How to find this URL
                </button>
              </div>
              <button
                type="button"
                onClick={handleConnectGoogle}
                disabled={isConnectingGoogle || !googleBusinessUrl}
                className="w-full md:w-auto px-6 py-3 bg-[#328d87] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isConnectingGoogle ? "Connecting..." : "Connect Google Business"}
              </button>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <User className="h-5 w-5 text-[#328d87]" />
              Personal Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent outline-none"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent outline-none"
                    required
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="tel"
                    id="phone"
                    value={phone}
                    disabled
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Phone number cannot be changed</p>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Street Address
                </label>
                <input
                  type="text"
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                  City
                </label>
                <input
                  type="text"
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label htmlFor="region" className="block text-sm font-medium text-gray-700 mb-2">
                  Province/State
                </label>
                <input
                  type="text"
                  id="region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                  Country
                </label>
                <input
                  type="text"
                  id="country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Postal Code
                </label>
                <input
                  type="text"
                  id="postalCode"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>

          {/* Business Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-[#328d87]" />
              Business Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name
                </label>
                <input
                  type="text"
                  id="companyName"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent outline-none"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent outline-none bg-white"
                  required
                >
                  <option value="1">1</option>
                  <option value="2-10">2-10</option>
                  <option value="11-50">11-50</option>
                  <option value="51-200">51-200</option>
                  <option value="200+">200+</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label htmlFor="businessAddress" className="block text-sm font-medium text-gray-700 mb-2">
                  Business Street Address
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="businessAddress"
                    value={businessAddress}
                    onChange={(e) => setBusinessAddress(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="businessCity" className="block text-sm font-medium text-gray-700 mb-2">
                  Business City
                </label>
                <input
                  type="text"
                  id="businessCity"
                  value={businessCity}
                  onChange={(e) => setBusinessCity(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label htmlFor="businessRegion" className="block text-sm font-medium text-gray-700 mb-2">
                  Business Province/State
                </label>
                <input
                  type="text"
                  id="businessRegion"
                  value={businessRegion}
                  onChange={(e) => setBusinessRegion(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label htmlFor="businessCountry" className="block text-sm font-medium text-gray-700 mb-2">
                  Business Country
                </label>
                <input
                  type="text"
                  id="businessCountry"
                  value={businessCountry}
                  onChange={(e) => setBusinessCountry(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent outline-none"
                />
              </div>

              <div>
                <label htmlFor="businessPostalCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Business Postal Code
                </label>
                <input
                  type="text"
                  id="businessPostalCode"
                  value={businessPostalCode}
                  onChange={(e) => setBusinessPostalCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent outline-none"
                />
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent outline-none"
                  required
                />
              </div>
            </div>
          </div>

          {/* Services Offered */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-[#328d87]" />
              Services Offered
            </h2>

            <div className="space-y-4">
              <p className="text-sm text-gray-600">
                Manage the services your business offers. These services will be used to match you with relevant job
                postings.
              </p>

              <ServicesSelector selectedServices={services} onChange={setServices} />

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={handleSaveServices}
                  disabled={isSavingServices}
                  className="px-6 py-3 bg-[#328d87] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSavingServices ? "Saving..." : "Save Services"}
                </button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-4">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-[#328d87] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
