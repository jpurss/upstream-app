'use client'

import Link from 'next/link'
import { Star, Download } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Prompt } from '@/lib/types/prompt'

type PromptCardProps = {
  prompt: Prompt
}

export function PromptCard({ prompt }: PromptCardProps) {
  return (
    <Link href={`/library/${prompt.id}`} className="block">
      <Card
        className={cn(
          'transition-colors border-l-2 border-l-transparent hover:border-primary/30 cursor-pointer h-full',
          prompt.status === 'deprecated' && 'opacity-60'
        )}
      >
        <CardHeader className="p-4 pb-0">
          <div className="flex items-center justify-between gap-2 mb-2">
            <Badge variant="outline" className="text-[13px] shrink-0">
              {prompt.category}
            </Badge>
            <Badge variant="secondary" className="text-[13px] shrink-0">
              {prompt.target_model}
            </Badge>
          </div>
          <CardTitle className="text-base font-semibold line-clamp-1">
            {prompt.title}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-2 flex flex-col gap-2">
          <p className="text-sm text-muted-foreground line-clamp-2">
            {prompt.description ?? ''}
          </p>
          <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
            <span>{prompt.capability_type}</span>
            {prompt.industry_tags[0] && (
              <>
                <span>·</span>
                <span>{prompt.industry_tags[0]}</span>
              </>
            )}
          </div>
          <div className="flex items-center justify-between text-[13px] text-muted-foreground mt-auto pt-1">
            <div className="flex items-center gap-1" role="img" aria-label={`Rating: ${prompt.avg_effectiveness.toFixed(1)} out of 5`}>
              <Star
                data-icon="inline-start"
                className={cn(
                  'size-3.5 text-[#FFB852]',
                  prompt.avg_effectiveness >= 4.0 && 'fill-[#FFB852]'
                )}
              />
              <span>{prompt.avg_effectiveness.toFixed(1)}</span>
              <span className="text-muted-foreground/60">({prompt.total_ratings})</span>
            </div>
            <div className="flex items-center gap-1">
              <Download data-icon="inline-start" className="size-3.5" />
              <span>{prompt.total_checkouts}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
