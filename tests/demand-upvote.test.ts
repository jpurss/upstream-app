import { describe, it, vi } from 'vitest'

const mockGetUser = vi.fn()
const mockFrom = vi.fn()
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

describe('toggleUpvote Server Action', () => {
  it.todo('inserts upvote row when user has not yet upvoted')
  it.todo('deletes upvote row when user has already upvoted')
  it.todo('returns error when user is not authenticated')
  it.todo('revalidates /demand after toggle')
})
