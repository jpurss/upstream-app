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

// Mock all dashboard data functions so page doesn't call real DB
vi.mock('@/lib/data/dashboard', () => ({
  fetchDashboardMetrics: vi.fn().mockResolvedValue({
    activePrompts: 0,
    totalCheckouts: 0,
    openMergeRequests: 0,
    openPromptRequests: 0,
  }),
  fetchUsageOverTime: vi.fn().mockResolvedValue([]),
  fetchTopPrompts: vi.fn().mockResolvedValue([]),
  fetchNeedsAttention: vi.fn().mockResolvedValue([]),
  fetchDemandVsSupply: vi.fn().mockResolvedValue([]),
}))

// Mock DashboardClient to avoid rendering issues in tests
vi.mock('@/components/dashboard/dashboard-client', () => ({
  DashboardClient: vi.fn(() => null),
}))

describe('Dashboard Page — Admin Gate', () => {
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

  it('redirects unauthenticated users to /login', async () => {
    mockGetUser.mockResolvedValue({
      data: { user: null },
    })

    const { default: DashboardPage } = await import('@/app/(app)/dashboard/page')
    await expect(DashboardPage()).rejects.toThrow('NEXT_REDIRECT:/login')
  })

  it('redirects consultant role to /library', async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: { id: 'consultant-1', app_metadata: { role: 'consultant' }, is_anonymous: false },
      },
    })

    const { default: DashboardPage } = await import('@/app/(app)/dashboard/page')
    await expect(DashboardPage()).rejects.toThrow('NEXT_REDIRECT:/library')
  })

  it('allows admin role to view the page', async () => {
    // Default mock is admin — should NOT redirect (no throw)
    const { default: DashboardPage } = await import('@/app/(app)/dashboard/page')
    await expect(DashboardPage()).resolves.not.toThrow()
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

    const { default: DashboardPage } = await import('@/app/(app)/dashboard/page')
    await expect(DashboardPage()).resolves.not.toThrow()
  })
})
