"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { apiClient } from "@/lib/api-client"
import { Loader2, ArrowLeft, MapPin, CheckCircle2, X, User } from "lucide-react"
import { VerifiedBadge } from "@/components/verified-badge"
import { BidMeter } from "@/components/bid-meter"
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
import { trackEvent } from "@/lib/analytics"

interface Bid {
  id: number
  contractor_id: number
  quote: number
  message: string
  status: string
  created_at: string
  contractor: {
    id: number
    company_name: string
    logo_url?: string
    rating: number
    total_reviews: number
    street_address: string
    city: string
    province: string
    postal_code: string
    agent_name?: string
    agent_photo_url?: string
    phone_verified: boolean
    google_verified: boolean
  }
}

interface Mission {
  id: number
  title: string
  service: string
  job_details: string
  postal_code: string
  created_at: string
  status: string
  bid_count?: number
}

export default function ViewBidsPage() {
  const router = useRouter()
  const params = useParams()
  const missionId = params.id as string

  const [loading, setLoading] = useState(true)
  const [mission, setMission] = useState<Mission | null>(null)
  const [bids, setBids] = useState<Bid[]>([])
  const [error, setError] = useState("")
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [hiredContractorName, setHiredContractorName] = useState("")

  useEffect(() => {
    fetchMissionAndBids()
  }, [missionId])

  const fetchMissionAndBids = async () => {
    try {
      setLoading(true)

      const [missionData, bidsData] = await Promise.all([
        apiClient.request<Mission>(`/api/missions/${missionId}`, { requiresAuth: true }),
        apiClient.request<Bid[]>(`/api/missions/${missionId}/bids`, { requiresAuth: true }),
      ])

      setMission(missionData)
      setBids(bidsData)
      setError("")
    } catch (error: any) {
      console.error("Error fetching bids:", error)
      setError(error.message || "Failed to load bids")
    } finally {
      setLoading(false)
    }
  }

  const handleHireContractor = async (bidId: number) => {
    if (!confirm("Are you sure you want to hire this contractor?")) return

    try {
      const bid = bids.find((b) => b.id === bidId)
      const contractorName = bid?.contractor?.company_name || "the contractor"

      await apiClient.request(`/api/bids/${bidId}/status`, {
        method: "PUT",
        body: { status: "accepted", message: "Contractor hired by homeowner" },
        requiresAuth: true,
      })

      trackEvent("contractor_hired", {
        job_id: missionId,
        bid_id: bidId,
        bid_amount: bid?.quote,
      })

      setHiredContractorName(contractorName)
      setShowReviewDialog(true)

      await fetchMissionAndBids()
    } catch (error: any) {
      console.error("Error hiring contractor:", error)
      alert("Failed to hire contractor: " + error.message)
      trackEvent("contractor_hire_error", { job_id: missionId, bid_id: bidId, error: error.message })
    }
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "1 day ago"
    return `${diffDays} days ago`
  }

  if (loading) {
    return (
      <DashboardLayout userRole="homeowner">
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#0F766E]" />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !mission) {
    return (
      <DashboardLayout userRole="homeowner">
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-center">
            <p className="text-lg text-gray-600">{error || "Mission not found"}</p>
            <button onClick={() => router.push("/dashboard/homeowner")} className="mt-4 text-[#0F766E] hover:underline">
              Back to Dashboard
            </button>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="homeowner">
      <div className="max-w-[95vw] sm:max-w-3xl mx-auto px-3 sm:px-0">
        <button
          onClick={() => router.push("/dashboard/homeowner")}
          className="mb-4 sm:mb-6 flex items-center gap-2 text-sm sm:text-base text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        <div className="rounded-lg bg-white shadow-lg">
          <div className="border-b border-gray-200 px-4 sm:px-6 py-4 flex items-start sm:items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-xl font-bold text-gray-900 break-words">Bids for "{mission.title}"</h1>
              <div className="mt-2">
                <BidMeter currentBids={mission.bid_count || bids.length} maxBids={5} />
              </div>
            </div>
            <button
              onClick={() => router.push("/dashboard/homeowner")}
              className="text-gray-400 hover:text-gray-600 flex-shrink-0"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          <div className="p-4 sm:p-6 space-y-4 max-h-[70vh] overflow-y-auto">
            {bids.length === 0 ? (
              <div className="py-8 sm:py-12 text-center text-gray-500 text-sm sm:text-base px-4">
                No bids received yet. Contractors will see your job posting soon.
              </div>
            ) : (
              bids.map((bid) => (
                <div
                  key={bid.id}
                  className={`rounded-lg border-2 p-4 sm:p-6 ${
                    bid.status === "accepted" || bid.status === "hired" ? "border-[#328d87]" : "border-gray-200"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start gap-4">
                    {bid.contractor.logo_url ? (
                      <img
                        src={bid.contractor.logo_url || "/placeholder.svg"}
                        alt={bid.contractor.company_name}
                        className="w-16 h-16 object-contain rounded"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-[#0F766E] rounded flex items-center justify-center text-white text-xl sm:text-2xl font-bold">
                        {bid.contractor.company_name.charAt(0)}
                      </div>
                    )}

                    <div className="flex-1 w-full min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 flex-wrap">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                          {bid.contractor.company_name}
                        </h3>
                        {(bid.status === "accepted" || bid.status === "hired") && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-[#328d87] px-3 py-1 text-xs font-semibold text-white w-fit">
                            <CheckCircle2 className="w-3 h-3" />
                            HIRED
                          </span>
                        )}
                      </div>

                      {bid.contractor.rating > 0 && (
                        <div className="mt-1 flex items-center gap-1 text-sm">
                          <span className="text-yellow-500">★</span>
                          <span className="font-semibold">{bid.contractor.rating.toFixed(1)}</span>
                          <span className="text-gray-600">({bid.contractor.total_reviews} reviews)</span>
                        </div>
                      )}

                      <div className="mt-2 flex items-start gap-1 text-xs sm:text-sm text-gray-600">
                        <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span className="break-words overflow-wrap-anywhere">
                          {bid.contractor.street_address}, {bid.contractor.city}, {bid.contractor.province}{" "}
                          {bid.contractor.postal_code}
                        </span>
                      </div>

                      <div className="mt-4 rounded-lg bg-gray-50 p-3 sm:p-4">
                        <p className="text-xs text-gray-600 mb-1">Bid Amount</p>
                        <p className="text-2xl sm:text-3xl font-bold text-[#0F766E]">${bid.quote.toFixed(0)}</p>
                        <p className="text-xs text-gray-500 mt-2 italic">
                          Note: Bid prices are estimates based on the information provided and may vary depending on
                          actual job requirements and site conditions.
                        </p>
                      </div>

                      {bid.contractor.agent_name && (
                        <div className="mt-4 flex items-center gap-3">
                          {bid.contractor.agent_photo_url ? (
                            <img
                              src={bid.contractor.agent_photo_url || "/placeholder.svg"}
                              alt={bid.contractor.agent_name}
                              className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-sm sm:text-base text-gray-900 break-words">
                              {bid.contractor.agent_name}
                            </p>
                            <div className="flex items-center gap-2 mt-1 flex-wrap">
                              {bid.contractor.phone_verified && <VerifiedBadge type="phone" size="sm" />}
                              {bid.contractor.google_verified && <VerifiedBadge type="google" size="sm" />}
                            </div>
                          </div>
                        </div>
                      )}

                      <p className="text-xs sm:text-sm text-gray-600 mt-3">{formatTimeAgo(bid.created_at)}</p>

                      {bid.message && (
                        <div className="mt-4 rounded-lg bg-gray-100 p-3">
                          <p className="text-xs sm:text-sm text-gray-700 break-words overflow-wrap-anywhere">
                            {bid.message}
                          </p>
                        </div>
                      )}

                      <div className="mt-4 flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => handleHireContractor(bid.id)}
                          disabled={bid.status === "accepted" || bid.status === "hired"}
                          className={`flex-1 rounded-lg px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium transition-colors ${
                            bid.status === "accepted" || bid.status === "hired"
                              ? "bg-[#03353a] text-white opacity-50 cursor-not-allowed"
                              : "bg-[#03353a] text-white hover:bg-[#04454c]"
                          }`}
                        >
                          {bid.status === "accepted" || bid.status === "hired" ? "Hired" : "I hired this Contractor"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      {showReviewDialog && (
        <AlertDialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Contractor Hired!</AlertDialogTitle>
              <AlertDialogDescription>
                Help other customers by leaving a review for {hiredContractorName || "this contractor"}.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowReviewDialog(false)}>Maybe Later</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => {
                  setShowReviewDialog(false)
                  router.push("/dashboard/homeowner/reviews")
                }}
                style={{ backgroundColor: "#03353a" }}
                className="hover:opacity-90"
              >
                Go to Reviews
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </DashboardLayout>
  )
}
