"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Send, AlertCircle, X } from "lucide-react"
import { useState, useEffect } from "react"
import { apiClient, ApiError } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface Conversation {
  id: number
  contractor_id: number
  contractor_name: string
  contractor_company: string
  mission_id: number
  mission_title: string
  last_message: string
  last_message_at: string
  unread_count: number
  can_send?: boolean // Added optional can_send flag (always true for homeowners)
}

interface Message {
  id: number
  conversation_id: number
  sender_id: number
  sender_name: string
  content: string
  created_at: string
}

interface MessagesResponse {
  messages: Message[]
  can_send?: boolean
}

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null) // Added error state for inline error display
  const [expandedConversationId, setExpandedConversationId] = useState<number | null>(null) // Added state to track which conversation's chat is expanded on mobile
  const [showChatModal, setShowChatModal] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchUserProfile()
    fetchConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation.id)
    }
  }, [selectedConversation])

  const fetchUserProfile = async () => {
    try {
      const data = await apiClient.request<{ id: number }>("/api/users/profile", { requiresAuth: true })
      setCurrentUserId(data.id)
    } catch (error) {
      console.error("[v0] Error fetching user profile:", error)
    }
  }

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const data = await apiClient.request<Conversation[]>("/api/conversations", { requiresAuth: true })
      console.log("[v0] Conversations fetched:", data)
      const normalizedData = data.map((conv) => ({
        ...conv,
        unread_count: Number(conv.unread_count) || 0,
      }))
      setConversations(normalizedData)
    } catch (error) {
      console.error("[v0] Error fetching conversations:", error)
      setConversations([])
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (conversationId: number) => {
    try {
      setLoadingMessages(true)
      const response = await apiClient.request<Message[] | MessagesResponse>(
        `/api/conversations/${conversationId}/messages`,
        {
          requiresAuth: true,
        },
      )

      const data = Array.isArray(response) ? response : response.messages
      console.log("[v0] Messages fetched:", data)
      setMessages(data)

      const conversation = conversations.find((c) => c.id === conversationId)
      if (conversation && conversation.unread_count > 0) {
        console.log("[v0] Conversation has unread messages, marking as read")
        await markConversationAsRead(conversationId)
      } else {
        console.log("[v0] Conversation already read, skipping mark as read")
      }
    } catch (error) {
      console.error("[v0] Error fetching messages:", error)
      setMessages([])
    } finally {
      setLoadingMessages(false)
    }
  }

  const markConversationAsRead = async (conversationId: number) => {
    try {
      console.log("[v0] Marking conversation as read:", conversationId)

      const response = await apiClient.request(`/api/conversations/${conversationId}/mark-read`, {
        method: "PUT",
        requiresAuth: true,
      })

      console.log("[v0] Mark as read response:", response)

      // Update local state: set unread_count to 0 for this conversation
      setConversations((prev) => prev.map((conv) => (conv.id === conversationId ? { ...conv, unread_count: 0 } : conv)))

      // Dispatch event to update badge count in sidebar
      console.log("[v0] Dispatching notificationUpdated event")
      window.dispatchEvent(new CustomEvent("notificationUpdated"))

      console.log("[v0] Conversation marked as read successfully:", conversationId)
    } catch (error) {
      console.error("[v0] Error marking conversation as read:", error)
    }
  }

  const handleSendMessage = async () => {
    if (!selectedConversation || !newMessage.trim() || sending) return

    setErrorMessage(null) // Clear any previous error messages

    try {
      setSending(true)
      await apiClient.request(`/api/conversations/${selectedConversation.id}/messages`, {
        method: "POST",
        body: JSON.stringify({ content: newMessage }),
        requiresAuth: true,
      })
      setNewMessage("")
      // Refresh messages
      await fetchMessages(selectedConversation.id)
      // Refresh conversations to update last message
      await fetchConversations()
    } catch (error) {
      console.error("[v0] Error sending message:", error)
      if (error instanceof ApiError) {
        const message = error.errorData?.message || "Please try again."
        setErrorMessage(message)
        toast({
          title: error.errorData?.error || "Failed to send message",
          description: message,
          variant: "destructive",
        })
      } else if (error instanceof Error) {
        const message = error.message || "Please try again."
        setErrorMessage(message)
        toast({
          title: "Failed to send message",
          description: message,
          variant: "destructive",
        })
      } else {
        const message = "Please try again."
        setErrorMessage(message)
        toast({
          title: "Failed to send message",
          description: message,
          variant: "destructive",
        })
      }
    } finally {
      setSending(false)
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
    <DashboardLayout userRole="homeowner">
      {showChatModal && selectedConversation && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col md:hidden">
          {/* Modal Header */}
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-gray-900 truncate">
                {selectedConversation.contractor_company || selectedConversation.contractor_name}
              </h2>
              <p className="text-sm text-gray-600 truncate">{selectedConversation.mission_title}</p>
            </div>
            <button
              onClick={() => setShowChatModal(false)}
              className="ml-4 p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {loadingMessages ? (
              <div className="text-center text-gray-500">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-400 text-sm">No messages in this conversation yet</div>
            ) : (
              messages.map((msg) => {
                const isCurrentUser = currentUserId === msg.sender_id
                return (
                  <div key={msg.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] rounded-lg p-3 ${
                        isCurrentUser ? "bg-[#328d87] text-white" : "bg-white text-gray-900 border border-gray-200"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${isCurrentUser ? "text-white/70" : "text-gray-500"}`}>
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

          {/* Message Input Area */}
          <div className="p-4 border-t border-gray-200 bg-white">
            {errorMessage && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-900">{errorMessage}</p>
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value)
                  if (errorMessage) setErrorMessage(null)
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent text-sm"
                disabled={sending}
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sending}
                className="px-4 py-2 bg-[#328d87] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="p-4 border-t border-gray-200 bg-blue-50">
            <p className="text-xs text-gray-700">
              <strong>Note:</strong> You can message contractors at any time. Contractors can only send an initial
              message with a bid or respond to your messages.
            </p>
          </div>
        </div>
      )}

      <div className="md:hidden flex flex-col h-[calc(100vh-8rem)]">
        <div className="flex-1 bg-white rounded-xl border border-gray-200 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Messages</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading conversations...</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-gray-500 text-sm">No messages yet</p>
                <p className="text-gray-400 text-xs mt-2">Messages from contractors will appear here</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    setSelectedConversation(conv)
                    setShowChatModal(true)
                  }}
                  className="w-full p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">
                        {conv.contractor_company || conv.contractor_name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 truncate">{conv.mission_title}</p>
                    </div>
                    {conv.unread_count > 0 && (
                      <div className="w-5 h-5 bg-[#328d87] rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                        <span className="text-xs text-white font-bold">{conv.unread_count}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">{conv.last_message}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatTimestamp(conv.last_message_at)}</p>
                </button>
              ))
            )}
          </div>
          <div className="p-4 border-t border-gray-200 bg-blue-50">
            <p className="text-xs text-gray-700">
              <strong>Note:</strong> You can message contractors at any time. Contractors can only send an initial
              message with a bid or respond to your messages.
            </p>
          </div>
        </div>
      </div>

      {/* Desktop view - unchanged */}
      <div className="hidden md:flex gap-6 h-[calc(100vh-12rem)]">
        <div className="w-80 bg-white rounded-xl border border-gray-200 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Messages</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading conversations...</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-gray-500 text-sm">No messages yet</p>
                <p className="text-gray-400 text-xs mt-2">Messages from contractors will appear here</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors text-left ${
                    selectedConversation?.id === conv.id ? "bg-gray-50" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{conv.contractor_company || conv.contractor_name}</h3>
                      <p className="text-xs text-gray-500 mt-1">{conv.mission_title}</p>
                    </div>
                    {conv.unread_count > 0 && (
                      <div className="w-5 h-5 bg-[#328d87] rounded-full flex items-center justify-center">
                        <span className="text-xs text-white font-bold">{conv.unread_count}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 truncate">{conv.last_message}</p>
                  <p className="text-xs text-gray-400 mt-1">{formatTimestamp(conv.last_message_at)}</p>
                </button>
              ))
            )}
          </div>
          <div className="p-4 border-t border-gray-200 bg-blue-50">
            <p className="text-xs text-gray-700">
              <strong>Note:</strong> You can message contractors at any time. Contractors can only send an initial
              message with a bid or respond to your messages.
            </p>
          </div>
        </div>

        {selectedConversation && (
          <div className="flex-1 min-w-0 bg-white rounded-xl border border-gray-200 flex flex-col">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 truncate">
                {selectedConversation.contractor_company || selectedConversation.contractor_name}
              </h2>
              <p className="text-sm text-gray-600 truncate">{selectedConversation.mission_title}</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingMessages ? (
                <div className="text-center text-gray-500">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-400 text-sm">No messages in this conversation yet</div>
              ) : (
                messages.map((msg) => {
                  const isCurrentUser = currentUserId === msg.sender_id
                  return (
                    <div key={msg.id} className={`flex ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          isCurrentUser ? "bg-[#328d87] text-white" : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <p className={`text-xs mt-1 ${isCurrentUser ? "text-white/70" : "text-gray-500"}`}>
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
            <div className="p-4 border-t border-gray-200">
              {errorMessage && (
                <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-900">{errorMessage}</p>
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value)
                    if (errorMessage) setErrorMessage(null)
                  }}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent"
                  disabled={sending}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="px-4 py-2 bg-[#328d87] text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
