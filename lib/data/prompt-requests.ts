import { createAdminClient } from '@/lib/supabase/admin'
import type { PromptRequest, RequestStatus } from '@/lib/types/prompt-request'

/**
 * Fetch prompt requests with joined context (requester name, resolved prompt, upvote counts).
 * Uses admin client (service role) to bypass RLS for reading all requests.
 *
 * Sort note: upvote sort is done client-side (JS) because Supabase cannot ORDER BY
 * an aggregate from a related table join.
 */
export async function fetchPromptRequests(
  status: RequestStatus | 'all' = 'open',
  sort: 'upvotes' | 'newest' | 'urgent' = 'upvotes',
  currentUserId?: string
): Promise<PromptRequest[]> {
  const supabase = createAdminClient()

  let query = supabase.from('prompt_requests').select(`
    *,
    profiles!requested_by(name),
    prompts!resolved_by_prompt(title, id),
    request_upvotes(user_id)
  `)

  if (status !== 'all') {
    query = query.eq('status', status)
  }

  // Sort: newest and urgent can be done in Supabase; upvotes sort is JS-side
  if (sort === 'newest') query = query.order('created_at', { ascending: false })
  else if (sort === 'urgent') query = query.order('urgency', { ascending: false })
  else query = query.order('created_at', { ascending: false }) // fallback order before JS sort

  const { data, error } = await query

  if (error) {
    console.error('[fetchPromptRequests] Supabase error:', error)
    return []
  }

  const mapped = (data ?? []).map((r: any) => ({
    id: r.id,
    title: r.title,
    description: r.description,
    category: r.category,
    urgency: r.urgency ?? 'nice_to_have',
    status: r.status ?? 'open',
    requested_by: r.requested_by,
    resolved_by_prompt: r.resolved_by_prompt,
    resolved_at: r.resolved_at,
    decline_reason: r.decline_reason ?? null,
    created_at: r.created_at,
    requester_name: r.profiles?.name ?? 'Unknown User',
    resolved_prompt_title: r.prompts?.title ?? null,
    resolved_prompt_id: r.prompts?.id ?? null,
    upvote_count: r.request_upvotes?.length ?? 0,
    user_has_upvoted: currentUserId
      ? (r.request_upvotes ?? []).some((u: any) => u.user_id === currentUserId)
      : false,
  })) as PromptRequest[]

  // JS-side sort for upvotes (Supabase can't ORDER BY aggregate join)
  if (sort === 'upvotes') {
    mapped.sort((a, b) => b.upvote_count - a.upvote_count)
  }

  return mapped
}

/**
 * Count prompt requests by status.
 * Used for tab count badges on the demand board.
 */
export async function countRequestsByStatus(): Promise<Record<string, number>> {
  const supabase = createAdminClient()
  const counts: Record<string, number> = {}

  for (const status of ['open', 'planned', 'resolved', 'declined']) {
    const { count, error } = await supabase
      .from('prompt_requests')
      .select('id', { count: 'exact', head: true })
      .eq('status', status)
    if (!error) counts[status] = count ?? 0
  }

  return counts
}
