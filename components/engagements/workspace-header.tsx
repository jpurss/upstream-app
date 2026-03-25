'use client'

import { useTransition, useState } from 'react'
import { toast } from 'sonner'
import { GitFork, Star, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { updateEngagementStatus } from '@/app/(app)/engagements/actions'
import type { Engagement, EngagementStatus } from '@/lib/types/engagement'

const STATUS_CONFIG: Record<
  EngagementStatus,
  { label: string; dotClass: string }
> = {
  active: { label: 'Active', dotClass: 'bg-[#65CFB2]' },
  paused: { label: 'Paused', dotClass: 'bg-[#FFB852]' },
  completed: { label: 'Completed', dotClass: 'bg-muted-foreground' },
}

interface WorkspaceHeaderProps {
  engagement: Engagement
  forkCount: number
  avgEffectiveness: number | null
  onForkClick?: () => void
}

export function WorkspaceHeader({
  engagement,
  forkCount,
  avgEffectiveness,
  onForkClick,
}: WorkspaceHeaderProps) {
  const [isPending, startTransition] = useTransition()
  const [currentStatus, setCurrentStatus] = useState<EngagementStatus>(
    engagement.status
  )
  const [completionDialogOpen, setCompletionDialogOpen] = useState(false)
  const [pendingStatus, setPendingStatus] = useState<EngagementStatus | null>(
    null
  )

  function handleStatusChange(value: EngagementStatus | null) {
    if (!value) return
    const newStatus = value
    if (newStatus === 'completed') {
      // Show confirmation dialog before saving
      setPendingStatus('completed')
      setCompletionDialogOpen(true)
      return
    }
    applyStatusChange(newStatus)
  }

  function applyStatusChange(newStatus: EngagementStatus) {
    startTransition(async () => {
      const result = await updateEngagementStatus(engagement.id, newStatus)
      if (result?.error) {
        toast.error(result.error)
      } else {
        setCurrentStatus(newStatus)
      }
    })
  }

  function handleCompletionConfirm() {
    setCompletionDialogOpen(false)
    if (pendingStatus) {
      applyStatusChange(pendingStatus)
      setPendingStatus(null)
    }
  }

  function handleCompletionCancel() {
    setCompletionDialogOpen(false)
    setPendingStatus(null)
  }

  const config = STATUS_CONFIG[currentStatus]

  return (
    <>
      <div className="flex items-start justify-between gap-4 pb-6">
        {/* Left side: engagement name and subline */}
        <div className="flex flex-col gap-1">
          <h1 className="text-[20px] font-semibold leading-[1.2]">
            {engagement.name}
          </h1>
          <div className="flex items-center gap-2">
            <span className="text-[14px] text-muted-foreground">
              {engagement.client_name}
            </span>
            <Badge variant="secondary" className="text-[13px]">
              {engagement.industry}
            </Badge>
          </div>
        </div>

        {/* Right side: status dropdown, fork count, avg effectiveness, fork button */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Status Select */}
          <Select
            value={currentStatus}
            onValueChange={handleStatusChange}
            disabled={isPending}
          >
            <SelectTrigger size="sm" className="h-8 gap-1.5">
              <span
                className={`inline-block size-2 rounded-full shrink-0 ${config.dotClass}`}
              />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(
                Object.entries(STATUS_CONFIG) as [
                  EngagementStatus,
                  { label: string; dotClass: string },
                ][]
              ).map(([value, cfg]) => (
                <SelectItem key={value} value={value}>
                  <span
                    className={`inline-block size-2 rounded-full shrink-0 ${cfg.dotClass}`}
                  />
                  {cfg.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Fork count chip */}
          <div className="flex items-center gap-1 text-[13px] text-muted-foreground">
            <GitFork className="size-3" />
            <span>{forkCount}</span>
          </div>

          {/* Avg effectiveness — only shown when at least one fork has a rating */}
          {avgEffectiveness !== null && (
            <div className="flex items-center gap-1 text-[13px] text-muted-foreground">
              <Star className="size-3 fill-[#FFB852] text-[#FFB852]" />
              <span>{avgEffectiveness.toFixed(1)} avg</span>
            </div>
          )}

          {/* Fork a Prompt button */}
          <Button
            size="sm"
            onClick={onForkClick}
            disabled={!onForkClick}
            className="gap-1.5"
          >
            <Plus className="size-4" />
            Fork a Prompt
          </Button>
        </div>
      </div>

      {/* Completion confirmation dialog */}
      <AlertDialog
        open={completionDialogOpen}
        onOpenChange={setCompletionDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Mark engagement as completed?</AlertDialogTitle>
            <AlertDialogDescription>
              This will mark the engagement as completed. You can reopen it by
              setting the status to Active.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCompletionCancel}>
              Keep Active
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleCompletionConfirm}>
              Mark Complete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
