import { describe, it, vi } from 'vitest'

const mockGetUser = vi.fn()
const mockAdminFrom = vi.fn()
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve({
    auth: { getUser: mockGetUser },
  })),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: mockAdminFrom,
  })),
}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

describe('markPlanned Server Action', () => {
  it.todo('returns Unauthorized when user is not admin')
  it.todo('updates prompt_request status to planned')
  it.todo('revalidates /demand after success')
})

describe('resolveRequest Server Action', () => {
  it.todo('returns Unauthorized for consultant role')
  it.todo('sets status to resolved and resolved_by_prompt to the linked prompt id')
  it.todo('sets resolved_at timestamp')
  it.todo('revalidates /demand after success')
})

describe('declineRequest Server Action', () => {
  it.todo('returns Unauthorized for consultant role')
  it.todo('sets status to declined and decline_reason to the provided reason')
  it.todo('revalidates /demand after success')
})

describe('revertToOpen Server Action', () => {
  it.todo('returns Unauthorized for consultant role')
  it.todo('updates status back to open from planned')
  it.todo('revalidates /demand after success')
})
