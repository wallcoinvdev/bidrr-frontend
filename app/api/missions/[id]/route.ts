import { type NextRequest, NextResponse } from "next/server"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const missionId = params.id

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/missions/${missionId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Failed to delete mission:", response.status, errorText)
      return NextResponse.json({ error: "Failed to delete mission" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error in delete mission route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const missionId = params.id

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/missions/${missionId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Failed to fetch mission:", response.status, errorText)
      return NextResponse.json({ error: "Failed to fetch mission" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error in get mission route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.cookies.get("token")?.value

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const missionId = params.id

    // Get the form data from the request
    const formData = await request.formData()

    // Forward to backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/missions/${missionId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] Failed to update mission:", response.status, errorText)
      return NextResponse.json({ error: errorText || "Failed to update mission" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[v0] Error in update mission route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
