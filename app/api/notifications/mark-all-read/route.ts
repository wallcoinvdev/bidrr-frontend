import { type NextRequest, NextResponse } from "next/server"

// PUT /api/notifications/mark-all-read - Mark all notifications as read for the user
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader?.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)
    
    // Forward to backend API
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.bidrr.ca"
    
    try {
      const response = await fetch(`${backendUrl}/api/notifications/mark-all-read`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      // If bulk endpoint works, return the result
      if (response.ok) {
        const data = await response.json()
        return NextResponse.json(data)
      }

      // If 404 or other error, fall back to marking individually
      console.log("[v0] Bulk mark-all-read failed, falling back to individual marking")
      
      // Fetch all notifications
      const notificationsResponse = await fetch(`${backendUrl}/api/notifications`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!notificationsResponse.ok) {
        throw new Error("Failed to fetch notifications for fallback")
      }

      const notifications = await notificationsResponse.json()
      const unreadNotifications = notifications.filter((n: any) => !n.is_read)
      
      // Mark each unread notification as read individually
      const markReadPromises = unreadNotifications.map((notification: any) => 
        fetch(`${backendUrl}/api/notifications/${notification.id}/mark-read`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })
      )

      await Promise.all(markReadPromises)
      
      return NextResponse.json({ 
        success: true, 
        message: "All notifications marked as read (individual)",
        count: unreadNotifications.length
      })
      
    } catch (fetchError) {
      console.error("[v0] Error in mark-all-read fallback:", fetchError)
      throw fetchError
    }
  } catch (error) {
    console.error("[v0] Mark all notifications read error:", error)
    return NextResponse.json({ 
      error: "Failed to mark notifications as read",
      success: false 
    }, { status: 500 })
  }
}
