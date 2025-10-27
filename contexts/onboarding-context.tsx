"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface OnboardingData {
  // Step 1: Phone verification
  phone: string
  countryCode: string
  password: string
  role: "homeowner" | "contractor"
  token?: string
  userId?: number

  // Step 2: Personal information
  firstName: string
  lastName: string
  email: string
  address: string
  city: string
  region: string
  postalCode: string

  // Step 3a: Homeowner - Mission posting
  service?: string
  jobDetails?: string
  whenNeeded?: string
  images?: File[]

  // Step 3b: Contractor - Company information
  companyName?: string
  companyAddress?: string
  services?: string[]
  radiusKm?: number
  reviewSites?: Array<{ site: string; url: string }>
  website?: string
  companySize?: string
  socialLinks?: Array<{ platform: string; url: string }>
  logo?: File
}

interface OnboardingContextType {
  data: OnboardingData
  updateData: (newData: Partial<OnboardingData>) => void
  clearData: () => void
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined)

const initialData: OnboardingData = {
  phone: "",
  countryCode: "+1",
  password: "",
  role: "homeowner",
  firstName: "",
  lastName: "",
  email: "",
  address: "",
  city: "",
  region: "",
  postalCode: "",
}

const STORAGE_KEY = "homehero_onboarding_data"

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        try {
          return JSON.parse(stored)
        } catch (e) {
          console.error("[v0] Error parsing stored onboarding data:", e)
        }
      }
    }
    return initialData
  })

  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      console.log("[v0] Onboarding data persisted to localStorage")
      console.log("[v0] Stored token:", data.token)
      console.log("[v0] Stored userId:", data.userId)
    }
  }, [data])

  const updateData = (newData: Partial<OnboardingData>) => {
    setData((prev) => ({ ...prev, ...newData }))
    console.log("[v0] Onboarding data updated:", newData)
  }

  const clearData = () => {
    setData(initialData)
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY)
      console.log("[v0] Onboarding data cleared from localStorage")
    }
  }

  return <OnboardingContext.Provider value={{ data, updateData, clearData }}>{children}</OnboardingContext.Provider>
}

export function useOnboarding() {
  const context = useContext(OnboardingContext)
  if (!context) {
    throw new Error("useOnboarding must be used within OnboardingProvider")
  }
  return context
}
