"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { apiClient } from "@/lib/api-client"
import { Loader2, AlertCircle, Star, MapPin, Award, Briefcase, Calendar, Phone, Mail } from "lucide-react"
import { format } from "date-fns"

interface ContractorProfile {
  id: number
  full_name: string
  company_name: string
  email: string
  phone_number: string
  bio: string
  services: string[]
  years_experience: number
  certifications: string[]
  service_area: string[]
  created_at: string
}

interface Review {
  id: number
  homeowner_name: string
  rating: number
  comment: string
  created_at: string
  mission_title: string
}

interface ReviewsData {
  reviews: Review[]
  average_rating: number
  total_reviews: number
}

export default function ContractorPublicProfile() {
  const params = useParams()
  const contractorId = params.id as string

  const [profile, setProfile] = useState<ContractorProfile | null>(null)
  const [reviewsData, setReviewsData] = useState<ReviewsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchContractorData()
  }, [contractorId])

  const fetchContractorData = async () => {
    try {
      const [profileData, reviews] = await Promise.all([
        apiClient.request<ContractorProfile>(`/api/contractors/${contractorId}/profile`),
        apiClient.request<ReviewsData>(`/api/contractors/${contractorId}/reviews`),
      ])
      setProfile(profileData)
      setReviewsData(reviews)
    } catch (err: any) {
      console.error("[v0] Failed to fetch contractor data:", err)
      setError(err.message || "Failed to load contractor profile")
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? "fill-current" : ""}`}
            style={{ color: star <= rating ? "#142c57" : "#d1d5db" }}
          />
        ))}
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" style={{ color: "#142c57" }} />
              <p className="text-muted-foreground">Loading contractor profile...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="bg-card border rounded-lg p-6" style={{ borderColor: "#dd3f55" }}>
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" style={{ color: "#dd3f55" }} />
                <div>
                  <h3 className="font-semibold text-foreground mb-1">Error</h3>
                  <p className="text-sm text-muted-foreground">{error || "Contractor not found"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="bg-card border border-border rounded-lg p-8 mb-8">
            <div className="flex flex-col md:flex-row gap-8">
              <div
                className="h-32 w-32 rounded-full flex items-center justify-center text-4xl font-bold flex-shrink-0"
                style={{ backgroundColor: "#142c57", color: "#fffefe" }}
              >
                {profile.full_name.charAt(0)}
              </div>

              <div className="flex-1">
                <h1 className="text-3xl font-bold text-foreground mb-2">{profile.full_name}</h1>
                <p className="text-xl text-muted-foreground mb-4">{profile.company_name}</p>

                {reviewsData && (
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      {renderStars(Math.round(reviewsData.average_rating))}
                      <span className="text-lg font-semibold text-foreground">
                        {reviewsData.average_rating.toFixed(1)}
                      </span>
                    </div>
                    <span className="text-sm text-muted-foreground">({reviewsData.total_reviews} reviews)</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    {profile.years_experience} years experience
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Member since {format(new Date(profile.created_at), "yyyy")}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <a
                  href={`tel:${profile.phone_number}`}
                  className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-colors"
                  style={{ backgroundColor: "#142c57", color: "#fffefe" }}
                >
                  <Phone className="h-5 w-5" />
                  Call Now
                </a>
                <a
                  href={`mailto:${profile.email}`}
                  className="flex items-center gap-2 px-6 py-3 border border-border rounded-lg font-semibold text-foreground hover:bg-muted transition-colors"
                >
                  <Mail className="h-5 w-5" />
                  Email
                </a>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* About */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-bold text-foreground mb-4">About</h2>
                <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
              </div>

              {/* Reviews */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-bold text-foreground mb-6">Reviews</h2>

                {reviewsData && reviewsData.reviews.length > 0 ? (
                  <div className="space-y-6">
                    {reviewsData.reviews.map((review) => (
                      <div key={review.id} className="border-b border-border last:border-0 pb-6 last:pb-0">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-semibold text-foreground">{review.homeowner_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(review.created_at), "MMM d, yyyy")}
                            </p>
                          </div>
                          {renderStars(review.rating)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{review.mission_title}</p>
                        <p className="text-foreground">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No reviews yet</p>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Services */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-4">Services Offered</h3>
                <div className="flex flex-wrap gap-2">
                  {profile.services.map((service, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 rounded-full text-sm font-medium"
                      style={{ backgroundColor: "#142c57" + "20", color: "#142c57" }}
                    >
                      {service}
                    </span>
                  ))}
                </div>
              </div>

              {/* Certifications */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Award className="h-5 w-5" style={{ color: "#142c57" }} />
                  <h3 className="font-semibold text-foreground">Certifications</h3>
                </div>
                <ul className="space-y-2">
                  {profile.certifications.map((cert, index) => (
                    <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      {cert}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Service Area */}
              <div className="bg-card border border-border rounded-lg p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5" style={{ color: "#142c57" }} />
                  <h3 className="font-semibold text-foreground">Service Area</h3>
                </div>
                <ul className="space-y-2">
                  {profile.service_area.map((area, index) => (
                    <li key={index} className="text-sm text-muted-foreground">
                      {area}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
