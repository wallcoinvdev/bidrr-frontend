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
  feedback_id: number
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
  const { toast } = useToast()

  useEffect(() => {
    fetchFeedback()
  }, [])

  const fetchFeedback = async () => {
    try {
      setLoading(true)
      const response = await apiClient.get<{ feedback: Feedback[] }>("/api/admin/feedback")
      setFeedback(response.feedback)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch feedback",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResolve = async (feedbackId: number) => {
    try {
      await apiClient.post(`/api/admin/feedback/${feedbackId}/resolve`)
      toast({
        title: "Success",
        description: "Feedback marked as resolved",
      })
      fetchFeedback()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resolve feedback",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (feedbackId: number) => {
    if (!confirm("Are you sure you want to delete this feedback?")) {
      return
    }

    try {
      await apiClient.delete(`/api/admin/feedback/${feedbackId}`)
      toast({
        title: "Success",
        description: "Feedback deleted successfully",
      })
      fetchFeedback()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete feedback",
        variant: "destructive",
      })
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
                  {filteredFeedback.map((item) => (
                    <Card key={item.feedback_id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{item.user_name}</h3>
                              <Badge variant={item.status === "resolved" ? "outline" : "default"}>{item.status}</Badge>
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
                              <Button variant="outline" size="sm" onClick={() => handleResolve(item.feedback_id)}>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Resolve
                              </Button>
                            )}
                            <Button variant="destructive" size="sm" onClick={() => handleDelete(item.feedback_id)}>
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
