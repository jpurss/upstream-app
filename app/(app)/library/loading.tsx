import { Skeleton } from '@/components/ui/skeleton'

export default function LibraryLoading() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <Skeleton className="h-7 w-48" />
        <div />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="h-[180px] w-full rounded-[0.625rem]" />
        ))}
      </div>
    </div>
  )
}
