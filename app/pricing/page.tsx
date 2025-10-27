"use client"

import Link from "next/link"
import Image from "next/image"
import { Check, ArrowLeft } from "lucide-react"

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[#0D3D42]">
      <header className="relative z-50 border-b border-[#d8e2fb]/10 bg-[#0D3D42]/95 backdrop-blur-sm sticky top-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center">
              <Image src="/images/logo-white.png" alt="HomeHero" width={140} height={35} className="h-8 w-auto" />
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

      <main className="py-20 sm:py-28 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
          <div className="text-center mb-16">
            <div className="inline-block px-4 py-2 bg-[#e2bb12]/20 border border-[#e2bb12]/30 rounded-full mb-6">
              <span className="text-[#e2bb12] font-semibold text-sm">Currently in Beta</span>
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
            {/* Beta Free Tier */}
            <div className="bg-[#03353a] border-2 border-[#e2bb12] rounded-2xl p-8 relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                <span className="bg-[#e2bb12] text-[#0D3D42] px-4 py-1 rounded-full text-sm font-semibold">
                  Active Now
                </span>
              </div>
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-[#d8e2fb] mb-2">Beta Access</h3>
                <div className="flex items-baseline justify-center gap-2 mb-4">
                  <span className="text-5xl font-bold text-[#d8e2fb]">Free</span>
                </div>
                <p className="text-[#d8e2fb]/70">Limited time beta offer</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#e2bb12] flex-shrink-0 mt-0.5" />
                  <span className="text-[#d8e2fb]">
                    <strong>5 free bids per month</strong>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#e2bb12] flex-shrink-0 mt-0.5" />
                  <span className="text-[#d8e2fb]">Access to all job postings</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#e2bb12] flex-shrink-0 mt-0.5" />
                  <span className="text-[#d8e2fb]">Customer response messaging</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#e2bb12] flex-shrink-0 mt-0.5" />
                  <span className="text-[#d8e2fb]">Access to Customer Reviews</span>
                </li>
              </ul>

              <Link
                href="/signup"
                className="block w-full px-6 py-3 bg-[#e2bb12] text-[#0D3D42] rounded-lg font-semibold text-center hover:opacity-90 transition-all"
              >
                Get Started Free
              </Link>
            </div>

            {/* Pro Tier (Coming Soon) */}
            <div className="bg-[#03353a] border-2 border-[#d8e2fb]/20 rounded-2xl p-8">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-[#d8e2fb] mb-2">Pro</h3>
                <div className="flex items-baseline justify-center gap-2 mb-4">
                  <span className="text-5xl font-bold text-[#d8e2fb]">$99</span>
                  <span className="text-[#d8e2fb]/70">/month</span>
                </div>
                <p className="text-[#d8e2fb]/70">Coming soon after beta</p>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#328d87] flex-shrink-0 mt-0.5" />
                  <span className="text-[#d8e2fb]">
                    <strong>Everything from Beta</strong>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#328d87] flex-shrink-0 mt-0.5" />
                  <span className="text-[#d8e2fb]">
                    <strong>5 bids per month</strong>
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#328d87] flex-shrink-0 mt-0.5" />
                  <span className="text-[#d8e2fb]">Bids refunded if job not secured</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#328d87] flex-shrink-0 mt-0.5" />
                  <span className="text-[#d8e2fb]">Verified Badge</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#328d87] flex-shrink-0 mt-0.5" />
                  <span className="text-[#d8e2fb]">Dedicated support</span>
                </li>
              </ul>

              <button
                disabled
                className="w-full px-6 py-3 bg-[#d8e2fb]/10 text-[#d8e2fb]/50 rounded-lg font-semibold cursor-not-allowed"
              >
                Coming Soon
              </button>
            </div>
          </div>

          {/* Future Free Tier Info */}
          <div className="mt-16 max-w-3xl mx-auto">
            <div className="bg-[#03353a]/50 border border-[#d8e2fb]/20 rounded-2xl p-8">
              <h3 className="text-2xl font-bold text-[#d8e2fb] mb-4 text-center">After Beta: Free Tier</h3>
              <p className="text-[#d8e2fb]/70 text-center mb-6">
                When the subscription model launches, we'll continue to offer a free tier:
              </p>
              <ul className="space-y-3 max-w-md mx-auto">
                <li className="flex items-start gap-3">
                  <Check className="h-5 w-5 text-[#328d87] flex-shrink-0 mt-0.5" />
                  <span className="text-[#d8e2fb]">1 bid per month</span>
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
        </div>
      </main>

      <footer className="border-t border-[#d8e2fb]/10 bg-[#0D3D42] py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center">
              <Image src="/images/logo-white.png" alt="HomeHero" width={120} height={30} className="h-7 w-auto" />
            </div>
            <div className="flex items-center gap-8">
              <Link href="#" className="text-sm text-[#d8e2fb]/70 hover:text-[#d8e2fb] transition-colors">
                Privacy
              </Link>
              <Link href="#" className="text-sm text-[#d8e2fb]/70 hover:text-[#d8e2fb] transition-colors">
                Terms
              </Link>
              <Link href="#" className="text-sm text-[#d8e2fb]/70 hover:text-[#d8e2fb] transition-colors">
                Help
              </Link>
            </div>
            <p className="text-sm text-[#d8e2fb]/60">© 2025 HomeHero. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
