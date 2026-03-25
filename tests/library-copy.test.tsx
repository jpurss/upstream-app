import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import React from 'react'

// Mock react-markdown
vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) =>
    React.createElement('div', { 'data-testid': 'react-markdown' }, children),
}))
vi.mock('remark-gfm', () => ({ default: () => {} }))

// Mock sonner using a function reference that vitest can hoist safely
vi.mock('sonner', () => ({
  toast: { success: vi.fn() },
}))

import { PromptDetailSidebar } from '../components/library/prompt-detail-sidebar'
import type { Prompt } from '../lib/types/prompt'
import { toast } from 'sonner'

const mockPrompt: Prompt = {
  id: 'copy-test-id',
  title: 'Copy Test Prompt',
  description: null,
  content: 'Prompt content to copy',
  version: 1,
  category: 'Build',
  capability_type: 'generation',
  industry_tags: [],
  use_case_tags: [],
  target_model: 'gpt-4',
  complexity: 'basic',
  input_schema: null,
  output_schema: null,
  dependencies: [],
  sensitivity: 'public',
  status: 'active',
  avg_effectiveness: 3.8,
  total_checkouts: 10,
  total_ratings: 5,
  last_tested_date: null,
  last_tested_model: null,
  created_by: null,
  created_at: '2026-02-01T00:00:00Z',
  updated_at: '2026-02-01T00:00:00Z',
}

describe('Copy to Clipboard', () => {
  let mockWriteText: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    mockWriteText = vi.fn().mockResolvedValue(undefined)
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: mockWriteText },
      writable: true,
      configurable: true,
    })
  })

  it('renders copy button that calls navigator.clipboard.writeText', async () => {
    render(<PromptDetailSidebar prompt={mockPrompt} isAdmin={false} />)
    const copyBtn = screen.getByRole('button', { name: /copy/i })
    expect(copyBtn).toBeTruthy()

    fireEvent.click(copyBtn)

    await waitFor(() => {
      expect(mockWriteText).toHaveBeenCalledWith('Prompt content to copy')
    })
  })

  it('copy button icon changes from Copy to Check after click', async () => {
    render(<PromptDetailSidebar prompt={mockPrompt} isAdmin={false} />)

    const copyBtn = screen.getByRole('button', { name: /copy/i })
    // Before click: Copy icon should be present
    expect(copyBtn.querySelector('[data-testid="copy-icon"]')).toBeTruthy()

    fireEvent.click(copyBtn)

    await waitFor(() => {
      // After click: Check icon replaces Copy icon
      expect(copyBtn.querySelector('[data-testid="check-icon"]')).toBeTruthy()
    })
  })

  it('copy button triggers sonner toast with Copied to clipboard message', async () => {
    render(<PromptDetailSidebar prompt={mockPrompt} isAdmin={false} />)
    const copyBtn = screen.getByRole('button', { name: /copy/i })
    fireEvent.click(copyBtn)

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Copied to clipboard')
    })
  })
})
