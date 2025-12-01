"use client"

import { X } from "lucide-react"

interface TermsModalProps {
  onClose: () => void
}

export default function TermsModal({ onClose }: TermsModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-[#03353a]">Terms of Service</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors" aria-label="Close">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto p-6 space-y-4">
          <section>
            <h3 className="text-lg font-semibold text-[#03353a] mb-2">1. Acceptance of Terms</h3>
            <p className="text-gray-700 text-sm">
              By accessing and using Bidrr, you accept and agree to be bound by the terms and provision of this
              agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-[#03353a] mb-2">2. Use License</h3>
            <p className="text-gray-700 text-sm">
              Permission is granted to temporarily use Bidrr for personal, non-commercial transitory viewing only. This
              is the grant of a license, not a transfer of title.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-[#03353a] mb-2">3. User Accounts</h3>
            <p className="text-gray-700 text-sm">
              You are responsible for maintaining the confidentiality of your account and password. You agree to accept
              responsibility for all activities that occur under your account or password.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-[#03353a] mb-2">4. Service Description</h3>
            <p className="text-gray-700 text-sm">
              Bidrr connects customers with contractors for home improvement projects. We facilitate the bidding process
              but are not responsible for the quality of work or contractual agreements between parties.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-[#03353a] mb-2">5. User Conduct</h3>
            <p className="text-gray-700 text-sm mb-2">You agree not to:</p>
            <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
              <li>Post false, inaccurate, misleading, or fraudulent content</li>
              <li>Harass, abuse, or harm another person or entity</li>
              <li>Violate any applicable laws or regulations</li>
              <li>Interfere with or disrupt the service or servers</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-[#03353a] mb-2">6. Privacy Policy</h3>
            <p className="text-gray-700 text-sm">
              Your privacy is important to us. We collect and use personal information as described in our Privacy
              Policy. By using Bidrr, you consent to our collection and use of personal data.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-[#03353a] mb-2">7. Payment and Fees</h3>
            <p className="text-gray-700 text-sm">
              Contractors may be subject to service fees for using the platform. All fees will be clearly disclosed
              before you incur them. Customers can use basic features free of charge.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-[#03353a] mb-2">8. Disclaimer</h3>
            <p className="text-gray-700 text-sm">
              Bidrr is provided "as is" without any representations or warranties. We do not guarantee the accuracy,
              completeness, or reliability of any content on the platform.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-[#03353a] mb-2">9. Limitation of Liability</h3>
            <p className="text-gray-700 text-sm">
              Bidrr shall not be liable for any indirect, incidental, special, consequential, or punitive damages
              resulting from your use of or inability to use the service.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-[#03353a] mb-2">10. Modifications to Terms</h3>
            <p className="text-gray-700 text-sm">
              We reserve the right to modify these terms at any time. Continued use of Bidrr after changes constitutes
              acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-semibold text-[#03353a] mb-2">11. Contact Information</h3>
            <p className="text-gray-700 text-sm">
              If you have any questions about these Terms of Service, please contact us at support@bidrr.ca
            </p>
          </section>

          <div className="pt-4 border-t">
            <p className="text-xs text-gray-500">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
        <div className="p-6 border-t">
          <button
            onClick={onClose}
            className="w-full bg-[#e2bb12] text-[#03353a] py-3 px-4 rounded-lg hover:bg-[#d4a810] transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
