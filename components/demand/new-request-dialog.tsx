'use client'

import { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { submitRequest } from '@/app/(app)/demand/actions'
import { PROMPT_CATEGORIES } from '@/lib/types/prompt'

const URGENCY_OPTIONS = [
  { value: 'nice_to_have', label: 'Nice to have' },
  { value: 'medium', label: 'Medium' },
  { value: 'urgent', label: 'Urgent' },
]

interface NewRequestDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function NewRequestDialog({ open, onOpenChange }: NewRequestDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('')
  const [urgency, setUrgency] = useState('')
  const [isPending, startTransition] = useTransition()

  function handleClose() {
    onOpenChange(false)
    // Reset form state on close
    setTitle('')
    setDescription('')
    setCategory('')
    setUrgency('')
  }

  function handleSubmit() {
    startTransition(async () => {
      const result = await submitRequest({ title, description, category, urgency })
      if (result?.error) {
        toast.error('Failed to submit request. Try again.')
      } else {
        toast.success('Prompt request submitted')
        handleClose()
      }
    })
  }

  const isSubmitDisabled = !title.trim() || !description.trim() || isPending

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-[20px] font-semibold">New prompt request</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-2">
          {/* Title field */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="request-title" className="text-[13px]">
              What prompt do you need?
            </Label>
            <Input
              id="request-title"
              placeholder="e.g. Competitor analysis framework prompt"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-[15px]"
              required
            />
          </div>

          {/* Description field */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="request-description" className="text-[13px]">
              Describe the use case
            </Label>
            <Textarea
              id="request-description"
              placeholder="When would you use this? What should it help you do?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px] resize-none text-[15px]"
              required
            />
          </div>

          {/* Category field */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="request-category" className="text-[13px]">
              Category
            </Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger id="request-category" className="text-[15px]">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {PROMPT_CATEGORIES.map((cat) => (
                  <SelectItem key={cat} value={cat} className="text-[15px]">
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Urgency field */}
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="request-urgency" className="text-[13px]">
              Urgency
            </Label>
            <Select value={urgency} onValueChange={setUrgency}>
              <SelectTrigger id="request-urgency" className="text-[15px]">
                <SelectValue placeholder="Select urgency" />
              </SelectTrigger>
              <SelectContent>
                {URGENCY_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value} className="text-[15px]">
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="ghost"
            onClick={handleClose}
            disabled={isPending}
          >
            Discard request
          </Button>
          <Button
            className="bg-[#4287FF] hover:bg-[#4287FF]/90 text-white"
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
          >
            {isPending && <Spinner className="size-4 mr-2" />}
            Submit Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
