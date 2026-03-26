import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Supabase admin client
const mockHead = vi.fn()
const mockSingle = vi.fn()
const mockOrder = vi.fn()
const mockNot = vi.fn()
const mockEq = vi.fn()
const mockNeq = vi.fn()
const mockSelect = vi.fn()
const mockFrom = vi.fn()

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: mockFrom,
  })),
}))

// Helper to build chainable mock
function buildChain() {
  mockHead.mockResolvedValue({ count: 0, error: null })
  mockSingle.mockResolvedValue({ data: null, error: null })
  mockOrder.mockReturnValue({ eq: mockEq, single: mockSingle })
  mockNot.mockReturnValue({ order: mockOrder })
  mockEq.mockReturnValue({ single: mockSingle, order: mockOrder })
  mockNeq.mockReturnValue({ order: mockOrder, eq: mockEq, not: mockNot })
  mockSelect.mockReturnValue({
    neq: mockNeq,
    eq: mockEq,
    not: mockNot,
    order: mockOrder,
    single: mockSingle,
  })
  mockFrom.mockReturnValue({ select: mockSelect })
}

describe('fetchMergeSuggestions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    buildChain()
  })

  it('uses createAdminClient not createClient', async () => {
    const { createAdminClient } = await import('@/lib/supabase/admin')
    mockOrder.mockResolvedValue({ data: [], error: null })

    const { fetchMergeSuggestions } = await import('../lib/data/merge-suggestions')
    await fetchMergeSuggestions()

    expect(createAdminClient).toHaveBeenCalled()
  })

  it('filters by merge_status when status param is not "all"', async () => {
    mockOrder.mockResolvedValue({ data: [], error: null })
    mockEq.mockReturnValue({ order: mockOrder })

    const { fetchMergeSuggestions } = await import('../lib/data/merge-suggestions')
    await fetchMergeSuggestions('pending')

    expect(mockNeq).toHaveBeenCalledWith('merge_status', 'none')
    expect(mockEq).toHaveBeenCalledWith('merge_status', 'pending')
  })

  it('returns all non-none statuses when status param is "all"', async () => {
    mockNot.mockReturnValue({ order: mockOrder })
    mockOrder.mockResolvedValue({ data: [], error: null })

    const { fetchMergeSuggestions } = await import('../lib/data/merge-suggestions')
    await fetchMergeSuggestions('all')

    expect(mockNeq).toHaveBeenCalledWith('merge_status', 'none')
    // Should NOT call .eq for status when 'all'
    expect(mockEq).not.toHaveBeenCalledWith('merge_status', 'all')
  })

  it('flattens joined fields into MergeSuggestion shape', async () => {
    const rawData = [
      {
        id: 'fork-1',
        merge_status: 'pending',
        merge_suggestion: 'This is great',
        merge_decline_reason: null,
        adapted_content: 'Adapted content',
        original_content: 'Original content',
        effectiveness_rating: 4,
        issues: [],
        feedback_notes: null,
        adaptation_notes: null,
        contains_client_context: false,
        forked_at: '2026-01-01T00:00:00Z',
        forked_by: 'user-1',
        source_prompt_id: 'prompt-1',
        engagement_id: 'eng-1',
        prompts: { title: 'Test Prompt', content: 'Prompt content', version: 2 },
        profiles: { name: 'John Doe' },
        engagements: { name: 'Acme Corp', id: 'eng-1' },
      },
    ]
    mockEq.mockReturnValue({ order: mockOrder })
    mockOrder.mockResolvedValue({ data: rawData, error: null })

    const { fetchMergeSuggestions } = await import('../lib/data/merge-suggestions')
    const result = await fetchMergeSuggestions('pending')

    expect(result).toHaveLength(1)
    expect(result[0].source_prompt_title).toBe('Test Prompt')
    expect(result[0].source_prompt_content).toBe('Prompt content')
    expect(result[0].source_prompt_version).toBe(2)
    expect(result[0].submitter_name).toBe('John Doe')
    expect(result[0].engagement_name).toBe('Acme Corp')
  })
})

describe('fetchMergeSuggestionById', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    buildChain()
  })

  it('returns null when suggestion not found', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } })
    mockEq.mockReturnValue({ not: mockNot })
    mockNot.mockReturnValue({ single: mockSingle })

    const { fetchMergeSuggestionById } = await import('../lib/data/merge-suggestions')
    const result = await fetchMergeSuggestionById('nonexistent-id')

    expect(result).toBeNull()
  })

  it('excludes forks with merge_status of none', async () => {
    mockSingle.mockResolvedValue({ data: null, error: null })
    mockEq.mockReturnValue({ not: mockNot })
    mockNot.mockReturnValue({ single: mockSingle })

    const { fetchMergeSuggestionById } = await import('../lib/data/merge-suggestions')
    await fetchMergeSuggestionById('fork-1')

    expect(mockEq).toHaveBeenCalledWith('id', 'fork-1')
    expect(mockNot).toHaveBeenCalledWith('merge_status', 'eq', 'none')
  })
})

describe('countPendingMerges', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    buildChain()
  })

  it('returns count of forks with merge_status pending', async () => {
    mockEq.mockResolvedValue({ count: 3, error: null })
    mockSelect.mockReturnValue({ eq: mockEq })

    const { countPendingMerges } = await import('../lib/data/merge-suggestions')
    const result = await countPendingMerges()

    expect(result).toBe(3)
    expect(mockEq).toHaveBeenCalledWith('merge_status', 'pending')
  })

  it('returns 0 when no pending forks exist', async () => {
    mockEq.mockResolvedValue({ count: null, error: null })
    mockSelect.mockReturnValue({ eq: mockEq })

    const { countPendingMerges } = await import('../lib/data/merge-suggestions')
    const result = await countPendingMerges()

    expect(result).toBe(0)
  })
})
