import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import Link from "next/link"
import { ArrowRight, CheckCircle2, DollarSign, Wrench, Clock, AlertCircle } from "lucide-react"

export const metadata = {
  title: "Toronto Plumbing Cost Guide 2026 | Average Prices & What to Expect",
  description: "Complete guide to plumbing costs in Toronto and GTA. Learn average prices for common repairs, installations, and emergency services. Get multiple quotes starting at $2.45.",
  keywords: "plumbing cost Toronto, plumber prices Toronto, how much does plumber cost, Toronto plumbing rates, GTA plumber cost, plumbing repair prices",
}

export default function TorontoPlumbingCostGuide() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="bg-gradient-to-b from-primary/5 to-background py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-balance font-serif text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl">
              Toronto Plumbing Cost Guide 2026
            </h1>
            <p className="mt-6 text-pretty text-lg text-muted-foreground md:text-xl">
              Complete pricing guide for plumbing services in Toronto and the GTA. Learn average costs, get money-saving tips, and connect with licensed plumbers.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/signup?role=homeowner">
                  Get Plumber Quotes Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <p className="text-sm text-muted-foreground">
                Compare quotes from multiple licensed plumbers • Starting at $2.45 per contractor
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Average Costs Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center font-serif text-3xl font-bold text-foreground md:text-4xl">
              Average Plumbing Costs in Toronto
            </h2>
            <p className="mt-4 text-center text-muted-foreground">
              Typical price ranges for common plumbing services in the GTA (2026)
            </p>

            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Common Services */}
              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <Wrench className="h-8 w-8 text-primary" />
                  <h3 className="font-semibold text-lg">Drain Cleaning</h3>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Simple clog:</span>
                    <span className="font-semibold">$150-$300</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Main line:</span>
                    <span className="font-semibold">$350-$800</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Camera inspection:</span>
                    <span className="font-semibold">$200-$500</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-8 w-8 text-primary" />
                  <h3 className="font-semibold text-lg">Faucet & Fixture</h3>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Faucet repair:</span>
                    <span className="font-semibold">$120-$250</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Faucet install:</span>
                    <span className="font-semibold">$180-$400</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Toilet install:</span>
                    <span className="font-semibold">$250-$600</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <Clock className="h-8 w-8 text-primary" />
                  <h3 className="font-semibold text-lg">Water Heater</h3>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Repair:</span>
                    <span className="font-semibold">$200-$500</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tank install:</span>
                    <span className="font-semibold">$1,200-$2,500</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Tankless install:</span>
                    <span className="font-semibold">$2,500-$5,000</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-8 w-8 text-primary" />
                  <h3 className="font-semibold text-lg">Pipe Repairs</h3>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Small leak fix:</span>
                    <span className="font-semibold">$150-$350</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pipe section:</span>
                    <span className="font-semibold">$400-$1,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Repiping (full):</span>
                    <span className="font-semibold">$4,000-$15,000</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <Wrench className="h-8 w-8 text-primary" />
                  <h3 className="font-semibold text-lg">Emergency Service</h3>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">After hours:</span>
                    <span className="font-semibold">+$100-$200</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Weekend:</span>
                    <span className="font-semibold">+$75-$150</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Holiday:</span>
                    <span className="font-semibold">+$150-$300</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3">
                  <DollarSign className="h-8 w-8 text-primary" />
                  <h3 className="font-semibold text-lg">Bathroom Reno</h3>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Basic plumbing:</span>
                    <span className="font-semibold">$1,500-$3,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Full renovation:</span>
                    <span className="font-semibold">$3,000-$8,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Luxury upgrade:</span>
                    <span className="font-semibold">$8,000-$20,000</span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Cost Factors Section */}
      <section className="bg-muted/30 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-center font-serif text-3xl font-bold text-foreground md:text-4xl">
              What Affects Plumbing Costs in Toronto?
            </h2>
            
            <div className="mt-12 space-y-6">
              <Card className="p-6">
                <h3 className="flex items-center gap-2 font-semibold text-lg">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Time of Service
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Emergency and after-hours calls cost 25-50% more. Schedule during regular business hours (Monday-Friday, 8am-5pm) to save money.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="flex items-center gap-2 font-semibold text-lg">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Job Complexity
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Simple repairs cost less than installations. Accessing hard-to-reach pipes (behind walls, under concrete) increases labor costs significantly.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="flex items-center gap-2 font-semibold text-lg">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Materials & Parts
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Basic fixtures are cheaper than premium brands. Copper pipes cost more than PEX. Ask for material options to fit your budget.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="flex items-center gap-2 font-semibold text-lg">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Toronto Building Codes
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Major work requires permits ($50-$500). Plumbers must follow Ontario Building Code standards, which may add costs but ensure safety.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="flex items-center gap-2 font-semibold text-lg">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Plumber Experience Level
                </h3>
                <p className="mt-2 text-muted-foreground">
                  Licensed master plumbers charge $80-$150/hour. Apprentices charge less but work slower. Choose based on job complexity.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Money Saving Tips */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-center font-serif text-3xl font-bold text-foreground md:text-4xl">
              How to Save Money on Plumbing in Toronto
            </h2>

            <div className="mt-12 grid gap-6 md:grid-cols-2">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <span className="font-bold text-primary">1</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Get Multiple Quotes</h3>
                  <p className="mt-2 text-muted-foreground">
                    Compare at least 3 plumbers. Prices can vary by 30-50% for the same job. Use Bidrr to get multiple quotes starting at $2.45.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <span className="font-bold text-primary">2</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Schedule Smart</h3>
                  <p className="mt-2 text-muted-foreground">
                    Avoid weekends, holidays, and after-hours unless it's an emergency. Regular hours save 25-50% on labor costs.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <span className="font-bold text-primary">3</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Bundle Multiple Jobs</h3>
                  <p className="mt-2 text-muted-foreground">
                    Fix multiple issues in one visit. Many plumbers offer discounts for larger projects and waive trip charges.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <span className="font-bold text-primary">4</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Consider Repair vs Replace</h3>
                  <p className="mt-2 text-muted-foreground">
                    Sometimes repairs cost almost as much as replacement. Ask your plumber for both options and long-term costs.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <span className="font-bold text-primary">5</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Prep the Work Area</h3>
                  <p className="mt-2 text-muted-foreground">
                    Clear space around the work area. Easy access reduces labor time and costs. Remove items from under sinks yourself.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <span className="font-bold text-primary">6</span>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Maintain Preventively</h3>
                  <p className="mt-2 text-muted-foreground">
                    Regular maintenance prevents expensive emergencies. Annual inspections ($100-$200) catch problems early.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary/5 py-16">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
              Ready to Get Accurate Plumbing Quotes?
            </h2>
            <p className="mt-4 text-pretty text-lg text-muted-foreground">
              Post your plumbing job on Bidrr and receive multiple quotes from licensed Toronto plumbers. Compare prices, read reviews, and hire with confidence.
            </p>
            <div className="mt-8 rounded-lg bg-background p-6 shadow-sm">
              <div className="flex items-center justify-center gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary">Free</div>
                  <div className="text-sm text-muted-foreground">For homeowners</div>
                </div>
                <div className="h-12 w-px bg-border" />
                <div>
                  <div className="text-3xl font-bold text-primary">2 min</div>
                  <div className="text-sm text-muted-foreground">Post your job</div>
                </div>
                <div className="h-12 w-px bg-border" />
                <div>
                  <div className="text-3xl font-bold text-primary">3-5</div>
                  <div className="text-sm text-muted-foreground">Plumber quotes</div>
                </div>
              </div>
            </div>
            <div className="mt-8">
              <Button asChild size="lg">
                <Link href="/signup?role=homeowner">
                  Get Free Plumber Quotes
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <p className="mt-4 text-sm text-muted-foreground">
                Join hundreds of Toronto homeowners who saved money comparing quotes
              </p>
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
                <h3 className="font-semibold text-lg">How much does a plumber charge per hour in Toronto?</h3>
                <p className="mt-2 text-muted-foreground">
                  Licensed plumbers in Toronto typically charge $80-$150 per hour depending on experience and specialization. Emergency service adds $50-$100 per hour.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold text-lg">Do I need a permit for plumbing work in Toronto?</h3>
                <p className="mt-2 text-muted-foreground">
                  Major installations (water heaters, repiping, bathroom additions) require permits. Simple repairs usually don't. Licensed plumbers handle permit applications.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold text-lg">How can I verify a plumber is licensed in Ontario?</h3>
                <p className="mt-2 text-muted-foreground">
                  Check the Ontario College of Trades website for license verification. Ask for their license number and proof of liability insurance before hiring.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold text-lg">What's included in a plumbing quote?</h3>
                <p className="mt-2 text-muted-foreground">
                  A detailed quote should include labor, materials, permits, disposal fees, and warranty information. Always get written quotes before work begins.
                </p>
              </Card>

              <Card className="p-6">
                <h3 className="font-semibold text-lg">How much does Bidrr cost to use?</h3>
                <p className="mt-2 text-muted-foreground">
                  Bidrr is 100% free for homeowners. There are no hidden fees. Plumbers pay a small fee (starting at $2.45) to bid on your project.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
