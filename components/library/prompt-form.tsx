'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Field,
  FieldGroup,
  FieldLabel,
  FieldDescription,
} from '@/components/ui/field'
import { MarkdownPreview } from '@/components/library/markdown-preview'
import { createPrompt, updatePrompt } from '@/app/(app)/library/actions'
import type { Prompt, PromptCategory, PromptCapabilityType, PromptComplexity } from '@/lib/types/prompt'

interface PromptFormProps {
  prompt?: Prompt
  action: 'create' | 'edit'
}

const categoryItems = [
  { label: 'Select category', value: null as string | null },
  { label: 'Discovery', value: 'Discovery' },
  { label: 'Solution Design', value: 'Solution Design' },
  { label: 'Build', value: 'Build' },
  { label: 'Enablement', value: 'Enablement' },
  { label: 'Delivery', value: 'Delivery' },
  { label: 'Internal Ops', value: 'Internal Ops' },
]

const capabilityItems = [
  { label: 'Select capability type', value: null as string | null },
  { label: 'extraction', value: 'extraction' },
  { label: 'analysis', value: 'analysis' },
  { label: 'generation', value: 'generation' },
  { label: 'transformation', value: 'transformation' },
  { label: 'evaluation', value: 'evaluation' },
  { label: 'synthesis', value: 'synthesis' },
]

const modelItems = [
  { label: 'model-agnostic', value: 'model-agnostic' },
  { label: 'claude-3-5-sonnet', value: 'claude-3-5-sonnet' },
  { label: 'claude-3-opus', value: 'claude-3-opus' },
  { label: 'gpt-4o', value: 'gpt-4o' },
  { label: 'gpt-4', value: 'gpt-4' },
  { label: 'gemini-1.5-pro', value: 'gemini-1.5-pro' },
]

const complexityItems = [
  { label: 'basic', value: 'basic' },
  { label: 'moderate', value: 'moderate' },
  { label: 'advanced', value: 'advanced' },
]

export function PromptForm({ prompt, action }: PromptFormProps) {
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  // Controlled state for the markdown textarea (needed for MarkdownPreview)
  const [contentValue, setContentValue] = useState(prompt?.content ?? '')

  // Validation errors state
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Controlled state for Select components (required for base API)
  const [category, setCategory] = useState<string | null>(prompt?.category ?? null)
  const [capabilityType, setCapabilityType] = useState<string | null>(prompt?.capability_type ?? null)
  const [targetModel, setTargetModel] = useState<string | null>(prompt?.target_model ?? 'model-agnostic')
  const [complexity, setComplexity] = useState<string | null>(prompt?.complexity ?? 'moderate')

  function validateForm(formData: FormData): boolean {
    const newErrors: Record<string, string> = {}

    if (!formData.get('title')) newErrors.title = 'This field is required.'
    if (!contentValue) newErrors.content = 'This field is required.'
    if (!category) newErrors.category = 'This field is required.'
    if (!capabilityType) newErrors.capability_type = 'This field is required.'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  async function handleSubmit(formData: FormData) {
    // Inject content value (controlled) into formData
    formData.set('content', contentValue)
    formData.set('category', category ?? '')
    formData.set('capability_type', capabilityType ?? '')
    formData.set('target_model', targetModel ?? 'model-agnostic')
    formData.set('complexity', complexity ?? 'moderate')

    if (!validateForm(formData)) return

    startTransition(async () => {
      const result = action === 'create'
        ? await createPrompt(formData)
        : await updatePrompt(prompt!.id, formData)

      if (result?.error) {
        toast.error(result.error)
      } else if (result?.success) {
        toast.success(action === 'create' ? 'Prompt created' : 'Prompt updated')
        router.push(action === 'create' ? '/library' : `/library/${prompt!.id}`)
        router.refresh()
      }
    })
  }

  const cancelHref = action === 'create' ? '/library' : `/library/${prompt!.id}`
  const submitLabel = action === 'create' ? 'Save Prompt' : 'Update Prompt'

  return (
    <form
      action={handleSubmit}
      className="max-w-3xl mx-auto"
    >
      <FieldGroup className="gap-6">

        {/* Title */}
        <Field data-invalid={errors.title ? true : undefined}>
          <FieldLabel htmlFor="title">Title</FieldLabel>
          <Input
            id="title"
            name="title"
            defaultValue={prompt?.title ?? ''}
            aria-invalid={!!errors.title}
            required
          />
          {errors.title && (
            <FieldDescription className="text-destructive text-[13px]">
              {errors.title}
            </FieldDescription>
          )}
        </Field>

        {/* Description */}
        <Field>
          <FieldLabel htmlFor="description">Description</FieldLabel>
          <Textarea
            id="description"
            name="description"
            className="min-h-[80px]"
            defaultValue={prompt?.description ?? ''}
          />
        </Field>

        {/* Content — Write/Preview tabs */}
        <Field data-invalid={errors.content ? true : undefined}>
          <FieldLabel>Content</FieldLabel>
          <MarkdownPreview
            value={contentValue}
            onChange={setContentValue}
            name="content"
          />
          {errors.content && (
            <FieldDescription className="text-destructive text-[13px]">
              {errors.content}
            </FieldDescription>
          )}
        </Field>

        {/* Category */}
        <Field data-invalid={errors.category ? true : undefined}>
          <FieldLabel>Category</FieldLabel>
          <Select
            items={categoryItems}
            value={category}
            onValueChange={setCategory}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {categoryItems.map((item) => (
                  <SelectItem key={item.value ?? 'null'} value={item.value as string}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {errors.category && (
            <FieldDescription className="text-destructive text-[13px]">
              {errors.category}
            </FieldDescription>
          )}
        </Field>

        {/* Capability Type */}
        <Field data-invalid={errors.capability_type ? true : undefined}>
          <FieldLabel>Capability Type</FieldLabel>
          <Select
            items={capabilityItems}
            value={capabilityType}
            onValueChange={setCapabilityType}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {capabilityItems.map((item) => (
                  <SelectItem key={item.value ?? 'null'} value={item.value as string}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          {errors.capability_type && (
            <FieldDescription className="text-destructive text-[13px]">
              {errors.capability_type}
            </FieldDescription>
          )}
        </Field>

        {/* Industry Tags */}
        <Field>
          <FieldLabel htmlFor="industry_tags">Industry Tags</FieldLabel>
          <Input
            id="industry_tags"
            name="industry_tags"
            defaultValue={prompt?.industry_tags?.join(', ') ?? ''}
            placeholder="e.g. technology, saas, finance"
          />
          <FieldDescription>Comma-separated values</FieldDescription>
        </Field>

        {/* Use Case Tags */}
        <Field>
          <FieldLabel htmlFor="use_case_tags">Use Case Tags</FieldLabel>
          <Input
            id="use_case_tags"
            name="use_case_tags"
            defaultValue={prompt?.use_case_tags?.join(', ') ?? ''}
            placeholder="e.g. discovery, stakeholder interviews"
          />
          <FieldDescription>Comma-separated values</FieldDescription>
        </Field>

        {/* Target Model */}
        <Field>
          <FieldLabel>Target Model</FieldLabel>
          <Select
            items={modelItems}
            value={targetModel}
            onValueChange={setTargetModel}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {modelItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        {/* Complexity */}
        <Field>
          <FieldLabel>Complexity</FieldLabel>
          <Select
            items={complexityItems}
            value={complexity}
            onValueChange={setComplexity}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {complexityItems.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </Field>

        {/* Input Schema */}
        <Field>
          <FieldLabel htmlFor="input_schema">Input Schema</FieldLabel>
          <Textarea
            id="input_schema"
            name="input_schema"
            defaultValue={prompt?.input_schema ?? ''}
            placeholder="Optional: describe expected input format"
          />
        </Field>

        {/* Output Schema */}
        <Field>
          <FieldLabel htmlFor="output_schema">Output Schema</FieldLabel>
          <Textarea
            id="output_schema"
            name="output_schema"
            defaultValue={prompt?.output_schema ?? ''}
            placeholder="Optional: describe expected output format"
          />
        </Field>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button
            variant="ghost"
            render={<Link href={cancelHref} />}
            nativeButton={false}
          >
            Discard Changes
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Spinner data-icon="inline-start" />}
            {submitLabel}
          </Button>
        </div>

      </FieldGroup>
    </form>
  )
}
