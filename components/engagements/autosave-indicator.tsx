'use client'

import { cn } from '@/lib/utils'

interface AutosaveIndicatorProps {
  state: 'idle' | 'saving' | 'saved'
}

export function AutosaveIndicator({ state }: AutosaveIndicatorProps) {
  if (state === 'idle') return null
  return (
    <span
      className={cn(
        'text-[13px] text-muted-foreground transition-opacity duration-300',
        state === 'saved' && 'opacity-70'
      )}
    >
      {state === 'saving' ? 'Saving...' : 'Saved'}
    </span>
  )
}
