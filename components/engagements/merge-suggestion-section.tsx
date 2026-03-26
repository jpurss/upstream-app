'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { GitMerge, Clock, Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { suggestMerge } from '@/app/(app)/engagements/[id]/forks/[forkId]/actions'
import type { ForkedPromptWithTitle } from '@/lib/types/fork'

interface MergeSuggestionSectionProps {
  fork: ForkedPromptWithTitle
  engagementId: string
}

const statusConfig = {
  pending: { bg: 'bg-[#FFB852]/15', text: 'text-[#FFB852]', icon: Clock, label: 'Pending Review' },
  approved: { bg: 'bg-[#65CFB2]/15', text: 'text-[#65CFB2]', icon: Check, label: 'Merged' },
  declined: { bg: 'bg-[#E3392A]/15', text: 'text-[#E3392A]', icon: X, label: 'Declined' },
}

export function MergeSuggestionSection({ fork, engagementId: _engagementId }: MergeSuggestionSectionProps) {
  const [mergeStatus, setMergeStatus] = useState(fork.merge_status ?? 'none')
  const [mergeNote, setMergeNote] = useState(fork.merge_suggestion ?? '')
  const [declineReason] = useState(fork.merge_decline_reason ?? '')
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()

  function handleSubmit() {
    startTransition(async () => {
      const result = await suggestMerge(fork.id, mergeNote)
      if (result.success) {
        setMergeStatus('pending')
        setDialogOpen(false)
        toast.success('Merge suggestion submitted')
      } else {
        toast.error("Couldn't save changes. Try again.")
      }
    })
  }

  const sectionHeading = (
    <span className="text-[13px] text-muted-foreground">Merge suggestion</span>
  )

  // Status badge for pending/approved/declined
  if (mergeStatus === 'pending' || mergeStatus === 'approved' || mergeStatus === 'declined') {
    const config = statusConfig[mergeStatus as keyof typeof statusConfig]
    const Icon = config.icon

    return (
      <div className="flex flex-col gap-2">
        {sectionHeading}
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[13px] w-fit ${config.bg} ${config.text}`}
        >
          <Icon className="size-3" />
          {config.label}
        </span>

        {mergeStatus === 'declined' && (
          <>
            {declineReason && (
              <p className="text-[13px] text-muted-foreground italic mt-2">{declineReason}</p>
            )}
            <button
              className="text-[13px] text-[#4287FF] hover:underline mt-1 text-left"
              onClick={() => {
                setMergeStatus('none')
                setDialogOpen(true)
              }}
            >
              Revise & resubmit
            </button>
          </>
        )}
      </div>
    )
  }

  // Default: none or null state — show button + dialog
  return (
    <div className="flex flex-col gap-2">
      {sectionHeading}
      <Button
        variant="outline"
        className="w-full"
        onClick={() => setDialogOpen(true)}
      >
        <GitMerge className="size-4 mr-2" />
        Suggest Merge
      </Button>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suggest a merge</DialogTitle>
            <DialogDescription>
              Your adaptation notes, rating, and feedback will be shared with the reviewer automatically.
            </DialogDescription>
          </DialogHeader>

          <Textarea
            placeholder="Why should this be merged back?"
            value={mergeNote}
            onChange={(e) => setMergeNote(e.target.value)}
            className="min-h-[80px] resize-none"
          />

          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDialogOpen(false)}
              disabled={isPending}
            >
              Discard suggestion
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={mergeNote.trim() === '' || isPending}
            >
              {isPending && <Spinner className="size-4 mr-2" />}
              Submit suggestion
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
