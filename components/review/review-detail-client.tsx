'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { DiffViewer } from '@/components/engagements/diff-viewer'
import { ReviewContentEditor } from '@/components/review/review-content-editor'
import { ReviewSidebar } from '@/components/review/review-sidebar'
import type { MergeSuggestion } from '@/lib/types/merge'

interface ReviewDetailClientProps {
  suggestion: MergeSuggestion
}

export function ReviewDetailClient({ suggestion }: ReviewDetailClientProps) {
  const [editedContent, setEditedContent] = useState(suggestion.adapted_content)

  return (
    <div className="flex flex-col gap-6">
      {/* Page header */}
      <div>
        <Link
          href="/review"
          className="flex items-center gap-1.5 text-[14px] text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="size-4" />
          Back to Review Queue
        </Link>
      </div>

      <h1 className="text-[20px] font-semibold">{suggestion.source_prompt_title}</h1>

      {/* Two-column layout */}
      <div className="flex gap-8 items-start">
        {/* Left column — diff + editor */}
        <div className="flex-1 min-w-0">
          <h2 className="text-[16px] font-semibold border-b border-border pb-2 mb-4">Changes</h2>
          <DiffViewer
            original={suggestion.source_prompt_content}
            adapted={suggestion.adapted_content}
            leftTitle="Library (current)"
            rightTitle="Fork (adapted)"
          />
          <div className="mt-6">
            <ReviewContentEditor
              content={editedContent}
              originalContent={suggestion.adapted_content}
              onChange={setEditedContent}
              onReset={() => setEditedContent(suggestion.adapted_content)}
            />
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-[280px] shrink-0">
          <ReviewSidebar
            suggestion={suggestion}
            editedContent={editedContent}
          />
        </div>
      </div>
    </div>
  )
}
