import { type NextRequest, NextResponse } from "next/server"
import { apiClient } from "@/lib/api-client"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    try {
      const result = await apiClient.request(`/api/bids/${params.id}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body,
      })

      return NextResponse.json(result)
    } catch (apiError: any) {
      // If backend returns 404, provide a helpful message
      if (apiError.status === 404) {
        return NextResponse.json(
          { 
            error: "Bid status update endpoint not yet implemented on backend",
            message: "This feature requires backend API implementation at /api/bids/:id/status"
          }, 
          { status: 404 }
        )
      }
      throw apiError
    }
  } catch (error: any) {
    console.error("Error updating bid status:", error)
    return NextResponse.json(
      { error: error.message || "Failed to update bid status" }, 
      { status: error.status || 500 }
    )
  }
}
