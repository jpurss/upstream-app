'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Check, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DeclineReasonForm } from '@/components/review/decline-reason-form'
import { ApproveConfirmDialog } from '@/components/review/approve-confirm-dialog'
import type { MergeSuggestion } from '@/lib/types/merge'

interface ReviewActionBarProps {
  suggestion: MergeSuggestion
  editedContent: string
  hasEdited: boolean
}

export function ReviewActionBar({ suggestion, editedContent, hasEdited }: ReviewActionBarProps) {
  const [isDeclineOpen, setIsDeclineOpen] = useState(false)
  const router = useRouter()

  function handleApproveSuccess() {
    router.push('/review')
  }

  function handleDeclined() {
    router.push('/review')
  }

  return (
    <div className="fixed bottom-6 left-[var(--sidebar-width)] right-0 z-40 flex justify-center pointer-events-none">
      <div className="flex items-center gap-3 pointer-events-auto bg-zinc-900 border border-border rounded-full px-2 py-2 shadow-xl">
        {isDeclineOpen ? (
          <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
            <DeclineReasonForm
              forkId={suggestion.id}
              onDeclined={handleDeclined}
              onDiscard={() => setIsDeclineOpen(false)}
              initialExpanded={true}
            />
          </div>
        ) : (
          <Button
            variant="destructive"
            className="gap-2 rounded-full"
            onClick={() => setIsDeclineOpen(true)}
          >
            <X className="size-4" />
            Decline
          </Button>
        )}

        <ApproveConfirmDialog
          suggestionId={suggestion.id}
          sourcePromptId={suggestion.source_prompt_id}
          editedContent={editedContent}
          hasEdited={hasEdited}
          currentVersion={suggestion.source_prompt_version}
          mergeNote={suggestion.merge_suggestion || ''}
          onSuccess={handleApproveSuccess}
          disabled={isDeclineOpen}
        >
          <Check className="size-4" />
          Approve & Merge
          <span className="text-[13px] opacity-60 ml-1">
            v{suggestion.source_prompt_version} → v{suggestion.source_prompt_version + 1}
          </span>
        </ApproveConfirmDialog>
      </div>
    </div>
  )
}
