import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Next.js modules
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Mock Supabase admin client
const mockAdminEq = vi.fn()
const mockAdminUpdate = vi.fn()
const mockAdminFrom = vi.fn()

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: mockAdminFrom,
  })),
}))

// Mock Supabase server client (for getAdminUser auth check)
const mockGetUser = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
    })
  ),
}))

describe('declineMerge — server action', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default: admin user
    mockGetUser.mockResolvedValue({
      data: {
        user: { id: 'admin-1', app_metadata: { role: 'admin' }, is_anonymous: false },
      },
    })

    // Default: successful update chain
    mockAdminEq.mockResolvedValue({ error: null })
    mockAdminUpdate.mockReturnValue({ eq: mockAdminEq })
    mockAdminFrom.mockReturnValue({ update: mockAdminUpdate })
  })

  it('sets merge_status to declined and stores decline reason', async () => {
    const { declineMerge } = await import('../app/(app)/review/actions')

    const result = await declineMerge('fork-1', 'Content contains client-specific PII')

    expect(mockAdminFrom).toHaveBeenCalledWith('forked_prompts')
    expect(mockAdminUpdate).toHaveBeenCalledWith({
      merge_status: 'declined',
      merge_decline_reason: 'Content contains client-specific PII',
    })
    expect(result).toEqual({ success: true })
  })

  it('returns error when user is not admin', async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: { id: 'user-1', app_metadata: { role: 'consultant' }, is_anonymous: false },
      },
    })

    const { declineMerge } = await import('../app/(app)/review/actions')

    const result = await declineMerge('fork-1', 'Some reason')

    expect(result).toEqual({ error: 'Unauthorized' })
    expect(mockAdminUpdate).not.toHaveBeenCalled()
  })

  it('calls revalidatePath for /review and /engagements', async () => {
    const { revalidatePath } = await import('next/cache')
    const { declineMerge } = await import('../app/(app)/review/actions')

    await declineMerge('fork-1', 'Reason for decline')

    expect(revalidatePath).toHaveBeenCalledWith('/review')
    expect(revalidatePath).toHaveBeenCalledWith('/engagements', 'layout')
  })
})
