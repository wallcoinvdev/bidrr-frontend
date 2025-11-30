"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Send, MoreVertical } from "lucide-react"
import { useState, useEffect } from "react"
import { apiClient, ApiError } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Conversation {
  id: number
  homeowner_id: number
  homeowner_name: string
  mission_id: number
  mission_title: string
  last_message?: string
  last_message_at?: string
  unread_count: number
  can_send: boolean
  bid_status?: "pending" | "accepted"
}

interface Message {
  id: number
  sender_id: number
  sender_name: string
  content: string
  created_at: string
}

interface MessagesResponse {
  messages: Message[]
  can_send: boolean
}

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messageText, setMessageText] = useState("")
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState({ status: "all", dateRange: "all" })
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [canSendMessage, setCanSendMessage] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [showReportModal, setShowReportModal] = useState(false)
  const [deletingConversation, setDeletingConversation] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false) // Added missing showDeleteDialog state
  const { toast } = useToast()

  const [showMobileChat, setShowMobileChat] = useState(false)

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id)
    }
  }, [selectedConversation])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const data = await apiClient.request<Conversation[]>("/api/conversations", { requiresAuth: true })
      setConversations(data)
    } catch (error) {
      console.error("Error fetching conversations:", error)
      setConversations([])
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (conversationId: number) => {
    try {
      setLoadingMessages(true)
      const data = await apiClient.request<MessagesResponse>(`/api/conversations/${conversationId}/messages`, {
        requiresAuth: true,
      })
      setMessages(data.messages)
      setCanSendMessage(data.can_send)
      await markConversationAsRead(conversationId)
    } catch (error) {
      console.error("Error fetching messages:", error)
      setMessages([])
      setCanSendMessage(false)
    } finally {
      setLoadingMessages(false)
    }
  }

  const markConversationAsRead = async (conversationId: number) => {
    try {
      await apiClient.request(`/api/conversations/${conversationId}/mark-read`, {
        method: "PUT",
        requiresAuth: true,
      })
      setConversations((prev) => prev.map((conv) => (conv.id === conversationId ? { ...conv, unread_count: 0 } : conv)))
      window.dispatchEvent(new CustomEvent("notificationUpdated"))
    } catch (error) {
      console.error("Error marking conversation as read:", error)
    }
  }

  const handleSendMessage = async () => {
    if (!selectedConversation || !messageText.trim() || sending) return

    setErrorMessage(null)

    const isBidAccepted = selectedConversation.bid_status === "accepted"
    if (!canSendMessage && !isBidAccepted) {
      const message = "You have already responded to the customer's last message. Please wait for them to reply."
      setErrorMessage(message)
      toast({ title: "Cannot send message", description: message, variant: "destructive" })
      return
    }

    // Removed contact validation check

    try {
      setSending(true)
      await apiClient.request(`/api/conversations/${selectedConversation.id}/messages`, {
        method: "POST",
        body: JSON.stringify({ content: messageText }),
        requiresAuth: true,
      })
      setMessageText("")
      await fetchMessages(selectedConversation.id)
      await fetchConversations()
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 403) {
        const message = error.errorData?.message || "You cannot send more messages at this time."
        setErrorMessage(message)
        toast({ title: "Message limit reached", description: message, variant: "destructive" })
      }
    } finally {
      setSending(false)
    }
  }

  const deleteConversation = async () => {
    if (!selectedConversation) return

    try {
      setDeletingConversation(true)
      await apiClient.request(`/api/conversations/${selectedConversation.id}`, {
        method: "DELETE",
        requiresAuth: true,
      })
      setSelectedConversation(null)
      setMessages([])
      fetchConversations()
      setShowDeleteDialog(false)
      toast({
        title: "Success",
        description: "Conversation deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting conversation:", error)
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive",
      })
    } finally {
      setDeletingConversation(false)
    }
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? "s" : ""} ago`
    if (diffHours < 24) return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <DashboardLayout userRole="contractor">
      <div className="flex h-[calc(100vh-80px)] gap-4 overflow-hidden">
        {/* Left Panel - Conversations List - Hidden on mobile when chat is open */}
        <Card className={`${showMobileChat ? "hidden md:flex" : "flex"} w-full md:w-80 flex-col overflow-hidden`}>
          <div className="p-4 sm:p-6 border-b flex-shrink-0">
            <h2 className="text-xl sm:text-2xl font-bold">Messages</h2>
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden">
            {loading ? (
              <div className="p-6 text-center text-muted-foreground">Loading conversations...</div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">No conversations yet</div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    setSelectedConversation(conv)
                    setShowMobileChat(true)
                  }}
                  className={`w-full p-4 text-left border-b hover:bg-muted/50 transition-colors ${
                    selectedConversation?.id === conv.id ? "bg-muted" : ""
                  }`}
                >
                  <div className="font-semibold text-sm mb-1 truncate">{conv.homeowner_name}</div>
                  <div className="text-xs text-muted-foreground mb-2 truncate">{conv.mission_title}</div>
                  {conv.last_message && (
                    <div className="text-sm text-foreground mb-1 line-clamp-1 break-words">{conv.last_message}</div>
                  )}
                  {conv.last_message_at && (
                    <div className="text-xs text-muted-foreground">{formatTimestamp(conv.last_message_at)}</div>
                  )}
                  {conv.unread_count > 0 && (
                    <span className="inline-block mt-2 bg-teal-600 text-white text-xs px-2 py-0.5 rounded-full">
                      {conv.unread_count}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>

          <div className="p-3 sm:p-4 border-t bg-muted/30 flex-shrink-0">
            <p className="text-xs text-muted-foreground">
              <span className="font-semibold">Note:</span> You can send an initial message with a bid or respond to
              customer messages. Once a bid is accepted, messaging becomes unrestricted.
            </p>
          </div>
        </Card>

        {/* Right Panel - Chat View - Full width on mobile when conversation selected */}
        <Card
          className={`${!showMobileChat && selectedConversation ? "hidden md:flex" : "flex"} flex-1 flex-col overflow-hidden`}
        >
          {selectedConversation ? (
            <>
              <div className="p-4 sm:p-6 border-b flex items-center justify-between flex-shrink-0">
                <button
                  onClick={() => setShowMobileChat(false)}
                  className="md:hidden mr-2 p-2 hover:bg-muted rounded-lg flex-shrink-0"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <div className="flex-1 min-w-0">
                  <h2 className="text-sm font-semibold truncate">{selectedConversation.homeowner_name}</h2>
                  <p className="text-xs text-muted-foreground truncate">{selectedConversation.mission_title}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="flex-shrink-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem className="text-red-600 focus:text-red-600">Report User</DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600"
                      onClick={() => setShowDeleteDialog(true)}
                    >
                      Delete Conversation
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 space-y-4">
                {loadingMessages ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm sm:text-base px-4">
                    Loading messages...
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm sm:text-base px-4">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isContractor = msg.sender_id !== selectedConversation.homeowner_id
                    return (
                      <div key={msg.id} className={`flex ${isContractor ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[85%] sm:max-w-[70%] rounded-lg p-3 ${
                            isContractor ? "bg-teal-600 text-white" : "bg-muted text-foreground"
                          }`}
                        >
                          <p className="text-sm break-words overflow-wrap-anywhere">{msg.content}</p>
                          <p className={`text-xs mt-1 ${isContractor ? "text-teal-100" : "text-muted-foreground"}`}>
                            {new Date(msg.created_at).toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              <div className="p-3 sm:p-6 border-t flex-shrink-0">
                {errorMessage && (
                  <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-800">{errorMessage}</p>
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    value={messageText}
                    onChange={(e) => {
                      setMessageText(e.target.value)
                      if (errorMessage) setErrorMessage(null)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    placeholder="Type a message..."
                    className="flex-1 min-w-0"
                    disabled={sending || (!canSendMessage && selectedConversation.bid_status !== "accepted")}
                  />
                  <Button
                    onClick={handleSendMessage}
                    size="icon"
                    className="bg-teal-600 hover:bg-teal-700 flex-shrink-0"
                    disabled={sending || !messageText.trim()}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm sm:text-base p-4 text-center">
              Select a conversation to view messages
            </div>
          )}
        </Card>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Conversation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this conversation? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteConversation} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  )
}
