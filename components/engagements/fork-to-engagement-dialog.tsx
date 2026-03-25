'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { createFork } from '@/app/(app)/engagements/[id]/actions'

interface ForkToEngagementDialogProps {
  promptId: string
  engagements: Array<{ id: string; name: string; client_name: string; status: string }>
  forkedEngagementIds: string[] // engagement IDs where this prompt is already forked
}

const STATUS_DOT: Record<string, string> = {
  active: 'bg-[#65CFB2]',
  paused: 'bg-[#FFB852]',
  completed: 'bg-muted-foreground',
}

export function ForkToEngagementDialog({
  promptId,
  engagements,
  forkedEngagementIds,
}: ForkToEngagementDialogProps) {
  const [open, setOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const activeEngagements = engagements.filter((e) => e.status === 'active')
  const forkedSet = new Set(forkedEngagementIds)

  function handleFork() {
    if (!selectedId) return
    const engagement = engagements.find((e) => e.id === selectedId)
    if (!engagement) return

    startTransition(async () => {
      const result = await createFork(promptId, selectedId)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success(`Forked to ${engagement.name}`)
      setOpen(false)
      setSelectedId(null)
    })
  }

  function handleOpenChange(val: boolean) {
    setOpen(val)
    if (!val) setSelectedId(null)
  }

  return (
    <>
      <Button variant="secondary" className="w-full" onClick={() => setOpen(true)}>
        Fork to Engagement
      </Button>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Fork to Engagement</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-2 py-2">
            {activeEngagements.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                No active engagements.{' '}
                <Link
                  href="/engagements"
                  className="text-foreground underline underline-offset-2 hover:text-primary"
                  onClick={() => setOpen(false)}
                >
                  Create one
                </Link>
              </p>
            ) : (
              activeEngagements.map((engagement) => {
                const isAlreadyForked = forkedSet.has(engagement.id)
                const isSelected = selectedId === engagement.id
                const dotClass = STATUS_DOT[engagement.status] ?? 'bg-muted-foreground'

                return (
                  <button
                    key={engagement.id}
                    type="button"
                    disabled={isAlreadyForked || isPending}
                    onClick={() => !isAlreadyForked && setSelectedId(engagement.id)}
                    className={[
                      'w-full text-left rounded-lg border p-3 transition-colors flex flex-col gap-0.5',
                      isAlreadyForked
                        ? 'opacity-50 cursor-not-allowed border-border bg-card'
                        : isSelected
                          ? 'border-primary/40 bg-primary/5 cursor-pointer'
                          : 'border-border bg-card hover:border-border/60 cursor-pointer',
                    ].join(' ')}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`inline-block size-2 rounded-full shrink-0 ${dotClass}`}
                        />
                        <span className="text-[16px] font-semibold leading-snug truncate">
                          {engagement.name}
                        </span>
                      </div>
                      {isSelected && !isAlreadyForked && (
                        <span className="size-4 rounded-full bg-primary flex items-center justify-center shrink-0">
                          <svg
                            className="size-2.5 text-primary-foreground"
                            fill="none"
                            viewBox="0 0 10 8"
                            stroke="currentColor"
                            strokeWidth={2}
                          >
                            <path
                              d="M1 4l2.5 2.5L9 1"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        </span>
                      )}
                    </div>
                    <span className="text-[13px] text-muted-foreground pl-4">
                      {isAlreadyForked ? 'Already in this engagement' : engagement.client_name}
                    </span>
                  </button>
                )
              })
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="ghost"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Back to Library
            </Button>
            <Button
              type="button"
              onClick={handleFork}
              disabled={!selectedId || isPending || activeEngagements.length === 0}
            >
              {isPending ? 'Forking...' : 'Fork to Engagement'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
