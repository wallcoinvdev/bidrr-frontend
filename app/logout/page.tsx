"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"

export default function LogoutPage() {
  const router = useRouter()
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setTimeout(() => setIsAnimating(true), 100)

    // Clear auth data
    localStorage.removeItem("token")
    localStorage.removeItem("refresh_token")
    localStorage.removeItem("user")

    // Redirect to home after 2 seconds
    const timer = setTimeout(() => {
      router.push("/")
    }, 2000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-[#0D3D42] flex items-center justify-center px-4">
      <div className="text-center">
        <div
          className={`inline-flex items-center justify-center w-32 h-32 rounded-full bg-[#328d87] mb-8 transition-all duration-700 ${
            isAnimating ? "scale-100 opacity-100" : "scale-50 opacity-0"
          }`}
        >
          <LogOut className="w-20 h-20 text-white" strokeWidth={2.5} />
        </div>

        <h1
          className={`text-4xl font-bold text-white mb-4 transition-all duration-700 delay-300 ${
            isAnimating ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          Logging you out...
        </h1>

        <p
          className={`text-xl text-[#d8e2fb]/80 transition-all duration-700 delay-500 ${
            isAnimating ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          Make sure to check back for bids on your active job postings!
        </p>
      </div>
    </div>
  )
}
