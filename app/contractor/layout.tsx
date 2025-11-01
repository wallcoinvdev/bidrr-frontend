"use client"

import type React from "react"
import { ProtectedRoute } from "@/components/protected-route"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { WrenchIcon } from "@/components/icons"
import { Home, Search, Briefcase, User, LogOut, Menu, X } from "lucide-react"
import { useState } from "react"
import { SiteFooter } from "@/components/site-footer"

export default function ContractorLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const navigation = [
    { name: "Dashboard", href: "/contractor/dashboard", icon: Home },
    { name: "Browse Missions", href: "/contractor/browse", icon: Search },
    { name: "My Bids", href: "/contractor/bids", icon: Briefcase },
    { name: "Profile", href: "/contractor/profile", icon: User },
  ]

  return (
    <ProtectedRoute allowedRoles={["contractor"]}>
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="border-b border-border bg-card sticky top-0 z-50">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-8">
                <Link href="/contractor/dashboard" className="flex items-center gap-2">
                  <WrenchIcon className="h-7 w-7" style={{ color: "#142c57" }} />
                  <span className="text-xl font-bold" style={{ color: "#142c57" }}>
                    Bidrr
                  </span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center gap-1">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                        style={isActive ? { color: "#142c57" } : {}}
                      >
                        <item.icon className="h-4 w-4" />
                        {item.name}
                      </Link>
                    )
                  })}
                </nav>
              </div>

              <div className="flex items-center gap-4">
                <div className="hidden md:flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{user?.full_name}</p>
                    <p className="text-xs text-muted-foreground">Contractor</p>
                  </div>
                  <button
                    onClick={logout}
                    className="p-2 text-muted-foreground hover:text-foreground transition-colors"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>

                {/* Mobile Menu Button */}
                <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 text-foreground">
                  {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
              </div>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
              <div className="md:hidden border-t border-border py-4">
                <nav className="flex flex-col gap-2">
                  {navigation.map((item) => {
                    const isActive = pathname === item.href
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-colors ${
                          isActive
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        }`}
                        style={isActive ? { color: "#142c57" } : {}}
                      >
                        <item.icon className="h-5 w-5" />
                        {item.name}
                      </Link>
                    )
                  })}
                  <button
                    onClick={logout}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors text-left"
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </button>
                </nav>
              </div>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8 flex-1">{children}</main>

        <SiteFooter />
      </div>
    </ProtectedRoute>
  )
}
