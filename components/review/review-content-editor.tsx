'use client'

import { Textarea } from '@/components/ui/textarea'

interface ReviewContentEditorProps {
  content: string
  originalContent: string
  onChange: (content: string) => void
  onReset: () => void
}

export function ReviewContentEditor({ content, originalContent, onChange, onReset }: ReviewContentEditorProps) {
  const hasEdited = content !== originalContent

  return (
    <div className="flex flex-col gap-3">
      <p className="text-[13px] text-muted-foreground">
        Edit the content below. This version will replace the library prompt when you approve.
      </p>
      <Textarea
        value={content}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-[400px] font-mono text-[13px] leading-[1.6] bg-card border-border resize-y"
      />
      <div className="flex items-center justify-between">
        {hasEdited ? (
          <button
            type="button"
            onClick={onReset}
            className="text-[13px] text-muted-foreground hover:text-foreground transition-colors"
          >
            Reset to original adaptation
          </button>
        ) : (
          <div />
        )}
        <span className="text-[13px] text-muted-foreground">
          {content.length} characters
        </span>
      </div>
    </div>
  )
}
