export type PromptCategory =
  | 'Discovery'
  | 'Solution Design'
  | 'Build'
  | 'Enablement'
  | 'Delivery'
  | 'Internal Ops'

export const PROMPT_CATEGORIES: PromptCategory[] = [
  'Discovery',
  'Solution Design',
  'Build',
  'Enablement',
  'Delivery',
  'Internal Ops',
]

export type PromptCapabilityType =
  | 'extraction'
  | 'analysis'
  | 'generation'
  | 'transformation'
  | 'evaluation'
  | 'synthesis'

export const PROMPT_CAPABILITY_TYPES: PromptCapabilityType[] = [
  'extraction',
  'analysis',
  'generation',
  'transformation',
  'evaluation',
  'synthesis',
]

export type PromptStatus = 'active' | 'deprecated'

export type PromptComplexity = 'basic' | 'moderate' | 'advanced'

export type Prompt = {
  id: string
  title: string
  description: string | null
  content: string
  version: number
  category: PromptCategory
  capability_type: PromptCapabilityType
  industry_tags: string[]
  use_case_tags: string[]
  target_model: string
  complexity: PromptComplexity
  input_schema: string | null
  output_schema: string | null
  dependencies: string[]
  sensitivity: string
  status: PromptStatus
  avg_effectiveness: number
  total_checkouts: number
  total_ratings: number
  last_tested_date: string | null
  last_tested_model: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}
