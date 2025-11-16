import { type NextRequest, NextResponse } from "next/server"

// GET /api/notifications - Fetch all notifications for the user
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    
    // Forward to backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.bidrr.ca"
    const response = await fetch(`${backendUrl}/api/notifications`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Backend notifications fetch error:", response.status, errorText)
      return NextResponse.json(
        { error: "Failed to fetch notifications" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Notifications fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}
