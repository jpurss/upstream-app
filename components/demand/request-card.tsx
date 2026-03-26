'use client'

import { useTransition } from 'react'
import Link from 'next/link'
import { ArrowUp, CircleDot, Clock, CheckCircle, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { toggleUpvote } from '@/app/(app)/demand/actions'
import { getRelativeTime } from '@/lib/utils/date'
import { URGENCY_LABELS } from '@/lib/types/prompt-request'
import type { PromptRequest } from '@/lib/types/prompt-request'

const statusConfig = {
  open: { label: 'Open', bg: 'bg-[#4287FF]/15', text: 'text-[#4287FF]', icon: CircleDot },
  planned: { label: 'Planned', bg: 'bg-[#FFB852]/15', text: 'text-[#FFB852]', icon: Clock },
  resolved: { label: 'Resolved', bg: 'bg-[#65CFB2]/15', text: 'text-[#65CFB2]', icon: CheckCircle },
  declined: { label: 'Declined', bg: 'bg-[#E3392A]/15', text: 'text-[#E3392A]', icon: XCircle },
} as const

const urgencyConfig = {
  urgent: { bg: 'bg-[#E3392A]/15', text: 'text-[#E3392A]' },
  medium: { bg: 'bg-[#FFB852]/15', text: 'text-[#FFB852]' },
  nice_to_have: { bg: 'bg-[#71717a]/15', text: 'text-[#71717a]' },
} as const

interface RequestCardProps {
  request: PromptRequest
  isAdmin: boolean
  onAdminAction?: (action: string, requestId: string) => void
}

export function RequestCard({ request, isAdmin, onAdminAction }: RequestCardProps) {
  const [isPending, startTransition] = useTransition()

  const status = statusConfig[request.status as keyof typeof statusConfig] ?? statusConfig.open
  const urgency = urgencyConfig[request.urgency as keyof typeof urgencyConfig] ?? urgencyConfig.nice_to_have
  const StatusIcon = status.icon

  function handleUpvote() {
    startTransition(async () => {
      const result = await toggleUpvote(request.id)
      if (result?.error) {
        toast.error('Could not save upvote. Try again.')
      }
    })
  }

  return (
    <div
      className={`bg-card border border-border rounded-md p-4 flex gap-0 hover:border-[#4287FF]/30 transition-colors${request.status === 'declined' ? ' opacity-60' : ''}`}
    >
      {/* Upvote column — 48px fixed width */}
      <div className="w-12 shrink-0 flex flex-col items-center gap-1 pt-0.5">
        <button
          onClick={handleUpvote}
          disabled={isPending}
          aria-label={request.user_has_upvoted ? 'Remove upvote' : 'Upvote this request'}
          className="flex flex-col items-center gap-1 group disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ArrowUp
            className={`size-4 transition-colors${request.user_has_upvoted ? ' text-[#4287FF] fill-[#4287FF]' : ' text-muted-foreground group-hover:text-foreground'}`}
          />
          <span
            className={`text-[13px] font-semibold${request.user_has_upvoted ? ' text-[#4287FF]' : ' text-muted-foreground'}`}
          >
            {request.upvote_count}
          </span>
        </button>
      </div>

      {/* Content area */}
      <div className="flex-1 flex flex-col gap-1 min-w-0">
        {/* Title row with status badge */}
        <div className="flex items-start justify-between gap-2">
          <span className="text-[20px] font-semibold leading-tight truncate">
            {request.title}
          </span>
          <span
            className={`inline-flex items-center gap-1 shrink-0 rounded-full px-2 py-0.5 text-[12px] font-medium ${status.bg} ${status.text}`}
          >
            <StatusIcon className="size-3" />
            {status.label}
          </span>
        </div>

        {/* Description */}
        {request.description && (
          <p className="text-[15px] text-foreground/80 line-clamp-2">
            {request.description}
          </p>
        )}

        {/* Badge row: category + urgency */}
        <div className="flex items-center gap-2 mt-1">
          {request.category && (
            <span className="inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[13px] text-muted-foreground">
              {request.category}
            </span>
          )}
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-[13px] ${urgency.bg} ${urgency.text}`}
          >
            {URGENCY_LABELS[request.urgency]}
          </span>
        </div>

        {/* Metadata row: submitter + relative time */}
        <div className="flex items-center gap-1 text-[13px] text-muted-foreground mt-0.5">
          <span>{request.requester_name}</span>
          <span>·</span>
          <span>{getRelativeTime(request.created_at)}</span>
        </div>

        {/* Resolved: link to prompt */}
        {request.status === 'resolved' && request.resolved_prompt_title && (
          <Link
            href={`/library/${request.resolved_prompt_id}`}
            className="text-[13px] text-[#65CFB2] hover:underline mt-0.5"
          >
            → {request.resolved_prompt_title}
          </Link>
        )}

        {/* Admin controls rendered in Plan 03 */}
      </div>
    </div>
  )
}
