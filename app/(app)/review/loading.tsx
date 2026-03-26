import { Skeleton } from '@/components/ui/skeleton'

export default function ReviewQueueLoading() {
  return (
    <div className="p-6 max-w-4xl">
      <Skeleton className="h-7 w-40 mb-6" />
      <Skeleton className="h-9 w-80 mb-6" />
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[140px] w-full rounded-md" />
        ))}
      </div>
    </div>
  )
}
