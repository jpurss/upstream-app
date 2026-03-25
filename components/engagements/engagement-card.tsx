'use client'

import Link from 'next/link'
import { GitFork } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardHeader, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { EngagementWithStats } from '@/lib/types/engagement'

function getRelativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffMin = Math.floor(diffMs / 60000)
  const diffHr = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)
  if (diffMin < 1) return 'just now'
  if (diffMin < 60) return `${diffMin}m ago`
  if (diffHr < 24) return `${diffHr}h ago`
  if (diffDay < 30) return `${diffDay}d ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const STATUS_DOT_CLASSES: Record<string, string> = {
  active: 'bg-[#65CFB2]',
  paused: 'bg-[#FFB852]',
  completed: 'bg-muted-foreground',
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  paused: 'Paused',
  completed: 'Completed',
}

type EngagementCardProps = {
  engagement: EngagementWithStats
}

export function EngagementCard({ engagement }: EngagementCardProps) {
  return (
    <Link href={`/engagements/${engagement.id}`} className="block h-full">
      <Card className="transition-colors border-l-2 border-l-transparent hover:border-primary/30 cursor-pointer h-full">
        <CardHeader className="p-4 pb-0">
          <div className="flex flex-col gap-1">
            <h3 className="text-base font-semibold leading-snug line-clamp-1">
              {engagement.name}
            </h3>
            <p className="text-sm text-muted-foreground">{engagement.client_name}</p>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-2 flex flex-col gap-3">
          <Badge variant="secondary" className="text-[13px] w-fit">
            {engagement.industry}
          </Badge>

          <div className="flex items-center gap-4 text-[13px] text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  'inline-block size-2 rounded-full shrink-0',
                  STATUS_DOT_CLASSES[engagement.status] ?? 'bg-muted-foreground'
                )}
              />
              <span>{STATUS_LABELS[engagement.status] ?? engagement.status}</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[13px] text-muted-foreground mt-auto">
            <div className="flex items-center gap-1">
              <GitFork className="size-3 shrink-0" />
              <span>{engagement.fork_count}</span>
            </div>
            <span>{getRelativeTime(engagement.last_activity)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
