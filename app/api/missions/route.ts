import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get the form data from the request
    const formData = await request.formData()

    // Forward to backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/missions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Failed to create mission:", response.status, errorText)
      return NextResponse.json({ error: errorText || "Failed to create mission" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error in create mission route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
