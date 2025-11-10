"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Star, X } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

function GoogleReviewsModal({
  isOpen,
  onClose,
  reviews,
  isLoading,
}: { isOpen: boolean; onClose: () => void; reviews: any[]; isLoading?: boolean }) {
  if (!isOpen) return null

  console.log("[v0] Modal isOpen:", isOpen, "reviews count:", reviews.length)

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Google Reviews</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {isLoading ? (
            <p className="text-center text-gray-500 py-8">Loading Google reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No Google reviews yet</p>
          ) : (
            reviews.slice(0, 3).map((review, index) => (
              <div key={index} className="border-b border-gray-100 pb-6 last:border-b-0">
                <div className="flex items-center gap-2 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                    />
                  ))}
                  <span className="text-sm text-gray-600">
                    {review.time
                      ? new Date(review.time * 1000).toLocaleDateString()
                      : review.created_at
                        ? new Date(review.created_at).toLocaleDateString()
                        : ""}
                  </span>
                </div>
                <p className="text-gray-900 font-medium mb-2">{review.author_name || review.reviewer_name}</p>
                <p className="text-gray-600 text-sm">{review.text || review.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default function ReviewsPage() {
  const { toast } = useToast()

  const [reviewStats, setReviewStats] = useState({
    bidrr: { count: 0, average: 0 },
    google: { count: 0, average: 0 },
    totalAverage: 0,
  })
  const [googleReviews, setGoogleReviews] = useState<any[]>([])
  const [bidrrReviews, setBidrrReviews] = useState<any[]>([])
  const [showGoogleModal, setShowGoogleModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [googlePlaceId, setGooglePlaceId] = useState<string | null>(null)
  const [contractorId, setContractorId] = useState<number | null>(null)
  const [loadingGoogleReviews, setLoadingGoogleReviews] = useState(false)

  useEffect(() => {
    const markReviewNotificationsAsRead = async () => {
      try {
        const notifications = await apiClient.request<any[]>("/api/notifications", {
          requiresAuth: true,
        })

        const unreadReviewNotifications = notifications.filter((n) => n.type === "new_review" && !n.is_read)

        for (const notification of unreadReviewNotifications) {
          await apiClient.request(`/api/notifications/${notification.id}/mark-read`, {
            method: "PUT",
            requiresAuth: true,
          })
        }

        if (unreadReviewNotifications.length > 0) {
          window.dispatchEvent(new Event("notificationUpdated"))
        }
      } catch (error) {
        console.error("Error marking review notifications as read:", error)
      }
    }

    markReviewNotificationsAsRead()
  }, [])

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const profile = await apiClient.request<any>("/api/users/profile", {
          requiresAuth: true,
        })

        console.log("[v0] Profile data:", profile)

        if (profile.google_places_id) {
          setGooglePlaceId(profile.google_places_id)
        }

        const contractorIdValue = profile.id
        setContractorId(contractorIdValue)

        const allReviewsData = await apiClient.request<any>(`/api/contractors/${contractorIdValue}/reviews`, {
          requiresAuth: true,
        })

        console.log("[v0] All reviews data from backend:", allReviewsData)

        const bidrrReviewsList = allReviewsData.reviews.filter((r: any) => r.source === "bidrr") || []
        setBidrrReviews(bidrrReviewsList)

        const googleReviewsList = allReviewsData.reviews.filter((r: any) => r.source === "google") || []
        setGoogleReviews(googleReviewsList)

        console.log("[v0] Google reviews from database:", googleReviewsList)
        console.log("[v0] Bidrr reviews from database:", bidrrReviewsList)

        // Calculate averages
        const bidrrCount = bidrrReviewsList.length
        const bidrrAvg =
          bidrrCount > 0 ? bidrrReviewsList.reduce((sum: number, r: any) => sum + r.rating, 0) / bidrrCount : 0

        const googleAvg = Number.parseFloat(allReviewsData.google_rating) || 0
        const googleCount = googleReviewsList.length || Number.parseInt(allReviewsData.google_review_count) || 0

        let totalAvg = 0
        if (googleAvg > 0 && bidrrAvg > 0) {
          // Both platforms have ratings
          totalAvg = (googleAvg + bidrrAvg) / 2
        } else if (googleAvg > 0) {
          // Only Google has ratings
          totalAvg = googleAvg
        } else if (bidrrAvg > 0) {
          // Only Bidrr has ratings
          totalAvg = bidrrAvg
        }

        setReviewStats({
          bidrr: { count: bidrrCount, average: bidrrAvg },
          google: { count: googleCount, average: googleAvg },
          totalAverage: totalAvg,
        })

        console.log("[v0] Review stats set:", {
          bidrr: { count: bidrrCount, average: bidrrAvg },
          google: { count: googleCount, average: googleAvg },
          totalAverage: totalAvg,
        })
      } catch (error: any) {
        console.error("Error fetching reviews:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReviews()
  }, [])

  const handleGoogleCardClick = async () => {
    console.log("[v0] Google card clicked!")
    console.log("[v0] Google average:", reviewStats.google.average)
    console.log("[v0] Google reviews count:", googleReviews.length)
    console.log("[v0] Google reviews:", googleReviews)

    if (reviewStats.google.average === 0) {
      console.log("[v0] Returning early - no rating")
      return
    }

    if (googleReviews.length === 0 && reviewStats.google.average > 0) {
      console.log("[v0] Showing toast - reviews need syncing")
      toast({
        title: "Reviews Need Syncing",
        description:
          "Your Google rating is connected, but individual reviews need to be synced. Please reconnect your Google Business URL in Settings → Profile.",
        variant: "destructive",
      })
      return
    }

    console.log("[v0] Opening modal with", googleReviews.length, "reviews")
    setShowGoogleModal(true)
  }

  return (
    <DashboardLayout userRole="contractor">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reviews</h1>
          <p className="text-gray-600 mt-2">Your customer feedback across all platforms</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={handleGoogleCardClick}
            className="bg-white rounded-xl p-6 border border-gray-200 hover:border-[#328d87] transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={reviewStats.google.average === 0}
          >
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <h3 className="font-semibold text-gray-900">Google Reviews</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {reviewStats.google.average > 0 ? reviewStats.google.average.toFixed(1) : "—"}
            </p>
            <p className="text-sm text-gray-500 mt-1">{reviewStats.google.count} reviews</p>
          </button>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <h3 className="font-semibold text-gray-900">Bidrr Reviews</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {reviewStats.bidrr.average > 0 ? reviewStats.bidrr.average.toFixed(1) : "—"}
            </p>
            <p className="text-sm text-gray-500 mt-1">{reviewStats.bidrr.count} reviews</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 bg-gradient-to-br from-yellow-50 to-white">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <h3 className="font-semibold text-gray-900">Total Average</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {reviewStats.totalAverage > 0 ? reviewStats.totalAverage.toFixed(1) : "—"}
            </p>
            <p className="text-xs text-gray-400 mt-1">Across all platforms</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Bidrr Reviews</h2>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading reviews...</p>
            </div>
          ) : bidrrReviews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Bidrr reviews will appear here</p>
              <p className="text-sm text-gray-400 mt-2">
                Reviews from customers who hired you through Bidrr will be displayed in this section.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {bidrrReviews.map((review) => (
                <div key={review.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-gray-900">{review.reviewer_name}</p>
                      <p className="text-sm text-gray-500">
                        {review.mission_title} • {review.mission_service}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && <p className="text-gray-700 mb-2">{review.comment}</p>}
                  <p className="text-xs text-gray-400">
                    {new Date(review.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <GoogleReviewsModal
        isOpen={showGoogleModal}
        onClose={() => setShowGoogleModal(false)}
        reviews={googleReviews}
        isLoading={loadingGoogleReviews}
      />
    </DashboardLayout>
  )
}
