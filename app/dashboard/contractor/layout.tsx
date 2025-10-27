"use client"

import type React from "react"
import { ProtectedRoute } from "@/components/protected-route"

export default function ContractorLayout({ children }: { children: React.ReactNode }) {
  return <ProtectedRoute allowedRoles={["contractor"]}>{children}</ProtectedRoute>
}
