'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signUp(_prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()
  const { data, error } = await supabase.auth.signUp({ email, password })

  if (error) {
    return { error: error.message }
  }

  // If the user is immediately confirmed (e.g., email confirmation disabled), redirect to library
  if (data.session) {
    redirect('/library')
  }

  // Otherwise redirect to login with a message that email confirmation is pending
  redirect('/login?message=Check your email to confirm your account')
}
