export type IssueTag = 'hallucination' | 'too_verbose' | 'wrong_format' | 'model_degradation' | 'needs_context'

export const ISSUE_TAGS: { value: IssueTag; label: string }[] = [
  { value: 'hallucination', label: 'Hallucination' },
  { value: 'too_verbose', label: 'Too verbose' },
  { value: 'wrong_format', label: 'Wrong format' },
  { value: 'model_degradation', label: 'Model degradation' },
  { value: 'needs_context', label: 'Needs context' },
]

export type ForkedPrompt = {
  id: string
  source_prompt_id: string
  source_version: number
  engagement_id: string
  original_content: string
  adapted_content: string
  adaptation_notes: string | null
  effectiveness_rating: number | null
  usage_count: number
  feedback_notes: string | null
  issues: IssueTag[]
  merge_status: string | null
  merge_suggestion: string | null
  contains_client_context: boolean
  forked_by: string
  forked_at: string
  last_used: string | null
}

export type ForkedPromptWithTitle = ForkedPrompt & {
  source_prompt_title: string
}
