"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { usePageTitle } from "@/hooks/use-page-title"
import { Check, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"

const surveyOptions = [
  { key: "competitive_bids", label: "Get multiple competitive bids fast (within 24–72 hours)" },
  { key: "save_time", label: "Save time/effort – no need to call or message contractors one by one" },
  { key: "compare_quotes", label: "Compare all quotes and contractor reviews in one place" },
  { key: "promotional_discounts", label: "See which contractors are offering promotional discounts in one place" },
  { key: "licensed_insured", label: "Only deal with licensed and insured contractors" },
  { key: "saved_communication", label: "Have the option to have communication and bids saved inside account" },
  { key: "other", label: "Other (please tell us)" },
]

export default function SurveyPage() {
  usePageTitle("Survey")

  const [selectedOptions, setSelectedOptions] = useState<string[]>([])
  const [otherText, setOtherText] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    if (isSubmitted) {
      const timer = setTimeout(() => {
        router.push("/signup")
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isSubmitted, router])

  const handleOptionToggle = (key: string) => {
    setSelectedOptions((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
  }

  const handleSubmit = async () => {
    if (selectedOptions.length === 0) {
      setError("Please select at least one option")
      return
    }

    if (selectedOptions.includes("other") && !otherText.trim()) {
      setError("Please provide details for the 'Other' option")
      return
    }

    setError("")
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/survey/response", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          selections: selectedOptions,
          other_text: selectedOptions.includes("other") ? otherText.trim() : null,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit survey")
      }

      setIsSubmitted(true)
    } catch (err) {
      setError("Failed to submit survey. Please try again.")
    } finally {
      setIsSubmitting(false)
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
        <header className="bg-[#03353a]/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4">
            <div className="flex justify-between items-center">
              <Link href="/" className="flex items-center">
                <img src="/images/bidrr-white-logo.png" alt="Bidrr" className="h-8 md:h-10 w-auto" />
              </Link>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="flex-1 flex items-center justify-center px-4 py-8">
          <div className="w-full max-w-xl">
            {isSubmitted ? (
              /* Success state */
              <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Check className="w-8 h-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-3">Thank You!</h2>
                <p className="text-gray-600 mb-4">
                  Your feedback has been submitted successfully. We appreciate you helping us build a better experience.
                </p>
                <p className="text-sm text-gray-500">Redirecting to signup...</p>
              </div>
            ) : (
              /* Survey form */
              <div className="bg-white rounded-2xl shadow-2xl p-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">We're Building This App for You</h1>
                <p className="text-gray-600 text-center mb-8">
                  Your feedback helps us create the best experience for customers like you.
                </p>

                <div className="mb-6">
                  <p className="text-gray-800 font-medium mb-4">
                    What would make you choose Bidrr (to post your home service job or project) over searching Google,
                    Facebook, or calling around?
                  </p>

                  {/* Select all that apply badge */}
                  <span className="inline-block bg-[#03353a] text-white text-xs font-medium px-3 py-1 rounded-full mb-4">
                    Select all that apply
                  </span>

                  {/* Options */}
                  <div className="space-y-3">
                    {surveyOptions.map((option) => (
                      <div key={option.key}>
                        <label
                          className={`flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-colors ${
                            selectedOptions.includes(option.key)
                              ? "border-[#03353a] bg-[#03353a]/5"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <Checkbox
                            checked={selectedOptions.includes(option.key)}
                            onCheckedChange={() => handleOptionToggle(option.key)}
                            className="mt-0.5 data-[state=checked]:bg-[#03353a] data-[state=checked]:border-[#03353a]"
                          />
                          <span className="text-gray-700 text-sm leading-relaxed">{option.label}</span>
                        </label>

                        {/* Other text input */}
                        {option.key === "other" && selectedOptions.includes("other") && (
                          <div className="mt-2 ml-8">
                            <Textarea
                              placeholder="Please tell us what else would make you choose Bidrr..."
                              value={otherText}
                              onChange={(e) => setOtherText(e.target.value)}
                              className="resize-none"
                              rows={3}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Error message */}
                {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

                {/* Submit button */}
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-[#e2bb12] hover:bg-[#e2bb12]/90 text-[#03353a] font-semibold py-3"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Feedback"
                  )}
                </Button>

                {/* Link to main site */}
                <p className="text-center mt-6 text-sm text-gray-500">
                  <Link href="/" className="text-[#03353a] hover:underline font-medium">
                    Go to Bidrr →
                  </Link>
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
