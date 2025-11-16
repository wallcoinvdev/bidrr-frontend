import { type NextRequest, NextResponse } from "next/server"
import { apiClient } from "@/lib/api-client"

export async function GET(request: NextRequest, { params }: { params: { contractorId: string } }) {
  try {
    const data = await apiClient.request(`/homeowner/messages/${params.contractorId}`, {
      headers: {
        Cookie: request.headers.get("cookie") || "",
      },
    })

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch messages" }, { status: error.status || 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { contractorId: string } }) {
  try {
    const body = await request.json()

    const data = await apiClient.request(`/homeowner/messages/${params.contractorId}`, {
      method: "POST",
      headers: {
        Cookie: request.headers.get("cookie") || "",
      },
      body: JSON.stringify(body),
    })

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("Error sending message:", error)
    return NextResponse.json({ error: error.message || "Failed to send message" }, { status: error.status || 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { contractorId: string } }) {
  try {
    await apiClient.request(`/homeowner/messages/${params.contractorId}`, {
      method: "DELETE",
      headers: {
        Cookie: request.headers.get("cookie") || "",
      },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Error deleting conversation:", error)
    return NextResponse.json(
      { error: error.message || "Failed to delete conversation" },
      { status: error.status || 500 },
    )
  }
}
