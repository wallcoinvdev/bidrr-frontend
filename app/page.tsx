"use client"

import React from "react"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Search,
  Wrench,
  Zap,
  Home,
  Dog,
  Sparkles,
  Wind,
  Trees,
  Paintbrush,
  Droplets,
  Eye,
  Hammer,
  FenceIcon,
  TreeDeciduous,
  Drill,
  Droplet,
  X,
  Menu,
  ArrowRight,
} from "lucide-react"
import { SERVICES } from "@/lib/services"

export default function HomePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [showAutocomplete, setShowAutocomplete] = useState(false)
  const [filteredServices, setFilteredServices] = useState<string[]>([])
  const autocompleteRef = useRef<HTMLDivElement>(null)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (searchQuery.trim().length > 0) {
      const filtered = SERVICES.filter((service) => service.toLowerCase().includes(searchQuery.toLowerCase())).slice(
        0,
        8,
      ) // Limit to 8 suggestions
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
    { name: "Landscaping", icon: Trees, image: "/lush-green-manicured-lawn.jpg" },
    { name: "Painting & Decorating", icon: Paintbrush, image: "/wall-freshly-painted-with-roller-one-side.jpg" },
    { name: "Carpet Cleaning", icon: Droplets, image: "/clean-fresh-beige-carpet.jpg" },
    { name: "Window Cleaning", icon: Eye, image: "/sparkling-clean-residential-window.jpg" },
    { name: "Garage Door Repair", icon: Hammer, image: "/garage-door-panels-and-hardware.jpg" },
    { name: "Deck Construction", icon: Drill, image: "/wooden-deck-boards-and-construction-tools.jpg" },
    { name: "Gutter Installation & Cleaning", icon: Droplet, image: "/rain-gutter-system-on-house.jpg" },
    { name: "Appliance Repair", icon: Wrench, image: "/stainless-steel-refrigerator-appliance.jpg" },
    { name: "Fencing", icon: FenceIcon, image: "/wooden-fence-panels-in-backyard.jpg" },
    { name: "Tree Removal", icon: TreeDeciduous, image: "/large-tree-in-residential-backyard.jpg" },
  ]

  return (
    <div className="min-h-screen relative">
      {/* Living room background image - fixed to viewport */}
      <div
        className="fixed inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: "url('/living-room-background.jpg')" }}
      />
      {/* Green/teal overlay with transparency to show living room subtly - fixed to viewport */}
      <div className="fixed inset-0 bg-[#0d3d42]/95 z-0" />

      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-[#1a4f54]">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <img src="/images/logo-white.png" alt="homeHero" className="h-8" />
            </Link>
            <nav className="hidden md:flex items-center gap-8">
              <Link href="#services" className="text-white/90 hover:text-white transition-colors">
                Services
              </Link>
              <Link href="#how-it-works" className="text-white/90 hover:text-white transition-colors">
                How it works
              </Link>
              <Link href="/pricing" className="text-white/90 hover:text-white transition-colors">
                Pricing
              </Link>
            </nav>
            <div className="hidden md:flex items-center gap-4">
              <Link href="/login" className="text-white/90 hover:text-white transition-colors">
                Log in
              </Link>
              <Link
                href="/verify-phone/contractor"
                className="bg-[#e2bb12] hover:bg-[#d4ad11] text-[#0d3d42] font-semibold px-6 py-2 rounded-full transition-colors"
              >
                Join as Contractor
              </Link>
            </div>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="md:hidden text-white p-2">
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
          {isMobileMenuOpen && (
            <div className="md:hidden bg-[#0d3d42] border-t border-[#1a4f54]">
              <nav className="container mx-auto px-4 py-4 flex flex-col gap-4">
                <Link
                  href="#services"
                  className="text-white/90 hover:text-white transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Services
                </Link>
                <Link
                  href="#how-it-works"
                  className="text-white/90 hover:text-white transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  How it works
                </Link>
                <Link
                  href="/pricing"
                  className="text-white/90 hover:text-white transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <div className="border-t border-[#1a4f54] pt-4 mt-2 flex flex-col gap-3">
                  <Link
                    href="/login"
                    className="text-white/90 hover:text-white transition-colors py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Log in
                  </Link>
                  <Link
                    href="/verify-phone/contractor"
                    className="bg-[#e2bb12] hover:bg-white/10 text-white font-semibold px-6 py-3 rounded-full transition-colors text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Join as Contractor
                  </Link>
                </div>
              </nav>
            </div>
          )}
        </header>

        {/* Hero Section */}
        <section className="container mx-auto px-4 py-12 md:py-20 text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 md:mb-6 text-balance leading-tight">
            Stop Hunting for Contractors
            <br />
            —Let Them Bid on You
          </h1>
          <p className="text-lg md:text-xl text-white/80 mb-8 md:mb-12 max-w-3xl mx-auto px-4">
            Post your home job free. Compare bids. Hire with confidence.
          </p>

          {/* Search Bar with Autocomplete */}
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto mb-6 md:mb-8 relative" ref={autocompleteRef}>
            <div className="flex items-center bg-white rounded-full overflow-hidden shadow-lg">
              <div className="flex items-center pl-4 sm:pl-6 pr-2">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="What do you need done?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.trim().length > 0 && setShowAutocomplete(true)}
                className="flex-1 py-2 md:py-4 px-2 text-sm md:text-base text-gray-900 placeholder-gray-400 focus:outline-none"
                autoComplete="off"
              />
              <Link
                href="/verify-phone/homeowner"
                className="bg-[#328d87] hover:bg-[#2d7f7a] text-white font-semibold transition-colors flex items-center justify-center md:px-8 px-3 py-2 md:py-4"
              >
                <ArrowRight className="h-5 w-5 md:hidden" />
                <span className="hidden md:inline text-sm md:text-base whitespace-nowrap">Get started</span>
              </Link>
            </div>

            {showAutocomplete && filteredServices.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-gray-200 max-h-80 overflow-y-auto z-50">
                {filteredServices.map((service, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => handleServiceSelect(service)}
                    className="w-full text-left px-4 sm:px-6 py-3 hover:bg-gray-50 transition-colors text-gray-900 border-b border-gray-100 last:border-b-0"
                  >
                    {service}
                  </button>
                ))}
              </div>
            )}
          </form>

          <p className="text-white/60 text-sm px-4">
            <span className="font-semibold text-white/80">Popular:</span> House Cleaning · Plumbing · Electrical
          </p>
        </section>

        {/* Stats Section */}
        <section className="border-t border-b border-[#1a4f54] py-8 md:py-12">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-8 text-center">
              <div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">14,000+</div>
                <div className="text-white/70 text-sm md:text-base">Verified Professionals</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">96%</div>
                <div className="text-white/70 text-sm md:text-base">Customer Satisfaction</div>
              </div>
              <div>
                <div className="text-4xl md:text-5xl font-bold text-white mb-2">4.8★</div>
                <div className="text-white/70 text-sm md:text-base">Average Rating</div>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Services - Converted to auto-scrolling carousel */}
        <section id="services" className="py-12 md:py-16 overflow-hidden">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-3 md:mb-4">Popular services</h2>
            <p className="text-center text-white/70 mb-8 md:mb-12 max-w-3xl mx-auto px-4">
              From routine maintenance to major renovations, find the right pro for every job
            </p>

            <div className="relative">
              <div className="flex gap-4 md:gap-6 animate-scroll">
                {[...serviceCards, ...serviceCards, ...serviceCards].map((service, index) => (
                  <Link
                    key={index}
                    href={`/signup?service=${encodeURIComponent(service.name.toLowerCase())}`}
                    className="group flex-shrink-0 w-64 sm:w-72 md:w-80"
                  >
                    <div className="relative h-48 sm:h-56 md:h-64 rounded-lg overflow-hidden">
                      <img
                        src={service.image || "/placeholder.svg"}
                        alt={service.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6">
                        <div className="flex items-center gap-2 text-white">
                          {React.createElement(service.icon, { className: "h-5 w-5 md:h-6 md:w-6" })}
                          <span className="text-lg md:text-xl font-semibold">{service.name}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          <style jsx>{`
            @keyframes scroll {
              0% {
                transform: translateX(0);
              }
              100% {
                transform: translateX(calc(-320px * 16 - 24px * 16));
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

        {/* How It Works */}
        <section id="how-it-works" className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-3 md:mb-4">How it works</h2>
            <p className="text-center text-white/70 mb-12 md:mb-16 px-4">Get your project done in three simple steps</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-8 md:mb-12">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#328d87] text-white text-2xl md:text-3xl font-bold mb-4 md:mb-6">
                  1
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">Post your job</h3>
                <p className="text-white/70 px-4">Describe what you need. It's free and takes less than a minute.</p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#328d87] text-white text-2xl md:text-3xl font-bold mb-4 md:mb-6">
                  2
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">Receive Bids</h3>
                <p className="text-white/70 px-4">Receive competitive bids from verified professionals in your area.</p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 rounded-full bg-[#328d87] text-white text-2xl md:text-3xl font-bold mb-4 md:mb-6">
                  3
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white mb-3 md:mb-4">Hire with confidence</h3>
                <p className="text-white/70 px-4">Compare profiles, reviews, and prices to choose the best pro.</p>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/signup"
                className="inline-flex items-center gap-2 bg-[#e2bb12] hover:bg-[#d4ad11] text-[#0d3d42] font-semibold px-6 md:px-8 py-3 md:py-4 rounded-full transition-colors text-base md:text-lg"
              >
                Get started—it's free →
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-3 md:mb-4">Trusted by thousands</h2>
            <p className="text-center text-white/70 mb-8 md:mb-12 px-4">See what homeowners and pros are saying</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
              <div className="bg-[#1a4f54] rounded-lg p-6 md:p-8 border border-[#2d6b71]">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-[#e2bb12] text-lg md:text-xl">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-white/90 mb-4 md:mb-6 text-sm md:text-base">
                  Found an amazing plumber within 30 minutes. The whole process was seamless and professional.
                </p>
                <div>
                  <div className="font-semibold text-white">Sarah M.</div>
                  <div className="text-white/60 text-sm">Homeowner</div>
                </div>
              </div>

              <div className="bg-[#1a4f54] rounded-lg p-6 md:p-8 border border-[#2d6b71]">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-[#e2bb12] text-lg md:text-xl">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-white/90 mb-4 md:mb-6 text-sm md:text-base">
                  HomeHero has helped me grow my business significantly. The quality of leads is excellent.
                </p>
                <div>
                  <div className="font-semibold text-white">Mike T.</div>
                  <div className="text-white/60 text-sm">Contractor</div>
                </div>
              </div>

              <div className="bg-[#1a4f54] rounded-lg p-6 md:p-8 border border-[#2d6b71]">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-[#e2bb12] text-lg md:text-xl">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-white/90 mb-4 md:mb-6 text-sm md:text-base">
                  Best platform for finding reliable contractors. Saved me so much time and hassle!
                </p>
                <div>
                  <div className="font-semibold text-white">Jennifer L.</div>
                  <div className="text-white/60 text-sm">Homeowner</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-[#328d87] py-12 md:py-16">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3 md:mb-4 px-4">
              Ready to get your project started?
            </h2>
            <p className="text-lg md:text-xl text-white/90 mb-6 md:mb-8 max-w-3xl mx-auto px-4">
              Join thousands of homeowners who've found the perfect pro for their home projects
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center px-4">
              <Link
                href="/verify-phone/homeowner"
                className="inline-block bg-white hover:bg-gray-100 text-[#328d87] font-semibold px-6 md:px-8 py-3 md:py-4 rounded-full transition-colors text-base md:text-lg"
              >
                Post a job for free
              </Link>
              <Link
                href="/verify-phone/contractor"
                className="inline-block border-2 border-white hover:bg-white/10 text-white font-semibold px-6 md:px-8 py-3 md:py-4 rounded-full transition-colors text-base md:text-lg"
              >
                Join as Contractor
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-[#03353a] py-8 md:py-12">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 md:gap-8">
              <Link href="/" className="flex items-center">
                <img src="/images/logo-white.png" alt="homeHero" className="h-8" />
              </Link>
              <nav className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8">
                <Link href="/privacy" className="text-white/70 hover:text-white transition-colors">
                  Privacy
                </Link>
                <Link href="/terms" className="text-white/70 hover:text-white transition-colors">
                  Terms of Service
                </Link>
                <Link href="/help" className="text-white/70 hover:text-white transition-colors">
                  Help
                </Link>
              </nav>
              <div className="text-white/60 text-sm text-center">© 2025 HomeHero. All rights reserved.</div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
