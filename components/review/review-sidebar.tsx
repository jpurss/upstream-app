'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from 'sonner'
import { Check, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { StarRating } from '@/components/engagements/star-rating'
import { IssueTagGroup } from '@/components/engagements/issue-tag-group'
import { DeclineReasonForm } from '@/components/review/decline-reason-form'
import { approveMerge } from '@/app/(app)/review/actions'
import type { MergeSuggestion } from '@/lib/types/merge'

interface ReviewSidebarProps {
  suggestion: MergeSuggestion
  editedContent: string
}

export function ReviewSidebar({ suggestion, editedContent }: ReviewSidebarProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleApprove() {
    startTransition(async () => {
      const result = await approveMerge(
        suggestion.id,
        suggestion.source_prompt_id,
        editedContent,
        suggestion.merge_suggestion || ''
      )
      if (result.success) {
        toast.success('Prompt updated — version bumped')
        router.push('/review')
      } else {
        toast.error("Couldn't save changes. Try again.")
      }
    })
  }

  function handleDeclined() {
    router.push('/review')
  }

  return (
    <div className="flex flex-col w-[280px]">
      {/* Section 1 — Who / Where (no border-t, first section) */}
      <div className="py-4 flex flex-col gap-2">
        <span className="text-[13px] text-muted-foreground">Suggested by</span>
        <span className="text-[15px]">{suggestion.submitter_name}</span>
        <span className="text-[13px] text-muted-foreground mt-2">Engagement</span>
        <Link
          href={`/engagements/${suggestion.engagement_id}`}
          className="flex items-center gap-1 text-[15px] hover:text-foreground transition-colors"
        >
          {suggestion.engagement_name}
          <ExternalLink className="size-3 shrink-0" />
        </Link>
      </div>

      {/* Section 2 — Effectiveness */}
      <div className="py-4 border-t border-border">
        <StarRating rating={suggestion.effectiveness_rating} showLabel={true} />
      </div>

      {/* Section 3 — Issue Tags */}
      <div className="py-4 border-t border-border">
        {suggestion.issues && suggestion.issues.length > 0 ? (
          <IssueTagGroup activeTags={suggestion.issues} />
        ) : (
          <span className="text-[13px] text-muted-foreground">No issues flagged</span>
        )}
      </div>

      {/* Section 4 — Feedback Notes */}
      <div className="py-4 border-t border-border flex flex-col gap-1">
        <span className="text-[13px] text-muted-foreground">Consultant feedback</span>
        <span className="text-[13px]">{suggestion.feedback_notes || '\u2014'}</span>
      </div>

      {/* Section 5 — Adaptation Notes */}
      <div className="py-4 border-t border-border flex flex-col gap-1">
        <span className="text-[13px] text-muted-foreground">Adaptation notes</span>
        <span className="text-[13px]">{suggestion.adaptation_notes || '\u2014'}</span>
      </div>

      {/* Section 6 — Merge Note */}
      <div className="py-4 border-t border-border flex flex-col gap-1">
        <span className="text-[13px] text-muted-foreground">Merge note</span>
        <span className="text-[13px] italic">{suggestion.merge_suggestion || '\u2014'}</span>
      </div>

      {/* Section 7 — Actions */}
      <div className="py-4 border-t border-border flex flex-col gap-3">
        <Button
          className="w-full gap-2"
          disabled={isPending}
          onClick={handleApprove}
        >
          {isPending ? (
            <Spinner className="size-4" />
          ) : (
            <>
              <Check className="size-4" />
              Approve &amp; Merge
            </>
          )}
        </Button>
        <DeclineReasonForm forkId={suggestion.id} onDeclined={handleDeclined} />
      </div>
    </div>
  )
}
