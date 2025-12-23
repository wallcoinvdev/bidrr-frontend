"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { usePageTitle } from "@/hooks/use-page-title"
import { ChevronDown, ChevronUp, ArrowLeft } from "lucide-react"

export default function HelpPage() {
  usePageTitle("Help Center")

  const [openQuestion, setOpenQuestion] = useState<string | null>(null)

  const toggleQuestion = (question: string) => {
    setOpenQuestion(openQuestion === question ? null : question)
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <Image src="/bidrr-dark-teal-logo.png" alt="Bidrr" width={120} height={40} className="h-8 sm:h-10 w-auto" />
          </Link>
          <Link href="/" className="text-gray-600 hover:text-gray-900 flex items-center gap-2 text-sm">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-[#03353a] text-white py-12 sm:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">How can we help you?</h1>
          <p className="text-lg sm:text-xl text-gray-200">Find answers to common questions about using Bidrr</p>
        </div>
      </section>

      {/* Category Cards */}
      <section className="py-8 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-4xl mx-auto">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-lg mb-2">For Customers</h3>
              <p className="text-gray-600 text-sm">Learn how to post jobs and hire contractors</p>
            </div>
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="font-semibold text-lg mb-2">For Contractors</h3>
              <p className="text-gray-600 text-sm">Learn how to bid, win, and grow your business</p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 py-12 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
          {/* For Customers Section */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 pb-4 border-b border-gray-200">For Customers</h2>

            {/* How do I post a job? */}
            <div className="border-b border-gray-200">
              <button
                onClick={() => toggleQuestion("post-job")}
                className="w-full py-4 flex justify-between items-center text-left hover:text-[#328d87] transition-colors"
              >
                <span className="font-semibold">How do I post a job?</span>
                {openQuestion === "post-job" ? (
                  <ChevronUp className="h-5 w-5 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 flex-shrink-0" />
                )}
              </button>
              {openQuestion === "post-job" && (
                <div className="pb-4 text-gray-600">
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Click "Get started" or "Post a Job" on the homepage</li>
                    <li>Create a free account or log in</li>
                    <li>Describe your project in detail</li>
                    <li>Add photos if applicable</li>
                    <li>Set your budget and timeline</li>
                    <li>Submit your job posting</li>
                  </ol>
                  <p className="mt-4">
                    Once posted, qualified contractors in your area will receive notifications and can submit bids on
                    your project.
                  </p>
                </div>
              )}
            </div>

            {/* How do I choose the right contractor? */}
            <div className="border-b border-gray-200">
              <button
                onClick={() => toggleQuestion("choose-contractor")}
                className="w-full py-4 flex justify-between items-center text-left hover:text-[#328d87] transition-colors"
              >
                <span className="font-semibold">How do I choose the right contractor?</span>
                {openQuestion === "choose-contractor" ? (
                  <ChevronUp className="h-5 w-5 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 flex-shrink-0" />
                )}
              </button>
              {openQuestion === "choose-contractor" && (
                <div className="pb-4 text-gray-600">
                  <p className="mb-3">When reviewing bids, consider:</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Contractor ratings and reviews from previous clients</li>
                    <li>Years of experience and specialization</li>
                    <li>Bid price and what's included</li>
                    <li>Estimated timeline for completion</li>
                    <li>Communication style and responsiveness</li>
                  </ul>
                  <p className="mt-4">
                    Bidrr verifies all contractors' licenses, insurance, and identity, making it easier to find someone
                    you can trust.
                  </p>
                </div>
              )}
            </div>

            {/* Is posting a job really free? */}
            <div className="border-b border-gray-200">
              <button
                onClick={() => toggleQuestion("posting-free")}
                className="w-full py-4 flex justify-between items-center text-left hover:text-[#328d87] transition-colors"
              >
                <span className="font-semibold">Is posting a job really free?</span>
                {openQuestion === "posting-free" ? (
                  <ChevronUp className="h-5 w-5 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 flex-shrink-0" />
                )}
              </button>
              {openQuestion === "posting-free" && (
                <div className="pb-4 text-gray-600">
                  <p>
                    Yes! Posting jobs on Bidrr is completely free for customers. There are no hidden fees, no
                    subscription costs, and no charges for accessing bids. You only pay the contractor directly for the
                    work they perform.
                  </p>
                </div>
              )}
            </div>

            {/* How do payments work? */}
            <div className="border-b border-gray-200">
              <button
                onClick={() => toggleQuestion("payments")}
                className="w-full py-4 flex justify-between items-center text-left hover:text-[#328d87] transition-colors"
              >
                <span className="font-semibold">How do payments work?</span>
                {openQuestion === "payments" ? (
                  <ChevronUp className="h-5 w-5 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 flex-shrink-0" />
                )}
              </button>
              {openQuestion === "payments" && (
                <div className="pb-4 text-gray-600">
                  <p className="mb-3">
                    Payments are agreed upon directly between you and the contractor. Common arrangements include:
                  </p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Deposit upfront with balance due upon completion</li>
                    <li>Milestone-based payments for larger projects</li>
                    <li>Full payment upon completion for smaller jobs</li>
                  </ul>
                  <p className="mt-4">
                    We recommend discussing payment terms clearly before work begins and getting everything in writing.
                  </p>
                </div>
              )}
            </div>

            {/* What if I'm not satisfied with the work? */}
            <div className="border-b border-gray-200">
              <button
                onClick={() => toggleQuestion("not-satisfied")}
                className="w-full py-4 flex justify-between items-center text-left hover:text-[#328d87] transition-colors"
              >
                <span className="font-semibold">What if I'm not satisfied with the work?</span>
                {openQuestion === "not-satisfied" ? (
                  <ChevronUp className="h-5 w-5 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 flex-shrink-0" />
                )}
              </button>
              {openQuestion === "not-satisfied" && (
                <div className="pb-4 text-gray-600">
                  <p className="mb-3">If you're not satisfied with the work:</p>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Communicate your concerns directly with the contractor first</li>
                    <li>Document the issues with photos if applicable</li>
                    <li>Give the contractor an opportunity to address the problems</li>
                    <li>If unresolved, contact our support team for assistance</li>
                  </ol>
                  <p className="mt-4">
                    Bidrr can help facilitate communication and, in some cases, help you find another contractor to make
                    things right.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* For Contractors Section */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 pb-4 border-b border-gray-200">For Contractors</h2>

            {/* How do I get started as a contractor? */}
            <div className="border-b border-gray-200">
              <button
                onClick={() => toggleQuestion("get-started")}
                className="w-full py-4 flex justify-between items-center text-left hover:text-[#328d87] transition-colors"
              >
                <span className="font-semibold">How do I get started as a contractor?</span>
                {openQuestion === "get-started" ? (
                  <ChevronUp className="h-5 w-5 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 flex-shrink-0" />
                )}
              </button>
              {openQuestion === "get-started" && (
                <div className="pb-4 text-gray-600">
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Click "Join as Contractor" on the homepage</li>
                    <li>Create your account</li>
                    <li>Verify your credentials</li>
                    <li>Complete your profile with services offered</li>
                    <li>Start browsing and bidding on jobs in your area</li>
                  </ol>
                </div>
              )}
            </div>

            {/* How do I write a winning bid? */}
            <div className="border-b border-gray-200">
              <button
                onClick={() => toggleQuestion("winning-bid")}
                className="w-full py-4 flex justify-between items-center text-left hover:text-[#328d87] transition-colors"
              >
                <span className="font-semibold">How do I write a winning bid?</span>
                {openQuestion === "winning-bid" ? (
                  <ChevronUp className="h-5 w-5 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 flex-shrink-0" />
                )}
              </button>
              {openQuestion === "winning-bid" && (
                <div className="pb-4 text-gray-600">
                  <p className="mb-3">To increase your chances of winning jobs:</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Respond quickly to new job postings</li>
                    <li>Read the job description carefully</li>
                    <li>Be specific about what's included in your price</li>
                    <li>Highlight relevant experience and past projects</li>
                    <li>Offer a realistic timeline</li>
                    <li>Ask clarifying questions if needed</li>
                    <li>Maintain professional communication</li>
                    <li>Include photos of similar work if applicable</li>
                  </ul>
                </div>
              )}
            </div>

            {/* How do I get more reviews? */}
            <div className="border-b border-gray-200">
              <button
                onClick={() => toggleQuestion("more-reviews")}
                className="w-full py-4 flex justify-between items-center text-left hover:text-[#328d87] transition-colors"
              >
                <span className="font-semibold">How do I get more reviews?</span>
                {openQuestion === "more-reviews" ? (
                  <ChevronUp className="h-5 w-5 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 flex-shrink-0" />
                )}
              </button>
              {openQuestion === "more-reviews" && (
                <div className="pb-4 text-gray-600">
                  <p className="mb-3">Build your reputation by:</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Completing jobs professionally and on time</li>
                    <li>Communicating clearly with customers</li>
                    <li>Politely asking satisfied clients to leave reviews</li>
                    <li>Following up after project completion</li>
                    <li>Addressing any concerns promptly</li>
                  </ul>
                  <p className="mt-4">
                    Positive reviews are crucial for winning more jobs. Focus on delivering excellent service every
                    time.
                  </p>
                </div>
              )}
            </div>

            {/* What are the pricing plans for contractors? */}
            <div className="border-b border-gray-200">
              <button
                onClick={() => toggleQuestion("pricing-plans")}
                className="w-full py-4 flex justify-between items-center text-left hover:text-[#328d87] transition-colors"
              >
                <span className="font-semibold">What are the pricing plans for contractors?</span>
                {openQuestion === "pricing-plans" ? (
                  <ChevronUp className="h-5 w-5 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 flex-shrink-0" />
                )}
              </button>
              {openQuestion === "pricing-plans" && (
                <div className="pb-4 text-gray-600">
                  <p className="mb-4 font-semibold">Currently in Beta (Limited Time):</p>
                  <div className="mb-4">
                    <p className="font-semibold">Free Beta Access:</p>
                    <p className="mb-2">0 free bids per month to all beta postings, customer messaging, and reviews</p>
                  </div>
                  <div className="mb-4">
                    <p className="font-semibold">Coming Soon - Pro Plus ($$$$/month):</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>Everything from Beta</li>
                      <li>Priority job alerts</li>
                      <li>30% refunded if job not secured</li>
                      <li>Verified Badge</li>
                    </ul>
                  </div>
                  <div className="mb-4">
                    <p className="font-semibold">After Beta - Free Tier:</p>
                    <ul className="list-disc list-inside space-y-1 ml-4">
                      <li>5 free bids per month</li>
                      <li>No refunds on unused bids</li>
                      <li>Basic profile features</li>
                    </ul>
                  </div>
                  <p>
                    Visit our{" "}
                    <Link href="/pricing" className="text-[#328d87] hover:underline">
                      pricing page
                    </Link>{" "}
                    for more details.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* General Questions Section */}
          <section className="mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-6 pb-4 border-b border-gray-200">General Questions</h2>

            {/* Is Bidrr available in my area? */}
            <div className="border-b border-gray-200">
              <button
                onClick={() => toggleQuestion("availability")}
                className="w-full py-4 flex justify-between items-center text-left hover:text-[#328d87] transition-colors"
              >
                <span className="font-semibold">Is Bidrr available in my area?</span>
                {openQuestion === "availability" ? (
                  <ChevronUp className="h-5 w-5 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 flex-shrink-0" />
                )}
              </button>
              {openQuestion === "availability" && (
                <div className="pb-4 text-gray-600">
                  <p>
                    Bidrr is currently available across British Columbia, Alberta, Ontario, Canada, U.S., New Zealand
                    and Australia. When you post a job or create a contractor account, you'll be matched with
                    professionals in your local area. We're continuously expanding to new regions.
                  </p>
                </div>
              )}
            </div>

            {/* How does Bidrr verify contractors? */}
            <div className="border-b border-gray-200">
              <button
                onClick={() => toggleQuestion("verify-contractors")}
                className="w-full py-4 flex justify-between items-center text-left hover:text-[#328d87] transition-colors"
              >
                <span className="font-semibold">How does Bidrr verify contractors?</span>
                {openQuestion === "verify-contractors" ? (
                  <ChevronUp className="h-5 w-5 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 flex-shrink-0" />
                )}
              </button>
              {openQuestion === "verify-contractors" && (
                <div className="pb-4 text-gray-600">
                  <p className="mb-3">During contractor registration, we verify:</p>
                  <ul className="list-disc list-inside space-y-2">
                    <li>Real names and contact information</li>
                    <li>Professional licenses where applicable</li>
                    <li>Email address verification</li>
                    <li>Business address and service area</li>
                    <li>Government-issued ID</li>
                    <li>Services offered</li>
                  </ul>
                  <p className="mt-4">
                    However, we encourage customers to do their own due diligence and only make payments to contractors
                    before hiring.
                  </p>
                </div>
              )}
            </div>

            {/* How do I delete my account? */}
            <div className="border-b border-gray-200">
              <button
                onClick={() => toggleQuestion("delete-account")}
                className="w-full py-4 flex justify-between items-center text-left hover:text-[#328d87] transition-colors"
              >
                <span className="font-semibold">How do I delete my account?</span>
                {openQuestion === "delete-account" ? (
                  <ChevronUp className="h-5 w-5 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 flex-shrink-0" />
                )}
              </button>
              {openQuestion === "delete-account" && (
                <div className="pb-4 text-gray-600">
                  <p>
                    To delete your account, go to Settings → Account → Delete Account. Please note that this action is
                    permanent and cannot be undone. All your job history and reviews will be removed.
                  </p>
                </div>
              )}
            </div>
          </section>

          {/* Still Need Help CTA */}
          <section className="bg-[#03353a] text-white rounded-lg p-8 sm:p-12 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">Still need help?</h2>
            <p className="text-lg mb-6 text-gray-200">Our support team is here to assist you</p>
            <Link
              href="mailto:support@bidrr.ca"
              className="inline-block bg-white text-[#03353a] px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Email Support
            </Link>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#03353a] text-white py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <Link href="/" className="flex items-center">
              <Image
                src="/bidrr-dark-teal-logo.png"
                alt="Bidrr"
                width={120}
                height={40}
                className="h-8 w-auto brightness-0 invert"
              />
            </Link>
            <div className="flex gap-6 text-sm">
              <Link href="/privacy" className="hover:text-gray-300">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-gray-300">
                Terms of Service
              </Link>
              <Link href="/help" className="hover:text-gray-300">
                Help
              </Link>
            </div>
          </div>
          <div className="text-center mt-6 text-sm text-gray-400">© 2025 Bidrr. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
