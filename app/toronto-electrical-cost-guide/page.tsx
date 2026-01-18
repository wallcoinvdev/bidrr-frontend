import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, DollarSign, Zap, Lightbulb, AlertCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Toronto Electrical Cost Guide 2026 | Electrician Pricing & Rates",
  description: "Complete guide to electrical work costs in Toronto. Learn pricing for panel upgrades, wiring, outlets, lighting, and more. Get free quotes from licensed electricians starting at $2.45 per bid.",
  keywords: "electrical cost toronto, electrician rates, panel upgrade cost, rewiring cost toronto, electrical repair toronto, outlet installation price",
}

export default function TorontoElectricalCostGuide() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <Link href="/" className="text-2xl font-bold text-primary">
            Bidrr
          </Link>
          <Button asChild variant="outline">
            <Link href="/signup?role=homeowner">Post a Job</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-balance font-serif text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl">
              Toronto Electrical Cost Guide 2026
            </h1>
            <p className="mt-6 text-balance text-lg text-muted-foreground md:text-xl">
              Complete pricing guide for electrical panel upgrades, rewiring, outlet installation, lighting, and all electrical services in Toronto and the GTA. Get accurate quotes from licensed electricians.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/signup?role=homeowner">
                  Get Free Electrical Quotes
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Average Costs Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-balance font-serif text-3xl font-bold text-foreground md:text-4xl">
              Average Electrical Costs in Toronto
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Here's what you can expect to pay for common electrical services in Toronto and the GTA in 2026:
            </p>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div className="rounded-lg border bg-card p-6">
                <Zap className="h-8 w-8 text-primary" />
                <h3 className="mt-4 text-xl font-semibold">Electrical Panel Upgrade</h3>
                <p className="mt-2 text-3xl font-bold text-primary">$2,000 - $4,500</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  100A to 200A panel upgrade including permits and inspection
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <Zap className="h-8 w-8 text-primary" />
                <h3 className="mt-4 text-xl font-semibold">House Rewiring</h3>
                <p className="mt-2 text-3xl font-bold text-primary">$8,000 - $15,000</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Complete rewiring for typical Toronto home (1,500-2,000 sq ft)
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <Lightbulb className="h-8 w-8 text-primary" />
                <h3 className="mt-4 text-xl font-semibold">Outlet/Switch Installation</h3>
                <p className="mt-2 text-3xl font-bold text-primary">$150 - $300</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Per outlet or switch including materials and labor
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <DollarSign className="h-8 w-8 text-primary" />
                <h3 className="mt-4 text-xl font-semibold">Lighting Installation</h3>
                <p className="mt-2 text-3xl font-bold text-primary">$100 - $600</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Fixture installation, recessed lighting, or ceiling fan
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Cost Breakdown */}
      <section className="bg-muted/50 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-balance font-serif text-3xl font-bold text-foreground md:text-4xl">
              Detailed Electrical Service Costs
            </h2>

            <div className="mt-8 space-y-6">
              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-xl font-semibold">Panel & Wiring Services</h3>
                <ul className="mt-4 space-y-3 text-muted-foreground">
                  <li className="flex justify-between border-b pb-2">
                    <span>100A panel upgrade</span>
                    <span className="font-semibold text-foreground">$1,800 - $3,000</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>200A panel upgrade</span>
                    <span className="font-semibold text-foreground">$2,500 - $4,500</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>Sub-panel installation</span>
                    <span className="font-semibold text-foreground">$800 - $1,500</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>House rewiring (per sq ft)</span>
                    <span className="font-semibold text-foreground">$5 - $10</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Circuit breaker replacement</span>
                    <span className="font-semibold text-foreground">$150 - $300</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-xl font-semibold">Outlets & Switches</h3>
                <ul className="mt-4 space-y-3 text-muted-foreground">
                  <li className="flex justify-between border-b pb-2">
                    <span>Standard outlet installation</span>
                    <span className="font-semibold text-foreground">$150 - $250</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>GFCI outlet installation</span>
                    <span className="font-semibold text-foreground">$175 - $300</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>USB outlet installation</span>
                    <span className="font-semibold text-foreground">$180 - $280</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>Dimmer switch installation</span>
                    <span className="font-semibold text-foreground">$150 - $250</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Smart switch installation</span>
                    <span className="font-semibold text-foreground">$200 - $350</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-xl font-semibold">Lighting Services</h3>
                <ul className="mt-4 space-y-3 text-muted-foreground">
                  <li className="flex justify-between border-b pb-2">
                    <span>Light fixture installation</span>
                    <span className="font-semibold text-foreground">$100 - $300</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>Recessed lighting (per pot light)</span>
                    <span className="font-semibold text-foreground">$150 - $250</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>Chandelier installation</span>
                    <span className="font-semibold text-foreground">$200 - $600</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>Ceiling fan installation</span>
                    <span className="font-semibold text-foreground">$150 - $400</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Outdoor lighting installation</span>
                    <span className="font-semibold text-foreground">$250 - $800</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-xl font-semibold">Specialized Services</h3>
                <ul className="mt-4 space-y-3 text-muted-foreground">
                  <li className="flex justify-between border-b pb-2">
                    <span>EV charger installation</span>
                    <span className="font-semibold text-foreground">$800 - $2,000</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>Hot tub wiring</span>
                    <span className="font-semibold text-foreground">$600 - $1,500</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>Generator hookup</span>
                    <span className="font-semibold text-foreground">$1,000 - $3,000</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>Smoke/CO detector installation</span>
                    <span className="font-semibold text-foreground">$100 - $200</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Electrical inspection</span>
                    <span className="font-semibold text-foreground">$150 - $400</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Cost Factors */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-balance font-serif text-3xl font-bold text-foreground md:text-4xl">
              What Affects Electrical Costs in Toronto?
            </h2>

            <div className="mt-8 space-y-6">
              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-xl font-semibold">Project Complexity</h3>
                <p className="mt-2 text-muted-foreground">
                  Simple jobs like replacing switches cost less than complex projects requiring new circuits or panel upgrades. Older Toronto homes often need knob-and-tube wiring removal, adding cost.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-xl font-semibold">Permits & Inspections</h3>
                <p className="mt-2 text-muted-foreground">
                  Major electrical work requires ESA (Electrical Safety Authority) permits and inspections. Permit costs ($50-$300) and inspection fees add to total project cost but ensure safety and code compliance.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-xl font-semibold">Accessibility</h3>
                <p className="mt-2 text-muted-foreground">
                  Easy access to wiring makes jobs faster and cheaper. Finished walls, difficult attic/basement access, or tight spaces increase labor time and cost.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-xl font-semibold">Materials & Fixtures</h3>
                <p className="mt-2 text-muted-foreground">
                  Budget fixtures and standard materials cost less than premium brands. Smart switches, designer lighting, and high-end fixtures increase project cost.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-xl font-semibold">Emergency vs Scheduled</h3>
                <p className="mt-2 text-muted-foreground">
                  Emergency electrical service (power outages, sparking outlets) costs 1.5-2x regular rates. After-hours, weekend, and holiday work commands premium pricing.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Money Saving Tips */}
      <section className="bg-primary/5 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-balance font-serif text-3xl font-bold text-foreground md:text-4xl">
              How to Save Money on Electrical Work
            </h2>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Get Multiple Quotes</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Electrician rates vary significantly in Toronto. Compare 3-5 quotes to ensure fair pricing. Use Bidrr to get multiple competitive bids starting at $2.45.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Bundle Projects</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Combining multiple electrical jobs (outlets, switches, lighting) in one visit saves on service call fees and reduces per-item costs.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Schedule During Regular Hours</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Avoid emergency, after-hours, and weekend rates unless necessary. Weekday scheduling can save 30-50% on labor costs.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Supply Your Own Fixtures</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Buy light fixtures, outlets, and switches yourself from hardware stores. Electricians often mark up materials 20-40%.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Address Issues Early</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Small electrical issues become expensive emergencies. Flickering lights or warm outlets need immediate attention to avoid costly repairs.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Prepare the Work Area</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Clear furniture and provide easy access to panels and work areas. This reduces labor time and overall project cost.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-balance font-serif text-3xl font-bold text-foreground md:text-4xl">
              Frequently Asked Questions
            </h2>

            <div className="mt-8 space-y-6">
              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Do I need a permit for electrical work in Toronto?</h3>
                <p className="mt-2 text-muted-foreground">
                  Most electrical work requires an ESA permit in Toronto. This includes panel upgrades, new circuits, major appliance installation, and rewiring. Simple repairs like replacing outlets or switches typically don't require permits. Licensed electricians handle permit applications.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">How do I know if I need a panel upgrade?</h3>
                <p className="mt-2 text-muted-foreground">
                  Signs include: frequent breaker trips, flickering lights, burning smells, older 60A or 100A panel, adding major appliances (EV charger, hot tub), or home renovation. Toronto homes built before 1980 often need upgrades.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">What's the difference between ESA Master and regular electrician?</h3>
                <p className="mt-2 text-muted-foreground">
                  ESA Master Electricians can pull permits and supervise work directly. They've passed additional certification. Regular licensed electricians (442A) must work under a master electrician for permit work. Always verify licensing through ESA.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">How long does electrical work take?</h3>
                <p className="mt-2 text-muted-foreground">
                  Simple jobs (outlet installation) take 1-2 hours. Panel upgrades take 4-8 hours. Full house rewiring takes 3-7 days depending on home size and complexity. Add time for permit approvals and inspections.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Should I replace knob-and-tube wiring?</h3>
                <p className="mt-2 text-muted-foreground">
                  Yes. Knob-and-tube wiring (common in pre-1950 Toronto homes) is outdated and unsafe by modern standards. Most insurance companies won't insure homes with knob-and-tube. Budget $8,000-$15,000 for complete rewiring.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">What questions should I ask an electrician?</h3>
                <p className="mt-2 text-muted-foreground">
                  Ask about: ESA license number, insurance coverage, warranty terms, permit handling, project timeline, payment schedule, and whether quote includes all materials and inspections.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-balance font-serif text-3xl font-bold md:text-4xl">
              Ready to Get Electrical Quotes?
            </h2>
            <p className="mt-4 text-balance text-lg opacity-90">
              Post your electrical project on Bidrr and receive multiple competitive quotes from licensed Toronto electricians. Compare prices, verify credentials, and hire with confidence. Contractors bid starting at $2.45.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
                <Link href="/signup?role=homeowner">
                  Post Your Electrical Job Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
            <p className="mt-4 text-sm opacity-75">
              Free for homeowners • No credit card required • Get quotes in 24 hours
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; 2026 Bidrr. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
