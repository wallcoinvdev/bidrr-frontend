"use client"

import { BarChart3, TrendingUp, Users, Loader2, AlertCircle, Target } from "lucide-react"
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"

interface AdminStats {
  userStats: {
    total_users: number
    total_homeowners: number
    total_contractors: number
  }
  activityStats: {
    total_missions: number
    open_missions: number
    completed_missions: number
    total_bids: number
    total_conversations: number
    total_messages: number
  }
  growthStats: Array<{
    month: string
    new_users: number
    new_homeowners: number
    new_contractors: number
  }>
  heroHeadingStats?: Array<{
    variation_id: string
    variation_text: string
    conversion_count: number
    conversion_percentage: number
  }>
}

export default function AdminAnalytics() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchAdminStats()
  }, [])

  const fetchAdminStats = async () => {
    try {
      setLoading(true)
      setError("")
      console.log("[v0] Fetching admin stats from /api/admin/stats")
      const data = await apiClient.request<AdminStats>("/api/admin/stats", { requiresAuth: true })
      console.log("[v0] Admin stats received:", data)
      console.log("[v0] Hero heading stats:", data.heroHeadingStats)
      setStats(data)
    } catch (error: any) {
      console.error("[v0] Error fetching admin stats:", error)
      console.error("[v0] Error name:", error.name)
      console.error("[v0] Error message:", error.message)
      console.error("[v0] Error statusCode:", error.statusCode)
      console.error("[v0] Error errorData:", error.errorData)
      console.error("[v0] Full error object:", JSON.stringify(error, null, 2))
      setError(error.message || "Failed to load analytics")
    } finally {
      setLoading(false)
    }
  }

  const headingVariations: Record<string, string> = {
    A: "Get Fair Bids—Let Contractors Compete for Your Job",
    B: "Stop Searching. Let Contractors Bid on Your Work",
    C: "Fair Prices. Fast Bids. Contractors Compete for Your Work",
    D: "Skip the Search—Let Contractors Compete for Your Work",
    E: "Stop Searching for Contractors—Let Them Bid on Your Work at a Fair Price",
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-600 mt-2">Detailed platform metrics and growth trends</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading analytics...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Error Loading Analytics</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        </div>
      ) : stats ? (
        <>
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-purple-600" />
              <h3 className="text-lg font-bold text-gray-900">Homepage H1 Variations - A/B Test</h3>
            </div>
            <p className="text-sm text-gray-600 mb-6">
              Tracking which homepage hero heading drives the most user registrations
            </p>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Variant Name</th>
                    <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">Conversions</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.heroHeadingStats && stats.heroHeadingStats.length > 0 ? (
                    stats.heroHeadingStats
                      .sort((a, b) => b.conversion_count - a.conversion_count)
                      .map((variation) => {
                        const variantText = headingVariations[variation.variation_id] || variation.variation_text
                        return (
                          <tr key={variation.variation_id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-4 px-4">
                              <div className="flex items-start gap-3">
                                <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-1 rounded flex-shrink-0">
                                  {variation.variation_id}
                                </span>
                                <span className="text-sm text-gray-900">{variantText}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <span className="text-lg font-bold text-gray-900">{variation.conversion_count}</span>
                            </td>
                          </tr>
                        )
                      })
                  ) : (
                    <tr>
                      <td colSpan={2} className="py-8 px-4 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <AlertCircle className="h-8 w-8 text-gray-400" />
                          <p className="text-sm text-gray-600">No conversion data yet</p>
                          <p className="text-xs text-gray-500">
                            Data will appear once users sign up with tracked variations
                          </p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* User Growth Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">User Growth (Last 12 Months)</h3>
            </div>
            <div className="space-y-4">
              {stats.growthStats.length === 0 ? (
                <p className="text-sm text-gray-500">No growth data available</p>
              ) : (
                stats.growthStats.map((month, index) => {
                  const maxUsers = Math.max(...stats.growthStats.map((m) => m.new_users))
                  const barWidth = (month.new_users / maxUsers) * 100

                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600 font-medium">{month.month}</span>
                        <span className="text-gray-900 font-bold">{month.new_users} users</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-8 overflow-hidden flex">
                          <div
                            className="bg-green-500 flex items-center justify-center text-xs text-white font-medium"
                            style={{ width: `${(month.new_homeowners / month.new_users) * 100}%` }}
                          >
                            {month.new_homeowners > 0 && month.new_homeowners}
                          </div>
                          <div
                            className="bg-purple-500 flex items-center justify-center text-xs text-white font-medium"
                            style={{ width: `${(month.new_contractors / month.new_users) * 100}%` }}
                          >
                            {month.new_contractors > 0 && month.new_contractors}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
            <div className="flex items-center gap-4 mt-6 pt-4 border-t border-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Homeowners</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Contractors</span>
              </div>
            </div>
          </div>

          {/* Platform Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Total Conversations</h3>
                <BarChart3 className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {stats.activityStats.total_conversations.toLocaleString()}
              </p>
              <p className="text-sm text-gray-500 mt-1">Active conversations</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Total Messages</h3>
                <BarChart3 className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.activityStats.total_messages.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-1">Messages exchanged</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Avg Bids per Mission</h3>
                <BarChart3 className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">
                {stats.activityStats.total_missions > 0
                  ? (stats.activityStats.total_bids / stats.activityStats.total_missions).toFixed(1)
                  : "0"}
              </p>
              <p className="text-sm text-gray-500 mt-1">Engagement rate</p>
            </div>
          </div>

          {/* Completion Rate */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-4">
              <Users className="h-5 w-5 text-blue-600" />
              <h3 className="text-lg font-bold text-gray-900">Mission Completion Rate</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Completed</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {stats.activityStats.completed_missions} missions
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-green-500 h-full"
                      style={{
                        width: `${
                          stats.activityStats.total_missions > 0
                            ? (stats.activityStats.completed_missions / stats.activityStats.total_missions) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
                <span className="text-2xl font-bold text-green-600">
                  {stats.activityStats.total_missions > 0
                    ? Math.round((stats.activityStats.completed_missions / stats.activityStats.total_missions) * 100)
                    : 0}
                  %
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-600">Open</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {stats.activityStats.open_missions} missions
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
                    <div
                      className="bg-blue-500 h-full"
                      style={{
                        width: `${
                          stats.activityStats.total_missions > 0
                            ? (stats.activityStats.open_missions / stats.activityStats.total_missions) * 100
                            : 0
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
                <span className="text-2xl font-bold text-blue-600">
                  {stats.activityStats.total_missions > 0
                    ? Math.round((stats.activityStats.open_missions / stats.activityStats.total_missions) * 100)
                    : 0}
                  %
                </span>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
