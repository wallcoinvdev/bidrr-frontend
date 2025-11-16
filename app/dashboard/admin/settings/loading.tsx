export default function SettingsLoading() {
  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-9 w-64 bg-muted rounded animate-pulse" />
          <div className="h-5 w-96 bg-muted rounded animate-pulse mt-2" />
        </div>
        <div className="h-10 w-32 bg-muted rounded animate-pulse" />
      </div>

      <div className="flex gap-2 border-b mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-12 w-40 bg-muted rounded-t animate-pulse" />
        ))}
      </div>

      <div className="space-y-8">
        <div className="bg-white rounded-lg border p-6">
          <div className="h-6 w-48 bg-muted rounded animate-pulse mb-4" />
          <div className="space-y-4">
            <div className="h-12 bg-muted rounded animate-pulse" />
            <div className="h-32 bg-muted rounded animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  )
}
