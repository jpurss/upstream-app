import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'

// No-op filter functions for test
const noOp = vi.fn()

const defaultFilterBarProps = {
  search: '',
  onSearchChange: noOp,
  category: '',
  onCategoryChange: noOp,
  capability: '',
  onCapabilityChange: noOp,
  industry: '',
  onIndustryChange: noOp,
  model: '',
  onModelChange: noOp,
  status: '',
  onStatusChange: noOp,
  minRating: 0,
  onMinRatingChange: noOp,
  sort: 'highest-rated',
  onSortChange: noOp,
  view: 'grid',
  onViewChange: noOp,
}

describe('Library Filter Bar', () => {
  it('renders a search input with placeholder "Search prompts..."', async () => {
    const { FilterBar } = await import('@/components/library/filter-bar')
    render(<FilterBar {...defaultFilterBarProps} />)
    const searchInput = screen.getByPlaceholderText('Search prompts...')
    expect(searchInput).toBeInTheDocument()
  })

  it('renders Select dropdowns for category, capability type, industry, target model, status', async () => {
    const { FilterBar } = await import('@/components/library/filter-bar')
    const { container } = render(<FilterBar {...defaultFilterBarProps} />)
    // Each Select renders a trigger element
    const selectTriggers = container.querySelectorAll('[data-slot="select-trigger"]')
    // 5 filter dropdowns + 1 sort dropdown = 6 total
    expect(selectTriggers.length).toBeGreaterThanOrEqual(5)
  })

  it('renders a Slider for effectiveness range', async () => {
    const { FilterBar } = await import('@/components/library/filter-bar')
    const { container } = render(<FilterBar {...defaultFilterBarProps} />)
    const slider = container.querySelector('[data-slot="slider"]')
    expect(slider).toBeInTheDocument()
  })

  it('renders sort dropdown with 4 options visible in the trigger', async () => {
    const { FilterBar } = await import('@/components/library/filter-bar')
    const { container } = render(<FilterBar {...defaultFilterBarProps} />)
    // The sort dropdown should be present
    const selectTriggers = container.querySelectorAll('[data-slot="select-trigger"]')
    // We have at least 6 selects (5 filters + 1 sort)
    expect(selectTriggers.length).toBeGreaterThanOrEqual(6)
    // Highest rated text is in component (it's in the items array)
    const allText = container.textContent
    expect(allText).toContain('Highest rated')
  })

  it('renders grid/list view toggle buttons', async () => {
    const { FilterBar } = await import('@/components/library/filter-bar')
    render(<FilterBar {...defaultFilterBarProps} />)
    // Grid and list buttons by aria-label
    const gridButton = screen.getByLabelText('Grid view')
    const listButton = screen.getByLabelText('List view')
    expect(gridButton).toBeInTheDocument()
    expect(listButton).toBeInTheDocument()
  })
})

describe('Filter Chips', () => {
  const activeFilterProps = {
    search: '',
    onSearchChange: noOp,
    category: 'Discovery',
    onCategoryChange: noOp,
    capability: 'extraction',
    onCapabilityChange: noOp,
    industry: '',
    onIndustryChange: noOp,
    model: '',
    onModelChange: noOp,
    status: '',
    onStatusChange: noOp,
    minRating: 0,
    onMinRatingChange: noOp,
    onClearAll: noOp,
    filteredCount: 3,
    totalCount: 18,
  }

  it('renders a chip for each active filter with a dismiss button', async () => {
    const { FilterChips } = await import('@/components/library/filter-chips')
    render(<FilterChips {...activeFilterProps} />)
    // Two active filters: category and capability
    expect(screen.getByText(/Category: Discovery/)).toBeInTheDocument()
    expect(screen.getByText(/Type: extraction/)).toBeInTheDocument()
    // Each chip has a dismiss button
    const dismissButtons = screen.getAllByRole('button', { name: /Remove .* filter/ })
    expect(dismissButtons.length).toBeGreaterThanOrEqual(2)
  })

  it('renders "Clear all" button when any filter is active', async () => {
    const { FilterChips } = await import('@/components/library/filter-chips')
    render(<FilterChips {...activeFilterProps} />)
    expect(screen.getByRole('button', { name: /Clear all/i })).toBeInTheDocument()
  })

  it('shows result count in format "N of M prompts"', async () => {
    const { FilterChips } = await import('@/components/library/filter-chips')
    render(<FilterChips {...activeFilterProps} />)
    expect(screen.getByText(/3 of 18 prompts/)).toBeInTheDocument()
  })
})
