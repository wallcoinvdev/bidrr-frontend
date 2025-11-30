"use client"
import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Briefcase, Home } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const role = searchParams.get("role")

  useEffect(() => {
    console.log("[v0] ========== SIGNUP PAGE LOADED ==========")
    console.log("[v0] Current URL:", window.location.href)
    console.log("[v0] Role from URL:", role)
    console.log("[v0] Timestamp:", new Date().toISOString())
    console.log("[v0] ===========================================")
  }, [])

  useEffect(() => {
    if (role === "homeowner" || role === "contractor") {
      router.push(`/onboarding/personal-info?role=${role}`)
    }
  }, [role, router])

  const handleRoleSelect = (selectedRole: "homeowner" | "contractor") => {
    router.push(`/onboarding/personal-info?role=${selectedRole}`)
  }

  return (
    <div className="min-h-screen relative">
      {/* Background image with teal overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/living-room-background.jpg')" }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-[#03353a]/95 via-[#0d3d42]/90 to-[#03353a]/95" />

      {/* Content */}
      <div className="relative container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <Image
            src="/images/bidrr-white-logo.png"
            alt="Bidrr"
            width={120}
            height={40}
            className="h-8 sm:h-10 w-auto"
          />
          <Link href="/" className="inline-flex items-center text-sm text-white/90 hover:text-white transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-white mb-4">Join Bidrr</h1>
            <p className="text-lg text-white/80">Choose how you want to use Bidrr</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <button
              onClick={() => handleRoleSelect("homeowner")}
              className="bg-white border-2 border-[#d8e2fb]/30 hover:border-[#328d87] rounded-lg p-8 text-left transition-all group shadow-lg"
            >
              <div className="w-16 h-16 bg-[#328d87]/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#328d87] transition-colors">
                <Home className="w-8 h-8 text-[#328d87] group-hover:text-white transition-colors" />
              </div>
              <h2 className="text-2xl font-bold text-[#03353a] mb-2">I'm a Customer</h2>
              <p className="text-[#03353a]/70">Post projects and hire trusted contractors for your home</p>
            </button>

            <button
              onClick={() => handleRoleSelect("contractor")}
              className="bg-white border-2 border-[#d8e2fb]/30 hover:border-[#e2bb12] rounded-lg p-8 text-left transition-all group shadow-lg"
            >
              <div className="w-16 h-16 bg-[#e2bb12]/10 rounded-full flex items-center justify-center mb-4 group-hover:bg-[#e2bb12] transition-colors">
                <Briefcase className="w-8 h-8 text-[#e2bb12] group-hover:text-white transition-colors" />
              </div>
              <h2 className="text-2xl font-bold text-[#03353a] mb-2">I'm a Contractor</h2>
              <p className="text-[#03353a]/70">Find new projects and grow your business</p>
            </button>
          </div>

          <p className="text-center text-white/90">
            Already have an account?{" "}
            <Link href="/login" className="text-[#e2bb12] font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
