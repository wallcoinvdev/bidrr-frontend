import Link from "next/link"
import { ArrowLeft } from 'lucide-react'
import Image from "next/image"

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image
              src="/bidrr-dark-teal-logo.png"
              alt="Bidrr"
              width={120}
              height={40}
              className="h-8 sm:h-10 w-auto"
            />
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-[#328d87] transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to Home</span>
            <span className="sm:hidden">Back</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Terms of Service</h1>
          <p className="text-sm text-gray-500 mb-8 sm:mb-12">Last updated: January 2025</p>

          {/* Agreement to Terms */}
          <section className="mb-8 sm:mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Agreement to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              Welcome to Bidrr. By accessing or using our platform, you agree to be bound by these Terms of Service and
              all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from
              using this platform.
            </p>
          </section>

          {/* Platform Description */}
          <section className="mb-8 sm:mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Platform Description</h2>
            <p className="text-gray-700 leading-relaxed">
              Bidrr is an online platform that connects customers seeking home services with qualified service
              professionals (contractors). We provide the platform for these connections but are not a party to the actual
              service agreements between customers and contractors.
            </p>
          </section>

          {/* User Accounts */}
          <section className="mb-8 sm:mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">User Accounts</h2>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Account Creation</h3>
            <p className="text-gray-700 leading-relaxed mb-3">
              To use Bidrr, you must create an account and provide accurate, complete information. You are responsible for:
            </p>
            <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized access</li>
              <li>Ensuring your account information remains accurate and up-to-date</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mb-3">Account Types</h3>
            <p className="text-gray-700 leading-relaxed mb-2">
              <span className="font-semibold">Customer Accounts:</span> For individuals seeking home services
            </p>
            <p className="text-gray-700 leading-relaxed">
              <span className="font-semibold">Contractor Accounts:</span> For professionals offering home services
            </p>
          </section>

          {/* User Responsibilities */}
          <section className="mb-8 sm:mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">User Responsibilities</h2>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Customer Responsibilities</h3>
            <ul className="list-disc pl-6 mb-6 space-y-2 text-gray-700">
              <li>Provide accurate project descriptions and requirements</li>
              <li>Respond to contractor inquiries in a timely manner</li>
              <li>Pay for services as agreed upon with contractors</li>
              <li>Provide honest reviews and feedback</li>
              <li>Comply with all applicable local laws and regulations</li>
            </ul>

            <h3 className="text-lg font-semibold text-gray-900 mb-3">Contractor Responsibilities</h3>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Provide valid licenses, insurance, and certifications upon customer request</li>
              <li>Provide accurate service descriptions and pricing</li>
              <li>Complete work professionally and as agreed</li>
              <li>Respond to customer inquiries promptly</li>
              <li>Comply with all applicable laws, regulations, and safety standards</li>
            </ul>
          </section>

          {/* Payments and Fees */}
          <section className="mb-8 sm:mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Payments and Fees</h2>
            
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Platform Fees</h3>
            <p className="text-gray-700 leading-relaxed mb-4">
              <span className="font-semibold">Customers:</span> Posting jobs is free. No platform fees for customers.
            </p>
            <p className="text-gray-700 leading-relaxed mb-2">
              <span className="font-semibold">Contractors:</span> During our beta period, contractors receive 1 free bid per month. After beta, a Bro
              subscription ($9/month) will include 3 bids per month with refunds for unused bids when jobs are not
              secured. A free tier (1 bid per month) will also be available. Current pricing details are available on our{" "}
              <Link href="/pricing" className="text-[#328d87] hover:underline">
                pricing page
              </Link>
              .
            </p>
          </section>

          {/* Prohibited Activities */}
          <section className="mb-8 sm:mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Prohibited Activities</h2>
            <p className="text-gray-700 leading-relaxed mb-3">You may not:</p>
            <ul className="list-disc pl-6 space-y-2 text-gray-700">
              <li>Provide false or misleading information</li>
              <li>Impersonate another person or entity</li>
              <li>Engage in fraudulent activities</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Circumvent platform fees by conducting transactions off platform</li>
              <li>Share email addresses or phone numbers through the platform messaging system</li>
              <li>Use automated systems to access the platform</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Post spam, malware, or malicious content</li>
            </ul>
          </section>

          {/* Dispute Resolution */}
          <section className="mb-8 sm:mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Dispute Resolution</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Bidrr provides a platform for connections between users but is not responsible for disputes between customers and
              contractors. We encourage users to resolve disputes directly.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Any disputes with Bidrr itself will be resolved through binding arbitration in accordance with the laws of
              [Your State/Country].
            </p>
          </section>

          {/* Limitation of Liability */}
          <section className="mb-8 sm:mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Bidrr is a platform that facilitates connections between customers and contractors. We do not:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
              <li>Employ or control contractors</li>
              <li>Guarantee the quality of services provided</li>
              <li>Verify all contractor credentials (though we encourage verification)</li>
              <li>Assume liability for work performed by contractors</li>
            </ul>
            <p className="text-gray-700 leading-relaxed">
              To the maximum extent permitted by law, Bidrr shall not be liable for any indirect, incidental, special, or
              consequential damages arising from your use of the platform.
            </p>
          </section>

          {/* Intellectual Property */}
          <section className="mb-8 sm:mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Intellectual Property</h2>
            <p className="text-gray-700 leading-relaxed">
              The Bidrr platform, including its design, features, and content, is protected by copyright, trademark, and
              other intellectual property laws. You may not copy, modify, distribute, or create derivative works without our
              express written permission.
            </p>
          </section>

          {/* Account Termination */}
          <section className="mb-8 sm:mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Account Termination</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We reserve the right to suspend or terminate your account at any time for:
            </p>
            <ul className="list-disc pl-6 mb-4 space-y-2 text-gray-700">
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

          {/* Changes to Terms */}
          <section className="mb-8 sm:mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We may modify these Terms of Service at any time. We will notify you of significant changes via email or
              platform notification. Your continued use of Bidrr after changes constitutes acceptance of the updated terms.
            </p>
          </section>

          {/* Contact Us */}
          <section className="mb-8 sm:mb-10">
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have questions about these Terms of Service, please contact us:
            </p>
            <p className="text-gray-700">
              <span className="font-semibold">Email:</span>{" "}
              <a href="mailto:support@bidrr.ca" className="text-[#328d87] hover:underline">
                support@bidrr.ca
              </a>
            </p>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#03353a] text-white py-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link href="/" className="flex items-center">
              <Image
                src="/bidrr-dark-teal-logo.png"
                alt="Bidrr"
                width={120}
                height={40}
                className="h-8 w-auto brightness-0 invert"
              />
            </Link>
            <div className="flex items-center gap-6 text-sm">
              <Link href="/privacy" className="hover:text-[#328d87] transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-[#328d87] transition-colors">
                Terms of Service
              </Link>
              <Link href="/help" className="hover:text-[#328d87] transition-colors">
                Help
              </Link>
            </div>
          </div>
          <div className="mt-6 text-center text-sm text-gray-400">
            © 2025 Bidrr. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
