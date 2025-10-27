"use client"

import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"
import Link from "next/link"
import { Loader2, AlertCircle, Search, Clock, CheckCircle, XCircle, TrendingUp } from "lucide-react"
import { format } from "date-fns"

interface Bid {
  id: number
  mission_id: number
  mission_title: string
  mission_service: string
  quote: number
  status: string
  created_at: string
}

export default function MyBidsPage() {
  const [bids, setBids] = useState<Bid[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [statusFilter, setStatusFilter] = useState("")

  useEffect(() => {
    fetchBids()
  }, [statusFilter])

  const fetchBids = async () => {
    try {
      const params = statusFilter ? `?status=${statusFilter}` : ""
      const data = await apiClient.request<Bid[]>(`/api/contractor/bids${params}`, {
        requiresAuth: true,
      })
      setBids(data)
    } catch (err: any) {
      console.error("[v0] Failed to fetch bids:", err)
      setError(err.message || "Failed to load bids")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; icon: any }> = {
      pending: { bg: "#426769", text: "#fffefe", icon: Clock },
      accepted: { bg: "#426769", text: "#fffefe", icon: CheckCircle },
      considering: { bg: "#142c57", text: "#fffefe", icon: TrendingUp },
      rejected: { bg: "#dd3f55", text: "#fffefe", icon: XCircle },
    }

    const style = styles[status] || styles.pending
    const Icon = style.icon

    return (
      <span
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
        style={{ backgroundColor: style.bg, color: style.text }}
      >
        <Icon className="h-3 w-3" />
        {status.toUpperCase()}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" style={{ color: "#142c57" }} />
          <p className="text-muted-foreground">Loading your bids...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">My Bids</h1>
          <p className="text-muted-foreground">Track all your submitted bids</p>
        </div>
        <Link
          href="/contractor/browse"
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors"
          style={{ backgroundColor: "#142c57", color: "#fffefe" }}
        >
          <Search className="h-5 w-5" />
          Browse Missions
        </Link>
      </div>

      {/* Filter */}
      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <label htmlFor="status" className="block text-sm font-medium text-foreground mb-2">
          Filter by Status
        </label>
        <select
          id="status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full md:w-64 px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="considering">Considering</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-card border rounded-lg p-6 mb-6" style={{ borderColor: "#dd3f55" }}>
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: "#dd3f55" }} />
            <p className="text-sm" style={{ color: "#dd3f55" }}>
              {error}
            </p>
          </div>
        </div>
      )}

      {/* Bids List */}
      {bids.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <div
            className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "#142c57" + "10" }}
          >
            <Search className="h-8 w-8" style={{ color: "#142c57" }} />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No bids found</h3>
          <p className="text-muted-foreground mb-6">
            {statusFilter ? "Try adjusting your filter" : "Start browsing missions and submit your first bid"}
          </p>
          <Link
            href="/contractor/browse"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors"
            style={{ backgroundColor: "#142c57", color: "#fffefe" }}
          >
            <Search className="h-5 w-5" />
            Browse Missions
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bids.map((bid) => (
            <Link
              key={bid.id}
              href={`/contractor/missions/${bid.mission_id}`}
              className="block bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">{bid.mission_title}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground mb-3">
                    <span className="font-medium" style={{ color: "#142c57" }}>
                      {bid.mission_service}
                    </span>
                    <span>•</span>
                    <span>Submitted {format(new Date(bid.created_at), "MMM d, yyyy")}</span>
                  </div>
                  <div>{getStatusBadge(bid.status)}</div>
                </div>

                <div className="text-right">
                  <p className="text-2xl font-bold" style={{ color: "#142c57" }}>
                    ${bid.quote.toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">Your bid</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
