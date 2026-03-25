'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function signIn(_prevState: unknown, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: 'Incorrect email or password. Please try again.' }
  }

  redirect('/library')
}

export async function signInAsDemo(role: 'consultant' | 'admin') {
  const supabase = await createClient()
  const { error } = await supabase.auth.signInAnonymously({
    options: {
      data: {
        demo_role: role,
        display_name: role === 'admin' ? 'Demo Admin' : 'Demo Consultant',
      },
    },
  })

  if (error) {
    return { error: 'Something went wrong. Please try again.' }
  }

  redirect('/library')
}
