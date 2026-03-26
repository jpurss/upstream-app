import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { fetchPromptRequests } from '@/lib/data/prompt-requests'
import { DemandBoardClient } from '@/components/demand/demand-board-client'

export default async function DemandBoardPage({
  searchParams: _searchParams,
}: {
  searchParams: Promise<{ status?: string; sort?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const role = user.app_metadata?.role as string | null
  const isAnonymous = user.is_anonymous ?? false
  const demoRole = isAnonymous ? (user.user_metadata?.demo_role as string ?? 'consultant') : null
  const effectiveRole = role ?? (isAnonymous ? demoRole : null)

  const allRequests = await fetchPromptRequests('all', 'upvotes', user.id)

  // Only fetch active prompts for admins — needed for the resolve dialog autocomplete
  let activePrompts: { id: string; title: string; category: string }[] = []
  if (effectiveRole === 'admin') {
    const supabaseAdmin = createAdminClient()
    const { data } = await supabaseAdmin
      .from('prompts')
      .select('id, title, category')
      .eq('status', 'active')
      .order('title')
    activePrompts = data ?? []
  }

  return (
    <DemandBoardClient
      allRequests={allRequests}
      isAdmin={effectiveRole === 'admin'}
      userId={user.id}
      activePrompts={activePrompts}
    />
  )
}
