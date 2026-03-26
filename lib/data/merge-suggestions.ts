import { createAdminClient } from '@/lib/supabase/admin'
import type { MergeSuggestion } from '@/lib/types/merge'

/**
 * Fetch merge suggestions with joined context (prompt title, submitter name, engagement name).
 * Uses admin client (service role) because RLS forked_prompts_own policy only grants access
 * to the fork owner — admins reviewing all submissions need service role to bypass RLS.
 *
 * @param status Filter by merge status. 'all' returns every non-none status.
 */
export async function fetchMergeSuggestions(
  status: 'pending' | 'approved' | 'declined' | 'all' = 'pending'
): Promise<MergeSuggestion[]> {
  const supabase = createAdminClient()

  let query = supabase
    .from('forked_prompts')
    .select(
      `*, prompts!source_prompt_id(title, content, version), profiles!forked_by(name), engagements!engagement_id(name, id)`
    )
    .neq('merge_status', 'none')

  if (status !== 'all') {
    query = query.eq('merge_status', status)
  }

  const { data, error } = await query.order('forked_at', { ascending: false })

  if (error) {
    console.error('[fetchMergeSuggestions] Supabase error:', error)
    return []
  }

  return (data ?? []).map((f: any) => ({
    id: f.id,
    merge_status: f.merge_status,
    merge_suggestion: f.merge_suggestion,
    merge_decline_reason: f.merge_decline_reason ?? null,
    adapted_content: f.adapted_content,
    original_content: f.original_content,
    effectiveness_rating: f.effectiveness_rating,
    issues: f.issues ?? [],
    feedback_notes: f.feedback_notes,
    adaptation_notes: f.adaptation_notes,
    contains_client_context: f.contains_client_context ?? false,
    forked_at: f.forked_at,
    forked_by: f.forked_by,
    source_prompt_id: f.source_prompt_id,
    engagement_id: f.engagement_id,
    // joined fields
    source_prompt_title: f.prompts?.title ?? 'Unknown Prompt',
    source_prompt_content: f.prompts?.content ?? '',
    source_prompt_version: f.prompts?.version ?? 1,
    submitter_name: f.profiles?.name ?? 'Unknown User',
    engagement_name: f.engagements?.name ?? 'Unknown Engagement',
  })) as MergeSuggestion[]
}

/**
 * Fetch a single merge suggestion by ID, with full joined context.
 * Returns null if not found or if merge_status is 'none'.
 */
export async function fetchMergeSuggestionById(id: string): Promise<MergeSuggestion | null> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('forked_prompts')
    .select(
      `*, prompts!source_prompt_id(title, content, version), profiles!forked_by(name), engagements!engagement_id(name, id)`
    )
    .eq('id', id)
    .not('merge_status', 'eq', 'none')
    .single()

  if (error || !data) {
    if (error && error.code !== 'PGRST116') {
      console.error('[fetchMergeSuggestionById] Supabase error:', error)
    }
    return null
  }

  const f = data as any
  return {
    id: f.id,
    merge_status: f.merge_status,
    merge_suggestion: f.merge_suggestion,
    merge_decline_reason: f.merge_decline_reason ?? null,
    adapted_content: f.adapted_content,
    original_content: f.original_content,
    effectiveness_rating: f.effectiveness_rating,
    issues: f.issues ?? [],
    feedback_notes: f.feedback_notes,
    adaptation_notes: f.adaptation_notes,
    contains_client_context: f.contains_client_context ?? false,
    forked_at: f.forked_at,
    forked_by: f.forked_by,
    source_prompt_id: f.source_prompt_id,
    engagement_id: f.engagement_id,
    // joined fields
    source_prompt_title: f.prompts?.title ?? 'Unknown Prompt',
    source_prompt_content: f.prompts?.content ?? '',
    source_prompt_version: f.prompts?.version ?? 1,
    submitter_name: f.profiles?.name ?? 'Unknown User',
    engagement_name: f.engagements?.name ?? 'Unknown Engagement',
  }
}

/**
 * Count forks with merge_status = 'pending'.
 * Used for the sidebar badge on the Review Queue nav item.
 */
export async function countPendingMerges(): Promise<number> {
  const supabase = createAdminClient()

  const { count, error } = await supabase
    .from('forked_prompts')
    .select('id', { count: 'exact', head: true })
    .eq('merge_status', 'pending')

  if (error) {
    console.error('[countPendingMerges] Supabase error:', error)
    return 0
  }

  return count ?? 0
}
