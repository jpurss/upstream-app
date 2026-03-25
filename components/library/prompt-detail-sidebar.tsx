'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import {
  Copy,
  Check,
  Star,
  Download,
  GitFork,
  MessageSquare,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { Prompt } from '@/lib/types/prompt'

interface PromptDetailSidebarProps {
  prompt: Prompt
  isAdmin: boolean
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function PromptDetailSidebar({ prompt, isAdmin }: PromptDetailSidebarProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(prompt.content)
    setCopied(true)
    toast.success('Copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="w-[280px] flex flex-col gap-4 shrink-0">
      {/* Section 1 — Copy Button */}
      <Button variant="secondary" className="w-full" onClick={handleCopy}>
        {copied ? (
          <Check data-icon="inline-start" data-testid="check-icon" />
        ) : (
          <Copy data-icon="inline-start" data-testid="copy-icon" />
        )}
        Copy
      </Button>

      <Separator />

      {/* Section 2 — Metadata */}
      <div className="flex flex-col gap-3">
        {/* Category */}
        <div className="flex flex-col gap-1">
          <span className="text-[13px] text-muted-foreground">Category</span>
          <Badge variant="secondary">{prompt.category}</Badge>
        </div>

        {/* Status */}
        <div className="flex flex-col gap-1">
          <span className="text-[13px] text-muted-foreground">Status</span>
          {prompt.status === 'active' ? (
            <Badge className="bg-[#65CFB2]/10 text-[#65CFB2] w-fit">Active</Badge>
          ) : (
            <Badge className="bg-[#FFB852]/10 text-[#FFB852] w-fit">Deprecated</Badge>
          )}
        </div>

        {/* Capability Type */}
        <div className="flex flex-col gap-1">
          <span className="text-[13px] text-muted-foreground">Capability Type</span>
          <span className="text-sm">{prompt.capability_type}</span>
        </div>

        {/* Target Model */}
        <div className="flex flex-col gap-1">
          <span className="text-[13px] text-muted-foreground">Target Model</span>
          <Badge variant="secondary" className="w-fit">{prompt.target_model}</Badge>
        </div>

        {/* Complexity */}
        <div className="flex flex-col gap-1">
          <span className="text-[13px] text-muted-foreground">Complexity</span>
          <span className="text-sm">{prompt.complexity}</span>
        </div>

        {/* Industry Tags */}
        {prompt.industry_tags.length > 0 && (
          <div className="flex flex-col gap-1">
            <span className="text-[13px] text-muted-foreground">Industry</span>
            <div className="flex flex-wrap gap-1">
              {prompt.industry_tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-[13px]">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      <Separator />

      {/* Section 3 — Field Intelligence Stats */}
      <div className="grid grid-cols-2 gap-4">
        {/* Avg Effectiveness */}
        <div className="flex flex-col gap-1">
          <Star className="size-4 text-[#FFB852]" />
          <span className="text-sm font-semibold">{prompt.avg_effectiveness.toFixed(1)}</span>
          <span className="text-[13px] text-muted-foreground">Avg Rating</span>
        </div>

        {/* Total Checkouts */}
        <div className="flex flex-col gap-1">
          <Download className="size-4 text-muted-foreground" />
          <span className="text-sm font-semibold">{prompt.total_checkouts}</span>
          <span className="text-[13px] text-muted-foreground">Checkouts</span>
        </div>

        {/* Active Forks — hardcoded 0 until Phase 3 */}
        <div className="flex flex-col gap-1">
          <GitFork className="size-4 text-muted-foreground" />
          <span className="text-sm font-semibold">0</span>
          <span className="text-[13px] text-muted-foreground">Active Forks</span>
        </div>

        {/* Total Ratings */}
        <div className="flex flex-col gap-1">
          <MessageSquare className="size-4 text-muted-foreground" />
          <span className="text-sm font-semibold">{prompt.total_ratings}</span>
          <span className="text-[13px] text-muted-foreground">Ratings</span>
        </div>
      </div>

      {/* Section 4 — Admin Controls slot */}
      {isAdmin && (
        <div className="flex flex-col gap-2">
          {/* Plan 04 adds Edit + Deprecate buttons here */}
        </div>
      )}

      <Separator />

      {/* Section 5 — Timestamps */}
      <div className="flex flex-col gap-2">
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] text-muted-foreground">Created</span>
          <span className="text-[13px]">{formatDate(prompt.created_at)}</span>
        </div>
        <div className="flex flex-col gap-0.5">
          <span className="text-[13px] text-muted-foreground">Updated</span>
          <span className="text-[13px]">{formatDate(prompt.updated_at)}</span>
        </div>
        {prompt.last_tested_date && (
          <div className="flex flex-col gap-0.5">
            <span className="text-[13px] text-muted-foreground">Last Tested</span>
            <span className="text-[13px]">
              {formatDate(prompt.last_tested_date)}
              {prompt.last_tested_model && (
                <span className="text-muted-foreground"> · {prompt.last_tested_model}</span>
              )}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
