import { Skeleton } from '@/components/ui/skeleton'

export default function EngagementsLoading() {
  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <Skeleton className="h-7 w-36" />
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="w-full h-[120px]" />
        ))}
      </div>
    </div>
  )
}
