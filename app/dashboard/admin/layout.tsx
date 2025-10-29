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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { logout, user } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    setIsMobileMenuOpen(false)
  }, [pathname])

  const adminNav = [
    { href: "/dashboard/admin", label: "Overview", icon: Home },
    { href: "/dashboard/admin/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/dashboard/admin/users", label: "Users", icon: Users },
    { href: "/dashboard/admin/jobs", label: "Jobs", icon: Briefcase },
    { href: "/dashboard/admin/feedback", label: "Feedback", icon: MessageCircle },
    { href: "/dashboard/admin/emails", label: "Email Campaigns", icon: Mail },
    { href: "/dashboard/admin/reports", label: "User Reports", icon: FileText },
    { href: "/dashboard/admin/logs", label: "Error Logs", icon: AlertTriangle },
    { href: "/dashboard/admin/audit", label: "Audit Logs", icon: FileCheck },
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
      <div className="min-h-screen bg-gray-50 flex">
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

        <main className="flex-1 overflow-auto w-full">
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
          <div className="container mx-auto px-4 md:px-6 py-6 md:py-8 max-w-7xl">{children}</div>
        </main>
      </div>
    </ProtectedRoute>
  )
}
