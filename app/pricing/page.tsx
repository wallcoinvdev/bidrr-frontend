import Link from "next/link"
import { SiteFooter } from "@/components/site-footer"
import { Check } from 'lucide-react'

export default function PricingPage() {
  return (
    <div className="min-h-screen relative">
      {/* Background Image with Teal Overlay */}
      <div className="fixed inset-0 z-0">
        <img src="/living-room-background.jpg" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#03353a]/95 via-[#0d3d42]/90 to-[#328d87]/85" />
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="bg-[#03353a]/80 backdrop-blur-sm shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4">
            <div className="flex justify-between items-center">
              <Link href="/" className="flex items-center">
                <img src="/images/bidrr-white-logo.png" alt="Bidrr" className="h-8 md:h-10 w-auto" />
              </Link>

              <Link href="/" className="flex items-center text-sm text-gray-300 hover:text-white transition-colors">
                ← Back to Home
              </Link>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section className="py-16 md:py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="inline-block bg-[#e2bb12] text-[#03353a] px-4 py-1.5 rounded-full text-sm font-bold mb-6">
              Beta Ending Soon
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 text-balance">
              Simple, transparent pricing for Contractors
            </h1>
            <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-2">
              Choose the plan that works best for your business
            </p>
            <p className="text-xl md:text-2xl text-[#e2bb12] font-semibold">Job Postings for Customers — Always Free</p>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="pb-16 md:pb-20">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-md mx-auto md:max-w-none">
              {/* Free Plan */}
              <div className="bg-[#0d3d42]/70 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border border-[#328d87]/30">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-4">Free</h3>
                  <div className="mb-2">
                    <span className="text-6xl font-bold text-white">$0</span>
                    <span className="text-gray-300 text-lg ml-2">/month</span>
                  </div>
                  <p className="text-gray-300">Always free</p>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-[#328d87] flex-shrink-0 mt-1" />
                    <span className="text-gray-200">1 bid per month</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-[#328d87] flex-shrink-0 mt-1" />
                    <span className="text-gray-200">Access to all job postings</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-[#328d87] flex-shrink-0 mt-1" />
                    <span className="text-gray-200">Customer response messaging</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-[#328d87] flex-shrink-0 mt-1" />
                    <span className="text-gray-200">No refunds on unused bids</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-[#328d87] flex-shrink-0 mt-1" />
                    <span className="text-gray-200">Basic profile features</span>
                  </li>
                </ul>

                <button
                  disabled
                  className="block w-full bg-[#0d3d42] text-gray-400 py-3 rounded-lg font-semibold text-center border border-[#328d87]/30 cursor-not-allowed"
                >
                  Coming Soon
                </button>
              </div>

              {/* Pro Plan */}
              <div className="bg-[#0d3d42]/70 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border-2 border-[#e2bb12] relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#e2bb12] text-[#03353a] px-4 py-1 rounded-full text-sm font-bold">
                  Most Popular
                </div>
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-4">Pro</h3>
                  <div className="mb-2">
                    <span className="text-6xl font-bold text-white">$99</span>
                    <span className="text-gray-300 text-lg ml-2">/month</span>
                  </div>
                  <p className="text-gray-300">Perfect for growing businesses</p>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-[#328d87] flex-shrink-0 mt-1" />
                    <span className="text-gray-200">Everything from Free</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-[#328d87] flex-shrink-0 mt-1" />
                    <span className="text-gray-200">5 bids per month</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-[#328d87] flex-shrink-0 mt-1" />
                    <span className="text-gray-200">Bids refunded if job not secured</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-[#328d87] flex-shrink-0 mt-1" />
                    <span className="text-gray-200">Verified Badges</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-[#328d87] flex-shrink-0 mt-1" />
                    <span className="text-gray-200">Dedicated support</span>
                  </li>
                </ul>

                <button
                  disabled
                  className="block w-full bg-[#7a9a3a]/50 text-gray-300 py-3 rounded-lg font-semibold text-center cursor-not-allowed"
                >
                  Coming Soon
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Value Proposition */}
        <section className="py-16 md:py-20 bg-transparent">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">We want contractors to get jobs</h2>
            <p className="text-lg md:text-xl text-gray-200 leading-relaxed mb-12">
              That's why we refund bids when you don't secure the job. We're invested in your success, not just
              collecting fees. Our platform works when you work.
            </p>

            <div className="bg-[#0d3d42]/70 backdrop-blur-sm border-2 border-[#e2bb12] rounded-2xl p-8 md:p-10">
              <div className="inline-block bg-[#e2bb12] text-[#03353a] px-4 py-1.5 rounded-full text-sm font-bold mb-6">
                BETA ACCESS
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-white mb-4">
                Currently in Beta — All Pro Features Free
              </h3>
              <p className="text-lg text-gray-200 mb-4">
                During our Beta phase, all contractors get{" "}
                <span className="text-[#e2bb12] font-bold">all Pro features</span> at no cost.
              </p>
              <p className="text-base text-gray-300 leading-relaxed">
                Your feedback is invaluable as we refine our platform. Help us deliver a service that truly works for
                you — because when you succeed, we succeed.
              </p>
              <p className="text-sm text-gray-400 italic mt-6">Pricing plans will take effect after Beta ends.</p>
            </div>
          </div>
        </section>

        <SiteFooter />
      </div>
    </div>
  )
}
