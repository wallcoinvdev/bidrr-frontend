"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { useEffect } from "react"

export default function TermsPage() {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

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
                onClick={() =>
                  router.push(
                    user.role === "admin"
                      ? "/dashboard/admin"
                      : user.role === "contractor"
                        ? "/contractor/dashboard"
                        : "/homeowner/dashboard",
                  )
                }
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

      {/* Content */}
      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
        <p className="text-gray-600 mb-8">Last updated: January 2025</p>

        <div className="prose prose-lg max-w-none">
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Agreement to Terms</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Welcome to Bidrr. By accessing or using our platform, you agree to be bound by these Terms of Service and
              all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from
              using this platform.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Platform Description</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Bidrr is an online marketplace that connects customers seeking home services with qualified service
              professionals (contractors). We provide the platform for these connections but are not a party to the
              actual service agreements between customers and contractors.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">User Accounts</h2>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Account Creation</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              To use Bidrr, you must create an account and provide accurate, complete information. You are responsible
              for:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized access</li>
              <li>Ensuring your account information remains accurate and up-to-date</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">Account Types</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>Customer Accounts:</strong> For individuals seeking home services
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>Contractor Accounts:</strong> For professionals offering home services
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">User Responsibilities</h2>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Customer Responsibilities</h3>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>Provide accurate project descriptions and requirements</li>
              <li>Respond to contractor inquiries in a timely manner</li>
              <li>Pay for services as agreed upon with contractors</li>
              <li>Provide honest reviews and feedback</li>
              <li>Comply with all applicable local laws and regulations</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">Contractor Responsibilities</h3>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>Provide valid licenses, insurance, and certifications upon customer request</li>
              <li>Provide accurate service descriptions and pricing</li>
              <li>Complete work professionally and as agreed</li>
              <li>Respond to customer inquiries promptly</li>
              <li>Comply with all applicable laws, regulations, and safety standards</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Payments and Fees</h2>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Platform Fees</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>Customers:</strong> Posting jobs is free. No platform fees for customers.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>Contractors:</strong> During our beta period, contractors receive 5 free bids per month. After
              beta, a Pro subscription ($99/month) will include 5 bids per month with refunds for unused bids when jobs
              are not secured. A free tier (1 bid per month) will also be available. Current pricing details are
              available on our{" "}
              <Link href="/pricing" className="text-[#328d87] hover:underline">
                pricing page
              </Link>
              .
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Prohibited Activities</h2>
            <p className="text-gray-700 leading-relaxed mb-4">You may not:</p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>Provide false or misleading information</li>
              <li>Impersonate another person or entity</li>
              <li>Engage in fraudulent activities</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Circumvent platform fees by conducting transactions off-platform</li>
              <li>Share email addresses or phone numbers through the platform messaging system</li>
              <li>Use automated systems to access the platform</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Post spam, malware, or malicious content</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Dispute Resolution</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Bidrr provides a platform for connecting users but is not responsible for disputes between customers and
              contractors. We encourage users to resolve disputes directly.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Any disputes with Bidrr itself shall be resolved through binding arbitration in accordance with the laws
              of [Your State/Country].
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Bidrr is a platform that facilitates connections between customers and contractors. We do not:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>Employ or control contractors</li>
              <li>Guarantee the quality of services provided</li>
              <li>Verify all contractor credentials (though we encourage verification)</li>
              <li>Assume liability for work performed by contractors</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              To the maximum extent permitted by law, Bidrr shall not be liable for any indirect, incidental, special,
              or consequential damages arising from your use of the platform.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Intellectual Property</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              The Bidrr platform, including its design, features, and content, is protected by copyright, trademark, and
              other intellectual property laws. You may not copy, modify, distribute, or create derivative works without
              our express written permission.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Termination</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We reserve the right to suspend or terminate your account at any time for:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-700 space-y-2">
              <li>Violation of these Terms of Service</li>
              <li>Fraudulent or illegal activity</li>
              <li>Abuse of other users</li>
              <li>Non-payment of fees</li>
              <li>Any other reason at our sole discretion</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              You may terminate your account at any time through your account settings.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We may modify these Terms of Service at any time. We will notify you of significant changes via email or
              platform notification. Your continued use of Bidrr after changes constitutes acceptance of the updated
              terms.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have questions about these Terms of Service, please contact us:
            </p>
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
              <p className="text-gray-700">
                <strong>Email:</strong> support@bidrr.ca
              </p>
            </div>
          </section>
        </div>
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
              <Link href="/terms" className="text-white font-semibold">
                Terms of Service
              </Link>
              <Link href="/help" className="text-white/70 hover:text-white transition-colors">
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
