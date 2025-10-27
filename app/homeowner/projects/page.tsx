"use client"

import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"
import Link from "next/link"
import { Loader2, AlertCircle, Plus, Eye } from "lucide-react"
import { format } from "date-fns"

interface Mission {
  id: number
  title: string
  service: string
  status: string
  postal_code: string
  created_at: string
  bid_count: number
}

export default function MyProjectsPage() {
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
      setError(err.message || "Failed to load projects")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" style={{ color: "#142c57" }} />
          <p className="text-muted-foreground">Loading your projects...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">My Projects</h1>
          <p className="text-muted-foreground">View and manage all your posted missions</p>
        </div>
        <Link
          href="/homeowner/post-mission"
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors"
          style={{ backgroundColor: "#142c57", color: "#fffefe" }}
        >
          <Plus className="h-5 w-5" />
          New Mission
        </Link>
      </div>

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

      {missions.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <div
            className="h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "#142c57" + "10" }}
          >
            <Plus className="h-8 w-8" style={{ color: "#142c57" }} />
          </div>
          <h3 className="text-xl font-semibold text-foreground mb-2">No projects yet</h3>
          <p className="text-muted-foreground mb-6">Post your first mission to get started</p>
          <Link
            href="/homeowner/post-mission"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors"
            style={{ backgroundColor: "#142c57", color: "#fffefe" }}
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
              className="block bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-foreground mb-2">{mission.title}</h3>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span className="font-medium" style={{ color: "#142c57" }}>
                      {mission.service}
                    </span>
                    <span>•</span>
                    <span>{mission.postal_code}</span>
                    <span>•</span>
                    <span>{format(new Date(mission.created_at), "MMM d, yyyy")}</span>
                    <span>•</span>
                    <span className="capitalize">{mission.status}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-foreground">{mission.bid_count}</p>
                    <p className="text-xs text-muted-foreground">Bids</p>
                  </div>
                  <Eye className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
