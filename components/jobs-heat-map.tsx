"use client"

import { useEffect, useRef, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

interface Job {
  id: number
  title: string
  service: string
  latitude: number
  longitude: number
  status: string
  city: string
  region: string
  homeowner_name: string
  homeowner_email: string
  homeowner_phone?: string
  homeowner_photo?: string
  homeowner_phone_verified?: boolean
  job_details: string
  priority: string
  bid_count: number
  created_at: string
}

interface JobsHeatMapProps {
  jobs: Job[]
}

function groupJobsByLocation(jobs: Job[]): Map<string, Job[]> {
  const grouped = new Map<string, Job[]>()
  const tolerance = 0.0001 // ~11 meters tolerance for grouping

  jobs.forEach((job) => {
    let foundGroup = false

    // Check if this job belongs to an existing group
    for (const [key, groupJobs] of grouped.entries()) {
      const [lat, lng] = key.split(",").map(Number)
      if (Math.abs(lat - job.latitude) < tolerance && Math.abs(lng - job.longitude) < tolerance) {
        groupJobs.push(job)
        foundGroup = true
        break
      }
    }

    // Create new group if no match found
    if (!foundGroup) {
      const key = `${job.latitude},${job.longitude}`
      grouped.set(key, [job])
    }
  })

  return grouped
}

function createMultiJobPopup(jobs: Job[]): string {
  // Sort jobs by most recent first
  const sortedJobs = [...jobs].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  const jobsHtml = sortedJobs
    .map(
      (job) => `
    <div style="border-bottom: 1px solid #e5e7eb; padding: 12px 0; margin-bottom: 12px;">
      <div style="display: flex; align-items: start; gap: 12px; margin-bottom: 8px;">
        <div style="flex-shrink: 0;">
          ${
            job.homeowner_photo
              ? `<img src="${job.homeowner_photo}" alt="${job.homeowner_name}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;" />`
              : `<div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 16px;">
                  ${job.homeowner_name.charAt(0).toUpperCase()}
                </div>`
          }
        </div>
        <div style="flex: 1; min-width: 0;">
          <div style="display: flex; align-items: center; gap: 6px; margin-bottom: 4px;">
            <strong style="font-size: 14px; color: #111827;">${job.homeowner_name}</strong>
            ${
              job.homeowner_phone_verified
                ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style="flex-shrink: 0;">
                    <title>Verified by Phone</title>
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                  </svg>`
                : ""
            }
          </div>
          <div style="font-size: 12px; color: #6b7280; margin-bottom: 2px;">${job.homeowner_email}</div>
          ${job.homeowner_phone ? `<div style="font-size: 12px; color: #6b7280;">${job.homeowner_phone}</div>` : ""}
        </div>
      </div>
      
      <div style="margin-top: 8px;">
        <strong style="font-size: 15px; color: #111827; display: block; margin-bottom: 4px;">${job.title}</strong>
        <div style="color: #6b7280; font-size: 13px; margin-bottom: 4px;">
          <strong>Service:</strong> ${job.service}
        </div>
        <div style="color: #6b7280; font-size: 13px; margin-bottom: 4px;">
          <strong>Status:</strong> <span style="color: ${job.status === "open" ? "#10b981" : "#6b7280"};">${job.status}</span>
        </div>
        <div style="color: #6b7280; font-size: 13px; margin-bottom: 4px;">
          <strong>Priority:</strong> ${job.priority}
        </div>
        <div style="color: #6b7280; font-size: 13px; margin-bottom: 4px;">
          <strong>Bids:</strong> ${job.bid_count}
        </div>
        <div style="font-size: 11px; color: #9ca3af; margin-top: 6px;">
          Posted: ${new Date(job.created_at).toLocaleDateString()}
        </div>
      </div>
    </div>
  `,
    )
    .join("")

  return `
    <div style="min-width: 300px; max-width: 350px; font-family: system-ui, -apple-system, sans-serif;">
      <div style="border-bottom: 2px solid #e5e7eb; padding-bottom: 8px; margin-bottom: 12px;">
        <strong style="font-size: 16px; color: #111827;">
          ${jobs.length} Job${jobs.length > 1 ? "s" : ""} at this Location
        </strong>
        <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">
          📍 ${jobs[0].city}, ${jobs[0].region}
        </div>
      </div>
      
      <div style="max-height: 400px; overflow-y: auto; padding-right: 8px;">
        ${jobsHtml}
      </div>
    </div>
  `
}

export function JobsHeatMap({ jobs }: JobsHeatMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient || !mapRef.current) return

    const initMap = async () => {
      try {
        const L = (await import("leaflet")).default
        const { default: heat } = await import("leaflet.heat")

        // Clear existing map if any
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove()
        }

        // Filter jobs with valid coordinates
        const validJobs = jobs.filter(
          (job) => job.latitude && job.longitude && !isNaN(job.latitude) && !isNaN(job.longitude),
        )

        if (validJobs.length === 0) {
          return
        }

        // Calculate center point
        const centerLat = validJobs.reduce((sum, job) => sum + job.latitude, 0) / validJobs.length
        const centerLng = validJobs.reduce((sum, job) => sum + job.longitude, 0) / validJobs.length

        delete (L.Icon.Default.prototype as any)._getIconUrl
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        })

        // Initialize map
        const map = L.map(mapRef.current).setView([centerLat, centerLng], 11)
        mapInstanceRef.current = map

        // Add tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
          maxZoom: 18,
        }).addTo(map)

        // Prepare heat map data
        const heatData = validJobs.map((job) => [job.latitude, job.longitude, 0.8])

        const heatLayer = (L as any).heatLayer(heatData, {
          radius: 25,
          blur: 15,
          maxZoom: 17,
          gradient: {
            0.0: "blue",
            0.5: "lime",
            0.7: "yellow",
            1.0: "red",
          },
        })
        heatLayer.addTo(map)

        const groupedJobs = groupJobsByLocation(validJobs)

        groupedJobs.forEach((jobsAtLocation, locationKey) => {
          const [lat, lng] = locationKey.split(",").map(Number)

          let icon = L.icon({
            iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
            iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41],
          })

          if (jobsAtLocation.length > 1) {
            const svgIcon = `
              <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 9.4 12.5 28.5 12.5 28.5S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z" fill="#3b82f6"/>
                <circle cx="12.5" cy="12.5" r="8" fill="white"/>
                <text x="12.5" y="17" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#3b82f6">${jobsAtLocation.length}</text>
              </svg>
            `
            icon = L.divIcon({
              html: svgIcon,
              className: "",
              iconSize: [25, 41],
              iconAnchor: [12, 41],
              popupAnchor: [1, -34],
            })
          }

          const marker = L.marker([lat, lng], { icon })

          const popupContent = createMultiJobPopup(jobsAtLocation)
          marker.bindPopup(popupContent, {
            maxWidth: 400,
            className: "custom-popup",
          })

          marker.addTo(map)
        })

        // Fit bounds to show all markers
        if (validJobs.length > 1) {
          const bounds = L.latLngBounds(validJobs.map((job) => [job.latitude, job.longitude]))
          map.fitBounds(bounds, { padding: [50, 50] })
        }
      } catch (error) {
        console.error("[v0] Error initializing map:", error)
      }
    }

    initMap()

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [jobs, isClient])

  const validJobsCount = jobs.filter(
    (job) => job.latitude && job.longitude && !isNaN(job.latitude) && !isNaN(job.longitude),
  ).length

  if (!isClient) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Job Heat Map</CardTitle>
          <CardDescription>Loading map...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full rounded-lg bg-muted animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  if (validJobsCount === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Job Heat Map</CardTitle>
          <CardDescription>Geographic distribution of jobs</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[400px] text-muted-foreground">
            <p>No jobs with valid location data to display on map</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Job Heat Map</CardTitle>
        <CardDescription>
          Geographic distribution of {validJobsCount} job{validJobsCount !== 1 ? "s" : ""} across the platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div ref={mapRef} className="h-[400px] w-full rounded-lg overflow-hidden border relative z-0" />
      </CardContent>
    </Card>
  )
}
