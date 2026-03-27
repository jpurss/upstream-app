'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { signUp } from './actions'

type ActionState = { error?: string } | null

const initialState: ActionState = null

export default function SignupPage() {
  const [state, formAction, isPending] = useActionState(signUp, initialState)

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-8">
      <div className="w-full max-w-sm">
        {/* Wordmark */}
        <h1 className="text-xl font-brand font-black tracking-tight text-white mb-8">Upstream</h1>

        <h2 className="text-base font-semibold text-white mb-6">Create your account</h2>

        {/* Signup form */}
        <form action={formAction} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email" className="text-sm text-zinc-300">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="bg-zinc-900 border-zinc-800 focus-visible:border-zinc-600 h-9"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-sm text-zinc-300">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              autoComplete="new-password"
              minLength={8}
              className="bg-zinc-900 border-zinc-800 focus-visible:border-zinc-600 h-9"
            />
          </div>

          {state?.error && (
            <p
              className="text-sm text-red-500"
              aria-live="polite"
              role="alert"
            >
              {state.error}
            </p>
          )}

          <Button
            type="submit"
            className="w-full h-9 text-sm font-semibold bg-[#4287FF] hover:bg-[#4287FF]/90 text-white border-0"
            disabled={isPending}
          >
            {isPending ? (
              <Loader2 className="size-4 animate-spin mr-2" />
            ) : null}
            Sign Up
          </Button>
        </form>

        {/* Login link */}
        <p className="mt-4 text-[13px] text-zinc-500 text-center">
          Already have an account?{' '}
          <Link href="/login" className="text-[#4287FF] hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
