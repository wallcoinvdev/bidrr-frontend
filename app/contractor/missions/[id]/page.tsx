"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { Loader2, AlertCircle, MapPin, Calendar, Home, Layers, Send } from "lucide-react"
import { format } from "date-fns"

interface Mission {
  id: number
  title: string
  service: string
  job_details: string
  postal_code: string
  priority: string
  hiring_likelihood: string
  house_size?: number
  stories?: number
  property_type?: string
  images?: string[]
  created_at: string
  has_bid: boolean
}

interface ExistingBid {
  id: number
  quote: number
  message: string
  status: string
  created_at: string
}

export default function ContractorMissionDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const missionId = params.id as string

  const [mission, setMission] = useState<Mission | null>(null)
  const [existingBid, setExistingBid] = useState<ExistingBid | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const [quote, setQuote] = useState("")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchMissionDetails()
  }, [missionId])

  const fetchMissionDetails = async () => {
    try {
      const [missionData, bidData] = await Promise.all([
        apiClient.request<Mission>(`/api/missions/${missionId}`, { requiresAuth: true }),
        apiClient.request<ExistingBid>(`/api/missions/${missionId}/my-bid`, { requiresAuth: true }).catch(() => null),
      ])
      setMission(missionData)
      setExistingBid(bidData)
      if (bidData) {
        setQuote(bidData.quote.toString())
        setMessage(bidData.message)
      }
    } catch (err: any) {
      console.error("[v0] Failed to fetch mission details:", err)
      setError(err.message || "Failed to load mission details")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    try {
      await apiClient.request(`/api/missions/${missionId}/bid`, {
        method: "POST",
        requiresAuth: true,
        body: JSON.stringify({
          quote: Number.parseFloat(quote),
          message,
        }),
      })
      router.push("/contractor/bids")
    } catch (err: any) {
      setError(err.message || "Failed to submit bid")
    } finally {
      setSubmitting(false)
    }
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

  if (error && !mission) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-card border rounded-lg p-6" style={{ borderColor: "#dd3f55" }}>
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: "#dd3f55" }} />
            <div>
              <h3 className="font-semibold text-foreground mb-1">Error</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!mission) return null

  return (
    <div className="max-w-6xl mx-auto">
      <button onClick={() => router.back()} className="text-primary hover:underline mb-6" style={{ color: "#142c57" }}>
        ← Back to Browse
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

          {/* Bid Form */}
          {existingBid ? (
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Your Bid</h2>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Quote</p>
                  <p className="text-2xl font-bold" style={{ color: "#142c57" }}>
                    ${existingBid.quote.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Message</p>
                  <p className="text-foreground">{existingBid.message}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Status</p>
                  <span
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize"
                    style={{ backgroundColor: "#142c57", color: "#fffefe" }}
                  >
                    {existingBid.status}
                  </span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    Submitted on {format(new Date(existingBid.created_at), "MMM d, yyyy")}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Submit Your Bid</h2>

              {error && (
                <div className="bg-card border rounded-lg p-4 mb-4" style={{ borderColor: "#dd3f55" }}>
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: "#dd3f55" }} />
                    <p className="text-sm" style={{ color: "#dd3f55" }}>
                      {error}
                    </p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmitBid} className="space-y-6">
                <div>
                  <label htmlFor="quote" className="block text-sm font-medium text-foreground mb-2">
                    Your Quote ($) *
                  </label>
                  <input
                    id="quote"
                    type="number"
                    value={quote}
                    onChange={(e) => setQuote(e.target.value)}
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                    placeholder="5000"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-foreground mb-2">
                    Message to Homeowner *
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    rows={6}
                    className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground resize-none"
                    placeholder="Introduce yourself, explain your approach, timeline, and why you're the best fit for this project..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ backgroundColor: "#142c57", color: "#fffefe" }}
                >
                  {submitting && <Loader2 className="h-5 w-5 animate-spin" />}
                  {submitting ? "Submitting..." : "Submit Bid"}
                  {!submitting && <Send className="h-5 w-5" />}
                </button>
              </form>
            </div>
          )}
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
    </div>
  )
}
