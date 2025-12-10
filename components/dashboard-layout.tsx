"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import { Home, MessageSquare, Settings, LogOut, FileText, Star, Menu, X, AlertTriangle, Coins } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useState, useEffect, useRef } from "react"
import { apiClient } from "@/lib/api-client"
import { FeedbackModal } from "@/components/feedback-modal"
import { useToast } from "@/hooks/use-toast"
import { VerifiedBadge } from "@/components/verified-badge"
import { initiateStripeCheckout } from "@/lib/checkout"

interface DashboardLayoutProps {
  children: ReactNode
  userRole: "homeowner" | "contractor"
}

interface NotificationCounts {
  dashboard: number
  reviews: number
  messages: number
  pendingReviews: number
  myBids: number
}

export function DashboardLayout({ children, userRole }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout, user, isImpersonating, exitImpersonation } = useAuth()
  const { toast } = useToast()
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null)
  const [imageLoadError, setImageLoadError] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const [notificationCounts, setNotificationCounts] = useState<NotificationCounts>({
    dashboard: 0,
    reviews: 0,
    messages: 0,
    pendingReviews: 0,
    myBids: 0,
  })
  const notificationFetchInitialized = useRef(false)
  const notificationFetchInProgress = useRef(false)
  const initializedForUserId = useRef<number | null>(null)
  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false)

  useEffect(() => {
    if (!user?.id) return
    if (initializedForUserId.current !== user.id) {
      notificationFetchInitialized.current = false
      initializedForUserId.current = user.id
    }
    if (notificationFetchInitialized.current) return

    notificationFetchInitialized.current = true

    const fetchNotificationCounts = async () => {
      if (notificationFetchInProgress.current) {
        return
      }

      notificationFetchInProgress.current = true

      try {
        if (userRole === "homeowner") {
          const [notifications, conversations, acceptedBids] = await Promise.all([
            apiClient.request<any[]>("/api/notifications", { requiresAuth: true }),
            apiClient.request<any[]>("/api/conversations", { requiresAuth: true }).catch(() => []),
            apiClient.request<any[]>("/api/homeowner/accepted-bids", { requiresAuth: true }).catch(() => []),
          ])

          const newBidsCount = notifications.filter((n) => n.type === "new_bid" && !n.is_read).length
          const unreadMessagesCount = conversations.reduce((sum, conv) => sum + Number(conv.unread_count || 0), 0)
          const pendingReviewsCount = acceptedBids.filter((bid: any) => !bid.has_reviewed).length

          console.log(
            "[v0] Homeowner unread messages count:",
            unreadMessagesCount,
            "from conversations:",
            conversations,
          )

          setNotificationCounts({
            dashboard: newBidsCount,
            reviews: 0,
            messages: unreadMessagesCount,
            pendingReviews: pendingReviewsCount,
            myBids: 0,
          })
        } else {
          const [notifications, leadsResponse, conversations, recentBidsResponse] = await Promise.all([
            apiClient.request<any[]>("/api/notifications", { requiresAuth: true }),
            apiClient.request<any>("/api/leads?page=1&limit=100", { requiresAuth: true }),
            apiClient.request<any[]>("/api/conversations", { requiresAuth: true }).catch(() => []),
            apiClient.request<any>("/api/contractor/recent-bids", { requiresAuth: true }).catch(() => []),
          ])

          const missions = leadsResponse.leads || leadsResponse.missions || leadsResponse || []
          const newJobsCount = Array.isArray(missions)
            ? missions.filter((m: any) => m.viewed_by_contractor === false).length
            : 0
          const newReviewsCount = notifications.filter((n) => n.type === "new_review" && !n.is_read).length
          const unreadMessagesCount = conversations.reduce((sum, conv) => sum + Number(conv.unread_count || 0), 0)
          const recentBids = Array.isArray(recentBidsResponse) ? recentBidsResponse : recentBidsResponse?.bids || []
          const unviewedBidsCount = recentBids.filter((b: any) => b.viewed_by_contractor === false).length

          console.log(
            "[v0] Contractor unread messages count:",
            unreadMessagesCount,
            "from conversations:",
            conversations,
          )

          setNotificationCounts({
            dashboard: newJobsCount,
            reviews: newReviewsCount,
            messages: unreadMessagesCount,
            pendingReviews: 0,
            myBids: unviewedBidsCount,
          })
        }
      } catch (error) {
        console.error("Error fetching notification counts:", error)
      } finally {
        notificationFetchInProgress.current = false
      }
    }

    fetchNotificationCounts()
    const interval = setInterval(fetchNotificationCounts, 60000)

    const handleNotificationUpdate = () => {
      fetchNotificationCounts()
    }

    const handleReviewsPageViewed = (event: any) => {
      const count = event.detail?.count || 0
      if (count > 0) {
        setNotificationCounts((prev) => ({
          ...prev,
          reviews: 0,
        }))
      }
    }

    const handleBidViewed = () => {
      setNotificationCounts((prev) => ({
        ...prev,
        myBids: Math.max(0, prev.myBids - 1),
      }))
    }

    window.addEventListener("notificationUpdated", handleNotificationUpdate)
    window.addEventListener("reviewsPageViewed", handleReviewsPageViewed as EventListener)
    window.addEventListener("bidViewed", handleBidViewed)

    return () => {
      clearInterval(interval)
      window.removeEventListener("notificationUpdated", handleNotificationUpdate)
      window.removeEventListener("reviewsPageViewed", handleReviewsPageViewed as EventListener)
      window.removeEventListener("bidViewed", handleBidViewed)
    }
  }, [userRole, user?.id])

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const data = await apiClient.request<any[]>("/api/notifications", { requiresAuth: true })
        setNotifications(data)
        setUnreadCount(data.filter((n) => !n.is_read).length)
      } catch (error) {
        console.error("Error fetching notifications:", error)
      }
    }

    fetchNotifications()
    const interval = setInterval(fetchNotifications, 60000)

    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      clearInterval(interval)
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (pathname === "/dashboard/homeowner" || pathname === "/dashboard/contractor") {
      setNotificationCounts((prev) => ({ ...prev, dashboard: 0 }))
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
    { href: "/dashboard/homeowner/reviews", label: "Reviews", icon: Star, badge: "pendingReviews" },
    { href: "/dashboard/homeowner/messages", label: "Messages", icon: MessageSquare, badge: "messages" },
    { href: "/dashboard/settings", label: "Settings", icon: Settings, badge: null },
  ]

  const contractorNav = [
    { href: "/dashboard/contractor", label: "Dashboard", icon: Home, badge: "dashboard" },
    { href: "/dashboard/contractor/bids", label: "My Bids", icon: FileText, badge: "myBids" },
    { href: "/dashboard/contractor/reviews", label: "Reviews", icon: Star, badge: "reviews" },
    { href: "/dashboard/contractor/messages", label: "Messages", icon: MessageSquare, badge: "messages" },
    { label: "Buy Credits", icon: Coins, badge: null },
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
    if (user?.first_name && user?.last_name) {
      return `${user.first_name.charAt(0)}${user.last_name.charAt(0)}`.toUpperCase()
    }
    if (user?.first_name) {
      return user.first_name.charAt(0).toUpperCase()
    }
    return "U"
  }

  const handleAppStoreClick = () => {
    console.log("[v0] App Store/Google Play button clicked")
    console.log("[v0] Toast function exists:", typeof toast)
    console.log("[v0] About to call toast with:", {
      title: "Coming Soon",
      description: "Our mobile app will be available soon on the App Store and Google Play!",
      duration: 5000,
    })
    const result = toast({
      variant: "default",
      title: "Coming Soon",
      description: "Our mobile app will be available soon on the App Store and Google Play!",
      duration: 5000,
    })
    console.log("[v0] Toast result:", result)
    console.log("[v0] Toast called successfully")
  }

  const handleNotificationClick = async (notification: any) => {
    try {
      if (!notification.is_read) {
        await apiClient.request(`/api/notifications/${notification.id}/mark-read`, {
          method: "POST",
          requiresAuth: true,
        })
        setNotifications((prev) => prev.map((n) => (n.id === notification.id ? { ...n, is_read: true } : n)))
        setUnreadCount((prev) => Math.max(0, prev - 1))

        if (notification.type === "new_review") {
          setNotificationCounts((prev) => ({
            ...prev,
            reviews: Math.max(0, prev.reviews - 1),
          }))
        } else if (notification.type === "new_bid") {
          setNotificationCounts((prev) => ({
            ...prev,
            dashboard: Math.max(0, prev.dashboard - 1),
          }))
        } else if (notification.type === "pending_review") {
          setNotificationCounts((prev) => ({
            ...prev,
            pendingReviews: Math.max(0, prev.pendingReviews - 1),
          }))
        }
      }

      if (notification.mission_id) {
        if (userRole === "homeowner" && notification.type === "new_bid") {
          router.push(`/dashboard/homeowner/jobs/${notification.mission_id}/bids`)
        } else if (userRole === "contractor") {
          router.push(`/dashboard/contractor`)
        }
      }

      setShowNotifications(false)
    } catch (error) {
      console.error("Error handling notification:", error)
    }
  }

  const handleBellClick = async () => {
    const isOpening = !showNotificationDropdown
    setShowNotificationDropdown(isOpening)

    // When opening the dropdown, mark all notifications as viewed
    if (isOpening && unreadCount > 0) {
      try {
        await apiClient.request("/api/notifications/mark-viewed", {
          method: "PUT",
          requiresAuth: true,
        })

        // Clear badge count immediately
        setUnreadCount(0)
        setNotificationCounts({
          dashboard: 0,
          reviews: 0,
          messages: 0,
          pendingReviews: 0,
          myBids: 0,
        })

        // Mark all notifications as read locally
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      } catch (error) {
        console.error("Error marking notifications as viewed:", error)
        // Clear locally even if API fails
        setUnreadCount(0)
        setNotificationCounts({
          dashboard: 0,
          reviews: 0,
          messages: 0,
          pendingReviews: 0,
          myBids: 0,
        })
        setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })))
      }
    }
  }

  const handleClearAll = async () => {
    try {
      await apiClient.request("/api/notifications/clear-all", {
        method: "DELETE",
        requiresAuth: true,
      })

      // Clear all notifications permanently
      setNotifications([])
      setUnreadCount(0)
      setNotificationCounts({
        dashboard: 0,
        reviews: 0,
        messages: 0,
        pendingReviews: 0,
        myBids: 0,
      })
    } catch (error) {
      console.error("Error clearing notifications:", error)
      // Clear locally even if API fails
      setNotifications([])
      setUnreadCount(0)
      setNotificationCounts({
        dashboard: 0,
        reviews: 0,
        messages: 0,
        pendingReviews: 0,
        myBids: 0,
      })
    }
  }

  const formatNotificationTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "Just now"
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const handleBuyCredits = async () => {
    try {
      await initiateStripeCheckout()
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to initiate checkout. Please try again.",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {isImpersonating && (
        <div className="bg-yellow-500 text-gray-900 px-4 py-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            <span className="font-medium">
              Admin Mode: Viewing as {user?.first_name || user?.email || `User #${user?.id}`}
            </span>
          </div>
          <button
            onClick={exitImpersonation}
            className="px-4 py-1 bg-gray-900 text-white rounded hover:bg-gray-800 transition-colors text-sm font-medium"
          >
            Exit to Admin Panel
          </button>
        </div>
      )}

      <div className="flex h-screen">
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
        )}

        <aside
          className={`fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-[#03353a] via-[#0d3d42] to-[#328d87] text-white transform transition-transform duration-300 ease-in-out md:translate-x-0 md:static ${
            isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full">
            <div className="p-6 flex items-center justify-between">
              <Image src="/images/bidrr-white-logo.png" alt="Bidrr" width={120} height={40} className="h-8 w-auto" />
              <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-white/70 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>

            <nav className="flex-1 px-4 space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href
                const badgeCount = getBadgeCount(item.badge)
                const Icon = item.icon

                if (item.label === "Buy Credits") {
                  return (
                    <button
                      key={item.href}
                      onClick={handleBuyCredits}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors w-full text-left ${
                        isActive ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </button>
                  )
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                    {badgeCount > 0 && (
                      <span className="ml-auto bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                        {badgeCount}
                      </span>
                    )}
                  </Link>
                )
              })}
            </nav>

            <div className="p-4 space-y-4 border-t border-white/10">
              <div className="flex flex-col gap-2 px-4 py-2">
                <button
                  onClick={handleAppStoreClick}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-left text-sm"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
                  </svg>
                  <div className="flex flex-col">
                    <span className="text-xs text-white/70">Download on the</span>
                    <span className="font-semibold">App Store</span>
                  </div>
                </button>

                <button
                  onClick={handleAppStoreClick}
                  className="w-full flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors text-left text-sm"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,11.15L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                  </svg>
                  <div className="flex flex-col">
                    <span className="text-xs text-white/70">GET IT ON</span>
                    <span className="font-semibold">Google Play</span>
                  </div>
                </button>
              </div>

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 text-white/70 hover:bg-white/5 hover:text-white rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden text-gray-700 hover:bg-gray-100 p-2 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-2 ml-auto">
                {userRole === "contractor" && (
                  <button
                    onClick={handleBuyCredits}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
                    title="Buy Credits"
                  >
                    <Coins className="w-5 h-5 text-gray-700" />
                  </button>
                )}

                <div className="relative">
                  <button
                    onClick={handleBellClick}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors relative"
                  >
                    <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotificationDropdown && (
                    <div className="fixed left-0 right-0 top-[72px] bg-white border-b border-gray-200 shadow-lg p-4 z-[9998] max-h-[80vh] overflow-y-auto sm:absolute sm:top-12 sm:left-auto sm:right-0 sm:w-80 sm:rounded-lg sm:border">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-lg">Notifications</h3>
                        <div className="flex items-center gap-2">
                          <button onClick={handleClearAll} className="text-sm text-[#0F766E] hover:text-[#0d5f57]">
                            Clear All
                          </button>
                          <button
                            onClick={() => setShowNotificationDropdown(false)}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            aria-label="Close notifications"
                          >
                            <X className="h-5 w-5 text-gray-600" />
                          </button>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {notifications.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-4">You have no new notifications</p>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              onClick={() => handleNotificationClick(notification)}
                              className={`p-3 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer ${
                                notification.is_read ? "bg-white" : "bg-gray-50"
                              }`}
                            >
                              <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                              <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                              <p className="text-xs text-gray-400 mt-1">
                                {formatNotificationTime(notification.created_at)}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <FeedbackModal />

                {user && (
                  <div className="flex items-center gap-2">
                    {user.phone_verified && (
                      <div className="flex items-center gap-1.5 text-sm">
                        <VerifiedBadge type="phone" size="sm" showLabel={false} />
                        <span className="text-gray-600 hidden sm:inline">Phone verified</span>
                      </div>
                    )}
                    {userRole === "contractor" && user?.google_business_url && (
                      <div className="flex items-center gap-1.5 text-sm">
                        <VerifiedBadge type="google" size="sm" showLabel={false} />
                        <span className="text-gray-600 hidden sm:inline">Google verified</span>
                      </div>
                    )}
                  </div>
                )}

                <button
                  onClick={handleProfileClick}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  {profilePhoto && !imageLoadError ? (
                    <img
                      src={profilePhoto || "/placeholder.svg"}
                      alt="Profile"
                      className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                      onError={() => setImageLoadError(true)}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#03353a] text-white flex items-center justify-center font-semibold border-2 border-gray-200">
                      {getUserInitials()}
                    </div>
                  )}
                </button>
              </div>
            </div>
          </header>

          <main className="flex-1 overflow-auto p-6">{children}</main>
        </div>
      </div>
    </div>
  )
}
