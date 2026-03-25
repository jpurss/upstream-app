import { notFound } from 'next/navigation'
import Link from 'next/link'
import { fetchPromptById } from '@/lib/data/prompts'
import { createClient } from '@/lib/supabase/server'
import { PromptDetailContent } from '@/components/library/prompt-detail-content'
import { PromptDetailSidebar } from '@/components/library/prompt-detail-sidebar'

export default async function PromptDetailPage({
  params,
}: {
  params: Promise<{ promptId: string }>
}) {
  const { promptId } = await params

  const prompt = await fetchPromptById(promptId)

  if (!prompt) {
    notFound()
  }

  // Role check — same pattern as app layout
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

  return (
    <div className="p-8">
      {/* Back link — D-08 */}
      <Link
        href="/library"
        className="text-sm text-muted-foreground hover:text-primary mb-6 inline-block"
      >
        ← Library
      </Link>

      {/* Title */}
      <h1 className="text-xl font-semibold mb-2">{prompt.title}</h1>
      {prompt.description && (
        <p className="text-sm text-muted-foreground mb-8">{prompt.description}</p>
      )}

      {/* Two-column layout — D-08: content left, sidebar right, gap 32px */}
      <div className="flex gap-8">
        <PromptDetailContent content={prompt.content} />
        <PromptDetailSidebar prompt={prompt} isAdmin={isAdmin} />
      </div>
    </div>
  )
}
