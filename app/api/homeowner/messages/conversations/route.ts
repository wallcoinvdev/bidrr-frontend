import { type NextRequest, NextResponse } from "next/server"
import { apiClient } from "@/lib/api-client"

export async function GET(request: NextRequest) {
  try {
    const data = await apiClient.request("/homeowner/messages/conversations", {
      headers: {
        Cookie: request.headers.get("cookie") || "",
      },
    })

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error fetching conversations:", error)
    return NextResponse.json(
      { error: error.message || "Failed to fetch conversations" },
      { status: error.status || 500 },
    )
  }
}
