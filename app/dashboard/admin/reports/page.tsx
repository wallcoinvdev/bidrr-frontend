"use client"

import { AlertCircle, CheckCircle, Clock, Loader2, XCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"

interface Report {
  report_id: number
  category: string
  reason: string
  status: string
  created_at: string
  conversation_id: number | null
  reporter_id: number
  reporter_first_name: string
  reporter_last_name: string
  reported_user_id: number
  reported_first_name: string
  reported_last_name: string
  reported_user_role: string
}

export default function AdminReports() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState<string>("all")

  useEffect(() => {
    fetchReports()
  }, [filter])

  const fetchReports = async () => {
    try {
      setLoading(true)
      setError("")
      const params = filter !== "all" ? `?status=${filter}` : ""
      const data = await apiClient.request<{ reports: Report[] }>(`/api/reports${params}`, { requiresAuth: true })
      setReports(data.reports)
    } catch (error: any) {
      console.error("[v0] Error fetching reports:", error)
      setError(error.message || "Failed to load reports")
    } finally {
      setLoading(false)
    }
  }

  const updateReportStatus = async (reportId: number, newStatus: string) => {
    try {
      await apiClient.request(`/api/reports/${reportId}`, {
        method: "PATCH",
        body: { status: newStatus },
        requiresAuth: true,
      })
      // Refresh reports after update
      fetchReports()
    } catch (error: any) {
      console.error("[v0] Error updating report:", error)
      alert("Failed to update report status")
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />
      case "reviewed":
        return <CheckCircle className="h-4 w-4 text-blue-600" />
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "dismissed":
        return <XCircle className="h-4 w-4 text-gray-600" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-700"
      case "reviewed":
        return "bg-blue-100 text-blue-700"
      case "resolved":
        return "bg-green-100 text-green-700"
      case "dismissed":
        return "bg-gray-100 text-gray-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "spam":
        return "bg-orange-100 text-orange-700"
      case "harassment":
        return "bg-red-100 text-red-700"
      case "inappropriate":
        return "bg-purple-100 text-purple-700"
      case "scam":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Reports</h1>
          <p className="text-gray-600 mt-2">
            Review reports submitted by users about inappropriate behavior or policy violations
          </p>
        </div>

        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">All Reports</option>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="resolved">Resolved</option>
          <option value="dismissed">Dismissed</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading reports...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 mb-1">Error Loading Reports</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reports Found</h3>
          <p className="text-gray-600">There are no reports matching your filter criteria.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Reporter</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Reported User</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Category</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Reason</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((report) => (
                  <tr key={report.report_id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm text-gray-900">#{report.report_id}</td>
                    <td className="py-3 px-4 text-sm text-gray-900">
                      {report.reporter_first_name} {report.reporter_last_name}
                    </td>
                    <td className="py-3 px-4">
                      <div>
                        <p className="text-sm text-gray-900">
                          {report.reported_first_name} {report.reported_last_name}
                        </p>
                        <p className="text-xs text-gray-500">{report.reported_user_role}</p>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(report.category)}`}
                      >
                        {report.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">{report.reason}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(report.status)}
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status)}`}>
                          {report.status}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(report.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={report.status}
                        onChange={(e) => updateReportStatus(report.report_id, e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="reviewed">Reviewed</option>
                        <option value="resolved">Resolved</option>
                        <option value="dismissed">Dismissed</option>
                      </select>
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
