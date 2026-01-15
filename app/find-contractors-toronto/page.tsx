import type { Metadata } from "next"
import Link from "next/link"
import { CheckCircle2, ArrowRight, Shield, Clock, Users, Star, DollarSign, MessageSquare } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Find Contractors Toronto | Get Multiple Bids Free | Licensed & Verified - Bidrr",
  description:
    "Find licensed contractors in Toronto and the GTA. Post your project free, receive 3-5 competitive bids from verified local contractors. Compare quotes and hire with confidence.",
  keywords:
    "find contractors Toronto, home renovation Toronto, licensed contractors, contractor quotes, Toronto home improvement, GTA contractors",
  openGraph: {
    title: "Find Contractors Toronto | Get Multiple Bids Free - Bidrr",
    description: "Post your project free. Get 3-5 bids from verified Toronto contractors. Compare and hire.",
    type: "website",
  },
}

export default function FindContractorsTorontoPage() {
  const popularServices = [
    { name: "Kitchen Renovation", icon: "🔨" },
    { name: "Bathroom Remodeling", icon: "🚿" },
    { name: "Deck Installation", icon: "🪵" },
    { name: "Roofing & Siding", icon: "🏠" },
    { name: "HVAC Services", icon: "❄️" },
    { name: "Electrical Work", icon: "⚡" },
    { name: "Plumbing", icon: "🔧" },
    { name: "Flooring", icon: "📐" },
    { name: "Painting", icon: "🎨" },
    { name: "Landscaping", icon: "🌳" },
    { name: "Fencing", icon: "🪜" },
    { name: "Home Repairs", icon: "🔨" },
  ]

  const benefits = [
    {
      icon: DollarSign,
      title: "100% Free for Homeowners",
      description: "Post your project and receive bids at no cost. No hidden fees, no credit card required.",
    },
    {
      icon: Shield,
      title: "Verified Contractors",
      description:
        "All contractors verify their contact information. Read reviews and check credentials before hiring.",
    },
    {
      icon: Users,
      title: "Multiple Competitive Bids",
      description: "Receive 3-5 quotes from local contractors. Compare prices, timelines, and expertise side-by-side.",
    },
    {
      icon: MessageSquare,
      title: "Direct Communication",
      description: "Message contractors directly through our platform. No spam or robo-calls from third parties.",
    },
  ]

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Hero Section */}
      <section className="border-b bg-gradient-to-b from-muted/50 to-background">
        <div className="container mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-balance font-serif text-4xl font-bold leading-tight text-foreground md:text-5xl lg:text-6xl">
              Find Licensed Contractors in Toronto - Get Multiple Bids Free
            </h1>
            <p className="mt-6 text-pretty text-lg text-muted-foreground md:text-xl">
              Post your project in 2 minutes. Receive 3-5 competitive bids from verified local contractors in Toronto
              and the GTA.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="w-full sm:w-auto">
                <Link href="/signup/homeowner">
                  Post Your Project Free
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="w-full sm:w-auto bg-transparent">
                <Link href="/">How It Works</Link>
              </Button>
            </div>
            <p className="mt-4 text-sm text-muted-foreground">No credit card required • 2 minute setup</p>
          </div>

          {/* Trust Signals */}
          <div className="mx-auto mt-12 grid max-w-4xl gap-6 text-center md:grid-cols-3">
            <div>
              <div className="text-3xl font-bold text-foreground">100%</div>
              <div className="mt-1 text-sm text-muted-foreground">Free for Homeowners</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground">Phone Verified</div>
              <div className="mt-1 text-sm text-muted-foreground">Contractors</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-foreground">3-5</div>
              <div className="mt-1 text-sm text-muted-foreground">Competitive Bids</div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Services */}
      <section className="border-b py-16">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="text-balance font-serif text-3xl font-bold text-foreground md:text-4xl">
              Popular Home Services in Toronto
            </h2>
            <p className="mt-4 text-pretty text-lg text-muted-foreground">
              Whatever your home improvement project, we connect you with the right contractors
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {popularServices.map((service, index) => (
              <Card key={index} className="flex items-center gap-3 p-4 transition-shadow hover:shadow-md">
                <span className="text-2xl">{service.icon}</span>
                <span className="text-sm font-medium text-foreground">{service.name}</span>
              </Card>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            ...and over 200 more service categories available
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-b bg-muted/30 py-16">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="text-balance font-serif text-3xl font-bold text-foreground md:text-4xl">
              How Bidrr Works for Toronto Homeowners
            </h2>
            <p className="mt-4 text-pretty text-lg text-muted-foreground">Get competitive bids in four simple steps</p>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-4">
            <div className="relative">
              <Card className="h-full p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-2xl font-bold text-primary-foreground">
                  1
                </div>
                <h3 className="mb-2 font-semibold text-foreground">Post Your Project</h3>
                <p className="text-sm text-muted-foreground">
                  Describe your project in 2 minutes. Include photos, timeline, and budget range.
                </p>
              </Card>
            </div>

            <div className="relative">
              <Card className="h-full p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-2xl font-bold text-primary-foreground">
                  2
                </div>
                <h3 className="mb-2 font-semibold text-foreground">Receive Bids</h3>
                <p className="text-sm text-muted-foreground">
                  Get 3-5 detailed quotes from verified local contractors within hours or days.
                </p>
              </Card>
            </div>

            <div className="relative">
              <Card className="h-full p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-2xl font-bold text-primary-foreground">
                  3
                </div>
                <h3 className="mb-2 font-semibold text-foreground">Compare & Message</h3>
                <p className="text-sm text-muted-foreground">
                  Review bids side-by-side. Message contractors to ask questions and discuss details.
                </p>
              </Card>
            </div>

            <div className="relative">
              <Card className="h-full p-6">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-2xl font-bold text-primary-foreground">
                  4
                </div>
                <h3 className="mb-2 font-semibold text-foreground">Hire with Confidence</h3>
                <p className="text-sm text-muted-foreground">
                  Choose the best contractor for your budget and timeline. Get your project done right.
                </p>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Bidrr */}
      <section className="border-b py-16">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="text-balance font-serif text-3xl font-bold text-foreground md:text-4xl">
              Why Toronto Homeowners Choose Bidrr
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

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <div className="mb-3 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Fast Responses</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Most homeowners receive their first bid within hours. Contractors compete for your business, so you get
                quick responses and competitive pricing.
              </p>
            </Card>

            <Card className="p-6">
              <div className="mb-3 flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                <h3 className="font-semibold text-foreground">Quality Contractors</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                All contractors verify their contact information. Review their profiles, read feedback from other
                homeowners, and make an informed decision.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Toronto Coverage */}
      <section className="border-b bg-muted/30 py-16">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="text-balance font-serif text-3xl font-bold text-foreground md:text-4xl">
              Serving All of Toronto and the GTA
            </h2>
            <p className="mt-4 text-pretty text-lg text-muted-foreground">
              Connect with contractors familiar with Toronto building codes and local requirements
            </p>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3">
            {[
              "Downtown Toronto",
              "North York",
              "Scarborough",
              "Etobicoke",
              "East York",
              "York",
              "Mississauga",
              "Brampton",
              "Vaughan",
              "Markham",
              "Richmond Hill",
              "Oakville",
            ].map((area, index) => (
              <div key={index} className="flex items-center gap-2 rounded-lg bg-background p-3">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
                <span className="text-sm font-medium text-foreground">{area}</span>
              </div>
            ))}
          </div>
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
              <h3 className="mb-2 font-semibold text-foreground">Is Bidrr really free for homeowners?</h3>
              <p className="text-sm text-muted-foreground">
                Yes, completely free. You can post unlimited projects, receive bids, message contractors, and hire—all
                without paying anything. Contractors pay a small fee to bid on your project, which keeps our platform
                free for you.
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-foreground">How many bids will I receive?</h3>
              <p className="text-sm text-muted-foreground">
                Most homeowners receive 3-5 bids within 24-48 hours of posting. The number varies based on your project
                type, location, and timing. More complex projects may take longer but typically attract quality
                contractors.
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-foreground">Are contractors verified?</h3>
              <p className="text-sm text-muted-foreground">
                All contractors verify their phone numbers when they join. You can review their profiles, see their
                service areas, and message them to ask about licensing, insurance, and credentials specific to your
                project.
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-foreground">How long does it take to get bids?</h3>
              <p className="text-sm text-muted-foreground">
                Response times vary by project complexity and contractor availability. Simple jobs like plumbing repairs
                may get bids within hours. Larger renovations like kitchen remodels typically receive bids within 1-3
                days.
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-foreground">What if I don't like any bids?</h3>
              <p className="text-sm text-muted-foreground">
                You're under no obligation to hire anyone. If the bids don't meet your expectations, you can message
                contractors to negotiate, adjust your project details and repost, or simply let the bids expire.
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-foreground">Do contractors know my budget?</h3>
              <p className="text-sm text-muted-foreground">
                You choose whether to share your budget range. Many homeowners prefer to share it to receive more
                accurate bids. Others prefer to keep it private and let contractors provide quotes based on the project
                scope.
              </p>
            </div>

            <div>
              <h3 className="mb-2 font-semibold text-foreground">How does payment work?</h3>
              <p className="text-sm text-muted-foreground">
                Payment is arranged directly between you and the contractor you hire. Bidrr connects you but doesn't
                handle payments. Discuss payment terms, schedules, and methods with your chosen contractor before work
                begins.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-primary py-16 text-primary-foreground">
        <div className="container mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-balance font-serif text-3xl font-bold md:text-4xl">
            Ready to Start Your Toronto Home Project?
          </h2>
          <p className="mt-4 text-pretty text-lg opacity-90">
            Post your project free and get 3-5 competitive bids from local contractors today.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Button asChild size="lg" variant="secondary" className="w-full sm:w-auto">
              <Link href="/signup/homeowner">
                Post Your Project Free
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
          <p className="mt-6 text-sm opacity-75">Takes 2 minutes • No credit card required</p>
        </div>
      </section>

      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Find Contractors Toronto - Bidrr",
            description: "Find licensed contractors in Toronto. Get multiple bids free.",
            provider: {
              "@type": "Organization",
              name: "Bidrr",
              url: "https://bidrr.ca",
            },
            areaServed: [
              {
                "@type": "City",
                name: "Toronto",
              },
              {
                "@type": "Place",
                name: "Greater Toronto Area",
              },
            ],
          }),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Is Bidrr really free for homeowners?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, completely free. You can post unlimited projects, receive bids, message contractors, and hire—all without paying anything.",
                },
              },
              {
                "@type": "Question",
                name: "How many bids will I receive?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Most homeowners receive 3-5 bids within 24-48 hours of posting.",
                },
              },
              {
                "@type": "Question",
                name: "Are contractors verified?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "All contractors verify their phone numbers when they join. You can review their profiles and message them about licensing and insurance.",
                },
              },
            ],
          }),
        }}
      />
    </div>
  )
}
