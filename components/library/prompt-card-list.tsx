'use client'

import Link from 'next/link'
import { Star, Download } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Prompt } from '@/lib/types/prompt'

type PromptCardListProps = {
  prompt: Prompt
}

export function PromptCardList({ prompt }: PromptCardListProps) {
  return (
    <Link
      href={`/library/${prompt.id}`}
      className="flex items-center gap-4 px-4 border-b border-border hover:bg-card/50 cursor-pointer min-h-[48px] transition-colors"
    >
      <span className="flex-1 text-sm font-medium text-foreground truncate">
        {prompt.title}
      </span>
      <Badge variant="outline" className="text-[13px] shrink-0 hidden sm:flex">
        {prompt.category}
      </Badge>
      <span className="text-[13px] text-muted-foreground shrink-0 hidden md:block w-24">
        {prompt.capability_type}
      </span>
      <Badge variant="secondary" className="text-[13px] shrink-0 hidden lg:flex">
        {prompt.target_model}
      </Badge>
      <div className="flex items-center gap-1 text-[13px] text-muted-foreground shrink-0">
        <Star className="size-3.5 fill-[#FFB852] text-[#FFB852]" />
        <span>{prompt.avg_effectiveness.toFixed(1)}</span>
      </div>
      <div className="flex items-center gap-1 text-[13px] text-muted-foreground shrink-0">
        <Download className="size-3.5" />
        <span>{prompt.total_checkouts}</span>
      </div>
    </Link>
  )
}
