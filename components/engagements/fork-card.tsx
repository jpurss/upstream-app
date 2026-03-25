'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { StarRating } from '@/components/engagements/star-rating'
import { updateForkRating } from '@/app/(app)/engagements/[id]/forks/[forkId]/actions'
import type { ForkedPromptWithTitle } from '@/lib/types/fork'

function getRelativeTime(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  const diffWeek = Math.floor(diffDay / 7)
  const diffMonth = Math.floor(diffDay / 30)
  const diffYear = Math.floor(diffDay / 365)

  if (diffSec < 60) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHour < 24) return `${diffHour}h ago`
  if (diffDay < 7) return `${diffDay}d ago`
  if (diffWeek < 5) return `${diffWeek}w ago`
  if (diffMonth < 12) return `${diffMonth}mo ago`
  return `${diffYear}y ago`
}

function getForkStatusIndicators(fork: ForkedPromptWithTitle) {
  const hasTemplateVars = /\{\{[^}]+\}\}/.test(fork.adapted_content ?? '')
  const isContentChanged = fork.adapted_content !== fork.original_content
  return { hasTemplateVars, isContentChanged }
}

interface ForkCardProps {
  fork: ForkedPromptWithTitle
  engagementId: string
}

export function ForkCard({ fork, engagementId }: ForkCardProps) {
  const { hasTemplateVars, isContentChanged } = getForkStatusIndicators(fork)
  const originalHasTemplateVars = /\{\{[^}]+\}\}/.test(
    fork.original_content ?? ''
  )

  const lastEdited = fork.last_used ?? fork.forked_at

  const [localRating, setLocalRating] = useState(fork.effectiveness_rating)
  const [, startTransition] = useTransition()

  function handleRate(rating: number) {
    setLocalRating(rating)
    startTransition(async () => {
      await updateForkRating(fork.id, rating, fork.source_prompt_id, fork.engagement_id)
    })
  }

  return (
    <Link href={`/engagements/${engagementId}/forks/${fork.id}`} className="block">
      <Card
        className={cn(
          'transition-colors hover:border-primary/30 cursor-pointer h-full'
        )}
      >
        <CardContent className="p-4 flex flex-col gap-2">
          {/* Prompt title */}
          <p className="text-[16px] font-semibold leading-[1.3] line-clamp-2">
            {fork.source_prompt_title}
          </p>

          {/* Status indicators row */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Customization status — only shown if original had template vars */}
            {originalHasTemplateVars && (
              <div className="flex items-center gap-1 text-[13px]">
                {hasTemplateVars ? (
                  <span className="text-muted-foreground">Template ready</span>
                ) : (
                  <>
                    <span
                      className="inline-block size-2 rounded-full bg-[#65CFB2] shrink-0"
                    />
                    <span className="text-muted-foreground">Customized</span>
                  </>
                )}
              </div>
            )}

            {/* Adaptation status */}
            <div className="flex items-center gap-1 text-[13px]">
              {isContentChanged ? (
                <>
                  <span
                    className="inline-block size-2 rounded-full bg-[#4287FF]/70 shrink-0"
                  />
                  <span className="text-muted-foreground">Adapted</span>
                </>
              ) : (
                <>
                  <span
                    className="inline-block size-2 rounded-full bg-muted-foreground/40 shrink-0"
                  />
                  <span className="text-muted-foreground">Original</span>
                </>
              )}
            </div>
          </div>

          {/* Inline star rating — stop propagation so clicks don't navigate to detail */}
          <div
            onClick={(e) => { e.preventDefault(); e.stopPropagation() }}
            className="pt-1"
          >
            <StarRating rating={localRating} onRate={handleRate} showLabel={false} />
          </div>

          {/* Last edited */}
          <div className="flex items-center gap-1 text-[13px] text-muted-foreground mt-auto pt-1">
            <Clock className="size-3" />
            <span>{getRelativeTime(lastEdited)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
