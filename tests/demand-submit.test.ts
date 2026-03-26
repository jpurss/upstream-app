import { describe, it, vi } from 'vitest'

// Mock Supabase server client
const mockGetUser = vi.fn()
const mockFrom = vi.fn()
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve({
    auth: { getUser: mockGetUser },
    from: mockFrom,
  })),
}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

describe('submitRequest Server Action', () => {
  it.todo('returns error when user is not authenticated')
  it.todo('inserts a prompt_request row with requested_by = user.id')
  it.todo('sets status to open by default')
  it.todo('revalidates /demand after successful insert')
  it.todo('returns error message when Supabase insert fails')
})
