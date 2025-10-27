import { type NextRequest, NextResponse } from "next/server"

// GET /api/contractors/:id/profile - Get contractor public profile
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const contractorId = params.id

    // Mock contractor profile data
    const profile = {
      id: Number.parseInt(contractorId),
      full_name: "Mike Wilson",
      company_name: "Wilson Plumbing Services",
      email: "mike@wilsonplumbing.com",
      phone_number: "+1 (555) 123-4567",
      bio: "Licensed plumber with over 15 years of experience. Specializing in residential and commercial plumbing repairs, installations, and emergency services.",
      services: ["Plumbing", "Emergency Repairs", "Installations"],
      years_experience: 15,
      certifications: ["Licensed Plumber", "Gas Fitter", "Backflow Prevention"],
      service_area: ["Toronto", "Mississauga", "Brampton"],
      created_at: new Date(Date.now() - 365 * 5 * 24 * 60 * 60 * 1000).toISOString(),
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error("[v0] Fetch contractor profile error:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}
