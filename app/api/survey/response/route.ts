import { NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.bidrr.ca"

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const response = await fetch(`${API_URL}/api/survey/response`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      return NextResponse.json({ error: errorData.error || "Failed to submit survey" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[Survey Response Error]", error)
    return NextResponse.json({ error: "Failed to submit survey" }, { status: 500 })
  }
}
