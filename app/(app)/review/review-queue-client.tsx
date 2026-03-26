'use client'

import { useRouter } from 'next/navigation'
import { GitMerge } from 'lucide-react'
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs'
import { ReviewQueueCard } from '@/components/review/review-queue-card'
import type { MergeSuggestion } from '@/lib/types/merge'

interface ReviewQueueClientProps {
  suggestions: MergeSuggestion[]
  currentStatus: string
}

const emptyHeadings: Record<string, string> = {
  pending: 'No pending merge suggestions',
  approved: 'No approved merge suggestions',
  declined: 'No declined merge suggestions',
  all: 'No merge suggestions yet',
}

export function ReviewQueueClient({ suggestions, currentStatus }: ReviewQueueClientProps) {
  const router = useRouter()

  function handleTabChange(val: string) {
    router.push('/review?status=' + val)
  }

  const emptyHeading = emptyHeadings[currentStatus] ?? emptyHeadings.pending

  return (
    <div className="p-6 max-w-4xl">
      <h1 className="text-[20px] font-semibold">Review Queue</h1>

      <div className="mt-4">
        <Tabs value={currentStatus} onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="approved">Approved</TabsTrigger>
            <TabsTrigger value="declined">Declined</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {suggestions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <GitMerge className="size-8 text-muted-foreground mb-4" />
          <h2 className="text-[16px] font-semibold">{emptyHeading}</h2>
          <p className="text-[13px] text-muted-foreground mt-1 max-w-[400px]">
            When consultants suggest merging their improvements, they&apos;ll appear here for review.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 mt-4">
          {suggestions.map((s) => (
            <ReviewQueueCard key={s.id} suggestion={s} />
          ))}
        </div>
      )}
    </div>
  )
}
