"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Home, MessageSquare, Settings, LogOut, FileText, Star, Menu, X } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useState, useEffect, useRef } from "react"
import { apiClient } from "@/lib/api-client"
import { FeedbackModal } from "@/components/feedback-modal"

interface DashboardLayoutProps {
  children: ReactNode
  userRole: "homeowner" | "contractor"
}

interface NotificationCounts {
  dashboard: number
  reviews: number
  messages: number
}

export function DashboardLayout({ children, userRole }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout, user } = useAuth()
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [imageLoadError, setImageLoadError] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [notificationCounts, setNotificationCounts] = useState<NotificationCounts>({
    dashboard: 0,
    reviews: 0,
    messages: 0,
  })
  const notificationFetchInitialized = useRef(false)
  const notificationFetchInProgress = useRef(false)

  useEffect(() => {
    if (!user?.id) return
    if (notificationFetchInitialized.current) return

    notificationFetchInitialized.current = true

    const fetchNotificationCounts = async () => {
      if (notificationFetchInProgress.current) {
        return
      }

      notificationFetchInProgress.current = true

      try {
        if (userRole === "homeowner") {
          const [notifications, conversations] = await Promise.all([
            apiClient.request<any[]>("/api/notifications", { requiresAuth: true }),
            apiClient.request<any[]>("/api/conversations", { requiresAuth: true }).catch(() => []),
          ])

          const newBidsCount = notifications.filter((n) => n.type === "new_bid" && !n.is_read).length
          const unreadMessagesCount = conversations.reduce((sum, conv) => sum + Number(conv.unread_count || 0), 0)

          setNotificationCounts({
            dashboard: newBidsCount,
            reviews: 0,
            messages: unreadMessagesCount,
          })
        } else {
          const [notifications, leadsResponse, conversations] = await Promise.all([
            apiClient.request<any[]>("/api/notifications", { requiresAuth: true }),
            apiClient.request<any>("/api/leads?page=1&limit=100", { requiresAuth: true }),
            apiClient.request<any[]>("/api/conversations", { requiresAuth: true }).catch(() => []),
          ])

          const missions = leadsResponse.missions || leadsResponse || []
          const newJobsCount = missions.filter((m: any) => m.viewed_by_contractor === false).length
          const newReviewsCount = notifications.filter((n) => n.type === "new_review" && !n.is_read).length
          const unreadMessagesCount = conversations.reduce((sum, conv) => sum + Number(conv.unread_count || 0), 0)

          setNotificationCounts({
            dashboard: newJobsCount,
            reviews: newReviewsCount,
            messages: unreadMessagesCount,
          })
        }
      } catch (error) {
        console.error("Error fetching notification counts:", error)
      } finally {
        notificationFetchInProgress.current = false
      }
    }

    fetchNotificationCounts()
    const interval = setInterval(fetchNotificationCounts, 30000)

    return () => {
      clearInterval(interval)
    }
  }, [userRole])

  useEffect(() => {
    if (pathname === "/dashboard/homeowner" || pathname === "/dashboard/contractor") {
      setNotificationCounts((prev) => ({ ...prev, dashboard: 0 }))
    } else if (pathname.includes("/messages")) {
      setNotificationCounts((prev) => ({ ...prev, messages: 0 }))
    }
  }, [pathname])

  useEffect(() => {
    const fetchProfilePhoto = async () => {
      try {
        const data = await apiClient.request<any>("/api/users/profile", { requiresAuth: true })
        if (userRole === "contractor") {
          setProfilePhoto(data.logo_url || data.agent_photo_url || null)
        } else {
          setProfilePhoto(data.profile_photo_url || null)
        }
        setImageLoadError(false)
      } catch (error) {
        console.error("Error fetching profile photo:", error)
      }
    }

    fetchProfilePhoto()
  }, [userRole])

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const homeownerNav = [
    { href: "/dashboard/homeowner", label: "Dashboard", icon: Home, badge: "dashboard" },
    { href: "/dashboard/homeowner/reviews", label: "Reviews", icon: Star, badge: "reviews" },
    { href: "/dashboard/homeowner/messages", label: "Messages", icon: MessageSquare, badge: "messages" },
    { href: "/dashboard/settings", label: "Settings", icon: Settings, badge: null },
  ]

  const contractorNav = [
    { href: "/dashboard/contractor", label: "Dashboard", icon: Home, badge: "dashboard" },
    { href: "/dashboard/contractor/bids", label: "My Bids", icon: FileText, badge: null },
    { href: "/dashboard/contractor/reviews", label: "Reviews", icon: Star, badge: "reviews" },
    { href: "/dashboard/contractor/messages", label: "Messages", icon: MessageSquare, badge: "messages" },
    { href: "/dashboard/settings", label: "Settings", icon: Settings, badge: null },
  ]

  const navItems = userRole === "homeowner" ? homeownerNav : contractorNav

  const getBadgeCount = (badgeKey: string | null): number => {
    if (!badgeKey) return 0
    return notificationCounts[badgeKey as keyof NotificationCounts] || 0
  }

  const handleLogout = () => {
    logout()
  }

  const handleProfileClick = () => {
    if (userRole === "contractor") {
      router.push("/dashboard/contractor/profile")
    } else {
      router.push("/dashboard/homeowner/profile")
    }
  }

  const getUserInitials = () => {
    if (user?.name) {
      const names = user.name.split(" ")
      if (names.length >= 2) {
        return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase()
      }
      return user.name.charAt(0).toUpperCase()
    }
    return "U"
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <aside
        className={`
          fixed md:static inset-y-0 left-0 z-50
          w-64 bg-[#0D3D42] border-r border-[#d8e2fb]/10 flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <div className="p-6 border-b border-[#d8e2fb]/10 flex items-center justify-between">
          <div className="flex items-center">
            <Image src="/images/logo-white.png" alt="HomeHero" width={140} height={35} className="h-8 w-auto" />
          </div>
          <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-white/70 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            const badgeCount = getBadgeCount(item.badge)

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive ? "bg-[#328d87] text-white" : "text-[#d8e2fb]/70 hover:bg-[#0D3D42]/50 hover:text-[#d8e2fb]"
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium flex-1">{item.label}</span>
                {badgeCount > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center">
                    {badgeCount}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-[#d8e2fb]/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#d8e2fb]/70 hover:bg-[#0D3D42]/50 hover:text-[#d8e2fb] transition-colors w-full"
          >
            <LogOut className="h-5 w-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto w-full">
        <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
          <div className="flex items-center justify-between md:justify-end gap-3">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-gray-700 hover:bg-gray-100 p-2 rounded-lg transition-colors"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex items-center gap-3">
              <FeedbackModal />
              <button
                onClick={handleLogout}
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm font-medium">Log out</span>
              </button>
              <button
                onClick={handleProfileClick}
                className="w-10 h-10 rounded-full bg-[#328d87] flex items-center justify-center text-white hover:opacity-90 transition-opacity overflow-hidden"
              >
                {profilePhoto && !imageLoadError ? (
                  <img
                    src={profilePhoto || "/placeholder.svg"}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={() => setImageLoadError(true)}
                  />
                ) : (
                  <span className="text-sm font-semibold">{getUserInitials()}</span>
                )}
              </button>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 max-w-7xl">{children}</div>
      </main>
    </div>
  )
}
