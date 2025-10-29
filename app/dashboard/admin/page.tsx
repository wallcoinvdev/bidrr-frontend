"use client"

import { Users, MapPin, TrendingUp, AlertCircle, Loader2, X, Search } from "lucide-react"
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { useRouter } from "next/navigation"

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
  locationStats: Array<{
    city: string
    state: string
    user_count: number
  }>
  recentSignups: Array<{
    signup_date: string
    signups: number
    homeowner_signups: number
    contractor_signups: number
  }>
}

interface User {
  id: number
  email: string
  full_name: string
  phone: string
  city: string
  region: string
  role: string
  created_at: string
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showUserModal, setShowUserModal] = useState(false)
  const [userModalType, setUserModalType] = useState<"all" | "homeowners" | "contractors">("all")
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [loadingUsers, setLoadingUsers] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchAdminStats()
  }, [])

  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const filtered = users.filter(
        (user) =>
          user.full_name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.phone.includes(query) ||
          user.id.toString().includes(query),
      )
      setFilteredUsers(filtered)
    } else {
      setFilteredUsers(users)
    }
  }, [searchQuery, users])

  const fetchAdminStats = async () => {
    try {
      setLoading(true)
      setError("")
      const data = await apiClient.request<AdminStats>("/api/admin/stats", { requiresAuth: true })
      setStats(data)
    } catch (error: any) {
      console.error("[v0] Error fetching admin stats:", error)
      if (error.status === 403) {
        setError("Access denied. Admin privileges required.")
        setTimeout(() => router.push("/dashboard"), 2000)
      } else {
        const errorMessage = error.message || "Failed to load admin statistics"
        const details = error.details ? ` (${error.details})` : ""
        setError(`${errorMessage}${details}. The backend database may need to be updated.`)
      }
    } finally {
      setLoading(false)
    }
  }

  const fetchUsers = async (type: "all" | "homeowners" | "contractors") => {
    try {
      setLoadingUsers(true)
      setUserModalType(type)
      setShowUserModal(true)
      setSearchQuery("")

      const endpoint =
        type === "all"
          ? "/api/admin/users"
          : `/api/admin/users?role=${type === "homeowners" ? "homeowner" : "contractor"}`

      const data = await apiClient.request<{ users: User[] }>(endpoint, { requiresAuth: true })
      setUsers(data.users)
      setFilteredUsers(data.users)
    } catch (error: any) {
      console.error("[v0] Error fetching users:", error)
      alert("Failed to load users: " + (error.message || "Unknown error"))
    } finally {
      setLoadingUsers(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-600 mt-2">Platform overview and user management</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading admin statistics...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-1">Error Loading Statistics</h3>
              <p className="text-red-700 text-sm mb-3">{error}</p>
              <button
                onClick={fetchAdminStats}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      ) : stats ? (
        <>
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <button
              onClick={() => fetchUsers("all")}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.userStats.total_users.toLocaleString()}</p>
              <p className="text-sm text-blue-600 mt-1 hover:underline">Click to view all users →</p>
            </button>

            <button
              onClick={() => fetchUsers("homeowners")}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Homeowners</h3>
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.userStats.total_homeowners.toLocaleString()}</p>
              <p className="text-sm text-green-600 mt-1 hover:underline">Click to view homeowners →</p>
            </button>

            <button
              onClick={() => fetchUsers("contractors")}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow text-left"
            >
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Contractors</h3>
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{stats.userStats.total_contractors.toLocaleString()}</p>
              <p className="text-sm text-purple-600 mt-1 hover:underline">Click to view contractors →</p>
            </button>
          </div>

          {/* Platform Activity */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">Platform Activity</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Missions</span>
                  <span className="text-xl font-bold text-gray-900">
                    {stats.activityStats.total_missions.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Open Missions</span>
                  <span className="text-xl font-bold text-green-600">
                    {stats.activityStats.open_missions.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Completed Missions</span>
                  <span className="text-xl font-bold text-blue-600">
                    {stats.activityStats.completed_missions.toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Total Bids</span>
                  <span className="text-xl font-bold text-gray-900">
                    {stats.activityStats.total_bids.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Users by Location */}
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <MapPin className="h-5 w-5 text-green-600" />
                <h3 className="text-lg font-bold text-gray-900">Top Locations</h3>
              </div>
              <div className="space-y-3 max-h-[240px] overflow-y-auto">
                {stats.locationStats.length === 0 ? (
                  <p className="text-sm text-gray-500">No location data available</p>
                ) : (
                  stats.locationStats.map((location, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-gray-700">
                        {location.city}, {location.state}
                      </span>
                      <span className="font-semibold text-gray-900">{location.user_count}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Recent Signups Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Recent Signups (Last 30 Days)</h3>
            <div className="space-y-2">
              {stats.recentSignups.length === 0 ? (
                <p className="text-sm text-gray-500">No recent signups</p>
              ) : (
                stats.recentSignups.slice(0, 10).map((day, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <span className="text-sm text-gray-600 w-24">{new Date(day.signup_date).toLocaleDateString()}</span>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden flex">
                        <div
                          className="bg-green-500 flex items-center justify-center text-xs text-white font-medium"
                          style={{ width: `${(day.homeowner_signups / day.signups) * 100}%` }}
                        >
                          {day.homeowner_signups > 0 && day.homeowner_signups}
                        </div>
                        <div
                          className="bg-purple-500 flex items-center justify-center text-xs text-white font-medium"
                          style={{ width: `${(day.contractor_signups / day.signups) * 100}%` }}
                        >
                          {day.contractor_signups > 0 && day.contractor_signups}
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-gray-900 w-8 text-right">{day.signups}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200">
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
        </>
      ) : null}

      {/* User List Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {userModalType === "all"
                    ? "All Users"
                    : userModalType === "homeowners"
                      ? "Homeowners"
                      : "Contractors"}
                </h2>
                <p className="text-gray-600 mt-1">{filteredUsers.length} users found</p>
              </div>
              <button
                onClick={() => setShowUserModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-6 w-6 text-gray-600" />
              </button>
            </div>

            <div className="p-6 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name, email, phone, or user ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loadingUsers ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              ) : filteredUsers.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-600">No users found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">User ID</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Full Name</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Phone</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Location</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Role</th>
                        <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((user) => (
                        <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                          <td className="py-3 px-4 text-sm text-gray-900">#{user.id}</td>
                          <td className="py-3 px-4 text-sm font-medium text-gray-900">{user.full_name}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{user.email}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">{user.phone}</td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {user.city && user.region ? `${user.city}, ${user.region}` : "N/A"}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${
                                user.role === "homeowner"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-purple-100 text-purple-700"
                              }`}
                            >
                              {user.role}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-gray-600">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
