import type { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, DollarSign, ThermometerSun, Wind, Snowflake, AlertCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "Toronto HVAC Cost Guide 2026 | Furnace, AC & Heat Pump Prices",
  description: "Complete guide to HVAC costs in Toronto. Learn pricing for furnace installation, AC repair, heat pumps, and more. Get free quotes from licensed HVAC contractors starting at $2.45 per bid.",
  keywords: "hvac cost toronto, furnace installation cost, air conditioning toronto, heat pump cost, hvac repair toronto, ac installation price",
}

export default function TorontoHVACCostGuide() {
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
              Toronto HVAC Cost Guide 2026
            </h1>
            <p className="mt-6 text-balance text-lg text-muted-foreground md:text-xl">
              Complete pricing guide for furnace installation, AC repair, heat pumps, and HVAC services in Toronto and the GTA. Get accurate quotes from licensed HVAC contractors.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/signup?role=homeowner">
                  Get Free HVAC Quotes
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
              Average HVAC Costs in Toronto
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Here's what you can expect to pay for common HVAC services in Toronto and the GTA in 2026:
            </p>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div className="rounded-lg border bg-card p-6">
                <ThermometerSun className="h-8 w-8 text-primary" />
                <h3 className="mt-4 text-xl font-semibold">Furnace Installation</h3>
                <p className="mt-2 text-3xl font-bold text-primary">$3,500 - $8,000</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Includes standard gas furnace, installation, and basic ductwork modifications
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <Snowflake className="h-8 w-8 text-primary" />
                <h3 className="mt-4 text-xl font-semibold">AC Installation</h3>
                <p className="mt-2 text-3xl font-bold text-primary">$3,000 - $6,500</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Central air conditioning system with outdoor condenser and indoor coil
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <Wind className="h-8 w-8 text-primary" />
                <h3 className="mt-4 text-xl font-semibold">Heat Pump Installation</h3>
                <p className="mt-2 text-3xl font-bold text-primary">$5,000 - $12,000</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Complete heat pump system for heating and cooling
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <DollarSign className="h-8 w-8 text-primary" />
                <h3 className="mt-4 text-xl font-semibold">HVAC Repair</h3>
                <p className="mt-2 text-3xl font-bold text-primary">$150 - $800</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Most common repairs including parts and labor
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
              Detailed HVAC Service Costs
            </h2>

            <div className="mt-8 space-y-6">
              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-xl font-semibold">Furnace Services</h3>
                <ul className="mt-4 space-y-3 text-muted-foreground">
                  <li className="flex justify-between border-b pb-2">
                    <span>Standard gas furnace (80% efficiency)</span>
                    <span className="font-semibold text-foreground">$2,500 - $4,000</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>High-efficiency gas furnace (95%+)</span>
                    <span className="font-semibold text-foreground">$4,000 - $6,500</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>Furnace repair (average)</span>
                    <span className="font-semibold text-foreground">$200 - $600</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>Annual furnace maintenance</span>
                    <span className="font-semibold text-foreground">$100 - $200</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Emergency furnace repair</span>
                    <span className="font-semibold text-foreground">$300 - $1,000</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-xl font-semibold">Air Conditioning Services</h3>
                <ul className="mt-4 space-y-3 text-muted-foreground">
                  <li className="flex justify-between border-b pb-2">
                    <span>Central AC installation (2-ton)</span>
                    <span className="font-semibold text-foreground">$3,000 - $4,500</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>Central AC installation (3-4 ton)</span>
                    <span className="font-semibold text-foreground">$4,500 - $6,500</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>AC repair (refrigerant, compressor, etc.)</span>
                    <span className="font-semibold text-foreground">$200 - $800</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>AC tune-up/maintenance</span>
                    <span className="font-semibold text-foreground">$100 - $180</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Ductless mini-split installation</span>
                    <span className="font-semibold text-foreground">$2,500 - $5,000</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-xl font-semibold">Additional HVAC Services</h3>
                <ul className="mt-4 space-y-3 text-muted-foreground">
                  <li className="flex justify-between border-b pb-2">
                    <span>Duct cleaning (whole home)</span>
                    <span className="font-semibold text-foreground">$300 - $600</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>Thermostat installation (smart)</span>
                    <span className="font-semibold text-foreground">$150 - $400</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>Humidifier installation</span>
                    <span className="font-semibold text-foreground">$400 - $800</span>
                  </li>
                  <li className="flex justify-between border-b pb-2">
                    <span>Air purifier installation</span>
                    <span className="font-semibold text-foreground">$600 - $1,500</span>
                  </li>
                  <li className="flex justify-between">
                    <span>New ductwork installation</span>
                    <span className="font-semibold text-foreground">$2,000 - $5,000</span>
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
              What Affects HVAC Costs in Toronto?
            </h2>

            <div className="mt-8 space-y-6">
              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-xl font-semibold">System Size & Capacity</h3>
                <p className="mt-2 text-muted-foreground">
                  Larger homes need bigger HVAC systems. A 1,500 sq ft home typically needs a 2-3 ton AC and 60,000 BTU furnace, while a 3,000 sq ft home may need 4-5 tons and 100,000+ BTU. Bigger systems cost more.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-xl font-semibold">Efficiency Rating (SEER/AFUE)</h3>
                <p className="mt-2 text-muted-foreground">
                  High-efficiency systems (95%+ AFUE furnaces, 16+ SEER AC) cost more upfront but save on energy bills. In Toronto's climate, the investment often pays off within 5-7 years.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-xl font-semibold">Installation Complexity</h3>
                <p className="mt-2 text-muted-foreground">
                  Existing ductwork, accessibility, electrical upgrades, and gas line modifications all affect cost. Older Toronto homes may require additional work to meet current building codes.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-xl font-semibold">Brand & Warranty</h3>
                <p className="mt-2 text-muted-foreground">
                  Premium brands (Lennox, Carrier, Trane) with extended warranties cost 20-40% more than budget brands, but offer better reliability and longer lifespans.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-xl font-semibold">Seasonal Demand</h3>
                <p className="mt-2 text-muted-foreground">
                  HVAC contractors are busiest in extreme weather. Installing in spring or fall (shoulder seasons) often means better availability and potentially lower prices.
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
              How to Save Money on HVAC Services
            </h2>

            <div className="mt-8 grid gap-6 sm:grid-cols-2">
              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Compare Multiple Quotes</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  HVAC prices vary significantly. Get 3-5 quotes to ensure you're getting fair pricing. Bidrr makes this easy - post once, get multiple bids starting at $2.45.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Consider Rebates</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Canada Greener Homes Grant offers up to $5,000 for energy-efficient HVAC upgrades. Check Enbridge and Toronto Hydro for additional rebates.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Install Off-Season</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Spring and fall have lower demand. You'll get faster service and potentially better pricing than peak summer or winter.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Regular Maintenance</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Annual tune-ups ($100-180) prevent costly emergency repairs and extend system life by 5-10 years.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Bundle Services</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Installing furnace and AC together often saves 10-15% compared to separate installations.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Right-Size Your System</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Oversized systems cost more and run inefficiently. Get a proper load calculation to avoid overspending.
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
                <h3 className="text-lg font-semibold">How long does HVAC installation take?</h3>
                <p className="mt-2 text-muted-foreground">
                  Furnace or AC installation typically takes 6-12 hours (1-2 days). Complex installations with ductwork modifications can take 2-3 days. Heat pump installations may take 1-3 days depending on system type.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Do I need permits for HVAC work in Toronto?</h3>
                <p className="mt-2 text-muted-foreground">
                  Yes. HVAC installations and major repairs require building permits in Toronto. Licensed HVAC contractors typically handle permit applications. Permit costs are usually $100-300 and included in quotes.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">What HVAC system is best for Toronto's climate?</h3>
                <p className="mt-2 text-muted-foreground">
                  For Toronto's cold winters and hot summers, a high-efficiency gas furnace paired with central AC is most common. Heat pumps work well for newer, well-insulated homes. Ductless mini-splits are great for additions or homes without existing ductwork.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">How long do HVAC systems last?</h3>
                <p className="mt-2 text-muted-foreground">
                  Gas furnaces last 15-25 years with proper maintenance. Air conditioners last 12-18 years. Heat pumps last 10-15 years. Regular annual maintenance can extend these lifespans significantly.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">Should I repair or replace my HVAC system?</h3>
                <p className="mt-2 text-muted-foreground">
                  If repair costs exceed 50% of replacement cost, or your system is over 15 years old, replacement is usually better. Modern systems are 20-40% more efficient than older models.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <h3 className="text-lg font-semibold">What size HVAC system do I need?</h3>
                <p className="mt-2 text-muted-foreground">
                  System sizing depends on home square footage, insulation, windows, and layout. A qualified HVAC contractor should perform a Manual J load calculation. Rough estimate: 1 ton AC per 500-600 sq ft, 30-40 BTU furnace per sq ft.
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
              Ready to Get HVAC Quotes?
            </h2>
            <p className="mt-4 text-balance text-lg opacity-90">
              Post your HVAC project on Bidrr and receive multiple competitive quotes from licensed Toronto HVAC contractors. Compare prices, read reviews, and hire with confidence. Contractors bid starting at $2.45.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
                <Link href="/signup?role=homeowner">
                  Post Your HVAC Job Free
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
