"use client"
import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { OnboardingProvider } from "@/contexts/onboarding-context"

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <OnboardingProvider>
      <div className="min-h-screen relative">
        <div className="fixed inset-0 z-0">
          <img src="/living-room-background.jpg" alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#03353a]/95 via-[#0d3d42]/90 to-[#328d87]/85" />
        </div>

        <div className="relative z-10">
          <header className="border-b border-white/10">
            <div className="container mx-auto px-4 py-4 flex items-center justify-between">
              <Link href="/">
                <Image src="/images/bidrr-white-logo.png" alt="Bidrr" width={120} height={40} className="h-10 w-auto" />
              </Link>
              <Link href="/" className="text-white/90 hover:text-white text-sm flex items-center gap-2">
                ← Back to Home
              </Link>
            </div>
          </header>
          {children}
        </div>
      </div>
    </OnboardingProvider>
  )
}
