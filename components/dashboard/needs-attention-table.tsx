import Link from 'next/link'
import { StarRating } from '@/components/engagements/star-rating'
import type { NeedsAttentionPrompt } from '@/lib/data/dashboard'

interface NeedsAttentionTableProps {
  prompts: NeedsAttentionPrompt[]
}

export function NeedsAttentionTable({ prompts }: NeedsAttentionTableProps) {
  const lowestRated = prompts.filter((p) => p.type === 'lowest_rated')
  const underutilized = prompts.filter((p) => p.type === 'underutilized')

  return (
    <div className="bg-card border border-border rounded-md">
      <div className="p-4 border-b border-border">
        <h2 className="text-[16px] font-semibold text-foreground">Needs Attention</h2>
      </div>

      {/* Sub-section A: Lowest Rated */}
      <div className="py-2 px-4 bg-muted/30 border-b border-border">
        <span className="text-[13px] text-muted-foreground">Lowest Rated</span>
      </div>
      {lowestRated.length === 0 ? (
        <p className="text-[13px] text-muted-foreground py-3 px-4 border-b border-border">
          Rating data will appear here as consultants rate prompts after use.
        </p>
      ) : (
        <div>
          {lowestRated.map((prompt) => (
            <Link
              key={prompt.id}
              href={`/library/${prompt.id}`}
              className="flex items-center justify-between py-3 px-4 border-b border-border hover:bg-accent/40 transition-colors"
            >
              <span className="text-sm text-foreground flex-1 min-w-0 mr-4 truncate">
                {prompt.title}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <StarRating rating={prompt.avg_effectiveness} showLabel={false} />
                <span className="text-[13px] text-muted-foreground">
                  {prompt.avg_effectiveness.toFixed(1)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Sub-section B: Underutilized */}
      <div className="py-2 px-4 bg-muted/30 border-b border-border">
        <span className="text-[13px] text-muted-foreground">Underutilized</span>
      </div>
      {underutilized.length === 0 ? (
        <p className="text-[13px] text-muted-foreground py-3 px-4">
          All prompts have been checked out at least once.
        </p>
      ) : (
        <div>
          {underutilized.map((prompt) => (
            <Link
              key={prompt.id}
              href={`/library/${prompt.id}`}
              className="flex items-center justify-between py-3 px-4 border-b border-border hover:bg-accent/40 transition-colors last:border-b-0"
            >
              <span className="text-sm text-foreground flex-1 min-w-0 mr-4 truncate">
                {prompt.title}
              </span>
              <span className="text-[13px] text-muted-foreground shrink-0">0 checkouts</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
