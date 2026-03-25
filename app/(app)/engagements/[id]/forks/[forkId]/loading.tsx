export default function ForkDetailLoading() {
  return (
    <div className="p-8">
      <div className="flex flex-col gap-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between gap-4">
          <div className="h-4 w-40 rounded bg-muted animate-pulse" />
          <div className="h-4 w-16 rounded bg-muted animate-pulse" />
        </div>

        {/* Title skeleton */}
        <div className="h-6 w-72 rounded bg-muted animate-pulse" />

        {/* Two-column skeleton */}
        <div className="flex gap-8 items-start">
          {/* Editor area */}
          <div className="flex-1 min-w-0">
            <div className="h-10 w-48 rounded bg-muted animate-pulse mb-4" />
            <div className="h-[400px] rounded-lg bg-muted animate-pulse" />
          </div>

          {/* Sidebar */}
          <div className="w-[280px] shrink-0 flex flex-col gap-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex flex-col gap-2 py-4 border-t border-border">
                <div className="h-3 w-24 rounded bg-muted animate-pulse" />
                <div className="h-8 w-full rounded bg-muted animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
