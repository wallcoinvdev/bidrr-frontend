"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { User, Upload, BadgeCheck } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

export default function HomeownerProfilePage() {
  const { toast } = useToast()
  const { user, refreshUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false)
  const photoInputRef = useRef<HTMLInputElement>(null)

  const [phoneCountryCode, setPhoneCountryCode] = useState("+1")
  const [phoneNumber, setPhoneNumber] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [isCodeSent, setIsCodeSent] = useState(false)
  const [isSendingCode, setIsSendingCode] = useState(false)
  const [isVerifying, setIsVerifying] = useState(false)
  const [verificationError, setVerificationError] = useState<string | null>(null)
  const [verificationSuccess, setVerificationSuccess] = useState<string | null>(null)

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [region, setRegion] = useState("")
  const [country, setCountry] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("")

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await apiClient.request<any>("/api/users/profile", {
          method: "GET",
          requiresAuth: true,
        })

        setFirstName(profile.first_name || "")
        setLastName(profile.last_name || "")
        setEmail(profile.email || "")
        setPhone(profile.phone_number || "")
        setPhoneVerified(profile.phone_verified || false)

        if (profile.phone_number) {
          setPhoneNumber(profile.phone_number.replace("+1", ""))
        }

        setAddress(profile.address || "")
        setCity(profile.city || "")
        setRegion(profile.region || "")
        setCountry(profile.country || "")
        setPostalCode(profile.postal_code || "")
        setProfilePhotoUrl(profile.profile_photo_url || "")
      } catch (err) {
        console.error("Error fetching profile:", err)
      }
    }

    fetchProfile()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      await apiClient.request("/api/users/profile", {
        method: "PUT",
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          address,
          city,
          region,
          country,
          postal_code: postalCode,
          profile_photo_url: profilePhotoUrl,
        }),
        requiresAuth: true,
      })

      await refreshUser()
      setSuccess("Profile updated successfully!")
      toast({
        title: "Success",
        description: "Profile updated successfully!",
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to update profile"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setIsUploadingPhoto(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("photo", file)

      const data = await apiClient.uploadFormData<any>("/api/users/profile/photo", formData, "POST", true)
      setProfilePhotoUrl(data.profile_photo_url)
      setSuccess("Profile photo updated successfully!")
      await refreshUser()
      toast({
        title: "Success",
        description: "Profile photo updated successfully!",
      })
    } catch (error) {
      console.error("Error uploading photo:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to upload photo"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsUploadingPhoto(false)
    }
  }

  const handlePhotoDelete = async () => {
    if (!confirm("Are you sure you want to remove your profile photo?")) return

    setIsUploadingPhoto(true)
    setError(null)

    try {
      await apiClient.request("/api/users/profile/photo", {
        method: "DELETE",
        requiresAuth: true,
      })

      setProfilePhotoUrl("")
      setSuccess("Profile photo removed successfully!")
      await refreshUser()
      toast({
        title: "Success",
        description: "Profile photo removed successfully!",
      })
    } catch (error) {
      console.error("Error deleting photo:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to delete photo"
      setError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsUploadingPhoto(false)
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
          role: "homeowner",
          user_id: user?.id,
        }),
        requiresAuth: true,
      })

      setIsCodeSent(true)
      setVerificationSuccess("Verification code sent! Check your phone.")
      toast({
        title: "Code Sent",
        description: "Verification code sent! Check your phone.",
      })
    } catch (err: any) {
      console.error("Error sending verification code:", err)
      const errorMessage = err.message || "Failed to send verification code"
      setVerificationError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
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
          code: verificationCode,
        }),
        requiresAuth: true,
      })

      setVerificationSuccess("Phone verified successfully!")
      setPhoneVerified(true)
      await refreshUser()
      toast({
        title: "Success",
        description: "Phone verified successfully!",
      })
    } catch (err: any) {
      const errorMessage = err.message || "Invalid verification code"
      setVerificationError(errorMessage)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsVerifying(false)
    }
  }

  return (
    <DashboardLayout userRole="homeowner">
      <div className="min-h-screen bg-gray-50 p-3 sm:p-6">
        <div className="mb-6 max-w-3xl mx-auto">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Profile</h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">Manage your personal information</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 max-w-3xl mx-auto">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 max-w-3xl mx-auto">
            {success}
          </div>
        )}

        <div className="max-w-3xl mx-auto space-y-6">
          {/* Profile Photo */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Profile Photo</h2>

            <div className="flex flex-col sm:flex-row items-start gap-4">
              <div className="relative w-24 h-24 bg-gray-100 rounded-full overflow-hidden flex items-center justify-center border-2 border-gray-200">
                {profilePhotoUrl ? (
                  <>
                    <img
                      src={profilePhotoUrl || "/placeholder.svg"}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                      <Upload className="w-6 h-6 text-white" />
                    </div>
                  </>
                ) : (
                  <User className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <div className="flex-1 w-full">
                <p className="text-sm font-medium text-gray-700 mb-3">Upload a profile photo</p>
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => photoInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    className="w-full sm:w-auto px-4 py-2 bg-[#328d87] text-white rounded-lg hover:bg-[#2a7872] disabled:opacity-50 text-sm"
                  >
                    {isUploadingPhoto ? "Uploading..." : "Choose Photo"}
                  </button>
                  {profilePhotoUrl && (
                    <button
                      type="button"
                      onClick={handlePhotoDelete}
                      disabled={isUploadingPhoto}
                      className="w-full sm:w-auto px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 disabled:opacity-50 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mt-2">JPG, PNG or WEBP. Max 5MB.</p>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Personal Information</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                  <label className="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
                  <input
                    type="text"
                    value={region}
                    onChange={(e) => setRegion(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                  <input
                    type="text"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Postal Code</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => {
                      const clean = e.target.value
                        .toUpperCase()
                        .replace(/[^A-Z0-9]/g, "")
                        .slice(0, 6)
                      if (clean.length > 3) {
                        setPostalCode(clean.slice(0, 3) + " " + clean.slice(3))
                      } else {
                        setPostalCode(clean)
                      }
                    }}
                    maxLength={7}
                    placeholder="A1A 1A1"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full sm:w-auto px-6 py-2 bg-[#328d87] text-white rounded-lg hover:bg-[#2a7872] disabled:opacity-50"
              >
                {isLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>

          {/* Phone Verification */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-xl font-bold flex items-center gap-2">
                Phone Verification
                {phoneVerified && <BadgeCheck className="w-5 h-5 text-green-600" />}
              </h2>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Verify your phone number to build trust and increase your response rate
            </p>

            {phoneVerified ? (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  <select
                    value={phoneCountryCode}
                    disabled
                    className="w-full sm:w-24 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  >
                    <option value="+1">🇨🇦 +1</option>
                  </select>
                  <input
                    type="tel"
                    value={phoneNumber}
                    disabled
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                  />
                </div>

                <div className="flex items-center gap-2 text-green-700 bg-green-50 border border-green-200 rounded-lg p-3">
                  <BadgeCheck className="w-5 h-5" />
                  <span className="font-medium">You are verified!</span>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900 mb-2">Benefits of Verification</p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">✓</span>
                      <span>Verified badge displayed on your profile</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">✓</span>
                      <span>3x higher response rate from contractors</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">✓</span>
                      <span>Increased trust and credibility</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-600">✓</span>
                      <span>Priority support from our team</span>
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                  <div className="flex gap-2">
                    <select
                      value={phoneCountryCode}
                      onChange={(e) => setPhoneCountryCode(e.target.value)}
                      className="w-16 sm:w-20 px-2 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] text-sm"
                      disabled={isCodeSent}
                    >
                      <option value="+1">🇨🇦 +1</option>
                    </select>
                    <input
                      type="tel"
                      inputMode="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ""))}
                      placeholder="6394705572"
                      maxLength={10}
                      className="flex-1 min-w-0 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87]"
                      disabled={isCodeSent}
                    />
                  </div>
                </div>

                {!isCodeSent ? (
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={isSendingCode || phoneNumber.length < 10}
                    className="w-full px-6 py-2 bg-[#328d87] text-white rounded-lg hover:bg-[#2a7872] disabled:opacity-50"
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
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] text-center text-lg tracking-wider"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleVerifyCode}
                      disabled={isVerifying || verificationCode.length !== 6}
                      className="w-full px-6 py-2 bg-[#328d87] text-white rounded-lg hover:bg-[#2a7872] disabled:opacity-50"
                    >
                      {isVerifying ? "Processing..." : "Verify Phone"}
                    </button>
                  </div>
                )}

                {verificationError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                    {verificationError}
                  </div>
                )}

                {verificationSuccess && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
                    {verificationSuccess}
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900 mb-2">Benefits of Verification:</p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>✓ Verified badge displayed on your profile</li>
                    <li>✓ 3x higher response rate from contractors</li>
                    <li>✓ Increased trust and credibility</li>
                    <li>✓ Priority support from our team</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
