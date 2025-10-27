import { type NextRequest, NextResponse } from "next/server"

// GET /api/contractors/:id/reviews - Get contractor reviews
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: contractorId } = await params

    // Mock reviews data
    const reviews = [
      {
        id: 1,
        homeowner_name: "John Smith",
        rating: 5,
        comment: "Excellent work! Very professional and completed the job on time.",
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        mission_title: "Kitchen Plumbing Repair",
      },
      {
        id: 2,
        homeowner_name: "Sarah Johnson",
        rating: 4,
        comment: "Good quality work. Would hire again.",
        created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        mission_title: "Bathroom Renovation",
      },
      {
        id: 3,
        homeowner_name: "Mike Davis",
        rating: 5,
        comment: "Outstanding service! Highly recommend.",
        created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
        mission_title: "Emergency Pipe Fix",
      },
    ]

    // Calculate average rating
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

    return NextResponse.json({
      reviews,
      average_rating: avgRating,
      total_reviews: reviews.length,
    })
  } catch (error) {
    console.error("[v0] Fetch reviews error:", error)
    return NextResponse.json({ error: "Failed to fetch reviews" }, { status: 500 })
  }
}
