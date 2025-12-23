"use client"

import { useState, useEffect } from "react"
import { Search, Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { usePageTitle } from "@/hooks/use-page-title"

interface AuditLog {
  id: number
  admin_name: string
  admin_email: string
  action: string
  resource: string
  details: any
  ip_address: string
  created_at: string
}

export default function AuditLogsPage() {
  usePageTitle("Audit Logs")

  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    try {
      setLoading(true)
      const data = await apiClient.request<{ logs: AuditLog[] }>("/api/admin/audit-logs", {
        requiresAuth: true,
      })
      setLogs(data.logs)
    } catch (error) {
      console.error("Error fetching audit logs:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLogs = logs.filter(
    (log) =>
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.admin_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-gray-600 mt-2">Track all administrative actions on the platform</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Admin Activity Log</h2>
          <p className="text-sm text-gray-600">Complete history of admin actions and changes</p>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by action, admin, or resource..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F3D3E] focus:border-transparent"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#0F3D3E]" />
          </div>
        ) : (
          <div className="space-y-4">
            {filteredLogs.map((log) => (
              <div key={log.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="text-gray-600 text-sm font-medium">O</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-medium text-gray-900">{log.action}</span>
                      <span className="text-gray-500">on</span>
                      <span className="font-medium text-gray-900">{log.resource}</span>
                      {log.action.toLowerCase().includes("delete") && (
                        <span className="bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded font-medium">
                          DELETE_feedback
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      <span className="font-medium text-gray-900">{log.admin_name}</span> ({log.admin_email})
                    </p>
                    <pre className="bg-gray-50 p-3 rounded text-xs text-gray-700 overflow-x-auto mb-2">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>{new Date(log.created_at).toLocaleString()}</span>
                      <span>IP: {log.ip_address}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
