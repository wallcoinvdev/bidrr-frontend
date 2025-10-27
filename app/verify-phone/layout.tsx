"use client"

import type React from "react"
import { OnboardingProvider } from "@/contexts/onboarding-context"

export default function VerifyPhoneLayout({ children }: { children: React.ReactNode }) {
  return <OnboardingProvider>{children}</OnboardingProvider>
}
