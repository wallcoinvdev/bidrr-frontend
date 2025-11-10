"use client"

import { DollarSign, TrendingUp, Calendar, Loader2, RefreshCw, AlertCircle } from "lucide-react"
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"

interface ServiceCost {
  name: string
  daily: number
  monthly: number
  annual: number
  usage?: {
    label: string
    value: string | number
  }[]
  status: "success" | "error" | "unavailable"
  error?: string
}

interface BillingData {
  services: ServiceCost[]
  totals: {
    daily: number
    monthly: number
    annual: number
  }
  last_updated: string
}

type TimeRange = "daily" | "monthly" | "annual"

export default function BillingPage() {
  const [billingData, setBillingData] = useState<BillingData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState("")
  const [timeRange, setTimeRange] = useState<TimeRange>("monthly")

  useEffect(() => {
    fetchBillingData()
  }, [])

  const fetchBillingData = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      setError("")

      console.log("[v0] Fetching billing data from /api/admin/billing")
      const data = await apiClient.request<BillingData>("/api/admin/billing", { requiresAuth: true })
      console.log("[v0] Billing data received:", data)
      setBillingData(data)
    } catch (error: any) {
      console.error("[v0] Error fetching billing data:", error)
      console.error("[v0] Error details:", { message: error.message, response: error.response, status: error.status })
      setError(error.message || "Failed to load billing information")
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount)
  }

  const getServiceIcon = (serviceName: string) => {
    if (!serviceName) return "🔧"
    const name = serviceName.toLowerCase()
    if (name.includes("railway")) return "🚂"
    if (name.includes("aws") || name.includes("s3")) return "☁️"
    if (name.includes("google")) return "🗺️"
    if (name.includes("twilio")) return "📱"
    if (name.includes("mailersend")) return "✉️"
    if (name.includes("stripe")) return "💳"
    return "🔧"
  }

  const getCurrentCost = (service: ServiceCost) => {
    if (timeRange === "daily") return service.daily
    if (timeRange === "monthly") return service.monthly
    return service.annual
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Billing & Costs</h1>
          <p className="text-gray-600 mt-2">Track third-party service usage and costs</p>
        </div>
        <button
          onClick={() => fetchBillingData(true)}
          disabled={refreshing}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {/* Time Range Selector */}
      <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1 w-fit">
        <button
          onClick={() => setTimeRange("daily")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            timeRange === "daily" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Daily
        </button>
        <button
          onClick={() => setTimeRange("monthly")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            timeRange === "monthly" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Monthly
        </button>
        <button
          onClick={() => setTimeRange("annual")}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            timeRange === "annual" ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          Annual
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading billing data...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-red-900 mb-1">Error Loading Billing Data</h3>
              <p className="text-red-700 text-sm mb-3">{error}</p>
              <button
                onClick={() => fetchBillingData()}
                className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      ) : billingData ? (
        <>
          {/* Total Cost Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Daily Cost</h3>
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(billingData.totals.daily)}</p>
              <p className="text-sm text-gray-500 mt-1">Per day average</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Monthly Cost</h3>
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(billingData.totals.monthly)}</p>
              <p className="text-sm text-gray-500 mt-1">Current month estimate</p>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600">Annual Projection</h3>
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <p className="text-3xl font-bold text-gray-900">{formatCurrency(billingData.totals.annual)}</p>
              <p className="text-sm text-gray-500 mt-1">Based on current usage</p>
            </div>
          </div>

          {/* Service Breakdown */}
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-bold text-gray-900">Service Breakdown</h3>
              <p className="text-sm text-gray-600 mt-1">
                Last updated: {new Date(billingData.last_updated).toLocaleString()}
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Service</th>
                    <th className="text-left py-3 px-6 text-sm font-semibold text-gray-700">Usage</th>
                    <th className="text-right py-3 px-6 text-sm font-semibold text-gray-700">
                      {timeRange === "daily" ? "Daily" : timeRange === "monthly" ? "Monthly" : "Annual"} Cost
                    </th>
                    <th className="text-center py-3 px-6 text-sm font-semibold text-gray-700">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {billingData.services.map((service, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{getServiceIcon(service.name)}</span>
                          <span className="font-medium text-gray-900">{service.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {service.usage && service.usage.length > 0 ? (
                          <div className="space-y-1">
                            {service.usage.map((item, idx) => (
                              <div key={idx} className="text-sm text-gray-600">
                                <span className="font-medium">{item.label}:</span> {item.value}
                              </div>
                            ))}
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No usage data</span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <span className="text-lg font-bold text-gray-900">
                          {formatCurrency(getCurrentCost(service))}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        {service.status === "success" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Active
                          </span>
                        ) : service.status === "error" ? (
                          <div className="flex flex-col items-center gap-1">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Error
                            </span>
                            {service.error && (
                              <span className="text-xs text-red-600 max-w-[200px] truncate" title={service.error}>
                                {service.error}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            Unavailable
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 border-t-2 border-gray-300">
                  <tr>
                    <td colSpan={2} className="py-4 px-6 text-right font-bold text-gray-900">
                      Total {timeRange === "daily" ? "Daily" : timeRange === "monthly" ? "Monthly" : "Annual"} Cost:
                    </td>
                    <td className="py-4 px-6 text-right">
                      <span className="text-2xl font-bold text-blue-600">
                        {formatCurrency(
                          timeRange === "daily"
                            ? billingData.totals.daily
                            : timeRange === "monthly"
                              ? billingData.totals.monthly
                              : billingData.totals.annual,
                        )}
                      </span>
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Info Banner */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-blue-900 mb-1">About This Data</h4>
                <p className="text-sm text-blue-700">
                  Cost estimates are fetched from third-party APIs and may have a delay. Some services provide estimates
                  rather than exact costs. Costs are calculated based on current usage patterns and may vary month to
                  month.
                </p>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
