import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { status } = await request.json()
    const authHeader = request.headers.get("authorization")

    console.log("[v0] === FEEDBACK STATUS UPDATE ===")
    console.log("[v0] Feedback ID:", params.id)
    console.log("[v0] New Status:", status)
    console.log("[v0] Has Auth Header:", !!authHeader)

    if (!authHeader) {
      console.log("[v0] ERROR: No auth header")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/feedback/${params.id}/status`
    console.log("[v0] Backend URL:", backendUrl)
    console.log("[v0] Request body:", { status })

    const response = await fetch(backendUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({ status }),
    })

    console.log("[v0] Backend response status:", response.status)
    console.log("[v0] Backend response ok:", response.ok)

    const data = await response.json()
    console.log("[v0] Backend response data:", JSON.stringify(data))

    if (!response.ok) {
      console.log("[v0] Backend returned error:", data)
      return NextResponse.json(data, { status: response.status })
    }

    console.log("[v0] Success - returning data")
    return NextResponse.json(data)
  } catch (error: any) {
    console.error("[v0] Exception in status route:", error)
    console.error("[v0] Exception message:", error.message)
    console.error("[v0] Exception stack:", error.stack)
    return NextResponse.json({ error: "Failed to update feedback status", details: error.message }, { status: 500 })
  }
}
