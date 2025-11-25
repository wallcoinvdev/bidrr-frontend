"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { Loader2, Search, Ban, UserCog } from "lucide-react"
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
  services?: string[]
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

      const contractors = data.users.filter((u) => u.role === "contractor")

      console.log("[v0] Total contractors found:", contractors.length)

      const usersWithServices = await Promise.all(
        data.users.map(async (user) => {
          if (user.role === "contractor") {
            try {
              console.log(`[v0] Fetching profile for contractor ${user.id}`)
              const profile = await apiClient.request<any>(`/api/contractors/${user.id}/profile`, {
                requiresAuth: true,
              })

              console.log(`[v0] Contractor ${user.id} profile:`, profile)
              console.log(`[v0] Contractor ${user.id} services:`, profile.services)

              return { ...user, services: profile.services || [] }
            } catch (error: any) {
              console.error(`[v0] Error fetching profile for contractor ${user.id}:`, error)
              return { ...user, services: [] }
            }
          }
          return user
        }),
      )

      console.log("[v0] Users with services:", usersWithServices)

      setUsers(usersWithServices)

      const totalUsers = usersWithServices.length
      const homeowners = usersWithServices.filter((u) => u.role === "homeowner").length
      const contractorsCount = usersWithServices.filter((u) => u.role === "contractor").length
      setStats({ totalUsers, homeowners, contractors: contractorsCount })
    } catch (error: any) {
      console.error("Error in fetchUsers:", error)
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

  const handleBanToggle = async (userId: number, currentlyBanned: boolean) => {
    const action = currentlyBanned ? "unban" : "ban"
    if (!confirm(`Are you sure you want to ${action} user #${userId}?`)) {
      return
    }

    try {
      await apiClient.request(`/api/admin/users/${userId}/ban`, {
        method: "POST",
        requiresAuth: true,
        body: JSON.stringify({
          is_banned: !currentlyBanned,
          reason: currentlyBanned ? null : "Banned by admin",
        }),
      })
      fetchUsers()
    } catch (error) {
      console.error(`Error ${action}ning user:`, error)
      alert(`Failed to ${action} user`)
    }
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

      const currentToken = localStorage.getItem("token")
      if (currentToken) {
        localStorage.setItem("admin_token", currentToken)
      }

      localStorage.setItem("token", response.token)
      localStorage.setItem("user", JSON.stringify(response.user))

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#0F3D3E]" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">User Management</h1>
        <p className="text-gray-500 mt-2">View, search, and manage platform users</p>
      </div>

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
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Services</th>
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
                      {user.is_verified && (
                        <div className="w-2 h-2 bg-orange-500 rounded-full" title="Google Verified"></div>
                      )}
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
                    {user.role === "contractor" && user.services && user.services.length > 0 ? (
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {user.services.map((service, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs bg-gray-50">
                            {service}
                          </Badge>
                        ))}
                      </div>
                    ) : user.role === "contractor" ? (
                      <span className="text-gray-400 text-sm">No services</span>
                    ) : (
                      <span className="text-gray-400 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
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
