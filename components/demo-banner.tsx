import Link from 'next/link'

interface DemoBannerProps {
  isAnonymous: boolean
  demoRole: 'consultant' | 'admin' | null
}

export function DemoBanner({ isAnonymous, demoRole }: DemoBannerProps) {
  if (!isAnonymous) return null

  const roleLabel = demoRole === 'admin' ? 'Admin' : 'Consultant'

  return (
    <div
      role="banner"
      aria-label="Demo mode indicator"
      className="h-8 w-full flex items-center justify-center text-[13px] font-normal shrink-0"
      style={{ backgroundColor: 'color-mix(in srgb, #4287FF 15%, #09090b)' }}
    >
      <span className="text-zinc-300">
        Demo mode &mdash; {roleLabel} view. Sign up to save your work.{' '}
        <Link href="/signup" className="text-[#4287FF] hover:underline">
          Sign Up
        </Link>
      </span>
    </div>
  )
}
