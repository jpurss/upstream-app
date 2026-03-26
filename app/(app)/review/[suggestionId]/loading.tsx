import { Skeleton } from '@/components/ui/skeleton'

export default function ReviewDetailLoading() {
  return (
    <div className="p-6 max-w-6xl">
      <Skeleton className="h-5 w-48 mb-4" />
      <Skeleton className="h-7 w-72 mb-6" />
      <div className="flex gap-8">
        <Skeleton className="flex-1 h-[400px] rounded-md" />
        <Skeleton className="w-[280px] h-[500px] rounded-md" />
      </div>
    </div>
  )
}
