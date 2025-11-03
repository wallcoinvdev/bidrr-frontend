"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CheckCircle, MessageSquare, Trash2 } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface Feedback {
  id?: number
  feedback_id?: number
  user_id: number
  user_name: string
  user_email: string
  message: string
  status: "pending" | "resolved"
  created_at: string
  resolved_at?: string
  resolved_by?: number
}

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<Feedback[]>([])
  const [statusFilter, setStatusFilter] = useState<string>("pending")
  const [loading, setLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [feedbackToDelete, setFeedbackToDelete] = useState<number | undefined>(undefined)
  const [deleting, setDeleting] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchFeedback()
  }, [])

  const fetchFeedback = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get<{ feedback: Feedback[] }>("/api/admin/feedback")
      console.log("[v0] Feedback response:", response)
      setFeedback(response.feedback)
    } catch (error) {
      console.error("[v0] Error fetching feedback:", error)
      toast({
        title: "Error",
        description: "Failed to fetch feedback",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResolve = async (feedbackId: number | undefined) => {
    console.log("[v0] handleResolve called with feedbackId:", feedbackId)

    if (!feedbackId) {
      toast({
        title: "Error",
        description: "Invalid feedback ID",
        variant: "destructive",
      })
      return
    }

    try {
      await apiClient.put(`/api/admin/feedback/${feedbackId}`, {
        status: "resolved",
      })
      toast({
        title: "Success",
        description: "Feedback marked as resolved",
      })
      fetchFeedback()
    } catch (error) {
      console.error("[v0] Error resolving feedback:", error)
      toast({
        title: "Error",
        description: "Failed to resolve feedback",
        variant: "destructive",
      })
    }
  }

  const handleDeleteClick = (feedbackId: number | undefined) => {
    if (!feedbackId) {
      toast({
        title: "Error",
        description: "Invalid feedback ID",
        variant: "destructive",
      })
      return
    }
    setFeedbackToDelete(feedbackId)
    setShowDeleteDialog(true)
  }

  const handleDelete = async () => {
    if (!feedbackToDelete) return

    try {
      setDeleting(true)
      await apiClient.delete(`/api/admin/feedback/${feedbackToDelete}`)
      toast({
        title: "Success",
        description: "Feedback deleted successfully",
      })
      fetchFeedback()
      setShowDeleteDialog(false)
      setFeedbackToDelete(undefined)
    } catch (error) {
      console.error("[v0] Error deleting feedback:", error)
      toast({
        title: "Error",
        description: "Failed to delete feedback",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  const filteredFeedback = feedback.filter((f) => statusFilter === "all" || f.status === statusFilter)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading feedback...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Feedback</h1>
        <p className="text-muted-foreground">View and manage feedback submitted by users</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Feedback Submissions</CardTitle>
          <CardDescription>User feedback from the in-app feedback button</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={statusFilter} onValueChange={setStatusFilter}>
            <TabsList>
              <TabsTrigger value="pending">
                Pending ({feedback.filter((f) => f.status === "pending").length})
              </TabsTrigger>
              <TabsTrigger value="resolved">
                Resolved ({feedback.filter((f) => f.status === "resolved").length})
              </TabsTrigger>
              <TabsTrigger value="all">All ({feedback.length})</TabsTrigger>
            </TabsList>

            <TabsContent value={statusFilter} className="space-y-4 mt-4">
              {filteredFeedback.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No feedback submissions yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFeedback.map((item) => {
                    const itemId = item.id || item.feedback_id

                    return (
                      <Card key={itemId}>
                        <CardContent className="pt-6">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 space-y-2">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold">{item.user_name}</h3>
                                <Badge variant={item.status === "resolved" ? "outline" : "default"}>
                                  {item.status}
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground">{item.user_email}</p>
                              <p className="text-sm mt-2">{item.message}</p>
                              <p className="text-xs text-muted-foreground">
                                Submitted: {new Date(item.created_at).toLocaleString()}
                              </p>
                              {item.resolved_at && (
                                <p className="text-xs text-muted-foreground">
                                  Resolved: {new Date(item.resolved_at).toLocaleString()}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              {item.status === "pending" && (
                                <Button variant="outline" size="sm" onClick={() => handleResolve(itemId)}>
                                  <CheckCircle className="h-4 w-4 mr-1" />
                                  Resolve
                                </Button>
                              )}
                              <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(itemId)}>
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {showDeleteDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Feedback?</h3>
            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to delete this feedback? This action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteDialog(false)
                  setFeedbackToDelete(undefined)
                }}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
                {deleting ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
