"use client"

import { useEffect, useState } from "react"
import { apiClient } from "@/lib/api-client"
import Link from "next/link"
import { Loader2, AlertCircle, MapPin, Calendar, Filter } from "lucide-react"
import { format } from "date-fns"

interface Mission {
  id: number
  title: string
  service: string
  priority: string
  hiring_likelihood: string
  postal_code: string
  created_at: string
  job_details: string
  has_bid: boolean
}

export default function BrowseMissionsPage() {
  const [missions, setMissions] = useState<Mission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [serviceFilter, setServiceFilter] = useState("")
  const [priorityFilter, setPriorityFilter] = useState("")

  useEffect(() => {
    fetchMissions()
  }, [serviceFilter, priorityFilter])

  const fetchMissions = async () => {
    try {
      const params = new URLSearchParams()
      if (serviceFilter) params.append("service", serviceFilter)
      if (priorityFilter) params.append("priority", priorityFilter)

      const data = await apiClient.request<Mission[]>(`/api/missions/browse?${params.toString()}`, {
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
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" style={{ color: "#142c57" }} />
          <p className="text-muted-foreground">Loading missions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Browse Missions</h1>
        <p className="text-muted-foreground">Find projects that match your expertise</p>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-lg p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold text-foreground">Filters</h3>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="service" className="block text-sm font-medium text-foreground mb-2">
              Service Type
            </label>
            <select
              id="service"
              value={serviceFilter}
              onChange={(e) => setServiceFilter(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
            >
              <option value="">All Services</option>
              <option value="Plumbing">Plumbing</option>
              <option value="Electrical">Electrical</option>
              <option value="HVAC">HVAC</option>
              <option value="Roofing">Roofing</option>
              <option value="Painting">Painting</option>
              <option value="Carpentry">Carpentry</option>
            </select>
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-foreground mb-2">
              Priority
            </label>
            <select
              id="priority"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-4 py-2 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>
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

      {/* Missions List */}
      {missions.length === 0 ? (
        <div className="bg-card border border-border rounded-lg p-12 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-3 text-muted-foreground" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No missions found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or check back later</p>
        </div>
      ) : (
        <div className="space-y-4">
          {missions.map((mission) => (
            <Link
              key={mission.id}
              href={`/contractor/missions/${mission.id}`}
              className="block bg-card border border-border rounded-lg p-6 hover:border-primary transition-colors"
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-foreground">{mission.title}</h3>
                      {mission.has_bid && (
                        <span
                          className="px-2 py-1 rounded text-xs font-medium"
                          style={{ backgroundColor: "#142c57" + "20", color: "#142c57" }}
                        >
                          BID SUBMITTED
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-3">
                      <span className="font-medium" style={{ color: "#142c57" }}>
                        {mission.service}
                      </span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {mission.postal_code}
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(mission.created_at), "MMM d, yyyy")}
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2">{mission.job_details}</p>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    {getPriorityBadge(mission.priority)}
                    <span className="text-xs text-muted-foreground capitalize">{mission.hiring_likelihood}</span>
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
