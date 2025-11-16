"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Calendar, MapPin, DollarSign, Loader2, AlertCircle, X } from "lucide-react"
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"

interface Bid {
  id: number
  mission_id: number
  title: string
  service?: string
  priority?: string
  quote: number
  status: "pending" | "considering" | "accepted" | "rejected"
  created_at: string
  message?: string
  job_details?: string
  images?: string[]
  homeowner_first_name?: string
  homeowner_phone?: string
  homeowner_postal_code?: string
  distance_km?: number
  property_type?: string
  house_size?: string
  stories?: number
  accepted_bid_amount?: number
  homeowner_email?: string
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
  distance_km: number
  homeowner_first_name?: string
  homeowner_phone?: string
  homeowner_postal_code?: string
}

export default function MyBidsPage() {
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null)
  const [bids, setBids] = useState<Bid[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showPostInfo, setShowPostInfo] = useState(false)
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null)
  const [loadingMission, setLoadingMission] = useState(false)
  const [missionError, setMissionError] = useState("")
  const [previewImage, setPreviewImage] = useState<string | null>(null)

  useEffect(() => {
    fetchBids()
  }, [])

  const fetchBids = async () => {
    try {
      setLoading(true)
      setError("")
      const data = await apiClient.request<Bid[]>("/api/contractor/recent-bids", { requiresAuth: true })
      setBids(data)
    } catch (error: any) {
      console.error("Error fetching bids:", error)
      setError(error.message || "Failed to load your bids")
      setBids([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "considering":
        return "bg-yellow-100 text-yellow-800"
      case "accepted":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
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

  const handleViewFullPost = async (missionId: number) => {
    setLoadingMission(true)
    setMissionError("")
    try {
      const mission = await apiClient.request<Mission>(`/api/missions/${missionId}`, { requiresAuth: true })
      setSelectedMission(mission)
      setSelectedBid(null)
    } catch (error: any) {
      console.error("Error fetching mission:", error)
      if (error.status === 404) {
        setMissionError("This job post has been removed or is no longer available.")
      } else {
        setMissionError(error.message || "Failed to load job post")
      }
    } finally {
      setLoadingMission(false)
    }
  }

  return (
    <>
      <DashboardLayout userRole="contractor">
        <div className="p-4 md:p-6">
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Bids</h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">Track all your submitted bids</p>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#328d87] mb-4" />
              <p className="text-gray-600">Loading your bids...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-900 mb-2">Error Loading Bids</h3>
              <p className="text-red-700 mb-4">{error}</p>
              <button
                onClick={fetchBids}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {bids.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                  <p className="text-gray-600 text-lg mb-2">You haven't submitted any bids yet</p>
                  <p className="text-gray-500">Start bidding on available jobs to grow your business!</p>
                </div>
              ) : (
                bids.map((bid) => (
                  <div
                    key={bid.id}
                    onClick={() => setSelectedBid(bid)}
                    className="bg-white rounded-xl border border-gray-200 p-4 md:p-6 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex flex-col gap-4">
                      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg md:text-xl font-semibold text-gray-900 mb-1 break-words">
                            {bid.title}
                          </h3>
                          {bid.job_details && (
                            <p className="text-gray-600 text-sm line-clamp-2 break-words">{bid.job_details}</p>
                          )}
                        </div>
                        {bid.distance_km && (
                          <div className="flex items-center gap-1 text-sm text-gray-600 flex-shrink-0">
                            <MapPin className="h-4 w-4" />
                            <span>{bid.distance_km?.toFixed(1) || "N/A"} km away</span>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="h-4 w-4 flex-shrink-0" />
                          <span>Submitted {formatDate(bid.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-3 sm:gap-4">
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-5 w-5 text-green-600 flex-shrink-0" />
                            <span className="text-lg md:text-xl font-bold text-gray-900">
                              ${bid.quote?.toLocaleString() || "0"}
                            </span>
                          </div>
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${getStatusColor(bid.status)}`}
                          >
                            {bid.status.charAt(0).toUpperCase() + bid.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </DashboardLayout>

      {selectedBid && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          style={{ zIndex: 9999 }}
          onClick={() => setSelectedBid(null)}
        >
          <div
            className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 md:p-6 flex justify-between items-start z-10">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 pr-8">{selectedBid.title}</h2>
              <button
                onClick={() => setSelectedBid(null)}
                className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            <div className="p-4 md:p-6 space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Service Type</h3>
                <p className="text-lg text-gray-900 break-words">{selectedBid.service || "N/A"}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Your Message</h3>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-gray-900">
                    {selectedBid.message || `I can do this job for $${selectedBid.quote}`}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Customer Information</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Customer Name</p>
                    <p className="text-gray-900 font-medium break-words">
                      {selectedBid.homeowner_first_name || "Not provided"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Postal Code</p>
                    <p className="text-gray-900 font-medium break-words">
                      {selectedBid.homeowner_postal_code || "Not provided"}
                    </p>
                  </div>
                </div>
              </div>

              {selectedBid.status === "accepted" && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Contact Information</h3>
                  <div className="space-y-3">
                    {selectedBid.homeowner_phone && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Phone:</p>
                        <p className="text-gray-900 font-medium break-words">{selectedBid.homeowner_phone}</p>
                      </div>
                    )}
                    {selectedBid.homeowner_email && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Email:</p>
                        <p className="text-gray-900 font-medium overflow-wrap-anywhere">
                          {selectedBid.homeowner_email}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Status</h3>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedBid.status)}`}
                >
                  {selectedBid.status.charAt(0).toUpperCase() + selectedBid.status.slice(1)}
                </span>
                {selectedBid.status === "accepted" && (
                  <p className="text-gray-600 mt-3">
                    Congratulations! Your bid was accepted. Contact the customer to schedule the work.
                  </p>
                )}
                {selectedBid.status === "rejected" && (
                  <p className="text-gray-600 mt-3">
                    Unfortunately, this bid was not accepted. Keep bidding on other jobs!
                  </p>
                )}
                {selectedBid.status === "considering" && (
                  <p className="text-gray-600 mt-3">
                    The customer is considering your bid. You'll be notified if you're selected.
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={() => handleViewFullPost(selectedBid.mission_id)}
                  disabled={loadingMission}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {loadingMission && <Loader2 className="h-4 w-4 animate-spin" />}
                  {loadingMission ? "Loading..." : "See Full Post"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedMission && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          style={{ zIndex: 10000 }}
          onClick={() => {
            setSelectedMission(null)
            setMissionError("")
          }}
        >
          <div
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 md:p-6 flex justify-between items-start z-10">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 pr-8">{selectedMission.title}</h2>
              <button
                onClick={() => {
                  setSelectedMission(null)
                  setMissionError("")
                }}
                className="flex-shrink-0 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Close"
              >
                <X className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            <div className="p-4 md:p-6 space-y-6">
              {missionError ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                  <AlertCircle className="h-8 w-8 text-red-600 mx-auto mb-2" />
                  <p className="text-red-800 font-medium">{missionError}</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Service Type</h3>
                      <p className="text-lg text-gray-900 break-words">{selectedMission.service}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Priority</h3>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                          selectedMission.priority === "urgent"
                            ? "bg-red-100 text-red-800"
                            : selectedMission.priority === "soon"
                              ? "bg-orange-100 text-orange-800"
                              : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {selectedMission.priority?.charAt(0).toUpperCase() + selectedMission.priority?.slice(1) ||
                          "Normal"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Job Details</h3>
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedMission.job_details}</p>
                  </div>

                  {selectedMission.images && selectedMission.images.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Photos</h3>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
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

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Property Type</h3>
                      <p className="text-gray-900 capitalize">{selectedMission.property_type || "N/A"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">House Size</h3>
                      <p className="text-gray-900">{selectedMission.house_size || "N/A"}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Stories</h3>
                      <p className="text-gray-900">{selectedMission.stories || "N/A"}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Total Bids</h3>
                      <p className="text-2xl font-bold text-gray-900">{selectedMission.bid_count || 0}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Distance</h3>
                      <p className="text-2xl font-bold text-gray-900">{selectedMission.distance_km?.toFixed(1)} km</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Posted</h3>
                    <p className="text-gray-900">
                      {new Date(selectedMission.created_at).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
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
    </>
  )
}
