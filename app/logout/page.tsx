"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LogoutPage() {
  const router = useRouter()

  useEffect(() => {
    const logout = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.bidrr.ca"

        await fetch(`${apiUrl}/api/users/logout`, {
          method: "POST",
          credentials: "include",
        })
      } catch (error) {
        console.error("Logout error:", error)
      } finally {
        localStorage.removeItem("auth_token")
        localStorage.removeItem("user")
        localStorage.removeItem("is_impersonating")

        // Redirect to homepage
        router.push("/")
      }
    }

    logout()
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
