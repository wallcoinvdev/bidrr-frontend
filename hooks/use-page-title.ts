"use client"

import { useEffect } from "react"

export function usePageTitle(title: string) {
  useEffect(() => {
    const fullTitle = title ? `${title} - Bidrr` : "Bidrr - Connect with Trusted Home Service Professionals"

    document.title = fullTitle
  }, [title])
}
