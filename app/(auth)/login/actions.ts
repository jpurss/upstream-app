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

  redirect(effectiveRole === 'admin' ? '/library' : '/engagements')
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
  }

  redirect(role === 'admin' ? '/library' : '/engagements')
}
