"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Star, X } from "lucide-react"
import { apiClient } from "@/lib/api-client"

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.bidrr.ca"

function GoogleReviewsModal({ isOpen, onClose, reviews }: { isOpen: boolean; onClose: () => void; reviews: any[] }) {
  if (!isOpen) return null

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
          {reviews.length === 0 ? (
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
                    {review.time ? new Date(review.time * 1000).toLocaleDateString() : ""}
                  </span>
                </div>
                <p className="text-gray-900 font-medium mb-2">{review.author_name}</p>
                <p className="text-gray-600 text-sm">{review.text}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default function ReviewsPage() {
  const [reviewStats, setReviewStats] = useState({
    homeHero: { count: 0, average: 0 },
    google: { count: 0, average: 0 },
    totalAverage: 0,
  })
  const [googleReviews, setGoogleReviews] = useState<any[]>([])
  const [homeHeroReviews, setHomeHeroReviews] = useState<any[]>([])
  const [showGoogleModal, setShowGoogleModal] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<any | null>(null)

  const fetchProfile = async (retryCount = 0): Promise<any> => {
    const token = localStorage.getItem("token")

    if (!token && retryCount === 0) {
      console.log("[v0] No token found, attempting login...")
      // Try to login with dev credentials
      try {
        const loginResponse = await fetch(`${BASE_URL}/api/users/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            email: "dev@wallcoinv.com",
            password: "123456",
            remember_me: true,
          }),
        })

        if (loginResponse.ok) {
          const loginData = await loginResponse.json()
          localStorage.setItem("token", loginData.token)
          console.log("[v0] Login successful, retrying profile fetch...")
          return fetchProfile(1)
        }
      } catch (error) {
        console.error("[v0] Login failed:", error)
        throw new Error("Authentication failed")
      }
    }

    const currentToken = localStorage.getItem("token")
    if (!currentToken) {
      throw new Error("No authentication token available")
    }

    try {
      const response = await fetch(`${BASE_URL}/api/users/profile`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${currentToken}`,
          "ngrok-skip-browser-warning": "true",
        },
      })

      if (response.status === 401 && retryCount === 0) {
        console.log("[v0] 401 error, attempting to refresh token...")
        // Try to login again
        const loginResponse = await fetch(`${BASE_URL}/api/users/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "ngrok-skip-browser-warning": "true",
          },
          body: JSON.stringify({
            email: "dev@wallcoinv.com",
            password: "123456",
            remember_me: true,
          }),
        })

        if (loginResponse.ok) {
          const loginData = await loginResponse.json()
          localStorage.setItem("token", loginData.token)
          console.log("[v0] Token refreshed, retrying profile fetch...")
          return fetchProfile(1)
        } else {
          throw new Error("Token refresh failed")
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("[v0] Profile fetched successfully:", JSON.stringify(data, null, 2))
      return data
    } catch (error) {
      console.error("[v0] Error fetching profile:", error)
      throw error
    }
  }

  useEffect(() => {
    const markReviewNotificationsAsRead = async () => {
      try {
        const notifications = await apiClient.request<any[]>("/api/notifications", {
          requiresAuth: true,
        })

        // Find all unread "new_review" notifications
        const unreadReviewNotifications = notifications.filter((n) => n.type === "new_review" && !n.is_read)

        // Mark each one as read
        for (const notification of unreadReviewNotifications) {
          await apiClient.request(`/api/notifications/${notification.id}/mark-read`, {
            method: "PUT",
            requiresAuth: true,
          })
        }

        // Dispatch event to update badge counts
        if (unreadReviewNotifications.length > 0) {
          window.dispatchEvent(new Event("notificationUpdated"))
        }
      } catch (error) {
        console.error("[v0] Error marking review notifications as read:", error)
      }
    }

    markReviewNotificationsAsRead()
  }, [])

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const fetchedProfile = await fetchProfile()

        console.log("[v0] Review sites from backend:", fetchedProfile.review_sites)
        setProfile(fetchedProfile)

        let homeHeroReviewsList: any[] = []
        let homeHeroAvg = 0
        let homeHeroCount = 0

        try {
          homeHeroReviewsList = await apiClient.request<any[]>("/api/contractor/reviews", {
            requiresAuth: true,
          })
          console.log("[v0] homeHero reviews fetched:", homeHeroReviewsList)

          setHomeHeroReviews(homeHeroReviewsList)
          homeHeroCount = homeHeroReviewsList.length

          if (homeHeroCount > 0) {
            const totalRating = homeHeroReviewsList.reduce((sum, review) => sum + review.rating, 0)
            homeHeroAvg = totalRating / homeHeroCount
          }
        } catch (error) {
          console.error("[v0] Error fetching homeHero reviews:", error)
        }

        let googleAvg = 0
        let googleCount = 0
        let googleReviewsList: any[] = []

        if (fetchedProfile.review_sites && Array.isArray(fetchedProfile.review_sites)) {
          const googleSite = fetchedProfile.review_sites.find(
            (site: any) => site.site === "google" || site.url?.includes("google.com/maps"),
          )

          console.log("[v0] Google site found:", googleSite)

          if (googleSite) {
            googleAvg = googleSite.rating || 0
            googleCount = googleSite.review_count || 0
            googleReviewsList = googleSite.reviews || []

            console.log("[v0] Extracted Google data:", {
              rating: googleAvg,
              count: googleCount,
              reviews: googleReviewsList.length,
            })
          }
        }

        setGoogleReviews(googleReviewsList)

        let totalAvg = 0
        let totalCount = 0

        if (googleCount > 0) {
          totalAvg += googleAvg * googleCount
          totalCount += googleCount
        }

        if (homeHeroCount > 0) {
          totalAvg += homeHeroAvg * homeHeroCount
          totalCount += homeHeroCount
        }

        totalAvg = totalCount > 0 ? totalAvg / totalCount : 0

        setReviewStats({
          homeHero: { count: homeHeroCount, average: homeHeroAvg },
          google: { count: googleCount, average: googleAvg },
          totalAverage: totalAvg,
        })
      } catch (err) {
        console.error("[v0] Error fetching reviews:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReviews()
  }, [])

  return (
    <DashboardLayout userRole="contractor">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reviews</h1>
          <p className="text-gray-600 mt-2">Your customer feedback across all platforms</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <button
            onClick={() => setShowGoogleModal(true)}
            className="bg-white rounded-xl p-6 border border-gray-200 hover:border-[#328d87] transition-colors text-left"
            disabled={reviewStats.google.count === 0}
          >
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <h3 className="font-semibold text-gray-900">Google Reviews</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {reviewStats.google.count > 0 ? reviewStats.google.average.toFixed(1) : "—"}
            </p>
            <p className="text-sm text-gray-500 mt-1">{reviewStats.google.count} reviews</p>
          </button>

          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <h3 className="font-semibold text-gray-900">homeHero Reviews</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {reviewStats.homeHero.count > 0 ? reviewStats.homeHero.average.toFixed(1) : "—"}
            </p>
            <p className="text-sm text-gray-500 mt-1">{reviewStats.homeHero.count} reviews</p>
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 bg-gradient-to-br from-yellow-50 to-white">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
              <h3 className="font-semibold text-gray-900">Total Average</h3>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {reviewStats.totalAverage > 0 ? reviewStats.totalAverage.toFixed(1) : "—"}
            </p>
            <p className="text-sm text-gray-500 mt-1">Across all platforms</p>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Recent homeHero Reviews</h2>
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading reviews...</p>
            </div>
          ) : homeHeroReviews.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">homeHero reviews will appear here</p>
              <p className="text-sm text-gray-400 mt-2">
                Reviews from customers who hired you through homeHero will be displayed in this section.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {homeHeroReviews.map((review) => (
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

      <GoogleReviewsModal isOpen={showGoogleModal} onClose={() => setShowGoogleModal(false)} reviews={googleReviews} />
    </DashboardLayout>
  )
}
