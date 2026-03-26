import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Next.js modules
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Mock Supabase admin client
const mockAdminInsert = vi.fn()
const mockAdminEq = vi.fn()
const mockAdminUpdate = vi.fn()
const mockAdminSingle = vi.fn()
const mockAdminSelect = vi.fn()
const mockAdminFrom = vi.fn()

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: mockAdminFrom,
  })),
}))

// Mock Supabase server client (for getAdminUser auth check)
const mockGetUser = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
    })
  ),
}))

describe('approveMerge — server action', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    // Default: admin user
    mockGetUser.mockResolvedValue({
      data: {
        user: { id: 'admin-1', app_metadata: { role: 'admin' }, is_anonymous: false },
      },
    })

    // Default prompt data from prompts table
    const promptData = { id: 'prompt-1', content: 'Old content', version: 1 }
    mockAdminSingle.mockResolvedValue({ data: promptData, error: null })
    mockAdminEq.mockReturnValue({ single: mockAdminSingle })
    mockAdminSelect.mockReturnValue({ eq: mockAdminEq })

    // Default: successful update/insert chains
    mockAdminInsert.mockResolvedValue({ error: null })
    mockAdminUpdate.mockReturnValue({ eq: vi.fn().mockResolvedValue({ error: null }) })
    mockAdminFrom.mockImplementation((table: string) => {
      if (table === 'prompts') {
        return {
          select: mockAdminSelect,
          update: mockAdminUpdate,
        }
      }
      if (table === 'prompt_changelog') {
        return { insert: mockAdminInsert }
      }
      if (table === 'forked_prompts') {
        return { update: mockAdminUpdate }
      }
      return { select: mockAdminSelect, update: mockAdminUpdate, insert: mockAdminInsert }
    })
  })

  it('returns error when user is not admin', async () => {
    mockGetUser.mockResolvedValue({
      data: {
        user: { id: 'user-1', app_metadata: { role: 'consultant' }, is_anonymous: false },
      },
    })

    const { approveMerge } = await import('../app/(app)/review/actions')

    const result = await approveMerge('fork-1', 'prompt-1', 'New content', 'Merge note')

    expect(result).toEqual({ error: 'Unauthorized' })
  })

  it('returns error when prompt is not found', async () => {
    mockAdminSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116', message: 'Not found' } })

    const { approveMerge } = await import('../app/(app)/review/actions')

    const result = await approveMerge('fork-1', 'prompt-1', 'New content', 'Merge note')

    expect(result).toEqual({ error: 'Prompt not found' })
  })

  it('fetches current prompt version before updating', async () => {
    const { approveMerge } = await import('../app/(app)/review/actions')

    await approveMerge('fork-1', 'prompt-1', 'New content', 'Merge note')

    expect(mockAdminFrom).toHaveBeenCalledWith('prompts')
    expect(mockAdminSelect).toHaveBeenCalled()
    expect(mockAdminEq).toHaveBeenCalledWith('id', 'prompt-1')
    expect(mockAdminSingle).toHaveBeenCalled()
  })

  it('updates prompt content with approvedContent parameter', async () => {
    const { approveMerge } = await import('../app/(app)/review/actions')

    await approveMerge('fork-1', 'prompt-1', 'New approved content', 'Merge note')

    expect(mockAdminUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        content: 'New approved content',
      })
    )
  })

  it('increments prompt version by 1', async () => {
    const { approveMerge } = await import('../app/(app)/review/actions')

    await approveMerge('fork-1', 'prompt-1', 'New content', 'Merge note')

    expect(mockAdminUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        version: 2, // 1 + 1
      })
    )
  })

  it('creates a changelog entry with previous content and merge note', async () => {
    const { approveMerge } = await import('../app/(app)/review/actions')

    await approveMerge('fork-1', 'prompt-1', 'New content', 'Great field improvement')

    expect(mockAdminFrom).toHaveBeenCalledWith('prompt_changelog')
    expect(mockAdminInsert).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt_id: 'prompt-1',
        version: 2,
        change_description: 'Great field improvement',
        previous_content: 'Old content',
        changed_by: 'admin-1',
      })
    )
  })

  it('sets fork merge_status to approved', async () => {
    const { approveMerge } = await import('../app/(app)/review/actions')

    await approveMerge('fork-1', 'prompt-1', 'New content', 'Merge note')

    expect(mockAdminFrom).toHaveBeenCalledWith('forked_prompts')
    expect(mockAdminUpdate).toHaveBeenCalledWith({ merge_status: 'approved' })
  })

  it('calls revalidatePath for /review, /library, and /engagements', async () => {
    const { revalidatePath } = await import('next/cache')
    const { approveMerge } = await import('../app/(app)/review/actions')

    await approveMerge('fork-1', 'prompt-1', 'New content', 'Merge note')

    expect(revalidatePath).toHaveBeenCalledWith('/review')
    expect(revalidatePath).toHaveBeenCalledWith('/library')
    expect(revalidatePath).toHaveBeenCalledWith('/engagements', 'layout')
  })
})
