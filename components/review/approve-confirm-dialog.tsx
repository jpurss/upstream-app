'use client'

import { useTransition } from 'react'
import { toast } from 'sonner'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { approveMerge } from '@/app/(app)/review/actions'

interface ApproveConfirmDialogProps {
  suggestionId: string
  sourcePromptId: string
  editedContent: string
  hasEdited: boolean
  currentVersion: number
  mergeNote: string
  onSuccess: () => void
  disabled?: boolean
  children: React.ReactNode
}

export function ApproveConfirmDialog({
  suggestionId,
  sourcePromptId,
  editedContent,
  hasEdited,
  currentVersion,
  mergeNote,
  onSuccess,
  disabled,
  children,
}: ApproveConfirmDialogProps) {
  const [isPending, startTransition] = useTransition()
  const nextVersion = currentVersion + 1

  function handleApprove() {
    startTransition(async () => {
      const result = await approveMerge(
        suggestionId,
        sourcePromptId,
        editedContent,
        mergeNote
      )
      if (result.success) {
        toast.success(`Merged to v${nextVersion}`, {
          description: 'The library prompt has been updated.',
        })
        onSuccess()
      } else {
        toast.error(
          'Merge failed — the library prompt may have been updated by someone else. Refresh and try again.'
        )
      }
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button className="gap-2 rounded-full" disabled={disabled} />}>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Approve and merge this change?</AlertDialogTitle>
          <AlertDialogDescription>
            {hasEdited
              ? `Your edited content (not the original fork adaptation) will replace the library prompt. Version will be bumped from ${currentVersion} to ${nextVersion}. This cannot be undone.`
              : `The fork's adapted content will replace the library prompt. Version will be bumped from ${currentVersion} to ${nextVersion}. This cannot be undone.`}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep Reviewing</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleApprove}
            disabled={isPending}
          >
            {isPending ? <Spinner className="size-4" /> : 'Approve & Merge'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
