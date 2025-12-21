"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DashboardLayout } from "@/components/dashboard-layout"
import { apiClient } from "@/lib/api-client"
import {
  Loader2,
  Briefcase,
  MapPin,
  Calendar,
  AlertCircle,
  Star,
  ChevronDown,
  ChevronUp,
  MessageCircle,
} from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { VerifiedBadge } from "@/components/verified-badge"
import { trackEvent } from "@/lib/analytics"
import { BidMeter } from "@/components/bid-meter"

// Assume 'user' is available in this scope, e.g., from an auth context or hook.
// For demonstration, we'll mock it. In a real app, you'd import/use it correctly.
const user = {
  id: 1,
  name: "John Doe",
  first_name: "John",
  last_name: "Doe",
  email: "john.doe@example.com",
  role: "homeowner",
}

interface Mission {
  id: number
  title: string
  service: string
  priority: string
  created_at: string
  job_details: string
  postal_code: string
  bid_count: number
  status: string
  details_requested_count?: number
  agent_photo_url?: string
  contractor_name?: string
  phone_verified?: boolean
  is_google_verified?: boolean
  created_at?: string
  message?: string
  rating?: number
  review_count?: number
  homeowner_contact?: { name: string }
  has_accepted_bid?: boolean
  // Added properties for editing
  address?: string
  city?: string
  region?: string
  completion_timeline?: string
  images?: string[] // Added for editing
  // Nested types for API responses
  bids?: Bid[]
}

interface Bid {
  id: number
  company_name: string
  logo_url?: string
  rating?: number
  review_count?: number
  business_address?: string
  business_city?: string
  business_region?: string
  business_postal_code?: string
  quote?: string
  amount?: string
  status: string
  contractor_id: number
  agent_photo_url?: string
  contractor_name?: string
  phone_verified?: boolean
  is_google_verified?: boolean
  created_at: string
  message?: string
  contractor?: {
    company_name: string
  }
}

interface Stats {
  total_jobs: number
  active_jobs: number
  completed_jobs: number
}

interface HiredContractorInfo {
  companyName: string
}

export default function HomeownerDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [missions, setMissions] = useState<Mission[]>([])
  const [stats, setStats] = useState<Stats>({ total_jobs: 0, active_jobs: 0, completed_jobs: 0 })
  const [error, setError] = useState("")
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null)
  const [showBidsModal, setShowBidsModal] = useState(false)
  const [bids, setBids] = useState<Bid[]>([]) // Use Bid[] for type safety
  const [loadingBids, setLoadingBids] = useState(false)
  const [showReviewsModal, setShowReviewsModal] = useState(false)
  const [reviews, setReviews] = useState<any>(null)
  const [loadingReviews, setLoadingReviews] = useState(false)
  const [selectedContractorId, setSelectedContractorId] = useState<number | null>(null)
  const [selectedContractorReviews, setSelectedContractorReviews] = useState<any[]>([]) // Added state for selected contractor reviews
  const [showGoogleReviews, setShowGoogleReviews] = useState(true)
  const [showBidrrReviews, setShowBidrrReviews] = useState(true)
  const [showPostJobModal, setShowPostJobModal] = useState(false)
  const [postingJob, setPostingJob] = useState(false)
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [serviceSearch, setServiceSearch] = useState("")
  const [showServiceDropdown, setShowServiceDropdown] = useState(false)
  const [selectedService, setSelectedService] = useState("")
  const [editingMission, setEditingMission] = useState<Mission | null>(null)
  const [deleteJobId, setDeleteJobId] = useState<number | null>(null)
  const [deletingJob, setDeletingJob] = useState(false)
  const [jobDescription, setJobDescription] = useState("")
  const [descriptionTouched, setDescriptionTouched] = useState(false)
  const [serviceTouched, setServiceTouched] = useState(false)

  const [selectedMissionId, setSelectedMissionId] = useState<number | null>(null)
  const [showReviewDialog, setShowReviewDialog] = useState(false)
  const [hiredContractorInfo, setHiredContractorInfo] = useState<HiredContractorInfo | null>(null)

  console.log("[v0] HomeownerDashboard render")

  // Full list of services from the schema
  const services = [
    "Air Duct Cleaning",
    "Carpet Cleaning",
    "Chimney Cleaning",
    "Cleaning",
    "Deep Cleaning",
    "House Cleaning",
    "Move-In/Move-Out Cleaning",
    "Oven Cleaning",
    "Post-Construction Cleaning",
    "Refrigerator Cleaning",
    "Spring Cleaning",
    "Tile and Grout Cleaning",
    "Upholstery Cleaning",
    "Window Cleaning",
    "Aquarium Maintenance",
    "Dog Walking",
    "Pet Cleanup",
    "Pet Grooming",
    "Pet Kennel Cleaning",
    "Pet Sitting",
    "Pet Training",
    "Pet Waste Removal",
    "Appliance Repair",
    "Basement Waterproofing",
    "Bathtub Refinishing",
    "Ceiling Repair",
    "Drywall Repair",
    "Foundation Repair",
    "Garage Door Repair",
    "Glass Repair",
    "Grout Repair",
    "Gutter Repair",
    "Home Maintenance",
    "Masonry Repair",
    "Minor Home Repairs",
    "Siding Repair",
    "Sump Pump Maintenance",
    "Water Heater Maintenance",
    "Windows & Doors Repair",
    "Air Purifier Installation",
    "Cabinet Installation",
    "Child Safety Gate Installation",
    "Countertop Installation",
    "Curtain Rod Installation",
    "EV Charger Installation",
    "Floor Installation",
    "Humidifier Installation",
    "Install Blinds",
    "Install Window Treatments",
    "Light Installation",
    "Lock Installation or Repair",
    "Mirror Installation",
    "Pet Door Installation",
    "Safe Installation",
    "Satellite & Set Top Boxes Installation",
    "Security System Installation",
    "Shelf Installation",
    "Skylight Installation",
    "Smart Home Installation",
    "Smart Lighting Setup",
    "Smart Lock Installation",
    "Sprinkler System Installation",
    "Thermostat Installation & Repair",
    "TV & Home Theater Installation",
    "TV Mounting",
    "Deck Construction",
    "Driveway Sealing",
    "Fencing",
    "Garden Bed Installation",
    "Gardening",
    "Gate Installation & Repair",
    "Gutter Installation & Cleaning",
    "Landscaping",
    "Lawncare",
    "Outdoor Kitchen Installation",
    "Outdoor Lighting Installation",
    "Patio Installation",
    "Pergola Construction",
    "Pond Maintenance",
    "Pressure Washing",
    "Retaining Wall Construction",
    "Shed Installation",
    "Snow Removal",
    "Sprinkler System Maintenance",
    "Stump Grinding",
    "Tree Removal",
    "Yard Work",
    "Carbon Monoxide Detector Maintenance",
    "Fireproofing",
    "Smoke Detector Maintenance",
    "Composting System Setup",
    "Energy Audit",
    "Green Roof Installation",
    "Insulation Installation",
    "Rainwater Harvesting System Installation",
    "Solar Panel Installation",
    "Solar Panel Maintenance",
    "Weatherstripping",
    "Window Sealing",
    "Asbestos Removal",
    "Mold Remediation",
    "Pest Control",
    "Rodent Control",
    "Wildlife Removal",
    "Baby Proofing",
    "Nursery Setup",
    "Playground Installation",
    "Toy Organization",
    "Holiday Decoration Removal",
    "Holiday Decoration Setup",
    "Party Cleanup",
    "Party Setup",
    "Acoustic Panel Installation",
    "Bed Assembly",
    "Builders",
    "Carpentry Services",
    "Decoration",
    "Fence Painting",
    "Floor Refinishing",
    "Furniture Assembly",
    "Hang Art",
    "Hang Curtains",
    "Home Improvement",
    "Home Staging",
    "Home Theater Setup",
    "IKEA Assembly",
    "Indoor Painting",
    "Interior Decoration",
    "Light Carpentry",
    "Odor Removal",
    "Organization",
    "Painting & Decorating",
    "Picture Hanging",
    "Room Measurement",
    "Soundproofing",
    "Vintage Home Restoration",
    "Wallpapering",
    "Wallpaper Removal",
    "Asphalt Shingle Preservation",
    "Asphalt Shingle Rejuvenation",
    "Asphalt Shingles Maintenance",
    "Asphalt Shingles Replacement",
    "Cedar Shake Maintenance",
    "Cedar Shake Replacement",
    "Roof Maintenance",
    "Roof Repair & Replacement",
    "Accessibility Modifications",
    "Attic Cleaning",
    "Car Washing",
    "Elevator Maintenance",
    "Fireplace Maintenance",
    "Home Automation Services",
    "Home Gym Setup",
    "Home Network Setup",
    "Home Office Setup",
    "Laundry and Ironing",
    "Linens Washing",
    "Packing & Unpacking",
    "Pool Maintenance",
    "Pool Table Maintenance",
    "Sauna Maintenance",
    "Sewing",
    "Storm Damage Repair",
    "Structural Maintenance",
    "Trash & Furniture Removal",
    "Wine Cellar Maintenance",
  ]

  const filteredServices = services.filter((service) => service.toLowerCase().includes(serviceSearch.toLowerCase()))

  useEffect(() => {
    console.log("[v0] Dashboard fetchDashboardData effect triggered")
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      const missionsData = await apiClient.request<Mission[]>("/api/missions/active", {
        requiresAuth: true,
      })

      setMissions(missionsData)

      setStats({
        total_jobs: missionsData.length,
        active_jobs: missionsData.filter((m) => m.status === "active" || m.status === "open").length,
        completed_jobs: missionsData.filter((m) => m.status === "completed").length,
      })

      setError("")
    } catch (error: any) {
      console.error("Error fetching dashboard data:", error)
      setError(error.message || "Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  const fetchBidsWithReviews = async (missionId: number) => {
    setLoadingBids(true)
    try {
      const data = await apiClient.request<Bid[]>(`/api/missions/${missionId}/bids`, {
        // Use Bid[] type
        requiresAuth: true,
      })

      const bidsWithReviews = await Promise.all(
        data.map(async (bid) => {
          try {
            const cacheBuster = Date.now()
            const reviews = await apiClient.request<any>(
              `/api/contractors/${bid.contractor_id}/reviews?_t=${cacheBuster}`,
              {
                requiresAuth: true,
              },
            )

            const bidrrReviewCount = reviews.reviews.filter((r: any) => r.source === "homehero").length
            const totalReviews = (reviews.google_review_count || 0) + bidrrReviewCount

            return {
              ...bid,
              rating: reviews.average_rating || reviews.google_rating || 0,
              review_count: totalReviews,
            }
          } catch (error: any) {
            console.error(`Error fetching reviews for contractor ${bid.contractor_id}:`, error.message)
            return {
              ...bid,
              rating: 0,
              review_count: 0,
            }
          }
        }),
      )

      setBids(bidsWithReviews)
      // Update selectedMission with the fetched bids
      setSelectedMission((prevMission) => (prevMission ? { ...prevMission, bids: bidsWithReviews } : null))
    } catch (error: any) {
      console.error("Error fetching bids:", error)
      alert("Failed to load bids: " + error.message)
    } finally {
      setLoadingBids(false)
    }
  }

  const fetchContractorReviews = async (contractorId: number, companyName: string) => {
    setSelectedContractorId(contractorId)
    setShowReviewsModal(true)
    setLoadingReviews(true)

    try {
      const cacheBuster = Date.now()
      const data = await apiClient.request<any>(`/api/contractors/${contractorId}/reviews?_t=${cacheBuster}`, {
        requiresAuth: true,
      })

      const bidrrReviews = data.reviews.filter((r: any) => r.source === "homehero")

      setSelectedContractorReviews(data.reviews) // Set selectedContractorReviews state
      setReviews(data)
    } catch (error: any) {
      console.error("Error fetching reviews:", error.message)
      alert("Failed to load reviews: " + error.message)
    } finally {
      setLoadingReviews(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  const handleEditJob = async (jobId: number) => {
    const mission = missions.find((m) => m.id === jobId)
    if (!mission) return

    if (mission.bid_count > 0) {
      toast({
        title: "Cannot Edit Job",
        description: "Jobs with bids cannot be edited.",
        variant: "destructive",
      })
      return
    }

    // Fetch full mission details if needed
    try {
      const fullMission = await apiClient.request<any>(`/api/missions/${jobId}`, {
        requiresAuth: true,
      })

      console.log("[v0] Fetched mission data for editing:", {
        id: fullMission.id,
        region: fullMission.region,
        images: fullMission.images,
        hasImages: fullMission.images?.length > 0,
      })

      setEditingMission(fullMission)
      setSelectedService(fullMission.service || "")
      setJobDescription(fullMission.job_details || "")

      if (fullMission.images && Array.isArray(fullMission.images)) {
        console.log("[v0] Setting image previews:", fullMission.images)
        setImagePreviews(fullMission.images)
        setImageFiles([]) // Reset to empty since we're showing URLs from database
      } else {
        console.log("[v0] No images found in mission data")
        setImagePreviews([])
        setImageFiles([])
      }

      setShowPostJobModal(true)
    } catch (err: any) {
      console.error("Error fetching mission details:", err)
      toast({
        title: "Error",
        description: "Failed to load job details",
        variant: "destructive",
      })
    }
  }

  const handleDeleteJob = (jobId: number) => {
    setDeleteJobId(jobId)
  }

  const confirmDeleteJob = async () => {
    if (!deleteJobId) return

    setDeletingJob(true)
    try {
      await apiClient.request(`/api/missions/${deleteJobId}`, {
        method: "DELETE",
        requiresAuth: true,
      })

      setMissions((prev) => prev.filter((m) => m.id !== deleteJobId))
      setStats((prev) => ({ ...prev, total_jobs: prev.total_jobs - 1 }))

      toast({
        title: "Success!",
        description: "Job deleted successfully",
      })
      // Track job deletion
      trackEvent("job_deleted", { userId: user.id, jobId: deleteJobId })
    } catch (error: any) {
      console.error("Error deleting job:", error)
      toast({
        title: "Error",
        description: `Failed to delete job: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setDeletingJob(false)
      setDeleteJobId(null)
    }
  }

  const handleViewBids = async (mission: Mission) => {
    setSelectedMission(mission)
    setShowBidsModal(true)
    await fetchBidsWithReviews(mission.id)
    // Track viewing bids
    trackEvent("view_bids_clicked", { userId: user.id, jobId: mission.id })
  }

  const handleBidAction = async (bidId: number, status: string) => {
    try {
      const bid = selectedMission?.bids?.find((b) => b.id === bidId)
      const contractorName = bid?.contractor?.company_name || "the contractor"

      await apiClient.request(`/api/bids/${bidId}/status`, {
        method: "PUT",
        body: JSON.stringify({ status, message: "Contractor hired by homeowner" }),
        requiresAuth: true,
      })

      if (status === "accepted") {
        setHiredContractorInfo({ companyName: contractorName })
        setShowReviewDialog(true)
        // Track contractor hired
        trackEvent("contractor_hired", { userId: user.id, jobId: selectedMission?.id, contractorId: bidId })
      }

      toast({
        title: "Contractor Hired",
        description: "The contractor has been notified.",
      })
      setSelectedMission(null) // Clear selected mission after action
      await fetchDashboardData() // Re-fetch missions to update counts and states
      setShowBidsModal(false) // Close bids modal
    } catch (error: any) {
      console.error("Error updating bid status:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update bid status",
      })
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    if (imageFiles.length + files.length > 3) {
      alert("Maximum 3 images allowed")
      return
    }

    const newFiles = files.slice(0, 3 - imageFiles.length)
    setImageFiles([...imageFiles, ...newFiles])

    newFiles.forEach((file) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result as string])
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handlePostJob = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPostingJob(true)

    // Validation for job description
    if (jobDescription.length < 10) {
      setDescriptionTouched(true)
      setPostingJob(false)
      trackEvent("job_post_validation_error", { field: "job_description", error: "too_short" })
      return
    }

    // Validation for service selection
    if (!selectedService) {
      setServiceTouched(true)
      setPostingJob(false)
      trackEvent("job_post_validation_error", { field: "service", error: "not_selected" })
      return
    }

    try {
      const formData = new FormData(e.currentTarget)

      formData.set("service", selectedService)
      formData.set("job_details", jobDescription) // Use state for job_details

      const completionTimeline = formData.get("completion_timeline") as string
      let priority = "medium" // default

      if (completionTimeline === "immediately" || completionTimeline === "within_1_week") {
        priority = "high"
      } else if (completionTimeline === "within_1_month") {
        priority = "medium"
      } else if (completionTimeline === "within_3_months" || completionTimeline === "inquiring_only") {
        priority = "low"
      }

      formData.set("priority", priority)

      if (editingMission) {
        // For updates, only append new image files
        imageFiles.forEach((file) => {
          formData.append("images", file)
        })

        await apiClient.uploadFormData(`/api/missions/${editingMission.id}`, formData, "PUT", true)

        toast({
          title: "Success!",
          description: "Job updated successfully!",
        })
        trackEvent("job_updated", { job_id: editingMission.id, service_type: selectedService })
      } else {
        // For new missions, append all images
        imageFiles.forEach((file) => {
          formData.append("images", file)
        })

        const result = await apiClient.uploadFormData("/api/missions", formData, "POST", true)

        toast({
          title: "Success!",
          description: "Job posted successfully!",
        })
        trackEvent("job_post_success", { service_type: selectedService, priority })
      }

      setShowPostJobModal(false)
      setImagePreviews([])
      setImageFiles([])
      setSelectedService("")
      setServiceSearch("")
      setEditingMission(null)
      setJobDescription("") // Reset job description state
      setDescriptionTouched(false) // Reset touched state
      setServiceTouched(false) // Reset touched state
      await fetchDashboardData()
    } catch (error: any) {
      console.error("Error posting job:", error)
      toast({
        title: "Error",
        description: `Failed to ${editingMission ? "update" : "post"} job: ${error.message}`,
        variant: "destructive",
      })
      trackEvent("job_post_error", { error: error.message, is_edit: !!editingMission })
    } finally {
      setPostingJob(false)
    }
  }

  const getPriorityBadge = (mission: Mission) => {
    if (mission.priority === "high") {
      return <span className="text-[9px] bg-red-100 text-red-700 px-2 py-1 rounded font-semibold">High Priority</span>
    } else if (mission.priority === "medium") {
      return (
        <span className="text-[9px] bg-yellow-100 text-yellow-700 px-2 py-1 rounded font-semibold">
          Medium Priority
        </span>
      )
    } else if (mission.priority === "low") {
      return <span className="text-[9px] bg-blue-100 text-blue-700 px-2 py-1 rounded font-semibold">Low Priority</span>
    }
    return null
  }

  const getBorderColor = (mission: Mission) => {
    const bidCount = Number(mission.bid_count) || 0
    const hasAcceptedBid = mission.has_accepted_bid

    if (bidCount === 0) {
      return "border-l-4 border-l-gray-300"
    }

    if (hasAcceptedBid) {
      return "border-l-4 border-l-[#328d87]"
    }

    return "border-l-4 border-l-[#e2bb12]"
  }

  if (loading) {
    return (
      <DashboardLayout userRole="homeowner">
        <div className="flex h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#0F766E]" />
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout userRole="homeowner">
        <div className="flex h-[60vh] items-center justify-center">
          <div className="text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <p className="mt-4 text-lg text-gray-600">{error}</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout userRole="homeowner">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Welcome back!</h1>
            <p className="text-sm sm:text-base text-gray-600">Here's what's happening with your projects</p>
          </div>

          <button
            onClick={() => {
              trackEvent("job_post_started", { service_type: "new" })
              setShowPostJobModal(true)
            }}
            className="flex items-center gap-2 rounded-lg bg-[#0F766E] px-3 sm:px-4 py-2 text-sm sm:text-base text-white hover:bg-[#0d5f57] transition-colors w-full sm:w-auto justify-center"
          >
            <span className="text-xl">+</span>
            <span>Post Job</span>
          </button>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-blue-50 p-3">
              <Briefcase className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Jobs Posted</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total_jobs}</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">My Job Postings</h2>

          {missions.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-gray-600">No job postings yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {missions.map((mission) => (
                <div
                  key={mission.id}
                  className={`rounded-lg border border-gray-200 p-4 transition-all hover:shadow-md relative ${getBorderColor(mission)}`}
                >
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex-1 w-full">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                          {mission.title}
                        </h3>
                        {getPriorityBadge(mission)}
                      </div>
                      <p className="mt-2 text-sm text-gray-600 line-clamp-2">{mission.job_details}</p>

                      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-4 w-4" />
                          {mission.service}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Submitted {formatDate(mission.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {mission.postal_code}
                        </span>

                        {mission.details_requested_count && mission.details_requested_count > 0 && (
                          <span className="flex items-center gap-1 text-red-600">
                            <AlertCircle className="h-4 w-4" />
                            Requests for More Details: {mission.details_requested_count}
                          </span>
                        )}
                      </div>

                      {Number(mission.bid_count) > 0 && (
                        <div className="mt-3">
                          <button
                            onClick={() => handleViewBids(mission)}
                            className="inline-flex items-center gap-1 rounded bg-[#e2bb12]/80 px-3 py-1 text-sm font-medium text-black hover:bg-[#e2bb12] transition-colors"
                          >
                            View Bids
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => handleEditJob(mission.id)}
                        className={`flex-1 sm:flex-initial rounded border px-3 py-1 text-sm whitespace-nowrap transition-colors ${
                          mission.bid_count > 0
                            ? "border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed"
                            : "border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteJob(mission.id)}
                        className="flex-1 sm:flex-initial rounded border border-red-300 px-3 py-1 text-sm text-red-600 hover:bg-red-50 whitespace-nowrap"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  {Number(mission.bid_count) > 0 && (
                    <div className="mt-4 sm:absolute sm:bottom-4 sm:right-4">
                      <BidMeter currentBids={mission.bid_count} maxBids={5} className="min-w-[140px]" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={showPostJobModal}
        onOpenChange={(open) => {
          setShowPostJobModal(open)
          if (!open) {
            setImagePreviews([])
            setImageFiles([])
            setSelectedService("")
            setServiceSearch("")
            setEditingMission(null)
            setJobDescription("") // Reset job description state
            setDescriptionTouched(false) // Reset touched state
            setServiceTouched(false) // Reset touched state
          }
        }}
      >
        <DialogContent className="max-w-[95vw] sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingMission ? "Edit Job" : "Post a New Job"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handlePostJob} className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-900">
              <span className="font-semibold">💡 Tip:</span> Providing more details helps contractors give you more
              accurate bids and better understand your project needs.
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                defaultValue={editingMission?.title || ""}
                placeholder="e.g., Kitchen Renovation"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F766E] focus:border-transparent"
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Service Type <span className="text-red-500">*</span>
              </label>
              <p className="text-xs text-gray-500 mb-2">Please select a service from the dropdown list</p>
              <input
                type="text"
                value={selectedService || serviceSearch}
                onChange={(e) => {
                  const inputValue = e.target.value
                  setServiceSearch(inputValue)
                  if (inputValue !== selectedService) {
                    setSelectedService("")
                  }
                  setShowServiceDropdown(true)
                }}
                onFocus={() => setShowServiceDropdown(true)}
                onBlur={() => setServiceTouched(true)}
                placeholder="Start typing..."
                required
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0F766E] focus:border-transparent ${
                  serviceTouched && serviceSearch && !selectedService ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
              />
              {serviceTouched && serviceSearch && !selectedService && (
                <p className="text-xs text-red-500 mt-1">
                  Please select a service from the dropdown list. Custom entries are not allowed.
                </p>
              )}

              {showServiceDropdown && filteredServices.length > 0 && !selectedService && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {filteredServices.slice(0, 10).map((service) => (
                    <button
                      key={service}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault() // Prevent input from losing focus
                        setSelectedService(service)
                        setServiceSearch("") // Clear search input when a service is selected
                        setShowServiceDropdown(false)
                        setServiceTouched(true) // Mark as touched when selected
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 text-sm"
                    >
                      {service}
                    </button>
                  ))}
                  {filteredServices.length > 10 && (
                    <div className="px-3 py-2 text-xs text-gray-500 border-t">
                      {filteredServices.length - 10} more services...
                    </div>
                  )}
                </div>
              )}
              {serviceTouched && !selectedService && (
                <p className="text-xs text-red-500 mt-1">Please select a service type.</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="job_details"
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                onBlur={() => setDescriptionTouched(true)}
                placeholder="Describe your project in detail..."
                rows={4}
                required
                minLength={10}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#0F766E] focus:border-transparent ${
                  descriptionTouched && jobDescription.length < 10 ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
              />
              {descriptionTouched && jobDescription.length < 10 ? (
                <p className="text-xs text-red-500 mt-1">
                  Please enter at least 10 characters ({jobDescription.length}/10)
                </p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">Required - minimum 10 characters, max 1000 characters</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Upload Images (Max 3)</label>
              <div className="flex flex-wrap gap-3 items-start">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative">
                    <img
                      src={preview || "/placeholder.svg"}
                      alt={`Preview ${index + 1}`}
                      className="w-24 h-24 object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
                {imagePreviews.length < 3 && (
                  <label className="cursor-pointer flex items-center justify-center w-24 h-24 border-2 border-dashed border-gray-300 rounded-lg hover:border-[#0F766E] hover:bg-gray-50 transition-colors">
                    <div className="text-center">
                      <span className="text-3xl text-gray-400 block">+</span>
                      <span className="text-xs text-gray-600">Select Image</span>
                    </div>
                    <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                When do you need this done? <span className="text-red-500">*</span>
              </label>
              <select
                name="completion_timeline"
                defaultValue={editingMission?.completion_timeline || ""}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F766E] focus:border-transparent"
              >
                <option value="">Select one</option>
                <option value="immediately">Immediately</option>
                <option value="within_1_week">Within 1 week</option>
                <option value="within_1_month">Within 1 month</option>
                <option value="within_3_months">Within 3 months</option>
                <option value="inquiring_only">Inquiring only</option>
              </select>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Where is your job located?</h3>

              <p className="text-sm text-gray-600 mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <span className="font-semibold">Privacy Note:</span> Only your postal code will be shared with
                contractors. You will provide your full address to the contractor you choose to accept.
              </p>

              <div className="space-y-4">
                <input type="hidden" name="address" value="" />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="city"
                      defaultValue={(editingMission as any)?.city || ""}
                      placeholder="e.g., Saskatoon"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F766E] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Region <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="region"
                      value={editingMission?.region || ""}
                      onChange={(e) => {
                        if (editingMission) {
                          setEditingMission({ ...editingMission, region: e.target.value })
                        }
                      }}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F766E] focus:border-transparent"
                    >
                      <option value="">Select Province/Territory</option>
                      <option value="AB">Alberta</option>
                      <option value="BC">British Columbia</option>
                      <option value="MB">Manitoba</option>
                      <option value="NB">New Brunswick</option>
                      <option value="NL">Newfoundland and Labrador</option>
                      <option value="NT">Northwest Territories</option>
                      <option value="NS">Nova Scotia</option>
                      <option value="NU">Nunavut</option>
                      <option value="ON">Ontario</option>
                      <option value="PE">Prince Edward Island</option>
                      <option value="QC">Quebec</option>
                      <option value="SK">Saskatchewan</option>
                      <option value="YT">Yukon</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Postal Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="postal_code"
                    defaultValue={editingMission?.postal_code || ""}
                    placeholder="A1A 1A1"
                    maxLength={7}
                    onChange={(e) => {
                      const clean = e.target.value
                        .toUpperCase()
                        .replace(/[^A-Z0-9]/g, "")
                        .slice(0, 6)
                      if (clean.length > 3) {
                        e.target.value = clean.slice(0, 3) + " " + clean.slice(3)
                      } else {
                        e.target.value = clean
                      }
                    }}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F766E] focus:border-transparent"
                  />
                </div>

                <input type="hidden" name="country" value="CA" />
              </div>
            </div>

            <button
              type="submit"
              disabled={
                postingJob ||
                !selectedService ||
                (descriptionTouched && jobDescription.length < 10) ||
                (serviceTouched && !selectedService)
              }
              className="w-full py-3 bg-[#0F766E] text-white rounded-lg font-medium hover:bg-[#0d5f57] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {postingJob ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {editingMission ? "Updating..." : "Posting..."}
                </span>
              ) : editingMission ? (
                "Update Job"
              ) : (
                "Post Job"
              )}
            </button>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteJobId !== null} onOpenChange={(open) => !open && setDeleteJobId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this job posting and all associated bids. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deletingJob}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteJob}
              disabled={deletingJob}
              className="bg-red-500 hover:bg-red-600"
            >
              {deletingJob ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Deleting...
                </span>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={showBidsModal} onOpenChange={setShowBidsModal}>
        <DialogContent className="max-w-[95vw] sm:max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              Bids for "{selectedMission?.title}"
              <p className="text-sm text-gray-600 font-normal mt-1">{bids.length} bid(s) received</p>
            </DialogTitle>
          </DialogHeader>

          {loadingBids ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#0F766E]" />
            </div>
          ) : bids.length === 0 ? (
            <div className="py-8 text-center text-gray-600">No bids received yet</div>
          ) : (
            <div className="space-y-4">
              {bids.map((bid) => {
                const fullAddress = [
                  bid.business_address,
                  bid.business_city,
                  bid.business_region,
                  bid.business_postal_code,
                ]
                  .filter(Boolean)
                  .join(", ")

                const bidAmount = bid.quote || bid.amount || 0

                return (
                  <div
                    key={bid.id}
                    className={`rounded-lg border-2 p-4 sm:p-6 ${
                      bid.status === "accepted" || bid.status === "hired" ? "border-[#328d87]" : "border-gray-200"
                    }`}
                  >
                    <div className="space-y-4">
                      <div className="flex flex-col sm:flex-row items-start gap-3">
                        {bid.logo_url && (
                          <img
                            src={bid.logo_url || "/placeholder.svg"}
                            alt={bid.company_name}
                            className="w-16 h-16 sm:w-20 sm:h-20 object-contain border border-gray-200 rounded p-2"
                          />
                        )}

                        <div className="flex-1 w-full">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                            {bid.company_name || "Company Name"}
                          </h3>

                          {(bid.status === "accepted" || bid.status === "hired") && (
                            <span className="inline-block mt-2 bg-[#328d87] text-white text-xs font-semibold px-2.5 py-1 rounded">
                              HIRED
                            </span>
                          )}

                          <button
                            onClick={() => {
                              fetchContractorReviews(bid.contractor_id, bid.company_name)
                            }}
                            className="flex items-center gap-2 hover:opacity-80 transition-opacity mt-2"
                          >
                            <div className="flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 rounded-lg px-2.5 py-1">
                              <Star className="w-4 h-4 sm:w-5 sm:h-5 fill-yellow-400 text-yellow-400" />
                              <span className="font-semibold text-sm sm:text-base text-gray-900">
                                {bid.rating ? Number(bid.rating).toFixed(1) : "0.0"}
                              </span>
                            </div>
                            <span className="text-xs sm:text-sm text-blue-600 hover:underline">
                              ({bid.review_count || 0} reviews)
                            </span>
                          </button>

                          {fullAddress && (
                            <p className="text-xs text-gray-600 flex items-start gap-1 mt-2">
                              <MapPin className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                              <span className="break-words">{fullAddress}</span>
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">Bid Amount</p>
                        <p className="text-2xl sm:text-3xl font-bold text-[#0F766E]">${bidAmount}</p>
                        <p className="text-xs text-gray-500 mt-2 italic">
                          Note: Bid prices are estimates based on the information provided and may vary depending on
                          actual job requirements and site conditions.
                        </p>
                      </div>

                      <div className="border-t pt-4">
                        <div className="flex items-start gap-3 relative">
                          {bid.agent_photo_url ? (
                            <img
                              src={bid.agent_photo_url || "/placeholder.svg"}
                              alt={bid.contractor_name}
                              className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
                              <span className="text-lg font-semibold text-gray-600">
                                {bid.contractor_name?.charAt(0) || "C"}
                              </span>
                            </div>
                          )}

                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{bid.contractor_name}</p>

                            <div className="space-y-1 mt-1">
                              {bid.phone_verified && <VerifiedBadge type="phone" size="sm" showLabel={true} />}

                              {bid.is_google_verified && <VerifiedBadge type="google" size="sm" showLabel={true} />}
                            </div>

                            {bid.created_at && (
                              <p className="text-xs text-gray-500 mt-2">
                                {(() => {
                                  const now = new Date()
                                  const bidDate = new Date(bid.created_at)
                                  const diffTime = Math.abs(now.getTime() - bidDate.getTime())
                                  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

                                  if (diffDays === 0) return "Today"
                                  if (diffDays === 1) return "1 day ago"
                                  return `${diffDays} days ago`
                                })()}
                              </p>
                            )}
                          </div>

                          <button
                            onClick={() => router.push("/dashboard/homeowner/messages")}
                            className="absolute top-0 right-0 p-2 hover:bg-gray-100 rounded-full transition-colors group"
                            title="Message contractor"
                          >
                            <MessageCircle className="w-5 h-5 text-gray-600 group-hover:text-[#0F766E]" />
                          </button>
                        </div>

                        {bid.message && (
                          <div className="mt-3 bg-gray-50 rounded-lg p-3">
                            <p className="text-sm text-gray-700">{bid.message}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <button
                          onClick={() => handleBidAction(bid.id, "accepted")}
                          disabled={bid.status === "accepted" || bid.status === "hired"}
                          className="flex-1 py-2 bg-[#03353a] text-white rounded-lg text-sm font-medium hover:bg-[#04454c] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          {bid.status === "accepted" || bid.status === "hired" ? "Hired" : "I hired this Contractor"}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={showReviewsModal} onOpenChange={setShowReviewsModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl">
              {bids.find((b) => b.contractor_id === selectedContractorId)?.company_name || "Contractor"} Reviews
            </DialogTitle>
          </DialogHeader>

          {loadingReviews ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-[#0F766E]" />
            </div>
          ) : reviews ? (
            <div className="space-y-6">
              <div className="text-center py-4 border-b">
                <p className="text-sm text-gray-600 mb-2">Total Average Rating</p>
                <div className="flex items-center justify-center gap-2">
                  <Star className="w-8 h-8 fill-yellow-400 text-yellow-400" />
                  <span className="text-4xl font-bold">{reviews.average_rating.toFixed(1)}</span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {(reviews.google_review_count || 0) +
                    reviews.reviews.filter((r: any) => r.source === "homehero").length}{" "}
                  total reviews
                </p>
              </div>

              {reviews.google_review_count > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg">Google Reviews</h3>
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">{reviews.google_rating?.toFixed(1)}</span>
                      <span className="text-sm text-gray-600">({reviews.google_review_count})</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowGoogleReviews(!showGoogleReviews)}
                    className="flex items-center gap-1 text-blue-600 hover:underline mb-4"
                  >
                    {showGoogleReviews ? "Hide" : "Show"} recent Google reviews
                    {showGoogleReviews ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showGoogleReviews && (
                    <div className="space-y-4">
                      {reviews.reviews
                        .filter((r: any) => r.source === "google")
                        .slice(0, 3)
                        .map((review: any) => (
                          <div key={review.id} className="border-b pb-4 last:border-b-0">
                            <div className="flex items-start justify-between mb-2">
                              <p className="font-semibold">{review.reviewer_name}</p>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                <span className="font-semibold">{review.rating}</span>
                              </div>
                            </div>
                            <p className="text-sm text-gray-700">{review.comment}</p>
                            {review.relative_time_description && (
                              <p className="text-xs text-gray-500 mt-1">{review.relative_time_description}</p>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}

              {reviews.reviews.filter((r: any) => r.source === "homehero").length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-lg">Bidrr Reviews</h3>
                    <div className="flex items-center gap-2">
                      <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      <span className="font-semibold">
                        {reviews.bidrr_rating?.toFixed(1) ||
                          (
                            reviews.reviews
                              .filter((r: any) => r.source === "homehero")
                              .reduce((acc: number, r: any) => acc + r.rating, 0) /
                            reviews.reviews.filter((r: any) => r.source === "homehero").length
                          ).toFixed(1)}
                      </span>
                      <span className="text-sm text-gray-600">
                        ({reviews.reviews.filter((r: any) => r.source === "homehero").length})
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowBidrrReviews(!showBidrrReviews)}
                    className="flex items-center gap-1 text-blue-600 hover:underline mb-4"
                  >
                    {showBidrrReviews ? "Hide" : "Show"} recent Bidrr reviews
                    {showBidrrReviews ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {showBidrrReviews && (
                    <div className="space-y-4">
                      {reviews.reviews
                        .filter((r: any) => r.source === "homehero")
                        .slice(0, 3)
                        .map((review: any) => {
                          const displayName = review.reviewer_name || "Anonymous User"

                          return (
                            <div key={review.id} className="border-b pb-4 last:border-b-0">
                              <div className="flex items-start justify-between mb-2">
                                <p className="font-semibold">{displayName}</p>
                                <div className="flex items-center gap-1">
                                  <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                  <span className="font-semibold">{review.rating}</span>
                                </div>
                              </div>
                              <p className="text-sm text-gray-700">{review.comment}</p>
                              {review.created_at && (
                                <p className="text-xs text-gray-500 mt-1">
                                  {new Date(review.created_at).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                          )
                        })}
                    </div>
                  )}
                </div>
              )}

              {reviews.total_reviews === 0 && <div className="py-8 text-center text-gray-600">No reviews yet</div>}
            </div>
          ) : (
            <div className="py-8 text-center text-gray-600">Failed to load reviews</div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showReviewDialog} onOpenChange={setShowReviewDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Contractor Hired!</AlertDialogTitle>
            <AlertDialogDescription>
              Help other customers by leaving a review for {hiredContractorInfo?.companyName || "this contractor"}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setShowReviewDialog(false)}>Maybe Later</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setShowReviewDialog(false)
                router.push("/dashboard/homeowner/reviews")
              }}
              style={{ backgroundColor: "#03353a" }}
              className="hover:opacity-90"
            >
              Go to Reviews
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
