'use server'

import { createClient } from '@/lib/supabase/server'
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
