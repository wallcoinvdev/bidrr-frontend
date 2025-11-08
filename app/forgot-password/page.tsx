"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { AlertCircle, CheckCircle, Loader2, ArrowLeft } from "lucide-react"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("https://api.bidrr.ca/api/users/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to send reset email")
      }

      setSuccess(true)
    } catch (err: any) {
      setError(err.message || "Failed to send reset email. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      <div
        className="fixed inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: "url('/living-room-background.jpg')" }}
      />
      <div className="fixed inset-0 bg-[#0d3d42]/95 z-0" />

      <div className="relative z-10 flex flex-col min-h-screen">
        <header className="border-b border-[#d8e2fb]/20 bg-[#0D3D42]/95 backdrop-blur-sm">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="flex items-center justify-between h-20">
              <Link href="/" className="flex items-center">
                <Image
                  src="/images/logo-white.png"
                  alt="HomeHero"
                  width={160}
                  height={40}
                  className="h-8 md:h-10 w-auto"
                />
              </Link>
              <Link
                href="/login"
                className="text-sm font-medium text-[#d8e2fb] hover:text-white transition-colors flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Login
              </Link>
            </div>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center px-4 py-12">
          <div className="w-full max-w-md">
            <div className="bg-white rounded-2xl shadow-2xl p-8">
              {!success ? (
                <>
                  <h1 className="text-3xl font-bold text-center mb-2 text-[#03353a]">Forgot Password?</h1>
                  <p className="text-center text-gray-600 mb-8">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>

                  {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#e2bb12] focus:border-transparent outline-none transition-all"
                        placeholder="you@example.com"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full px-6 py-3 bg-[#e2bb12] text-[#03353a] rounded-lg font-semibold hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading && <Loader2 className="h-5 w-5 animate-spin" />}
                      {loading ? "Sending..." : "Send Reset Link"}
                    </button>
                  </form>

                  <p className="mt-6 text-center text-sm text-gray-600">
                    Remember your password?{" "}
                    <Link href="/login" className="text-[#328d87] font-medium hover:underline">
                      Sign in
                    </Link>
                  </p>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center mb-4">
                    <div className="bg-green-100 p-3 rounded-full">
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <h1 className="text-3xl font-bold text-center mb-2 text-[#03353a]">Check Your Email</h1>
                  <p className="text-center text-gray-600 mb-8">
                    We've sent a password reset link to <strong>{email}</strong>. Please check your inbox and follow the
                    instructions to reset your password.
                  </p>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-blue-800">
                      <strong>Didn't receive the email?</strong>
                      <br />
                      Check your spam folder or{" "}
                      <button onClick={() => setSuccess(false)} className="text-[#328d87] font-medium hover:underline">
                        try again
                      </button>
                      .
                    </p>
                  </div>

                  <Link
                    href="/login"
                    className="block w-full px-6 py-3 bg-[#e2bb12] text-[#03353a] rounded-lg font-semibold hover:opacity-90 transition-all text-center"
                  >
                    Back to Login
                  </Link>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
