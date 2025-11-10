"use client"

import type React from "react"

import {
  FileText,
  TrendingUp,
  TrendingDown,
  Loader2,
  AlertCircle,
  MapPin,
  Clock,
  Users,
  Filter,
  X,
  Bell,
  Info,
  CalendarIcon,
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { apiClient } from "@/lib/api-client"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { containsContactInfo } from "@/lib/contact-validation"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { VerifiedBadge } from "@/components/verified-badge"
import { notificationService } from "@/lib/notification-service" // Added import

interface Stats {
  total_bids: number
  pending_bids: number
  accepted_bids: number
  considering_bids: number
  bids_remaining?: number
  available_bids?: number
  win_rate?: number
  loss_rate?: number
  wins?: number
  losses?: number
  resolved_bids?: number
  bids_reset_date?: string // Added bids_reset_date field
}

interface RecentBid {
  id: number
  mission_id: number
  mission_title: string
  quote: number
  status: string
  created_at: string
}

interface Mission {
  id: number
  title: string
  service: string
  priority: string
  created_at: string
  job_details: string
  images: string[]
  house_size: string
  stories: number
  property_type: string
  bid_count: number
  distance_km?: number // Added nullability for distance_km
  hiring_likelihood?: string
  viewed_by_contractor?: boolean
  homeowner_first_name?: string
  homeowner_phone?: string
  homeowner_email?: string
  // </CHANGE>
  homeowner_postal_code?: string
  homeowner_profile_image?: string
  homeowner_phone_verified?: boolean
  // </CHANGE>
  details_requested_by_contractor?: boolean
  has_bid?: boolean
  my_bid_status?: "pending" | "considering" | "accepted" | "rejected"
  my_bid_amount?: number
  considering_bid_amount?: number // Amount of bid being considered (if not mine)
}

export default function ContractorDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentBids, setRecentBids] = useState<RecentBid[]>([])
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [error, setError] = useState("")
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false) // Renamed from isMissionModalOpen
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  const [notifications, setNotifications] = useState<any[]>([])
  const [showNotifications, setShowNotifications] = useState(false)

  const [showWinRateInfo, setShowWinRateInfo] = useState(false)
  const [showLossRateInfo, setShowLossRateInfo] = useState(false)

  const [bidForm, setBidForm] = useState({
    quote: "",
    message: "",
  })
  const [submittingBid, setSubmittingBid] = useState(false)
  const [bidError, setBidError] = useState("")
  const [bidSuccess, setBidSuccess] = useState(false)

  const [filters, setFilters] = useState({
    service: "",
    startDate: "",
    endDate: "",
    bidCount: "",
  })
  const [dateRange, setDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({
    from: undefined,
    to: undefined,
  })
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false)
  // </CHANGE>
  const [limit, setLimit] = useState(10)
  const [page] = useState(1) // page is unused here

  const [requestingMoreDetails, setRequestingMoreDetails] = useState(false)
  const [detailsRequestSent, setDetailsRequestSent] = useState(false)

  const [initialDataFetched, setInitialDataFetched] = useState(false)
  const fetchInProgress = useRef(false)
  // </CHANGE>

  useEffect(() => {
    if (!initialDataFetched) {
      fetchUserAndMissions()
      setInitialDataFetched(true)
    }
  }, [initialDataFetched])

  useEffect(() => {
    if (initialDataFetched) {
      fetchUserAndMissions()
    }
  }, [filters, limit, page])
  // </CHANGE>

  useEffect(() => {
    fetchNotifications()
  }, [])

  // Now filters only update when user applies the date range
  // </CHANGE>

  const fetchUserAndMissions = async () => {
    if (fetchInProgress.current) {
      console.log("[v0] Fetch already in progress, skipping")
      return
    }

    fetchInProgress.current = true
    // </CHANGE>

    const timeoutId = setTimeout(() => {
      console.log("[v0] Fetch timeout - forcing loading to false")
      setLoading(false)
      fetchInProgress.current = false
      // </CHANGE>
    }, 10000)

    try {
      setLoading(true)
      console.log("[v0] Starting dashboard data fetch, loading set to true")

      const profile = await apiClient.request<any>("/api/users/profile", { requiresAuth: true })
      setUserProfile(profile)

      if (profile.role !== "contractor") {
        console.log("[v0] User is not a contractor, stopping fetch")
        clearTimeout(timeoutId)
        setLoading(false)
        return
      }

      // Try to fetch stats, use fallback if 404
      try {
        const statsData = await apiClient.request<Stats>("/api/contractor/stats", { requiresAuth: true })
        console.log("[v0] Stats data received:", JSON.stringify(statsData, null, 2))
        console.log("[v0] Stats fields:", {
          total_bids: statsData.total_bids,
          pending_bids: statsData.pending_bids,
          accepted_bids: statsData.accepted_bids,
          considering_bids: statsData.considering_bids,
          bids_remaining: statsData.bids_remaining,
          available_bids: statsData.available_bids,
          // Log new stats fields
          win_rate: statsData.win_rate,
          loss_rate: statsData.loss_rate,
          wins: statsData.wins,
          losses: statsData.losses,
          resolved_bids: statsData.resolved_bids,
          bids_reset_date: statsData.bids_reset_date, // Log new stats field
        })
        setStats(statsData)
      } catch (error: any) {
        console.log("[v0] Stats endpoint not available, using fallback data")
        setStats({
          total_bids: 0,
          pending_bids: 0,
          accepted_bids: 0,
          considering_bids: 0,
        })
      }

      // Try to fetch recent bids, use empty array if 404
      try {
        const bidsData = await apiClient.request<RecentBid[]>("/api/contractor/recent-bids", { requiresAuth: true })
        setRecentBids(bidsData)
      } catch (error: any) {
        console.log("[v0] Recent bids endpoint not available, using empty array")
        setRecentBids([])
      }

      const params = new URLSearchParams()
      params.append("page", page.toString())
      params.append("limit", limit.toString())
      if (filters.service) params.append("service", filters.service)
      if (filters.startDate) params.append("startDate", filters.startDate)
      if (filters.endDate) params.append("endDate", filters.endDate)
      // </CHANGE>
      if (filters.bidCount) params.append("bidCount", filters.bidCount)

      // Try to fetch missions - this is the critical one
      try {
        const missionsData = await apiClient.request<Mission[]>(`/api/leads?${params.toString()}`, {
          requiresAuth: true,
        })
        console.log("[v0] Missions data received:", missionsData)
        const sortedMissions = missionsData.sort((a, b) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })
        setMissions(sortedMissions)
        // </CHANGE>
        setError("")
      } catch (error: any) {
        console.error("[v0] Error fetching missions:", error)
        setError(`Failed to load available jobs: ${error.message}`)
        setMissions([])
      }

      console.log("[v0] Dashboard data fetch completed successfully")
    } catch (error: any) {
      console.error("[v0] Error fetching profile:", error)
      setError(error.message || "Failed to load profile")
    } finally {
      clearTimeout(timeoutId)
      console.log("[v0] Setting loading to false in finally block")
      setLoading(false)
      fetchInProgress.current = false
      // </CHANGE>
    }
  }

  const getMissionLabel = (mission: Mission) => {
    if (mission.priority === "urgent") return { text: "Urgent", color: "bg-red-100 text-red-700" }
    if (!mission.viewed_by_contractor) return { text: "New", color: "bg-red-100 text-red-700" }
    return { text: "Viewed", color: "bg-gray-100 text-gray-700" }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffHours < 1) return "Just now"
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const markMissionAsViewed = async (missionId: number) => {
    try {
      await apiClient.request(`/api/missions/${missionId}/mark-viewed`, {
        method: "POST",
        requiresAuth: true,
      })
      // Update local state to reflect viewed status
      setMissions((prevMissions) =>
        prevMissions.map((m) => (m.id === missionId ? { ...m, viewed_by_contractor: true } : m)),
      )
    } catch (error) {
      console.error("[v0] Error marking mission as viewed:", error)
    }
  }
  // </CHANGE>

  // Mapped openMissionModal function
  const openMissionModal = (mission: any) => {
    console.log("[v0] Opening mission modal with customer data:", {
      homeowner_email: mission.homeowner_email,
      homeowner_profile_image: mission.homeowner_profile_image,
      homeowner_phone_verified: mission.homeowner_phone_verified,
    })
    console.log("[v0] Full mission object:", mission)

    const mappedMission = {
      ...mission,
      homeowner_first_name: mission.first_name,
      homeowner_phone: mission.phone,
      homeowner_postal_code: mission.postal_code,
    }

    setSelectedMission(mappedMission)
    setIsModalOpen(true) // Use setIsModalOpen
    notificationService.emit("mark-mission-viewed", mission.id)
    markMissionAsViewed(mission.id)
    // </CHANGE>
  }

  const closeMissionModal = () => {
    setIsModalOpen(false)
    setBidForm({ quote: "", message: "" })
    setBidError("")
    setBidSuccess(false)
    setDetailsRequestSent(false)
    setPreviewImage(null)
    setTimeout(() => setSelectedMission(null), 300)
  }

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedMission) return

    const bidsRemaining = stats?.available_bids ?? stats?.bids_remaining ?? 0
    if (bidsRemaining <= 0) {
      // Use bids_reset_date to show when bids reset
      const resetDate = stats?.bids_reset_date ? new Date(stats.bids_reset_date) : null
      const formattedResetDate = resetDate
        ? resetDate.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })
        : "the beginning of next month"
      setBidError(`You have no bids remaining. Your bids will reset on ${formattedResetDate}.`)
      // </CHANGE>
      return
    }

    // Validation
    if (!bidForm.quote || Number.parseFloat(bidForm.quote) <= 0) {
      setBidError("Please enter a valid quote amount")
      return
    }

    if (!bidForm.message.trim()) {
      setBidError("Please include a message with your bid")
      return
    }

    const contactCheck = containsContactInfo(bidForm.message)
    if (contactCheck.hasContact) {
      setBidError(
        `Please do not include ${contactCheck.type === "email" ? "email addresses" : "phone numbers"} in your message. Contact information will be shared after your bid is accepted.`,
      )
      return
    }
    // </CHANGE>

    setSubmittingBid(true)
    setBidError("")

    const endpoint = `/api/missions/${selectedMission.id}/bids`
    const payload = {
      quote: Number.parseFloat(bidForm.quote),
      message: bidForm.message,
    }

    console.log("[v0] Submitting bid to endpoint:", endpoint)
    console.log("[v0] Bid payload:", payload)

    try {
      const response = await apiClient.request(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
        requiresAuth: true,
      })

      console.log("[v0] Bid submission successful:", response)

      setBidSuccess(true)

      if (stats) {
        setStats({
          ...stats,
          total_bids: stats.total_bids + 1,
          pending_bids: stats.pending_bids + 1,
          available_bids: (stats.available_bids ?? 5) - 1, // Decrement available bids
          bids_remaining: (stats.bids_remaining ?? 5) - 1, // Decrement bids remaining
        })
      }

      setMissions((prevMissions) =>
        prevMissions.map((m) => (m.id === selectedMission.id ? { ...m, has_bid: true } : m)),
      )

      // Close modal after 2 seconds
      setTimeout(() => {
        closeMissionModal()
        // Refresh missions and stats from backend to confirm
        fetchUserAndMissions()
      }, 2000)
    } catch (error: any) {
      console.error("[v0] Error submitting bid:", error)
      console.error("[v0] Error status:", error.status)
      console.error("[v0] Error message:", error.message)

      if (error.status === 404) {
        setBidError(
          `Backend endpoint not found: ${endpoint}. The backend server may need to be restarted or the endpoint hasn't been deployed yet.`,
        )
      } else if (error.message && error.message.includes("already submitted")) {
        setBidError("You have already submitted a bid for this job.")
        setMissions((prevMissions) =>
          prevMissions.map((m) => (m.id === selectedMission.id ? { ...m, has_bid: true } : m)),
        )
        if (stats) {
          setStats({
            ...stats,
            total_bids: stats.total_bids + 1,
            pending_bids: stats.pending_bids + 1,
            available_bids: (stats.available_bids ?? 5) - 1, // Decrement available bids
            bids_remaining: (stats.bids_remaining ?? 5) - 1, // Decrement bids remaining
          })
        }
      } else if (error.message && error.message.includes("No bids remaining")) {
        const resetDate = stats?.bids_reset_date
          ? new Date(stats.bids_reset_date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })
          : "the beginning of next month"
        setBidError(`You have used all 5 of your monthly bids. Your bids will reset on ${resetDate}.`)
        // </CHANGE>
      } else {
        setBidError(error.message || "Failed to submit bid. Please try again.")
      }
    } finally {
      setSubmittingBid(false)
    }
  }

  const handleRequestMoreDetails = async () => {
    if (!selectedMission) return

    console.log("[v0] Requesting more details for mission:", selectedMission.id)
    setRequestingMoreDetails(true)
    try {
      const response = await apiClient.request(`/api/missions/${selectedMission.id}/request-details`, {
        method: "POST",
        requiresAuth: true,
      })
      console.log("[v0] Request details response:", response)
      setDetailsRequestSent(true)
      setMissions((prevMissions) =>
        prevMissions.map((m) => (m.id === selectedMission.id ? { ...m, details_requested_by_contractor: true } : m)),
      )
    } catch (error: any) {
      console.error("[v0] Error requesting more details:", error)
      console.error("[v0] Error details:", error.message, error.status)

      if (error.message && error.message.includes("already requested")) {
        console.log("[v0] Request already sent previously, updating UI state")
        setDetailsRequestSent(true)
        setMissions((prevMissions) =>
          prevMissions.map((m) => (m.id === selectedMission.id ? { ...m, details_requested_by_contractor: true } : m)),
        )
      } else {
        alert(`Failed to send request: ${error.message || "Please try again."}`)
      }
    } finally {
      setRequestingMoreDetails(false)
    }
  }

  const formatPhoneWithAreaCode = (phone: string) => {
    if (!phone) return { areaCode: "", remaining: "" }

    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, "")

    // USA/Canada format: (XXX) XXX-XXXX or +1 XXX XXX XXXX
    if (digits.length === 10) {
      const areaCode = `(${digits.slice(0, 3)})`
      const remaining = ` ${digits.slice(3, 6)}-${digits.slice(6)}`
      return { areaCode, remaining }
    }
    if (digits.length === 11 && digits[0] === "1") {
      const areaCode = `+1 (${digits.slice(1, 4)})`
      const remaining = ` ${digits.slice(4, 7)}-${digits.slice(7)}`
      return { areaCode, remaining }
    }

    // UK format: +44 XX XXXX XXXX
    if (digits.startsWith("44") && digits.length >= 11) {
      const areaCode = `+44 ${digits.slice(2, 4)}`
      const remaining = ` ${digits.slice(4, 8)} ${digits.slice(8)}`
      return { areaCode, remaining }
    }

    // Australia format: +61 X XXXX XXXX
    if (digits.startsWith("61") && digits.length >= 10) {
      const areaCode = `+61 ${digits.slice(2, 3)}`
      const remaining = ` ${digits.slice(3, 7)} ${digits.slice(7)}`
      return { areaCode, remaining }
    }

    // New Zealand format: +64 X XXX XXXX
    if (digits.startsWith("64") && digits.length >= 9) {
      const areaCode = `+64 ${digits.slice(2, 3)}`
      const remaining = ` ${digits.slice(3, 6)} ${digits.slice(6)}`
      return { areaCode, remaining }
    }

    // Default: show first 3 digits as area code
    if (digits.length >= 6) {
      const areaCode = digits.slice(0, 3)
      const remaining = ` ${digits.slice(3)}`
      return { areaCode, remaining }
    }

    return { areaCode: phone, remaining: "" }
  }

  const fetchNotifications = async () => {
    try {
      const data = await apiClient.request<any[]>("/api/notifications", { requiresAuth: true })
      console.log("[v0] Contractor notifications fetched:", data)
      setNotifications(data.filter((n) => !n.is_read))
    } catch (error: any) {
      console.error("[v0] Error fetching notifications (non-critical):", error)
      setNotifications([])
    }
  }

  const markNotificationAsRead = async (notificationId: number) => {
    try {
      await apiClient.request(`/api/notifications/${notificationId}/mark-read`, {
        method: "POST",
        requiresAuth: true,
      })
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
    } catch (error) {
      console.error("[v0] Error marking notification as read:", error)
    }
  }

  const markAllNotificationsAsRead = async () => {
    try {
      await Promise.all(
        notifications.map((notification) =>
          apiClient.request(`/api/notifications/${notification.id}/mark-read`, {
            method: "POST",
            requiresAuth: true,
          }),
        ),
      )

      // Clear all notifications from state
      setNotifications([])
      console.log("[v0] All contractor notifications marked as read")
      // </CHANGE>

      // Dispatch event to update badge counts in dashboard layout
      window.dispatchEvent(new CustomEvent("notificationUpdated"))
    } catch (error) {
      console.error("[v0] Error marking all notifications as read:", error)
    }
  }

  if (!loading && userProfile && userProfile.role !== "contractor") {
    return (
      <DashboardLayout userRole="contractor">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="bg-white rounded-lg p-8 text-center shadow-sm border border-gray-200">
            <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4 text-gray-900">Contractor Access Required</h2>
            <p className="text-gray-600 mb-6">
              You're currently logged in as a homeowner. Please log out and log in with your contractor account to
              access this dashboard.
            </p>
            <button
              onClick={() => {
                localStorage.removeItem("token")
                localStorage.removeItem("userId")
                localStorage.removeItem("userRole")
                // </CHANGE>
                window.location.href = "/login"
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (loading) {
    return (
      <DashboardLayout userRole="contractor">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your dashboard...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="contractor">
      {/* CHANGE START */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Welcome back!</h1>
            <p className="text-sm md:text-base text-gray-600">Let's get to work</p>
          </div>
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Bell className="h-6 w-6 text-gray-600" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 w-[85vw] md:right-1.5 md:w-80 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900">Notifications</h3>
                  {notifications.length > 0 && (
                    <button
                      onClick={markAllNotificationsAsRead}
                      className="text-xs text-[#328d87] hover:text-[#2a7570] font-medium transition-colors"
                    >
                      Clear All
                    </button>
                  )}
                </div>
                {notifications.length === 0 ? (
                  <div className="p-4 text-center text-gray-500 text-sm">No new notifications</div>
                ) : (
                  <div className="divide-y divide-gray-200">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className="p-4 hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          // new_review notifications should only be marked as read when visiting the Reviews page
                          if (notification.type !== "new_review") {
                            markNotificationAsRead(notification.id)
                          }

                          // new_message notifications should be marked as read and trigger badge update
                          if (notification.type === "new_message") {
                            markNotificationAsRead(notification.id)
                            window.dispatchEvent(new CustomEvent("notificationUpdated"))
                          }
                          // </CHANGE>

                          if (
                            notification.type === "bid_status_update" ||
                            notification.type === "bid_rejected" ||
                            notification.type === "bid_accepted"
                          ) {
                            fetchUserAndMissions()
                          }
                          setShowNotifications(false)
                        }}
                      >
                        <p className="font-medium text-gray-900 text-sm">{notification.title}</p>
                        {notification.message && <p className="text-gray-600 text-xs mt-1">{notification.message}</p>}
                        <p className="text-gray-400 text-xs mt-1">
                          {new Date(notification.created_at).toLocaleString("en-US", {
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* CHANGE END */}

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="text-sm font-medium text-gray-600">Bids Remaining</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {stats
              ? `${stats.available_bids ?? stats.bids_remaining ?? Math.max(0, 5 - (stats.total_bids || 0))}/5`
              : "5/5"}
          </p>
          {/* Added text to show when bids reset */}
          {stats?.bids_reset_date && (
            <p className="text-xs text-gray-500 mt-1">
              Resets on{" "}
              {new Date(stats.bids_reset_date).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            </p>
          )}
          {/* </CHANGE> */}
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-green-800" />
            </div>
            {/* </CHANGE> */}
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-gray-600">Win Rate</h3>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowWinRateInfo(!showWinRateInfo)
                  setShowLossRateInfo(false)
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Win rate information"
              >
                <Info className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats ? `${Math.round(stats.win_rate ?? 0)}%` : "0%"}</p>
          {showWinRateInfo && (
            <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-lg z-10 text-sm text-gray-700">
              <p>
                A high win rate shows your pitch and pricing (combined with your reviews) are what customers want. Keep
                it up!
              </p>
              <button
                onClick={() => setShowWinRateInfo(false)}
                className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Got it
              </button>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-lg bg-red-100 flex items-center justify-center">
              <TrendingDown className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-medium text-gray-600">Loss Rate</h3>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowLossRateInfo(!showLossRateInfo)
                  setShowWinRateInfo(false)
                }}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Loss rate information"
              >
                <Info className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats ? `${Math.round(stats.loss_rate ?? 0)}%` : "0%"}</p>
          {showLossRateInfo && (
            <div className="absolute top-full left-0 right-0 mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-lg z-10 text-sm text-gray-700">
              <p>
                A high loss rate may indicate your pricing is too high compared to your reviews. Try competitive pricing
                and personalized pitches to win more jobs and improve your reviews.
              </p>
              <button
                onClick={() => setShowLossRateInfo(false)}
                className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                Got it
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Available Jobs</h2>

        <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Filter className="h-4 w-4 text-gray-600" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-600">Service:</label>
              <select
                value={filters.service}
                onChange={(e) => setFilters({ ...filters, service: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Services</option>
                {userProfile?.services?.map((service: string) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-600">Date Range:</label>
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                  <button className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center gap-2 hover:bg-gray-50 transition-colors justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="h-4 w-4 text-gray-600" />
                      {dateRange.from ? (
                        dateRange.to ? (
                          <>
                            {format(dateRange.from, "MMM d")} - {format(dateRange.to, "MMM d, yyyy")}
                          </>
                        ) : (
                          format(dateRange.from, "MMM d, yyyy")
                        )
                      ) : (
                        <span>All dates</span>
                      )}
                    </div>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={(range) => {
                      setDateRange(range || { from: undefined, to: undefined })
                    }}
                    numberOfMonths={2}
                    defaultMonth={dateRange.from}
                  />
                  <div className="p-3 border-t border-gray-200 flex justify-between gap-2">
                    <button
                      onClick={() => {
                        setDateRange({ from: undefined, to: undefined })
                        setFilters((prev) => ({
                          ...prev,
                          startDate: "",
                          endDate: "",
                        }))
                        setIsDatePickerOpen(false)
                      }}
                      className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                    >
                      All dates
                    </button>
                    <button
                      onClick={() => {
                        if (dateRange.from) {
                          setFilters((prev) => ({
                            ...prev,
                            startDate: format(dateRange.from!, "yyyy-MM-dd"),
                            endDate: dateRange.to
                              ? format(dateRange.to, "yyyy-MM-dd")
                              : format(dateRange.from!, "yyyy-MM-dd"),
                          }))
                        }
                        setIsDatePickerOpen(false)
                      }}
                      disabled={!dateRange.from}
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Apply
                    </button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm text-gray-600">Bids:</label>
              <select
                value={filters.bidCount}
                onChange={(e) => setFilters({ ...filters, bidCount: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Any Bids</option>
                <option value="0">No Bids</option>
                <option value="1-3">1-3 Bids</option>
                <option value="4+">4+ Bids</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-600">Show:</label>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
        </div>
        {/* </CHANGE> */}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Error Loading Dashboard</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {missions.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center shadow-sm border border-gray-200">
          <p className="text-gray-600 mb-2">No available jobs at the moment</p>
          <p className="text-gray-500 text-sm">Check back soon for new opportunities!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {missions.map((mission) => {
            const label = getMissionLabel(mission)
            const getBorderColor = () => {
              // Show yellow border if ANY bid is being considered (yours or another contractor's)
              if (mission.my_bid_status === "considering" || mission.considering_bid_amount)
                return "border-yellow-400 border-2"
              if (mission.my_bid_status === "accepted") return "border-green-400 border-2"
              if (mission.my_bid_status === "rejected") return "border-red-400 border-2"
              // Blue border when you have a pending bid
              if (mission.my_bid_status === "pending") return "border-blue-700 border-2"
              return "border-gray-200"
            }

            return (
              <button
                key={mission.id}
                onClick={() => openMissionModal(mission)}
                className={`w-full text-left bg-white rounded-lg p-6 shadow-sm border hover:shadow-md transition-shadow ${getBorderColor()}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{mission.title}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${label.color}`}>{label.text}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{mission.service}</p>
                  </div>
                </div>

                <p className="text-gray-700 mb-4 line-clamp-2">{mission.job_details}</p>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    <span>{(mission.distance_km ?? 0).toFixed(1)} km away</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatDate(mission.created_at)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{mission.bid_count} bids</span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between text-sm">
                  <span className="text-gray-600">
                    {mission.property_type} • {mission.house_size} • {mission.stories} stories
                  </span>

                  {(mission.my_bid_status || mission.considering_bid_amount) && (
                    <div className="flex items-center gap-2">
                      {mission.my_bid_status === "considering" && (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium">
                          Your bid is being considered: ${mission.my_bid_amount?.toLocaleString()}
                        </span>
                      )}
                      {mission.my_bid_status === "accepted" && (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                          Your bid was Accepted! (Open for contact info)
                        </span>
                      )}
                      {mission.my_bid_status === "rejected" && (
                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">
                          Your bid was rejected
                        </span>
                      )}
                      {!mission.my_bid_status && mission.considering_bid_amount && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                          A bid is being considered: ${mission.considering_bid_amount.toLocaleString()}
                        </span>
                      )}
                      {mission.my_bid_status &&
                        mission.my_bid_status !== "considering" &&
                        mission.considering_bid_amount && (
                          <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                            A bid is being considered: ${mission.considering_bid_amount.toLocaleString()}
                          </span>
                        )}
                    </div>
                  )}
                </div>
              </button>
            )
          })}
        </div>
      )}

      {isModalOpen && selectedMission && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={closeMissionModal}
        >
          <div
            className={`bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto ${
              selectedMission.my_bid_status === "considering" || selectedMission.considering_bid_amount
                ? "ring-4 ring-yellow-400"
                : selectedMission.my_bid_status === "accepted"
                  ? "ring-4 ring-green-400"
                  : selectedMission.my_bid_status === "rejected"
                    ? "ring-4 ring-red-400"
                    : ""
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">{selectedMission.title}</h2>
              <button
                onClick={closeMissionModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getMissionLabel(selectedMission).color}`}
                >
                  {getMissionLabel(selectedMission).text}
                </span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {selectedMission.service}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium capitalize">
                  {selectedMission.priority} Priority
                </span>
              </div>
              {/* </CHANGE> */}

              {(selectedMission.homeowner_first_name ||
                selectedMission.homeowner_email ||
                selectedMission.homeowner_postal_code) && (
                <div className="relative bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Posted By</h3>
                  <div className="flex flex-col items-start gap-2">
                    <Avatar className="h-12 w-12">
                      <AvatarImage
                        src={selectedMission.homeowner_profile_image || "/placeholder.svg"}
                        alt={selectedMission.homeowner_first_name || "Customer"}
                      />
                      <AvatarFallback className="bg-blue-100 text-blue-700 font-semibold text-base">
                        {selectedMission.homeowner_first_name?.charAt(0).toUpperCase() || "?"}
                      </AvatarFallback>
                    </Avatar>

                    {selectedMission.homeowner_first_name && (
                      <div className="flex items-center gap-2">
                        <p className="text-gray-900 font-medium">{selectedMission.homeowner_first_name}</p>
                        {selectedMission.homeowner_phone_verified && (
                          <div className="flex items-center gap-1.5 px-2 py-1 bg-white rounded-full border border-blue-200">
                            <VerifiedBadge type="phone" size="sm" showTooltip={false} />
                            <span className="text-xs font-medium text-blue-600">Phone verified</span>
                          </div>
                        )}
                        {/* </CHANGE> */}
                      </div>
                    )}

                    {selectedMission.homeowner_postal_code && (
                      <p className="text-gray-700 text-sm">
                        <span className="font-medium">Location:</span> {selectedMission.homeowner_postal_code}
                      </p>
                    )}

                    {selectedMission.homeowner_phone && (
                      <div className="text-gray-700 text-sm">
                        <div>
                          <span className="font-medium">Phone:</span>{" "}
                          <span className="font-mono">
                            {formatPhoneWithAreaCode(selectedMission.homeowner_phone).areaCode}
                            <span className="blur-sm select-none pointer-events-none">
                              {formatPhoneWithAreaCode(selectedMission.homeowner_phone).remaining}
                            </span>
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">(visible after bid acceptance)</div>
                      </div>
                    )}

                    {selectedMission.homeowner_email && (
                      <div className="text-gray-700 text-sm">
                        <div>
                          <span className="font-medium">Email:</span>{" "}
                          <span className="font-mono">
                            {selectedMission.homeowner_email.split("@")[0].slice(0, 2)}
                            <span className="blur-sm select-none pointer-events-none">
                              {selectedMission.homeowner_email.slice(2)}
                            </span>
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5">(visible after bid acceptance)</div>
                      </div>
                    )}
                  </div>
                  {/* </CHANGE> */}
                </div>
              )}
              {/* </CHANGE> */}
              {/* </CHANGE> */}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Property Details</h3>
                  <div className="space-y-1 text-sm text-gray-700">
                    <p>
                      <span className="font-medium">Type:</span> {selectedMission.property_type || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Size:</span> {selectedMission.house_size || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Stories:</span> {selectedMission.stories || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Job Info</h3>
                  <div className="space-y-1 text-sm text-gray-700">
                    <p className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{(selectedMission.distance_km ?? 0).toFixed(1)} km away</span>
                    </p>
                    <p className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>Posted {formatDate(selectedMission.created_at)}</span>
                    </p>
                    <p className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{selectedMission.bid_count} bids received</span>
                    </p>
                  </div>
                </div>
              </div>
              {/* </CHANGE> */}

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Job Description</h3>
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">Service Category:</span> {selectedMission.service}
                </p>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">
                  <span className="font-medium">Additional Details:</span> {selectedMission.job_details}
                </p>
              </div>

              {selectedMission.images && selectedMission.images.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Photos</h3>
                  <div className="relative grid grid-cols-2 md:grid-cols-3 gap-4">
                    {selectedMission.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setPreviewImage(image)}
                        className="relative group cursor-pointer aspect-square"
                      >
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`Job photo ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg border border-gray-200 transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-colors flex items-center justify-center">
                          <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium">
                            Click to enlarge
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {selectedMission.my_bid_status === "accepted" && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-green-600 text-lg font-bold">✓</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-900 mb-1">Your Bid Was Accepted!</h3>
                      <p className="text-green-700 text-sm">
                        Congratulations! The homeowner has accepted your bid of $
                        {selectedMission.my_bid_amount?.toLocaleString()}. Contact information is now available above.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedMission.my_bid_status === "rejected" && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-red-900 mb-1">Your Bid Was Rejected</h3>
                      <p className="text-red-700 text-sm">
                        Unfortunately, the homeowner has chosen a different contractor for this job. Keep improving your
                        profile and bidding on new opportunities!
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedMission.my_bid_status === "considering" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-yellow-900 mb-1">Your Bid Is Being Considered</h3>
                      <p className="text-yellow-700 text-sm">
                        Great news! The customer is considering your bid of $
                        {selectedMission.my_bid_amount?.toLocaleString()}. You'll be notified when they make a final
                        decision.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedMission.my_bid_status === "pending" && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-1">You Have Already Bid on This Job</h3>
                      <p className="text-blue-700 text-sm">
                        Your bid of ${selectedMission.my_bid_amount?.toLocaleString()} is pending review by the
                        homeowner. You'll be notified when they respond.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedMission.has_bid && !selectedMission.my_bid_status && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-blue-900 mb-1">You Have Already Bid on This Job</h3>
                      <p className="text-blue-700 text-sm">
                        You have already submitted a bid for this job. The homeowner will review it and get back to you.
                      </p>
                    </div>
                  </div>
                </div>
              )}
              {/* </CHANGE> */}

              {!bidSuccess && !selectedMission.has_bid && !selectedMission.my_bid_status && (
                <div className="border-t border-gray-200 pt-4">
                  <button
                    onClick={handleRequestMoreDetails}
                    disabled={
                      requestingMoreDetails ||
                      detailsRequestSent ||
                      (stats?.available_bids ?? stats?.bids_remaining ?? 0) <= 0
                    }
                    className={`w-full px-4 py-2 border rounded-lg transition-colors font-medium disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                      detailsRequestSent
                        ? "border-green-300 bg-green-50 text-green-700"
                        : (stats?.available_bids ?? stats?.bids_remaining ?? 0) <= 0
                          ? "border-gray-300 bg-gray-100 text-gray-400"
                          : "border-orange-300 bg-orange-50 text-orange-700 hover:bg-orange-100"
                    } ${(requestingMoreDetails || detailsRequestSent || (stats?.available_bids ?? stats?.bids_remaining ?? 0) <= 0) && "opacity-75"}`}
                  >
                    {requestingMoreDetails ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Sending Request...
                      </>
                    ) : detailsRequestSent ? (
                      <>
                        <span className="text-green-600 text-lg">✓</span>
                        Request Sent
                      </>
                    ) : (
                      <>
                        <AlertCircle className="h-4 w-4" />
                        Request More Details from Customer
                      </>
                    )}
                  </button>
                  {/* </CHANGE> */}
                  <p className="text-xs text-gray-500 text-center mt-2">
                    {detailsRequestSent
                      ? "The customer has been notified to add more details."
                      : (stats?.available_bids ?? stats?.bids_remaining ?? 0) <= 0
                        ? "You need available bids to request more details."
                        : "Not enough information? Let the customer know their posting needs more details."}
                  </p>
                </div>
              )}

              {!bidSuccess && !selectedMission.has_bid && !selectedMission.my_bid_status && (
                <form onSubmit={handleSubmitBid} className="border-t border-gray-200 pt-6 space-y-4">
                  {(stats?.available_bids ?? stats?.bids_remaining ?? 0) <= 0 && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="font-semibold text-red-900 mb-1">No Bids Remaining</h3>
                          <p className="text-red-700 text-sm">
                            You have used all 5 of your monthly bids. Your bids will reset on{" "}
                            {stats?.bids_reset_date
                              ? new Date(stats.bids_reset_date).toLocaleDateString("en-US", {
                                  month: "long",
                                  day: "numeric",
                                  year: "numeric",
                                })
                              : "the beginning of next month"}
                            .
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {bidError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-red-700 text-sm">{bidError}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <label htmlFor="quote" className="block text-sm font-medium text-gray-700 mb-2">
                      Your Quote ($) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      id="quote"
                      min="0"
                      step="0.01"
                      value={bidForm.quote}
                      onChange={(e) => setBidForm({ ...bidForm, quote: e.target.value })}
                      placeholder="Enter your quote amount"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#328d87]"
                      disabled={submittingBid || (stats?.available_bids ?? stats?.bids_remaining ?? 0) <= 0}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message to Customer <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      value={bidForm.message}
                      onChange={(e) => setBidForm({ ...bidForm, message: e.target.value })}
                      placeholder="Introduce yourself and explain why you're the best fit for this job..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#328d87] resize-none"
                      disabled={submittingBid || (stats?.available_bids ?? stats?.bids_remaining ?? 0) <= 0}
                      required
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={closeMissionModal}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={submittingBid}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-[#328d87] text-white rounded-lg hover:opacity-90 transition-opacity font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      disabled={submittingBid || (stats?.available_bids ?? stats?.bids_remaining ?? 0) <= 0}
                    >
                      {submittingBid ? (
                        <>
                          <Loader2 className="h-5 w-5 animate-spin" />
                          Submitting...
                        </>
                      ) : (
                        "Submit Bid"
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {previewImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4"
          onClick={() => setPreviewImage(null)}
        >
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-white" />
          </button>
          <img
            src={previewImage || "/placeholder.svg"}
            alt="Preview"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </DashboardLayout>
  )
}
