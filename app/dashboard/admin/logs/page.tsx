"use client"

import { AlertTriangle, Trash2, Search, Filter, Download } from "lucide-react"
import { useState, useEffect } from "react"
import { errorLogger, type ErrorLog } from "@/lib/error-logger"
import { ConfirmDialog } from "@/components/confirm-dialog"

export default function AdminLogs() {
  const [logs, setLogs] = useState<ErrorLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<ErrorLog[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")
  const [showClearConfirm, setShowClearConfirm] = useState(false)

  useEffect(() => {
    loadLogs()
  }, [])

  useEffect(() => {
    filterLogs()
  }, [logs, searchQuery, filterType])

  const loadLogs = () => {
    const allLogs = errorLogger.getLogs()
    setLogs(allLogs)
  }

  const filterLogs = () => {
    let filtered = [...logs]

    // Filter by type
    if (filterType !== "all") {
      filtered = filtered.filter((log) => log.errorName === filterType)
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (log) =>
          log.error.toLowerCase().includes(query) ||
          log.endpoint?.toLowerCase().includes(query) ||
          log.userEmail?.toLowerCase().includes(query) ||
          log.userId?.toString().includes(query),
      )
    }

    setFilteredLogs(filtered)
  }

  const clearAllLogs = () => {
    errorLogger.clearLogs()
    loadLogs()
  }

  const exportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `error-logs-${new Date().toISOString()}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const getErrorTypeColor = (errorName: string) => {
    switch (errorName) {
      case "ApiError":
        return "bg-red-100 text-red-700"
      case "NetworkError":
        return "bg-orange-100 text-orange-700"
      case "AuthenticationError":
        return "bg-yellow-100 text-yellow-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const uniqueErrorTypes = Array.from(new Set(logs.map((log) => log.errorName)))

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Error Logs</h1>
          <p className="text-gray-600 mt-2">Monitor and track application errors (frontend and backend)</p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full md:w-auto">
          <button
            onClick={exportLogs}
            disabled={logs.length === 0}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
          <button
            onClick={() => setShowClearConfirm(true)}
            disabled={logs.length === 0}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Trash2 className="h-4 w-4" />
            Clear All
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by error message, endpoint, user email, or user ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              {uniqueErrorTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Total Errors</p>
          <p className="text-2xl font-bold text-gray-900">{logs.length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">API Errors</p>
          <p className="text-2xl font-bold text-red-600">{logs.filter((log) => log.errorName === "ApiError").length}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Network Errors</p>
          <p className="text-2xl font-bold text-orange-600">
            {logs.filter((log) => log.errorName === "NetworkError").length}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-sm text-gray-600 mb-1">Auth Errors</p>
          <p className="text-2xl font-bold text-yellow-600">
            {logs.filter((log) => log.errorName === "AuthenticationError").length}
          </p>
        </div>
      </div>

      {filteredLogs.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <AlertTriangle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Error Logs</h3>
          <p className="text-gray-600">
            {logs.length === 0 ? "No errors have been logged yet." : "No errors match your search criteria."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredLogs.map((log) => (
            <div
              key={log.id}
              className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getErrorTypeColor(log.errorName)}`}>
                      {log.errorName}
                    </span>
                    {log.statusCode && (
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {log.statusCode}
                      </span>
                    )}
                    {log.endpoint && <span className="text-xs text-gray-500 font-mono truncate">{log.endpoint}</span>}
                  </div>

                  <p className="text-sm font-medium text-gray-900 mb-2">{log.error}</p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 text-xs text-gray-600">
                    <div>
                      <span className="font-medium">Time:</span> {new Date(log.timestamp).toLocaleString()}
                    </div>
                    {log.userId && (
                      <div>
                        <span className="font-medium">User ID:</span> {log.userId}
                      </div>
                    )}
                    {log.userEmail && (
                      <div className="truncate">
                        <span className="font-medium">Email:</span> {log.userEmail}
                      </div>
                    )}
                    <div className="truncate">
                      <span className="font-medium">URL:</span> {log.url}
                    </div>
                  </div>

                  {log.stack && (
                    <details className="mt-2">
                      <summary className="text-xs text-blue-600 cursor-pointer hover:underline">
                        View Stack Trace
                      </summary>
                      <pre className="mt-2 p-2 bg-gray-50 rounded text-xs overflow-x-auto">{log.stack}</pre>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={clearAllLogs}
        title="Clear All Error Logs?"
        message="This will permanently delete all error logs. This action cannot be undone."
        confirmText="Clear All"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  )
}
