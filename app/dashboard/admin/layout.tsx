"use client"

import type React from "react"
import { ProtectedRoute } from "@/components/protected-route"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  BarChart3,
  FileText,
  Home,
  LogOut,
  Menu,
  Shield,
  X,
  AlertTriangle,
  Users,
  Briefcase,
  MessageCircle,
  Mail,
  SettingsIcon,
  FileCheck,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useState, useEffect } from "react"
import { apiClient } from "@/lib/api-client"
import { SiteFooter } from "@/components/site-footer"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout, user, isImpersonating, exitImpersonation } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [unreadCounts, setUnreadCounts] = useState({
    feedback: 0,
    messages: 0,
    reports: 0,
    jobs: 0,
    users: 0,
    errorLogs: 0,
    auditLogs: 0,
  })

  useEffect(() => {
    setIsMobileMenuOpen(false)
    updateLastVisit()
  }, [pathname])

  useEffect(() => {
    fetchUnreadCounts()
    const interval = setInterval(fetchUnreadCounts, 30000)
    return () => clearInterval(interval)
  }, [])

  const getLastVisit = (page: string): Date => {
    const stored = localStorage.getItem(`admin_last_visit_${page}`)
    return stored ? new Date(stored) : new Date(0)
  }

  const setLastVisit = (page: string) => {
    localStorage.setItem(`admin_last_visit_${page}`, new Date().toISOString())
  }

  const updateLastVisit = () => {
    if (pathname === "/dashboard/admin/feedback") {
      setLastVisit("feedback")
      setUnreadCounts((prev) => ({ ...prev, feedback: 0 }))
    } else if (pathname === "/dashboard/admin/messages") {
      setLastVisit("messages")
      setUnreadCounts((prev) => ({ ...prev, messages: 0 }))
    } else if (pathname === "/dashboard/admin/reports") {
      setLastVisit("reports")
      setUnreadCounts((prev) => ({ ...prev, reports: 0 }))
    } else if (pathname === "/dashboard/admin/jobs") {
      setLastVisit("jobs")
      setUnreadCounts((prev) => ({ ...prev, jobs: 0 }))
    } else if (pathname === "/dashboard/admin/users") {
      setLastVisit("users")
      setUnreadCounts((prev) => ({ ...prev, users: 0 }))
    } else if (pathname === "/dashboard/admin/logs") {
      setLastVisit("logs")
      setUnreadCounts((prev) => ({ ...prev, errorLogs: 0 }))
    } else if (pathname === "/dashboard/admin/audit") {
      setLastVisit("audit")
      setUnreadCounts((prev) => ({ ...prev, auditLogs: 0 }))
    }
  }

  const fetchUnreadCounts = async () => {
    try {
      const lastFeedbackVisit = getLastVisit("feedback")
      const lastMessagesVisit = getLastVisit("messages")
      const lastReportsVisit = getLastVisit("reports")
      const lastJobsVisit = getLastVisit("jobs")
      const lastUsersVisit = getLastVisit("users")
      const lastLogsVisit = getLastVisit("logs")
      const lastAuditVisit = getLastVisit("audit")

      const feedbackRes = await apiClient.get<{ feedback: Array<{ status: string; created_at: string }> }>(
        "/api/admin/feedback",
      )
      const newFeedback = feedbackRes.feedback.filter(
        (f) => f.status === "pending" && new Date(f.created_at) > lastFeedbackVisit,
      ).length

      const messagesRes = await apiClient.get<{
        conversations: Array<{ unread_count: number; last_message_at: string }>
      }>("/api/admin/conversations")
      const newMessages = messagesRes.conversations.filter(
        (conv) => conv.unread_count > 0 && new Date(conv.last_message_at) > lastMessagesVisit,
      ).length

      const reportsRes = await apiClient.get<{ reports: Array<{ status: string; created_at: string }> }>(
        "/api/reports?status=pending",
      )
      const newReports = reportsRes.reports.filter((r) => new Date(r.created_at) > lastReportsVisit).length

      const jobsCountRes = await apiClient.get<{ count: number }>(
        `/api/admin/jobs/unread-count?since=${lastJobsVisit.getTime()}`,
      )
      const newJobs = jobsCountRes.count

      const usersCountRes = await apiClient.get<{ count: number }>(
        `/api/admin/users/unread-count?since=${lastUsersVisit.getTime()}`,
      )
      const newUsers = usersCountRes.count

      const errorLogsCountRes = await apiClient.get<{ count: number }>(
        `/api/admin/error-logs/unread-count?since=${lastLogsVisit.getTime()}`,
      )
      const newErrorLogs = errorLogsCountRes.count

      const auditLogsCountRes = await apiClient.get<{ count: number }>(
        `/api/admin/audit-logs/unread-count?since=${lastAuditVisit.getTime()}`,
      )
      const newAuditLogs = auditLogsCountRes.count

      setUnreadCounts({
        feedback: newFeedback,
        messages: newMessages,
        reports: newReports,
        jobs: newJobs,
        users: newUsers,
        errorLogs: newErrorLogs,
        auditLogs: newAuditLogs,
      })
    } catch (error) {
      console.error("[v0] Error fetching unread counts:", error)
    }
  }

  const adminNav = [
    { href: "/dashboard/admin", label: "Overview", icon: Home },
    { href: "/dashboard/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/dashboard/admin/users", label: "Users", icon: Users, badge: unreadCounts.users },
    { href: "/dashboard/admin/jobs", label: "Jobs", icon: Briefcase, badge: unreadCounts.jobs },
    { href: "/dashboard/admin/feedback", label: "Feedback", icon: MessageCircle, badge: unreadCounts.feedback },
    { href: "/dashboard/admin/messages", label: "Messages", icon: Mail, badge: unreadCounts.messages },
    { href: "/dashboard/admin/emails", label: "Email Campaigns", icon: Mail },
    { href: "/dashboard/admin/reports", label: "User Reports", icon: FileText, badge: unreadCounts.reports },
    { href: "/dashboard/admin/logs", label: "Error Logs", icon: AlertTriangle, badge: unreadCounts.errorLogs },
    { href: "/dashboard/admin/audit", label: "Audit Logs", icon: FileCheck, badge: unreadCounts.auditLogs },
    { href: "/dashboard/admin/settings", label: "Settings", icon: SettingsIcon },
  ]

  const handleLogout = () => {
    logout()
  }

  const getUserInitials = () => {
    if (user?.full_name) {
      const names = user.full_name.split(" ")
      if (names.length >= 2) {
        return `${names[0].charAt(0)}${names[1].charAt(0)}`.toUpperCase()
      }
      return user.full_name.charAt(0).toUpperCase()
    }
    return "A"
  }

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {isImpersonating && (
          <div className="bg-yellow-500 text-gray-900 px-4 py-3 flex items-center justify-between gap-4 z-50">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 flex-shrink-0" />
              <span className="text-sm font-medium">
                Admin View: You are viewing as <strong>{user?.full_name || user?.email}</strong>
              </span>
            </div>
            <button
              onClick={exitImpersonation}
              className="px-4 py-1.5 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors flex-shrink-0"
            >
              Exit to Admin Panel
            </button>
          </div>
        )}

        <div className="flex flex-1">
          {isMobileMenuOpen && (
            <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsMobileMenuOpen(false)} />
          )}

          <aside
            className={`
            fixed md:static inset-y-0 left-0 z-50
            w-64 bg-[#0D3D42] border-r border-[#d8e2fb]/10 flex flex-col
            transform transition-transform duration-300 ease-in-out
            ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0
            ${isImpersonating ? "top-[52px] md:top-[52px]" : "top-0"}
          `}
          >
            <div className="p-6 border-b border-[#d8e2fb]/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-6 w-6 text-yellow-400" />
                <span className="text-white font-bold text-lg">Admin Panel</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-white/70 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              {adminNav.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-[#328d87] text-white"
                        : "text-[#d8e2fb]/70 hover:bg-[#0D3D42]/50 hover:text-[#d8e2fb]"
                    }`}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span className="font-medium text-sm">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <div className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-yellow-500 px-1.5 text-xs font-bold text-gray-900 tabular-nums">
                        {item.badge > 99 ? "99+" : item.badge}
                      </div>
                    )}
                  </Link>
                )
              })}
            </nav>

            <div className="p-4 border-t border-[#d8e2fb]/10">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-[#d8e2fb]/70 hover:bg-[#0D3D42]/50 hover:text-[#d8e2fb] transition-colors w-full"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </aside>

          <main className="flex-1 overflow-auto w-full flex flex-col">
            <div className="bg-white border-b border-gray-200 px-4 md:px-6 py-4">
              <div className="flex items-center justify-between md:justify-end gap-3">
                <button
                  onClick={() => setIsMobileMenuOpen(true)}
                  className="md:hidden text-gray-700 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                >
                  <Menu className="h-6 w-6" />
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleLogout}
                    className="hidden sm:flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    <span className="text-sm font-medium">Log out</span>
                  </button>
                  <div className="w-10 h-10 rounded-full bg-yellow-500 flex items-center justify-center text-white">
                    <span className="text-sm font-semibold">{getUserInitials()}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 max-w-7xl flex-1">{children}</div>
            <SiteFooter />
          </main>
        </div>
      </div>
    </ProtectedRoute>
  )
}
