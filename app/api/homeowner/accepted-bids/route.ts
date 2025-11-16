import { type NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.bidrr.ca"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const response = await fetch(`${API_URL}/api/homeowner/accepted-bids`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("Backend error:", error)
      return NextResponse.json({ error: "Failed to fetch accepted bids" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching accepted bids:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
