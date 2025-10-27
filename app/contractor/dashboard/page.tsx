"use client"

import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { Search, Loader2, AlertCircle, Clock, CheckCircle, XCircle, TrendingUp, Briefcase } from "lucide-react"

interface Stats {
  total_bids: number
  pending_bids: number
  accepted_bids: number
  considering_bids: number
}

interface RecentBid {
  id: number
  mission_id: number
  mission_title: string
  quote: number
  status: string
  created_at: string
}

export default function ContractorDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState<Stats | null>(null)
  const [recentBids, setRecentBids] = useState<RecentBid[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [statsData, bidsData] = await Promise.all([
        apiClient.request<Stats>("/api/contractor/stats", { requiresAuth: true }),
        apiClient.request<RecentBid[]>("/api/contractor/recent-bids", { requiresAuth: true }),
      ])
      setStats(statsData)
      setRecentBids(bidsData)
    } catch (err: any) {
      console.error("[v0] Failed to fetch dashboard data:", err)
      setError(err.message || "Failed to load dashboard")
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
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Welcome back, {user?.full_name}!</h1>
        <p className="text-muted-foreground">Find new missions and manage your bids</p>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6 mb-8">
        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Total Bids</h3>
            <Briefcase className="h-5 w-5" style={{ color: "#426769" }} />
          </div>
          <p className="text-3xl font-bold text-foreground">{stats?.total_bids || 0}</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Pending</h3>
            <Clock className="h-5 w-5" style={{ color: "#426769" }} />
          </div>
          <p className="text-3xl font-bold text-foreground">{stats?.pending_bids || 0}</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Considering</h3>
            <TrendingUp className="h-5 w-5" style={{ color: "#142c57" }} />
          </div>
          <p className="text-3xl font-bold text-foreground">{stats?.considering_bids || 0}</p>
        </div>

        <div className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-muted-foreground">Accepted</h3>
            <CheckCircle className="h-5 w-5" style={{ color: "#426769" }} />
          </div>
          <p className="text-3xl font-bold text-foreground">{stats?.accepted_bids || 0}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Recent Bids</h2>
        <Link
          href="/contractor/browse"
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors"
          style={{ backgroundColor: "#142c57", color: "#fffefe" }}
        >
          <Search className="h-5 w-5" />
          Browse Missions
        </Link>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-card border rounded-lg p-6 mb-6" style={{ borderColor: "#dd3f55" }}>
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: "#dd3f55" }} />
            <div>
              <h3 className="font-semibold text-foreground mb-1">Error Loading Dashboard</h3>
              <p className="text-sm text-muted-foreground">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Recent Bids List */}
      {recentBids.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <div
            className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "#142c57" + "10" }}
          >
            <Search className="h-8 w-8" style={{ color: "#142c57" }} />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No bids yet</h3>
          <p className="text-muted-foreground mb-6">Start browsing missions and submit your first bid</p>
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
          {recentBids.map((bid) => (
            <Link
              key={bid.id}
              href={`/contractor/missions/${bid.mission_id}`}
              className="block bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">{bid.mission_title}</h3>
                  <div className="flex items-center gap-2">{getStatusBadge(bid.status)}</div>
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
