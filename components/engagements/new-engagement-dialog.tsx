'use client'

import React, { useState, useTransition } from 'react'
import { toast } from 'sonner'
import { Search } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { createEngagement } from '@/app/(app)/engagements/actions'
import { createMultipleForks } from '@/app/(app)/engagements/[id]/actions'
import { INDUSTRIES } from '@/lib/types/engagement'
import type { Prompt } from '@/lib/types/prompt'

interface NewEngagementDialogProps {
  trigger?: React.ReactNode
  prompts?: Prompt[]
  onForkSelected?: (engagementId: string, promptIds: string[]) => void
}

type Step = 'create' | 'pick-prompts'

interface FieldErrors {
  name?: string
  client_name?: string
  industry?: string
}

export function NewEngagementDialog({
  trigger,
  prompts = [],
  onForkSelected,
}: NewEngagementDialogProps) {
  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<Step>('create')
  const [createdEngagementId, setCreatedEngagementId] = useState<string | null>(null)

  // Form state
  const [name, setName] = useState('')
  const [clientName, setClientName] = useState('')
  const [industry, setIndustry] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [isPending, startTransition] = useTransition()

  // Prompt picker state
  const [search, setSearch] = useState('')
  const [selectedPromptIds, setSelectedPromptIds] = useState<Set<string>>(new Set())

  function resetForm() {
    setName('')
    setClientName('')
    setIndustry('')
    setFieldErrors({})
    setStep('create')
    setCreatedEngagementId(null)
    setSearch('')
    setSelectedPromptIds(new Set())
  }

  function handleOpenChange(val: boolean) {
    setOpen(val)
    if (!val) {
      resetForm()
    }
  }

  function validateForm(): boolean {
    const errors: FieldErrors = {}
    if (!name.trim()) errors.name = 'This field is required.'
    if (!clientName.trim()) errors.client_name = 'This field is required.'
    if (!industry) errors.industry = 'This field is required.'
    setFieldErrors(errors)
    return Object.keys(errors).length === 0
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validateForm()) return

    const formData = new FormData()
    formData.set('name', name)
    formData.set('client_name', clientName)
    formData.set('industry', industry)

    startTransition(async () => {
      const result = await createEngagement(formData)
      if (result.error) {
        toast.error(result.error)
        return
      }
      toast.success('Engagement created')
      setCreatedEngagementId(result.engagement?.id ?? null)
      setStep('pick-prompts')
    })
  }

  // Prompt picker helpers
  const filteredPrompts = search.trim()
    ? prompts.filter((p) =>
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        (p.description ?? '').toLowerCase().includes(search.toLowerCase())
      )
    : prompts

  function togglePrompt(id: string) {
    setSelectedPromptIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  function handleForkSelected() {
    if (!createdEngagementId || selectedPromptIds.size === 0) {
      handleOpenChange(false)
      return
    }

    const engagementId = createdEngagementId
    const promptIds = Array.from(selectedPromptIds)

    startTransition(async () => {
      const result = await createMultipleForks(promptIds, engagementId)
      if (result.forked > 0) {
        const count = result.forked
        if (count === 1) {
          toast.success('Forked to engagement')
        } else {
          toast.success(`${count} prompts forked to engagement`)
        }
      }
      // Also notify via legacy callback if provided (backwards compat)
      if (onForkSelected) {
        onForkSelected(engagementId, promptIds)
      }
      handleOpenChange(false)
    })
  }

  function handleSkip() {
    handleOpenChange(false)
  }

  const defaultTrigger = (
    <Button type="button" onClick={() => setOpen(true)}>
      New Engagement
    </Button>
  )

  const triggerElement = trigger ? (
    <div onClick={() => setOpen(true)} className="cursor-pointer">
      {trigger}
    </div>
  ) : (
    defaultTrigger
  )

  return (
    <>
      {triggerElement}
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-md"
        >
          {step === 'create' ? (
            <>
              <DialogHeader>
                <DialogTitle>New Engagement</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} noValidate>
                <div className="flex flex-col gap-4 py-2">
                  {/* Engagement Name */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="eng-name" className="text-sm font-medium">
                      Engagement Name
                    </label>
                    <Input
                      id="eng-name"
                      name="name"
                      placeholder="e.g. Accenture AI Strategy Q2"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value)
                        if (fieldErrors.name) setFieldErrors((prev) => ({ ...prev, name: undefined }))
                      }}
                      aria-invalid={!!fieldErrors.name}
                    />
                    {fieldErrors.name && (
                      <span className="text-[13px] text-destructive">{fieldErrors.name}</span>
                    )}
                  </div>

                  {/* Client Name */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="eng-client" className="text-sm font-medium">
                      Client Name
                    </label>
                    <Input
                      id="eng-client"
                      name="client_name"
                      placeholder="e.g. Accenture"
                      value={clientName}
                      onChange={(e) => {
                        setClientName(e.target.value)
                        if (fieldErrors.client_name) setFieldErrors((prev) => ({ ...prev, client_name: undefined }))
                      }}
                      aria-invalid={!!fieldErrors.client_name}
                    />
                    {fieldErrors.client_name && (
                      <span className="text-[13px] text-destructive">{fieldErrors.client_name}</span>
                    )}
                  </div>

                  {/* Industry */}
                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="eng-industry" className="text-sm font-medium">
                      Industry
                    </label>
                    <Select
                      value={industry}
                      onValueChange={(val) => {
                        setIndustry(val ?? '')
                        if (fieldErrors.industry) setFieldErrors((prev) => ({ ...prev, industry: undefined }))
                      }}
                    >
                      <SelectTrigger id="eng-industry" className="w-full" aria-invalid={!!fieldErrors.industry}>
                        <SelectValue placeholder="Select an industry" />
                      </SelectTrigger>
                      <SelectContent>
                        {INDUSTRIES.map((ind) => (
                          <SelectItem key={ind} value={ind}>
                            {ind}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {fieldErrors.industry && (
                      <span className="text-[13px] text-destructive">{fieldErrors.industry}</span>
                    )}
                  </div>
                </div>

                <DialogFooter className="mt-2">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => handleOpenChange(false)}
                    disabled={isPending}
                  >
                    Discard
                  </Button>
                  <Button type="submit" disabled={isPending}>
                    {isPending ? 'Creating...' : 'Create Engagement'}
                  </Button>
                </DialogFooter>
              </form>
            </>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Add prompts to get started</DialogTitle>
              </DialogHeader>
              <div className="flex flex-col gap-3 py-2">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                  <Input
                    placeholder="Search prompts..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>

                {/* Prompt picker grid */}
                <div className="max-h-[360px] overflow-y-auto flex flex-col gap-2 pr-1">
                  {filteredPrompts.length === 0 ? (
                    <p className="text-[13px] text-muted-foreground text-center py-8">
                      No prompts match your search.
                    </p>
                  ) : (
                    filteredPrompts.map((prompt) => {
                      const isSelected = selectedPromptIds.has(prompt.id)
                      return (
                        <button
                          key={prompt.id}
                          type="button"
                          onClick={() => togglePrompt(prompt.id)}
                          className={`w-full text-left rounded-lg border p-3 transition-colors flex flex-col gap-1 ${
                            isSelected
                              ? 'border-primary/40 bg-primary/5'
                              : 'border-border bg-card hover:border-border/60'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="text-sm font-medium leading-snug line-clamp-1">
                              {prompt.title}
                            </span>
                            <div className="flex items-center gap-1.5 shrink-0">
                              <Badge variant="secondary" className="text-[13px]">
                                {prompt.category}
                              </Badge>
                              {isSelected && (
                                <span className="size-4 rounded-full bg-primary flex items-center justify-center shrink-0">
                                  <svg
                                    className="size-2.5 text-primary-foreground"
                                    fill="none"
                                    viewBox="0 0 10 8"
                                    stroke="currentColor"
                                    strokeWidth={2}
                                  >
                                    <path d="M1 4l2.5 2.5L9 1" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                </span>
                              )}
                            </div>
                          </div>
                          {prompt.description && (
                            <p className="text-[13px] text-muted-foreground line-clamp-1">
                              {prompt.description}
                            </p>
                          )}
                        </button>
                      )
                    })
                  )}
                </div>
              </div>

              <DialogFooter className="mt-2">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleSkip}
                >
                  Skip for now
                </Button>
                <Button
                  type="button"
                  onClick={handleForkSelected}
                  disabled={selectedPromptIds.size === 0}
                >
                  Fork Selected ({selectedPromptIds.size})
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}
