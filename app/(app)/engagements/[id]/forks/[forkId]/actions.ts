'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { IssueTag } from '@/lib/types/fork'

async function getAuthenticatedUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  return { user, supabase }
}

// Content edit — debounced (1.5s) by client
export async function updateForkContent(forkId: string, adaptedContent: string) {
  const ctx = await getAuthenticatedUser()
  if (!ctx) return { error: 'Unauthorized' }
  const { supabase } = ctx

  const { error } = await supabase
    .from('forked_prompts')
    .update({ adapted_content: adaptedContent })
    .eq('id', forkId)

  if (error) return { error: error.message }
  return { success: true }
}

// Star rating — immediate save (no debounce)
export async function updateForkRating(
  forkId: string,
  rating: number,
  sourcePromptId: string,
  engagementId: string
) {
  const ctx = await getAuthenticatedUser()
  if (!ctx) return { error: 'Unauthorized' }
  const { supabase } = ctx

  // 1. Update the fork's effectiveness_rating
  const { error } = await supabase
    .from('forked_prompts')
    .update({ effectiveness_rating: rating })
    .eq('id', forkId)

  if (error) return { error: error.message }

  // 2. Recalculate avg_effectiveness on the parent prompt
  const { data: forks } = await supabase
    .from('forked_prompts')
    .select('effectiveness_rating')
    .eq('source_prompt_id', sourcePromptId)
    .not('effectiveness_rating', 'is', null)

  if (forks && forks.length > 0) {
    const avg =
      forks.reduce((sum, f) => sum + (f.effectiveness_rating ?? 0), 0) / forks.length
    await supabase
      .from('prompts')
      .update({
        avg_effectiveness: Math.round(avg * 10) / 10,
        total_ratings: forks.length,
      })
      .eq('id', sourcePromptId)
  }

  revalidatePath(`/engagements/${engagementId}`)
  revalidatePath(`/engagements/${engagementId}/forks/${forkId}`)
  return { success: true }
}

// Issue tags + feedback notes — tags are immediate, notes are debounced by client
export async function updateForkFeedback(
  forkId: string,
  issues: IssueTag[],
  feedbackNotes: string | null
) {
  const ctx = await getAuthenticatedUser()
  if (!ctx) return { error: 'Unauthorized' }
  const { supabase } = ctx

  const { error } = await supabase
    .from('forked_prompts')
    .update({ issues, feedback_notes: feedbackNotes })
    .eq('id', forkId)

  if (error) return { error: error.message }
  return { success: true }
}

// Adaptation notes + client context flag — debounced by client
export async function updateForkMeta(
  forkId: string,
  adaptationNotes: string | null,
  containsClientContext: boolean
) {
  const ctx = await getAuthenticatedUser()
  if (!ctx) return { error: 'Unauthorized' }
  const { supabase } = ctx

  const { error } = await supabase
    .from('forked_prompts')
    .update({
      adaptation_notes: adaptationNotes,
      contains_client_context: containsClientContext,
    })
    .eq('id', forkId)

  if (error) return { error: error.message }
  return { success: true }
}

// Suggest merge — consultant submits fork for admin review
export async function suggestMerge(forkId: string, mergeNote: string) {
  const ctx = await getAuthenticatedUser()
  if (!ctx) return { error: 'Unauthorized' }
  const { supabase } = ctx

  const { error } = await supabase
    .from('forked_prompts')
    .update({
      merge_status: 'pending',
      merge_suggestion: mergeNote,
      merge_decline_reason: null, // clear any prior decline reason on resubmission
    })
    .eq('id', forkId)

  if (error) return { error: error.message }
  revalidatePath('/engagements')
  revalidatePath('/review')
  return { success: true }
}
