'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { EngagementStatus } from '@/lib/types/engagement'

/**
 * Gets the currently authenticated user and a Supabase client.
 * Uses the regular (non-admin) client — RLS engagements_own policy enforces ownership.
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
 * Creates a new engagement for the authenticated user.
 * Auto-generates the engagement name from client_name + month/year suffix.
 * Validates required fields before inserting.
 */
export async function createEngagement(formData: FormData) {
  const ctx = await getAuthenticatedUser()
  if (!ctx) return { error: 'Unauthorized' }

  const { user, supabase } = ctx
  const client_name = formData.get('client_name') as string
  const industry = formData.get('industry') as string

  if (!client_name?.trim()) return { error: 'Client name is required' }
  if (!industry?.trim()) return { error: 'Industry is required' }

  // Auto-generate engagement name: "ClientName — Mon YYYY"
  const now = new Date()
  const monthYear = now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  const autoName = `${client_name.trim()} \u2014 ${monthYear}`

  const { data, error } = await supabase
    .from('engagements')
    .insert({
      name: autoName,
      client_name: client_name.trim(),
      industry,
      created_by: user.id,
      status: 'active' as EngagementStatus,
    })
    .select()
    .single()

  if (error) return { error: error.message }
  revalidatePath('/engagements')
  return { success: true, engagement: data }
}

/**
 * Updates the status of an engagement.
 * RLS ensures user can only update their own engagements.
 * Sets completed_at when status is 'completed', clears it otherwise.
 */
export async function updateEngagementStatus(engagementId: string, status: EngagementStatus) {
  const ctx = await getAuthenticatedUser()
  if (!ctx) return { error: 'Unauthorized' }

  const { supabase } = ctx
  const updates: Record<string, unknown> = { status }
  if (status === 'completed') {
    updates.completed_at = new Date().toISOString()
  } else {
    updates.completed_at = null
  }

  const { error } = await supabase
    .from('engagements')
    .update(updates)
    .eq('id', engagementId)

  if (error) return { error: error.message }
  revalidatePath('/engagements')
  revalidatePath(`/engagements/${engagementId}`)
  return { success: true }
}
