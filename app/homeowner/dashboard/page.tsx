"use client"

import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { Plus, Loader2, AlertCircle, Clock, CheckCircle, XCircle, Eye, TrendingUp } from "lucide-react"
import { format } from "date-fns"

interface Mission {
  id: number
  title: string
  service: string
  status: string
  priority: string
  hiring_likelihood: string
  postal_code: string
  created_at: string
  bid_count: number
  has_considering_bid: boolean
}

export default function HomeownerDashboard() {
  const { user } = useAuth()
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchMissions()
  }, [])

  const fetchMissions = async () => {
    try {
      const data = await apiClient.request<Mission[]>("/api/missions/active", {
        requiresAuth: true,
      })
      setMissions(data)
    } catch (err: any) {
      console.error("[v0] Failed to fetch missions:", err)
      setError(err.message || "Failed to load missions")
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const styles: Record<string, { bg: string; text: string; icon: any }> = {
      open: { bg: "#426769", text: "#fffefe", icon: Clock },
      in_progress: { bg: "#142c57", text: "#fffefe", icon: CheckCircle },
      completed: { bg: "#426769", text: "#fffefe", icon: CheckCircle },
      cancelled: { bg: "#dd3f55", text: "#fffefe", icon: XCircle },
    }

    const style = styles[status] || styles.open
    const Icon = style.icon

    return (
      <span
        className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
        style={{ backgroundColor: style.bg, color: style.text }}
      >
        <Icon className="h-3 w-3" />
        {status.replace("_", " ").toUpperCase()}
      </span>
    )
  }

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      low: "#426769",
      medium: "#142c57",
      high: "#dd3f55",
    }

    return (
      <span
        className="inline-flex items-center px-2 py-1 rounded text-xs font-medium"
        style={{ backgroundColor: colors[priority] + "20", color: colors[priority] }}
      >
        {priority.toUpperCase()}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <Loader2 className="h-16 w-16 animate-spin mx-auto mb-6" style={{ color: "#142c57" }} />
          <p className="text-lg text-gray-500">Loading your missions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Welcome Section with better spacing */}
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-bold mb-3" style={{ color: "#142c57" }}>
          Welcome back, {user?.full_name}!
        </h1>
        <p className="text-xl text-gray-500">Manage your home improvement projects and review contractor bids</p>
      </div>

      {/* Quick Stats with enhanced visual design */}
      <div className="grid md:grid-cols-3 gap-6 mb-12">
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover-lift">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Active Missions</h3>
            <div
              className="h-12 w-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "#426769" + "15" }}
            >
              <Clock className="h-6 w-6" style={{ color: "#426769" }} />
            </div>
          </div>
          <p className="text-5xl font-bold mb-2" style={{ color: "#142c57" }}>
            {missions.filter((m) => m.status === "open").length}
          </p>
          <p className="text-sm text-gray-500">Currently open for bids</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover-lift">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Total Bids</h3>
            <div
              className="h-12 w-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "#142c57" + "15" }}
            >
              <TrendingUp className="h-6 w-6" style={{ color: "#142c57" }} />
            </div>
          </div>
          <p className="text-5xl font-bold mb-2" style={{ color: "#142c57" }}>
            {missions.reduce((sum, m) => sum + m.bid_count, 0)}
          </p>
          <p className="text-sm text-gray-500">From qualified contractors</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover-lift">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Under Review</h3>
            <div
              className="h-12 w-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: "#426769" + "15" }}
            >
              <CheckCircle className="h-6 w-6" style={{ color: "#426769" }} />
            </div>
          </div>
          <p className="text-5xl font-bold mb-2" style={{ color: "#142c57" }}>
            {missions.filter((m) => m.has_considering_bid).length}
          </p>
          <p className="text-sm text-gray-500">Bids you're considering</p>
        </div>
      </div>

      {/* Actions with better visual prominence */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold" style={{ color: "#142c57" }}>
            Your Missions
          </h2>
          <p className="text-gray-500 mt-1">Track and manage all your project requests</p>
        </div>
        <Link
          href="/homeowner/post-mission"
          className="flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base transition-all hover:opacity-90 shadow-sm"
          style={{ backgroundColor: "#142c57", color: "white" }}
        >
          <Plus className="h-5 w-5" />
          Post New Mission
        </Link>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-white border-2 rounded-2xl p-6 mb-8" style={{ borderColor: "#dd3f55" }}>
          <div className="flex items-start gap-4">
            <div
              className="h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "#dd3f55" + "15" }}
            >
              <AlertCircle className="h-6 w-6" style={{ color: "#dd3f55" }} />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1" style={{ color: "#dd3f55" }}>
                Error Loading Missions
              </h3>
              <p className="text-gray-600">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Missions List with enhanced card design */}
      {missions.length === 0 ? (
        <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-gray-100">
          <div
            className="h-24 w-24 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ backgroundColor: "#142c57" + "10" }}
          >
            <Plus className="h-12 w-12" style={{ color: "#142c57" }} />
          </div>
          <h3 className="text-2xl font-bold mb-3" style={{ color: "#142c57" }}>
            No missions yet
          </h3>
          <p className="text-lg text-gray-500 mb-8 max-w-md mx-auto">
            Post your first mission to start receiving competitive bids from verified contractors
          </p>
          <Link
            href="/homeowner/post-mission"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl font-semibold text-base transition-all hover:opacity-90"
            style={{ backgroundColor: "#142c57", color: "white" }}
          >
            <Plus className="h-5 w-5" />
            Post Your First Mission
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {missions.map((mission) => (
            <Link
              key={mission.id}
              href={`/homeowner/missions/${mission.id}`}
              className="block bg-white rounded-2xl p-8 shadow-sm border border-gray-100 hover-lift transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div className="flex-1">
                  <div className="mb-4">
                    <h3 className="text-2xl font-bold mb-2" style={{ color: "#142c57" }}>
                      {mission.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 text-base text-gray-500">
                      <span className="font-semibold" style={{ color: "#426769" }}>
                        {mission.service}
                      </span>
                      <span className="text-gray-300">•</span>
                      <span>{mission.postal_code}</span>
                      <span className="text-gray-300">•</span>
                      <span>Posted {format(new Date(mission.created_at), "MMM d, yyyy")}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {getStatusBadge(mission.status)}
                    {getPriorityBadge(mission.priority)}
                    {mission.has_considering_bid && (
                      <span
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
                        style={{ backgroundColor: "#426769" + "15", color: "#426769" }}
                      >
                        <CheckCircle className="h-4 w-4" />
                        UNDER REVIEW
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-center">
                    <p className="text-4xl font-bold mb-1" style={{ color: "#142c57" }}>
                      {mission.bid_count}
                    </p>
                    <p className="text-sm text-gray-500 font-medium">Bids Received</p>
                  </div>
                  <div
                    className="h-16 w-16 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: "#142c57" + "10" }}
                  >
                    <Eye className="h-7 w-7" style={{ color: "#142c57" }} />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
