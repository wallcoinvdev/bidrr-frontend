import { NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.bidrr.ca"

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("Authorization")

    if (!authHeader) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    const targetUrl = `${API_URL}/api/admin/survey/results`

    const response = await fetch(targetUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: authHeader,
      },
    })

    if (!response.ok) {
      const text = await response.text()

      let errorData = {}
      try {
        errorData = JSON.parse(text)
      } catch {
        errorData = { error: text || "Failed to fetch survey results" }
      }

      return NextResponse.json(
        { error: (errorData as any).error || "Failed to fetch survey results" },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("[Survey Results Error]", error)
    return NextResponse.json({ error: "Failed to fetch survey results" }, { status: 500 })
  }
}
