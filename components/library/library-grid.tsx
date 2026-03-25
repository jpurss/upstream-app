'use client'

import React, { useMemo, useEffect, useState } from 'react'
import { useQueryState, parseAsString, parseAsFloat } from 'nuqs'
import { SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Prompt } from '@/lib/types/prompt'
import { PromptCard } from '@/components/library/prompt-card'
import { PromptCardList } from '@/components/library/prompt-card-list'
import { FilterBar } from '@/components/library/filter-bar'
import { FilterChips } from '@/components/library/filter-chips'
import { createClient } from '@/lib/supabase/client'

type LibraryGridProps = {
  initialPrompts: Prompt[]
  isAdmin: boolean
  totalCount: number
}

export function LibraryGrid({ initialPrompts, isAdmin: _isAdmin, totalCount }: LibraryGridProps) {
  // URL state via nuqs
  const [search, setSearch] = useQueryState('q', parseAsString.withDefault(''))
  const [category, setCategory] = useQueryState('category', parseAsString.withDefault(''))
  const [capability, setCapability] = useQueryState('capability', parseAsString.withDefault(''))
  const [industry, setIndustry] = useQueryState('industry', parseAsString.withDefault(''))
  const [model, setModel] = useQueryState('model', parseAsString.withDefault(''))
  const [status, setStatus] = useQueryState('status', parseAsString.withDefault(''))
  const [sort, setSort] = useQueryState('sort', parseAsString.withDefault('highest-rated'))
  const [view, setView] = useQueryState('view', parseAsString.withDefault('grid'))
  const [minRating, setMinRating] = useQueryState('rating', parseAsFloat.withDefault(0))

  // Search results state — used when user types a search query
  const [searchResults, setSearchResults] = useState<Prompt[] | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)

  // Debounced search re-query using browser Supabase client
  useEffect(() => {
    if (!search || search.trim() === '') {
      setSearchResults(null)
      return
    }

    const timer = setTimeout(async () => {
      setSearchLoading(true)
      try {
        const supabase = createClient()
        const query = search.trim()
        const { data } = await supabase
          .from('prompts')
          .select('*')
          .eq('status', 'active')
          .or(`title.ilike.%${query}%,description.ilike.%${query}%,content.ilike.%${query}%`)
        setSearchResults((data as Prompt[]) ?? [])
      } catch {
        setSearchResults(null)
      } finally {
        setSearchLoading(false)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [search])

  // Base prompts: search results override initial prompts when search is active
  const basePrompts = searchResults !== null ? searchResults : initialPrompts

  // Client-side filtering and sorting
  const filteredPrompts = useMemo(() => {
    let result = [...basePrompts]

    if (category) {
      result = result.filter((p) => p.category === category)
    }
    if (capability) {
      result = result.filter((p) => p.capability_type === capability)
    }
    if (industry) {
      result = result.filter((p) => p.industry_tags.includes(industry))
    }
    if (model) {
      result = result.filter((p) => p.target_model === model)
    }
    if (status) {
      result = result.filter((p) => p.status === status)
    }
    if (minRating > 0) {
      result = result.filter((p) => p.avg_effectiveness >= minRating)
    }

    // Sort
    switch (sort) {
      case 'highest-rated':
        result.sort((a, b) => b.avg_effectiveness - a.avg_effectiveness)
        break
      case 'most-used':
        result.sort((a, b) => b.total_checkouts - a.total_checkouts)
        break
      case 'newest':
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case 'a-z':
        result.sort((a, b) => a.title.localeCompare(b.title))
        break
    }

    return result
  }, [basePrompts, category, capability, industry, model, status, minRating, sort])

  const clearAllFilters = () => {
    setSearch(null)
    setCategory(null)
    setCapability(null)
    setIndustry(null)
    setModel(null)
    setStatus(null)
    setMinRating(null)
    setSort('highest-rated')
  }

  return (
    <div>
      <FilterBar
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        capability={capability}
        onCapabilityChange={setCapability}
        industry={industry}
        onIndustryChange={setIndustry}
        model={model}
        onModelChange={setModel}
        status={status}
        onStatusChange={setStatus}
        minRating={minRating}
        onMinRatingChange={setMinRating}
        sort={sort}
        onSortChange={setSort}
        view={view}
        onViewChange={setView}
      />

      <FilterChips
        search={search}
        onSearchChange={setSearch}
        category={category}
        onCategoryChange={setCategory}
        capability={capability}
        onCapabilityChange={setCapability}
        industry={industry}
        onIndustryChange={setIndustry}
        model={model}
        onModelChange={setModel}
        status={status}
        onStatusChange={setStatus}
        minRating={minRating}
        onMinRatingChange={setMinRating}
        onClearAll={clearAllFilters}
        filteredCount={filteredPrompts.length}
        totalCount={totalCount}
      />

      {searchLoading && (
        <div className="text-sm text-muted-foreground py-2 px-4">Searching...</div>
      )}

      {filteredPrompts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <SearchX className="size-10 text-muted-foreground" />
          <h3 className="text-base font-semibold">No prompts match your filters</h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Try adjusting your filters or clear them to see all prompts.
          </p>
          <Button variant="ghost" onClick={clearAllFilters}>
            Clear all filters
          </Button>
        </div>
      ) : view === 'list' ? (
        <div className="divide-y divide-border border border-border rounded-lg overflow-hidden mt-4">
          {filteredPrompts.map((prompt) => (
            <PromptCardList key={prompt.id} prompt={prompt} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {filteredPrompts.map((prompt) => (
            <PromptCard key={prompt.id} prompt={prompt} />
          ))}
        </div>
      )}
    </div>
  )
}
