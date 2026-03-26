import type { IssueTag } from './fork'

/**
 * View type for a merge suggestion — represents a forked prompt that has been
 * submitted for review, with joined fields from the source prompt, submitter
 * profile, and engagement flattened into a single object.
 */
export type MergeSuggestion = {
  id: string
  merge_status: string
  merge_suggestion: string | null
  merge_decline_reason: string | null
  adapted_content: string
  original_content: string
  effectiveness_rating: number | null
  issues: IssueTag[]
  feedback_notes: string | null
  adaptation_notes: string | null
  contains_client_context: boolean
  forked_at: string
  forked_by: string
  source_prompt_id: string
  engagement_id: string
  // joined fields
  source_prompt_title: string
  source_prompt_content: string
  source_prompt_version: number
  submitter_name: string
  engagement_name: string
}
