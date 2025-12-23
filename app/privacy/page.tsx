"use client"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import Image from "next/image"
import { usePageTitle } from "@/hooks/use-page-title"

export default function PrivacyPage() {
  usePageTitle("Privacy Policy")

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <Image src="/bidrr-dark-teal-logo.png" alt="Bidrr" width={120} height={40} className="h-8 sm:h-10 w-auto" />
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dashboard</span>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
        <article className="max-w-3xl mx-auto prose prose-slate">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-sm text-gray-500 mb-12">Last updated: January 2025</p>

          {/* Introduction */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
            <p className="text-gray-900 mb-4">
              At Bidrr, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and
              safeguard your information when you use our platform to connect customers with service professionals.
            </p>
            <p className="text-gray-900">
              By using Bidrr, you agree to the collection and use of information in accordance with this policy.
            </p>
          </section>

          {/* Information We Collect */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Information We Collect</h2>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">Personal Information</h3>
            <p className="text-gray-900 mb-3">We collect information that you provide directly to us, including:</p>
            <ul className="list-disc pl-6 mb-6 text-gray-900 space-y-2">
              <li>Name, email address, phone number, and mailing address</li>
              <li>Profile information, including photos and service preferences</li>
              <li>Communications between customers and contractors</li>
              <li>Reviews, ratings, and feedback</li>
            </ul>

            <h3 className="text-xl font-semibold text-gray-900 mb-3">Automatically Collected Information</h3>
            <p className="text-gray-900 mb-3">
              When you use our platform, we automatically collect certain information, including:
            </p>
            <ul className="list-disc pl-6 mb-6 text-gray-900 space-y-2">
              <li>Device information (IP address, browser type, operating system)</li>
              <li>Usage data (pages visited, time spent, features used)</li>
              <li>Location information (with your permission)</li>
              <li>Cookies and similar tracking technologies</li>
            </ul>
          </section>

          {/* How We Use Your Information */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">How We Use Your Information</h2>
            <p className="text-gray-900 mb-3">We use the information we collect to:</p>
            <ul className="list-disc pl-6 mb-6 text-gray-900 space-y-2">
              <li>Connect customers with qualified service professionals</li>
              <li>Communicate with you about your account and services</li>
              <li>Improve and personalize your experience on our platform</li>
              <li>Prevent fraud and ensure platform security</li>
              <li>Comply with legal obligations</li>
              <li>Send marketing communications (with your consent)</li>
            </ul>
          </section>

          {/* Information Sharing */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Information Sharing</h2>
            <p className="text-gray-900 mb-3">We may share your information with:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-900 space-y-2">
              <li>
                <strong>Service Professionals:</strong> When you post a job, contractors can view your project details
                and contact information
              </li>
              <li>
                <strong>Customers:</strong> When contractors bid on jobs, customers can view contractor profiles and
                reviews
              </li>
              <li>
                <strong>Service Providers:</strong> Third-party vendors who help us operate our platform
              </li>
              <li>
                <strong>Legal Requirements:</strong> When required by law or to protect our rights
              </li>
            </ul>
            <p className="text-gray-900">
              We do not sell your personal information to third parties for marketing purposes.
            </p>
          </section>

          {/* Your Rights and Choices */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Rights and Choices</h2>
            <p className="text-gray-900 mb-3">You have the right to:</p>
            <ul className="list-disc pl-6 mb-4 text-gray-900 space-y-2">
              <li>Access and update your personal information</li>
              <li>Delete your account and associated data</li>
              <li>Opt out of marketing communications</li>
              <li>Disable cookies through your browser settings</li>
              <li>Request a copy of your data</li>
            </ul>
            <p className="text-gray-900">To exercise these rights, please contact us at support@bidrr.ca</p>
          </section>

          {/* Data Security */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Security</h2>
            <p className="text-gray-900">
              We implement appropriate technical and organizational measures to protect your personal information
              against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission
              over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          {/* Children's Privacy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Children's Privacy</h2>
            <p className="text-gray-900">
              Bidrr is not intended for users under the age of 18. We do not knowingly collect personal information from
              children. If you believe we have collected information from a child, please contact us immediately.
            </p>
          </section>

          {/* Changes to This Policy */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Changes to This Policy</h2>
            <p className="text-gray-900">
              We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new
              policy on this page and updating the "Last updated" date. Your continued use of Bidrr after changes
              constitutes acceptance of the updated policy.
            </p>
          </section>

          {/* Contact Us */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Us</h2>
            <p className="text-gray-900 mb-4">If you have questions about this Privacy Policy, please contact us:</p>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <p className="text-gray-900">
                <strong>Email:</strong> support@bidrr.ca
              </p>
            </div>
          </section>
        </article>
      </main>

      {/* Footer */}
      <footer className="bg-[#03353a] text-white py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
              <Link href="/privacy" className="hover:text-[#e2bb12] transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="hover:text-[#e2bb12] transition-colors">
                Terms of Service
              </Link>
              <Link href="/help" className="hover:text-[#e2bb12] transition-colors">
                Help
              </Link>
            </div>
          </div>
          <div className="text-center mt-4 text-sm text-gray-400">© 2025 Bidrr. All rights reserved.</div>
        </div>
      </footer>
    </div>
  )
}
