"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Settings, Bell, Shield, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { usePageTitle } from "@/hooks/use-page-title"

type TabType = "general" | "announcements" | "security"

export default function SettingsPage() {
  usePageTitle("System Settings")

  const [activeTab, setActiveTab] = useState<TabType>("general")
  const [loading, setLoading] = useState(false)

  const [settings, setSettings] = useState({
    maintenanceMode: false,
    maintenanceMessage: "We're currently performing maintenance. Please check back soon.",
    announcementEnabled: false,
    announcementMessage: "This is a test message",
    announcementType: "error",
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

  const handleSaveChanges = async () => {
    setLoading(true)
    try {
      const settingsToSave = [
        { key: "maintenance_mode", value: settings.maintenanceMode.toString() },
        { key: "maintenance_message", value: settings.maintenanceMessage },
        { key: "announcement_enabled", value: settings.announcementEnabled.toString() },
        { key: "announcement_message", value: settings.announcementMessage },
        { key: "announcement_type", value: settings.announcementType },
      ]

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
    { id: "security", label: "Security", icon: Shield },
  ]

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">System Settings</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">Configure platform settings and feature flags</p>
      </div>

      <div className="flex gap-1 md:gap-2 border-b mb-6 md:mb-8 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={`flex items-center gap-2 px-4 md:px-6 py-3 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? "border-black font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm md:text-base">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* General Tab */}
      {activeTab === "general" && (
        <div className="space-y-6 md:space-y-8">
          {/* Maintenance Mode */}
          <div className="bg-white rounded-lg border p-4 md:p-6">
            <div className="mb-4">
              <h2 className="text-lg md:text-xl font-semibold">Maintenance Mode</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Enable maintenance mode to prevent user access. A full-screen overlay will appear for all non-admin
                users.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex-1">
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

            <div className="flex justify-end mt-6">
              <Button
                onClick={handleSaveChanges}
                disabled={loading}
                className="bg-black hover:bg-black/90 w-full sm:w-auto"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Announcements Tab */}
      {activeTab === "announcements" && (
        <div className="space-y-6 md:space-y-8">
          <div className="bg-white rounded-lg border p-4 md:p-6">
            <div className="mb-4">
              <h2 className="text-lg md:text-xl font-semibold">Platform Announcements</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Display a banner message at the top of every page for all users. Use for important updates, scheduled
                maintenance, or new features.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div className="flex-1">
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

            <div className="flex justify-end mt-6">
              <Button
                onClick={handleSaveChanges}
                disabled={loading}
                className="bg-black hover:bg-black/90 w-full sm:w-auto"
              >
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Security Tab */}
      {activeTab === "security" && (
        <div className="space-y-6 md:space-y-8">
          {/* Change Password */}
          <div className="bg-white rounded-lg border p-4 md:p-6">
            <div className="mb-4">
              <h2 className="text-lg md:text-xl font-semibold">Change Admin Password</h2>
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

              <Button
                onClick={handlePasswordUpdate}
                disabled={loading}
                className="bg-black hover:bg-black/90 w-full sm:w-auto"
              >
                Update Password
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
