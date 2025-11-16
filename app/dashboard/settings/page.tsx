"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Lock, CreditCard, Trash2, Eye, EyeOff, Bell, AlertTriangle, User } from "lucide-react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function UniversalSettings() {
  const router = useRouter()
  const { user } = useAuth()
  const userRole = user?.role || "homeowner"

  const [profileData, setProfileData] = useState<any>(null)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await apiClient.request<any>("/api/users/profile", { requiresAuth: true })
        setProfileData(data)
      } catch (error) {
        console.error("Error fetching profile:", error)
      }
    }
    fetchProfile()
  }, [])

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      if (newPassword !== confirmPassword) {
        throw new Error("New passwords do not match")
      }

      if (newPassword.length < 6) {
        throw new Error("Password must be at least 6 characters")
      }

      await apiClient.request("/api/users/change-password", {
        method: "POST",
        body: JSON.stringify({
          currentPassword: currentPassword,
          newPassword: newPassword,
        }),
        requiresAuth: true,
      })

      setSuccess("Password changed successfully!")
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to change password")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setIsDeleting(true)
    setError(null)

    try {
      await apiClient.request("/api/users/account", {
        method: "DELETE",
        requiresAuth: true,
      })

      localStorage.removeItem("token")
      localStorage.removeItem("user")
      localStorage.removeItem("refresh_token")
      window.location.href = "/goodbye"
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account")
      setShowDeleteDialog(false)
      setDeleteConfirmation("")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <DashboardLayout userRole={userRole as "homeowner" | "contractor" | "admin"}>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-2">Manage your account settings and preferences</p>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">{error}</div>}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800">{success}</div>
        )}

        {/* Profile Information */}
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <User className="w-6 h-6 text-gray-700" />
            <h2 className="text-xl font-bold">Profile Information</h2>
          </div>

          {profileData ? (
            <div className="space-y-4">
              <div>
                <span className="text-sm font-medium text-gray-700">Full Name</span>
                <p className="text-gray-900">{profileData.full_name || profileData.name || "Not set"}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Email</span>
                <p className="text-gray-900">{profileData.email || "Not set"}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-700">Phone Number</span>
                <p className="text-gray-900">{profileData.phone_number || "Not set"}</p>
              </div>
              <button
                onClick={() =>
                  router.push(
                    userRole === "homeowner" ? "/dashboard/homeowner/profile" : "/dashboard/contractor/profile",
                  )
                }
                className="text-[#328d87] hover:underline text-sm font-medium"
              >
                Edit profile information →
              </button>
            </div>
          ) : (
            <p className="text-gray-500">Loading profile information...</p>
          )}
        </div>

        {/* Change Password */}
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-6 h-6 text-gray-700" />
            <h2 className="text-xl font-bold">Change Password</h2>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent outline-none pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
              <div className="relative">
                <input
                  type={showNewPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 characters"
                  minLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent outline-none pr-12"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  minLength={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent outline-none pr-12"
                  required
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

            <button
              type="submit"
              disabled={isLoading}
              className="px-6 py-3 bg-[#328d87] text-white rounded-lg hover:bg-[#2a7872] transition-colors disabled:opacity-50"
            >
              {isLoading ? "Updating..." : "Update Password"}
            </button>
          </form>
        </div>

        {/* Notification Settings */}
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-6 h-6 text-gray-700" />
            <h2 className="text-xl font-bold">Notification Settings</h2>
          </div>

          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <p className="text-gray-600 font-medium">Coming Soon</p>
            <p className="text-gray-500 text-sm mt-1">Notification preferences will be available in a future update</p>
          </div>
        </div>

        {/* Subscription Management */}
        <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <CreditCard className="w-6 h-6 text-gray-700" />
            <h2 className="text-xl font-bold">Subscription Management</h2>
          </div>

          <div className="text-center py-8 bg-gray-50 rounded-lg">
            {userRole === "homeowner" ? (
              <>
                <p className="text-gray-600 font-medium">Job postings are always free for homeowners!</p>
                <p className="text-gray-500 text-sm mt-1">No subscription required</p>
              </>
            ) : (
              <>
                <p className="text-gray-600 font-medium">Currently in Beta</p>
                <p className="text-gray-500 text-sm mt-1">
                  Subscription management will be available after the beta period ends
                </p>
              </>
            )}
          </div>
        </div>

        {/* Delete Account */}
        <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
          <div className="flex items-center gap-3 mb-6">
            <Trash2 className="w-6 h-6 text-red-600" />
            <h2 className="text-xl font-bold text-red-900">Delete Account</h2>
          </div>

          <p className="text-gray-600 mb-4">Once you delete your account, there is no going back. Please be certain.</p>

          <button
            onClick={() => setShowDeleteDialog(true)}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete My Account
          </button>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Delete Account
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your account and remove all your data from our
              servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Type DELETE to confirm:</label>
            <input
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
              placeholder="Type DELETE"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setDeleteConfirmation("")
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleteConfirmation !== "DELETE" || isDeleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {isDeleting ? "Deleting..." : "Delete Account"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
