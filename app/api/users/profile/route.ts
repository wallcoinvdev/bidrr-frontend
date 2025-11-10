import { type NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.bidrr.ca"

// GET /api/users/profile - Get current user profile
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")

    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    console.log("[v0] Fetching user profile...")

    // Forward request to backend API with auth token
    const response = await fetch(`${API_URL}/api/users/profile`, {
      method: "GET",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
    })

    console.log("[v0] Backend profile response status:", response.status)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Failed to fetch profile" }))
      return NextResponse.json({ error: errorData.error || "Failed to fetch profile" }, { status: response.status })
    }

    const userData = await response.json()
    console.log("[v0] Profile fetched successfully")
    console.log("[v0] User ID:", userData.id)
    console.log("[v0] User role:", userData.role)
    console.log("[v0] Is admin:", userData.is_admin)

    return NextResponse.json(userData, { status: 200 })
  } catch (error: any) {
    console.error("[v0] Profile endpoint error:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}
