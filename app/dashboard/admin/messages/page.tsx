"use client"

import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { Loader2, Send, Search, AlertCircle } from "lucide-react"

interface Conversation {
  id: number
  user_name: string
  user_email: string
  user_role: string
  last_message: string
  last_message_at: string
  unread_count: number
}

interface Message {
  id: number
  sender_name: string
  content: string
  created_at: string
  is_from_admin: boolean
}

export default function AdminMessagesPage() {
  const [loading, setLoading] = useState(true)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messageContent, setMessageContent] = useState("")
  const [sendingMessage, setSendingMessage] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    fetchConversations()
  }, [])

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation)
    }
  }, [selectedConversation])

  const fetchConversations = async () => {
    try {
      setLoading(true)
      const data = await apiClient.request<{ conversations: Conversation[] }>("/api/admin/conversations", {
        requiresAuth: true,
      })
      setConversations(data.conversations)
    } catch (error: any) {
      console.error("Error fetching conversations:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchMessages = async (conversationId: number) => {
    try {
      const data = await apiClient.request<{ messages: Message[] }>(
        `/api/admin/conversations/${conversationId}/messages`,
        { requiresAuth: true },
      )
      setMessages(data.messages)
    } catch (error: any) {
      console.error("Error fetching messages:", error)
    }
  }

  const handleSendMessage = async () => {
    if (!messageContent.trim() || !selectedConversation) return

    try {
      setSendingMessage(true)
      await apiClient.request(`/api/admin/conversations/${selectedConversation}/messages`, {
        method: "POST",
        body: JSON.stringify({ content: messageContent }),
        requiresAuth: true,
      })
      setMessageContent("")
      await fetchMessages(selectedConversation)
    } catch (error: any) {
      alert("Failed to send message: " + error.message)
    } finally {
      setSendingMessage(false)
    }
  }

  const filteredConversations = conversations.filter(
    (conv) =>
      conv.user_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.user_email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#03353a]" />
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Messages</h1>
        <p className="text-gray-600 mt-2">Communicate with platform users</p>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 flex" style={{ height: "calc(100vh - 250px)" }}>
        <div className="w-80 border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">Conversations</h2>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users by name or email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0F3D3E] focus:border-transparent"
              />
            </div>
          </div>

          {filteredConversations.length > 0 ? (
            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv.id)}
                  className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                    selectedConversation === conv.id ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{conv.user_name}</p>
                      <p className="text-sm text-gray-600">{conv.user_email}</p>
                      <p className="text-sm text-gray-500 truncate mt-1">{conv.last_message}</p>
                    </div>
                    {conv.unread_count > 0 && (
                      <span className="bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <p className="text-gray-900 font-medium mb-1">No conversations yet</p>
                <p className="text-sm text-gray-500">Search for a user to start messaging</p>
              </div>
            </div>
          )}

          <div className="p-4 bg-yellow-50 border-t border-yellow-200">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs text-yellow-800">
                <span className="font-semibold">Admin Privilege:</span> You can message any user without limits. Your
                messages will display a Bidrr admin badge.
              </div>
            </div>
          </div>
        </div>

        {/* Right panel: Message area */}
        <div className="flex-1 flex flex-col">
          {selectedConversation ? (
            <>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex ${msg.is_from_admin ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        msg.is_from_admin ? "bg-[#03353a] text-white" : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <p className="text-sm font-medium mb-1">{msg.sender_name}</p>
                      <p>{msg.content}</p>
                      <p className="text-xs opacity-70 mt-1">{new Date(msg.created_at).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gray-200 p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={messageContent}
                    onChange={(e) => setMessageContent(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#03353a] focus:border-transparent"
                  />
                  <button
                    onClick={handleSendMessage}
                    disabled={sendingMessage || !messageContent.trim()}
                    className="px-4 py-2 bg-[#03353a] text-white rounded-lg hover:bg-[#024449] disabled:opacity-50 flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    Send
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a conversation to view messages
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
