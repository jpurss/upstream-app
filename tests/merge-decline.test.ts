import { describe, it, expect, vi, beforeEach } from 'vitest'

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

// Mock Supabase server client (for auth check — who is calling)
const mockGetUser = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
    })
  ),
}))

// Mock Supabase admin client (for all mutations — bypasses RLS)
const mockAdminEq = vi.fn()
const mockAdminUpdate = vi.fn()
const mockAdminFrom = vi.fn()

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: mockAdminFrom,
  })),
}))

describe('declineMerge Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default: authenticated admin user
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

  it.todo('sets merge_status to declined and stores decline reason')
  it.todo('returns error when user is not admin')
  it.todo('calls revalidatePath for /review and /engagements')
})
