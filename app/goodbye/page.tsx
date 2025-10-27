"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Heart } from "lucide-react"

export default function GoodbyePage() {
  const router = useRouter()
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    setTimeout(() => setIsAnimating(true), 100)

    // Redirect to homepage after 4 seconds
    const timer = setTimeout(() => {
      router.push("/")
    }, 4000)

    return () => clearTimeout(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-[#0D3D42] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div
          className={`inline-flex items-center justify-center w-32 h-32 rounded-full bg-[#328d87] mb-8 transition-all duration-700 ${
            isAnimating ? "scale-100 opacity-100" : "scale-50 opacity-0"
          }`}
        >
          <Heart className="w-16 h-16 text-white" strokeWidth={2} />
        </div>

        <h1
          className={`text-4xl font-bold text-white mb-4 transition-all duration-700 delay-300 ${
            isAnimating ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          We're sad to see you go
        </h1>

        <p
          className={`text-xl text-[#d8e2fb]/80 mb-2 transition-all duration-700 delay-500 ${
            isAnimating ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          Your account has been deleted.
        </p>

        <p
          className={`text-sm text-[#d8e2fb]/60 transition-all duration-700 delay-700 ${
            isAnimating ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
          }`}
        >
          Redirecting to homepage...
        </p>
      </div>
    </div>
  )
}
