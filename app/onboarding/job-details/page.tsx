"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useOnboarding } from "@/contexts/onboarding-context"
import { SERVICES } from "@/lib/services"
import { Briefcase } from "lucide-react"

const CANADIAN_PROVINCES = [
  { value: "AB", label: "Alberta" },
  { value: "BC", label: "British Columbia" },
  { value: "MB", label: "Manitoba" },
  { value: "NB", label: "New Brunswick" },
  { value: "NL", label: "Newfoundland and Labrador" },
  { value: "NS", label: "Nova Scotia" },
  { value: "ON", label: "Ontario" },
  { value: "PE", label: "Prince Edward Island" },
  { value: "QC", label: "Quebec" },
  { value: "SK", label: "Saskatchewan" },
  { value: "NT", label: "Northwest Territories" },
  { value: "NU", label: "Nunavut" },
  { value: "YT", label: "Yukon" },
]

export default function JobDetailsPage() {
  const router = useRouter()
  const { data, updateData } = useOnboarding()

  // Form state
  const [jobTitle, setJobTitle] = useState(data.jobTitle || "")
  const [selectedService, setSelectedService] = useState(data.jobService || "")
  const [serviceSearch, setServiceSearch] = useState("")
  const [showServiceDropdown, setShowServiceDropdown] = useState(false)
  const [jobDescription, setJobDescription] = useState(data.jobDescription || "")
  const [jobTimeline, setJobTimeline] = useState(data.jobTimeline || "within_1_month")
  const [timelineSearch, setTimelineSearch] = useState("")
  const [showTimelineDropdown, setShowTimelineDropdown] = useState(false)
  const [jobCity, setJobCity] = useState(data.jobCity || "")
  const [jobRegion, setJobRegion] = useState(data.jobRegion || "")
  const [jobPostalCode, setJobPostalCode] = useState(data.jobPostalCode || "")
  const [imageFiles, setImageFiles] = useState<File[]>([])
  const [imagePreviews, setImagePreviews] = useState<string[]>([])
  const [imageError, setImageError] = useState("")

  // Validation state
  const [serviceTouched, setServiceTouched] = useState(false)
  const [descriptionTouched, setDescriptionTouched] = useState(false)
  const [titleTouched, setTitleTouched] = useState(false)

  const timelineOptions = [
    { value: "immediately", label: "Immediately" },
    { value: "within_1_week", label: "Within 1 week" },
    { value: "within_1_month", label: "Within 1 month" },
    { value: "within_3_months", label: "Within 3 months" },
    { value: "inquiring_only", label: "Inquiring only" },
  ]

  const filteredServices = SERVICES.filter((service) => service.toLowerCase().includes(serviceSearch.toLowerCase()))

  const formatPostalCode = (value: string) => {
    const cleaned = value.replace(/\s/g, "").toUpperCase()
    if (cleaned.length > 3) {
      return cleaned.slice(0, 3) + " " + cleaned.slice(3, 6)
    }
    return cleaned
  }

  const getTimelineLabel = () => {
    const option = timelineOptions.find((opt) => opt.value === jobTimeline)
    return option ? option.label : ""
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    if (imageFiles.length + files.length > 3) {
      setImageError("Maximum 3 images allowed")
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

    e.target.value = ""
  }

  const removeImage = (index: number) => {
    setImageFiles((prev) => prev.filter((_, i) => i !== index))
    setImagePreviews((prev) => prev.filter((_, i) => i !== index))
  }

  const handleContinue = (e: React.FormEvent) => {
    e.preventDefault()

    if (jobTitle.length < 3) {
      setTitleTouched(true)
      return
    }

    // Validation
    if (!selectedService) {
      setServiceTouched(true)
      return
    }

    if (jobDescription.length < 10) {
      setDescriptionTouched(true)
      return
    }

    try {
      const jobDataToSave = {
        jobTitle,
        jobService: selectedService,
        jobDescription,
        jobTimeline,
        jobCity,
        jobRegion,
        jobPostalCode,
        // Store image data URLs (base64) instead of File objects
        jobImageDataUrls: imagePreviews,
      }

      console.log("[v0] Saving job data to sessionStorage with images:", {
        imageCount: imagePreviews.length,
        imageDataUrlLengths: imagePreviews.map((url) => url.length),
      })

      const jsonString = JSON.stringify(jobDataToSave)
      sessionStorage.setItem("onboarding_job_data", jsonString)

      const savedData = sessionStorage.getItem("onboarding_job_data")
      const parsedData = savedData ? JSON.parse(savedData) : null
      console.log("[v0] Verified sessionStorage save:", {
        hasImages: !!parsedData?.jobImageDataUrls,
        imageCount: parsedData?.jobImageDataUrls?.length || 0,
      })
    } catch (error) {
      console.error("[v0] Error saving to sessionStorage:", error)
      setImageError(
        "Unable to save images. The images may be too large. Please try uploading smaller images or fewer images.",
      )
      document.getElementById("image-upload-section")?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }

    // Save to context
    updateData({
      jobTitle,
      jobService: selectedService,
      jobDescription,
      jobImages: imageFiles,
      jobTimeline,
      jobCity,
      jobRegion,
      jobPostalCode,
    })

    // Navigate to account creation
    router.push("/onboarding/personal-info?role=homeowner")
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
          {/* Header with Icon - now inside card */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-[#03353a] rounded-full flex items-center justify-center">
                <Briefcase className="w-8 h-8 text-white" strokeWidth={2.5} />
              </div>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-[#03353a] mb-2">Post Your First Job</h1>
            <p className="text-sm sm:text-base text-[#03353a]/70">
              Provide details about your project to get matched with qualified contractors
            </p>
          </div>

          <form onSubmit={handleContinue} className="space-y-6">
            {/* Tip Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 text-xs sm:text-sm text-blue-900">
              <span className="font-semibold">💡 Tip:</span> Providing more details helps contractors give you more
              accurate bids and better understand your project needs.
            </div>

            {/* Job Title */}
            <div>
              <label className="block text-sm font-medium text-[#03353a] mb-2">
                Job Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                onBlur={() => setTitleTouched(true)}
                placeholder="e.g., Kitchen Renovation"
                required
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0F766E] focus:border-transparent text-sm sm:text-base ${
                  titleTouched && jobTitle.length < 3 ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
              />
              {titleTouched && jobTitle.length < 3 && (
                <p className="text-xs text-red-500 mt-1">Job title must be at least 3 characters.</p>
              )}
            </div>

            {/* Service Type */}
            <div className="relative">
              <label className="block text-sm font-medium text-[#03353a] mb-2">
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
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0F766E] focus:border-transparent text-sm sm:text-base ${
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
                        e.preventDefault()
                        setSelectedService(service)
                        setServiceSearch("")
                        setShowServiceDropdown(false)
                        setServiceTouched(true)
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 text-xs sm:text-sm"
                    >
                      {service}
                    </button>
                  ))}
                  {filteredServices.length > 10 && (
                    <div className="px-4 py-2 text-xs text-gray-500 border-t">
                      {filteredServices.length - 10} more services...
                    </div>
                  )}
                </div>
              )}
              {serviceTouched && !selectedService && (
                <p className="text-xs text-red-500 mt-1">Please select a service type.</p>
              )}
            </div>

            {/* Job Description */}
            <div>
              <label className="block text-sm font-medium text-[#03353a] mb-2">
                Job Description <span className="text-red-500">*</span>
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                onBlur={() => setDescriptionTouched(true)}
                placeholder="Describe your project in detail..."
                rows={5}
                required
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-[#0F766E] focus:border-transparent resize-none text-sm sm:text-base ${
                  descriptionTouched && jobDescription.length < 10 ? "border-red-500 bg-red-50" : "border-gray-300"
                }`}
              />
              <p className="text-xs text-gray-500 mt-1">{jobDescription.length} characters (minimum 10)</p>
              {descriptionTouched && jobDescription.length < 10 && (
                <p className="text-xs text-red-500 mt-1">Description must be at least 10 characters.</p>
              )}
            </div>

            {/* Image Upload */}
            <div className="space-y-2" id="image-upload-section">
              <label htmlFor="image-upload" className="text-sm font-medium text-gray-700">
                Upload Images (Optional, Max 3)
              </label>

              {imageError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-800">
                  <span className="font-semibold">⚠️ Error:</span> {imageError}
                </div>
              )}

              <div className="flex gap-3 flex-wrap items-start">
                {imagePreviews.map((preview, index) => (
                  <div key={index} className="relative w-24 h-24 flex-shrink-0">
                    <img
                      src={preview || "/placeholder.svg"}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg border-2 border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors text-sm font-bold"
                    >
                      ×
                    </button>
                  </div>
                ))}

                {imagePreviews.length < 3 && (
                  <div className="relative w-24 h-24 flex-shrink-0">
                    <input
                      type="file"
                      id="image-upload"
                      multiple
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="image-upload"
                      className="flex flex-col items-center justify-center gap-1 w-full h-full border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#0F766E] hover:bg-gray-50 transition-colors"
                    >
                      <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      <span className="text-xs text-gray-600 text-center px-1">Select Image</span>
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="relative">
              <label className="block text-sm font-medium text-[#03353a] mb-2">
                When do you need this done? <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={getTimelineLabel()}
                onFocus={() => setShowTimelineDropdown(true)}
                readOnly
                placeholder="Select timeline..."
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F766E] focus:border-transparent text-sm sm:text-base cursor-pointer"
              />

              {showTimelineDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  {timelineOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        setJobTimeline(option.value)
                        setShowTimelineDropdown(false)
                      }}
                      className="w-full text-left px-4 py-3 hover:bg-gray-100 text-xs sm:text-sm"
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Location Section */}
            <div className="border-t pt-6">
              <h3 className="text-base sm:text-lg font-semibold text-[#03353a] mb-3">Where is your job located?</h3>

              <p className="text-xs sm:text-sm text-gray-600 mb-4 bg-blue-50 border border-blue-200 rounded-lg p-3">
                <span className="font-semibold">Privacy Note:</span> Only your postal code will be shared with
                contractors. You will provide your full address to the contractor you choose to accept.
              </p>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#03353a] mb-2">
                      City <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={jobCity}
                      onChange={(e) => setJobCity(e.target.value)}
                      placeholder="e.g., Toronto"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F766E] focus:border-transparent text-sm sm:text-base"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#03353a] mb-2">
                      Region <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={jobRegion}
                      onChange={(e) => setJobRegion(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F766E] focus:border-transparent text-sm sm:text-base"
                    >
                      <option value="">Select Province/Territory</option>
                      {CANADIAN_PROVINCES.map((province) => (
                        <option key={province.value} value={province.value}>
                          {province.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#03353a] mb-2">
                    Postal Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={jobPostalCode}
                    onChange={(e) => {
                      const formatted = formatPostalCode(e.target.value)
                      setJobPostalCode(formatted)
                    }}
                    placeholder="e.g., M5H 2N2"
                    required
                    maxLength={7}
                    pattern="^[A-Z]\d[A-Z]\s\d[A-Z]\d$"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F766E] focus:border-transparent text-sm sm:text-base"
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: XXX XXX</p>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-4 pt-6">
              <button
                type="submit"
                className="w-full bg-[#03353a] text-white font-semibold py-4 px-6 text-base sm:text-lg rounded-lg hover:bg-[#03353a]/90"
              >
                Continue
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
