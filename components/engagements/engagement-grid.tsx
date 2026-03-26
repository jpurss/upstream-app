'use client'

import Link from 'next/link'
import { Briefcase } from 'lucide-react'
import { EngagementCard } from '@/components/engagements/engagement-card'
import type { EngagementWithStats } from '@/lib/types/engagement'

type EngagementGridProps = {
  engagements: EngagementWithStats[]
  userId: string
}

export function EngagementGrid({ engagements }: EngagementGridProps) {
  if (engagements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Briefcase className="size-10 text-muted-foreground" />
        <h2 className="text-base font-semibold">Create your first engagement</h2>
        <p className="text-sm text-muted-foreground max-w-[320px] text-center">
          Fork prompts into client workspaces, adapt them, and rate what works.
        </p>
        <p className="text-sm text-muted-foreground">
          Click <strong>New Engagement</strong> above to get started.
        </p>
        <Link
          href="/library"
          className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
        >
          or Browse the Library →
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {engagements.map((engagement) => (
        <EngagementCard key={engagement.id} engagement={engagement} />
      ))}
    </div>
  )
}
