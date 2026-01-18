import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, CheckCircle2, DollarSign, Home, Wrench, Lightbulb } from "lucide-react"

export const metadata = {
  title: "Toronto Home Renovation Costs 2026 | Complete Pricing Guide",
  description: "Complete guide to home renovation costs in Toronto and GTA. Learn average prices for kitchen, bathroom, basement, and exterior projects. Get quotes starting at $2.45.",
  keywords: "home renovation cost Toronto, kitchen renovation price, bathroom remodel cost, basement finishing Toronto, renovation costs GTA, contractor prices",
}

export default function TorontoHomeRenovationCosts() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-balance font-serif text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl">
              Toronto Home Renovation Costs: 2026 Complete Guide
            </h1>
            <p className="mt-6 text-pretty text-lg text-muted-foreground md:text-xl">
              Comprehensive pricing guide for every major home renovation project in Toronto and the GTA. Plan your budget with confidence.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/signup?role=homeowner">
                  Get Free Renovation Quotes
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground">
                Compare contractors • Starting at $2.45 per quote
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Kitchen Renovation Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-center gap-3">
              <Home className="h-10 w-10 text-primary" />
              <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
                Kitchen Renovation Costs
              </h2>
            </div>
            <p className="mt-4 text-muted-foreground">
              The most popular and valuable home renovation project
            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-3">
              <Card className="p-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">$15K-$30K</div>
                  <h3 className="mt-2 font-semibold text-lg">Basic Kitchen</h3>
                </div>
                <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary" />
                    <span>Stock cabinets refaced or replaced</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary" />
                    <span>Laminate or basic quartz countertops</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary" />
                    <span>Standard appliances (mid-range)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary" />
                    <span>Ceramic or vinyl flooring</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary" />
                    <span>Basic lighting fixtures</span>
                  </li>
                </ul>
              </Card>

              <Card className="border-primary p-6 shadow-lg">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">$30K-$60K</div>
                  <h3 className="mt-2 font-semibold text-lg">Mid-Range Kitchen</h3>
                  <div className="mt-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    Most Popular
                  </div>
                </div>
                <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary" />
                    <span>Semi-custom cabinets</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary" />
                    <span>Quality quartz or granite countertops</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary" />
                    <span>Quality appliances (stainless steel)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary" />
                    <span>Hardwood or tile flooring</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary" />
                    <span>Designer fixtures and hardware</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary" />
                    <span>Tile or stone backsplash</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">$60K-$100K+</div>
                  <h3 className="mt-2 font-semibold text-lg">Luxury Kitchen</h3>
                </div>
                <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary" />
                    <span>Custom cabinets with specialty finishes</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary" />
                    <span>Premium stone countertops (marble, soapstone)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary" />
                    <span>High-end appliances (Sub-Zero, Wolf)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary" />
                    <span>Premium hardwood flooring</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary" />
                    <span>Designer lighting and fixtures</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary" />
                    <span>Structural changes and custom features</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Bathroom Renovation Section */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <div className="flex items-center gap-3">
              <Wrench className="h-10 w-10 text-primary" />
              <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
                Bathroom Renovation Costs
              </h2>
            </div>
            <p className="mt-4 text-muted-foreground">
              High-ROI project that improves daily living
            </p>

            <div className="mt-8 grid gap-6 md:grid-cols-3">
              <Card className="p-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">$8K-$15K</div>
                  <h3 className="mt-2 font-semibold text-lg">Basic Refresh</h3>
                </div>
                <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary" />
                    <span>New vanity and toilet</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary" />
                    <span>Tub/shower refinishing or liner</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary" />
                    <span>New flooring (vinyl or ceramic)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary" />
                    <span>Fresh paint and fixtures</span>
                  </li>
                </ul>
              </Card>

              <Card className="border-primary p-6 shadow-lg">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">$15K-$35K</div>
                  <h3 className="mt-2 font-semibold text-lg">Full Renovation</h3>
                  <div className="mt-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                    Best Value
                  </div>
                </div>
                <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary" />
                    <span>Complete plumbing replacement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary" />
                    <span>New tub/shower installation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary" />
                    <span>Quality tile work (walls and floor)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary" />
                    <span>Custom vanity with stone countertop</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary" />
                    <span>Modern lighting and ventilation</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary">$35K-$60K+</div>
                  <h3 className="mt-2 font-semibold text-lg">Luxury Spa Bath</h3>
                </div>
                <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary" />
                    <span>Premium fixtures (Kohler, Delta)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary" />
                    <span>Luxury shower system or soaker tub</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary" />
                    <span>High-end tile and stone work</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary" />
                    <span>Custom cabinetry and storage</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary" />
                    <span>Heated floors and smart features</span>
                  </li>
                </ul>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Other Projects Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center font-serif text-3xl font-bold text-foreground md:text-4xl">
              Other Popular Renovation Projects
            </h2>

            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="p-6">
                <DollarSign className="h-8 w-8 text-primary" />
                <h3 className="mt-4 font-semibold text-lg">Basement Finishing</h3>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Basic:</span>
                    <span className="font-semibold">$25K-$45K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Mid-range:</span>
                    <span className="font-semibold">$45K-$75K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Luxury:</span>
                    <span className="font-semibold">$75K-$150K+</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <Home className="h-8 w-8 text-primary" />
                <h3 className="mt-4 font-semibold text-lg">Home Addition</h3>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Single room:</span>
                    <span className="font-semibold">$50K-$100K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Second story:</span>
                    <span className="font-semibold">$150K-$300K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Per sq ft:</span>
                    <span className="font-semibold">$200-$500/sqft</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <Wrench className="h-8 w-8 text-primary" />
                <h3 className="mt-4 font-semibold text-lg">Deck Installation</h3>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pressure-treated:</span>
                    <span className="font-semibold">$8K-$15K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Composite:</span>
                    <span className="font-semibold">$15K-$30K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cedar/IPE:</span>
                    <span className="font-semibold">$20K-$40K</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <Home className="h-8 w-8 text-primary" />
                <h3 className="mt-4 font-semibold text-lg">Roof Replacement</h3>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Asphalt shingles:</span>
                    <span className="font-semibold">$8K-$15K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Metal roofing:</span>
                    <span className="font-semibold">$15K-$30K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Flat roof:</span>
                    <span className="font-semibold">$10K-$20K</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <Lightbulb className="h-8 w-8 text-primary" />
                <h3 className="mt-4 font-semibold text-lg">Flooring Replacement</h3>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Carpet:</span>
                    <span className="font-semibold">$3-$8/sqft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Laminate:</span>
                    <span className="font-semibold">$4-$10/sqft</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Hardwood:</span>
                    <span className="font-semibold">$8-$15/sqft</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <Wrench className="h-8 w-8 text-primary" />
                <h3 className="mt-4 font-semibold text-lg">HVAC System</h3>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Furnace:</span>
                    <span className="font-semibold">$3K-$6K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">AC unit:</span>
                    <span className="font-semibold">$3K-$7K</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Complete system:</span>
                    <span className="font-semibold">$6K-$12K</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
              Ready to Start Your Renovation?
            </h2>
            <p className="mt-4 text-pretty text-lg text-muted-foreground">
              Get accurate quotes from licensed Toronto contractors. Compare prices, read reviews, and hire with confidence.
            </p>
            <div className="mt-8 rounded-lg bg-background p-6 shadow-sm">
              <div className="flex items-center justify-center gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary">Free</div>
                  <div className="text-sm text-muted-foreground">For homeowners</div>
                </div>
                <div className="h-12 w-px bg-border" />
                <div>
                  <div className="text-3xl font-bold text-primary">Starting at $2.45</div>
                  <div className="text-sm text-muted-foreground">Per contractor quote</div>
                </div>
                <div className="h-12 w-px bg-border" />
                <div>
                  <div className="text-3xl font-bold text-primary">24hrs</div>
                  <div className="text-sm text-muted-foreground">Average response</div>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <Button asChild size="lg">
                <Link href="/signup?role=homeowner">
                  Get Free Renovation Quotes
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <p className="mt-4 text-sm text-muted-foreground">
                No credit card required • 2 minute setup
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
