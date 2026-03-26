import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Next.js cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Mock Supabase server client
const mockGetUser = vi.fn()
const mockSelect = vi.fn()
const mockEq = vi.fn()
const mockMaybeSingle = vi.fn()
const mockInsert = vi.fn()
const mockDelete = vi.fn()
const mockFrom = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
      from: mockFrom,
    })
  ),
}))

describe('toggleUpvote Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()

    // Default: authenticated user
    mockGetUser.mockResolvedValue({
      data: {
        user: { id: 'user-1', app_metadata: { role: 'consultant' }, is_anonymous: false },
      },
    })

    // Default maybeSingle chain: no existing upvote
    mockMaybeSingle.mockResolvedValue({ data: null, error: null })
    mockEq.mockReturnValue({ eq: mockEq, maybeSingle: mockMaybeSingle })
    mockSelect.mockReturnValue({ eq: mockEq })

    // Default insert/delete
    mockInsert.mockResolvedValue({ error: null })
    mockDelete.mockReturnValue({ eq: mockEq })

    // from() returns different chainables based on usage
    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      delete: mockDelete,
    })
  })

  it('inserts upvote row when user has not yet upvoted', async () => {
    // No existing upvote
    mockMaybeSingle.mockResolvedValue({ data: null })

    const { toggleUpvote } = await import('../app/(app)/demand/actions')

    await toggleUpvote('request-1')

    expect(mockFrom).toHaveBeenCalledWith('request_upvotes')
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ request_id: 'request-1', user_id: 'user-1' })
    )
  })

  it('deletes upvote row when user has already upvoted', async () => {
    // Existing upvote found
    mockMaybeSingle.mockResolvedValue({ data: { request_id: 'request-1' } })

    // Delete chain: eq returns {eq}
    const mockDeleteEq2 = vi.fn().mockResolvedValue({ error: null })
    const mockDeleteEq1 = vi.fn().mockReturnValue({ eq: mockDeleteEq2 })
    mockDelete.mockReturnValue({ eq: mockDeleteEq1 })

    mockFrom.mockReturnValue({
      select: mockSelect,
      insert: mockInsert,
      delete: mockDelete,
    })

    const { toggleUpvote } = await import('../app/(app)/demand/actions')

    await toggleUpvote('request-1')

    expect(mockDelete).toHaveBeenCalled()
  })

  it('returns error when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const { toggleUpvote } = await import('../app/(app)/demand/actions')

    const result = await toggleUpvote('request-1')

    expect(result).toEqual({ error: 'You must be signed in to upvote' })
  })

  it('revalidates /demand after toggle', async () => {
    const { revalidatePath } = await import('next/cache')
    const { toggleUpvote } = await import('../app/(app)/demand/actions')

    await toggleUpvote('request-1')

    expect(revalidatePath).toHaveBeenCalledWith('/demand')
  })
})
