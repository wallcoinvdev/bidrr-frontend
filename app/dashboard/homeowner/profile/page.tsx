"use client"

import type React from "react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Camera, Trash2, BadgeCheck } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { getRegionLabel } from "@/lib/country-data"
import { apiClient } from "@/lib/api-client"

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showImagePreview, setShowImagePreview] = useState(false)
  const [imageLoadError, setImageLoadError] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

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
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [region, setRegion] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [notificationFrequency, setNotificationFrequency] = useState("daily")

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiClient.request<any>("/api/users/profile", { requiresAuth: true })
        console.log("[v0] Profile data from backend:", data)
        setProfile(data)
        setFullName(data.full_name || "")
        setEmail(data.email || "")
        setAddress(data.address || "")
        setCity(data.city || "")
        setRegion(data.region || "")
        setPostalCode(data.postal_code || "")
        setNotificationFrequency(data.notification_frequency || "daily")
        if (data.phone_number) {
          setPhoneNumber(data.phone_number.replace("+1", ""))
        }
      } catch (error) {
        console.error("[v0] Error fetching profile:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleSendCode = async () => {
    setIsSendingCode(true)
    setVerificationError(null)
    setVerificationSuccess(null)

    const fullPhoneNumber = `${phoneCountryCode}${phoneNumber}`

    console.log("[v0] Sending verification code request:")
    console.log("[v0] Phone country code:", phoneCountryCode)
    console.log("[v0] Phone number:", phoneNumber)
    console.log("[v0] Full phone number:", fullPhoneNumber)
    console.log("[v0] Role:", "homeowner")

    if (phoneNumber.length < 10) {
      setVerificationError("Please enter a valid phone number")
      setIsSendingCode(false)
      return
    }

    try {
      const response = await apiClient.request("/api/users/request-verification", {
        method: "POST",
        body: JSON.stringify({
          phone_number: fullPhoneNumber,
          role: "homeowner",
        }),
        requiresAuth: true,
      })

      console.log("[v0] Verification code sent successfully:", response)
      setIsCodeSent(true)
      setVerificationSuccess("Verification code sent! Check your phone.")
    } catch (err: any) {
      console.error("[v0] Error sending verification code:", err)
      if (err.message?.toLowerCase().includes("invalid") && err.message?.toLowerCase().includes("phone")) {
        setVerificationError(
          "This phone number cannot receive verification codes. Please use a different number or contact support.",
        )
      } else {
        setVerificationError(err.message || "Failed to send verification code")
      }
    } finally {
      setIsSendingCode(false)
    }
  }

  const handleVerifyCode = async () => {
    setIsVerifying(true)
    setVerificationError(null)
    setVerificationSuccess(null)

    const fullPhoneNumber = `${phoneCountryCode}${phoneNumber}`

    console.log("[v0] Verifying code:")
    console.log("[v0] Phone country code:", phoneCountryCode)
    console.log("[v0] Phone number:", phoneNumber)
    console.log("[v0] Full phone number:", fullPhoneNumber)
    console.log("[v0] Verification code:", verificationCode)
    console.log("[v0] Code length:", verificationCode.length)

    try {
      const response = await apiClient.request<any>("/api/users/verify-phone", {
        method: "POST",
        body: JSON.stringify({
          code: verificationCode,
          phone_number: fullPhoneNumber,
        }),
        requiresAuth: true,
      })

      console.log("[v0] Phone verified successfully:", response)
      setVerificationSuccess("Phone number verified successfully!")
      setIsCodeSent(false)
      setVerificationCode("")

      setProfile({ ...profile, phone_verified: true, phone_number: fullPhoneNumber })
    } catch (err: any) {
      console.error("[v0] Error verifying code:", err)
      setVerificationError(err.message || "Invalid verification code")
    } finally {
      setIsVerifying(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Unsupported image format. Use JPEG, PNG, or WebP.")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB")
      return
    }

    setIsUploadingPhoto(true)
    setError(null)
    setSuccess(null)

    try {
      const formData = new FormData()
      formData.append("photo", file)

      console.log("[v0] Uploading profile photo via apiClient")
      console.log("[v0] File details:", { name: file.name, type: file.type, size: file.size })

      const data = await apiClient.uploadFormData<any>("/api/users/profile/photo", formData, "POST", true)

      console.log("[v0] Profile photo uploaded successfully:", data)
      setProfile({ ...profile, profile_photo_url: data.profile_photo_url })
      setImageLoadError(false)
      setSuccess("Profile photo updated successfully!")
    } catch (error) {
      console.error("[v0] Error uploading photo:", error)
      setError(error instanceof Error ? error.message : "Failed to upload photo")
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  const handlePhotoDelete = async () => {
    if (!confirm("Are you sure you want to remove your profile photo?")) return

    setIsUploadingPhoto(true)
    setError(null)
    setSuccess(null)

    try {
      await apiClient.request("/api/users/profile/photo", {
        method: "DELETE",
        requiresAuth: true,
      })

      console.log("[v0] Photo deleted successfully")
      setProfile({ ...profile, profile_photo_url: null })
      setSuccess("Profile photo removed successfully!")
    } catch (error) {
      console.error("[v0] Error deleting photo:", error)
      setError(error instanceof Error ? error.message : "Failed to delete photo")
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  const handleSaveProfile = async () => {
    setIsSaving(true)
    setError(null)
    setSuccess(null)

    try {
      const token = localStorage.getItem("token")
      const response = await fetch("/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          full_name: fullName,
          email,
          address,
          city,
          region,
          postal_code: postalCode,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log("[v0] Profile updated successfully:", data)
        setProfile(data)
        setSuccess("Profile updated successfully!")
      } else {
        const errorData = await response.json()
        setError(errorData.error || "Failed to update profile")
      }
    } catch (error) {
      console.error("[v0] Error updating profile:", error)
      setError("Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <DashboardLayout userRole="homeowner">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading profile...</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="homeowner">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-gray-600 mt-2">Manage your personal information</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-600">{success}</p>
          </div>
        )}

        {/* Profile Photo */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Profile Photo</h2>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative">
              {profile?.profile_photo_url && !imageLoadError ? (
                <button
                  onClick={() => setShowImagePreview(true)}
                  className="w-24 h-24 rounded-full overflow-hidden hover:opacity-90 transition-opacity cursor-pointer"
                >
                  <img
                    src={profile.profile_photo_url || "/placeholder.svg"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={() => {
                      setImageLoadError(true)
                    }}
                  />
                </button>
              ) : (
                <div className="w-24 h-24 rounded-full bg-[#328d87] flex items-center justify-center text-white text-3xl font-bold">
                  {profile?.full_name?.charAt(0) || "U"}
                </div>
              )}
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingPhoto}
                className="absolute bottom-0 right-0 w-8 h-8 bg-white rounded-full border-2 border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                <Camera className="h-4 w-4 text-gray-600" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </div>
            <div className="flex-1 w-full">
              <p className="text-sm text-gray-600 mb-2">
                {isUploadingPhoto ? "Uploading..." : "Upload a profile photo"}
              </p>
              {imageLoadError && profile?.profile_photo_url && (
                <p className="text-xs text-amber-600 mb-2">
                  ⚠️ Image uploaded but cannot be displayed. S3 bucket needs CORS configuration.
                </p>
              )}
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  className="px-4 py-2 bg-[#328d87] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                >
                  {isUploadingPhoto ? "Uploading..." : "Choose Photo"}
                </button>
                {profile?.profile_photo_url && (
                  <button
                    onClick={handlePhotoDelete}
                    disabled={isUploadingPhoto}
                    className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Remove
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-2">JPG, PNG or WEBP. Max 5MB.</p>
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {getRegionLabel(profile?.country || "CA")}
              </label>
              <input
                type="text"
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {profile?.country === "United States" ? "Zip Code" : "Postal Code"}
              </label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
              <input
                type="text"
                value={profile?.country || ""}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
            </div>
          </div>
          <button
            onClick={handleSaveProfile}
            disabled={isSaving}
            className="mt-6 bg-[#328d87] text-white px-6 py-2 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>

        {/* Phone Verification */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                Phone Verification
                <BadgeCheck className="h-6 w-6 text-[#328d87]" />
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Verify your phone number to build trust and increase your response rate
              </p>
            </div>
          </div>

          {profile?.phone_verified ? (
            <div className="space-y-4">
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <div className="flex gap-2">
                  <select
                    value={phoneCountryCode}
                    disabled
                    className="w-24 md:w-28 flex-shrink-0 px-2 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed text-sm"
                  >
                    <option value="+1">🇨🇦 +1</option>
                  </select>
                  <input
                    type="tel"
                    value={phoneNumber}
                    disabled
                    className="flex-1 max-w-xs min-w-0 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
                  />
                </div>
                <div className="flex items-center gap-2 text-green-600">
                  <BadgeCheck className="h-5 w-5" />
                  <span className="font-medium">You are verified!</span>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-medium text-blue-900 mb-2">Benefits of Verification</h3>
                <ul className="space-y-2 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span>Verified badge displayed on your profile</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span>3x higher response rate from contractors</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span>Increased trust and credibility</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-600 mt-0.5">✓</span>
                    <span>Priority support from our team</span>
                  </li>
                </ul>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <h3 className="font-medium text-amber-900 mb-2">Why Verify Your Phone Number?</h3>
                <ul className="space-y-2 text-sm text-amber-800">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-0.5">•</span>
                    <span>
                      <strong>Build Trust:</strong> Show contractors you're a real person
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-0.5">•</span>
                    <span>
                      <strong>Get More Responses:</strong> Verified users receive 3x more contractor responses
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-0.5">•</span>
                    <span>
                      <strong>Stand Out:</strong> Display a verified badge on your profile
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-600 mt-0.5">•</span>
                    <span>
                      <strong>Priority Support:</strong> Get faster help from our support team
                    </span>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                <div className="flex gap-2">
                  <select
                    value={phoneCountryCode}
                    onChange={(e) => setPhoneCountryCode(e.target.value)}
                    className="w-24 md:w-28 flex-shrink-0 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent text-sm"
                  >
                    <option value="+1">🇨🇦 +1</option>
                  </select>
                  <input
                    type="tel"
                    placeholder="5551234567"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                    maxLength={10}
                    className="flex-1 max-w-xs min-w-0 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleSendCode}
                  disabled={isSendingCode || phoneNumber.length < 10}
                  className="px-4 py-2 bg-[#328d87] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap"
                >
                  {isSendingCode ? "Sending..." : "Send Code"}
                </button>

                {isCodeSent && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Enter 6-digit code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      className="flex-1 max-w-[200px] min-w-0 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent"
                    />
                    <button
                      onClick={handleVerifyCode}
                      disabled={isVerifying || verificationCode.length !== 6}
                      className="px-4 py-2 bg-[#328d87] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 whitespace-nowrap"
                    >
                      {isVerifying ? "Verifying..." : "Verify"}
                    </button>
                  </div>
                )}

                {verificationError && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600">{verificationError}</p>
                  </div>
                )}

                {verificationSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                    <p className="text-sm text-green-600">{verificationSuccess}</p>
                  </div>
                )}

                <p className="text-xs text-gray-500">
                  We'll send a 6-digit verification code to your phone via SMS. Standard message rates may apply.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={showImagePreview} onOpenChange={setShowImagePreview}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Profile Photo</DialogTitle>
          </DialogHeader>
          <div className="flex items-center justify-center p-4">
            {profile?.profile_photo_url && (
              <img
                src={profile.profile_photo_url || "/placeholder.svg"}
                alt="Profile Preview"
                className="max-w-full max-h-[70vh] object-contain rounded-lg"
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
