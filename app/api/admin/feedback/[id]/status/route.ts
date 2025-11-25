import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { status } = await request.json()
    const authHeader = request.headers.get("authorization")

    console.log("[v0] Updating feedback status:", { id: params.id, status })

    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/feedback/${params.id}/status`
    console.log("[v0] Backend URL:", backendUrl)

    const response = await fetch(backendUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({ status }),
    })

    const data = await response.json()

    console.log("[v0] Backend response:", { status: response.status, data })

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("[v0] Error updating feedback status:", error)
    return NextResponse.json({ error: "Failed to update feedback status", details: error.message }, { status: 500 })
  }
}
