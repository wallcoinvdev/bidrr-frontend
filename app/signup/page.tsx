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
    console.log("[v0] localStorage.token:", localStorage.getItem("token"))
    console.log("[v0] localStorage.user:", localStorage.getItem("user"))
    console.log("[v0] Timestamp:", new Date().toISOString())
    console.log("[v0] ===========================================")
  }, [])

  useEffect(() => {
    if (role === "homeowner" || role === "contractor") {
      console.log("[v0] Auto-redirecting to onboarding with role:", role)
      router.push(`/onboarding/personal-info?role=${role}`)
    }
  }, [role, router])

  const handleRoleSelect = (selectedRole: "homeowner" | "contractor") => {
    console.log("[v0] ========== ROLE SELECTED ==========")
    console.log("[v0] User selected role:", selectedRole)
    console.log("[v0] Redirecting to:", `/onboarding/personal-info?role=${selectedRole}`)
    console.log("[v0] Current localStorage state:", {
      token: !!localStorage.getItem("token"),
      user: !!localStorage.getItem("user"),
    })
    console.log("[v0] =====================================")
    router.push(`/onboarding/personal-info?role=${selectedRole}`)
  }

  return (
    <div className="min-h-screen relative flex flex-col">
      <div
        className="fixed inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: "url('/living-room-background.jpg')" }}
      />
      <div className="fixed inset-0 bg-[#0d3d42]/95 z-0" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="border-b border-[#d8e2fb]/10 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center">
                <Image src="/images/logo-white.png" alt="HomeHero" width={140} height={35} className="h-8 w-auto" />
              </Link>
              <Link
                href="/"
                className="text-sm font-medium text-[#d8e2fb] hover:text-white transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Link>
            </div>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-2xl">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-[#d8e2fb] mb-2">Join HomeHero</h2>
              <p className="text-[#d8e2fb]/70">Choose how you want to use HomeHero</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <button
                onClick={() => handleRoleSelect("homeowner")}
                className="bg-white border-2 border-[#d8e2fb]/30 hover:border-[#328d87] rounded-lg p-8 text-left transition-all group shadow-lg"
              >
                <div className="h-12 w-12 bg-[#328d87]/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#328d87]/20 transition-colors">
                  <Home className="h-6 w-6 text-[#328d87]" />
                </div>
                <h3 className="text-xl font-semibold text-[#0d3d42] mb-2">I'm a Customer</h3>
                <p className="text-[#0d3d42]/70">Post projects and hire trusted contractors for your home</p>
              </button>

              <button
                onClick={() => handleRoleSelect("contractor")}
                className="bg-white border-2 border-[#d8e2fb]/30 hover:border-[#e2bb12] rounded-lg p-8 text-left transition-all group shadow-lg"
              >
                <div className="h-12 w-12 bg-[#e2bb12]/10 rounded-lg flex items-center justify-center mb-4 group-hover:bg-[#e2bb12]/20 transition-colors">
                  <Briefcase className="h-6 w-6 text-[#e2bb12]" />
                </div>
                <h3 className="text-xl font-semibold text-[#0d3d42] mb-2">I'm a Contractor</h3>
                <p className="text-[#0d3d42]/70">Find new projects and grow your business</p>
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-[#d8e2fb]/60">
              Already have an account?{" "}
              <Link href="/login" className="text-[#e2bb12] font-medium hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
