'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Gets the currently authenticated user and a Supabase client.
 * Uses the regular (non-admin) client — RLS forked_prompts_own policy enforces ownership.
 */
async function getAuthenticatedUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  return { user, supabase }
}

/**
 * Creates a fork of a prompt into an engagement.
 *
 * Fork captures the prompt content as a snapshot at fork time:
 * - original_content: immutable snapshot for diff — NEVER changes after fork
 * - adapted_content: starting point for consultant edits — diverges over time
 *
 * Duplicate forks are prevented: returns error if prompt already forked into this engagement (D-16).
 */
export async function createFork(promptId: string, engagementId: string) {
  const ctx = await getAuthenticatedUser()
  if (!ctx) return { error: 'Unauthorized' }
  const { user, supabase } = ctx

  // 1. Fetch the source prompt content and version
  const { data: prompt } = await supabase
    .from('prompts')
    .select('content, version')
    .eq('id', promptId)
    .single()
  if (!prompt) return { error: 'Prompt not found' }

  // 2. Check for duplicate fork (D-16: one fork per prompt per engagement)
  const { data: existing } = await supabase
    .from('forked_prompts')
    .select('id')
    .eq('source_prompt_id', promptId)
    .eq('engagement_id', engagementId)
    .single()
  if (existing) return { error: 'Already forked into this engagement' }

  // 3. Create the fork — snapshot content in BOTH columns
  // original_content = immutable snapshot for diff (NEVER changes)
  // adapted_content = starting point for consultant edits
  const { data: fork, error } = await supabase
    .from('forked_prompts')
    .insert({
      source_prompt_id: promptId,
      source_version: prompt.version,
      engagement_id: engagementId,
      original_content: prompt.content,
      adapted_content: prompt.content,
      forked_by: user.id,
    })
    .select()
    .single()

  if (error) return { error: error.message }

  // 4. Increment total_checkouts on source prompt using read-increment-write
  // No RPC function available — this is acceptable for v1 with low concurrency
  const { data: currentPrompt } = await supabase
    .from('prompts')
    .select('total_checkouts')
    .eq('id', promptId)
    .single()
  if (currentPrompt) {
    await supabase
      .from('prompts')
      .update({ total_checkouts: (currentPrompt.total_checkouts ?? 0) + 1 })
      .eq('id', promptId)
  }

  revalidatePath(`/engagements/${engagementId}`)
  revalidatePath(`/library/${promptId}`)
  return { success: true, fork }
}

/**
 * Creates multiple forks in parallel — used by the prompt picker modal
 * and the post-creation prompt picker step.
 *
 * Duplicate forks are silently skipped (already-forked prompts return an error
 * from createFork, which is filtered out here — not treated as a fatal failure).
 */
export async function createMultipleForks(promptIds: string[], engagementId: string) {
  const results = await Promise.all(
    promptIds.map((id) => createFork(id, engagementId))
  )
  const errors = results.filter((r) => r.error && r.error !== 'Already forked into this engagement')
  const successes = results.filter((r) => r.success)
  return {
    success: successes.length > 0,
    forked: successes.length,
    errors: errors.length,
    errorMessages: errors.map((r) => r.error),
  }
}
