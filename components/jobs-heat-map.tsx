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
}

interface JobsHeatMapProps {
  jobs: Job[]
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

        // Add markers for each job
        validJobs.forEach((job) => {
          const marker = L.marker([job.latitude, job.longitude])
          marker.bindPopup(`
            <div style="min-width: 200px;">
              <strong>${job.title}</strong><br/>
              <span style="color: #666;">${job.service}</span><br/>
              <span style="font-size: 12px;">${job.city}, ${job.region}</span><br/>
              <span style="font-size: 12px; color: #888;">Status: ${job.status}</span>
            </div>
          `)
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
        <div ref={mapRef} className="h-[400px] w-full rounded-lg overflow-hidden border" />
      </CardContent>
    </Card>
  )
}
