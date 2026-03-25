'use client'

import { useState } from 'react'
import { WorkspaceHeader } from '@/components/engagements/workspace-header'
import { PromptPickerModal } from '@/components/engagements/prompt-picker-modal'
import { ForkGrid } from '@/components/engagements/fork-grid'
import type { Engagement } from '@/lib/types/engagement'
import type { Prompt } from '@/lib/types/prompt'
import type { ForkedPromptWithTitle } from '@/lib/types/fork'

interface WorkspaceClientProps {
  engagement: Engagement
  forkCount: number
  avgEffectiveness: number | null
  prompts: Prompt[]
  forkedPromptIds: string[]
  forks: ForkedPromptWithTitle[]
}

/**
 * Client wrapper for the engagement workspace page.
 * Manages the PromptPickerModal open state — can't live in the server component.
 * WorkspaceHeader AND the ForkGrid empty-state CTA both trigger the modal via
 * the shared setPickerOpen handler.
 */
export function WorkspaceClient({
  engagement,
  forkCount,
  avgEffectiveness,
  prompts,
  forkedPromptIds,
  forks,
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
      <ForkGrid
        forks={forks}
        engagementId={engagement.id}
        onForkClick={() => setPickerOpen(true)}
      />
    </>
  )
}
