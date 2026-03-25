import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PromptForm } from '@/components/library/prompt-form'

export default async function NewPromptPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const role = user?.app_metadata?.role as string | null
  const isAnonymous = user?.is_anonymous ?? false
  const demoRole = isAnonymous
    ? ((user?.user_metadata?.demo_role as string) ?? 'consultant')
    : null
  const effectiveRole = role ?? (isAnonymous ? demoRole : null)
  const isAdmin = effectiveRole === 'admin'

  if (!isAdmin) {
    redirect('/library')
  }

  return (
    <div className="p-8">
      <h1 className="text-xl font-semibold mb-8">New Prompt</h1>
      <PromptForm action="create" />
    </div>
  )
}
