"use client"

import { Send, Search, Shield, X, AlertCircle, Trash2 } from "lucide-react"
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface User {
  id: number
  full_name: string
  email: string
  role: string
  company_name?: string
  phone_verified: boolean
}

interface Conversation {
  id: number
  user_id: number
  user_name: string
  user_email: string
  user_role: string
  last_message?: string
  last_message_at?: string
  unread_count: number
}

interface Message {
  id: number
  sender_id: number
  sender_name: string
  sender_role: string
  content: string
  created_at: string
}

export default function AdminMessagesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<User[]>([])
  const [searching, setSearching] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [showMobileChat, setShowMobileChat] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingConversation, setDeletingConversation] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
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

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      if (searchQuery.trim().length >= 2) {
        searchUsers()
      } else {
        setSearchResults([])
      }
    }, 300)

    return () => clearTimeout(delaySearch)
  }, [searchQuery])

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
      setError(null)
      console.log("[v0] Fetching admin conversations...")

      const response = await apiClient.request<{ conversations: Conversation[] } | Conversation[]>(
        "/api/admin/conversations",
        { requiresAuth: true },
      )

      const conversationsData = Array.isArray(response) ? response : response.conversations || []
      console.log("[v0] Received conversations:", conversationsData.length)

      setConversations(conversationsData)
    } catch (error: any) {
      console.error("[v0] Error fetching admin conversations:", error)
      setError(error.message || "Failed to load conversations")
      setConversations([])
    } finally {
      setLoading(false)
    }
  }

  const searchUsers = async () => {
    try {
      setSearching(true)
      console.log("[v0] Searching users with query:", searchQuery)

      const response = await apiClient.request<{ users: User[] } | User[]>(
        `/api/admin/users/search?q=${encodeURIComponent(searchQuery)}`,
        { requiresAuth: true },
      )

      const usersData = Array.isArray(response) ? response : response.users || []
      console.log("[v0] Found users:", usersData.length)

      setSearchResults(usersData)
    } catch (error) {
      console.error("[v0] Error searching users:", error)
      setSearchResults([])
    } finally {
      setSearching(false)
    }
  }

  const startConversationWithUser = async (user: User) => {
    try {
      console.log("[v0] Starting conversation with user:", user.id)

      const response = await apiClient.post<{ conversation: Conversation; message: any } | Conversation>(
        "/api/admin/conversations",
        {
          user_id: user.id,
          initial_message: `Hello ${user.full_name}! I'm reaching out from the Bidrr admin team. How are you today?`,
        },
      )

      const conversationData = "conversation" in response ? response.conversation : response

      setConversations((prev) => [conversationData, ...prev])
      setSelectedConversation(conversationData)
      setSearchQuery("")
      setSearchResults([])
      setShowMobileChat(true)
    } catch (error) {
      console.error("[v0] Error starting conversation:", error)
      toast({
        title: "Failed to start conversation",
        description: "Please try again.",
        variant: "destructive",
      })
    }
  }

  const fetchMessages = async (conversationId: number) => {
    try {
      setLoadingMessages(true)
      console.log("[v0] Fetching messages for conversation:", conversationId)

      const response = await apiClient.request<{ messages: Message[] } | Message[]>(
        `/api/admin/conversations/${conversationId}/messages`,
        { requiresAuth: true },
      )

      const messagesData = Array.isArray(response) ? response : response.messages || []
      console.log("[v0] Received messages:", messagesData.length)

      setMessages(messagesData)

      const conversation = conversations.find((c) => c.id === conversationId)
      console.log("[v0] Found conversation:", conversation)
      console.log("[v0] Unread count:", conversation?.unread_count, "Type:", typeof conversation?.unread_count)

      // Always call mark as read when viewing a conversation
      console.log("[v0] Calling markConversationAsRead for conversation:", conversationId)
      await markConversationAsRead(conversationId)
    } catch (error) {
      console.error("[v0] Error fetching messages:", error)
      setMessages([])
    } finally {
      setLoadingMessages(false)
    }
  }

  const markConversationAsRead = async (conversationId: number) => {
    try {
      await apiClient.put(`/api/admin/conversations/${conversationId}/mark-read`)
      setConversations((prev) => prev.map((conv) => (conv.id === conversationId ? { ...conv, unread_count: 0 } : conv)))
    } catch (error) {
      console.error("[v0] Error marking conversation as read:", error)
    }
  }

  const handleSendMessage = async () => {
    if (!selectedConversation || !newMessage.trim() || sending) return

    try {
      setSending(true)
      console.log("[v0] Sending message to conversation:", selectedConversation.id)

      await apiClient.post(`/api/admin/conversations/${selectedConversation.id}/messages`, {
        content: newMessage,
      })

      setNewMessage("")
      await fetchMessages(selectedConversation.id)
      await fetchConversations()
    } catch (error) {
      console.error("[v0] Error sending message:", error)
      toast({
        title: "Failed to send message",
        description: "Please try again.",
        variant: "destructive",
      })
    } finally {
      setSending(false)
    }
  }

  const handleDeleteConversation = async () => {
    if (!selectedConversation || deletingConversation) return

    try {
      console.log("[v0] Starting delete for conversation:", selectedConversation.id)
      setDeletingConversation(true)

      console.log("[v0] Making DELETE request to:", `/api/conversations/${selectedConversation.id}`)
      await apiClient.request(`/api/conversations/${selectedConversation.id}`, {
        method: "DELETE",
        requiresAuth: true,
      })
      console.log("[v0] DELETE request successful")

      // Remove conversation from local state
      setConversations((prev) => prev.filter((conv) => conv.id !== selectedConversation.id))
      setSelectedConversation(null)
      setShowMobileChat(false)
      setShowDeleteDialog(false)

      console.log("[v0] Conversation deleted successfully from local state")
      toast({
        title: "Conversation deleted",
        description: "The conversation has been removed from your view.",
      })
    } catch (error) {
      console.error("[v0] Error deleting conversation:", error)
      toast({
        title: "Failed to delete conversation",
        description: "Please try again or contact support if the issue persists.",
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
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Admin Messages</h1>
        <p className="text-gray-600 mt-2">Message any user on the platform</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="font-semibold text-red-900">Unable to load conversations</h3>
            <p className="text-sm text-red-700 mt-1">{error}</p>
            <p className="text-xs text-red-600 mt-2">
              Please check that the backend endpoints are properly configured. See console for details.
            </p>
            <button
              onClick={fetchConversations}
              className="mt-3 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Mobile Chat Modal */}
      {showMobileChat && selectedConversation && (
        <div className="fixed inset-0 bg-white z-50 flex flex-col md:hidden">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-gray-900 truncate">{selectedConversation.user_name}</h2>
              <p className="text-sm text-gray-600 truncate">{selectedConversation.user_email}</p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="p-2 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                title="Delete conversation"
              >
                <Trash2 className="h-5 w-5 text-red-600" />
              </button>
              <button
                onClick={() => setShowMobileChat(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
              >
                <X className="h-6 w-6 text-gray-600" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {loadingMessages ? (
              <div className="text-center text-gray-500">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-400 text-sm">No messages yet. Start the conversation!</div>
            ) : (
              messages.map((msg) => {
                const isAdmin = msg.sender_role === "admin"
                return (
                  <div key={msg.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] rounded-lg p-3 ${
                        isAdmin ? "bg-yellow-500 text-gray-900" : "bg-white text-gray-900 border border-gray-200"
                      }`}
                    >
                      {isAdmin && (
                        <div className="flex items-center gap-1 mb-1">
                          <Shield className="h-3 w-3" />
                          <span className="text-xs font-semibold">Bidrr Admin</span>
                        </div>
                      )}
                      <p className="whitespace-pre-wrap break-words text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${isAdmin ? "text-gray-700" : "text-gray-500"}`}>
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

          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm"
                disabled={sending}
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sending}
                className="px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop and Mobile List View */}
      <div className="flex gap-6 h-[calc(100vh-12rem)]">
        {/* Conversations List */}
        <div className="w-full md:w-80 bg-white rounded-xl border border-gray-200 flex flex-col flex-shrink-0">
          <div className="p-4 border-b border-gray-200 space-y-3">
            <h2 className="text-xl font-bold text-gray-900">Conversations</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users by name or email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent text-sm"
              />
            </div>

            {searchResults.length > 0 && (
              <div className="absolute z-10 w-full md:w-80 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                {searchResults.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => startConversationWithUser(user)}
                    className="w-full p-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-100 last:border-0"
                  >
                    <div className="font-semibold text-gray-900">{user.full_name}</div>
                    <div className="text-sm text-gray-600">{user.email}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {user.role} {user.company_name && `• ${user.company_name}`}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-4 text-center text-gray-500">Loading conversations...</div>
            ) : conversations.length === 0 ? (
              <div className="p-4 text-center">
                <p className="text-gray-500 text-sm">No conversations yet</p>
                <p className="text-gray-400 text-xs mt-2">Search for a user to start messaging</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => {
                    setSelectedConversation(conv)
                    setShowMobileChat(true)
                  }}
                  className={`w-full p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors text-left ${
                    selectedConversation?.id === conv.id ? "bg-gray-50" : ""
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{conv.user_name}</h3>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        {conv.user_email} • {conv.user_role}
                      </p>
                    </div>
                    {conv.unread_count > 0 && (
                      <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                        <span className="text-xs text-gray-900 font-bold">{conv.unread_count}</span>
                      </div>
                    )}
                  </div>
                  {conv.last_message && (
                    <>
                      <p className="text-sm text-gray-600 truncate">{conv.last_message}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatTimestamp(conv.last_message_at!)}</p>
                    </>
                  )}
                </button>
              ))
            )}
          </div>

          <div className="p-4 border-t border-gray-200 bg-yellow-50">
            <p className="text-xs text-gray-700">
              <strong>Admin Privilege:</strong> You can message any user without limits. Your messages will display a
              Bidrr admin badge.
            </p>
          </div>
        </div>

        {/* Message Thread - Desktop Only */}
        {selectedConversation && (
          <div className="hidden md:flex flex-1 min-w-0 bg-white rounded-xl border border-gray-200 flex-col">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <h2 className="text-xl font-bold text-gray-900">{selectedConversation.user_name}</h2>
                <p className="text-sm text-gray-600">
                  {selectedConversation.user_email} • {selectedConversation.user_role}
                </p>
              </div>
              <button
                onClick={() => setShowDeleteDialog(true)}
                className="ml-4 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Delete Conversation
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingMessages ? (
                <div className="text-center text-gray-500">Loading messages...</div>
              ) : messages.length === 0 ? (
                <div className="text-center text-gray-400 text-sm">No messages yet. Start the conversation!</div>
              ) : (
                messages.map((msg) => {
                  const isAdmin = msg.sender_role === "admin"
                  return (
                    <div key={msg.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          isAdmin ? "bg-yellow-500 text-gray-900" : "bg-gray-100 text-gray-900"
                        }`}
                      >
                        {isAdmin && (
                          <div className="flex items-center gap-1 mb-1">
                            <Shield className="h-3 w-3" />
                            <span className="text-xs font-semibold">Bidrr Admin</span>
                          </div>
                        )}
                        <p className="whitespace-pre-wrap">{msg.content}</p>
                        <p className={`text-xs mt-1 ${isAdmin ? "text-gray-700" : "text-gray-500"}`}>
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
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage()
                    }
                  }}
                  placeholder="Type a message..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                  disabled={sending}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() || sending}
                  className="px-4 py-2 bg-yellow-500 text-gray-900 rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteDialog && selectedConversation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Conversation?</h3>
            <p className="text-sm text-gray-600 mb-6">
              This will remove the conversation from your view only. The other user will still be able to see it. This
              action cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteDialog(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConversation}
                disabled={deletingConversation}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
              >
                {deletingConversation ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
