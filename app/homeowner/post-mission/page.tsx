"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { AlertCircle, Loader2, Upload, X } from "lucide-react"

interface Service {
  id: number
  name: string
}

export default function PostMissionPage() {
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [service, setService] = useState("")
  const [jobDetails, setJobDetails] = useState("")
  const [postalCode, setPostalCode] = useState("")
  const [priority, setPriority] = useState("medium")
  const [hiringLikelihood, setHiringLikelihood] = useState("likely")
  const [houseSize, setHouseSize] = useState("")
  const [stories, setStories] = useState("")
  const [propertyType, setPropertyType] = useState("")
  const [images, setImages] = useState<File[]>([])

  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const data = await apiClient.request<Service[]>("/api/services")
      setServices(data)
    } catch (err) {
      console.error("[v0] Failed to fetch services:", err)
    }
  }

  const validatePostalCode = (code: string) => {
    const canadianPostalRegex = /^[A-Za-z]\d[A-Za-z] \d[A-Za-z]\d$/
    return canadianPostalRegex.test(code)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files).slice(0, 3 - images.length)
      setImages([...images, ...newFiles])
    }
  }

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validatePostalCode(postalCode)) {
      setError("Please enter a valid Canadian postal code (e.g., A1A 1A1)")
      return
    }

    setLoading(true)

    try {
      const formData = new FormData()
      formData.append("title", title)
      formData.append("service", service)
      formData.append("job_details", jobDetails)
      formData.append("postal_code", postalCode)
      formData.append("priority", priority)
      formData.append("hiring_likelihood", hiringLikelihood)

      if (houseSize) formData.append("house_size", houseSize)
      if (stories) formData.append("stories", stories)
      if (propertyType) formData.append("property_type", propertyType)

      images.forEach((image) => {
        formData.append("images", image)
      })

      await apiClient.uploadFormData("/api/missions", formData)
      router.push("/homeowner/dashboard")
    } catch (err: any) {
      setError(err.message || "Failed to post mission")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">Post a New Mission</h1>
        <p className="text-muted-foreground">Describe your project and start receiving bids from contractors</p>
      </div>

      {error && (
        <div className="bg-card border rounded-lg p-4 mb-6" style={{ borderColor: "#dd3f55" }}>
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: "#dd3f55" }} />
            <p className="text-sm" style={{ color: "#dd3f55" }}>
              {error}
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-8 space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-foreground mb-2">
            Project Title *
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
            placeholder="e.g., Fix Leaky Kitchen Pipe"
          />
        </div>

        {/* Service */}
        <div>
          <label htmlFor="service" className="block text-sm font-medium text-foreground mb-2">
            Service Type *
          </label>
          <select
            id="service"
            value={service}
            onChange={(e) => setService(e.target.value)}
            required
            className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
          >
            <option value="">Select a service</option>
            {services.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        {/* Job Details */}
        <div>
          <label htmlFor="details" className="block text-sm font-medium text-foreground mb-2">
            Project Details *
          </label>
          <textarea
            id="details"
            value={jobDetails}
            onChange={(e) => setJobDetails(e.target.value)}
            required
            rows={6}
            className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground resize-none"
            placeholder="Describe your project in detail. Include any specific requirements, timeline, or preferences..."
          />
          <p className={`text-xs mt-1 ${jobDetails.length < 10 ? "text-destructive" : "text-muted-foreground"}`}>
            {jobDetails.length}/10 characters minimum
          </p>
        </div>

        {/* Postal Code */}
        <div>
          <label htmlFor="postal" className="block text-sm font-medium text-foreground mb-2">
            Postal Code *
          </label>
          <input
            id="postal"
            type="text"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value.toUpperCase())}
            required
            className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
            placeholder="A1A 1A1"
          />
          <p className="text-xs text-muted-foreground mt-1">Format: A1A 1A1</p>
        </div>

        {/* Priority & Hiring Likelihood */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-foreground mb-2">
              Priority *
            </label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              required
              className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
            >
              <option value="low">Low Priority - No Rush</option>
              <option value="medium">Medium Priority - Somewhat Urgent</option>
              <option value="high">High Priority - Urgent</option>
            </select>
          </div>

          <div>
            <label htmlFor="likelihood" className="block text-sm font-medium text-foreground mb-2">
              Hiring Likelihood *
            </label>
            <select
              id="likelihood"
              value={hiringLikelihood}
              onChange={(e) => setHiringLikelihood(e.target.value)}
              required
              className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
            >
              <option value="definitely">Definitely Hiring</option>
              <option value="likely">Likely Hiring</option>
              <option value="possibly">Possibly Hiring</option>
              <option value="requiring consultation">Requiring Consultation</option>
            </select>
          </div>
        </div>

        {/* Optional Property Details */}
        <div className="border-t border-border pt-6">
          <h3 className="text-lg font-semibold text-foreground mb-4">Property Details (Optional)</h3>

          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="houseSize" className="block text-sm font-medium text-foreground mb-2">
                House Size (sq ft)
              </label>
              <input
                id="houseSize"
                type="number"
                value={houseSize}
                onChange={(e) => setHouseSize(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                placeholder="2000"
              />
            </div>

            <div>
              <label htmlFor="stories" className="block text-sm font-medium text-foreground mb-2">
                Number of Stories
              </label>
              <input
                id="stories"
                type="number"
                value={stories}
                onChange={(e) => setStories(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
                placeholder="2"
              />
            </div>

            <div>
              <label htmlFor="propertyType" className="block text-sm font-medium text-foreground mb-2">
                Property Type
              </label>
              <select
                id="propertyType"
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full px-4 py-3 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-foreground"
              >
                <option value="">Select type</option>
                <option value="single_family">Single Family Home</option>
                <option value="apartment">Apartment</option>
                <option value="condo">Condominium</option>
                <option value="townhouse">Townhouse</option>
              </select>
            </div>
          </div>
        </div>

        {/* Images */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Project Images (Up to 3)</label>
          <div className="space-y-4">
            {images.length < 3 && (
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-input rounded-lg cursor-pointer hover:border-primary transition-colors">
                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                <span className="text-sm text-muted-foreground">Click to upload images</span>
                <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
              </label>
            )}

            {images.length > 0 && (
              <div className="grid grid-cols-3 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(image) || "/placeholder.svg"}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-border"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      style={{ backgroundColor: "#dd3f55", color: "#fffefe" }}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center gap-4 pt-6">
          <button
            type="submit"
            disabled={loading || jobDetails.length < 10}
            className="flex-1 py-3 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            style={{ backgroundColor: "#142c57", color: "#fffefe" }}
          >
            {loading && <Loader2 className="h-5 w-5 animate-spin" />}
            {loading ? "Posting Mission..." : "Post Mission"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-border rounded-lg font-semibold text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
