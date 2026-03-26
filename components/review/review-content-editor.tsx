'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface ReviewContentEditorProps {
  content: string
  onChange: (content: string) => void
}

export function ReviewContentEditor({ content, onChange }: ReviewContentEditorProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div>
      <Button
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
        className="gap-2 text-[15px]"
      >
        <ChevronDown className={`size-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
        Edit content
      </Button>
      {isExpanded && (
        <div className="mt-3">
          <p className="text-[13px] text-muted-foreground mb-2">
            This content will replace the library prompt on approval.
          </p>
          <Textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            className="min-h-[200px] font-mono text-[13px] leading-[1.6]"
          />
        </div>
      )}
    </div>
  )
}
