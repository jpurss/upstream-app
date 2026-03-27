'use client'

import Link from 'next/link'
import { StarRating } from '@/components/engagements/star-rating'
import { StatusBadge } from '@/components/review/status-badge'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip'
import type { MergeSuggestion } from '@/lib/types/merge'
import { getRelativeTime } from '@/lib/utils/date'

interface ReviewQueueCardProps {
  suggestion: MergeSuggestion
}

export function ReviewQueueCard({ suggestion }: ReviewQueueCardProps) {
  return (
    <Link href={'/review/' + suggestion.id} className="block">
      <div className="bg-card border border-border rounded-md px-4 py-4 hover:border-[#4287FF] transition-colors cursor-pointer">
        {/* Row 1: title + rating + status badge */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[16px] font-semibold truncate min-w-0">{suggestion.source_prompt_title}</span>
          <div className="flex items-center gap-2 shrink-0">
            <StarRating rating={suggestion.effectiveness_rating} showLabel={false} />
            <StatusBadge status={suggestion.merge_status} />
          </div>
        </div>

        {/* Row 2: submitter + engagement + relative time */}
        <div className="text-[13px] text-muted-foreground mt-1">
          Suggested by {suggestion.submitter_name} · {suggestion.engagement_name} · {getRelativeTime(suggestion.forked_at)}
        </div>

        {/* Row 3: merge note preview with tooltip */}
        {suggestion.merge_suggestion && (
          <div className="mt-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <p className="text-[13px] text-foreground italic line-clamp-2 cursor-default">
                    {suggestion.merge_suggestion}
                  </p>
                </TooltipTrigger>
                <TooltipContent>
                  <span>{suggestion.merge_suggestion}</span>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>
    </Link>
  )
}
