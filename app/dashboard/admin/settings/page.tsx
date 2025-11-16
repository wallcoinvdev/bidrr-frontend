"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Bell, Flag, Shield, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"

type TabType = "general" | "announcements" | "features" | "security"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>("general")
  const [loading, setLoading] = useState(false)
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    maintenanceMessage: "We're currently performing maintenance. Please check back soon.",
    maxBidsPerJob: 10,
    announcementEnabled: false,
    announcementMessage: "This is a test message",
    announcementType: "error",
    allowNewSignups: true,
    requireEmailVerification: false,
    requireContractorVerification: false,
  })

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/admin/settings")
      if (response.ok) {
        const data = await response.json()
        const settingsMap: Record<string, string> = {}
        data.settings?.forEach((s: { key: string; value: string }) => {
          settingsMap[s.key] = s.value
        })

        setSettings({
          maintenanceMode: settingsMap.maintenance_mode === "true",
          maintenanceMessage:
            settingsMap.maintenance_message || "We're currently performing maintenance. Please check back soon.",
          maxBidsPerJob: Number.parseInt(settingsMap.max_bids_per_job || "10"),
          announcementEnabled: settingsMap.announcement_enabled === "true",
          announcementMessage: settingsMap.announcement_message || "This is a test message",
          announcementType: settingsMap.announcement_type || "error",
          allowNewSignups: settingsMap.allow_new_signups !== "false", // default true
          requireEmailVerification: settingsMap.require_email_verification === "true",
          requireContractorVerification: settingsMap.require_contractor_verification === "true",
        })
      }
    } catch (error) {
      console.error("[v0] Failed to fetch settings:", error)
    }
  }

  const handleSaveChanges = async () => {
    setLoading(true)
    try {
      const settingsToSave = [
        { key: "maintenance_mode", value: settings.maintenanceMode.toString() },
        { key: "maintenance_message", value: settings.maintenanceMessage },
        { key: "max_bids_per_job", value: settings.maxBidsPerJob.toString() },
        { key: "announcement_enabled", value: settings.announcementEnabled.toString() },
        { key: "announcement_message", value: settings.announcementMessage },
        { key: "announcement_type", value: settings.announcementType },
        { key: "allow_new_signups", value: settings.allowNewSignups.toString() },
        { key: "require_email_verification", value: settings.requireEmailVerification.toString() },
        { key: "require_contractor_verification", value: settings.requireContractorVerification.toString() },
      ]

      // Save each setting individually
      const results = await Promise.all(
        settingsToSave.map((setting) =>
          fetch("/api/admin/settings", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(setting),
          }),
        ),
      )

      const allSuccessful = results.every((r) => r.ok)

      if (allSuccessful) {
        toast.success("Settings saved successfully")
        await fetchSettings() // Refresh settings from server
      } else {
        toast.error("Some settings failed to save")
      }
    } catch (error) {
      console.error("[v0] Failed to save settings:", error)
      toast.error("Failed to save settings")
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordUpdate = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error("New passwords do not match")
      return
    }

    if (passwordForm.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordForm),
      })

      if (response.ok) {
        toast.success("Password updated successfully")
        setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
      } else {
        const data = await response.json()
        toast.error(data.error || "Failed to update password")
      }
    } catch (error) {
      toast.error("Failed to update password")
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: "general", label: "General", icon: Settings },
    { id: "announcements", label: "Announcements", icon: Bell },
    { id: "features", label: "Feature Flags", icon: Flag },
    { id: "security", label: "Security", icon: Shield },
  ]

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground mt-1">Configure platform settings and feature flags</p>
        </div>
        <Button onClick={handleSaveChanges} disabled={loading} className="bg-black hover:bg-black/90">
          Save Changes
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b mb-8">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-black font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* General Tab */}
      {activeTab === "general" && (
        <div className="space-y-8">
          {/* Maintenance Mode */}
          <div className="bg-white rounded-lg border p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Maintenance Mode</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Enable maintenance mode to prevent user access. A full-screen overlay will appear for all non-admin
                users.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="maintenance-mode">Enable Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">Users will see a maintenance message</p>
                </div>
                <Switch
                  id="maintenance-mode"
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) => setSettings({ ...settings, maintenanceMode: checked })}
                />
              </div>

              <div>
                <Label htmlFor="maintenance-message">Maintenance Message</Label>
                <Textarea
                  id="maintenance-message"
                  value={settings.maintenanceMessage}
                  onChange={(e) => setSettings({ ...settings, maintenanceMessage: e.target.value })}
                  rows={4}
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          {/* Platform Limits */}
          <div className="bg-white rounded-lg border p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Platform Limits</h2>
              <p className="text-sm text-muted-foreground mt-1">Configure platform-wide limits to prevent abuse</p>
            </div>

            <div>
              <Label htmlFor="max-bids">Maximum Bids Per Job</Label>
              <Input
                id="max-bids"
                type="number"
                value={settings.maxBidsPerJob}
                onChange={(e) => setSettings({ ...settings, maxBidsPerJob: Number.parseInt(e.target.value) })}
                className="mt-2 max-w-xs"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Prevents homeowners from being overwhelmed with bids. Recommended: 10-20
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Announcements Tab */}
      {activeTab === "announcements" && (
        <div className="bg-white rounded-lg border p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Platform Announcements</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Display a banner message at the top of every page for all users. Use for important updates, scheduled
              maintenance, or new features.
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="announcement-enabled">Enable Announcement</Label>
                <p className="text-sm text-muted-foreground">Show announcement banner to all users</p>
              </div>
              <Switch
                id="announcement-enabled"
                checked={settings.announcementEnabled}
                onCheckedChange={(checked) => setSettings({ ...settings, announcementEnabled: checked })}
              />
            </div>

            <div>
              <Label htmlFor="announcement-message">Announcement Message</Label>
              <Textarea
                id="announcement-message"
                value={settings.announcementMessage}
                onChange={(e) => setSettings({ ...settings, announcementMessage: e.target.value })}
                rows={4}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="announcement-type">Announcement Type</Label>
              <Select
                value={settings.announcementType}
                onValueChange={(value) => setSettings({ ...settings, announcementType: value })}
              >
                <SelectTrigger className="mt-2">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="error">Error (Red) - Critical alerts</SelectItem>
                  <SelectItem value="warning">Warning (Yellow) - Important notices</SelectItem>
                  <SelectItem value="info">Info (Blue) - General information</SelectItem>
                  <SelectItem value="success">Success (Green) - Positive updates</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Feature Flags Tab */}
      {activeTab === "features" && (
        <div className="bg-white rounded-lg border p-6">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Feature Flags</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Enable or disable platform features. Phone verification is mandatory for all accounts.
            </p>
          </div>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="allow-signups">Allow New Signups</Label>
                <p className="text-sm text-muted-foreground">Disable during beta testing or invite-only periods</p>
              </div>
              <Switch
                id="allow-signups"
                checked={settings.allowNewSignups}
                onCheckedChange={(checked) => setSettings({ ...settings, allowNewSignups: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="email-verification">Require Email Verification</Label>
                <p className="text-sm text-muted-foreground">Users must verify email before accessing platform</p>
              </div>
              <Switch
                id="email-verification"
                checked={settings.requireEmailVerification}
                onCheckedChange={(checked) => setSettings({ ...settings, requireEmailVerification: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="contractor-verification">Require Contractor Verification</Label>
                <p className="text-sm text-muted-foreground">
                  Contractors must be verified (with Google or manually by Admin) to bid on jobs
                </p>
              </div>
              <Switch
                id="contractor-verification"
                checked={settings.requireContractorVerification}
                onCheckedChange={(checked) => setSettings({ ...settings, requireContractorVerification: checked })}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-1">Phone Verification (Mandatory)</h3>
              <p className="text-sm text-blue-700">
                All customer and contractor accounts must verify their phone number. This setting cannot be disabled.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="space-y-8">
          {/* Change Password */}
          <div className="bg-white rounded-lg border p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Change Admin Password</h2>
              <p className="text-sm text-muted-foreground mt-1">Update your admin account password</p>
            </div>

            <div className="space-y-4 max-w-xl">
              <div>
                <Label htmlFor="current-password">Current Password</Label>
                <div className="relative">
                  <Input
                    id="current-password"
                    type={showPasswords.current ? "text" : "password"}
                    value={passwordForm.currentPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                    className="mt-2 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, current: !showPasswords.current })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPasswords.current ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPasswords.new ? "text" : "password"}
                    placeholder="Min 6 characters"
                    value={passwordForm.newPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                    className="mt-2 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, new: !showPasswords.new })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPasswords.new ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirm-password"
                    type={showPasswords.confirm ? "text" : "password"}
                    placeholder="Re-enter new password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                    className="mt-2 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPasswords({ ...showPasswords, confirm: !showPasswords.confirm })}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPasswords.confirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button onClick={handlePasswordUpdate} disabled={loading} className="bg-black hover:bg-black/90">
                Update Password
              </Button>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-lg border p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Security Settings</h2>
              <p className="text-sm text-muted-foreground mt-1">View security and access controls (read-only)</p>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Rate Limiting</h3>
                <p className="text-sm text-muted-foreground mb-1">
                  Current settings: 5 login attempts per 15 minutes per IP address
                </p>
                <p className="text-sm text-muted-foreground mb-1">
                  Account lockout: 30 minutes after 5 failed attempts
                </p>
                <p className="text-sm text-muted-foreground">
                  These settings are configured at the backend level for security.
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Two-Factor Authentication (2FA)</h3>
                <p className="text-sm text-muted-foreground mb-1">
                  2FA via Twilio SMS is planned for admin accounts. This will add an extra layer of security requiring a
                  phone verification code on login.
                </p>
                <p className="text-sm text-muted-foreground">Status: Coming soon</p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-2">Session Management</h3>
                <p className="text-sm text-muted-foreground mb-1">
                  Admin sessions: 2 hours token expiry (enhanced security)
                </p>
                <p className="text-sm text-muted-foreground mb-1">Regular user sessions: 7 days token expiry</p>
                <p className="text-sm text-muted-foreground">
                  These settings are hardcoded in the backend for security.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
