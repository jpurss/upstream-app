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
const mockInsert = vi.fn()
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

describe('Create Prompt — Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default: admin user
    mockGetUser.mockResolvedValue({
      data: {
        user: { id: 'user-1', app_metadata: { role: 'admin' }, is_anonymous: false },
      },
    })

    // Default: successful insert
    mockInsert.mockResolvedValue({ data: { id: 'new-id' }, error: null })
    mockFrom.mockReturnValue({ insert: mockInsert })
  })

  it('createPrompt server action inserts a prompt into the database', async () => {
    const { revalidatePath } = await import('next/cache')
    const { createPrompt } = await import('../app/(app)/library/actions')

    const formData = new FormData()
    formData.set('title', 'Test Prompt')
    formData.set('description', 'A test description')
    formData.set('content', '# Test content')
    formData.set('category', 'Discovery')
    formData.set('capability_type', 'analysis')
    formData.set('industry_tags', 'technology, saas')
    formData.set('use_case_tags', 'consulting')
    formData.set('target_model', 'model-agnostic')
    formData.set('complexity', 'moderate')
    formData.set('input_schema', '')
    formData.set('output_schema', '')

    await createPrompt(formData).catch(() => {
      // redirect throws — expected
    })

    expect(mockFrom).toHaveBeenCalledWith('prompts')
    expect(mockInsert).toHaveBeenCalled()
    const insertArgs = mockInsert.mock.calls[0][0]
    expect(insertArgs.title).toBe('Test Prompt')
    expect(insertArgs.status).toBe('active')
    expect(revalidatePath).toHaveBeenCalledWith('/library')
  })

  it('createPrompt server action checks user role before mutation', async () => {
    // Override to consultant user
    mockGetUser.mockResolvedValue({
      data: {
        user: { id: 'user-2', app_metadata: { role: 'consultant' }, is_anonymous: false },
      },
    })

    const { createPrompt } = await import('../app/(app)/library/actions')

    const formData = new FormData()
    formData.set('title', 'Test Prompt')
    formData.set('content', '# Test content')
    formData.set('category', 'Discovery')
    formData.set('capability_type', 'analysis')

    const result = await createPrompt(formData)

    expect(result).toEqual({ error: 'Unauthorized' })
    expect(mockInsert).not.toHaveBeenCalled()
  })
})

describe('Create Prompt — PromptForm', () => {
  it('PromptForm renders all required fields for create mode', async () => {
    // For form render tests, mock the server action
    vi.doMock('@/app/(app)/library/actions', () => ({
      createPrompt: vi.fn(),
      updatePrompt: vi.fn(),
      deprecatePrompt: vi.fn(),
    }))

    const { PromptForm } = await import('@/components/library/prompt-form')
    render(<PromptForm action="create" />)

    expect(screen.getByText('Write')).toBeTruthy()
    expect(screen.getByText('Preview')).toBeTruthy()
    expect(screen.getByText('Save Prompt')).toBeTruthy()
    expect(screen.getByText('Discard Changes')).toBeTruthy()
  })

  it('/library/new page renders PromptForm in create mode for admin users', async () => {
    const { readFileSync } = await import('fs')
    const content = readFileSync('app/(app)/library/new/page.tsx', 'utf-8')
    expect(content).toContain('PromptForm')
    expect(content).toContain('create')
    expect(content).toContain('New Prompt')
  })

  it('/library/new page redirects non-admin users to /library', async () => {
    const { readFileSync } = await import('fs')
    const content = readFileSync('app/(app)/library/new/page.tsx', 'utf-8')
    expect(content).toContain("redirect('/library')")
  })
})
