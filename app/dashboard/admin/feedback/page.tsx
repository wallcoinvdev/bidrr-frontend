"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { Loader2, MessageSquare, Star, Check, X } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { usePageTitle } from "@/hooks/use-page-title"

interface Feedback {
  id: number
  user_id: number
  user_name: string
  message: string
  status: string
  is_flagged?: boolean
  created_at: string
}

export default function FeedbackPage() {
  usePageTitle("User Feedback")

  const [loading, setLoading] = useState(true)
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [statusFilter, setStatusFilter] = useState<string>("pending")
  const [updatingId, setUpdatingId] = useState<number | null>(null)
  const { toast } = useToast()

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
      toast({
        title: "Error",
        description: "Failed to load feedback submissions",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleStatus = async (id: number, currentStatus: string) => {
    const newStatus = currentStatus === "resolved" ? "pending" : "resolved"
    setUpdatingId(id)

    try {
      await apiClient.put(`/api/admin/feedback/${id}/status`, { status: newStatus })

      setFeedback((prev) => prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item)))

      toast({
        title: "Success",
        description: `Feedback marked as ${newStatus}`,
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update feedback status",
        variant: "destructive",
      })
    } finally {
      setUpdatingId(null)
    }
  }

  const toggleFlag = async (id: number, currentFlag: boolean) => {
    const newFlag = !currentFlag
    setUpdatingId(id)

    try {
      await apiClient.put(`/api/admin/feedback/${id}/flag`, { is_flagged: newFlag })

      setFeedback((prev) => prev.map((item) => (item.id === id ? { ...item, is_flagged: newFlag } : item)))

      toast({
        title: "Success",
        description: newFlag ? "Feedback flagged as important" : "Feedback unflagged",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update feedback flag",
        variant: "destructive",
      })
    } finally {
      setUpdatingId(null)
    }
  }

  const filteredFeedback = feedback.filter((f) => {
    if (statusFilter === "flagged") return f.is_flagged === true
    if (statusFilter === "all") return true
    return f.status === statusFilter
  })

  const pendingCount = feedback.filter((f) => f.status === "pending").length
  const resolvedCount = feedback.filter((f) => f.status === "resolved").length
  const flaggedCount = feedback.filter((f) => f.is_flagged === true).length
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
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">User Feedback</h1>
        <p className="text-gray-500 mt-2">View and manage feedback submitted by users</p>
      </div>

      {/* Feedback Section */}
      <Card className="p-4 md:p-6 bg-white border border-gray-200 shadow-sm">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 mb-2">Feedback Submissions</h2>
        <p className="text-sm text-gray-600 mb-6">User feedback from the in-app feedback button</p>

        {/* Status Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setStatusFilter("pending")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              statusFilter === "pending"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter("resolved")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              statusFilter === "resolved"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Resolved ({resolvedCount})
          </button>
          <button
            onClick={() => setStatusFilter("flagged")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
              statusFilter === "flagged"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-600 hover:text-gray-900"
            }`}
          >
            Flagged ({flaggedCount})
          </button>
          <button
            onClick={() => setStatusFilter("all")}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
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
            <p className="text-gray-500 font-medium text-lg text-center">No feedback submissions yet</p>
          </div>
        )}

        {/* Feedback List */}
        {filteredFeedback.length > 0 && (
          <div className="space-y-4">
            {filteredFeedback.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-3 md:p-4">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    {item.is_flagged && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 flex-shrink-0" />}
                    <div className="min-w-0">
                      <p className="font-semibold text-gray-900 truncate">{item.user_name}</p>
                      <p className="text-xs md:text-sm text-gray-500">{new Date(item.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap self-start ${
                      item.status === "resolved" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </div>
                <p className="text-gray-700 mb-3 break-words">{item.message}</p>

                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => toggleStatus(item.id, item.status)}
                    disabled={updatingId === item.id}
                    className="text-xs w-full sm:w-auto"
                  >
                    {updatingId === item.id ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : item.status === "resolved" ? (
                      <X className="w-3 h-3 mr-1" />
                    ) : (
                      <Check className="w-3 h-3 mr-1" />
                    )}
                    {item.status === "resolved" ? "Mark as Pending" : "Mark as Resolved"}
                  </Button>

                  <Button
                    variant={item.is_flagged ? "default" : "outline"}
                    size="sm"
                    onClick={() => toggleFlag(item.id, item.is_flagged || false)}
                    disabled={updatingId === item.id}
                    className="text-xs w-full sm:w-auto"
                  >
                    {updatingId === item.id ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <Star className={`w-3 h-3 mr-1 ${item.is_flagged ? "fill-current" : ""}`} />
                    )}
                    {item.is_flagged ? "Unflag" : "Flag"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
