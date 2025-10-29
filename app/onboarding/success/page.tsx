"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useOnboarding } from "@/contexts/onboarding-context"
import { CheckCircle } from "lucide-react"

export default function OnboardingSuccess() {
  const router = useRouter()
  const { data } = useOnboarding()
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setTimeout(() => setIsAnimating(true), 100)

    const timer = setTimeout(() => {
      const userStr = localStorage.getItem("user")
      let targetDashboard = data.role === "homeowner" ? "/dashboard/homeowner" : "/dashboard/contractor"

      if (userStr) {
        try {
          const user = JSON.parse(userStr)
          if (user.is_admin) {
            targetDashboard = "/dashboard/admin"
          }
        } catch (e) {
          console.error("[v0] Error parsing user data:", e)
        }
      }

      router.push(targetDashboard)
    }, 2000)

    return () => clearTimeout(timer)
  }, [data.role, router])

  return (
    <div className="min-h-screen bg-[#0D3D42] flex items-center justify-center px-4">
      <div className="text-center">
        <div
          className={`inline-flex items-center justify-center w-32 h-32 rounded-full bg-[#328d87] mb-8 transition-all duration-700 ${
            isAnimating ? "scale-100 opacity-100" : "scale-50 opacity-0"
          }`}
        >
          <CheckCircle className="w-20 h-20 text-white" strokeWidth={2.5} />
        </div>

        <h1
          className={`text-4xl font-bold text-white mb-4 transition-all duration-700 delay-300 ${
            isAnimating ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          You're good to go!
        </h1>

        <p
          className={`text-xl text-[#d8e2fb]/80 transition-all duration-700 delay-500 ${
            isAnimating ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          Taking you to your dashboard...
        </p>
      </div>
    </div>
  )
}
