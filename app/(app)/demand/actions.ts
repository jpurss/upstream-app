'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

/**
 * Get the current authenticated user and their Supabase client.
 * Returns null if not authenticated.
 */
async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return null
  return { user, supabase }
}

/**
 * Submit a new prompt request.
 * Any authenticated user can submit — not admin-only.
 */
export async function submitRequest(data: {
  title: string
  description: string
  category: string
  urgency: string
}) {
  const ctx = await getUser()
  if (!ctx) return { error: 'You must be signed in to submit a request' }
  const { user, supabase } = ctx

  const { error } = await supabase.from('prompt_requests').insert({
    title: data.title,
    description: data.description,
    category: data.category,
    urgency: data.urgency,
    requested_by: user.id,
    status: 'open',
  })

  if (error) return { error: error.message }
  revalidatePath('/demand')
  return { success: true }
}

/**
 * Toggle upvote on a prompt request.
 * Inserts if not yet upvoted, deletes if already upvoted (un-upvote).
 * Any authenticated user can upvote.
 */
export async function toggleUpvote(requestId: string) {
  const ctx = await getUser()
  if (!ctx) return { error: 'You must be signed in to upvote' }
  const { user, supabase } = ctx

  // Check if user already upvoted
  const { data: existing } = await supabase
    .from('request_upvotes')
    .select('request_id')
    .eq('request_id', requestId)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    // Remove upvote
    const { error } = await supabase
      .from('request_upvotes')
      .delete()
      .eq('request_id', requestId)
      .eq('user_id', user.id)
    if (error) return { error: error.message }
  } else {
    // Add upvote
    const { error } = await supabase
      .from('request_upvotes')
      .insert({ request_id: requestId, user_id: user.id })
    if (error) return { error: error.message }
  }

  revalidatePath('/demand')
  return { success: true }
}

/**
 * Checks if the current user is an admin (real or demo).
 * Returns the user object and admin client if admin, or null if not.
 * Pattern: uses createClient() for auth check, returns createAdminClient() for mutations.
 * Copied from app/(app)/review/actions.ts — cannot import across 'use server' boundaries.
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
 * Mark a request as Planned.
 * Admin-only. Moves request from 'open' to 'planned' status.
 */
export async function markPlanned(requestId: string) {
  const ctx = await getAdminUser()
  if (!ctx) return { error: 'Unauthorized' }
  const { supabase } = ctx

  const { error } = await supabase
    .from('prompt_requests')
    .update({ status: 'planned' })
    .eq('id', requestId)

  if (error) return { error: error.message }
  revalidatePath('/demand')
  return { success: true }
}

/**
 * Revert a Planned request back to Open.
 * Admin-only.
 */
export async function revertToOpen(requestId: string) {
  const ctx = await getAdminUser()
  if (!ctx) return { error: 'Unauthorized' }
  const { supabase } = ctx

  const { error } = await supabase
    .from('prompt_requests')
    .update({ status: 'open' })
    .eq('id', requestId)

  if (error) return { error: error.message }
  revalidatePath('/demand')
  return { success: true }
}

/**
 * Resolve a request by linking it to an existing library prompt.
 * Admin-only. Sets status='resolved', records the linked prompt and timestamp.
 */
export async function resolveRequest(requestId: string, promptId: string) {
  const ctx = await getAdminUser()
  if (!ctx) return { error: 'Unauthorized' }
  const { supabase } = ctx

  const { error } = await supabase
    .from('prompt_requests')
    .update({
      status: 'resolved',
      resolved_by_prompt: promptId,
      resolved_at: new Date().toISOString(),
    })
    .eq('id', requestId)

  if (error) return { error: error.message }
  revalidatePath('/demand')
  return { success: true }
}

/**
 * Decline a request with a required reason.
 * Admin-only. The requester will see the reason.
 */
export async function declineRequest(requestId: string, reason: string) {
  const ctx = await getAdminUser()
  if (!ctx) return { error: 'Unauthorized' }
  const { supabase } = ctx

  const { error } = await supabase
    .from('prompt_requests')
    .update({ status: 'declined', decline_reason: reason })
    .eq('id', requestId)

  if (error) return { error: error.message }
  revalidatePath('/demand')
  return { success: true }
}
