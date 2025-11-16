import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone_number, role, email } = body

    console.log("[v0] /api/users/request-verification called")
    console.log("[v0] Phone:", phone_number)
    console.log("[v0] Role:", role)
    console.log("[v0] Email:", email)

    // Validate inputs
    if (!phone_number || !role) {
      return NextResponse.json(
        { error: "Phone number and role are required" },
        { status: 400 }
      )
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

    if (API_BASE_URL) {
      const response = await fetch(`${API_BASE_URL}/api/users/request-verification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ phone_number, role, email }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        console.error("[v0] Backend error:", data)
        return NextResponse.json(
          { error: data.error || data.details || "Failed to send SMS" },
          { status: response.status }
        )
      }

      console.log("[v0] Verification code sent successfully")
      return NextResponse.json(data, { status: 200 })
    }

    // Mock response for demo purposes
    console.log("[v0] Mock mode: Simulating verification code sent")
    return NextResponse.json(
      { 
        message: "Verification code sent successfully",
        success: true 
      },
      { status: 200 }
    )
  } catch (error) {
    console.error("[v0] Error in request-verification:", error)
    return NextResponse.json(
      { error: "Failed to send SMS" },
      { status: 500 }
    )
  }
}
