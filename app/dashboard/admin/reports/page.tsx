"use client"

import { useState } from "react"
import { AlertCircle } from "lucide-react"
import { usePageTitle } from "@/hooks/use-page-title"

export default function UserReportsPage() {
  usePageTitle("User Reports")

  const [filter, setFilter] = useState("all")

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">User Reports</h1>
        <p className="text-gray-600 mt-2">
          Review reports submitted by users about inappropriate behavior or policy violations
        </p>
      </div>

      <div className="flex justify-end">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0F3D3E] focus:border-transparent"
        >
          <option value="all">All Reports</option>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      <div className="bg-white rounded-lg border border-gray-200 p-16">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
            <AlertCircle className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Reports Found</h3>
          <p className="text-gray-600">There are no reports matching your filter criteria.</p>
        </div>
      </div>
    </div>
  )
}
