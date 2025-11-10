import { type NextRequest, NextResponse } from "next/server"

// This would normally come from your database setup
// For now, we'll use the API_URL to proxy to your backend
const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.bidrr.ca"

// POST /api/users/login - Authenticate user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, remember_me } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    console.log("[v0] Login request received for:", email)

    // Forward request to your backend API
    const response = await fetch(`${API_URL}/api/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password, remember_me }),
    })

    console.log("[v0] Backend response status:", response.status)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: "Login failed" }))
      console.log("[v0] Backend error:", errorData)
      return NextResponse.json({ error: errorData.error || "Invalid credentials" }, { status: response.status })
    }

    const data = await response.json()
    console.log("[v0] Login successful, returning user data")
    console.log("[v0] User role:", data.user?.role)
    console.log("[v0] Is admin:", data.user?.is_admin)

    return NextResponse.json(data, { status: 200 })
  } catch (error: any) {
    console.error("[v0] Login endpoint error:", error)
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 })
  }
}
