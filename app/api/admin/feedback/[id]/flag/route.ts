import { type NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { is_flagged } = await request.json()
    const authHeader = request.headers.get("authorization")

    console.log("[v0] Updating feedback flag:", { id: params.id, is_flagged })

    if (!authHeader) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const backendUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/admin/feedback/${params.id}/flag`
    console.log("[v0] Backend URL:", backendUrl)

    const response = await fetch(backendUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
      body: JSON.stringify({ is_flagged }),
    })

    const data = await response.json()

    console.log("[v0] Backend response:", { status: response.status, data })

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("[v0] Error updating feedback flag:", error)
    return NextResponse.json({ error: "Failed to update feedback flag", details: error.message }, { status: 500 })
  }
}
