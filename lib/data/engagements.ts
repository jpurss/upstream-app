import { createClient } from '@/lib/supabase/server'
import type { Engagement, EngagementWithStats } from '@/lib/types/engagement'

/**
 * Fetch all engagements for a given user, including computed stats.
 * Uses the engagements_own RLS policy — only returns rows where created_by = auth.uid().
 * Stats computed client-side from the related forked_prompts join.
 */
export async function fetchUserEngagements(userId: string): Promise<EngagementWithStats[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('engagements')
    .select(`*, forked_prompts(id, effectiveness_rating, forked_at, last_used)`)
    .eq('created_by', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[fetchUserEngagements] Supabase error:', error)
    return []
  }

  return (data ?? []).map((eng: any) => {
    const forks = eng.forked_prompts ?? []
    const rated = forks.filter((f: any) => f.effectiveness_rating !== null)
    const forkDates = forks.map((f: any) => f.last_used ?? f.forked_at).filter(Boolean)
    return {
      id: eng.id,
      name: eng.name,
      client_name: eng.client_name,
      industry: eng.industry,
      status: eng.status,
      created_by: eng.created_by,
      created_at: eng.created_at,
      completed_at: eng.completed_at,
      fork_count: forks.length,
      avg_effectiveness:
        rated.length > 0
          ? rated.reduce((sum: number, f: any) => sum + f.effectiveness_rating, 0) / rated.length
          : null,
      last_activity:
        forkDates.length > 0 ? forkDates.sort().reverse()[0] : eng.created_at,
    }
  })
}

/**
 * Fetch a single engagement by ID.
 * RLS ensures user can only access their own engagements.
 */
export async function fetchEngagementById(id: string): Promise<Engagement | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('engagements')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('[fetchEngagementById] Supabase error:', error)
    return null
  }

  return data as Engagement | null
}
