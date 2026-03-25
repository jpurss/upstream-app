'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
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
import { deprecatePrompt } from '@/app/(app)/library/actions'

interface DeprecationDialogProps {
  promptId: string
}

export function DeprecationDialog({ promptId }: DeprecationDialogProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  function handleDeprecate() {
    startTransition(async () => {
      const result = await deprecatePrompt(promptId)
      if (result && 'error' in result) {
        toast.error(result.error)
      } else {
        router.push('/library')
      }
    })
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="destructive" />}>
        Deprecate Prompt
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Deprecate this prompt?</AlertDialogTitle>
          <AlertDialogDescription>
            This prompt will be hidden from the library but remains in the database. Consultants
            will no longer see it in browse or search results.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep Prompt</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            onClick={handleDeprecate}
            disabled={isPending}
          >
            Deprecate
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
