import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Supabase admin client (all data access uses admin client — bypasses RLS)
const mockAdminEq = vi.fn()
const mockAdminNeq = vi.fn()
const mockAdminSelect = vi.fn()
const mockAdminSingle = vi.fn()
const mockAdminOrder = vi.fn()
const mockAdminFrom = vi.fn()

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: mockAdminFrom,
  })),
}))

describe('Merge Data Access Layer', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('fetchMergeSuggestions', () => {
    it.todo('uses createAdminClient, not createClient')
    it.todo('filters by merge_status when status param is not all')
    it.todo('returns all non-none statuses when status param is all')
    it.todo('flattens joined fields into MergeSuggestion shape')
  })

  describe('fetchMergeSuggestionById', () => {
    it.todo('returns null when suggestion not found')
    it.todo('excludes forks with merge_status of none')
  })

  describe('countPendingMerges', () => {
    it.todo('returns count of forks with merge_status pending')
    it.todo('returns 0 when no pending forks exist')
  })
})
