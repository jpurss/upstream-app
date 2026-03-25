import { describe, it, expect, vi, beforeEach } from 'vitest'

// Mock next/navigation redirect
const mockRedirect = vi.fn()
vi.mock('next/navigation', () => ({
  redirect: mockRedirect,
}))

// Mock next/headers cookies
const mockCookieStore = {
  getAll: vi.fn(() => []),
  set: vi.fn(),
}
vi.mock('next/headers', () => ({
  cookies: vi.fn(() => Promise.resolve(mockCookieStore)),
}))

// Track Supabase auth method calls
const mockSignInWithPassword = vi.fn()
const mockSignUp = vi.fn()
const mockSignInAnonymously = vi.fn()
const mockSignOut = vi.fn()

vi.mock('@supabase/ssr', () => ({
  createServerClient: vi.fn(() => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      signInAnonymously: mockSignInAnonymously,
      signOut: mockSignOut,
    },
  })),
}))

describe('signIn Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls supabase.auth.signInWithPassword with provided email and password', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null })
    mockRedirect.mockImplementation(() => { throw new Error('NEXT_REDIRECT') })

    const { signIn } = await import('@/app/(auth)/login/actions')
    const formData = new FormData()
    formData.append('email', 'test@example.com')
    formData.append('password', 'password123')

    try {
      await signIn(null, formData)
    } catch {
      // redirect throws — expected
    }

    expect(mockSignInWithPassword).toHaveBeenCalledWith({
      email: 'test@example.com',
      password: 'password123',
    })
  })

  it('returns error message on invalid credentials', async () => {
    mockSignInWithPassword.mockResolvedValue({
      error: { message: 'Invalid login credentials' },
    })

    const { signIn } = await import('@/app/(auth)/login/actions')
    const formData = new FormData()
    formData.append('email', 'bad@example.com')
    formData.append('password', 'wrong')

    const result = await signIn(null, formData)
    expect(result).toEqual({ error: 'Incorrect email or password. Please try again.' })
  })

  it('redirects to /library on successful sign in', async () => {
    mockSignInWithPassword.mockResolvedValue({ error: null })
    mockRedirect.mockImplementation(() => { throw new Error('NEXT_REDIRECT') })

    const { signIn } = await import('@/app/(auth)/login/actions')
    const formData = new FormData()
    formData.append('email', 'test@example.com')
    formData.append('password', 'password123')

    try {
      await signIn(null, formData)
    } catch {
      // redirect throws
    }

    expect(mockRedirect).toHaveBeenCalledWith('/library')
  })
})

describe('signInAsDemo Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("calls signInAnonymously with demo_role='consultant' and display_name='Demo Consultant'", async () => {
    mockSignInAnonymously.mockResolvedValue({ error: null })
    mockRedirect.mockImplementation(() => { throw new Error('NEXT_REDIRECT') })

    const { signInAsDemo } = await import('@/app/(auth)/login/actions')

    try {
      await signInAsDemo('consultant')
    } catch {
      // redirect throws
    }

    expect(mockSignInAnonymously).toHaveBeenCalledWith({
      options: {
        data: {
          demo_role: 'consultant',
          display_name: 'Demo Consultant',
        },
      },
    })
  })

  it("calls signInAnonymously with demo_role='admin' and display_name='Demo Admin'", async () => {
    mockSignInAnonymously.mockResolvedValue({ error: null })
    mockRedirect.mockImplementation(() => { throw new Error('NEXT_REDIRECT') })

    const { signInAsDemo } = await import('@/app/(auth)/login/actions')

    try {
      await signInAsDemo('admin')
    } catch {
      // redirect throws
    }

    expect(mockSignInAnonymously).toHaveBeenCalledWith({
      options: {
        data: {
          demo_role: 'admin',
          display_name: 'Demo Admin',
        },
      },
    })
  })

  it('redirects to /library on successful demo sign in', async () => {
    mockSignInAnonymously.mockResolvedValue({ error: null })
    mockRedirect.mockImplementation(() => { throw new Error('NEXT_REDIRECT') })

    const { signInAsDemo } = await import('@/app/(auth)/login/actions')

    try {
      await signInAsDemo('consultant')
    } catch {
      // redirect throws
    }

    expect(mockRedirect).toHaveBeenCalledWith('/library')
  })
})

describe('signUp Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls supabase.auth.signUp with provided email and password', async () => {
    mockSignUp.mockResolvedValue({ error: null })
    mockRedirect.mockImplementation(() => { throw new Error('NEXT_REDIRECT') })

    const { signUp } = await import('@/app/(auth)/signup/actions')
    const formData = new FormData()
    formData.append('email', 'new@example.com')
    formData.append('password', 'newpassword123')

    try {
      await signUp(null, formData)
    } catch {
      // redirect throws
    }

    expect(mockSignUp).toHaveBeenCalledWith({
      email: 'new@example.com',
      password: 'newpassword123',
    })
  })
})

describe('signOut Server Action', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('calls supabase.auth.signOut and redirects to /login', async () => {
    mockSignOut.mockResolvedValue({ error: null })
    mockRedirect.mockImplementation(() => { throw new Error('NEXT_REDIRECT') })

    const { signOut } = await import('@/lib/auth-utils')

    try {
      await signOut()
    } catch {
      // redirect throws
    }

    expect(mockSignOut).toHaveBeenCalled()
    expect(mockRedirect).toHaveBeenCalledWith('/login')
  })
})
