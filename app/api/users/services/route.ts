import { type NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.bidrr.ca"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { services } = body

    console.log("[v0] Updating services...")
    console.log("[v0] Services to save:", services)

    // Forward request to backend API
    const response = await fetch(`${API_URL}/api/users/services`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({ services }),
    })

    console.log("[v0] Backend services response status:", response.status)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      console.error("[v0] Backend error updating services:", errorData)
      return NextResponse.json({ error: "Failed to update services", details: errorData }, { status: response.status })
    }

    const data = await response.json()
    console.log("[v0] Services updated successfully:", data)

    return NextResponse.json({ success: true, services: data.services })
  } catch (error: any) {
    console.error("[v0] Error in services endpoint:", error)
    return NextResponse.json({ error: error.message || "Failed to update services" }, { status: 500 })
  }
}
