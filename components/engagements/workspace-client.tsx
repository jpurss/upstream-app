'use client'

import { useState } from 'react'
import { WorkspaceHeader } from '@/components/engagements/workspace-header'
import { PromptPickerModal } from '@/components/engagements/prompt-picker-modal'
import type { Engagement } from '@/lib/types/engagement'
import type { Prompt } from '@/lib/types/prompt'

interface WorkspaceClientProps {
  engagement: Engagement
  forkCount: number
  avgEffectiveness: number | null
  prompts: Prompt[]
  forkedPromptIds: string[]
}

/**
 * Client wrapper for the engagement workspace page.
 * Manages the PromptPickerModal open state — can't live in the server component.
 * WorkspaceHeader triggers the modal open; PromptPickerModal handles fork creation.
 */
export function WorkspaceClient({
  engagement,
  forkCount,
  avgEffectiveness,
  prompts,
  forkedPromptIds,
}: WorkspaceClientProps) {
  const [pickerOpen, setPickerOpen] = useState(false)

  return (
    <>
      <WorkspaceHeader
        engagement={engagement}
        forkCount={forkCount}
        avgEffectiveness={avgEffectiveness}
        onForkClick={() => setPickerOpen(true)}
      />
      <PromptPickerModal
        engagementId={engagement.id}
        engagementName={engagement.name}
        prompts={prompts}
        forkedPromptIds={forkedPromptIds}
        open={pickerOpen}
        onOpenChange={setPickerOpen}
      />
    </>
  )
}
