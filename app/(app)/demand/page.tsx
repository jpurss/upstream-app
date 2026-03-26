import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { fetchPromptRequests, countRequestsByStatus } from '@/lib/data/prompt-requests'
import { DemandBoardClient } from '@/components/demand/demand-board-client'

export default async function DemandBoardPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; sort?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { status = 'open', sort = 'upvotes' } = await searchParams
  const validStatuses = ['open', 'planned', 'resolved', 'declined', 'all']
  const validSorts = ['upvotes', 'newest', 'urgent']
  const currentStatus = validStatuses.includes(status) ? status : 'open'
  const currentSort = validSorts.includes(sort) ? sort : 'upvotes'

  const role = user.app_metadata?.role as string | null
  const isAnonymous = user.is_anonymous ?? false
  const demoRole = isAnonymous ? (user.user_metadata?.demo_role as string ?? 'consultant') : null
  const effectiveRole = role ?? (isAnonymous ? demoRole : null)

  const requests = await fetchPromptRequests(
    currentStatus as any,
    currentSort as any,
    user.id
  )

  const statusCounts = await countRequestsByStatus()

  return (
    <DemandBoardClient
      requests={requests}
      currentStatus={currentStatus}
      currentSort={currentSort}
      statusCounts={statusCounts}
      isAdmin={effectiveRole === 'admin'}
      userId={user.id}
    />
  )
}
