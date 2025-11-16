import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { phone_number, code } = body

    console.log("[v0] /api/users/verify-phone called")
    console.log("[v0] Phone:", phone_number)
    console.log("[v0] Code:", code)

    // Validate inputs
    if (!phone_number || !code) {
      return NextResponse.json(
        { error: "Phone number and verification code are required" },
        { status: 400 }
      )
    }

    const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

    if (API_BASE_URL) {
      const response = await fetch(`${API_BASE_URL}/api/users/verify-phone`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "ngrok-skip-browser-warning": "true",
        },
        body: JSON.stringify({ phone_number, code }),
      })

      const data = await response.json()
      
      if (!response.ok) {
        console.error("[v0] Backend error:", data)
        return NextResponse.json(
          { error: data.error || data.details || "Verification failed" },
          { status: response.status }
        )
      }

      console.log("[v0] Phone verified successfully")
      return NextResponse.json(data, { status: 200 })
    }

    // Mock response for demo purposes - accept any 6-digit code
    if (code.length === 6) {
      console.log("[v0] Mock mode: Verification successful")
      return NextResponse.json(
        { 
          message: "Phone verified successfully",
          success: true,
          user: {
            phone_verified: true,
            phone_verified_at: new Date().toISOString()
          }
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { error: "Invalid verification code" },
      { status: 400 }
    )
  } catch (error) {
    console.error("[v0] Error in verify-phone:", error)
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    )
  }
}
