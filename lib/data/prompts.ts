import { createClient } from '@/lib/supabase/server'
import { Prompt } from '@/lib/types/prompt'

/**
 * Fetch all active prompts, ordered by avg_effectiveness descending.
 * Used for the main library grid view.
 */
export async function fetchAllActivePrompts(): Promise<Prompt[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .eq('status', 'active')
    .order('avg_effectiveness', { ascending: false })

  if (error) {
    console.error('[fetchAllActivePrompts] Supabase error:', error)
    return []
  }

  return (data ?? []) as Prompt[]
}

/**
 * Fetch a single prompt by UUID.
 * NOTE (D-14): Does NOT filter by status — deprecated prompts remain accessible
 * at their direct URL so existing links never break.
 */
export async function fetchPromptById(id: string): Promise<Prompt | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error('[fetchPromptById] Supabase error:', error)
    return null
  }

  return data as Prompt | null
}

/**
 * Search prompts by title, description, or content using ilike (case-insensitive).
 * Per RESEARCH.md Pitfall 1: ilike fallback is appropriate for v1 with 18 prompts.
 * Only returns active prompts.
 */
export async function searchPrompts(query: string): Promise<Prompt[]> {
  const supabase = await createClient()
  const term = `%${query}%`
  const { data, error } = await supabase
    .from('prompts')
    .select('*')
    .eq('status', 'active')
    .or(`title.ilike.${term},description.ilike.${term},content.ilike.${term}`)
    .order('avg_effectiveness', { ascending: false })

  if (error) {
    console.error('[searchPrompts] Supabase error:', error)
    return []
  }

  return (data ?? []) as Prompt[]
}
