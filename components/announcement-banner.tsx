"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Info, AlertTriangle, AlertCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api-client"

interface AnnouncementSettings {
  announcement_enabled: boolean
  announcement_message: string
  announcement_type: "info" | "warning" | "error"
}

export function AnnouncementBanner() {
  const [settings, setSettings] = useState<AnnouncementSettings | null>(null)
  const [dismissed, setDismissed] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    fetchSettings()
  }, [pathname])

  const fetchSettings = async () => {
    try {
      const response = await apiClient.get<{ settings: Record<string, string> }>("/api/settings/public", {
        requiresAuth: false,
      })

      const announcementEnabled = response.settings.announcement_enabled === "true"
      const announcementMessage = response.settings.announcement_message || ""
      const announcementType = (response.settings.announcement_type as "info" | "warning" | "error") || "info"

      setSettings({
        announcement_enabled: announcementEnabled,
        announcement_message: announcementMessage,
        announcement_type: announcementType,
      })
    } catch (error: any) {
      // Silently fail - banner won't show if settings can't be fetched
    }
  }

  const isAnnouncementEnabled = settings?.announcement_enabled === true && settings?.announcement_message

  // Don't show banner if dismissed or not enabled
  if (dismissed || !isAnnouncementEnabled || !settings) {
    return null
  }

  // Determine colors and icon based on announcement type
  const getAnnouncementStyles = () => {
    switch (settings.announcement_type) {
      case "warning":
        return {
          bgColor: "bg-orange-50",
          borderColor: "border-orange-200",
          textColor: "text-orange-900",
          iconColor: "text-orange-600",
          hoverColor: "hover:bg-orange-100",
          Icon: AlertTriangle,
        }
      case "error":
        return {
          bgColor: "bg-red-50",
          borderColor: "border-red-200",
          textColor: "text-red-900",
          iconColor: "text-red-600",
          hoverColor: "hover:bg-red-100",
          Icon: AlertCircle,
        }
      default: // info
        return {
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
          textColor: "text-blue-900",
          iconColor: "text-blue-600",
          hoverColor: "hover:bg-blue-100",
          Icon: Info,
        }
    }
  }

  const styles = getAnnouncementStyles()
  const Icon = styles.Icon

  return (
    <Alert className={`rounded-none border-x-0 border-t-0 ${styles.bgColor} ${styles.borderColor} relative z-50`}>
      <Icon className={`h-4 w-4 ${styles.iconColor}`} />
      <AlertDescription className={`flex items-center justify-between ${styles.textColor}`}>
        <span className="font-medium">{settings.announcement_message}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDismissed(true)}
          className={`h-6 w-6 p-0 ${styles.hoverColor} ${styles.textColor}`}
        >
          <X className="h-4 w-4" />
        </Button>
      </AlertDescription>
    </Alert>
  )
}
