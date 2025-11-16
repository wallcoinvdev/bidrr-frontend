import { BadgeCheck, Shield } from "lucide-react"

interface VerifiedBadgeProps {
  type: "phone" | "google"
  size?: "sm" | "md" | "lg"
  showTooltip?: boolean
  showLabel?: boolean
}

export function VerifiedBadge({ type, size = "md", showTooltip = true, showLabel = false }: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }

  const isPhone = type === "phone"
  const Icon = isPhone ? Shield : BadgeCheck
  const colorClass = isPhone ? "text-blue-600 fill-blue-600" : "text-[#F4B400] fill-[#F4B400]"
  const tooltipText = isPhone ? "Phone verified" : "Google verified"

  if (showLabel) {
    return (
      <div className="flex items-center gap-1.5">
        <Icon className={`${sizeClasses[size]} ${colorClass}`} />
        <span className="text-sm font-medium text-gray-700">{tooltipText}</span>
      </div>
    )
  }

  return (
    <div className="relative group inline-block">
      <Icon className={`${sizeClasses[size]} ${colorClass}`} />
      {showTooltip && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          {tooltipText}
        </div>
      )}
    </div>
  )
}
