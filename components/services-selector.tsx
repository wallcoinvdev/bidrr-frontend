"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { X, Search } from "lucide-react"
import { SERVICES } from "@/lib/services"

interface ServicesSelectorProps {
  selectedServices: string[]
  onChange: (services: string[]) => void
}

export function ServicesSelector({ selectedServices, onChange }: ServicesSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const filteredServices = SERVICES.filter(
    (service) => service.toLowerCase().includes(searchQuery.toLowerCase()) && !selectedServices.includes(service),
  )

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const addService = (service: string) => {
    if (!selectedServices.includes(service)) {
      onChange([...selectedServices, service])
      setSearchQuery("")
      inputRef.current?.focus()
    }
  }

  const removeService = (service: string) => {
    onChange(selectedServices.filter((s) => s !== service))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && filteredServices.length > 0) {
      e.preventDefault()
      addService(filteredServices[0])
    }
  }

  return (
    <div className="space-y-3" ref={containerRef}>
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#d8e2fb]/60" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              setShowSuggestions(true)
            }}
            onFocus={() => setShowSuggestions(true)}
            onKeyDown={handleKeyDown}
            placeholder="Search and add services..."
            className="w-full pl-10 pr-4 py-3 bg-[#0D3D42] border border-[#d8e2fb]/20 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent outline-none transition-all text-[#d8e2fb] placeholder:text-[#d8e2fb]/50"
          />
        </div>

        {/* Autocomplete dropdown */}
        {showSuggestions && searchQuery && filteredServices.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
            {filteredServices.map((service) => (
              <button
                key={service}
                type="button"
                onClick={() => addService(service)}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 transition-colors text-gray-700"
              >
                {service}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected services tags */}
      {selectedServices.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedServices.map((service) => (
            <div
              key={service}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-[#328d87]/20 border border-[#328d87]/40 rounded-full text-sm font-medium text-[#d8e2fb]"
            >
              {service}
              <button
                type="button"
                onClick={() => removeService(service)}
                className="hover:bg-[#328d87]/30 rounded-full p-0.5 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {selectedServices.length === 0 && (
        <p className="text-xs text-[#d8e2fb]/60">Start typing to search and add services</p>
      )}
    </div>
  )
}
