"use client"

import type React from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"
import {
  Home,
  BarChart3,
  DollarSign,
  Users,
  Briefcase,
  MessageSquare,
  Mail,
  FileText,
  AlertTriangle,
  ScrollText,
  Settings,
  LogOut,
  Loader2,
  Shield,
} from "lucide-react"

const adminNavItems = [
  { href: "/dashboard/admin", label: "Overview", icon: Home },
  { href: "/dashboard/admin/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/admin/billing", label: "Billing", icon: DollarSign },
  { href: "/dashboard/admin/users", label: "Users", icon: Users },
  { href: "/dashboard/admin/jobs", label: "Jobs", icon: Briefcase },
  { href: "/dashboard/admin/feedback", label: "Feedback", icon: MessageSquare },
  { href: "/dashboard/admin/messages", label: "Messages", icon: Mail },
  { href: "/dashboard/admin/emails", label: "Email Campaigns", icon: Mail },
  { href: "/dashboard/admin/reports", label: "User Reports", icon: FileText },
  { href: "/dashboard/admin/logs", label: "Error Logs", icon: AlertTriangle },
  { href: "/dashboard/admin/audit", label: "Audit Logs", icon: ScrollText },
  { href: "/dashboard/admin/settings", label: "Settings", icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, loading, logout } = useAuth()
  const [badges, setBadges] = useState<Record<string, number>>({
    users: 3,
    jobs: 1,
    logs: 72,
    audit: 0,
  })

  useEffect(() => {
    if (!loading && (!user || !user.is_admin)) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#0F3D3E]" />
      </div>
    )
  }

  if (!user || !user.is_admin) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0F3D3E] text-white flex flex-col">
        <div className="p-6 border-b border-[#1a5557]">
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-5 h-5 text-yellow-400" />
            <h1 className="text-xl font-bold">Admin Panel</h1>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {adminNavItems.map((item) => {
            const Icon = item.icon
            const isActive =
              pathname === item.href || (item.href !== "/dashboard/admin" && pathname.startsWith(item.href))
            const badge = badges[item.href.split("/").pop() || ""]

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors relative ${
                  isActive ? "bg-[#1a5557] text-white" : "text-gray-300 hover:bg-[#1a5557] hover:text-white"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.label}</span>
                {badge > 0 && (
                  <span className="ml-auto bg-yellow-500 text-gray-900 text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                    {badge > 99 ? "99" : badge}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="p-4 border-t border-[#1a5557]">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-red-600 hover:text-white w-full transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-8 py-4 flex justify-end">
          <div className="w-10 h-10 rounded-full bg-yellow-400 text-gray-900 flex items-center justify-center font-bold text-sm">
            GA
          </div>
        </div>

        {/* Page Content */}
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
