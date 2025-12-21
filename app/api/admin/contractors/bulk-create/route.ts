import { type NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL

// POST /api/admin/contractors/bulk-create - Create temp contractor account
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log("[v0] Bulk creating contractor:", body.email)

    // Forward to backend API
    const response = await fetch(`${API_URL}/api/admin/contractors/bulk-create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    const data = await response.json()

    if (!response.ok) {
      console.error("[v0] Failed to create contractor:", data)
      return NextResponse.json({ error: data.error || "Failed to create contractor" }, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error creating contractor:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
