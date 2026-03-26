import { describe, it, expect, vi } from 'vitest'
import { render, screen, act } from '@testing-library/react'
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

  it('renders filter dropdowns inside the expandable panel after clicking Filters button', async () => {
    const { FilterBar } = await import('@/components/library/filter-bar')
    const { container } = render(<FilterBar {...defaultFilterBarProps} />)
    // Filters panel is collapsed by default — only sort dropdown visible
    const triggersBefore = container.querySelectorAll('[data-slot="select-trigger"]')
    expect(triggersBefore.length).toBe(1)
    // Open filters panel
    await act(async () => {
      screen.getByText('Filters').click()
    })
    // Now all 5 filter dropdowns + 1 sort = 6 total
    const triggersAfter = container.querySelectorAll('[data-slot="select-trigger"]')
    expect(triggersAfter.length).toBeGreaterThanOrEqual(6)
  })

  it('renders a Slider for effectiveness range when filters panel is open', async () => {
    const { FilterBar } = await import('@/components/library/filter-bar')
    const { container } = render(<FilterBar {...defaultFilterBarProps} />)
    // Open filters panel
    await act(async () => {
      screen.getByText('Filters').click()
    })
    const slider = container.querySelector('[data-slot="slider"]')
    expect(slider).toBeInTheDocument()
  })

  it('renders sort dropdown with "Highest rated" text in the primary row', async () => {
    const { FilterBar } = await import('@/components/library/filter-bar')
    const { container } = render(<FilterBar {...defaultFilterBarProps} />)
    // Sort dropdown is always visible (not behind the filters toggle)
    const selectTriggers = container.querySelectorAll('[data-slot="select-trigger"]')
    expect(selectTriggers.length).toBeGreaterThanOrEqual(1)
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
