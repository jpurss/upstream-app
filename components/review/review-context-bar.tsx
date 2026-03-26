'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ExternalLink, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StarRating } from '@/components/engagements/star-rating'
import { IssueTagGroup } from '@/components/engagements/issue-tag-group'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import type { MergeSuggestion } from '@/lib/types/merge'

interface ReviewContextBarProps {
  suggestion: MergeSuggestion
}

export function ReviewContextBar({ suggestion }: ReviewContextBarProps) {
  const [showMore, setShowMore] = useState(false)

  const hasMoreContext = !!(suggestion.feedback_notes || suggestion.adaptation_notes)

  return (
    <div className="bg-card border border-border rounded-md px-4 py-3">
      {/* Row 1 — key metadata */}
      <div className="flex items-center gap-6 flex-wrap">
        {/* Suggested by */}
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] text-muted-foreground">Suggested by:</span>
          <span className="text-[13px] text-foreground">{suggestion.submitter_name}</span>
        </div>

        {/* Pipe separator */}
        <div className="border-l border-border h-4" />

        {/* Engagement */}
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] text-muted-foreground">Engagement:</span>
          <Link
            href={`/engagements/${suggestion.engagement_id}`}
            className="flex items-center gap-1 text-[13px] text-foreground hover:text-primary transition-colors"
          >
            {suggestion.engagement_name}
            <ExternalLink className="size-3 shrink-0" />
          </Link>
        </div>

        {/* Pipe separator */}
        <div className="border-l border-border h-4" />

        {/* Rating */}
        <div className="flex items-center gap-1.5">
          <span className="text-[13px] text-muted-foreground">Rating:</span>
          {suggestion.effectiveness_rating ? (
            <StarRating rating={suggestion.effectiveness_rating} showLabel={false} />
          ) : (
            <span className="text-[13px] text-muted-foreground">No rating</span>
          )}
        </div>

        {/* Issues — only if present */}
        {suggestion.issues && suggestion.issues.length > 0 && (
          <>
            <div className="border-l border-border h-4" />
            <div className="flex items-center gap-1.5">
              <span className="text-[13px] text-muted-foreground">Issues:</span>
              <IssueTagGroup activeTags={suggestion.issues} />
            </div>
          </>
        )}
      </div>

      {/* Row 2 — merge note (conditional) */}
      {suggestion.merge_suggestion && (
        <div className="mt-2 pt-2 border-t border-border">
          <div className="flex items-start gap-1.5">
            <span className="text-[13px] text-muted-foreground shrink-0">Merge note:</span>
            <Tooltip>
              <TooltipTrigger>
                <span className="text-[13px] italic text-foreground line-clamp-2">
                  {suggestion.merge_suggestion}
                </span>
              </TooltipTrigger>
              <TooltipContent side="bottom" align="start" className="max-w-md">
                {suggestion.merge_suggestion}
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      )}

      {/* Expandable details */}
      {hasMoreContext && (
        <div className="mt-2">
          <Button
            variant="ghost"
            className="h-auto p-0 text-[13px] text-muted-foreground hover:text-foreground gap-1"
            onClick={() => setShowMore(!showMore)}
          >
            {showMore ? 'Less context' : 'More context'}
            <ChevronDown className={`size-3.5 transition-transform ${showMore ? 'rotate-180' : ''}`} />
          </Button>
          {showMore && (
            <div className="mt-2 pt-2 border-t border-border flex flex-col gap-2">
              {suggestion.feedback_notes && (
                <div>
                  <span className="text-[13px] text-muted-foreground">Consultant feedback: </span>
                  <span className="text-[13px]">{suggestion.feedback_notes}</span>
                </div>
              )}
              {suggestion.adaptation_notes && (
                <div>
                  <span className="text-[13px] text-muted-foreground">Adaptation notes: </span>
                  <span className="text-[13px]">{suggestion.adaptation_notes}</span>
                </div>
              )}
              <div>
                <span className="text-[13px] text-muted-foreground">Contains client context: </span>
                <span className="text-[13px]">{suggestion.contains_client_context ? 'Yes' : 'No'}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
