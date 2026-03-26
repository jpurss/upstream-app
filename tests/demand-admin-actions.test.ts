import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockGetUser = vi.fn()
const mockAdminFrom = vi.fn()
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve({
    auth: { getUser: mockGetUser },
  })),
}))

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => ({
    from: mockAdminFrom,
  })),
}))

vi.mock('next/cache', () => ({ revalidatePath: vi.fn() }))

// ─── Helpers ─────────────────────────────────────────────────────────────────

function makeAdminUser() {
  mockGetUser.mockResolvedValue({
    data: {
      user: { id: 'admin-1', app_metadata: { role: 'admin' }, is_anonymous: false },
    },
  })
}

function makeConsultantUser() {
  mockGetUser.mockResolvedValue({
    data: {
      user: { id: 'user-1', app_metadata: { role: 'consultant' }, is_anonymous: false },
    },
  })
}

function makeSuccessfulUpdate() {
  const mockEq = vi.fn().mockResolvedValue({ error: null })
  const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
  mockAdminFrom.mockReturnValue({ update: mockUpdate })
  return { mockEq, mockUpdate }
}

// ─── markPlanned ─────────────────────────────────────────────────────────────

describe('markPlanned Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('returns Unauthorized when user is not admin', async () => {
    makeConsultantUser()
    const { markPlanned } = await import('../app/(app)/demand/actions')
    const result = await markPlanned('req-1')
    expect(result).toEqual({ error: 'Unauthorized' })
  })

  it('updates prompt_request status to planned', async () => {
    makeAdminUser()
    const { mockUpdate, mockEq } = makeSuccessfulUpdate()
    const { markPlanned } = await import('../app/(app)/demand/actions')

    await markPlanned('req-1')

    expect(mockAdminFrom).toHaveBeenCalledWith('prompt_requests')
    expect(mockUpdate).toHaveBeenCalledWith({ status: 'planned' })
    expect(mockEq).toHaveBeenCalledWith('id', 'req-1')
  })

  it('revalidates /demand after success', async () => {
    makeAdminUser()
    makeSuccessfulUpdate()
    const { revalidatePath } = await import('next/cache')
    const { markPlanned } = await import('../app/(app)/demand/actions')

    await markPlanned('req-1')

    expect(revalidatePath).toHaveBeenCalledWith('/demand')
  })
})

// ─── resolveRequest ───────────────────────────────────────────────────────────

describe('resolveRequest Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('returns Unauthorized for consultant role', async () => {
    makeConsultantUser()
    const { resolveRequest } = await import('../app/(app)/demand/actions')
    const result = await resolveRequest('req-1', 'prompt-1')
    expect(result).toEqual({ error: 'Unauthorized' })
  })

  it('sets status to resolved and resolved_by_prompt to the linked prompt id', async () => {
    makeAdminUser()
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockAdminFrom.mockReturnValue({ update: mockUpdate })

    const { resolveRequest } = await import('../app/(app)/demand/actions')
    await resolveRequest('req-1', 'prompt-42')

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'resolved',
        resolved_by_prompt: 'prompt-42',
      })
    )
    expect(mockEq).toHaveBeenCalledWith('id', 'req-1')
  })

  it('sets resolved_at timestamp', async () => {
    makeAdminUser()
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockAdminFrom.mockReturnValue({ update: mockUpdate })

    const { resolveRequest } = await import('../app/(app)/demand/actions')
    await resolveRequest('req-1', 'prompt-42')

    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        resolved_at: expect.any(String),
      })
    )
  })

  it('revalidates /demand after success', async () => {
    makeAdminUser()
    makeSuccessfulUpdate()
    const { revalidatePath } = await import('next/cache')
    const { resolveRequest } = await import('../app/(app)/demand/actions')

    await resolveRequest('req-1', 'prompt-42')

    expect(revalidatePath).toHaveBeenCalledWith('/demand')
  })
})

// ─── declineRequest ───────────────────────────────────────────────────────────

describe('declineRequest Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('returns Unauthorized for consultant role', async () => {
    makeConsultantUser()
    const { declineRequest } = await import('../app/(app)/demand/actions')
    const result = await declineRequest('req-1', 'Not relevant')
    expect(result).toEqual({ error: 'Unauthorized' })
  })

  it('sets status to declined and decline_reason to the provided reason', async () => {
    makeAdminUser()
    const mockEq = vi.fn().mockResolvedValue({ error: null })
    const mockUpdate = vi.fn().mockReturnValue({ eq: mockEq })
    mockAdminFrom.mockReturnValue({ update: mockUpdate })

    const { declineRequest } = await import('../app/(app)/demand/actions')
    await declineRequest('req-1', 'Duplicate request')

    expect(mockUpdate).toHaveBeenCalledWith({
      status: 'declined',
      decline_reason: 'Duplicate request',
    })
    expect(mockEq).toHaveBeenCalledWith('id', 'req-1')
  })

  it('revalidates /demand after success', async () => {
    makeAdminUser()
    makeSuccessfulUpdate()
    const { revalidatePath } = await import('next/cache')
    const { declineRequest } = await import('../app/(app)/demand/actions')

    await declineRequest('req-1', 'reason')

    expect(revalidatePath).toHaveBeenCalledWith('/demand')
  })
})

// ─── revertToOpen ─────────────────────────────────────────────────────────────

describe('revertToOpen Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()
  })

  it('returns Unauthorized for consultant role', async () => {
    makeConsultantUser()
    const { revertToOpen } = await import('../app/(app)/demand/actions')
    const result = await revertToOpen('req-1')
    expect(result).toEqual({ error: 'Unauthorized' })
  })

  it('updates status back to open from planned', async () => {
    makeAdminUser()
    const { mockUpdate, mockEq } = makeSuccessfulUpdate()
    const { revertToOpen } = await import('../app/(app)/demand/actions')

    await revertToOpen('req-1')

    expect(mockAdminFrom).toHaveBeenCalledWith('prompt_requests')
    expect(mockUpdate).toHaveBeenCalledWith({ status: 'open' })
    expect(mockEq).toHaveBeenCalledWith('id', 'req-1')
  })

  it('revalidates /demand after success', async () => {
    makeAdminUser()
    makeSuccessfulUpdate()
    const { revalidatePath } = await import('next/cache')
    const { revertToOpen } = await import('../app/(app)/demand/actions')

    await revertToOpen('req-1')

    expect(revalidatePath).toHaveBeenCalledWith('/demand')
  })
})
