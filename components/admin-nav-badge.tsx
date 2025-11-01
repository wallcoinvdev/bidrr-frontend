interface AdminNavBadgeProps {
  count: number
}

export function AdminNavBadge({ count }: AdminNavBadgeProps) {
  if (count === 0) return null

  return (
    <div className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-yellow-500 px-1.5 text-xs font-bold text-gray-900 tabular-nums">
      {count > 99 ? "99+" : count}
    </div>
  )
}
