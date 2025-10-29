"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, Flag, Eye, Trash2 } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import dynamic from "next/dynamic"

const JobsHeatMap = dynamic(() => import("@/components/jobs-heat-map").then((mod) => mod.JobsHeatMap), {
  ssr: false,
  loading: () => (
    <Card>
      <CardHeader>
        <CardTitle>Job Heat Map</CardTitle>
        <CardDescription>Loading map...</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px] w-full rounded-lg bg-muted animate-pulse" />
      </CardContent>
    </Card>
  ),
})

interface Job {
  id: number
  user_id: number
  title: string
  service: string
  job_details: string
  address: string
  city: string
  region: string
  country: string
  postal_code: string
  latitude: number
  longitude: number
  priority: string
  status: string
  created_at: string
  homeowner_name: string
  homeowner_email: string
  bid_count: number
  is_flagged?: boolean
  flag_reason?: string
}

export default function AdminJobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const link = document.createElement("link")
    link.rel = "stylesheet"
    link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
    link.integrity = "sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
    link.crossOrigin = ""
    document.head.appendChild(link)

    return () => {
      document.head.removeChild(link)
    }
  }, [])

  useEffect(() => {
    fetchJobs()
  }, [])

  useEffect(() => {
    filterJobs()
  }, [searchQuery, statusFilter, jobs])

  const fetchJobs = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get<{ jobs: Job[] }>("/api/admin/jobs")
      setJobs(response.jobs || [])
    } catch (error: any) {
      console.error("[v0] Error fetching jobs:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to fetch jobs",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterJobs = () => {
    let filtered = jobs

    if (searchQuery) {
      filtered = filtered.filter(
        (job) =>
          job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.job_details.toLowerCase().includes(searchQuery.toLowerCase()) ||
          job.homeowner_name.toLowerCase().includes(searchQuery.toLowerCase()),
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

  const handleFlagJob = async (jobId: number) => {
    try {
      const reason = prompt("Enter reason for flagging this job:")
      if (!reason) return

      await apiClient.post(`/api/admin/jobs/${jobId}/flag`, { reason })
      toast({
        title: "Success",
        description: "Job flagged for review",
      })
      fetchJobs()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to flag job",
        variant: "destructive",
      })
    }
  }

  const handleDeleteJob = async (jobId: number) => {
    if (!confirm("Are you sure you want to delete this job? This action cannot be undone.")) {
      return
    }

    try {
      await apiClient.delete(`/api/admin/jobs/${jobId}`)
      toast({
        title: "Success",
        description: "Job deleted successfully",
      })
      fetchJobs()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      open: "default",
      in_progress: "secondary",
      completed: "outline",
      cancelled: "destructive",
    }
    return <Badge variant={variants[status] || "default"}>{status.replace("_", " ")}</Badge>
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading jobs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Job Management</h1>
        <p className="text-muted-foreground">Monitor and manage all job postings on the platform</p>
      </div>

      {jobs.length === 0 && !loading && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <p className="text-sm text-yellow-800">No jobs found in the database. This could mean:</p>
            <ul className="list-disc list-inside text-sm text-yellow-700 mt-2 space-y-1">
              <li>No jobs have been posted yet</li>
              <li>The backend API endpoint is not returning data</li>
              <li>There may be a database connection issue</li>
            </ul>
            <p className="text-sm text-yellow-800 mt-3">Check the browser console for more details.</p>
          </CardContent>
        </Card>
      )}

      {jobs.length > 0 && <JobsHeatMap jobs={jobs} />}

      <Card>
        <CardHeader>
          <CardTitle>Job Overview</CardTitle>
          <CardDescription>View and manage all jobs posted on HomeHero</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs by title, description, or homeowner..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList>
              <TabsTrigger value="all">All Jobs ({jobs.length})</TabsTrigger>
              <TabsTrigger value="open">Open ({jobs.filter((j) => j.status === "open").length})</TabsTrigger>
              <TabsTrigger value="in_progress">
                In Progress ({jobs.filter((j) => j.status === "in_progress").length})
              </TabsTrigger>
              <TabsTrigger value="completed">
                Completed ({jobs.filter((j) => j.status === "completed").length})
              </TabsTrigger>
              <TabsTrigger value="flagged">Flagged ({jobs.filter((j) => j.is_flagged).length})</TabsTrigger>
            </TabsList>

            <TabsContent value={statusFilter} className="space-y-4 mt-4">
              {filteredJobs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No jobs found</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredJobs.map((job) => (
                    <Card key={job.id} className={job.is_flagged ? "border-destructive" : ""}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold text-lg">{job.title}</h3>
                              {getStatusBadge(job.status)}
                              {job.is_flagged && (
                                <Badge variant="destructive">
                                  <Flag className="h-3 w-3 mr-1" />
                                  Flagged
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">{job.job_details}</p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Service: {job.service}</span>
                              <span>•</span>
                              <span>
                                Location: {job.city}, {job.region}
                              </span>
                              <span>•</span>
                              <span>{job.bid_count} bids</span>
                              <span>•</span>
                              <span>Posted by: {job.homeowner_name}</span>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Posted: {new Date(job.created_at).toLocaleDateString()}
                            </p>
                            {job.is_flagged && job.flag_reason && (
                              <div className="mt-2 p-2 bg-destructive/10 rounded-md">
                                <p className="text-sm text-destructive">
                                  <strong>Flag Reason:</strong> {job.flag_reason}
                                </p>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              View
                            </Button>
                            {!job.is_flagged && (
                              <Button variant="outline" size="sm" onClick={() => handleFlagJob(job.id)}>
                                <Flag className="h-4 w-4 mr-1" />
                                Flag
                              </Button>
                            )}
                            <Button variant="destructive" size="sm" onClick={() => handleDeleteJob(job.id)}>
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
