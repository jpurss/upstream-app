import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import React from 'react'
import { Prompt } from '@/lib/types/prompt'

// Mock nuqs useQueryState
vi.mock('nuqs', () => ({
  useQueryState: vi.fn().mockReturnValue([null, vi.fn()]),
  parseAsString: { withDefault: (v: string) => ({ withDefault: () => v }) },
  parseAsFloat: { withDefault: (v: number) => ({ withDefault: () => v }) },
}))

// Mock supabase browser client
vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          or: vi.fn(() => ({ data: [], error: null }))
        }))
      }))
    }))
  }))
}))

const mockPrompt: Prompt = {
  id: 'test-id-1',
  title: 'Discovery Prompt',
  description: 'A prompt for discovery phase work',
  content: '# Discovery\n\nThis is a prompt.',
  version: 1,
  category: 'Discovery',
  capability_type: 'extraction',
  industry_tags: ['technology', 'saas'],
  use_case_tags: ['stakeholder-interviews'],
  target_model: 'Claude Sonnet 4',
  complexity: 'basic',
  input_schema: null,
  output_schema: null,
  dependencies: [],
  sensitivity: 'internal',
  status: 'active',
  avg_effectiveness: 4.2,
  total_checkouts: 15,
  total_ratings: 8,
  last_tested_date: null,
  last_tested_model: null,
  created_by: null,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
}

describe('PromptCard', () => {
  it('renders title, description, category badge, model badge, star rating with count, and checkout count', async () => {
    const { PromptCard } = await import('@/components/library/prompt-card')
    render(<PromptCard prompt={mockPrompt} />)

    expect(screen.getByText('Discovery Prompt')).toBeInTheDocument()
    expect(screen.getByText('A prompt for discovery phase work')).toBeInTheDocument()
    expect(screen.getByText('Discovery')).toBeInTheDocument()
    expect(screen.getByText('Claude Sonnet 4')).toBeInTheDocument()
    expect(screen.getByText('4.2')).toBeInTheDocument()
    expect(screen.getByText('15')).toBeInTheDocument()
  })

  it('wraps entire card in a Link pointing to /library/{id}', async () => {
    const { PromptCard } = await import('@/components/library/prompt-card')
    const { container } = render(<PromptCard prompt={mockPrompt} />)
    const link = container.querySelector('a')
    expect(link).toBeTruthy()
    expect(link?.getAttribute('href')).toBe('/library/test-id-1')
  })
})

describe('PromptCardList', () => {
  it('renders title, category, capability type, model, rating, and checkouts in a row layout', async () => {
    const { PromptCardList } = await import('@/components/library/prompt-card-list')
    render(<PromptCardList prompt={mockPrompt} />)

    expect(screen.getByText('Discovery Prompt')).toBeInTheDocument()
    expect(screen.getByText('Discovery')).toBeInTheDocument()
    expect(screen.getByText('extraction')).toBeInTheDocument()
    expect(screen.getByText('Claude Sonnet 4')).toBeInTheDocument()
    expect(screen.getByText('4.2')).toBeInTheDocument()
    expect(screen.getByText('15')).toBeInTheDocument()
  })
})

describe('Library Grid', () => {
  it('renders prompt cards in grid mode by default', async () => {
    const { LibraryGrid } = await import('@/components/library/library-grid')
    render(<LibraryGrid initialPrompts={[mockPrompt]} isAdmin={false} totalCount={1} />)
    expect(screen.getByText('Discovery Prompt')).toBeInTheDocument()
  })

  it('shows empty state message when filtered prompts array is empty', async () => {
    const { LibraryGrid } = await import('@/components/library/library-grid')
    render(<LibraryGrid initialPrompts={[]} isAdmin={false} totalCount={0} />)
    expect(screen.getByText('No prompts match your filters')).toBeInTheDocument()
  })
})
