"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { AlertCircle, Loader2, ArrowLeft, CheckCircle } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
      const response = await fetch(`${apiUrl}/api/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.toLowerCase() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset email")
      }

      setSubmitted(true)
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative">
      <div className="fixed inset-0 z-0">
        <img src="/living-room-background.jpg" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#03353a]/95 via-[#0d3d42]/90 to-[#328d87]/85" />
      </div>

      {/* Content wrapper with relative positioning */}
      <div className="relative z-10 min-h-screen flex flex-col">
        <header className="p-4 flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <img src="/images/bidrr-white-logo.png" alt="Bidrr" className="h-8 md:h-10 w-auto" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center text-sm text-white/90 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to login
          </Link>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
            {submitted ? (
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <CheckCircle className="h-16 w-16 text-[#328d87]" />
                </div>
                <h1 className="text-2xl font-bold text-[#1a3b4c] mb-2">Check your email</h1>
                <p className="text-gray-600 mb-6">
                  If an account exists for {email}, you will receive a password reset link shortly.
                </p>
                <Link
                  href="/login"
                  className="inline-block w-full py-3 px-4 bg-[#e2bb12] hover:bg-[#c9a610] text-[#1a3b4c] font-semibold rounded-lg transition-colors text-center"
                >
                  Return to login
                </Link>
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-center text-[#1a3b4c] mb-2">Forgot your password?</h1>
                <p className="text-center text-gray-600 mb-6">
                  Enter your email address and we'll send you a link to reset your password.
                </p>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent outline-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-[#e2bb12] hover:bg-[#c9a610] text-[#1a3b4c] font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="animate-spin h-5 w-5 mr-2" />
                        Sending...
                      </>
                    ) : (
                      "Send Reset Link"
                    )}
                  </button>
                </form>

                <p className="mt-6 text-center text-gray-600">
                  Remember your password?{" "}
                  <Link href="/login" className="text-[#328d87] hover:underline font-medium">
                    Sign in
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
