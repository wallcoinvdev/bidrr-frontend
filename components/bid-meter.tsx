"use client"

interface BidMeterProps {
  currentBids: number
  maxBids?: number
  className?: string
  showLabel?: boolean
}

export function BidMeter({ currentBids, maxBids = 5, className = "", showLabel = true }: BidMeterProps) {
  const percentage = (currentBids / maxBids) * 100

  // Color coding based on fill level
  const getColor = () => {
    if (currentBids >= maxBids) return "bg-red-500"
    if (currentBids >= maxBids - 1) return "bg-yellow-500"
    return "bg-[#0F766E]"
  }

  const getTextColor = () => {
    if (currentBids >= maxBids) return "text-red-700"
    if (currentBids >= maxBids - 1) return "text-yellow-700"
    return "text-[#0F766E]"
  }

  return (
    <div className={className}>
      {showLabel && (
        <p className={`text-sm font-semibold mb-2 ${getTextColor()}`}>
          {currentBids}/{maxBids} bids placed!
        </p>
      )}

      {/* 5-segment progress bar */}
      <div className="flex gap-1">
        {Array.from({ length: maxBids }).map((_, index) => (
          <div
            key={index}
            className={`h-2 flex-1 rounded-full transition-colors ${index < currentBids ? getColor() : "bg-gray-200"}`}
          />
        ))}
      </div>
    </div>
  )
}
