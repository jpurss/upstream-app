'use client'

import { useState, useTransition, useCallback, useRef } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { ExternalLink } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { StarRating } from '@/components/engagements/star-rating'
import { IssueTagGroup } from '@/components/engagements/issue-tag-group'
import {
  updateForkRating,
  updateForkFeedback,
  updateForkMeta,
} from '@/app/(app)/engagements/[id]/forks/[forkId]/actions'
import type { ForkedPromptWithTitle, IssueTag } from '@/lib/types/fork'

interface ForkSidebarProps {
  fork: ForkedPromptWithTitle
  engagementId: string
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function ForkSidebar({ fork, engagementId }: ForkSidebarProps) {
  const [rating, setRating] = useState<number | null>(fork.effectiveness_rating)
  const [activeTags, setActiveTags] = useState<IssueTag[]>(fork.issues ?? [])
  const [feedbackNotes, setFeedbackNotes] = useState(fork.feedback_notes ?? '')
  const [containsClientContext, setContainsClientContext] = useState(
    fork.contains_client_context ?? false
  )
  const [adaptationNotes, setAdaptationNotes] = useState(fork.adaptation_notes ?? '')

  // Separate transitions per field to prevent blocking
  const [, startRatingTransition] = useTransition()
  const [, startFeedbackTransition] = useTransition()
  const [, startMetaTransition] = useTransition()

  // Debounce refs
  const feedbackTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const metaTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Rating — immediate save
  function handleRate(newRating: number) {
    setRating(newRating)
    startRatingTransition(async () => {
      const result = await updateForkRating(
        fork.id,
        newRating,
        fork.source_prompt_id,
        engagementId
      )
      if (result.error) {
        toast.error("Couldn't save changes. Retrying...", { duration: 5000 })
      }
    })
  }

  // Issue tags — immediate save, also sends current feedback notes
  function handleTagsToggle(newTags: IssueTag[]) {
    setActiveTags(newTags)
    startFeedbackTransition(async () => {
      const result = await updateForkFeedback(fork.id, newTags, feedbackNotes || null)
      if (result.error) {
        toast.error("Couldn't save changes. Retrying...", { duration: 5000 })
      }
    })
  }

  // Feedback notes — debounced save (1.5s), sends current tags
  const scheduleFeedbackSave = useCallback(
    (value: string) => {
      if (feedbackTimerRef.current) clearTimeout(feedbackTimerRef.current)
      feedbackTimerRef.current = setTimeout(() => {
        startFeedbackTransition(async () => {
          const result = await updateForkFeedback(
            fork.id,
            activeTags,
            value || null
          )
          if (result.error) {
            toast.error("Couldn't save changes. Retrying...", { duration: 5000 })
          }
        })
      }, 1500)
    },
    [fork.id, activeTags]
  )

  function handleFeedbackChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value
    setFeedbackNotes(value)
    scheduleFeedbackSave(value)
  }

  // Client context checkbox — immediate save, sends current adaptation notes
  function handleClientContextChange(checked: boolean) {
    setContainsClientContext(checked)
    startMetaTransition(async () => {
      const result = await updateForkMeta(fork.id, adaptationNotes || null, checked)
      if (result.error) {
        toast.error("Couldn't save changes. Retrying...", { duration: 5000 })
      }
    })
  }

  // Adaptation notes — debounced save (1.5s), sends current client context
  const scheduleMetaSave = useCallback(
    (value: string) => {
      if (metaTimerRef.current) clearTimeout(metaTimerRef.current)
      metaTimerRef.current = setTimeout(() => {
        startMetaTransition(async () => {
          const result = await updateForkMeta(
            fork.id,
            value || null,
            containsClientContext
          )
          if (result.error) {
            toast.error("Couldn't save changes. Retrying...", { duration: 5000 })
          }
        })
      }, 1500)
    },
    [fork.id, containsClientContext]
  )

  function handleAdaptationNotesChange(e: React.ChangeEvent<HTMLTextAreaElement>) {
    const value = e.target.value
    setAdaptationNotes(value)
    scheduleMetaSave(value)
  }

  return (
    <div className="flex flex-col w-[280px]">
      {/* Section 1 — Effectiveness Rating */}
      <div className="py-4">
        <StarRating rating={rating} onRate={handleRate} />
      </div>

      {/* Section 2 — Issue Tags */}
      <div className="py-4 border-t border-border">
        <IssueTagGroup activeTags={activeTags} onToggle={handleTagsToggle} />
      </div>

      {/* Section 3 — Feedback Notes */}
      <div className="py-4 border-t border-border flex flex-col gap-2">
        <span className="text-[13px] text-muted-foreground">Feedback notes</span>
        <Textarea
          className="min-h-[80px] resize-none text-[14px]"
          placeholder="What worked, what didn't..."
          value={feedbackNotes}
          onChange={handleFeedbackChange}
        />
      </div>

      {/* Section 4 — Client Context */}
      <div className="py-4 border-t border-border">
        <label className="flex items-center gap-2 cursor-pointer">
          <Checkbox
            checked={containsClientContext}
            onCheckedChange={(checked) =>
              handleClientContextChange(checked === true)
            }
          />
          <span className="text-[14px]">Contains client-specific context</span>
        </label>
      </div>

      {/* Section 5 — Adaptation Notes */}
      <div className="py-4 border-t border-border flex flex-col gap-2">
        <span className="text-[13px] text-muted-foreground">Adaptation notes</span>
        <Textarea
          className="min-h-[80px] resize-none text-[14px]"
          placeholder="What you changed and why..."
          value={adaptationNotes}
          onChange={handleAdaptationNotesChange}
        />
      </div>

      {/* Section 6 — Source Prompt */}
      <div className="py-4 border-t border-border flex flex-col gap-1">
        <span className="text-[13px] text-muted-foreground">Source prompt</span>
        <Link
          href={`/library/${fork.source_prompt_id}`}
          className="flex items-center gap-1 text-[13px] text-muted-foreground hover:text-foreground transition-colors"
        >
          {fork.source_prompt_title}
          <ExternalLink className="size-3 shrink-0" />
        </Link>
      </div>

      {/* Section 7 — Forked Date */}
      <div className="py-4 border-t border-border flex flex-col gap-1">
        <span className="text-[13px] text-muted-foreground">Forked</span>
        <span className="text-[13px]">{formatDate(fork.forked_at)}</span>
      </div>
    </div>
  )
}
