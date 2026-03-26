'use client'

import { useState, useTransition } from 'react'
import { Search } from 'lucide-react'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { resolveRequest } from '@/app/(app)/demand/actions'

interface ActivePrompt {
  id: string
  title: string
  category: string
}

interface ResolveRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  requestId: string
  prompts: ActivePrompt[]
}

export function ResolveRequestDialog({
  open,
  onOpenChange,
  requestId,
  prompts,
}: ResolveRequestDialogProps) {
  const [query, setQuery] = useState('')
  const [selectedPrompt, setSelectedPrompt] = useState<ActivePrompt | null>(null)
  const [isPending, startTransition] = useTransition()

  const filteredPrompts = query.trim()
    ? prompts
        .filter((p) => p.title.toLowerCase().includes(query.toLowerCase()))
        .slice(0, 5)
    : []

  function handleSelect(prompt: ActivePrompt) {
    setSelectedPrompt(prompt)
    setQuery(prompt.title)
  }

  function handleClose() {
    onOpenChange(false)
    setQuery('')
    setSelectedPrompt(null)
  }

  function handleConfirm() {
    if (!selectedPrompt) return

    startTransition(async () => {
      const result = await resolveRequest(requestId, selectedPrompt.id)
      if (result?.error) {
        toast.error('Could not resolve request. Try again.')
      } else {
        toast.success('Request resolved')
        handleClose()
      }
    })
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-[20px] font-semibold">Resolve this request</DialogTitle>
          <DialogDescription className="text-[13px]">
            Link this request to the prompt that addresses it.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 py-2">
          <Label htmlFor="resolve-search" className="text-[13px]">
            Find prompt
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="resolve-search"
              className="pl-9 text-[15px]"
              placeholder="Type to search active library prompts..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                // Clear selection if user edits the input after selecting
                if (selectedPrompt && e.target.value !== selectedPrompt.title) {
                  setSelectedPrompt(null)
                }
              }}
            />
          </div>

          {/* Autocomplete dropdown */}
          {filteredPrompts.length > 0 && !selectedPrompt && (
            <div className="border border-border rounded-md bg-popover shadow-md overflow-hidden">
              {filteredPrompts.map((prompt) => (
                <button
                  key={prompt.id}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-accent text-left transition-colors"
                  onClick={() => handleSelect(prompt)}
                >
                  <span className="text-[15px] truncate">{prompt.title}</span>
                  <span className="ml-3 shrink-0 inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[13px] text-muted-foreground">
                    {prompt.category}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Selected prompt highlight */}
          {selectedPrompt && (
            <div className="flex items-center justify-between px-3 py-2 rounded-md bg-accent">
              <span className="text-[15px] truncate">{selectedPrompt.title}</span>
              <span className="ml-3 shrink-0 inline-flex items-center rounded-full bg-muted px-2 py-0.5 text-[13px] text-muted-foreground">
                {selectedPrompt.category}
              </span>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={handleClose} disabled={isPending}>
            Cancel
          </Button>
          <Button
            className="bg-[#4287FF] hover:bg-[#4287FF]/90 text-white"
            onClick={handleConfirm}
            disabled={!selectedPrompt || isPending}
          >
            {isPending && <Spinner className="size-4 mr-2" />}
            Confirm Resolve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
