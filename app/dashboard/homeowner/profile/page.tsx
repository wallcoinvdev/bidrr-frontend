"use client"

import type React from "react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Camera, Trash2 } from "lucide-react"
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

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiClient.request<any>("/api/users/profile", { requiresAuth: true })
        console.log("[v0] Profile data from backend:", data)
        setProfile(data)
        setFullName(data.name || "")
        setEmail(data.email || "")
        setAddress(data.address || "")
        setCity(data.city || "")
        setRegion(data.region || "")
        setPostalCode(data.postal_code || "")
        setNotificationFrequency(data.notification_frequency || "daily")
      } catch (error) {
        console.error("[v0] Error fetching profile:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProfile()
  }, [])

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
          name: fullName,
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

  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [address, setAddress] = useState("")
  const [city, setCity] = useState("")
  const [region, setRegion] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [notificationFrequency, setNotificationFrequency] = useState("daily")

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
                  {profile?.name?.charAt(0) || "U"}
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
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={profile?.phone_number || ""}
                disabled
                className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Phone number cannot be changed</p>
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
