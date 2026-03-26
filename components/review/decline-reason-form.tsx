'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Spinner } from '@/components/ui/spinner'
import { declineMerge } from '@/app/(app)/review/actions'

interface DeclineReasonFormProps {
  forkId: string
  onDeclined?: () => void
  onDiscard?: () => void
  initialExpanded?: boolean
}

export function DeclineReasonForm({ forkId, onDeclined, onDiscard, initialExpanded }: DeclineReasonFormProps) {
  const [isExpanded, setIsExpanded] = useState(initialExpanded ?? false)
  const [reason, setReason] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleDecline() {
    startTransition(async () => {
      const result = await declineMerge(forkId, reason)
      if (result.success) {
        toast.success('Merge suggestion declined')
        onDiscard?.()
        onDeclined?.()
      } else {
        toast.error("Couldn't save changes. Try again.")
      }
    })
  }

  if (!isExpanded) {
    return (
      <Button
        variant="outline"
        className="w-full gap-2"
        onClick={() => setIsExpanded(true)}
      >
        <X className="size-4" />
        Decline
      </Button>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <Textarea
        placeholder="Why are you declining this? The consultant will see your reason."
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="min-h-[64px] resize-none text-[14px]"
      />
      <div className="flex gap-2">
        <Button
          variant="ghost"
          className="flex-1 text-[13px]"
          onClick={() => {
            setIsExpanded(false)
            setReason('')
            onDiscard?.()
          }}
        >
          Discard reason
        </Button>
        <Button
          variant="destructive"
          className="flex-1 text-[13px]"
          disabled={reason.trim() === '' || isPending}
          onClick={handleDecline}
        >
          {isPending ? <Spinner className="size-4" /> : 'Confirm Decline'}
        </Button>
      </div>
    </div>
  )
}
