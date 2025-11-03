"use client"

import type React from "react"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Briefcase, MapPin, Plus, X, Edit, Search, Upload, Eye, Calendar, Star, Info, ChevronDown } from "lucide-react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import { SERVICES } from "@/lib/services"
import {
  getServiceCategory,
  categoryRequiresStructureDetails,
  getCategoryFields,
  SERVICE_CATEGORIES,
} from "@/lib/service-categories"
import { toast } from "@/components/ui/use-toast" // Assuming toast is from shadcn/ui or similar
import { VerifiedBadge } from "@/components/verified-badge"

// Define Mission type for better type safety (assuming this is used internally)
interface Mission {
  id: number
  title: string
  service: string
  job_details: string
  completion_timeline: string
  priority: string
  address: string
  city: string
  region: string
  country: string
  postal_code: string
  house_size: string | null
  stories: string | null
  property_type: string | null
  area_size: string | null
  num_items: string | null
  condition_severity: string | null
  material_type: string | null
  location_in_home: string | null
  materials_provided: boolean | null
  special_description: string | null
  service_frequency: string | null
  special_requirements: string | null
  style_theme: string | null
  energy_usage: string | null
  event_duration_hours: string | null
  bid_count?: number
  unread_bids_count?: number
  considering_count?: number
  has_accepted_bid?: boolean
  details_requested_count?: number
  bids_count?: number // For delete confirmation
  created_at?: string // Added for display in missions list
}

// Define types for bid data to include review information
interface BidWithReviews extends Record<string, any> {
  id: number
  contractor_id: number
  company_name?: string
  contractor_name?: string
  quote: string
  message?: string
  status?: string
  logo_url?: string
  agent_photo_url?: string
  years_in_business?: string
  business_address?: string
  business_city?: string
  business_region?: string
  business_postal_code?: string
  created_at?: string
  average_rating?: number // Total average rating
  total_rating?: number // Total average rating
  homehero_rating?: number // HomeHero specific rating
  homehero_review_count?: number // HomeHero review count
  google_rating?: number // Google specific rating
  google_review_count?: number // Google review count
  google_reviews?: any[] // Array of Google reviews
  estimated_duration?: string
  is_verified?: boolean
  google_places_id?: string
}

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

  const intervals = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
  }

  if (diffInSeconds < 60) return "just now"

  for (const [unit, secondsInUnit] of Object.entries(intervals)) {
    const interval = Math.floor(diffInSeconds / secondsInUnit)
    if (interval >= 1) {
      return interval === 1 ? `a ${unit} ago` : `${interval} ${unit}s ago`
    }
  }

  return "just now"
}

const ReviewsModalContent = ({ contractorId }: { contractorId: number }) => {
  const [reviewsData, setReviewsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showGoogleReviews, setShowGoogleReviews] = useState(false)
  const [showHomeHeroReviews, setShowHomeHeroReviews] = useState(false)

  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true)
      try {
        const data = await apiClient.request<any>(`/api/contractors/${contractorId}/reviews`, {
          requiresAuth: false,
        })

        if (data.google_review_count === 0) {
          try {
            const profileData = await apiClient.request<any>(`/api/contractors/${contractorId}/profile`, {
              requiresAuth: false,
            })

            const googleSite = profileData.review_sites?.find((site: any) => site.site === "google")

            if (googleSite) {
              // Merge Google reviews from profile with database reviews
              const googleReviews = (googleSite.reviews || []).map((review: any) => ({
                id: review.time,
                reviewer_name: review.author,
                rating: review.rating,
                comment: review.text,
                created_at: new Date(review.time * 1000).toISOString(),
                source: "google",
                reviewer_profile_photo_url: review.profile_photo,
                relative_time_description: review.relative_time,
              }))

              // Calculate combined average
              const homeheroRating = data.homehero_rating || 0
              const homeheroCount = data.homehero_review_count || 0
              const googleRating = googleSite.rating || 0
              const googleCount = googleSite.review_count || 0
              const totalCount = homeheroCount + googleCount
              const averageRating =
                totalCount > 0 ? (homeheroRating * homeheroCount + googleRating * googleCount) / totalCount : 0

              setReviewsData({
                ...data,
                reviews: [...(data.reviews || []), ...googleReviews],
                google_rating: googleRating,
                google_review_count: googleCount,
                average_rating: averageRating,
              })
              setLoading(false)
              return
            }
          } catch (profileError) {
            console.error("[v0] Failed to fetch contractor profile for Google reviews:", profileError)
          }
        }

        setReviewsData(data)
      } catch (error) {
        console.error("[v0] Failed to fetch reviews:", error)
        setReviewsData(null)
      } finally {
        setLoading(false)
      }
    }
    if (contractorId) {
      fetchReviews()
    }
  }, [contractorId])

  if (loading) {
    return <div className="text-center py-8 text-gray-500">Loading reviews...</div>
  }

  if (!reviewsData || (reviewsData.homehero_review_count === 0 && reviewsData.google_review_count === 0)) {
    return <div className="text-center py-8 text-gray-500">No reviews available for this contractor.</div>
  }

  const totalAverage = reviewsData.average_rating || 0
  const totalCount = (reviewsData.homehero_review_count || 0) + (reviewsData.google_review_count || 0)
  const homeheroRating = reviewsData.homehero_rating || 0
  const homeheroCount = reviewsData.homehero_review_count || 0
  const googleRating = reviewsData.google_rating || 0
  const googleCount = reviewsData.google_review_count || 0

  const googleReviews = (reviewsData.reviews?.filter((review: any) => review.source === "google") || [])
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3)

  const allGoogleReviews = reviewsData.reviews?.filter((review: any) => review.source === "google") || []
  console.log("[v0] Total Google reviews in database:", allGoogleReviews.length)
  console.log(
    "[v0] All Google reviews with dates:",
    allGoogleReviews.map((r: any) => ({
      reviewer: r.reviewer_name,
      date: r.created_at,
      rating: r.rating,
    })),
  )
  console.log(
    "[v0] 3 most recent Google reviews being displayed:",
    googleReviews.map((r: any) => ({
      reviewer: r.reviewer_name,
      date: r.created_at,
      rating: r.rating,
    })),
  )

  const homeheroReviews = (reviewsData.reviews?.filter((review: any) => review.source === "homehero") || [])
    .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 3)

  return (
    <div className="space-y-6">
      {/* Total Average */}
      <div className="bg-gray-50 rounded-lg p-6 text-center">
        <div className="text-sm text-gray-600 mb-2">Total Average Rating</div>
        <div className="flex items-center justify-center gap-2 mb-2">
          <Star className="h-8 w-8 fill-yellow-400 text-yellow-400" />
          <span className="text-4xl font-bold text-gray-900">{totalAverage.toFixed(1)}</span>
        </div>
        <div className="text-sm text-gray-500">{totalCount} total reviews</div>
      </div>

      {homeheroCount > 0 && (
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="font-semibold text-gray-900">homeHero Reviews</div>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-gray-900">{homeheroRating.toFixed(1)}</span>
              <span className="text-gray-500 text-sm">({homeheroCount})</span>
            </div>
          </div>

          {homeheroReviews.length > 0 && (
            <div>
              <button
                onClick={() => setShowHomeHeroReviews(!showHomeHeroReviews)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
              >
                {showHomeHeroReviews ? "Hide" : "View"} recent homeHero reviews
                <ChevronDown className={`h-4 w-4 transition-transform ${showHomeHeroReviews ? "rotate-180" : ""}`} />
              </button>

              {showHomeHeroReviews && (
                <div className="mt-4 space-y-4">
                  {homeheroReviews.map((review: any, index: number) => (
                    <div key={review.id || index} className="border-t border-gray-200 pt-4">
                      <div className="flex items-start gap-3">
                        {review.reviewer_profile_photo_url ? (
                          <img
                            src={review.reviewer_profile_photo_url || "/placeholder.svg"}
                            alt={review.reviewer_name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-sm">
                            {(review.reviewer_name || "A")
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .toUpperCase()
                              .slice(0, 2)}
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-medium text-gray-900">{review.reviewer_name || "Anonymous"}</div>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium">{review.rating}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">{review.comment}</p>
                          <div className="text-xs text-gray-400 mt-1">
                            {review.relative_time_description || getRelativeTime(review.created_at)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Google Reviews */}
      {googleCount > 0 && (
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="font-semibold text-gray-900">Google Reviews</div>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold text-gray-900">{googleRating.toFixed(1)}</span>
              <span className="text-gray-500 text-sm">({googleCount})</span>
            </div>
          </div>

          {googleReviews.length > 0 && (
            <div>
              <button
                onClick={() => setShowGoogleReviews(!showGoogleReviews)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
              >
                {showGoogleReviews ? "Hide" : "View"} recent Google reviews
                <ChevronDown className={`h-4 w-4 transition-transform ${showGoogleReviews ? "rotate-180" : ""}`} />
              </button>

              {showGoogleReviews && (
                <div className="mt-4 space-y-4">
                  {googleReviews.map((review: any, index: number) => (
                    <div key={review.id || index} className="border-t border-gray-200 pt-4">
                      <div className="flex items-start gap-3">
                        {review.reviewer_profile_photo_url && (
                          <img
                            src={review.reviewer_profile_photo_url || "/placeholder.svg"}
                            alt={review.reviewer_name}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <div className="font-medium text-gray-900">{review.reviewer_name || "Anonymous"}</div>
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm font-medium">{review.rating}</span>
                            </div>
                          </div>
                          <p className="text-sm text-gray-600">{review.comment}</p>
                          {review.relative_time_description && (
                            <div className="text-xs text-gray-400 mt-1">{review.relative_time_description}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {homeheroCount === 0 && googleCount === 0 && (
        <div className="text-center py-8 text-gray-500">No reviews available yet.</div>
      )}
    </div>
  )
}

export default function HomeownerDashboard() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [showPostJobModal, setShowPostJobModal] = useState(false)
  const [showEditJobModal, setShowEditJobModal] = useState(false) // New state for edit modal
  const [selectedBid, setSelectedBid] = useState<any>(null)
  const [selectedJobForEdit, setSelectedJobForEdit] = useState<Mission | null>(null) // Typed as Mission | null
  const [profile, setProfile] = useState<any>(null)
  const [missions, setMissions] = useState<Mission[]>([]) // Typed as Mission[]
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [usePersonalAddress, setUsePersonalAddress] = useState(false)
  const [usePersonalAddressEdit, setUsePersonalAddressEdit] = useState(false)

  const [serviceSearch, setServiceSearch] = useState("")
  const [showServiceDropdown, setShowServiceDropdown] = useState(false)
  const [editServiceSearch, setEditServiceSearch] = useState("")
  const [showEditServiceDropdown, setShowEditServiceDropdown] = useState(false)

  const [selectedMissionForBids, setSelectedMissionForBids] = useState<Mission | null>(null) // Typed as Mission | null
  const [bidsForMission, setBidsForMission] = useState<BidWithReviews[]>([]) // Typed as BidWithReviews[]
  const [loadingBids, setLoadingBids] = useState(false)
  const [bidsError, setBidsError] = useState<string | null>(null)
  const [updatingBidId, setUpdatingBidId] = useState<number | null>(null)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [messageForm, setMessageForm] = useState({ bidId: 0, action: "", message: "" })

  const [actionMessage, setActionMessage] = useState<{
    type: "success" | "error"
    text: string
  } | null>(null)

  const [deletingMissionId, setDeletingMissionId] = useState<number | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [missionToDelete, setMissionToDelete] = useState<Mission | null>(null) // Typed as Mission | null
  const [deleteSuccess, setDeleteSuccess] = useState(false)

  const [notifications, setNotifications] = useState<any[]>([])
  const [showNotifications, setShowNotifications] = useState(false)
  const [missionMenuOpen, setMissionMenuOpen] = useState<number | null>(null)
  const [initialDataFetched, setInitialDataFetched] = useState(false)

  // New states for reviews modal
  const [showReviewsModal, setShowReviewsModal] = useState(false)
  const [selectedContractorReviews, setSelectedContractorReviews] = useState<any>(null)

  const [showDetailsInfoModal, setShowDetailsInfoModal] = useState(false)

  const filteredServices = SERVICES.filter((service) => service.toLowerCase().includes(serviceSearch.toLowerCase()))

  const filteredEditServices = SERVICES.filter((service) =>
    service.toLowerCase().includes(editServiceSearch.toLowerCase()),
  )

  const COMPLETION_TIMELINE_OPTIONS = [
    { value: "immediately", label: "Immediately", priority: "high" },
    { value: "within_1_week", label: "Within a week", priority: "high" },
    { value: "within_1_month", label: "Within 1 month", priority: "medium" },
    { value: "within_3_months", label: "Within 3 months", priority: "low" },
    { value: "inquiring_only", label: "Inquiring only", priority: "low" },
  ]

  const mapTimelineToPriority = (timeline: string): string => {
    const mapping: Record<string, string> = {
      immediately: "high",
      within_1_week: "high",
      within_1_month: "medium",
      within_3_months: "low",
      inquiring_only: "low",
    }
    return mapping[timeline] || "medium"
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login")
    }
  }, [user, authLoading, router])

  // Fetch initial data only once when the user is authenticated and data hasn't been fetched yet.
  useEffect(() => {
    if (user?.id && !initialDataFetched) {
      fetchProfile()
      fetchMissions()
      fetchNotifications()
      setInitialDataFetched(true)
    }
  }, [user?.id, initialDataFetched])

  useEffect(() => {
    if (usePersonalAddress && profile) {
      console.log("[v0] Autofilling personal address:", profile)
      setPostJobForm((prev) => ({
        ...prev,
        address: profile.address || "",
        city: profile.city || "",
        region: profile.region || "",
        country: profile.country || "CA",
        postal_code: profile.postal_code || "",
      }))
    }
  }, [usePersonalAddress, profile])

  useEffect(() => {
    if (usePersonalAddressEdit && profile) {
      console.log("[v0] Autofilling personal address for edit:", profile)
      setEditJobForm((prev) => ({
        ...prev,
        address: profile.address || "",
        city: profile.city || "",
        region: profile.region || "",
        country: profile.country || "CA",
        postal_code: profile.postal_code || "",
      }))
    }
  }, [usePersonalAddressEdit, profile])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (missionMenuOpen !== null) {
        const target = event.target as HTMLElement
        // Check if the click target is outside the mission menu or its parent elements
        // The '.relative' class is applied to the div containing the menu button and the menu itself.
        const menuContainer = target.closest(".relative")
        if (!menuContainer) {
          setMissionMenuOpen(null)
        }
      }
    }

    if (missionMenuOpen !== null) {
      document.addEventListener("click", handleClickOutside)
    }

    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [missionMenuOpen])

  const fetchProfile = async () => {
    try {
      const data = await apiClient.request<any>("/api/users/profile", { requiresAuth: true })
      setProfile(data)
    } catch (error) {
      console.error("Error fetching profile:", error)
    }
  }

  const fetchMissions = async () => {
    try {
      setLoading(true)
      const data = await apiClient.request<Mission[]>("/api/missions/active", {
        // Typed as Mission[]
        requiresAuth: true,
      })
      console.log("[v0] Missions fetched from API:", data)
      data.forEach((mission) => {
        console.log(
          `[v0] Mission ${mission.id}: has_accepted_bid=${mission.has_accepted_bid}, considering_count=${mission.considering_count}, accepted_at=${mission.accepted_at}`,
        )
      })
      setMissions(data)
    } catch (error) {
      console.error("Failed to fetch missions:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBidsForMission = async (missionId: number) => {
    setLoadingBids(true)
    setBidsError(null)
    try {
      const data = await apiClient.request<BidWithReviews[]>(`/api/missions/${missionId}/bids`, { requiresAuth: true })
      console.log("[v0] Bids fetched successfully:", data)
      console.log("[v0] Number of bids:", data.length)

      const bidsWithReviews = await Promise.all(
        data.map(async (bid) => {
          try {
            const reviewsData = await apiClient.request<any>(`/api/contractors/${bid.contractor_id}/reviews`, {
              requiresAuth: false,
            })

            console.log(`[v0] Reviews for contractor ${bid.contractor_id}:`, reviewsData)

            if (reviewsData.google_review_count === 0) {
              console.log(
                `[v0] No Google reviews in database for contractor ${bid.contractor_id}, fetching from profile`,
              )

              try {
                const profileData = await apiClient.request<any>(`/api/contractors/${bid.contractor_id}/profile`, {
                  requiresAuth: false,
                })

                console.log(`[v0] Contractor profile fetched:`, profileData)

                // Extract Google reviews from review_sites
                const googleSite = profileData.review_sites?.find((site: any) => site.site === "google")

                if (googleSite) {
                  const googleRating = googleSite.rating || 0
                  const googleCount = googleSite.review_count || 0
                  const googleReviews = googleSite.reviews || []

                  console.log(`[v0] Found Google reviews in profile:`, {
                    rating: googleRating,
                    count: googleCount,
                    reviews: googleReviews.length,
                  })

                  // Calculate combined average rating
                  const homeheroRating = reviewsData.homehero_rating || 0
                  const homeheroCount = reviewsData.homehero_review_count || 0
                  const totalCount = homeheroCount + googleCount
                  const averageRating =
                    totalCount > 0 ? (homeheroRating * homeheroCount + googleRating * googleCount) / totalCount : 0

                  return {
                    ...bid,
                    average_rating: averageRating,
                    total_rating: averageRating,
                    homehero_rating: homeheroRating,
                    homehero_review_count: homeheroCount,
                    google_rating: googleRating,
                    google_review_count: googleCount,
                    google_reviews: googleReviews,
                  }
                }
              } catch (profileError) {
                console.error(`[v0] Failed to fetch contractor profile for fallback:`, profileError)
              }
            }

            // Return with database reviews only (no Google reviews found)
            return {
              ...bid,
              average_rating: reviewsData.average_rating || 0,
              total_rating: reviewsData.average_rating || 0,
              homehero_rating: reviewsData.homehero_rating || 0,
              homehero_review_count: reviewsData.homehero_review_count || 0,
              google_rating: reviewsData.google_rating || 0,
              google_review_count: reviewsData.google_review_count || 0,
            }
          } catch (error: any) {
            console.error(`[v0] Failed to fetch reviews for contractor ${bid.contractor_id}:`, error.message)

            try {
              console.log(`[v0] Attempting to fetch contractor profile as fallback for contractor ${bid.contractor_id}`)

              const profileData = await apiClient.request<any>(`/api/contractors/${bid.contractor_id}/profile`, {
                requiresAuth: false,
              })

              console.log(`[v0] Contractor profile fetched (fallback):`, profileData)

              // Extract Google reviews from review_sites
              const googleSite = profileData.review_sites?.find((site: any) => site.site === "google")

              if (googleSite) {
                const googleRating = googleSite.rating || 0
                const googleCount = googleSite.review_count || 0
                const googleReviews = googleSite.reviews || []

                console.log(`[v0] Found Google reviews in profile (fallback):`, {
                  rating: googleRating,
                  count: googleCount,
                  reviews: googleReviews.length,
                })

                return {
                  ...bid,
                  average_rating: googleRating,
                  total_rating: googleRating,
                  homehero_rating: 0,
                  homehero_review_count: 0,
                  google_rating: googleRating,
                  google_review_count: googleCount,
                  google_reviews: googleReviews,
                }
              }
            } catch (profileError) {
              console.error(`[v0] Failed to fetch contractor profile (fallback):`, profileError)
            }

            // Return bid without review data if both fetches fail
            return {
              ...bid,
              average_rating: 0,
              total_rating: 0,
              homehero_rating: 0,
              homehero_review_count: 0,
              google_rating: 0,
              google_review_count: 0,
              google_reviews: [],
            }
          }
        }),
      )

      setBidsForMission(bidsWithReviews)
      // Notifications are marked as read separately when clicked
      // Refresh missions to update counts
      fetchMissions()

      const relatedNotifications = notifications.filter((n) => n.type === "new_bid" && n.mission_id === missionId)

      if (relatedNotifications.length > 0) {
        await Promise.all(relatedNotifications.map((notification) => markNotificationAsRead(notification.id)))
        // Refresh notifications to update badge counts
        await fetchNotifications()
      }
    } catch (error: any) {
      console.error("Error fetching bids:", error)
      setBidsForMission([])
      setBidsError("Unable to load bids at this time. Please try again later or contact support if the issue persists.")
    } finally {
      setLoadingBids(false)
    }
  }

  const fetchNotifications = async () => {
    try {
      const data = await apiClient.request<any[]>("/api/notifications", { requiresAuth: true })
      console.log("[v0] Notifications fetched successfully:", data)
      setNotifications(data.filter((n) => !n.is_read))
    } catch (error: any) {
      console.error("[v0] Error fetching notifications (non-critical):", error)
      // Set empty array so the notification bell still works
      setNotifications([])
      // Don't show alert - this is a non-critical feature
    }
  }

  const markNotificationAsRead = async (notificationId: number) => {
    try {
      await apiClient.request(`/api/notifications/${notificationId}/mark-read`, {
        method: "POST",
        requiresAuth: true,
      })
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))

      window.dispatchEvent(new CustomEvent("notificationUpdated"))
    } catch (error) {
      console.error("[v0] Error marking notification as read:", error)
    }
  }

  const markAllNotificationsAsRead = async () => {
    try {
      // Mark all notifications as read in parallel
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
      console.log("[v0] All notifications marked as read")
    } catch (error) {
      console.error("[v0] Error marking all notifications as read:", error)
    }
  }

  const handleDeleteMission = async (missionId: number) => {
    try {
      setDeletingMissionId(missionId)
      await apiClient.request(`/api/missions/${missionId}`, {
        method: "DELETE",
        requiresAuth: true,
      })
      setDeleteSuccess(true)
      fetchMissions()

      setTimeout(() => {
        setShowDeleteConfirm(false)
        setMissionToDelete(null)
        setDeleteSuccess(false)
      }, 2000)
    } catch (error) {
      console.error("Error deleting mission:", error)
      alert("Failed to delete job. Please try again.")
    } finally {
      setDeletingMissionId(null)
    }
  }

  const openDeleteConfirm = (mission: Mission) => {
    setMissionToDelete(mission)
    setShowDeleteConfirm(true)
    setDeleteSuccess(false)
  }

  const handlePostJob = async () => {
    try {
      setUploading(true)
      const formData = new FormData()
      formData.append("title", postJobForm.title)
      formData.append("service", postJobForm.service)
      if (postJobForm.job_details.trim()) {
        formData.append("job_details", postJobForm.job_details)
      }
      formData.append("address", postJobForm.address)
      formData.append("city", postJobForm.city)
      formData.append("region", postJobForm.region)
      formData.append("country", postJobForm.country)
      formData.append("postal_code", postJobForm.postal_code)
      formData.append("completion_timeline", postJobForm.completion_timeline)
      formData.append("priority", mapTimelineToPriority(postJobForm.completion_timeline))

      const category = getServiceCategory(postJobForm.service)
      const categoryFields = getCategoryFields(category)

      if (categoryFields.area_size && postJobForm.area_size) {
        formData.append("area_size", postJobForm.area_size)
      }
      if (categoryFields.num_items && postJobForm.num_items) {
        formData.append("num_items", postJobForm.num_items)
      }
      if (categoryFields.condition_severity && postJobForm.condition_severity) {
        formData.append("condition_severity", postJobForm.condition_severity)
      }
      if (categoryFields.material_type && postJobForm.material_type) {
        formData.append("material_type", postJobForm.material_type)
      }
      if (categoryFields.location_in_home && postJobForm.location_in_home) {
        formData.append("location_in_home", postJobForm.location_in_home)
      }
      if (categoryFields.materials_provided) {
        formData.append("materials_provided", postJobForm.materials_provided.toString())
      }
      if (categoryFields.special_description && postJobForm.special_description) {
        formData.append("special_description", postJobForm.special_description)
      }
      if (categoryFields.service_frequency && postJobForm.service_frequency) {
        formData.append("service_frequency", postJobForm.service_frequency)
      }
      if (categoryFields.special_requirements && postJobForm.special_requirements) {
        formData.append("special_requirements", postJobForm.special_requirements)
      }
      if (categoryFields.style_theme && postJobForm.style_theme) {
        formData.append("style_theme", postJobForm.style_theme)
      }
      if (categoryFields.energy_usage && postJobForm.energy_usage) {
        formData.append("energy_usage", postJobForm.energy_usage)
      }
      if (categoryFields.event_duration_hours && postJobForm.event_duration_hours) {
        formData.append("event_duration_hours", postJobForm.event_duration_hours)
      }

      if (categoryRequiresStructureDetails(category)) {
        if (postJobForm.house_size) formData.append("house_size", postJobForm.house_size)
        if (postJobForm.stories && postJobForm.stories !== "n/a") {
          formData.append("stories", postJobForm.stories)
        }
        if (postJobForm.property_type) formData.append("property_type", postJobForm.property_type)
      }

      if (postJobImages) {
        Array.from(postJobImages).forEach((file) => {
          formData.append("images", file)
        })
      }

      console.log("[v0] Posting job with data:", {
        title: postJobForm.title,
        service: postJobForm.service,
        completion_timeline: postJobForm.completion_timeline,
        priority: mapTimelineToPriority(postJobForm.completion_timeline),
        address: postJobForm.address,
        city: postJobForm.city,
        region: postJobForm.region,
        country: postJobForm.country,
        postal_code: postJobForm.postal_code,
      })

      await apiClient.uploadFormData("/api/missions", formData)
      setShowPostJobModal(false)
      // Reset form
      setPostJobForm({
        title: "",
        service: "",
        job_details: "",
        completion_timeline: "", // Changed default from "within_month" to empty string
        address: "",
        city: "",
        region: "",
        country: "CA",
        postal_code: "",
        house_size: "",
        stories: "", // Changed default from "1" to empty string
        property_type: "", // Changed default from "single_family" to empty string
        area_size: "",
        num_items: "",
        condition_severity: "",
        material_type: "",
        location_in_home: "",
        materials_provided: false,
        special_description: "",
        service_frequency: "",
        special_requirements: "",
        style_theme: "",
        energy_usage: "",
        event_duration_hours: "",
      })
      setPostJobImages(null)
      setServiceSearch("")
      setUsePersonalAddress(false) // Reset checkbox state
      fetchMissions()
    } catch (error: any) {
      console.error("Error posting job:", error)
      const errorMessage = error?.message || "Failed to post job. Please try again."
      console.log("[v0] Backend error details:", error)

      if (error?.message?.includes("500")) {
        alert(
          "Server error: The backend encountered an issue processing your request. Please contact support if this persists.",
        )
      } else {
        alert(errorMessage)
      }
    } finally {
      setUploading(false)
    }
  }

  const handleEditJob = async () => {
    if (!selectedJobForEdit) return

    if (editJobForm.job_details.trim().length < 10) {
      toast({
        title: "Validation Error",
        description: "Job description must be at least 10 characters long.",
        variant: "destructive",
      })
      return
    }

    try {
      setUploading(true)
      const formData = new FormData()

      formData.append("title", editJobForm.title)
      formData.append("service", editJobForm.service)
      if (editJobForm.job_details.trim()) {
        formData.append("job_details", editJobForm.job_details)
      }
      formData.append("address", editJobForm.address)
      formData.append("city", editJobForm.city)
      formData.append("region", editJobForm.region)
      formData.append("country", editJobForm.country)
      formData.append("postal_code", editJobForm.postal_code)
      formData.append("completion_timeline", editJobForm.completion_timeline)
      formData.append("priority", mapTimelineToPriority(editJobForm.completion_timeline))

      const category = getServiceCategory(editJobForm.service)
      const categoryFields = getCategoryFields(category)

      if (categoryFields.area_size && editJobForm.area_size) {
        formData.append("area_size", editJobForm.area_size)
      }
      if (categoryFields.num_items && editJobForm.num_items) {
        formData.append("num_items", editJobForm.num_items)
      }
      if (categoryFields.condition_severity && editJobForm.condition_severity) {
        formData.append("condition_severity", editJobForm.condition_severity)
      }
      if (categoryFields.material_type && editJobForm.material_type) {
        formData.append("material_type", editJobForm.material_type)
      }
      if (categoryFields.location_in_home && editJobForm.location_in_home) {
        formData.append("location_in_home", editJobForm.location_in_home)
      }
      if (categoryFields.materials_provided) {
        formData.append("materials_provided", editJobForm.materials_provided.toString())
      }
      if (categoryFields.special_description && editJobForm.special_description) {
        formData.append("special_description", editJobForm.special_description)
      }
      if (categoryFields.service_frequency && editJobForm.service_frequency) {
        formData.append("service_frequency", editJobForm.service_frequency)
      }
      if (categoryFields.special_requirements && editJobForm.special_requirements) {
        formData.append("special_requirements", editJobForm.special_requirements)
      }
      if (categoryFields.style_theme && editJobForm.style_theme) {
        formData.append("style_theme", editJobForm.style_theme)
      }
      if (categoryFields.energy_usage && editJobForm.energy_usage) {
        formData.append("energy_usage", editJobForm.energy_usage)
      }
      if (categoryFields.event_duration_hours && editJobForm.event_duration_hours) {
        formData.append("event_duration_hours", editJobForm.event_duration_hours)
      }

      if (categoryRequiresStructureDetails(category)) {
        if (editJobForm.house_size) formData.append("house_size", editJobForm.house_size)
        if (editJobForm.stories && editJobForm.stories !== "n/a") {
          formData.append("stories", editJobForm.stories)
        }
        if (editJobForm.property_type) formData.append("property_type", editJobForm.property_type)
      }

      if (editJobImages) {
        Array.from(editJobImages).forEach((file) => {
          formData.append("images", file)
        })
      }

      console.log("[v0] Editing job with ID:", selectedJobForEdit.id)
      console.log("[v0] FormData contents:")
      for (const [key, value] of formData.entries()) {
        console.log(`[v0]   ${key}:`, value)
      }

      await apiClient.uploadFormData(`/api/missions/${selectedJobForEdit.id}`, formData, "PUT")
      setSelectedJobForEdit(null)
      setEditJobImages(null)
      setEditServiceSearch("")
      setUsePersonalAddressEdit(false) // Reset checkbox state
      setShowEditJobModal(false) // Close the edit modal
      fetchMissions()
    } catch (error: any) {
      const errorDetails = error?.response?.data // Assuming the error response structure
      console.log("[v0] Backend error response:", errorDetails)

      const errorMessage =
        errorDetails?.errorData?.details?.[0]?.message || errorDetails?.errorData?.error || error.message
      toast({
        title: "Error updating job",
        description: errorMessage,
        variant: "destructive",
      })

      console.error("[v0] Error updating job:", error.message)
      console.error("[v0] Error details:", error)
    } finally {
      setUploading(false)
    }
  }

  const openEditModal = (mission: Mission) => {
    // Changed parameter type to Mission
    setSelectedJobForEdit(mission)
    const timeline = mission.completion_timeline || "flexible"

    setEditServiceSearch(mission.service || "")

    setEditJobForm({
      title: mission.title || "",
      service: mission.service || "",
      job_details: mission.job_details || "",
      completion_timeline: timeline,
      address: mission.address || "",
      city: mission.city || "",
      region: mission.region || "",
      country: mission.country || "", // Default to mission's country or empty if not present
      postal_code: mission.postal_code || "",
      house_size: mission.house_size || "",
      stories: mission.stories || "",
      property_type: mission.property_type || "",
      area_size: mission.area_size || "",
      num_items: mission.num_items || "",
      condition_severity: mission.condition_severity || "",
      material_type: mission.material_type || "",
      location_in_home: mission.location_in_home || "",
      materials_provided: mission.materials_provided || false,
      special_description: mission.special_description || "",
      service_frequency: mission.service_frequency || "",
      special_requirements: mission.special_requirements || "",
      style_theme: mission.style_theme || "",
      energy_usage: mission.energy_usage || "",
      event_duration_hours: mission.event_duration_hours || "",
    })
    setShowEditJobModal(true)
  }

  const handleBidAction = async (bidId: number, action: "considering" | "accepted" | "rejected") => {
    setMessageForm({ bidId, action, message: "" })
    setShowMessageModal(true)
  }

  const submitBidActionWithMessage = async () => {
    if (!selectedMissionForBids) return

    const { bidId, action, message } = messageForm
    setUpdatingBidId(bidId)
    setActionMessage(null)

    try {
      await apiClient.request(`/api/bids/${bidId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status: action, message: message.trim() || undefined }),
        requiresAuth: true,
      })

      // Refresh bids to show updated status
      await fetchBidsForMission(selectedMissionForBids.id)

      const actionText = action === "considering" ? "marked as considering" : action
      setActionMessage({
        type: "success",
        text: `Bid ${actionText} successfully!${message.trim() ? " Message sent to contractor." : ""}`,
      })

      setTimeout(() => {
        setShowMessageModal(false)
        setMessageForm({ bidId: 0, action: "", message: "" })
        setActionMessage(null)
      }, 2000)
    } catch (error: any) {
      console.error(`[v0] Error updating bid status to "${action}":`, error)
      console.error(`[v0] Error details:`, {
        bidId,
        action,
        errorMessage: error?.message,
        errorData: error?.errorData,
      })

      const errorMessage = error?.message || "Unknown error"
      if (errorMessage.includes("updated_at")) {
        setActionMessage({
          type: "error",
          text: "Unable to update bid status. The backend needs to fix a database issue. Please contact support.",
        })
      } else {
        setActionMessage({
          type: "error",
          text: `Failed to update bid status: ${errorMessage}. Please try again or contact support if the issue persists.`,
        })
      }
    } finally {
      setUpdatingBidId(null)
    }
  }

  const openBidsModal = (mission: Mission) => {
    // Changed parameter type to Mission
    setSelectedMissionForBids(mission)
    fetchBidsForMission(mission.id)
  }

  const closeBidsModal = () => {
    setSelectedMissionForBids(null)
    setBidsForMission([])
    setBidsError(null)
  }

  const [postJobForm, setPostJobForm] = useState({
    title: "",
    service: "",
    job_details: "",
    completion_timeline: "", // Changed default from "within_month" to empty string
    address: "",
    city: "",
    region: "",
    country: "CA",
    postal_code: "",
    house_size: "",
    stories: "", // Changed default from "1" to empty string
    property_type: "", // Changed default from "single_family" to empty string
    area_size: "",
    num_items: "",
    condition_severity: "",
    material_type: "",
    location_in_home: "",
    materials_provided: false,
    special_description: "",
    service_frequency: "",
    special_requirements: "",
    style_theme: "",
    energy_usage: "",
    event_duration_hours: "",
  })
  const [postJobImages, setPostJobImages] = useState<FileList | null>(null)

  const [editJobForm, setEditJobForm] = useState({
    title: "",
    service: "",
    job_details: "",
    completion_timeline: "",
    address: "",
    city: "",
    region: "",
    country: "CA",
    postal_code: "",
    house_size: "",
    stories: "", // Changed default from "1" to empty string
    property_type: "", // Changed default from "single_family" to empty string
    area_size: "",
    num_items: "",
    condition_severity: "",
    material_type: "",
    location_in_home: "",
    materials_provided: false,
    special_description: "",
    service_frequency: "",
    special_requirements: "",
    style_theme: "",
    energy_usage: "",
    event_duration_hours: "",
  })
  const [editJobImages, setEditJobImages] = useState<FileList | null>(null)

  const countryCode = profile?.country || "CA"
  const regionLabel =
    countryCode === "US"
      ? "State"
      : countryCode === "CA"
        ? "Province"
        : countryCode === "GB"
          ? "Region"
          : countryCode === "AU"
            ? "State/Territory"
            : "Region"
  const postalCodeLabel = countryCode === "US" ? "Zip Code" : countryCode === "CA" ? "Postal Code" : "Postcode"

  const postJobCategory = getServiceCategory(postJobForm.service)
  const postJobCategoryFields = getCategoryFields(postJobCategory)
  const postJobShowStructureDetails = categoryRequiresStructureDetails(postJobCategory)

  const editJobCategory = getServiceCategory(editJobForm.service)
  const editJobCategoryFields = getCategoryFields(editJobCategory)
  const editJobShowStructureDetails = categoryRequiresStructureDetails(editJobCategory)

  if (authLoading) {
    return (
      <DashboardLayout userRole="homeowner">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading...</p>
        </div>
      </DashboardLayout>
    )
  }

  if (!user) {
    return null
  }

  const getImagePreviews = (files: FileList | null): string[] => {
    if (!files) return []
    return Array.from(files).map((file) => URL.createObjectURL(file))
  }

  const hasUnreadBidNotifications = (missionId: number) => {
    return notifications.some((n) => n.type === "new_bid" && n.mission_id === missionId && !n.is_read)
  }

  const renderCategoryFields = (
    form: typeof postJobForm | typeof editJobForm, // Union type to accept both forms
    setForm: React.Dispatch<React.SetStateAction<typeof postJobForm | typeof editJobForm>>,
    categoryFields: ReturnType<typeof getCategoryFields>,
    category: string | null,
  ) => {
    if (!category || Object.keys(categoryFields).length === 0) return null

    return (
      <div className="pt-4 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Details</h3>
        <div className="space-y-4">
          {categoryFields.area_size && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {category === SERVICE_CATEGORIES.OUTDOOR
                  ? "Yard Size (sq ft)"
                  : category === SERVICE_CATEGORIES.ROOFING
                    ? "Roof Size (sq ft)"
                    : "Area Size (sq ft)"}
              </label>
              <input
                type="number"
                value={form.area_size}
                onChange={(e) => setForm({ ...form, area_size: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent"
                placeholder="e.g., 1000"
              />
            </div>
          )}

          {categoryFields.num_items && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {category === SERVICE_CATEGORIES.PET
                  ? "Number of Pets"
                  : category === SERVICE_CATEGORIES.SAFETY
                    ? "Number of Detectors"
                    : "Number of Items"}
              </label>
              <input
                type="number"
                value={form.num_items}
                onChange={(e) => setForm({ ...form, num_items: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent"
                placeholder="e.g., 2"
              />
            </div>
          )}

          {categoryFields.condition_severity && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {category === SERVICE_CATEGORIES.CLEANING ? "Condition" : "Damage Extent"}
              </label>
              <select
                value={form.condition_severity}
                onChange={(e) => setForm({ ...form, condition_severity: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent"
              >
                <option value="">Select...</option>
                <option value="light">Light</option>
                <option value="minor">Minor</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
              </select>
            </div>
          )}

          {categoryFields.material_type && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Material Type</label>
              <input
                type="text"
                value={form.material_type}
                onChange={(e) => setForm({ ...form, material_type: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent"
                placeholder={
                  category === SERVICE_CATEGORIES.ROOFING ? "e.g., Asphalt, Cedar Shake" : "e.g., Wood, Vinyl, Metal"
                }
              />
            </div>
          )}

          {categoryFields.location_in_home && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location in Home</label>
              <select
                value={form.location_in_home}
                onChange={(e) => setForm({ ...form, location_in_home: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent"
              >
                <option value="">Select...</option>
                <option value="kitchen">Kitchen</option>
                <option value="bedroom">Bedroom</option>
                <option value="bathroom">Bathroom</option>
                <option value="living_room">Living Room</option>
                <option value="outdoor">Outdoor</option>
                <option value="other">Other</option>
              </select>
            </div>
          )}

          {categoryFields.materials_provided && (
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id={`materials-${form === postJobForm ? "post" : "edit"}`}
                checked={form.materials_provided}
                onChange={(e) => setForm({ ...form, materials_provided: e.target.checked })}
                className="w-4 h-4 text-[#328d87] border-gray-300 rounded focus:ring-[#328d87]"
              />
              <label htmlFor={`materials-${form === postJobForm ? "post" : "edit"}`} className="text-sm text-gray-700">
                {category === SERVICE_CATEGORIES.SAFETY ? "Existing System Installed" : "Materials Provided"}
              </label>
            </div>
          )}

          {categoryFields.special_description && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {category === SERVICE_CATEGORIES.PET
                  ? "Pet Type & Details"
                  : category === SERVICE_CATEGORIES.REPAIRS
                    ? "Item/Area Description"
                    : category === SERVICE_CATEGORIES.OUTDOOR
                      ? "Terrain/Access Details"
                      : category === SERVICE_CATEGORIES.ENERGY
                        ? "System Size/Type"
                        : category === SERVICE_CATEGORIES.PEST
                          ? "Infestation Type"
                          : category === SERVICE_CATEGORIES.CHILD
                            ? "Number of Children & Ages"
                            : category === SERVICE_CATEGORIES.SEASONAL
                              ? "Event Type/Size"
                              : "Description"}
              </label>
              <textarea
                rows={3}
                value={form.special_description}
                onChange={(e) => setForm({ ...form, special_description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent"
                placeholder="Provide additional details..."
              />
            </div>
          )}

          {categoryFields.service_frequency && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Service Frequency</label>
              <select
                value={form.service_frequency}
                onChange={(e) => setForm({ ...form, service_frequency: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent"
              >
                <option value="">Select...</option>
                <option value="one-time">One-time</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>
          )}

          {categoryFields.special_requirements && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Special Requirements</label>
              <textarea
                rows={3}
                value={form.special_requirements}
                onChange={(e) => setForm({ ...form, special_requirements: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent"
                placeholder="Any special needs or requirements..."
              />
            </div>
          )}

          {categoryFields.style_theme && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Style/Theme</label>
              <input
                type="text"
                value={form.style_theme}
                onChange={(e) => setForm({ ...form, style_theme: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent"
                placeholder="e.g., Modern, Traditional, Rustic"
              />
            </div>
          )}

          {categoryFields.energy_usage && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Current Energy Usage (CAD/month)</label>
              <input
                type="number"
                value={form.energy_usage}
                onChange={(e) => setForm({ ...form, energy_usage: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent"
                placeholder="e.g., 150"
              />
            </div>
          )}

          {categoryFields.event_duration_hours && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Event Duration (hours)</label>
              <input
                type="number"
                value={form.event_duration_hours}
                onChange={(e) => setForm({ ...form, event_duration_hours: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent"
                placeholder="e.g., 4"
              />
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout userRole="homeowner">
      <div
        className="fixed inset-0 bg-cover bg-center bg-no-repeat -z-10"
        style={{ backgroundImage: "url('/living-room-background.jpg')" }}
      />
      <div className="fixed inset-0 bg-[#0d3d42]/95 -z-10" />

      <div className="space-y-8">
        {/* Header with Welcome, Notifications, and Post Job */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex-1">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Welcome back!</h1>
            <p className="text-gray-600 mt-2">Here's what's happening with your projects</p>
          </div>
          <div className="flex items-center justify-between md:justify-end gap-3 md:gap-4">
            <button
              onClick={() => setShowPostJobModal(true)}
              className="flex items-center justify-center gap-2 bg-[#328d87] text-white px-4 md:px-6 py-3 rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              <Plus className="h-5 w-5" />
              <span>Post Job</span>
            </button>
            <div className="relative flex-shrink-0">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
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
                            markNotificationAsRead(notification.id)
                            if (notification.type === "new_message") {
                              window.dispatchEvent(new CustomEvent("notificationUpdated"))
                              router.push("/dashboard/homeowner/messages")
                              setShowNotifications(false)
                            }
                            if (notification.type === "new_bid" && notification.mission_id) {
                              const mission = missions.find((m) => m.id === notification.mission_id)
                              if (mission) {
                                openBidsModal(mission)
                                setShowNotifications(false)
                              }
                            }
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <Briefcase className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Jobs Posted</p>
                <p className="text-2xl font-bold text-gray-900">{missions.length}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">My Job Postings</h2>
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading...</p>
            </div>
          ) : missions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No jobs posted yet</p>
              <p className="text-sm text-gray-400 mt-2">Post your first job to get started!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {missions.map((mission) => {
                const hasBids = (mission.bid_count || 0) > 0
                const unreadBids = mission.unread_bids_count || 0
                const consideringCount = mission.considering_count || 0
                const hasAcceptedBid = mission.has_accepted_bid || false
                const hasConsideringBid = consideringCount > 0

                return (
                  <div
                    key={mission.id}
                    className={`bg-white rounded-xl border-2 p-6 hover:shadow-md transition-shadow ${
                      hasAcceptedBid
                        ? "border-green-500 bg-green-50"
                        : hasConsideringBid
                          ? "border-yellow-500 bg-yellow-50"
                          : "border-gray-200"
                    }`}
                  >
                    {/* Mobile: Title and 3-dots menu in one row */}
                    <div className="flex items-start justify-between gap-2 mb-4 md:hidden">
                      <h3 className="flex-1 text-xl font-bold text-gray-900">{mission.title}</h3>
                      <div className="flex-shrink-0 relative">
                        <button
                          onClick={() => setMissionMenuOpen(missionMenuOpen === mission.id ? null : mission.id)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <svg className="h-5 w-5 text-gray-600" fill="currentColor" viewBox="0 0 24 24">
                            <circle cx="12" cy="5" r="2" />
                            <circle cx="12" cy="12" r="2" />
                            <circle cx="12" cy="19" r="2" />
                          </svg>
                        </button>
                        {missionMenuOpen === mission.id && (
                          <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                            {hasBids ? (
                              <div className="p-3 text-xs text-gray-500 border-b border-gray-200">
                                Editing is disabled once bids have been received
                              </div>
                            ) : (
                              <button
                                onClick={() => {
                                  openEditModal(mission)
                                  setMissionMenuOpen(null)
                                }}
                                className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 transition-colors text-left"
                              >
                                <Edit className="h-4 w-4" />
                                <span>Edit</span>
                              </button>
                            )}
                            <button
                              onClick={() => {
                                openDeleteConfirm(mission)
                                setMissionMenuOpen(null)
                              }}
                              className="w-full flex items-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 transition-colors text-left"
                            >
                              <X className="h-4 w-4" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Mobile: Content in full width column */}
                    <div className="md:hidden">
                      <p className="text-gray-600 mb-4">{mission.job_details}</p>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          <span>{mission.service}</span>
                        </div>
                        {mission.created_at && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>
                              Submitted{" "}
                              {new Date(mission.created_at).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4" />
                          <span>{mission.postal_code}</span>
                        </div>
                        {mission.details_requested_count > 0 && (
                          <div className="flex items-center gap-2">
                            <span className="text-red-600 font-semibold">
                              Requests for More Details: {mission.details_requested_count}
                            </span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                setShowDetailsInfoModal(true)
                              }}
                              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                            >
                              <Info className="h-4 w-4 text-red-600" />
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-3 mt-4">
                        {(mission.bid_count || 0) > 0 && (
                          <button
                            onClick={() => openBidsModal(mission)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-semibold relative ${
                              hasUnreadBidNotifications(mission.id)
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                            }`}
                          >
                            <Briefcase className="h-5 w-5" />
                            <span>Bids Received: {mission.bid_count}</span>
                            {unreadBids > 0 && (
                              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
                                {unreadBids}
                              </span>
                            )}
                          </button>
                        )}
                        {consideringCount > 0 && (
                          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg font-semibold border border-yellow-300">
                            <Star className="h-5 w-5" />
                            <span>Considering: {consideringCount}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="hidden md:flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{mission.title}</h3>
                        <p className="text-gray-600 mb-4">{mission.job_details}</p>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-4 w-4" />
                            <span>{mission.service}</span>
                          </div>
                          {mission.created_at && (
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4" />
                              <span>
                                Submitted{" "}
                                {new Date(mission.created_at).toLocaleDateString("en-US", {
                                  month: "short",
                                  day: "numeric",
                                  year: "numeric",
                                })}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{mission.postal_code}</span>
                          </div>
                          {mission.details_requested_count > 0 && (
                            <div className="flex items-center gap-2">
                              <span className="text-red-600 font-semibold">
                                Requests for More Details: {mission.details_requested_count}
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setShowDetailsInfoModal(true)
                                }}
                                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                              >
                                <Info className="h-4 w-4 text-red-600" />
                              </button>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-3 mt-4">
                          {(mission.bid_count || 0) > 0 && (
                            <button
                              onClick={() => openBidsModal(mission)}
                              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors font-semibold relative ${
                                hasUnreadBidNotifications(mission.id)
                                  ? "bg-blue-600 text-white hover:bg-blue-700"
                                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                              }`}
                            >
                              <Briefcase className="h-5 w-5" />
                              <span>Bids Received: {mission.bid_count}</span>
                              {unreadBids > 0 && (
                                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center animate-pulse">
                                  {unreadBids}
                                </span>
                              )}
                            </button>
                          )}
                          {consideringCount > 0 && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg font-semibold border border-yellow-300">
                              <Star className="h-5 w-5" />
                              <span>Considering: {consideringCount}</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {hasBids ? (
                          <div className="relative group">
                            <button
                              disabled
                              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed"
                            >
                              <Edit className="h-4 w-4" />
                              Edit
                            </button>
                            <div className="absolute right-0 top-full mt-2 w-64 bg-gray-900 text-white text-xs rounded-lg p-3 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                              Editing is disabled once bids have been received. Please contact support if you need to
                              make changes.
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => openEditModal(mission)}
                            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                            Edit
                          </button>
                        )}
                        <button
                          onClick={() => openDeleteConfirm(mission)}
                          className="flex items-center gap-2 px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <X className="h-4 w-4" />
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {showPostJobModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/98 backdrop-blur-sm rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Post a New Job</h2>
              <button
                onClick={() => {
                  setShowPostJobModal(false)
                  setUsePersonalAddress(false)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  💡 <strong>Tip:</strong> Providing more details helps contractors give you more accurate bids and
                  better understand your project needs.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={postJobForm.title}
                  onChange={(e) => setPostJobForm({ ...postJobForm, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent"
                  placeholder="e.g., Kitchen Renovation"
                />
              </div>

              <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Type <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    value={serviceSearch}
                    onChange={(e) => {
                      setServiceSearch(e.target.value)
                      setShowServiceDropdown(true)
                    }}
                    onFocus={() => setShowServiceDropdown(true)}
                    onBlur={() => setTimeout(() => setShowServiceDropdown(false), 200)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent"
                    placeholder="Start typing..." // Updated placeholder text
                  />
                </div>
                {showServiceDropdown && filteredServices.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredServices.map((service) => (
                      <button
                        key={service}
                        type="button"
                        onClick={() => {
                          setPostJobForm({ ...postJobForm, service })
                          setServiceSearch(service)
                          setShowServiceDropdown(false)
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                      >
                        {service}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows={4}
                  value={postJobForm.job_details}
                  onChange={(e) => setPostJobForm({ ...postJobForm, job_details: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent"
                  placeholder="Describe your project in detail..."
                />
                <p className={`text-xs mt-1 ${postJobForm.job_details.length < 10 ? "text-red-500" : "text-gray-500"}`}>
                  {postJobForm.job_details.length}/10 characters minimum
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Images (Max 3)</label>
                <div className="space-y-3">
                  <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors w-fit">
                    <Upload className="h-5 w-5 text-gray-600" />
                    <span className="text-sm text-gray-700">Choose Files</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => {
                        const files = e.target.files
                        if (files && files.length > 3) {
                          alert("Maximum 3 images allowed")
                          e.target.value = ""
                        } else {
                          setPostJobImages(files)
                        }
                      }}
                      className="hidden"
                    />
                  </label>
                  {postJobImages && postJobImages.length > 0 && (
                    <div className="flex gap-2 flex-wrap">
                      {getImagePreviews(postJobImages).map((preview, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setPreviewImage(preview)}
                          className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-300 hover:border-[#328d87] transition-colors group"
                        >
                          <img
                            src={preview || "/placeholder.svg"}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Eye className="h-5 w-5 text-white" />
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  When do you need this done? <span className="text-red-500">*</span>
                </label>
                <select
                  value={postJobForm.completion_timeline}
                  onChange={(e) => setPostJobForm({ ...postJobForm, completion_timeline: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent"
                >
                  <option value="">Select one</option>
                  {COMPLETION_TIMELINE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Where is your job located?</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="use-personal-address"
                      checked={usePersonalAddress}
                      onChange={(e) => setUsePersonalAddress(e.target.checked)}
                      className="w-4 h-4 text-[#328d87] border-gray-300 rounded focus:ring-[#328d87]"
                    />
                    <label htmlFor="use-personal-address" className="text-sm text-gray-700">
                      Use my personal address
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Street Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={postJobForm.address}
                      onChange={(e) => setPostJobForm({ ...postJobForm, address: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent"
                      placeholder="e.g., 123 Main Street"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={postJobForm.city}
                        onChange={(e) => setPostJobForm({ ...postJobForm, city: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent"
                        placeholder="e.g., Saskatoon"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {regionLabel} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={postJobForm.region}
                        onChange={(e) => setPostJobForm({ ...postJobForm, region: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent"
                        placeholder={countryCode === "US" ? "e.g., California" : "e.g., Saskatchewan"}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {postalCodeLabel} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={postJobForm.postal_code}
                      onChange={(e) => setPostJobForm({ ...postJobForm, postal_code: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent"
                      placeholder={countryCode === "US" ? "e.g., 90210" : "e.g., S7K 1J3"}
                    />
                  </div>
                </div>
              </div>

              {postJobShowStructureDetails && (
                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Structure details</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Size (sq ft) {/* Changed from "House Size (sq ft)" */}
                        </label>
                        <input
                          type="text"
                          value={postJobForm.house_size}
                          onChange={(e) => setPostJobForm({ ...postJobForm, house_size: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent"
                          placeholder="e.g., 2000"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Stories</label>
                        <select
                          value={postJobForm.stories}
                          onChange={(e) => setPostJobForm({ ...postJobForm, stories: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent"
                        >
                          <option value="">Select one</option>
                          <option value="1">1 Story</option>
                          <option value="2">2 Stories</option>
                          <option value="3">3+ Stories</option>
                          <option value="n/a">Not applicable</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                      <select
                        value={postJobForm.property_type}
                        onChange={(e) => setPostJobForm({ ...postJobForm, property_type: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent"
                      >
                        <option value="">Select one</option>
                        <option value="single_family">House</option> {/* Changed from "Single Family" */}
                        <option value="condo">Condo</option>
                        <option value="townhouse">Townhouse</option>
                        <option value="apartment">Apartment</option>
                        <option value="commercial">Commercial</option>
                        <option value="n/a">Not applicable</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {renderCategoryFields(postJobForm, setPostJobForm, postJobCategoryFields, postJobCategory)}

              <button
                onClick={handlePostJob}
                className="w-full bg-[#328d87] text-white py-3 rounded-lg hover:bg-[#2a7a75] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={
                  uploading ||
                  !postJobForm.title ||
                  !postJobForm.service ||
                  !postJobForm.completion_timeline || // Added completion_timeline to required fields
                  !postJobForm.address ||
                  !postJobForm.city ||
                  !postJobForm.region ||
                  !postJobForm.postal_code ||
                  postJobForm.job_details.length < 10 // Added minimum character validation
                }
              >
                {uploading ? "Posting..." : "Post Job"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditJobModal &&
        selectedJobForEdit && ( // Use showEditJobModal
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white/98 backdrop-blur-sm rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between z-10 rounded-t-xl">
                <h2 className="text-2xl font-bold text-gray-900">Edit Job</h2>
                <button
                  onClick={() => {
                    setSelectedJobForEdit(null)
                    setEditJobImages(null)
                    setEditServiceSearch("")
                    setUsePersonalAddressEdit(false)
                    setShowEditJobModal(false) // Close the edit modal
                  }}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <div className="p-6 space-y-4 overflow-y-auto">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    💡 <strong>Tip:</strong> Providing more details helps contractors give you more accurate bids and
                    better understand your project needs.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editJobForm.title}
                    onChange={(e) => setEditJobForm({ ...editJobForm, title: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent"
                  />
                </div>

                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Service Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      value={editServiceSearch}
                      onChange={(e) => {
                        setEditServiceSearch(e.target.value)
                        setEditJobForm({ ...editJobForm, service: e.target.value })
                        setShowEditServiceDropdown(true)
                      }}
                      onFocus={() => setShowEditServiceDropdown(true)}
                      onBlur={() => setTimeout(() => setShowEditServiceDropdown(false), 200)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent"
                      placeholder="Start typing..." // Updated placeholder
                    />
                  </div>
                  {showEditServiceDropdown && filteredEditServices.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredEditServices.map((service) => (
                        <button
                          key={service}
                          type="button"
                          onClick={() => {
                            setEditJobForm({ ...editJobForm, service })
                            setEditServiceSearch(service)
                            setShowEditServiceDropdown(false)
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 transition-colors"
                        >
                          {service}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={editJobForm.job_details}
                    onChange={(e) => setEditJobForm({ ...editJobForm, job_details: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent"
                    placeholder="Describe the work needed (minimum 10 characters)"
                  />
                  <p
                    className={`text-sm mt-1 ${editJobForm.job_details.trim().length < 10 ? "text-red-500" : "text-gray-500"}`}
                  >
                    {editJobForm.job_details.trim().length}/10 characters minimum
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Upload Images (Max 5)</label>
                  <div className="space-y-3">
                    <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors w-fit">
                      <Upload className="h-5 w-5 text-gray-600" />
                      <span className="text-sm text-gray-700">Choose Files</span>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={(e) => {
                          const files = e.target.files
                          if (files && files.length > 5) {
                            alert("Maximum 5 images allowed")
                            e.target.value = ""
                          } else {
                            setEditJobImages(files)
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                    {editJobImages && editJobImages.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {getImagePreviews(editJobImages).map((preview, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => setPreviewImage(preview)}
                            className="relative w-20 h-20 rounded-lg overflow-hidden border border-gray-300 hover:border-[#328d87] transition-colors group"
                          >
                            <img
                              src={preview || "/placeholder.svg"}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Eye className="h-5 w-5 text-white" />
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Note: Uploading new images will replace existing ones</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    When do you need this done? <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editJobForm.completion_timeline}
                    onChange={(e) => setEditJobForm({ ...editJobForm, completion_timeline: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent"
                  >
                    <option value="">Select one</option>
                    {COMPLETION_TIMELINE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Where is your job located?</h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="use-personal-address-edit"
                        checked={usePersonalAddressEdit}
                        onChange={(e) => setUsePersonalAddressEdit(e.target.checked)}
                        className="w-4 h-4 text-[#328d87] border-gray-300 rounded focus:ring-[#328d87]"
                      />
                      <label htmlFor="use-personal-address-edit" className="text-sm text-gray-700">
                        Use my personal address
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editJobForm.address}
                        onChange={(e) => setEditJobForm({ ...editJobForm, address: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent"
                        placeholder="e.g., 123 Main Street"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={editJobForm.city}
                          onChange={(e) => setEditJobForm({ ...editJobForm, city: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent"
                          placeholder="e.g., Saskatoon"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {regionLabel} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={editJobForm.region}
                          onChange={(e) => setEditJobForm({ ...editJobForm, region: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent"
                          placeholder={countryCode === "US" ? "e.g., California" : "e.g., Saskatchewan"}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {postalCodeLabel} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={editJobForm.postal_code}
                        onChange={(e) => setEditJobForm({ ...editJobForm, postal_code: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent"
                        placeholder={countryCode === "US" ? "e.g., 90210" : "e.g., S7K 1J3"}
                      />
                    </div>
                  </div>
                </div>

                {editJobShowStructureDetails && (
                  <div className="pt-4 border-t border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Structure details</h3>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Size (sq ft)</label>
                          <input
                            type="text"
                            value={editJobForm.house_size}
                            onChange={(e) => setEditJobForm({ ...editJobForm, house_size: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent"
                            placeholder="e.g., 2000"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Stories</label>
                          <select
                            value={editJobForm.stories}
                            onChange={(e) => setEditJobForm({ ...editJobForm, stories: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent"
                          >
                            <option value="">Select one</option>
                            <option value="1">1 Story</option>
                            <option value="2">2 Stories</option>
                            <option value="3">3+ Stories</option>
                            <option value="n/a">Not applicable</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Property Type</label>
                        <select
                          value={editJobForm.property_type}
                          onChange={(e) => setEditJobForm({ ...editJobForm, property_type: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent"
                        >
                          <option value="">Select one</option>
                          <option value="single_family">House</option>
                          <option value="condo">Condo</option>
                          <option value="townhouse">Townhouse</option>
                          <option value="apartment">Apartment</option>
                          <option value="commercial">Commercial</option>
                          <option value="n/a">Not applicable</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {renderCategoryFields(editJobForm, setEditJobForm, editJobCategoryFields, editJobCategory)}

                <button
                  onClick={handleEditJob}
                  disabled={
                    uploading ||
                    !editJobForm.title ||
                    !editJobForm.service ||
                    !editJobForm.completion_timeline ||
                    !editJobForm.address ||
                    !editJobForm.city ||
                    !editJobForm.region ||
                    !editJobForm.postal_code ||
                    editJobForm.job_details.trim().length < 10 // Add validation for minimum length
                  }
                  className="w-full bg-[#328d87] text-white py-3 rounded-lg hover:opacity-90 transition-opacity font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}

      {/* Bids Modal */}
      {selectedMissionForBids && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={closeBidsModal}>
          <div
            className="bg-white/98 backdrop-blur-sm rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Bids for "{selectedMissionForBids.title}"</h2>
                <p className="text-sm text-gray-600 mt-1">{bidsForMission.length} bid(s) received</p>
              </div>
              <button onClick={closeBidsModal} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6">
              {loadingBids ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">Loading bids...</p>
                </div>
              ) : bidsError ? (
                <div className="text-center py-12">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
                    <p className="text-red-800 font-medium mb-2">Error Loading Bids</p>
                    <p className="text-red-600 text-sm">{bidsError}</p>
                    <button
                      onClick={() => fetchBidsForMission(selectedMissionForBids.id)}
                      className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              ) : bidsForMission.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No bids yet</p>
                  <p className="text-sm text-gray-400 mt-2">Contractors will submit their bids soon!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {bidsForMission.map((bid) => {
                    const isUpdating = updatingBidId === bid.id
                    const bidStatus = bid.status || "pending"
                    const isAccepted = bidStatus === "accepted"
                    const isRejected = bidStatus === "rejected"
                    const isConsidering = bidStatus === "considering"

                    const hasLogo = bid.logo_url && bid.logo_url.trim() !== ""
                    const hasAgentPhoto = bid.agent_photo_url && bid.agent_photo_url.trim() !== ""
                    const hasYearsInBusiness = bid.years_in_business && Number(bid.years_in_business) > 0
                    const hasBusinessAddress = bid.business_address || bid.business_city

                    return (
                      <div
                        key={bid.id}
                        className={`bg-white border-2 rounded-xl p-6 transition-all ${
                          isAccepted
                            ? "border-green-500 bg-green-50"
                            : isRejected
                              ? "border-red-300 bg-gray-50 opacity-60"
                              : isConsidering
                                ? "border-yellow-500 bg-yellow-50"
                                : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        {/* Company Logo and Info */}
                        <div className="flex flex-col gap-4 mb-6">
                          {/* Logo - centered on mobile, left-aligned on desktop */}
                          <div className="flex justify-center md:justify-start">
                            <div className="flex-shrink-0">
                              {hasLogo ? (
                                <img
                                  src={bid.logo_url || "/placeholder.svg"}
                                  alt={`${bid.company_name || "Company"} logo`}
                                  className="w-24 h-24 rounded-lg object-cover border-2 border-gray-200"
                                />
                              ) : (
                                <div className="w-24 h-24 rounded-lg bg-gradient-to-br from-[#328d87] to-[#2a7570] flex items-center justify-center border-2 border-gray-300">
                                  <Briefcase className="h-10 w-10 text-white" />
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Business info - all left-aligned on mobile */}
                          <div className="flex-1">
                            {/* Business name and status badges - left-aligned on mobile */}
                            <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-2">
                              <div className="flex items-center gap-2">
                                <h3 className="text-base md:text-xl font-bold text-gray-900">
                                  {bid.company_name || bid.contractor_name || "Contractor"}
                                </h3>
                                {(bid.is_verified || bid.google_places_id) && <VerifiedBadge type="google" size="md" />}
                                <VerifiedBadge type="phone" size="md" />
                              </div>
                              <div className="flex items-center gap-2">
                                {isAccepted && (
                                  <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                                    ACCEPTED
                                  </span>
                                )}
                                {isRejected && (
                                  <span className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
                                    REJECTED
                                  </span>
                                )}
                                {isConsidering && (
                                  <span className="px-3 py-1 bg-yellow-500 text-white text-xs font-bold rounded-full">
                                    CONSIDERING
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Reviews section - left-aligned on mobile */}
                            <div className="mb-3">
                              {bid.average_rating !== undefined && bid.average_rating !== null ? (
                                <button
                                  onClick={() => {
                                    setSelectedContractorReviews({
                                      contractor_id: bid.contractor_id,
                                      company_name: bid.company_name || bid.contractor_name || "Contractor",
                                      homehero_rating: bid.homehero_rating,
                                      google_rating: bid.google_rating,
                                      average_rating: bid.average_rating,
                                      homehero_review_count: bid.homehero_review_count,
                                      google_review_count: bid.google_review_count,
                                      google_reviews: bid.google_reviews,
                                    })
                                    setShowReviewsModal(true)
                                  }}
                                  className="flex items-center gap-2 hover:opacity-80 transition-opacity group"
                                >
                                  <div className="flex items-center gap-1.5 bg-yellow-50 px-3 py-2 rounded-lg border border-yellow-200">
                                    <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                                    <span className="text-xl font-bold text-gray-900">
                                      {bid.average_rating.toFixed(1)}
                                    </span>
                                  </div>
                                  {(bid.homehero_review_count || bid.google_review_count) && (
                                    <span className="text-base text-gray-600 group-hover:text-gray-900 transition-colors">
                                      (
                                      {(Number(bid.homehero_review_count) || 0) +
                                        (Number(bid.google_review_count) || 0)}{" "}
                                      reviews)
                                    </span>
                                  )}
                                </button>
                              ) : (
                                <div className="flex items-center gap-2 text-gray-400">
                                  <Star className="h-5 w-5" />
                                  <span className="text-base italic">No reviews yet</span>
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              {hasYearsInBusiness && (
                                <span className="text-gray-600">{bid.years_in_business} years in business</span>
                              )}
                            </div>

                            {hasBusinessAddress && (
                              <div className="flex items-start gap-2 text-sm text-gray-600 mt-2">
                                <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                                <span>
                                  {bid.business_address && `${bid.business_address}, `}
                                  {bid.business_city && `${bid.business_city}, `}
                                  {bid.business_region && `${bid.business_region} `}
                                  {bid.business_postal_code}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Bid Amount */}
                        <div className="bg-gradient-to-r from-[#328d87]/10 to-[#328d87]/5 rounded-lg p-4 mb-6">
                          <p className="text-sm text-gray-600 mb-1">Bid Amount</p>
                          <p className="text-4xl font-bold text-[#328d87]">${Math.round(Number(bid.quote))}</p>
                          <p className="text-xs text-gray-500 mt-3 italic">
                            Note: Bid prices are estimates based on the information provided and may vary depending on
                            actual job requirements and site conditions.
                          </p>
                        </div>

                        {/* Agent Photo and Name Above Message */}
                        <div className="mb-4">
                          <div className="flex items-center gap-3 mb-3">
                            {hasAgentPhoto ? (
                              <img
                                src={bid.agent_photo_url || "/placeholder.svg"}
                                alt={bid.contractor_name || "Agent"}
                                className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#328d87] to-[#2a7570] flex items-center justify-center border-2 border-gray-300">
                                <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path
                                    fillRule="evenodd"
                                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-gray-900">{bid.contractor_name || "Agent"}</p>
                              <p className="text-xs text-gray-500">
                                {bid.created_at &&
                                  new Date(bid.created_at).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                    hour: "numeric",
                                    minute: "2-digit",
                                  })}
                              </p>
                            </div>
                          </div>

                          {bid.message && (
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 md:ml-15">
                              <p className="text-gray-700 whitespace-pre-wrap text-left">{bid.message}</p>
                            </div>
                          )}
                        </div>

                        {/* Additional Details */}
                        {bid.estimated_duration && (
                          <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                            <Calendar className="h-4 w-4" />
                            <span>
                              <span className="font-medium">Estimated Duration:</span> {bid.estimated_duration}
                            </span>
                          </div>
                        )}

                        {/* Action Buttons */}
                        {!isRejected && (
                          <div className="flex flex-col md:flex-row gap-3 pt-4 border-t border-gray-200">
                            <button
                              onClick={() => handleBidAction(bid.id, "considering")}
                              disabled={isUpdating || isAccepted || isConsidering}
                              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
                                isConsidering
                                  ? "bg-yellow-500 text-white cursor-default"
                                  : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {isUpdating ? "Updating..." : isConsidering ? "Considering" : "Mark as Considering"}
                            </button>
                            <button
                              onClick={() => handleBidAction(bid.id, "accepted")}
                              disabled={isUpdating || isAccepted}
                              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition-colors ${
                                isAccepted
                                  ? "bg-green-500 text-white cursor-default"
                                  : "bg-green-100 text-green-700 hover:bg-green-200"
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                              {isUpdating ? "Updating..." : isAccepted ? "Accepted" : "Accept Bid"}
                            </button>
                            <button
                              onClick={() => handleBidAction(bid.id, "rejected")}
                              disabled={isUpdating || isAccepted}
                              className="flex-1 px-6 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {isUpdating ? "Updating..." : "Reject"}
                            </button>
                          </div>
                        )}

                        {isRejected && (
                          <div className="pt-4 border-t border-gray-200">
                            <p className="text-sm text-gray-500 italic text-center">This bid has been rejected</p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Message Modal */}
      {showMessageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">
                {messageForm.action === "considering" && "Mark as Considering"}
                {messageForm.action === "accepted" && "Accept Bid"}
                {messageForm.action === "rejected" && "Reject Bid"}
              </h3>
              <button
                onClick={() => {
                  setShowMessageModal(false)
                  setMessageForm({ bidId: 0, action: "", message: "" })
                  setActionMessage(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {actionMessage && (
              <div
                className={`mb-4 p-4 rounded-lg ${
                  actionMessage.type === "success"
                    ? "bg-green-50 border border-green-200"
                    : "bg-red-50 border border-red-200"
                }`}
              >
                <p
                  className={`text-sm font-medium ${
                    actionMessage.type === "success" ? "text-green-800" : "text-red-800"
                  }`}
                >
                  {actionMessage.text}
                </p>
              </div>
            )}

            <p className="text-gray-600 mb-4">
              {messageForm.action === "accepted" && "Send a message to the contractor (required):"}
              {messageForm.action === "considering" && "Optionally send a message to the contractor:"}
              {messageForm.action === "rejected" && "Optionally send a message to the contractor:"}
            </p>

            <textarea
              value={messageForm.message}
              onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
              placeholder={
                messageForm.action === "accepted"
                  ? "Congratulations! I'd like to move forward with your bid. Please contact me at..."
                  : messageForm.action === "considering"
                    ? "Your bid looks promising. I have a few questions..."
                    : "Thank you for your bid, but we've decided to go with another contractor."
              }
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent resize-none"
              rows={4}
              disabled={updatingBidId !== null}
            />

            {messageForm.action === "accepted" && !messageForm.message.trim() && (
              <p className="text-sm text-red-600 mt-2">Message is required when accepting a bid</p>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowMessageModal(false)
                  setMessageForm({ bidId: 0, action: "", message: "" })
                  setActionMessage(null)
                }}
                disabled={updatingBidId !== null}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={submitBidActionWithMessage}
                disabled={updatingBidId !== null || (messageForm.action === "accepted" && !messageForm.message.trim())}
                className={`flex-1 px-4 py-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                  messageForm.action === "considering"
                    ? "bg-yellow-500 text-white hover:bg-yellow-600"
                    : messageForm.action === "accepted"
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "bg-red-500 text-white hover:bg-red-600"
                }`}
              >
                {updatingBidId !== null ? "Updating..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && missionToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/98 backdrop-blur-sm rounded-xl max-w-md w-full p-6">
            {deleteSuccess ? (
              <>
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">Job Deleted Successfully!</h2>
                <p className="text-gray-600 text-center">The job posting has been removed.</p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Delete Job Posting?</h2>
                <p className="text-gray-600 mb-6">
                  Are you sure you want to delete "{missionToDelete.title}"? This action cannot be undone.
                  {missionToDelete.bids_count > 0 && (
                    <span className="block mt-2 text-red-600 font-semibold">
                      Warning: This job has {missionToDelete.bids_count} bid(s). Deleting will remove all associated
                      bids.
                    </span>
                  )}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowDeleteConfirm(false)
                      setMissionToDelete(null)
                    }}
                    disabled={deletingMissionId !== null}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => handleDeleteMission(missionToDelete.id)}
                    disabled={deletingMissionId !== null}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {deletingMissionId === missionToDelete.id ? "Deleting..." : "Delete Job"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {previewImage && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            <button
              onClick={() => setPreviewImage(null)}
              className="absolute -top-10 right-0 p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
            <img
              src={previewImage || "/placeholder.svg"}
              alt="Preview"
              className="max-w-full max-h-[90vh] rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Reviews Modal */}
      {showReviewsModal && selectedContractorReviews && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4"
          onClick={() => setShowReviewsModal(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-2xl font-bold text-gray-900">{selectedContractorReviews.company_name} Reviews</h2>
              <button
                onClick={() => setShowReviewsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <ReviewsModalContent contractorId={selectedContractorReviews.contractor_id} />
            </div>
          </div>
        </div>
      )}

      {showDetailsInfoModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowDetailsInfoModal(false)}
        >
          <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2">
                <Info className="h-6 w-6 text-red-600" />
                <h3 className="text-lg font-bold text-gray-900">Requests for More Details</h3>
              </div>
              <button
                onClick={() => setShowDetailsInfoModal(false)}
                className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <p className="text-gray-700 leading-relaxed">
              Receiving Requests for More Details means Contractors are unable to provide a bid on your job with the
              details you've posted. If the number is greater than 0, please add more details to your post to help
              contractors provide accurate quotes.
            </p>
            <button
              onClick={() => setShowDetailsInfoModal(false)}
              className="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
