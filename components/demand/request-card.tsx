'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { ArrowUp, CircleDot, Clock, CheckCircle, XCircle, Link as LinkIcon, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { toggleUpvote, markPlanned, revertToOpen, declineRequest } from '@/app/(app)/demand/actions'
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
  onResolveClick?: (requestId: string) => void
}

export function RequestCard({ request, isAdmin, onResolveClick }: RequestCardProps) {
  const [isPending, startTransition] = useTransition()
  const [isAdminPending, startAdminTransition] = useTransition()
  const [isDeclining, setIsDeclining] = useState(false)
  const [declineReason, setDeclineReason] = useState('')
  const [isDeclinePending, startDeclineTransition] = useTransition()

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

  function handleMarkPlanned() {
    startAdminTransition(async () => {
      const result = await markPlanned(request.id)
      if (result?.error) {
        toast.error('Could not update request. Try again.')
      } else {
        toast.success('Request marked as planned')
      }
    })
  }

  function handleRevertToOpen() {
    startAdminTransition(async () => {
      const result = await revertToOpen(request.id)
      if (result?.error) {
        toast.error('Could not update request. Try again.')
      } else {
        toast.success('Request reverted to open')
      }
    })
  }

  function handleDeclineConfirm() {
    startDeclineTransition(async () => {
      const result = await declineRequest(request.id, declineReason)
      if (result?.error) {
        toast.error('Could not decline request. Try again.')
      } else {
        toast.success('Request declined')
        setIsDeclining(false)
        setDeclineReason('')
      }
    })
  }

  function handleDeclineDiscard() {
    setIsDeclining(false)
    setDeclineReason('')
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
        {/* Title row with status badge + admin controls */}
        <div className="flex items-start justify-between gap-2">
          <span className="text-[20px] font-semibold leading-tight truncate">
            {request.title}
          </span>
          <div className="flex items-center gap-2 shrink-0">
            {/* Admin controls for open cards */}
            {isAdmin && request.status === 'open' && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[13px] px-2"
                  onClick={handleMarkPlanned}
                  disabled={isAdminPending}
                >
                  <Clock className="size-3 mr-1" />
                  Mark Planned
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[13px] px-2"
                  onClick={() => onResolveClick?.(request.id)}
                  disabled={isAdminPending}
                >
                  <LinkIcon className="size-3 mr-1" />
                  Resolve
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-[13px] px-2 text-[#E3392A] hover:text-[#E3392A]"
                  onClick={() => setIsDeclining(true)}
                  disabled={isAdminPending}
                >
                  <X className="size-3 mr-1" />
                  Decline
                </Button>
              </div>
            )}

            {/* Admin controls for planned cards */}
            {isAdmin && request.status === 'planned' && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-[13px] px-2"
                onClick={handleRevertToOpen}
                disabled={isAdminPending}
              >
                Revert to Open
              </Button>
            )}

            {/* Status badge */}
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-medium ${status.bg} ${status.text}`}
            >
              <StatusIcon className="size-3" />
              {status.label}
            </span>
          </div>
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

        {/* Inline decline form — expands when admin clicks Decline */}
        {isAdmin && isDeclining && (
          <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
            <Textarea
              placeholder="Why are you declining this request? The requester will see your reason."
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              className="min-h-[64px] resize-none text-[13px]"
            />
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                className="text-[13px]"
                onClick={handleDeclineDiscard}
                disabled={isDeclinePending}
              >
                Discard
              </Button>
              <Button
                size="sm"
                className="text-[13px] bg-[#E3392A] hover:bg-[#E3392A]/90 text-white"
                onClick={handleDeclineConfirm}
                disabled={!declineReason.trim() || isDeclinePending}
              >
                {isDeclinePending && <Spinner className="size-3 mr-1" />}
                Confirm Decline
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
