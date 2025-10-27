"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { Loader2, AlertCircle, MapPin, Calendar, Home, Layers, CheckCircle, XCircle, Clock, Star } from "lucide-react"
import { format } from "date-fns"

interface Mission {
  id: number
  title: string
  service: string
  job_details: string
  postal_code: string
  priority: string
  hiring_likelihood: string
  status: string
  house_size?: number
  stories?: number
  property_type?: string
  images?: string[]
  created_at: string
}

interface Bid {
  id: number
  contractor_id: number
  contractor_name: string
  company_name: string
  quote: number
  message: string
  status: string
  created_at: string
}

export default function MissionDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const missionId = params.id as string

  const [mission, setMission] = useState<Mission | null>(null)
  const [bids, setBids] = useState<Bid[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [actionLoading, setActionLoading] = useState<number | null>(null)

  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewContractorId, setReviewContractorId] = useState<number | null>(null)
  const [reviewRating, setReviewRating] = useState(5)
  const [reviewComment, setReviewComment] = useState("")
  const [reviewSubmitting, setReviewSubmitting] = useState(false)

  useEffect(() => {
    fetchMissionDetails()
  }, [missionId])

  const fetchMissionDetails = async () => {
    try {
      const [missionData, bidsData] = await Promise.all([
        apiClient.request<Mission>(`/api/missions/${missionId}`, { requiresAuth: true }),
        apiClient.request<Bid[]>(`/api/missions/${missionId}/bids`, { requiresAuth: true }),
      ])
      setMission(missionData)
      setBids(bidsData)
    } catch (err: any) {
      console.error("[v0] Failed to fetch mission details:", err)
      setError(err.message || "Failed to load mission details")
    } finally {
      setLoading(false)
    }
  }

  const handleBidAction = async (bidId: number, action: "accept" | "reject" | "considering") => {
    if (action === "considering") {
      const currentlyConsideringBid = bids.find((bid) => bid.status === "considering" && bid.id !== bidId)

      if (currentlyConsideringBid) {
        const confirmed = window.confirm(
          "You are already considering a bid. If you change consideration to another bid, the first bid will be rejected. Do you want to continue?",
        )

        if (!confirmed) {
          return
        }
      }
    }

    setActionLoading(bidId)
    try {
      await apiClient.request(`/api/bids/${bidId}/${action}`, {
        method: "POST",
        requiresAuth: true,
      })
      await fetchMissionDetails()
    } catch (err: any) {
      alert(err.message || `Failed to ${action} bid`)
    } finally {
      setActionLoading(null)
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reviewContractorId) return

    setReviewSubmitting(true)
    try {
      await apiClient.request("/api/reviews", {
        method: "POST",
        requiresAuth: true,
        body: JSON.stringify({
          contractor_id: reviewContractorId,
          mission_id: Number.parseInt(missionId),
          rating: reviewRating,
          comment: reviewComment,
        }),
      })
      setShowReviewModal(false)
      setReviewComment("")
      setReviewRating(5)
      alert("Review submitted successfully!")
    } catch (err: any) {
      alert(err.message || "Failed to submit review")
    } finally {
      setReviewSubmitting(false)
    }
  }

  const renderStarRating = (interactive = false) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => interactive && setReviewRating(star)}
            disabled={!interactive}
            className={interactive ? "cursor-pointer" : "cursor-default"}
          >
            <Star
              className={`h-6 w-6 ${star <= reviewRating ? "fill-current" : ""}`}
              style={{ color: star <= reviewRating ? "#142c57" : "#d1d5db" }}
            />
          </button>
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" style={{ color: "#142c57" }} />
          <p className="text-muted-foreground">Loading mission details...</p>
        </div>
      </div>
    )
  }

  if (error || !mission) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-card border rounded-lg p-6" style={{ borderColor: "#dd3f55" }}>
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: "#dd3f55" }} />
            <div>
              <h3 className="font-semibold text-foreground mb-1">Error</h3>
              <p className="text-sm text-muted-foreground">{error || "Mission not found"}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <button onClick={() => router.back()} className="text-primary hover:underline mb-6" style={{ color: "#142c57" }}>
        ← Back to Dashboard
      </button>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Mission Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h1 className="text-2xl font-bold text-foreground mb-4">{mission.title}</h1>

            <div className="flex flex-wrap items-center gap-4 mb-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {mission.postal_code}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Posted {format(new Date(mission.created_at), "MMM d, yyyy")}
              </div>
              <span
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: "#142c57", color: "#fffefe" }}
              >
                {mission.service}
              </span>
            </div>

            <div className="prose max-w-none">
              <h3 className="text-lg font-semibold text-foreground mb-2">Project Description</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">{mission.job_details}</p>
            </div>

            {mission.images && mission.images.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">Project Images</h3>
                <div className="grid grid-cols-3 gap-4">
                  {mission.images.map((image, index) => (
                    <img
                      key={index}
                      src={image || "/placeholder.svg"}
                      alt={`Project ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-border"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bids */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Bids ({bids.length})</h2>

            {bids.length === 0 ? (
              <div className="text-center py-8">
                <Clock className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
                <p className="text-muted-foreground">No bids yet. Contractors will start bidding soon!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bids.map((bid) => (
                  <div
                    key={bid.id}
                    className="rounded-lg p-4"
                    style={{
                      border:
                        bid.status === "considering"
                          ? "2px solid #f59e0b"
                          : bid.status === "rejected"
                            ? "2px solid #dd3f55"
                            : "1px solid hsl(var(--border))",
                    }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground mb-1" style={{ color: "#142c57" }}>
                          {bid.company_name}
                        </h3>
                        <p className="text-sm text-muted-foreground">No reviews yet</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold" style={{ color: "#142c57" }}>
                          ${bid.quote.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(bid.created_at), "MMM d, yyyy")}
                        </p>
                      </div>
                    </div>

                    <p className="text-sm font-medium text-muted-foreground mb-1">From: {bid.contractor_name}</p>
                    <p className="text-sm text-muted-foreground mb-4">{bid.message}</p>

                    <div className="flex items-center gap-2">
                      {bid.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleBidAction(bid.id, "accept")}
                            disabled={actionLoading === bid.id}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                            style={{ backgroundColor: "#426769", color: "#fffefe" }}
                          >
                            {actionLoading === bid.id ? "..." : "Accept"}
                          </button>
                          <button
                            onClick={() => handleBidAction(bid.id, "considering")}
                            disabled={actionLoading === bid.id}
                            className="px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                            style={{ backgroundColor: "#142c57", color: "#fffefe" }}
                          >
                            {actionLoading === bid.id ? "..." : "Consider"}
                          </button>
                          <button
                            onClick={() => handleBidAction(bid.id, "reject")}
                            disabled={actionLoading === bid.id}
                            className="px-4 py-2 border border-input rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors disabled:opacity-50"
                          >
                            {actionLoading === bid.id ? "..." : "Reject"}
                          </button>
                        </>
                      )}
                      {bid.status === "accepted" && (
                        <>
                          <span
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                            style={{ backgroundColor: "#426769", color: "#fffefe" }}
                          >
                            <CheckCircle className="h-3 w-3" />
                            ACCEPTED
                          </span>
                          <button
                            onClick={() => {
                              setReviewContractorId(bid.contractor_id)
                              setShowReviewModal(true)
                            }}
                            className="ml-auto px-4 py-2 border border-input rounded-lg text-sm font-medium text-foreground hover:bg-muted transition-colors"
                          >
                            Leave Review
                          </button>
                        </>
                      )}
                      {bid.status === "considering" && (
                        <span
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                          style={{ backgroundColor: "#f59e0b", color: "#fffefe" }}
                        >
                          <Clock className="h-3 w-3" />
                          CONSIDERING
                        </span>
                      )}
                      {bid.status === "rejected" && (
                        <span
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                          style={{ backgroundColor: "#dd3f55", color: "#fffefe" }}
                        >
                          <XCircle className="h-3 w-3" />
                          REJECTED
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold text-foreground mb-4">Project Details</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Priority</p>
                <p className="font-medium text-foreground capitalize">{mission.priority}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Hiring Likelihood</p>
                <p className="font-medium text-foreground capitalize">{mission.hiring_likelihood.replace("_", " ")}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Status</p>
                <p className="font-medium text-foreground capitalize">{mission.status}</p>
              </div>
            </div>
          </div>

          {(mission.house_size || mission.stories || mission.property_type) && (
            <div className="bg-card border border-border rounded-lg p-6">
              <h3 className="font-semibold text-foreground mb-4">Property Information</h3>
              <div className="space-y-3 text-sm">
                {mission.house_size && (
                  <div className="flex items-center gap-2">
                    <Home className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{mission.house_size.toLocaleString()} sq ft</span>
                  </div>
                )}
                {mission.stories && (
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-muted-foreground" />
                    <span className="text-foreground">{mission.stories} stories</span>
                  </div>
                )}
                {mission.property_type && (
                  <div>
                    <p className="text-muted-foreground mb-1">Type</p>
                    <p className="font-medium text-foreground capitalize">{mission.property_type.replace("_", " ")}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {showReviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-foreground mb-4">Leave a Review</h3>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Rating</label>
                {renderStarRating(true)}
              </div>

              <div>
                <label htmlFor="comment" className="block text-sm font-medium text-foreground mb-2">
                  Comment
                </label>
                <textarea
                  id="comment"
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  required
                  rows={4}
                  className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground resize-none"
                  placeholder="Share your experience working with this contractor..."
                />
              </div>

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={reviewSubmitting}
                  className="flex-1 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ backgroundColor: "#142c57", color: "#fffefe" }}
                >
                  {reviewSubmitting && <Loader2 className="h-5 w-5 animate-spin" />}
                  {reviewSubmitting ? "Submitting..." : "Submit Review"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="px-6 py-3 border border-border rounded-lg font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
