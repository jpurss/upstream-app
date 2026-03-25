'use client'

import { useState, useTransition, useMemo } from 'react'
import { toast } from 'sonner'
import { Search } from 'lucide-react'
import { Star, Download } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { createMultipleForks } from '@/app/(app)/engagements/[id]/actions'
import { PROMPT_CATEGORIES } from '@/lib/types/prompt'
import { PROMPT_CAPABILITY_TYPES } from '@/lib/types/prompt'
import type { Prompt } from '@/lib/types/prompt'

// NOTE: All filter state uses local useState — NOT nuqs/useQueryState.
// This prevents URL pollution on the engagement workspace page (Pitfall 3).

interface PromptPickerModalProps {
  engagementId: string
  engagementName: string
  prompts: Prompt[]
  forkedPromptIds: string[] // source_prompt_id values already forked
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PromptPickerModal({
  engagementId,
  engagementName,
  prompts,
  forkedPromptIds,
  open,
  onOpenChange,
}: PromptPickerModalProps) {
  // Local filter state — intentionally not URL state (Pitfall 3 guard)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [capability, setCapability] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isPending, startTransition] = useTransition()

  const forkedSet = new Set(forkedPromptIds)

  const filteredPrompts = useMemo(() => {
    let result = [...prompts]

    if (search.trim()) {
      const term = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          (p.description ?? '').toLowerCase().includes(term)
      )
    }
    if (category) {
      result = result.filter((p) => p.category === category)
    }
    if (capability) {
      result = result.filter((p) => p.capability_type === capability)
    }

    return result
  }, [prompts, search, category, capability])

  function togglePrompt(id: string) {
    if (forkedSet.has(id)) return
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function handleForkSelected() {
    if (selectedIds.size === 0) return

    startTransition(async () => {
      const ids = Array.from(selectedIds)
      const result = await createMultipleForks(ids, engagementId)

      if (result.forked > 0) {
        const count = result.forked
        if (count === 1) {
          toast.success(`Forked to ${engagementName}`)
        } else {
          toast.success(`${count} prompts forked to ${engagementName}`)
        }
      }
      if (result.errors > 0) {
        toast.error(`${result.errors} fork${result.errors > 1 ? 's' : ''} failed`)
      }

      handleClose()
    })
  }

  function handleClose() {
    onOpenChange(false)
    setSearch('')
    setCategory('')
    setCapability('')
    setSelectedIds(new Set())
  }

  return (
    <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) handleClose() }}>
      <DialogContent
        showCloseButton={false}
        className="sm:max-w-[800px] max-h-[80vh] flex flex-col overflow-hidden"
      >
        <DialogHeader>
          <DialogTitle>Fork a Prompt</DialogTitle>
        </DialogHeader>

        {/* Search and filters */}
        <div className="flex flex-col gap-3 shrink-0">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search prompts..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-8"
            />
          </div>
          <div className="flex gap-2">
            <Select
              value={category}
              onValueChange={(val) => setCategory(val ?? '')}
            >
              <SelectTrigger size="sm" className="w-[180px]">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All categories</SelectItem>
                {PROMPT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={capability}
              onValueChange={(val) => setCapability(val ?? '')}
            >
              <SelectTrigger size="sm" className="w-[180px]">
                <SelectValue placeholder="Capability" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All capabilities</SelectItem>
                {PROMPT_CAPABILITY_TYPES.map((cap) => (
                  <SelectItem key={cap} value={cap}>
                    {cap}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Prompt grid — scrollable */}
        <div className="flex-1 overflow-y-auto min-h-0">
          {filteredPrompts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-12">
              No prompts match your search.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-2">
              {filteredPrompts.map((prompt) => {
                const isAlreadyForked = forkedSet.has(prompt.id)
                const isSelected = selectedIds.has(prompt.id)

                return (
                  <button
                    key={prompt.id}
                    type="button"
                    disabled={isAlreadyForked || isPending}
                    onClick={() => togglePrompt(prompt.id)}
                    className={[
                      'relative w-full text-left rounded-lg border p-3 transition-colors flex flex-col gap-1',
                      isAlreadyForked
                        ? 'opacity-50 pointer-events-none border-border bg-card'
                        : isSelected
                          ? 'border-primary/40 bg-primary/5 cursor-pointer'
                          : 'border-border bg-card hover:border-border/60 cursor-pointer',
                    ].join(' ')}
                  >
                    {/* Already forked badge overlay */}
                    {isAlreadyForked && (
                      <span className="absolute top-2 right-2">
                        <Badge variant="secondary" className="text-[11px]">
                          Already forked
                        </Badge>
                      </span>
                    )}

                    <div className="flex items-start justify-between gap-2 pr-1">
                      <span className="text-sm font-medium leading-snug line-clamp-1">
                        {prompt.title}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge variant="outline" className="text-[13px]">
                          {prompt.category}
                        </Badge>
                        {isSelected && !isAlreadyForked && (
                          <span className="size-4 rounded-full bg-primary flex items-center justify-center shrink-0">
                            <svg
                              className="size-2.5 text-primary-foreground"
                              fill="none"
                              viewBox="0 0 10 8"
                              stroke="currentColor"
                              strokeWidth={2}
                            >
                              <path
                                d="M1 4l2.5 2.5L9 1"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                      <span>{prompt.capability_type}</span>
                    </div>

                    <div className="flex items-center gap-3 text-[13px] text-muted-foreground mt-1">
                      <div className="flex items-center gap-1">
                        <Star className="size-3 fill-[#FFB852] text-[#FFB852]" />
                        <span>{prompt.avg_effectiveness.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Download className="size-3" />
                        <span>{prompt.total_checkouts}</span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <div className="flex items-center gap-2 w-full sm:w-auto sm:ml-0">
            {selectedIds.size > 0 && (
              <span className="text-[13px] text-muted-foreground">
                {selectedIds.size} selected
              </span>
            )}
          </div>
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            disabled={isPending}
          >
            Done Browsing
          </Button>
          <Button
            type="button"
            onClick={handleForkSelected}
            disabled={selectedIds.size === 0 || isPending}
          >
            {isPending ? 'Forking...' : `Fork Selected (${selectedIds.size})`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
