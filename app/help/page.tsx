"use client"

import Link from "next/link"
import { ChevronDown, ArrowLeft } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function HelpPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  const handleBackToDashboard = () => {
    if (user?.role === "admin") {
      router.push("/dashboard/admin")
    } else if (user?.role === "contractor") {
      router.push("/contractor/dashboard")
    } else if (user?.role === "homeowner") {
      router.push("/homeowner/dashboard")
    } else {
      router.back()
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img src="/images/bidrr-dark-teal-logo.png" alt="Bidrr" className="h-8" />
          </Link>
          <nav className="flex items-center gap-6">
            {user ? (
              <button
                onClick={handleBackToDashboard}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </button>
            ) : (
              <>
                <Link href="/login" className="text-gray-600 hover:text-gray-900 transition-colors">
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="bg-[#328d87] hover:bg-[#2d7f7a] text-white font-semibold px-6 py-2 rounded-full transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#0d3d42] to-[#328d87] py-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">How can we help you?</h1>
          <p className="text-xl text-white/90 mb-8">Find answers to common questions about using Bidrr</p>
        </div>
      </section>

      {/* Content */}
      <main className="container mx-auto px-4 py-16 max-w-5xl">
        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <a
            href="#customers"
            className="bg-white border-2 border-gray-200 rounded-lg p-8 hover:border-[#328d87] transition-colors group"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-[#328d87] transition-colors">
              For Customers
            </h3>
            <p className="text-gray-600">Learn how to post jobs and hire contractors</p>
          </a>
          <a
            href="#contractors"
            className="bg-white border-2 border-gray-200 rounded-lg p-8 hover:border-[#328d87] transition-colors group"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-[#328d87] transition-colors">
              For Contractors
            </h3>
            <p className="text-gray-600">Learn how to find jobs and grow your business</p>
          </a>
        </div>

        {/* Customers Section */}
        <section id="customers" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 pb-4 border-b-2 border-[#328d87]">For Customers</h2>

          <div className="space-y-6">
            <details className="bg-gray-50 rounded-lg p-6 border border-gray-200 group">
              <summary className="font-semibold text-lg text-gray-900 cursor-pointer flex items-center justify-between">
                How do I post a job?
                <ChevronDown className="h-5 w-5 text-gray-500 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="mt-4 text-gray-700 leading-relaxed">
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Click "Get started" or "Post a job" on the homepage</li>
                  <li>Create a free account or log in</li>
                  <li>Describe your project in detail</li>
                  <li>Add photos if helpful</li>
                  <li>Set your budget and timeline</li>
                  <li>Submit your job posting</li>
                </ol>
                <p className="mt-4">
                  Once posted, qualified contractors in your area will receive notifications and can submit bids on your
                  project.
                </p>
              </div>
            </details>

            <details className="bg-gray-50 rounded-lg p-6 border border-gray-200 group">
              <summary className="font-semibold text-lg text-gray-900 cursor-pointer flex items-center justify-between">
                How do I choose the right contractor?
                <ChevronDown className="h-5 w-5 text-gray-500 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="mt-4 text-gray-700 leading-relaxed">
                <p className="mb-4">When reviewing bids, consider:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Contractor ratings and reviews from previous clients</li>
                  <li>Years of experience and specialization</li>
                  <li>Bid price and what's included</li>
                  <li>Estimated timeline for completion</li>
                  <li>Communication style and responsiveness</li>
                </ul>
                <p className="mt-4">
                  Don't automatically choose the lowest bid—quality and reliability matter more than price alone.
                </p>
              </div>
            </details>

            <details className="bg-gray-50 rounded-lg p-6 border border-gray-200 group">
              <summary className="font-semibold text-lg text-gray-900 cursor-pointer flex items-center justify-between">
                Is posting a job really free?
                <ChevronDown className="h-5 w-5 text-gray-500 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="mt-4 text-gray-700 leading-relaxed">
                <p>
                  Yes! Posting jobs on Bidrr is completely free for customers. There are no hidden fees, no subscription
                  costs, and no charges for receiving bids. You only pay the contractor directly for the work they
                  perform.
                </p>
              </div>
            </details>

            <details className="bg-gray-50 rounded-lg p-6 border border-gray-200 group">
              <summary className="font-semibold text-lg text-gray-900 cursor-pointer flex items-center justify-between">
                How do payments work?
                <ChevronDown className="h-5 w-5 text-gray-500 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="mt-4 text-gray-700 leading-relaxed">
                <p className="mb-4">
                  Payment terms are agreed upon directly between you and the contractor. Common arrangements include:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Deposit upfront with balance due upon completion</li>
                  <li>Milestone payments for larger projects</li>
                  <li>Full payment upon completion for smaller jobs</li>
                </ul>
                <p className="mt-4">
                  We recommend discussing payment terms clearly before work begins and getting everything in writing.
                </p>
              </div>
            </details>

            <details className="bg-gray-50 rounded-lg p-6 border border-gray-200 group">
              <summary className="font-semibold text-lg text-gray-900 cursor-pointer flex items-center justify-between">
                What if I'm not satisfied with the work?
                <ChevronDown className="h-5 w-5 text-gray-500 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="mt-4 text-gray-700 leading-relaxed">
                <p className="mb-4">If you're not satisfied with the work:</p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Communicate your concerns directly with the contractor first</li>
                  <li>Document the issues with photos if applicable</li>
                  <li>Give the contractor an opportunity to address the problems</li>
                  <li>
                    Leave a detailed review about the contractor's quality of work to help other customers make informed
                    decisions
                  </li>
                </ol>
              </div>
            </details>
          </div>
        </section>

        {/* Contractors Section */}
        <section id="contractors" className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 pb-4 border-b-2 border-[#328d87]">For Contractors</h2>

          <div className="space-y-6">
            <details className="bg-gray-50 rounded-lg p-6 border border-gray-200 group">
              <summary className="font-semibold text-lg text-gray-900 cursor-pointer flex items-center justify-between">
                How do I get started as a contractor?
                <ChevronDown className="h-5 w-5 text-gray-500 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="mt-4 text-gray-700 leading-relaxed">
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Click "Join as Contractor" on the homepage</li>
                  <li>Create your contractor account</li>
                  <li>Complete your profile with services offered</li>
                  <li>Start browsing and bidding on jobs in your area</li>
                </ol>
              </div>
            </details>

            <details className="bg-gray-50 rounded-lg p-6 border border-gray-200 group">
              <summary className="font-semibold text-lg text-gray-900 cursor-pointer flex items-center justify-between">
                How do I write a winning bid?
                <ChevronDown className="h-5 w-5 text-gray-500 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="mt-4 text-gray-700 leading-relaxed">
                <p className="mb-4">To increase your chances of winning jobs:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Respond quickly to new job postings</li>
                  <li>Provide detailed, professional proposals</li>
                  <li>Be specific about what's included in your price</li>
                  <li>Highlight relevant experience and past projects</li>
                  <li>Offer a realistic timeline</li>
                  <li>Ask clarifying questions if needed</li>
                  <li>Maintain a professional, friendly tone</li>
                </ul>
              </div>
            </details>

            <details className="bg-gray-50 rounded-lg p-6 border border-gray-200 group">
              <summary className="font-semibold text-lg text-gray-900 cursor-pointer flex items-center justify-between">
                How do I get more reviews?
                <ChevronDown className="h-5 w-5 text-gray-500 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="mt-4 text-gray-700 leading-relaxed">
                <p className="mb-4">Build your reputation by:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Completing jobs professionally and on time</li>
                  <li>Communicating clearly with customers</li>
                  <li>Politely asking satisfied clients to leave reviews</li>
                  <li>Following up after job completion</li>
                  <li>Addressing any concerns promptly</li>
                </ul>
                <p className="mt-4">
                  Positive reviews are crucial for winning more jobs. Focus on delivering excellent service every time.
                </p>
              </div>
            </details>

            <details className="bg-gray-50 rounded-lg p-6 border border-gray-200 group">
              <summary className="font-semibold text-lg text-gray-900 cursor-pointer flex items-center justify-between">
                What are the pricing plans for contractors?
                <ChevronDown className="h-5 w-5 text-gray-500 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="mt-4 text-gray-700 leading-relaxed">
                <p className="mb-4 font-semibold">Currently in Beta (Limited Time):</p>
                <ul className="list-disc pl-6 space-y-2 mb-6">
                  <li>
                    <strong>Free Beta Access:</strong> 5 free bids per month, access to all job postings, customer
                    messaging, and reviews
                  </li>
                </ul>
                <p className="mb-4 font-semibold">Coming Soon - Pro Plan ($99/month):</p>
                <ul className="list-disc pl-6 space-y-2 mb-6">
                  <li>Everything from Beta</li>
                  <li>5 bids per month</li>
                  <li>Bids refunded if job not secured</li>
                  <li>Verified Badge</li>
                  <li>Dedicated support</li>
                </ul>
                <p className="mb-4 font-semibold">After Beta - Free Tier:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>1 bid per month</li>
                  <li>No refunds on unused bids</li>
                  <li>Basic profile features</li>
                </ul>
                <p className="mt-4">
                  Visit our{" "}
                  <Link href="/pricing" className="text-[#328d87] hover:underline">
                    pricing page
                  </Link>{" "}
                  for more details.
                </p>
              </div>
            </details>
          </div>
        </section>

        {/* General Questions */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 pb-4 border-b-2 border-[#328d87]">General Questions</h2>

          <div className="space-y-6">
            <details className="bg-gray-50 rounded-lg p-6 border border-gray-200 group">
              <summary className="font-semibold text-lg text-gray-900 cursor-pointer flex items-center justify-between">
                Is Bidrr available in my area?
                <ChevronDown className="h-5 w-5 text-gray-500 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="mt-4 text-gray-700 leading-relaxed">
                <p>
                  Bidrr is currently available across the United States, Canada, U.K., New Zealand and Australia. When
                  you post a job or create a contractor account, you'll be matched with professionals in your local
                  area. We're continuously expanding to new regions.
                </p>
              </div>
            </details>

            <details className="bg-gray-50 rounded-lg p-6 border border-gray-200 group">
              <summary className="font-semibold text-lg text-gray-900 cursor-pointer flex items-center justify-between">
                How does Bidrr verify contractors?
                <ChevronDown className="h-5 w-5 text-gray-500 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="mt-4 text-gray-700 leading-relaxed">
                <p className="mb-4">During contractor registration, we collect:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Full name and contact information</li>
                  <li>Phone number verification via SMS</li>
                  <li>Email address verification</li>
                  <li>Business address and service area</li>
                  <li>Company name and size</li>
                  <li>Services offered</li>
                </ul>
                <p className="mt-4">
                  However, we encourage customers to do their own due diligence and verify credentials before hiring.
                </p>
              </div>
            </details>

            <details className="bg-gray-50 rounded-lg p-6 border border-gray-200 group">
              <summary className="font-semibold text-lg text-gray-900 cursor-pointer flex items-center justify-between">
                How do I delete my account?
                <ChevronDown className="h-5 w-5 text-gray-500 group-open:rotate-180 transition-transform" />
              </summary>
              <div className="mt-4 text-gray-700 leading-relaxed">
                <p>
                  To delete your account, go to Settings → Account → Delete Account. Please note that this action is
                  permanent and cannot be undone. All your data, including job history and reviews, will be removed.
                </p>
              </div>
            </details>
          </div>
        </section>

        {/* Contact Support */}
        <section className="bg-gradient-to-br from-[#0d3d42] to-[#328d87] rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Still need help?</h2>
          <p className="text-xl text-white/90 mb-8">Our support team is here to assist you</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="mailto:support@bidrr.ca"
              className="inline-block bg-white hover:bg-gray-100 text-[#0d3d42] font-semibold px-8 py-4 rounded-full transition-colors"
            >
              Email Support
            </a>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#03353a] py-12 mt-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <Link href="/" className="flex items-center">
              <img src="/images/bidrr-white-logo.png" alt="Bidrr" className="h-8" />
            </Link>
            <nav className="flex items-center gap-8">
              <Link href="/privacy" className="text-white/70 hover:text-white transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-white/70 hover:text-white transition-colors">
                Terms of Service
              </Link>
              <Link href="/help" className="text-white font-semibold">
                Help
              </Link>
            </nav>
            <div className="text-white/60 text-sm">© 2025 Bidrr. All rights reserved.</div>
          </div>
        </div>
      </footer>
    </div>
  )
}
