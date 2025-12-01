"use client"

import type React from "react"
import {
  Loader2,
  AlertCircle,
  MapPin,
  Clock,
  Users,
  Filter,
  CalendarIcon,
  ChevronDown,
  X,
  Coins,
  Info,
} from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { apiClient } from "@/lib/api-client"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { notificationService } from "@/lib/notification-service"
import { VerifiedBadge } from "@/components/verified-badge"
import { initiateStripeCheckout } from "@/lib/checkout"
import { useToast } from "@/hooks/use-toast"

interface Stats {
  total_bids: number
  pending_bids: number
  accepted_bids: number
  bids_remaining?: number
  available_bids?: number
  win_rate?: number
  loss_rate?: number
  wins?: number
  losses?: number
  resolved_bids?: number
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
  distance_km?: number
  hiring_likelihood?: string
  viewed_by_contractor?: boolean
  homeowner_first_name?: string
  homeowner_phone?: string
  homeowner_email?: string
  homeowner_postal_code?: string
  homeowner_profile_image?: string
  homeowner_phone_verified?: boolean
  details_requested_by_contractor?: boolean
  has_bid?: boolean
  my_bid_status?: "pending" | "accepted"
  my_bid_amount?: number
}

export default function ContractorDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentBids, setRecentBids] = useState<RecentBid[]>([])
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)
  const [userProfile, setUserProfile] = useState<any>(null)
  const [error, setError] = useState("")
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)

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
  const [limit, setLimit] = useState(10)
  const [page] = useState(1)

  const [requestingMoreDetails, setRequestingMoreDetails] = useState(false)
  const [detailsRequestSent, setDetailsRequestSent] = useState(false)

  const [initialDataFetched, setInitialDataFetched] = useState(false)
  const fetchInProgress = useRef(false)

  const [filtersOpen, setFiltersOpen] = useState(false)

  const { toast } = useToast()

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

  useEffect(() => {
    const interval = setInterval(() => {
      fetchUserAndMissions()
    }, 60000) // Refresh every 60 seconds

    return () => clearInterval(interval)
  }, [])

  const fetchUserAndMissions = async () => {
    if (fetchInProgress.current) {
      return
    }

    fetchInProgress.current = true

    const timeoutId = setTimeout(() => {
      setLoading(false)
      fetchInProgress.current = false
    }, 10000)

    try {
      setLoading(true)

      const profile = await apiClient.request<any>("/api/users/profile", { requiresAuth: true })
      setUserProfile(profile)

      if (profile.role !== "contractor") {
        clearTimeout(timeoutId)
        setLoading(false)
        return
      }

      try {
        const statsData = await apiClient.request<Stats>("/api/contractor/stats", { requiresAuth: true })
        setStats(statsData)
      } catch (error: any) {
        console.error("Error fetching stats:", error.message)
        setStats({
          total_bids: 0,
          pending_bids: 0,
          accepted_bids: 0,
        })
      }

      try {
        const bidsData = await apiClient.request<RecentBid[]>("/api/contractor/recent-bids", { requiresAuth: true })
        setRecentBids(bidsData)
      } catch (error: any) {
        setRecentBids([])
      }

      const params = new URLSearchParams()
      params.append("page", page.toString())
      params.append("limit", limit.toString())
      if (filters.service) params.append("service", filters.service)
      if (filters.startDate) params.append("startDate", filters.startDate)
      if (filters.endDate) params.append("endDate", filters.endDate)
      if (filters.bidCount) params.append("bidCount", filters.bidCount)

      try {
        const response = await apiClient.request<{ leads: Mission[]; total: number } | Mission[]>(
          `/api/leads?${params.toString()}`,
          {
            requiresAuth: true,
          },
        )
        const missionsData = Array.isArray(response) ? response : response.leads || []
        const sortedMissions = missionsData.sort((a, b) => {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })
        setMissions(sortedMissions)
        setError("")
      } catch (error: any) {
        console.error("Error fetching missions:", error.message)
        setError(`Failed to load available jobs: ${error.message}`)
        setMissions([])
      }
    } catch (error: any) {
      console.error("Error fetching profile:", error.message)
      setError(error.message || "Failed to load profile")
    } finally {
      clearTimeout(timeoutId)
      setLoading(false)
      fetchInProgress.current = false
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
      setMissions((prevMissions) =>
        prevMissions.map((m) => (m.id === missionId ? { ...m, viewed_by_contractor: true } : m)),
      )
    } catch (error) {
      console.error("Error marking mission as viewed:", error)
    }
  }

  const openMissionModal = (mission: any) => {
    const mappedMission = {
      ...mission,
      homeowner_first_name: mission.first_name,
      homeowner_phone: mission.phone,
      homeowner_postal_code: mission.postal_code,
    }

    setSelectedMission(mappedMission)
    setIsModalOpen(true)
    notificationService.emit("mark-mission-viewed", mission.id)
    markMissionAsViewed(mission.id)
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
      setBidError("You have no credits remaining. Purchase more credits to continue bidding.")
      return
    }

    const quoteValue = bidForm.quote.trim()
    if (!quoteValue || Number.isNaN(Number(quoteValue)) || Number(quoteValue) <= 0) {
      setBidError("Please enter a valid quote amount")
      return
    }

    if (!bidForm.message.trim()) {
      setBidError("Please include a message with your bid")
      return
    }

    setSubmittingBid(true)
    setBidError("")

    const endpoint = `/api/missions/${selectedMission.id}/bids`
    const quoteAmount = Math.round(Number(quoteValue) * 100) / 100
    const payload = {
      quote: quoteAmount,
      message: bidForm.message,
    }

    try {
      const response = await apiClient.request(endpoint, {
        method: "POST",
        body: JSON.stringify(payload),
        requiresAuth: true,
      })

      setBidSuccess(true)

      setMissions((prevMissions) =>
        prevMissions.map((m) => (m.id === selectedMission.id ? { ...m, has_bid: true } : m)),
      )

      setTimeout(() => {
        closeMissionModal()
        fetchUserAndMissions()
      }, 2000)
    } catch (error: any) {
      console.error("=== BID SUBMISSION ERROR ===")
      console.error("Error details:", {
        message: error.message,
        status: error.status,
        endpoint: endpoint,
        missionId: selectedMission.id,
      })

      if (error.status === 404) {
        setBidError(
          `Backend endpoint not found: ${endpoint}. The backend server may need to be restarted or the endpoint hasn't been deployed yet.`,
        )
      } else if (error.message && error.message.includes("already submitted")) {
        setBidError("You have already submitted a bid for this job.")
        setMissions((prevMissions) =>
          prevMissions.map((m) => (m.id === selectedMission.id ? { ...m, has_bid: true } : m)),
        )
        fetchUserAndMissions()
      } else if (error.message && error.message.includes("No bids remaining")) {
        setBidError("You have used all of your credits. Purchase more credits to continue bidding.")
      } else {
        setBidError(error.message || "Failed to submit bid. Please try again.")
      }
    } finally {
      setSubmittingBid(false)
    }
  }

  const handleRequestMoreDetails = async () => {
    if (!selectedMission) return

    setRequestingMoreDetails(true)
    try {
      const response = await apiClient.request(`/api/missions/${selectedMission.id}/request-details`, {
        method: "POST",
        requiresAuth: true,
      })
      setDetailsRequestSent(true)
      setMissions((prevMissions) =>
        prevMissions.map((m) => (m.id === selectedMission.id ? { ...m, details_requested_by_contractor: true } : m)),
      )
    } catch (error: any) {
      console.error("Error requesting more details:", error)

      if (error.message && error.message.includes("already requested")) {
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

  if (loading) {
    return (
      <DashboardLayout userRole="contractor">
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#0F766E]" />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout userRole="contractor">
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <p className="mt-4 text-lg text-gray-600">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const bidsRemaining = stats?.available_bids ?? stats?.bids_remaining ?? 0

  return (
    <DashboardLayout userRole="contractor">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
            <p className="text-gray-600">{"Let's get to work"}</p>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white px-4 py-3">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="rounded-lg bg-blue-50 p-2">
                <Coins className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-xl font-bold text-gray-900 sm:hidden">{bidsRemaining}</p>
              <div className="hidden sm:block">
                <p className="text-xs text-gray-600">Credits Available</p>
                <p className="text-xl font-bold text-gray-900">{bidsRemaining}</p>
              </div>
            </div>
            <p className="text-xs text-gray-600 text-center mt-1 sm:hidden">Credits Available</p>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Available Jobs</h2>

          <div className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
            <button
              type="button"
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="mb-3 flex w-full items-center justify-between md:hidden"
            >
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-gray-700">Filters</span>
              </div>
              <ChevronDown
                className={`h-5 w-5 text-gray-600 transition-transform ${filtersOpen ? "rotate-180" : ""}`}
              />
            </button>

            <div className="mb-3 hidden items-center gap-2 md:flex">
              <Filter className="h-5 w-5 text-gray-600" />
              <span className="font-medium text-gray-700">Filters:</span>
            </div>

            <div className={`grid gap-4 md:grid-cols-4 ${filtersOpen ? "block" : "hidden md:grid"}`}>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Service:</label>
                <select
                  value={filters.service}
                  onChange={(e) => setFilters({ ...filters, service: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">All Services</option>
                  <option value="painting">Painting</option>
                  <option value="plumbing">Plumbing</option>
                  <option value="electrical">Electrical</option>
                  <option value="landscaping">Landscaping</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Date Range:</label>
                <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="flex w-full items-center justify-between rounded-md border border-gray-300 px-3 py-2 text-sm"
                    >
                      <span>{dateRange.from ? format(dateRange.from, "MMM d") : "All dates"}</span>
                      <CalendarIcon className="h-4 w-4 text-gray-500" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="range"
                      selected={dateRange}
                      onSelect={(range) => {
                        setDateRange(range || { from: undefined, to: undefined })
                        if (range?.from) {
                          setFilters({
                            ...filters,
                            startDate: format(range.from, "yyyy-MM-dd"),
                            endDate: range.to ? format(range.to, "yyyy-MM-dd") : "",
                          })
                        }
                      }}
                      numberOfMonths={2}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Bids:</label>
                <select
                  value={filters.bidCount}
                  onChange={(e) => setFilters({ ...filters, bidCount: e.target.value })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="">Any Bids</option>
                  <option value="0">No bids yet</option>
                  <option value="1-3">1-3 bids</option>
                  <option value="4+">4+ bids</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Show:</label>
                <select
                  value={limit}
                  onChange={(e) => setLimit(Number(e.target.value))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </select>
              </div>
            </div>
          </div>

          {missions.length === 0 ? (
            <div className="py-12 text-center">
              <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
              <p className="mt-4 text-lg text-gray-600">Populating Jobs...</p>
              <p className="mt-2 text-sm text-gray-500">You will be notified when new jobs appear in your Dashboard!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {missions.map((mission) => {
                const label = getMissionLabel(mission)
                return (
                  <div
                    key={mission.id}
                    className={`cursor-pointer rounded-lg border border-gray-200 border-l-4 ${
                      mission.has_bid ? "border-l-[#e2bb12]" : "border-l-gray-300"
                    } p-4 transition-all hover:shadow-md`}
                    onClick={() => openMissionModal(mission)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-semibold text-gray-900">{mission.title}</h3>
                          <span className={`rounded-full px-2 py-1 text-xs font-medium ${label.color}`}>
                            {label.text}
                          </span>
                          {mission.priority && (mission.priority === "urgent" || mission.priority === "high") && (
                            <span className="rounded-full px-2 py-1 text-[9px] font-medium bg-red-100 text-red-700">
                              {mission.priority.charAt(0).toUpperCase() + mission.priority.slice(1)} Priority
                            </span>
                          )}
                          {mission.priority && (mission.priority === "soon" || mission.priority === "medium") && (
                            <span className="rounded-full px-2 py-1 text-[9px] font-medium bg-orange-100 text-orange-800">
                              {mission.priority.charAt(0).toUpperCase() + mission.priority.slice(1)} Priority
                            </span>
                          )}
                          {mission.priority && mission.priority === "low" && (
                            <span className="rounded-full px-2 py-1 text-[9px] font-medium bg-blue-100 text-blue-800">
                              Low Priority
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{mission.service}</p>

                        <div className="mt-2 flex flex-col gap-2 text-sm text-gray-500 sm:flex-row sm:items-center sm:gap-4">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {mission.distance_km ? `${mission.distance_km} km away` : "Distance unknown"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatDate(mission.created_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {mission.bid_count} {mission.bid_count === 1 ? "bid" : "bids"}
                          </span>
                        </div>
                        {mission.has_bid && mission.my_bid_status && (
                          <div className="mt-2 flex items-center gap-1">
                            {mission.my_bid_amount && (
                              <span className="inline-flex items-center px-2 py-1 rounded-lg bg-[#0F766E]/10 border border-[#0F766E]/20 text-[#0F766E] font-semibold text-xs">
                                Your bid: ${mission.my_bid_amount}
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-2">{/* Additional actions */}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {isModalOpen && selectedMission && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          style={{ zIndex: 10000 }}
          onClick={closeMissionModal}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 md:p-6 flex justify-between items-start z-10">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 pr-8">{selectedMission.title}</h2>
              <button
                onClick={closeMissionModal}
                className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            <div className="p-4 md:p-6 space-y-6">
              {(selectedMission.homeowner_first_name || selectedMission.homeowner_profile_image) && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  {selectedMission.homeowner_profile_image ? (
                    <img
                      src={selectedMission.homeowner_profile_image || "/placeholder.svg"}
                      alt={selectedMission.homeowner_first_name || "Customer"}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold text-xl border-2 border-gray-200">
                      {selectedMission.homeowner_first_name?.charAt(0).toUpperCase() || "?"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 break-words">
                      {selectedMission.homeowner_first_name || "Customer"}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {selectedMission.homeowner_phone_verified && (
                        <>
                          <VerifiedBadge type="phone" size="sm" showLabel={false} />
                          <span className="text-sm text-gray-600">Phone verified</span>
                        </>
                      )}
                    </div>
                    {selectedMission.homeowner_postal_code && (
                      <p className="text-sm text-gray-500 mt-1">{selectedMission.homeowner_postal_code}</p>
                    )}
                  </div>
                </div>
              )}

              {!selectedMission.has_bid && (selectedMission.homeowner_phone || selectedMission.homeowner_email) && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="text-sm font-semibold text-blue-900 uppercase mb-3">Contact Information</h3>
                  <div className="space-y-3">
                    {selectedMission.homeowner_phone && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-blue-800 font-medium">Phone:</span>
                        <span className="text-sm text-blue-900 blur-sm select-none">
                          {selectedMission.homeowner_phone}
                        </span>
                      </div>
                    )}
                    {selectedMission.homeowner_email && (
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-blue-800 font-medium">Email:</span>
                          <span className="text-sm text-blue-900 blur-sm select-none">
                            {selectedMission.homeowner_email}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-blue-700">Revealing contact info costs 1 Bidrr Credit</span>
                          <div className="relative group">
                            <button
                              type="button"
                              className="p-0.5 rounded-full hover:bg-blue-100 transition-colors"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Info className="h-3.5 w-3.5 text-blue-600" />
                            </button>
                            <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-white border border-gray-200 rounded-lg shadow-lg text-xs text-gray-700 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all z-50">
                              Contact information will be available in the My Bids page after you send your quote amount
                              and message.
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Service Type</h3>
                  <p className="text-base md:text-lg text-gray-900 break-words">{selectedMission.service}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Priority</h3>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      selectedMission.priority === "urgent" || selectedMission.priority === "high"
                        ? "bg-red-100 text-red-800"
                        : selectedMission.priority === "soon" || selectedMission.priority === "medium"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {selectedMission.priority?.charAt(0).toUpperCase() + selectedMission.priority?.slice(1) || "Normal"}
                  </span>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Job Details</h3>
                <p className="text-sm md:text-base text-gray-900 whitespace-pre-wrap break-words">
                  {selectedMission.job_details}
                </p>
              </div>

              {selectedMission.images && selectedMission.images.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Photos</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {selectedMission.images.map((image, index) => (
                      <div
                        key={index}
                        className="aspect-square rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setPreviewImage(image)}
                      >
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`Job photo ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(selectedMission.property_type || selectedMission.house_size || selectedMission.stories) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  {selectedMission.property_type && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Property Type</h3>
                      <p className="text-sm md:text-base text-gray-900 capitalize break-words">
                        {selectedMission.property_type}
                      </p>
                    </div>
                  )}
                  {selectedMission.house_size && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">House Size</h3>
                      <p className="text-sm md:text-base text-gray-900 break-words">{selectedMission.house_size}</p>
                    </div>
                  )}
                  {selectedMission.stories && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Stories</h3>
                      <p className="text-sm md:text-base text-gray-900">{selectedMission.stories}</p>
                    </div>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Total Bids</h3>
                  <p className="text-xl md:text-2xl font-bold text-gray-900">{selectedMission.bid_count || 0}</p>
                </div>
                {selectedMission.distance_km && (
                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Distance</h3>
                    <p className="text-xl md:text-2xl font-bold text-gray-900">
                      {selectedMission.distance_km.toFixed(1)} km
                    </p>
                  </div>
                )}
              </div>

              {selectedMission.hiring_likelihood && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Hiring Likelihood</h3>
                  <p className="text-sm md:text-base text-gray-900 capitalize">{selectedMission.hiring_likelihood}</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Posted</h3>
                <p className="text-sm md:text-base text-gray-900 break-words">
                  {new Date(selectedMission.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              {selectedMission.homeowner_postal_code && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Location</h3>
                  <p className="text-gray-900">{selectedMission.homeowner_postal_code}</p>
                </div>
              )}

              {selectedMission.has_bid ? (
                <div className="rounded-lg border border-[#0F766E]/30 bg-[#0F766E]/5 p-4">
                  <p className="text-sm md:text-base text-[#0F766E] font-medium break-words">
                    You have already submitted a bid for this job
                  </p>
                  {selectedMission.my_bid_amount && (
                    <div className="mt-2">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[#0F766E]/10 border border-[#0F766E]/20 text-[#0F766E] font-semibold text-base">
                        Your bid: ${selectedMission.my_bid_amount}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {selectedMission.details_requested_by_contractor || detailsRequestSent ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <p className="text-sm text-green-900 font-medium">✓ Details request sent</p>
                    </div>
                  ) : (
                    <div>
                      <button
                        onClick={handleRequestMoreDetails}
                        disabled={requestingMoreDetails}
                        className="w-full py-2.5 md:py-3 border-2 border-red-200 bg-red-50 rounded-lg text-sm font-medium text-gray-700 hover:bg-red-100 hover:border-red-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {requestingMoreDetails ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Sending Request...
                          </span>
                        ) : (
                          "Request More Details"
                        )}
                      </button>
                      <p className="text-xs text-gray-500 mt-2 text-center px-2">
                        This notifies the customer that more details are needed for contractors to provide bids. This
                        does not use up your bid.
                      </p>
                    </div>
                  )}

                  {bidSuccess ? (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                      <p className="text-sm md:text-base text-green-900 font-semibold">Bid submitted successfully!</p>
                      <p className="text-sm text-green-700 mt-1">The customer will review your bid soon.</p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmitBid} className="space-y-4 border-t pt-4">
                      <h3 className="font-semibold text-base md:text-lg">Submit Your Bid</h3>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quote Amount ($) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={bidForm.quote}
                          onChange={(e) => {
                            setBidForm({ ...bidForm, quote: e.target.value })
                          }}
                          className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F766E] focus:border-transparent"
                          placeholder="Enter your quote"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Message to Customer <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={bidForm.message}
                          onChange={(e) => setBidForm({ ...bidForm, message: e.target.value })}
                          className="w-full px-3 py-2 text-sm md:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F766E] focus:border-transparent"
                          rows={4}
                          placeholder="Explain why you're the best choice for this job..."
                          required
                        />
                      </div>

                      {bidError && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                          <p className="text-red-800 text-xs md:text-sm break-words">{bidError}</p>
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={submittingBid || !bidForm.quote || !bidForm.message.trim()}
                        className="w-full py-2.5 md:py-3 bg-[#0F766E] text-white rounded-lg text-sm md:text-base font-medium hover:bg-[#0d5f57] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {submittingBid ? (
                          <span className="flex items-center justify-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Submitting Bid...
                          </span>
                        ) : (
                          "Submit Bid"
                        )}
                      </button>
                    </form>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {previewImage && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
          style={{ zIndex: 10001 }}
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-5xl w-full max-h-[90vh]">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 p-2 bg-white rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Close preview"
            >
              <X className="h-6 w-6 text-gray-900" />
            </button>
            <img
              src={previewImage || "/placeholder.svg"}
              alt="Preview"
              className="w-full h-full object-contain rounded-lg"
            />
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
