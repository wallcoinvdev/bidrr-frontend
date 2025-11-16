import { type NextRequest, NextResponse } from "next/server"
import { apiClient } from "@/lib/api-client"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const bids = await apiClient.request(`/api/missions/${params.id}/bids`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    return NextResponse.json(bids)
  } catch (error: any) {
    console.error("Error fetching bids:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch bids" }, { status: error.status || 500 })
  }
}
