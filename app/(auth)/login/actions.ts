'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function signIn(_prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'Incorrect email or password. Please try again.' }
  }

  const {
    data: { user },
  } = await supabase.auth.getUser()
  const role = user?.app_metadata?.role
  const effectiveRole = role ?? 'consultant'

  // Best-effort profile upsert — creates profile on first login, does nothing if it already exists.
  // ignoreDuplicates:true ensures existing profiles (with roles set by admin) are not overwritten.
  if (user) {
    const adminClient = createAdminClient()
    const { error: profileError } = await adminClient
      .from('profiles')
      .upsert(
        { id: user.id, name: user.email?.split('@')[0] ?? 'User', role: 'consultant' },
        { onConflict: 'id', ignoreDuplicates: true },
      )
    if (profileError) {
      console.error('[signIn] profile upsert failed:', profileError.message)
    }
  }

  redirect(effectiveRole === 'admin' ? '/dashboard' : '/engagements')
}

export async function signInAsDemo(role: 'consultant' | 'admin') {
  const supabase = await createClient()
  const displayName = role === 'admin' ? 'Demo Admin' : 'Demo Consultant'

  const { error } = await supabase.auth.signInAnonymously({
    options: {
      data: {
        demo_role: role,
        display_name: displayName,
      },
    },
  })

  if (error) {
    return { error: 'Something went wrong. Please try again.' }
  }

  // Upsert the profile for the newly created anonymous user.
  // Must use admin client because profiles has RLS with no anonymous INSERT policy.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    const adminClient = createAdminClient()
    const { error: profileError } = await adminClient
      .from('profiles')
      .upsert({ id: user.id, name: displayName, role }, { onConflict: 'id' })
    if (profileError) {
      console.error('[signInAsDemo] profile upsert failed:', profileError.message)
    }

    // Clone seed data — copy from placeholders so originals stay permanently for future sessions.
    // Engagements and forks are RLS-gated (_own policies) so demo users need their own copies.
    // Prompt requests and upvotes are read via admin client (bypass RLS) — originals are already visible.
    const DEMO_CONSULTANT_ID = '00000000-0000-0000-0000-000000000001'

    // Clone engagements
    const { data: seedEngagements } = await adminClient
      .from('engagements')
      .select('*')
      .eq('created_by', DEMO_CONSULTANT_ID)

    const engagementIdMap = new Map<string, string>()
    if (seedEngagements?.length) {
      for (const eng of seedEngagements) {
        const newId = crypto.randomUUID()
        engagementIdMap.set(eng.id, newId)
        await adminClient.from('engagements').insert({
          ...eng,
          id: newId,
          created_by: user.id,
        })
      }
    }

    // Clone forks (remap engagement_id to cloned engagements)
    const { data: seedForks } = await adminClient
      .from('forked_prompts')
      .select('*')
      .eq('forked_by', DEMO_CONSULTANT_ID)

    if (seedForks?.length) {
      for (const fork of seedForks) {
        await adminClient.from('forked_prompts').insert({
          ...fork,
          id: crypto.randomUUID(),
          forked_by: user.id,
          engagement_id: engagementIdMap.get(fork.engagement_id) ?? fork.engagement_id,
          merge_status: 'none',
          merge_suggestion: null,
        })
      }
    }
  }

  redirect(role === 'admin' ? '/dashboard' : '/engagements')
}
