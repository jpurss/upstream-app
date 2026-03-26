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
const mockAdminSingle = vi.fn()
const mockAdminSelect = vi.fn()
const mockAdminUpdate = vi.fn()
const mockAdminInsert = vi.fn()
const mockAdminFrom = vi.fn()

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: mockAdminFrom,
  })),
}))

describe('approveMerge Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default: authenticated admin user
    mockGetUser.mockResolvedValue({
      data: {
        user: { id: 'admin-1', app_metadata: { role: 'admin' }, is_anonymous: false },
      },
    })
  })

  it.todo('fetches current prompt version before updating')
  it.todo('updates prompt content with approvedContent parameter')
  it.todo('increments prompt version by 1')
  it.todo('creates a changelog entry with previous content and merge note')
  it.todo('sets fork merge_status to approved')
  it.todo('returns error when user is not admin')
  it.todo('returns error when prompt is not found')
  it.todo('calls revalidatePath for /review, /library, and /engagements')
})
