"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: ("homeowner" | "contractor" | "admin")[]
}

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login")
      } else if (allowedRoles) {
        const hasAccess = allowedRoles.some((role) => {
          if (role === "admin") {
            return user.is_admin === true
          }
          return user.role === role
        })

        if (!hasAccess) {
          router.push("/")
        }
      }
    }
  }, [user, loading, allowedRoles])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  if (allowedRoles) {
    const hasAccess = allowedRoles.some((role) => {
      if (role === "admin") {
        return user.is_admin === true
      }
      return user.role === role
    })

    if (!hasAccess) {
      return null
    }
  }

  return <>{children}</>
}
