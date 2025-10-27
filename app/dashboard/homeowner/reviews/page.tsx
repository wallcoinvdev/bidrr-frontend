"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Star, X, Loader2, Pencil, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import Image from "next/image"

interface AcceptedBid {
  id: number
  mission_id: number
  contractor_id: number
  quote: number
  status: string
  created_at: string
  contractor_name: string
  company_name: string
  logo_url: string | null
  business_address: string
  business_city: string
  business_region: string
  mission_title: string
  mission_service: string
  mission_completed_date?: string
  has_reviewed: boolean
  customer_review?: {
    id?: number
    rating: number
    comment: string
    created_at: string
  }
}

export default function ReviewsPage() {
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [reviewToDelete, setReviewToDelete] = useState<AcceptedBid | null>(null)
  const [selectedBid, setSelectedBid] = useState<AcceptedBid | null>(null)
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [reviewText, setReviewText] = useState("")
  const [acceptedBids, setAcceptedBids] = useState<AcceptedBid[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchAcceptedBids()
  }, [])

  const fetchAcceptedBids = async () => {
    try {
      setLoading(true)

      const bids = await apiClient.request("/api/homeowner/accepted-bids", {
        method: "GET",
        requiresAuth: true,
      })
      console.log("[v0] Accepted bids fetched:", bids)

      const transformedBids = bids.map((bid: any) => ({
        ...bid,
        customer_review:
          bid.has_reviewed && bid.review_rating
            ? {
                rating: bid.review_rating,
                comment: bid.review_comment || "",
                created_at: bid.review_created_at || bid.created_at,
                id: bid.review_id, // Assuming review_id is available in the response
              }
            : undefined,
      }))

      setAcceptedBids(transformedBids)
    } catch (error) {
      console.error("[v0] Error fetching accepted bids:", error)
    } finally {
      setLoading(false)
    }
  }

  const reviewsMade = acceptedBids.filter((bid) => bid.has_reviewed).length

  const handleLeaveReview = (bid: AcceptedBid) => {
    setSelectedBid(bid)
    setIsEditMode(false)
    setShowReviewModal(true)
    setRating(0)
    setReviewText("")
  }

  const handleEditReview = (bid: AcceptedBid) => {
    setSelectedBid(bid)
    setIsEditMode(true)
    setShowReviewModal(true)
    setRating(bid.customer_review?.rating || 0)
    setReviewText(bid.customer_review?.comment || "")
  }

  const handleDeleteClick = (bid: AcceptedBid) => {
    setReviewToDelete(bid)
    setShowDeleteConfirm(true)
  }

  const handleDeleteReview = async () => {
    if (!reviewToDelete || !reviewToDelete.customer_review?.id) return

    try {
      setSubmitting(true)
      await apiClient.request(`/api/reviews?review_id=${reviewToDelete.customer_review.id}`, {
        method: "DELETE",
        requiresAuth: true,
      })
      console.log("[v0] Review deleted successfully")

      setAcceptedBids((prevBids) =>
        prevBids.map((bid) =>
          bid.id === reviewToDelete.id
            ? {
                ...bid,
                has_reviewed: false,
                customer_review: undefined,
              }
            : bid,
        ),
      )

      setShowDeleteConfirm(false)
      setReviewToDelete(null)
    } catch (error: any) {
      console.error("[v0] Error deleting review:", error)
      alert("Failed to delete review. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  const handleSubmitReview = async () => {
    if (!selectedBid || rating === 0 || reviewText.trim() === "") return

    try {
      setSubmitting(true)

      if (isEditMode) {
        if (!selectedBid.customer_review?.id) {
          throw new Error("Review ID not found")
        }

        await apiClient.request("/api/reviews", {
          method: "PUT",
          body: JSON.stringify({
            review_id: selectedBid.customer_review.id,
            rating,
            comment: reviewText,
          }),
          requiresAuth: true,
        })
        console.log("[v0] Review updated successfully")
      } else {
        await apiClient.request("/api/reviews", {
          method: "POST",
          body: JSON.stringify({
            contractor_id: selectedBid.contractor_id,
            mission_id: selectedBid.mission_id,
            bid_id: selectedBid.id,
            rating,
            comment: reviewText,
          }),
          requiresAuth: true,
        })
        console.log("[v0] Review submitted successfully")
      }

      setAcceptedBids((prevBids) =>
        prevBids.map((bid) =>
          bid.id === selectedBid.id
            ? {
                ...bid,
                has_reviewed: true,
                customer_review: {
                  id: bid.customer_review?.id,
                  rating,
                  comment: reviewText,
                  created_at: bid.customer_review?.created_at || new Date().toISOString(),
                },
              }
            : bid,
        ),
      )

      setShowReviewModal(false)
      setSelectedBid(null)
      setIsEditMode(false)
      setRating(0)
      setReviewText("")
    } catch (error: any) {
      console.error("[v0] Error submitting review:", error)
      if (error?.message?.includes("already submitted")) {
        alert("You have already submitted a review for this contractor. Each job can only be reviewed once.")
        setShowReviewModal(false)
        fetchAcceptedBids()
      } else {
        alert(`Failed to ${isEditMode ? "update" : "submit"} review. Please try again.`)
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardLayout userRole="homeowner">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Reviews</h1>
            <p className="text-gray-600 mt-2">Review contractors you've hired</p>
          </div>
        </div>

        {/* Reviews Made Card */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 w-fit">
          <div className="flex items-center gap-2 mb-2">
            <Star className="h-5 w-5 text-yellow-500 fill-yellow-500" />
            <h3 className="font-semibold text-gray-900">Reviews Made</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900">{reviewsMade}</p>
          <p className="text-sm text-gray-500 mt-1">Total reviews submitted</p>
        </div>

        {/* Contractors List */}
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Contractors You've Hired</h2>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : acceptedBids.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No contractors to review yet</p>
              <p className="text-sm text-gray-400 mt-2">
                Accept a contractor's bid and complete a job to leave a review
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {acceptedBids.map((bid) => (
                <div key={bid.id} className="border border-gray-200 rounded-lg p-4 md:p-6">
                  <div className="flex md:hidden items-start justify-between gap-3 mb-3">
                    {bid.logo_url && (
                      <div className="w-16 h-16 relative flex-shrink-0">
                        <Image
                          src={bid.logo_url || "/placeholder.svg"}
                          alt={bid.company_name}
                          fill
                          className="object-contain rounded-lg"
                        />
                      </div>
                    )}
                    <div className="flex-shrink-0">
                      {!bid.has_reviewed ? (
                        <button
                          onClick={() => handleLeaveReview(bid)}
                          className="px-3 py-2 bg-[#328d87] text-white text-sm rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
                        >
                          Leave Review
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEditReview(bid)}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                            title="Edit review"
                          >
                            <Pencil className="h-4 w-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(bid)}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete review"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="md:hidden mb-3">
                    <h3 className="text-lg font-bold text-gray-900">{bid.company_name}</h3>
                  </div>

                  <div className="md:hidden space-y-1 mb-4">
                    <p className="text-sm text-gray-600">{bid.mission_title}</p>
                    <p className="text-sm text-gray-500">{bid.mission_service}</p>
                    {bid.mission_completed_date && (
                      <p className="text-sm text-gray-500">
                        Completed: {new Date(bid.mission_completed_date).toLocaleDateString()}
                      </p>
                    )}
                    <p className="text-sm text-gray-500">
                      {bid.business_address}, {bid.business_city}, {bid.business_region}
                    </p>
                  </div>

                  <div className="hidden md:flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      {bid.logo_url && (
                        <div className="w-16 h-16 relative flex-shrink-0">
                          <Image
                            src={bid.logo_url || "/placeholder.svg"}
                            alt={bid.company_name}
                            fill
                            className="object-contain rounded-lg"
                          />
                        </div>
                      )}
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{bid.company_name}</h3>
                        <p className="text-sm text-gray-600">{bid.mission_title}</p>
                        <p className="text-sm text-gray-500">{bid.mission_service}</p>
                        {bid.mission_completed_date && (
                          <p className="text-sm text-gray-500">
                            Completed: {new Date(bid.mission_completed_date).toLocaleDateString()}
                          </p>
                        )}
                        <p className="text-sm text-gray-500 mt-1">
                          {bid.business_address}, {bid.business_city}, {bid.business_region}
                        </p>
                      </div>
                    </div>
                    {!bid.has_reviewed && (
                      <button
                        onClick={() => handleLeaveReview(bid)}
                        className="px-4 py-2 bg-[#328d87] text-white rounded-lg hover:opacity-90 transition-opacity whitespace-nowrap"
                      >
                        Leave Review
                      </button>
                    )}
                  </div>

                  {bid.has_reviewed && bid.customer_review && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-gray-700">Your Review:</p>
                        <div className="hidden md:flex items-center gap-2">
                          <button
                            onClick={() => handleEditReview(bid)}
                            className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                            title="Edit review"
                          >
                            <Pencil className="h-4 w-4 text-gray-600" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(bid)}
                            className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                            title="Delete review"
                          >
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${i < bid.customer_review!.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`}
                          />
                        ))}
                        <span className="text-sm text-gray-500 ml-2">
                          {new Date(bid.customer_review.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700 break-words">{bid.customer_review.comment}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showReviewModal && selectedBid && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-lg w-full">
            <div className="border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">{isEditMode ? "Edit Review" : "Leave a Review"}</h2>
              <button
                onClick={() => {
                  setShowReviewModal(false)
                  setIsEditMode(false)
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-start gap-4 pb-4 border-b border-gray-200">
                {selectedBid.logo_url && (
                  <div className="w-16 h-16 relative flex-shrink-0">
                    <Image
                      src={selectedBid.logo_url || "/placeholder.svg"}
                      alt={selectedBid.company_name}
                      fill
                      className="object-contain rounded-lg"
                    />
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600 mb-1">Contractor</p>
                  <p className="text-lg font-semibold text-gray-900">{selectedBid.company_name}</p>
                  <p className="text-sm text-gray-600">
                    {selectedBid.business_address}, {selectedBid.business_city}
                  </p>
                </div>
              </div>

              <div className="pb-4 border-b border-gray-200">
                <p className="text-sm text-gray-600 mb-1">Job</p>
                <p className="text-lg font-semibold text-gray-900">{selectedBid.mission_title}</p>
                <p className="text-sm text-gray-600">{selectedBid.mission_service}</p>
                <p className="text-sm text-gray-500">Bid Amount: ${selectedBid.quote.toFixed(2)}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Your Rating</label>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoveredRating(star)}
                      onMouseLeave={() => setHoveredRating(0)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`h-10 w-10 ${
                          star <= (hoveredRating || rating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                  {rating > 0 && <span className="ml-2 text-lg font-semibold text-gray-900">{rating}/5</span>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Your Review</label>
                <textarea
                  rows={5}
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience with this contractor..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent resize-none"
                />
              </div>

              <button
                onClick={handleSubmitReview}
                disabled={rating === 0 || reviewText.trim() === "" || submitting}
                className="w-full bg-[#328d87] text-white py-3 rounded-lg hover:opacity-90 transition-opacity font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="h-5 w-5 animate-spin" />}
                {submitting
                  ? isEditMode
                    ? "Updating..."
                    : "Submitting..."
                  : isEditMode
                    ? "Update Review"
                    : "Submit Review"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && reviewToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Delete Review?</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete your review for {reviewToDelete.company_name}? This action cannot be
              undone.
            </p>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false)
                  setReviewToDelete(null)
                }}
                disabled={submitting}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteReview}
                disabled={submitting}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {submitting && <Loader2 className="h-5 w-5 animate-spin" />}
                {submitting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}
