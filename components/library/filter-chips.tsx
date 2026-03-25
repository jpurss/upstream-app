'use client'

import React from 'react'
import { X } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

type FilterChipsProps = {
  search: string
  onSearchChange: (val: string | null) => void
  category: string
  onCategoryChange: (val: string | null) => void
  capability: string
  onCapabilityChange: (val: string | null) => void
  industry: string
  onIndustryChange: (val: string | null) => void
  model: string
  onModelChange: (val: string | null) => void
  status: string
  onStatusChange: (val: string | null) => void
  minRating: number
  onMinRatingChange: (val: number | null) => void
  onClearAll: () => void
  filteredCount: number
  totalCount: number
}

export function FilterChips({
  search,
  onSearchChange,
  category,
  onCategoryChange,
  capability,
  onCapabilityChange,
  industry,
  onIndustryChange,
  model,
  onModelChange,
  status,
  onStatusChange,
  minRating,
  onMinRatingChange,
  onClearAll,
  filteredCount,
  totalCount,
}: FilterChipsProps) {
  const hasActiveFilters =
    !!search ||
    !!category ||
    !!capability ||
    !!industry ||
    !!model ||
    !!status ||
    minRating > 0

  if (!hasActiveFilters) return null

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 py-2 border-b border-border bg-background">
      {search && (
        <Badge
          className="bg-primary/10 text-primary border border-primary/20 flex items-center gap-1 h-6 px-2"
        >
          <span className="text-[13px]">Search: {search}</span>
          <button
            onClick={() => onSearchChange(null)}
            className="ml-1 hover:opacity-70 transition-opacity"
            aria-label="Remove search filter"
          >
            <X className="size-3" />
          </button>
        </Badge>
      )}
      {category && (
        <Badge className="bg-primary/10 text-primary border border-primary/20 flex items-center gap-1 h-6 px-2">
          <span className="text-[13px]">Category: {category}</span>
          <button
            onClick={() => onCategoryChange(null)}
            className="ml-1 hover:opacity-70 transition-opacity"
            aria-label="Remove category filter"
          >
            <X className="size-3" />
          </button>
        </Badge>
      )}
      {capability && (
        <Badge className="bg-primary/10 text-primary border border-primary/20 flex items-center gap-1 h-6 px-2">
          <span className="text-[13px]">Type: {capability}</span>
          <button
            onClick={() => onCapabilityChange(null)}
            className="ml-1 hover:opacity-70 transition-opacity"
            aria-label="Remove capability filter"
          >
            <X className="size-3" />
          </button>
        </Badge>
      )}
      {industry && (
        <Badge className="bg-primary/10 text-primary border border-primary/20 flex items-center gap-1 h-6 px-2">
          <span className="text-[13px]">Industry: {industry}</span>
          <button
            onClick={() => onIndustryChange(null)}
            className="ml-1 hover:opacity-70 transition-opacity"
            aria-label="Remove industry filter"
          >
            <X className="size-3" />
          </button>
        </Badge>
      )}
      {model && (
        <Badge className="bg-primary/10 text-primary border border-primary/20 flex items-center gap-1 h-6 px-2">
          <span className="text-[13px]">Model: {model}</span>
          <button
            onClick={() => onModelChange(null)}
            className="ml-1 hover:opacity-70 transition-opacity"
            aria-label="Remove model filter"
          >
            <X className="size-3" />
          </button>
        </Badge>
      )}
      {status && (
        <Badge className="bg-primary/10 text-primary border border-primary/20 flex items-center gap-1 h-6 px-2">
          <span className="text-[13px]">Status: {status}</span>
          <button
            onClick={() => onStatusChange(null)}
            className="ml-1 hover:opacity-70 transition-opacity"
            aria-label="Remove status filter"
          >
            <X className="size-3" />
          </button>
        </Badge>
      )}
      {minRating > 0 && (
        <Badge className="bg-primary/10 text-primary border border-primary/20 flex items-center gap-1 h-6 px-2">
          <span className="text-[13px]">Rating: &gt;={minRating}</span>
          <button
            onClick={() => onMinRatingChange(null)}
            className="ml-1 hover:opacity-70 transition-opacity"
            aria-label="Remove rating filter"
          >
            <X className="size-3" />
          </button>
        </Badge>
      )}
      <Button
        variant="ghost"
        className="text-muted-foreground h-6 px-2 text-[13px]"
        onClick={onClearAll}
      >
        Clear all
      </Button>
      <span className="ml-auto text-[13px] text-muted-foreground">
        {filteredCount} of {totalCount} prompts
      </span>
    </div>
  )
}
