"use client"
import Link from "next/link"
import { SiteFooter } from "@/components/site-footer"
import { Check } from "lucide-react"
import { usePageTitle } from "@/hooks/use-page-title"

export default function PricingPage() {
  usePageTitle("Pricing")

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
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 text-balance">
              Simple, transparent pricing for Contractors
            </h1>
            <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-2">
              Choose the plan that works best for your business
            </p>
            <p className="text-xl md:text-2xl text-[#e2bb12] font-semibold mb-4">
              Job Postings for Customers — Always Free
            </p>
            <p className="text-base text-gray-300">1 credit = 1 bid</p>
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
                  </div>
                  <p className="text-gray-300">1 bid credit included</p>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-[#328d87] flex-shrink-0 mt-1" />
                    <span className="text-gray-200">1 bid credit (one-time)</span>
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
                    <span className="text-gray-200">Basic profile features</span>
                  </li>
                </ul>

                <Link
                  href="/signup?role=contractor"
                  className="block w-full bg-[#328d87] hover:bg-[#287571] text-white py-3 rounded-lg font-semibold text-center transition-colors"
                >
                  Get Started Free
                </Link>
              </div>

              <div className="bg-[#0d3d42]/70 backdrop-blur-sm rounded-2xl shadow-2xl p-8 border-2 border-[#e2bb12] relative">
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#e2bb12] text-[#03353a] px-4 py-1 rounded-full text-sm font-bold">
                  Best Value
                </div>
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-4">5 Bid Credits</h3>
                  <div className="mb-2">
                    <span className="text-6xl font-bold text-white">$49</span>
                  </div>
                  <p className="text-gray-300">One-time purchase</p>
                </div>

                <ul className="space-y-4 mb-8">
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-[#328d87] flex-shrink-0 mt-1" />
                    <span className="text-gray-200">5 bid credits</span>
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
                    <span className="text-gray-200">Credits never expire</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <Check className="h-5 w-5 text-[#328d87] flex-shrink-0 mt-1" />
                    <span className="text-gray-200">Priority support</span>
                  </li>
                </ul>

                <Link
                  href="/signup?role=contractor"
                  className="block w-full bg-[#e2bb12] hover:bg-[#c9a510] text-[#03353a] py-3 rounded-lg font-semibold text-center transition-colors"
                >
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </section>

        <SiteFooter />
      </div>
    </div>
  )
}
