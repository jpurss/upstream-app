import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  redirect: vi.fn(),
  useRouter: vi.fn(() => ({ push: vi.fn() })),
}))

// Mock auth actions
vi.mock('@/app/(auth)/login/actions', () => ({
  signIn: vi.fn(),
  signInAsDemo: vi.fn(),
}))

vi.mock('@/app/(auth)/signup/actions', () => ({
  signUp: vi.fn(),
}))

// Mock React's useActionState to return a basic state
vi.mock('react', async (importOriginal) => {
  const actual = await importOriginal() as Record<string, unknown>
  return {
    ...actual,
    useActionState: vi.fn((action: unknown, initialState: unknown) => [initialState, action, false]),
  }
})

describe('Login Page', () => {
  it('renders "Explore as Consultant" and "Explore as Admin" demo buttons', async () => {
    const LoginPage = (await import('@/app/(auth)/login/page')).default
    render(<LoginPage />)
    expect(screen.getByText('Explore as Consultant')).toBeInTheDocument()
    expect(screen.getByText('Explore as Admin')).toBeInTheDocument()
  })

  it('renders "No signup required" subtext below demo buttons', async () => {
    const LoginPage = (await import('@/app/(auth)/login/page')).default
    render(<LoginPage />)
    expect(screen.getByText('No signup required')).toBeInTheDocument()
  })

  it('renders email and password input fields with labels', async () => {
    const LoginPage = (await import('@/app/(auth)/login/page')).default
    render(<LoginPage />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
  })

  it('renders "Sign In" submit button', async () => {
    const LoginPage = (await import('@/app/(auth)/login/page')).default
    render(<LoginPage />)
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument()
  })

  it('renders 3 feature highlight headings', async () => {
    const LoginPage = (await import('@/app/(auth)/login/page')).default
    render(<LoginPage />)
    expect(screen.getByText('Prompt Library')).toBeInTheDocument()
    expect(screen.getByText('Fork & Adapt')).toBeInTheDocument()
    expect(screen.getByText('Merge & Improve')).toBeInTheDocument()
  })
})

describe('Signup Page', () => {
  it('renders email and password inputs and "Sign Up" button', async () => {
    const SignupPage = (await import('@/app/(auth)/signup/page')).default
    render(<SignupPage />)
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Password')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /sign up/i })).toBeInTheDocument()
  })

  it('renders "Already have an account? Sign in" link pointing to /login', async () => {
    const SignupPage = (await import('@/app/(auth)/signup/page')).default
    render(<SignupPage />)
    const signInLink = screen.getByRole('link', { name: /sign in/i })
    expect(signInLink).toBeInTheDocument()
    expect(signInLink).toHaveAttribute('href', '/login')
  })
})
