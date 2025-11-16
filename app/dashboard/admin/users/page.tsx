"use client"

import { useState, useEffect } from "react"
import { useRouter } from 'next/navigation'
import { apiClient } from "@/lib/api-client"
import { Loader2, Search, Ban, CheckCircle, UserCog } from 'lucide-react'
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface User {
  id: number
  name: string
  email: string
  phone_number: string
  role: string
  city: string
  region: string
  phone_verified: boolean
  is_verified: boolean
  is_banned: boolean
  company_name?: string
}

interface Stats {
  totalUsers: number
  homeowners: number
  contractors: number
}

export default function UsersPage() {
  const [loading, setLoading] = useState(true)
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, homeowners: 0, contractors: 0 })
  const router = useRouter()

  useEffect(() => {
    fetchUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm, roleFilter])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const data = await apiClient.request<{ users: User[] }>("/api/admin/users", {
        requiresAuth: true,
      })
      setUsers(data.users)

      // Calculate stats
      const totalUsers = data.users.length
      const homeowners = data.users.filter((u) => u.role === "homeowner").length
      const contractors = data.users.filter((u) => u.role === "contractor").length
      setStats({ totalUsers, homeowners, contractors })
    } catch (error: any) {
      console.error("Error fetching users:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone_number?.includes(searchTerm) ||
          user.id.toString().includes(searchTerm),
      )
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter((user) => user.role === roleFilter)
    }

    setFilteredUsers(filtered)
  }

  const handleImpersonate = async (userId: number) => {
    const targetUser = users.find((u) => u.id === userId)
    if (!targetUser) return

    if (!confirm(`Are you sure you want to switch to ${targetUser.name}'s account?`)) {
      return
    }

    try {
      const response = await apiClient.request<{ token: string; user: any }>(`/api/admin/impersonate/${userId}`, {
        method: "POST",
        requiresAuth: true,
      })

      // Save both tokens
      const currentToken = localStorage.getItem("token")
      if (currentToken) {
        localStorage.setItem("admin_token", currentToken)
      }

      // Save the new token and user data
      localStorage.setItem("token", response.token)
      localStorage.setItem("user", JSON.stringify(response.user))

      // Redirect based on role
      if (response.user.role === "contractor") {
        window.location.href = "/dashboard/contractor"
      } else if (response.user.role === "homeowner") {
        window.location.href = "/dashboard/homeowner"
      } else {
        window.location.href = "/"
      }
    } catch (error) {
      console.error("Error impersonating user:", error)
      alert("Failed to impersonate user")
    }
  }

  const handleBanToggle = async (userId: number, currentlyBanned: boolean) => {
    const action = currentlyBanned ? "unban" : "ban"
    if (!confirm(`Are you sure you want to ${action} user #${userId}?`)) {
      return
    }

    try {
      // Backend expects /api/admin/users/:id/ban with is_banned in body
      await apiClient.request(`/api/admin/users/${userId}/ban`, {
        method: "POST",
        requiresAuth: true,
        body: JSON.stringify({
          is_banned: !currentlyBanned,
          reason: currentlyBanned ? null : "Banned by admin",
        }),
      })
      fetchUsers() // Refresh the list
    } catch (error) {
      console.error(`Error ${action}ning user:`, error)
      alert(`Failed to ${action} user`)
    }
  }

  const handleVerifyToggle = async (userId: number, currentlyVerified: boolean) => {
    const action = currentlyVerified ? "unverify" : "verify"
    if (!confirm(`Are you sure you want to ${action} user #${userId}?`)) {
      return
    }

    try {
      await apiClient.request(`/api/admin/users/${userId}/${action}`, {
        method: "POST",
        requiresAuth: true,
      })
      fetchUsers() // Refresh the list
    } catch (error) {
      console.error(`Error ${action}ing user:`, error)
      alert(`Failed to ${action} user`)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#0F3D3E]" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-500 mt-2">View, search, and manage platform users</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-white border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-2">Total Users</p>
          <p className="text-4xl font-bold text-gray-900">{stats.totalUsers}</p>
        </Card>

        <Card className="p-6 bg-white border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-2">Homeowners</p>
          <p className="text-4xl font-bold text-green-600">{stats.homeowners}</p>
        </Card>

        <Card className="p-6 bg-white border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-2">Contractors</p>
          <p className="text-4xl font-bold text-purple-600">{stats.contractors}</p>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by name, email, phone, or user ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F3D3E] focus:border-transparent"
          />
        </div>

        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F3D3E] focus:border-transparent bg-white min-w-[140px]"
        >
          <option value="all">All Roles</option>
          <option value="homeowner">Homeowner</option>
          <option value="contractor">Contractor</option>
        </select>
      </div>

      {/* Users Table */}
      <Card className="bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">User ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Location</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Role</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <span className="text-gray-900 font-medium">#{user.id}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-gray-900 font-medium">{user.name}</span>
                      {user.phone_verified && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full" title="Phone Verified"></div>
                      )}
                      {user.is_verified && <div className="w-2 h-2 bg-yellow-500 rounded-full" title="Verified"></div>}
                    </div>
                    {user.company_name && <p className="text-sm text-gray-500">{user.company_name}</p>}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-700">{user.email}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-700">{user.phone_number}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-gray-700">
                      {user.city}, {user.region}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      className={
                        user.role === "contractor" ? "bg-purple-100 text-purple-700" : "bg-green-100 text-green-700"
                      }
                    >
                      {user.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      {user.is_verified && <CheckCircle className="w-5 h-5 text-green-500" title="Verified" />}
                      {user.is_banned && <Ban className="w-5 h-5 text-red-500" title="Banned" />}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {/* Action buttons for verify, ban, and impersonate */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleVerifyToggle(user.id, user.is_verified)}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-green-600"
                        title={user.is_verified ? "Unverify user" : "Verify user"}
                      >
                        {user.is_verified ? (
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        ) : (
                          <CheckCircle className="w-5 h-5" />
                        )}
                      </button>

                      <button
                        onClick={() => handleBanToggle(user.id, user.is_banned)}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-red-600"
                        title={user.is_banned ? "Unban user" : "Ban user"}
                      >
                        {user.is_banned ? <Ban className="w-5 h-5 text-red-600" /> : <Ban className="w-5 h-5" />}
                      </button>

                      <button
                        onClick={() => handleImpersonate(user.id)}
                        className="p-1.5 rounded hover:bg-gray-100 text-gray-600 hover:text-[#0F3D3E]"
                        title="Switch to this user's account"
                      >
                        <UserCog className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
