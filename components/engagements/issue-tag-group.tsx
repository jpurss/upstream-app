'use client'

import { ISSUE_TAGS, type IssueTag } from '@/lib/types/fork'

interface IssueTagGroupProps {
  activeTags: IssueTag[]
  onToggle: (tags: IssueTag[]) => void
}

export function IssueTagGroup({ activeTags, onToggle }: IssueTagGroupProps) {
  function handleToggle(tag: IssueTag) {
    const isActive = activeTags.includes(tag)
    const newTags = isActive
      ? activeTags.filter((t) => t !== tag)
      : [...activeTags, tag]
    onToggle(newTags)
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-[13px] text-muted-foreground">Issue tags</span>
      <div className="flex flex-wrap gap-1.5">
        {ISSUE_TAGS.map(({ value, label }) => {
          const isActive = activeTags.includes(value)
          return (
            <button
              key={value}
              type="button"
              onClick={() => handleToggle(value)}
              className={[
                'inline-flex h-5 items-center rounded-full border px-2 py-0.5 text-xs font-medium transition-colors',
                isActive
                  ? 'bg-primary/10 border-primary/30 text-primary'
                  : 'bg-muted border-border text-muted-foreground hover:border-primary/20 hover:text-foreground',
              ].join(' ')}
            >
              {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
