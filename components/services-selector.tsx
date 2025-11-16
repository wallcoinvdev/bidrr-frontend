"use client"
import { useState, useRef, useEffect } from "react"
import type React from "react"

import { Search, X } from 'lucide-react'
import { SERVICES } from "@/lib/services"

interface ServicesSelectorProps {
  value: string[]
  onChange: (services: string[]) => void
}

export function ServicesSelector({ value, onChange }: ServicesSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showDropdown, setShowDropdown] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const filteredServices = SERVICES.filter(
    (service) => service.toLowerCase().includes(searchQuery.toLowerCase()) && !value.includes(service),
  )

  // Handle clicking outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setShowDropdown(query.trim().length > 0)
  }

  const addService = (service: string) => {
    if (!value.includes(service)) {
      onChange([...value, service])
    }
    setSearchQuery("")
    setShowDropdown(false)
    inputRef.current?.focus()
  }

  const removeService = (service: string) => {
    onChange(value.filter((s) => s !== service))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && filteredServices.length > 0) {
      e.preventDefault()
      addService(filteredServices[0])
    }
  }

  return (
    <div className="space-y-4" ref={containerRef}>
      {/* Search Input */}
      <div className="relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => searchQuery.trim() && setShowDropdown(true)}
            onKeyDown={handleKeyDown}
            placeholder="Add services"
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#328d87] focus:border-transparent"
          />
        </div>

        {/* Dropdown with filtered services */}
        {showDropdown && filteredServices.length > 0 && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-48 overflow-y-auto">
            {filteredServices.map((service) => (
              <button
                key={service}
                type="button"
                onClick={() => addService(service)}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 text-sm text-gray-700"
              >
                {service}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Services Tags */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((service) => (
            <div
              key={service}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-50 text-cyan-700 rounded-full border border-cyan-200"
            >
              <span className="text-sm">{service}</span>
              <button
                type="button"
                onClick={() => removeService(service)}
                className="hover:bg-cyan-100 rounded-full p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {value.length === 0 && <p className="text-sm text-gray-500">Start typing to search and add services</p>}
    </div>
  )
}
