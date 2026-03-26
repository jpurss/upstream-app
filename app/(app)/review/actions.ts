'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

/**
 * Checks if the current user is an admin (real or demo).
 * Returns the user object and admin client if admin, or null if not.
 * Pattern: uses createClient() for auth check, returns createAdminClient() for mutations.
 */
async function getAdminUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const role = user.app_metadata?.role as string | null
  const isAnonymous = user.is_anonymous ?? false
  const demoRole = isAnonymous ? (user.user_metadata?.demo_role as string ?? 'consultant') : null
  const effectiveRole = role ?? (isAnonymous ? demoRole : null)

  if (effectiveRole !== 'admin') return null
  return { user, supabase: createAdminClient() }
}

/**
 * Approve a merge suggestion.
 * Updates the library prompt with the (possibly admin-edited) content, bumps
 * the version, creates a changelog entry, and marks the fork as approved.
 * Admin-only.
 */
export async function approveMerge(
  forkId: string,
  promptId: string,
  approvedContent: string,
  mergeNote: string
) {
  const ctx = await getAdminUser()
  if (!ctx) return { error: 'Unauthorized' }
  const { user, supabase } = ctx

  // Step 1: Fetch current prompt version and content
  const { data: prompt, error: fetchError } = await supabase
    .from('prompts')
    .select('id, content, version')
    .eq('id', promptId)
    .single()

  if (fetchError || !prompt) {
    return { error: 'Prompt not found' }
  }

  const newVersion = (prompt.version ?? 1) + 1

  // Step 2: Update prompt content and version
  const { error: updateError } = await supabase
    .from('prompts')
    .update({ content: approvedContent, version: newVersion })
    .eq('id', promptId)

  if (updateError) return { error: updateError.message }

  // Step 3: Insert changelog entry
  await supabase.from('prompt_changelog').insert({
    prompt_id: promptId,
    version: newVersion,
    change_description: mergeNote || 'Merged from field fork',
    previous_content: prompt.content,
    changed_by: user.id,
  })

  // Step 4: Mark fork as approved
  await supabase
    .from('forked_prompts')
    .update({ merge_status: 'approved' })
    .eq('id', forkId)

  revalidatePath('/review')
  revalidatePath('/library')
  revalidatePath('/library/' + promptId)
  revalidatePath('/engagements', 'layout')

  return { success: true }
}

/**
 * Decline a merge suggestion with a reason.
 * Stores the reason so the consultant can understand and revise.
 * Admin-only.
 */
export async function declineMerge(forkId: string, reason: string) {
  const ctx = await getAdminUser()
  if (!ctx) return { error: 'Unauthorized' }
  const { supabase } = ctx

  const { error } = await supabase
    .from('forked_prompts')
    .update({ merge_status: 'declined', merge_decline_reason: reason })
    .eq('id', forkId)

  if (error) return { error: error.message }

  revalidatePath('/review')
  revalidatePath('/engagements', 'layout')

  return { success: true }
}
