"use client"

import { useState, useEffect } from "react"
import { Search, RefreshCw, Trash2, Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { usePageTitle } from "@/hooks/use-page-title"

interface ErrorLog {
  log_id: number
  error_id: string
  error_name: string
  error_message: string
  error_type: string
  timestamp: string
  user_id?: number
  user_email?: string
  endpoint?: string
  status_code?: number
  stack_trace?: string
  severity: string
  resolved: boolean
  created_at: string
}

export default function ErrorLogsPage() {
  usePageTitle("Error Logs")

  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [logs, setLogs] = useState<ErrorLog[]>([])
  const [displayedLogs, setDisplayedLogs] = useState<ErrorLog[]>([])
  const [page, setPage] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const LOGS_PER_PAGE = 10

  useEffect(() => {
    fetchLogs()
  }, [])

  useEffect(() => {
    if (logs.length > 0) {
      const endIndex = (page + 1) * LOGS_PER_PAGE
      setDisplayedLogs(logs.slice(0, endIndex))
    }
  }, [logs, page])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const data = await apiClient.request<{ logs: ErrorLog[]; total: number }>("/api/admin/error-logs", {
        requiresAuth: true,
      })
      setLogs(data.logs || [])
      setPage(0)
    } catch (error) {
      console.error("Error fetching logs:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleClearAll = async () => {
    if (!confirm("Are you sure you want to clear all error logs?")) return
    try {
      await apiClient.request("/api/admin/error-logs", {
        method: "DELETE",
        requiresAuth: true,
      })
      fetchLogs()
    } catch (error) {
      console.error("Error clearing logs:", error)
    }
  }

  const handleLoadMore = () => {
    setLoadingMore(true)
    setTimeout(() => {
      setPage((prev) => prev + 1)
      setLoadingMore(false)
    }, 300)
  }

  const filteredLogs = displayedLogs.filter((log) => {
    const messageMatch = log.error_message?.toLowerCase().includes(searchQuery.toLowerCase()) || false
    const endpointMatch = log.endpoint?.toLowerCase().includes(searchQuery.toLowerCase()) || false
    const emailMatch = log.user_email?.toLowerCase().includes(searchQuery.toLowerCase()) || false
    const matchesSearch = messageMatch || endpointMatch || emailMatch
    const matchesType = typeFilter === "all" || log.error_type === typeFilter
    return matchesSearch && matchesType
  })

  const apiErrors = logs.filter((log) => log.error_type === "backend").length
  const authErrors = logs.filter((log) => log.error_name.toLowerCase().includes("auth")).length
  const networkErrors = logs.filter((log) => log.error_type === "frontend").length
  const buildErrors = logs.filter((log) => log.error_name.toLowerCase().includes("build")).length

  const hasMore = displayedLogs.length < logs.length && filteredLogs.length === displayedLogs.length

  return (
    <div>
      <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Error Logs</h1>
          <p className="text-gray-600 mt-2">Monitor and resolve application errors (frontend and backend)</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={fetchLogs}
            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={handleClearAll}
            className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        </div>
      </div>

      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by error message, endpoint, user, email, or user ID..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F3D3E] focus:border-transparent"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F3D3E] focus:border-transparent"
        >
          <option value="all">All Types</option>
          <option value="frontend">Frontend Errors</option>
          <option value="backend">Backend/API Errors</option>
        </select>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
          <p className="text-xs md:text-sm text-gray-600 mb-1">API Errors</p>
          <p className="text-2xl md:text-3xl font-bold text-gray-900">{apiErrors}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
          <p className="text-xs md:text-sm text-gray-600 mb-1">Auth Errors</p>
          <p className="text-2xl md:text-3xl font-bold text-red-600">{authErrors}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
          <p className="text-xs md:text-sm text-gray-600 mb-1">Network Errors</p>
          <p className="text-2xl md:text-3xl font-bold text-green-600">{networkErrors}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
          <p className="text-xs md:text-sm text-gray-600 mb-1">Build Errors</p>
          <p className="text-2xl md:text-3xl font-bold text-yellow-600">{buildErrors}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#0F3D3E]" />
        </div>
      ) : (
        <>
          <div className="space-y-3">
            {filteredLogs.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                <p className="text-gray-500">No error logs found</p>
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div key={log.log_id} className="bg-white rounded-lg border border-gray-200 p-3 md:p-4">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">Error:</span>
                      <span className="text-sm text-gray-900">{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                    {log.severity === "critical" && (
                      <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded font-medium">CRITICAL</span>
                    )}
                    {log.severity === "high" && (
                      <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded font-medium">HIGH</span>
                    )}
                    {log.error_type === "backend" && (
                      <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded font-medium">API</span>
                    )}
                  </div>

                  <p className="font-medium text-gray-900 mb-2 text-sm md:text-base">{log.error_name}</p>
                  <p className="text-xs md:text-sm text-gray-600 mb-2 break-words">{log.error_message}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 md:gap-4 text-xs md:text-sm mb-2">
                    <div>
                      <span className="text-gray-600">Time:</span>
                      <span className="ml-2 text-gray-900">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Type:</span>
                      <span className="ml-2 text-gray-900">{log.error_type}</span>
                    </div>
                    {log.user_email && (
                      <div>
                        <span className="text-gray-600">Email:</span>
                        <span className="ml-2 text-gray-900">{log.user_email}</span>
                      </div>
                    )}
                  </div>

                  {log.endpoint && (
                    <p className="text-xs md:text-sm text-gray-600 mb-2 break-all">
                      <span className="font-medium">URL:</span> {log.endpoint}
                    </p>
                  )}

                  {log.stack_trace && (
                    <button className="text-sm text-blue-600 hover:underline">View Stack Trace</button>
                  )}
                </div>
              ))
            )}
          </div>

          {hasMore && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-6 py-3 bg-[#0F3D3E] text-white rounded-lg hover:bg-[#0F3D3E]/90 disabled:opacity-50 flex items-center gap-2"
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
        </>
      )}
    </div>
  )
}
