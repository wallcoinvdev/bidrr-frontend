"use client"

import { useEffect, useRef, useState } from "react"

interface Job {
  id: number
  title: string
  service: string
  status: string
  city: string
  region: string
  latitude?: number
  longitude?: number
  created_at: string
}

interface JobsMapProps {
  jobs: Job[]
  onJobClick: (job: Job) => void
}

export function JobsMap({ jobs, onJobClick }: JobsMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    // Load Leaflet dynamically on client side only
    const initMap = async () => {
      try {
        // Dynamically import Leaflet
        const L = (await import("leaflet")).default

        // Initialize map
        const map = L.map(mapRef.current!, {
          center: [52.1491, -106.6505], // Default to Saskatoon
          zoom: 11,
        })

        // Add tile layer
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map)

        // Filter jobs with coordinates
        const jobsWithCoords = jobs.filter((j) => j.latitude && j.longitude)

        // Group jobs by location
        const groupedJobs: { [key: string]: Job[] } = {}
        jobsWithCoords.forEach((job) => {
          const key = `${job.latitude},${job.longitude}`
          if (!groupedJobs[key]) {
            groupedJobs[key] = []
          }
          groupedJobs[key].push(job)
        })

        // Sort each group by date (newest first)
        Object.keys(groupedJobs).forEach((key) => {
          groupedJobs[key].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        })

        // Add markers
        const markers: any[] = []
        Object.entries(groupedJobs).forEach(([key, locationJobs]) => {
          const [lat, lng] = key.split(",").map(Number)

          // Create custom icon
          const icon = L.divIcon({
            className: "custom-marker",
            html: `
              <div style="position: relative;">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="#0F3D3E" stroke="#0F3D3E" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3" fill="white"></circle>
                </svg>
                ${
                  locationJobs.length > 1
                    ? `<span style="position: absolute; top: -8px; right: -8px; background: #ef4444; color: white; font-size: 12px; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; font-weight: bold;">${locationJobs.length}</span>`
                    : ""
                }
              </div>
            `,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32],
          })

          // Create marker
          const marker = L.marker([lat, lng], { icon }).addTo(map)

          // Create popup content
          const popupContent = `
            <div style="min-width: 200px; max-width: 300px;">
              <div style="font-weight: 600; color: #111827; margin-bottom: 8px;">
                ${locationJobs[0].city}, ${locationJobs[0].region}
              </div>
              <div style="font-size: 14px; color: #6b7280; margin-bottom: 12px;">
                ${locationJobs.length} ${locationJobs.length === 1 ? "job" : "jobs"} at this location
              </div>
              ${locationJobs
                .map(
                  (job, index) => `
                <div style="margin-bottom: 12px; padding-bottom: ${index < locationJobs.length - 1 ? "12px" : "0"}; border-bottom: ${index < locationJobs.length - 1 ? "1px solid #e5e7eb" : "none"};">
                  <div style="font-weight: 500; font-size: 14px; color: #111827; margin-bottom: 4px;">${job.title}</div>
                  <div style="font-size: 12px; color: #6b7280; margin-bottom: 8px;">
                    ${job.service} • ${new Date(job.created_at).toLocaleDateString()}
                  </div>
                  <button 
                    onclick="window.dispatchEvent(new CustomEvent('job-click', { detail: ${job.id} }))"
                    style="font-size: 12px; color: #0F3D3E; font-weight: 500; cursor: pointer; background: none; border: none; padding: 0; text-decoration: underline;">
                    View Details →
                  </button>
                </div>
              `,
                )
                .join("")}
            </div>
          `

          marker.bindPopup(popupContent, { maxWidth: 300 })
          markers.push(marker)
        })

        // Fit bounds to show all markers
        if (markers.length > 0) {
          const group = L.featureGroup(markers)
          map.fitBounds(group.getBounds().pad(0.2))
        }

        mapInstanceRef.current = map
        setIsLoading(false)
      } catch (error) {
        console.error("[v0] Error initializing map:", error)
        setIsLoading(false)
      }
    }

    initMap()

    // Cleanup
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
      }
    }
  }, [jobs])

  // Listen for job click events from popup
  useEffect(() => {
    const handleJobClick = (event: any) => {
      const jobId = event.detail
      const job = jobs.find((j) => j.id === jobId)
      if (job) {
        onJobClick(job)
      }
    }

    window.addEventListener("job-click", handleJobClick)
    return () => window.removeEventListener("job-click", handleJobClick)
  }, [jobs, onJobClick])

  return (
    <div className="relative w-full h-[400px] rounded-lg border border-gray-200 overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80">
          <p className="text-gray-500">Loading map...</p>
        </div>
      )}
      {!isLoading && jobs.filter((j) => j.latitude && j.longitude).length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80">
          <p className="text-gray-500">No jobs with location data available</p>
        </div>
      )}
    </div>
  )
}
