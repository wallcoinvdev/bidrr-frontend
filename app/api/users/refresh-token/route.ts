import { type NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.bidrr.ca"

// POST /api/users/refresh-token - Refresh authentication token
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { refresh_token } = body

    if (!refresh_token) {
      return NextResponse.json({ error: "Refresh token is required" }, { status: 400 })
    }

    console.log("[v0] Refreshing token...")

    // Forward request to backend API
    const response = await fetch(`${API_URL}/api/users/refresh-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh_token }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Token refresh failed" }))
      return NextResponse.json({ error: errorData.error || "Token refresh failed" }, { status: response.status })
    }

    const data = await response.json()
    console.log("[v0] Token refreshed successfully")

    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    console.error("[v0] Refresh token endpoint error:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}
