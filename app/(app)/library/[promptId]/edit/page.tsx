import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { fetchPromptById } from '@/lib/data/prompts'
import { PromptForm } from '@/components/library/prompt-form'
import { DeprecationDialog } from '@/components/library/deprecation-dialog'

export default async function EditPromptPage({
  params,
}: {
  params: Promise<{ promptId: string }>
}) {
  const { promptId } = await params

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
    redirect(`/library/${promptId}`)
  }

  const prompt = await fetchPromptById(promptId)

  if (!prompt) {
    notFound()
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-xl font-semibold">Edit Prompt</h1>
        <DeprecationDialog promptId={promptId} />
      </div>
      <PromptForm action="edit" prompt={prompt} />
    </div>
  )
}
