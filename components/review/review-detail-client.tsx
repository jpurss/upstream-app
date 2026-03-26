'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Pencil, Expand, Minimize2, Clock, Check, X as XIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { DiffViewer } from '@/components/engagements/diff-viewer'
import { ReviewContextBar } from '@/components/review/review-context-bar'
import { ReviewActionBar } from '@/components/review/review-action-bar'
import { ReviewContentEditor } from '@/components/review/review-content-editor'
import type { MergeSuggestion } from '@/lib/types/merge'

interface ReviewDetailClientProps {
  suggestion: MergeSuggestion
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; icon: React.ReactNode; label: string }> = {
    pending: {
      bg: 'bg-[#FFB852]/15',
      text: 'text-[#FFB852]',
      icon: <Clock className="size-3" />,
      label: 'Pending Review',
    },
    approved: {
      bg: 'bg-[#65CFB2]/15',
      text: 'text-[#65CFB2]',
      icon: <Check className="size-3" />,
      label: 'Merged',
    },
    declined: {
      bg: 'bg-[#E3392A]/15',
      text: 'text-[#E3392A]',
      icon: <XIcon className="size-3" />,
      label: 'Declined',
    },
  }
  const c = config[status] ?? config.pending
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[13px] font-medium ${c.bg} ${c.text}`}>
      {c.icon}
      {c.label}
    </span>
  )
}

export function ReviewDetailClient({ suggestion }: ReviewDetailClientProps) {
  const [editedContent, setEditedContent] = useState(suggestion.adapted_content)
  const [activeTab, setActiveTab] = useState<string>('changes')
  const [showDiffOnly, setShowDiffOnly] = useState(true)

  const hasEdited = editedContent !== suggestion.adapted_content
  const isPending = suggestion.merge_status === 'pending'
  const isApproved = suggestion.merge_status === 'approved'

  function handleReset() {
    setEditedContent(suggestion.adapted_content)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ZONE 1: Page Header */}
      <div className="flex flex-col gap-4">
        {/* Row 1 — navigation + status */}
        <div className="flex items-center justify-between">
          <Link
            href="/review"
            className="flex items-center gap-1.5 text-[14px] text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            Back to Review Queue
          </Link>
          {/* Status badge */}
          <StatusBadge status={suggestion.merge_status} />
        </div>
        {/* Row 2 — title */}
        <h1 className="text-[20px] font-semibold">{suggestion.source_prompt_title}</h1>
      </div>

      {/* ZONE 2: Context Bar */}
      <ReviewContextBar suggestion={suggestion} />

      {/* Decline reason panel — declined state only */}
      {suggestion.merge_status === 'declined' && suggestion.merge_decline_reason && (
        <div className="bg-[#E3392A]/5 border border-[#E3392A]/20 rounded-md px-4 py-3">
          <span className="text-[13px] text-muted-foreground">Decline reason</span>
          <p className="text-[15px] text-foreground mt-1">{suggestion.merge_decline_reason}</p>
        </div>
      )}

      {/* ZONE 3: Main Content Area — Tabbed Diff/Edit */}
      {isPending ? (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between border-b border-border">
            <TabsList variant="line">
              <TabsTrigger value="changes" className="flex items-center gap-1.5">
                Changes
                {hasEdited && (
                  <span className="size-1.5 rounded-full bg-primary" />
                )}
              </TabsTrigger>
              <TabsTrigger value="edit" className="flex items-center gap-1.5">
                <Pencil className="size-3.5" />
                Edit before approving
              </TabsTrigger>
            </TabsList>

            {/* Show diff toggle — only on Changes tab */}
            {activeTab === 'changes' && (
              <Button
                variant="ghost"
                className="h-auto px-2 py-1 text-[13px] text-muted-foreground hover:text-foreground gap-1.5"
                onClick={() => setShowDiffOnly(!showDiffOnly)}
              >
                {showDiffOnly ? (
                  <>
                    <Expand className="size-3.5" />
                    Show all lines
                  </>
                ) : (
                  <>
                    <Minimize2 className="size-3.5" />
                    Show changes only
                  </>
                )}
              </Button>
            )}
          </div>

          <TabsContent value="changes" className="pt-4">
            <DiffViewer
              original={suggestion.source_prompt_content}
              adapted={editedContent}
              leftTitle="Library (current)"
              rightTitle={hasEdited ? 'Edited (will be merged)' : 'Fork (adapted)'}
              showDiffOnly={showDiffOnly}
              extraLinesSurroundingDiff={3}
            />
          </TabsContent>

          <TabsContent value="edit" className="pt-4">
            <ReviewContentEditor
              content={editedContent}
              originalContent={suggestion.adapted_content}
              onChange={setEditedContent}
              onReset={handleReset}
            />
          </TabsContent>
        </Tabs>
      ) : (
        /* Read-only diff for approved/declined */
        <div>
          <div className="flex items-center justify-between border-b border-border pb-2 mb-4">
            <h2 className="text-[16px] font-semibold">Changes</h2>
            <Button
              variant="ghost"
              className="h-auto px-2 py-1 text-[13px] text-muted-foreground hover:text-foreground gap-1.5"
              onClick={() => setShowDiffOnly(!showDiffOnly)}
            >
              {showDiffOnly ? (
                <>
                  <Expand className="size-3.5" />
                  Show all lines
                </>
              ) : (
                <>
                  <Minimize2 className="size-3.5" />
                  Show changes only
                </>
              )}
            </Button>
          </div>
          <DiffViewer
            original={suggestion.source_prompt_content}
            adapted={suggestion.adapted_content}
            leftTitle={isApproved ? 'Library (before merge)' : 'Library (current)'}
            rightTitle={isApproved ? 'Merged content' : 'Fork (adapted)'}
            showDiffOnly={showDiffOnly}
            extraLinesSurroundingDiff={3}
          />
        </div>
      )}

      {/* ZONE 4: Sticky Action Bar — pending only */}
      {isPending && (
        <ReviewActionBar
          suggestion={suggestion}
          editedContent={editedContent}
          hasEdited={hasEdited}
        />
      )}
    </div>
  )
}
