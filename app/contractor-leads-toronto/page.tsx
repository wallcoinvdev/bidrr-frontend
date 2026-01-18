import type { Metadata } from "next"
import Link from "next/link"
import { CheckCircle2, ArrowRight, DollarSign, Clock, Target, TrendingUp, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Contractor Leads Toronto | $2.45-$9.80 Per Bid | No Monthly Fees - Bidrr",
  description:
    "Get quality contractor leads in Toronto for $2.45-$9.80 per bid. No monthly fees, no contracts. Only pay when you bid. Join contractors winning jobs on Bidrr today.",
  keywords:
    "contractor leads Toronto, home improvement leads, Toronto contractor jobs, affordable contractor leads, pay per lead, GTA contractor leads",
  openGraph: {
    title: "Contractor Leads Toronto | $2.45-$9.80 Per Bid - Bidrr",
    description: "Get quality contractor leads in Toronto. Only pay when you bid. No monthly fees.",
    type: "website",
  },
}

export default function ContractorLeadsTorontoPage() {
  const services = [
    "Plumbing",
    "Electrical",
    "HVAC",
    "Roofing",
    "Deck Construction",
    "Kitchen Renovation",
    "Bathroom Remodeling",
    "Flooring",
    "Painting",
    "Landscaping",
    "Fencing",
    "Drywall",
    "Carpentry",
    "Home Repairs",
    "Insulation",
    "Appliance Installation",
  ]

  const benefits = [
    {
      icon: DollarSign,
      title: "Pay Only When You Bid",
      description: "No monthly subscriptions. Buy 5 credits for $49 and use them when you're ready.",
    },
    {
      icon: Target,
      title: "Choose Your Jobs",
      description: "See full job details before bidding. Only bid on projects that fit your business.",
    },
    {
      icon: Clock,
      title: "Real-Time Opportunities",
      description: "Get notified when Toronto homeowners post jobs in your service area.",
    },
    {
      icon: TrendingUp,
      title: "Grow Your Business",
      description: "Connect directly with homeowners. No middleman, no commission fees.",
    },
  ]

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Hero Section */}
      <section className="border-b bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-balance font-serif text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl">
              Get High-Quality Contractor Leads in Toronto Starting at $2.45 Per Bid
            </h1>
            <p className="mt-6 text-pretty text-lg text-muted-foreground md:text-xl">
              No Monthly Fees. No Contracts. Only Pay When You Bid on Jobs You Want.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/signup?role=contractor">
                  Start Getting Leads Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                <Link href="/pricing">See Pricing Details</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">
              Join contractors in Toronto and the GTA winning jobs on Bidrr
            </p>
          </div>
        </div>
      </section>

      {/* Value Proposition Section */}
      <section className="border-b py-16">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="text-balance font-serif text-3xl font-bold text-foreground md:text-4xl">
              The Most Affordable Way to Get Contractor Leads
            </h2>
            <p className="mt-4 text-pretty text-lg text-muted-foreground">
              Compare Bidrr's pay-per-bid model to other lead services
            </p>
          </div>

          <div className="mt-12 overflow-x-auto">
            <table className="w-full border-collapse rounded-lg border">
              <thead className="bg-muted">
                <tr>
                  <th className="border-b p-4 text-left font-semibold">Feature</th>
                  <th className="border-b p-4 text-left font-semibold text-primary">Bidrr</th>
                  <th className="border-b p-4 text-left font-semibold">Thumbtack</th>
                  <th className="border-b p-4 text-left font-semibold">Bark.com</th>
                  <th className="border-b p-4 text-left font-semibold">HomeStars</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border-b p-4">Cost model</td>
                  <td className="border-b p-4 font-semibold text-primary">Starting at $2.45/bid</td>
                  <td className="border-b p-4">$10-50/lead</td>
                  <td className="border-b p-4">$12-15/lead</td>
                  <td className="border-b p-4">15% commission</td>
                </tr>
                <tr>
                  <td className="border-b p-4">Monthly fees</td>
                  <td className="border-b p-4">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </td>
                  <td className="border-b p-4">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </td>
                  <td className="border-b p-4">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </td>
                  <td className="border-b p-4">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </td>
                </tr>
                <tr>
                  <td className="border-b p-4">See full job details before paying</td>
                  <td className="border-b p-4">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </td>
                  <td className="border-b p-4">
                    <X className="h-5 w-5 text-red-600" />
                  </td>
                  <td className="border-b p-4">
                    <X className="h-5 w-5 text-red-600" />
                  </td>
                  <td className="border-b p-4 text-muted-foreground">Limited</td>
                </tr>
                <tr>
                  <td className="border-b p-4">Pay only when ready to bid</td>
                  <td className="border-b p-4">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </td>
                  <td className="border-b p-4 text-muted-foreground">Pay for leads</td>
                  <td className="border-b p-4 text-muted-foreground">Pay for leads</td>
                  <td className="border-b p-4 text-muted-foreground">Pay after job</td>
                </tr>
                <tr>
                  <td className="p-4">Credits/fees never expire</td>
                  <td className="p-4">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </td>
                  <td className="p-4">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </td>
                  <td className="p-4">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </td>
                  <td className="p-4">
                    <CheckCircle2 className="h-5 w-5 text-green-600" />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-8 rounded-lg bg-primary/5 p-6 text-center">
            <p className="text-lg font-semibold text-foreground">
              Pay up to 80% less per lead compared to Thumbtack and Bark.com
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Example: 20 bids at $2.45 each = $49 vs. Thumbtack at $30/lead average = $600
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-b bg-muted/30 py-16">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="text-balance font-serif text-3xl font-bold text-foreground md:text-4xl">
              How Bidrr Works for Toronto Contractors
            </h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-4">
            <Card className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-2xl font-bold text-primary-foreground">
                1
              </div>
              <h3 className="mb-2 font-semibold text-foreground">Create Free Account</h3>
              <p className="text-sm text-muted-foreground">
                Sign up in minutes. Add your services, service area, and business details.
              </p>
            </Card>

            <Card className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-2xl font-bold text-primary-foreground">
                2
              </div>
              <h3 className="mb-2 font-semibold text-foreground">Buy Credits</h3>
              <p className="text-sm text-muted-foreground">
                Purchase 5 credits for $49. Use them anytime, they never expire.
              </p>
            </Card>

            <Card className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-2xl font-bold text-primary-foreground">
                3
              </div>
              <h3 className="mb-2 font-semibold text-foreground">Browse & Bid</h3>
              <p className="text-sm text-muted-foreground">
                See full job details. Bid only on projects that match your expertise (0.25-1.0 credits per bid).
              </p>
            </Card>

            <Card className="p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-2xl font-bold text-primary-foreground">
                4
              </div>
              <h3 className="mb-2 font-semibold text-foreground">Win Jobs</h3>
              <p className="text-sm text-muted-foreground">
                Connect directly with homeowners. No middleman fees, you keep 100% of what you earn.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="border-b py-16">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="text-balance font-serif text-3xl font-bold text-foreground md:text-4xl">
              Why Toronto Contractors Choose Bidrr
            </h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            {benefits.map((benefit, index) => (
              <div key={index} className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <benefit.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <h3 className="mb-2 font-semibold text-foreground">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground">{benefit.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 space-y-4">
            <Card className="p-6">
              <h3 className="mb-2 font-semibold text-foreground">Transparent Pricing</h3>
              <p className="text-sm text-muted-foreground">
                Our dynamic credit system means you pay less for standard jobs (0.25-0.5 credits) and more for urgent,
                high-value opportunities (1.0 credits). You see the cost before you bid.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="mb-2 font-semibold text-foreground">Pay-Per-Bid, Not Pay-Per-Lead</h3>
              <p className="text-sm text-muted-foreground">
                Unlike Thumbtack or Bark where you pay for every lead (even if you don't want it), Bidrr lets you browse
                all jobs first. Only pay when you decide to bid on a project that fits your business.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="mb-2 font-semibold text-foreground">No Spam or Robo-Calls</h3>
              <p className="text-sm text-muted-foreground">
                Only see jobs in your service area that match your expertise. Communicate directly with homeowners
                through our platform.
              </p>
            </Card>

            <Card className="p-6">
              <h3 className="mb-2 font-semibold text-foreground">Built for Contractors</h3>
              <p className="text-sm text-muted-foreground">
                We understand contractors need flexibility. Credits never expire, no contracts to sign, and you can
                pause anytime without penalty.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="border-b bg-muted/30 py-16">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="text-balance font-serif text-3xl font-bold text-foreground md:text-4xl">
              Home Services Available in Toronto
            </h2>
            <p className="mt-4 text-pretty text-lg text-muted-foreground">
              Browse jobs across dozens of home improvement categories
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-4">
            {services.map((service, index) => (
              <div key={index} className="flex items-center gap-2 rounded-lg bg-background p-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
                <span className="text-sm font-medium text-foreground">{service}</span>
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            ...and over 200 more service categories. View the full list when you create your account.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="border-b py-16">
        <div className="container mx-auto max-w-4xl px-4">
          <div className="text-center">
            <h2 className="text-balance font-serif text-3xl font-bold text-foreground md:text-4xl">
              Frequently Asked Questions
            </h2>
          </div>

          <div className="mt-12 space-y-6">
            <div>
              <h3 className="mb-2 font-semibold text-foreground">How much do contractor leads cost on Bidrr?</h3>
              <p className="text-sm text-muted-foreground">
                Each bid costs between 0.25 and 1.0 credits depending on the job urgency and homeowner verification
                status. With 5 credits costing $49, that's $2.45 to $9.80 per bid. You see the exact cost before
                bidding.
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-foreground">How is Bidrr different from Thumbtack or Bark?</h3>
              <p className="text-sm text-muted-foreground">
                Thumbtack and Bark charge $10-50 per lead, and you pay immediately when matched with a homeowner - even
                if the job isn't a good fit. With Bidrr, you browse all available jobs first, see full details, and only
                pay when you choose to bid. This means you have complete control and only spend on opportunities you
                actually want.
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-foreground">Do I pay monthly fees?</h3>
              <p className="text-sm text-muted-foreground">
                No. There are no monthly subscriptions, no setup fees, and no contracts. You only pay when you buy
                credits, and you only use credits when you bid on jobs.
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-foreground">What types of jobs are available in Toronto?</h3>
              <p className="text-sm text-muted-foreground">
                Homeowners in Toronto and the GTA post jobs across 200+ service categories including plumbing,
                electrical, HVAC, roofing, renovations, landscaping, and more. You choose which jobs match your
                business.
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-foreground">How do I get paid?</h3>
              <p className="text-sm text-muted-foreground">
                You work directly with the homeowner. Bidrr connects you, but payment is handled between you and the
                client. We don't take any commission from your jobs.
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-foreground">Can I choose which jobs to bid on?</h3>
              <p className="text-sm text-muted-foreground">
                Yes. You see the full job description, location, budget range, and urgency before deciding to bid. Only
                bid on projects that fit your schedule, expertise, and pricing.
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-foreground">Do credits expire?</h3>
              <p className="text-sm text-muted-foreground">
                No. Your credits never expire. Buy them when it makes sense for your business and use them whenever
                you're ready.
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-foreground">Is Bidrr only for Toronto?</h3>
              <p className="text-sm text-muted-foreground">
                Currently, we're focused on serving contractors and homeowners in Toronto and the Greater Toronto Area
                (GTA). We're planning to expand to more Canadian cities in 2026.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-balance font-serif text-3xl font-bold md:text-4xl">
            Join Toronto's Contractor Network Today
          </h2>
          <p className="mt-4 text-pretty text-lg opacity-90">
            Stop paying $10-50 per lead. Start bidding on real jobs for $2.45-$9.80 per bid.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
              <Link href="/signup?role=contractor">
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="w-full border-primary-foreground bg-transparent text-primary-foreground hover:bg-primary-foreground/10 sm:w-auto"
            >
              <Link href="/">Learn More About Bidrr</Link>
            </Button>
          </div>
          <p className="mt-6 text-sm opacity-75">No credit card required to create an account</p>
        </div>
      </section>

      {/* Footer with structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            name: "Bidrr Contractor Leads Toronto",
            description: "Get quality contractor leads in Toronto for $2.45-$9.80 per bid. No monthly fees.",
            provider: {
              "@type": "Organization",
              name: "Bidrr",
              url: "https://bidrr.ca",
            },
            areaServed: {
              "@type": "City",
              name: "Toronto",
              containedInPlace: {
                "@type": "Province",
                name: "Ontario",
              },
            },
            offers: {
              "@type": "Offer",
              price: "49",
              priceCurrency: "CAD",
              description: "5 credits for $49, each bid costs 0.25-1.0 credits",
            },
          }),
        }}
      />
    </div>
  )
}
