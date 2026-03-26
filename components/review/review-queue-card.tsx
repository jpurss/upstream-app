'use client'

import Link from 'next/link'
import { Clock, Check, X } from 'lucide-react'
import { StarRating } from '@/components/engagements/star-rating'
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip'
import { getRelativeTime } from '@/lib/utils/date'
import type { MergeSuggestion } from '@/lib/types/merge'

const statusConfig = {
  pending: { bg: 'bg-[#FFB852]/15', text: 'text-[#FFB852]', icon: Clock, label: 'Pending Review' },
  approved: { bg: 'bg-[#65CFB2]/15', text: 'text-[#65CFB2]', icon: Check, label: 'Merged' },
  declined: { bg: 'bg-[#E3392A]/15', text: 'text-[#E3392A]', icon: X, label: 'Declined' },
} as const

interface ReviewQueueCardProps {
  suggestion: MergeSuggestion
}

export function ReviewQueueCard({ suggestion }: ReviewQueueCardProps) {
  const config = statusConfig[suggestion.merge_status as keyof typeof statusConfig] ?? statusConfig.pending
  const StatusIcon = config.icon

  return (
    <Link href={'/review/' + suggestion.id} className="block">
      <div className="bg-card border border-border rounded-md px-4 py-4 hover:border-[#4287FF] transition-colors cursor-pointer">
        {/* Row 1: title + status badge */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[16px] font-semibold truncate">{suggestion.source_prompt_title}</span>
          <span
            className={`inline-flex items-center gap-1 shrink-0 rounded-full px-2 py-0.5 text-[12px] font-medium ${config.bg} ${config.text}`}
          >
            <StatusIcon className="size-3" />
            {config.label}
          </span>
        </div>

        {/* Row 2: submitter + engagement + relative time */}
        <div className="text-[13px] text-muted-foreground mt-1">
          Suggested by {suggestion.submitter_name} · {suggestion.engagement_name} · {getRelativeTime(suggestion.forked_at)}
        </div>

        {/* Row 3: star rating (read-only) */}
        <div className="mt-2">
          <StarRating rating={suggestion.effectiveness_rating} showLabel={false} />
        </div>

        {/* Row 4: merge note preview with tooltip */}
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
