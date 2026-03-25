import { Skeleton } from '@/components/ui/skeleton'

export default function PromptDetailLoading() {
  return (
    <div className="p-8">
      {/* Back link skeleton */}
      <Skeleton className="h-4 w-16 mb-6" />

      {/* Title skeleton */}
      <Skeleton className="h-7 w-96 mb-2" />

      {/* Description skeleton */}
      <Skeleton className="h-4 w-72 mb-8" />

      {/* Two-column layout */}
      <div className="flex gap-8">
        {/* Content column — 8 staggered skeleton lines */}
        <div className="flex-1 min-w-0 flex flex-col gap-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>

        {/* Sidebar skeleton */}
        <div className="w-[280px] flex flex-col gap-4">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    </div>
  )
}
