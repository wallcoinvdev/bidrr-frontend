import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, DollarSign, Home, Hammer, AlertCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Toronto Roofing Cost Guide 2026 | Roof Replacement & Repair Prices",
  description: "Complete guide to roofing costs in Toronto. Learn pricing for roof replacement, repair, shingles, and more. Get free quotes from licensed roofers starting at $2.45 per bid.",
  keywords: "roofing cost toronto, roof replacement cost, roof repair toronto, shingle installation price, roofing contractor rates, roof cost per square foot",
}

export default function TorontoRoofingCostGuide() {
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
              Toronto Roofing Cost Guide 2026
            </h1>
            <p className="mt-6 text-balance text-lg text-muted-foreground md:text-xl">
              Complete pricing guide for roof replacement, repair, shingles, and all roofing services in Toronto and the GTA. Get accurate quotes from licensed roofing contractors.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/signup?role=homeowner">
                  Get Free Roofing Quotes
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
              Average Roofing Costs in Toronto
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Here's what you can expect to pay for common roofing services in Toronto and the GTA in 2026:
            </p>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div className="rounded-lg border bg-card p-6">
                <Home className="h-8 w-8 text-primary" />
                <h3 className="mt-4 text-xl font-semibold">Asphalt Shingle Roof</h3>
                <p className="mt-2 text-3xl font-bold text-primary">$5,000 - $12,000</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Complete replacement for typical Toronto home (1,500-2,000 sq ft)
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <Home className="h-8 w-8 text-primary" />
                <h3 className="mt-4 text-xl font-semibold">Metal Roofing</h3>
                <p className="mt-2 text-3xl font-bold text-primary">$12,000 - $25,000</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Steel or aluminum metal roof installation
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <Hammer className="h-8 w-8 text-primary" />
                <h3 className="mt-4 text-xl font-semibold">Roof Repair</h3>
                <p className="mt-2 text-3xl font-bold text-primary">$300 - $1,500</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Leak repair, shingle replacement, or flashing work
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <DollarSign className="h-8 w-8 text-primary" />
                <h3 className="mt-4 text-xl font-semibold">Flat Roof (Per Sq Ft)</h3>
                <p className="mt-2 text-3xl font-bold text-primary">$5 - $12</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  TPO, EPDM, or modified bitumen flat roof systems
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
              Detailed Roofing Service Costs
            </h2>

            <div className="mt-8 space-y-6">
              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-xl font-semibold">Shingle Roofing (Per Square)</h3>
                <ul className="mt-4 space-y-3 text-muted-foreground">
                  <li className="flex justify-between border-b pb-2">
                    <span>3-tab asphalt shingles</span>
                    <span className="font-semibold text-foreground">$300 - $450</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>Architectural shingles</span>
                    <span className="font-semibold text-foreground">$400 - $600</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>Premium designer shingles</span>
                    <span className="font-semibold text-foreground">$550 - $850</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>Slate roofing</span>
                    <span className="font-semibold text-foreground">$1,500 - $3,000</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Cedar shake roofing</span>
                    <span className="font-semibold text-foreground">$700 - $1,200</span>
                  </li>
                </ul>
                <p className="mt-4 text-sm text-muted-foreground">
                  Note: 1 square = 100 sq ft. Average Toronto home is 15-25 squares.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-xl font-semibold">Flat Roofing Systems</h3>
                <ul className="mt-4 space-y-3 text-muted-foreground">
                  <li className="flex justify-between border-b pb-2">
                    <span>EPDM rubber membrane (per sq ft)</span>
                    <span className="font-semibold text-foreground">$5 - $8</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>TPO membrane (per sq ft)</span>
                    <span className="font-semibold text-foreground">$6 - $10</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>Modified bitumen (per sq ft)</span>
                    <span className="font-semibold text-foreground">$5 - $9</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>Built-up roofing (BUR)</span>
                    <span className="font-semibold text-foreground">$4 - $7</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Spray foam roofing</span>
                    <span className="font-semibold text-foreground">$7 - $12</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-xl font-semibold">Roof Repairs & Services</h3>
                <ul className="mt-4 space-y-3 text-muted-foreground">
                  <li className="flex justify-between border-b pb-2">
                    <span>Minor leak repair</span>
                    <span className="font-semibold text-foreground">$300 - $600</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>Flashing repair/replacement</span>
                    <span className="font-semibold text-foreground">$400 - $1,000</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>Shingle replacement (10-20 shingles)</span>
                    <span className="font-semibold text-foreground">$250 - $500</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>Chimney flashing repair</span>
                    <span className="font-semibold text-foreground">$500 - $1,200</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>Roof inspection</span>
                    <span className="font-semibold text-foreground">$150 - $400</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Emergency tarp/temporary repair</span>
                    <span className="font-semibold text-foreground">$200 - $800</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-xl font-semibold">Additional Roofing Work</h3>
                <ul className="mt-4 space-y-3 text-muted-foreground">
                  <li className="flex justify-between border-b pb-2">
                    <span>Roof tear-off (removal)</span>
                    <span className="font-semibold text-foreground">$1 - $3/sq ft</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>Plywood deck replacement</span>
                    <span className="font-semibold text-foreground">$3 - $6/sq ft</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>Eaves/gutter installation</span>
                    <span className="font-semibold text-foreground">$10 - $25/linear ft</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>Soffit/fascia replacement</span>
                    <span className="font-semibold text-foreground">$15 - $30/linear ft</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Skylight installation</span>
                    <span className="font-semibold text-foreground">$1,500 - $4,000</span>
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
              What Affects Roofing Costs in Toronto?
            </h2>

            <div className="mt-8 space-y-6">
              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-xl font-semibold">Roof Size & Complexity</h3>
                <p className="mt-2 text-muted-foreground">
                  Larger roofs cost more. Complexity matters too - steep pitches, multiple levels, dormers, skylights, and valleys increase labor time and cost. Simple gable roofs cost less than complex hip or mansard designs.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-xl font-semibold">Material Selection</h3>
                <p className="mt-2 text-muted-foreground">
                  Basic 3-tab shingles are cheapest. Architectural shingles cost 30-40% more but last longer. Premium materials (metal, slate, cedar) cost 2-5x more than asphalt but can last 50+ years.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-xl font-semibold">Roof Pitch (Steepness)</h3>
                <p className="mt-2 text-muted-foreground">
                  Steep roofs (8/12 pitch or higher) require safety equipment and take longer to work on. This increases labor costs by 20-50%. Many older Toronto homes have steep Victorian-style roofs.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-xl font-semibold">Existing Roof Condition</h3>
                <p className="mt-2 text-muted-foreground">
                  If plywood decking is rotted or damaged, it needs replacement ($3-6/sq ft). Multiple old roof layers require removal, adding $1-3/sq ft. Toronto building code limits overlays to 2 layers.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-xl font-semibold">Accessibility & Location</h3>
                <p className="mt-2 text-muted-foreground">
                  Tight Toronto lots with limited access increase costs. Materials must be hand-carried or craned in. Downtown locations may require parking permits and restricted working hours.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-xl font-semibold">Seasonal Timing</h3>
                <p className="mt-2 text-muted-foreground">
                  Spring and fall are peak roofing seasons in Toronto. Winter work costs 20-30% more due to difficult conditions. Summer has better availability and often lower prices.
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
              How to Save Money on Roofing
            </h2>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Get Multiple Quotes</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Roofing prices vary widely in Toronto. Get 3-5 detailed quotes to compare. Use Bidrr to receive competitive bids from licensed roofers starting at $2.45.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Schedule Off-Season</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Late summer or early fall offers best weather and availability. Avoid peak spring demand when prices are highest. Some contractors offer winter discounts.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Don't Overlay if Possible</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  While overlaying existing shingles saves on tear-off costs, a full tear-off allows inspection of deck condition and ensures longest lifespan for new roof.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Choose Mid-Grade Materials</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Architectural shingles offer great value - better than 3-tab, cheaper than premium. 30-50 year warranties with excellent durability for Toronto climate.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Bundle Related Work</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Replace gutters, soffits, and fascia during roofing project. Saves on scaffolding setup and gets better overall pricing.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Maintain Your Roof</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Annual inspections and small repairs extend roof life. Cleaning gutters and removing debris prevents 80% of roof damage.
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
                <h3 className="text-lg font-semibold">How long does a roof replacement take?</h3>
                <p className="mt-2 text-muted-foreground">
                  Most Toronto homes (1,500-2,500 sq ft) take 1-3 days for complete roof replacement. Simple roofs may be done in one day. Complex roofs with multiple levels or steep pitches can take 3-5 days.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Do I need a permit for roofing in Toronto?</h3>
                <p className="mt-2 text-muted-foreground">
                  Complete roof replacements require building permits in Toronto. Permit costs $100-300. Minor repairs under 10 squares typically don't need permits. Licensed contractors handle permit applications.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">How long do roofs last in Toronto?</h3>
                <p className="mt-2 text-muted-foreground">
                  3-tab asphalt: 15-20 years. Architectural shingles: 25-30 years. Metal roofing: 40-70 years. Slate: 75-100+ years. Toronto's freeze-thaw cycles and ice dams reduce lifespan compared to milder climates.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Should I choose asphalt shingles or metal roofing?</h3>
                <p className="mt-2 text-muted-foreground">
                  Asphalt shingles are most affordable ($5-12k) and work well for 25-30 years. Metal roofing costs more ($12-25k) but lasts 50+ years, handles snow better, and increases home value. ROI depends on how long you'll own the home.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">What causes most roof damage in Toronto?</h3>
                <p className="mt-2 text-muted-foreground">
                  Ice dams (from snow melt refreezing at eaves), wind damage from storms, and aging from freeze-thaw cycles. Proper attic ventilation and insulation prevent ice dams, the leading cause of Toronto roof leaks.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Can I replace my roof in winter?</h3>
                <p className="mt-2 text-muted-foreground">
                  Yes, but not ideal. Shingles become brittle in cold weather and adhesive strips don't seal properly below 5°C. Winter roofing costs 20-30% more and comes with additional risks. Best to wait for spring unless emergency.
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
              Ready to Get Roofing Quotes?
            </h2>
            <p className="mt-4 text-balance text-lg opacity-90">
              Post your roofing project on Bidrr and receive multiple competitive quotes from licensed Toronto roofers. Compare prices, check credentials, and hire with confidence. Contractors bid starting at $2.45.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
                <Link href="/signup?role=homeowner">
                  Post Your Roofing Job Free
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
