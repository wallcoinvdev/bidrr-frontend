"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/lib/auth-context"
import { apiClient } from "@/lib/api-client"
import { Loader2, AlertCircle, CheckCircle } from "lucide-react"

export default function ContractorProfilePage() {
  const { user, setUser } = useAuth()
  const [fullName, setFullName] = useState(user?.full_name || "")
  const [email, setEmail] = useState(user?.email || "")
  const [phoneNumber, setPhoneNumber] = useState(user?.phone_number || "")
  const [companyName, setCompanyName] = useState(user?.company_name || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setLoading(true)

    try {
      const updatedUser = await apiClient.request<any>("/api/users/profile", {
        method: "PUT",
        requiresAuth: true,
        body: JSON.stringify({
          full_name: fullName,
          email,
          phone_number: phoneNumber,
          company_name: companyName,
        }),
      })
      setUser(updatedUser)
      setSuccess(true)
    } catch (err: any) {
      setError(err.message || "Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Profile Settings</h1>
        <p className="text-muted-foreground">Manage your contractor account information</p>
      </div>

      {error && (
        <div className="bg-card border rounded-lg p-4 mb-6" style={{ borderColor: "#dd3f55" }}>
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: "#dd3f55" }} />
            <p className="text-sm" style={{ color: "#dd3f55" }}>
              {error}
            </p>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-card border rounded-lg p-4 mb-6" style={{ borderColor: "#426769" }}>
          <div className="flex items-start gap-3">
            <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: "#426769" }} />
            <p className="text-sm" style={{ color: "#426769" }}>
              Profile updated successfully!
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-8 space-y-6">
        <div>
          <label htmlFor="companyName" className="block text-sm font-medium text-foreground mb-2">
            Company Name
          </label>
          <input
            id="companyName"
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
            className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
          />
        </div>

        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-foreground mb-2">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
            Phone Number
          </label>
          <input
            id="phone"
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
            className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          style={{ backgroundColor: "#142c57", color: "#fffefe" }}
        >
          {loading && <Loader2 className="h-5 w-5 animate-spin" />}
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  )
}
