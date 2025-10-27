"use client"

import { useEffect, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function LoginLoadingScreen() {
  const router = useRouter()
  const [isAnimating, setIsAnimating] = useState(false)
  const hasRedirected = useRef(false) // Prevent multiple redirects

  useEffect(() => {
    let isMounted = true

    // Start animation
    const animationTimer = setTimeout(() => {
      if (isMounted) setIsAnimating(true)
    }, 100)

    // Get user role from localStorage to determine redirect
    const userStr = localStorage.getItem("user")

    if (!userStr) {
      // No user data, redirect to login immediately
      if (!hasRedirected.current) {
        hasRedirected.current = true
        router.push("/login")
      }
      return () => {
        isMounted = false
        clearTimeout(animationTimer)
      }
    }

    try {
      const user = JSON.parse(userStr)
      const targetDashboard = user.role === "homeowner" ? "/dashboard/homeowner" : "/dashboard/contractor"

      const redirectTimer = setTimeout(() => {
        if (isMounted && !hasRedirected.current) {
          hasRedirected.current = true
          router.push(targetDashboard)
        }
      }, 2000)

      return () => {
        isMounted = false
        clearTimeout(animationTimer)
        clearTimeout(redirectTimer)
      }
    } catch (error) {
      // If parsing fails, redirect to login
      if (!hasRedirected.current) {
        hasRedirected.current = true
        router.push("/login")
      }
      return () => {
        isMounted = false
        clearTimeout(animationTimer)
      }
    }
  }, [router])

  return (
    <div className="min-h-screen bg-[#0D3D42] flex items-center justify-center px-4">
      <div className="text-center">
        <div
          className={`inline-flex items-center justify-center w-32 h-32 rounded-full bg-[#328d87] mb-8 transition-all duration-700 ${
            isAnimating ? "scale-100 opacity-100" : "scale-50 opacity-0"
          }`}
        >
          <Loader2 className="w-20 h-20 text-white animate-spin" strokeWidth={2.5} />
        </div>

        <h1
          className={`text-4xl font-bold text-white mb-4 transition-all duration-700 delay-300 ${
            isAnimating ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          Logging in...
        </h1>

        <p
          className={`text-xl text-[#d8e2fb]/80 transition-all duration-700 delay-500 ${
            isAnimating ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          Loading your dashboard...
        </p>
      </div>
    </div>
  )
}
