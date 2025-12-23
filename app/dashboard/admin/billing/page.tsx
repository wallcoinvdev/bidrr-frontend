"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { Loader2, DollarSign, Calendar, TrendingUp, RefreshCw, Info } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { usePageTitle } from "@/hooks/use-page-title"

interface Service {
  name: string
  daily: number
  monthly: number
  annual: number
  usage: Array<{ label: string; value: string }>
  status: string
  error?: string
}

interface BillingResponse {
  services: Service[]
  totals: {
    daily: number
    monthly: number
    annual: number
  }
  last_updated: string
}

export default function BillingPage() {
  usePageTitle("Billing & Costs")

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<BillingResponse | null>(null)
  const [activeTab, setActiveTab] = useState<"daily" | "monthly" | "annual">("monthly")

  useEffect(() => {
    fetchBilling()
  }, [])

  const fetchBilling = async () => {
    try {
      setLoading(true)
      const response = await apiClient.request<BillingResponse>("/api/admin/billing", {
        requiresAuth: true,
      })
      setData(response)
    } catch (error) {
      console.error("Error fetching billing:", error)
    } finally {
      setLoading(false)
    }
  }

  const refreshBilling = async () => {
    try {
      await apiClient.request("/api/admin/billing/refresh", {
        method: "POST",
        requiresAuth: true,
      })
      await fetchBilling()
    } catch (error) {
      console.error("Error refreshing billing:", error)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#0F3D3E]" />
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "success":
        return "bg-green-100 text-green-700"
      case "unavailable":
        return "bg-gray-100 text-gray-600"
      case "error":
        return "bg-red-100 text-red-700"
      default:
        return "bg-gray-100 text-gray-600"
    }
  }

  const getServiceIcon = (name: string) => {
    if (name.includes("Railway")) return "🚂"
    if (name.includes("AWS") || name.includes("S3")) return "☁️"
    if (name.includes("Twilio")) return "📱"
    if (name.includes("Google")) return "🌐"
    if (name.includes("MailerSend")) return "✉️"
    if (name.includes("Neon")) return "🔷"
    return "⚙️"
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Billing & Costs</h1>
          <p className="text-gray-500 mt-2">Track third-party service usage and costs</p>
        </div>
        <Button onClick={refreshBilling} className="bg-blue-600 hover:bg-blue-700">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab("daily")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "daily"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          Daily
        </button>
        <button
          onClick={() => setActiveTab("monthly")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "monthly"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setActiveTab("annual")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "annual"
              ? "bg-blue-600 text-white"
              : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
          }`}
        >
          Annual
        </button>
      </div>

      {/* Cost Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-sm text-gray-600 mb-2">Daily Cost</p>
          <p className="text-4xl font-bold text-gray-900">${(data?.totals?.daily || 0).toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-2">Per day average</p>
        </Card>

        <Card className="p-6 bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-sm text-gray-600 mb-2">Monthly Cost</p>
          <p className="text-4xl font-bold text-gray-900">${(data?.totals?.monthly || 0).toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-2">Current month estimate</p>
        </Card>

        <Card className="p-6 bg-white border border-gray-200 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-sm text-gray-600 mb-2">Annual Projection</p>
          <p className="text-4xl font-bold text-gray-900">${(data?.totals?.annual || 0).toFixed(2)}</p>
          <p className="text-sm text-gray-500 mt-2">Based on current usage</p>
        </Card>
      </div>

      {/* Service Breakdown */}
      <Card className="p-6 bg-white border border-gray-200 shadow-sm">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900">Service Breakdown</h2>
          <p className="text-sm text-gray-500 mt-1">
            Last updated: {data?.last_updated ? new Date(data.last_updated).toLocaleString() : "N/A"}
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Service</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Usage</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Monthly Cost</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data?.services?.map((service, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{getServiceIcon(service.name)}</span>
                      <span className="font-medium text-gray-900">{service.name}</span>
                    </div>
                  </td>
                  <td className="py-4 px-4">
                    {service.usage && service.usage.length > 0 ? (
                      <div className="space-y-1">
                        {service.usage.map((u, i) => (
                          <div key={i} className="text-sm text-gray-600">
                            {u.label}: {u.value}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">No usage data</span>
                    )}
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-lg font-bold text-gray-900">${(service.monthly || 0).toFixed(2)}</span>
                  </td>
                  <td className="py-4 px-4">
                    <Badge className={getStatusColor(service.status)}>
                      {service.status.charAt(0).toUpperCase() + service.status.slice(1)}
                    </Badge>
                    {service.error && <p className="text-xs text-red-600 mt-1">{service.error}</p>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">Total Monthly Cost:</span>
            <span className="text-3xl font-bold text-blue-600">${(data?.totals?.monthly || 0).toFixed(2)}</span>
          </div>
        </div>
      </Card>

      {/* Info Box */}
      <Card className="p-4 bg-blue-50 border border-blue-200">
        <div className="flex gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900 mb-1">About This Data</h3>
            <p className="text-sm text-blue-700">
              Cost estimates are fetched from third-party APIs and may have a delay. Some services provide estimates
              rather than exact costs. Costs are calculated based on current usage patterns and may vary month to month.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
