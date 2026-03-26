import { describe, it, vi } from 'vitest'

const mockGetUser = vi.fn()
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve({
    auth: { getUser: mockGetUser },
  })),
}))

vi.mock('next/navigation', () => ({
  redirect: vi.fn((url: string) => { throw new Error(`REDIRECT:${url}`) }),
}))

describe('Dashboard Page Admin Gate', () => {
  it.todo('redirects unauthenticated user to /login')
  it.todo('redirects consultant role to /library')
  it.todo('renders dashboard for admin role')
  it.todo('renders dashboard for demo admin role')
})
