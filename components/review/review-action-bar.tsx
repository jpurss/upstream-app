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
    <div className="sticky bottom-0 z-40 border-t border-border bg-background/95 backdrop-blur-sm px-6 py-4 -mx-6 -mb-6">
      <div className="flex items-start justify-between">
        {/* Left side — Decline */}
        <div className="flex flex-col gap-3">
          {isDeclineOpen ? (
            <DeclineReasonForm
              forkId={suggestion.id}
              onDeclined={handleDeclined}
              onDiscard={() => setIsDeclineOpen(false)}
              initialExpanded={true}
            />
          ) : (
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => setIsDeclineOpen(true)}
            >
              <X className="size-4" />
              Decline
            </Button>
          )}
        </div>

        {/* Right side — Approve */}
        <ApproveConfirmDialog
          suggestionId={suggestion.id}
          sourcePromptId={suggestion.source_prompt_id}
          editedContent={editedContent}
          hasEdited={hasEdited}
          currentVersion={suggestion.source_prompt_version}
          mergeNote={suggestion.merge_suggestion || ''}
          onSuccess={handleApproveSuccess}
          trigger={
            <Button
              className="gap-2"
              disabled={isDeclineOpen}
            >
              <Check className="size-4" />
              Approve &amp; Merge
              <span className="text-[13px] opacity-60 ml-1">
                v{suggestion.source_prompt_version} &rarr; v{suggestion.source_prompt_version + 1}
              </span>
            </Button>
          }
        />
      </div>
    </div>
  )
}
