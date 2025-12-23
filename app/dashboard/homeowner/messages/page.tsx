"use client"

import { useState, useEffect } from "react"
import { DashboardLayout } from "@/components/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Send, MoreVertical } from "lucide-react"
import { apiClient } from "@/lib/api-client"
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
import { useToast } from "@/hooks/use-toast"
import { usePageTitle } from "@/hooks/use-page-title"

interface Message {
  id: number
  sender_id: number
  sender_name: string
  content: string
  created_at: string
}

interface Conversation {
  id: number
  contractor_id: number
  contractor_name: string
  contractor_company: string
  mission_title: string
  last_message: string
  last_message_at: string
  unread_count: number
}

export default function MessagesPage() {
  usePageTitle("Messages")

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageInput, setMessageInput] = useState("")
  const [loading, setLoading] = useState(true)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [showMobileChat, setShowMobileChat] = useState(false)
  const { toast } = useToast()

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
      const data = await apiClient.request<Conversation[]>("/api/conversations", {
        requiresAuth: true,
      })

      setConversations(data || [])
      if (data && data.length > 0 && !selectedConversation) {
        setSelectedConversation(data[0])
      }
    } catch (error) {
      console.error("Error fetching conversations:", error)
      setConversations([])
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (conversationId: number) => {
    try {
      const data = await apiClient.request<{ messages: Message[] }>(`/api/conversations/${conversationId}/messages`, {
        requiresAuth: true,
      })

      setMessages(data.messages || [])
      await markConversationAsRead(conversationId)
    } catch (error) {
      console.error("Error fetching messages:", error)
      setMessages([])
    }
  }

  const sendMessage = async () => {
    if (!messageInput.trim() || !selectedConversation) return

    try {
      await apiClient.request(`/api/conversations/${selectedConversation.id}/messages`, {
        method: "POST",
        body: JSON.stringify({ content: messageInput }),
        requiresAuth: true,
      })
      setMessageInput("")
      fetchMessages(selectedConversation.id)
      fetchConversations()
      toast({
        title: "Success",
        description: "Message sent successfully",
      })
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      })
    }
  }

  const deleteConversation = async () => {
    if (!selectedConversation) return

    try {
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

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
  }

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

    if (diffHours < 1) return "Just now"
    if (diffHours < 24) return `${diffHours} hours ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays === 1) return "Yesterday"
    return `${diffDays} days ago`
  }

  return (
    <DashboardLayout userRole="homeowner">
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
                  <div className="font-semibold text-sm mb-1 truncate">{conv.contractor_company}</div>
                  <div className="text-xs text-muted-foreground mb-2 truncate">{conv.mission_title}</div>
                  <div className="text-sm text-foreground mb-1 line-clamp-1 break-words">{conv.last_message}</div>
                  {conv.last_message_at && (
                    <div className="text-xs text-muted-foreground">{formatRelativeTime(conv.last_message_at)}</div>
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
              <span className="font-semibold">Note:</span> Conversations will appear here when contractors submit bids
              on your job posts. You can message contractors directly to ask questions or discuss project details.
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
                  <h2 className="text-sm font-semibold truncate">{selectedConversation.contractor_company}</h2>
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
                {messages.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground text-sm sm:text-base px-4">
                    No messages yet. Start the conversation!
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isFromHomeowner = msg.sender_id !== selectedConversation.contractor_id
                    return (
                      <div key={msg.id} className={`flex ${isFromHomeowner ? "justify-end" : "justify-start"}`}>
                        <div
                          className={`max-w-[85%] sm:max-w-[70%] rounded-lg p-3 ${
                            isFromHomeowner ? "bg-teal-600 text-white" : "bg-muted text-foreground"
                          }`}
                        >
                          <p className="text-sm break-words overflow-wrap-anywhere">{msg.content}</p>
                          <p className={`text-xs mt-1 ${isFromHomeowner ? "text-teal-100" : "text-muted-foreground"}`}>
                            {formatTime(msg.created_at)}
                          </p>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>

              <div className="p-3 sm:p-6 border-t flex-shrink-0">
                <div className="flex gap-2">
                  <Input
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 min-w-0"
                  />
                  <Button onClick={sendMessage} size="icon" className="bg-teal-600 hover:bg-teal-700 flex-shrink-0">
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
