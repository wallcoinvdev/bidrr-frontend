"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { Loader2, Search, Eye, Flag, Trash2, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { usePageTitle } from "@/hooks/use-page-title"
import { BidMeter } from "@/components/bid-meter"

interface Job {
  id: number
  title: string
  description?: string
  job_details?: string
  service: string
  status: string
  city: string
  region: string
  country: string
  address?: string
  postal_code?: string
  latitude?: number
  longitude?: number
  bid_count?: number
  homeowner_name?: string
  user_id: number
  created_at: string
  is_flagged: boolean
  flag_reason?: string
}

function JobDetailsModal({ job, onClose }: { job: Job | null; onClose: () => void }) {
  if (!job) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-x-hidden">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Job Details</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 break-words">{job.title}</h3>
              <Badge className={getStatusColor(job.status)}>{job.status === "completed" ? "hired" : job.status}</Badge>
              {job.is_flagged && <Badge className="bg-red-100 text-red-700">Flagged</Badge>}
            </div>
            <p className="text-gray-600 break-words">{job.description || job.job_details || "No description"}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Service Type</label>
              <p className="text-gray-900 break-words">{job.service || "N/A"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Status</label>
              <p className="text-gray-900 capitalize">{job.status === "completed" ? "hired" : job.status}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Location</label>
              <p className="text-gray-900 break-words">
                {job.city && job.region && job.country ? `${job.city}, ${job.region}, ${job.country}` : "N/A"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Posted By</label>
              <p className="text-gray-900 break-words">{job.homeowner_name || "Unknown"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Number of Bids</label>
              <p className="text-gray-900">{job.bid_count || 0}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-500">Posted Date</label>
              <p className="text-gray-900">{new Date(job.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          {job.is_flagged && job.flag_reason && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <label className="text-sm font-medium text-red-900">Flag Reason</label>
              <p className="text-red-700 mt-1 break-words">{job.flag_reason}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case "open":
      return "bg-blue-100 text-blue-700"
    case "completed":
      return "bg-green-100 text-green-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

export default function AdminJobsPage() {
  usePageTitle("Job Management")

  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [jobs, setJobs] = useState<Job[]>([])
  const [displayedJobs, setDisplayedJobs] = useState<Job[]>([])
  const [total, setTotal] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [page, setPage] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  const fetchJobs = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true)
        setPage(0)
      } else {
        setLoadingMore(true)
      }

      const currentPage = reset ? 0 : page
      const params = new URLSearchParams({
        limit: "10",
        offset: (currentPage * 10).toString(),
      })

      if (statusFilter !== "all" && statusFilter !== "flagged") {
        params.append("status", statusFilter)
      }

      const data = await apiClient.request<{ jobs: Job[]; total: number; hasMore: boolean }>(
        `/api/admin/jobs?${params.toString()}`,
        {
          requiresAuth: true,
        },
      )

      if (reset) {
        setDisplayedJobs(data.jobs || [])
        setJobs(data.jobs || [])
      } else {
        setDisplayedJobs((prev) => [...prev, ...(data.jobs || [])])
        setJobs((prev) => [...prev, ...(data.jobs || [])])
      }

      setTotal(data.total || 0)
      setHasMore(data.hasMore || false)
      setPage(currentPage + 1)
    } catch (error: any) {
      console.error("Error fetching jobs:", error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }

  useEffect(() => {
    fetchJobs(true)
  }, [])

  useEffect(() => {
    fetchJobs(true)
  }, [statusFilter])

  const filteredJobs = displayedJobs.filter((job) => {
    // Apply search filter
    if (searchTerm) {
      const matchesSearch =
        job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.job_details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.homeowner_name?.toLowerCase().includes(searchTerm.toLowerCase())
      if (!matchesSearch) return false
    }

    // Apply flagged filter
    if (statusFilter === "flagged" && !job.is_flagged) {
      return false
    }

    return true
  })

  const handleToggleFlag = async (jobId: number, isFlagged: boolean) => {
    try {
      if (isFlagged) {
        await apiClient.request(`/api/admin/jobs/${jobId}/unflag`, {
          method: "POST",
          requiresAuth: true,
        })
      } else {
        const reason = prompt("Enter reason for flagging this job:")
        if (!reason) return

        await apiClient.request(`/api/admin/jobs/${jobId}/flag`, {
          method: "POST",
          body: { reason },
          requiresAuth: true,
        })
      }

      await fetchJobs(true)
    } catch (error: any) {
      console.error("Error toggling flag:", error)
      alert(error.message || "Failed to update flag status")
    }
  }

  const handleDelete = async (jobId: number, jobTitle: string) => {
    if (!confirm(`Are you sure you want to delete the job "${jobTitle}"? This action cannot be undone.`)) {
      return
    }

    try {
      await apiClient.request(`/api/admin/jobs/${jobId}`, {
        method: "DELETE",
        requiresAuth: true,
      })

      await fetchJobs(true)
    } catch (error: any) {
      console.error("Error deleting job:", error)
      alert(error.message || "Failed to delete job")
    }
  }

  const openCount = jobs.filter((j) => j.status === "open").length
  const completedCount = jobs.filter((j) => j.status === "completed").length
  const flaggedCount = jobs.filter((j) => j.is_flagged).length

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
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">Job Management</h1>
        <p className="text-gray-500 mt-2">Monitor and manage all job postings on the platform</p>
      </div>

      {/* Job Overview */}
      <Card className="p-4 sm:p-6 bg-white border border-gray-200 shadow-sm">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Job Overview</h2>
        <p className="text-sm text-gray-600 mb-6">View and manage all jobs posted on Bidrr</p>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F3D3E] focus:border-transparent text-sm sm:text-base"
            />
          </div>
        </div>

        {/* Status Tabs - Removed "In Progress" tab, renamed "Completed" to "Hired" */}
        <div className="mb-6 overflow-x-auto -mx-4 sm:mx-0 px-4 sm:px-0">
          <div className="flex gap-2 border-b border-gray-200 min-w-max">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 sm:px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                statusFilter === "all"
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              All Jobs ({total})
            </button>
            <button
              onClick={() => setStatusFilter("open")}
              className={`px-3 sm:px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                statusFilter === "open"
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Open ({openCount})
            </button>
            <button
              onClick={() => setStatusFilter("completed")}
              className={`px-3 sm:px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                statusFilter === "completed"
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Hired ({completedCount})
            </button>
            <button
              onClick={() => setStatusFilter("flagged")}
              className={`px-3 sm:px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                statusFilter === "flagged"
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Flagged ({flaggedCount})
            </button>
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="border border-gray-200 rounded-lg p-3 sm:p-4 hover:border-gray-300 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">{job.title}</h3>
                    <Badge className={getStatusColor(job.status)}>
                      {job.status === "completed" ? "hired" : job.status}
                    </Badge>
                    {job.is_flagged && <Badge className="bg-red-100 text-red-700">Flagged</Badge>}
                  </div>
                  <p className="text-gray-600 text-sm mb-3 break-words">
                    {job.description || job.job_details || "No description"}
                  </p>
                  <div className="flex flex-col gap-2 text-sm text-gray-600">
                    <span className="break-words">
                      <strong>Service:</strong> {job.service || "N/A"}
                    </span>
                    <span className="break-words">
                      <strong>Location:</strong>{" "}
                      {job.city && job.region && job.country ? `${job.city}, ${job.region}, ${job.country}` : "N/A"}
                    </span>
                    <span className="break-words">
                      <strong>Posted by:</strong> {job.homeowner_name || "Unknown"}
                    </span>
                    <span>
                      <strong>Posted:</strong> {new Date(job.created_at).toLocaleDateString()}
                    </span>
                    <div className="mt-1">
                      <BidMeter currentBids={job.bid_count || 0} maxBids={5} showLabel={true} />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 sm:ml-4 justify-end sm:justify-start">
                  <button
                    onClick={() => setSelectedJob(job)}
                    className="p-2 text-gray-600 hover:text-[#0F3D3E] hover:bg-gray-100 rounded-lg transition-colors"
                    title="View"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleToggleFlag(job.id, job.is_flagged)}
                    className={`p-2 rounded-lg transition-colors ${
                      job.is_flagged
                        ? "text-yellow-600 bg-yellow-50 hover:bg-yellow-100"
                        : "text-gray-600 hover:text-yellow-600 hover:bg-yellow-50"
                    }`}
                    title={job.is_flagged ? "Unflag" : "Flag"}
                  >
                    <Flag className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(job.id, job.title)}
                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {filteredJobs.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No jobs found matching your criteria</p>
            </div>
          )}
        </div>

        {hasMore && !searchTerm && statusFilter !== "flagged" && (
          <div className="mt-6 text-center">
            <button
              onClick={() => fetchJobs(false)}
              disabled={loadingMore}
              className="px-6 py-2.5 bg-[#0F3D3E] text-white rounded-lg hover:bg-[#0a2c2d] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
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

      <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  )
}
