import type { PromptCategory } from './prompt'

export type RequestStatus = 'open' | 'planned' | 'resolved' | 'declined'

export const REQUEST_STATUSES: RequestStatus[] = ['open', 'planned', 'resolved', 'declined']

export type RequestUrgency = 'nice_to_have' | 'medium' | 'urgent'

export const REQUEST_URGENCIES: RequestUrgency[] = ['nice_to_have', 'medium', 'urgent']

export const URGENCY_LABELS: Record<RequestUrgency, string> = {
  nice_to_have: 'Nice to have',
  medium: 'Medium',
  urgent: 'Urgent',
}

export type PromptRequest = {
  id: string
  title: string
  description: string | null
  category: PromptCategory | null
  urgency: RequestUrgency
  status: RequestStatus
  requested_by: string
  resolved_by_prompt: string | null
  resolved_at: string | null
  decline_reason: string | null
  created_at: string
  // joined fields (populated by data layer)
  requester_name: string
  resolved_prompt_title: string | null
  resolved_prompt_id: string | null
  upvote_count: number
  user_has_upvoted: boolean
}
