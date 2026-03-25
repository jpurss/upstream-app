import { createClient } from '@/lib/supabase/server'
import type { ForkedPromptWithTitle } from '@/lib/types/fork'

/**
 * Fetch all forked prompts for a given engagement, with source prompt title joined.
 * RLS forked_prompts_own policy enforces user-scoped access.
 */
export async function fetchForksByEngagement(engagementId: string): Promise<ForkedPromptWithTitle[]> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('forked_prompts')
    .select(`*, prompts!source_prompt_id(title)`)
    .eq('engagement_id', engagementId)
    .order('forked_at', { ascending: false })

  if (error) {
    console.error('[fetchForksByEngagement] Supabase error:', error)
    return []
  }

  return (data ?? []).map((f: any) => ({
    ...f,
    source_prompt_title: f.prompts?.title ?? 'Unknown Prompt',
    prompts: undefined,
  })) as ForkedPromptWithTitle[]
}

/**
 * Fetch a single fork by ID, with source prompt title joined.
 */
export async function fetchForkById(forkId: string): Promise<ForkedPromptWithTitle | null> {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('forked_prompts')
    .select(`*, prompts!source_prompt_id(title)`)
    .eq('id', forkId)
    .single()

  if (error) {
    console.error('[fetchForkById] Supabase error:', error)
    return null
  }

  if (!data) return null
  return {
    ...data,
    source_prompt_title: (data as any).prompts?.title ?? 'Unknown Prompt',
    prompts: undefined,
  } as ForkedPromptWithTitle
}

/**
 * Check if a prompt has already been forked into a specific engagement.
 * Used to prevent duplicate forks (D-16).
 */
export async function checkDuplicateFork(promptId: string, engagementId: string): Promise<boolean> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('forked_prompts')
    .select('id')
    .eq('source_prompt_id', promptId)
    .eq('engagement_id', engagementId)
    .single()
  return !!data
}

/**
 * Count the total number of active forks for a given source prompt.
 * Used in the prompt detail sidebar to show "X active forks".
 */
export async function countActiveForks(promptId: string): Promise<number> {
  const supabase = await createClient()
  const { count, error } = await supabase
    .from('forked_prompts')
    .select('id', { count: 'exact', head: true })
    .eq('source_prompt_id', promptId)
  if (error) return 0
  return count ?? 0
}
