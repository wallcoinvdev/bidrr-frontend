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
  const [logs, setLogs] = useState<ErrorLog[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const data = await apiClient.request<{ logs: ErrorLog[]; total: number }>("/api/admin/error-logs", {
        requiresAuth: true,
      })
      setLogs(data.logs || [])
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

  const filteredLogs = logs.filter((log) => {
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

  return (
    <div>
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Error Logs</h1>
          <p className="text-gray-600 mt-2">Monitor and resolve application errors (frontend and backend)</p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchLogs}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
          <button
            onClick={handleClearAll}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear All
          </button>
        </div>
      </div>

      <div className="mb-6 flex gap-4">
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
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F3D3E] focus:border-transparent"
        >
          <option value="all">All Types</option>
          <option value="frontend">Frontend Errors</option>
          <option value="backend">Backend/API Errors</option>
        </select>
      </div>

      <div className="grid grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">API Errors</p>
          <p className="text-3xl font-bold text-gray-900">{apiErrors}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Auth Errors</p>
          <p className="text-3xl font-bold text-red-600">{authErrors}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Network Errors</p>
          <p className="text-3xl font-bold text-green-600">{networkErrors}</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Build Errors</p>
          <p className="text-3xl font-bold text-yellow-600">{buildErrors}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-[#0F3D3E]" />
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
              <p className="text-gray-500">No error logs found</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div key={log.log_id} className="bg-white rounded-lg border border-gray-200 p-4">
                <div className="flex items-start justify-between mb-2">
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

                <p className="font-medium text-gray-900 mb-2">{log.error_name}</p>
                <p className="text-sm text-gray-600 mb-2">{log.error_message}</p>

                <div className="grid grid-cols-3 gap-4 text-sm mb-2">
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
                  <p className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">URL:</span> {log.endpoint}
                  </p>
                )}

                {log.stack_trace && <button className="text-sm text-blue-600 hover:underline">View Stack Trace</button>}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
