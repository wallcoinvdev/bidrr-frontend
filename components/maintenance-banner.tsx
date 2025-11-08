"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api-client"

interface MaintenanceSettings {
  maintenance_mode: boolean
  maintenance_message: string
}

export function MaintenanceBanner() {
  const [settings, setSettings] = useState<MaintenanceSettings | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    checkUserRole()
    fetchSettings()
  }, []) // Only run once on mount

  const fetchSettings = async () => {
    try {
      const response = await apiClient.get<{ settings: Record<string, string> }>("/api/settings/public", {
        requiresAuth: false,
      })

      const maintenanceMode = response.settings.maintenance_mode === "true"
      const maintenanceMessage =
        response.settings.maintenance_message || "We're currently performing maintenance. Please check back soon."

      setSettings({
        maintenance_mode: maintenanceMode,
        maintenance_message: maintenanceMessage,
      })
    } catch (error: any) {
      console.log("[v0] Maintenance banner: Failed to fetch settings, silently continuing")
      // This prevents the error from appearing in production
    }
  }

  const checkUserRole = () => {
    const path = typeof window !== "undefined" ? window.location.pathname : ""
    const isAdminPath = path.includes("/dashboard/admin")
    setIsAdmin(isAdminPath)
  }

  const isMaintenanceMode = settings?.maintenance_mode === true

  // Don't show banner if dismissed, not in maintenance mode, or user is admin
  if (dismissed || !isMaintenanceMode || isAdmin || !settings) {
    return null
  }

  return (
    <Alert className="rounded-none border-x-0 border-t-0 bg-yellow-50 border-yellow-200 relative z-50">
      <AlertCircle className="h-4 w-4 text-yellow-600" />
      <AlertDescription className="flex items-center justify-between text-yellow-900">
        <span className="font-medium">{settings.maintenance_message}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDismissed(true)}
          className="h-6 w-6 p-0 hover:bg-yellow-100 text-yellow-900"
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  )
}
