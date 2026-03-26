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

    // Claim seed data — transfer ownership from BOTH placeholder demo profiles to the new anonymous user.
    // Both demo roles (admin and consultant) should see the same seed data (demand board, engagements, etc.).
    // Admin demo was previously claiming from DEMO_ADMIN_ID which owns nothing meaningful; this fixes that.
    const DEMO_CONSULTANT_ID = '00000000-0000-0000-0000-000000000001'
    const DEMO_ADMIN_ID = '00000000-0000-0000-0000-000000000002'
    const placeholderIds = [DEMO_CONSULTANT_ID, DEMO_ADMIN_ID]

    for (const placeholderId of placeholderIds) {
      // Guard: skip if the new user happens to be the placeholder (shouldn't happen, but be safe)
      if (user.id === placeholderId) continue

      // Transfer engagements
      await adminClient
        .from('engagements')
        .update({ created_by: user.id })
        .eq('created_by', placeholderId)

      // Transfer forks
      await adminClient
        .from('forked_prompts')
        .update({ forked_by: user.id })
        .eq('forked_by', placeholderId)

      // Transfer prompt requests
      await adminClient
        .from('prompt_requests')
        .update({ requested_by: user.id })
        .eq('requested_by', placeholderId)

      // Transfer upvotes
      await adminClient
        .from('request_upvotes')
        .update({ user_id: user.id })
        .eq('user_id', placeholderId)
    }
  }

  redirect(role === 'admin' ? '/dashboard' : '/engagements')
}
