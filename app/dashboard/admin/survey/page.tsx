"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ClipboardList, Loader2, MessageSquare } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { usePageTitle } from "@/hooks/use-page-title"

interface SurveyResultItem {
  option_key: string
  label: string
  count: number
  percentage: number
}

interface OtherResponse {
  id: number
  text: string
  created_at: string
}

interface SurveyResults {
  total_responses: number
  results: SurveyResultItem[]
  other_responses: OtherResponse[]
}

const optionLabels: Record<string, string> = {
  competitive_bids: "Get multiple competitive bids fast (within 24–72 hours)",
  save_time: "Save time/effort – no need to call or message contractors one by one",
  compare_quotes: "Compare all quotes and contractor reviews in one place",
  promotional_discounts: "See which contractors are offering promotional discounts in one place",
  licensed_insured: "Only deal with licensed and insured contractors",
  saved_communication: "Have the option to have communication and bids saved inside account",
  other: "Other (please tell us)",
}

const COLORS = [
  "#2563eb", // Blue
  "#dc2626", // Red
  "#16a34a", // Green
  "#9333ea", // Purple
  "#ea580c", // Orange
  "#0891b2", // Cyan
  "#db2777", // Pink
]

export default function AdminSurveyPage() {
  usePageTitle("Survey Results")

  const [data, setData] = useState<SurveyResults | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [visibleOtherResponses, setVisibleOtherResponses] = useState(10)

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const response = await apiClient.get("/api/admin/survey/results")
        setData(response)
      } catch (err: any) {
        if (err?.message?.includes("Admin access required")) {
          setError("Backend survey endpoints not configured yet. Please add the survey routes to the backend.")
        } else {
          setError("Failed to load survey results")
        }
      } finally {
        setLoading(false)
      }
    }

    fetchResults()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#0F3D3E]" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  const maxCount = data?.results ? Math.max(...data.results.map((r) => r.count), 1) : 1

  const resultMap = new Map(data?.results?.map((r) => [r.option_key, r]) || [])

  const pieChartData = Object.entries(optionLabels)
    .map(([key, label], index) => {
      const result = resultMap.get(key)
      return {
        name: label.length > 30 ? label.substring(0, 30) + "..." : label,
        fullName: label,
        value: result?.count || 0,
        color: COLORS[index % COLORS.length],
      }
    })
    .filter((item) => item.value > 0)

  const sortedOtherResponses = [...(data?.other_responses || [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  )
  const displayedOtherResponses = sortedOtherResponses.slice(0, visibleOtherResponses)
  const hasMoreResponses = sortedOtherResponses.length > visibleOtherResponses

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-gray-900">Survey Results</h1>
        <p className="text-sm md:text-base text-gray-600 mt-1">Customer feedback on what makes them choose Bidrr</p>
      </div>

      {/* Total responses */}
      <Card>
        <CardContent className="p-4 md:p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-[#0F3D3E]/10 rounded-full flex items-center justify-center">
              <ClipboardList className="w-6 h-6 text-[#0F3D3E]" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Responses</p>
              <p className="text-3xl font-bold text-gray-900">{data?.total_responses || 0}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Option breakdown */}
      <Card>
        <CardHeader className="p-4 md:p-6">
          <CardTitle className="text-base md:text-lg">Response Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {/* Left column - bars */}
            <div className="space-y-4">
              {Object.entries(optionLabels).map(([key, label], index) => {
                const result = resultMap.get(key)
                const count = result?.count || 0
                const percentage = result?.percentage || 0

                return (
                  <div key={key} className="space-y-2">
                    <div className="flex justify-between items-start gap-2 md:gap-4">
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <div
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-xs md:text-sm text-gray-700 break-words">{label}</span>
                      </div>
                      <span className="text-xs md:text-sm font-medium text-gray-900 whitespace-nowrap">
                        {count} ({percentage}%)
                      </span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden ml-5">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${maxCount > 0 ? (count / maxCount) * 100 : 0}%`,
                          backgroundColor: COLORS[index % COLORS.length],
                        }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Right column - pie chart */}
            <div className="flex items-center justify-center min-h-[250px] md:min-h-[300px]">
              {pieChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {pieChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number, name: string, props: any) => [
                        `${value} votes`,
                        props.payload.fullName,
                      ]}
                      contentStyle={{
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        fontSize: "12px",
                        maxWidth: "250px",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-gray-500 text-sm">No responses yet</p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Other responses */}
      {data?.other_responses && data.other_responses.length > 0 && (
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg flex items-center gap-2">
              <MessageSquare className="w-4 h-4 md:w-5 md:h-5" />
              "Other" Responses ({data.other_responses.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <div className="space-y-4">
              {displayedOtherResponses.map((response) => (
                <div key={response.id} className="p-3 md:p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm md:text-base text-gray-800 break-words">{response.text}</p>
                  <p className="text-xs text-gray-500 mt-2">{new Date(response.created_at).toLocaleString()}</p>
                </div>
              ))}

              {hasMoreResponses && (
                <div className="flex justify-center pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setVisibleOtherResponses((prev) => prev + 10)}
                    className="w-full sm:w-auto border-[#0F3D3E] text-[#0F3D3E] hover:bg-[#0F3D3E]/5"
                  >
                    Load More ({sortedOtherResponses.length - visibleOtherResponses} remaining)
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state for other responses */}
      {(!data?.other_responses || data.other_responses.length === 0) && (
        <Card>
          <CardHeader className="p-4 md:p-6">
            <CardTitle className="text-base md:text-lg flex items-center gap-2">
              <MessageSquare className="w-4 h-4 md:w-5 md:h-5" />
              "Other" Responses
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 md:p-6">
            <p className="text-sm md:text-base text-gray-500 text-center py-8">No "Other" responses yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
