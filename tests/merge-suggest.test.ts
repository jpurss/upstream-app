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

// Mock Supabase server client (consultant uses regular client — no admin privileges)
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

describe('suggestMerge Server Action', () => {
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

  it.todo('sets merge_status to pending and merge_suggestion to the provided note')
  it.todo('clears merge_decline_reason on resubmission')
  it.todo('returns error when user is not authenticated')
  it.todo('calls revalidatePath for /engagements and /review')
})
