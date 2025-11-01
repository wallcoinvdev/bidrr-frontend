"use client"

import type React from "react"

import { useState } from "react"
import { X, AlertTriangle, Loader2 } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { useToast } from "@/hooks/use-toast"

interface ReportUserModalProps {
  isOpen: boolean
  onClose: () => void
  reportedUserId: number
  reportedUserName: string
  reportedUserRole: "homeowner" | "contractor"
  conversationId?: number
  onReportSuccess?: (userName: string, category: string) => void
}

export function ReportUserModal({
  isOpen,
  onClose,
  reportedUserId,
  reportedUserName,
  reportedUserRole,
  conversationId,
  onReportSuccess,
}: ReportUserModalProps) {
  const [reason, setReason] = useState("")
  const [category, setCategory] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  const formatCategory = (cat: string) => {
    const categoryMap: Record<string, string> = {
      spam: "Spam or unwanted messages",
      harassment: "Harassment or abusive behavior",
      scam: "Scam or fraudulent activity",
      inappropriate: "Inappropriate content",
      other: "Other violations",
    }
    return categoryMap[cat] || cat
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!category || !reason.trim()) {
      toast({
        title: "Missing information",
        description: "Please select a category and provide details",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      console.log("[v0] Submitting user report:", {
        reportedUserId,
        category,
        reason,
      })

      await apiClient.request("/api/reports", {
        method: "POST",
        body: JSON.stringify({
          reported_user_id: reportedUserId,
          reported_user_role: reportedUserRole,
          category,
          reason,
          conversation_id: conversationId,
        }),
        requiresAuth: true,
      })

      console.log("[v0] Report submitted successfully")

      console.log("[v0] onReportSuccess exists:", !!onReportSuccess)
      if (onReportSuccess) {
        console.log("[v0] Calling onReportSuccess callback")
        onReportSuccess(reportedUserName, formatCategory(category))
      }

      // Clear form and close modal after callback
      setReason("")
      setCategory("")
      onClose()
    } catch (error) {
      console.error("[v0] Error submitting report:", error)
      toast({
        title: "Failed to submit report",
        description: "Please try again later",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-red-600" />
            <h3 className="text-lg font-bold text-gray-900">Report User</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <p className="text-sm text-gray-600 mb-4">
          You are reporting <span className="font-semibold">{reportedUserName}</span>. Please provide details about the
          issue.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              required
            >
              <option value="">Select a category</option>
              <option value="spam">Spam or unwanted messages</option>
              <option value="harassment">Harassment or abusive behavior</option>
              <option value="scam">Scam or fraudulent activity</option>
              <option value="inappropriate">Inappropriate content</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Details</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Please describe the issue in detail..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
              rows={4}
              required
            />
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Report"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
