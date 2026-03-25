export type EngagementStatus = 'active' | 'paused' | 'completed'

export const ENGAGEMENT_STATUSES: EngagementStatus[] = ['active', 'paused', 'completed']

export const INDUSTRIES = [
  'Financial Services',
  'Government',
  'Healthcare',
  'Legal',
  'Manufacturing',
  'Media',
  'Professional Services',
  'Retail',
  'Technology',
  'Telecommunications',
  'Other',
] as const

export type Industry = (typeof INDUSTRIES)[number]

export type Engagement = {
  id: string
  name: string
  client_name: string
  industry: string
  status: EngagementStatus
  created_by: string
  created_at: string
  completed_at: string | null
}

export type EngagementWithStats = Engagement & {
  fork_count: number
  avg_effectiveness: number | null
  last_activity: string // ISO date string of most recent fork activity
}
