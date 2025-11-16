"use client"

import React from "react"
import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from 'next/navigation'
import { Search, Wrench, Zap, Home, Dog, Sparkles, Wind, Trees, Droplets, Hammer, X, Menu, ArrowRight } from 'lucide-react'
import { SERVICES } from "@/lib/services"
import { SiteFooter } from "@/components/site-footer"

export default function HomePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [filteredServices, setFilteredServices] = useState<string[]>([])
  const autocompleteRef = useRef<HTMLDivElement>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [heroHeading, setHeroHeading] = useState("Skip the Search—Let Contractors Compete for Your Work")
  const [isClient, setIsClient] = useState(false)

  const headingVariations = [
    {
      id: "A",
      text: "Get Fair Bids—Let Contractors Compete for Your Job",
    },
    {
      id: "B",
      text: "Stop Searching. Let Contractors Bid on Your Work",
    },
    {
      id: "C",
      text: "Fair Prices. Fast Bids. Contractors Compete for Your Work",
    },
    {
      id: "D",
      text: "Skip the Search—Let Contractors Compete for Your Work",
    },
    {
      id: "E",
      text: "Stop Searching for Contractors—Let Them Bid on Your Work at a Fair Price",
    },
  ]

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const storedVariation = localStorage.getItem("hero_heading_variation")

    if (storedVariation) {
      const variation = headingVariations.find((v) => v.id === storedVariation)
      if (variation) {
        setHeroHeading(variation.text)
      } else {
        assignRandomVariation()
      }
    } else {
      assignRandomVariation()
    }

    function assignRandomVariation() {
      const randomIndex = Math.floor(Math.random() * headingVariations.length)
      const selectedVariation = headingVariations[randomIndex]

      setHeroHeading(selectedVariation.text)
      localStorage.setItem("hero_heading_variation", selectedVariation.id)
    }
  }, [isClient])

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const filtered = SERVICES.filter((service) => service.toLowerCase().includes(searchQuery.toLowerCase())).slice(
        0,
        8,
      )
      setFilteredServices(filtered)
      setShowAutocomplete(filtered.length > 0)
    } else {
      setFilteredServices([])
      setShowAutocomplete(false)
    }
  }, [searchQuery])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (autocompleteRef.current && !autocompleteRef.current.contains(event.target as Node)) {
        setShowAutocomplete(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      router.push(`/signup?service=${encodeURIComponent(searchQuery)}`)
    } else {
      router.push("/signup")
    }
  }

  const handleServiceSelect = (service: string) => {
    setSearchQuery(service)
    setShowAutocomplete(false)
    router.push(`/signup?service=${encodeURIComponent(service)}`)
  }

  const serviceCards = [
    { name: "Plumbing", icon: Wrench, image: "/copper-pipes-and-plumbing-fittings-close-up.jpg" },
    { name: "Electrical", icon: Zap, image: "/electrical-circuit-breaker-panel.jpg" },
    { name: "Roofing", icon: Home, image: "/asphalt-roof-shingles-residential-home.jpg" },
    { name: "Pet Grooming", icon: Dog, image: "/cute-fluffy-dog-portrait.jpg" },
    { name: "House Cleaning", icon: Sparkles, image: "/clean-organized-modern-living-room.jpg" },
    { name: "HVAC Maintenance", icon: Wind, image: "/air-conditioner-unit-on-house-exterior.jpg" },
    { name: "Tree Service", icon: Trees, image: "/large-tree-in-residential-backyard.jpg" },
    { name: "Carpet Cleaning", icon: Droplets, image: "/clean-fresh-beige-carpet.jpg" },
    { name: "Garage Door Repair", icon: Hammer, image: "/garage-door-panels-and-hardware.jpg" },
  ]

  return (
    <div className="min-h-screen relative">
      {/* Background Image with Teal Overlay */}
      <div className="fixed inset-0 z-0">
        <img src="/living-room-background.jpg" alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#03353a]/95 via-[#0d3d42]/90 to-[#328d87]/85" />
      </div>

      {/* Content wrapper with relative positioning */}
      <div className="relative z-10">
        {/* Header */}
        <header className="bg-[#03353a]/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 md:py-4">
            <div className="flex justify-between items-center">
              <Link href="/" className="flex items-center">
                <img src="/images/bidrr-white-logo.png" alt="Bidrr" className="h-8 md:h-10 w-auto" />
              </Link>

              <nav className="hidden md:flex items-center space-x-8">
                <a href="#services" className="text-white hover:text-gray-200 transition-colors font-medium">
                  Services
                </a>
                <a href="#how-it-works" className="text-white hover:text-gray-200 transition-colors font-medium">
                  How it works
                </a>
                <Link href="/pricing" className="text-white hover:text-gray-200 transition-colors font-medium">
                  Pricing
                </Link>
              </nav>

              <div className="hidden md:flex items-center space-x-4">
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    console.log("[v0] ========== LOGIN BUTTON CLICKED ==========")
                    console.log("[v0] Current URL:", window.location.href)
                    console.log("[v0] Target URL: /login")
                    console.log("[v0] Token exists:", !!localStorage.getItem("token"))
                    console.log("[v0] User exists:", !!localStorage.getItem("user"))
                    console.log("[v0] Navigating to /login...")
                    console.log("[v0] ===========================================")
                    window.location.href = "/login"
                  }}
                  className="text-white hover:text-gray-200 transition-colors font-medium cursor-pointer"
                >
                  Log in
                </button>
                <Link
                  href="/signup?role=contractor"
                  className="bg-[#e2bb12] text-[#03353a] px-5 py-2.5 rounded-lg font-semibold hover:bg-[#e2bb12]/90 transition-colors"
                >
                  Join as Contractor
                </Link>
              </div>

              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-white p-2">
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

            {isMobileMenuOpen && (
              <div className="md:hidden mt-4 pb-4 border-t border-teal-700 pt-4">
                <nav className="flex flex-col space-y-3">
                  <a
                    href="#services"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-white hover:text-gray-200 transition-colors font-medium"
                  >
                    Services
                  </a>
                  <a
                    href="#how-it-works"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-white hover:text-gray-200 transition-colors font-medium"
                  >
                    How it works
                  </a>
                  <Link
                    href="/pricing"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="text-white hover:text-gray-200 transition-colors font-medium"
                  >
                    Pricing
                  </Link>
                </nav>
                <div className="flex flex-col space-y-3 mt-4 pt-4 border-t border-teal-700">
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      setIsMobileMenuOpen(false)
                      console.log("[v0] ========== LOGIN BUTTON CLICKED (MOBILE) ==========")
                      console.log("[v0] Current URL:", window.location.href)
                      console.log("[v0] Target URL: /login")
                      console.log("[v0] Token exists:", !!localStorage.getItem("token"))
                      console.log("[v0] User exists:", !!localStorage.getItem("user"))
                      console.log("[v0] Navigating to /login...")
                      console.log("[v0] ======================================================")
                      window.location.href = "/login"
                    }}
                    className="text-white hover:text-gray-200 transition-colors font-medium text-left cursor-pointer"
                  >
                    Log in
                  </button>
                  <Link
                    href="/signup?role=contractor"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="bg-[#e2bb12] text-[#03353a] px-4 py-2 rounded-lg text-lg font-bold hover:bg-[#e2bb12]/90 transition-colors"
                  >
                    Join as Contractor
                  </Link>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Hero Section */}
        <section className="bg-transparent pt-16 md:pt-24 pb-20 md:pb-32">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6 leading-tight text-balance">
                {heroHeading}
              </h1>
              <p className="text-xl md:text-2xl text-gray-200 mb-12 text-pretty">
                Post your home job free. Compare bids. Hire with confidence.
              </p>

              <form onSubmit={handleSearch} className="relative max-w-3xl mx-auto" ref={autocompleteRef}>
                <div className="md:hidden flex items-center">
                  <div className="flex-1 flex items-center bg-white rounded-l-full shadow-xl pl-4 pr-2 py-3 min-w-0">
                    <Search className="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <input
                      id="search-input"
                      type="text"
                      placeholder="Search services"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => searchQuery.trim().length > 0 && setShowAutocomplete(true)}
                      className="flex-1 py-0 px-3 text-base text-gray-900 placeholder-gray-400 focus:outline-none bg-transparent min-w-0"
                      autoComplete="off"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-[#328d87] text-white rounded-r-full w-12 h-12 font-semibold hover:bg-[#328d87]/90 transition-colors flex items-center justify-center flex-shrink-0 shadow-xl"
                    aria-label="Search"
                  >
                    <ArrowRight className="h-5 w-5" />
                  </button>
                </div>

                {/* Desktop Search */}
                <div className="hidden md:flex items-center gap-0">
                  <div className="flex items-center bg-white rounded-l-full shadow-xl flex-1 h-12">
                    <Search className="ml-6 h-6 w-6 text-gray-400 flex-shrink-0" />
                    <input
                      type="text"
                      placeholder="Search services"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onFocus={() => searchQuery.trim().length > 0 && setShowAutocomplete(true)}
                      className="flex-1 px-4 text-lg text-gray-900 placeholder-gray-500 focus:outline-none h-full"
                      autoComplete="off"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-[#328d87] text-white rounded-r-full w-12 h-12 font-semibold hover:bg-[#328d87]/90 transition-colors flex items-center justify-center flex-shrink-0 shadow-xl"
                    aria-label="Search"
                  >
                    <ArrowRight className="h-6 w-6" />
                  </button>
                </div>

                {showAutocomplete && filteredServices.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-80 overflow-y-auto z-50">
                    {filteredServices.map((service, index) => (
                      <button
                        key={index}
                        onClick={() => handleServiceSelect(service)}
                        className="w-full text-left px-4 sm:px-6 py-3 hover:bg-gray-50 transition-colors text-gray-900 border-b border-gray-100 last:border-b-0"
                      >
                        {service}
                      </button>
                    ))}
                  </div>
                )}
              </form>

              <p className="mt-6 text-base text-gray-300">
                <span className="font-medium">Popular:</span> House Cleaning · Plumbing · Electrical
              </p>
            </div>

            <div className="mt-20 grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="text-5xl font-bold text-white mb-2">14,000+</div>
                <div className="text-gray-300 text-lg">Verified Professionals</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-white mb-2">96%</div>
                <div className="text-gray-300 text-lg">Customer Satisfaction</div>
              </div>
              <div className="text-center">
                <div className="text-5xl font-bold text-white mb-2">4.8★</div>
                <div className="text-gray-300 text-lg">Average Rating</div>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Services */}
        <section id="services" className="py-16 md:py-20 bg-transparent overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
            <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-4">Popular services</h2>
            <p className="text-xl text-gray-200 text-center max-w-3xl mx-auto">
              From routine maintenance to major renovations, find the right pro for every job
            </p>
          </div>

          <div className="relative">
            <div className="flex animate-scroll gap-6 px-4">
              {[...serviceCards, ...serviceCards, ...serviceCards].map((service, index) => (
                <Link
                  key={index}
                  href={`/signup?service=${encodeURIComponent(service.name)}`}
                  className="flex-shrink-0 w-[260px] sm:w-[280px] md:w-[320px] group"
                >
                  <div className="relative rounded-2xl overflow-hidden shadow-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 h-[240px]">
                    <img
                      src={service.image || "/placeholder.svg"}
                      alt={service.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-5 flex items-center gap-3">
                      {React.createElement(service.icon, { className: "h-6 w-6 text-white flex-shrink-0" })}
                      <span className="font-bold text-white text-lg">{service.name}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <style jsx>{`
            @keyframes scroll {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(calc(-320px * 14 - 24px * 14));
              }
            }

            .animate-scroll {
              animation: scroll 65s linear infinite;
              width: fit-content;
            }

            .animate-scroll:hover {
              animation-play-state: paused;
            }
          `}</style>
        </section>

        {/* How it Works */}
        <section id="how-it-works" className="py-20 md:py-28 bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-4">How it works</h2>
            <p className="text-xl text-gray-200 text-center mb-16">Get your project done in three simple steps</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#328d87] text-white text-3xl font-bold mb-6">
                  1
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Post your job</h3>
                <p className="text-gray-200 text-lg">Describe what you need. It's free and takes less than a minute.</p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#328d87] text-white text-3xl font-bold mb-6">
                  2
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Receive Bids</h3>
                <p className="text-gray-200 text-lg">
                  Receive competitive bids from verified professionals in your area.
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[#328d87] text-white text-3xl font-bold mb-6">
                  3
                </div>
                <h3 className="text-2xl font-bold text-white mb-3">Hire with confidence</h3>
                <p className="text-gray-200 text-lg">Compare profiles, reviews, and prices to choose the best pro.</p>
              </div>
            </div>

            <div className="text-center mt-16">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-[#e2bb12] text-[#03353a] px-10 py-4 rounded-lg text-lg font-bold hover:bg-[#e2bb12]/90 transition-colors shadow-lg"
              >
                Get started—it's free
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 md:py-28 bg-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-4">Trusted by thousands</h2>
            <p className="text-xl text-gray-200 text-center mb-16">See what homeowners and pros are saying</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              <div className="bg-[#0d3d42]/60 backdrop-blur-sm rounded-xl shadow-xl p-8 border border-[#328d87]/30">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-[#e2bb12] text-2xl">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-gray-200 mb-6 text-lg leading-relaxed">
                  Found an amazing plumber within 30 minutes. The whole process was seamless and professional.
                </p>
                <div>
                  <div className="font-bold text-white text-lg">Sarah M.</div>
                  <div className="text-sm text-gray-300">Homeowner</div>
                </div>
              </div>

              <div className="bg-[#0d3d42]/60 backdrop-blur-sm rounded-xl shadow-xl p-8 border border-[#328d87]/30">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-[#e2bb12] text-2xl">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-gray-200 mb-6 text-lg leading-relaxed">
                  Bidrr has helped me grow my business significantly. The quality of leads is excellent.
                </p>
                <div>
                  <div className="font-bold text-white text-lg">Mike T.</div>
                  <div className="text-sm text-gray-300">Contractor</div>
                </div>
              </div>

              <div className="bg-[#0d3d42]/60 backdrop-blur-sm rounded-xl shadow-xl p-8 border border-[#328d87]/30">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-[#e2bb12] text-2xl">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-gray-200 mb-6 text-lg leading-relaxed">
                  Best platform for finding reliable contractors. Saved me so much time and hassle!
                </p>
                <div>
                  <div className="font-bold text-white text-lg">Jennifer L.</div>
                  <div className="text-sm text-gray-300">Homeowner</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-20 md:py-28 bg-[#328d87]/40 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white mb-6">Ready to get your project started?</h2>
            <p className="text-xl text-white/90 mb-10">
              Join thousands of homeowners who've found the perfect pro for their home projects
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/signup"
                className="bg-[#e2bb12] text-[#03353a] px-10 py-4 rounded-lg text-lg font-bold hover:bg-[#e2bb12]/90 transition-colors shadow-lg"
              >
                Post a job for free
              </Link>
              <Link
                href="/signup?role=contractor"
                className="bg-transparent text-white px-10 py-4 rounded-lg text-lg font-bold hover:bg-white/10 transition-colors border-2 border-white"
              >
                Join as Contractor
              </Link>
            </div>
          </div>
        </section>

        <SiteFooter />
      </div>
    </div>
  )
}
