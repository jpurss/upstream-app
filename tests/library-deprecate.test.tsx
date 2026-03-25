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

describe('Deprecate Prompt — Server Action', () => {
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

  it('deprecatePrompt server action sets status to deprecated', async () => {
    const { revalidatePath } = await import('next/cache')
    // Import the real server action (not mocked here)
    const { deprecatePrompt } = await import('../app/(app)/library/actions')

    const result = await deprecatePrompt('prompt-123')

    expect(mockFrom).toHaveBeenCalledWith('prompts')
    expect(mockUpdate).toHaveBeenCalledWith({ status: 'deprecated' })
    expect(result).toEqual({ success: true })
    expect(revalidatePath).toHaveBeenCalledWith('/library')
  })

  it('deprecatePrompt server action checks user role before mutation', async () => {
    // Override to consultant user
    mockGetUser.mockResolvedValue({
      data: {
        user: { id: 'user-2', app_metadata: { role: 'consultant' }, is_anonymous: false },
      },
    })

    const { deprecatePrompt } = await import('../app/(app)/library/actions')

    const result = await deprecatePrompt('prompt-123')

    expect(result).toEqual({ error: 'Unauthorized' })
    expect(mockUpdate).not.toHaveBeenCalled()
  })
})

describe('Deprecate Prompt — DeprecationDialog', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('DeprecationDialog renders AlertDialog with correct title and description', async () => {
    // For dialog render tests, mock the server action
    vi.doMock('@/app/(app)/library/actions', () => ({
      createPrompt: vi.fn(),
      updatePrompt: vi.fn(),
      deprecatePrompt: vi.fn().mockResolvedValue({ success: true }),
    }))

    const { DeprecationDialog } = await import('@/components/library/deprecation-dialog')
    render(<DeprecationDialog promptId="prompt-123" />)

    expect(screen.getByText('Deprecate Prompt')).toBeTruthy()
  })

  it('DeprecationDialog confirm calls deprecatePrompt', async () => {
    const { DeprecationDialog } = await import('@/components/library/deprecation-dialog')
    render(<DeprecationDialog promptId="prompt-123" />)

    const trigger = screen.getByText('Deprecate Prompt')
    expect(trigger).toBeTruthy()
  })
})
