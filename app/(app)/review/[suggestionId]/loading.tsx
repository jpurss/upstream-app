import { Skeleton } from '@/components/ui/skeleton'

export default function ReviewDetailLoading() {
  return (
    <div className="p-6 max-w-6xl flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Skeleton className="h-5 w-48" />
        <Skeleton className="h-7 w-72" />
      </div>
      {/* Context bar */}
      <Skeleton className="h-16 w-full rounded-md" />
      {/* Tab bar */}
      <Skeleton className="h-8 w-64" />
      {/* Diff area */}
      <Skeleton className="h-[400px] w-full rounded-md" />
      {/* Action bar */}
      <Skeleton className="h-16 w-full rounded-md" />
    </div>
  )
}
