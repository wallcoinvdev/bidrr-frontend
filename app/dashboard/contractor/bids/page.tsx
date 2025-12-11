"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Calendar, MapPin, Loader2, AlertCircle, X } from "lucide-react"
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { VerifiedBadge } from "@/components/verified-badge"
import { trackEvent } from "@/lib/analytics"

interface Bid {
  id: number
  mission_id: number
  title: string
  service?: string
  priority?: string
  quote: number
  status: "pending" | "hired"
  created_at: string
  message?: string
  job_details?: string
  description?: string // Added description as backend may use this field name
  images?: string[]
  image_urls?: string[] // Added image_urls as backend may use this field name
  homeowner_first_name?: string
  homeowner_phone?: string
  homeowner_postal_code?: string
  distance_km?: number
  property_type?: string
  house_size?: string
  stories?: number
  accepted_bid_amount?: number
  homeowner_email?: string
  viewed_by_contractor?: boolean
  homeowner_profile_image?: string
  homeowner_phone_verified?: boolean
  bid_count?: number
  hiring_likelihood?: number
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
      const response = await apiClient.request<Bid[] | { bids: Bid[] }>("/api/contractor/recent-bids", {
        requiresAuth: true,
      })
      const bidsData = Array.isArray(response) ? response : response?.bids || []
      setBids(bidsData)
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
      case "hired":
        return "bg-[#328d87]/20 text-[#328d87]"
      default:
        return "bg-[#e2bb12]/20 text-[#b89a0e]"
    }
  }

  const getBorderColor = (status: string) => {
    if (status === "hired") {
      return "border-l-4 border-l-[#328d87]"
    }
    return "border-l-4 border-l-[#e2bb12]"
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
      trackEvent("job_viewed", { job_id: missionId, service_type: mission.service })
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

  const markBidAsViewed = async (bidId: number) => {
    try {
      await apiClient.request(`/api/bids/${bidId}/mark-viewed`, {
        method: "POST",
        requiresAuth: true,
      })
      setBids((prevBids) => prevBids.map((bid) => (bid.id === bidId ? { ...bid, viewed_by_contractor: true } : bid)))
      window.dispatchEvent(new CustomEvent("bidViewed"))
      // Track event when bid is marked as viewed
      trackEvent("bid_viewed", { bidId })
    } catch (error) {
      console.error("Error marking bid as viewed:", error)
    }
  }

  const handleBidClick = async (bid: Bid) => {
    setSelectedBid(bid)
    if (!bid.viewed_by_contractor) {
      await markBidAsViewed(bid.id)
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
                    onClick={() => handleBidClick(bid)}
                    className={`bg-white rounded-xl border border-gray-200 p-4 md:p-6 hover:shadow-md transition-shadow cursor-pointer ${getBorderColor(bid.status)}`}
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
                          <span className="text-lg md:text-xl font-bold text-gray-900">
                            ${bid.quote?.toLocaleString() || "0"}
                          </span>
                          {bid.status === "hired" && (
                            <span
                              className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap ${getStatusColor(bid.status)}`}
                            >
                              Hired
                            </span>
                          )}
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
              {/* Customer Info Section */}
              {(selectedBid.homeowner_first_name || selectedBid.homeowner_profile_image) && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-gray-50 rounded-lg">
                  {selectedBid.homeowner_profile_image ? (
                    <img
                      src={selectedBid.homeowner_profile_image || "/placeholder.svg"}
                      alt={selectedBid.homeowner_first_name || "Customer"}
                      className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold text-xl border-2 border-gray-200">
                      {selectedBid.homeowner_first_name?.charAt(0).toUpperCase() || "?"}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-900 break-words">
                      {selectedBid.homeowner_first_name || "Customer"}
                    </h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      {selectedBid.homeowner_phone_verified && (
                        <>
                          <VerifiedBadge type="phone" size="sm" showLabel={false} />
                          <span className="text-sm text-gray-600">Phone verified</span>
                        </>
                      )}
                    </div>
                    {selectedBid.homeowner_postal_code && (
                      <p className="text-sm text-gray-500 mt-1">{selectedBid.homeowner_postal_code}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Contact Info Section */}
              {(selectedBid.homeowner_phone || selectedBid.homeowner_email) && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="text-sm font-semibold text-green-900 uppercase mb-3">Contact Information</h3>
                  <div className="space-y-2">
                    {selectedBid.homeowner_phone && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-green-800 font-medium">Phone:</span>
                        <a
                          href={`tel:${selectedBid.homeowner_phone}`}
                          className="text-sm text-green-900 hover:underline"
                        >
                          {selectedBid.homeowner_phone}
                        </a>
                      </div>
                    )}
                    {selectedBid.homeowner_email && (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-green-800 font-medium">Email:</span>
                        <a
                          href={`mailto:${selectedBid.homeowner_email}`}
                          className="text-sm text-green-900 hover:underline break-all"
                        >
                          {selectedBid.homeowner_email}
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Service Type and Priority Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Service Type</h3>
                  <p className="text-base md:text-lg text-gray-900 break-words">{selectedBid.service || "N/A"}</p>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Priority</h3>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-[9px] font-medium ${
                      selectedBid.priority === "urgent" || selectedBid.priority === "high"
                        ? "bg-red-100 text-red-800"
                        : selectedBid.priority === "soon" || selectedBid.priority === "medium"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {selectedBid.priority?.charAt(0).toUpperCase() + selectedBid.priority?.slice(1) || "Normal"}
                  </span>
                </div>
              </div>

              {/* Job Details Section */}
              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Job Details</h3>
                <p className="text-sm md:text-base text-gray-900 whitespace-pre-wrap break-words">
                  {selectedBid.job_details || selectedBid.description || "No details provided"}
                </p>
              </div>

              {/* Images Section */}
              {((selectedBid.images && selectedBid.images.length > 0) ||
                (selectedBid.image_urls && selectedBid.image_urls.length > 0)) && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">Photos</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {(selectedBid.images || selectedBid.image_urls || []).map((image, index) => (
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

              {/* Property Details Section */}
              {(selectedBid.property_type || selectedBid.house_size || selectedBid.stories) && (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
                  {selectedBid.property_type && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Property Type</h3>
                      <p className="text-sm md:text-base text-gray-900 capitalize break-words">
                        {selectedBid.property_type}
                      </p>
                    </div>
                  )}
                  {selectedBid.house_size && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">House Size</h3>
                      <p className="text-sm md:text-base text-gray-900 break-words">{selectedBid.house_size}</p>
                    </div>
                  )}
                  {selectedBid.stories && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-500 uppercase mb-1">Stories</h3>
                      <p className="text-sm md:text-base text-gray-900">{selectedBid.stories}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Distance Section */}
              {selectedBid.distance_km && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Distance</h3>
                  <p className="text-xl md:text-2xl font-bold text-gray-900">{selectedBid.distance_km.toFixed(1)} km</p>
                </div>
              )}

              {/* Your Bid Section */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="text-sm font-semibold text-blue-900 uppercase mb-3">Your Bid</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-800 font-medium">Quote Amount:</span>
                    <span className="text-xl font-bold text-blue-900">
                      ${selectedBid.quote?.toLocaleString() || "0"}
                    </span>
                  </div>
                  {selectedBid.message && (
                    <div>
                      <span className="text-sm text-blue-800 font-medium">Your Message:</span>
                      <p className="mt-1 text-sm text-blue-900">{selectedBid.message}</p>
                    </div>
                  )}
                  <div className="text-xs text-blue-700">
                    Submitted{" "}
                    {new Date(selectedBid.created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
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
