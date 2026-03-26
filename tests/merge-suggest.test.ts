import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Next.js modules
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
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

describe('suggestMerge — server action', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default: authenticated consultant user
    mockGetUser.mockResolvedValue({
      data: {
        user: { id: 'user-1', app_metadata: { role: 'consultant' }, is_anonymous: false },
      },
    })

    // Default: successful update chain
    mockEq.mockResolvedValue({ error: null })
    mockUpdate.mockReturnValue({ eq: mockEq })
    mockFrom.mockReturnValue({ update: mockUpdate })
  })

  it('sets merge_status to pending and merge_suggestion to the provided note', async () => {
    const { suggestMerge } = await import('../app/(app)/engagements/[id]/forks/[forkId]/actions')

    const result = await suggestMerge('fork-1', 'This adaptation handles client X edge case well')

    expect(mockFrom).toHaveBeenCalledWith('forked_prompts')
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        merge_status: 'pending',
        merge_suggestion: 'This adaptation handles client X edge case well',
      })
    )
    expect(result).toEqual({ success: true })
  })

  it('clears merge_decline_reason on resubmission', async () => {
    const { suggestMerge } = await import('../app/(app)/engagements/[id]/forks/[forkId]/actions')

    await suggestMerge('fork-1', 'Updated merge note')

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        merge_decline_reason: null,
      })
    )
  })

  it('returns error when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const { suggestMerge } = await import('../app/(app)/engagements/[id]/forks/[forkId]/actions')

    const result = await suggestMerge('fork-1', 'A note')

    expect(result).toEqual({ error: 'Unauthorized' })
    expect(mockUpdate).not.toHaveBeenCalled()
  })

  it('calls revalidatePath for /engagements and /review', async () => {
    const { revalidatePath } = await import('next/cache')
    const { suggestMerge } = await import('../app/(app)/engagements/[id]/forks/[forkId]/actions')

    await suggestMerge('fork-1', 'A note')

    expect(revalidatePath).toHaveBeenCalledWith('/engagements')
    expect(revalidatePath).toHaveBeenCalledWith('/review')
  })
})
