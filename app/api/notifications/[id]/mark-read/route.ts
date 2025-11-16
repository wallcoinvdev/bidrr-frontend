import { type NextRequest, NextResponse } from "next/server"

// PUT/POST /api/notifications/[id]/mark-read - Mark notification as read
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleMarkRead(request, params)
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return handleMarkRead(request, params)
}

async function handleMarkRead(
  request: NextRequest,
  params: { id: string }
) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    const notificationId = params.id

    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.bidrr.ca"
    const response = await fetch(`${backendUrl}/api/notifications/${notificationId}/mark-read`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Backend mark-read error:", response.status, errorText)
      return NextResponse.json(
        { error: "Failed to mark notification as read" },
        { status: response.status }
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Mark notification read error:", error)
    return NextResponse.json({ error: "Failed to mark notification as read" }, { status: 500 })
  }
}
