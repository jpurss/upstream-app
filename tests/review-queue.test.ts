import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Next.js navigation (for redirect)
// Next.js redirect() throws a NEXT_REDIRECT error to halt execution.
// We simulate that by throwing so downstream code is not reached.
vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => {
    throw new Error('NEXT_REDIRECT:' + url)
  }),
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

// Mock fetchMergeSuggestions so page doesn't call real DB
vi.mock('@/lib/data/merge-suggestions', () => ({
  fetchMergeSuggestions: vi.fn().mockResolvedValue([]),
}))

describe('Review Queue Page — Admin Gate', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()

    // Default: authenticated admin user
    mockGetUser.mockResolvedValue({
      data: {
        user: { id: 'admin-1', app_metadata: { role: 'admin' }, is_anonymous: false },
      },
    })
  })

  it('redirects non-admin users to /engagements', async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: { id: 'consultant-1', app_metadata: { role: 'consultant' }, is_anonymous: false },
      },
    })

    const { default: ReviewQueuePage } = await import('@/app/(app)/review/page')
    await expect(
      ReviewQueuePage({ searchParams: Promise.resolve({}) })
    ).rejects.toThrow('NEXT_REDIRECT:/engagements')
  })

  it('redirects unauthenticated users to /login', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
    })

    const { default: ReviewQueuePage } = await import('@/app/(app)/review/page')
    await expect(
      ReviewQueuePage({ searchParams: Promise.resolve({}) })
    ).rejects.toThrow('NEXT_REDIRECT:/login')
  })

  it('allows admin users to view the page', async () => {
    // Default mock is admin — should NOT redirect (no throw)
    const { default: ReviewQueuePage } = await import('@/app/(app)/review/page')
    await expect(
      ReviewQueuePage({ searchParams: Promise.resolve({}) })
    ).resolves.not.toThrow()
  })

  it('allows anonymous demo admin to view the page', async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: {
          id: 'anon-1',
          app_metadata: { role: null },
          is_anonymous: true,
          user_metadata: { demo_role: 'admin' },
        },
      },
    })

    const { default: ReviewQueuePage } = await import('@/app/(app)/review/page')
    await expect(
      ReviewQueuePage({ searchParams: Promise.resolve({}) })
    ).resolves.not.toThrow()
  })
})
