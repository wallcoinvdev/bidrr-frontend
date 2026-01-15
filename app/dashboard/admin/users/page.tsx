"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { Loader2, Search, Ban, UserCog } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { usePageTitle } from "@/hooks/use-page-title"

interface User {
  id: number
  name: string
  email: string
  phone_number: string
  postal_code?: string
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
  usePageTitle("User Management")

  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedFilter, setSelectedFilter] = useState<string>("all")
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, homeowners: 0, contractors: 0 })
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [totalUsers, setTotalUsers] = useState(0)
  const USERS_PER_PAGE = 10
  const router = useRouter()

  const topScrollRef = useRef<HTMLDivElement>(null)
  const bottomScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchUsers(true)
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm])

  const fetchUsers = async (reset = false, filter?: string) => {
    try {
      if (reset) {
        setLoading(true)
        setOffset(0)
      } else {
        setLoadingMore(true)
      }

      const currentOffset = reset ? 0 : offset
      const filterValue = filter !== undefined ? filter : selectedFilter

      let accountType = "active"
      let role = ""

      if (filterValue === "all") {
        accountType = "active"
        role = ""
      } else if (filterValue === "homeowner") {
        accountType = "active"
        role = "homeowner"
      } else if (filterValue === "contractor") {
        accountType = "active"
        role = "contractor"
      } else if (filterValue === "contractor-temp") {
        accountType = "temp"
        role = "contractor"
      }

      const roleParam = role ? `&role=${role}` : ""
      const url = `/api/admin/users?limit=${USERS_PER_PAGE}&offset=${currentOffset}&accountType=${accountType}${roleParam}`

      const data = await apiClient.request<{
        users: User[]
        total: number
        totalHomeowners: number
        totalContractors: number
        hasMore: boolean
      }>(url, {
        requiresAuth: true,
      })

      console.log("[v0] Fetched users from API:", data.users.length, "of", data.total, "total")
      console.log("[v0] Sample user data:", data.users[0])
      console.log(
        "[v0] Postal codes:",
        data.users.map((u) => ({ id: u.id, role: u.role, postal_code: u.postal_code })),
      )

      if (reset) {
        setUsers(data.users)
      } else {
        setUsers((prev) => [...prev, ...data.users])
      }

      setTotalUsers(data.total)
      setHasMore(data.hasMore)

      if (!reset) {
        setOffset(currentOffset + USERS_PER_PAGE)
      } else {
        setOffset(USERS_PER_PAGE)
      }

      setStats({
        totalUsers: data.total,
        homeowners: data.totalHomeowners,
        contractors: data.totalContractors,
      })
    } catch (error: any) {
      console.error("Error in fetchUsers:", error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
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
          user.postal_code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.id.toString().includes(searchTerm),
      )
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
      fetchUsers(true)
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

      const currentToken = localStorage.getItem("auth_token")
      if (currentToken) {
        localStorage.setItem("admin_token", currentToken)
      }

      localStorage.setItem("auth_token", response.token)
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

  const handleFilterChange = (newFilter: string) => {
    setSelectedFilter(newFilter)
    setSearchTerm("") // Clear search when changing filter
    fetchUsers(true, newFilter)
  }

  const handleTopScroll = () => {
    if (topScrollRef.current && bottomScrollRef.current) {
      bottomScrollRef.current.scrollLeft = topScrollRef.current.scrollLeft
    }
  }

  const handleBottomScroll = () => {
    if (topScrollRef.current && bottomScrollRef.current) {
      topScrollRef.current.scrollLeft = bottomScrollRef.current.scrollLeft
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
          <p className="text-4xl font-bold text-gray-900">{totalUsers}</p>
        </Card>

        <Card className="p-6 bg-white border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-2">Customers</p>
          <p className="text-4xl font-bold text-green-600">{stats.homeowners}</p>
        </Card>

        <Card className="p-6 bg-white border border-gray-200 shadow-sm">
          <p className="text-sm text-gray-600 mb-2">Contractors</p>
          <p className="text-4xl font-bold text-purple-600">{stats.contractors}</p>
        </Card>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative order-1 sm:order-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search for users"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F3D3E] focus:border-transparent"
          />
        </div>

        <select
          value={selectedFilter}
          onChange={(e) => handleFilterChange(e.target.value)}
          className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F3D3E] focus:border-transparent bg-white min-w-[180px] order-2 sm:order-2"
        >
          <option value="all">All Roles</option>
          <option value="homeowner">Customers</option>
          <option value="contractor">Contractors (Active)</option>
          <option value="contractor-temp">Contractors (Temp)</option>
        </select>
      </div>

      <Card className="bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div
          ref={topScrollRef}
          onScroll={handleTopScroll}
          className="overflow-x-auto overflow-y-hidden border-b border-gray-200"
          style={{ height: "16px" }}
        >
          <div style={{ width: "max-content", height: "1px" }}>
            {/* This div matches the table width to create the scrollbar */}
            <div style={{ width: "1800px" }}></div>
          </div>
        </div>

        <div ref={bottomScrollRef} onScroll={handleBottomScroll} className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">User ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Email</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Phone</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Postal Code</th>
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
                    <span className="text-gray-700">{user.postal_code || "—"}</span>
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
        {hasMore && filteredUsers.length > 0 && (
          <div className="p-6 border-t border-gray-200 flex justify-center">
            <button
              onClick={() => fetchUsers(false)}
              disabled={loadingMore}
              className="px-6 py-2.5 bg-[#0F3D3E] text-white rounded-lg hover:bg-[#0a2d2e] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
            >
              {loadingMore ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Load More"
              )}
            </button>
          </div>
        )}
      </Card>
    </div>
  )
}
