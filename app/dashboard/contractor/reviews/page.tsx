"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Star, X } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { usePageTitle } from "@/hooks/use-page-title"

function GoogleReviewsModal({
  isOpen,
  onClose,
  reviews,
  isLoading,
}: {
  isOpen: boolean
  onClose: () => void
  reviews: any[]
  isLoading?: boolean
}) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Google Reviews</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <p className="text-center py-12 text-gray-500">Loading Google reviews...</p>
          ) : reviews.length === 0 ? (
            <p className="text-center py-12 text-gray-500">No Google reviews yet</p>
          ) : (
            reviews.slice(0, 3).map((review, index) => (
              <div key={index} className="mb-6 pb-6 border-b border-gray-200 last:border-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-600">
                    {review.time
                      ? new Date(review.time * 1000).toLocaleDateString()
                      : review.created_at
                        ? new Date(review.created_at).toLocaleDateString()
                        : ""}
                  </span>
                </div>
                <p className="font-semibold text-gray-900 mb-2">{review.author_name || review.reviewer_name}</p>
                <p className="text-gray-700">{review.text || review.comment}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default function ReviewsPage() {
  usePageTitle("Reviews")

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
  const [loadingGoogleReviews, setLoadingGoogleReviews] = useState(false)

  useEffect(() => {
    const markReviewNotificationsAsRead = async () => {
      try {
        const notifications = await apiClient.request<any[]>("/api/notifications", {
          requiresAuth: true,
        })

        const unreadReviewNotifications = notifications.filter((n) => n.type === "new_review" && !n.is_read)

        if (unreadReviewNotifications.length === 0) {
          return
        }

        window.dispatchEvent(
          new CustomEvent("reviewsPageViewed", {
            detail: { count: unreadReviewNotifications.length },
          }),
        )

        await Promise.allSettled(
          unreadReviewNotifications.map(async (notification) => {
            try {
              await apiClient.request(`/api/notifications/${notification.id}/mark-read`, {
                method: "POST",
                requiresAuth: true,
              })
            } catch (error: any) {
              // Silently ignore errors - user has viewed the page
            }
          }),
        )
      } catch (error) {
        // Silently fail - don't disrupt user experience
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

        const contractorIdValue = profile.id

        const allReviewsData = await apiClient.request<any>(`/api/contractors/${contractorIdValue}/reviews`, {
          requiresAuth: true,
        })

        const bidrrReviewsList = allReviewsData.reviews.filter((r: any) => r.source === "homehero") || []
        setBidrrReviews(bidrrReviewsList)

        const googleReviewsList = allReviewsData.reviews.filter((r: any) => r.source === "google") || []
        setGoogleReviews(googleReviewsList)

        const bidrrCount = bidrrReviewsList.length
        const bidrrAvg =
          bidrrCount > 0 ? bidrrReviewsList.reduce((sum: number, r: any) => sum + r.rating, 0) / bidrrCount : 0

        const googleAvg = Number.parseFloat(allReviewsData.google_rating) || 0
        const googleCount = Number.parseInt(allReviewsData.google_review_count) || 0

        let totalAvg = 0
        if (googleAvg > 0 && bidrrAvg > 0) {
          totalAvg = (googleAvg + bidrrAvg) / 2
        } else if (googleAvg > 0) {
          totalAvg = googleAvg
        } else if (bidrrAvg > 0) {
          totalAvg = bidrrAvg
        }

        setReviewStats({
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
    if (reviewStats.google.average === 0) {
      return
    }

    if (googleReviews.length === 0 && reviewStats.google.average > 0) {
      toast({
        title: "Reviews Need Syncing",
        description:
          "Your Google rating is connected, but individual reviews need to be synced. Please reconnect your Google Business URL in Profile.",
        variant: "destructive",
      })
      return
    }

    setShowGoogleModal(true)
  }

  return (
    <DashboardLayout userRole="contractor">
      <div className="min-h-screen bg-gray-50 p-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reviews</h1>
          <p className="text-gray-600 mt-2">Your customer feedback across all platforms</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div
            onClick={handleGoogleCardClick}
            className={`bg-white p-6 rounded-xl shadow-sm border border-gray-200 ${
              reviewStats.google.average > 0 ? "cursor-pointer hover:shadow-md transition-shadow" : ""
            }`}
          >
            <div className="flex items-center gap-2 text-gray-700 mb-3">
              <Star className="w-5 h-5 text-yellow-500" />
              <h3 className="font-semibold">Google Reviews</h3>
            </div>
            <p className="text-4xl font-bold text-gray-900">
              {reviewStats.google.average > 0 ? reviewStats.google.average.toFixed(1) : "—"}
            </p>
            <p className="text-sm text-gray-600 mt-2">{reviewStats.google.count} reviews</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 text-gray-700 mb-3">
              <Star className="w-5 h-5 text-yellow-500" />
              <h3 className="font-semibold">Bidrr Reviews</h3>
            </div>
            <p className="text-4xl font-bold text-gray-900">
              {reviewStats.bidrr.average > 0 ? reviewStats.bidrr.average.toFixed(1) : "—"}
            </p>
            <p className="text-sm text-gray-600 mt-2">{reviewStats.bidrr.count} reviews</p>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 text-gray-700 mb-3">
              <Star className="w-5 h-5 text-yellow-500" />
              <h3 className="font-semibold">Total Average</h3>
            </div>
            <p className="text-4xl font-bold text-gray-900">
              {reviewStats.totalAverage > 0 ? reviewStats.totalAverage.toFixed(1) : "—"}
            </p>
            <p className="text-sm text-gray-600 mt-2">Across all platforms</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
          <h2 className="text-xl font-bold mb-4">Recent Bidrr Reviews</h2>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading reviews...</p>
            </div>
          ) : bidrrReviews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg font-medium">Bidrr reviews will appear here</p>
              <p className="text-gray-400 mt-2">
                Reviews from customers who hired you through Bidrr will be displayed in this section.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {bidrrReviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{review.reviewer_name}</p>
                      <p className="text-sm text-gray-600">
                        {review.mission_title} • {review.mission_service}
                      </p>
                    </div>
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  {review.comment && <p className="mt-3 text-gray-700">{review.comment}</p>}
                  <p className="mt-2 text-xs text-gray-500">
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
