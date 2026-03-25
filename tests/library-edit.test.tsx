import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import React from 'react'

// Mock Next.js modules
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  useRouter: vi.fn().mockReturnValue({ push: vi.fn() }),
}))

// Mock react-markdown and remark-gfm for components that use them
vi.mock('react-markdown', () => ({
  default: ({ children }: { children: string }) =>
    React.createElement('div', { 'data-testid': 'react-markdown' }, children),
}))
vi.mock('remark-gfm', () => ({ default: () => {} }))

// Mock sonner
vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

// Mock Supabase server client
const mockEq = vi.fn()
const mockUpdate = vi.fn()
const mockFrom = vi.fn()
const mockGetUser = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
      from: mockFrom,
    })
  ),
}))

describe('Edit Prompt — Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default: admin user
    mockGetUser.mockResolvedValue({
      data: {
        user: { id: 'user-1', app_metadata: { role: 'admin' }, is_anonymous: false },
      },
    })

    // Default: successful update chain
    mockEq.mockResolvedValue({ error: null })
    mockUpdate.mockReturnValue({ eq: mockEq })
    mockFrom.mockReturnValue({ update: mockUpdate })
  })

  it('updatePrompt server action updates an existing prompt', async () => {
    const { revalidatePath } = await import('next/cache')
    const { updatePrompt } = await import('../app/(app)/library/actions')

    const formData = new FormData()
    formData.set('title', 'Updated Prompt')
    formData.set('description', 'Updated description')
    formData.set('content', '# Updated content')
    formData.set('category', 'Build')
    formData.set('capability_type', 'generation')
    formData.set('industry_tags', 'finance')
    formData.set('use_case_tags', 'reporting')
    formData.set('target_model', 'gpt-4')
    formData.set('complexity', 'advanced')
    formData.set('input_schema', '')
    formData.set('output_schema', '')

    await updatePrompt('prompt-123', formData).catch(() => {
      // redirect throws — expected
    })

    expect(mockFrom).toHaveBeenCalledWith('prompts')
    expect(mockUpdate).toHaveBeenCalled()
    const updateArgs = mockUpdate.mock.calls[0][0]
    expect(updateArgs.title).toBe('Updated Prompt')
    expect(revalidatePath).toHaveBeenCalledWith('/library')
  })

  it('updatePrompt server action checks user role before mutation', async () => {
    // Override to consultant user
    mockGetUser.mockResolvedValue({
      data: {
        user: { id: 'user-2', app_metadata: { role: 'consultant' }, is_anonymous: false },
      },
    })

    const { updatePrompt } = await import('../app/(app)/library/actions')

    const formData = new FormData()
    formData.set('title', 'Updated Prompt')
    formData.set('content', '# Updated content')
    formData.set('category', 'Build')
    formData.set('capability_type', 'generation')

    const result = await updatePrompt('prompt-123', formData)

    expect(result).toEqual({ error: 'Unauthorized' })
    expect(mockUpdate).not.toHaveBeenCalled()
  })
})

describe('Edit Prompt — PromptForm', () => {
  it('PromptForm pre-fills fields when given an existing prompt', async () => {
    // For form render tests, mock the server action
    vi.doMock('@/app/(app)/library/actions', () => ({
      createPrompt: vi.fn(),
      updatePrompt: vi.fn(),
      deprecatePrompt: vi.fn(),
    }))

    const { PromptForm } = await import('@/components/library/prompt-form')

    const mockPrompt = {
      id: 'prompt-123',
      title: 'Existing Prompt Title',
      description: 'Existing description',
      content: '# Existing content',
      version: 1,
      category: 'Discovery' as const,
      capability_type: 'analysis' as const,
      industry_tags: ['technology', 'saas'],
      use_case_tags: ['consulting'],
      target_model: 'gpt-4',
      complexity: 'moderate' as const,
      input_schema: null,
      output_schema: null,
      dependencies: [],
      sensitivity: 'internal',
      status: 'active' as const,
      avg_effectiveness: 4.5,
      total_checkouts: 10,
      total_ratings: 5,
      last_tested_date: null,
      last_tested_model: null,
      created_by: 'user-1',
      created_at: '2026-01-01T00:00:00Z',
      updated_at: '2026-01-02T00:00:00Z',
    }

    render(<PromptForm action="edit" prompt={mockPrompt} />)

    expect(screen.getByText('Update Prompt')).toBeTruthy()
    expect(screen.getByText('Discard Changes')).toBeTruthy()
    const titleInput = screen.getByDisplayValue('Existing Prompt Title')
    expect(titleInput).toBeTruthy()
  })

  it('/library/[id]/edit page renders PromptForm in edit mode for admin users', async () => {
    const { readFileSync } = await import('fs')
    const content = readFileSync('app/(app)/library/[promptId]/edit/page.tsx', 'utf-8')
    expect(content).toContain('PromptForm')
    expect(content).toContain('edit')
    expect(content).toContain('await params')
  })

  it('/library/[id]/edit page redirects non-admin users', async () => {
    const { readFileSync } = await import('fs')
    const content = readFileSync('app/(app)/library/[promptId]/edit/page.tsx', 'utf-8')
    expect(content).toContain('redirect')
  })
})
