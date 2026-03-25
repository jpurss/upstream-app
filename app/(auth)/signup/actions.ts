'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function signUp(_prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    return { error: error.message }
  }

  // If the user is immediately confirmed (e.g., email confirmation disabled), create profile and redirect.
  if (data.session && data.user) {
    // Best-effort profile creation using admin client to bypass RLS.
    const adminClient = createAdminClient()
    const { error: profileError } = await adminClient
      .from('profiles')
      .upsert(
        { id: data.user.id, name: email.split('@')[0], role: 'consultant' },
        { onConflict: 'id' },
      )
    if (profileError) {
      console.error('[signUp] profile upsert failed:', profileError.message)
    }

    redirect('/library')
  }

  // Otherwise redirect to login with a message that email confirmation is pending
  redirect('/login?message=Check your email to confirm your account')
}
