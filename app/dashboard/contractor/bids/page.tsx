"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Calendar, MapPin, DollarSign, X, Loader2, AlertCircle, Info, Clock, Users, Shield } from "lucide-react"
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import Image from "next/image"

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
      console.error("[v0] Error fetching bids:", error)
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

  const blurPhone = (phone: string) => {
    return phone.replace(/\d(?=\d{4})/g, "*")
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
      setSelectedBid(null) // Close bid modal
    } catch (error: any) {
      console.error("[v0] Error fetching mission:", error)
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
    <DashboardLayout userRole="contractor">
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Bids</h1>
          <p className="text-gray-600 mt-2">Track all your submitted bids</p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading your bids...</p>
            </div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-red-900 mb-1">Error Loading Bids</h3>
                <p className="text-red-700 text-sm">{error}</p>
                <button
                  onClick={fetchBids}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {bids.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                <p className="text-gray-500">You haven't submitted any bids yet</p>
                <p className="text-sm text-gray-400 mt-2">Start bidding on available jobs to grow your business!</p>
              </div>
            ) : (
              bids.map((bid) => (
                <div
                  key={bid.id}
                  onClick={() => setSelectedBid(bid)}
                  className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{bid.title}</h3>
                      {bid.job_details && <p className="text-gray-600 mb-4 line-clamp-2">{bid.job_details}</p>}
                      <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                        {bid.distance_km && (
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4" />
                            <span>{bid.distance_km?.toFixed(1) || "N/A"} km away</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Submitted {formatDate(bid.created_at)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-4 w-4" />
                          <span className="font-semibold">${bid.quote?.toLocaleString() || "0"}</span>
                        </div>
                      </div>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(bid.status)}`}
                    >
                      {bid.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {selectedBid && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">{selectedBid.title}</h2>
              <button
                onClick={() => setSelectedBid(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {selectedBid.service && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Service Type</h3>
                  <p className="text-lg text-gray-900">{selectedBid.service}</p>
                </div>
              )}

              {selectedBid.job_details && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Job Details</h3>
                  <p className="text-gray-900">{selectedBid.job_details}</p>
                </div>
              )}

              {selectedBid.message && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Your Message</h3>
                  <p className="text-gray-900 bg-blue-50 p-4 rounded-lg border border-blue-200">
                    {selectedBid.message}
                  </p>
                </div>
              )}

              {selectedBid.images && selectedBid.images.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Attached Images</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedBid.images.map((img: string, idx: number) => (
                      <div
                        key={idx}
                        className="relative aspect-video rounded-lg overflow-hidden border border-gray-200"
                      >
                        <Image
                          src={img || "/placeholder.svg"}
                          alt={`Job image ${idx + 1}`}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {(selectedBid.property_type || selectedBid.house_size || selectedBid.stories) && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Property Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedBid.property_type && (
                      <div>
                        <p className="text-sm text-gray-500">Type</p>
                        <p className="text-gray-900">{selectedBid.property_type}</p>
                      </div>
                    )}
                    {selectedBid.house_size && (
                      <div>
                        <p className="text-sm text-gray-500">Size</p>
                        <p className="text-gray-900">{selectedBid.house_size}</p>
                      </div>
                    )}
                    {selectedBid.stories && (
                      <div>
                        <p className="text-sm text-gray-500">Stories</p>
                        <p className="text-gray-900">{selectedBid.stories}</p>
                      </div>
                    )}
                    {selectedBid.distance_km && (
                      <div>
                        <p className="text-sm text-gray-500">Distance</p>
                        <p className="text-gray-900">{selectedBid.distance_km?.toFixed(1) || "N/A"} km</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(selectedBid.homeowner_first_name || selectedBid.homeowner_postal_code) && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Customer Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedBid.homeowner_first_name && (
                      <div>
                        <p className="text-sm text-gray-500">Customer Name</p>
                        <p className="text-gray-900">{selectedBid.homeowner_first_name}</p>
                      </div>
                    )}
                    {selectedBid.homeowner_postal_code && (
                      <div>
                        <p className="text-sm text-gray-500">Postal Code</p>
                        <p className="text-gray-900">{selectedBid.homeowner_postal_code}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {(selectedBid.homeowner_phone || selectedBid.homeowner_email) && (
                <div>
                  <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Contact Information</h3>
                  <div className="space-y-3">
                    {selectedBid.homeowner_phone && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Phone:</p>
                        {selectedBid.status === "accepted" ? (
                          <p className="text-gray-900 font-mono">{selectedBid.homeowner_phone}</p>
                        ) : (
                          <div>
                            <p className="text-gray-900 font-mono">
                              +{selectedBid.homeowner_phone.replace(/\D/g, "").slice(0, 1)} (
                              {selectedBid.homeowner_phone.replace(/\D/g, "").slice(1, 4)})
                              <span className="blur-sm select-none">
                                {" "}
                                {selectedBid.homeowner_phone.replace(/\D/g, "").slice(4)}
                              </span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">(visible after bid acceptance)</p>
                          </div>
                        )}
                      </div>
                    )}
                    {selectedBid.homeowner_email && (
                      <div>
                        <p className="text-sm text-gray-500 mb-1">Email:</p>
                        {selectedBid.status === "accepted" ? (
                          <p className="text-gray-900 font-mono">{selectedBid.homeowner_email}</p>
                        ) : (
                          <div>
                            <p className="text-gray-900 font-mono">
                              {selectedBid.homeowner_email.slice(0, 2)}
                              <span className="blur-sm select-none">{selectedBid.homeowner_email.slice(2)}</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">(visible after bid acceptance)</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">Status</h3>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium capitalize ${getStatusColor(selectedBid.status)}`}
                >
                  {selectedBid.status}
                </span>
                {selectedBid.status === "considering" && (
                  <p className="text-sm text-gray-600 mt-2">
                    The customer is reviewing your bid. They may reach out with questions or accept your proposal.
                  </p>
                )}
                {selectedBid.status === "accepted" && (
                  <p className="text-sm text-gray-600 mt-2">
                    Congratulations! Your bid was accepted. Contact the customer to schedule the work.
                  </p>
                )}
                {selectedBid.status === "rejected" && (
                  <div className="mt-2 space-y-2">
                    <p className="text-sm text-gray-600">
                      The customer chose a different contractor. Your bid has been returned to your available bids.
                    </p>
                    {selectedBid.accepted_bid_amount && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                        <p className="text-sm text-gray-700">
                          The customer accepted a bid of{" "}
                          <span className="font-semibold blur-sm select-none">
                            ${selectedBid.accepted_bid_amount.toLocaleString()}
                          </span>
                        </p>
                      </div>
                    )}
                  </div>
                )}
                {selectedBid.status === "pending" && (
                  <p className="text-sm text-gray-600 mt-2">
                    Your bid is waiting for the customer to review. Check back soon for updates.
                  </p>
                )}
              </div>

              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleViewFullPost(selectedBid.mission_id)}
                    disabled={loadingMission}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loadingMission ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      "See Full Post"
                    )}
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setShowPostInfo(!showPostInfo)}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <Info className="h-5 w-5 text-gray-400" />
                    </button>
                    {showPostInfo && (
                      <div className="absolute left-0 top-full mt-2 w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-10">
                        <p className="text-sm text-gray-600">
                          Job posts may be removed from the platform periodically. If you're unable to view the full
                          post, it may have been deleted by the customer or removed due to inactivity.
                        </p>
                        <button
                          onClick={() => setShowPostInfo(false)}
                          className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Got it
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                {missionError && (
                  <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-700">{missionError}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedMission && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedMission(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">{selectedMission.title}</h2>
              <button
                onClick={() => setSelectedMission(null)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                  {selectedMission.service}
                </span>
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm font-medium capitalize">
                  {selectedMission.priority} Priority
                </span>
              </div>

              {(selectedMission.homeowner_first_name ||
                selectedMission.homeowner_phone ||
                selectedMission.homeowner_postal_code) && (
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Posted By</h3>
                  <div className="space-y-2">
                    {selectedMission.homeowner_first_name && (
                      <p className="text-gray-700 flex items-center gap-2">
                        <span className="font-medium">Name:</span>
                        <span className="flex items-center gap-1.5">
                          {selectedMission.homeowner_first_name}
                          <span className="relative group">
                            <Shield className="h-4 w-4 text-blue-600 fill-blue-600" />
                            <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                              Verified by Phone
                            </span>
                          </span>
                        </span>
                      </p>
                    )}
                    {selectedMission.homeowner_postal_code && (
                      <p className="text-gray-700">
                        <span className="font-medium">Location:</span> {selectedMission.homeowner_postal_code}
                      </p>
                    )}
                    {selectedMission.homeowner_phone && (
                      <p className="text-gray-700">
                        <span className="font-medium">Phone:</span> {selectedMission.homeowner_phone}
                      </p>
                    )}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Property Details</h3>
                  <div className="space-y-1 text-sm text-gray-700">
                    <p>
                      <span className="font-medium">Type:</span> {selectedMission.property_type || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Size:</span> {selectedMission.house_size || "N/A"}
                    </p>
                    <p>
                      <span className="font-medium">Stories:</span> {selectedMission.stories || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Job Info</h3>
                  <div className="space-y-1 text-sm text-gray-700">
                    <p className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      <span>{selectedMission.distance_km?.toFixed(1) || "N/A"} km away</span>
                    </p>
                    <p className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>Posted {formatDate(selectedMission.created_at)}</span>
                    </p>
                    <p className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{selectedMission.bid_count} bids received</span>
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Job Description</h3>
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedMission.job_details}</p>
              </div>

              {selectedMission.images && selectedMission.images.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Photos</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {selectedMission.images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setPreviewImage(image)}
                        className="relative group cursor-pointer"
                      >
                        <img
                          src={image || "/placeholder.svg"}
                          alt={`Job photo ${index + 1}`}
                          className="w-full h-48 object-cover rounded-lg border border-gray-200 transition-transform group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 rounded-lg transition-colors flex items-center justify-center">
                          <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity text-sm font-medium">
                            Click to enlarge
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {previewImage && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4"
          onClick={() => setPreviewImage(null)}
        >
          <button
            onClick={() => setPreviewImage(null)}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="h-6 w-6 text-white" />
          </button>
          <img
            src={previewImage || "/placeholder.svg"}
            alt="Preview"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </DashboardLayout>
  )
}
