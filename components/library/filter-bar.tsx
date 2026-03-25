'use client'

import React from 'react'
import { Search, LayoutGrid, List } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'

type FilterBarProps = {
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
  sort: string
  onSortChange: (val: string | null) => void
  view: string
  onViewChange: (val: string | null) => void
}

const categoryItems = [
  { label: 'All categories', value: null },
  { label: 'Discovery', value: 'Discovery' },
  { label: 'Solution Design', value: 'Solution Design' },
  { label: 'Build', value: 'Build' },
  { label: 'Enablement', value: 'Enablement' },
  { label: 'Delivery', value: 'Delivery' },
  { label: 'Internal Ops', value: 'Internal Ops' },
]

const capabilityItems = [
  { label: 'All types', value: null },
  { label: 'Extraction', value: 'extraction' },
  { label: 'Analysis', value: 'analysis' },
  { label: 'Generation', value: 'generation' },
  { label: 'Transformation', value: 'transformation' },
  { label: 'Evaluation', value: 'evaluation' },
  { label: 'Synthesis', value: 'synthesis' },
]

const industryItems = [
  { label: 'All industries', value: null },
  { label: 'Cross-industry', value: 'cross-industry' },
  { label: 'Technology', value: 'technology' },
  { label: 'SaaS', value: 'saas' },
  { label: 'Financial Services', value: 'financial-services' },
  { label: 'Healthcare', value: 'healthcare' },
  { label: 'Retail', value: 'retail' },
  { label: 'Manufacturing', value: 'manufacturing' },
  { label: 'Energy', value: 'energy' },
]

const modelItems = [
  { label: 'All models', value: null },
  { label: 'Claude Sonnet 4', value: 'Claude Sonnet 4' },
  { label: 'GPT-4o', value: 'GPT-4o' },
  { label: 'Gemini 2.5 Pro', value: 'Gemini 2.5 Pro' },
  { label: 'Model-agnostic', value: 'model-agnostic' },
]

const statusItems = [
  { label: 'All statuses', value: null },
  { label: 'Active', value: 'active' },
  { label: 'Deprecated', value: 'deprecated' },
]

const sortItems = [
  { label: 'Highest rated', value: 'highest-rated' },
  { label: 'Most used', value: 'most-used' },
  { label: 'Newest first', value: 'newest' },
  { label: 'A-Z', value: 'a-z' },
]

export function FilterBar({
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
  sort,
  onSortChange,
  view,
  onViewChange,
}: FilterBarProps) {
  return (
    <div className="sticky top-0 z-10 bg-background border-b border-border px-4 py-3">
      <div className="flex flex-wrap items-center gap-2">
        {/* Search input */}
        <div className="relative flex-1 min-w-[200px] max-w-[300px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <Input
            type="text"
            placeholder="Search prompts..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value || null)}
            className="pl-8 h-9"
          />
        </div>

        {/* Category filter */}
        <Select
          items={categoryItems}
          value={category || null}
          onValueChange={onCategoryChange}
        >
          <SelectTrigger className="h-9 w-auto min-w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false} side="bottom">
            <SelectGroup>
              {categoryItems.map((item) => (
                <SelectItem key={item.value ?? '__all__'} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Capability type filter */}
        <Select
          items={capabilityItems}
          value={capability || null}
          onValueChange={onCapabilityChange}
        >
          <SelectTrigger className="h-9 w-auto min-w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false} side="bottom">
            <SelectGroup>
              {capabilityItems.map((item) => (
                <SelectItem key={item.value ?? '__all__'} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Industry filter */}
        <Select
          items={industryItems}
          value={industry || null}
          onValueChange={onIndustryChange}
        >
          <SelectTrigger className="h-9 w-auto min-w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false} side="bottom">
            <SelectGroup>
              {industryItems.map((item) => (
                <SelectItem key={item.value ?? '__all__'} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Model filter */}
        <Select
          items={modelItems}
          value={model || null}
          onValueChange={onModelChange}
        >
          <SelectTrigger className="h-9 w-auto min-w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false} side="bottom">
            <SelectGroup>
              {modelItems.map((item) => (
                <SelectItem key={item.value ?? '__all__'} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Status filter */}
        <Select
          items={statusItems}
          value={status || null}
          onValueChange={onStatusChange}
        >
          <SelectTrigger className="h-9 w-auto min-w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false} side="bottom">
            <SelectGroup>
              {statusItems.map((item) => (
                <SelectItem key={item.value ?? '__all__'} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* Effectiveness slider */}
        <div className="flex items-center gap-2 min-w-[140px]">
          <span className="text-[13px] text-muted-foreground whitespace-nowrap">
            {minRating > 0 ? `≥${minRating}★` : 'All ratings'}
          </span>
          <Slider
            min={0}
            max={5}
            step={0.5}
            defaultValue={minRating}
            onValueChange={(v) => onMinRatingChange(Array.isArray(v) ? (v as number[])[0] : (v as number) || null)}
            className="w-24"
          />
        </div>

        {/* Sort dropdown */}
        <Select
          items={sortItems}
          value={sort || 'highest-rated'}
          onValueChange={(v) => onSortChange(v || 'highest-rated')}
        >
          <SelectTrigger className="h-9 w-auto min-w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false} side="bottom">
            <SelectGroup>
              {sortItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>

        {/* View toggle */}
        <TooltipProvider>
          <div className="flex items-center gap-1 ml-auto">
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant={view === 'grid' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => onViewChange('grid')}
                  aria-label="Grid view"
                >
                  <LayoutGrid className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Grid view</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>
                <Button
                  variant={view === 'list' ? 'secondary' : 'ghost'}
                  size="icon"
                  className="h-9 w-9"
                  onClick={() => onViewChange('list')}
                  aria-label="List view"
                >
                  <List className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>List view</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      </div>
    </div>
  )
}
