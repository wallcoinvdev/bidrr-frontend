"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    // Clear all authentication data
    localStorage.removeItem("token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("user")
    localStorage.removeItem("admin_token")

    // Redirect to homepage
    router.push("/")
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#03353a] mx-auto"></div>
        <p className="mt-4 text-gray-600">Logging out...</p>
      </div>
    </div>
  )
}
