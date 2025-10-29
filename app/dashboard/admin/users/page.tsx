"use client"

import { Users, Search, Ban, CheckCircle, Loader2, AlertCircle, Shield } from "lucide-react"
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"

interface User {
  id: number
  email: string
  full_name: string
  phone: string
  city: string
  region: string
  role: string
  created_at: string
  is_banned: boolean
  is_verified: boolean
}

export default function AdminUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchQuery, roleFilter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError("")
      const data = await apiClient.request<{ users: User[] }>("/api/admin/users", { requiresAuth: true })
      setUsers(data.users)
    } catch (error: any) {
      console.error("[v0] Error fetching users:", error)
      setError(error.message || "Failed to load users")
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = [...users]

    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (user) =>
          user.full_name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.phone.includes(query) ||
          user.id.toString().includes(query),
      )
    }

    setFilteredUsers(filtered)
  }

  const toggleBanUser = async (userId: number, currentBanStatus: boolean) => {
    try {
      await apiClient.request(`/api/admin/users/${userId}/ban`, {
        method: "POST",
        body: { is_banned: !currentBanStatus },
        requiresAuth: true,
      })
      fetchUsers()
    } catch (error: any) {
      console.error("[v0] Error toggling ban status:", error)
      alert("Failed to update ban status")
    }
  }

  const toggleVerifyUser = async (userId: number, currentVerifyStatus: boolean) => {
    try {
      await apiClient.request(`/api/admin/users/${userId}/verify`, {
        method: "POST",
        body: { is_verified: !currentVerifyStatus },
        requiresAuth: true,
      })
      fetchUsers()
    } catch (error: any) {
      console.error("[v0] Error toggling verify status:", error)
      alert("Failed to update verification status")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-600 mt-2">View, search, and manage platform users</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Total Users</p>
          <p className="text-2xl font-bold text-gray-900">{users.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Homeowners</p>
          <p className="text-2xl font-bold text-green-600">{users.filter((u) => u.role === "homeowner").length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Contractors</p>
          <p className="text-2xl font-bold text-purple-600">{users.filter((u) => u.role === "contractor").length}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone, or user ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Roles</option>
            <option value="homeowner">Homeowners</option>
            <option value="contractor">Contractors</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Error Loading Users</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Users Found</h3>
          <p className="text-gray-600">No users match your search criteria.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">User ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Phone</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Location</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Role</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
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
                          user.role === "homeowner" ? "bg-green-100 text-green-700" : "bg-purple-100 text-purple-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {user.is_verified && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 flex items-center gap-1">
                            <Shield className="h-3 w-3" />
                            Verified
                          </span>
                        )}
                        {user.is_banned && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 flex items-center gap-1">
                            <Ban className="h-3 w-3" />
                            Banned
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleVerifyUser(user.id, user.is_verified)}
                          className={`p-1 rounded hover:bg-gray-100 ${
                            user.is_verified ? "text-blue-600" : "text-gray-400"
                          }`}
                          title={user.is_verified ? "Remove verification" : "Verify user"}
                        >
                          <CheckCircle className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => toggleBanUser(user.id, user.is_banned)}
                          className={`p-1 rounded hover:bg-gray-100 ${user.is_banned ? "text-red-600" : "text-gray-400"}`}
                          title={user.is_banned ? "Unban user" : "Ban user"}
                        >
                          <Ban className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
