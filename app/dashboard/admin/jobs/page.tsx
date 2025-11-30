"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { Loader2, Search, Eye, Flag, Trash2, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Job {
  id: number
  title: string
  description?: string
  job_details?: string
  service: string // Changed from service_type to service (matches backend)
  status: string
  city: string
  region: string
  country: string
  address?: string
  postal_code?: string
  latitude?: number
  longitude?: number
  bids_count?: number // Made optional since backend may not include it
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
              <Badge className={getStatusColor(job.status)}>
                {job.status === "in_progress" ? "in progress" : job.status}
              </Badge>
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
              <p className="text-gray-900 capitalize">{job.status.replace("_", " ")}</p>
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
              <p className="text-gray-900">{job.bids_count || 0}</p>
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
    case "in_progress":
    case "in progress":
      return "bg-yellow-100 text-yellow-700"
    case "completed":
      return "bg-green-100 text-green-700"
    default:
      return "bg-gray-100 text-gray-700"
  }
}

export default function AdminJobsPage() {
  const [loading, setLoading] = useState(true)
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const data = await apiClient.request<{ jobs: Job[] }>("/api/admin/jobs", {
        requiresAuth: true,
      })
      setJobs(data.jobs || [])
    } catch (error: any) {
      console.error("Error fetching jobs:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [])

  useEffect(() => {
    filterJobs()
  }, [searchTerm, statusFilter, jobs])

  const filterJobs = () => {
    let filtered = jobs

    if (searchTerm) {
      filtered = filtered.filter(
        (job) =>
          job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.job_details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.homeowner_name?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      if (statusFilter === "flagged") {
        filtered = filtered.filter((job) => job.is_flagged)
      } else {
        filtered = filtered.filter((job) => job.status === statusFilter)
      }
    }

    setFilteredJobs(filtered)
  }

  const handleToggleFlag = async (jobId: number, isFlagged: boolean) => {
    try {
      if (isFlagged) {
        // Unflag
        await apiClient.request(`/api/admin/jobs/${jobId}/unflag`, {
          method: "POST",
          requiresAuth: true,
        })
      } else {
        // Flag with reason
        const reason = prompt("Enter reason for flagging this job:")
        if (!reason) return

        await apiClient.request(`/api/admin/jobs/${jobId}/flag`, {
          method: "POST",
          body: { reason },
          requiresAuth: true,
        })
      }

      // Refresh jobs list
      await fetchJobs()
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

      // Refresh jobs list
      await fetchJobs()
    } catch (error: any) {
      console.error("Error deleting job:", error)
      alert(error.message || "Failed to delete job")
    }
  }

  const groupJobsByLocation = () => {
    const grouped: { [key: string]: Job[] } = {}

    jobs.forEach((job) => {
      if (job.latitude && job.longitude) {
        const key = `${job.latitude},${job.longitude}`
        if (!grouped[key]) {
          grouped[key] = []
        }
        grouped[key].push(job)
      }
    })

    Object.keys(grouped).forEach((key) => {
      grouped[key].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    })

    return grouped
  }

  const getMapCenter = (): [number, number] => {
    const jobsWithCoords = jobs.filter((j) => j.latitude && j.longitude)
    if (jobsWithCoords.length === 0) return [52.1491, -106.6505] // Default Saskatoon

    const avgLat = jobsWithCoords.reduce((sum, j) => sum + (j.latitude || 0), 0) / jobsWithCoords.length
    const avgLng = jobsWithCoords.reduce((sum, j) => sum + (j.longitude || 0), 0) / jobsWithCoords.length

    return [avgLat, avgLng]
  }

  const openCount = jobs.filter((j) => j.status === "open").length
  const inProgressCount = jobs.filter((j) => j.status === "in_progress").length
  const completedCount = jobs.filter((j) => j.status === "completed").length
  const flaggedCount = jobs.filter((j) => j.is_flagged).length

  const jobsWithLocation = jobs.filter((j) => j.latitude && j.longitude).length
  const groupedJobs = groupJobsByLocation()

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
        <p className="text-sm text-gray-600 mb-6">View and manage all jobs posted on HomeHero</p>

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

        {/* Status Tabs */}
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
              All Jobs ({jobs.length})
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
              onClick={() => setStatusFilter("in_progress")}
              className={`px-3 sm:px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                statusFilter === "in_progress"
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              In Progress ({inProgressCount})
            </button>
            <button
              onClick={() => setStatusFilter("completed")}
              className={`px-3 sm:px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                statusFilter === "completed"
                  ? "border-gray-900 text-gray-900"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              Completed ({completedCount})
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
                      {job.status === "in_progress" ? "in progress" : job.status}
                    </Badge>
                    {job.is_flagged && <Badge className="bg-red-100 text-red-700">Flagged</Badge>}
                  </div>
                  <p className="text-gray-600 text-sm mb-3 break-words">
                    {job.description || job.job_details || "No description"}
                  </p>
                  <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-sm text-gray-600">
                    <span className="break-words">
                      <strong>Service:</strong> {job.service || "N/A"}
                    </span>
                    <span className="break-words">
                      <strong>Location:</strong>{" "}
                      {job.city && job.region && job.country ? `${job.city}, ${job.region}, ${job.country}` : "N/A"}
                    </span>
                    <span>
                      <strong>{job.bids_count || 0} bids</strong>
                    </span>
                    <span className="break-words">
                      <strong>Posted by:</strong> {job.homeowner_name || "Unknown"}
                    </span>
                    <span>
                      <strong>Posted:</strong> {new Date(job.created_at).toLocaleDateString()}
                    </span>
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
      </Card>

      <JobDetailsModal job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  )
}
