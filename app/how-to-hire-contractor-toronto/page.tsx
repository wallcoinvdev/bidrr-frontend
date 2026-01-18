import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, CheckCircle2, AlertTriangle, Shield, FileText, Users, Star } from "lucide-react"

export const metadata = {
  title: "How to Hire a Contractor in Toronto 2026 | Complete Guide & Checklist",
  description: "Expert guide to hiring contractors in Toronto. Learn how to avoid scams, verify licenses, compare quotes, and choose the right contractor for your project.",
  keywords: "hire contractor Toronto, find licensed contractor, Toronto contractor checklist, avoid contractor scams, contractor questions, verify contractor license Ontario",
}

export default function HowToHireContractorToronto() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-balance font-serif text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl">
              How to Hire a Contractor in Toronto: Complete 2026 Guide
            </h1>
            <p className="mt-6 text-pretty text-lg text-muted-foreground md:text-xl">
              Everything you need to know to hire the right contractor, avoid scams, and ensure your home renovation project succeeds.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/signup?role=homeowner">
                  Get Vetted Contractor Quotes
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground">
                Compare multiple contractors • Starting at $2.45 per quote
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Red Flags Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="text-center">
              <AlertTriangle className="mx-auto h-12 w-12 text-red-600" />
              <h2 className="mt-4 font-serif text-3xl font-bold text-foreground md:text-4xl">
                Red Flags to Watch For
              </h2>
              <p className="mt-4 text-muted-foreground">
                Avoid these warning signs when choosing a contractor
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="border-red-200 bg-red-50/50 p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-6 w-6 flex-shrink-0 text-red-600" />
                  <div>
                    <h3 className="font-semibold">No Written Contract</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Always insist on a detailed written contract. Verbal agreements offer no legal protection.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="border-red-200 bg-red-50/50 p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-6 w-6 flex-shrink-0 text-red-600" />
                  <div>
                    <h3 className="font-semibold">Large Upfront Payment</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Never pay more than 10-20% upfront. Pay milestones as work completes, never full payment in advance.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="border-red-200 bg-red-50/50 p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-6 w-6 flex-shrink-0 text-red-600" />
                  <div>
                    <h3 className="font-semibold">No License or Insurance</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Unlicensed contractors put you at risk. Always verify Ontario licensing and insurance coverage.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="border-red-200 bg-red-50/50 p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-6 w-6 flex-shrink-0 text-red-600" />
                  <div>
                    <h3 className="font-semibold">Pressure to Sign Immediately</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Legitimate contractors give you time to decide. High-pressure tactics indicate desperation or scams.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="border-red-200 bg-red-50/50 p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-6 w-6 flex-shrink-0 text-red-600" />
                  <div>
                    <h3 className="font-semibold">Cash-Only Payment</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Insisting on cash may indicate tax evasion. Use checks or credit cards for payment protection.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="border-red-200 bg-red-50/50 p-6">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="h-6 w-6 flex-shrink-0 text-red-600" />
                  <div>
                    <h3 className="font-semibold">No References Available</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Quality contractors have happy past clients. No references means no track record of success.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Questions to Ask Section */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <FileText className="mx-auto h-12 w-12 text-primary" />
              <h2 className="mt-4 font-serif text-3xl font-bold text-foreground md:text-4xl">
                Essential Questions to Ask Every Contractor
              </h2>
              <p className="mt-4 text-muted-foreground">
                Use this checklist to vet contractors before hiring
              </p>
            </div>

            <div className="mt-12 space-y-6">
              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-sm font-bold text-primary">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Are you licensed and insured in Ontario?</h3>
                    <p className="mt-2 text-muted-foreground">
                      Ask for license number, WSIB coverage, and liability insurance proof. Verify with Ontario College of Trades.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-sm font-bold text-primary">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">How long have you been in business?</h3>
                    <p className="mt-2 text-muted-foreground">
                      Established contractors (5+ years) are more reliable. New contractors aren't bad, but need stronger references.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-sm font-bold text-primary">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Can you provide 3 recent references?</h3>
                    <p className="mt-2 text-muted-foreground">
                      Contact past clients about quality, timeliness, communication, and whether they'd hire again.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-sm font-bold text-primary">4</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">What's included in your quote?</h3>
                    <p className="mt-2 text-muted-foreground">
                      Clarify if materials, permits, cleanup, and disposal are included. Hidden costs add up quickly.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-sm font-bold text-primary">5</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">What's your payment schedule?</h3>
                    <p className="mt-2 text-muted-foreground">
                      Standard is 10-20% deposit, payments at milestones, final 10% after completion and approval.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-sm font-bold text-primary">6</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">How long will the project take?</h3>
                    <p className="mt-2 text-muted-foreground">
                      Get realistic timeline with start and end dates. Ask about potential delays and how they're handled.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-sm font-bold text-primary">7</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Do you handle permits and inspections?</h3>
                    <p className="mt-2 text-muted-foreground">
                      Professional contractors manage permits and ensure work meets Toronto building codes.
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-sm font-bold text-primary">8</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">What warranty do you offer?</h3>
                    <p className="mt-2 text-muted-foreground">
                      Quality contractors warranty their work for 1-2 years. Get warranty terms in writing.
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Verification Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <Shield className="mx-auto h-12 w-12 text-primary" />
              <h2 className="mt-4 font-serif text-3xl font-bold text-foreground md:text-4xl">
                How to Verify Contractor Credentials
              </h2>
            </div>

            <div className="mt-12 space-y-6">
              <Card className="p-6">
                <h3 className="flex items-center gap-2 font-semibold text-lg">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Check License Status
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Visit the Ontario College of Trades website and search by license number or name. Verify their trade certification is current and valid.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="flex items-center gap-2 font-semibold text-lg">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Confirm Insurance Coverage
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Request Certificate of Insurance showing liability coverage (minimum $2M) and WSIB coverage. Call the insurance company to verify it's active.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="flex items-center gap-2 font-semibold text-lg">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Search Online Reviews
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Check Google, Bidrr, and HomeStars for reviews. Look for patterns in complaints. A few bad reviews are normal, but consistent issues are red flags.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="flex items-center gap-2 font-semibold text-lg">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Verify Business Registration
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Search Ontario business registry to confirm the company exists and is in good standing. Legitimate businesses are registered.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="flex items-center gap-2 font-semibold text-lg">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Contact References Directly
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Call (don't just email) at least 2 references. Ask specific questions about quality, timeline, communication, and unexpected costs.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Why Compare Quotes Section */}
      <section className="bg-primary/5 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <div className="text-center">
              <Users className="mx-auto h-12 w-12 text-primary" />
              <h2 className="mt-4 font-serif text-3xl font-bold text-foreground md:text-4xl">
                Why Comparing Multiple Quotes Protects You
              </h2>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2">
              <Card className="p-6">
                <Star className="h-8 w-8 text-primary" />
                <h3 className="mt-4 font-semibold text-lg">Fair Market Pricing</h3>
                <p className="mt-2 text-muted-foreground">
                  Quotes can vary 30-50% for identical work. Multiple bids reveal true market rate and identify overcharging.
                </p>
              </Card>

              <Card className="p-6">
                <Shield className="h-8 w-8 text-primary" />
                <h3 className="mt-4 font-semibold text-lg">Spot Missing Details</h3>
                <p className="mt-2 text-muted-foreground">
                  Different contractors include different items. Comparing reveals what should be included and hidden costs.
                </p>
              </Card>

              <Card className="p-6">
                <FileText className="h-8 w-8 text-primary" />
                <h3 className="mt-4 font-semibold text-lg">Better Negotiation</h3>
                <p className="mt-2 text-muted-foreground">
                  Multiple quotes give you leverage. Contractors know you're comparing and offer better rates to win your business.
                </p>
              </Card>

              <Card className="p-6">
                <CheckCircle2 className="h-8 w-8 text-primary" />
                <h3 className="mt-4 font-semibold text-lg">See Work Quality</h3>
                <p className="mt-2 text-muted-foreground">
                  How contractors present quotes shows professionalism. Detailed, clear quotes indicate organized, quality work.
                </p>
              </Card>
            </div>

            <div className="mt-12 rounded-lg bg-background p-8 text-center shadow-sm">
              <h3 className="font-serif text-2xl font-bold text-foreground">
                Get 3-5 Contractor Quotes in One Place
              </h3>
              <p className="mt-4 text-muted-foreground">
                Bidrr makes comparing contractors easy. Post your project once and receive multiple quotes from vetted Toronto contractors.
              </p>
              <div className="mt-6 flex items-center justify-center gap-8">
                <div>
                  <div className="text-3xl font-bold text-primary">100%</div>
                  <div className="text-sm text-muted-foreground">Free for homeowners</div>
                </div>
                <div className="h-12 w-px bg-border" />
                <div>
                  <div className="text-3xl font-bold text-primary">Starting at $2.45</div>
                  <div className="text-sm text-muted-foreground">Per contractor quote</div>
                </div>
              </div>
              <Button asChild size="lg" className="mt-8">
                <Link href="/signup?role=homeowner">
                  Get Contractor Quotes Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center font-serif text-3xl font-bold text-foreground md:text-4xl">
              Frequently Asked Questions
            </h2>

            <div className="mt-12 space-y-6">
              <Card className="p-6">
                <h3 className="font-semibold text-lg">How many contractor quotes should I get?</h3>
                <p className="mt-2 text-muted-foreground">
                  Get at least 3 quotes, ideally 4-5. This gives you enough data to identify fair pricing without overwhelming yourself with options.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold text-lg">Should I always choose the lowest quote?</h3>
                <p className="mt-2 text-muted-foreground">
                  No. Extremely low bids may indicate cutting corners, low-quality materials, or missing costs. Choose based on value, not just price.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold text-lg">What if the contractor asks to change the price mid-project?</h3>
                <p className="mt-2 text-muted-foreground">
                  Changes are acceptable if scope changes or unexpected issues arise. Get change orders in writing before additional work begins.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold text-lg">How does Bidrr verify contractors?</h3>
                <p className="mt-2 text-muted-foreground">
                  All contractors on Bidrr verify their phone number. We recommend homeowners verify licenses, insurance, and references before hiring.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold text-lg">What if I'm unhappy with the contractor's work?</h3>
                <p className="mt-2 text-muted-foreground">
                  Address issues immediately in writing. Don't make final payment until satisfied. For serious disputes, contact Tarion or small claims court.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
