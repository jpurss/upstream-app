import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Next.js navigation (for redirect)
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  useRouter: vi.fn().mockReturnValue({ push: vi.fn() }),
}))

// Mock Supabase server client (for auth check and role verification)
const mockGetUser = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
    })
  ),
}))

describe('Review Queue Page — Admin Gate', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default: authenticated admin user
    mockGetUser.mockResolvedValue({
      data: {
        user: { id: 'admin-1', app_metadata: { role: 'admin' }, is_anonymous: false },
      },
    })
  })

  it.todo('redirects non-admin users to /engagements')
  it.todo('redirects unauthenticated users to /login')
  it.todo('allows admin users to view the page')
  it.todo('allows anonymous demo admin to view the page')
})
