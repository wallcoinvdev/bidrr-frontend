import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, DollarSign, Hammer, TreePine, AlertCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Toronto Deck Installation Cost Guide 2026 | Deck Building Prices",
  description: "Complete guide to deck installation costs in Toronto. Learn pricing for wood, composite, and multi-level decks. Get free quotes from licensed deck builders starting at $2.45 per bid.",
  keywords: "deck cost toronto, deck installation price, deck builder toronto, composite deck cost, wood deck price, deck construction toronto",
}

export default function TorontoDeckInstallationCostGuide() {
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
              Toronto Deck Installation Cost Guide 2026
            </h1>
            <p className="mt-6 text-balance text-lg text-muted-foreground md:text-xl">
              Complete pricing guide for deck installation, materials, and construction in Toronto and the GTA. Get accurate quotes from licensed deck builders for wood, composite, and multi-level decks.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/signup?role=homeowner">
                  Get Free Deck Quotes
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
              Average Deck Costs in Toronto
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Here's what you can expect to pay for deck installation in Toronto and the GTA in 2026:
            </p>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div className="rounded-lg border bg-card p-6">
                <TreePine className="h-8 w-8 text-primary" />
                <h3 className="mt-4 text-xl font-semibold">Pressure-Treated Wood Deck</h3>
                <p className="mt-2 text-3xl font-bold text-primary">$25 - $40/sq ft</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Most affordable option, includes structure and basic railings
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <Hammer className="h-8 w-8 text-primary" />
                <h3 className="mt-4 text-xl font-semibold">Composite Deck</h3>
                <p className="mt-2 text-3xl font-bold text-primary">$45 - $70/sq ft</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Low-maintenance Trex, TimberTech, or similar materials
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <TreePine className="h-8 w-8 text-primary" />
                <h3 className="mt-4 text-xl font-semibold">Cedar/Hardwood Deck</h3>
                <p className="mt-2 text-3xl font-bold text-primary">$40 - $60/sq ft</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Premium natural wood with beautiful appearance
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <DollarSign className="h-8 w-8 text-primary" />
                <h3 className="mt-4 text-xl font-semibold">Average 12x16 Deck</h3>
                <p className="mt-2 text-3xl font-bold text-primary">$6,000 - $12,000</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  192 sq ft standard deck with stairs and basic railing
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
              Detailed Deck Costs by Size
            </h2>

            <div className="mt-8 space-y-6">
              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-xl font-semibold">Small Decks (100-200 sq ft)</h3>
                <ul className="mt-4 space-y-3 text-muted-foreground">
                  <li className="flex justify-between border-b pb-2">
                    <span>10x10 pressure-treated deck</span>
                    <span className="font-semibold text-foreground">$3,000 - $5,000</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>10x12 composite deck</span>
                    <span className="font-semibold text-foreground">$6,000 - $9,000</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>12x12 cedar deck</span>
                    <span className="font-semibold text-foreground">$6,500 - $9,500</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-xl font-semibold">Medium Decks (200-400 sq ft)</h3>
                <ul className="mt-4 space-y-3 text-muted-foreground">
                  <li className="flex justify-between border-b pb-2">
                    <span>12x16 pressure-treated deck</span>
                    <span className="font-semibold text-foreground">$6,000 - $8,500</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>14x20 composite deck</span>
                    <span className="font-semibold text-foreground">$14,000 - $21,000</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>16x16 cedar deck</span>
                    <span className="font-semibold text-foreground">$11,000 - $16,000</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-xl font-semibold">Large Decks (400-600 sq ft)</h3>
                <ul className="mt-4 space-y-3 text-muted-foreground">
                  <li className="flex justify-between border-b pb-2">
                    <span>16x24 pressure-treated deck</span>
                    <span className="font-semibold text-foreground">$12,000 - $17,000</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>20x20 composite deck</span>
                    <span className="font-semibold text-foreground">$20,000 - $30,000</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>18x30 multi-level deck</span>
                    <span className="font-semibold text-foreground">$25,000 - $40,000</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-xl font-semibold">Additional Features & Upgrades</h3>
                <ul className="mt-4 space-y-3 text-muted-foreground">
                  <li className="flex justify-between border-b pb-2">
                    <span>Stairs (per set)</span>
                    <span className="font-semibold text-foreground">$500 - $1,500</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>Built-in benches (per linear ft)</span>
                    <span className="font-semibold text-foreground">$75 - $150</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>Privacy screen/pergola</span>
                    <span className="font-semibold text-foreground">$2,000 - $6,000</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>LED deck lighting</span>
                    <span className="font-semibold text-foreground">$800 - $2,500</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>Glass railing system</span>
                    <span className="font-semibold text-foreground">$150 - $300/linear ft</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Deck skirting</span>
                    <span className="font-semibold text-foreground">$15 - $40/linear ft</span>
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
              What Affects Deck Installation Costs?
            </h2>

            <div className="mt-8 space-y-6">
              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-xl font-semibold">Material Selection</h3>
                <p className="mt-2 text-muted-foreground">
                  Pressure-treated wood is most affordable ($25-40/sq ft). Composite decking costs more ($45-70/sq ft) but requires no staining or sealing. Cedar and exotic hardwoods fall in between with premium appearance.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-xl font-semibold">Deck Size & Shape</h3>
                <p className="mt-2 text-muted-foreground">
                  Larger decks cost more total but have lower per-square-foot costs. Complex shapes, angles, curves, and multi-level designs increase labor costs by 25-50% compared to simple rectangular decks.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-xl font-semibold">Height & Foundation</h3>
                <p className="mt-2 text-muted-foreground">
                  Ground-level decks are cheapest. Second-story or elevated decks require deeper footings and additional structural support, increasing costs by 30-60%. Toronto's frost line (4 feet) dictates footing depth.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-xl font-semibold">Railing & Stairs</h3>
                <p className="mt-2 text-muted-foreground">
                  Basic wood railings are included in base pricing. Upgraded railings (aluminum, glass, cable) add $50-300/linear foot. Each staircase adds $500-1,500 depending on height and materials.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-xl font-semibold">Site Conditions</h3>
                <p className="mt-2 text-muted-foreground">
                  Sloped yards require additional excavation and support. Poor soil conditions need stronger footings. Limited access for materials and equipment increases labor time. Rocky Toronto clay soil can complicate footing installation.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-xl font-semibold">Permits & Inspections</h3>
                <p className="mt-2 text-muted-foreground">
                  Toronto requires building permits for most decks ($200-500). Some neighborhoods have additional design restrictions. Licensed contractors handle permit applications and coordinate inspections.
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
              How to Save Money on Deck Installation
            </h2>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Compare Multiple Quotes</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Deck pricing varies significantly between contractors. Get 3-5 detailed quotes. Use Bidrr to receive competitive bids from licensed deck builders starting at $2.45.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Keep Design Simple</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Rectangular decks cost less than complex shapes. Single-level is cheaper than multi-level. Every angle, curve, and tier adds labor cost.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Start with Treated Wood</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Pressure-treated wood costs 40-60% less than composite. With proper maintenance, it lasts 15-20 years. You can always upgrade to composite later.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Build in Shoulder Season</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Spring (May-June) and fall (September-October) offer better contractor availability. Mid-summer is peak season with higher prices and longer waits.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Add Features Later</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Build basic deck now, add benches, pergola, and lighting later when budget allows. Core structure can accommodate future upgrades.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Consider Size Carefully</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Bigger isn't always better. A well-designed 200 sq ft deck is more functional than a poorly planned 400 sq ft deck. Right-size for your actual needs.
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
                <h3 className="text-lg font-semibold">How long does deck installation take?</h3>
                <p className="mt-2 text-muted-foreground">
                  Simple 12x16 decks take 3-5 days. Larger or complex decks take 1-2 weeks. Weather, permit inspections, and site preparation affect timeline. Most Toronto deck builders work May through October.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Do I need a permit for a deck in Toronto?</h3>
                <p className="mt-2 text-muted-foreground">
                  Yes, most decks require building permits in Toronto. Decks over 24 inches high or attached to the house always need permits. Ground-level floating decks under 108 sq ft may not require permits. Check City of Toronto regulations.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Composite vs wood deck - which is better?</h3>
                <p className="mt-2 text-muted-foreground">
                  Wood costs less upfront ($25-40/sq ft vs $45-70/sq ft). Composite requires no staining/sealing and lasts 25+ years vs 15-20 for wood. Composite pays off if you stay 10+ years. Wood is better for tight budgets or short-term ownership.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">How long do decks last in Toronto?</h3>
                <p className="mt-2 text-muted-foreground">
                  Pressure-treated wood: 15-20 years with maintenance. Cedar: 20-30 years. Composite: 25-30 years with minimal maintenance. Toronto's harsh winters (freeze-thaw cycles) reduce lifespan compared to milder climates.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">What's the best time of year to build a deck in Toronto?</h3>
                <p className="mt-2 text-muted-foreground">
                  May through September are ideal. Ground must be thawed for footings (April-October). Peak season is June-August with highest prices. Best value: May-June or September-October for better availability and pricing.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">How do I maintain a wood deck?</h3>
                <p className="mt-2 text-muted-foreground">
                  Clean annually with deck cleaner. Re-stain/seal every 2-3 years. Inspect for loose boards, nails, and structural issues. Remove snow buildup in winter. Proper maintenance doubles deck lifespan.
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
              Ready to Get Deck Quotes?
            </h2>
            <p className="mt-4 text-balance text-lg opacity-90">
              Post your deck project on Bidrr and receive multiple competitive quotes from licensed Toronto deck builders. Compare prices, review past work, and hire with confidence. Contractors bid starting at $2.45.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
                <Link href="/signup?role=homeowner">
                  Post Your Deck Job Free
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
