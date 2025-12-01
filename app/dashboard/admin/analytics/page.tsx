"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { Loader2, TrendingUp, Target, MessageSquare, BarChart3 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface AnalyticsData {
  heroHeadingStats: Array<{
    variation_id: string
    variation_text: string
    conversion_count: number
    conversion_percentage: number
  }>
  growthStats: Array<{ month: string; new_users: number; new_homeowners: number; new_contractors: number }>
  activityStats: {
    total_conversations: number
    total_messages: number
    total_missions: number
    completed_missions: number
    open_missions: number
    total_bids: number
  }
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<AnalyticsData | null>(null)

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      const response = await apiClient.request<AnalyticsData>("/api/admin/stats", {
        requiresAuth: true,
      })
      setData(response)
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#0F3D3E]" />
      </div>
    )
  }

  const completionRate = data?.activityStats?.total_missions
    ? (data.activityStats.completed_missions / data.activityStats.total_missions) * 100
    : 0
  const openRate = data?.activityStats?.total_missions
    ? (data.activityStats.open_missions / data.activityStats.total_missions) * 100
    : 0
  const avgBidsPerMission = data?.activityStats?.total_missions
    ? data.activityStats.total_bids / data.activityStats.total_missions
    : 0

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-2">Detailed platform metrics and growth trends</p>
      </div>

      {/* A/B Test Section */}
      <Card className="p-6 bg-white border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <Target className="w-5 h-5 text-purple-600" />
          <h2 className="text-xl font-bold text-gray-900">Homepage H1 Variations - A/B Test</h2>
        </div>
        <p className="text-sm text-gray-600 mb-6">
          Tracking which homepage hero heading drives the most user registrations
        </p>

        <div className="mb-4 border-b border-gray-200">
          <div className="flex gap-4">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 border-b-2 border-gray-900">
              Variant Name
            </button>
            <span className="ml-auto px-4 py-2 text-sm font-medium text-gray-700">Conversions</span>
          </div>
        </div>

        {data?.heroHeadingStats && data.heroHeadingStats.length > 0 ? (
          <div className="space-y-3">
            {data.heroHeadingStats.map((variant) => (
              <div
                key={variant.variation_id}
                className="flex items-center justify-between py-3 border-b border-gray-100"
              >
                <div>
                  <p className="font-medium text-gray-900">Variation {variant.variation_id}</p>
                  <p className="text-sm text-gray-600">{variant.variation_text}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900">{variant.conversion_count}</p>
                  <p className="text-sm text-gray-600">{variant.conversion_percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">No conversion data yet</p>
              <p className="text-sm text-gray-400 mt-1">Data will appear once users sign up with tracked variations</p>
            </div>
          </div>
        )}
      </Card>

      {/* User Growth */}
      <Card className="p-6 bg-white border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">User Growth (Last 12 Months)</h2>
        </div>

        <div className="space-y-4">
          {data?.growthStats?.map((month, index) => {
            const homeownerPercent = month.new_users > 0 ? (month.new_homeowners / month.new_users) * 100 : 0
            const contractorPercent = month.new_users > 0 ? (month.new_contractors / month.new_users) * 100 : 0

            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">{month.month}</span>
                  <span className="text-sm font-semibold text-gray-900">{month.new_users} users</span>
                </div>
                <div className="h-10 flex rounded-lg overflow-hidden">
                  <div
                    className="bg-green-500 flex items-center justify-center text-white text-sm font-semibold"
                    style={{ width: `${homeownerPercent}%` }}
                  >
                    {month.new_homeowners > 0 && month.new_homeowners}
                  </div>
                  <div
                    className="bg-purple-500 flex items-center justify-center text-white text-sm font-semibold"
                    style={{ width: `${contractorPercent}%` }}
                  >
                    {month.new_contractors > 0 && month.new_contractors}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="flex items-center gap-6 mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Customers</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span className="text-sm text-gray-600">Contractors</span>
          </div>
        </div>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-sm text-gray-600 mb-2">Total Conversations</p>
          <p className="text-4xl font-bold text-gray-900">{data?.activityStats?.total_conversations || 0}</p>
          <p className="text-sm text-gray-500 mt-2">Active conversations</p>
        </Card>

        <Card className="p-6 bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-sm text-gray-600 mb-2">Total Messages</p>
          <p className="text-4xl font-bold text-gray-900">{data?.activityStats?.total_messages || 0}</p>
          <p className="text-sm text-gray-500 mt-2">Messages exchanged</p>
        </Card>

        <Card className="p-6 bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <BarChart3 className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-sm text-gray-600 mb-2">Avg Bids per Mission</p>
          <p className="text-4xl font-bold text-gray-900">{avgBidsPerMission.toFixed(1)}</p>
          <p className="text-sm text-gray-500 mt-2">Engagement rate</p>
        </Card>
      </div>

      {/* Mission Completion Rate */}
      <Card className="p-6 bg-white border border-gray-200 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <Target className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold text-gray-900">Mission Completion Rate</h2>
        </div>

        <div className="space-y-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Completed</span>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">{data?.activityStats?.completed_missions || 0} missions</span>
                <span className="text-2xl font-bold text-green-600">{completionRate.toFixed(0)}%</span>
              </div>
            </div>
            <Progress value={completionRate} className="h-2" />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Open</span>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">{data?.activityStats?.open_missions || 0} missions</span>
                <span className="text-2xl font-bold text-blue-600">{openRate.toFixed(0)}%</span>
              </div>
            </div>
            <Progress value={openRate} className="h-2" />
          </div>
        </div>
      </Card>
    </div>
  )
}
