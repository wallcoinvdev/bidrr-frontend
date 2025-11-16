"use client"

import { createContext, useContext, useState, type ReactNode } from "react"

interface OnboardingData {
  role?: "homeowner" | "contractor"
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  countryCode?: string
  address?: string
  city?: string
  region?: string
  country?: string
  postalCode?: string
  companyName?: string
  companySize?: string
  businessAddress?: string
  businessCity?: string
  businessRegion?: string
  businessCountry?: string
  businessPostalCode?: string
  radiusKm?: number
  services?: string[]
  token?: string
  userId?: number
}

interface OnboardingContextType {
  data: OnboardingData
  updateData: (newData: Partial<OnboardingData>) => void
  clearData: () => void
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>({})

  const updateData = (newData: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...newData }))
  }

  const clearData = () => {
    setData({})
  }

  return <OnboardingContext.Provider value={{ data, updateData, clearData }}>{children}</OnboardingContext.Provider>
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (context === undefined) {
    throw new Error("useOnboarding must be used within an OnboardingProvider")
  }
  return context
}
