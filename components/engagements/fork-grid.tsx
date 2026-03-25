'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ForkCard } from '@/components/engagements/fork-card'
import type { ForkedPromptWithTitle } from '@/lib/types/fork'

interface ForkGridProps {
  forks: ForkedPromptWithTitle[]
  engagementId: string
  onForkClick?: () => void
}

export function ForkGrid({ forks, engagementId, onForkClick }: ForkGridProps) {
  if (forks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
        <p className="text-[16px] font-semibold">No prompts forked yet</p>
        <p className="text-[14px] text-muted-foreground max-w-xs">
          Fork prompts from the library to start adapting them for this engagement.
        </p>
        <Button
          onClick={onForkClick}
          disabled={!onForkClick}
          className="gap-1.5"
        >
          <Plus className="size-4" />
          Fork a Prompt
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {forks.map((fork) => (
        <ForkCard key={fork.id} fork={fork} engagementId={engagementId} />
      ))}
    </div>
  )
}
