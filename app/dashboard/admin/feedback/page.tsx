"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { Loader2, MessageSquare } from "lucide-react"
import { Card } from "@/components/ui/card"

interface Feedback {
  id: number
  user_id: number
  user_name: string
  message: string
  status: string
  created_at: string
}

export default function FeedbackPage() {
  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [statusFilter, setStatusFilter] = useState<string>("pending")

  useEffect(() => {
    fetchFeedback()
  }, [])

  const fetchFeedback = async () => {
    try {
      setLoading(true)
      const data = await apiClient.request<{ feedback: Feedback[] }>("/api/admin/feedback", {
        requiresAuth: true,
      })
      setFeedback(data.feedback || [])
    } catch (error: any) {
      console.error("Error fetching feedback:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredFeedback = feedback.filter((f) => {
    if (statusFilter === "all") return true
    return f.status === statusFilter
  })

  const pendingCount = feedback.filter((f) => f.status === "pending").length
  const resolvedCount = feedback.filter((f) => f.status === "resolved").length
  const allCount = feedback.length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#0F3D3E]" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900">User Feedback</h1>
        <p className="text-gray-500 mt-2">View and manage feedback submitted by users</p>
      </div>

      {/* Feedback Section */}
      <Card className="p-6 bg-white border border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Feedback Submissions</h2>
        <p className="text-sm text-gray-600 mb-6">User feedback from the in-app feedback button</p>

        {/* Status Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              statusFilter === "pending"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter("resolved")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              statusFilter === "resolved"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Resolved ({resolvedCount})
          </button>
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              statusFilter === "all"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            All ({allCount})
          </button>
        </div>

        {/* Empty State */}
        {filteredFeedback.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium text-lg">No feedback submissions yet</p>
          </div>
        )}

        {/* Feedback List */}
        {filteredFeedback.length > 0 && (
          <div className="space-y-4">
            {filteredFeedback.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">{item.user_name}</p>
                    <p className="text-sm text-gray-500">{new Date(item.created_at).toLocaleString()}</p>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      item.status === "resolved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <p className="text-gray-700">{item.message}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
