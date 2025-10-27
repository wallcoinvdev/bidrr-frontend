"use client"

import { useState, useEffect } from "react"
import { Star, ExternalLink } from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface ReviewsModalContentProps {
  contractorId: number
}

export function ReviewsModalContent({ contractorId }: ReviewsModalContentProps) {
  const [reviewStats, setReviewStats] = useState({
    homeHero: { count: 0, average: 0, reviews: [] as any[] },
    google: { count: 0, average: 0, reviews: [] as any[] },
    totalAverage: 0,
  })
  const [showGoogleReviews, setShowGoogleReviews] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        // Fetch contractor profile to get Google reviews
        const profile = await apiClient.request<any>(`/api/contractors/${contractorId}`, {
          requiresAuth: true,
        })

        // Fetch HomeHero reviews
        const homeHeroReviews = await apiClient.request<any[]>(`/api/contractors/${contractorId}/reviews`, {
          requiresAuth: true,
        })

        let homeHeroAvg = 0
        const homeHeroCount = homeHeroReviews.length

        if (homeHeroCount > 0) {
          const totalRating = homeHeroReviews.reduce((sum: number, review: any) => sum + review.rating, 0)
          homeHeroAvg = totalRating / homeHeroCount
        }

        let googleAvg = 0
        let googleCount = 0
        let googleReviewsList: any[] = []

        if (profile.review_sites && Array.isArray(profile.review_sites)) {
          const googleSite = profile.review_sites.find(
            (site: any) => site.site === "google" || site.url?.includes("google.com/maps"),
          )

          if (googleSite) {
            googleAvg = googleSite.rating || 0
            googleCount = googleSite.review_count || 0
            googleReviewsList = googleSite.reviews || []
          }
        }

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
          homeHero: { count: homeHeroCount, average: homeHeroAvg, reviews: homeHeroReviews },
          google: { count: googleCount, average: googleAvg, reviews: googleReviewsList },
          totalAverage: totalAvg,
        })
      } catch (error) {
        console.error("Error fetching reviews:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchReviews()
  }, [contractorId])

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Loading reviews...</p>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <h3 className="font-semibold text-gray-900 text-sm">HomeHero Reviews</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {reviewStats.homeHero.count > 0 ? reviewStats.homeHero.average.toFixed(1) : "—"}
          </p>
          <p className="text-xs text-gray-500 mt-1">{reviewStats.homeHero.count} reviews</p>
        </div>

        <button
          onClick={() => setShowGoogleReviews(!showGoogleReviews)}
          className="bg-white rounded-lg p-4 border border-gray-200 hover:border-[#328d87] transition-colors text-left"
          disabled={reviewStats.google.count === 0}
        >
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <h3 className="font-semibold text-gray-900 text-sm">Google Reviews</h3>
            <ExternalLink className="h-3 w-3 text-gray-400 ml-auto" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {reviewStats.google.count > 0 ? reviewStats.google.average.toFixed(1) : "—"}
          </p>
          <p className="text-xs text-gray-500 mt-1">{reviewStats.google.count} reviews</p>
        </button>

        <div className="bg-gradient-to-br from-yellow-50 to-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
            <h3 className="font-semibold text-gray-900 text-sm">Total Average</h3>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {reviewStats.totalAverage > 0 ? reviewStats.totalAverage.toFixed(1) : "—"}
          </p>
          <p className="text-xs text-gray-500 mt-1">All platforms</p>
        </div>
      </div>

      {showGoogleReviews && reviewStats.google.reviews.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Recent Google Reviews</h3>
          <div className="space-y-4">
            {reviewStats.google.reviews.slice(0, 3).map((review: any, index: number) => (
              <div key={index} className="bg-white rounded-lg p-4 border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                    />
                  ))}
                  <span className="text-xs text-gray-600">
                    {review.time ? new Date(review.time * 1000).toLocaleDateString() : ""}
                  </span>
                </div>
                <p className="text-sm text-gray-900 font-medium mb-1">{review.author_name}</p>
                <p className="text-sm text-gray-600">{review.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {reviewStats.homeHero.reviews.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h3 className="font-semibold text-gray-900 mb-4">Recent HomeHero Reviews</h3>
          <div className="space-y-4">
            {reviewStats.homeHero.reviews.slice(0, 3).map((review: any) => (
              <div key={review.id} className="bg-white rounded-lg p-4 border border-gray-100">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{review.reviewer_name}</p>
                    <p className="text-xs text-gray-500">
                      {review.mission_title} • {review.mission_service}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                      />
                    ))}
                  </div>
                </div>
                {review.comment && <p className="text-sm text-gray-700 mb-2">{review.comment}</p>}
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
        </div>
      )}
    </>
  )
}
