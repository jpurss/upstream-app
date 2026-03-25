'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { AutosaveIndicator } from '@/components/engagements/autosave-indicator'
import { ForkEditor } from '@/components/engagements/fork-editor'
import { ForkSidebar } from '@/components/engagements/fork-sidebar'
import type { ForkedPromptWithTitle } from '@/lib/types/fork'
import type { Engagement } from '@/lib/types/engagement'

interface ForkDetailClientProps {
  fork: ForkedPromptWithTitle
  engagement: Engagement
}

export function ForkDetailClient({ fork, engagement }: ForkDetailClientProps) {
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')

  return (
    <div className="flex flex-col gap-6">
      {/* Page header: back link + title + autosave indicator */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            href={`/engagements/${engagement.id}`}
            className="flex items-center gap-1.5 text-[14px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to {engagement.name}
          </Link>
        </div>
        <AutosaveIndicator state={saveState} />
      </div>

      {/* Fork title */}
      <h1 className="text-[20px] font-semibold">{fork.source_prompt_title}</h1>

      {/* Two-column layout: editor (flex-1) + sidebar (280px fixed) */}
      <div className="flex gap-8 items-start">
        <div className="flex-1 min-w-0">
          <ForkEditor fork={fork} onSaveStateChange={setSaveState} />
        </div>
        <div className="w-[280px] shrink-0">
          <ForkSidebar fork={fork} engagementId={engagement.id} />
        </div>
      </div>
    </div>
  )
}
