"use client"

import { useState, useEffect } from "react"
import { Star, Trash2, Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { Card, CardContent } from "@/components/ui/card"
import { DashboardLayout } from "@/components/dashboard-layout"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { usePageTitle } from "@/hooks/use-page-title"

interface AcceptedBid {
  id: number
  mission_id: number
  contractor_id: number
  quote: number
  status: string
  created_at: string
  accepted_at: string
  contractor_name: string
  company_name: string
  logo_url?: string
  business_address: string
  business_city: string
  business_region: string
  business_postal_code: string
  mission_title: string
  mission_service: string
  mission_created_at: string
  has_reviewed: boolean
  review_id?: number
  review_rating?: number
  review_comment?: string
  review_created_at?: string
}

export default function ReviewsPage() {
  usePageTitle("Reviews")

  const [acceptedBids, setAcceptedBids] = useState<AcceptedBid[]>([])
  const [loading, setLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null)
  const { toast } = useToast()

  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [selectedBid, setSelectedBid] = useState<AcceptedBid | null>(null)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState("")
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    fetchAcceptedBids()
  }, [])

  const fetchAcceptedBids = async () => {
    try {
      const data = await apiClient.request<AcceptedBid[]>("/api/homeowner/accepted-bids", {
        method: "GET",
        requiresAuth: true,
      })
      setAcceptedBids(data)
    } catch (error) {
      console.error("Error fetching accepted bids:", error)
      toast({
        title: "Error",
        description: "Failed to load accepted bids",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (reviewId: number) => {
    setSelectedReviewId(reviewId)
    setDeleteDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!selectedReviewId) return

    try {
      await apiClient.request(`/api/reviews?review_id=${selectedReviewId}`, {
        method: "DELETE",
        requiresAuth: true,
      })

      setAcceptedBids(
        acceptedBids.map((bid) =>
          bid.review_id === selectedReviewId
            ? {
                ...bid,
                has_reviewed: false,
                review_id: undefined,
                review_rating: undefined,
                review_comment: undefined,
                review_created_at: undefined,
              }
            : bid,
        ),
      )

      toast({
        title: "Success",
        description: "Review deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting review:", error)
      toast({
        title: "Error",
        description: "Failed to delete review",
        variant: "destructive",
      })
    } finally {
      setDeleteDialogOpen(false)
      setSelectedReviewId(null)
    }
  }

  const handleLeaveReviewClick = (bid: AcceptedBid) => {
    setSelectedBid(bid)
    setReviewRating(0)
    setReviewComment("")
    setReviewModalOpen(true)
  }

  const handleSubmitReview = async () => {
    if (!selectedBid || reviewRating === 0) {
      toast({
        title: "Error",
        description: "Please select a rating",
        variant: "destructive",
      })
      return
    }

    setSubmittingReview(true)

    const payload = {
      contractor_id: selectedBid.contractor_id,
      bid_id: selectedBid.id,
      mission_id: selectedBid.mission_id, // Added mission_id to payload
      rating: reviewRating,
      comment: reviewComment,
    }
    console.log("[v0] Submitting review with payload:", payload)
    console.log("[v0] Selected bid data:", selectedBid)

    try {
      const response = await apiClient.request<{ review_id: number }>("/api/reviews", {
        method: "POST",
        requiresAuth: true,
        body: JSON.stringify(payload),
      })

      setAcceptedBids(
        acceptedBids.map((bid) =>
          bid.id === selectedBid.id
            ? {
                ...bid,
                has_reviewed: true,
                review_id: response.review_id,
                review_rating: reviewRating,
                review_comment: reviewComment,
                review_created_at: new Date().toISOString(),
              }
            : bid,
        ),
      )

      toast({
        title: "Success",
        description: "Review submitted successfully",
      })

      setReviewModalOpen(false)
      setSelectedBid(null)
      setReviewRating(0)
      setReviewComment("")
    } catch (error) {
      console.error("Error submitting review:", error)
      toast({
        title: "Error",
        description: "Failed to submit review",
        variant: "destructive",
      })
    } finally {
      setSubmittingReview(false)
    }
  }

  const reviewedBids = acceptedBids.filter((bid) => bid.has_reviewed)

  if (loading) {
    return (
      <DashboardLayout userRole="homeowner">
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#0F766E]" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="homeowner">
      <div className="max-w-6xl px-3 sm:px-0">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Reviews</h1>
          <p className="text-sm sm:text-base text-gray-600">Review contractors you've hired</p>
        </div>

        <Card className="mb-6">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-2 mb-2">
              <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
              <span className="text-sm sm:text-base font-semibold">Reviews Made</span>
            </div>
            <div className="text-3xl sm:text-4xl font-bold mb-1">{reviewedBids.length}</div>
            <div className="text-xs sm:text-sm text-gray-600">Total reviews submitted</div>
          </CardContent>
        </Card>

        <div>
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Contractors You've Hired</h2>

          {acceptedBids.length === 0 ? (
            <Card>
              <CardContent className="p-8 sm:p-12 text-center">
                <p className="text-sm sm:text-base text-gray-600">
                  No contractors hired yet. Accept bids to review contractors!
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {acceptedBids.map((bid) => (
                <Card key={bid.id}>
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row gap-4 items-start">
                      <div className="flex-shrink-0">
                        {bid.logo_url ? (
                          <img
                            src={bid.logo_url || "/placeholder.svg"}
                            alt={bid.company_name || bid.contractor_name}
                            className="w-16 h-16 rounded object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400 text-xs">No Logo</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-base sm:text-lg mb-1 break-words">
                          {bid.company_name || bid.contractor_name}
                        </h3>
                        <p className="text-sm text-gray-600 mb-1">{bid.mission_title}</p>
                        <p className="text-xs sm:text-sm text-gray-500 mb-1">{bid.mission_service}</p>
                        <p className="text-xs sm:text-sm text-gray-500 mb-4 break-words">
                          {bid.business_address}, {bid.business_city}, {bid.business_region}
                        </p>

                        {bid.has_reviewed ? (
                          <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                            <div className="flex items-center justify-between mb-2 gap-2">
                              <span className="text-xs sm:text-sm font-medium text-gray-700">Your Review:</span>
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleDeleteClick(bid.review_id!)}
                                  className="text-red-600 hover:text-red-700 p-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`w-4 h-4 sm:w-5 sm:h-5 ${
                                      star <= (bid.review_rating || 0)
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "fill-gray-200 text-gray-200"
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="text-xs sm:text-sm text-gray-600">
                                {bid.review_created_at ? new Date(bid.review_created_at).toLocaleDateString() : ""}
                              </span>
                            </div>

                            <p className="text-sm sm:text-base text-gray-700 break-words">{bid.review_comment}</p>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleLeaveReviewClick(bid)}
                            className="inline-block bg-[#0F766E] hover:bg-[#0F766E]/90 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                          >
                            Leave Review
                          </button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Review</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this review? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Leave a Review</DialogTitle>
            <DialogDescription>
              {selectedBid && (
                <>
                  Share your experience with{" "}
                  <span className="font-medium text-gray-900">
                    {selectedBid.company_name || selectedBid.contractor_name}
                  </span>{" "}
                  for <span className="font-medium text-gray-900">{selectedBid.mission_title}</span>
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Rating</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="p-1 hover:scale-110 transition-transform"
                  >
                    <Star
                      className={`w-8 h-8 ${
                        star <= reviewRating
                          ? "fill-yellow-400 text-yellow-400"
                          : "fill-gray-200 text-gray-200 hover:fill-yellow-200 hover:text-yellow-200"
                      }`}
                    />
                  </button>
                ))}
              </div>
              {reviewRating > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  {reviewRating === 1 && "Poor"}
                  {reviewRating === 2 && "Fair"}
                  {reviewRating === 3 && "Good"}
                  {reviewRating === 4 && "Very Good"}
                  {reviewRating === 5 && "Excellent"}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="review-comment" className="text-sm font-medium text-gray-700 mb-2 block">
                Comment (optional)
              </label>
              <Textarea
                id="review-comment"
                placeholder="Tell others about your experience..."
                value={reviewComment}
                onChange={(e) => setReviewComment(e.target.value)}
                rows={4}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setReviewModalOpen(false)} disabled={submittingReview}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmitReview}
              disabled={reviewRating === 0 || submittingReview}
              className="bg-[#0F766E] hover:bg-[#0F766E]/90"
            >
              {submittingReview ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Review"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  )
}
