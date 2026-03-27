'use client'

import { useActionState } from 'react'
import { useTransition } from 'react'
import Link from 'next/link'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { signIn, signInAsDemo } from './actions'

type ActionState = { error?: string } | null

const initialState: ActionState = null

export default function LoginPage() {
  const [state, formAction, isPending] = useActionState(signIn, initialState)
  const [isDemoConsultantPending, startConsultantTransition] = useTransition()
  const [isDemoAdminPending, startAdminTransition] = useTransition()

  function handleDemoConsultant() {
    startConsultantTransition(async () => {
      await signInAsDemo('consultant')
    })
  }

  function handleDemoAdmin() {
    startAdminTransition(async () => {
      await signInAsDemo('admin')
    })
  }

  return (
    <div className="min-h-screen flex">
      {/* Left column — product context (60% on desktop) */}
      <div className="hidden xl:flex xl:w-3/5 relative overflow-hidden bg-zinc-950">
        {/* Background illustration */}
        <img
          src="/login-bg.png"
          alt=""
          aria-hidden="true"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Dark overlay — keeps text readable over the illustration */}
        <div className="absolute inset-0 bg-zinc-950/85" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 py-16">
          {/* Wordmark */}
          <div className="mb-16">
            <h1 className="text-xl font-brand font-black tracking-tight text-white">Upstream</h1>
          </div>

          {/* Brand motto */}
          <p className="font-display text-5xl font-black leading-[1.1] tracking-tight text-white">
            Every engagement makes your firm{' '}
            <span className="text-[#4287FF]">smarter</span>.
          </p>
        </div>
      </div>

      {/* Right column — auth panel (40% on desktop, full width on mobile) */}
      <div className="flex-1 xl:w-2/5 flex flex-col justify-center px-8 py-16 bg-zinc-950 xl:bg-zinc-900 xl:border-l xl:border-zinc-800">
        <div className="w-full max-w-sm mx-auto">
          {/* Wordmark (visible on mobile and in auth panel) */}
          <h2 className="text-xl font-brand font-black tracking-tight text-white mb-8">Upstream</h2>

          {/* Demo section */}
          <div className="space-y-3">
            <p className="text-[13px] font-semibold text-zinc-400 uppercase tracking-wide">
              Explore the Demo
            </p>

            <Button
              type="button"
              className="w-full h-11 text-base font-semibold bg-[#4287FF] hover:bg-[#4287FF]/90 text-white border-0"
              onClick={handleDemoAdmin}
              disabled={isDemoConsultantPending || isDemoAdminPending || isPending}
            >
              {isDemoAdminPending ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : null}
              Explore as Admin
            </Button>

            <Button
              type="button"
              variant="outline"
              className="w-full h-11 text-base font-semibold border-[#4287FF] text-[#4287FF] hover:bg-[#4287FF]/10 hover:text-[#4287FF] bg-transparent"
              onClick={handleDemoConsultant}
              disabled={isDemoConsultantPending || isDemoAdminPending || isPending}
            >
              {isDemoConsultantPending ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : null}
              Explore as Consultant
            </Button>

            <p className="text-[13px] text-zinc-500 text-center">No signup required</p>
          </div>

          {/* Divider */}
          <div className="relative my-6">
            <Separator className="bg-zinc-800" />
            <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-zinc-900 xl:bg-zinc-900 px-2 text-[13px] text-zinc-500">
              or
            </span>
          </div>

          {/* Login form */}
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
                autoComplete="current-password"
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
              disabled={isPending || isDemoConsultantPending || isDemoAdminPending}
            >
              {isPending ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : null}
              Sign In
            </Button>
          </form>

          {/* Signup link */}
          <p className="mt-4 text-[13px] text-zinc-500 text-center">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="text-[#4287FF] hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
