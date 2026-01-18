import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, DollarSign, ChefHat, Home, AlertCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Toronto Kitchen Renovation Cost Guide 2026 | Remodeling Prices",
  description: "Complete guide to kitchen renovation costs in Toronto. Learn pricing for cabinets, countertops, appliances, and full remodels. Get free quotes from contractors starting at $2.45 per bid.",
  keywords: "kitchen renovation cost toronto, kitchen remodel price, kitchen cabinets cost, countertop installation toronto, kitchen contractor toronto",
}

export default function TorontoKitchenRenovationCostGuide() {
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
              Toronto Kitchen Renovation Cost Guide 2026
            </h1>
            <p className="mt-6 text-balance text-lg text-muted-foreground md:text-xl">
              Complete pricing guide for kitchen renovations, remodeling, and upgrades in Toronto and the GTA. Get accurate quotes from experienced kitchen contractors for full remodels or simple updates.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/signup?role=homeowner">
                  Get Free Kitchen Quotes
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
              Average Kitchen Renovation Costs in Toronto
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Here's what you can expect to pay for kitchen renovations in Toronto and the GTA in 2026:
            </p>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div className="rounded-lg border bg-card p-6">
                <ChefHat className="h-8 w-8 text-primary" />
                <h3 className="mt-4 text-xl font-semibold">Minor Kitchen Refresh</h3>
                <p className="mt-2 text-3xl font-bold text-primary">$10,000 - $25,000</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Paint, hardware, lighting, backsplash, and minor updates
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <Home className="h-8 w-8 text-primary" />
                <h3 className="mt-4 text-xl font-semibold">Mid-Range Remodel</h3>
                <p className="mt-2 text-3xl font-bold text-primary">$30,000 - $60,000</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  New cabinets, countertops, appliances, flooring, lighting
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <ChefHat className="h-8 w-8 text-primary" />
                <h3 className="mt-4 text-xl font-semibold">High-End Renovation</h3>
                <p className="mt-2 text-3xl font-bold text-primary">$65,000 - $100,000+</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Custom cabinets, premium materials, layout changes, high-end appliances
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <DollarSign className="h-8 w-8 text-primary" />
                <h3 className="mt-4 text-xl font-semibold">Average Toronto Kitchen</h3>
                <p className="mt-2 text-3xl font-bold text-primary">$40,000 - $50,000</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Most common full kitchen renovation budget in the GTA
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
              Kitchen Component Costs
            </h2>

            <div className="mt-8 space-y-6">
              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-xl font-semibold">Cabinets</h3>
                <ul className="mt-4 space-y-3 text-muted-foreground">
                  <li className="flex justify-between border-b pb-2">
                    <span>Stock cabinets (IKEA-style)</span>
                    <span className="font-semibold text-foreground">$3,000 - $8,000</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>Semi-custom cabinets</span>
                    <span className="font-semibold text-foreground">$8,000 - $18,000</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>Custom cabinets</span>
                    <span className="font-semibold text-foreground">$18,000 - $35,000+</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>Cabinet refacing</span>
                    <span className="font-semibold text-foreground">$5,000 - $12,000</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Cabinet painting</span>
                    <span className="font-semibold text-foreground">$3,000 - $6,000</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-xl font-semibold">Countertops</h3>
                <ul className="mt-4 space-y-3 text-muted-foreground">
                  <li className="flex justify-between border-b pb-2">
                    <span>Laminate countertops</span>
                    <span className="font-semibold text-foreground">$1,500 - $3,000</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>Quartz countertops</span>
                    <span className="font-semibold text-foreground">$4,000 - $8,000</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>Granite countertops</span>
                    <span className="font-semibold text-foreground">$3,500 - $7,000</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>Marble countertops</span>
                    <span className="font-semibold text-foreground">$5,000 - $10,000</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Butcher block</span>
                    <span className="font-semibold text-foreground">$2,000 - $4,000</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-xl font-semibold">Appliances (Full Set)</h3>
                <ul className="mt-4 space-y-3 text-muted-foreground">
                  <li className="flex justify-between border-b pb-2">
                    <span>Basic appliance package</span>
                    <span className="font-semibold text-foreground">$2,500 - $4,000</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>Mid-range appliances</span>
                    <span className="font-semibold text-foreground">$5,000 - $10,000</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>High-end appliances</span>
                    <span className="font-semibold text-foreground">$12,000 - $25,000+</span>
                  </li>
                </ul>
                <p className="mt-4 text-sm text-muted-foreground">
                  Includes fridge, stove, dishwasher, microwave, and range hood
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-xl font-semibold">Flooring, Fixtures & Finishes</h3>
                <ul className="mt-4 space-y-3 text-muted-foreground">
                  <li className="flex justify-between border-b pb-2">
                    <span>Vinyl/laminate flooring</span>
                    <span className="font-semibold text-foreground">$1,500 - $3,000</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>Hardwood flooring</span>
                    <span className="font-semibold text-foreground">$3,000 - $6,000</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>Tile flooring</span>
                    <span className="font-semibold text-foreground">$2,000 - $4,500</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>Backsplash installation</span>
                    <span className="font-semibold text-foreground">$1,000 - $3,000</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>Sink and faucet</span>
                    <span className="font-semibold text-foreground">$500 - $2,000</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>Lighting fixtures</span>
                    <span className="font-semibold text-foreground">$800 - $2,500</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Painting</span>
                    <span className="font-semibold text-foreground">$1,000 - $2,500</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-xl font-semibold">Labor & Professional Fees</h3>
                <ul className="mt-4 space-y-3 text-muted-foreground">
                  <li className="flex justify-between border-b pb-2">
                    <span>General contractor (15-20% of total)</span>
                    <span className="font-semibold text-foreground">$6,000 - $15,000</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>Kitchen designer</span>
                    <span className="font-semibold text-foreground">$1,500 - $5,000</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>Electrical work</span>
                    <span className="font-semibold text-foreground">$2,000 - $5,000</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>Plumbing work</span>
                    <span className="font-semibold text-foreground">$1,500 - $4,000</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Permits & inspections</span>
                    <span className="font-semibold text-foreground">$500 - $1,500</span>
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
              What Affects Kitchen Renovation Costs?
            </h2>

            <div className="mt-8 space-y-6">
              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-xl font-semibold">Kitchen Size</h3>
                <p className="mt-2 text-muted-foreground">
                  Small kitchens (70-100 sq ft) cost $15-35k. Medium kitchens (100-200 sq ft) cost $30-60k. Large kitchens (200+ sq ft) cost $50-100k+. Toronto homes typically have 100-150 sq ft kitchens.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-xl font-semibold">Scope of Work</h3>
                <p className="mt-2 text-muted-foreground">
                  Cosmetic updates (paint, hardware, lighting) cost least. Replacing cabinets and countertops is mid-range. Moving walls, plumbing, or gas lines is most expensive. Layout changes add 30-50% to costs.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-xl font-semibold">Material Quality</h3>
                <p className="mt-2 text-muted-foreground">
                  Stock cabinets and laminate counters are cheapest. Semi-custom cabinets and quartz counters are mid-range. Custom cabinetry and premium stone are most expensive. Appliance quality varies from $2,500 to $25,000+ for full sets.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-xl font-semibold">Structural Changes</h3>
                <p className="mt-2 text-muted-foreground">
                  Removing walls requires structural engineering and permits. Moving plumbing or gas lines is expensive. Older Toronto homes (pre-1950) may have load-bearing walls requiring extra support. Adding square footage is most costly.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-xl font-semibold">Hidden Costs</h3>
                <p className="mt-2 text-muted-foreground">
                  Unexpected issues add 10-20% to budgets. Mold, outdated wiring, or plumbing problems are common in older Toronto homes. Water damage behind cabinets. Asbestos abatement in pre-1980 homes ($2,000-10,000).
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
              How to Save Money on Kitchen Renovations
            </h2>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Get Multiple Detailed Quotes</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Kitchen quotes vary by $10,000-20,000 for the same work. Compare 3-5 contractors. Use Bidrr to get competitive bids from experienced kitchen contractors starting at $2.45.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Keep Existing Layout</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Moving sinks, stoves, or plumbing adds $5,000-15,000. Keeping the same layout saves significantly while still achieving a fresh look with new finishes.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Mix High and Low</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Splurge on focal points (countertops, hardware). Save on hidden items (base cabinets, flooring under island). Mix stock and semi-custom cabinets strategically.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Reface Instead of Replace</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  If cabinet boxes are solid, refacing ($5-12k) saves 40-60% vs new cabinets ($15-35k). Add new doors, drawer fronts, and hardware for refreshed look.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Buy Your Own Appliances</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Shop sales at Best Buy, Home Depot during holiday weekends. Contractors mark up appliances 15-25%. You can save $1,000-3,000 on appliance packages.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Do Demo and Painting Yourself</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Removing old cabinets and painting saves $2,000-4,000 in labor. Hire pros for plumbing, electrical, and cabinet installation - the skilled work.
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
                <h3 className="text-lg font-semibold">How long does a kitchen renovation take?</h3>
                <p className="mt-2 text-muted-foreground">
                  Minor updates: 2-4 weeks. Full renovation keeping layout: 6-8 weeks. Major remodel with structural changes: 10-16 weeks. Custom cabinets add 6-10 weeks lead time. Toronto permit approvals take 2-4 weeks.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Do I need permits for kitchen renovation in Toronto?</h3>
                <p className="mt-2 text-muted-foreground">
                  Yes for: structural changes, moving plumbing/gas lines, electrical work, adding square footage. No permits for: painting, cabinets, countertops, flooring (same location). Contractors handle permit applications and inspections.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Should I move out during renovation?</h3>
                <p className="mt-2 text-muted-foreground">
                  Minor updates: Stay. Full renovation: Depends on tolerance for dust, noise, and no kitchen for 6-8 weeks. Many Toronto homeowners stay and use temporary kitchen setup (microwave, toaster oven, outdoor BBQ).
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">What adds the most value to a kitchen?</h3>
                <p className="mt-2 text-muted-foreground">
                  Quality cabinets and countertops give best ROI. Modern lighting. Fresh paint. Stainless appliances. Updated backsplash. Toronto buyers prioritize open layouts and natural light. Expect to recoup 60-75% of kitchen renovation costs.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Quartz vs granite countertops?</h3>
                <p className="mt-2 text-muted-foreground">
                  Quartz: Non-porous, no sealing needed, consistent patterns, $4-8k. Granite: Natural stone, requires sealing, unique patterns, $3.5-7k. Quartz more popular now for low maintenance. Both durable and add value.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">How much should I budget for contingencies?</h3>
                <p className="mt-2 text-muted-foreground">
                  Add 15-20% buffer for unexpected issues. Older Toronto homes (pre-1960) should budget 20-25% extra. Common surprises: water damage, mold, outdated wiring, structural issues behind walls.
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
              Ready to Get Kitchen Renovation Quotes?
            </h2>
            <p className="mt-4 text-balance text-lg opacity-90">
              Post your kitchen renovation project on Bidrr and receive multiple competitive quotes from experienced Toronto contractors. Compare prices, review portfolios, and hire with confidence. Contractors bid starting at $2.45.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
                <Link href="/signup?role=homeowner">
                  Post Your Kitchen Job Free
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
