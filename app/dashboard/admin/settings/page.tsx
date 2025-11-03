"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Settings, Bell, Flag, Shield, Eye, EyeOff, Check } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface SystemSettings {
  maintenance_mode: boolean
  maintenance_message: string
  allow_new_signups: boolean
  require_email_verification: boolean
  require_contractor_verification: boolean
  max_bids_per_job: number
  announcement_enabled: boolean
  announcement_message: string
  announcement_type: "info" | "warning" | "error"
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<SystemSettings>({
    maintenance_mode: false,
    maintenance_message: "We're currently performing maintenance. Please check back soon.",
    allow_new_signups: true,
    require_email_verification: false,
    require_contractor_verification: true,
    max_bids_per_job: 10,
    announcement_enabled: false,
    announcement_message: "",
    announcement_type: "info",
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false) // Added state to show success indicator
  const { toast } = useToast()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get<{ settings: Array<{ key: string; value: string }> }>("/api/admin/settings")

      // Convert array to object: [{ key: "maintenance_mode", value: "true" }] -> { maintenance_mode: "true" }
      const settingsObj: Record<string, string> = {}
      response.settings.forEach((setting) => {
        settingsObj[setting.key] = setting.value
      })

      setSettings({
        maintenance_mode: settingsObj.maintenance_mode === "true",
        maintenance_message:
          settingsObj.maintenance_message ?? "We're currently performing maintenance. Please check back soon.",
        allow_new_signups: settingsObj.allow_new_signups === "true",
        require_email_verification: settingsObj.require_email_verification === "true",
        require_contractor_verification: settingsObj.require_contractor_verification === "true",
        max_bids_per_job: Number.parseInt(settingsObj.max_bids_per_job) || 10,
        announcement_enabled: settingsObj.announcement_enabled === "true",
        announcement_message: settingsObj.announcement_message ?? "",
        announcement_type: (settingsObj.announcement_type as "info" | "warning" | "error") ?? "info",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch settings",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const settingsToSave = [
        { key: "maintenance_mode", value: settings.maintenance_mode.toString() },
        { key: "maintenance_message", value: settings.maintenance_message },
        { key: "allow_new_signups", value: settings.allow_new_signups.toString() },
        { key: "require_email_verification", value: settings.require_email_verification.toString() },
        { key: "require_contractor_verification", value: settings.require_contractor_verification.toString() },
        { key: "max_bids_per_job", value: settings.max_bids_per_job.toString() },
        { key: "announcement_enabled", value: settings.announcement_enabled.toString() },
        { key: "announcement_message", value: settings.announcement_message },
        { key: "announcement_type", value: settings.announcement_type },
      ]

      // Save each setting individually
      await Promise.all(settingsToSave.map((setting) => apiClient.put("/api/admin/settings", setting)))

      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)

      toast({
        title: "✓ Settings Saved",
        description: "All system settings have been updated successfully.",
        variant: "default",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsChangingPassword(true)

    try {
      if (newPassword !== confirmPassword) {
        throw new Error("New passwords do not match")
      }

      if (newPassword.length < 6) {
        throw new Error("Password must be at least 6 characters")
      }

      await apiClient.post("/api/users/change-password", {
        currentPassword,
        newPassword,
      })

      toast({
        title: "Success",
        description: "Password changed successfully",
      })

      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      })
    } finally {
      setIsChangingPassword(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading settings...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Settings</h1>
          <p className="text-muted-foreground">Configure platform settings and feature flags</p>
        </div>
        <div className="flex items-center gap-3">
          {showSuccess && (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-lg animate-in fade-in slide-in-from-right-5">
              <Check className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-green-900">Settings saved successfully!</span>
            </div>
          )}
          <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="w-full overflow-x-auto flex-nowrap justify-start">
          <TabsTrigger value="general" className="flex-shrink-0">
            <Settings className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="announcements" className="flex-shrink-0">
            <Bell className="h-4 w-4 mr-2" />
            Announcements
          </TabsTrigger>
          <TabsTrigger value="features" className="flex-shrink-0">
            <Flag className="h-4 w-4 mr-2" />
            Feature Flags
          </TabsTrigger>
          <TabsTrigger value="security" className="flex-shrink-0">
            <Shield className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Maintenance Mode</CardTitle>
              <CardDescription>
                Enable maintenance mode to prevent user access. A full-screen overlay will appear for all non-admin
                users.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Maintenance Mode</Label>
                  <p className="text-sm text-muted-foreground">Users will see a maintenance message</p>
                </div>
                <Switch
                  checked={settings.maintenance_mode}
                  onCheckedChange={(checked) => setSettings({ ...settings, maintenance_mode: checked })}
                />
              </div>
              <div className="space-y-2">
                <Label>Maintenance Message</Label>
                <Textarea
                  value={settings.maintenance_message}
                  onChange={(e) => setSettings({ ...settings, maintenance_message: e.target.value })}
                  placeholder="Enter maintenance message..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Platform Limits</CardTitle>
              <CardDescription>Configure platform-wide limits to prevent abuse</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Maximum Bids Per Job</Label>
                <Input
                  type="number"
                  value={settings.max_bids_per_job}
                  onChange={(e) => setSettings({ ...settings, max_bids_per_job: Number.parseInt(e.target.value) })}
                  min={1}
                  max={50}
                />
                <p className="text-sm text-muted-foreground">
                  Prevents homeowners from being overwhelmed with bids. Recommended: 10-20
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="announcements" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Platform Announcements</CardTitle>
              <CardDescription>
                Display a banner message at the top of every page for all users. Use for important updates, scheduled
                maintenance, or new features.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Announcement</Label>
                  <p className="text-sm text-muted-foreground">Show announcement banner to all users</p>
                </div>
                <Switch
                  checked={settings.announcement_enabled}
                  onCheckedChange={(checked) => setSettings({ ...settings, announcement_enabled: checked })}
                />
              </div>
              <div className="space-y-2">
                <Label>Announcement Message</Label>
                <Textarea
                  value={settings.announcement_message}
                  onChange={(e) => setSettings({ ...settings, announcement_message: e.target.value })}
                  placeholder="Enter announcement message..."
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Announcement Type</Label>
                <select
                  className="w-full rounded-md border border-input bg-background px-3 py-2"
                  value={settings.announcement_type}
                  onChange={(e) =>
                    setSettings({ ...settings, announcement_type: e.target.value as "info" | "warning" | "error" })
                  }
                >
                  <option value="info">Info (Blue) - General information</option>
                  <option value="warning">Warning (Yellow) - Important notices</option>
                  <option value="error">Error (Red) - Critical alerts</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="features" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Feature Flags</CardTitle>
              <CardDescription>
                Enable or disable platform features. Phone verification is mandatory for all accounts.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow New Signups</Label>
                  <p className="text-sm text-muted-foreground">Disable during beta testing or invite-only periods</p>
                </div>
                <Switch
                  checked={settings.allow_new_signups}
                  onCheckedChange={(checked) => setSettings({ ...settings, allow_new_signups: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Email Verification</Label>
                  <p className="text-sm text-muted-foreground">Users must verify email before accessing platform</p>
                </div>
                <Switch
                  checked={settings.require_email_verification}
                  onCheckedChange={(checked) => setSettings({ ...settings, require_email_verification: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Require Contractor Verification</Label>
                  <p className="text-sm text-muted-foreground">
                    Contractors must be verified (with Google or manually by Admin) to bid on jobs
                  </p>
                </div>
                <Switch
                  checked={settings.require_contractor_verification}
                  onCheckedChange={(checked) => setSettings({ ...settings, require_contractor_verification: checked })}
                />
              </div>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <p className="text-sm text-blue-900 font-medium">Phone Verification (Mandatory)</p>
                <p className="text-sm text-blue-700 mt-1">
                  All customer and contractor accounts must verify their phone number. This setting cannot be disabled.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Change Admin Password</CardTitle>
              <CardDescription>Update your admin account password</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min 6 characters"
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter new password"
                      minLength={6}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <Button type="submit" disabled={isChangingPassword}>
                  {isChangingPassword ? "Updating..." : "Update Password"}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>View security and access controls (read-only)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg border p-4 space-y-2">
                <h4 className="font-medium">Rate Limiting</h4>
                <p className="text-sm text-muted-foreground">
                  Current settings: 5 login attempts per 15 minutes per IP address
                </p>
                <p className="text-sm text-muted-foreground">Account lockout: 30 minutes after 5 failed attempts</p>
                <p className="text-sm text-muted-foreground mt-2">
                  These settings are configured at the backend level for security.
                </p>
              </div>
              <div className="rounded-lg border p-4 space-y-2">
                <h4 className="font-medium">Two-Factor Authentication (2FA)</h4>
                <p className="text-sm text-muted-foreground">
                  2FA via Twilio SMS is planned for admin accounts. This will add an extra layer of security requiring a
                  phone verification code on login.
                </p>
                <p className="text-sm text-muted-foreground mt-2">Status: Coming soon</p>
              </div>
              <div className="rounded-lg border p-4 space-y-2">
                <h4 className="font-medium">Session Management</h4>
                <p className="text-sm text-muted-foreground">
                  Admin sessions: 2 hours token expiry (enhanced security)
                </p>
                <p className="text-sm text-muted-foreground">Regular user sessions: 7 days token expiry</p>
                <p className="text-sm text-muted-foreground mt-2">
                  These settings are hardcoded in the backend for security.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
