"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { usePageTitle } from "@/hooks/use-page-title"
import { Loader2, Users, Home, Briefcase, TrendingUp, MapPin } from "lucide-react"
import Link from "next/link"
import { Card } from "@/components/ui/card"

interface DashboardData {
  metrics: {
    new_users_24h: number
    new_jobs_24h: number
    new_bids_24h: number
    new_messages_24h: number
    banned_users: number
    flagged_jobs: number
    pending_feedback: number
    pending_reports: number
  }
  userStats: {
    total_users: number
    total_homeowners: number
    total_contractors: number
    total_active_contractors: number
    total_temp_contractors: number
  }
  locationStats: Array<{ postal_code: string; user_count: number }>
  recentSignups: Array<{ signup_date: string; homeowner_signups: number; contractor_signups: number }>
  activityStats: {
    total_missions: number
    open_missions: number
    completed_missions: number
    total_bids: number
  }
}

export default function AdminDashboard() {
  usePageTitle("Admin Dashboard")

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<DashboardData | null>(null)
  const [visibleLocations, setVisibleLocations] = useState(5)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await apiClient.request<DashboardData>("/api/admin/stats", {
        requiresAuth: true,
      })
      setData(response)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getTopLocations = (locationStats: Array<{ postal_code: string; user_count: number }> | undefined) => {
    if (!locationStats || locationStats.length === 0) return []
    return locationStats
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#0F3D3E]" />
      </div>
    )
  }

  const topLocations = getTopLocations(data?.locationStats)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500 mt-2">Platform overview and user management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <Card className="p-6 bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Total Users</p>
            <p className="text-4xl font-bold text-gray-900">{data?.userStats?.total_users || 0}</p>
            <Link href="/dashboard/admin/users" className="text-sm text-blue-600 hover:underline inline-block mt-2">
              Click to view all users →
            </Link>
          </div>
        </Card>

        <Card className="p-6 bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Home className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Customers</p>
            <p className="text-4xl font-bold text-gray-900">{data?.userStats?.total_homeowners || 0}</p>
            <Link
              href="/dashboard/admin/users?role=homeowner"
              className="text-sm text-green-600 hover:underline inline-block mt-2"
            >
              Click to view customers →
            </Link>
          </div>
        </Card>

        <Card className="p-6 bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Briefcase className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Contractors (Active)</p>
            <p className="text-4xl font-bold text-gray-900">{data?.userStats?.total_active_contractors || 0}</p>
            <Link
              href="/dashboard/admin/users?role=contractor&temp=false"
              className="text-sm text-purple-600 hover:underline inline-block mt-2"
            >
              Click to view active contractors →
            </Link>
          </div>
        </Card>

        <Card className="p-6 bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-orange-100 rounded-lg">
              <Briefcase className="w-6 h-6 text-orange-600" />
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-gray-600">Contractors (Temp)</p>
            <p className="text-4xl font-bold text-gray-900">{data?.userStats?.total_temp_contractors || 0}</p>
            <Link
              href="/dashboard/admin/users?role=contractor&temp=true"
              className="text-sm text-orange-600 hover:underline inline-block mt-2"
            >
              Click to view temp contractors →
            </Link>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card className="p-6 bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-bold text-gray-900">Platform Activity</h2>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Total Missions</span>
              <span className="text-2xl font-bold text-gray-900">{data?.activityStats?.total_missions || 0}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Open Missions</span>
              <span className="text-2xl font-bold text-green-600">{data?.activityStats?.open_missions || 0}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-600">Total Bids</span>
              <span className="text-2xl font-bold text-gray-900">{data?.activityStats?.total_bids || 0}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-gray-600">Hires</span>
              <span className="text-2xl font-bold text-blue-600">{data?.activityStats?.completed_missions || 0}</span>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <MapPin className="w-5 h-5 text-green-600" />
            <h2 className="text-xl font-bold text-gray-900">Top Locations</h2>
            {topLocations.length > 0 && <span className="text-sm text-gray-500">({topLocations.length})</span>}
          </div>
          <div className="space-y-2">
            {topLocations.slice(0, visibleLocations).map((location, index) => (
              <div
                key={index}
                className="flex justify-between items-center py-3 border-b border-gray-100 last:border-0"
              >
                <span className="text-gray-700">{location.postal_code}</span>
                <span className="text-2xl font-bold text-gray-900">{location.user_count}</span>
              </div>
            ))}
            {topLocations.length === 0 && <p className="text-gray-500 text-center py-8">No location data available</p>}
            {topLocations.length > visibleLocations && (
              <button
                onClick={() => setVisibleLocations((prev) => prev + 5)}
                className="w-full mt-4 px-4 py-2 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg transition-colors text-sm font-medium"
              >
                Load More
              </button>
            )}
          </div>
        </Card>
      </div>

      <Card className="p-4 md:p-6 bg-white border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
          <h2 className="text-lg md:text-xl font-bold text-gray-900">Recent Signups (Last 30 Days)</h2>
          {data?.recentSignups && data.recentSignups.length > 0 && (
            <div className="text-left sm:text-right">
              <p className="text-sm text-gray-600">30-Day Total</p>
              <p className="text-2xl md:text-3xl font-bold text-gray-900">
                {data.recentSignups.reduce(
                  (sum, signup) => sum + signup.homeowner_signups + signup.contractor_signups,
                  0,
                )}
              </p>
            </div>
          )}
        </div>
        <div className="space-y-4">
          {data?.recentSignups?.map((signup, index) => {
            const total = signup.homeowner_signups + signup.contractor_signups
            const homeownerPercent = total > 0 ? (signup.homeowner_signups / total) * 100 : 0
            const contractorPercent = total > 0 ? (signup.contractor_signups / total) * 100 : 0

            return (
              <div key={index} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs sm:text-sm text-gray-600">
                    {new Date(signup.signup_date).toLocaleDateString()}
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-gray-900">{total}</span>
                </div>
                <div className="h-6 sm:h-8 flex rounded-lg overflow-hidden">
                  <div
                    className="bg-green-500 flex items-center justify-center text-white text-xs sm:text-sm font-semibold"
                    style={{ width: `${homeownerPercent}%` }}
                  >
                    {signup.homeowner_signups > 0 && signup.homeowner_signups}
                  </div>
                  <div
                    className="bg-purple-500 flex items-center justify-center text-white text-xs sm:text-sm font-semibold"
                    style={{ width: `${contractorPercent}%` }}
                  >
                    {signup.contractor_signups > 0 && signup.contractor_signups}
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
    </div>
  )
}
