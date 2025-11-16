import { type NextRequest, NextResponse } from "next/server"

// GET /api/contractors/:id/reviews - Get contractor reviews
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: contractorId } = await params

    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    if (!apiUrl) {
      return NextResponse.json({ error: "API URL not configured" }, { status: 500 })
    }

    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    const response = await fetch(`${apiUrl}/contractors/${contractorId}/reviews`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      return NextResponse.json({ error: "Failed to fetch reviews", details: errorText }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch reviews", details: error.message }, { status: 500 })
  }
}
