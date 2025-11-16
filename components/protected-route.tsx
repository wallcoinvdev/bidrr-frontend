"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from 'next/navigation'
import { useAuth } from "@/lib/auth-context"
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: string[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    } else if (!loading && user && allowedRoles && !allowedRoles.includes(user.role)) {
      // Redirect to appropriate dashboard based on role
      if (user.role === "contractor") {
        router.push("/dashboard/contractor")
      } else if (user.role === "homeowner") {
        router.push("/dashboard/homeowner")
      } else {
        router.push("/")
      }
    }
  }, [user, loading, router, allowedRoles])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4" style={{ color: "#142c57" }} />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user || (allowedRoles && !allowedRoles.includes(user.role))) {
    return null
  }

  return <>{children}</>
}
