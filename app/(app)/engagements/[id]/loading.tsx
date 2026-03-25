import { Skeleton } from '@/components/ui/skeleton'

export default function EngagementWorkspaceLoading() {
  return (
    <div className="p-8">
      {/* Workspace header skeleton */}
      <div className="flex items-start justify-between gap-4 pb-6">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-5 w-40" />
        </div>
        <div className="flex items-center gap-3">
          <Skeleton className="h-8 w-28" />
          <Skeleton className="h-8 w-20" />
        </div>
      </div>

      {/* Fork card skeletons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-[96px] w-full rounded-xl" />
        ))}
      </div>
    </div>
  )
}
