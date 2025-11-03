import { BadgeCheck, Shield } from "lucide-react"

interface VerifiedBadgeProps {
  type: "phone" | "google"
  size?: "sm" | "md" | "lg"
  showTooltip?: boolean
}

export function VerifiedBadge({ type, size = "md", showTooltip = true }: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  }

  const isPhone = type === "phone"
  const Icon = isPhone ? Shield : BadgeCheck
  const colorClass = isPhone ? "text-blue-600 fill-blue-600" : "text-green-600 fill-green-600"
  const tooltipText = isPhone ? "Verified by Phone" : "Verified with Google"

  return (
    <div className="relative group inline-flex">
      <Icon className={`${sizeClasses[size]} ${colorClass} flex-shrink-0`} />
      {showTooltip && (
        <span className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
          {tooltipText}
        </span>
      )}
    </div>
  )
}
