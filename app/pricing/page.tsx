"use client"

import Link from "next/link"
import Image from "next/image"
import { Check, ArrowLeft } from "lucide-react"
import { SiteFooter } from "@/components/site-footer"

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0D3D42] flex flex-col">
      <header className="relative z-50 border-b border-[#d8e2fb]/10 bg-[#0D3D42]/95 backdrop-blur-sm sticky top-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <Image src="/images/bidrr-white-logo.png" alt="HomeHero" width={140} height={35} className="h-8 w-auto" />
            </Link>
            <Link
              href="/"
              className="text-sm font-medium text-[#d8e2fb] hover:text-white transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>
          </div>
        </div>
      </header>

      <main className="py-20 sm:py-28 lg:py-32 flex-1">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-[#e2bb12]/20 border border-[#e2bb12]/30 rounded-full mb-6">
              <span className="text-[#e2bb12] font-semibold text-sm">Beta Ending Soon</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 text-[#d8e2fb]">
              Simple, transparent pricing for Contractors
            </h1>
            <p className="text-lg sm:text-xl text-[#d8e2fb]/70 max-w-2xl mx-auto mb-4">
              Choose the plan that works best for your business
            </p>
            <p className="text-xl sm:text-2xl font-semibold text-[#e2bb12]">Job Postings for Customers — Always Free</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-[#03353a] border-2 border-[#d8e2fb]/20 rounded-2xl p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-[#d8e2fb] mb-2">Free</h3>
                <div className="flex items-baseline justify-center gap-2 mb-4">
                  <span className="text-5xl font-bold text-[#d8e2fb]">$0</span>
                  <span className="text-[#d8e2fb]/70">/month</span>
                </div>
                <p className="text-[#d8e2fb]/70">Always free</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#328d87] flex-shrink-0 mt-0.5" />
                  <span className="text-[#d8e2fb]">
                    <strong>1 bid per month</strong>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#328d87] flex-shrink-0 mt-0.5" />
                  <span className="text-[#d8e2fb]">Access to all job postings</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#328d87] flex-shrink-0 mt-0.5" />
                  <span className="text-[#d8e2fb]">Customer response messaging</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#328d87] flex-shrink-0 mt-0.5" />
                  <span className="text-[#d8e2fb]">No refunds on unused bids</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#328d87] flex-shrink-0 mt-0.5" />
                  <span className="text-[#d8e2fb]">Basic profile features</span>
                </li>
              </ul>

              <button
                disabled
                className="block w-full px-6 py-3 bg-[#328d87]/30 text-[#d8e2fb]/50 rounded-lg font-semibold text-center cursor-not-allowed"
              >
                Coming Soon
              </button>
            </div>

            {/* Pro Tier */}
            <div className="bg-[#03353a] border-2 border-[#e2bb12] rounded-2xl p-8 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-[#e2bb12] text-[#0D3D42] px-4 py-1 rounded-full text-sm font-semibold">
                  Most Popular
                </span>
              </div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-[#d8e2fb] mb-2">Pro</h3>
                <div className="flex items-baseline justify-center gap-2 mb-4">
                  <span className="text-5xl font-bold text-[#d8e2fb]">$99</span>
                  <span className="text-[#d8e2fb]/70">/month</span>
                </div>
                <p className="text-[#d8e2fb]/70">Perfect for growing businesses</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#e2bb12] flex-shrink-0 mt-0.5" />
                  <span className="text-[#d8e2fb]">
                    <strong>Everything from Free</strong>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#e2bb12] flex-shrink-0 mt-0.5" />
                  <span className="text-[#d8e2fb]">
                    <strong>5 bids per month</strong>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#e2bb12] flex-shrink-0 mt-0.5" />
                  <span className="text-[#d8e2fb]">Bids refunded if job not secured</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#e2bb12] flex-shrink-0 mt-0.5" />
                  <span className="text-[#d8e2fb]">Verified Badges</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#e2bb12] flex-shrink-0 mt-0.5" />
                  <span className="text-[#d8e2fb]">Dedicated support</span>
                </li>
              </ul>

              <button
                disabled
                className="block w-full px-6 py-3 bg-[#e2bb12]/30 text-[#0D3D42]/50 rounded-lg font-semibold text-center cursor-not-allowed"
              >
                Coming Soon
              </button>
            </div>
          </div>

          {/* Why We Refund Bids */}
          <div className="mt-16 text-center max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-[#d8e2fb] mb-4">We want contractors to get jobs</h3>
            <p className="text-lg text-[#d8e2fb]/70 leading-relaxed">
              That's why we refund bids when you don't secure the job. We're invested in your success, not just
              collecting fees. Our platform works when you work.
            </p>
          </div>

          {/* Beta access card */}
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="bg-[#e2bb12]/10 border-2 border-[#e2bb12] rounded-2xl p-8 text-center">
              <div className="inline-block px-4 py-2 bg-[#e2bb12] rounded-full mb-6">
                <span className="text-[#0D3D42] font-bold text-sm">BETA ACCESS</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-[#d8e2fb] mb-4">
                Currently in Beta — All Pro Features Free
              </h3>
              <div className="space-y-3 text-lg text-[#d8e2fb]/80 mb-6">
                <p>
                  During our Beta phase, all contractors get{" "}
                  <strong className="text-[#e2bb12]">all Pro features</strong> at no cost.
                </p>
                <p>
                  Your feedback is invaluable as we refine our platform. Help us deliver a service that truly works for
                  you — because when you succeed, we succeed.
                </p>
              </div>
              <p className="text-sm text-[#d8e2fb]/60 italic">Pricing plans will take effect after Beta ends.</p>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
