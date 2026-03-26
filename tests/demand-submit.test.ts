import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock Next.js cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Mock Supabase server client
const mockGetUser = vi.fn()
const mockInsert = vi.fn()
const mockFrom = vi.fn()

vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() =>
    Promise.resolve({
      auth: { getUser: mockGetUser },
      from: mockFrom,
    })
  ),
}))

describe('submitRequest Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.resetModules()

    // Default: authenticated user
    mockGetUser.mockResolvedValue({
      data: {
        user: { id: 'user-1', app_metadata: { role: 'consultant' }, is_anonymous: false },
      },
    })

    // Default: successful insert
    mockInsert.mockResolvedValue({ error: null })
    mockFrom.mockReturnValue({ insert: mockInsert })
  })

  it('returns error when user is not authenticated', async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } })

    const { submitRequest } = await import('../app/(app)/demand/actions')

    const result = await submitRequest({
      title: 'Test request',
      description: 'Test description',
      category: 'Discovery',
      urgency: 'medium',
    })

    expect(result).toEqual({ error: 'You must be signed in to submit a request' })
    expect(mockFrom).not.toHaveBeenCalled()
  })

  it('inserts a prompt_request row with requested_by = user.id', async () => {
    const { submitRequest } = await import('../app/(app)/demand/actions')

    await submitRequest({
      title: 'Test request',
      description: 'Test description',
      category: 'Discovery',
      urgency: 'medium',
    })

    expect(mockFrom).toHaveBeenCalledWith('prompt_requests')
    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ requested_by: 'user-1' })
    )
  })

  it('sets status to open by default', async () => {
    const { submitRequest } = await import('../app/(app)/demand/actions')

    await submitRequest({
      title: 'Test request',
      description: 'Test description',
      category: 'Discovery',
      urgency: 'medium',
    })

    expect(mockInsert).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'open' })
    )
  })

  it('revalidates /demand after successful insert', async () => {
    const { revalidatePath } = await import('next/cache')
    const { submitRequest } = await import('../app/(app)/demand/actions')

    await submitRequest({
      title: 'Test request',
      description: 'Test description',
      category: 'Discovery',
      urgency: 'medium',
    })

    expect(revalidatePath).toHaveBeenCalledWith('/demand')
  })

  it('returns error message when Supabase insert fails', async () => {
    mockInsert.mockResolvedValue({ error: { message: 'Insert failed' } })

    const { submitRequest } = await import('../app/(app)/demand/actions')

    const result = await submitRequest({
      title: 'Test request',
      description: 'Test description',
      category: 'Discovery',
      urgency: 'medium',
    })

    expect(result).toEqual({ error: 'Insert failed' })
  })
})
