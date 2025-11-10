import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // TODO: Replace this mock data with real backend API calls
    // This structure shows all services that should be tracked

    const services = [
      {
        name: "Railway",
        daily: 0.67,
        monthly: 20.0,
        annual: 240.0,
        usage: [
          { label: "Services", value: "2" },
          { label: "Plan", value: "Pro" },
        ],
        status: "unavailable",
      },
      {
        name: "AWS S3",
        daily: 0.0,
        monthly: 0.0,
        annual: 0.0,
        usage: [],
        status: "error",
        error: "Cannot find module '@aws-sdk/...'.",
      },
      {
        name: "Google Cloud",
        daily: 0.0,
        monthly: 0.0,
        annual: 0.0,
        usage: [],
        status: "error",
        error: "Could not load the default credentials",
      },
      {
        name: "Twilio",
        daily: 0.01,
        monthly: 0.38,
        annual: 4.56,
        usage: [{ label: "SMS Sent", value: "51" }],
        status: "success",
      },
      {
        name: "MailerSend",
        daily: 0.0,
        monthly: 0.0,
        annual: 0.0,
        usage: [],
        status: "error",
        error: "The route v1/analytics/usage could not be found",
      },
      {
        name: "Neon (Database)",
        daily: 0.0,
        monthly: 0.0,
        annual: 0.0,
        usage: [{ label: "Plan", value: "Free" }],
        status: "unavailable",
      },
    ]

    const totals = {
      daily: services.reduce((sum, s) => sum + s.daily, 0),
      monthly: services.reduce((sum, s) => sum + s.monthly, 0),
      annual: services.reduce((sum, s) => sum + s.annual, 0),
    }

    return NextResponse.json({
      services,
      totals,
      last_updated: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("[v0] Billing API error:", error)
    return NextResponse.json({ error: "Failed to fetch billing data", details: error.message }, { status: 500 })
  }
}
