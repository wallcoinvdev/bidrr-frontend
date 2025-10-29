"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { Filter, Send, AlertCircle, X } from "lucide-react"
import { useState, useEffect } from "react"
import { apiClient, ApiError } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"
import { containsContactInfo } from "@/lib/contact-validation"
import { ReportUserModal } from "@/components/report-user-modal"

interface Conversation {
  id: number
  homeowner_id: number
  homeowner_name: string
  mission_id: number
  mission_title: string
  last_message?: string
  last_message_at?: string
  unread_count: number
  can_send: boolean // Added backend can_send flag
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
  const [filters, setFilters] = useState({
    status: "all",
    dateRange: "all",
  })
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [sending, setSending] = useState(false)
  const [canSendMessage, setCanSendMessage] = useState(true)
  const [errorMessage, setErrorMessage] = useState<string | null>(null) // Added error state for inline error display
  const [showReportModal, setShowReportModal] = useState(false) // Added state for report user modal
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
      console.log("[v0] Fetching contractor conversations...")
      setLoading(true)

      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Request timeout")), 10000))

      const fetchPromise = apiClient.request<Conversation[]>("/api/conversations", { requiresAuth: true })

      const data = (await Promise.race([fetchPromise, timeoutPromise])) as Conversation[]

      console.log("[v0] Contractor conversations fetched:", data)
      console.log("[v0] Number of conversations:", data.length)
      setConversations(data)
    } catch (error) {
      console.error("[v0] Error fetching contractor conversations:", error)
      if (error instanceof Error && error.message === "Request timeout") {
        console.error("[v0] API request timed out after 10 seconds")
      }
      setConversations([])
    } finally {
      console.log("[v0] Setting loading to false")
      setLoading(false)
    }
  }

  const fetchMessages = async (conversationId: number) => {
    try {
      console.log("[v0] Fetching messages for conversation:", conversationId)
      setLoadingMessages(true)

      const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Request timeout")), 10000))

      const fetchPromise = apiClient.request<MessagesResponse>(`/api/conversations/${conversationId}/messages`, {
        requiresAuth: true,
      })

      const data = (await Promise.race([fetchPromise, timeoutPromise])) as MessagesResponse

      console.log("[v0] Contractor messages fetched:", data)

      setMessages(data.messages)
      setCanSendMessage(data.can_send)

      console.log("[v0] Backend can_send flag:", data.can_send)

      const conversation = conversations.find((c) => c.id === conversationId)
      if (conversation && Number(conversation.unread_count) > 0) {
        console.log("[v0] Marking conversation as read, unread_count:", conversation.unread_count)
        await markConversationAsRead(conversationId)
      } else {
        console.log("[v0] Conversation already read, skipping mark as read")
      }
    } catch (error) {
      console.error("[v0] Error fetching contractor messages:", error)
      if (error instanceof Error && error.message === "Request timeout") {
        console.error("[v0] API request timed out after 10 seconds")
      }
      setMessages([])
      setCanSendMessage(false)
    } finally {
      console.log("[v0] Setting loadingMessages to false")
      setLoadingMessages(false)
    }
  }

  const markConversationAsRead = async (conversationId: number) => {
    try {
      console.log("[v0] Marking contractor conversation as read:", conversationId)

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

      console.log("[v0] Contractor conversation marked as read successfully:", conversationId)
    } catch (error) {
      console.error("[v0] Error marking contractor conversation as read:", error)
    }
  }

  const handleSendMessage = async () => {
    if (!selectedConversation || !messageText.trim() || sending) return

    setErrorMessage(null) // Clear any previous error messages

    if (!canSendMessage) {
      const message =
        "You have already responded to the customer's last message. Please wait for them to reply before sending another message."
      setErrorMessage(message)
      toast({
        title: "Cannot send message",
        description: message,
        variant: "destructive",
      })
      return
    }

    const contactCheck = containsContactInfo(messageText)
    if (contactCheck.hasContact) {
      const message = `Please do not include ${contactCheck.type === "email" ? "email addresses" : "phone numbers"} in your messages. Contact information is only shared after bid acceptance.`
      setErrorMessage(message)
      toast({
        title: "Cannot send message",
        description: message,
        variant: "destructive",
      })
      return
    }

    try {
      setSending(true)
      console.log("[v0] Sending contractor message:", messageText)
      await apiClient.request(`/api/conversations/${selectedConversation.id}/messages`, {
        method: "POST",
        body: JSON.stringify({ content: messageText }),
        requiresAuth: true,
      })
      setMessageText("")
      await fetchMessages(selectedConversation.id)
      await fetchConversations()
    } catch (error) {
      if (error instanceof ApiError) {
        if (error.statusCode === 403) {
          const message = error.errorData?.message || "You cannot send more messages at this time."
          setErrorMessage(message)
          toast({
            title: "Message limit reached",
            description: message,
            variant: "destructive",
          })
          await fetchMessages(selectedConversation.id)
          return
        } else if (error.errorData) {
          const errorData =
            typeof error.errorData === "object" ? error.errorData : { error: "Error", message: error.errorData }
          const message = errorData.message || "Please try again."
          setErrorMessage(message)
          toast({
            title: errorData.error || "Failed to send message",
            description: message,
            variant: "destructive",
          })
          return
        } else {
          const message = error.message || "Please try again."
          setErrorMessage(message)
          toast({
            title: "Failed to send message",
            description: message,
            variant: "destructive",
          })
          return
        }
      } else if (error instanceof Error) {
        const message = error.message || "Please try again."
        setErrorMessage(message)
        toast({
          title: "Failed to send message",
          description: message,
          variant: "destructive",
        })
        return
      } else {
        const message = "Please try again."
        setErrorMessage(message)
        toast({
          title: "Failed to send message",
          description: message,
          variant: "destructive",
        })
        return
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
    <DashboardLayout userRole="contractor">
      {/* Mobile modal view matching homeowner messages layout */}
      {selectedConversation && (
        <div className="md:hidden fixed inset-0 bg-white z-50 flex flex-col">
          <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-white">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-gray-900 truncate">{selectedConversation.homeowner_name}</h2>
              <p className="text-sm text-gray-600 truncate">{selectedConversation.mission_title}</p>
            </div>
            <button
              onClick={() => setSelectedConversation(null)}
              className="ml-4 p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
            >
              <X className="h-6 w-6 text-gray-600" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {loadingMessages ? (
              <div className="text-center text-gray-500">Loading messages...</div>
            ) : messages.length === 0 ? (
              <div className="text-center text-gray-400 text-sm">No messages in this conversation yet</div>
            ) : (
              messages.map((msg) => {
                const isContractor = msg.sender_id !== selectedConversation.homeowner_id
                return (
                  <div key={msg.id} className={`flex ${isContractor ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[75%] rounded-lg p-3 ${
                        isContractor ? "bg-[#328d87] text-white" : "bg-white text-gray-900 border border-gray-200"
                      }`}
                    >
                      <p className="whitespace-pre-wrap break-words text-sm">{msg.content}</p>
                      <p className={`text-xs mt-1 ${isContractor ? "text-white/70" : "text-gray-500"}`}>
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
            {errorMessage && (
              <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-900">{errorMessage}</p>
              </div>
            )}
            {!canSendMessage && (
              <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-900">
                  You have already responded to the customer's last message. Please wait for them to reply before
                  sending another message.
                </p>
              </div>
            )}
            <div className="flex gap-2">
              <input
                type="text"
                value={messageText}
                onChange={(e) => {
                  setMessageText(e.target.value)
                  if (errorMessage) setErrorMessage(null)
                }}
                onKeyPress={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                placeholder={canSendMessage ? "Type your message..." : "Wait for customer to reply before responding"}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                disabled={sending || !canSendMessage}
              />
              <button
                onClick={handleSendMessage}
                disabled={!messageText.trim() || sending || !canSendMessage}
                className="px-4 py-2 bg-[#328d87] text-white rounded-lg hover:opacity-90 transition-opacity flex-shrink-0"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="p-4 border-t border-gray-200 bg-blue-50">
            <p className="text-xs text-gray-700">
              <strong>Note:</strong> You can send an initial message with a bid. After that, you can only respond once
              to customer messages to prevent spam.
            </p>
          </div>
        </div>
      )}

      {/* Mobile conversation list */}
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
                <p className="text-gray-400 text-xs mt-2">Messages from customers will appear here</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className="w-full p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{conv.homeowner_name}</h3>
                      <p className="text-xs text-gray-500 mt-1 truncate">{conv.mission_title}</p>
                    </div>
                    {conv.unread_count > 0 && (
                      <div className="w-5 h-5 bg-[#328d87] rounded-full flex items-center justify-center flex-shrink-0 ml-2">
                        <span className="text-xs text-white font-bold">{conv.unread_count}</span>
                      </div>
                    )}
                  </div>
                  {conv.last_message && (
                    <>
                      <p className="text-sm text-gray-600 truncate">{conv.last_message}</p>
                      <p className="text-xs text-gray-400 mt-1">
                        {conv.last_message_at ? formatTimestamp(conv.last_message_at) : ""}
                      </p>
                    </>
                  )}
                  {!conv.last_message && <p className="text-sm text-gray-400 italic">Click to view messages</p>}
                </button>
              ))
            )}
          </div>
          <div className="p-4 border-t border-gray-200 bg-blue-50">
            <p className="text-xs text-gray-700">
              <strong>Note:</strong> You can send an initial message with a bid. After that, you can only respond once
              to customer messages to prevent spam.
            </p>
          </div>
        </div>
      </div>

      {/* Desktop view */}
      <div className="hidden md:block space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600 mt-2">Communicate with your customers</p>
        </div>

        <div
          className="bg-white rounded-xl border border-gray-200 overflow-hidden"
          style={{ height: "calc(100vh - 250px)" }}
        >
          <div className="flex h-full">
            {/* Conversations List */}
            <div className="w-80 border-r border-gray-200 flex flex-col">
              <div className="p-4 border-b border-gray-200">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="w-full flex items-center justify-between px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Filters</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {filters.status !== "all" || filters.dateRange !== "all" ? "Active" : "None"}
                  </span>
                </button>

                {showFilters && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-3">
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Status</label>
                      <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#328d87]"
                      >
                        <option value="all">All Messages</option>
                        <option value="read">Read</option>
                        <option value="unread">Unread</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-gray-700 mb-1 block">Date Range</label>
                      <select
                        value={filters.dateRange}
                        onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
                        className="w-full px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#328d87]"
                      >
                        <option value="all">All Time</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                        <option value="month">This Month</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex-1 overflow-y-auto">
                {loading ? (
                  <div className="p-8 text-center">
                    <div className="text-gray-500 mb-2">Loading conversations...</div>
                    <div className="text-xs text-gray-400">If this takes too long, please refresh the page</div>
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-8 text-center">
                    <p className="text-gray-500 text-sm">No messages yet</p>
                    <p className="text-gray-400 text-xs mt-2">Messages from customers will appear here</p>
                  </div>
                ) : (
                  conversations.map((conv) => (
                    <button
                      key={conv.id}
                      onClick={() => setSelectedConversation(conv)}
                      className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left ${
                        selectedConversation?.id === conv.id ? "bg-gray-50" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between mb-1">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{conv.homeowner_name}</h3>
                          <p className="text-xs text-gray-500 mt-1">{conv.mission_title}</p>
                        </div>
                        {conv.unread_count > 0 && (
                          <div className="w-5 h-5 bg-[#328d87] rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-bold">{conv.unread_count}</span>
                          </div>
                        )}
                      </div>
                      {conv.last_message && (
                        <>
                          <p className="text-sm text-gray-600 truncate">{conv.last_message}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {conv.last_message_at ? formatTimestamp(conv.last_message_at) : ""}
                          </p>
                        </>
                      )}
                      {!conv.last_message && <p className="text-sm text-gray-400 italic">Click to view messages</p>}
                    </button>
                  ))
                )}
              </div>

              <div className="p-4 bg-blue-50 border-t border-blue-100">
                <p className="text-xs text-blue-900 leading-relaxed">
                  <strong>Note:</strong> You can send an initial message with a bid. After that, you can only respond
                  once to customer messages to prevent spam.
                </p>
              </div>
            </div>

            {/* Message Thread */}
            <div className="flex-1 flex flex-col">
              {selectedConversation === null ? (
                <div className="flex-1 flex items-center justify-center text-gray-400">
                  <div className="text-center">
                    <p className="text-lg font-medium">Select a conversation</p>
                    <p className="text-sm mt-2">Choose a message from the left to start chatting</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h2 className="text-xl font-bold text-gray-900">{selectedConversation.homeowner_name}</h2>
                      <p className="text-sm text-gray-600">{selectedConversation.mission_title}</p>
                    </div>
                    <button
                      onClick={() => setShowReportModal(true)}
                      className="ml-4 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                    >
                      Report User
                    </button>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {loadingMessages ? (
                      <div className="text-center text-gray-500">Loading messages...</div>
                    ) : messages.length === 0 ? (
                      <div className="text-center text-gray-400 text-sm">No messages in this conversation yet</div>
                    ) : (
                      messages.map((msg) => {
                        const isContractor = msg.sender_id !== selectedConversation.homeowner_id
                        return (
                          <div key={msg.id} className={`flex ${isContractor ? "justify-end" : "justify-start"}`}>
                            <div
                              className={`max-w-[70%] rounded-lg p-3 ${
                                isContractor ? "bg-[#328d87] text-white" : "bg-gray-100 text-gray-900"
                              }`}
                            >
                              <p className="whitespace-pre-wrap">{msg.content}</p>
                              <p className={`text-xs mt-1 ${isContractor ? "text-white/70" : "text-gray-500"}`}>
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

                  {/* Message Input */}
                  <div className="p-4 border-t border-gray-200">
                    {errorMessage && (
                      <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-red-900">{errorMessage}</p>
                      </div>
                    )}
                    {!canSendMessage && (
                      <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                        <p className="text-sm text-amber-900">
                          You have already responded to the customer's last message. Please wait for them to reply
                          before sending another message.
                        </p>
                      </div>
                    )}
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={messageText}
                        onChange={(e) => {
                          setMessageText(e.target.value)
                          if (errorMessage) setErrorMessage(null)
                        }}
                        onKeyPress={(e) => {
                          if (e.key === "Enter" && !e.shiftKey) {
                            e.preventDefault()
                            handleSendMessage()
                          }
                        }}
                        placeholder={
                          canSendMessage ? "Type your message..." : "Wait for customer to reply before responding"
                        }
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#328d87] disabled:bg-gray-100 disabled:cursor-not-allowed"
                        disabled={sending || !canSendMessage}
                      />
                      <button
                        onClick={() => {
                          handleSendMessage().catch((err) => {
                            console.error("[v0] Unhandled error in handleSendMessage:", err)
                          })
                        }}
                        disabled={!messageText.trim() || sending || !canSendMessage}
                        className="px-6 py-2 bg-[#328d87] text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                      >
                        <Send className="h-4 w-4" />
                        Send
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Report User Modal */}
      {selectedConversation && (
        <ReportUserModal
          isOpen={showReportModal}
          onClose={() => setShowReportModal(false)}
          reportedUserId={selectedConversation.homeowner_id}
          reportedUserName={selectedConversation.homeowner_name}
          reportedUserRole="homeowner"
          conversationId={selectedConversation.id}
        />
      )}
    </DashboardLayout>
  )
}
