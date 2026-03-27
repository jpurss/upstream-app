import Link from 'next/link'
import type { TopPrompt } from '@/lib/data/dashboard'

interface TopPromptsTableProps {
  prompts: TopPrompt[]
}

export function TopPromptsTable({ prompts }: TopPromptsTableProps) {
  const maxCount = prompts.length > 0 ? Math.max(...prompts.map((p) => p.total_checkouts)) : 1

  return (
    <div className="bg-card border border-border rounded-md">
      <div className="p-4 border-b border-border">
        <h2 className="text-[16px] font-semibold text-foreground">Most Used Prompts</h2>
      </div>
      {prompts.length === 0 ? (
        <p className="text-[13px] text-muted-foreground py-3 px-4">
          Prompts will appear here as consultants check them out.
        </p>
      ) : (
        <div>
          {prompts.map((prompt) => {
            const barWidth = maxCount > 0 ? (prompt.total_checkouts / maxCount) * 100 : 0
            return (
              <Link
                key={prompt.id}
                href={`/library/${prompt.id}`}
                className="flex items-center justify-between py-3 px-4 border-b border-border hover:bg-accent/40 transition-colors last:border-b-0 group"
              >
                <div className="flex-1 min-w-0 mr-4">
                  <p className="text-sm text-foreground truncate">{prompt.title}</p>
                  <div className="mt-1.5 h-1 rounded-full bg-[#4287FF]/20 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#4287FF]/60"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                </div>
                <span className="text-[13px] text-muted-foreground shrink-0">
                  {prompt.total_checkouts}
                </span>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
